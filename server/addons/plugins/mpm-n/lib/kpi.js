/**
 * Created by yanzhig on 12/23/2015.
 */
module.exports = (function() {
    'use strict';
    var _ = require(process.env.ROOT + '/node_modules/lodash/index');
    // var request = require(process.env.ROOT + '/node_modules/request');
    //var fs = require('fs');
    var async = require(process.env.ROOT + '/server/addons/plugins/mpm-n/node_modules/async/lib/async');
    var C = require('./mpm-common');

    var n4j=require('./neo4j_funs');
    //var display = require('./nfvd-artifact-display');
    //var path = require('path');

    var RAW='Raw';
    var CAL='Calculation';
    var TA="Time Aggregation";
    var EA="Entity Aggregation";
    var KPIID;
    var K = {};
    /*function getResult(result,kpi_name){
        var ret=[];
        _.forEach(_.get(result,'results[0].data'),function(d){
            var data={
                ne: _.get(d, 'row[0].id'),
                ts: _.get(d, 'row[1].ts')

            };
            _.set(data,kpi_name,_.get(d, 'row[1].value'));
            ret.push(data);
        });
        //console.log(ret);
        return ret;
    }*/

    function makeObj(headers,row){
        var ret={};
        for(var i=0;i<headers.length;i++){
            _.set(ret,headers[i],row[i]);
        }
        return ret;
    }
    K.getKPIDefinitions=function(req,res){
        var getValue0= 'MATCH (n:KPI_DEF)<-[:HAS_KPI]-(t:TEMPLATE) with n,t MATCH (n1:KPI_DEF)<-[:HAS_KPI]-(g:GRANULARITY)where n.id=n1.id return n.id as id,t.type as ne,g.type as gran,n.name as name,n.type as type ,n.formula as formula,n.unit as unit';
        n4j.runCypherWithReturn([{statement:getValue0}],function(err,result){
            if(err){
                res.status(500).send(err);
                res.end();
            }else{
                //console.log('get kpi('+kpiid+') value :'+JSON.stringify(getResult(result,kpi_name)));
                var ret=[];
                var header=_.get(result,'results[0].columns');
                _.forEach(_.get(result,'results[0].data'),function(r){
                    ret.push(makeObj(header, r.row));
                });
                res.send(ret);
                res.end();
            }
        });
    };
    K.getKPITemplates=function(req,res){
        var getValue0= 'MATCH (n:TEMPLATE) return n';
        n4j.runCypherWithReturn([{statement:getValue0}],function(err,result){
            if(err){
                res.status(500).send(err);
                res.end();
            }else{
                //console.log('get kpi('+kpiid+') value :'+JSON.stringify(getResult(result,kpi_name)));
                var ret=[];
                //var header=_.get(result,'results[0].columns');
                _.forEach(_.get(result,'results[0].data'),function(r){
                    ret=ret.concat(r.row);
                });
                res.send(ret);
                res.end();
            }
        });
    };
    K.getKPISubTemplates=function(req,res){
        var type= _.get(req,'params.type');
        var getValue0= 'MATCH (n:TEMPLATE{type:"'+type+'"})-[:CONTAINS]->(c:TEMPLATE) return c';
        n4j.runCypherWithReturn([{statement:getValue0}],function(err,result){
            if(err){
                res.status(500).send(err);
                res.end();
            }else{
                //console.log('get kpi('+kpiid+') value :'+JSON.stringify(getResult(result,kpi_name)));
                var ret=[];
                //var header=_.get(result,'results[0].columns');
                _.forEach(_.get(result,'results[0].data'),function(r){
                    ret=ret.concat(r.row);
                });
                res.send(ret);
                res.end();
            }
        });
    };
    K.getKPIGranularity=function(req,res){
        var getValue0= 'MATCH (n:GRANULARITY) return n';
        n4j.runCypherWithReturn([{statement:getValue0}],function(err,result){
            if(err){
                res.status(500).send(err);
                res.end();
            }else{
                //console.log('get kpi('+kpiid+') value :'+JSON.stringify(getResult(result,kpi_name)));
                var ret=[];
                //var header=_.get(result,'results[0].columns');
                _.forEach(_.get(result,'results[0].data'),function(r){
                    ret=ret.concat(r.row);
                });
                res.send(ret);
                res.end();
            }
        });
    };
    K.getSourceKPIList=function(req,res){
        console.log(req.query);
        var neType= _.get(req,'query.neType');
        var neGranularity=_.get(req,'query.neGranularity');
        var neKPIType=_.get(req,'query.neKPIType');
        var subNeType=_.get(req,'query.subNeType');
        var subNeGranularity=_.get(req,'query.subNeGranularity');
        console.log('getSourceKPIList',neType,neGranularity,neKPIType);
        var url;
        switch (neKPIType){
            case CAL:
                url='match (e:KPI_DEF)<-[:HAS_KPI]-(n:TEMPLATE{type:"'+neType+'"}) with e,n match (e:KPI_DEF)<-[:HAS_KPI]-(g:GRANULARITY{id:'+neGranularity+'}) return e';
                break;
            case TA:
                url='match (e:KPI_DEF)<-[:HAS_KPI]-(n:TEMPLATE{type:"'+neType+'"}) with e,n match (e:KPI_DEF)<-[:HAS_KPI]-(g:GRANULARITY{id:'+subNeGranularity+'}) return e';
                break;
            case EA:
                url='match (e:KPI_DEF)<-[:HAS_KPI]-(n:TEMPLATE{type:"'+subNeType+'"}) with e,n match (e:KPI_DEF)<-[:HAS_KPI]-(g:GRANULARITY{id:'+neGranularity+'}) return e';
                break;
            default:
                break;
        }
        if(!url){
            res.send([]);
            res.end();
        }else{
            n4j.runCypherWithReturn([{statement:url}],function(err,result){
                if(err){
                    res.status(500).send(err);
                    res.end();
                }else{
                    //console.log('get kpi('+kpiid+') value :'+JSON.stringify(getResult(result,kpi_name)));
                    var ret=[];
                    //var header=_.get(result,'results[0].columns');
                    _.forEach(_.get(result,'results[0].data'),function(r){
                        ret=ret.concat(r.row);
                    });
                    res.send(ret);
                    res.end();
                }
            });
        }
    };
    function getKPIID(callback){
        var url='match (e:KPI_DEF) return max(e.id)';
        if(!KPIID){
            n4j.runCypherWithReturn([{statement:url}],function(err,result){
                if(err){
                    callback(err,null);
                }else{
                    KPIID=_.get(result,'results[0].data[0].row[0]');
                    callback(null,++KPIID);
                }
            });
        }else{
            callback(null,++KPIID);
        }
    }
    K.getKPIID=function(req,res){
        getKPIID(function(err,id){
            if(err){
                res.status(500).send(err);
                res.end();
            }else{
                res.send({ID:KPIID});
                res.end();
            }
        });
    };

    K.createKPI=function(req,res){
        console.log('*********createKPI',req.body);
        function _createKPIDefinitionNode(id,callback){
            console.log('*********_createKPIDefinitionNode',id);
            var data=req.body;
            var statements=[];
            statements.push({statement:'create (:KPI_DEF {id:'+id+',name:"'+data.kpi_name+'",type:0,formula:"'+data.kpi_forumla+'",description:"'+(data.kpi_desc||'')+'",type:'+data.kpi_type+',unit:"'+(data.kpi_unit||'')+'"});'});
            statements.push({statement:'match (k:KPI_DEF {id:'+id+'}) with k match (bts:TEMPLATE {type:"'+data.ne_type+'"}) merge (bts)-[:HAS_KPI]->(k);'});
            statements.push({statement:'match (k:KPI_DEF {id:'+id+'}) with k match (g:GRANULARITY {id:'+data.granularity+'}) merge (g)-[:HAS_KPI]->(k);'});
            n4j.runCypherStatementsReturnErrors(statements,function(err,info){
                if(err){
                    callback(err,null);
                }else{
                    if(info.length>0){
                        callback(info,null);
                    }else{
                        callback(null,null);
                    }
                }
            });
        }
        async.waterfall([
            async.apply(getKPIID),
            async.apply(_createKPIDefinitionNode)
        ],function(err,result){
            if(err) {
                res.status(500).send(err);
                res.end();
            }else{
                res.send({result:"successfully"});
                res.end();
            }
        });

    };
    return K;
})();