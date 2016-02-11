'use strict';
var plugin = require(process.env.ROOT + '/server/addons/plugins/plugin');
var collect= require(process.env.ROOT + '/server/addons/plugins/ossp/lib/collector');
var kpi= require(process.env.ROOT + '/server/addons/plugins/ossp/lib/kpi');
//var _=require('lodash');
module.exports = function(app) {
    // Register plugin
    // This creates routes automatically for configuration data
    // to be found in the conf directory
    var prefix = plugin.register(app, "ossp");
    console.log("ossp  plugin has started", prefix);

    app.get(prefix+'/collectors',collect.getCollectors);
    app.get(prefix+'/collectors/:id',collect.getCollectorByID);
    app.post(prefix+'/collectors/:id/start',collect.startCollectorByID);
    app.post(prefix+'/collectors/:id/stop',collect.stopCollectorByID);

    app.get(prefix+'/kpis/definition',kpi.getKPIDefinitions);
    app.get(prefix+'/kpis/domains',kpi.getKPIDomains);
    app.get(prefix+'/kpis/templates',kpi.getKPITemplates);
    app.get(prefix+'/kpis/templates/:domain/domain',kpi.getKPITemplatesByDomain);
    app.get(prefix+'/kpis/templates/:domain/:type/sub',kpi.getKPISubTemplates);
    app.get(prefix+'/kpis/granularity',kpi.getKPIGranularity);
    app.get(prefix+'/kpis/source',kpi.getSourceKPIList);
    app.get(prefix+'/kpis/id',kpi.getKPIID);
    app.get(prefix+'/kpis/create/',kpi.createKPIForExternalGetRequest);
    app.post(prefix+'/kpis/create',kpi.createKPI);
    app.post(prefix+'/kpis/value',kpi.queryKPI);

    app.get(prefix+'/kpis/values/nfvdgui',kpi.getKPIsForNFVDGUIRequestMonitor);

    //Where the more generic logErrors may write request and error information to stderr, loggly, or similar services:
    function logErrors(err, req, res, next) {
        console.error('OSSP Plugin Plugin ROUTE logErrors: (', (err ? err.stack : err), ')');
        next(err);
    }

    //Where clientErrorHandler is defined as the following (note that the error is explicitly passed along to the next):
    function clientErrorHandler(err, req, res, next) {
        console.log('OSSP Plugin ROUTE clientErrorHandler');
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
