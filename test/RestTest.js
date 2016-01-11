var http = require('../routes/http-utils');
var url = require('url');
var equal = require('assert').equal;
var querystring = require('querystring');

//测试GET
http.get({
    path: '/cms/articles?EQS_designer=何平'
}, function (res) {
    equal(200, res.statusCode);
    res.on('complete',function (body) {
       // console.log(body);
    });
});

var param = (function () {

    function isPlainObject(obj) {
        if (!obj || toString.call(obj) !== "[object Object]" || obj.nodeType || obj.setInterval) {
            return false;
        }
        if (obj.constructor
            && !hasOwnProperty.call(obj, "constructor")
            && !hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf")) {
            return false;
        }
        var key;
        for (key in obj) {
        }
        return key === undefined || hasOwnProperty.call(obj, key);
    }

    function isFunction(obj) {
        return jQuery.type(obj) === "function";
    }

    function each(json, callback) {
        for (var p in json) {
            callback.apply(json, [p, json[p]]);
        }
    }

    function encode(key, value) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(value);//escape();
    }

    function addArray(j, a) {
        var s = [];
        a.forEach(function (v, _index) {
            if (isPlainObject(v)) {
                each(v, function (key, value) {
                    if (!isFunction(value)) {
                        s.push(encode(j + '[' + _index + '].' + key, value));
                    }
                });
            } else {
                s.push(encode(j, v));
            }
        });
        return s;
    }

    return function (a) {
        var s = [];
        for (var j in a) {
            if (Array.isArray(a[j])) {
                Array.prototype.push.apply(s, addArray(j, a[j]));
            } else {
                s.push(encode(j, isFunction(a[j]) ? a[j]() : a[j]));
            }
        }
        return s.join("&");
    };
})();