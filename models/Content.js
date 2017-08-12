/**
 * Created by 123 on 2017/6/21.
 */
var mongoose=require("mongoose");
var contentSchema=require("../schemas/content.js");

module.exports=mongoose.model("Content",contentSchema);