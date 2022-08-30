const mongoose = require("mongoose");
const HttpError = require("../models/http-error");
const User = require("../models/user-model");
const Relation = require("../models/relation-model");

// Find all registered users to be displayed as cards in frontend
const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}).select(["-password", "-email"]);
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }
  if (!users) {
    const error = new HttpError("No users foudnd", 404);
    return next(error);
  }
  res.status(201).json(users);
};

// Find relations for one user (using userId send in params), send back his pairs
const getRelations = async (req, res, next) => {
  const { userId } = req.params;

  let usersRelations;
  try {
    usersRelations = await Relation.findOne({ ofUser: userId });
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }

  if (!usersRelations) {
    return res.status(200).json({ message: "No relations" });
  }
  let userPairs;
  try {
    userPairs = await usersRelations.populate({
      path: "pairs",
      select: ["-password", "-email"],
    });
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }

  res.status(200).json(usersRelations.pairs);
};

// Two middlewares that check what happens after a like (post request).

// -First Middleware
const postLike = async (req, res, next) => {
  const { myId, hisId } = req.body; // Extracts 2 id from a request. One of user that liked: -myId-, second of liked user: -hisId-.
  let foundRelation;
  try {
    foundRelation = await Relation.findOne({ ofUser: myId });
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }

  if (!foundRelation) {
    // When no relation found for myId, creates new relation obiect in database, and adds hisId to likes list.
    const newRelation = new Relation({
      ofUser: myId,
      likes: hisId,
    });
    try {
      await newRelation.save();
    } catch (err) {
      const error = new HttpError("Something went wrong", 500);
      return next(error);
    }
    // res.status(201).json({ message: "Created" });
    next();
  } else {
    const alreadyLikes = foundRelation.likes.find((element) => {
      return element.toString() === hisId; // Checks if myId has liked hisId before
    });
    if (alreadyLikes) {
      // res.status(201).json({ message: "done" });
      next(); // If check is true request goes to next middleware
    } else {
      foundRelation.likes = [...foundRelation.likes, hisId]; // Else adds new field in myId likes.
      try {
        await foundRelation.save();
      } catch (err) {
        const error = new HttpError("Something went wrong", 500);
        return next(error);
      }
      // res.status(201).json({ message: "like added" });
      next(); //If like is added, request goes to next middleware
    }
  }
};

// -Second middleware
const postPairs = async (req, res, next) => {
  // If both ids form postLike middleware happen to match eachother in their likes field, creates new pair and saves both pair fields. Than sends last pair to frontend for a update.
  const { myId, hisId } = req.body;
  let myRelation; // relation of user with -myId-
  let foundRelation; // relation of user with -hisId-

  try {
    foundRelation = await Relation.findOne({ ofUser: hisId });
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }
  try {
    myRelation = await Relation.findOne({ ofUser: myId });
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }
  if (!foundRelation) {
    //If no relation for hisId was found match can`t happen
    return res.status(200).json({ message: "No match" });
  } else {
    const pairExists = myRelation.pairs.find((pair) => {
      return pair.toString() === hisId;
    });
    if (pairExists) {
      return 
    }
    const match = foundRelation.likes.find((element) => {
      return element.toString() === myId; // Checks if there is myId field in hisId likes
    });
    if (match) {
      foundRelation.pairs = [...foundRelation.pairs, myId];
      myRelation.pairs = [...myRelation.pairs, hisId]; //If check is true, updates both users pairs field
      try {
        const session = await mongoose.startSession(); //Starts seession that saves changes
        session.startTransaction();
        await foundRelation.save({ session: session });
        await myRelation.save({ session: session });
        await session.commitTransaction();
        session.endSession(); // and ends session.
      } catch (err) {
        const error = new HttpError("Something went wrong", 500);
        return next(error);
      }
      let pairs;
      try {
        await myRelation.populate({
          path: "pairs",
          select: ["-password", "-email"],
        }); //After session is succesful populates myId pairs with data required in forntend
        pairs = myRelation.pairs;
      } catch (err) {
        const error = new HttpError("Something went wrong", 500);
        return next(error);
      }

      res.status(200).json(pairs[pairs.length - 1]); // sends last pair (added in this middleware)
      next();
    } else {
      res.status(200).json({ message: "No match" }); //If check is false no match.
    }
  }
};

exports.getUsers = getUsers;
exports.getRelations = getRelations;
exports.postLike = postLike;
exports.postPairs = postPairs;
