const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({

    mobile: { type: String, required: true },
    password: { type: String, required: true },

});

module.exports = mongoose.model('Clients', clientSchema);
