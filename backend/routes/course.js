const { Router } = require('express')
const router = Router()
const { userMiddleware } = require('../middleware/user')
const {courseModel, purchaseModel} = require('../database/db')
const mongoose = require('mongoose')

/**
 * @swagger
 * /course/purchase/{id}:
 *   post:
 *     summary: Purchase a course (user only)
 *     tags: [Course]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID to purchase
 *     responses:
 *       200:
 *         description: Course purchased successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 purchase:
 *                   type: object
 *       401:
 *         description: Already purchased or unauthorized
 */
router.post('/purchase/:id', userMiddleware, async (req, res) => {
    try{
        const id = req.params.id
        // Check if user already purchased this course
        const existingPurchase = await purchaseModel.findOne({userId:req.user.id, courseId:id})
        if(existingPurchase){
            res.status(401).json({error: 'You already purchased this course!'})
            return
        }
        
        // Create purchase record linking user to course
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

/**
 * @swagger
 * /course/refund/{id}:
 *   delete:
 *     summary: Refund a purchased course (user only)
 *     tags: [Course]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID to refund
 *     responses:
 *       200:
 *         description: Course refunded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deletedCourse:
 *                   type: object
 *       401:
 *         description: Purchase not found or unauthorized
 */
router.delete('/refund/:id', userMiddleware, async (req, res) => {
    try{
        const id = req.params.id;
        // Delete purchase record if it exists for this user
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

/**
 * @swagger
 * /course/preview:
 *   get:
 *     summary: Get list of all available course IDs (user only)
 *     tags: [Course]
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
router.get('/preview', userMiddleware, async (req, res) => {
    try{
        // Return only course IDs, excluding creatorId and version fields
        const courses = await courseModel.find({}, {creatorId: 0, __v: 0})
        res.json({courses: courses.map((course) => course._id)})
    }
    catch(err){
        console.log(err)
    }
})

/**
 * @swagger
 * /course/preview/{id}:
 *   get:
 *     summary: Get course details by ID (user only)
 *     tags: [Course]
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
router.get('/preview/:id', userMiddleware, async (req, res) => {
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



module.exports = router