const express = require('express');
const apiRouter = express.Router();

const jwt = require('jsonwebtoken');
const { getUserById } = require('../db');
const { JWT_SECRET } = process.env;

apiRouter.use(async (req, res, next) => {
    const prefix = 'Bearer ';
    const auth = req.header('Authorization')
    
    if (!auth) {
        next();
    } else if (auth.startsWith(prefix)) {
        const token = auth.slice(prefix.length);
        console.log(token, "I'm token")
        try {
            const { id } =jwt.verify(token, JWT_SECRET)
            console.log(id, "I'm ID")

            if (id) {
                req.user = await getUserById(id);
                next();
            }
        }catch ({ name, message}) {
            next({ name, message});
        }
    } else {
        next({
            name: 'AuthorizationHeaderError',
            message: `Authorization token must start with ${ prefix }`
        })
    }
})

apiRouter.use((req, res, next) => {
    if (req.user) {
        console.log("user is set:", req.user);
    }

    next();
})





const userRouter = require('./users');
apiRouter.use('/users', userRouter);

const postRouter = require('./posts');
apiRouter.use('/posts', postRouter);

const tagsRouter = require('./tags');
apiRouter.use('/tags', tagsRouter);

apiRouter.use((error, req, res, next) => {
    res.send({
        name: error.name,
        message: error.message
    })
})

module.exports = apiRouter;