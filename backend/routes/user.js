require('dotenv').config()
const { Router } = require('express')
const userRouter = Router()
const { signupSchema, signinSchema } = require('../validation/input_Validation')
const { userModel, purchaseModel } = require('../database/db')
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken')
const JWT_USER_SECRET = process.env.JWT_USER_SECRET
const { userMiddleware } = require('../middleware/user')
userRouter.post('/signup', async (req, res) => {
    

    try{
        // console.log(req.body)
        const signup_validation = signupSchema.safeParse(req.body)
        if(!signup_validation.success){
            const error = signup_validation.error.format()
            let err_object = {}
            if(error.firstName){
                err_object.firstName = error.firstName._errors[0]
            }
            if(error.lastName){
                err_object.lastName = error.lastName._errors[0]
            }
            if(error.email){
                err_object.email = error.email._errors[0]
            }
            if(error.password){
                err_object.password = error.password._errors[0]
            }
            res.status(400).json({error: err_object})
            return
        }

        const firstName = req.body.firstName
        const lastName = req.body.lastName
        const email = req.body.email.toLowerCase()
        const password = req.body.password
        // console.log(firstName)
        const existingUser = await userModel.findOne({email})
        // console.log(existingUser)
        if(existingUser){
            res.status(400).json({error:{email: 'The user with the given email address already exists. Please use another email or login.'}})
            return
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        
        const user = await userModel.create({
            firstName,
            lastName,
            email,
            password: hashedPassword
        })
        // console.log(user)
        const token = jwt.sign({id: user._id, firstName: user.firstName, lastName: user.lastName}, JWT_USER_SECRET)
        // console.log(token)
        // res.json({token})

        const isProd = process.env.NODE_ENV === 'production';

        res.cookie('token', token, {
        httpOnly: true,
        secure: isProd,               
        sameSite: isProd ? 'none' : 'lax'
        });
        // console.log(user)
        res.json({name:`${user.firstName} ${user.lastName}`})
    }
    catch(err){
        console.log(err)
    }
})

userRouter.post('/signin', async (req, res) => {
    try{
        const signin_validation = signinSchema.safeParse(req.body)
        if(!signin_validation.success){
            const error = signin_validation.error.format()
            let err_object = {}
            if(error.email){
                err_object.email = error.email._errors[0]
            }
            if(error.password){
                err_object.password = error.password._errors[0]
            }
            res.status(400).json({error: err_object})
            return
        }
        const email = req.body.email.toLowerCase()
        const password = req.body.password

        const existingUser = await userModel.findOne({email})
        if(!existingUser){
            res.status(400).json({error:{email: 'The user with the given email address doesnt exist. Please use another email or signup.'}})
            return
        }
        const isCorrectPassword = await bcrypt.compare(password, existingUser.password)
        if(!isCorrectPassword){
            res.status(400).json({error: {password: 'The entered password is incorrect.'}})
            return
        }

        const token = jwt.sign({id: existingUser._id, firstName: existingUser.firstName, lastName: existingUser.lastName}, JWT_USER_SECRET)
        // res.json({token})

        const isProd = process.env.NODE_ENV === 'production';

        res.cookie('token', token, {
        httpOnly: true,
        secure: isProd,               
        sameSite: isProd ? 'none' : 'lax'
        });
        
        res.json({name:`${existingUser.firstName} ${existingUser.lastName}`})
    }
    catch(err){
        console.log(err)
    }


})

userRouter.get('/purchases', userMiddleware, async (req, res) => {
    try{
        const courses = (await purchaseModel.find({userId: req.user.id}, {userId:0, __v:0, _id:0})).map((course) => course.courseId)
        // console.log(courses)
        res.json({courses})
    }
    catch(err){
        console.log(err)
    }
})
userRouter.get('/me', userMiddleware, (req, res) => {
    // console.log('hi')
    res.json({name: `${req.user.firstName} ${req.user.lastName}`})
})




module.exports = {userRouter}