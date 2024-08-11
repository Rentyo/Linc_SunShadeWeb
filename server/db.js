var mysql = require("mysql2");
var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "softlettuce",
});
db.connect();

module.exports = db;
