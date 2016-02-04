define(
    [
        'angular',
        'components/language-config/language-config',
        'addons/ossp/widgets/ossp-kpi-threshold/ossp-kpi-threshold-directives',
        'addons/ossp/widgets/ossp-kpi-threshold/ossp-kpi-threshold-controllers'
    ],

    function (angular) {
        'use strict';

//        var vdcmngrWidget = angular.module('nfvdVdcThreshold',
//            ['vdcmngrWidgetDirectives', 'vdcmngrWidgetControllers', 'nfvdModuleDirectives','nfvdVdcmngrInspectorDirectives'
//                ,'pascalprecht.translate']);
        var osspkpiThreshold = angular.module('osspKpiThreshold',
            ['osspKPIThresholdDirectives', 'osspKPIThresholdControllers']);

//        vdcmngrWidget.run(['$translatePartialLoader',
//            function($translatePartialLoader) {
//                $translatePartialLoader.addPart('addons/nfvd/widgets/nfvd-vdc-manager/');
//            }
//        ]);

        return osspkpiThreshold;
    });
