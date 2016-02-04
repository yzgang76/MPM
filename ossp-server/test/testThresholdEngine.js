/**
 * Created by yanzhig on 1/6/2016.
 */
'use strict';
var path=require("path");
//var job=require(path.join(__dirname,"/../node_modules/node-schedule/lib/schedule"));
var _ = require(path.join(__dirname, '/../node_modules/lodash/index'));
var E=require(path.join(__dirname, '/../threshold/threshold_engine'));
var async=require(path.join(__dirname, '/../node_modules/async/dist/async'));
var os = require('os');

function test(){
    //E.evaluateRaw(1452053749365,300);
    //E.evaluateNotRaw(100002700000,3600);
    E.evaluate(100002700000,3600,function(err,r){
        console.log('ddddddddddddddddddddddddddd');
    });
}

test();