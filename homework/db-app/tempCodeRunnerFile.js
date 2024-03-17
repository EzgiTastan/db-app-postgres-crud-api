app.get("/students/:id", (req, res) => {
  dbConnection.query(
    "SELECT * FROM students WHERE id = ?",
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