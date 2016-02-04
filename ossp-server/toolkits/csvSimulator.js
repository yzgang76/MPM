/**
 * Created by yanzhig on 1/9/2016.
 */

'use strict';

var path=require('path');
//var input=require();
var fs = require('fs');
var _ = require(path.join(__dirname,'/../node_modules/lodash/index'));
var os=require('os');
var conf=require(path.join(__dirname,'/../conf/csv_collector'));
var async=require(path.join(__dirname,'/../node_modules/async/dist/async'));

function makeCSVFile(tag,ts,gran){
    var nowTS=Date.now();
    var fileName='csv_simulate_'+tag+'_'+nowTS+'.csv';
    var filePath=path.join(__dirname,'/../data/');
    var header="BSC,BTS,TS,GRANULARITY,nbr_call_request,nbr_call_response,KPI1,KPI2,KPI3,KPI4,KPI5,KPI6,KPI7,KPI8,KPI9,KPI10\n";
    fs.open(filePath+fileName,'w',function(err,fd){
        function _writeLine(line,callback){
            fs.write(fd,line,function (err) {
                if (err) {
                   callback(err);
                }
                callback(null);
            });
        }
        if(err){
            throw err;
        }
        fs.write(fd,header,function (err) {
            if (err) {
                throw err ;
            }
            console.log("Start make File "+tag,ts,gran);

            var lines=[];
            var totalLines=10000;
            var pBSC=1000;
            var pBTS=10;
            for (var i= 0;i<totalLines;i++){
                var bsc='BSC_'+tag+'_'+parseInt(i/pBSC);
                var bts='BTS_'+tag+'_'+parseInt(i/pBTS);
                var lts=ts-(parseInt(i%pBTS)*gran*1000);
                var nbr_call_response=Math.round(Math.random()*100);
                var nbr_call_request=nbr_call_response+Math.round(Math.random()*10);
                var K1=Math.round(Math.random()*1000);
                var K2=(Math.random()*100);
                var K3=(Math.random()*100);
                var K4=(Math.random()*100);
                var K5=(Math.random()*100);
                var K6=(Math.random()*100);
                var K7=(Math.random()*100);
                var K8=(Math.random()*100);
                var K9=(Math.random()*100);
                var K10=(Math.random()*100);
                var K11=(Math.random()*100);
                lines.push(
                   bsc+","+bts+","+lts+","+gran+","+nbr_call_request+","+nbr_call_response+","+K1+","+K2+","+K3+","+K4+","+K5+","+K6+","+K7+","+K8+","+K9+","+K10+"\n"
                );

            }

            //console.log(lines);
            async.eachSeries(lines,_writeLine,function(err){
                try{
                    fs.close(fd);
                }catch(e){

                }
                if(err){

                    throw err;
                }
                console.log("make file "+ tag+" completed.");
            });
        }) ;

    });

}
for(var i=4 ;i<5;i++){
    makeCSVFile('group'+i,Math.round(Date.now()/1000)*1000,900);
}
