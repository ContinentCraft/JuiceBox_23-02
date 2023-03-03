const express = require('express');
const userRouter = express.Router();

userRouter.use((req, res, next) => {
    console.log("A request is being made to /users");

    res.send({ message: 'hello from /users!' });
});


module.exports = userRouter