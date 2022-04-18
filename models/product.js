const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: String },
    category: { type: mongoose.Types.ObjectId,  ref: 'Category' },
    createdByUserId: { type: mongoose.Types.ObjectId, ref: 'User' }

});

module.exports = mongoose.model('Product', productSchema);
