const { Router } = require('express')
const router = Router()
const { userMiddleware } = require('../middleware/user')
const {courseModel, purchaseModel} = require('../database/db')
const mongoose = require('mongoose')

router.post('/purchase/:id', userMiddleware, async (req, res) => {
    try{
        const id = req.params.id
        const existingPurchase = await purchaseModel.findOne({userId:req.user.id, courseId:id})
        if(existingPurchase){
            res.status(401).json({error: 'You already purchased this course!'})
            return
        }
        const purchase = await purchaseModel.create({
            courseId: new mongoose.Types.ObjectId(req.params.id),
            userId: new mongoose.Types.ObjectId(req.user.id)
        })
        res.json({purchase})
    }
    catch(err){
        console.log(err)
    }


    
})

router.delete('/refund/:id', userMiddleware, async (req, res) => {
    try{
        const id = req.params.id;
        console.log(id)
        const deletedCourse = await purchaseModel.findOneAndDelete({userId:req.user.id, courseId: id})
        if(deletedCourse){
            res.json({deletedCourse})
        }
        else{
            res.status(401).json({error: 'Purchase not found for the given course ID.'})
        }
    }
    catch(err){
        console.log(err)
    }
})

router.get('/preview', userMiddleware, async (req, res) => {
    try{
        const courses = await courseModel.find({}, {creatorId: 0, __v: 0})
        res.json({courses: courses.map((course) => course._id)})
    }
    catch(err){
        console.log(err)
    }
})

router.get('/preview/:id', userMiddleware, async (req, res) => {
    try{
        // console.log('hi')
        const id = req.params.id
        // console.log(id)
        const course = await courseModel.findById(id, {creatorId: 0})
        // console.log(course)
        res.json({course})
    }
    catch(err){
        console.log(err)
    }
})



module.exports = router