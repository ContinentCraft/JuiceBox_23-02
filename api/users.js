const jwt = require('jsonwebtoken')
const express = require('express');
const userRouter = express.Router();

// userRouter.use((req, res, next) => {
//     console.log("A request is being made to /users");

//     res.send({ message: 'hello from /users!' });

//     next();
// });

const { getAllUsers } = require('../db')

userRouter.get('/', async (req, res, next) => {
    const users = await getAllUsers()


    res.send({
        users
    })
    next()
})

const { getUserByUsername } = require('../db')

userRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
    

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
            const token = jwt.sign({userName, id:userId}, process.env.JWT_SECRET)
            res.send({ message: "you're logged in!", token })
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