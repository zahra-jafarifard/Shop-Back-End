const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({

    name: { type: String, required: true },
    // parentId: { type: String, ref: 'Category' },
    parentId: { type: mongoose.Types.ObjectId, ref: 'Category' },
    products: [{ type: mongoose.Types.ObjectId,  ref: 'Product' }],

});

module.exports = mongoose.model('Category', categorySchema);
