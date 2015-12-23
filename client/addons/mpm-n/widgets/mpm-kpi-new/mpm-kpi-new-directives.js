define(
    [
        'angular',
        'addons/mpm-n/widgets/mpm-kpi-manager/mpm-kpi-manager-controllers'
        //'addons/nfvd/modules/nfvd-module/nfvd-module-filters'
        //'css!addons/nfvd/widgets/nfvd-vdc-manager/css/vdcmgr_layout.css'
        //'css!addons/nfvd/widgets/nfvd-vdc-manager/css/green.css'
        //'css!addons/nfvd/widgets/nfvd-vdc-manager/css/telefonica.css'
    ],
    function(angular) {
        'use strict';
        // Module definition
        var mpmKPINewDirectives = angular.module('mpmKPINewDirectives', ['mpmKPINewControllers']);


        mpmKPINewDirectives.directive('mpmKpiNew', function() {

            return {
                restrict: 'E',
                scope: {
                    widget: '=',
                    context: '='
                },
                templateUrl: 'addons/mpm-n/widgets/mpm-kpi-new/mpm-kpi-new.html',
                controller: 'mpmKPINewController',
                link: function(scope, iElement, iAttrs) {
                }
            };
        }); // Directive
        return mpmKPINewDirectives;
    });
