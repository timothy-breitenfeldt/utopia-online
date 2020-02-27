"use strict";

process.env.NODE_ENV = "test";

const onlineController = require("../controller/onlineController");
const db = require("../dao/db");
const server = require("../index");

const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();

chai.use(chaiHttp);

describe("Tickets", () => {
  afterEach(done => {
    const sql = `
  SET FOREIGN_KEY_CHECKS=0;
  TRUNCATE TABLE airport; TRUNCATE TABLE boarding_pass; TRUNCATE TABLE flight; TRUNCATE TABLE itinerary;
  TRUNCATE TABLE ticket; TRUNCATE TABLE traveler; TRUNCATE TABLE travel_agency; TRUNCATE TABLE user;
  SET FOREIGN_KEY_CHECKS=1;
`;
    db.connection.query(sql, () => done());
  });

  describe("/GET /tickets/itineraries?id=1", () => {
    before(done => {
      const sql = `
        INSERT INTO airport (id, name, street, city, state, country, postal_code) VALUES(1, "PDX", "5th street", "Portland", "Oregon", "US", "98661");
        INSERT INTO airport (id, name, street, city, state, country, postal_code) VALUES(2, "Seatac", "3rd Ave.", "Seattle", "Oregon", "US", "98661");
        INSERT INTO flight (id, dest, origin, capacity, price, arrival_date, departure_date) VALUES(1, 2, 1, 20, 50.0, "2019-11-06", "2019-11-07");
        INSERT INTO traveler (id, first_name, last_name, dob, phone, email, street, country, state, city, postal_code) VALUES(1, "Cyndie", "Nettleship", "2019-07-07", "602-138-8325", "cnettleship0@ifeng.com", "23 Loeprich Hill", "United States", "Arizona", "Phoenix", "85083");
        INSERT INTO travel_agency (id, name, phone, email, commission_rate) VALUES(1, "Browsetype", "148-229-1064", "locaine0@mayoclinic.com", 30);
        INSERT INTO user (id, email, password, role, agency_id, first_name, last_name, dob, phone, street, country, state, city, postal_code) VALUES(1, "vskitteral0@shinystat.com", "jtRQ3nKc84f", "COUNTER", null, "Vivien", "Skitteral", "2019-06-16", "901-361-6928", "6997 Ryan Street", "United States", "Tennessee", "Memphis", "38126");
        INSERT INTO itinerary (id, traveler_id, user_id, agency_id, price_total) VALUES(1, 1, 1, 1, 65.32);
        INSERT INTO ticket (id, flight_number, itinerary_id, status, seat_number) VALUES(1, 1, 1, "ACTIVE", "3E");
      `;
      db.connection.query(sql, () => done());
    });

    it("it should get a ticket where the ID is 1", done => {
      chai
        .request(server)
        .get("/online/tickets/itineraries")
        .query({ id: 1 })
        .end((error, result) => {
          result.should.have.status(200);
          result.body.should.be.a("array");
          result.body.length.should.be.eql(1);
          result.body[0].should.be.a("object");
          result.body[0].should.have.property("id");
          result.body[0].should.have.property("flight_number");
          result.body[0].should.have.property("itinerary_id");
          result.body[0].should.have.property("status");
          result.body[0].should.have.property("seat_number");
          done();
        });
    });
  });

  describe("/GET /tickets/itineraries?id=-1", () => {
    before(done => {
      const sql = `
        INSERT INTO airport (id, name, street, city, state, country, postal_code) VALUES(1, "PDX", "5th street", "Portland", "Oregon", "US", "98661");
        INSERT INTO airport (id, name, street, city, state, country, postal_code) VALUES(2, "Seatac", "3rd Ave.", "Seattle", "Oregon", "US", "98661");
        INSERT INTO flight (id, dest, origin, capacity, price, arrival_date, departure_date) VALUES(1, 2, 1, 20, 50.0, "2019-11-06", "2019-11-07");
        INSERT INTO traveler (id, first_name, last_name, dob, phone, email, street, country, state, city, postal_code) VALUES(1, "Cyndie", "Nettleship", "2019-07-07", "602-138-8325", "cnettleship0@ifeng.com", "23 Loeprich Hill", "United States", "Arizona", "Phoenix", "85083");
        INSERT INTO travel_agency (id, name, phone, email, commission_rate) VALUES(1, "Browsetype", "148-229-1064", "locaine0@mayoclinic.com", 30);
        INSERT INTO user (id, email, password, role, agency_id, first_name, last_name, dob, phone, street, country, state, city, postal_code) VALUES(1, "vskitteral0@shinystat.com", "jtRQ3nKc84f", "COUNTER", null, "Vivien", "Skitteral", "2019-06-16", "901-361-6928", "6997 Ryan Street", "United States", "Tennessee", "Memphis", "38126");
        INSERT INTO itinerary (id, traveler_id, user_id, agency_id, price_total) VALUES(1, 1, 1, 1, 65.32);
        INSERT INTO ticket (id, flight_number, itinerary_id, status, seat_number) VALUES(1, 1, 1, "ACTIVE", "3E");
      `;
      db.connection.query(sql, () => done());
    });

    it("it should throw a 400 error where the ID is -1", done => {
      chai
        .request(server)
        .get("/online/tickets/itineraries")
        .query({ id: -1 })
        .end((error, result) => {
          result.should.have.status(400);
          result.body.should.be.a("object");
          result.body.should.have.property("status");
          result.body.should.have.property("message");
          done();
        });
    });
  });

  describe("/GET /tickets/itineraries?id=null", () => {
    before(done => {
      const sql = `
        INSERT INTO airport (id, name, street, city, state, country, postal_code) VALUES(1, "PDX", "5th street", "Portland", "Oregon", "US", "98661");
        INSERT INTO airport (id, name, street, city, state, country, postal_code) VALUES(2, "Seatac", "3rd Ave.", "Seattle", "Oregon", "US", "98661");
        INSERT INTO flight (id, dest, origin, capacity, price, arrival_date, departure_date) VALUES(1, 2, 1, 20, 50.0, "2019-11-06", "2019-11-07");
        INSERT INTO traveler (id, first_name, last_name, dob, phone, email, street, country, state, city, postal_code) VALUES(1, "Cyndie", "Nettleship", "2019-07-07", "602-138-8325", "cnettleship0@ifeng.com", "23 Loeprich Hill", "United States", "Arizona", "Phoenix", "85083");
        INSERT INTO travel_agency (id, name, phone, email, commission_rate) VALUES(1, "Browsetype", "148-229-1064", "locaine0@mayoclinic.com", 30);
        INSERT INTO user (id, email, password, role, agency_id, first_name, last_name, dob, phone, street, country, state, city, postal_code) VALUES(1, "vskitteral0@shinystat.com", "jtRQ3nKc84f", "COUNTER", null, "Vivien", "Skitteral", "2019-06-16", "901-361-6928", "6997 Ryan Street", "United States", "Tennessee", "Memphis", "38126");
        INSERT INTO itinerary (id, traveler_id, user_id, agency_id, price_total) VALUES(1, 1, 1, 1, 65.32);
        INSERT INTO ticket (id, flight_number, itinerary_id, status, seat_number) VALUES(1, 1, 1, "ACTIVE", "3E");
      `;
      db.connection.query(sql, () => done());
    });

    it("it should throw a 400 error where the ID is null", done => {
      chai
        .request(server)
        .get("/online/tickets/itineraries")
        .query({ id: null })
        .end((error, result) => {
          result.should.have.status(400);
          result.body.should.be.a("object");
          result.body.should.have.property("status");
          result.body.should.have.property("message");
          done();
        });
    });
  });
});
