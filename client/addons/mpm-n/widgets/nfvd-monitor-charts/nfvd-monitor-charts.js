define(
    [
        'angular',
        'addons/mpm-n/widgets/nfvd-monitor-charts/nfvd-monitor-charts-directives',
        'addons/mpm-n/widgets/nfvd-monitor-charts/nfvd-monitor-charts-controllers'
    ],

    function (angular) {
        'use strict';

        //console.log("Loading study-highchart widget module");
        // Module definition
        var w = angular.module('nfvdMonitorCharts', ['nfvdMonitorChartsDirectives', 'nfvdMonitorChartsControllers']);
        return w;
    });
