/**
 * Created by yanzhig on 12/22/2015.
 */
'use strict';
var path=require('path');
//var fs = require('fs');
var csv = require(path.join(__dirname,'/../node_modules/csv/lib/index'));
var snmp = require(path.join(__dirname,'/../node_modules/snmp-native/lib/snmp'));
var _ = require(path.join(__dirname,'/../node_modules/lodash/index'));
var n4j=require(path.join(__dirname, '/../neo4j_module/neo4j_funs'));
var os=require('os');
// Create a Session with default settings.


// Create a Session with explicit default host, port, and community.
var session = new snmp.Session({version:1});
session.get({ oid: [1,3,6,1,2,1,25,2,2,0], host: 'localhost', community: 'public' }, function (error, varbinds) {
    if (error) {
        console.log('Fail :(',error);
        session.close();
    } else {
        console.log(varbinds[0].oid + ' = ' + varbinds[0].value + ' (' + varbinds[0].type + ')');
        session.close();
    }
});
var session0 = new snmp.Session();
session0.get({ oid: [1,3,6,1,2,1,25,3,3,1,2,7 ], host: 'localhost', community: 'public' }, function (error, varbinds) {
    if (error) {
        console.log('Fail :(',error);
        session0.close();
    } else {
        console.log(varbinds[0].oid + ' = ' + varbinds[0].value + ' (' + varbinds[0].type + ')');
        //console.log('vvv',varbinds);
        session0.close();
    }
});
var session1 = new snmp.Session();
session1.getAll({ oids:[ [1,3,6,1,2,1,25,2,2,0],[1,3,6,1,2,1,25,3,3,1,2,7 ]], host: 'localhost', community: 'public' }, function (error, varbinds) {
    varbinds.forEach(function (vb) {
        console.log(vb.oid + ' == ' , vb);
    });
    session1.close();
});

//var oidStr = '.1.3.6.1.2.1.31.1.1.1.1';
//var oidStr2='.1.3.6.1.2.1.25.3.3.1.2';
//var oid = oidStr2
//    .split('.')
//    .filter(function (s) { return s.length > 0; })
//    .map(function (s) { return parseInt(s, 10); });
//
//var session2 = new snmp.Session({ host: 'localhost', community: 'public' });
//session2.getSubtree({ oid: oid }, function (err, varbinds) {
//    if (err) {
//        console.log(err);
//    } else {
//        varbinds.forEach(function (vb) {
//            console.log('Name of interface ' + vb.oid[vb.oid.length - 1]  + ' is "' + vb.value + '"' , vb);
//        });
//    }
//
//    session2.close();
//});


function getVars(expression){
    var r =/\[(\.\d*)*\]/g;
    return expression.match(r);//.map(function(s){return oidStr2Array(s); });
}

function varsStr2Array(vars){
    return vars.map(function(v){
        return v.split('.')
            .filter(function (s) { return s.length > 0&&s!=='['&&s!==']'; })
            .map(function (s) { return parseInt(s, 10); });
    });
}
function vars2KeyArray(vars){
    return _.map(vars,function(s){
        return s.replaceAll('\\.','_').replace('[','K').replace(']','');
    });
}
function convertFormula(formula,vars,keys){
    for(var i=0;i<vars.length;i++){
        formula=formula.replace(vars[i],keys[i]);
    }
    return formula;
}
function enrichOID(oid){
    var formula= _.get(oid,'formula');
    if(formula){
        var vars= getVars(formula);
        console.log('vars:',vars);
        var keys=vars2KeyArray(vars);
        convertFormula(formula,vars,keys);
        var collectArray=varsStr2Array(vars);
        oid.vars=vars;
        oid.keys=keys;
        oid.eFormula=formula;
        oid.collectArray=collectArray;
    }
    return oid;
}

var formula='[.1.3.6.1.2.1.25.2.3.1.6.4]';
var vars=getVars(formula);
console.log('vars:', vars);
console.log('formula=',formula);
var keys=vars2KeyArray(vars);
console.log('keys:',keys);
var  ef=convertFormula(formula,vars,keys);
var collectArray=varsStr2Array(vars);
console.log('collectArray=',collectArray);

console.log('formula=',ef);

//var v0=_.map(v1,function(s){
//    return s.replaceAll('\\.','_').replace('[','K').replace(']','');
//});
//console.log(v0);
//var v2=_.map(v1,function(s){
//    return oidStr2Array(s);
//});
//console.log(v2);
//
//var exp1=exp;
//for(var i=0;i<v1.length;i++){
//    exp1=exp1.replace(v1[i],v0[i]);
//}
//console.log(exp);
//console.log(exp1);
//
//
//var s='s1';
//function ss(s){
//    s='s2';
//    return s;
//}
//
//console.log(ss(s),s);