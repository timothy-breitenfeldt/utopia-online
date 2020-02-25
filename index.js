"use strict";

const express = require("express");
const cors = require("cors");
const config = require("config");
const xss = require("xss-clean");
const routes = require("./controller/onlineController");
const verifyJwt = require("./helper/verifyJwt");

const app = express();
const port = config.get("server.port");

app.use(express.json());
app.use(cors());
app.use(xss());
app.all("/api/online/*", verifyJwt);
app.use("/api", routes);

app.use((error, request, response, next) => {
  response
    .status(error.status)
    .send({ status: error.status, message: error.message });
});

app.listen(port, () => console.log(`Listening on poart ${port}`));

module.exports = app;
