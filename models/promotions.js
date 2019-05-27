const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const promoSchema = new Schema({
    name: {
        type: String,
        require: true,
        unique: true
    },
    image: {
        type: String,
        require: true,
    },
    label: {
        type: String,
        default: ''
    },
    description: {
        type:String,
        require: true
    },
    price: {
        type: Currency,
        require: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
});

var Promotions = mongoose.model('Promotion', promoSchema);

module.exports = Promotions;