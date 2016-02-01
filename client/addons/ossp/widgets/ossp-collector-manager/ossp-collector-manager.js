define(
    [
        'angular',
        'components/language-config/language-config',
        'addons/ossp/widgets/ossp-collector-manager/ossp-collector-manager-directives',
        'addons/ossp/widgets/ossp-collector-manager/ossp-collector-manager-controllers'
    ],

    function (angular) {
        'use strict';

//        var vdcmngrWidget = angular.module('nfvdVdcManager',
//            ['vdcmngrWidgetDirectives', 'vdcmngrWidgetControllers', 'nfvdModuleDirectives','nfvdVdcmngrInspectorDirectives'
//                ,'pascalprecht.translate']);
        var osspCollectorManager = angular.module('osspCollectorManager',
            ['osspCollectorManagerDirectives', 'osspCollectorManagerControllers']);

//        vdcmngrWidget.run(['$translatePartialLoader',
//            function($translatePartialLoader) {
//                $translatePartialLoader.addPart('addons/nfvd/widgets/nfvd-vdc-manager/');
//            }
//        ]);

        return osspCollectorManager;
    });
