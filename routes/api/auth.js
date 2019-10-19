const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcryptjs");

// express validator
const { check, validationResult } = require("express-validator");

// middleware
const auth = require("../../middleware/auth");

// @route GET api/auth
//@desc Test route
//@access Public
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id) //finds user using id value from jsonwebtoken
      .select("-password"); // leaves out password
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

//@route POST api/auth
//@desc Authenticate user and get token
//@access Public
router.post(
  "/",
  // checks
  [
    check("email", "please inclunde a valid email").isEmail(),
    check("password", "Password is required").exists()
  ],
  async (req, res) => {
    // 'validationResult' contains the result of the 'checks'
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // de-construct json data sent in request
    const { email, password } = req.body;

    try {
      // See if the user exists and assign to variable
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      // compare passwords to ensure match
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      // Return jsonwebtoken (enables user to access protected routes). Set user id of token to mongodb id
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
