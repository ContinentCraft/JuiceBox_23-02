require('dotenv').config();
const PORT = 3000;
const express = require("express");
const server = express();
const morgan = require('morgan');
server.use(morgan('dev'));
server.use(express.json());
const apiRouter = require("./api");
server.use("/api", apiRouter);


server.use((req, res, next) => {
  console.log("body start");
  console.log(req.body);
  console.log("body end");
  
  
  next();
});

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
