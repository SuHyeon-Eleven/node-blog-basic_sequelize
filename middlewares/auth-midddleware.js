const jwt = require('jsonwebtoken')
const { Users } = require('../models')
const CustomError = require('./errorhandler')

module.exports = async (req, res, next) => {
    try {
        const { Authorization } = req.cookies
        const [authType, authToken] = (Authorization ?? "").split(" ")

        if (authType !== 'Bearer' || !authToken) {
            throw new CustomError("로그인 후 사용가능한 기능입니다.", 401)
        }
        const { nickname, userId } = jwt.verify(authToken, process.env.TOKEN_KEY)
        const user = await Users.findOne({ where: { userId } })
        res.locals.user = user
        next()

    } catch (err) {
        return res.status(err.status || 500).json({
            errorMessage: err.expect ? 
            err.message : "전달된 쿠키에서 오류가 발생하였습니다."
        })
    }


}