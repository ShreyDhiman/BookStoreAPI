const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// // For User
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trin: true
    },
    email: {
        type: String,
        index: { unique: true },
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email')
            }
        }
    },
    password: {
        type: String,
        require: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        },
    },
    admin: {
        type: Boolean,
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})


// // Token creation
userSchema.methods.authToken = async function () {
    const user = this
    const token = jwt.sign({ email: user.email }, 'mynewcode')

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

// // Custom FindBy for Login
userSchema.statics.findByCred = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        res.send("no user found")
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

//  hidiing private data
userSchema.methods.toJSON = function () {

    const userObject = this.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

// pass hashing
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

// Delete the books when user is deleted
userSchema.pre('remove', async function (next) {
    await Book.deleteMany({owner: this.email})

    next()
})

const User = mongoose.model('User', userSchema)

// // For Books

const bookSchema = new mongoose.Schema({

    BookName: {
        type: String,
        trim: true,
        required: true
    },
    author: {
        trim: true,
        type: String
    },
    PublishedOn: {
        type: String,
        trim: true
    },
    Genre: {
        type: String,
        trim: true
    },
    Pages: {
        type: Number,
        min: 10
    },
    owner: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
})

const Book = mongoose.model('Book', bookSchema)

module.exports = {
    User: User,
    Book: Book
}