require('dotenv').config();
const PORT = 3000;
const express = require("express");
const server = express();
const morgan = require('morgan');
server.use(morgan('dev'));
server.use(express.json());
const apiRouter = require("./api");


server.use((req, res, next) => {
  console.log("body start");
  console.log(req.body);
  console.log("body end");
  
  
  next();
});

server.get('/background/:color', (req, res, next) => {
  res.send(`
  <body style="background: ${ req.params.color};">
    <h1>Hello World</h1>
    </body>
  `)

  next();
})

server.get('/add/:first/to/:second', (req, res, next) => {
  res.send(`<h1>${ req.params.first } + ${ req.params.second } = ${
    Number(req.params.first) + Number(req.params.second)
   }</h1>`);

   next();
});


server.use("/api", apiRouter);
const { client } = require('./db');
client.connect();
server.listen(PORT, () => {
  console.log("The server is up on port", PORT);
});



// server.use("/api", (req, res, next) => {
  //   console.log("A request was made to /api");
//   next();
// });

// server.get("/api", (req, res, next) => {
//   console.log("A get request was made to /api");
//   res.send({ message: "success" });
// });
