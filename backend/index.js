const express = require('express')
const app = express()
const {userRouter} = require('./routes/user')
const adminRouter = require('./routes/admin')
const courseRouter = require('./routes/course')
const cors = require('cors')
const cookieParser = require('cookie-parser')
require('dotenv').config()
app.use(cookieParser())
const FRONTEND = process.env.FRONTEND_URL; 
app.use(cors({
  origin: FRONTEND,
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS']
}));
app.use(express.urlencoded({extended: true}))
app.use(express.json())


app.use('/user', userRouter)
app.use('/admin', adminRouter)
app.use('/course', courseRouter)

app.post('/logout', (req, res) => {
    console.log('logout')
    res.clearCookie('token',{httpOnly: true})
    res.json({success: 'Logged out successfully'})
})

app.listen(3000)