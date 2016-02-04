/**
 * Created by yanzhig on 2/4/2016.
 */

'use strict';

var path=require("path");
//var job=require(path.join(__dirname,"/../node_modules/node-schedule/lib/schedule"));
//var _ = require(path.join(__dirname, '/../node_modules/lodash/index'));
var maker=require(path.join(__dirname, '/../lib/cypherMaker'));

var d=require(path.join(__dirname, '/../data/models'));
var i=0;
var s=maker.getCypherInjectModel(d[i].domain,d[i].elements,d[i].relationships);
console.log(s);
i=1;
s=maker.getCypherInjectModel(d[i].domain,d[i].elements,d[i].relationships);
console.log(s);