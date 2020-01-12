module.exports = {
  isLoggedIn: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }

    req.flash("error_alert", "You must login to view this page");
    res.redirect("/uses/login");
  },
  LoggedIn: (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect("/dashboard");
  }
};
