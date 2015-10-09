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
                path: '/cms/articles?EQS_category.code=designer&pager.pageSize=3'
            }, function (_res) {
                _res.on('complete', function (body) {
                    callback(0, body.pageItems);
                });
            });
        },
        news: function (callback) {
            http.get({
                path: '/cms/articles?EQS_category.code=news&pager.pageSize=6'
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
                return this.avatar == null ? '/static/images/img.png' : this.avatar.absolutePath.replace(/(\.jpg)$/, '_' + text + '$1');
            }
        };
        result.partials = {header: 'header', footer: 'footer'};
        res.render('index', result);
    });
});
router.get('/cases', function (req, res) {
    var code = req.param('code') || 'home';
    flow.parallel({
        banner: function (callback) {
            http.get({
                path: '/cms/banners/1053'
            }, function (_res) {
                _res.on('complete', function (body) {
                    callback(0, body);
                });
            });
        },
        pager: function (callback) {
            http.get({
                path: "/cms/articles?LIKES_category.path=snzxw,case," + code + ","
            }, function (_res) {
                _res.on('complete', function (body) {
                    callback(0, body);
                });
            })
        }
    }, function (err, result) {
        var data = {
            menus: {collection: true}, pager: pagerProxy(result.pager, req), checkedMenu: function () {
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

        res.render('cases/index', mergeObject(result, data));
    });
});
router.get('/cases/:id', function (req, res) {
    flow.parallel({
        banner: function (callback) {
            http.get({
                path: '/cms/banners/1053'
            }, function (_res) {
                _res.on('complete', function (body) {
                    callback(0, body);
                });
            });
        },
        case: function (callback) {
            http.get({
                path: '/cms/articles/' + req.params.id
            }, function (_res) {
                _res.on('complete', function (body) {
                    callback(0, body);
                });
            });
        }
    }, function (err, result) {
        res.render('cases/details', mergeObject(result, {
            menus: {collection: true},
            imagePath: function () {
                return function (text) {
                    return this.absolutePath.replace(/(\.jpg)$/, '_' + text + '$1');
                }
            },
            isFristImage: function () {
                return !!result.case.images && result.case.images.length > 0 && result.case.images[0].absolutePath == this.absolutePath;
            },
            partials: {header: 'header', footer: 'footer'}
        }));
    });

});
router.get('/designers', function (req, res) {
    http.get({
        path: '/cms/categorys?LIKES_path=snzxw,designer,&EQI_layer=2&pager.orderBy=sort&pager.order=desc'
    }, function (_res) {
        _res.on('complete', function (data) {
            console.log(data);
            res.render('designers/index', mergeObject({}, {
                menus: {design: true},
                categorys: data.pageItems,
                imagePath: function () {
                    return function (text) {
                        return this.avatar == null ? '/static/images/img.png' : this.avatar.absolutePath.replace(/(\.jpg)$/, '_' + text + '$1');
                    }
                },
                partials: {header: 'header', page: 'page', footer: 'footer'}
            }));
        });
    })
});
router.get('/designers/:code/list', function (req, res) {
    http.get({
        path: '/cms/articles?EQS_category.code='+req.params.code
    }, function (_res) {
        _res.on('complete', function (data) {
            res.render('designers/list', mergeObject({}, {
                menus: {design: true},
                pager: pagerProxy(data, req),
                imagePath: function () {
                    return function (text) {
                        return this.avatar == null ? '/static/images/img.png' : this.avatar.absolutePath.replace(/(\.jpg)$/, '_' + text + '$1');
                    }
                },
                partials: {header: 'header', page: 'page', footer: 'footer'}
            }));
        });
    })
});
router.get('/designers/:id', function (req, res) {
    flow.parallel({
        banner: function (callback) {
            http.get({
                path: '/cms/banners/1053'
            }, function (_res) {
                _res.on('complete', function (body) {
                    callback(0, body);
                });
            });
        },
        root: function (callback) {
            http.get({
                path: '/cms/articles/' + req.params.id
            }, function (_res) {
                _res.on('complete', function (designer) {
                    http.get({
                        path: '/cms/articles?EQS_designer=' + designer.title
                    }, function (_res) {
                        _res.on('complete', function (body) {
                            callback(0, {designer: designer, pager: pagerProxy(body, req)});
                        });
                    });
                });
            });
        }
    }, function (err, result) {
        result.designer = result.root.designer;
        result.pager = result.root.pager;
        delete result.root;
        res.render('designers/details', mergeObject(result, {
            menus: {design: true},
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
        }));
    });

});
router.get('/about', function (req, res) {
    /*
     flow.parallel({
     banner: function (callback) {
     http.get({
     path: '/cms/banners/1053'
     }, function (_res) {
     _res.on('complete', function (body) {
     callback(0, body);
     });
     });
     },
     content: function (callback) {
     http.get({
     path: '/cms/articles?EQS_category.code=about'
     }, function (_res) {
     _res.on('complete', function (body) {
     callback(0, body.pageItems[0].content);
     });
     });
     }
     }, function (err, result) {
     res.render('about', mergeObject(result, {
     menus: {about: true},
     partials: {header: 'header', footer: 'footer'}
     }));
     });
     */
    res.render('about', mergeObject({}, {
        menus: {about: true},
        partials: {header: 'header', footer: 'footer'}
    }));
});

router.get('/products', function (req, res) {
    http.get({
        path: "/mall/goods/categorys?LIKES_path=snzxw,&EQI_layer=1"
    }, function (_res) {
        _res.on('complete', function (body) {
            res.render('products/categorys', mergeObject({"categorys": body.pageItems}, {
                menus: {products: true},
                partials: {header: 'header', footer: 'footer'}
            }));
        });
    });
});

router.get('/products/:code/list', function (req, res) {
    var psign = req.params.code;
    var sign = req.param('sign') || "";
    flow.parallel({
        categorys: function (callback) {
            http.get({
                path: "/mall/goods/categorys?LIKES_path=snzxw,&EQI_layer=1"
            }, function (_res) {
                _res.on('complete', function (body) {
                    callback(0, body.pageItems);
                });
            });
        },
        children: function (callback) {
            http.get({
                path: "/mall/goods/categorys?LIKES_path=snzxw," + psign + ",&NES_sign=" + psign
            }, function (_res) {
                _res.on('complete', function (body) {
                    callback(0, body.pageItems);
                });
            });
        },
        pager: function (callback) {
            http.get({
                path: "/mall/goods/goodses?LIKES_category.path=snzxw," + (!!psign ? (psign + ",") : psign) + (!!sign ? (sign + ",") : sign)
            }, function (_res) {
                _res.on('complete', function (body) {
                    callback(0, body);
                });
            });
        }
    }, function (err, result) {
        result.pager = pagerProxy(result.pager, req);
        result.menus = {products: true};
        result.partials = {header: 'header', footer: 'footer', page: 'page'};
        result.checkedMenu = function () {
            return function (text) {
                return psign == hogan.compile(text).render(this) ? "curr" : "";
            };
        };
        result.checkedSub = function () {
            return function (text) {
                return sign == hogan.compile(text).render(this) ? "curr" : "";
            };
        };
        result.psign = psign;
        result.replacePath = function () {
            return function (text) {
                return hogan.compile(text).render(this).replace(/^snzxw,/, '/').replace(/,$/, '').replace(/,/g, '/');
            };
        };
        result['type_' + (!!req.query.type ? req.query.type : 1)] = true;
        res.render('products/index', result);
    });
});

router.get('/shop', function (req, res) {
    res.render('shop', mergeObject({}, {
        menus: {shop: true},
        partials: {header: 'header', footer: 'footer'}
    }));
});

router.get('/furnitures/:id', function (req, res) {
    flow.parallel({
        banner: function (callback) {
            http.get({
                path: '/cms/banners/1053'
            }, function (_res) {
                _res.on('complete', function (body) {
                    callback(0, body);
                });
            });
        },
        goods: function (callback) {
            http.get({
                path: "/mall/goods/goodses/" + req.params.id
            }, function (_res) {
                _res.on('complete', function (body) {
                    callback(0, body);
                });
            });
        }
    }, function (err, result) {
        res.render('furnitures/details', mergeObject(result, {
            menus: {furniture: true},
            imagePath: function () {
                return function (text) {
                    return this.absolutePath.replace(/(\.jpg)$/, '_' + text + '$1');
                }
            },
            isFristImage: function () {
                return !!result.goods.goodsImages && result.goods.goodsImages.length > 0 && result.goods.goodsImages[0].absolutePath == this.absolutePath;
            },
            partials: {header: 'header', footer: 'footer'}
        }));
    });

});
router.get('/companys', function (req, res) {
    flow.parallel({
        banner: function (callback) {
            http.get({
                path: '/cms/banners/1053'
            }, function (_res) {
                _res.on('complete', function (body) {
                    callback(0, body);
                });
            });
        },
        companys: function (callback) {
            http.get({
                path: '/cms/articles?EQS_category.code=company'
            }, function (_res) {
                _res.on('complete', function (body) {
                    callback(0, body.pageItems);
                });
            });
        }
    }, function (err, result) {
        res.render('companys', mergeObject(result, {
            menus: {repair: true},
            partials: {header: 'header', footer: 'footer'}
        }));
    });

});
router.get('/news', function (req, res) {
    var path = req.param('path') || "/news";
    path = path.replace(/^\//, '').replace(/[/]/g, ",");
    flow.parallel({
        /*
         banner: function (callback) {
         http.get({
         path: '/cms/banners/1053'
         }, function (_res) {
         _res.on('complete', function (body) {
         callback(0, body);
         });
         });
         },*/
        category: function (callback) {
            http.get({
                path: "/cms/categorys/" + path.replace(/^[^,]+,/, '')
            }, function (_res) {
                _res.on('complete', function (body) {
                    callback(0, body);
                });
            });
        },
        pager: function (callback) {
            http.get({
                path: "/cms/articles?LIKES_category.path=snzxw," + path + ",&pager.pageSize=8",
                content: req.query
            }, function (_res) {
                _res.on('complete', function (body) {
                    callback(0, body);
                })
            })
        }
    }, function (error, data) {
        var result = {
            menus: {news: true},
            checkedMenu: function () {
                return function (text) {
                    return req.param('path') == text ? "active" : "";
                };
            },
            replacePath: function () {
                return function (text) {
                    return hogan.compile(text).render(this).replace(/^snzxw,/, '/').replace(/,$/, '').replace(/,/g, '/');
                };
            },
            partials: {header: 'header', footer: 'footer', page: 'page'}
        };
        result.pager = pagerProxy(data.pager, req);
        result.category = data.category;
        res.render('news/index', result);
    });
});
router.get('/news/:id', function (req, res) {
    flow.parallel({
        /*
         banner: function (callback) {
         http.get({
         path: '/cms/banners/1053'
         }, function (_res) {
         _res.on('complete', function (body) {
         callback(0, body);
         });
         });
         },*/
        root: function (callback) {
            http.get({
                path: "/cms/articles/" + req.params.id
            }, function (_res) {
                _res.on('complete', function (_body) {
                    http.get({
                        path: "/cms/articles?pager.pageSize=15&LIKES_category.path=" + _body.category.path
                    }, function (_res) {
                        _res.on('complete', function (body) {
                            callback(0, {news: _body, list: body.pageItems})
                        });
                    });
                });
            });
        }
    }, function (err, result) {
        result.news = result.root.news;
        result.list = result.root.list;
        delete result.root;
        res.render('news/details', mergeObject(result, {
            menus: {news: true},
            partials: {header: 'header', footer: 'footer', page: 'page'}
        }));
    });

});
router.get('/feedback', function (req, res) {
    flow.parallel({
        banner: function (callback) {
            http.get({
                path: '/cms/banners/1053'
            }, function (_res) {
                _res.on('complete', function (body) {
                    callback(0, body);
                });
            });
        }
    }, function (err, result) {
        res.render('feedback', mergeObject(result, {
            menus: {feedback: true},
            partials: {header: 'header', footer: 'footer', page: 'page'}
        }));
    });
});
router.get('/brand', function (req, res) {
    flow.parallel({
        banner: function (callback) {
            http.get({
                path: '/cms/banners/1053'
            }, function (_res) {
                _res.on('complete', function (body) {
                    callback(0, body);
                });
            });
        }
    }, function (err, result) {
        res.render('furnitures/brand', mergeObject(result, {
            menus: {feedback: true},
            partials: {header: 'header', footer: 'footer', page: 'page'}
        }));
    });
});
router.post('/consultations', function (req, res) {
    http.post({
        path: "/website/contactuses",
        content: req.body
    }, function (_res) {
        _res.on('complete', function (body) {
            res.json(body);
        });
    });
});

var mergeObject = function () {
    if (arguments.length == 0) {
        throw new Error("Fantasy.merge 参数不正确!");
    }
    var plainObject = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
        if (arguments[i] == null)
            continue;
        for (var f in arguments[i]) {
            if (!arguments[i].hasOwnProperty(f)) {
                continue;
            }
            plainObject[f] = arguments[i][f];
        }
    }
    return plainObject;
};

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
            pager.pageFirstUrl = url + '?pager.currentPage=1' + _querystring;

            pager.last = pager.totalPage == pager.currentPage;
            if (!pager.last) {
                pager.pageNextUrl = url + '?pager.currentPage=' + (pager.currentPage + 1) + _querystring;
            }
            pager.pageLastUrl = url + '?pager.currentPage=' + pager.totalPage + _querystring;
            pager.pages = [];
            for (var i = 1; i <= pager.totalPage; i++) {
                pager.pages.push(i);
            }
            return hogan.compile(text).render(pager);
        };
    };
    return pager;
};

/*router.get('/furnitures_', function (req, res) {
 res.render('furnitures/lis', {
 partials: {header: 'header', footer: 'footer'}
 });
 });*/

module.exports = router;
