/**
 * Created by yanzhig on 12/9/2015.
 */

'use strict';

var path=require("path");
//var job=require(path.join(__dirname,"/../node_modules/node-schedule/lib/schedule"));
var Parser = require(path.join(__dirname, '/../lib/parser')).Parser;


function test(){
    console.log(Parser.evaluate("2 ^ 1", {k1: 3}));
    console.log(Parser.evaluate("if(a>20, if(a>10,3,2) ,4 ,0)", {a: 14,b:4}));
    console.log(Parser.evaluate("5<k1 or k1>1", {k1: 3}));
}

test();