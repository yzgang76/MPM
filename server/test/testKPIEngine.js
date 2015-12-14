/**
 * Created by yanzhig on 12/12/2015.
 */
'use strict';

var path=require("path");
//var job=require(path.join(__dirname,"/../node_modules/node-schedule/lib/schedule"));
var _ = require(path.join(__dirname, '/../node_modules/lodash/index'));
var E=require(path.join(__dirname, '/../kpi/kpi_engine'));


function test(){
    E.getKPIValue(function(e,d){
        console.log('222222222222222222222',e,d);
    },2,100000000000);
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
