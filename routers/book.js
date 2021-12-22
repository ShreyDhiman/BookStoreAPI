const express = require('express')
const { Book } = require("../modules/user");
const router = new express.Router()
const auth = require('../middleware/auth')

// adding book
router.post("/book", auth, async (req, res) => {

    const book = new Book({
        ...req.body,
        owner: req.user.email
    })

    try {
        await book.save()
        res.status(201).send(book)
    } catch (e) {
        res.status(400).send(e)
    }
})


// User's book
router.get("/book", auth, async (req, res) => {
    if (req.user.admin) {
        try {
            const book = await Book.find({})
            res.send(book)
        } catch (e) {
            res.status(500).send()
        }
    } else {
        try {
            const book = await Book.find({ owner: req.user.email })
            
            res.send(book)
        } catch (e) {
            res.status(500).send()
        }
    }
})

// user updating book
router.patch('/book/me/:id', auth, async (req, res) => {
    const update = Object.keys(req.body)
    const allowedUpdates = ['BookName', 'author', 'PublishedOn', 'Genre', 'Pages']
    const isValidOperation = update.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ error: 'In valid update' })
    }
    try {
        var temp = await Book.find({owner: req.user.email});
        const book = temp[0];
        if (!book) {
            return res.status(404).send("hello")
        }
        update.forEach(
            (update) => book[update] = req.body[update]
        )
        await book.save()

        res.send(book)
    } catch (e) {
        res.status(400).send("Try again")
    }
})

// updateing Books
router.patch('/book/:id', auth, async (req, res) => {
    if (!req.user.admin) {
        res.send("You are not authorised")
    }
    const update = Object.keys(req.body)
    const allowedUpdates = ['BookName', 'author', 'PublishedOn', 'Genre', 'Pages']
    const isValidOperation = update.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'In valid update' })
    }
    try {
        const book = await Book.findById(req.params.id)

        if (!book) {
            return res.status(404).send()
        }
        update.forEach((update) => book[update] = req.body[update])
        await book.save()
        res.send(book)
    } catch (e) {
        res.status(400).send()
    }
})

// User deleting book
router.delete('/book/me/:id', auth, async (req, res) => {
    if (req.user.admin) {
        try {
            if (!book) {
                res.status(404).send()
            }
            const book = await Book.findByIdAndDelete(req.params.id)
            res.status(201).send(book.BookName + " deleted successfully! ")
        } catch (e) {
            res.status(500).send()
        }
    } else {
        try {

            const book = await Book.findByIdAndRemove(req.params.id);
            res.status(201).send(book.BookName + " deleted successfully! ")

        } catch (e) {
            res.status(500).send("not authorised")
        }
    }
})

module.exports = router