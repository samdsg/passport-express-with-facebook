const express = require("express");
const dotenv = require("dotenv");
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");
const mongoose = require("mongoose");
const https = require("https");
const fs = require("fs");
const expressLayouts = require("express-ejs-layouts");

const app = express();



// Certificate Setup
const key = fs.readFileSync("./config/certkey/privateKey.key");
const cert = fs.readFileSync("./config/certkey/certificate.crt");

// Load env 
dotenv.config({ path: "./config.env" });

// Passport initialize 
require('./auth/passport')(passport);

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to mongoDB
mongoose
  .connect(db, {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log(`Mongo DB is connected`))
  .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set("view engine", "ejs");

// Express Body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);

// Passport middlewares
app.use(passport.initialize());
app.use(passport.session());

// Connect Flash
app.use(flash());

// Server Port
const PORT = process.env.PORT || 9000;

let Server;

if (process.env.NODE_ENV === "development") {
  Server = https.createServer({ key: key, cert: cert }, app);
} else {
  Server = app;
}

// Global variables
app.use((req, res, next) => {
  res.locals.success_alert = req.flash("success_alert");
  res.locals.error_alert = req.flash("error_alert");
  res.locals.error = req.flash("error");
  next();
});

// Routes
app.use("/", require("./router/index"));
app.use("/users", require("./router/users"));

Server.listen(PORT, () => {
  console.log(`Server runing at ${process.env.NODE_ENV} mode on port ${PORT}`);
});
