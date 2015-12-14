/**
 * Created by yanzhig on 12/12/2015.
 */
'use strict';

var path=require("path");
//var job=require(path.join(__dirname,"/../node_modules/node-schedule/lib/schedule"));
var _ = require(path.join(__dirname, '/../node_modules/lodash/index'));
var E=require(path.join(__dirname, '/../kpi/kpi_engine'));


function test(){
    //E.getKPIValue(0,100000000000);   // raw
    //E.getKPIValue(0,100000000000,['BTS2']);   // raw
    //E.getKPIValue(0,100000000000,null,1);   // raw
    E.getKPIValue(0,100000000000,null,1,1,1);   // raw

    //E.getKPIValue(2,100002700000);  //calculate
}

test();
