define(
    [
        'angular',
        'components/language-config/language-config',
        'addons/ossp/widgets/ossp-kpi-manager/ossp-kpi-manager-directives',
        'addons/ossp/widgets/ossp-kpi-manager/ossp-kpi-manager-controllers'
    ],

    function (angular) {
        'use strict';

//        var vdcmngrWidget = angular.module('nfvdVdcManager',
//            ['vdcmngrWidgetDirectives', 'vdcmngrWidgetControllers', 'nfvdModuleDirectives','nfvdVdcmngrInspectorDirectives'
//                ,'pascalprecht.translate']);
        var osspkpiManager = angular.module('osspKpiManager',
            ['osspKPIManagerDirectives', 'osspKPIManagerControllers']);

//        vdcmngrWidget.run(['$translatePartialLoader',
//            function($translatePartialLoader) {
//                $translatePartialLoader.addPart('addons/nfvd/widgets/nfvd-vdc-manager/');
//            }
//        ]);

        return osspkpiManager;
    });
