const jwt = require('jsonwebtoken')
const { User } = require('../modules/user')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, 'mynewcode')
        const user = await User.findOne({ email: decoded.email, 'tokens.token': token })
        if (!user) {
            throw new Error()
        }

        req.token = token
        req.user = user
         next()
    } catch (e) {
        res.status(401).send('please Login!')
    }
}

module.exports = auth