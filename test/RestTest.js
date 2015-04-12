var http = require('../routes/http-utils');
var equal = require('assert').equal;

//测试GET
http.get({
    path: '/cms/articles?EQS_designer=何平'
}, function (res) {
    equal(200, res.statusCode);
    res.on('complete',function (body) {
        console.log(body);
    });
});