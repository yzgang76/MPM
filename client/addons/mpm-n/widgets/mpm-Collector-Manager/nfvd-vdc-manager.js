define(
    [
        'angular',
        'components/language-config/language-config',
        'addons/nfvd/widgets/nfvd-vdc-manager/nfvd-vdc-manager-directives',
        'addons/nfvd/widgets/nfvd-vdc-manager/nfvd-vdc-manager-controllers',
        'addons/nfvd/widgets/nfvd-vdc-manager/inspector/nfvd-vdcmngr-inspector-directives',
        'addons/nfvd/modules/nfvd-module/nfvd-module-directive',
        'addons/nfvd/widgets/nfvd-template-designer/inspector/nfvd-designer-inspector-directives',
        'addons/nfvd/widgets/nfvd-template-designer/inspector/nfvd-inspector-content-directives',
        'addons/nfvd/widgets/nfvd-template-designer/componentTree/nfvd-componenttree-directives'
    ],

    function (angular) {
        'use strict';

//        var vdcmngrWidget = angular.module('nfvdVdcManager',
//            ['vdcmngrWidgetDirectives', 'vdcmngrWidgetControllers', 'nfvdModuleDirectives','nfvdVdcmngrInspectorDirectives'
//                ,'pascalprecht.translate']);
        var vdcmngrWidget = angular.module('nfvdVdcManager',
            ['vdcmngrWidgetDirectives', 'vdcmngrWidgetControllers', 'nfvdVdcmngrInspectorDirectives', 'nfvdModuleDirectives',
            'nfvdDesignerInspectorDirectives', 'nfvdInspectorContentDirectives', 'nfvdComponenttreeDirectives']);


//        vdcmngrWidget.run(['$translatePartialLoader',
//            function($translatePartialLoader) {
//                $translatePartialLoader.addPart('addons/nfvd/widgets/nfvd-vdc-manager/');
//            }
//        ]);

        return vdcmngrWidget;
    });
