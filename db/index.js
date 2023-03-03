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
        delete rows[0].password
        rows[0].posts = await getPostsByUser(userId)
        return rows[0]
    }
}

async function createPost({
    authorId,
    title,
    content,
    tags = []
}) {
    try {
        const { rows: [ post ] } = await client.query(`
            INSERT INTO posts ("authorId", title, content) 
            VALUES ($1, $2, $3)
            RETURNING *;
        `, [authorId, title, content])
        const tagList = await createTags(tags)
        return await addTagsToPost(post.id, tagList)
    } catch (error) {
        throw error;
    }
}

async function updatePost(postid, fields = {}) { 
    const { tags } = fields
    delete fields.tags

    const setString = Object.keys(fields).map(
        (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ')

    try {
        if(setString.length > 0) {
            await client.query(`
                UPDATE posts
                SET ${ setString }
                WHERE id=${ postid }
                RETURNING *;
            `, Object.values(fields))
        }

        if(tags === undefined){
            return await getPostById(postid)
        }

        const tagList = await createTags(tags)
        const tagListIdString = tagList.map(
            tag => `${ tag.id }`
        ).join(', ')

        await client.query(`
            DELETE FROM post_tags
            WHERE "tagid"
            NOT IN (${ tagListIdString })
            AND "postid"=$1;
        `, [postid])

        await addTagsToPost(postid, tagList)

        return await getPostById(postid)
    } catch (error) {
        throw error
    }
}

async function getAllPosts() {
    try {
        const { rows: postIds } = await client.query(
            `SELECT id
            FROM posts;
        `)
        
        const posts = await Promise.all(postIds.map(
            post => getPostById(post.id)
        ))

        return posts
    } catch (error) {
      throw error
    }
}

async function getPostsByUser(userId) {
    try {
        const { rows: postIds } = await client.query(`
            SELECT id FROM posts
            WHERE "authorId"=${ userId };
        `)
        const posts = await Promise.all(postIds.map(
            post => getPostById(post.id)
        ))
        return posts;
    } catch (error) {
        throw error;
    }
}

async function createTags(tagList) {
    if (tagList.length === 0) { 
        return
    }
   
    const insertValues = tagList.map(
        (_, index) => `$${index + 1}`).join('), (')

    const selectValues = tagList.map(
        (_, index) => `$${index + 1}`).join(', ')

    try {
        await client.query(`
            INSERT INTO tags(name)
            VALUES (${insertValues})
            ON CONFLICT (name) DO NOTHING;
        `, tagList)

        const { rows } = await client.query(`
            SELECT * FROM tags
            WHERE name
            IN (${selectValues});
        `, tagList)
        return rows

    } catch (error) {
        throw error
    }
}

async function createPostTag(postid, tagid) {
    try {
        await client.query(`
        INSERT INTO post_tags("postid", "tagid")
        VALUES ($1, $2)
        ON CONFLICT ("postid", "tagid") DO NOTHING;
        `, [postid, tagid])
    } catch (error) {
        throw error
    }
}

async function addTagsToPost(postid, tagList) {
    try {
        const createPostTagPromises = tagList.map(
            tag => createPostTag(postid, tag.id)
        )
  
        await Promise.all(createPostTagPromises)
  
        return await getPostById(postid);
    } catch (error) {
        throw error
    }
}

async function getPostById(postid) {
    try {
        const { rows: [ post ]  } = await client.query(`
            SELECT *
            FROM posts
            WHERE id=$1;
        `, [postid]);
    
        const { rows: tags } = await client.query(`
            SELECT tags.*
            FROM tags
            JOIN post_tags ON tags.id=post_tags."tagid"
            WHERE post_tags."postid"=$1;
        `, [postid])
    
        const { rows: [author] } = await client.query(`
            SELECT id, username, name, location
            FROM users
            WHERE id=$1;
        `, [post.authorId])
  
        post.tags = tags
        post.author = author
    
        delete post.authorId
    
        return post
    } catch (error) {
        throw error
    }
}

async function getPostsByTagName(tagName) {
    console.log(tagName, "!!!")
    try {
        const { rows: postIds } = await client.query(`
            SELECT posts.id FROM posts
            JOIN post_tags ON posts.id=post_tags.postid
            JOIN tags ON tags.id=post_tags.tagid
            WHERE tags.name=$1;
        `, [tagName])
        console.log(postIds)
        return await Promise.all(postIds.map(
            post => getPostById(post.id)
        ))
    } catch (error) {
        throw error
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
    getPostsByUser,
    createTags,
    createPostTag,
    addTagsToPost,
    getPostById,
    getPostsByTagName
}