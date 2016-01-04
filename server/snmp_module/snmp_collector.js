/**
 * Created by yanzhig on 12/22/2015.
 */
var path=require('path');
//var fs = require('fs');
var csv = require(path.join(__dirname,'/../node_modules/csv/lib/index'));
var snmp = require(path.join(__dirname,'/../node_modules/snmp-native/lib/snmp'));
var _ = require(path.join(__dirname,'/../node_modules/lodash/index'));
var n4j=require(path.join(__dirname, '/../neo4j_module/neo4j_funs'));
var os=require('os');
//var conf=require(path.join(__dirname,'/../conf/csv_collector'));
module.exports = (function() {
    'use strict';
    var P={};

    P.get=function(){};
    P.getAll=function(){};


    return P;
})();