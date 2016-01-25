/**
 * Created by yanzhig on 1/19/2016.
 */
'use strict';

var path=require("path");
//var job=require(path.join(__dirname,"/../node_modules/node-schedule/lib/schedule"));
var _ = require(path.join(__dirname, '/../node_modules/lodash/index'));
var C=require(path.join(__dirname, '/../nfvd_log_collector/log_collector'));


//function test1(){
//    var j = job.scheduleJob('42 * * * *', function(){
//        console.log('The answer to life, the universe, and everything!');
//    });
//
//}

function test(){
    C.collect();
}

function test2(){
    C.createModelAndRegisterKPIs();
}

function test3(){
    C.collectEx();
}

test3();