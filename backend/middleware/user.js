require('dotenv').config()
const JWT_USER_SECRET = process.env.JWT_USER_SECRET
const jwt = require('jsonwebtoken')
function userMiddleware(req, res, next){
    const token = req.cookies.token
    if(token){
        jwt.verify(token, JWT_USER_SECRET, (err, decoded) => {
            if(err){
                res.json({error: 'Invalid token'})
                return
            }
            else{
                req.user = decoded
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