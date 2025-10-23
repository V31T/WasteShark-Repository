const mongoose = require('mongoose')

const schema = new mongoose.Schema({
	name: { type: String, required: true },
	status: { type: String, required: true },
	start_timestamp: { type: "Double", required: true },
	duration: { type: "Double", required: true }
})

module.exports = mongoose.model("Robot", schema)