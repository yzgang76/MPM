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
//var os=require('os');
var conf=require(path.join(__dirname,'/../conf/nfvd_log'));
var async=require(path.join(__dirname,'/../node_modules/async/dist/async'));
var cypherMaker=require(path.join(__dirname,'/../lib/cypherMaker'));
module.exports = (function() {
    'use strict';
    var S = {};
    var domain="NFVD";
    var neType="NFVD_GUI_SERVER_REQUEST";
    var kpiName1='Server_Response';
    var kpiID1;
    var kpiName2='Server_Request_cost';
    var kpiID2;

    var uris=[];
    var users=[];
    String.prototype.Right = function(len){
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
    S.createModelAndRegisterKPIs=function(){
        //var url= _.get(conf,'mpm_console.url');
        //var mpm_server= _.get(conf,'mpm_console.server');
        function _createModel(callback){
            var statements=cypherMaker.getCypherInjectNFVDGUIModel();
            n4j.runCypherStatementsReturnErrors(statements,function(err,results){
                if(err){
                    console.log('Failed to create Model', err);
                    callback(err,null);
                }else{
                    callback(null,results);
                }
            });

        }
        /*function _crateKPIDefinitions(kpiName,unit,callback){
            //create KPI definitions
            var stat='match (k:KPI_DEF{name:"'+kpiName+'",type:0})<-[:HAS_KPI]-(t:TEMPLATE{type:"NFVD_GUI_SERVER_REQUEST"}) with k match (k)<-[:HAS_KPI]-(g:GRANULARITY{num:0}) return k';
            //console.log('ssssssssssss',stat);
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

        }*/
        function _createServerInstance(callback){
            //var statement='merge (e:INSTANCE:NFVD_GUI_SERVER{id:"'+conf.id+'",type:"NFVD_GUI_SERVER"}) with e match  (server:TEMPLATE {type:"NFVD_GUI_SERVER"}) merge (server)-[:HAS_INSTANCE]->(e)';
            n4j.runCypherStatementsReturnErrors(cypherMaker.getCypherInjectNFVDGUIServerInstance(conf.id),function(err,result) {
                console.log(err, result);
               callback(err,result);
            });
        }
        async.series([
            async.apply(_createModel),
            //async.apply(_crateKPIDefinitions,kpiName1,null),
            //async.apply(_crateKPIDefinitions,kpiName2,'s'),
            async.apply(C.registerKPI,domain,neType,0,kpiName1,null,null,"Server Response"),
            async.apply(C.registerKPI,domain,neType,0,kpiName2,null,'s',"Server Request Cost"),
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
            var r =/nfvd-api.log-\d*-\d*-\d*/g;
            files=_.filter(files,function(file){
                if(date&&date!=='*'){
                    return  _.endsWith(file,'nfvd-api.log-'+date);
                }else if(date==='*'){
                    return file.match(r)||_.endsWith(file,'nfvd-api.log');
                }else{
                    return _.endsWith(file,'nfvd-api.log');
                }

            });
            console.log(files);
            _.forEach(files,function(f){
                collectFileEx(f);
            });
        });
    };
    function collectFileEx(file){
        //var numOfRequest=0;
        //var totalCost=0;
        //var maxCost=-1;
        var statements=[];
        function _processEvent(r,v){
            //console.log('_processEvent',r);
            var user= _.get(r,'userName');
            var uri= _.get(r,'url');
            if(user&&uri){
                //var statement="";
                if(!_.includes(users,user)){
                    //add new instance
                    statements=statements.concat(cypherMaker.getCypherInjectNFVDGUIUserInstance(user));
                    //statement='match (t:TEMPLATE{key:"NFVD/NFVD_GUI_USER"}) with t  merge (user:INSTANCE{key:"NFVD/NFVD_GUI_USER/"+user,id:"'+user+'", type:"NFVD_GUI_USER"}) with t ,user merge (t)-[:HAS_INSTANCE]->(user)';
                    //statements.push({statement:statement});
                    users.push(user);
                }
                uri=uri.replaceAll('"','');

                if(!_.includes(uris,uri)){
                    //add new instance
                    //statement='match (t:TEMPLATE{key:"NFVD/NFVD_GUI_SERVER_REQUEST"}) with t merge (uri:INSTANCE:NFVD_GUI_SERVER_REQUEST{id:"'+uri+'", type:"NFVD_GUI_SERVER_REQUEST"}) with t, uri merge (t)-[:HAS_INSTANCE]->(uri)';
                    //statements.push({statement:statement});
                    statements=statements.concat(cypherMaker.getCypherInjectNFVDGUIUriInstance(uri));
                    uris.push(uri);
                }


                statements=statements.concat(cypherMaker.getCypherInjectNFVDInventoryRelationships(conf.id,user,uri));

                var cost= _.get(r,'cost');
                var ts= _.get(r,'ts');
                //var key;
                if(cost&&ts){
                    //key=uri+"_Server_Request_cost_"+ts;
                    //statement='match(g:GRANULARITY)-[:HAS_KPI]->(d:KPI_DEF{formula:"Server_Request_cost"})<-[:HAS_KPI]-(t:TEMPLATE{key:"NFVD/NFVD_GUI_SERVER_REQUEST"})-[:HAS_INSTANCE]->(ne:INSTANCE{key:"NFVD/NFVD_GUI_REQUEST/'+uri+'"}) with g,ne ,d create (k:KPI_VALUE{key:"'+key+'",name:"Server_Request_cost", ts:'+ r.ts+',value:'+parseFloat(cost)+', neID:"'+uri+'",updateTS:'+Date.now()+'}) , (ne)-[:HAS_KPI_VALUE]->(k) ,(d)-[:HAS_KPI_VALUE]->(k) set k.id=d.id , k.gran=g.num';
                    //statements.push({statement:statement});
                    statements=statements.concat(cypherMaker.getCypherInjectServerRequestCost(uri,ts,cost));
                }

                if(ts){
                    //key=uri+"Server_Response"+ts;
                    //statement='match(g:GRANULARITY)-[:HAS_KPI]->(d:KPI_DEF{formula:"Server_Response"})<-[:HAS_KPI]-(t:TEMPLATE{id:"NFVD_GUI_SERVER_REQUEST"})-[:HAS_INSTANCE]->(ne:INSTANCE{id:"'+uri+'"}) with g,ne ,d create (k:KPI_VALUE{key:"'+key+'",name:"Server_Response", ts:'+ r.ts+',value:"'+v+'", neID:"'+uri+'", returnCode:"'+r['return code']+'",method:"'+ r.method+'",updateTS:'+Date.now()+'}) , (ne)-[:HAS_KPI_VALUE]->(k) ,(d)-[:HAS_KPI_VALUE]->(k) set k.id=d.id, k.gran=g.num';
                    //statements.push({statement:statement});
                    statements=statements.concat(cypherMaker.getCypherInjectServerReponse(uri,ts,r['return code'],r.method,v));
                }

            }


        }
        fs.readFile(file,'utf8', function(err, data) {
            if (err) {
                throw err;
            }
            var lines=data.split('\n');

            _.forEach(lines,function(l){
                //console.log(l);
                if(l){
                    var r=parseLogMessageEx(l);
                    if(_.get(r,'addon')==='nfvd'){
                        switch(_.get(r,'message').replaceAll('"','')){
                            case 'Request completed':
                                _processEvent(r,0);
                                break;
                            case 'Request failed':
                                _processEvent(r,1);
                                break;
                            case 'Request rejected':
                                _processEvent(r,-1);
                                break;
                            default:
                                break;
                        }
                    }
                }
            });
            if(statements.length>0){
                console.log(statements);
                n4j.runCypherStatementsReturnErrors(statements,function(err,result){
                    console.log("result of collect file", file);
                    console.log(result);
                });
            }
        });
    }
    function parseLogMessageEx(lineMessage){
        //2016-01-25 09:56:19.899] [INFO] nfvd-api-logger - addon: nfvd;   userName: wallman@IT_Reseller;   userToken: d6fa255d-90b2-489c-8f42-b9b7db05b478;  userRemoteAddress: ::1;    requestRoute: /V1.0/domains/nfvd/vdcm/tenant/5fdc2ca4-eb4c-4115-9468-81d255f1c2b4/vappGroups;    message: Request completed;  cost: 0.6590000000001055s; method:GET; return code:200; url:http://16.17.88.149:8080/nfvd-ext/domains/907b90a5-8c02-42e7-b0e6-35645733bbb7/organizations/331ca670-9c89-4eb6-af46-fb2a44431475/tenants/5fdc2ca4-eb4c-4115-9468-81d255f1c2b4/vnfs;
        var ret={};
        try{
            var context=lineMessage.split(";");
            //console.log('ccccccc',context[0]);
            ret.time=context[0].slice(1,24);
            var st=ret.time.replaceAll('-','/');
            ret.addon=_.trim(context[0].split(":")[3]);
            ret.ts=new Date(st).getTime();
            for(var i=1;i<context.length;i++){
                var t=context[i].split(":");
                if(t.length>1){
                    var key=_.trim(t[0]);
                    var value=
                        key==="url"?
                        _.trim(t[1])+":"+t[2]+":"+t[3]
                        :_.trim(t[1]);
                    _.set(ret, key,value );
                }
            }
            //console.log('rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',ret);
            return(ret);

        }catch(e){
            console.log('eeeeeeeeeeee',e,ret);
            return undefined;
        }

    }
    /*S.collect=function(){
     console.log(conf);
     var statement='merge (e:INSTANCE:'+conf.type+'{id:"'+conf.id+'",type:"'+conf.type+'"})';
     n4j.runCypherStatementsReturnErrors([{statement:statement}],function(err,result){
     if(!err){
     C.walk(conf.path,function(err,files){
     var r =/nfvd-api.log-\d*-\d*-\d*!/g;
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

     };*/
    /*function collectFile(file){
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
     }*/
    /*function parseLogMessage(lineMessage) {
     //console.log(lineMessage);
     try {
     var context = lineMessage.split(";");
     //console.log('ccccccc',context);
     var ts = context.slice(1, 23);

     var user = context[1].split(':')[1].trim();
     var url = context[4].split(':')[1].trim();
     var msg = context[5].split(':')[1].trim();

     console.log('ts===============', ts, user, url, msg);
     //console.log(user,url,msg);
     if (_.startsWith(msg, 'Request completed')) {
     return ({
     user: user,
     url: url,
     value: 1,
     cost: parseFloat((msg.split(' ')[3]))
     });
     }

     } catch (e) {
     //console.log('eeeeeeeeeeee',e);
     return undefined;
     }
     }*/
    return S;
}());