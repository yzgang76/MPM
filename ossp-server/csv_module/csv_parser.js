/**
 * Created by yanzhig on 12/4/2015.
 */
var path=require('path');
//var input=require();
var fs = require('fs');
var csv = require(path.join(__dirname,'/../node_modules/csv/lib/index'));
module.exports = (function() {
    'use strict';
    var P={};

    P.test=function(req,res){
        //console.log('ccccccc',csv);
        fs.readFile(path.join(__dirname,'/../data/alarm1.csv'), 'utf-8', function(err, data) {
            if (err) {
                res.status(500).send(err);
                res.end();
            } else {
                //console.log(data);
                csv.parse(data, {comment: '#'}, function(err, output){
                    res.send(JSON.stringify(output));
                    res.end();
                });
            }
        });
        //res.send('1');
        //console.log('end.');

    };

    return P;
})();



