function authCookie(app, route, method) {
	app[method](route, async function(req, res, next) {
		console.log("middleware")
		next()
	})
}

module.exports = authCookie