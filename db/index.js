const { Client } = require('pg');

const client = new Client('postgres://localhost:5432/juicebox');

async function createUser({ username, password, name, location }) {
    try {
        const { rows: [ user ] } = await client.query(`
            INSERT INTO users (username, password, name, location) 
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (username) DO NOTHING 
            RETURNING *;
        `, [username, password, name, location])
    
        return user;
    } catch (error) {
        throw error
    }
}

async function updateUser(id, fields = {}) {
    
    const setString = Object.keys(fields).map(
        (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
  
    
    if (setString.length === 0) {
        return;
    }
  
    try {
        const result = await client.query(`
            UPDATE users
            SET ${ setString }
            WHERE id=${ id }
            RETURNING *;
        `, Object.values(fields));
  
        return result;
    } catch (error) {
        throw error;
    }
}

async function getAllUsers() {
    const { rows } = await client.query(
        `SELECT id, username, name, location, active 
        FROM users;
    `);
  
    return rows;
  
}

async function getUserById(userId) {
    const { rows } = await client.query(`
        SELECT * FROM users
        WHERE id = ${userId};
    `)
    if(rows.length === 0){return null}
    else{
        delete rows[userId-1].password
        rows[userId-1].posts = getPostsByUser()
        return rows
    }
}

async function createPost({
    authorId,
    title,
    content
}) {
    try {
        const { rows: [ post ] } = await client.query(`
            INSERT INTO posts ("authorId", title, content) 
            VALUES ($1, $2, $3)
            RETURNING *;
        `, [authorId, title, content])
    
        return post;
    } catch (error) {
        throw error;
    }
}

async function updatePost(id, fields =  { 
}) 
{ 
    const setString = Object.keys(fields).map(
        (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
    
    if (setString.length === 0) {
        return;
    }
    console.log(id, "!!!")
    try {
        console.log(setString)
        const result = await client.query(`
            UPDATE posts
            SET ${ setString }
            WHERE id=${ id }
            RETURNING *;
        `, Object.values(fields));
  console.log(result, "!!!!")
        return result;
    } catch (error) {
        throw error;
    }
}

async function getAllPosts() {
    try {
        const { rows } = await client.query(
            `SELECT "authorId", 
            title, 
            content, 
            active,
            id
            FROM posts;
          `);
        
          return rows;
    } catch (error) {
      throw error;
    }
}

async function getPostsByUser(userId) {
    try {
        const { rows } = await client.query(`
            SELECT * FROM posts
            WHERE "authorId"=${ userId };
        `);
  
        return rows;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    client,
    createUser,
    updateUser,
    getAllUsers,
    getUserById,
    createPost,
    updatePost,
    getAllPosts,
    getPostsByUser
}