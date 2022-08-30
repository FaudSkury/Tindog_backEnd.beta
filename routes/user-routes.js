const express = require("express");
const { body } = require("express-validator");
const fileUpload = require("../middleware/file-upload");
const userController = require("../controllers/user-controller");

const Router = express.Router();
Router.post(
  "/login",
  body("email").normalizeEmail().isEmail(),
  body("password").not().isEmpty(),
  userController.login
);
Router.post(
  "/signup",
  fileUpload.single("image"),
  body("email").normalizeEmail().isEmail(),
  body("user").not().isEmpty().isLength({ min: 4 }),
  body("password").isLength({ min: 6 }),
  userController.signup
);

module.exports = Router;
