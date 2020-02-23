"use strict";

process.env.NODE_ENV = "test";

const onlineController = require("../controller/onlineController");
const db = require("../dao/db");
const server = require("../index");

const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();

chai.use(chaiHttp);

describe("onlineController", () => {
  beforeEach(done => {
    const sql = `
      SET FOREIGN_KEY_CHECKS=0;
      TRUNCATE TABLE airport; TRUNCATE TABLE boarding_pass; TRUNCATE TABLE flight; TRUNCATE TABLE itinerary;
      TRUNCATE TABLE ticket; TRUNCATE TABLE traveler; TRUNCATE TABLE travel_agency; TRUNCATE TABLE user;
      SET FOREIGN_KEY_CHECKS=1;
    `;
    db.connection.query(sql, error => done());
  });

  describe("/POST /flights/search", () => {
    it("it should get all of the flights", done => {
      chai
        .request(server)
        .get("/online/flights/search")
        .end((error, result) => {
          result.should.have.status(200);
          result.body.should.be.a("array");
          result.body.length.should.be.eql(0);
          done();
        });
    });
  });
});
