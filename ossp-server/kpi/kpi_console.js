/**
 * Created by yanzhig on 1/7/2016.
 */
var path=require("path");
var _ = require(path.join(__dirname, '/../node_modules/lodash/index'));
var engine=require(path.join(__dirname, '/kpi_engine'));
var C=require(path.join(__dirname, '/../lib/common-funs'));
//var conf=require(path.join(__dirname,'/../conf/snmp_collector'));
//var n4j=require(path.join(__dirname, '/../neo4j_module/neo4j_funs'));
var async=require(path.join(__dirname,'/../node_modules/async/dist/async'));

module.exports = (function() {
    'use strict';
    var S = {};
    S.getKPI=function(req,res){
        var param=req.body;
        if(param){
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
            engine.getKPIValue(function(err,data){
                if(err){
                    res.status(500).send(err);
                    res.end();
                }else{
                    res.send(data);
                    res.end();
                }
            },param.id,param.ts,param.nelist,param.size,param.skip,param.order);

        }else{
            res.send([]);
            res.end();
        }
    };

    // only for get kpis for NFVD request monitor
    S.getKPIsForNFVDGUIRequestMonitor=function(req,res){
        engine.getKPIsForNFVDGUIRequestMonitor(function(err,data){
            if(err){
                res.status(500).send(err);
                res.end();
            }else{
                res.send(data);
                res.end();
            }
        });
    };

    return S;
}());