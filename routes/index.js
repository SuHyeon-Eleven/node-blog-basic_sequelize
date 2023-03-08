const express = require('express')
const router = express.Router()
const postRouter = require('./post.route')
const userRouter = require('./user.route')

router.use('/posts',postRouter)
router.use('/',userRouter)
module.exports = router
