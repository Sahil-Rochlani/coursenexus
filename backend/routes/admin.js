const { Router } = require('express')
const router = Router()
require('dotenv').config()
const { signupSchema, signinSchema, courseCreateFormSchema } = require('../validation/input_Validation')
const { adminModel, courseModel } = require('../database/db')
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken')
const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET
const { adminMiddleware } = require('../middleware/admin')
const mongoose = require('mongoose')

/**
 * @swagger
 * /admin/signup:
 *   post:
 *     summary: Register a new admin
 *     tags: [Admin]
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
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *       401:
 *         description: Validation error or admin already exists
 */
router.post('/signup', async (req, res) => {
    try{
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
            res.status(401).json({error: err_object})
            return
        }

        const firstName = req.body.firstName
        const lastName = req.body.lastName
        const email = req.body.email.toLowerCase()
        const password = req.body.password

        const existingUser = await adminModel.findOne({email})
        // console.log(existingUser)
        if(existingUser){
            res.status(401).json({error:{email: 'The user with the given email address already exists. Please use another email or login.'}})
            return
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await adminModel.create({
            firstName,
            lastName,
            email,
            password: hashedPassword
        })

        const token = jwt.sign({id: user._id, firstName: user.firstName, lastName: user.lastName}, JWT_ADMIN_SECRET)
        const isProd = process.env.NODE_ENV === 'production';

        res.cookie('token', token, {
        httpOnly: true,
        secure: isProd,               
        sameSite: isProd ? 'none' : 'lax'
        });
        
        res.json({name:`${user.firstName} ${user.lastName}`})
    }
    catch(err){
        console.log(err)
    }
})

/**
 * @swagger
 * /admin/signin:
 *   post:
 *     summary: Authenticate admin and sign in
 *     tags: [Admin]
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
 *         description: Admin authenticated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *       401:
 *         description: Invalid credentials or validation error
 */
router.post('/signin', async (req, res) => {
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
            res.status(401).json({error: err_object})
            return
        }
        const email = req.body.email.toLowerCase()
        const password = req.body.password

        const existingUser = await adminModel.findOne({email})
        if(!existingUser){
            res.status(401).json({error:{email: 'The user with the given email address doesnt exist. Please use another email or signup.'}})
            return
        }
        const isCorrectPassword = await bcrypt.compare(password, existingUser.password)
        if(!isCorrectPassword){
            res.status(401).json({error: {password: 'The entered password is incorrect.'}})
            return
        }

        const token = jwt.sign({id: existingUser._id, firstName: existingUser.firstName, lastName: existingUser.lastName}, JWT_ADMIN_SECRET)
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
 * /admin/course:
 *   post:
 *     summary: Create a new course (admin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *               - imageUrl
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 minLength: 20
 *                 maxLength: 1000
 *               price:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 course:
 *                   type: object
 *       401:
 *         description: Validation error or unauthorized
 */
router.post('/course', adminMiddleware, async (req, res) => {
    try{
        const validation = await courseCreateFormSchema.spa(req.body)
        if(!validation.success){
            let new_err_obj = {}
            const err_list = validation.error.format()
            // console.log(err_list)
            for(let [key, value] of Object.entries(err_list)){
                if(key != '_errors'){
                    new_err_obj[key] = value._errors[0]
                }
            }
            res.status(401).json({errors: new_err_obj})
            return
            
        }
        const title = req.body.title
        const description = req.body.description
        const price = parseInt(req.body.price)
        const imageUrl = req.body.imageUrl

        // Create course with admin ID as creator
        const course = await courseModel.create({
            title,
            description,
            price,
            imageUrl,
            creatorId: new mongoose.Types.ObjectId(req.admin.id)
        })

        res.json({course})
    }
    catch(err){
        console.log(err)
    }

    

})

/**
 * @swagger
 * /admin/course/{id}:
 *   put:
 *     summary: Update a course (admin can only update their own courses)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 course:
 *                   type: object
 *       401:
 *         description: Unauthorized or course not found
 */
router.put('/course/:id', adminMiddleware,async (req, res) => {
        try{
            
            const id = req.params.id
            // console.log(req.body)
            // console.log(id)
            const title = req.body.title
            const description = req.body.description
            const price = parseInt(req.body.price)
            const imageUrl = req.body.imageUrl

            // Only update if course belongs to the authenticated admin
            const updatedCourse = await courseModel.findOneAndUpdate({_id:id, creatorId:req.admin.id}, {
                title,
                description,
                price,
                imageUrl
                
            },{new: true})
            
            if(updatedCourse !== null)
            res.json({course:updatedCourse})
            else
            res.status(401).json({error: 'You are not authorized to perform this action'})
        }
        catch(err){
            console.log(err)
        }
})

/**
 * @swagger
 * /admin/course/preview:
 *   get:
 *     summary: Get list of course IDs created by authenticated admin
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of course IDs
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
router.get('/course/preview', adminMiddleware, async (req, res) => {
    try{
        const courses = await courseModel.find({creatorId: req.admin.id})
        res.json({courses: courses.map(course => course._id)})
    }
    catch(err){
        console.log(err)
    }
})

/**
 * @swagger
 * /admin/course/preview/{id}:
 *   get:
 *     summary: Get course details by ID
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 course:
 *                   type: object
 */
router.get('/course/preview/:id', adminMiddleware, async (req, res)  => {
    try{
        const id = req.params.id
        // Exclude creatorId from response
        const course = await courseModel.findById(id, {creatorId: 0})
        res.json({course})
    }
    catch(err){
        console.log(err)
    }
})

/**
 * @swagger
 * /admin/me:
 *   get:
 *     summary: Get current authenticated admin information
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Admin information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 */
router.get('/me', adminMiddleware, (req, res) => {
    res.json({name: `${req.admin.firstName} ${req.admin.lastName}`})
})

module.exports = router