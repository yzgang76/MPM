define(
    [
        'angular',
        'addons/nfvd/widgets/nfvd-vdc-manager/nfvd-vdc-manager-controllers',
        'addons/nfvd/modules/nfvd-module/nfvd-module-filters'
        //'css!addons/nfvd/widgets/nfvd-vdc-manager/css/vdcmgr_layout.css'
        //'css!addons/nfvd/widgets/nfvd-vdc-manager/css/green.css'
        //'css!addons/nfvd/widgets/nfvd-vdc-manager/css/telefonica.css'
    ],
    function(angular) {
        'use strict';

        // Module definition
        var vdcmngrWidgetDirectives = angular.module('vdcmngrWidgetDirectives', ['vdcmngrWidgetControllers', 'nfvdModuleFilters']);


        vdcmngrWidgetDirectives.directive('vdcmngrWidgetDirective', function() {

            return {
                restrict: 'E',
                scope: {
                    widget: '=',
                    context: '='
                },
                templateUrl: 'addons/nfvd/widgets/nfvd-vdc-manager/nfvd-vdc-manager.html',
                controller: 'vdcmngrWidgetController',
                link: function(scope, iElement, iAttrs) {
                }
            };
        }); // Directive
        return vdcmngrWidgetDirectives;
    });
