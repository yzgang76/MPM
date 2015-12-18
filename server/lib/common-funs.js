/**
 * Created by zhigang on 5/8/2015.
 */

module.exports = (function() {
    'use strict';
    var path = require('path');
    var request = require(path.join(__dirname,'/../node_modules/request'));
    var _ = require(path.join(__dirname,'/../node_modules/lodash/index'));
    var os = require('os');
    var neo4j_conf=require(path.join(__dirname,'/../conf/neo4j'));
    var fs=require('fs');
    //var securityLogger = require(path.join(process.env.ROOT, 'server', 'logger', 'security-logger'));
    //var logger = require(path.join(process.env.ROOT, 'server', 'logger', 'server-logger'));
    //var requestOptions = require(path.join(process.env.ROOT, 'server', 'request-options', 'request-options'));

    var C = {};
    C.neo4j_server=neo4j_conf.server+":"+neo4j_conf.port;//"http://localhost:7474";

    C.timeout = 99990000;


    C.makeQuery = function(server, url, callback, method, postData,print) {

        var headers = {
            'Content-Type': 'application/json;charset=utf-8',
            'Accept': 'application/json, text/plain, */*',
            'Authorization':'Basic '+new Buffer(neo4j_conf.user+":"+neo4j_conf.password).toString('base64')
        };

        var baseoptions = {
            url: server + url,
            timeout: C.timeout,
            method: method ? method : 'GET',
            headers: headers
        };

        var startTime = os.uptime();

        //var defaultoptions = (server === C.server_fulfill ? C.options_fulfill : C.options_assurance);
        //var options = _.merge(defaultoptions, baseoptions);
        var options =  baseoptions;
        // logger.info('makeQuery options:', options);

        //added by Ellen on 2015-06-01
        if ((method) && ((postData)) && (method === 'PUT' || method === 'POST' || method === 'DELETE' || method === 'PATCH')) {
            options.body = JSON.stringify(postData);
        }
        if(print){
            console.log(options.body?'Making server request:' + options.method + ' '+ server + url + '\n' + options.body:
            'Making server request:' + options.method + ' '+ server + url );
        }

        request(options, function(error, response, body) {
            try {
                if (error) {
                    callback(error, response, body);
                } else if (response.statusCode >= 200 && response.statusCode <= 299) {
                    if(print){
                        console.log('Request completed in ' + (os.uptime() - startTime)+'s');
                    }

                    var data;
                    if (body) {
                        data = JSON.parse(body);
                    }
                    callback(error,response,data);

                } else {
                    console.log(('Can\'t '+options.method+ ' data from url ('+ baseoptions.url+ '); return code: '+ response.statusCode)+'; cost:'+(os.uptime() - startTime)+'s' + '\n' + response.body);

                    //var e=new Error();
                    //e.message=JSON.stringify({
                    //    statusCode: response.statusCode,
                    //    heads: response.heads,
                    //    errors: body.errors
                    //});
                    //console.log('eeeeeeeeeeee', e);
                    callback(new Error(),response,body);
                }
            } catch (e) {
                console.log('makeQuery exception caught:' +server + url + " - " + e.message);
                callback(e, response, body);
            }
        });
    };

    C.mergeArrays=function(arrs,keys){
        var x=[];
        var kkvs=[];
        _.forEach(arrs,function(arr){
            var y=[];
            _.forEach(arr,function(item){
                var kk='';
                var vv={};
                var kkv={};
                _.forEach(item,function(v,k){
                    //console.log(k+":"+v);

                    if(_.includes(keys, k)){
                        kk=kk+v;
                        _.set(kkv,k,v);
                    }else{
                        _.set(vv,k,v);
                    }
                });
                //var temp={};
                kkvs.push({key:kk,value:kkv});
                y.push(_.set({},kk,vv));
            });
            x.push(y);
        });
        kkvs=(_.uniq(kkvs,function(k){
            return k.key;
        }));
        x=_.reduce(x, function(a,a1){
            return _.merge(a,a1);
        });
        //console.log('x=',x);
        //console.log('kkvs=',kkvs);
        var ret=[];
        _.forEach(kkvs, function (k){
            ret.push(_.merge(k.value,_.get(_.find(x,function(i){
                return _.get(i, k.key)!==undefined;
            }), k.key)));
        });
        return ret;
    };
    C.walk = function(dir,done) {
        var results = [];
        fs.readdir(dir, function(err, list) {
            if (err){
                return done(err);
            }
            var pending = list.length;
            if (!pending){
                return done(null, results);
            }
            list.forEach(function(file) {
                file = path.resolve(dir, file);
                fs.stat(file, function(err, stat) {
                    if (stat && stat.isDirectory()) {
                        C.walk(file, function(err, res) {
                            results = results.concat(res);
                            if (!--pending){
                                done(null, results);
                            }
                        });
                    } else {
                        results.push(file);
                        if (!--pending){
                            done(null, results);
                        }
                    }
                });
            });
        });
    };

    Date.prototype.Format = function(fmt) {
        var o = {
            "M+": this.getMonth() + 1,
            "d+": this.getDate(),
            "h+": this.getHours(),
            "m+": this.getMinutes(),
            "s+": this.getSeconds(),
            "q+": Math.floor((this.getMonth() + 3) / 3),
            "S": this.getMilliseconds()
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }

        return fmt;
    };
    C.formatTime = function(t, f) {
        try {
            return (t && !_.isNaN(t)) ? (new Date(t)).Format(f) : undefined;
        } catch (e) {
            console.log(e.message);
            return undefined;
        }
    };
    C.getTimeMillionSecond = function(t) {
        try {
            var tt = (new Date(t)).getTime();
            return _.isNaN(tt) ? undefined : tt;
        } catch (e) {
            console.log(e.message);
            return undefined;
        }
    };
    String.prototype.replaceAll = function(s1, s2) {
        return this.replace(new RegExp(s1, "gm"), s2);
    };

    C.printProperties=function(obj){
        var ret=[];
        _.forIn(obj,function(v,k){
            ret.push(k+":"+JSON.stringify(v));
        });
        return _(ret).toString();
    };

    return C;
})();
