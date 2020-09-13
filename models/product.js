const mongoose=require("mongoose");

const ProductSchema = mongoose.Schema({
title:{
    type:String,
    required:true
},
slug:{
    type:String,
    
},
desc:{
    type:String,
    required:true
},
price:{
    type:Number,
    required:true
},
category:{
    type:String,
    required:true
},
image:{
    type:String
},
username:{
    type:String
},
qty:{
    type:Number
}

});

let Product =module.exports=mongoose.model('Product',ProductSchema)