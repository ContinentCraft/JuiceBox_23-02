const express = require('express');
const apiRouter = express.Router();


const userRouter = require('./users');
apiRouter.use('/users', userRouter);

module.exports = apiRouter;

const postRouter = require('./posts');
apiRouter.use('/posts', postRouter);

const tagsRouter = require('./tags');
apiRouter.use('/tags', tagsRouter);