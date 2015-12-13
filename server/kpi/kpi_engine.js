/**
 * Created by yanzhig on 12/12/2015.
 */
var path=require('path');
//var input=require();
var _ = require(path.join(__dirname,'/../node_modules/lodash/index'));
var n4j=require(path.join(__dirname, '/../neo4j_module/neo4j_funs'));
var async=require(path.join(__dirname,'/../node_modules/async/dist/async'));
module.exports = (function() {
    'use strict';
    var E = {};

    function getResult(result){
        var ret=[];
        _.forEach(_.get(result,'results[0].data'),function(d){
            ret.push({
                ne: _.get(d, 'row[0].id'),
                ts: _.get(d, 'row[1].ts'),
                value: _.get(d, 'row[1].value')
            });
        });
        console.log(ret);
        return ret;
    }
    function getVars(expression){
        var r =/K\d*/g;
        var vs= expression.match(r);
        return vs;
    }
    E.getKPIValue=function(kpiid, ts){
        var statement='match (k:KPI_DEF)<-[:HAS_KPI]-(t:TEMPLATE) with k ,t match (k1:KPI_DEF)<-[:HAS_KPI]-(g:GRANULARITY) where k.id='+kpiid+' and k1.id='+kpiid+' return k,g,t';
        n4j.runCypherWithReturn([{statement:statement}],function(err,result){
            try {
                if (err) {
                    throw new Error('Fail to get KPI(' + kpiid + ') definition');
                } else {

                    var kpi_def = _.get(result, 'results[0].data[0].row[0]');
                    var gran = _.get(result, 'results[0].data[0].row[1]');
                    var template = _.get(result, 'results[0].data[0].row[2]');

                    if (!(kpi_def && gran && template)) {
                        throw new Error("Error in KPI definition");
                    }

                    var type=_.get(kpi_def,'type');   //TODO: the performance of _.get() ??
                    //var type=kpi_def.type;
                    var formula= _.get(kpi_def, 'formula');
                    var offset= _.get(gran,'num')*1000;
                    console.log(type,formula,offset);
                    switch(type){
                        case 0:  //raw counter
                            var getValue0='match (v:KPI_VALUE)<-[:HAS_KPI_VALUE]-(n:INSTANCE) where v.id='+kpiid+' and '+ (ts-offset)+'<v.ts<='+ts+' return n,v';
                            n4j.runCypherWithReturn([{statement:getValue0}],function(err,result){
                                if(err){
                                    throw new Error('Fail to get KPI (' + kpiid + ') value');
                                }else{
                                    //console.log('get kpi('+kpiid+') value :'+JSON.stringify(_.get(result,'results[0].data')));
                                    return getResult(result);
                                }
                            });
                            break;
                        case 1:  //calculate
                            var vars=_.map(getVars(formula),function(v){
                                return v.replace('K','');
                            });
                            _.forEach(vars,function(kpiid){
                                console.log(kpiid);
                            });
                            break;
                        case 2:  //time aggregation
                            var source_kpiid=0;
                            var getValue2='match (v:KPI_VALUE) where v.id='+source_kpiid+' and '+ (ts-offset)+'<v.ts<='+ts+' return sum(v.value)';
                            n4j.runCypherWithReturn([{statement:getValue2}],function(err,result){
                                if(err){
                                    throw new Error('Fail to get KPI (' + kpiid + ') value');
                                }else{
                                    console.log('get kpi('+kpiid+') value :'+_.get(result,'results[0].data[0].row[0]'));
                                }
                            });
                            break;
                        case 3:  //entity aggregation

                            break;
                        default:
                            throw new Error ("Unknown KPI Type:"+type);

                    }
                }

            }catch(e){
                console.log("getKPIValue error: ", e);
                return undefined;
            }
        });
    };
    return E;
})();