define(
    [
        'angular',
        'addons/mpm-n/widgets/mpm-kpi-threshold/mpm-kpi-threshold-controllers'
        //'addons/nfvd/modules/nfvd-module/nfvd-module-filters'
        //'css!addons/nfvd/widgets/nfvd-vdc-manager/css/vdcmgr_layout.css'
        //'css!addons/nfvd/widgets/nfvd-vdc-manager/css/green.css'
        //'css!addons/nfvd/widgets/nfvd-vdc-manager/css/telefonica.css'
    ],
    function(angular) {
        'use strict';
        // Module definition
        var mpmKPIThresholdDirectives = angular.module('mpmKPIThresholdDirectives', ['mpmKPIThresholdControllers']);


        mpmKPIThresholdDirectives.directive('mpmKpiThreshold', function() {

            return {
                restrict: 'E',
                scope: {
                    widget: '=',
                    context: '='
                },
                templateUrl: 'addons/mpm-n/widgets/mpm-kpi-threshold/mpm-kpi-threshold.html',
                controller: 'mpmKPIThresholdController',
                link: function(scope, iElement, iAttrs) {
                }
            };
        }); // Directive
        return mpmKPIThresholdDirectives;
    });
