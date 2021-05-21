process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");

let book_isbn;

beforeEach(async () => {
    let results = await db.query(
        `INSERT INTO books 
        (isbn, amazon_url, author, language, pages, publisher, title, year)
        VALUES(
            '123456789',
            'https://amazon.com/gameofthrones',
            'GRRM',
            'English',
            45689,
            'The Long Night',
            'Game of Thrones',
            1999)
            RETURNING isbn`);
    book_isbn = results.rows[0].isbn
});


describe("POST /books", async function () {
    test("Creates a new book", async function () {
        const response = await request(app)
            .post(`/books`)
            .send({
                isbn: '12345678',
                amazon_url: "https://amazon.com",
                author: "JKR",
                language: "english",
                pages: 500,
                publisher: "Hoggworth",
                title: "Harry Potter",
                year: 2000
            });
        expect(response.statusCode).toBe(201);
        expect(response.body.book).toHaveProperty("isbn");
    });
});


describe("GET /books", async function () {
    test("Gets a list of all books", async function () {
        const response = await request(app).get(`/books`);
        const books = response.body.books;
        expect(books).toHaveLength(1);
        expect(books[0]).toHaveProperty("isbn");
    });
});


describe("GET /books/:isbn", async function () {
    test("Gets a single book", async function () {
        const response = await request(app).get(`/books/${book_isbn}`);
        expect(response.body.book).toHaveProperty("isbn");
        expect(response.body.book.isbn).toBe(book_isbn);
    });
});

describe("PUT /books/:id", async function () {
    test("Updates a single book", async function () {
        const response = await request(app)
            .put(`/books/${book_isbn}`)
            .send({
                amazon_url: "https://amazon.com",
                author: "Eyad",
                language: "english",
                pages: 799,
                publisher: "New York Publishing",
                title: "New book title",
                year: 2001
            });
        expect(response.body.book).toHaveProperty("isbn");
        expect(response.body.book.title).toBe("New book title");
    });
});

describe("DELETE /books/:id", async function () {
    test("Deletes a single book", async function () {
        const response = await request(app).delete(`/books/${book_isbn}`);
        expect(response.body).tpEqual({ message: "Book deleted" });
    });
});

afterEach(async function() {
    await db.query("DELETE FROM BOOKS");
});

afterAll(async function() {
    await db.end();
});