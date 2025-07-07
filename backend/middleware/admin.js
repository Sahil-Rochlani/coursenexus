require('dotenv').config()
const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET
const jwt = require('jsonwebtoken')
function adminMiddleware(req, res, next){
    const token = req.cookies.token
    // console.log(token)
    if(token){
        jwt.verify(token, JWT_ADMIN_SECRET, (err, decoded) => {
            if(err){
                res.json({error: 'Invalid token'})
                return
            }
            else{
                req.admin = decoded
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