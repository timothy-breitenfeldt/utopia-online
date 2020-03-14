"use strict";

const express = require("express");
const cors = require("cors");
const config = require("config");
const xss = require("xss-clean");
const routes = require("./controller/onlineController");
const verifyJwt = require("./helper/verifyJwt");

const app = express();
const port = config.get("server.port");

app.use(cors());
app.use(express.json());
app.use(xss());
app.get("/api/online/itineraries", verifyJwt);
app.get("/api/online/itineraries/:id", verifyJwt);
app.get("/api/online/tickets/itineraries/:id", verifyJwt);
app.delete("/api/online/itineraries/:id", verifyJwt);
app.post("/api/online/itineraries", verifyJwt);
app.post("/api/online/itineraries", verifyJwt);
app.use("/api", routes);

app.use((error, request, response, next) => {
  response
    .status(error.status)
    .send({ status: error.status, message: error.message });
});

app.listen(port, () => console.log(`Listening on poart ${port}`));

module.exports = app;
