/**
 * Created by yanzhig on 12/12/2015.
 */
'use strict';

var path=require("path");
//var job=require(path.join(__dirname,"/../node_modules/node-schedule/lib/schedule"));
var _ = require(path.join(__dirname, '/../node_modules/lodash/index'));
var E=require(path.join(__dirname, '/../kpi/kpi_engine'));
var os = require('os');

function test(){
    var startTime = os.uptime();
    function t(id){
        E.getKPIValue(function(e,d){
            console.log('get kpi('+id+'):',JSON.stringify(d));
            console.log('Request completed in ' + (os.uptime() - startTime)+'s');
        },id,100002700000,null,null,null,3);
    }
for(var i=0;i<50;i++){
    for(var id=0;id<18;id++){
        t(id);
    }
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
}

test();
