/**
 * Created by yanzhig on 12/12/2015.
 */
var path=require('path');
//var input=require();
var fs = require('fs');
var csv = require(path.join(__dirname,'/../node_modules/csv/lib/index'));
var _ = require(path.join(__dirname,'/../node_modules/lodash/index'));
var n4j=require(path.join(__dirname, '/../neo4j_module/neo4j_funs'));
var os=require('os');
var conf=require(path.join(__dirname,'/../conf/csv_collector'));

module.exports = (function() {
    'use strict';
    var P={};
    function renameFile(file,ext,callback){
        try{
            //fs.rename(path.join(__dirname, _.get(conf,'DIR')+file),path.join(__dirname, _.get(conf,'DIR')+file +'.'+ext),callback);
            fs.rename(file,file +'.'+ext,callback);
        }catch(e){
            console.error('renameFile:',e);
            callback(e);
        }

    }
    P.collectFile=function(file,callback){
        var start_time=os.uptime();
        var t,tx,logMessage;
        tx=new Date().toISOString();
        //fs.readFile(path.join(__dirname, _.get(conf,'DIR')+file), 'utf-8', function(err, data) {
        console.log("[CSV Collector]: start to collect file:",file);
        fs.readFile(file, 'utf-8', function(err, data) {
            if (err) {
                console.log('Failed to open csv file '+file+'. Error:'+err);
                t=os.uptime();

                logMessage={
                    Time:tx,
                    Cost:(t-start_time),
                    Type:'Error',
                    Module:conf.name,
                    Message:'Fail to open file:'+file
                };
                renameFile(file,'completed',function(err){
                    callback(logMessage);
                });

            } else {
                renameFile(file,'processing',function(err){
                    if(err){
                        console.log('err222',err);
                        callback(err,null);
                    }else{
                        csv.parse(data, {comment: '#'}, function(error, output){
                            if(err){
                                console.log('Failed to parse csv file '+file+'. Error:'+error);
                                t=os.uptime();

                                logMessage={
                                    Time:tx,
                                    Cost:(t-start_time),
                                    Type:'Error',
                                    Module:conf.name,
                                    Message:'Fail to parse file:'+file
                                };
                                renameFile(file+'.processing','completed',function(ret){
                                    callback(logMessage);
                                });
                            }else{
                                if(output.length<=1){
                                    console.log('There is no data in file '+file);
                                    renameFile(file+'.processing','completed',function(ret){
                                        callback(logMessage);
                                    });
                                }else{
                                    var header= output[0];
                                    //console.log("header: ", header);
                                    var parentType=header[0].trim();
                                    var myType=header[1].trim();
                                    //var gran=header[3].trim();

                                    var data= _.drop(output);  //TODO: pagination
                                    var statements=[];

                                    var parents=[];
                                    var children=[];
                                    _.forEach(data,function(line){
                                        //TODO many duplicate, can optimize
                                        var parentID=line[0].trim();
                                        if(parentID!=='' && !_.includes(parents,parentID)){  //create parent node
                                            statements.push({statement:'match (t:TEMPLATE {type:"'+parentType+'"}) with t merge (i:INSTANCE:'+parentType+'{id:"'+parentID+'",type:"'+parentType+'"}) with t,i merge (t)-[:HAS_INSTANCE]->(i)'});
                                            //statements.push({statement:'match (t:TEMPLATE {type:"'+parentType+'"}) with t match (i:INSTANCE {id:"'+parentID+'"}) merge (t)-[:HAS_INSTANCE]->(i)'});
                                            parents.push(parentID);
                                        }
                                        var myID=line[1].trim();
                                        if(myID!==''&& !_.includes(children,myID)){  //create child node
                                            statements.push({statement:'match (t:TEMPLATE {type:"'+myType+'"}) with t merge (i:INSTANCE:'+myType+'{id:"'+myID+'",type:"'+myType+'"}) with t,i merge (t)-[:HAS_INSTANCE]->(i)'});
                                            //statements.push({statement:'match (t:TEMPLATE {type:"'+myType+'"}) with t match (i:INSTANCE {id:"'+myID+'"}) create (t)-[:HAS_INSTANCE]->(i)'});

                                            children.push(myID);
                                        }

                                        //create relationship between parent and child
                                        statements.push({statement:'match (p:INSTANCE {id:"'+parentID+'"}) with p merge (c:INSTANCE {id:"'+myID+'"}) create (p)-[:HAS_CHILD]->(c)'});


                                        var ts=parseInt(line[2]);
                                        var gran=parseInt(line[3]);
                                        if(_.isNaN(ts)|| _.isNaN(gran)){
                                            console.log("Illegal timestamp or granularity");
                                            return;
                                        }

                                        //KPIs
                                        for(var i=4; i<line.length;i++){
                                            var kpiname=header[i];
                                            var value=line[i]; //todo validate value
                                            var nValue=parseFloat(value);
                                            var key=myID+'_'+kpiname+"_"+ts+'_'+gran;
                                            if(_.isNaN(nValue)){  //string
                                                statements.push({statement:'match (ne:INSTANCE{id:"'+myID+'"}),   (d:KPI_DEF)<-[:HAS_KPI]-(g:GRANULARITY) where d.formula="'+kpiname+'" and g.num='+gran+' with ne,d create (k:KPI_VALUE{key:"'+key+'",name:"'+kpiname+'", ts:'+ts+',value:"'+value+'",gran:'+gran+', neID:"'+myID+',updateTS:'+Date.now()+'"}) , (ne)-[:HAS_KPI_VALUE]->(k) ,(d)-[:HAS_KPI_VALUE]->(k) set k.id=d.id'});
                                            }else{  //number
                                                statements.push({statement:'match (ne:INSTANCE{id:"'+myID+'"}),   (d:KPI_DEF)<-[:HAS_KPI]-(g:GRANULARITY) where d.formula="'+kpiname+'" and g.num='+gran+' with ne,d create (k:KPI_VALUE{key:"'+key+'",name:"'+kpiname+'", ts:'+ts+',value:'+value+',gran:'+gran+', neID:"'+myID+',updateTS:'+Date.now()+'"}) , (ne)-[:HAS_KPI_VALUE]->(k) ,(d)-[:HAS_KPI_VALUE]->(k) set k.id=d.id'});
                                            }
                                        }
                                    });

                                    //connect to kpi definition
                                    //statements.push({statement:'match (k:KPI_VALUE) with k match (d:KPI_DEF) where k.name=d.formula match(d)<-[:HAS_KPI]-(g:GRANULARITY) where g.num=k.gran create (d)-[:HAS_KPI_VALUE]->(k) set k.id=d.id'});
                                    //console.log(statements);
                                    n4j.runCypherStatementsReturnErrors(statements,function(err,result){
                                        t=os.uptime();
                                        logMessage={
                                            Time:tx,
                                            Cost:t-start_time,
                                            Type:'INFO',
                                            Module:conf.name,
                                            Message:'Success to collect file:'+file+'. Line of content:'+ Math.max((output.length-1),0),
                                            errors:err
                                        };
                                        renameFile(file+'.processing','completed',function(ret){
                                            callback(logMessage);
                                        });
                                        //callback(logMessage);
                                    });
                                }
                                ////the file will be rename during ingestion
                                //renameFile(file+'.processing','completed',function(ret){
                                //    //callback(logMessage);
                                //});
                            }
                        });
                    }
                });

            }

        });
    };

    return P;
})();
