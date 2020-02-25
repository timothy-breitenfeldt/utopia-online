"use strict";

const config = require("config");
const jwt = require("jwt-simple");
const db = require("../dao/db");
const { ApplicationError } = require("./error");

async function verifyJwt(req, res, next) {
  const token =
    (req.body && req.body.access_token) ||
    (req.query && req.query.access_token) ||
    req.headers["x-access-token"];

  if (token) {
    try {
      const secret = config.get("jwt.secret");
      const decoded = jwt.decode(token, secret);

      if (decoded.exp <= Date.now()) {
        res.end("Access token has expired", 400);
      }

      const userId = decoded.id;
      const sql = "SELECT * FROM user WHERE id = ?;";
      const user = await db.connection.query(sql, [userId]);

      if (user.length == 0) {
        throw new Error();
      }

      req.user = user[0];
      next();
    } catch (error) {
      next(new ApplicationError(403, "Access forbidden"));
    }
  } else {
    next(new ApplicationError(403, "Access forbidden"));
  }
}

module.exports = verifyJwt;
