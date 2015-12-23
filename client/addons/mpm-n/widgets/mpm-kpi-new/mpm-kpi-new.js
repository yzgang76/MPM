define(
    [
        'angular',
        'components/language-config/language-config',
        'addons/mpm-n/widgets/mpm-kpi-new/mpm-kpi-new-directives',
        'addons/mpm-n/widgets/mpm-kpi-new/mpm-kpi-new-controllers'
    ],

    function (angular) {
        'use strict';

//        var vdcmngrWidget = angular.module('nfvdVdcNew',
//            ['vdcmngrWidgetDirectives', 'vdcmngrWidgetControllers', 'nfvdModuleDirectives','nfvdVdcmngrInspectorDirectives'
//                ,'pascalprecht.translate']);
        var mpmkpiNew = angular.module('mpmKpiNew',
            ['mpmKPINewDirectives', 'mpmKPINewControllers']);

//        vdcmngrWidget.run(['$translatePartialLoader',
//            function($translatePartialLoader) {
//                $translatePartialLoader.addPart('addons/nfvd/widgets/nfvd-vdc-manager/');
//            }
//        ]);

        return mpmkpiNew;
    });
