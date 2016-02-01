/**
 * Created by yanzhig on 12/9/2015.
 */

'use strict';

var path=require("path");
//var job=require(path.join(__dirname,"/../node_modules/node-schedule/lib/schedule"));
var Parser = require(path.join(__dirname, '/../lib/parser')).Parser;
var _ = require(path.join(__dirname, '/../node_modules/lodash/index'));

var funs=[
    function test(a,b){
        console.log('aaaa',a,b);
       /* console.log(Parser.evaluate("k1_3_61212523164/2", {'k1_3_61212523164': 3}));
        console.log(Parser.evaluate("if(a>20, if(a>10,3,2) ,4 ,0)", {a: 14,b:4}));
        console.log(Parser.evaluate("5<k1 or k1>1", {k1: 3}));
        console.log(Parser.evaluate("5/k1+3", {k1: 0}));*/
    },
    function test2(a){
      console.log(a);
    }
];


_.invoke(funs,'call',2,3,5,6);
funs[0].call(null,2,3);
//var results=[];
//for(var i=0;i<funs.length;i++){
//    results.push(this.call.apply(funs[i],2,3,4,5));
//}
//console.log('rrrrrr',results);
