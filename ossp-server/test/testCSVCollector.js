/**
 * Created by yanzhig on 12/12/2015.
 */
'use strict';

var path=require("path");
//var job=require(path.join(__dirname,"/../node_modules/node-schedule/lib/schedule"));
var _ = require(path.join(__dirname, '/../node_modules/lodash/index'));
var C=require(path.join(__dirname, '/../csv_module/standard_csv_collector'));
var conf=require(path.join(__dirname,'/../conf/csv_collector'));
var fs=require('fs');
//function test1(){
//    var j = job.scheduleJob('42 * * * *', function(){
//        console.log('The answer to life, the universe, and everything!');
//    });
//
//}

function test(){
    var file=path.join(__dirname, _.get(conf,'DIR'))+'sample.csv';
    try{
        fs.renameSync(file +'.processing.completed',file);
    }catch(e){

    }
    try{
        fs.renameSync(file +'.processing',file);
    }catch(e){

    }

    C.collectFile(file,function(l){
        console.log(l);
    });
    //C.collectFile('inventory.csv',function(l){
    //    console.log(l);
    //});
}

test();