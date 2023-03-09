const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const Joi = require('joi')
const { Users } = require('../models')
const bcrypt = require('bcrypt')
const CustomError = require('../middlewares/errorhandler')


const signupUserSchema = Joi.object({
    nickname: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{4,30}$')),
    confirm: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{4,30}$'))
})

router.get('/', async (req, res) => {
    res.json({
        message: "루트페이지 입니다."
    })
})

// 회원가입 API
router.post('/signup', async (req, res, next) => {
    try {
        const { nickname, password, confirm } = await signupUserSchema.validateAsync(req.body)
        console.log(nickname, password, confirm)
        if (password !== confirm) {
            throw new CustomError('패스워드가 일치하지 않습니다', 412)
        }
        if (password.includes(nickname)) {
            throw new CustomError('패스워드에 닉네임이 포함되어 있습니다.', 412)
        }
        const existUser = await Users.findOne({
            where: { nickname }
        })
        if (existUser) {
            throw new CustomError("중복된 닉네임 입니다.", 412)
        }
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(password, salt)
        console.log(salt)
        console.log(password, hashedPassword)
        await Users.create({ nickname, password: hashedPassword })

        res.status(200).json({
            message: "회원가입에 성공하였습니다."
        })
    } catch (err) {
        console.log(err)
        err.message = !err.status ? " 요청한 데이터 형식이 올바르지 않습니다" : err.message
        err.status = !err.status ? 400 : err.status
        next(err)
    }
})

// 로그인 API
router.post('/login', async (req, res, next) => {
    try {
        const { nickname, password } = req.body
        console.log(nickname, password)
        const user = await Users.findOne({ where: { nickname } })
        if (user) {
            console.log(`if안 user ${user}`)
            const checkPassword = await bcrypt.compare(password, user.password)
            if (!checkPassword) {
                throw new CustomError('닉네임 또는 패스워드를 확인해 주세요.', 412)
            }
        } else if (!user) {
            throw new CustomError('닉네임 또는 패스워드를 확인해 주세요.', 412)
        }
        const token = jwt.sign({ nickname, userId: user.userId }, process.env.TOKEN_KEY)
        res.cookie("Authorization", `Bearer ${token}`)
        res.status(200).json({ token })
    } catch (err) {
        console.log(err)
        err.message = !err.status ? "로그인에 실패하였습니다" : err.message
        err.status = !err.status ? 400 : err.status
        next(err)
    }
})


module.exports = router