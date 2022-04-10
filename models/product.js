const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: false },
    images: { type: [String], required: true },
    // category: { type: mongoose.Types.ObjectId, required: true, ref: 'Category' }

});

module.exports = mongoose.model('Product', productSchema);
