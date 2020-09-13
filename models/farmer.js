const mongoose = require("mongoose");

const itemSchema = {
    slug: String,
}
const FarmerSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    
});

let Farmer = module.exports = mongoose.model('Farmer', FarmerSchema)