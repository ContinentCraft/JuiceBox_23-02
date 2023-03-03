const express = require('express');
const postRouter = express.Router();


const { getAllPosts } = require('../db')

postRouter.get('/', async (req, res) => {
    const posts = await getAllPosts();


    res.send({
        posts
    })
})

module.exports = postRouter