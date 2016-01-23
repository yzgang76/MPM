/**
 * Created by yanzhig on 1/19/2016.
 */

var path=require('path');
//var input=require();
var fs = require('fs');
//var csv = require(path.join(__dirname,'/../node_modules/csv/lib/index'));
var _ = require(path.join(__dirname,'/../node_modules/lodash/index'));
var n4j=require(path.join(__dirname, '/../neo4j_module/neo4j_funs'));
var C=require(path.join(__dirname, '/../lib/common-funs'));
var os=require('os');
var conf=require(path.join(__dirname,'/../conf/nfvd_log'));
var async=require(path.join(__dirname,'/../node_modules/async/dist/async'));

module.exports = (function() {
    'use strict';
    var S = {};
    var kpiName1='Server_Response';
    var kpiID1;
    var kpiName2='Server_Request_cost';
    var kpiID2;
    S.createModelAndRegisterKPIs=function(){
        var url= _.get(conf,'mpm_console.url');
        var mpm_server= _.get(conf,'mpm_console.server');
        function _createModel(callback){
            var statements=[];
            statements.push({statement:'merge (server:TEMPLATE:NFVD_GUI_SERVER {type:"NFVD_GUI_SERVER",desc:"nfvd GUI server"}) with server merge (user:TEMPLATE:NFVD_GUI_USER{type:"NFVD_GUI_USER",desc:"NFVD GUI USER"}) with server, user merge (request:TEMPLATE:NFVD_GUI_SERVER_REQUEST {type:"NFVD_GUI_SERVER_REQUEST",desc:"nfvd GUI server"}) with server, user ,request merge (server)-[:CONTAINS]->(request) with user,request merge (user)-[:CONTAINS]->(request)'}) ;
            statements.push({statement:'merge (:GRANULARITY {id:999,type:"Real _Time",num:0})'});
            n4j.runCypherStatementsReturnErrors(statements,function(err,results){
                if(err){
                    console.log('Failed to create Model', err);
                    callback(err,null);
                }else{
                    callback(null,results);
                }
            });

        }
        function _crateKPIDefinitions(kpiName,unit,callback){
            //create KPI definitions
            var stat='match (k:KPI_DEF{name:"'+kpiName+'",type:0})<-[:HAS_KPI]-(t:TEMPLATE{type:"NFVD_GUI_SERVER_REQUEST"}) with k match (k)<-[:HAS_KPI]-(g:GRANULARITY{num:0}) return k';
            n4j.runCypherWithReturn([{"statement":stat}],function(err,result){
                if(err){
                    console.log('Failed to get KPI definition', kpiName, err);
                    callback(err,null);
                }else{
                    var kpiid=_.get(result,"results[0].data[0].row[0].id");
                    if(kpiid){
                        console.log("Found kpi id of "+kpiName+'='+kpiid);
                        callback(null,kpiid); //already define the kpi
                    }else{
                        // add kpi definition
                        //get kpiid
                        console.log("create new kpi definition");
                        C.makeQuery(mpm_server,url,function(err,r,data){
                            if(err){
                                console.log('Failed to get new KPIID',err);
                                callback(err,null);
                            }else{
                                kpiid=data.ID;
                                if(!kpiid){
                                    console.log('Failed to get new KPIID');
                                    callback(new Error('Failed to get new KPIID'),null);
                                }else{

                                    var statements=[];
                                    statements.push({statement:'match (t:TEMPLATE {type:"NFVD_GUI_SERVER_REQUEST"}), (g:GRANULARITY {num:0}) with t,g create (KD:KPI_DEF {id:'+kpiid+',name:"'+kpiName+'",type:0,formula:"'+kpiName+'",description:"'+''+'",unit:"'+(unit||'')+'"}),(t)-[:HAS_KPI]->(KD), (g)-[:HAS_KPI]->(KD) '});

                                    console.log('match (t:TEMPLATE {type:"NFVD_GUI_SERVER_REQUEST"}), (g:GRANULARITY {num:0}) with t,g create (KD:KPI_DEF {id:'+kpiid+',name:"'+kpiName+'",type:0,formula:"'+kpiName+'",description:"'+''+'",unit:"'+(unit||'')+'"}),(t)-[:HAS_KPI]->(KD), (g)-[:HAS_KPI]->(KD) ');
                                    n4j.runCypherStatementsReturnErrors(statements,function(err,info){
                                        if(err){
                                            console.log('Failed to create new KPI definition',err);
                                            callback(err,null);
                                        }else{
                                            if(info.length>0){
                                                console.log('Failed to create new KPI definition',info);
                                                callback(info,kpiid);
                                            }else{
                                                callback(null,kpiid);
                                            }
                                        }
                                    });
                                }
                            }
                        },'GET',{},true);

                    }
                }
            });

        }
        function _createServerInstance(callback){
            var statement='merge (e:INSTANCE:NFVD_GUI_SERVER{id:"'+conf.id+'",type:"NFVD_GUI_SERVER"}) with e match  (server:TEMPLATE {type:"NFVD_GUI_SERVER"}) merge (server)-[:HAS_INSTANCE]->(e)';
            n4j.runCypherStatementsReturnErrors([{statement:statement}],function(err,result) {
                console.log(err, result);
               callback(err,result);
            });
        }
        async.series([
            async.apply(_createModel),
            async.apply(_crateKPIDefinitions,kpiName1,null),
            async.apply(_crateKPIDefinitions,kpiName2,'s'),
            async.apply(_createServerInstance)
        ],function(err,results){
           if(err){
               console.log('createModelAndRegisterKPIs failed ',err);
           }else{
               kpiID1=results[1];
               kpiID2=results[2];
               console.log('kpiids:',kpiID1,kpiID2);
           }
        });
    };

    S.collectEx=function(date){ //date:  yyyy-mm-dd
        if(!kpiID1&&kpiID1){
            return;
        }
        C.walk(conf.path,function(err,files){
            //var r =/nfvd-api.log-\d*-\d*-\d*/g;
            files=_.filter(files,function(file){
                if(date){
                    return _.startsWith(file,'nfvd-api')&& _.endsWith(file,date);
                }else{
                    return _.startsWith(file,'nfvd-api.log');
                }

            });
            //console.log(files);
            _.forEach(files,function(f){
                collectFile(f);
            });
        });
    };
    S.collect=function(){
        console.log(conf);
        var statement='merge (e:INSTANCE:'+conf.type+'{id:"'+conf.id+'",type:"'+conf.type+'"})';
        n4j.runCypherStatementsReturnErrors([{statement:statement}],function(err,result){
            if(!err){
                C.walk(conf.path,function(err,files){
                    var r =/nfvd-api.log-\d*-\d*-\d*/g;
                    files=_.filter(files,function(file){
                        return file.match(r);
                    });
                    //console.log(files);
                    _.forEach(files,function(f){
                        collectFile(f);
                    });
                });
            }
        });

    };
    String.prototype.Right = function(len)
    {
        if(isNaN(len)||len===null)
        {
            len = this.length;
        }
        else
        {
            if(parseInt(len)<0||parseInt(len)>this.length)
            {
                len = this.length;
            }
        }

        return this.substring(this.length-len,this.length);
    };
    function collectFile(file){
        var numOfRequest=0;
        var totalCost=0;
        var maxCost=-1;
        fs.readFile(file,'utf8', function(err, data) {
            if (err) {
                throw err;
            }
            var lines=data.split('\n');
            _.forEach(lines,function(l){
                var r=parseLogMessage(l);
                if(r){
                    numOfRequest++;
                    totalCost=totalCost+ r.cost;
                    maxCost=r.cost>maxCost?r.cost:maxCost;
                }
            });
            console.log( file.Right(10)+" : ",numOfRequest,',',totalCost/numOfRequest,',',maxCost );
            var statements=[];
            var kpiname='num_of_request';  //it is hard code.
            var ts=file.Right(10);
            var key=conf.id+'_'+kpiname+"_"+ts+'_'+conf.gran;

            var statement='match (ne:INSTANCE{id:"'+conf.id+'"}),(t:TEMPLATE)-[:HAS_KPI]->(d:KPI_DEF)<-[:HAS_KPI]-(g:GRANULARITY) where d.formula="'+kpiname+'" and g.num='+conf.gran+' and t.type="'+conf.type+'" with ne,d create (k:KPI_VALUE{key:"'+key+'",name:"'+kpiname+'", ts:"'+ts+'",value:'+numOfRequest+',gran:'+conf.gran+', neID:"'+conf.id+',updateTS:'+Date.now()+'"}) , (ne)-[:HAS_KPI_VALUE]->(k) ,(d)-[:HAS_KPI_VALUE]->(k) set k.id=d.id';
            statements.push({statement:statement});
            if(numOfRequest>0){
                kpiname='avg_request_cost';  //it is hard code.
                key=conf.id+'_'+kpiname+"_"+ts+'_'+conf.gran;
                statement='match (ne:INSTANCE{id:"'+conf.id+'"}),(t:TEMPLATE)-[:HAS_KPI]->(d:KPI_DEF)<-[:HAS_KPI]-(g:GRANULARITY) where d.formula="'+kpiname+'" and g.num='+conf.gran+' and t.type="'+conf.type+'" with ne,d create (k:KPI_VALUE{key:"'+key+'",name:"'+kpiname+'", ts:"'+ts+'",value:'+(totalCost/numOfRequest)+',gran:'+conf.gran+', neID:"'+conf.id+',updateTS:'+Date.now()+'"}) , (ne)-[:HAS_KPI_VALUE]->(k) ,(d)-[:HAS_KPI_VALUE]->(k) set k.id=d.id';
                statements.push({statement:statement});

                kpiname='max_request_cost';   //it is hard code.
                key=conf.id+'_'+kpiname+"_"+ts+'_'+conf.gran;
                statement='match (ne:INSTANCE{id:"'+conf.id+'"}),(t:TEMPLATE)-[:HAS_KPI]->(d:KPI_DEF)<-[:HAS_KPI]-(g:GRANULARITY) where d.formula="'+kpiname+'" and g.num='+conf.gran+' and t.type="'+conf.type+'" with ne,d create (k:KPI_VALUE{key:"'+key+'",name:"'+kpiname+'", ts:"'+ts+'",value:'+maxCost+',gran:'+conf.gran+', neID:"'+conf.id+',updateTS:'+Date.now()+'"}) , (ne)-[:HAS_KPI_VALUE]->(k) ,(d)-[:HAS_KPI_VALUE]->(k) set k.id=d.id';
                statements.push({statement:statement});
            }
            n4j.runCypherStatementsReturnErrors(statements,function(err,result) {
                if(err){
                    console.log(err);
                }
            });

        });
    }

    function parseLogMessage(lineMessage){
        //console.log(lineMessage);
        try{
            var context=lineMessage.split(";");
            //console.log('ccccccc',context);
            var ts=context.slice(1,23);

            var user=context[1].split(':')[1].trim();
            var url=context[4].split(':')[1].trim();
            var msg=context[5].split(':')[1].trim();

            console.log('ts===============',ts,user,url,msg);
            //console.log(user,url,msg);
            if(_.startsWith(msg,'Request completed')){
                return({
                    user:user,
                    url:url,
                    value:1,
                    cost:parseFloat((msg.split(' ')[3]))
                });
            }else if(_.startsWith(msg,'"Can\'t')) {
                return ({
                    user: user,
                    url: url,
                    value: 0,
                });
            }

        }catch(e){
            //console.log('eeeeeeeeeeee',e);
            return undefined;
        }

    }
    return S;
}());