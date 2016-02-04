'use strict';
require.config({
    paths: {
        g: '../addons/ossp/bower_components/joint/src/geometry',
        V: '../addons/ossp/bower_components/joint/src/vectorizer',
        backbone: '../addons/ossp/bower_components/backbone/backbone',
        //joint:'../addons/nfvd/bower_components/joint/dist/joint.all.clean',
        joint: '../addons/ossp/lib/rappid/joint.all.clean',
        KeyboardJS: '../addons/ossp/bower_components/keyboardjs/keyboard',
        //angularAnimate: '../addons/ossp/bower_components/angular-animate/angular-animate.min'
    },
    shim: {

        angularAnimate: ['angular'],

        //With Exports
        KeyboardJS: {
            exports: 'KeyboardJS'
        },

        backbone: {
            //These script dependencies should       deps: ['lodash', 'jquery'],
            //be loaded before loading backbone.js.
            //Once loaded, use the global 'Backbone' as the module value.
            exports: 'Backbone'
        },

        joint: {
            deps: ['g', 'V', 'jquery', 'lodash', 'backbone'],
            exports: 'joint'
          /*  init: function(geometry, vectorizer) {
                 // JointJS must export geometry and vectorizer otheriwse
                 // they won't be exported due to the AMD nature of those libs and
                 // so JointJS would be missing them.
                 this.g = geometry;
                 this.V = vectorizer;
            }*/
        }

    },
    map: {
        'backbone': {
            'underscore': 'lodash' //use lodash to replace underscore
        }
    }
});

define([
        'angular',
        'components/language-config/language-config',
        'commons/events/commons-events',
        //'addons/nfvd/modules/nfvd-module/nfvd-module-filters',
        //'addons/nfvd/modules/nfvd-module/nfvd-module-services',
        //'addons/nfvd/modules/nfvd-user/nfvd-user-services'
    ],
    function(angular) {
        var moduleApp = angular.module('nfvdModule', ['commonsEvents']);
        //moduleApp.run(['$rootScope', '$translatePartialLoader', 'nfvdUserService', 'nfvdModuleService', 'events',
        //    function($rootScope, $translatePartialLoader, nfvdUserService, nfvdModuleService, events) {
        //        // Load module translation data
        //        $translatePartialLoader.addPart('/addons/nfvd/modules/nfvd-module');
        //
        //        $rootScope.$on(events['webgui.userLoggedIn'], function() {
        //            console.log('nfvdModule - $on.webgui.userlogin =- calling processProfile', this);
        //            nfvdUserService.initialize($rootScope.user);
        //        });
        //
        //    }
        //]);

        return moduleApp;
    });
