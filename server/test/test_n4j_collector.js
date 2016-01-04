/**
 * Created by yanzhig on 12/10/2015.
 */
/**
 * Created by yanzhig on 12/5/2015.
 */
'use strict';
var path=require('path');
//var input=require();
//var fs = require('fs');
var _ = require(path.join(__dirname,'/../node_modules/lodash/index'));
var C=require(path.join(__dirname,'/../lib/common-funs'));

var async=require(path.join(__dirname, '/../node_modules/async/dist/async'));

function test(){
    var url='/collect/nfvd/component?url=http://16.17.88.149:8080/nfvd-ext/domains/ecba860d-2227-491c-87c1-2cd5c475e66c/organizations/b879761c-4bb7-4c1d-914f-a7b2fae38b6a/tenants/d9d2a82e-5a43-4ac4-8f74-ce3c56a193e5/vnfs/5be18c85-edf0-4685-b06c-eaab41d1aa16/vdc';
    function callback(err,r,d){
        console.log('rrrrrrrret:'+JSON.stringify(d));
    }
    C.makeQuery('http://localhost:3001',url,callback,'POST',{});
}



function test2(){
    var arr=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
    var url='/V1.0/domains/mpm-n/kpis/ID';
    function p(err,r,d){
        console.log(d,err);
    }
    async.each(arr,function(i,callback){
        C.makeQuery('http://localhost:3000',url,p,'GET',{},true);
    },function(err){
        console.log('e:',err);
    });
}

function test3(){
    var url='/V1.0/domains/mpm-n/kpis/create';
    C.makeQuery('http://localhost:3000',url,function(err,r,data){
        console.log(err,data);
    },'POST',{},true);
}

test2();


