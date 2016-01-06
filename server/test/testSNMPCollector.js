/**
 * Created by yanzhig on 1/5/2016.
 */
'use strict';
var path = require("path");
//var job=require(path.join(__dirname,"/../node_modules/node-schedule/lib/schedule"));
var _ = require(path.join(__dirname, '/../node_modules/lodash/index'));
var C = require(path.join(__dirname, '/../snmp_module/snmp_collector'));

var scheduler = {
    "300": [{
        "device": {"id": "localhost", "ip": "127.0.0.1", "community": "public", "version": "2c"},
        "jobs": [{
            "method": "get",
            "name": "Physical memory utilization",
            "formula": "[.1.3.6.1.2.1.25.2.3.1.6.4]/[.1.3.6.1.2.1.25.2.3.1.5.4]*100",
            "unit": "%",
            "interval": 300,
            "id": 36,
            "keys": ["K_1_3_6_1_2_1_25_2_3_1_6_4", "K_1_3_6_1_2_1_25_2_3_1_5_4"],
            "eFormula": "K_1_3_6_1_2_1_25_2_3_1_6_4/K_1_3_6_1_2_1_25_2_3_1_5_4*100",
            "collectArray": [[1, 3, 6, 1, 2, 1, 25, 2, 3, 1, 6, 4], [1, 3, 6, 1, 2, 1, 25, 2, 3, 1, 5, 4]]
        }, {
            "method": "walk",
            "aggregation": "avg",
            "name": "Avg CPU Utilization",
            "formula": "[.1.3.6.1.2.1.25.3.3.1.2]",
            "description": "Average CPU Utilization in 5 minutes",
            "unit": "%",
            "interval": 300,
            "id": 35,
            "keys": ["K_1_3_6_1_2_1_25_3_3_1_2"],
            "eFormula": "K_1_3_6_1_2_1_25_3_3_1_2",
            "collectArray": [[1, 3, 6, 1, 2, 1, 25, 3, 3, 1, 2]]
        }, {
            "method": "get",
            "name": "Bytes In",
            "formula": "[.1.3.6.1.2.1.2.2.1.10.12]",
            "unit": "Byte",
            "interval": 300,
            "id": 37,
            "keys": ["K_1_3_6_1_2_1_2_2_1_10_12"],
            "eFormula": "K_1_3_6_1_2_1_2_2_1_10_12",
            "collectArray": [[1, 3, 6, 1, 2, 1, 2, 2, 1, 10, 12]]
        }, {
            "method": "get",
            "name": "Bytes Out",
            "formula": "[.1.3.6.1.2.1.2.2.1.16.12]",
            "unit": "Byte",
            "interval": 300,
            "id": 38,
            "keys": ["K_1_3_6_1_2_1_2_2_1_16_12"],
            "eFormula": "K_1_3_6_1_2_1_2_2_1_16_12",
            "collectArray": [[1, 3, 6, 1, 2, 1, 2, 2, 1, 16, 12]]
        }]
    }],
    "900": [{
        "device": {"id": "not exists", "ip": "10.0.0.1", "community": "public", "version": "2c"},
        "jobs": [{
            "method": "get",
            "name": "Physical memory utilization",
            "formula": "[.1.3.6.1.2.1.25.2.3.1.6.4]/[.1.3.6.1.2.1.25.2.3.1.5.4]*100",
            "unit": "%",
            "interval": 900,
            "id": 33,
            "keys": ["K_1_3_6_1_2_1_25_2_3_1_6_4", "K_1_3_6_1_2_1_25_2_3_1_5_4"],
            "eFormula": "K_1_3_6_1_2_1_25_2_3_1_6_4/K_1_3_6_1_2_1_25_2_3_1_5_4*100",
            "collectArray": [[1, 3, 6, 1, 2, 1, 25, 2, 3, 1, 6, 4], [1, 3, 6, 1, 2, 1, 25, 2, 3, 1, 5, 4]]
        }, {
            "method": "walk",
            "aggregation": "avg",
            "name": "Avg CPU Utilization",
            "formula": "[.1.3.6.1.2.1.25.3.3.1.2]",
            "description": "Average CPU Utilization in 5 minutes",
            "unit": "%",
            "interval": 900,
            "id": 34,
            "keys": ["K_1_3_6_1_2_1_25_3_3_1_2"],
            "eFormula": "K_1_3_6_1_2_1_25_3_3_1_2",
            "collectArray": [[1, 3, 6, 1, 2, 1, 25, 3, 3, 1, 2]]
        }, {
            "method": "get",
            "name": "Bytes In",
            "formula": "[.1.3.6.1.2.1.2.2.1.10.12]",
            "unit": "Byte",
            "interval": 900,
            "id": 32,
            "keys": ["K_1_3_6_1_2_1_2_2_1_10_12"],
            "eFormula": "K_1_3_6_1_2_1_2_2_1_10_12",
            "collectArray": [[1, 3, 6, 1, 2, 1, 2, 2, 1, 10, 12]]
        }, {
            "method": "get",
            "aggregation": "delta",
            "name": "Bytes Out",
            "formula": "[.1.3.6.1.2.1.2.2.1.16.12]",
            "unit": "Byte",
            "interval": 900,
            "id": 31,
            "keys": ["K_1_3_6_1_2_1_2_2_1_16_12"],
            "eFormula": "K_1_3_6_1_2_1_2_2_1_16_12",
            "collectArray": [[1, 3, 6, 1, 2, 1, 2, 2, 1, 16, 12]]
        }]
    }]
};

C.collectAndPopulate(scheduler['300'][0], Date.now(), function (err, result) {
    console.log(Date.now(), ':', JSON.stringify(result));
});