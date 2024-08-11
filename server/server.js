const express = require("express");
const session = require("express-session");
const path = require("path");
const cors = require("cors");
const app = express();
const port = 3001;

const sessionOption = require("./sessionOption");
const bodyParser = require("body-parser");

const dbRoutes = require("./DBRoutes");
app.use(express.static(path.join(__dirname, "/build")));
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var MySQLStore = require("express-mysql-session")(session);
var sessionStore = new MySQLStore(sessionOption);
app.use(
  session({
    key: "session_cookie_name",
    secret: "~",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use("/api", dbRoutes);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
