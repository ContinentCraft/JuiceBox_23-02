const { 
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
} = require("./index");

async function dropTables() {
  try {
    console.log("Starting to drop tables...");
    await client.query(`
        DROP TABLE IF EXISTS post_tags;
        DROP TABLE IF EXISTS tags;
        DROP TABLE IF EXISTS posts;
        DROP TABLE IF EXISTS users;
    `);
    console.log("Finished dropping tables!");
  } catch (error) {
    console.error("ERROR dropping tables!");
    throw error;
  }
}

async function createTables() {
  try {
    console.log("Starting to build tables...");
    await client.query(`
            CREATE TABLE users(
                id SERIAL PRIMARY KEY,
                username varchar(255) UNIQUE NOT NULL,
                password varchar(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                location VARCHAR(255) NOT NULL,
                active BOOLEAN DEFAULT true
            );
            CREATE TABLE posts(
                id SERIAL PRIMARY KEY,
                "authorId" INTEGER REFERENCES users(id) NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                active BOOLEAN DEFAULT true
            );
            CREATE TABLE tags(
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL
            );
            CREATE TABLE post_tags(
                postid INTEGER REFERENCES posts(id),
                tagid INTEGER REFERENCES tags(id),
                UNIQUE(postid, tagid)
            );
        `)
    console.log("Finished building tables!")
  } catch (error) {
    console.error("ERROR building tables!")
    throw error
  }
}

async function createInitialUsers() {
  try {
    console.log("Starting to create users...");

    const albert = await createUser({
      username: "albert",
      password: "bertie99",
      name: "albert",
      location: "none",
      active: true
    });
    const sandra = await createUser({
      username: "sandra",
      password: "2sandy4me",
      name: "sandra",
      location: "none",
      active: true
    });
    const glamgal = await createUser({
      username: "glamgal",
      password: "soglam",
      name: "glamgal",
      location: "none",
      active: true
    });

    console.log(albert);

    console.log("Finished creating users!");
  } catch (error) {
    console.error("ERROR creating users!");
    throw error;
  }
}

async function createInitialPosts() {
  try {
    console.log("starting to create posts")
    const [albert, sandra, glamgal] = await getAllUsers()

    await createPost({
        authorId: albert.id,
        title: "First Post",
        content: "This is my first post. I hope I love writing blogs as much as I love writing them.",
        tags: ["#happy", "#youcandoanything"]
    })

    await createPost({
        authorId: glamgal.id,
        title: "I'm Stuck in China!",
        content: "HELP! I'm stuck in China!!",
        tags: ["#sad", "#worst-day-ever"]
    })

    await createPost({
        authorId: sandra.id,
        title: "Happy Summer!",
        content: "It's February! I'm from Australia",
        tags: ["#happy", "#youcandoanything", "#canmandoeverything"]
    })

    console.log("finished creating posts")
    } catch (error) {
        throw error;
    }
}

async function createInitialTags() {
    try {
        console.log("Starting to create tags...")
    
        const [happy, sad, inspo, catman] = await createTags([
            '#happy',
            '#worst-day-ever',
            '#youcandoanything',
            '#catmandoeverything'
        ])
        
        const [postOne, postTwo, postThree] = await getAllPosts()
    
        await addTagsToPost(postOne.id, [happy, inspo])
        await addTagsToPost(postTwo.id, [sad, inspo])
        await addTagsToPost(postThree.id, [happy, catman, inspo])
  
        console.log("Finished creating tags!")
    } catch (error) {
        console.log("ERROR creating tags!")
        throw error
    }
}

async function rebuildDB() {
  try {
    client.connect()

    await dropTables()
    await createTables()
    await createInitialUsers()
    await createInitialPosts()
    await createInitialTags()
  } catch (error) {
    console.error(error)
  }
}

async function testDB() {
  try {
    console.log("Starting to test database...")

    console.log("Calling getAllUsers")
    // const { rows } = await client.query(`SELECT * FROM users;`);
    // console.log(rows);
    const users = await getAllUsers()
    console.log("getAllUsers:", users)

    console.log("Calling updateUser on users[0]")
    const updateUserResult = await updateUser(users[0].id, {
      name: "Newname Sogood",
      location: "Lesterville, KY"
    });
    // console.log("Result:", updateUserResult)

    console.log("Calling getAllPosts")
    const posts = await getAllPosts()
    console.log("Result posts:", posts)

    console.log("Calling updatePost on posts[0]")
    const updatePostResult = await updatePost(posts[0].id, {
      title: "New Title",
      content: "Updated Content"
    })
    console.log("Result:", updatePostResult)

    console.log("Calling updatePost on posts[2], only updating tags")
    const updatePostTagsResult = await updatePost(posts[2].id, {
      tags: ["#youcandoanything", "#redfish", "#bluefish"]
    })
    console.log("Result:", updatePostTagsResult)

    console.log("Calling getUserById with 1")
    const albert = await getUserById(1)
    console.log("Result:", albert)

    console.log("Calling getPostsByTagName with #happy")
    const postsWithHappy = await getPostsByTagName("#happy")
    console.log("Result:", postsWithHappy)

    console.log("Finished database tests!")
  } catch (error) {
    console.error("ERROR testing database!")
    throw error;
  } 
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
