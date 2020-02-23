"use strict";

const express = require("express");
const xmlParser = require("express-xml-bodyparser");
const cors = require("cors");
const config = require("config");
const xss = require("xss-clean");

const app = express();
const port = config.get("server.port");

app.use(express.json());
app.use(xmlParser());
app.use(cors());
app.use(xss());
app.use(require("./controller/onlineController"));

app.use((error, request, response, next) => {
  response
    .status(error.status)
    .send({ status: error.status, message: error.message });
});

app.listen(port, () => console.log(`Listening on poart ${port}`));
