var express = require('express');
var http = require('./http-utils');

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {menus: {index: true}, partials: {header: 'header', footer: 'footer'}});
});
router.get('/cases', function (req, res) {
    var data = {menus: {collection: true},cases:[
        {},
        {},
        {},
        {},
        {},
        {}
    ], partials: {header: 'header', page: 'page', footer: 'footer'}};
    data['type_'+(!!req.query.type?req.query.type:1)] = true;
    res.render('cases/index', data);
});
router.get('/cases/:id', function (req, res) {
    console.log(req.params.id);
    res.render('cases/details', {menus: {collection: true},partials: {header: 'header', footer: 'footer'}});
});

router.get('/designers', function (req, res) {
    http.get({
        path: '/cms/articles?EQS_category.code=designer'
    }, function (_res) {
        _res.on('complete',function (body) {
            res.render('designers/index', {menus: {design: true}, pager: JSON.parse(body), partials: {header: 'header', page: 'page', footer: 'footer'}});
        });
    });
});
router.get('/designers/:id', function (req, res) {
    http.request({
        path: '/cms/articles/'+req.params.id,
        method: 'GET'
    }, function (_res) {
        _res.on('data',function (body) {
            res.render('designers/details', {menus: {design: true},designer:JSON.parse(body), detailed: [
                {},
                {},
                {},
                {},
                {},
                {}
            ],  partials: {header: 'header', page: 'page', footer: 'footer'}});
        });
    }).end();
});
router.get('/about', function (req, res) {
    res.render('about', {menus: {about: true}, partials: {header: 'header', footer: 'footer'}});
});
router.get('/furniture', function (req, res) {
   var date =  {menus: {furniture: true},products:[
        {},{},{},{},{},{}
    ] ,partials: {header: 'header', footer: 'footer' ,page:'page'}};

    date['type_'+(!!req.query.type?req.query.type:1)] = true;
    res.render('furniture/index', date);
});
router.get('/furniture/:id', function (req, res) {
    console.log(req.params.id);
    res.render('furniture/details', {menus: {furniture: true}, partials: {header: 'header',footer: 'footer'}});
});


router.get('/repair', function (req, res) {
    res.render('repair', {menus: {repair: true},repairs:[
        {name:"上海臻逸建筑装饰工程有限公司",url:"http://9041188.czvv.com/",pic:'/images/coll_2.png'},
        {name:"申远空间设计",url:"http://www.sy-021.com/",pic:'/images/coll_2.png'},
        {name:"统帅装饰",url:"http://www.tszh.net/",pic:'/images/coll_2.png'},
        {name:"上海臻茂建筑装饰工程有限公司",url:"http://sh.to8to.com/zs/company972569/",pic:'/images/coll_2.png'},
        {name:"上海龙发建筑装饰工程有限公司",url:"http://sh.xtuan.com/35621/",pic:'/images/coll_2.png'},
        {name:"上海雅仕居装饰集团",url:"http://www.sh-ysjdec.com/",pic:'/images/coll_2.png'},
        {name:"上海石澜装饰设计",url:"http://www.shejiben.com/sjs/1513150/",pic:'/images/coll_2.png'},
        {name:"上海显尚装饰工程设计有限公司",url:"http://sh.tobosu.com/member/24891/",pic:'/images/coll_2.png'},
        {name:"同济装潢设计",url:"http://www.shtjzh.com/",pic:'/images/coll_2.png'},
        {name:"上海嘉墅建筑装饰工程有限公司",url:"http://shzx.cxzg.com/",pic:'/images/coll_2.png'},
        {name:"圣泓国际",url:"http://www.shshenghong.cn/",pic:'/images/coll_2.png'},
        {name:"波涛装饰集团",url:"http://www.shbotao.net/",pic:'/images/coll_2.png'}
    ], partials: {header: 'header', footer: 'footer'}});
});

router.get('/news', function (req, res) {
    /*
    res.render('new/index', {menus: {new: true} ,new_list:[
        {},{},{},{},{}
    ], partials: {header: 'header', footer: 'footer', page:'page'}});
     */
    console.log(req.params.id);
    var dates = {menus: {new: true} ,new_list:[
        {},{},{},{},{}
    ] ,partials:{header: 'header', footer: 'footer',page:'page'}};
    dates['newlist_'+(!!req.query.newLis?req.query.newLis:1)] = true;
    res.render('news/index', dates);

});

router.get('/news/:id', function (req, res) {
    console.log(req.params.id);
    res.render('news/details', {menus: {repair: true},new_details:[
        {},{},{},{},{},{},{},{},{},{}
    ] ,partials: {header: 'header', footer: 'footer'}});
});

module.exports = router;
