/**
 * Created by 123 on 2017/6/21.
 */
var mongoose=require("mongoose");
var categorySchema=require("../schemas/category.js");

module.exports=mongoose.model("Category",categorySchema);