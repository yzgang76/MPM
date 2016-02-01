define(
    [
        'angular',
        'addons/ossp/widgets/ossp-model-designer/ossp-model-designer-controllers'
        //'addons/nfvd/modules/nfvd-module/nfvd-module-filters'
        //'css!addons/nfvd/widgets/nfvd-vdc-manager/css/vdcmgr_layout.css'
        //'css!addons/nfvd/widgets/nfvd-vdc-manager/css/green.css'
        //'css!addons/nfvd/widgets/nfvd-vdc-manager/css/telefonica.css'
    ],
    function(angular) {
        'use strict';
        // Module definition
        var osspModelDesignerDirectives = angular.module('osspModelDesignerDirectives', ['osspModelDesignerControllers']);


        osspModelDesignerDirectives.directive('osspKpiThreshold', function() {

            return {
                restrict: 'E',
                scope: {
                    widget: '=',
                    context: '='
                },
                templateUrl: 'addons/ossp/widgets/ossp-model-designer/ossp-model-designer.html',
                controller: 'osspModelDesignerController',
                link: function(scope, iElement, iAttrs) {
                }
            };
        }); // Directive
        return osspModelDesignerDirectives;
    });
