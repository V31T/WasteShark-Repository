async function setupEndPoint(app, route) {
	app.post("/api/users/logout", async function(req, res) {
		try {
			// If there's no jwt cookie present, respond 204 No Content
			if (!req.cookies || !req.cookies.jwt) {
				return res.sendStatus(204)
			}
			// Clear the auth cookie
			res.clearCookie("jwt", {
				httpOnly: true,
				sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
				secure: process.env.NODE_ENV === 'production', // set to true if using HTTPS
			})
			return res.send({ message: "Logged out successfully" })
		} catch (error) {
			console.error("Logout error:", error)
			return res.status(500).send({ error: "Server error during logout" })
		}
	})
}

module.exports = setupEndPoint
