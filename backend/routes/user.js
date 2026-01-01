require('dotenv').config()
const { Router } = require('express')
const userRouter = Router()
const { signupSchema, signinSchema } = require('../validation/input_Validation')
const { userModel, purchaseModel } = require('../database/db')
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken')
const JWT_USER_SECRET = process.env.JWT_USER_SECRET
const { userMiddleware } = require('../middleware/user')

/**
 * @swagger
 * /user/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 */
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
        
        const existingUser = await userModel.findOne({email})
        if(existingUser){
            res.status(400).json({error:{email: 'The user with the given email address already exists. Please use another email or login.'}})
            return
        }

        // Hash password with bcrypt (10 salt rounds)
        const hashedPassword = await bcrypt.hash(password, 10)
        
        const user = await userModel.create({
            firstName,
            lastName,
            email,
            password: hashedPassword
        })
        
        // Generate JWT token with user data
        const token = jwt.sign({id: user._id, firstName: user.firstName, lastName: user.lastName}, JWT_USER_SECRET)

        // Set cookie with environment-specific security settings
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('token', token, {
        httpOnly: true,
        secure: isProd, // HTTPS only in production               
        sameSite: isProd ? 'none' : 'lax' // Cross-site cookies in production
        });
        
        res.json({name:`${user.firstName} ${user.lastName}`})
    }
    catch(err){
        console.log(err)
    }
})

/**
 * @swagger
 * /user/signin:
 *   post:
 *     summary: Authenticate user and sign in
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User authenticated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *       400:
 *         description: Invalid credentials or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 */
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
        
        // Verify password against hashed password in database
        const isCorrectPassword = await bcrypt.compare(password, existingUser.password)
        if(!isCorrectPassword){
            res.status(400).json({error: {password: 'The entered password is incorrect.'}})
            return
        }

        const token = jwt.sign({id: existingUser._id, firstName: existingUser.firstName, lastName: existingUser.lastName}, JWT_USER_SECRET)

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

/**
 * @swagger
 * /user/purchases:
 *   get:
 *     summary: Get list of purchased course IDs for authenticated user
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of purchased course IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 courses:
 *                   type: array
 *                   items:
 *                     type: string
 */
userRouter.get('/purchases', userMiddleware, async (req, res) => {
    try{
        // Extract course IDs from purchase records, excluding metadata fields
        const courses = (await purchaseModel.find({userId: req.user.id}, {userId:0, __v:0, _id:0})).map((course) => course.courseId)
        res.json({courses})
    }
    catch(err){
        console.log(err)
    }
})

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Get current authenticated user information
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 */
userRouter.get('/me', userMiddleware, (req, res) => {
    res.json({name: `${req.user.firstName} ${req.user.lastName}`})
})




module.exports = {userRouter}