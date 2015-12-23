define([
        'angular',
        'lodash',
        //'jquery',
        //'joint',
        //'backbone',
        'addons/mpm-n/bower_components/async/dist/async',
        'commons/events/commons-events',
        'components/data-exchange/data-exchange-services',
        'addons/mpm-n/modules/mpm-data-access/mpm-data-access-services',
        'components/message-notifier/message-notifier-services'
    ],
    function(angular,_,async) {
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

                $scope.kpiTypeList=[{type:'Raw'},{type:'Calculation'},{type:'Time Aggregation'},{type:'Entity Aggregation'}];
                function refresh(){

                    async.parallel({
                        neList:async.apply(_getTemplates),
                        granList:async.apply(_getGranularity)

                    },function(err,result){
                        if(err){
                            messageNotifierService.error(JSON.stringify(err));
                        }else{
                            $scope.neList=result.neList;
                            $scope.granList=result.granList;
                        }
                    });
                    function _getTemplates(callback){
                        var route1='/kpis/templates';
                        var p1 = dataAccessService.getRouteDeferred(route1, '', false).promise;
                        p1.then(
                            function(response) {
                                callback(null,response.data);
                            },
                            function(error) {
                                messageNotifierService.error(JSON.stringify(error));
                                logger.error('Cant get data', route1, error);
                                callback(error,null);
                            }
                        );
                    }
                    function _getGranularity(callback){
                        var route1='/kpis/granularity';
                        var p1 = dataAccessService.getRouteDeferred(route1, '', false).promise;
                        p1.then(
                            function(response) {
                                callback(null,response.data);
                            },
                            function(error) {
                                messageNotifierService.error(JSON.stringify(error));
                                logger.error('Cant get data', route1, error);
                                callback(error,null);
                            }
                        );
                    }

                }
                $scope.neTypeChange=function(){
                    console.log($scope.neType);
                };

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
