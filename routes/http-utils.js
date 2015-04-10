var http = require('http');
var querystring = require('querystring');
var username = 'snzxw';
var password = '123456';
var _auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');

http.request = (function (_request) {
    return function () {
        var options = arguments[0];
        //设置请求地址
        options.host = '115.29.185.235';
        options.port = 8080;

        //设置请求头
        options.headers = {
            'accept': '*/*',
            'content-type': "application/x-www-form-urlencoded",
            'accept-encoding': 'gzip, deflate',
            'accept-language': 'zh-CN,zh;q=0.8,en;q=0.6',
            'authorization': _auth,
            'user-agent': 'nodejs rest client'
        };

        if (!!options.content && typeof options.content != 'string') {
            options.content = querystring.stringify(options.content);
        }

        if (/.*[\u4e00-\u9fa5]+.*$/.test(options.path) && options.path.indexOf('?') > -1) {
            var index = options.path.indexOf('?');
            var query = options.path.substr(index+1);
            options.path = options.path.substr(0,index);
            if (!!query) {
                if (!!options.content) {
                    options.content = options.content + '&' + querystring.stringify(querystring.parse(query));
                } else {
                    options.content = querystring.stringify(querystring.parse(query));
                }
            }
        }

        if (!!options.method && options.method.toUpperCase() != 'GET') {
            if (options.method.toUpperCase() == 'PUT' || options.method.toUpperCase() == 'DELETE') {
                var boundary = "----WebKitFormBoundary" + new Date().getTime();
                options.headers['content-type'] = 'multipart/form-data;boundary=' + boundary;
                var formData = new FormData(boundary);
                options.content.split('&').forEach(function (v) {
                    var _vs = v.split('=');
                    if (_vs.length > 1) {
                        formData.append(_vs[0], querystring.unescape(_vs[1]));
                    }
                });
                options.content = formData.toString();
            } else {
                options.headers['content-type'] = 'application/x-www-form-urlencoded';
                if (!!options.content) {
                    options.headers['content-length'] = options.content.length;
                }
            }
        } else if (!!options.content) {
            options.path = options.path + '?' + options.content;
        }

        var req = _request.apply(this, arguments).on('response', function (res) {
            var contentType = res.headers['content-type'];
            var bodys = [];
            res.on('data', function (body) {
                bodys.push(body);
            });
            res.on('end', function () {
                if (!!contentType && contentType.indexOf('json') != -1) {
                    res.emit('complete', JSON.parse(bodys.join("").toString() || '{}'));
                } else {
                    res.emit('complete', bodys.join("").toString());
                }
            })
        }).on('error', function (e) {
            console.error('problem with request: ' + e.message);
        });
        if (!!options.content && !!options.method && options.method.toUpperCase() != 'GET') {
            req.write(options.content);
        }
        return req;
    }
})(http.request);

http.post = function () {
    var options = arguments[0];
    options.method = 'POST';
    var req = http.request.apply(http, arguments);
    req.end();
    return req;
};

http.delete = function () {
    var options = arguments[0];
    options.method = 'DELETE';
    var req = http.request.apply(http, arguments);
    req.end();
    return req;
};

http.put = function () {
    var options = arguments[0];
    options.method = 'PUT';
    var req = http.request.apply(http, arguments);
    req.end();
    return req;
};

var FormData = (function (_FormData) {
    if (_FormData) {
        throw new Error('系统提供了 FormData 对象,请参考对象,重构代码');
    }
    return function (boundary) {
        var params = [];
        this.length = boundary.length + 8;
        this.append = function (key, value) {
            params.push({key: key, value: value});
            this.length += (boundary.length + 4 + 45 + key.length + value.length);
            return this;
        };
        this.toString = function () {
            var content = "\r\n--" + boundary;
            params.forEach(function (param) {
                if (typeof param.value == 'string') {
                    content += ("\r\nContent-Disposition: form-data; name=\"" + param.key + "\"\r\n\r\n" + param.value);
                } else {
                    throw new Error('暂不支持文件参数');
                }
                content += ("\r\n--" + boundary);
            });
            content += ("--\r\n");
            return content;
        };
    };
})(FormData);

module.exports = http;