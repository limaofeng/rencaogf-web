var express = require('express');
var http = require('http');

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
    res.render('designers/index', {menus: {design: true}, designers: [
        {name: '张萌1'},
        {name: '张萌2'},
        {name: '张萌3'},
        {name: '张萌4'},
        {name: '张萌5'},
        {name: '张萌6'}
    ], partials: {header: 'header', page: 'page', footer: 'footer'}});
});
router.get('/designers/:id', function (req, res) {
    console.log(req.params.id);
    res.render('designers/details', {menus: {design: true}, detailed: [
        {},
        {},
        {},
        {},
        {},
        {}
    ],  partials: {header: 'header', page: 'page', footer: 'footer'}});
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
    res.render('repair', {menus: {repair: true}, partials: {header: 'header', footer: 'footer'}});
});

router.get('/new', function (req, res) {
    /*
    res.render('new/index', {menus: {new: true} ,new_list:[
        {},{},{},{},{}
    ], partials: {header: 'header', footer: 'footer', page:'page'}});
     */
    console.log(req.params.id);
    var dates = {menus: {new: true} ,new_list:[
        {},{},{},{},{}
    ] ,partials:{header: 'header', footer: 'footer',page:'page'}};
    dates['newList_'+(!!req.query.newList_?req.newList:1)] = true;
    res.render('new/index', dates);

});

router.get('/new/:id', function (req, res) {
    console.log(req.params.id);
    res.render('new/details', {menus: {repair: true},new_details:[
        {},{},{},{},{},{},{},{},{},{}
    ] ,partials: {header: 'header', footer: 'footer'}});
});

module.exports = router;
