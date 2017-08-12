/**
 * Created by 123 on 2017/6/20.
 */
var express= require("express");
var router= express.Router();
var Category=require("../models/Category");
var Content=require("../models/Content");

var data={};
router.use(function (req,res,next) {
    data={
        userInfo:req.userInfo,
        categories:[],
    }

    Category.find().then(function (categories) {
        data.categories=categories;
        next();

    })
});



router.get("/",function (req,res,next) {


        data.count=0


        data.category=req.query.category||"";
        data.page =Number(req.query.page || 1);
        data.limit = 10;
        data.pages=0;



    //是否发送了分类请求
    var where={};
    if(data.category){
        where.category=data.category;
    }

    //模板引擎绑定了views文件夹，只能在文件夹下查找文件
      Content.where(where).count().then(function (count) {
        data.count=count;
        data.pages = Math.ceil(data.count / data.limit);//计算总页数
        if (data.page > data.pages)data.page = data.pages;//取值不能超过pages
        if (data.page < 1)data.page = 1;//取值不能小于1
        var skip = (data.page - 1) * data.limit;

        return Content.where(where).find().sort({_id:-1}).limit(data.limit).skip(skip).populate( ["category","user"]).sort({addTime:-1})
    }).then(function (contents) {
        data.contents=contents;
        res.render("index",data);


    });

    return;
});
//访问文章内容
router.get("/view",function (req,res) {
    var contentId=req.query.contentid;
    Content.findOne({_id:contentId}).then(function (content) {


        data.content=content;
        content.views++;
        content.save();

        console.log(data);
        res.render("view",data)
    });


});
module.exports=router;
 
