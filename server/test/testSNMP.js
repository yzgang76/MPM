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
var session = new snmp.Session();

session.get({ oid: [1, 3, 6, 1, 4, 1, 42, 1, 0], host: 'localhost', community: 'public' }, function (error, varbinds) {
    if (error) {
        console.log('Fail :(',error);
    } else {
        console.log(varbinds[0].oid + ' = ' + varbinds[0].value + ' (' + varbinds[0].type + ')');
    }
});