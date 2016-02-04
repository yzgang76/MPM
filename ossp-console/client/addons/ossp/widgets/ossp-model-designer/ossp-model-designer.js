define(
    [
        'angular',
        'components/language-config/language-config',
        'addons/ossp/widgets/ossp-model-designer/ossp-model-designer-directives',
        'addons/ossp/widgets/ossp-model-designer/ossp-model-designer-controllers'
    ],

    function (angular) {
        'use strict';

//        var vdcmngrWidget = angular.module('nfvdVdcThreshold',
//            ['vdcmngrWidgetDirectives', 'vdcmngrWidgetControllers', 'nfvdModuleDirectives','nfvdVdcmngrInspectorDirectives'
//                ,'pascalprecht.translate']);
        var osspModelDesigner = angular.module('osspModelDesigner',
            ['osspModelDesignerDirectives', 'osspModelDesignerControllers']);

//        vdcmngrWidget.run(['$translatePartialLoader',
//            function($translatePartialLoader) {
//                $translatePartialLoader.addPart('addons/nfvd/widgets/nfvd-vdc-manager/');
//            }
//        ]);

        return osspModelDesigner;
    });
