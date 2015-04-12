var express = require('express');
var http = require('./http-utils');
var flow = require('async');
var hogan = require('hjs');
var querystring = require('querystring');

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    flow.parallel({
        designers: function (callback) {
            http.get({
                path: '/cms/articles?EQS_category.code=designer&pager.pageSize=4'
            }, function (_res) {
                _res.on('complete', function (body) {
                    callback(0, body.pageItems);
                });
            });
        },
        zxzs: function (callback) {
            http.get({
                path: '/cms/articles?EQS_category.code=zxzs&pager.pageSize=6'
            }, function (_res) {
                _res.on('complete', function (body) {
                    callback(0, body.pageItems);
                });
            });
        },
        fsal: function (callback) {
            http.get({
                path: '/cms/articles?EQS_category.code=fsal&pager.pageSize=6'
            }, function (_res) {
                _res.on('complete', function (body) {
                    callback(0, body.pageItems);
                });
            });
        }
    }, function (err, result) {
        result.menus = {index: true};
        result.avatarImagePath = function () {
            return function (text) {
                return this.avatar == null ? '/images/img.png' : this.avatar.absolutePath.replace(/(\.jpg)$/, '_' + text + '$1');
            }
        };
        result.partials = {header: 'header', footer: 'footer'};
        res.render('index', result);
    });
});
router.get('/cases', function (req, res) {
    var code = req.param('code') || 'home';
    http.get({
        path: "/cms/articles?LIKES_category.path=snzxw,case," + code + ","
    }, function (_res) {
        _res.on('complete', function (body) {
            var data = {
                menus: {collection: true}, pager: pagerProxy(body, req), checkedMenu: function () {
                    return function (text) {
                        return code == text ? "active" : "";
                    };
                }, partials: {header: 'header', page: 'page', footer: 'footer'}
            };
            data.firstImagePath = function () {
                return function (text) {
                    return this.images == null ? '/images/pro_img.png' : this.images[0].absolutePath.replace(/(\.jpg)$/, '_' + text + '$1');
                }
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
                imagePath: function () {
                    return function (text) {
                        return this.absolutePath.replace(/(\.jpg)$/, '_' + text + '$1');
                    }
                },
                isFristImage: function () {
                    return !!body.images && body.images.length > 0 && body.images[0].absolutePath == this.absolutePath;
                },
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
                pager: pagerProxy(body, req),
                imagePath: function () {
                    return function (text) {
                        return this.avatar == null ? '/images/img.png' : this.avatar.absolutePath.replace(/(\.jpg)$/, '_' + text + '$1');
                    }
                },
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
                        pager: pagerProxy(body, req),
                        avatarImagePath: function () {
                            return function (text) {
                                return this.designer.avatar == null ? '/images/img.png' : this.designer.avatar.absolutePath.replace(/(\.jpg)$/, '_' + text + '$1');
                            }
                        },
                        firstImagePath: function () {
                            return function (text) {
                                return this.images == null ? '/images/pro_img.png' : this.images[0].absolutePath.replace(/(\.jpg)$/, '_' + text + '$1');
                            }
                        },
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
        result.pager = pagerProxy(result.pager, req);
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
    var path = req.param('path') || "/news";
    path = path.replace(/^\//, '').replace(/[/]/g, ",");
    http.get({
        path: "/cms/articles?LIKES_category.path=snzxw," + path + ",",
        content: req.query
    }, function (_res) {
        _res.on('complete', function (body) {
            res.render('news/index', {
                menus: {new: true},
                pager: pagerProxy(body, req),
                checkedMenu: function () {
                    return function (text) {
                        return code == text ? "active" : "";
                    };
                },
                replacePath: function () {
                    return function (text) {
                        return hogan.compile(text).render(this).replace(/^snzxw,/, '/').replace(/,$/, '').replace(/,/g, '/');
                    };
                },
                partials: {header: 'header', footer: 'footer', page: 'page'}
            });
        });
    });


});

router.get('/news/:id', function (req, res) {
    http.get({
        path: "/cms/articles/" + req.params.id
    }, function (_res) {
        _res.on('complete', function (_body) {
            http.get({
                path: "/cms/articles?pager.pageSize=15&LIKES_category.path=" + _body.category.path
            }, function (_res) {
                _res.on('complete', function (body) {
                    res.render('news/details', {
                        menus: {repair: true},
                        news: _body,
                        list: body.pageItems,
                        partials: {header: 'header', footer: 'footer', page: 'page'}
                    });
                });
            });
        });
    });
});


var pagerProxy = function (pager, req) {
    var url = req.url.substr(0, req.url.indexOf('?') != -1 ? req.url.indexOf('?') : undefined);
    delete req.query['pager.currentPage'];
    var _querystring = querystring.stringify(req.query);
    _querystring = !!_querystring ? ('&' + _querystring) : '';
    pager.template = function () {
        if (pager.totalPage <= 1) {
            return '';
        }
        return function (text) {
            pager.first = pager.currentPage == 1;
            if (!pager.first) {
                pager.pagePrevUrl = url + '?pager.currentPage=' + (pager.currentPage - 1) + _querystring;
            }
            pager.last = pager.totalPage == pager.currentPage;
            if (!pager.last) {
                pager.pageNextUrl = url + '?pager.currentPage=' + (pager.currentPage + 1) + _querystring;
            }
            pager.pages = [];
            for (var i = 1; i <= pager.totalPage; i++) {
                pager.pages.push(i);
            }
            pager.pageCurrent = function () {
                return function (text) {
                    var data = {page: this, pageUrl: url + '?pager.currentPage=' + this + _querystring};
                    if (this == pager.currentPage) {
                        data.current = true;
                    }
                    return hogan.compile(text).render(data);
                };
            };
            return hogan.compile(text).render(pager);
        };
    };
    return pager;
}

module.exports = router;
