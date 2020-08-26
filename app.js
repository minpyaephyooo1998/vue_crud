const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const passport = require("passport");
const PORT = 3000;

// initialize the app
const app = express();

//Use passport middleware secoond *****
app.use(passport.initialize());

//Bring in the Passport strategy
require("./config/passport")(passport);

//Middlewares
//Form data middleware
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

//Json body middlware
app.use(bodyParser.json());

//Cors middleware
app.use(cors());

//Setting up the static directory
app.use(express.static(path.join(__dirname, "public")));

// Bring in the database Config
const db = require("./config/keys").mongoURL;
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(`Database connect successfully ${db}`);
  })
  .catch((err) => {
    console.log(`Unable to database fail!!!${err}`);
  });

// Bring in the Users route
const users = require("./routes/api/users");

app.use("/api/users/", users);

app.get("/", (req, res) => {
  return res.send("<h1>Hello world</h1>");
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
