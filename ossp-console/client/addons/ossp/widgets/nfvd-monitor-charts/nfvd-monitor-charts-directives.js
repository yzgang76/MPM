define(
    ['angular',
        'addons/ossp/widgets/nfvd-monitor-charts/nfvd-monitor-charts-controllers'
    ],
    function(angular) {
        'use strict';
        //console.log('Loading study highchart widget directives');

        // Module definition
        var nfvdMonitorCharts = angular.module('nfvdMonitorChartsDirectives', ['nfvdMonitorChartsControllers']);


      nfvdMonitorCharts.directive('nfvdMonitorCharts', function() {
            console.log('nfvdMonitorCharts directive');


            return {
                restrict: 'E',
                scope: {
                    widget: '=',
                    context: '='
                },
                templateUrl: 'addons/ossp/widgets/nfvd-monitor-charts/nfvd-monitor-charts.html',
                controller: 'nfvdMonitorChartsController',
                link: function(scope, iElement, iAttrs) {
                    //console.log(scope.widget.uniqueId, 'uoc1 widget link function. Scope: ', scope, iAttrs);
                }
            };
        }); // Directive
        return nfvdMonitorCharts;
    });
