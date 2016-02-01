/**
 * Created by zhigang on 5/8/2015.
 */

module.exports = (function() {
    'use strict';
    var pluginsUtils = require(process.env.ROOT + '/server/services/plugins/utils.js');
    var options = pluginsUtils.getPluginConfig('nfvd');
    var request = require(process.env.ROOT + '/node_modules/request');
    var _ = require(process.env.ROOT + '/node_modules/lodash/index');
    var path = require('path');
    var os = require('os');
    var neo4j_conf = require(process.env.ROOT + '/server/addons/plugins/ossp/conf/neo4j');
    //var securityLogger = require(path.join(process.env.ROOT, 'server', 'logger', 'security-logger'));
    //var logger = require(path.join(process.env.ROOT, 'server', 'logger', 'server-logger'));
    //var requestOptions = require(path.join(process.env.ROOT, 'server', 'request-options', 'request-options'));

    var C = {};
    C.neo4j_server=neo4j_conf.server+":"+neo4j_conf.port;//"http://localhost:7474";

    C.timeout = 99990000;

    //C.server_fulfill = options.configuration.server_fulfill.protocol + '://' + options.configuration.server_fulfill.host + ':' + options.configuration.server_fulfill.port;
    //C.server_assurance = options.configuration.server_fulfill.protocol + '://' + options.configuration.server_assurance.host + ':' + options.configuration.server_assurance.port;
    //C.server_stub = 'http://localhost:' + process.env.PORT;
    //
    //C.timeout_fullfill = options.configuration.server_fulfill.timeout;
    //C.timeout_assurance = options.configuration.server_fulfill.timeout;


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


    C.makeQueryWithResponse = function(req, server, url, callback, method, postData) {
        return C.makeQuery(req, server, url, callback, method, postData, true);
    };

  /*  C.makeQueryIfErrorReturnEmptyObject = function(req, server, url, callback, method) {
        //logger.info('C.makeQuery',server+url);
        //if(!t){
        //    t=C.timeout_fullfill;   //set as default;
        //}
        var t = (server === C.server_fulfill) ? C.timeout_fullfill : C.timeout_assurance;
        var headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        if (req && req.user && req.user.AuthToken) {
            headers['X-Auth-Token'] = req.user.AuthToken;
        }
        var baseoptions = {
            url: server + url,
            timeout: t,
            method: method ? method : 'GET',
            headers: headers
        };
        //var defaultoptions = (server === C.server_fulfill ? C.options_fulfill : C.options_assurance);
        //var options = _.merge(defaultoptions, baseoptions);
        // logger.info('makeQuery options:', options);
        var options=baseoptions;
        request(options, function(error, response, body) {
            try {
                if (error) {
                    callback(error, response, body);
                } else if (response.statusCode === 200) {
                    //logger.info("REQUEST success", url);
                    var data = JSON.parse(body);
                    callback(null, data);
                } else {
                    log.info('Can\'t get data from url ('+ baseoptions.url, ')'+ response.statusCode+ error,req);
                    callback(null, {});
                }
            } catch (e) {
                log.info('makeQuery exception caught:' + baseoptions.url + " - " + e.message,req);
                //callback(e, response, body);
                callback(null, {});
            }
        });
    };
    C.makeQueryIfErrorReturnEmptyArray = function(req, server, url, callback, method) {
        //logger.info('C.makeQuery',server+url);
        //if(!t){
        //    t=C.timeout_fullfill;   //set as default;
        //}

        var t = (server === C.server_fulfill) ? C.timeout_fullfill : C.timeout_assurance;
        var headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        if (req && req.user && req.user.AuthToken) {
            headers['X-Auth-Token'] = req.user.AuthToken;
        }
        var baseoptions = {
            url: server + url,
            timeout: t,
            method: method ? method : 'GET',
            headers: headers
        };

        var startTime = os.uptime();

        //var defaultoptions = (server === C.server_fulfill ? C.options_fulfill : C.options_assurance);
        //var options = _.merge(defaultoptions, baseoptions);
        var options=baseoptions;
        log.apiTrace( options.body?'Making server request:' + options.method + ' '+ server + url + '\n' + options.body:
                              'Making server request:' + options.method + ' '+ server + url ,
                              req);
        request(options, function(error, response, body) {
            try {
                if (error) {
                    log.apiTrace('Request completed with errors ' + (os.uptime() - startTime)+'s, Error:'+JSON.stringify(error), req);
                    callback(null,[]);
                } else if (response.statusCode === 200) {
                    //logger.info("REQUEST success", url);
                    log.apiTrace('Request completed in ' + (os.uptime() - startTime)+'s', req);
                    var data = JSON.parse(body);
                    callback(null, data);
                } else {
                    log.apiTrace('Request completed with error code: '+response.statusCode +'. '+ (os.uptime() - startTime)+'s', req);
                    log.info('Can\'t get data from url ('+ baseoptions.url, ')'+ response.statusCode+ error);
                    callback(null, []);
                }
            } catch (e) {
                log.info('makeQuery exception caught:' + baseoptions.url + " - " + e.message,req);
                //callback(e, response, body);
                callback(null, []);
            }
        });
    };
    C.makeXMLQuery = function(req, server, url, callback) {

        var t = (server === C.server_fulfill) ? C.timeout_fullfill : C.timeout_assurance;
        var headers = {
            'Content-Type': 'application/xml',
            'Accept': 'application/xml'
        };
        if (req && req.user && req.user.AuthToken) {
            headers['X-Auth-Token'] = req.user.AuthToken;
        }
        var baseoptions = {
            url: server + url,
            timeout: t,
            method: 'GET',
            headers: headers
        };
        //var defaultoptions = (server === C.server_fulfill ? C.options_fulfill : C.options_assurance);
        //var options = _.merge(defaultoptions, baseoptions);
        // log.info('makeQuery options:', options);
        var options=baseoptions;
        request(options, function(error, response, body) {
            try {
                if (error) {
                    callback(error, response, body);
                } else if (response.statusCode === 200) {
                    //log.info("REQUEST success", url);
                    //var data = .parse(body);
                    callback(null, body);
                } else {
                    log.info('Can\'t get data from url ('+baseoptions.url, ')'+ error,req);
                    callback(new Error({
                        name: 'MyError',
                        message: 'Can\'t get data from url (' + baseoptions.url + ')-' + response.statusCode
                    }), response, body);
                }
            } catch (e) {
                log.info('makeQuery exception caught:' + url + " - " + e.message,req);
                callback(e, response, body);
            }
        });
    };*/
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
            console.info(e.message);
            return undefined;
        }
    };
    C.getTimeMillionSecond = function(t) {
        try {
            var tt = (new Date(t)).getTime();
            return _.isNaN(tt) ? undefined : tt;
        } catch (e) {
            console.info(e.message);
            return undefined;
        }
    };
    String.prototype.replaceAll = function(s1, s2) {
        return this.replace(new RegExp(s1, "gm"), s2);
    };
    return C;
})();
