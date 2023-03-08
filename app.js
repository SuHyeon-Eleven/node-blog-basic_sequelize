const express = require('express')
require('dotenv').config()
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const morganMiddleware = require('./middlewares/moganMiddleware')
const app = express()
const port = 3000
const globalRouter = require('./routes')

app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))
app.use(morganMiddleware)

app.use(globalRouter)

app.use((err, req, res, next) => {
    console.log('왜안됭')
    res.status(err.status || 500);
    console.log('app.js의 err.message',err.message)
    err.message = err.message || '예상치 못한 에러가 발생하였습니다.'

    console.error(err.stack || err.message)
    res.json({ errormessage: err.message });
    
})

app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`)
})

