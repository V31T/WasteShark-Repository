
const jwt = require('jsonwebtoken')
const User = require('../../../schemas/User')

async function setupEndPoint(app, route) {
    app.post("/api/users/refresh", async function(req, res) {
        try {
            // Check if refresh token cookie exists
            const refreshToken = req.cookies.jwt
            if (!refreshToken) {
                return res.status(401).send({ 
                    error: "Unauthorized",
                    message: "No refresh token provided" 
                })
            }

            // Verify the refresh token
            try {
                const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

                // payload may only contain the user id. Load the full user from DB.
                const userId = payload.user_id

                if (!userId) {
                    // invalid payload
                    res.clearCookie('jwt', {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
                    })

                    return res.status(401).send({ error: 'Unauthorized', message: 'Invalid refresh token payload' })
                }

                let dbUser
                try {
                    dbUser = await User.findOne({ user_id: userId })
                } catch (dbErr) {
                    console.error('Error querying user for refresh:', dbErr)
                    return res.status(500).send({ error: 'Internal Server Error', message: 'Failed to load user' })
                }

                if (!dbUser) {
                    // User no longer exists - clear cookie and deny
                    res.clearCookie('jwt', { 
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
                    })
                    return res.status(401).send({ error: 'Unauthorized', message: 'User not found' })
                }

                // Generate new access token
                const accessToken = jwt.sign(
                    {
                        user_id: dbUser.user_id,
                        email: dbUser.email,
                        first_name: dbUser.first_name,
                        last_name: dbUser.last_name
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '15m' }
                )

                return res.send({ 
                    success: true,
                    token: accessToken,
                    message: "Access token refreshed successfully"
                })

            } catch (verifyError) {
                // Token verification failed
                res.clearCookie('jwt', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
                })

                if (verifyError && verifyError.name === 'TokenExpiredError') {
                    return res.status(401).send({ error: 'Unauthorized', message: 'Refresh token expired' })
                }

                return res.status(401).send({ error: 'Unauthorized', message: 'Invalid refresh token' })
            }

        } catch (error) {
            console.error("Refresh token error:", error)
            return res.status(500).send({ 
                error: "Internal Server Error",
                message: "Error processing refresh token"
            })
        }
    })
}

module.exports = setupEndPoint
