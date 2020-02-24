"use strict";

process.env.NODE_ENV = "test";

const onlineController = require("../controller/onlineController");
const db = require("../dao/db");
const server = require("../index");

const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();

chai.use(chaiHttp);

describe("Itineraries", () => {
  afterEach(done => {
    const sql = `
  SET FOREIGN_KEY_CHECKS=0;
  TRUNCATE TABLE airport; TRUNCATE TABLE boarding_pass; TRUNCATE TABLE flight; TRUNCATE TABLE itinerary;
  TRUNCATE TABLE ticket; TRUNCATE TABLE traveler; TRUNCATE TABLE travel_agency; TRUNCATE TABLE user;
  SET FOREIGN_KEY_CHECKS=1;
`;
    db.connection.query(sql, () => done());
  });

  describe("/GET /itineraries", () => {
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

    it("it should get all itineraries for the user", done => {
      chai
        .request(server)
        .get("/online/itineraries")
        .end((error, result) => {
          result.should.have.status(200);
          result.body.should.be.a("array");
          result.body.length.should.be.eql(1);
          result.body[0].should.be.a("object");
          result.body[0].should.have.property("id");
          result.body[0].should.have.property("traveler_id");
          result.body[0].should.have.property("user_id");
          result.body[0].should.have.property("agency_id");
          result.body[0].should.have.property("price_total");
          result.body[0].should.have.property("date_created");
          done();
        });
    });
  });

  describe("/POST /itineraries", () => {
    before(done => {
      const sql = `
        INSERT INTO airport (id, name, street, city, state, country, postal_code) VALUES(1, "PDX", "5th street", "Portland", "Oregon", "US", "98661");
        INSERT INTO airport (id, name, street, city, state, country, postal_code) VALUES(2, "Seatac", "3rd Ave.", "Seattle", "Oregon", "US", "98661");
        INSERT INTO flight (id, dest, origin, capacity, price, arrival_date, departure_date) VALUES(1, 2, 1, 20, 50.0, "2019-11-06", "2019-11-07");
        INSERT INTO flight (id, dest, origin, capacity, price, arrival_date, departure_date) VALUES(2, 1, 2, 40, 50.0, "2019-11-06", "2019-11-07");
        INSERT INTO traveler (id, first_name, last_name, dob, phone, email, street, country, state, city, postal_code) VALUES(1, "Cyndie", "Nettleship", "2019-07-07", "602-138-8325", "cnettleship0@ifeng.com", "23 Loeprich Hill", "United States", "Arizona", "Phoenix", "85083");
        INSERT INTO travel_agency (id, name, phone, email, commission_rate) VALUES(1, "Browsetype", "148-229-1064", "locaine0@mayoclinic.com", 30);
        INSERT INTO user (id, email, password, role, agency_id, first_name, last_name, dob, phone, street, country, state, city, postal_code) VALUES(1, "vskitteral0@shinystat.com", "jtRQ3nKc84f", "COUNTER", null, "Vivien", "Skitteral", "2019-06-16", "901-361-6928", "6997 Ryan Street", "United States", "Tennessee", "Memphis", "38126");
      `;
      db.connection.query(sql, () => done());
    });

    const itinerary = {
      user_id: 1,
      agency_id: 1,
      traveler_id: 1,
      tickets: [
        { seat_number: "1a", flight_number: 1, price: 100 },
        { seat_number: "4b", flight_number: 2, price: 777 }
      ]
    };

    it("it should create a itinerary", done => {
      chai
        .request(server)
        .post("/online/itineraries")
        .send(itinerary)
        .end((error, result) => {
          result.should.have.status(201);
          result.body.should.be.a("object");
          result.body.should.have.property("id");
          done();
        });
    });
  });

  describe("/POST /itineraries", () => {
    before(done => {
      const sql = `
        INSERT INTO airport (id, name, street, city, state, country, postal_code) VALUES(1, "PDX", "5th street", "Portland", "Oregon", "US", "98661");
        INSERT INTO airport (id, name, street, city, state, country, postal_code) VALUES(2, "Seatac", "3rd Ave.", "Seattle", "Oregon", "US", "98661");
        INSERT INTO flight (id, dest, origin, capacity, price, arrival_date, departure_date) VALUES(1, 2, 1, 20, 50.0, "2019-11-06", "2019-11-07");
        INSERT INTO flight (id, dest, origin, capacity, price, arrival_date, departure_date) VALUES(2, 1, 2, 40, 50.0, "2019-11-06", "2019-11-07");
        INSERT INTO traveler (id, first_name, last_name, dob, phone, email, street, country, state, city, postal_code) VALUES(1, "Cyndie", "Nettleship", "2019-07-07", "602-138-8325", "cnettleship0@ifeng.com", "23 Loeprich Hill", "United States", "Arizona", "Phoenix", "85083");
        INSERT INTO travel_agency (id, name, phone, email, commission_rate) VALUES(1, "Browsetype", "148-229-1064", "locaine0@mayoclinic.com", 30);
        INSERT INTO user (id, email, password, role, agency_id, first_name, last_name, dob, phone, street, country, state, city, postal_code) VALUES(1, "vskitteral0@shinystat.com", "jtRQ3nKc84f", "COUNTER", null, "Vivien", "Skitteral", "2019-06-16", "901-361-6928", "6997 Ryan Street", "United States", "Tennessee", "Memphis", "38126");
      `;
      db.connection.query(sql, () => done());
    });

    const itinerary = {
      agency_id: 1,
      traveler_id: 1,
      tickets: [
        { seat_number: "1a", flight_number: 1, price: 100 },
        { seat_number: "4b", flight_number: 2, price: 777 }
      ]
    };

    it("it should throw an error do to user_id missing", done => {
      chai
        .request(server)
        .post("/online/itineraries")
        .send(itinerary)
        .end((error, result) => {
          result.should.have.status(400);
          result.body.should.be.a("object");
          result.body.should.have.property("status");
          result.body.should.have.property("message");
          done();
        });
    });
  });

  describe("/GET /itineraries/1", () => {
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

    it("it should get an itinerary  based ID which has value of 1", done => {
      chai
        .request(server)
        .get("/online/itineraries/1")
        .end((error, result) => {
          result.should.have.status(200);
          result.body.should.be.a("array");
          result.body.length.should.be.eql(1);
          result.body[0].should.be.a("object");
          result.body[0].should.have.property("id");
          result.body[0].should.have.property("traveler_id");
          result.body[0].should.have.property("user_id");
          result.body[0].should.have.property("agency_id");
          result.body[0].should.have.property("price_total");
          result.body[0].should.have.property("date_created");
          done();
        });
    });
  });

  describe("/GET /itineraries/-1", () => {
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

    it("it should throw a 400 error based on ID of  -1", done => {
      chai
        .request(server)
        .get("/online/itineraries/-1")
        .end((error, result) => {
          result.should.have.status(400);
          result.body.should.be.a("object");
          result.body.should.have.property("status");
          result.body.should.have.property("message");
          done();
        });
    });
  });

  describe("/DELETE /itineraries/1", () => {
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

    it("it should cancel tickets where the ID is 1", done => {
      chai
        .request(server)
        .delete("/online/itineraries/1")
        .end((error, result) => {
          result.should.have.status(204);
          done();
        });
    });
  });

  describe("/DELETE /itineraries/-1", () => {
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

    it("it should throw a 400 error based on ID of  -1", done => {
      chai
        .request(server)
        .delete("/online/itineraries/-1")
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
