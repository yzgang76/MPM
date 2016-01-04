/**
 * Created by yanzhig on 1/4/2016.
 */


var path=require("path");
var _ = require(path.join(__dirname, '/../node_modules/lodash/index'));
var Collector=require(path.join(__dirname, '/../snmp_module/snmp_collector'));
var C=require(path.join(__dirname, '/../lib/common-funs'));
var conf=require(path.join(__dirname,'/../conf/snmp_collector'));

module.exports = (function() {
    'use strict';
    var S = {};

    var status=0;  //0, initl; 1, init succ; -1, init failed
    S.initCollector=function(req,res){
        if(status>0){
            res.send({"result":"succ"});
        }else if(status===0){
            console.log(JSON.stringify(conf));
            status=1;
            res.send({"result":"succ"});
        }else{
            res.send({"result":"succ"});
        }
    };

    return S;
}());