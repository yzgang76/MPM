define([
        'angular',
        'lodash',
        //'jquery',
        //'joint',
        //'backbone',
        'addons/ossp/bower_components/async/dist/async',
        'commons/events/commons-events',
        'components/data-exchange/data-exchange-services',
        'addons/ossp/modules/ossp-data-access/ossp-data-access-services',
        'components/message-notifier/message-notifier-services'
    ],
    function(angular,_,async) {
        'use strict';
        var osspModelDesignerControllers = angular.module('osspModelDesignerControllers', ['commonsEvents','dataExchangeServices','osspDataAccessServices','messageNotifierServices']);
        osspModelDesignerControllers.controller('osspModelDesignerController', [
            '$rootScope',
            '$scope',
            '$log',
            '$location',
            'dataExchangeService',
            'osspDataAccessService',
            'messageNotifierService',
            function($rootScope, $scope, $log, $location,dataExchangeService,dataAccessService,messageNotifierService) {
                var logger = $log.getInstance('osspModelDesignerControllers');
                $scope.d={};
                $scope.shapes= {
                    "basic": [
                        {
                            "type": "basic.Rect",
                            "size": { "width": 5, "height": 3 },
                            "attrs": {
                                "rect": { "rx": 2, "ry": 2, "width": 50, "height": 30, "fill": "#27AE60" },
                                "text": { "text": "rect", "fill": "#ffffff", "font-size": 10, "stroke": "#000000", "stroke-width": 0 }
                            }
                        },{
                            "type": "basic.Circle",
                            "size": { "width": 5, "height": 3 },
                            "attrs": {
                                "circle": { "width": 50, "height": 30, "fill": "#E74C3C" },
                                "text": { "text": "ellipse", "fill": "#ffffff", "font-size": 10, "stroke": "#000000", "stroke-width": 0 }
                            }
                        }, {
                            "type": "devs.Atomic",
                            "size": { "width": 4, "height": 3 },
                            "inPorts": ["in1","in2"],
                            "outPorts": ["out"],
                            "attrs": {
                                "rect": { "fill": "#8e44ad", "rx": 2, "ry": 2 },
                                ".label": { "text": "model", "fill": "#ffffff", "font-size": 10, "stroke": "#000000", "stroke-width": 0 },
                                ".inPorts circle": { "fill": "#f1c40f", "opacity": 0.9 },
                                ".outPorts circle": { "fill": "#f1c40f", "opacity": 0.9 },
                                ".inPorts text, .outPorts text": { "font-size": 9 }
                            }
                        }
                    ]
                };
            }

        ]);

        return osspModelDesignerControllers;
    });
