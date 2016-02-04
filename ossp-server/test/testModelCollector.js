/**
 * Created by yanzhig on 2/4/2016.
 */


'use strict';

var path=require("path");
//var job=require(path.join(__dirname,"/../node_modules/node-schedule/lib/schedule"));
//var _ = require(path.join(__dirname, '/../node_modules/lodash/index'));
var c=require(path.join(__dirname, '/../modelling/model_collector'));

c.collect('models',function(e,r){
    console.log("collect model "+" completed",e,r);
});