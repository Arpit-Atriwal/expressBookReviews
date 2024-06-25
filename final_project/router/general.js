const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.query.username;
  const password = req.query.password;
  if (username && password) {
    if (!isValid(username)) {
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registred. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

const fetchBooksFromAPI = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Object.values(books));
    }, 100); // Simulated delay
  });
};

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  try {
    const fetchBooks = await fetchBooksFromAPI();
    res.json(fetchBooks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const fetchBooks = await fetchBooksFromAPI();

    const book = fetchBooks[isbn];

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  try {
    const author = req.params.author.toLowerCase();
    const fetchBooks = await fetchBooksFromAPI();

    const booksByAuthor = fetchBooks.filter(
      (book) => book.author.toLowerCase() === author
    );

    if (booksByAuthor.length === 0) {
      return res.status(404).json({ message: "No books found by this author" });
    }
    res.json(booksByAuthor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all books based on title
public_users.get("/title/:title", async function (req, res) {
  try {
    const title = req.params.title.toLowerCase();
    const fetchBooks = await fetchBooksFromAPI();
    const booksByTitle = fetchBooks.filter(
      (book) => book.title.toLowerCase() === title
    );

    if (booksByTitle.length === 0) {
      return res.status(404).json({ message: "No books found by this author" });
    }
    res.json(booksByTitle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  Get book review
public_users.get("/review/:isbn", async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const fetchBooks = await fetchBooksFromAPI();

    const book = fetchBooks[isbn];

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.json(book.reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports.general = public_users;
