define(
    [
        'angular',
        'addons/mpm-n/widgets/mpm-collector-manager/mpm-collector-manager-controllers'
        //'addons/nfvd/modules/nfvd-module/nfvd-module-filters'
        //'css!addons/nfvd/widgets/nfvd-vdc-manager/css/vdcmgr_layout.css'
        //'css!addons/nfvd/widgets/nfvd-vdc-manager/css/green.css'
        //'css!addons/nfvd/widgets/nfvd-vdc-manager/css/telefonica.css'
    ],
    function(angular) {
        'use strict';
        // Module definition
        var mpmCollectorManagerDirectives = angular.module('mpmCollectorManagerDirectives', ['mpmCollectorManagerControllers']);


        mpmCollectorManagerDirectives.directive('mpmCollectorManager', function() {

            return {
                restrict: 'E',
                scope: {
                    widget: '=',
                    context: '='
                },
                templateUrl: 'addons/mpm-n/widgets/mpm-collector-manager/mpm-collector-manager.html',
                controller: 'mpmCollectorManagerController',
                link: function(scope, iElement, iAttrs) {
                }
            };
        }); // Directive
        return mpmCollectorManagerDirectives;
    });
