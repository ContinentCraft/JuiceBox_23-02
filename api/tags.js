const express = require('express');
const tagsRouter = express.Router();


const { getAllTags, getPostsByTagName } = require('../db')





tagsRouter.get('/:tagName/posts', async (req, res, next) => {
    try{
        const tags = await getAllTags();
        console.log(tags, "!!")
        res.send({
            tags
        })
    }catch({name, message}){
        next({name, message})
    }
})

module.exports = tagsRouter