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
        var osspKPIThresholdControllers = angular.module('osspKPIThresholdControllers', [ 'commonsEvents','dataExchangeServices','osspDataAccessServices','messageNotifierServices']);
        osspKPIThresholdControllers.controller('osspKPIThresholdController', [
            '$rootScope',
            '$scope',
            '$log',
            '$location',
            'dataExchangeService',
            'osspDataAccessService',
            'messageNotifierService',
            function($rootScope, $scope, $log, $location,dataExchangeService,dataAccessService,messageNotifierService) {
                var logger = $log.getInstance('osspKPIThresholdControllers');

                $scope.KPIID=dataExchangeService.getData('kpiid');
                $scope.KPIName=dataExchangeService.getData('kpiname');
                $scope.neType=dataExchangeService.getData('neType');
                $scope.KPIType=dataExchangeService.getData('kpitype');
                $scope.gran=dataExchangeService.getData('gran');
                $scope.unit=dataExchangeService.getData('unit');

                $scope.connector=[
                    {type:'AND'},{type:'OR'}
                ];
                $scope.levels=[
                    {type:'warning'},{type:'error'},{type:'critical'}
                ];
                $scope.actions=[
                    {type:'Log'},{type:'SNMP Trap'},{type:'Script'}
                ];
                $scope.defines=[];
                $scope.addNewThreshold=function(){
                    $scope.defines.push({});
                };
                $scope.onDeleteThreshold=function(d){
                    _.remove($scope.defines ,function(f){
                        return f===d;
                    })  ;
                };
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
                    var url = '/workspaces/'+_.get($scope,'context.workspace._id') + '/views/osspKPIManager';
                    $location.url(url);
                };
                refresh();
            }

        ]);

        return osspKPIThresholdControllers;
    });
