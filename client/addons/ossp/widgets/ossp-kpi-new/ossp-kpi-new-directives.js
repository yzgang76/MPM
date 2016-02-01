define(
    [
        'angular',
        'addons/ossp/widgets/ossp-kpi-new/ossp-kpi-new-controllers'
        //'addons/nfvd/modules/nfvd-module/nfvd-module-filters'
        //'css!addons/nfvd/widgets/nfvd-vdc-manager/css/vdcmgr_layout.css'
        //'css!addons/nfvd/widgets/nfvd-vdc-manager/css/green.css'
        //'css!addons/nfvd/widgets/nfvd-vdc-manager/css/telefonica.css'
    ],
    function(angular) {
        'use strict';
        // Module definition
        var osspKPINewDirectives = angular.module('osspKPINewDirectives', ['osspKPINewControllers']);


        osspKPINewDirectives.directive('osspKpiNew', function() {

            return {
                restrict: 'E',
                scope: {
                    widget: '=',
                    context: '='
                },
                templateUrl: 'addons/ossp/widgets/ossp-kpi-new/ossp-kpi-new.html',
                controller: 'osspKPINewController',
                link: function(scope, iElement, iAttrs) {
                }
            };
        }); // Directive
        return osspKPINewDirectives;
    });
