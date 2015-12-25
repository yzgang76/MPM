'use strict';
var plugin = require(process.env.ROOT + '/server/addons/plugins/plugin');
var collect= require(process.env.ROOT + '/server/addons/plugins/mpm-n/lib/collector');
var kpi= require(process.env.ROOT + '/server/addons/plugins/mpm-n/lib/kpi');
//var _=require('lodash');
module.exports = function(app) {
    // Register plugin
    // This creates routes automatically for configuration data
    // to be found in the conf directory
    var prefix = plugin.register(app, "mpm-n");
    console.log("mpm-n  plugin has started", prefix);

    app.get(prefix+'/collectors',collect.getCollectors);
    app.get(prefix+'/collectors/:id',collect.getCollectorByID);
    app.get(prefix+'/collectors/:id/start',collect.startCollectorByID);
    //app.get(prefix+'/collector/:id/start',function(req,res){
    //    console.log('aaaaaaaaaaaaaaaaaaaaaaa');
    //    res.send({"r":"a"});
    //});
    app.get(prefix+'/collectors/:id/stop',collect.stopCollectorByID);

    app.get(prefix+'/kpis/definition',kpi.getKPIDefinitions);
    app.get(prefix+'/kpis/templates',kpi.getKPITemplates);
    app.get(prefix+'/kpis/templates/:type/sub',kpi.getKPISubTemplates);
    app.get(prefix+'/kpis/granularity',kpi.getKPIGranularity);
    app.get(prefix+'/kpis/source',kpi.getSourceKPIList);
    app.get(prefix+'/kpis/id',kpi.getKPIID);
    app.post(prefix+'/kpis/create',kpi.createKPI);

    //Where the more generic logErrors may write request and error information to stderr, loggly, or similar services:
    function logErrors(err, req, res, next) {
        console.error('MPM-N Plugin Plugin ROUTE logErrors: (', (err ? err.stack : err), ')');
        next(err);
    }

    //Where clientErrorHandler is defined as the following (note that the error is explicitly passed along to the next):
    function clientErrorHandler(err, req, res, next) {
        console.log('MPM-N Plugin ROUTE clientErrorHandler');
        if (req.xhr) {
            res.status(500).send({
                error: err
            });
        } else {
            next(err);
        }
    }

    app.use(logErrors);
    app.use(clientErrorHandler);
};
