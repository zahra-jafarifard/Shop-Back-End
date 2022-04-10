const mongoose = require('mongoose');
const product = require('./product');

const categorySchema = new mongoose.Schema({

    name: { type: String, required: true },
    parentId: { type: mongoose.Types.ObjectId, required: true, ref: 'Category' },
    products: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Product' }],

});

module.exports = mongoose.model('Category', categorySchema);
