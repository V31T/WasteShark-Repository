const express = require("express")
const mqtt = require("mqtt")
const cookieParser = require("cookie-parser")
const fs = require("fs")
const app = express()
const port = 3000

function loadApiRoutes() {
	app.use(express.json())
	app.use(cookieParser())

	app.get("/", (req, res) => {
		res.send("Hello World!")
	})

	app.listen(port, () => {
		console.log(`Example app listening on port ${port}`)
	})

	loadRoutesRecursively("./api", "")
}

function loadRoutesRecursively(basePath, routePrefix) {
	const items = fs.readdirSync(basePath)

	for (const item of items) {
		const itemPath = `${basePath}/${item}`
		const file = fs.statSync(itemPath)

		if (file.isDirectory()) {
			const newRoutePrefix = routePrefix + "/" + item
			loadRoutesRecursively(itemPath, newRoutePrefix)
		} else if (file.isFile()) {
			const currentRoute = routePrefix + "/" + item.replace(".js", "")
			const endPointModule = require(itemPath)

			console.log("setup endpoint", currentRoute)

			endPointModule(app, currentRoute)
		}
	}		
}

async function setupMongoose() {
	const mongoose = require("mongoose")
	await mongoose.connect("mongodb://root:root@localhost:27017/Project?authSource=admin")

	console.log("Mongoose connected")
}

async function setup() {
	await setupMongoose()
	loadApiRoutes()

	const client = mqtt.connect("mqtt://127.0.0.1:1883");

	client.on("connect", function () {
		console.log("MQTT connected")
	})

	client.on("message", (topic, payload) => {
		console.log("msg", topic, payload.toString());
	});

	client.on("error", (err) => console.error("mqtt error:", err));
}

setup()


