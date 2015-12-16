/**
 * Created by yanzhig on 12/12/2015.
 */
'use strict';

var path=require("path");
//var job=require(path.join(__dirname,"/../node_modules/node-schedule/lib/schedule"));
var _ = require(path.join(__dirname, '/../node_modules/lodash/index'));
var C=require(path.join(__dirname, '/../csv_module/standard_csv_collector'));


//function test1(){
//    var j = job.scheduleJob('42 * * * *', function(){
//        console.log('The answer to life, the universe, and everything!');
//    });
//
//}

function test(){
    C.collectFile('sample.csv');
    C.collectFile('inventory.csv');
}

test();