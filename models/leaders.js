const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);

const leaderSchema = new Schema({
    name: {
        type: String,
        require: true,
        unique: true
    },
    description: {
        type: String,
        require: true,
    },
    image: {
        type: String,
        require: true
    },
    designation: {
        type: String,
        require: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    abbr: {
        type: String,
        require: true
    }
},{
    timestamps: true
});

var Leaders = mongoose.model('leader', leaderSchema);

module.exports = Leaders;