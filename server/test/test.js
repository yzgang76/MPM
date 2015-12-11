/**
 * Created by yanzhig on 12/9/2015.
 */

'use strict';

var path=require("path");
var job=require(path.join(__dirname,"/../node_modules/node-schedule/lib/schedule"));
var _ = require(path.join(__dirname, '/../node_modules/lodash/index'));
var n4j=require(path.join(__dirname, '/../neo4j_module/neo4j_funs'));


function test1(){
    var j = job.scheduleJob('42 * * * *', function(){
        console.log('The answer to life, the universe, and everything!');
    });

}

function test2(){
    n4j.runCypherFile('model.cypher');
}

test2();