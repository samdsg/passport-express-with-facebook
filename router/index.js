const express = require("express");
const router = express.Router();
const passport = require("passport");

/* Session middleware */
const { isLoggedIn, LoggedIn } = require("../auth/forceinout");

// Index Page
router.get("/", (req, res) => res.render("index"));

router.get("/dashboard", isLoggedIn, (req, res) => {
  res.render("dashboard", {
    user: req.user
  });
});

router.get("/logout", LoggedIn, (req, res) => {
  req.logout();
  req.flash("success_alert", "We will miss you");
  res.redirect("/users/login");
});

/* facebook login */
router.get(
  "/facebook",
  passport.authenticate("facebook"),
  passport.authorize("facebook", { scope: ["email"] }),
  LoggedIn
);

router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/dashboard",
    failureRedirect: "/login"
  }),
  LoggedIn
);

module.exports = router;
