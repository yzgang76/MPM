define(
    [
        'angular',
        'components/language-config/language-config',
        'addons/mpm-n/widgets/mpm-kpi-manager/mpm-kpi-manager-directives',
        'addons/mpm-n/widgets/mpm-kpi-manager/mpm-kpi-manager-controllers'
    ],

    function (angular) {
        'use strict';

//        var vdcmngrWidget = angular.module('nfvdVdcManager',
//            ['vdcmngrWidgetDirectives', 'vdcmngrWidgetControllers', 'nfvdModuleDirectives','nfvdVdcmngrInspectorDirectives'
//                ,'pascalprecht.translate']);
        var mpmkpiManager = angular.module('mpmKpiManager',
            ['mpmKPIManagerDirectives', 'mpmKPIManagerControllers']);

//        vdcmngrWidget.run(['$translatePartialLoader',
//            function($translatePartialLoader) {
//                $translatePartialLoader.addPart('addons/nfvd/widgets/nfvd-vdc-manager/');
//            }
//        ]);

        return mpmkpiManager;
    });
