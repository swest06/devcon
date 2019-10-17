const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

// User model
const User = require("../../models/user");

//@route POST api/users
//@desc Register user route
//@access Public

router.post(
  "/",
  [
    check("name", "Name is required")
      .not()
      .isEmpty(),
    check("email", "please inclunde a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // de-construct json data sent in request
    const { name, email, password } = req.body;

    try {
      // See if the user exists
      let user = await User.findOne({ email });

      if (user) {
        res.status(400).json({ errors: [{ msg: "User already exists" }] });
      }
      // Get user's gravatar
      // Encrypt password(bcrypt)
      // Return jsonwebtoken
      res.send("users route");
    } catch (error) {}
    console.error(error.message);
    res.status(500).send("Server error");
  }
);

module.exports = router;
