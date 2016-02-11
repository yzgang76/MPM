define([
        'angular',
        'lodash',
        //'jquery',
        //'joint',
        //'backbone',
        'commons/events/commons-events',
        'components/data-exchange/data-exchange-services',
        'addons/ossp/modules/ossp-data-access/ossp-data-access-services',
        'components/message-notifier/message-notifier-services'
    ],
    function(angular,_) {
        'use strict';
        var osspKPIManagerControllers = angular.module('osspKPIManagerControllers', [ 'commonsEvents','dataExchangeServices','osspDataAccessServices']);
        osspKPIManagerControllers.controller('dlgKPIValueController',['$scope', '$modalInstance','osspDataAccessService', 'item', function($scope, $modalInstance,dataAccessService, item){
            $scope.ts=100002700000;
            $scope.item=item;
            $scope.truncateNE=function(r){
              return _.trunc(r.ne,40);
            };
            $scope.query=function(){
                var url='/kpis/value';
                var body={
                    "id":$scope.item.id,
                    "ts":parseInt($scope.ts),
                    "size":5
                };
                var p1 = dataAccessService.postRouteDeferred(url, '',body, false).promise;
                p1.then(
                    function(response) {
                        $scope.results=response.data;
                    },
                    function(error) {
                        $scope.results='Cant get data: '+ error;
                    }
                );
            };


            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        }]);
        osspKPIManagerControllers.controller('osspKPIManagerController', [
            '$rootScope',
            '$scope',
            '$log',
            '$location',
            '$window',
            '$modal',
            'dataExchangeService',
            'osspDataAccessService',
            'messageNotifierService',
            function($rootScope, $scope, $log, $location,$window,$modal,dataExchangeService,dataAccessService,messageNotifierService) {
                var logger = $log.getInstance('osspKPIManagerControllers');
                //logger.warn('ssssssssssssssssssss$',$scope);
                $scope.title = "KPI Manager";
                function refresh(){
                    var route1='/kpis/definition';
                    var p1 = dataAccessService.getRouteDeferred(route1, '', false).promise;
                    p1.then(
                        function(response) {
                            $scope.kpis=response.data;
                        },
                        function(error) {
                            messageNotifierService.error(JSON.stringify(error));
                            logger.error('Cant get data', route1, error);
                        }
                    );
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
                $scope.createNewAPI=function(){
                    var url = '/workspaces/'+_.get($scope,'context.workspace._id') + '/views/osspKPINew';
                    $location.url(url);
                };
                $scope.onEditKPI=function(item){
                    //var url = '/workspaces/'+_.get($scope,'context.workspace._id') + '/views/osspKPINew?kpiid='+item.id+'&netype='+item.ne+'&kpitype='+item.type+'&gran='+item.gran+'&formula='+item.formula+'&description='+item.description+'&unit='+item.unit;
                    //$location.url(url);
                    $window.alert('TO BE DEVELOPED');
                };
                $scope.onManageThreshold=function(item){
                    var url = '/workspaces/'+_.get($scope,'context.workspace._id') + '/views/osspKPIThreshold?kpiid='+item.id+'&netype='+item.ne+'&kpitype='+item.type+'&kpiname='+item.name+'&gran='+item.gran+'&unit='+(item.unit||'');

                    console.log('rrrrrrrrrrrrrrrr',url);
                    $location.url(url);
                    //$window.alert('TO BE DEVELOPED');
                };
                $scope.onQueryKPI=function(item){
                    var modalInstance = $modal.open({
                        size:'lg',
                        backdrop: 'static',
                        templateUrl: 'addons/ossp/widgets/ossp-kpi-manager/dlgKPIValue.html',
                        controller: 'dlgKPIValueController',
                        //size: size,
                        resolve: {
                            item:function(){
                                return item;
                            }
                        }
                    });

                    modalInstance.result.then(function (selectedItem) {
                        $scope.selected = selectedItem;
                    }, function () {
                        $log.info('Modal dismissed at: ' + new Date());
                    });

                };
                refresh();
            }
        ]);

        return osspKPIManagerControllers;
    });
