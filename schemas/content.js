/**
 * Created by 123 on 2017/6/27.
 */
var mongoose=require("mongoose");
//内容的表结构
module.exports =new mongoose.Schema({
    //关联字段-分类id
    category:{
        //类型
        type:mongoose.Schema.Types.ObjectId,
        //引用-模型首字母大写
        ref:"Category"
    },

    //关联字段-用户
    user:{
        //类型
        type:mongoose.Schema.Types.ObjectId,
        //引用-模型首字母大写
        ref:"User"
    },

    //添加时间
    addTime:{
        type:Date,
        default:new Date()
    },

    //阅读量
    views:{
        type:Number,
        default:0
    },


    //内容标题
    title:String,
    //简介
    description:{
        type:String,
        default:""
    },

    content:{
        type:String,
        default:""
    },

    comment:{
        type:Array,
        default:[]
    }
});
