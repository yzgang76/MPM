/**
 * Created by yanzhig on 1/4/2016.
 */


var path=require("path");
var _ = require(path.join(__dirname, '/../node_modules/lodash/index'));
var Collector=require(path.join(__dirname, '/../snmp_module/snmp_collector'));
var C=require(path.join(__dirname, '/../lib/common-funs'));
var conf=require(path.join(__dirname,'/../conf/snmp_collector'));
var n4j=require(path.join(__dirname, '/../neo4j_module/neo4j_funs'));
var async=require(path.join(__dirname,'/../node_modules/async/dist/async'));

module.exports = (function() {
    'use strict';
    var S = {};

    var snmp_collector_console={
        messages:{
            INITIALIZED:"Already initialized.",
            SUCCESSFULLY:"Successfully",
            ERROR1:"Failed to load MPM console configuration.",
            ERROR2:"Failed to collect data of ",
            ERROR3:"Failed to get definition of ",
            ERROR4:"Failed to get device information",
        }
    };

    var status=0;  //0, init; 1, init succ; -1, init failed
    var scheduler={};
    S.initCollector=function(req,res){
        if(status!==0){
            res.send({"status":1,"Message":snmp_collector_console.messages.INITIALIZED});
        }else if(status===0){
            console.log(JSON.stringify(conf));

            var msg=snmp_collector_console.messages.SUCCESSFULLY;
            status=1;

            if(!conf){
                msg="Failed to load configuration file.";
                status=-1;
                res.send({"result":status,"Message":msg});
            }else{
                var mpm= _.get(conf,"mpm_console.server");
                var url= _.get(conf,"mpm_console.url");
                if(!mpm||!url){
                    msg=snmp_collector_console.messages.ERROR1;
                    status=-1;
                    res.send({"result":status,"Message":msg});
                }else{
                    var collections= _.get(conf,"collection");
                    _.forEach(collections,function(collection){
                        var dev= _.get(collection,'device_info');
                        var oids=_.get(collection,'OIDs');

                        async.series([
                                async.apply(_collectDevice,collection), //collect device instance

                            ],
                            function(err, results){
                                console.log(snmp_collector_console.messages.ERROR2, JSON.stringify(collection));
                                //skip the error device and go on
                            }
                        );
                    });
                }
            }
        }

        //embedded functions
        function _collectDevice(dev,callback){
            //console.log('_collectDevice',dev);
            var type= _.get(dev,'device_info.type');
            function __getDeviceDefinition(dev,callback){
                var url='match (e:TEMPLATE {type:"'+type+'"}) return e';  //the template shall be predefined
                n4j.runCypherWithReturn([{statement:url}],function(err,result){
                    //console.log(result);
                    var def= _.get(result,'results[0].data[0].row[0]');
                    var errors=_.get(result,'errors');
                    if(errors.length>0){
                        callback (errors,null);
                    }else{
                        if(!def){
                            callback(new Error(snmp_collector_console.messages.ERROR3+type+"."),null);
                        }else{
                            callback(null,def);
                        }
                    }
                });
            }
            function __ingestDeviceInstance(dev_def, callback){
                if(!dev){
                    callback(new Error(snmp_collector_console.messages.ERROR3 +type+"."),null);
                }else{
                    var id= _.get(dev,'device_info.name');
                    var ip= _.get(dev,'device_info.IP');
                    var community= _.get(dev,'device_info.community');
                    var version= _.get(dev,'device_info.version');
                    if(!id||!ip||!community||!version){
                        callback(new Error(snmp_collector_console.messages.ERROR4),null);
                    }else{
                        var statements=[];
                        statements.push({statement:'merge (:INSTANCE:'+type+'{id:"'+id+'",type:"'+type+'", ip:"'+ip+'",community:"'+community+'",version:"'+version+'"})'});
                        statements.push({statement:'match (t:TEMPLATE {type:"'+type+'"}) with t match (i:INSTANCE {id:"'+id+'"}) merge (t)-[:HAS_INSTANCE]->(i)'});

                        n4j.runCypherStatementsReturnErrors(statements,function(err,result){
                            if(_.get(result,'results[0]')){
                                callback(_.get(result,'results[0]'),null);
                            }else{
                                callback(null,null);
                            }
                        });
                    }
                }
            }
            async.waterfall([
                async.apply(__getDeviceDefinition,dev),
                async.apply(__ingestDeviceInstance)
            ],function(err/*,result*/){
                if(err) {
                    console.error(err);
                    callback(err,null);
                }else{
                    callback(null,null);
                }
            });

        }
    };

    return S;
}());