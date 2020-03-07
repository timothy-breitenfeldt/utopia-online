"use strict";

const config = require("config");
const jwt = require("jwt-simple");
const db = require("../dao/db");
const { ApplicationError } = require("./error");

function verifyJwt(request, response, next) {
  let token =
    request.headers["authorization"] || request.headers["x-access-token"];

  if (token) {
    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }

    try {
      const secret = config.get("jwt.secret");
      const decoded = jwt.decode(token, secret);
      const id = decoded.id;
      const role = decoded.role;
      request.user = { id: id, role: role };
      next();
    } catch (error) {
      console.log(error);
      next(new ApplicationError(403, "Access forbidden"));
    }
  } else {
    next(new ApplicationError(403, "Access forbidden"));
  }
}

module.exports = verifyJwt;
