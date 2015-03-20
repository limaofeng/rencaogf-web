var express = require('express');
var http = require('http');

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {menus: {index: true}, partials: {header: 'header', footer: 'footer'}});
});
router.get('/cases', function (req, res) {
    var data = {menus: {collection: true},partials: {header: 'header', page: 'page', footer: 'footer'}};
    data['type_'+(!!req.query.type?req.query.type:1)] = true;
    res.render('cases/index', data);
});
router.get('/cases/:id', function (req, res) {
    console.log(req.params.id);
    res.render('cases/details', {menus: {collection: true}, partials: {header: 'header', footer: 'footer'}});
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
    res.render('designers/details', {menus: {design: true}, partials: {header: 'header', page: 'page', footer: 'footer'}});
});

module.exports = router;
