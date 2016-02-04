define(
    [
        'angular',
        'addons/ossp/widgets/nfvd-monitor-charts/nfvd-monitor-charts-directives',
        'addons/ossp/widgets/nfvd-monitor-charts/nfvd-monitor-charts-controllers'
    ],

    function (angular) {
        'use strict';

        //console.log("Loading study-highchart widget module");
        // Module definition
        var w = angular.module('nfvdMonitorCharts', ['nfvdMonitorChartsDirectives', 'nfvdMonitorChartsControllers']);
        //awrwre
        return w;
    });
