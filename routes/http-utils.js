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

        if(typeof options.content != 'string'){
            options.content = querystring.stringify(options.content);
        }

        if(!!options.method && options.method.toUpperCase() != 'GET'){
            options.headers['content-type'] = 'application/x-www-form-urlencoded';
            if(!!options.content){
                options.headers['content-length'] = options.content.length;
            }
        }else if(!!options.content){
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
                    res.emit('complete', JSON.parse(bodys.join("").toString()));
                } else {
                    res.emit('complete', bodys.join("").toString());
                }
            })
        }).on('error', function (e) {
            console.error('problem with request: ' + e.message);
        });
        if(!!options.content && !!options.method && options.method.toUpperCase() != 'GET') {
            req.write(options.content);
        }
        return req;
    }
})(http.request);

http.post = function () {
    var options = arguments[0];
    options.method = 'POST';
    var req = http.request.apply(http,arguments);
    req.end();
    return req;
};

module.exports = http;