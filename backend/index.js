const express = require('express')
const app = express()
const {userRouter} = require('./routes/user')
const adminRouter = require('./routes/admin')
const courseRouter = require('./routes/course')
const {swaggerUi, swaggerSpec} = require('./swagger')
const cors = require('cors')
const cookieParser = require('cookie-parser')
require('dotenv').config()

// Cookie parser middleware for handling JWT tokens stored in cookies
app.use(cookieParser())

// CORS configuration - allows frontend to make authenticated requests
const FRONTEND = process.env.FRONTEND_URL; 
app.use(cors({
  origin: FRONTEND,
  credentials: true, // Required for cookie-based authentication
  methods: ['GET','POST','PUT','DELETE','OPTIONS']
}));

app.use(express.urlencoded({extended: true}))
app.use(express.json())

// Route handlers
app.use('/user', userRouter)
app.use('/admin', adminRouter)
app.use('/course', courseRouter)

// Swagger UI endpoint - serves interactive API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

/**
 * Health check endpoint
 * @route GET /ping
 * @returns {Object} 200 - Success response with pong message
 */
app.get("/ping", (req, res) => {
  return res.status(200).json({message: "pong"})
})

/**
 * Logout endpoint - clears authentication token cookie
 * @route POST /logout
 * @returns {Object} 200 - Success response
 */
app.post('/logout', (req, res) => {
    console.log('logout')
    res.clearCookie('token',{httpOnly: true})
    res.status(200).json({success: 'Logged out successfully'})
})

app.listen(3000)