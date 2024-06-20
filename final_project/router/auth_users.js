const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.query.username;
  const password = req.query.password;
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  try {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization.username;

    if (!username) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    let userReviewExists = false;
    for (let reviewId in book.reviews) {
      if (book.reviews[reviewId].username === username) {
        book.reviews[reviewId].content = review;
        userReviewExists = true;
        break;
      }
    }

    if (!userReviewExists) {
      const reviewId = Date.now().toString();
      book.reviews[reviewId] = { content: review, username };
    }

    res.json({ message: "Review added/updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  try {
    const isbn = req.params.isbn;
    const username = req.session.username;

    if (!username) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    let userReviewDeleted = false;
    for (let reviewId in book.reviews) {
      if (book.reviews[reviewId].username === username) {
        delete book.reviews[reviewId];
        userReviewDeleted = true;
        break;
      }
    }

    if (!userReviewDeleted) {
      return res.status(404).json({
        message:
          "Review not found or you do not have permission to delete this review",
      });
    }

    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
