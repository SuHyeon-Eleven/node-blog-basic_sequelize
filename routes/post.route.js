const express = require('express')
const router = express.Router()
const { Posts, Users } = require('../models')
const authMiddleware = require('../middlewares/auth-midddleware')
const CustomError = require('../middlewares/errorhandler')

// 게시글 작성 API
router.post('/', authMiddleware, async (req, res, next) => {

    try {
        const { title, content } = req.body
        const user = res.locals.user
        if (!title || !content) {
            console.log(title, content)
            throw new CustomError("1데이터 형식이 올바르지 않습니다", 412)
        }
        await Posts.create({
            title,
            content,
            UserId: user.userId,
            nickname: user.nickname
        })
        res.status(201).json({
            message: "게시글 작성에 성공하였습니다."
        })
    } catch (err) {
        err.message = !err.status ? "게시글 작성에 실패하였습니다." : err.message
        err.status = !err.status ? 400 : err.status
        console.log(err.status, err.message)
        next(err)
    }
})

// 게시글 조회 API
router.get('/', async (req, res, next) => {
    try {
        const posts = await Posts.findAll({
            raw: true,
            attributes: ['postId', 'title', 'createdAt', 'updatedAt', ['UserId', 'userId'], 'User.nickname'],
            include: [
                {
                    model: Users,
                    attributes: [],
                    // nest : false 
                }
            ]
        })
        res.status(200).json({ posts })
    } catch (err) {
        err.message = !err.status ? "게시글 조회에 실패하였습니다." : err.message
        err.status = !err.status ? 400 : err.status
        next(err)
    }
})

// 게시글 상세조회 API
router.get('/:postId', async (req, res, next) => {
    try {
        const { postId } = req.params
        const posts = await Posts.findOne({
            where: { postId },
            attributes: ['postId', 'title', 'createdAt', 'updatedAt', ['UserId', 'userId'], 'User.nickname'],
            raw: true,
            include: [
                {
                    model: Users,
                    attributes: [],
                }
            ]
        })
        if (!posts) {
            throw new CustomError("1게시글 상세조회에 실패하였습니다.", 400)
        }
        res.status(200).json({ posts })
    } catch (err) {
        err.message = !err.status ? "2게시글 상세조회에 실패하였습니다." : err.message
        err.status = !err.status ? 400 : err.status
        console.log(err.status, err.message)
        next(err)

    }
})

// 게시글 수정 API
router.put('/:postId', authMiddleware, async (req, res, next) => {
    const { postId } = req.params
    const { title, content } = req.body
    const user = res.locals.user
    const post = await Posts.findOne({ where: { postId, UserId: user.userId } })
    if (!post) {
        return res.status(403).json({
            errorMessage: "게시글 수정의 권한이 존재하지 않습니다."
        })
    }
    if (!title || !content) {
        return res.status(412).json({
            errorMessage: "데이터 형식이 올바르지 않습니다"
        })
    }
    await Posts.update({
        title,
        content
    }, { where: { postId } })
    res.status(201).json({
        message: "게시글 수정에 성공하였습니다."
    })
})

// 게시글 삭제 API
router.delete('/:postId', authMiddleware, async (req, res, next) => {
    try {
        const { postId } = req.params
        const user = res.locals.user

        const post = await Posts.findOne({
            where: { postId, UserId: user.userId }
        })
        if (post.UserId !== user.userId) {
            throw new CustomError('게시글 삭제의 권한이 존재하지 않습니다.', 403)
        }

        await Posts.destroy({ where: { postId } })
        res.status(200).json({ message: "데이터 삭제에 성공하였습니다." })
    } catch (err) {
        err.message = !err.status ? "게시글 삭제에 실패하였습니다." : err.message
        err.status = !err.status ? 400 : err.status
        console.log(err.status, err.message)
        next(err)

    }
})
module.exports = router