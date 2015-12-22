define(
    [
        'angular',
        'components/language-config/language-config',
        'addons/mpm-n/widgets/mpm-collector-manager/mpm-collector-manager-directives',
        'addons/mpm-n/widgets/mpm-collector-manager/mpm-collector-manager-controllers',
    ],

    function (angular) {
        'use strict';

//        var vdcmngrWidget = angular.module('nfvdVdcManager',
//            ['vdcmngrWidgetDirectives', 'vdcmngrWidgetControllers', 'nfvdModuleDirectives','nfvdVdcmngrInspectorDirectives'
//                ,'pascalprecht.translate']);
        var mpmCollectorManager = angular.module('mpmCollectorManager',
            ['mpmCollectorManagerDirectives', 'mpmCollectorManagerControllers']);

//        vdcmngrWidget.run(['$translatePartialLoader',
//            function($translatePartialLoader) {
//                $translatePartialLoader.addPart('addons/nfvd/widgets/nfvd-vdc-manager/');
//            }
//        ]);

        return mpmCollectorManager;
    });
