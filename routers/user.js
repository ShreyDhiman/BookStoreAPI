const express = require('express');
const { User } = require("../modules/user");
const router = new express.Router()
const auth = require('../middleware/auth')


// Creating Users
router.post("/user", async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.authToken()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
});

// user login
router.post('/user/login', async (req, res) => {
    try {
        const user = await User.findByCred(req.body.email, req.body.password)
        const token = await user.authToken()
        res.send({user, token})
    } catch (e) {
        res.status(400).send("No user found")
    }
})

// user Logout
router.post('/user/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send('Logged Out!')
    } catch (e) {
        res.status(500).send()
    }
})

// logging out all sessions
router.post('/user/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.status(200).send("All session logged out!")
    } catch (e) {
        res.status(500).send()
    }
})

// Listing User
router.get("/user", auth, async (req, res) => {
    if(req.user.admin){
        try {
            const user = await User.find({})
            if(!user)
            {
                res.send("No user found")
            }
            res.send(user)
        } catch (e) {
            res.status(500).send()
        }
    } else{
        res.status(200).send(req.user)
    }
})

// user updating own id
router.patch('/user/me/', auth, async(req, res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'invalid updates' })
    }
    try {
        updates.forEach((update)=> req.user[update] = req.body[update])
        await req.user.save()
        res.status(201).send(req.user)
    } catch (e) {
        res.status(500).send('unable to update')
    }  
})


// Updating Users
router.patch('/user/:email', auth, async (req, res) => {
    if(!req.user.admin){
        res.send("You are not authorised")
    }
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'invalid updates' })
    }
    try {
        const user = await User.findOne({ email: req.params.email })

        updates.forEach((update) => user[update] = req.body[update])

        await user.save()

        if (!user) {
            return res.status(404).send()
        }
        res.send(user)
    } catch (e) {
        res.status(400).send()
    }
})

// user deleting own id
router.delete('/user/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.status(201).send(req.user.name + "\'s Account deleted successfully! ")
    } catch (e) {
        res.status(500).send()
    }
})

//Admin deleting Users
router.delete('/user/:email', auth, async (req, res) => {
    if(!req.user.admin){
        res.send("You are not authorised")
    }
    try {
        const user = await User.findOneAndDelete({ email: req.params.email })
        if (!user) {
            res.status(404).send("No user found")
        }
        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router