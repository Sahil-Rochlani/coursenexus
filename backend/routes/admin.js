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
// const { default: errorMap } = require('zod/lib/locales/en')

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
        // res.json({token})
        res.cookie('token', token, {httpOnly: true})
        
        res.json({name:`${user.firstName} ${user.lastName}`})
    }
    catch(err){
        console.log(err)
    }
})

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
        // res.json({token})
        res.cookie('token', token, {httpOnly: true})
        
        res.json({name:`${existingUser.firstName} ${existingUser.lastName}`})
    }
    catch(err){
        console.log(err)
    }
})

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

router.put('/course/:id', adminMiddleware,async (req, res) => {
        try{
            
            const id = req.params.id
            // console.log(req.body)
            // console.log(id)
            const title = req.body.title
            const description = req.body.description
            const price = parseInt(req.body.price)
            const imageUrl = req.body.imageUrl

            const updatedCourse = await courseModel.findOneAndUpdate({_id:id, creatorId:req.admin.id}, {
                title,
                description,
                price,
                imageUrl
                
            },{new: true})
            // console.log(updatedCourse)
            if(updatedCourse !== null)
            res.json({course:updatedCourse})
            else
            res.status(401).json({error: 'You are not authorized to perform this action'})
        }
        catch(err){
            console.log(err)
        }
})

router.get('/course/preview', adminMiddleware, async (req, res) => {
    try{
        
        const courses = await courseModel.find({creatorId: req.admin.id})
        // console.log(courses)
        res.json({courses: courses.map(course => course._id)})
    }
    catch(err){
        console.log(err)
    }
})

router.get('/course/preview/:id', adminMiddleware, async (req, res)  => {
    try{
        const id = req.params.id
        const course = await courseModel.findById(id, {creatorId: 0})
        // console.log(course)
        res.json({course})
    }
    catch(err){
        console.log(err)
    }
})

router.get('/me', adminMiddleware, (req, res) => {
    // console.log(req.admin)
    res.json({name: `${req.admin.firstName} ${req.admin.lastName}`})
})

module.exports = router