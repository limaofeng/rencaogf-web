var express = require('express');
var http = require('./http-utils');
var flow = require('async');
var hogan = require('hjs');

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {menus: {index: true}, partials: {header: 'header', footer: 'footer'}});
});
router.get('/cases', function (req, res) {
    var code = req.param('code') || 'home';
    http.get({
        path: "/cms/articles?LIKES_category.path=snzxw,case," + code + ","
    }, function (_res) {
        _res.on('complete', function (body) {
            var data = {
                menus: {collection: true}, pager: body, checkedMenu: function () {
                    return function (text) {
                        return code == text ? "active" : "";
                    };
                }, partials: {header: 'header', page: 'page', footer: 'footer'}
            };
            res.render('cases/index', data);
        });
    });
});
router.get('/cases/:id', function (req, res) {
    http.get({
        path: '/cms/articles/' + req.params.id
    }, function (_res) {
        _res.on('complete', function (body) {
            res.render('cases/details', {
                menus: {collection: true},
                case: body,
                partials: {header: 'header', footer: 'footer'}
            });
        });
    });
});

router.get('/designers', function (req, res) {
    http.get({
        path: '/cms/articles?EQS_category.code=designer'
    }, function (_res) {
        _res.on('complete', function (body) {
            res.render('designers/index', {
                menus: {design: true},
                pager: body,
                partials: {header: 'header', page: 'page', footer: 'footer'}
            });
        });
    });
});
router.get('/designers/:id', function (req, res) {
    http.get({
        path: '/cms/articles/' + req.params.id
    }, function (_res) {
        _res.on('complete', function (designer) {
            http.get({
                path: '/cms/articles?EQS_designer=' + designer.title
            }, function (_res) {
                _res.on('complete', function (body) {
                    res.render('designers/details', {
                        menus: {design: true},
                        designer: designer,
                        pager: body,
                        partials: {header: 'header', page: 'page', footer: 'footer'}
                    });
                });
            });
        });
    });
});
router.get('/about', function (req, res) {
    http.get({
        path: '/cms/articles?EQS_category.code=about'
    }, function (_res) {
        _res.on('complete', function (body) {
            res.render('about', {
                menus: {about: true},
                content: body.pageItems[0].content,
                partials: {header: 'header', footer: 'footer'}
            });
        });
    });

});


router.get('/furnitures', function (req, res) {
    var path = req.param('path') || "/material";
    path = path.replace(/^\//, '').replace(/[/]/g, ",");
    var paths = path.split(",");
    var sign = paths[0];
    var subsign = paths.length > 1 ? paths[1] : null;
    flow.parallel({
        category: function (callback) {
            http.get({
                path: "/mall/goods/categorys?EQS_sign=" + sign
            }, function (_res) {
                _res.on('complete', function (body) {
                    callback(0, body.pageItems[0]);
                });
            });
        },
        children: function (callback) {
            http.get({
                path: "/mall/goods/categorys?LIKES_path=snzxw," + sign + ",&NES_sign=" + sign
            }, function (_res) {
                _res.on('complete', function (body) {
                    callback(0, body.pageItems);
                });
            });
        },
        pager: function (callback) {
            http.get({
                path: "/mall/goods/goodses?LIKES_category.path=snzxw," + path + ","
            }, function (_res) {
                _res.on('complete', function (body) {
                    callback(0, body);
                });
            });
        }
    }, function (err, result) {
        result.menus = {furniture: true};
        result.partials = {header: 'header', footer: 'footer', page: 'page'};
        result.checkedMenu = function () {
            return function (text) {
                return sign == text ? "active" : "";
            };
        };
        result.checkedSub = function () {
            return function (text) {
                return subsign == hogan.compile(text).render(this) ? "active" : "";
            };
        };
        result.replacePath = function () {
            return function (text) {
                return hogan.compile(text).render(this).replace(/^snzxw,/, '/').replace(/,$/, '').replace(/,/g, '/');
            };
        };
        result['type_' + (!!req.query.type ? req.query.type : 1)] = true;
        res.render('furnitures/index', result);
    });
});

router.get('/furnitures/:id', function (req, res) {
    http.get({
        path: "/mall/goods/goodses/" + req.params.id
    }, function (_res) {
        _res.on('complete', function (body) {
            res.render('furnitures/details', {
                menus: {furniture: true},
                goods: body,
                partials: {header: 'header', footer: 'footer'}
            });
        });
    });
});

router.get('/companys', function (req, res) {
    http.get({
        path: '/cms/articles?EQS_category.code=company'
    }, function (_res) {
        _res.on('complete', function (body) {
            res.render('companys', {
                menus: {repair: true},
                companys: body.pageItems,
                partials: {header: 'header', footer: 'footer'}
            });
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
    var dates = {
        menus: {new: true}, new_list: [
            {}, {}, {}, {}, {}
        ], partials: {header: 'header', footer: 'footer', page: 'page'}
    };
    dates['newlist_' + (!!req.query.newLis ? req.query.newLis : 1)] = true;
    res.render('news/index', dates);

});

router.get('/news/:id', function (req, res) {
    console.log(req.params.id);
    res.render('news/details', {
        menus: {repair: true}, new_details: [
            {}, {}, {}, {}, {}, {}, {}, {}, {}, {}
        ], partials: {header: 'header', footer: 'footer'}
    });
});

module.exports = router;
