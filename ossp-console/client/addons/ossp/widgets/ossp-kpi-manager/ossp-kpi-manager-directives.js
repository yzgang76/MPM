define(
    [
        'angular',
        'addons/ossp/widgets/ossp-kpi-manager/ossp-kpi-manager-controllers'
        //'addons/nfvd/modules/nfvd-module/nfvd-module-filters'
        //'css!addons/nfvd/widgets/nfvd-vdc-manager/css/vdcmgr_layout.css'
        //'css!addons/nfvd/widgets/nfvd-vdc-manager/css/green.css'
        //'css!addons/nfvd/widgets/nfvd-vdc-manager/css/telefonica.css'
    ],
    function(angular) {
        'use strict';
        // Module definition
        var osspKPIManagerDirectives = angular.module('osspKPIManagerDirectives', ['osspKPIManagerControllers']);


        osspKPIManagerDirectives.directive('osspKpiManager', function() {

            return {
                restrict: 'E',
                scope: {
                    widget: '=',
                    context: '='
                },
                templateUrl: 'addons/ossp/widgets/ossp-kpi-manager/ossp-kpi-manager.html',
                controller: 'osspKPIManagerController',
                link: function(scope, iElement, iAttrs) {
                }
            };
        }); // Directive
        return osspKPIManagerDirectives;
    });
