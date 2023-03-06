const jwt = require('jsonwebtoken')
const express = require('express');
const userRouter = express.Router();

// userRouter.use((req, res, next) => {
//     console.log("A request is being made to /users");

//     res.send({ message: 'hello from /users!' });

//     next();
// });

const { getAllUsers } = require('../db')

userRouter.get('/', async (req, res) => {
    const users = await getAllUsers()


    res.send({
        users
    })
})

userRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body
  
    // request must have both
    if (!username || !password) {
        next({
            name: "MissingCredentialsError",
            message: "Please supply both a username and password"
        })
    }
  
    try {
        const user = await getUserByUsername(username)
        const userName = user.username
        const userId = user.id
  
        if (user && user.password == password) {
            jwt.sign({userName, userId}, process.env.JWT_SECRET)
            res.send({ message: "you're logged in!" })
        } else {
            next({ 
            name: 'IncorrectCredentialsError', 
            message: 'Username or password is incorrect'
            })
        }
    } catch(error) {
        console.log(error)
        next(error)
    }
})


module.exports = userRouter