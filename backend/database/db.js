/**
 * MongoDB database models and connection setup
 * Defines schemas for User, Admin, Course, and Purchase entities
 */
require('dotenv').config()
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI)
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId

const userSchema = new Schema({
    firstName:String,
    lastName:String,
    email: { type: String, unique: true},
    password: String
})

const adminSchema = new Schema({
    firstName:String,
    lastName:String,
    email: { type: String, unique: true},
    password: String
})

const courseSchema = new Schema({
    title:String,
    description:String,
    price: Number,
    imageUrl: String,
    creatorId: { type: ObjectId, ref: 'Admin'} // References Admin who created the course
})

const purchaseSchema = new Schema({
    courseId: {type: ObjectId, ref: 'Course'},
    userId: {type: ObjectId, ref: 'User'}
})

const userModel = mongoose.model('User', userSchema)
const adminModel = mongoose.model('Admin', adminSchema)
const courseModel = mongoose.model('Course', courseSchema)
const purchaseModel = mongoose.model('Purchase', purchaseSchema)

module.exports = {
    userModel,
    adminModel,
    courseModel, 
    purchaseModel
}