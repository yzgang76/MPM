/**
 * Created by yanzhig on 12/12/2015.
 */
var path=require('path');
//var input=require();
var fs = require('fs');
var csv = require(path.join(__dirname,'/../node_modules/csv/lib/index'));
var _ = require(path.join(__dirname,'/../node_modules/lodash/index'));
var n4j=require(path.join(__dirname, '/../neo4j_module/neo4j_funs'));
module.exports = (function() {
    'use strict';
    var P={};
    P.collectFile=function(file){
        fs.readFile(path.join(__dirname,'/../data/'+file), 'utf-8', function(err, data) {
            if (err) {
                console.log('Failed to open csv file '+file+'. Error:'+err);
            } else {
                csv.parse(data, {comment: '#'}, function(error, output){
                    if(err){
                        console.log('Failed to parse csv file '+file+'. Error:'+error);
                    }else{
                        if(output.length<=1){
                            console.log('There is no data in file '+file);
                        }else{
                            var header= output[0];
                            //console.log("header: ", header);
                            var parentType=header[0].trim();
                            var myType=header[1].trim();
                            //var gran=header[3].trim();

                            var data= _.drop(output);
                            var statements=[];

                            var parents=[];
                            var children=[];
                            _.forEach(data,function(line){
                                //TODO many duplicate, can optimize
                                var parentID=line[0].trim();
                                if(parentID!=='' && !_.includes(parents,parentID)){
                                    statements.push({statement:'merge (:INSTANCE:'+parentType+'{id:"'+parentID+'",type:"'+parentType+'"})'});
                                    statements.push({statement:'match (t:TEMPLATE {type:"'+parentType+'"}) with t match (i:INSTANCE {id:"'+parentID+'"}) merge (t)-[:HAS_INSTANCE]->(i)'});
                                    parents.push(parentID);
                                }
                                var myID=line[1].trim();
                                if(myID!==''&& !_.includes(children,myID)){
                                    statements.push({statement:'merge (:INSTANCE:'+myType+'{id:"'+myID+'",type:"'+myType+'"})'});
                                    statements.push({statement:'match (t:TEMPLATE {type:"'+myType+'"}) with t match (i:INSTANCE {id:"'+myID+'"}) merge (t)-[:HAS_INSTANCE]->(i)'});
                                    statements.push({statement:'match (p:INSTANCE {id:"'+parentID+'"}) with p match (c:INSTANCE {id:"'+myID+'"}) merge (p)-[:HAS_CHILD]->(c)'});
                                    children.push(myID);
                                }


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
                                    var key=myID+'_'+kpiname+"_"+ts+gran;
                                    if(_.isNaN(nValue)){  //string
                                        statements.push({statement:'match (ne:INSTANCE{id:"'+myID+'"}) with ne create (k:KPI_VALUE{key:"'+key+'",name:"'+kpiname+'", ts:'+ts+',value:"'+value+'",gran:'+gran+', neID:"'+myID+'"}) , (ne)-[:HAS_KPI_VALUE]->(k) '});
                                    }else{  //number
                                        statements.push({statement:'match (ne:INSTANCE{id:"'+myID+'"}) with ne create (k:KPI_VALUE{key:"'+key+'",name:"'+kpiname+'", ts:'+ts+',value:'+nValue+',gran:'+gran+', neID:"'+myID+'"}) , (ne)-[:HAS_KPI_VALUE]->(k) '});
                                    }
                                }
                            });

                            //connect to kpi definition
                            statements.push({statement:'match (k:KPI_VALUE) with k match (d:KPI_DEF) where k.name=d.formula match(d)<-[:HAS_KPI]-(g:GRANULARITY) where g.num=k.gran merge (d)-[:HAS_KPI_VALUE]->(k) set k.id=d.id'});
                            console.log(statements);
                            n4j.runCypherStatements(statements);
                        }
                    }
                });
            }
        });


    };

    return P;
})();
