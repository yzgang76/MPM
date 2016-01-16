define(
    [
        'angular',
        'components/language-config/language-config',
        'addons/mpm-n/widgets/mpm-kpi-threshold/mpm-kpi-threshold-directives',
        'addons/mpm-n/widgets/mpm-kpi-threshold/mpm-kpi-threshold-controllers'
    ],

    function (angular) {
        'use strict';

//        var vdcmngrWidget = angular.module('nfvdVdcThreshold',
//            ['vdcmngrWidgetDirectives', 'vdcmngrWidgetControllers', 'nfvdModuleDirectives','nfvdVdcmngrInspectorDirectives'
//                ,'pascalprecht.translate']);
        var mpmkpiThreshold = angular.module('mpmKpiThreshold',
            ['mpmKPIThresholdDirectives', 'mpmKPIThresholdControllers']);

//        vdcmngrWidget.run(['$translatePartialLoader',
//            function($translatePartialLoader) {
//                $translatePartialLoader.addPart('addons/nfvd/widgets/nfvd-vdc-manager/');
//            }
//        ]);

        return mpmkpiThreshold;
    });
