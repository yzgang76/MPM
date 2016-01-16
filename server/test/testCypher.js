/**
 * Created by yanzhig on 12/9/2015.
 */

'use strict';

var path=require("path");
//var job=require(path.join(__dirname,"/../node_modules/node-schedule/lib/schedule"));
var _ = require(path.join(__dirname, '/../node_modules/lodash/index'));
var n4j=require(path.join(__dirname, '/../neo4j_module/neo4j_funs'));


//function test1(){
//    var j = job.scheduleJob('42 * * * *', function(){
//        console.log('The answer to life, the universe, and everything!');
//    });
//
//}
function test0() {
    n4j.runCypherFile('constraint.cypher');
}
function test2() {
    n4j.runCypherFile('model.cypher');
}

function test3(){
    var statements=[];
    //var statement='merge (:GRANULARITY {id:3,type:"5mins",num:300})';
    statements.push({statement:'merge (e:GRANULARITY {id:3,type:"5mins",num:300}) return e'});
    statements.push({statement:'merge (e:GRANULARITY {id:4,type:"weekly",num:604800}) return e'});
    statements.push({statement:'merge (e:GRANULARITY {id:5,type:"monthly",num:18144000}) return e'});
    n4j.runCypherWithReturn(statements,function(e,b){
        console.log(e,b);
    });
}

//test0();
//test2();
test3();