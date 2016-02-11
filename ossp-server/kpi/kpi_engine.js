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
    //[{"ne":"BTS_group48_56","ts":1452334573000,"CSSR":1.0909090909090908},{"ne":"BTS_group49_34","ts":1452334573000,"CSSR":1.0909090909090908}...]
    function sortAndPagination(result,size,offset,order){
        if(result.length>2){
            var kpiName= _.find(_.keys(result[0]),function(k){
                return k!=='ne'&&k!=='ts';
            });
            switch(order){
                case 0:
                    result=_.sortByOrder(result, ['ne'], ['asc']);
                    break;
                case 1:
                    result=_.sortByOrder(result, ['ne'], ['desc']);
                    break;
                case 2:
                    result=_.sortByOrder(result, [kpiName], ['asc']);
                    break;
                case 3:
                    result=_.sortByOrder(result, [kpiName], ['desc']);
                    break;
                default:
                    break;
            }
        }

        return _.slice(result,offset?offset:0,size?offset?offset+size:size:result.length);
    }

    function getResult(result,kpi_name,size,offset,order){
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
        switch(order){
            case 0:
                ret=_.sortByOrder(ret, ['ne'], ['asc']);
                break;
            case 1:
                ret=_.sortByOrder(ret, ['ne'], ['desc']);
                break;
            case 2:
                ret=_.sortByOrder(ret, [kpi_name], ['asc']);
                break;
            case 3:
                ret=_.sortByOrder(ret, [kpi_name], ['desc']);
                break;
            default:
                break;
        }
        return _.slice(ret,offset?offset:0,size?offset?offset+size:size:result.length);
        //return ret;
    }
    function getVars(expression){
        var r =/K\d*/g;
        return expression.match(r);
    }
    function getFun(expression){
        var r =/^\w+/g;
        return expression.match(r);
    }
    function getAggregationResult(method,src_kpi_name,kpiName,ts,ne,data){
        //for time aggr
        //console.log('*******getAggregationResult',method,src_kpi_name,kpiName,ts,ne);
        var ret;
        switch(method.toLowerCase()){
            case 'sum':
                ret= _.sum(data,function(obj){
                    return _.get(obj,src_kpi_name);
                });
                break;
            case 'avg':
                if(data.length){
                    ret=0;
                }else{
                    ret= _.sum(data,function(obj){
                        return _.get(obj,src_kpi_name);
                    });
                    ret=ret/data.length;  //TODO: filter invalid data?
                }
                break;
            case 'count':
                ret=data.length;
                break;
            case 'min':
                ret= _.min(data,function(obj){
                    return _.get(obj,src_kpi_name);
                });
                break;
            case 'max':
                ret= _.max(data,function(obj){
                    return _.get(obj,src_kpi_name);
                });
                break;
            default:
                console.log('Unknown aggregation method: ',method);
                break;
        }

        return _.set({
            ne:ne,
            ts:ts
        },kpiName,ret);
    }

    /**
     *
     * @param result -  [ { row: [ 'BSC2', 3 ] },
                          { row: [ 'BSC2', 2 ] },
                          { row: [ 'BSC1', 3 ] },
                          { row: [ 'BSC1', 2 ] } ]
     * @returns -[ { row: [ 'G1', 'BSC2' ] }, { row: [ 'G1', 'BSC1' ] } ]
     */
    function reformatResult(result){
        var ret={};
        _.forEach(result,function(d){
            var n= d.row[0];
            var r=_.get(ret,n);
            if(!r){
                _.set(ret,n,[]);
                r=_.get(ret,n);
            }
            r.push(d.row[1]);
        });
        return ret;
    }
    function getValue(method,data){
        var ret;
        switch(method.toLowerCase()){
            case 'sum':
                ret=_.sum(data);
                break;
            case 'avg':
                if(data.length){
                    ret=0;
                }else{
                    ret= _.sum(data);
                    ret=ret/data.length;  //TODO: filter invalid data?
                }
                break;
            case 'count':
                ret=data.length;
                break;
            case 'min':
                ret= _.min(data);
                break;
            case 'max':
                ret= _.max(data);
                break;
            default:
                console.log('Unknown aggregation method: ',method);
                break;
        }
        return ret;
    }
    function getAggregationResult2(method,ts,kpi_name, data){
        //for entity aggr
        //console.log('getAggregationResult2',method,ts,kpi_name,data);

        var ret=reformatResult(data);
        var ret2=[];
        _.forEach(ret,function(v,k){
            ret2.push(_.set({ne:k, ts:ts},kpi_name,getValue(method,v)));
        });
        return ret2;

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
    E.getKPIDef=function(kpiid,callback){
        var statement=E.makeCypherForKPIDefs(kpiid);
        n4j.runCypherWithReturn([{statement:statement}],function(err,result) {
            if (err) {
                console.log('getKPIDef('+kpiid+') error:',err);
                callback(err,null);
            } else {
                callback(null,{
                    kpi_def: _.get(result, 'results[0].data[0].row[0]'),
                    gran: _.get(result, 'results[0].data[0].row[1]'),
                    template: _.get(result, 'results[0].data[0].row[2]')
                });
            }
        });
    };
    E.makeCypherForKPIDefs=function(kpiid){
        return  'match (g:GRANULARITY)-[:HAS_KPI]->(k:KPI_DEF)<-[:HAS_KPI]-(t:TEMPLATE)  where k.id='+kpiid+' return k,g,t';
    };
    /**
     *  get kpi in a ts range
     * @param callback
     * @param kpiid
     * @param ts
     * @param window_size
     * @param nelist
     * @param size
     * @param skip
     * @param order
     */
    E.getKPIValueWithinWindow=function(callback,kpiid, ts,window_size,nelist,size,skip,order) {
        console.log('*************getKPIValueWithinWindow',kpiid, ts,window_size,nelist,size,skip,order);
        E.getKPIDef(kpiid,function(err,def){
            function _fetchKPI(ts,callback){
                console.log('to getKPIValue',kpiid, ts,nelist,size,skip,order,def);
                E.getKPIValue(callback,kpiid, ts,nelist,size,skip,order,def,true);
            }
            function _afterFetchAllKPI(err,data){
                if(err){
                    console.log("err1:",err);
                    callback(err,null);
                }
                else{
                    console.log('_afterFetchAllKPI:', _.flatten(data));
                    callback(null,_.flatten(data));
                }

            }
            if(err){
                console.log("err1:",err);
                callback(err,null);
            }else{
                var gran= _.get(def, 'gran.seconds');
                if(gran){
                    var tss=[];
                    for(var t=ts;t>ts-window_size;t=t-gran*1000){
                        tss.push(t);
                    }
                    console.log(tss);
                    async.map(tss,_fetchKPI,_afterFetchAllKPI);
                }else if(gran===0){
                    //real time
                    if(def.kpi_def.type!==0){
                        callback(new Error("Unsupported KPI type"),null);
                    }else{
                        //get raw kpis in time range, return as
                        //[ { ne: 'BTS2', ts: 100002700000, K0: 3 },
                        //    { ne: 'BTS21', ts: 100002700000, K0: 2 }]
                        var statement=E.makeCypherForRaw(def.kpi_def.id,ts,window_size,nelist,size,skip,order);
                        //console.log('aaaaaaaaaaaaaaaaaaaaaaaaaa',statement);
                        n4j.runCypherWithReturn([{statement:statement}],function(err,result){
                            if(err){
                                throw new Error('Fail to get KPI (' + def.kpi_def.id + ') value');
                            }else{
                                //console.log('get kpi('+kpiid+') value :'+JSON.stringify(getResult(result,kpi_name)));
                                callback (null,getResult(result,'K'+def.kpi_def.id));
                            }
                        });


                    }
                }else{
                    console.log('err3',gran);
                    callback(new Error("KPI definition Error"),null);
                }

            }

        });
    };
    E.getKPIValueForNE=function(callback,kpiid/*,ts,window_size,nelist,size,skip,order*/){
        //console.log('*************getKPIValueForNE',kpiid, ts,window_size,nelist,size,skip,order);
        E.getKPIDef(kpiid,function(err,def) {
            if(err){
                console.log("err5:",err);
                callback(err,null);
            }else{
                var type= _.get(def,'template.id');
                if(!type){
                    callback(new Error('KPI definition Error'),null);
                }else{
                    callback(null,'in dev');
                }

            }
        });
    };
    /**
     *
     * @param kpiid : Unique ID of KPI Definition
     * @param ts  : collect time stamp, it will search the value (ts-granularity,ts]
     * @param nelist : the list of NE Instance ID, can be null
     * @param size: max return record size
     * @param skip: skip n records
     * @param order: 0 order by ne id asc,, 1: by kpi id desc,2, kpi value asc, 3, kpi value desc
     * @param kpidef: optional , the definition object of the kpi, if not has the function will query it
     * @param expression: internal use
     */
    E.getKPIValue=function(callback,kpiid, ts,nelist,size,skip,order,kpidef,expression){
        console.log("**************getKPIValue:",kpiid, ts,nelist,size,skip,order,expression);
        var forExpression=expression?expression:false;  //TODO:is it safe???
        function _fetchKPIValue(kpiid,callback,kpidef){
            function _work(callback){
                function __receiveKPIValueforAggr(err,data){
                    if(err){
                        console.log("err2",err);
                        callback(err,null);
                    }else{
                        var d=_.groupBy(data,'ne');
                        //console.log('__receiveKPIValueforAggr', d);
                        var ret=[];
                        _.forEach(d,function(v,k){
                            ret.push(getAggregationResult(fun,'K'+src,kpi_name,ts,k,v));
                        });
                        //console.log("aggr ret:",ret);
                        callback(null,sortAndPagination(ret,size,skip,order));
                    }
                }

                if (!(kpi_def && gran && template)) {
                    throw new Error("Error in KPI definition");
                }

                var type=_.get(kpi_def,'type');   //TODO: the performance of _.get() ??
                var neType= _.get(template,'id');
                var kpi_name= forExpression?'K'+kpiid:_.get(kpi_def ,'name');
                //var type=kpi_def.type;
                var formula= _.get(kpi_def,'formula');
                var window_size= _.get(gran,'seconds')*1000;
                if(window_size<=0){
                    window_size=1;
                }
                //console.log(type,formula,window_size);
                var vars;
                var fun;
                var src;
                switch(type){
                    case 0:  //raw counter
                        var getValue0= E.makeCypherForRaw(kpiid,ts,window_size);
                        n4j.runCypherWithReturn([{statement:getValue0}],function(err,result){
                            if(err){
                                throw new Error('Fail to get KPI (' + kpiid + ') value');
                            }else{
                                //console.log('get kpi('+kpiid+') value :'+JSON.stringify(getResult(result,kpi_name)));
                                callback (null,getResult(result,kpi_name,size,skip,order));
                            }
                        });
                        break;
                    case 1:  //calculate
                        vars=_.map(getVars(formula),function(v){
                            return v.replace('K','');
                        });
                        forExpression=true;
                        async.map(vars,_fetchKPIValue,function(err,data){
                            if(err){
                                console.log('_fetchKPIValue error:',err);
                                callback(err,null);
                            }else{
                                //console.log('dddddddddddddd',data.length,data[0].length,data[1].length);
                                var matrix=C.mergeArrays(data,['ne','ts']);
                                //console.log('complete fetch all source kpis', matrix);

                                var ret=[];
                                _.forEach(matrix,function(m){
                                    try{
                                        ret.push(_.set({
                                            ne:m.ne,
                                            ts:m.ts},kpi_name,Parser.evaluate(formula, m)));
                                    }catch(e){
                                        console.log('[KPI Engine]: calculate exception:',formula, e);
                                    }

                                });
                                callback(null,sortAndPagination(ret,size,skip,order));
                            }
                        });
                        break;
                    case 2:  //time aggregation
                        vars=_.map(getVars(formula),function(v){
                            return v.replace('K','');
                        });
                        fun=getFun(formula)[0];
                        src=vars[0];
                        E.getKPIValueWithinWindow(__receiveKPIValueforAggr,src,ts,window_size) ;
                        break;
                    case 3:  //entity aggregation
                        vars=_.map(getVars(formula),function(v){
                            return v.replace('K','');
                        });
                        fun=getFun(formula)[0];
                        src=vars[0];
                        async.waterfall([
                            async.apply(E.getKPIDef,src),
                            function(child_def,callback) {  //get node hierarchy
                                //console.log('aaaaaaaaaaaa',child_def);
                                var srcKPIType = _.get(child_def, 'kpi_def.type');
                                var srcKPIName= _.get(child_def,'kpi_def.name');
                                var chType = _.get(child_def, 'template.name');
                                //console.log('eAggr1', srcKPIType, chType);
                                if (srcKPIType === undefined || chType === undefined) {
                                    callback(new Error("Error in KPI definition"), null);
                                }
                                var stat;
                                if (srcKPIType === 0) {  //the step shall = the step num in gui search+1 ;TODO : add it into config
                                    stat = 'match (e:INSTANCE)-[*..5]->(k:KPI_VALUE) where k.id=' + src + ' AND ' + (ts - window_size) + '<k.ts<=' + ts+' and e.type="' + neType + '"';
                                    if (nelist && _.isArray(nelist) && nelist.length > 0) {
                                        stat = stat + ' AND e.id in ' + JSON.stringify(nelist);
                                    }
                                    stat = stat + ' return e.id ,k.value';
                                    n4j.runCypherWithReturn([{statement: stat}], callback);
                                    //callback(null,stat,0);
                                } else {
                                    stat = 'match (e:INSTANCE)-[*..4]->(c:INSTANCE) where e.type="' + neType + '" AND c.type="' + chType + '" ';
                                    if (nelist && _.isArray(nelist) && nelist.length > 0) {
                                        stat = stat + ' AND e.id in ' + JSON.stringify(nelist);
                                    }
                                    stat = stat + ' return e.id ,c.id';
                                    async.waterfall([
                                            async.apply(n4j.runCypherWithReturn, [{statement: stat}]),
                                            function (data, callback) {
                                                var ne=reformatResult(_.get(data,'results[0].data'));

                                                async.map(ne,function(v,callback){
                                                    v=_.uniq(v);
                                                    E.getKPIValue(callback,src,ts,v ,null,null,null,child_def,false);
                                                    //callback(null,'1');
                                                },function(err,results) {
                                                    //[{"row":["BSC2",2]},{"row":["BSC2",1]},{"row":["BSC1",2]},{"row":["BSC1",1]}]}
                                                    //console.log('aaaaaaaaaaaaaaaa',JSON.stringify(results));

                                                    //var ob={};
                                                    var ret=[];
                                                    _.forEach(results,function(v,k){
                                                        _.forEach(v,function(i){
                                                            ret.push(
                                                                {row:[
                                                                    k, _.get(i,srcKPIName)
                                                                ]}
                                                            );
                                                        });
                                                    });
                                                    //console.log('xxxxxxxxxxx',err, ret);
                                                    callback(null, _.set({},'results[0].data',ret));
                                                });

                                            }
                                        ],
                                        function (err, data) {
                                            //console.log('dddddddddddddd',err,data);
                                            callback(err,data);
                                        }
                                    );
                                    //callback(null,stat,1);
                                }
                            },
                            function(result,callback){
                                //var data= _.get(result,'results[0].data');
                                callback(null,result);
                            }
                        ], function (err, result) {
                            //console.log('bbbbbbbbbb',err,JSON.stringify(result));

                            // result now equals 'done'
                            callback (err,sortAndPagination(
                                getAggregationResult2(fun,ts,kpi_name,_.get(result,'results[0].data')),size,skip,order)
                            );
                        });


                        break;
                    default:
                        throw new Error ("Unknown KPI Type:"+type);
                    //cb1(null,null);
                }
            }
            try {
                var kpi_def ;
                var gran ;
                var template ;
                if(!kpidef){
                    E.getKPIDef(kpiid,function(err,def){
                        if(err){
                            callback(err,null);
                        }else{
                            kpidef=def;
                            kpi_def = kpidef.kpi_def;
                            gran = kpidef.gran;
                            template = kpidef.template;
                            _work(callback);
                        }
                    });
                }else{
                     kpi_def = kpidef.kpi_def;
                     gran = kpidef.gran;
                     template = kpidef.template;
                     _work(callback);
                }
            }catch(e){
                console.log("getKPIValue error: ", e);
                callback(e,null);
            }
        }
        _fetchKPIValue(kpiid,callback,kpidef);

    };

    //customized functions
    E.getKPIsForNFVDGUIRequestMonitor=function(callback){
        var statement={statement:'match (e:KPI_VALUE)<-[:HAS_KPI_VALUE]-(ne:INSTANCE{id:"myLaptop"}) return e.name, e.ts,e.value order by e.name, e.ts'};
        n4j.runCypherWithReturn([statement],function(err,results){
            if(!err){
                var data=_.groupBy( _.get(results,'results[0].data'),'row[0]');
                var k1=_.get(data,'num_of_request');
                var k2=_.get(data,'avg_request_cost');
                var k3=_.get(data,'max_request_cost');
                var categories= _.map(k1,'row[1]');

                var s1={
                    name: 'num_of_request',
                    data:[]
                };

                _.forEach(categories,function(date){
                    var r=_.find(k1,function(kk){
                        return kk.row[1]===date;
                    });
                    if(r){
                        s1.data.push(r.row[2]);
                    }else{
                        s1.data.push(null);
                    }
                });

                var s2={
                    name: 'avg_request_cost',
                    data:[]
                };

                _.forEach(categories,function(date){
                    var r=_.find(k2,function(kk){
                        return kk.row[1]===date;
                    });
                    if(r){
                        s2.data.push(r.row[2]);
                    }else{
                        s2.data.push(null);
                    }
                });

                var s3={
                    name: 'max_request_cost',
                    data:[]
                };

                _.forEach(categories,function(date){
                    var r=_.find(k3,function(kk){
                        return kk.row[1]===date;
                    });
                    if(r){
                        s3.data.push(r.row[2]);
                    }else{
                        s3.data.push(null);
                    }
                });
                var series=[s1,s2,s3];

                callback(null,{categories:categories,series:series});
            }else{
                callback(err,null);
            }
        });
    };
    return E;
})();