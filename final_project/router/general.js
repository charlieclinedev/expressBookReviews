const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

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
public_users.get('/', function (req, res) {
    return res.send(JSON.stringify(books, null, 4));
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const response = await axios.get('https://localhost:5000/');
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching book list", error: error.message});
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const book_index = req.params.isbn;
    if (books[book_index]) {
        return res.send(JSON.stringify(books[book_index], null, 4));
    }
    else {
        return res.status(404).json({message: `Book with ISBN ${book_index} not found.`});
    }
 });

 public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    const promise = new Promise((resolve, reject) => {
        axios.get(`https://localhost:5000/isbn/${isbn}`)
        .then(response => resolve(response.data))
        .catch(error => reject(error));
    })

    promise
    .then(data => res.status(200).json(data))
    .catch(error => res.status(404).json({message: `Book with ISBN ${isbn} not found.`, error: error.message}))
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const out_books = Object.fromEntries(
        Object.entries(books).filter(([key, value]) => {
            return (value.author === req.params.author);
        }));
    return res.send(JSON.stringify(out_books, null, 4));
});

public_users.get('/author/:author', async function (req, res) {
    try {
        const response = await axios.get(`https://localhost:5000/author/${encodeURIComponent(author)}`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(404).json({ message: "Author not found", error: error.message});
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const out_books = Object.fromEntries(
        Object.entries(books).filter(([key, value]) => {
            return (value.title === req.params.title);
        }));
    return res.send(JSON.stringify(out_books, null, 4));
});

public_users.get('/title/:title', async function (req, res) {
    try {
        const response = await axios.get(`https://localhost:5000/title/${encodeURIComponent(title)}`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(404).json({ message: "Title not found", error: error.message});
    }
})

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    let book_index = parseInt(req.params.isbn, 10);
    if (books[book_index]) {
        return res.send(books[book_index].reviews);
    }
    else {
        return res.status(404).json({message: `Book with ISBN ${book_index} not found.`});
    }
});

module.exports.general = public_users;
