const express = require('express');
const postRouter = express.Router();
const { requireUser } = require('./utils')


const { getAllPosts, createPost, updatePost, getPostById } = require('../db')

postRouter.post('/', requireUser, async (req, res, next) => {
    const { title, content, tags = "" } = req.body;
    const tagArr = tags.trim().split(/\s+/)
    const postData= {
        title,
        content,
        authorId: req.user.id
    };


    if (tagArr.length) {
        postData.tags = tagArr;
    }

    try {
        
        const post = await createPost(postData);
        res.send({ post })
    } catch ({ name, message }) {
        next({ name, message });
    }
})

postRouter.patch('/:postId', requireUser, async (req, res, next) => {
    const { postId } = req.params;
    const { title, content, tags } = req.body;
  
    const updateFields = {};
  
    if (tags && tags.length > 0) {
      updateFields.tags = tags.trim().split(/\s+/);
    }
  
    if (title) {
      updateFields.title = title;
    }
  
    if (content) {
      updateFields.content = content;
    }
  
    try {
      const originalPost = await getPostById(postId);
  
      if (originalPost.author.id === req.user.id) {
        const updatedPost = await updatePost(postId, updateFields);
        res.send({ post: updatedPost })
      } else {
        next({
          name: 'UnauthorizedUserError',
          message: 'You cannot update a post that is not yours'
        })
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  });


postRouter.get('/', async (req, res) => {
    const posts = await getAllPosts();


    res.send({
        posts
    })
})

module.exports = postRouter