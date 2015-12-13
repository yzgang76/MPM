/**
 * Created by yanzhig on 12/9/2015.
 */

'use strict';

var path=require("path");
//var job=require(path.join(__dirname,"/../node_modules/node-schedule/lib/schedule"));
var Parser = require(path.join(__dirname, '/../lib/parser')).Parser;


function test(){
    console.log(Parser.evaluate("2 ^ 1", {k1: 3}));
}

test();