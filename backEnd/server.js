const express = require("express")
const mqtt = require("mqtt")
const cookieParser = require("cookie-parser")
const fs = require("fs")
const mongoose = require("mongoose")
const uuid = require("uuid")
const bcrypt = require("bcrypt")
const app = express()
const cors = require("cors")

const mqttListeners = {}
const serverSentEvents = {}

let mqttClient

require("dotenv").config();

function loadApiRoutes() {
	// CORS Configuration
	// Allows requests from frontend origin and handles credentials (cookies)
	// 
	// CORS ISSUES TO WATCH:
	// 1. Origin mismatch - Frontend origin must match backend CORS origin
	// 2. Credentials - Must set credentials: 'include' in frontend fetch calls
	// 3. Preflight - Browser sends OPTIONS request first for non-simple requests
	// 
	// CONFIGURATION:
	// - Use environment variable FRONTEND_ORIGIN for flexibility
	// - In production, set FRONTEND_ORIGIN to your frontend domain
	const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
	
	const corsOptions = {
		origin: frontendOrigin,                      // Frontend origin (Vite default: 5173)
		credentials: true,                           // REQUIRED: Allow cookies (refresh tokens are HTTP-only)
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Supported HTTP methods
		allowedHeaders: [                            // Headers frontend can send
			'Content-Type',
			'Authorization',                         // Required for JWT Bearer tokens
			'Accept',
			'Origin'
		],
		exposedHeaders: [],                          // Headers frontend can read from response
		optionsSuccessStatus: 200,                   // Some browsers need 200 for OPTIONS
		maxAge: 86400                                // Cache preflight requests for 24 hours
	}


	app.use(cors(corsOptions)) 	// CORS must be applied BEFORE other middleware and routes

	app.use(express.json()) 	// Parse JSON request bodies

	app.use(cookieParser()) 	// Parse cookies (required for refresh token cookies)
	
	console.log(`CORS configured for origin: ${frontendOrigin}`)

	app.get("/", (req, res) => {
		res.send("Hello World!")
	})

	if(process.env.NODE_ENV !== 'test') {
		app.listen(process.env.HTTP_PORT, () => {
			console.log(`Example app listening on port ${process.env.HTTP_PORT}`)
		})
	}

	loadRoutesRecursively("./api/http", app, mqttClient)
}

function addServerSentEvent(res, identifier) {
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");
	res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering
	res.flushHeaders(); // Send headers immediately

	if (!serverSentEvents[identifier]) {
		serverSentEvents[identifier] = {}
	}

	serverSentEvents[identifier][res] = res

	res.on("close", () => {
		removeServerSentEvent(res, identifier);
	});
}

function removeServerSentEvent(res, identifier) {
	if (serverSentEvents[identifier]) {
		if (!res.closed) {
			res.end();
		}

		delete serverSentEvents[identifier][res];
	}
}

function getServerSentEvents(identifier) {
	if (serverSentEvents[identifier]) {
		return Object.values(serverSentEvents[identifier]);
	}

	return [];
}

// Runs every endpoint module to set them up
function loadRoutesRecursively(path, ...parameters) {
	const items = fs.readdirSync(path)

	for (const item of items) {
		const itemPath = `${path}/${item}`
		const file = fs.statSync(itemPath)

		if (file.isDirectory()) {
			loadRoutesRecursively(itemPath, ...parameters)
		} else if (file.isFile()) {
			const endPointModule = require(itemPath)

			endPointModule(...parameters)
		}
	}		
}

function addMQTTListener(topic, listener) {
	if (!mqttListeners[topic]) {
		mqttListeners[topic] = {}

		mqttClient.subscribe(topic)
	}

	mqttListeners[topic][listener] = listener
}

function removeMQTTListener(topic, listener) {
	if (mqttListeners[topic]) {
		delete mqttListeners[topic][listener]
	}
}

// Puts all MQTT endpoint modules into a dictionary to be called later
function setupMQTTEndpoints(path) {
	const items = fs.readdirSync(path)

	for (const item of items) {
		const itemPath = `${path}/${item}`
		const file = fs.statSync(itemPath)

		if (file.isDirectory()) {
			loadRoutesRecursively(itemPath, ...parameters)
		} else if (file.isFile()) {
			const endPointModule = require(itemPath)

			addMQTTListener(endPointModule.path, endPointModule.run)
		}
	}
}

async function setupMongoose() {
	const ip = process.env.USE_PRODUCTION_IPS ? "mongo" : "localhost"

	await mongoose.connect(`mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${ip}:27017/Project?authSource=admin`)

	console.log("Mongoose connected")
}

async function loadDefaultDatabase() {
	const Robot = require(process.cwd() + "/schemas/Robot.js")
	const User = require(process.cwd() + "/schemas/User.js")

	if (await User.exists({ email: "henry.pham@sjsu.edu" })) {
		return
	}

	// const user_id = uuid.v4()
	const user_id = "this_is_a_user_id"
	const robot_id = "this_is_a_robot_id"

	await User.create({
		user_id: user_id,
		first_name: "Henry",
		last_name: "Pham",
		email: "henry.pham@sjsu.edu",
		password: await bcrypt.hash("chicken nuggies", 10)
	})

	await Robot.create({
		robot_id: robot_id,
		owned_by_user_id: user_id,
		name: "Cutie Pututie",
		status: "off"
	})
}

async function setupMQTT() {
	const ip = process.env.USE_PRODUCTION_IPS ? "mosquitto-broker" : "localhost"
	const port = process.env.USE_PRODUCTION_IPS ? process.env.MQTTS_PORT : process.env.MQTT_PORT
	const mqttString = process.env.USE_PRODUCTION_IPS ? "mqtts" : "mqtt"

	const connectionOptions = {}

	if (process.env.USE_PRODUCTION_IPS) {
		// In production, use TLS
		connectionOptions.ca = fs.readFileSync('/ssl/origin.pem')
		connectionOptions.rejectUnauthorized = false
	}

	const client = mqtt.connect(`${mqttString}://${ip}:${port}`, {
		username: process.env.MQTT_USERNAME,
		password: process.env.MQTT_PASSWORD,
		...connectionOptions
	})

	mqttClient = client

	//No need to verify authentication because it is needed to connect to the broker from both ends
	await new Promise((resolve, reject) => {
		client.on("connect", function () {
			console.log("MQTT connected")
			
			setupMQTTEndpoints("./api/mqtt", client)
			resolve()
		})
		
		client.on("error", (err) => {
			reject(err)
		})
	})

	client.on("message", (topic, payload) => {
		// Call the appropriate endpoint function based on the topic
		if (topic in mqttListeners) {
			const data = JSON.parse(payload.toString())
			console.log("Received")
			if (!data || data.authentication_key !== process.env.MQTT_AUTHENTICATION_KEY) {
				return
			}

			for (const key in mqttListeners[topic]) {
				mqttListeners[topic][key](client, data)
			}
		}
	});

	client.on("error", (err) => console.error("mqtt error:", err));

	return client
}

async function setup() {
	await setupMongoose()
	await loadDefaultDatabase()
	await setupMQTT()
	loadApiRoutes()
}

// Only start the server if NOT in test mode
if (process.env.NODE_ENV !== "test") {
  setup()
}

module.exports = {
	addMQTTListener: addMQTTListener,
	removeMQTTListener: removeMQTTListener,
	addServerSentEvent: addServerSentEvent,
	removeServerSentEvent: removeServerSentEvent,
	getServerSentEvents: getServerSentEvents
}