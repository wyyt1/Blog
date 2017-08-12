/**
 * Created by 123 on 2017/6/20.
 */
var express = require("express");
var router = express.Router();
var User=require("../models/User");//引入用户模型
var content=require("../models/Content");


var responseData = {};
router.use(function (req, res, next) {
    responseData = {
        code: 0,
        message: ""
    };
    next();
});


router.post("/user/register", function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;

    if (username == "") {
        responseData.code = 1;
        responseData.message = "用户名不能为空";
        res.json(responseData);
        return;
    }
    if (password == "") {
        responseData.code = 2;
        responseData.message = "密码不能为空";
        res.json(responseData);
        return;
    }
    if (repassword != password) {
        responseData.code = 3;
        responseData.message = "两次密码不一致";
        res.json(responseData);
        return;
    }
    User.findOne({
        username:username

    }).then(function (userInfo) {
        if(userInfo){
            responseData.code=4;
            responseData.message="用户名已经被注册了";
            res.json(responseData);
            return;
        }
        var user=new User({
            username:username,
            password:password,
        })
        return  user.save();
    }).then(function (newUserInfo) {
        responseData.message = "注册成功3秒后跳转登陆页面";
        res.json(responseData);
    });


});


router.post("/user/login", function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;


    if (username == "") {
        responseData.code = 1;
        responseData.message = "用户名不能为空";
        res.json(responseData);
        return;
    }
    if (password == "") {
        responseData.code = 2;
        responseData.message = "密码不能为空";
        res.json(responseData);
        return;
    }

    User.findOne({
        username:username,
        password:password

    }).then(function (userInfo) {
        if(!userInfo){
            responseData.code=2;
            responseData.message="用户名或密码错误";
            res.json(responseData);
            return;
        }
        responseData.message="登陆成功";
        responseData.userInfo={
          name:userInfo.username,
            _id:userInfo._id
        };
        //设置cookies
        req.cookies.set("userInfo",JSON.stringify({
            name:userInfo.username,
            _id:userInfo._id
        }));
        res.json(responseData);
        return;



    })


});
//退出
router.get("/user/logout",function (req,res,next) {
    req.cookies.set("userInfo",null);
    res.json(responseData)
});

router.get("/comment",function (req,res) {
   var contentId=req.query.contentid||"";
    content.findOne({_id:contentId}).then(function (content) {
        res.json(content);
    })
});

//提交评论
router.post("/comment/post",function (req,res) {
    var contentId=req.body.contentid||"";
    var postData={
        username:req.userInfo.name,
        postTime:new Date(),
        content:req.body.content
    };

    //查询当前内容信息
    content.findOne({_id:contentId}).then(function (content) {
        content.comment.push(postData);
        return content.save();
    }).then(function (newContent) {
        responseData.message="评论成功";
        responseData.commentData=newContent;

        console.log(postData);
        res.json(responseData);

    })
});


module.exports = router;