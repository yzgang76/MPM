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

module.exports = (function() {
    'use strict';
    var S = {};
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
            var user=context[1].split(':')[1].trim();
            var url=context[4].split(':')[1].trim();
            var msg=context[5].split(':')[1].trim();
            //console.log(user,url,msg);
            if(_.startsWith(msg,'Request completed')){
                return({
                    user:user,
                    url:url,
                    cost:parseFloat((msg.split(' ')[3]))
                });
            }

        }catch(e){
            //console.log('eeeeeeeeeeee',e);
            return undefined;
        }

    }
    return S;
}());