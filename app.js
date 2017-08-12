/**
 * Created by 123 on 2017/6/19.
 */

var mongoose=require("mongoose");//数据库
var bodyparser=require("body-parser");//请求内容参数解析
var express=require("express");//核心框架
var swig=require("swig");//模板引擎
var Cookies=require("cookies");//cookies模块
var User=require("./models/User");//引入用户模型
var app= express ();

var port=80;
var host="172.17.218.178";

//设置静态文件自动响应
app.use("/public",express.static(__dirname+"/public"));
//设置模板引擎
app.engine("html",swig.renderFile);
//设置模板引擎存放目录第一个参数必须是views,第二个参数是目录
app.set("views","./views");
//设置
app.set("view engine","html");

//解析post请求参数
app.use(bodyparser.urlencoded({extended:true}));

swig.setDefaults({
    cache:false
});



//连接数据库、监听端口
mongoose.connect("mongodb://localhost:27017/blog",function (err) {
    if(err){
        console.log("连接数据库失败")
    }else {
        console.log("连接数据库成功")
        app.listen(port,host);
    }
});
//设置cookies
app.use(function (req,res,next) {
    req.cookies =new Cookies(req,res);

    req.userInfo={};
    if(req.cookies.get("userInfo")){
       try{
           //获取cookies存到userInfo
           req.userInfo=JSON.parse(req.cookies.get("userInfo"))
           //获取当前登录用户的类型，是否是管理员
           User.findById(req.userInfo._id).then(function (userInfo) {
               req.userInfo.isAdmin=userInfo.isAdmin;
               
               next();
           })
       }catch (e){
           next();
       }
    }else {
        next();
    }

});



//路由
app.use("/admin",require("./routers/admin"));
app.use("/api",require("./routers/api"));
app.use("/",require("./routers/main.js"));


