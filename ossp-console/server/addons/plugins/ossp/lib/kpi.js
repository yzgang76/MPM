/**
 * Created by yanzhig on 12/23/2015.
 */
module.exports = (function() {
    'use strict';
    var _ = require(process.env.ROOT + '/node_modules/lodash/index');
    // var request = require(process.env.ROOT + '/node_modules/request');
    //var fs = require('fs');
    var async = require(process.env.ROOT + '/server/addons/plugins/ossp/node_modules/async/lib/async');
    var cypherMaker=require(process.env.ROOT + '/server/addons/plugins/ossp/lib/cypherMaker');
    var C = require('./ossp-common');

    var n4j=require('./neo4j_funs');
    var cMaker=require('./cypherMaker');
    //var display = require('./nfvd-artifact-display');
    //var path = require('path');

    //var RAW='Raw';
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
        //var getValue0= 'MATCH (d:DOMAIN)-->(t:TEMPLATE)-[:HAS_KPI]->(n:KPI_DEF)<-[:HAS_KPI]-(g:GRANULARITY)  return d.name as domain, n.id as id,t.type as ne,g.type as gran,n.name as name,n.type as type ,n.formula as formula,n.unit as unit,n.description as description';
        n4j.runCypherWithReturn(cypherMaker.getCypherForGetKPIDefinitionList(),function(err,result){
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
    K.getDomains=function(req,res){
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
    K.getKPIDomains=function(req,res){
        var getValue0= 'MATCH (n:DOMAIN) return n';
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
    K.getKPITemplatesByDomain=function(req,res){
        var domain= _.get(req,'params.domain');
        var getValue0= 'MATCH (d:DOMAIN{name:"'+domain+'"})-->(n:TEMPLATE) return n';
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
        var domain= _.get(req,'params.domain');
        var id= _.get(req,'params.type');
        var getValue0= 'MATCH (n:TEMPLATE{key:"'+domain+'/'+id+'"})-[*..4]->(c:TEMPLATE) return c';
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
        var domain= _.get(req,'query.domain');
        var neType= _.get(req,'query.neType');
        var neGranularity=_.get(req,'query.neGranularity');
        var neKPIType=_.get(req,'query.neKPIType');
        var subNeType=_.get(req,'query.subNeType');
        var subNeGranularity=_.get(req,'query.subNeGranularity');
        console.log('getSourceKPIList',neType,neGranularity,neKPIType);
        var url;
        switch (neKPIType){
            case CAL:
                url='match (e:KPI_DEF)<-[:HAS_KPI]-(n:TEMPLATE{key:"'+domain+'/'+neType+'"}) with e,n match (e:KPI_DEF)<-[:HAS_KPI]-(g:GRANULARITY{id:'+neGranularity+'}) return e';
                break;
            case TA:
                url='match (e:KPI_DEF)<-[:HAS_KPI]-(n:TEMPLATE{key:"'+domain+'/'+neType+'"}) with e,n match (e:KPI_DEF)<-[:HAS_KPI]-(g:GRANULARITY{id:'+subNeGranularity+'}) return e';
                break;
            case EA:
                url='match (e:KPI_DEF)<-[:HAS_KPI]-(n:TEMPLATE{key:"'+domain+'/'+subNeType+'"}) with e,n match (e:KPI_DEF)<-[:HAS_KPI]-(g:GRANULARITY{id:'+neGranularity+'}) return e';
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
        //var url='match (e:KPI_DEF) return max(e.id)';
        if(!KPIID&&KPIID!==0){
          /*  n4j.runCypherWithReturn([{statement:url}],function(err,result){
                if(err){
                    callback(err,null);
                }else{
                    KPIID=_.get(result,'results[0].data[0].row[0]');
                    callback(null,++KPIID);
                }
            });*/
            callback('Init KPIID Failed',null);
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
                res.send({ID:id});  //===KPIID
                res.end();
            }
        });
    };

    K.createKPI=function(req,res){
        //console.log('*********createKPI',req.body);
        function _createKPIDefinitionNode(callback){
            var data=req.body;
            //if kpi already registered
            async.waterfall([
                function (callback){
                    var statements=cMaker.getCypherForLookupKPIDefinition(data.domain,data.ne_type,data.granularity,data.kpi_name,data.kpi_type,data.kpi_formula);
                    n4j.runCypherWithReturn(statements,function(err,result){
                        callback(err,result);
                    });
                },
                function(kd,callback){
                    //console.log('kkkkkkkkkkkkkkk',kd,callback);
                    var _id=_.get(kd,'results[0].data[0].row[0]');
                    if(!_id){
                        getKPIID(function(err,id){
                            var statements=cMaker.getCypherForRegisterKPIDefinition(data.domain,data.ne_type,data.granularity,id,data.kpi_name,data.kpi_type,data.kpi_formula,data.kpi_unit,data.kpi_desc);
                            n4j.runCypherStatementsReturnErrors(statements,function(err,info){
                                console.log('iiiiiiiiiiiiiii',id,info);
                                if(err){
                                    callback(err,id);
                                }else{
                                    if(info.length>0){
                                        callback(info,id);
                                    }else{
                                        callback(null,id);
                                    }
                                }
                            });
                        });
                    }else{
                        console.log("KPI has defined");
                        callback(null,_id);
                    }
                }

            ],function(err,results){
                callback(err,results);
            });
        }
        _createKPIDefinitionNode(function(err,result){
            if(err) {
                res.status(500).send(err);
                res.end();
            }else{
                res.send({id:result});
                res.end();
            }
        });
        //async.waterfall([
        //    //async.apply(getKPIID),
        //    async.apply(_createKPIDefinitionNode)
        //],function(err,result){
        //    console.log('33333333333333333333');
        //    if(err) {
        //        res.status(500).send(err);
        //        res.end();
        //    }else{
        //        res.send({id:result});
        //        res.end();
        //    }
        //});

    };
    K.createKPIForExternalGetRequest=function(req,res){
        req.body={};
        _.set(req.body,'domain',_.get(req,'query.domain'));
        _.set(req.body,'kpi_name',_.get(req,'query.kpi_name'));
        _.set(req.body,'kpi_formula',_.get(req,'query.kpi_formula'));
        _.set(req.body,'kpi_desc',_.get(req,'query.kpi_desc'));
        _.set(req.body,'kpi_type',_.get(req,'query.kpi_type'));
        _.set(req.body,'kpi_unit',_.get(req,'query.kpi_unit'));
        _.set(req.body,'ne_type',_.get(req,'query.ne_type'));
        _.set(req.body,'granularity',_.get(req,'query.granularity'));
        //console.log('*********createKPIForExternalGetRequest',req.body);
        K.createKPI(req,res);

    };
    var url='match (e:KPI_DEF) return max(e.id)';
    n4j.runCypherWithReturn([{statement:url}],function(err,result){
        if(err){
            console.error(err);
        }else{
            KPIID=_.get(result,'results[0].data[0].row[0]')||0;
            console.log('Init KPI ID=',KPIID);

        }
    });

    //K.getKPIValue=function(req,res){
    //    var url='/collect/kpi/value';
    //
    //};
    K.getKPIsForNFVDGUIRequestMonitor=function(req,res){
        var url='/collect/kpi/nfvd-gui-request';
        C.makeQuery('http://localhost:3001',url,function(err,r,body){
            if(err){
                //console.log("getAllNode return with error: ",JSON.stringify(err),body);
                console.log({
                    headers: _.get(r,'headers'),
                    errors:body
                });
                res.status(500).send(err);
                res.end();
            }else{
                //console.log('makeQuery return :',JSON.stringify(body));
                res.send(body);
                res.end();
            }
        },'GET',null,false);
    };

    return K;
})();