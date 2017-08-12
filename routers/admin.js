/**
 * Created by 123 on 2017/6/20.
 */
var express = require("express");
var User = require("../models/User");
var Category = require("../models/Category");
var Content=require("../models/Content");
var router = express.Router();


router.use(function (req, res, next) {
    if (!req.userInfo.isAdmin) {
        //如果当前用户是非管理员
        res.send("只有管理员才能进入后台");
        return;
    }
    next()
});
//管理首页
router.get("/", function (req, res, next) {
    res.render("./admin/index", {
        userInfo: req.userInfo,
    });

});
//用户管理
router.get("/user", function (req, res, next) {
    var page = Number(req.query.page || 1);
    var limit = 2;


    User.count().then(function (count) {
        var pages = Math.ceil(count / limit);
        if (page > pages)page = pages;
        if (page < 1)page = 1;
        var skip = (page - 1) * limit;


        User.find().limit(limit).skip(skip).then(function (users) {
            res.render("./admin/user_index", {
                userInfo: req.userInfo,
                users: users,
                count: count,
                pages: pages,
                limit: limit,
                url:"/admin/user",
                page: page,
            });
        });


    });


})
//分类首页
router.get("/category", function (req, res, next) {

    var page = Number(req.query.page || 1);
    var limit = 10;


    Category.count().then(function (count) {
        var pages = Math.ceil(count / limit);
        if (page > pages)page = pages;
        if (page < 1)page = 1;
        var skip = (page - 1) * limit;


        Category.find().limit(limit).skip(skip).then(function (category) {
            res.render("./admin/category_index", {
                userInfo: req.userInfo,
                categories: category,
                count: count,
                pages: pages,
                limit: limit,
                url:"/admin/category",
                page: page,
            });
        });


    });

    // res.render("./admin/category_index", {
    //     userInfo: req.userInfo,
    // })
});
//添加分类
router.get("/category/add", function (req, res, next) {
    res.render("./admin/category_add", {
        userInfo: req.userInfo,
    })
});

//分类的保存
router.post("/category/add", function (req, res, next) {
    var name = req.body.name || "";
    if (name == "") {
        res.render("./admin/error", {
            userInfo: req.userInfo,
            message: "名称不能为空"
        });
        return;
    }
    Category.findOne({
        name: name
    }).then(function (rs) {

        if (rs) {
            res.render("./admin/error", {
                userInfo: req.userInfo,
                message: "板块已经有了"
            });
            return Promise.reject();//不明白

        } else {
            return new Category({
                name: name
            }).save();
        }


    }).then(function (newCategory) {
        res.render("admin/success", {
            userInfo: req.userInfo,
            message: "分类保存成功",
            url: "/admin/category"
        });
        return;
    })
});

//分类修改
router.get("/category/edit",function (req,res) {
    var id=req.query._id;

    Category.findOne({
        _id:id,
    }).then(function (category) {
        if(!category){
            res.render("admin/error",{
                userInfo:req.userInfo,
                message:"分类信息不存在"
            });
            return Promise.reject();
        }else{
            res.render("admin/category_edit",{
                userInfo:req.userInfo,
                category:category,
            });
        }
    })
})
//接受修改分类请求
router.post("/category/edit",function (req,res) {
    var id=req.query._id;//from不写清楚要提交到的action的位置的话，那么系统默认的是当前的页面,当前页面url带id就可以用query获得
    var name=req.body.name;
    Category.findOne({
        _id:id,
    }).then(function (category) {
        if(!category){
            res.render("admin/error",{
                userInfo:req.userInfo,
                message:"分类信息不存在"
            });
            return Promise.reject();
        }else{
            if(name==category.name){
                res.render("admin/error",{
                    userInfo:req.userInfo,
                    message:"您要修改的名称和原来一样",
                    url:"/admin/category",
                });
                return Promise.reject();
            }else {
                //要修改的名称数据库已经存在了
              return  Category.findOne({
                    _id:{$ne:id},
                    name:name
                })
            }
        }
    }).then(function (sameCategory) {

        if(sameCategory){
            res.render("admin/success",{
                userInfo:req.userInfo,
                message:"已有同名的分类存在了"
            });
            return Promise.reject();
        }else {
          return  Category.update({_id:id},{name:name});

        }
    }).then(function () {
        res.render("admin/success",{
            userInfo:req.userInfo,
            message:"修改成功",
            url:"/admin/category",
        });
    })
});


//分类删除
router.get("/category/delete",function (req,res) {
    var id=req.query._id;
    Category.remove({
        _id:id,
    }).then(function () {
        res.render("admin/success",{
            userInfo:req.userInfo,
            message:"删除成功",
            url:"/admin/category",
        });
    })
});
//内容首页
router.get("/content", function (req, res, next) {

    var page = Number(req.query.page || 1);
    var limit = 10;


    Content.count().then(function (count) {
        var pages = Math.ceil(count / limit);//计算总页数
        if (page > pages)page = pages;//取值不能超过pages
        if (page < 1)page = 1;//取值不能小于1
        var skip = (page - 1) * limit;

        // ["category","user"]
        Content.find().sort({_id:-1}).limit(limit).skip(skip).populate( ["category","user"]).then(function (contents) {
            console.log(contents);


            res.render("./admin/content_index", {
                userInfo: req.userInfo,
                contents: contents,
                count: count,
                pages: pages,
                limit: limit,
                page: page,
            });
        });


    });

});


//添加内容页面
router.get("/content/add",function (req,res) {

    Category.find().sort({_id:-1}).then(function (categories) {
        res.render("admin/content_add",{
            userInfo:req.userInfo,
            categories:categories
        })
    })

})

//内容保存
router.post("/content/add",function (req,res) {
    console.log(req.userInfo._id.toString()) ;

   if(!req.body.category){
        res.render("admin/error",{
            userInfo:req.userInfo,
            message:"内容分类不能为空"
        })
       return;
   }

    if(!req.body.title){
        res.render("admin/error",{
            userInfo:req.userInfo,
            message:"标题分类不能为空"
        })
        return;
    }
    //保存到数据库
    new Content({
        category:req.body.category,
        title:req.body.title,
        user:req.userInfo._id.toString(),
        description:req.body.description,
        content:req.body.content,



    }).save().then(function (rs) {
        res.render("admin/success",{
            userInfo:req.userInfo,
            message:"保存成功",
            url:"/admin/content"
        })
    });
});

//修改内容
router.get("/content/edit",function (req,res) {
    var id=req.query._id||"";
    Category.find().sort({_id:-1}).then(function (categories) {
        Content.findOne({
            _id:id,
        }).populate("category").then(function (content) {
            console.log(content);

            if(!content){
                res.render("admin/error",{
                    userInfo:req.userInfo,
                    message:"指定内容不存在"
                });
                return Promise.reject();
            }else{
                res.render("admin/content_edit",{
                    userInfo:req.userInfo,
                    content:content,
                    categories:categories
                });
            }
        })

    })
});
//保存修改内容
router.post("/content/edit",function (req,res) {
    var id=req.query._id||"";
    if(!req.body.category){
        res.render("admin/error",{
            userInfo:req.userInfo,
            message:"内容分类不能为空"
        })
        return;
    }

    if(!req.body.title){
        res.render("admin/error",{
            userInfo:req.userInfo,
            message:"标题分类不能为空"
        })
        return;
    }

    Content.update({_id:id},{
        category:req.body.category,
        title:req.body.title,
        description:req.body.description,
        content:req.body.content
        }
    ).then(function () {
        res.render("admin/success",{
            userInfo:req.userInfo,
            message:"内容保存成功",
            url:"/admin/category"
        });
        return;
    })
});
//删除修改内容
router.get("/content/delete",function (req,res) {
    var id=req.query._id||"";
    Content.remove({
        _id:id,
    }).then(function () {
        res.render("admin/success",{
            userInfo:req.userInfo,
            message:"删除成功",
            url:"/admin/content",
        });
    })
});



module.exports = router;