const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

async function getBookList() {
    return JSON.stringify(books, null, 4);
}

async function getBookInfo(isbn) {
    if (books[isbn]) {
        return JSON.stringify(books[isbn]);
    }
    else {
        return `{ "message": "isbn not found" }`
    }
}

// Check if a user with the given username already exists
const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    const bookList = await getBookList()
    return res.send(bookList);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    const bookInfo = await getBookInfo(req.params.isbn);
    return res.send(bookInfo);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const out_books = Object.fromEntries(
        Object.entries(books).filter(([key, value]) => {
            return (value.author === req.params.author);
        }));
    return res.send(JSON.stringify(out_books, null, 4));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const out_books = Object.fromEntries(
        Object.entries(books).filter(([key, value]) => {
            return (value.title === req.params.title);
        }));
    return res.send(JSON.stringify(out_books, null, 4));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    let book_index = parseInt(req.params.isbn, 10);
    if (books[book_index]) {
        if (Object.keys(books[book_index].reviews).length > 0) {
            return res.send(books[book_index].reviews);
        }
        else {
            return res.status(300).json({message: "No reviews yet"});
        }
    }
    else {
        return res.status(300).json({message: "ISBN not found"});
    }
});

module.exports.general = public_users;
