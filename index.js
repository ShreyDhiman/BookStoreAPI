const express = require("express");
const mongoose = require('mongoose');
const userRouter = require('./routers/user')
const bookRouter = require('./routers/book')

mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api')

const app = express();
const port = process.env.PORT || 3000

app.use(express.json())
app.use(userRouter)
app.use(bookRouter)

app.listen(port, () => {
   console.log(`Server is running on PORT: ${port}`);
});