/**
 * Created by yanzhig on 1/4/2016.
 */


var path=require("path");
var _ = require(path.join(__dirname, '/../node_modules/lodash/index'));
var collector=require(path.join(__dirname, '/../snmp_module/snmp_collector'));
var C=require(path.join(__dirname, '/../lib/common-funs'));
var conf=require(path.join(__dirname,'/../conf/snmp_collector'));
var ossp_console=require(path.join(__dirname,'/../conf/ossp_console'));
var n4j=require(path.join(__dirname, '/../neo4j_module/neo4j_funs'));
var async=require(path.join(__dirname,'/../node_modules/async/dist/async'));
var cypherMaker=require(path.join(__dirname,'/../lib/cypherMaker'));
module.exports = (function() {
    'use strict';
    var S = {};
    var timers=[];
    var state='stopped';
    var latestScan;
    var status=0;  //0, init; 1, init succ; -1, init failed
    var scheduler={
        /* "300":[
         {
         "device": {
         "ip": "127.0.0.1","community": "public", "version": "2c"
         },
         "jobs":[{
         id:4
         method:"get",
         aggregation:"delta",
         formula:"1.3.6."
         },{
         id:6
         method:"get",
         aggregation:"delta",
         formula:"1.3.6."
         }]
         }]*/
    };
    var snmp_collector_console={
        messages:{
            INITIALIZED:"Already initialized.",
            SUCCESSFULLY:"Successfully",
            ERROR1:"Failed to load OSSP console configuration.",
            ERROR2:"Failed to collect data of ",
            ERROR3:"Failed to get definition of ",
            ERROR4:"Failed to get device information",
            ERROR5:"Start with errors",
            ERROR6:"Failed to get KPI definition of ",
            ERROR7:"Failed to apply KPI ID",
            ERROR8:"Failed to create KPI definition"
        }
    };

    var initCollectorLocal=function(){  //register kpi, create inventory instances
        //embedded functions
        function _processCollection(collection,callback){
            //var dev= _.get(collection,'device_info');
            //var oids=_.get(collection,'OIDs');
            function __collectDevice(dev,callback){
                //console.log('_collectDevice',dev);
                function ___getDeviceDefinition(type,callback){
                      //the template shall be predefined
                    n4j.runCypherWithReturn(cypherMaker.getCypherQueryTemplate(type),function(err,result){
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
                function ___ingestDeviceInstance(dev_def, callback){
                    if(!dev_def){
                        callback(new Error(snmp_collector_console.messages.ERROR3 +type+"."),null);
                    }else{
                        var domain= _.get(dev,'device_info.domain');
                        var id= _.get(dev,'device_info.name');
                        var ip= _.get(dev,'device_info.IP');
                        var community= _.get(dev,'device_info.community');
                        var version= _.get(dev,'device_info.version');
                        if(!id||!ip||!community||!version){
                            callback(new Error(snmp_collector_console.messages.ERROR4),null);
                        }else{
                            var statements=cypherMaker.getCypherInjectSNMPNodeInstances(domain,type,id,ip,community,version);
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
                var type= _.get(dev,'device_info.type');
                async.waterfall([
                    async.apply(___getDeviceDefinition,type),
                    async.apply(___ingestDeviceInstance)
                ],function(err/*,result*/){
                    if(err) {
                        console.error(err);
                        callback(err,null);
                    }else{
                        callback(null,null);
                    }
                });

            }
            function __buildScheduler(dev,callback){
                var domain=_.get(dev,'device_info.domain');
                var type= _.get(dev,'device_info.type');
                var id= _.get(dev,'device_info.name');
                var ip= _.get(dev,'device_info.IP');
                var community= _.get(dev,'device_info.community');
                var version= _.get(dev,'device_info.version');

                var oids= _.get(dev,"OIDs");
                function ___processOID(oid,callback){
                    function ____collectKPIDefinition(oid,callback){
                        //var method= _.get(oid,"method");
                        var name=_.get(oid,"name");
                        //var aggregation=_.get(oid,"aggregation");
                        var formula=_.get(oid,"formula");
                        var interval=_.get(oid,"interval");
                        var unit=_.get(oid,"unit");
                        var description=_.get(oid,"description");
                        var kpiid;
                        var stat='match (k:KPI_DEF{name:"'+name+'",type:0})<-[:HAS_KPI]-(t:TEMPLATE{type:"'+type+'"}) with k match (k)<-[:HAS_KPI]-(g:GRANULARITY{num:'+interval+'}) return k';
                        n4j.runCypherWithReturn([{"statement":stat}],function(err,result){
                                if(err){
                                    console.log(snmp_collector_console.messages.ERROR6+ name);
                                    callback(new Error(snmp_collector_console.messages.ERROR6+ name),null);
                                }else{
                                    kpiid=_.get(result,"results[0].data[0].row[0].id");
                                    if(kpiid){
                                        console.log("Found kpi id of "+name+'='+kpiid);
                                        oid.id=kpiid;
                                        callback(null,oid); //already define the kpi
                                    }else{
                                        // add kpi definition
                                        //get kpiid
                                        console.log("create new kpi definition");
                                       /* C.makeQuery(ossp,url,function(err,r,data){
                                            if(err){
                                                console.log(snmp_collector_console.messages.ERROR7);
                                                callback(new Error(snmp_collector_console.messages.ERROR7),null);
                                            }else{
                                                kpiid=data.ID;
                                                if(!kpiid){
                                                    console.log(snmp_collector_console.messages.ERROR7);
                                                    callback(new Error(snmp_collector_console.messages.ERROR7),null);
                                                }else{

                                                    var statements=[];
                                                    statements.push({statement:'create (:KPI_DEF {id:'+kpiid+',name:"'+name+'",type:0,formula:"'+formula+'",description:"'+(description||'')+'",type:0,unit:"'+(unit||'')+'"})'});
                                                    statements.push({statement:'match (k:KPI_DEF {id:'+kpiid+'}) with k match (t:TEMPLATE {type:"'+type+'"}) merge (t)-[:HAS_KPI]->(k)'});
                                                    statements.push({statement:'match (k:KPI_DEF {id:'+kpiid+'}) with k match (g:GRANULARITY {num:'+interval+'}) merge (g)-[:HAS_KPI]->(k)'});
                                                    n4j.runCypherStatementsReturnErrors(statements,function(err,info){
                                                        if(err){
                                                            console.log(snmp_collector_console.messages.ERROR8,err);
                                                            callback(err,null);
                                                        }else{
                                                            if(info.length>0){
                                                                console.log(snmp_collector_console.messages.ERROR8,info);
                                                                callback(info,null);
                                                            }else{
                                                                oid.id=kpiid;
                                                                callback(null,oid);
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                        },'GET',{},true);*/

                                    }
                                }
                            }
                        );

                    }
                    function ____addCollectSchedule(oid,callback){
                        //console.log('____addCollectSchedule',oid);
                        if(oid){
                            var interval_jobs=_.get(scheduler,oid.interval);
                            if(!interval_jobs){
                                _.set(scheduler,oid.interval,[]);
                                interval_jobs=_.get(scheduler,oid.interval);
                            }
                            var d=_.find(interval_jobs,function(job){
                                return _.get(job,'device.ip')===ip;
                            });
                            if(!d){
                                d={
                                    device:{
                                        id:id,
                                        ip:ip,
                                        community:community,
                                        version:version
                                    },
                                    jobs:[enrichOID(oid)]
                                };
                                interval_jobs.push(d);
                            }else{
                                d.jobs.push(enrichOID(oid));
                            }
                        }
                        callback(null,null);
                    }
                    async.waterfall([
                        async.apply(____collectKPIDefinition,oid),
                        async.apply(____addCollectSchedule)

                    ],function(err/*,result*/){
                        if(err){
                            console.log(snmp_collector_console.messages.ERROR2, JSON.stringify(collection));
                            msg=snmp_collector_console.messages.ERROR5;
                        }

                        //skip the error kpi and go on
                        callback(null,null);

                    });

                }
                async.each(oids,___processOID,function(/*err*/){
                    //console.log('***********Jobs',JSON.stringify(scheduler));
                    callback(null,null);
                });
            }
            async.series([
                    async.apply(__collectDevice,collection), //collect device instance
                    async.apply(__buildScheduler,collection)
                ],
                function(err/*, results*/){
                    if(err){
                        console.log(snmp_collector_console.messages.ERROR2, JSON.stringify(collection));
                        msg=snmp_collector_console.messages.ERROR5;
                        //skip the error device and go on
                    }
                    callback(null,null);
                }
            );

        }
        if(status>0){
            return;
        }else /*if(status===0)*/{
            console.log(JSON.stringify(conf));

            var msg=snmp_collector_console.messages.SUCCESSFULLY;
            status=1;

            if(!conf){
                msg="Failed to load configuration file.";
                status=-1;
                return;
            }else{

                //TODO:update to use kpi create service
                var ossp= _.get(ossp_console,"server");
                var workspace= _.get(ossp_console,"workspace");
                if(!ossp||!workspace){
                    msg=snmp_collector_console.messages.ERROR1;
                    status=-1;
                    return;
                }else{
                    var collections= conf;
                    async.each(collections,_processCollection,function(/*err*/){
                        status=1;
                        return;
                    });
                }
            }
        }


    };
    //to enable auto init, but must after webgui started.
    initCollectorLocal();


    function getVars(expression){
        var r =/\[(\.\d*)*\]/g;
        return expression.match(r);//.map(function(s){return oidStr2Array(s); });
    }
    function varsStr2Array(vars){
        return vars.map(function(v){
            return v.split('.')
                .filter(function (s) { return s.length > 0&&s!=='['&&s!==']'; })
                .map(function (s) { return parseInt(s, 10); });
        });
    }
    function vars2KeyArray(vars){
        return _.map(vars,function(s){
            return s.replaceAll('\\.','_').replace('[','K').replace(']','');
        });
    }
    function convertFormula(formula,vars,keys){
        for(var i=0;i<vars.length;i++){
            formula=formula.replace(vars[i],keys[i]);
        }
        return formula;
    }
    function enrichOID(oid){
        var formula= _.get(oid,'formula');
        if(formula){
            var vars= getVars(formula);
            console.log('vars:',vars);
            var keys=vars2KeyArray(vars);
            var ef=convertFormula(formula,vars,keys);
            var collectArray=varsStr2Array(vars);
            //oid.vars=vars;
            oid.keys=keys;
            oid.eFormula=ef;
            oid.collectArray=collectArray;
        }
        return oid;
    }

    S.initCollector=function(req,res){
        //embedded functions
        function _processCollection(collection,callback){
            //var dev= _.get(collection,'device_info');
            //var oids=_.get(collection,'OIDs');
            function __collectDevice(dev,callback){
                //console.log('_collectDevice',dev);
                var type= _.get(dev,'device_info.type');
                function ___getDeviceDefinition(dev,callback){
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
                function ___ingestDeviceInstance(dev_def, callback){
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
                    async.apply(___getDeviceDefinition,dev),
                    async.apply(___ingestDeviceInstance)
                ],function(err/*,result*/){
                    if(err) {
                        console.error(err);
                        callback(err,null);
                    }else{
                        callback(null,null);
                    }
                });

            }
            function __buildScheduler(dev,callback){
                var type= _.get(dev,'device_info.type');
                var id= _.get(dev,'device_info.name');
                var ip= _.get(dev,'device_info.IP');
                var community= _.get(dev,'device_info.community');
                var version= _.get(dev,'device_info.version');

                var oids= _.get(dev,"OIDs");

                async.each(oids,___processOID,function(err){
                    //console.log('***********Jobs',JSON.stringify(scheduler));
                    callback(null,null);
                });


                function ___processOID(oid,callback){
                    async.waterfall([
                        async.apply(____collectKPIDefinition,oid),
                        async.apply(____addCollectSchedule)

                    ],function(err,result){
                        if(err){
                            console.log(snmp_collector_console.messages.ERROR2, JSON.stringify(collection));
                            msg=snmp_collector_console.messages.ERROR5;
                        }

                        //skip the error kpi and go on
                        callback(null,null);

                    });
                    function ____collectKPIDefinition(oid,callback){
                        var method= _.get(oid,"method");
                        var name=_.get(oid,"name");
                        var aggregation=_.get(oid,"aggregation");
                        var formula=_.get(oid,"formula");
                        var interval=_.get(oid,"interval");
                        var unit=_.get(oid,"unit");
                        var description=_.get(oid,"description");
                        var kpiid;
                        var stat='match (k:KPI_DEF{name:"'+name+'",type:0})<-[:HAS_KPI]-(t:TEMPLATE{type:"'+type+'"}) with k match (k)<-[:HAS_KPI]-(g:GRANULARITY{num:'+interval+'}) return k';
                        n4j.runCypherWithReturn([{"statement":stat}],function(err,result){
                                if(err){
                                    console.log(snmp_collector_console.messages.ERROR6+ name);
                                    callback(new Error(snmp_collector_console.messages.ERROR6+ name),null);
                                }else{
                                    kpiid=_.get(result,"results[0].data[0].row[0].id");
                                    if(kpiid){
                                        console.log("Found kpi id of "+name+'='+kpiid);
                                        oid.id=kpiid;
                                        callback(null,oid); //already define the kpi
                                    }else{
                                        // add kpi definition
                                        //get kpiid
                                        console.log("create new kpi definition");
                                        C.makeQuery(ossp,url,function(err,r,data){
                                            if(err){
                                                console.log(snmp_collector_console.messages.ERROR7);
                                                callback(new Error(snmp_collector_console.messages.ERROR7,null));
                                            }else{
                                                kpiid=data.ID;
                                                if(!kpiid){
                                                    console.log(snmp_collector_console.messages.ERROR7);
                                                    callback(new Error(snmp_collector_console.messages.ERROR7,null));
                                                }else{

                                                    var statements=[];
                                                    statements.push({statement:'create (:KPI_DEF {id:'+kpiid+',name:"'+name+'",type:0,formula:"'+formula+'",description:"'+(description||'')+'",type:0,unit:"'+(unit||'')+'"});'});
                                                    statements.push({statement:'match (k:KPI_DEF {id:'+kpiid+'}) with k match (t:TEMPLATE {type:"'+type+'"}) merge (t)-[:HAS_KPI]->(k);'});
                                                    statements.push({statement:'match (k:KPI_DEF {id:'+kpiid+'}) with k match (g:GRANULARITY {num:'+interval+'}) merge (g)-[:HAS_KPI]->(k);'});
                                                    n4j.runCypherStatementsReturnErrors(statements,function(err,info){
                                                        if(err){
                                                            console.log(snmp_collector_console.messages.ERROR8,err);
                                                            callback(err,null);
                                                        }else{
                                                            if(info.length>0){
                                                                console.log(snmp_collector_console.messages.ERROR8,info);
                                                                callback(info,null);
                                                            }else{
                                                                oid.id=kpiid;
                                                                callback(null,oid);
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                        },'GET',{},true);

                                    }
                                }
                            }
                        );

                    }
                    function ____addCollectSchedule(oid,callback){
                        //console.log('____addCollectSchedule',oid);
                        if(oid){
                            var interval_jobs=_.get(scheduler,oid.interval);
                            if(!interval_jobs){
                                _.set(scheduler,oid.interval,[]);
                                interval_jobs=_.get(scheduler,oid.interval);
                            }
                            var d=_.find(interval_jobs,function(job){
                                return _.get(job,'device.ip')===ip;
                            });
                            if(!d){
                                d={
                                    device:{
                                        id:id,
                                        ip:ip,
                                        community:community,
                                        version:version
                                    },
                                    jobs:[enrichOID(oid)]
                                };
                                interval_jobs.push(d);
                            }else{
                                d.jobs.push(enrichOID(oid));
                            }
                        }
                        callback(null,null);
                    }
                }
            }
            async.series([
                    async.apply(__collectDevice,collection), //collect device instance
                    async.apply(__buildScheduler,collection)
                ],
                function(err/*, results*/){
                    if(err){
                        console.log(snmp_collector_console.messages.ERROR2, JSON.stringify(collection));
                        msg=snmp_collector_console.messages.ERROR5;
                        //skip the error device and go on

                    }
                    callback(null,null);
                }
            );

        }
        if(status>0){
            res.send({"status":1,"Message":snmp_collector_console.messages.INITIALIZED});
        }else /*if(status===0)*/{
            console.log(JSON.stringify(conf));

            var msg=snmp_collector_console.messages.SUCCESSFULLY;
            status=1;

            if(!conf){
                msg="Failed to load configuration file.";
                status=-1;
                res.send({"result":status,"Message":msg});
            }else{
                var ossp= _.get(conf,"ossp_console.server");
                var url= _.get(conf,"ossp_console.url");
                if(!ossp||!url){
                    msg=snmp_collector_console.messages.ERROR1;
                    status=-1;
                    res.send({"result":status,"Message":msg});
                }else{
                    var collections= _.get(conf,"collection");
                    async.each(collections,_processCollection,function(err){
                        status=1;
                        res.send({"result":status,"Message":msg});
                    });

                }
            }
        }


    };
    S.getScheduler=function(req,res){
        res.send(scheduler);
    };
    S.startTimer=function(req,res){
        if(status<=0){
            res.send({result:'Not initialized yet'});
            res.end();
        }else if(state==='started'){
            res.send({result:'already started'});
            res.end();
        }else {
            _.forEach(timers,function(t){
                clearInterval(t);
            });
            timers=[];
            console.log("starting the timers...");
            _.forEach(scheduler, function (v, k) {
                var timer=setInterval(function(){
                    latestScan=new Date().toISOString();
                    var ts=Date.now();
                    async.each(v,function(deviceJob,callback){
                        collector.collectAndPopulate(deviceJob,ts,function(err,result){
                            callback(err,result);
                        });
                    },function(err){
                        console.log("completed snmp scan job. interval: ",k," @",new Date().toISOString());
                    });
                }, parseInt(k)*1000);
                timers.push(timer);
            });
            state='started';
            res.send({result:'started'});
            res.end();
        }
    };
    S.stopTimer=function(req,res){
        if(status<=0){
            res.send({result:'Not initialized yet'});
            res.end();
        }else if(state==='stopped'){
            res.send({result:'already stopped'});
            res.end();
        }else {
            console.log("stopping the timers...");
            _.forEach(timers,function(t){
                clearInterval(t);
            });
            timers=[];
            state='stopped';
            res.send({result:'stopped'});
            res.end();
        }
    };
    //S.history=function(req,res){
    //    res.send(collector.history);
    //    res.end();
    //};
    S.status=function(req,res){
        res.send({status:state,latestScan: latestScan||''});
        res.end();
    };
    return S;
}());