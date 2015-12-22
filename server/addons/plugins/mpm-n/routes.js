'use strict';
var plugin = require(process.env.ROOT + '/server/addons/plugins/plugin');
var collectors=require(process.env.ROOT + '/server/addons/plugins/mpm-n/conf/collectors');
var _=require('lodash');
module.exports = function(app) {
    // Register plugin
    // This creates routes automatically for configuration data
    // to be found in the conf directory
    var prefix = plugin.register(app, "mpm-n");
    console.log("mpm-n  plugin has started", prefix);

    app.get(prefix+'/collectors',function(req,res){
        res.send(collectors);
        res.end();
    });

};
