define([
        'angular',
        'lodash',
        //'jquery',
        //'joint',
        //'backbone',
        'commons/events/commons-events',
        'components/data-exchange/data-exchange-services',
        'addons/mpm-n/modules/mpm-data-access/mpm-data-access-services',
        'components/message-notifier/message-notifier-services',
    ],
    function(angular,_) {
        'use strict';
        var mpmCollectorManagerControllers = angular.module('mpmCollectorManagerControllers', [ 'commonsEvents','dataExchangeServices','mpmDataAccessServices']);
        mpmCollectorManagerControllers.controller('mpmCollectorManagerController', [
            '$rootScope',
            '$scope',
            '$log',
            '$timeout',
            'dataExchangeService',
            'mpmDataAccessService',
            'messageNotifierService',
            function($rootScope, $scope, $log, $timeout,dataExchangeService,dataAccessService,messageNotifierService) {
                var logger = $log.getInstance('mpmCollectorManagerControllers');
                $scope.title = "Collector Manager";
                function refresh(){
                    var route1='/collectors';
                    var p1 = dataAccessService.getRouteDeferred(route1, '', false).promise;
                    p1.then(
                        function(response) {
                            $scope.collectors=response.data;
                        },
                        function(error) {
                            messageNotifierService.error(JSON.stringify(error));
                            logger.error('Cant get data', route1, error);
                        }
                    );
                }

                $scope.refreshStatus=function(c){
                    var route1='/collectors/'+ c.id;
                    var p1 = dataAccessService.getRouteDeferred(route1, '', false).promise;
                    p1.then(
                        function(response) {
                            var i= _.findIndex($scope.collectors,{id: c.id});
                            if(i!==-1){
                                if(_.isEmpty(response.data)){
                                    $scope.collectors[i].status='Offline';
                                }else{
                                    $scope.collectors[i]=response.data;
                                }
                            }else{
                                console.error('Error 111',i,$scope.collectors,response.data);
                            }
                        },
                        function(error) {
                            messageNotifierService.error(JSON.stringify(error));
                            logger.error('Cant get data', route1, error);
                        }
                    );
                };
              /*  $scope.$watch(function(){
                    return $scope.collectors;
                },function(o,n){
                   console.log('mmmmmmmmmmmmmmmmm') ;
                });*/
                $scope.getActionLabel=function(a){
                  if(a.status==='stopped'){
                      return 'Start';
                  }else if(a.status==='started'){
                      return 'Stop';
                  }else{
                      return '';
                  }
                };
                $scope.operate=function(a){
                    if(a.status==='stopped'){
                       _startCollector(a);
                    }else if(a.status==='started'){
                        _stopCollector(a);
                    }else{
                        return;
                    }
                    function _startCollector(c){
                        var route1='/collectors/'+ c.id+'/start';
                        var p1 = dataAccessService.postRouteDeferred(route1, '', {},false).promise;
                        p1.then(
                            function(response) {
                                console.log('start '+ c.name+' succ');
                            },
                            function(error) {
                                messageNotifierService.error(JSON.stringify(error));
                                logger.error('Cant get data', route1, error);
                            }
                        );
                    }
                    function _stopCollector(c){
                        var route1='/collectors/'+ c.id+'/stop';
                        var p1 = dataAccessService.postRouteDeferred(route1, '', {},false).promise;
                        p1.then(
                            function(response) {
                                console.log('stop '+ c.name+' succ');
                            },
                            function(error) {
                                messageNotifierService.error(JSON.stringify(error));
                                logger.error('Cant get data', route1, error);
                            }
                        );
                    }
                };
                $scope.$on('webgui.widgetRefresh', function() {
                    //logger.debug($scope.widget.uniqueId, 'event webgui.widgetRefresh');
                    refresh();
                });
                refresh();
            }
        ]);

        return mpmCollectorManagerControllers;
    });
