'use strict';
var plugin = require(process.env.ROOT + '/server/addons/plugins/plugin');
var collect= require(process.env.ROOT + '/server/addons/plugins/mpm-n/lib/collector');
//var _=require('lodash');
module.exports = function(app) {
    // Register plugin
    // This creates routes automatically for configuration data
    // to be found in the conf directory
    var prefix = plugin.register(app, "mpm-n");
    console.log("mpm-n  plugin has started", prefix);

    app.get(prefix+'/collectors',collect.getCollectors);
    app.get(prefix+'/collectors/:id',collect.getCollectorByID);
    app.post(prefix+'/collectors/:id/start',collect.startCollectorByID);
    app.post(prefix+'/collectors/:id/stop',collect.stopCollectorByID);
};
