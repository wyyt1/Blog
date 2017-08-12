/**
 * Created by 123 on 2017/6/21.
 */
var mongoose=require("mongoose");
var usersSchema=require("../schemas/users.js");

module.exports=mongoose.model("User",usersSchema);