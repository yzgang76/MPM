define(
    [
        'angular',
        'components/language-config/language-config',
        'addons/ossp/widgets/ossp-kpi-new/ossp-kpi-new-directives',
        'addons/ossp/widgets/ossp-kpi-new/ossp-kpi-new-controllers'
    ],

    function (angular) {
        'use strict';

//        var vdcmngrWidget = angular.module('nfvdVdcNew',
//            ['vdcmngrWidgetDirectives', 'vdcmngrWidgetControllers', 'nfvdModuleDirectives','nfvdVdcmngrInspectorDirectives'
//                ,'pascalprecht.translate']);
        var osspkpiNew = angular.module('osspKpiNew',
            ['osspKPINewDirectives', 'osspKPINewControllers']);

//        vdcmngrWidget.run(['$translatePartialLoader',
//            function($translatePartialLoader) {
//                $translatePartialLoader.addPart('addons/nfvd/widgets/nfvd-vdc-manager/');
//            }
//        ]);

        return osspkpiNew;
    });
