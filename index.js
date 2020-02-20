const express = require("express");
const app = express();

app.use(express.json());
app.use(require("./service/onlineService.js"));
app.listen(8081);
