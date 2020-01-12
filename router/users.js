const express = require("express");
const router = express.Router();
const bycrypt = require("bcryptjs");
const passport = require("passport");

/* Session middleware */
const { isLoggedIn, LoggedIn } = require("../auth/forceinout");

/* User Model */
const User = require("../models/User");

router.get("/login", LoggedIn, (req, res) => {
  res.render("login");
});

router.post("/login", (req, res, next) => {
  const { email, password } = req.body;
  let errors = [];

  if (!email || !password) {
    errors.push({
      msg: "Sorry fill all credentials"
    });
  }

  if (errors.length > 0) {
    res.render("login", {
      errors,
      email,
      password
    });
  } else {
    passport.authenticate("local", {
      successRedirect: "/dashboard",
      failureRedirect: "/users/login",
      failureFlash: true
    })(req, res, next);
  }
});

router.get("/register", LoggedIn, (req, res) => {
  res.render("register");
});

/* Register Post Request*/
router.post("/register", (req, res) => {
  const { name, email, password, cpassword } = req.body;

  let errors = [];

  if (!name || !email || !password || !cpassword) {
    errors.push({
      msg: "Sorry Fill all the input"
    });
  }

  if (password != cpassword) {
    errors.push({
      msg: "Password must be the same"
    });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      cpassword
    });
  } else {
    User.findOne({ email }).then(user => {
      if (user) {
        errors.push({
          msg: "Email already exists"
        });
        res.render("register", {
          errors,
          name,
          email,
          password,
          cpassword
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });

        bycrypt.genSalt(10, (err, salt) => {
          bycrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;

            newUser
              .save()
              .then(user => {
                req.flash("success_alert", "Signin is successful");
                res.redirect("/users/login");
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

module.exports = router;
