const express = require('express');
const bodyParser = require('body-parser');

const productsRoutes = require('./routes/products-routes');
const usersRoutes = require('./routes/users-routes');

const app = express();
app.use(bodyParser.json());

app.use('/products', productsRoutes);
app.use('/users', usersRoutes);

app.listen(3000);