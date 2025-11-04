const mongoose = require('mongoose')

const schema = new mongoose.Schema({
	robot_id: { type: String, required: true, unique: true },
	owned_by_user_id: { type: String },
	name: { type: String, required: true },
	location: { type: String },
	status: { type: String, required: true },
	start_timestamp: { type: "Double" },
	duration: { type: "Double" }
})

module.exports = mongoose.model("Robot", schema)