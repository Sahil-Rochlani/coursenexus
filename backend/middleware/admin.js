/**
 * Admin authentication middleware
 * Verifies JWT token from cookies and attaches admin data to request object
 */
require('dotenv').config()
const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET
const jwt = require('jsonwebtoken')

/**
 * Middleware to authenticate admin requests via JWT token
 * Extracts token from cookies, verifies it using admin secret, and attaches decoded admin data to req.admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
function adminMiddleware(req, res, next){
    const token = req.cookies.token
    if(token){
        jwt.verify(token, JWT_ADMIN_SECRET, (err, decoded) => {
            if(err){
                res.json({error: 'Invalid token'})
                return
            }
            else{
                req.admin = decoded // Attach decoded token payload (id, firstName, lastName) to request
                next()
            }
        })
    }
    else{
        res.json({error: 'Unauthorized'})
        return
    }
}

module.exports = {adminMiddleware}