/**
 * User authentication middleware
 * Verifies JWT token from cookies and attaches user data to request object
 */
require('dotenv').config()
const JWT_USER_SECRET = process.env.JWT_USER_SECRET
const jwt = require('jsonwebtoken')

/**
 * Middleware to authenticate user requests via JWT token
 * Extracts token from cookies, verifies it, and attaches decoded user data to req.user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
function userMiddleware(req, res, next){
    const token = req.cookies.token
    if(token){
        jwt.verify(token, JWT_USER_SECRET, (err, decoded) => {
            if(err){
                res.json({error: 'Invalid token'})
                return
            }
            else{
                req.user = decoded // Attach decoded token payload (id, firstName, lastName) to request
                next()
            }
        })
    }
    else{
        res.json({error: 'Unauthorized'})
        return
    }
}

module.exports = {userMiddleware}