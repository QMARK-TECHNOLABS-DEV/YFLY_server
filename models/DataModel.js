const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, unique: true },
    list: {
        type: [
            {
              label:{type: String, trim: true}
            }
        ],
        default: []
    }
})

const Data = mongoose.model("Data", dataSchema);

module.exports = Data;