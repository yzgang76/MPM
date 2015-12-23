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
    return K;
})();