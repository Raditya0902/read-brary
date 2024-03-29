const express = require("express");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
const router = express.Router();
const Book = require("../models/book");
const Author = require("../models/author");
// const uploadPath = path.join("public", Book.coverImageBasePath);

const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];

// const storage = multer.diskStorage({
//   destination: uploadPath,
// });

// const fileFilter = (req, file, cb) => {
//   // Check if the file is an image.
//   if (!file.mimetype.startsWith("image/")) {
//     return cb(new Error("Only images are allowed."), false);
//   }
//   cb(null, true);
// };

// const upload = multer({
//   storage,
//   fileFilter,
// });

// all books
router.get("/", async (req, res) => {
  let query = Book.find();
  if (req.query.title != null && req.query.title != "") {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != "") {
    query = query.lte("publishDate", req.query.publishedBefore);
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != "") {
    query = query.gte("publishDate", req.query.publishedAfter);
  }
  try {
    const books = await query.exec();
    res.render("books/index", {
      books,
      searchOptions: req.query,
    });
  } catch {
    res.redirect("/");
  }
});

// new book route
router.get("/new", async (req, res) => {
  renderNewPage(res, new Book());
});

//create new book
// upload.single("cover")
router.post("/", async (req, res) => {
  // const fileName = req.file != null ? req.file.filename : null;
  // console.log(fileName);
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    // coverImageName: fileName,
    description: req.body.description,
  });

  saveCover(book, req.body.cover);

  try {
    const newBook = await book.save();
    // console.log(newBook);
    // res.redirect(`books/${newBook.id}`);
    res.redirect("books");
  } catch (err) {
    // console.log(err);
    // if (book.coverImageName != null) {
    //   removeBookCover(book.coverImageName);
    // }
    renderNewPage(res, book, true);
  }
});

async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors,
      book,
    };
    if (hasError) params.errorMessage = "Error creating book.";
    res.render("books/new", params);
  } catch {
    res.redirect("/books");
  }
}

// function removeBookCover(fileName) {
//   fs.unlink(path.join(uploadPath, fileName), (err) =>{
//     if (err) console.error(err);
//   });
// }

function saveCover(book, coverEncoded) {
  if (coverEncoded === null) return;
  const cover = JSON.parse(coverEncoded);
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, "base64");
    book.coverImageType = cover.type;
  }
}

module.exports = router;
