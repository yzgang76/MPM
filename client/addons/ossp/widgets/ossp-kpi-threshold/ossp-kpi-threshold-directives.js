define(
    [
        'angular',
        'addons/ossp/widgets/ossp-kpi-threshold/ossp-kpi-threshold-controllers'
        //'addons/nfvd/modules/nfvd-module/nfvd-module-filters'
        //'css!addons/nfvd/widgets/nfvd-vdc-manager/css/vdcmgr_layout.css'
        //'css!addons/nfvd/widgets/nfvd-vdc-manager/css/green.css'
        //'css!addons/nfvd/widgets/nfvd-vdc-manager/css/telefonica.css'
    ],
    function(angular) {
        'use strict';
        // Module definition
        var osspKPIThresholdDirectives = angular.module('osspKPIThresholdDirectives', ['osspKPIThresholdControllers']);


        osspKPIThresholdDirectives.directive('osspKpiThreshold', function() {

            return {
                restrict: 'E',
                scope: {
                    widget: '=',
                    context: '='
                },
                templateUrl: 'addons/ossp/widgets/ossp-kpi-threshold/ossp-kpi-threshold.html',
                controller: 'osspKPIThresholdController',
                link: function(scope, iElement, iAttrs) {
                }
            };
        }); // Directive
        return osspKPIThresholdDirectives;
    });
