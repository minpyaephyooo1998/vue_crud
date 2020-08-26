const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const key = require("../../config/keys").secret;
const User = require("../../model/User");

/**
 * @route Post api/user/register
 * @desc Register the user
 * @access Public
 */

router.post("/register", (req, res) => {
  let { name, username, email, password, confirm_password } = req.body;
  if (password !== confirm_password) {
    return res.status(400).json({
      msg: "Password do not match",
    });
  }

  //Check for the unique Username
  User.findOne({
    username: username,
  }).then((user) => {
    if (user) {
      return res.status(400).json({
        msg: "Username is already taken",
      });
    }
  });

  //Check for the unique Email
  User.findOne({
    email: email,
  }).then((user) => {
    if (user) {
      return res.status(400).json({
        msg: "Email is already use",
      });
    }
  });

  //The data is valid and new we can register the user
  let newUser = new User({
    name,
    username,
    password,
    email,
  });
  //console.log(newUser);
  //Hash the password
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      newUser.save().then((user) => {
        return res.status(201).json({
          success: true,
          msg: "User is now register",
        });
      });
    });
  });
});

/**
 * @route Post api/user/Login
 * @desc Login the user
 * @access Public
 */

router.post("/login", (req, res) => {
  User.findOne({
    username: req.body.username,
  }).then((user) => {
    if (!user) {
      return res.status(404).json({
        msg: "Username is not found!",
        success: false,
      });
    }

    //compare password
    bcrypt.compare(req.body.password, user.password).then((isMatch) => {
      if (isMatch) {
        // User password is correct and we need json token this users.
        const payload = {
          _id: user._id,
          username: user.username,
          name: user.name,
          email: user.email,
        };
        jwt.sign(payload, key, { expiresIn: 640800 }, (err, token) => {
          res.status(200).json({
            success: true,
            token: `Bearer ${token}`,
            user: user,
            msg: "You are logged in.",
          });
        });
      } else {
        return res.status(404).json({
          msg: "Incorrect password!",
          success: false,
        });
      }
    });
  });
});

/**
 * @route Get api/user/Profile
 * @desc Return the user data
 * @access Private
 */

router.get(
  "/profile",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    return res.json({
      user: req.user,
    });
  }
);

module.exports = router;
