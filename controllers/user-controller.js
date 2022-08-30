const { validationResult } = require("express-validator");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");
const User = require("../models/user-model");

//Code for login users in, jwt used for authentication

const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Invalid input passed, please check your inputs",
      422
    );
    return next(error);
  }
  const { email, password } = req.body;

  let foundUser;
  try {
    foundUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }
  if (!foundUser) {
    const error = new HttpError("Email or password invalid!", 401);
    return next(error);
  }
  let passwordIsValid = false;
  try {
    passwordIsValid = await bcrypt.compare(password, foundUser.password);
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }
  if (!passwordIsValid) {
    const error = new HttpError("Email or password invalid!", 500);
    return next(error);
  }
  let token;
  try {
    token = await jwt.sign(
      { userId: foundUser.id, email: foundUser.email, name: foundUser.name },
      "MySecretDontShare!",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Could not create user", 500);
    return next(error);
  }
  res.status(201).json({
    userName: foundUser.name,
    userId: foundUser.id,
    token: token,
    imageUrl: foundUser.imageUrl,
    description: foundUser.description,
  });
};

//Code to signUp new users

const signup = async (req, res, next) => {
  console.log(req.file);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Invalid input passed, please check your inputs",
      422
    );
    return next(error);
  }
  const { user, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.find({ email: email });
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }
  if (existingUser.length > 0) {
    const error = new HttpError("User exists already", 409);
    return next(error);
  }
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("Could not create user", 500);
    return next(error);
  }

  const createdUser = new User({
    name: user,
    email: email,
    password: hashedPassword,
    imageUrl: "http://localhost:5000/" + req.file.path,
  });
  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Could not create user", 500);
    return next(error);
  }

  let token;
  try {
    token = await jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      "MySecretDontShare!",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }

  res.status(201).json({
    userName: createdUser.name,
    userId: createdUser.id,
    token: token,
    imageUrl: createdUser.imageUrl,
  });
};

exports.login = login;
exports.signup = signup;
