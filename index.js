const express = require("express");
const bodyParser = require("body-parser");
const xmlParser = require("express-xml-bodyparser");
const cors = require("cors");
const config = require("config");

const app = express();
const port = config.get("server.port");

app.use(bodyParser.json());
app.use(xmlParser());
app.use(cors());
//app.use(require("./service/onlineService.js"));
app.listen(port, () => console.log(`Listening on poart ${port}`));
