const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const HttpError = require('./models/http-error')
const productsRoutes = require('./routes/products-routes');
const usersRoutes = require('./routes/users-routes');
const categorisRoutes = require('./routes/categories-routes');
const rollsRoutes = require('./routes/rolls-routes');

const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTION');
    res.header('Access-Control-Allow-Headers', 'Content-Type , Accept , Authorization , Origin , X-Requested-With' );

    next();
})

app.use('/products', productsRoutes);
app.use('/users', usersRoutes);
app.use('/categories', categorisRoutes);
app.use('/rolls', rollsRoutes);



app.use((req, res, next) => { //handle 404 errors
    throw new HttpError('Could not find this route.', 404);
})

app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500).json({ message: error.message || 'An unknown error occurred!' })

})
mongoose.connect('mongodb+srv://zahradb:iN7HDmrgLw7uiMbg@cluster0.gjaqs.mongodb.net/shop?retryWrites=true&w=majority')
    .then(() => {
        app.listen(5000);
        console.log('Connected...')
    })
    .catch(err => {
        console.log(err)
    })