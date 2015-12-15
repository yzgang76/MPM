/**
 * Created by yanzhig on 12/12/2015.
 */
var path=require('path');
//var input=require();
var _ = require(path.join(__dirname,'/../node_modules/lodash/index'));
var n4j=require(path.join(__dirname, '/../neo4j_module/neo4j_funs'));
var async=require(path.join(__dirname,'/../node_modules/async/dist/async'));
var C=require(path.join(__dirname,'/../lib/common-funs'));
var Parser = require(path.join(__dirname, '/../lib/parser')).Parser;
module.exports = (function() {
    'use strict';
    var E = {};

    function getResult(result,kpi_name){
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
    }

    function getVars(expression){
        var r =/K\d*/g;
        return expression.match(r);
    }

    E.getSourceKPI = function (kpiids, ts, window_size, nelist, size, skip, order, callback) {
        var matrix = [];

        function _getKPIDef(kpiid, cb) {
            var statement = 'match (k:KPI_DEF) where k.id=' + kpiid + ' return k';
            n4j.runCypherWithReturn([{statement: statement}], function (err, result) {
                if (err) {
                    cb(err);
                }
                var kpi_name = _.get(result, 'results[0].data[0].row[0].name');
                if (kpi_name) {
                    matrix.push({id: kpiid, name: kpi_name});
                    cb(null);
                } else {
                    cb(new Error('Failed to get KPI Name of ' + kpiid));
                }
            });
        }

        function _getAllKPIInfo(err) {
            if (err) {
                callback(new Error('Failed to get KPI Definition', err), null);
            } else {
                var getValue0 = E.makeCypherForRaw(kpiids, ts, window_size, nelist, size, skip, order);
                n4j.runCypherWithReturn([{statement: getValue0}], function (err, result) {
                    if (err) {
                        throw new Error('Fail to get KPIs value');
                    } else {
                        //console.log('get kpi('+kpiid+') value :'+JSON.stringify(_.get(result,'results[0].data')));
                        callback(getResult(result, matrix));
                    }
                });
                //callback( matrix);
            }
        }

        async.each(kpiids, _getKPIDef, _getAllKPIInfo);
    };

    //E.getRawKPIBatch=function(kpiids,ts,window_size,nelist,size,skip,order,callback){
    //    var getValue0= E.makeCypherForRaw(kpiids,ts,window_size,nelist,size,skip,order);
    //
    //};
    /**
     *
     * @param kpiids : kpiids can be a number of an array of number, but if it's an array, all kpis must be raw!!!
     * @param ts
     * @param window_size
     * @param nelist
     * @param size
     * @param skip
     * @param order
     * @returns {string}
     */
    E.makeCypherForRaw=function(kpiids,ts,window_size,nelist,size,skip,order){
        var statement='match (v:KPI_VALUE)<-[:HAS_KPI_VALUE]-(n:INSTANCE) where ';
        if(_.isArray(kpiids)){
            statement=statement+'v.id in'+JSON.stringify(kpiids)+' and '+ (ts-window_size)+'<v.ts<='+ts;
        }else{
            statement=statement+'v.id='+kpiids+' and '+ (ts-window_size)+'<v.ts<='+ts;
        }

        if(nelist&& _.isArray(nelist)&&nelist.length>0){
            statement=statement+' AND n.id in '+JSON.stringify(nelist);
        }
        statement=statement+' return n,v';
        if(order){
            switch(order){
                case 0:
                    statement=statement+' order by n.id';
                    break;
                case 1:
                    statement=statement+' order by n.id desc';
                    break;
                case 2:
                    statement=statement+' order by v.value';
                    break;
                case 3:
                    statement=statement+' order by v.value desc';
                    break;
                default:
                    break;
            }
        }
        if(skip){
            statement=statement + ' skip '+skip;
        }
        if(size&& _.isNumber(size)){
            statement=statement + ' limit '+size;
        }
        return statement;
    };
    E.makeCypherForKPIDefs=function(kpiid){
        return  'match (k:KPI_DEF)<-[:HAS_KPI]-(t:TEMPLATE) with k ,t match (k1:KPI_DEF)<-[:HAS_KPI]-(g:GRANULARITY) where k.id='+kpiid+' and k1.id='+kpiid+' return k,g,t';
    };
    /**
     *
     * @param kpiid : Unique ID of KPI Definition
     * @param ts  : collect time stamp, it will search the value (ts-granularity,ts]
     * @param nelist : the list of NE Instance ID, can be null
     * @param size: max return record size
     * @param skip: skip n records
     * @param order: 0 order by ne id asc,, 1: by kpi value
     */
    E.getKPIValue=function(callback,kpiid, ts,nelist,size,skip,order){
        //function _afterGetRawKPIs(err,data){
        //    console.log('_afterGetRawKPIs',err,data);
        //    callback(err,data);
        //}
        //callback(null,'223');
        var forExpression=false;  //TODO:is it safe???
        function _fetchKPIValue(kpiid,callback){
            var statement=E.makeCypherForKPIDefs(kpiid);
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
                        var kpi_name= forExpression?'K'+kpiid:_.get(kpi_def ,'name');
                        //var type=kpi_def.type;
                        var formula= _.get(kpi_def,'formula');
                        var window_size= _.get(gran,'num')*1000;
                        //console.log(type,formula,window_size);
                        switch(type){
                            case 0:  //raw counter
                                //generate cypher
                                var getValue0= E.makeCypherForRaw(kpiid,ts,window_size,nelist,size,skip,order);
                                n4j.runCypherWithReturn([{statement:getValue0}],function(err,result){
                                    if(err){
                                        throw new Error('Fail to get KPI (' + kpiid + ') value');
                                    }else{
                                        //console.log('get kpi('+kpiid+') value :'+JSON.stringify(getResult(result,kpi_name)));
                                        callback (null,getResult(result,kpi_name));
                                    }
                                });
                                break;
                            case 1:  //calculate
                                var vars=_.map(getVars(formula),function(v){
                                    return v.replace('K','');
                                });
                                //var matrix=[];
                                //_.forEach(vars,function(src){
                                //    matrix.push(E.getKPIValue(src, ts,nelist,size,skip,order));
                                //});

                                //E.getSourceKPI(vars,ts,window_size,nelist,size,skip,order,_afterGetRawKPIs);
                                forExpression=true;
                                async.map(vars,_fetchKPIValue,function(err,data){
                                    if(err){
                                        console.log('_fetchKPIValue error:',err);
                                        callback(err,null);
                                    }else{
                                        var matrix=C.mergeArrays(data,['ne','ts']);
                                        //console.log('complete fetch all source kpis', matrix);

                                        var ret=[];
                                        _.forEach(matrix,function(m){
                                            ret.push(_.set({
                                               ne:m.ne,
                                               ts:m.ts},kpi_name,Parser.evaluate(formula, m)));
                                        });
                                        callback(null,ret);
                                    }
                                });
                                break;
                            case 2:  //time aggregation

                                callback(null,null);
                                break;
                            case 3:  //entity aggregation
                                callback(null,null);
                                break;
                            default:

                                throw new Error ("Unknown KPI Type:"+type);
                                //cb1(null,null);

                        }
                    }

                }catch(e){
                    console.log("getKPIValue error: ", e);
                    callback(e,null);
                }
            });
        }
        _fetchKPIValue(kpiid,callback);

    };
    return E;
})();