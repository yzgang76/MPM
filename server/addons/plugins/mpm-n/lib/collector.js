/**
 * Created by yanzhig on 12/22/2015.
 */
/**
 * Created by yanzhig on 10/27/2015.
 */

module.exports = (function() {
    'use strict';
    var _ = require(process.env.ROOT + '/node_modules/lodash/index');
    // var request = require(process.env.ROOT + '/node_modules/request');
    //var fs = require('fs');
    var async = require(process.env.ROOT + '/server/addons/plugins/mpm-n/node_modules/async/lib/async');
    var C = require('./mpm-common');
    var collectors=require(process.env.ROOT + '/server/addons/plugins/mpm-n/conf/collectors');
    //var display = require('./nfvd-artifact-display');
    //var path = require('path');

    var S = {};

    S.getCollectors = function (req, res) {
        console.log('****************getCollectors');
        async.map(collectors,function(c,callback){
            var server= 'http://'+c.url;
            var url='/collect/'+ c.type+'/status';
            C.makeQuery(server,url,function(err,response,data){
                if(err){
                    console.log("Failed to connect to collect:", c.name, 'Error:',JSON.stringify((err)));
                    callback(null, _.set(c,'status','Offline'));
                }else{
                    callback(null, _.set(_.set(c,'status',data.status),'lstScan',data.latestScan));
                }
            },'GET',{},true);
        },function(err,result){
            if(err){
                console.error('getCollectors error:',JSON.stringify(err));
                res.status(500).send(err);
                res.end();
            }else{
                console.error('getCollectors data:',JSON.stringify(result));
                res.send(result);
                res.end();
            }

        });

    };
    S.getCollectorByID=function(req,res){
        var id= _.get(req,'params.id');
        console.log('****************getCollectorByID',id);
        if(!id){
            res.send({});
            res.end();
        }else{
            var s=_.find(collectors,function(c){
                return (c.id-id)===0;
            });
            if(!s){
                console.log('not found the collector');
                res.send({});
                res.end();
            }else{
                var server= 'http://'+s.url;
                var url='/collect/'+ s.type+'/status';
                C.makeQuery(server,url,function(err,response,data){
                    if(err){
                        console.log("Failed to connect to collect:", s.name, 'Error:',JSON.stringify((err)));
                        res.send(_.set(s,'status','Offline'));
                    }else{
                        res.send( _.set(_.set(s,'status',data.status),'lstScan',data.latestScan));
                    }
                },'GET',{},true);
            }
        }
    };

    S.startCollectorByID=function(req,res){
        //console.log('****************startCollectorByID');
        var id= _.get(req,'params.id');
        console.log('****************startCollectorByID',id);
        if(!id){
            res.status(500).send({Message:"Internal Error."});
            res.end();
        }else{
            var s=_.find(collectors,{id:id-0});
            if(!s){
                res.status(500).send({Message:"Collector not exists!"});
                res.end();
            }else{
                var server= 'http://'+s.url;
                var url='/collect/'+ s.type+'/start';
                C.makeQuery(server,url,function(err,response,data){
                    if(err){
                        console.log("Failed to start collector ", s.name, 'Error:',JSON.stringify((err)));
                        res.status(500).send(err);
                        res.end();
                    }else{
                        res.send({result:"succ"});
                        res.end();
                    }
                },'POST',{},true);
            }
        }
    };

    S.stopCollectorByID=function(req,res){
        console.log('****************stopCollectorByID');
        var id= _.get(req,'params.id');
        if(!id){
            res.status(500).send({Message:"Collector not exists!"});
            res.end();
        }else{
            var s=_.find(collectors,{id:id-0});
            if(!s){
                res.send({});
                res.end();
            }else{
                var server= 'http://'+s.url;
                var url='/collect/'+ s.type+'/stop';
                C.makeQuery(server,url,function(err,response,data){
                    if(err){
                        console.log("Failed to stop collector ", s.name, 'Error:',JSON.stringify((err)));
                        res.status(500).send(err);
                        res.end();
                    }else{
                        res.send({result:"succ"});
                        res.end();
                    }
                },'POST',{},true);
            }
        }
    };

    return S;

})();