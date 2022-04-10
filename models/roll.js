const mongoose = require('mongoose');

const rollSchema = new mongoose.Schema({

    name: { type: String, required: true },
    users: [{ type: mongoose.Types.ObjectId, required: true, ref: 'User' }]


});

module.exports = mongoose.model('Roll', rollSchema);
