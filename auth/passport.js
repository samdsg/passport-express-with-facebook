const localStrategy = require("passport-local").Strategy;
const facebookStrategy = require("passport-facebook");
const bcrypt = require("bcryptjs");

// Load User Model
const UserModel = require("../models/User");

module.exports = passport => {
  passport.use(
    new localStrategy(
      {
        usernameField: "email"
      },
      (email, password, done) => {
        UserModel.findOne({ email }).then(user => {
          if (!user) {
            return done(null, false, {
              message: "That email is not registered"
            });
          }

          // Compare password
          bcrypt.compare(password, user.password, (err, isFound) => {
            if (err) throw err;
            if (isFound) {
              return done(null, user);
            } else {
              return done(null, false, { message: "Your Password incorrect" });
            }
          });
        });
      }
    )
  );

  passport.use(
    new facebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP,
        clientSecret: process.env.FACEBOOK_SECRET,
        callbackURL: "/auth/facebook/callback",
        profileFields: ["emails", "name", "displayName"]
      },
      function(accessToken, refreshToken, profile, done) {
        const {
          _json: { email, first_name, last_name }
        } = profile;

        const userData = {
          email,
          name: first_name + " " + last_name,
          password: "okaygdfsfgsdfgsdfgafaewds"
        };

        User.findOne({ email: email }).then(user => {
          if (user) {
            return done(null, user);
          }

          // Hash user password
          const newUser = User({
            name: userData.name,
            email: userData.email,
            password: userData.password
          });

          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser
                .save()
                .then(user => {
                  req.flash("success_alert", "Signin is successful");
                  res.redirect("/dashboard");
                })
                .catch(err => console.log(err));
              return done(err, user);
            });
          });
        });
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    UserModel.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
