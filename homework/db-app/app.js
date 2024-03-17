"use strict";
const express = require("express");
const dbConnection = require("./helper/postgres.js"); // PostgreSQL bağlantı modülü!!!
const amqp = require("amqplib/callback_api"); // RabbitMQ bağlantı modülü


const app = express();

dbConnection.connect((err, connection) => {
  if (err) {
    console.error("Database connection error:", err.stack);
  } else {
    console.log("Connected to PostgreSQL database");
  }
});

amqp.connect("amqp://rabbitmq", (err, conn) => { // RabbitMQ bağlantısı kurdum burada
  if (err) {
    console.error("RabbitMQ connection error:", err.stack);
  } else {
    console.log("Connected to RabbitMQ");
    
    conn.createChannel((err, channel) => {
      if (err) {
        console.error("RabbitMQ channel error:", err.stack);
      } else {
        const queue = "default-queue";
        
        channel.consume(queue, (msg) => {
          const receivedMessage = JSON.parse(msg.content.toString());
          console.log("Received message:", receivedMessage);
        
          const insertQuery = "INSERT INTO students (name, midterm_grade, final_grade, average) VALUES (?, ?, ?, ?)";
          const values = [
            receivedMessage.name,
            receivedMessage.midterm,
            receivedMessage.final,
            (parseInt(receivedMessage.midterm) + parseInt(receivedMessage.final)) / 2
          ];
        
          dbConnection.query(insertQuery, values, (err, results, fields) => {
            if (err) {
              console.log("Database query error: ", err);
            } else {
              console.log("Student data inserted successfully");
            }
          });
        
        }, {
          noAck: true
        });
      }
    });
  }
});

app.get("/students", (req, res) => {
  dbConnection.query("SELECT * FROM students", (err, results, fields) => {
    if (err) {
      console.log("Database query error: ", err);
    } else {
      res.status(200).json({
        status: "success",
        data: results,
      });
    }
  });
});

app.get("/students/:id", (req, res) => {
  dbConnection.query(
    "SELECT *, (midterm_grade + final_grade) / 2 AS average FROM students WHERE id = ?",
    [req.params.id],
    (err, results, fields) => {
      if (err) {
        console.log("Database query error: ", err);
      } else {
        res.status(200).json({
          status: "success",
          data: results,
        });
      }
    }
  );
});


app.post("/students/add", (req, res) => {
  const { name, midterm, final } = req.body;
  const average = (parseInt(midterm) + parseInt(final)) / 2;

  const insertQuery = "INSERT INTO students (name, midterm_grade, final_grade, average) VALUES (?, ?, ?, ?)";

  dbConnection.query(insertQuery, [name, midterm, final, average], (err, results, fields) => {
    if (err) {
      console.log("Database query error: ", err);
      res.status(500).json({
        status: "error",
        message: "Error inserting student data",
      });
    } else {
      console.log("Student data inserted successfully");
      res.status(201).json({
        status: "success",
        message: "Student data inserted successfully",
      });
    }
  });
});


app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
