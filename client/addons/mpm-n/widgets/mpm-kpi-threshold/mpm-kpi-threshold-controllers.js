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
        var mpmKPIThresholdControllers = angular.module('mpmKPIThresholdControllers', [ 'commonsEvents','dataExchangeServices','mpmDataAccessServices','messageNotifierServices']);
        mpmKPIThresholdControllers.controller('mpmKPIThresholdController', [
            '$rootScope',
            '$scope',
            '$log',
            '$location',
            'dataExchangeService',
            'mpmDataAccessService',
            'messageNotifierService',
            function($rootScope, $scope, $log, $location,dataExchangeService,dataAccessService,messageNotifierService) {
                var logger = $log.getInstance('mpmKPIThresholdControllers');

                $scope.KPIID=dataExchangeService.getData('kpiid');
                $scope.KPIName=dataExchangeService.getData('kpiname');
                $scope.neType=dataExchangeService.getData('neType');
                $scope.KPIType=dataExchangeService.getData('kpitype');
                $scope.gran=dataExchangeService.getData('gran');
                $scope.unit=dataExchangeService.getData('unit');

                function refresh(){

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
                $scope.$on('webgui.widgetRefresh', function() {
                    //logger.debug($scope.widget.uniqueId, 'event webgui.widgetRefresh');
                    refresh();
                });
                $scope.back=function(){
                    var url = '/workspaces/'+_.get($scope,'context.workspace._id') + '/views/mpmKPIManager';
                    $location.url(url);
                };
                refresh();
            }

        ]);

        return mpmKPIThresholdControllers;
    });
