const express = require("express");
const router = express.Router();
const Author = require("../models/author");

// all authors
router.get("/", async (req, res) => {
  let searchOptions = {};
  if (req.query.name !== null && req.query.name !== "") {
    searchOptions.name = new RegExp(req.query.name, "i");
  }
  try {
    const authors = await Author.find(searchOptions);
    res.render("authors/index", {
      authors,
      searchOptions: req.query,
    });
  } catch {
    res.render("/");
  }
});

// new author route
router.get("/new", (req, res) => {
  const author = new Author();
  res.render("authors/new", { author });
});

//create new author
router.post("/", async (req, res) => {
  const author = new Author({
    name: req.body.name,
  });
  try {
    const newAuthor = await author.save();
    //     // res.redirect(`authors/${newAuthor}`);
    res.redirect("authors");
  } catch {
    res.render("authors/new", {
      author: author,
      errorMessage: "Error creating Author",
    });
  }
});

router.get("/:id", (req, res) => {
  res.send("Show Author " + req.params.id);
});

router.get("/:id/edit", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    res.render("authors/edit", { author });
  } catch (err) {
    res.redirect("/authors");
  }
});

router.put("/:id", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    await author.save();
    res.redirect(`authors/${author}`);
    // res.redirect("authors");
  } catch {
    res.render("authors/new", {
      author: author,
      errorMessage: "Error creating Author",
    });
  }
});

router.delete("/:id", (req, res) => {
  res.send("Delete Author " + req.params.id);
});

module.exports = router;
