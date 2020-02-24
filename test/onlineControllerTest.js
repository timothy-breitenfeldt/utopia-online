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
  afterEach(done => {
    const sql = `
  SET FOREIGN_KEY_CHECKS=0;
  TRUNCATE TABLE airport; TRUNCATE TABLE boarding_pass; TRUNCATE TABLE flight; TRUNCATE TABLE itinerary;
  TRUNCATE TABLE ticket; TRUNCATE TABLE traveler; TRUNCATE TABLE travel_agency; TRUNCATE TABLE user;
  SET FOREIGN_KEY_CHECKS=1;
`;
    db.connection.query(sql, () => done());
  });

  describe("/POST /flights/search", () => {
    it("it should get all of the flights", done => {
      chai
        .request(server)
        .post("/online/flights/search")
        .end((error, result) => {
          result.should.have.status(200);
          result.body.should.be.a("array");
          result.body.length.should.be.eql(0);
          done();
        });
    });
  });

  describe("/POST /flights/search flight_number=1", async () => {
    before(done => {
      const sql = `
        INSERT INTO airport (id, name, street, city, state, country, postal_code) VALUES(1, "PDX", "5th street", "Portland", "Oregon", "US", "98661");
        INSERT INTO airport (id, name, street, city, state, country, postal_code) VALUES(2, "Seatac", "3rd Ave.", "Seattle", "Oregon", "US", "98661");
        INSERT INTO flight (id, dest, origin, capacity, price, arrival_date, departure_date) VALUES(1, 1, 2, 20, 50.0, "2019-11-06", "2019-11-07");
      `;
      db.connection.query(sql, () => done());
    });

    it("it should get a flight with an ID of 1", done => {
      chai
        .request(server)
        .post("/online/flights/search")
        .send({ flight_number: 1 })
        .end((error, result) => {
          result.should.have.status(200);
          result.body.length.should.be.eql(1);
          result.body[0].should.be.a("object");
          result.body[0].should.have.property("flight_number");
          result.body[0].should.have.property("airport_id");
          result.body[0].should.have.property("airport_name");
          result.body[0].should.have.property("dest");
          result.body[0].should.have.property("origin");
          result.body[0].should.have.property("departure_date");
          result.body[0].should.have.property("arrival_date");
          result.body[0].should.have.property("capacity");
          result.body[0].should.have.property("price");
          done();
        });
    });
  });
});
