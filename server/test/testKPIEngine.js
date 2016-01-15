/**
 * Created by yanzhig on 12/12/2015.
 */
'use strict';

var path=require("path");
//var job=require(path.join(__dirname,"/../node_modules/node-schedule/lib/schedule"));
var _ = require(path.join(__dirname, '/../node_modules/lodash/index'));
var E=require(path.join(__dirname, '/../kpi/kpi_engine'));
var async=require(path.join(__dirname, '/../node_modules/async/dist/async'));
var os = require('os');

function test(){

    //100002700000
    //1452335276000

    function t(i,callback){
        var startTime = os.uptime();
        var id=11;
        E.getKPIValue(function(e,d){
            console.log('get kpi('+id+'):',JSON.stringify(_.slice(d,0,5)));
            console.log('Request completed in ' + (os.uptime() - startTime)+'s');
            callback(null);
        },id,1452335276000,null,null,null,null);
    }
    var iterate=[];
    for(var i=0;i<10;i++){
        //for(var id=11;id<12;id++){
        //    t(id);
        //}
        iterate.push(i);
    }
    var t0=Date.now();
    var parallel=true;
    if(parallel){
        async.each(iterate,t,function(err){
            var t1=Date.now();
            console.log('***********',(t1-t0)) ;
        });
    }else{
        async.eachSeries(iterate,t,function(err){
            var t1=Date.now();
            console.log('***********',(t1-t0)) ;
        });
    }





  /*  var data=[{row:["BSC1",2]},{"row":["BSC1",3]},{"row":["BSC2",3]}];
    var data1=_.map(data ,function (a){
       return {key: a.row[0],value: a.row[1]};
    });
    var data2=_.groupBy(data1,'key');
    console.log(data2);
    _.forEach(data2,function(v,k){
        console.log(k+":"+( v.length>1?
            _.reduce(v,function(a,b){
              return a.value+ b.value;
            }): v[0].value)
        );
    });

    var data3=_.map(data ,function (a){
        return _.set({},a.row[0], a.row[1]);
    });
    console.log(_.groupBy(data3));

    var ret={};
    _.forEach(data,function(d){
        var n= d.row[0];
        var r=_.get(ret,n);
        if(!r){
             _.set(ret,n,[]);
            r=_.get(ret,n);
        }
        r.push(d.row[1]);
    });
    _.forEach(ret,function(v,k){
        console.log(k+":"+ _.sum(v));
    });*/

    //E.getKPIValue(0,100000000000,['BTS2']);   // raw
    //E.getKPIValue(0,100000000000,null,1);   // raw
    //E.getKPIValue(0,100000000000,null,1,1,1);   // raw

    //var a=[ { ne: 'BTS1', ts: 100000000000, k1: 1 },
    //    { ne: 'BTS2', ts: 100000000000, k1: 1 } ];
    //var b=[ { ne: 'BTS1', ts: 100000000000, k2: 2 },
    //    { ne: 'BTS2', ts: 100000000000, k2: 2 } ];
    //var arrs=[a,b];
    //var keys=['ne','ts'];
    //console.log(mergeArrays([a,b],['ne','ts']));


    //console.log(x,_.get(x, 'BTS1100000000000'));

    //var b=[ 'BTS1100000000000', { k1: 1 }, 'BTS2100000000000', { k1: 1 } ];
    //var bb=[ 'BTS1100000000000', { k2: 2 }, 'BTS2100000000000', { k2: 2 } ] ;
    //console.log(_.union(b,bb));

    //E.getKPIValue(2,100000000000);  //calculate

    //var arr=[
    //    {a:1,b:2},
    //    {a:2,b:3}
    //];
    //
    //var c= _.find(arr,{a:1});
    //c.b=3333;
    //console.log(arr);
  /*  var keys=[{"key":"BTS_group20_11452334432000","value":{"ne":"BTS_group20_1","ts":1452334432000}},{"key":"BTS_group20_11452334432000","value":{"ne":"BTS_group20_2","ts":1452334432000}}];
var a;
    console.log(_.slice(keys,1,2));

    var a1=[{"BTS_group20_11452334432000":{"K1":65}},{"BTS_group20_21452334432000":{"K1":86}}];
    var a2=[{"BTS_group20_21452334432000":{"K0":82}},{"BTS_group20_11452334432000":{"K0":62}}];
    var a3=a1.concat(a2);
    _.forEach(keys,function(key){
        var kpis=_.filter(a3,function(a){
            //console.log(a,key);
            return _.has(a,key.key);
        }) ;
        //console.log(kpis);
        var k=_.reduce(kpis,function(a,b){
            return _.merge(a,b);
        });
        console.log(k);
    });
*/
    //
    //console.log(_.merge(_.sortBy(a1,function(v,k){
    //    return k;
    //}), _.sortBy(a2,function(v,k){
    //    return k;
    //})));
}


test();
