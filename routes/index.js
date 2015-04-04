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
            res.render('designers/index', {menus: {design: true}, pager: body, partials: {header: 'header', page: 'page', footer: 'footer'}});
        });
    });
});
router.get('/designers/:id', function (req, res) {
    http.get({
        path: '/cms/articles/'+req.params.id
    }, function (_res) {
        _res.on('complete',function (body) {
            res.render('designers/details', {menus: {design: true},designer:body, detailed: [
                {},
                {},
                {},
                {},
                {},
                {}
            ],  partials: {header: 'header', page: 'page', footer: 'footer'}});
        });
    });
});
router.get('/about', function (req, res) {
    http.get({
        path: '/cms/articles?EQS_category.code=about'
    }, function (_res) {
        _res.on('complete',function (body) {
            res.render('about', {menus: {about: true},content:body.pageItems[0].content, partials: {header: 'header', footer: 'footer'}});
        });
    });

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

router.get('/companys', function (req, res) {
    http.get({
        path: '/cms/articles?EQS_category.code=company'
    }, function (_res) {
        _res.on('complete',function (body) {
            res.render('companys', {menus: {repair: true},companys:body.pageItems, partials: {header: 'header', footer: 'footer'}});
        });
    });
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
