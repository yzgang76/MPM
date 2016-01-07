/**
 * Created by yanzhig on 1/7/2016.
 */
var path=require("path");
var _ = require(path.join(__dirname, '/../node_modules/lodash/index'));
var engine=require(path.join(__dirname, '/threshold_engine'));
var C=require(path.join(__dirname, '/../lib/common-funs'));
var n4j=require(path.join(__dirname, '/../neo4j_module/neo4j_funs'));
var async=require(path.join(__dirname,'/../node_modules/async/dist/async'));

module.exports = (function() {
    'use strict';
    var S = {};
    S.evaluate=function(req,res){
        var gran= _.get(req,'params.gran');
        var ts= _.get(req,'params.ts');
        engine.evaluate(ts,gran,function(err,result){
            res.send(result);
            res.end();
        });
    };
    return S;
}());