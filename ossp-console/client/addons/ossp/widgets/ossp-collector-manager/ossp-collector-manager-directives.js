define(
    [
        'angular',
        'addons/ossp/widgets/ossp-collector-manager/ossp-collector-manager-controllers'
        //'addons/nfvd/modules/nfvd-module/nfvd-module-filters'
        //'css!addons/nfvd/widgets/nfvd-vdc-manager/css/vdcmgr_layout.css'
        //'css!addons/nfvd/widgets/nfvd-vdc-manager/css/green.css'
        //'css!addons/nfvd/widgets/nfvd-vdc-manager/css/telefonica.css'
    ],
    function(angular) {
        'use strict';
        // Module definition
        var osspCollectorManagerDirectives = angular.module('osspCollectorManagerDirectives', ['osspCollectorManagerControllers']);


        osspCollectorManagerDirectives.directive('osspCollectorManager', function() {

            return {
                restrict: 'E',
                scope: {
                    widget: '=',
                    context: '='
                },
                templateUrl: 'addons/ossp/widgets/ossp-collector-manager/ossp-collector-manager.html',
                controller: 'osspCollectorManagerController',
                link: function(scope, iElement, iAttrs) {
                }
            };
        }); // Directive
        return osspCollectorManagerDirectives;
    });
