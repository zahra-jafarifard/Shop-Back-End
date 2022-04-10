const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    name: { type: String, required: true },
    family: { type: String, required: true },
    mobile: { type: Number, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    rollId: { type: mongoose.Types.ObjectId, required: true, ref: 'Roll' },
    products: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Product' }]

});

module.exports = mongoose.model('User', userSchema);
