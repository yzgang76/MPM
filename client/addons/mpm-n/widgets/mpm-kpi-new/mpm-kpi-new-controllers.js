define([
        'angular',
        'lodash',
        //'jquery',
        //'joint',
        //'backbone',
        'commons/events/commons-events',
        'components/data-exchange/data-exchange-services',
        'addons/mpm-n/modules/mpm-data-access/mpm-data-access-services',
        'components/message-notifier/message-notifier-services'
    ],
    function(angular,_) {
        'use strict';
        var mpmKPINewControllers = angular.module('mpmKPINewControllers', [ 'commonsEvents','dataExchangeServices','mpmDataAccessServices']);
        mpmKPINewControllers.controller('mpmKPINewController', [
            '$rootScope',
            '$scope',
            '$log',
            '$timeout',
            'dataExchangeService',
            'mpmDataAccessService',
            'messageNotifierService',
            function($rootScope, $scope, $log, $timeout,dataExchangeService,dataAccessService,messageNotifierService) {
                var logger = $log.getInstance('mpmKPINewControllers');
                $scope.title = "KPI New";
                $scope.model='list';
                function refresh(){
                   /*  var route1='/kpis/definition';
                    var p1 = dataAccessService.getRouteDeferred(route1, '', false).promise;
                    p1.then(
                        function(response) {
                            $scope.kpis=response.data;
                        },
                        function(error) {
                            messageNotifierService.error(JSON.stringify(error));
                            logger.error('Cant get data', route1, error);
                        }
                    );*/
                }

                $scope.getType=function(t){
                    var ret;
                    switch(t-0){
                        case 0:
                            ret='Raw';
                            break;
                        case 1:
                            ret='Calculate';
                            break;
                        case 2:
                            ret='Time Aggregation';
                            break;
                        case 3:
                            ret='Entity Aggregation';
                            break;
                        default:
                            break;
                    }
                    return ret;
                };

                refresh();
            }
        ]);

        return mpmKPINewControllers;
    });
