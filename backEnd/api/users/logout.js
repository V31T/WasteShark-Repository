const method = "post"

async function setupEndPoint(app, route) {
	app[method](route, async function (req, res) {
		try {
			// Clear the auth cookie
			res.clearCookie("authToken", {
				httpOnly: true,
				sameSite: "strict",
				secure: false, // set to true if using HTTPS
				path: "/", // must match cookie path used on login
			})
			return res.status(200).send({ message: "Logged out successfully" })
		} catch (error) {
			console.error("Logout error:", error)
			return res.status(500).send({ error: "Server error during logout" })
		}
	})
}

module.exports = setupEndPoint
