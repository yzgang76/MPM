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
        var mpmKPINewControllers = angular.module('mpmKPINewControllers', [ 'commonsEvents','dataExchangeServices','mpmDataAccessServices','messageNotifierServices']);
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

                //$scope.neType={};
                //$scope.subNeType={};
                //$scope.neGranularity={};
                //$scope.subNeGranularity={};
                //$scope.neKPIType={};
                $scope.neList=[];
                $scope.subNeList=[];
                $scope.granList=[];
                $scope.subGranList=[];
                var RAW='Raw';
                var CAL='Calculation';
                var TA="Time Aggregation";
                var EA="Entity Aggregation";
                var KPIID=dataExchangeService.getData('kpiid');
                $scope.title =KPIID?"Edit KPI":"Create New KPI";
                $scope.kpiTypeList=[{type:RAW},{type:CAL},{type:TA},{type:EA}];

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

                $scope.srcKPIs=[];

                var getSourceKPIList=function(){
                    console.log('*********getSourceKPIList');
                    function _getSourceKPI(neType,neGranularity,neKPIType,subNeType,subNeGranularity,callback){
                        //console.log('_getSourceKPI:',neType,neGranularity,neKPIType);
                        if(neKPIType.type==='Raw'){
                            callback(null,[]);
                        }else{
                            var route1='/kpis/source/';
                            var req='neType='+neType.type+'&neGranularity='+neGranularity.id+'&neKPIType='+neKPIType.type;
                            if(neKPIType.type===TA){
                                req=req+'&subNeGranularity='+subNeGranularity.id;
                            }else if(neKPIType.type===EA){
                                req=req+'&subNeType='+subNeType.type;
                            }
                            var p1 = dataAccessService.getRouteDeferred(route1, req, false).promise;
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
                    if($scope.isReadToSearchSourceKPI()){
                        _getSourceKPI($scope.neType,$scope.neGranularity,$scope.neKPIType,$scope.subNeType,$scope.subNeGranularity ,function(err,data){
                            if(!err){
                                if($scope.neKPIType.type===CAL){
                                    _.forEach(data,function(d){
                                        d.gran=$scope.neGranularity.type;
                                        d.ne=$scope.neType.type;
                                    });
                                }else if($scope.neKPIType.type===TA){
                                    _.forEach(data,function(d){
                                        d.gran=$scope.subNeGranularity.type;
                                        d.ne=$scope.neType.type;
                                    });
                                }else if($scope.neKPIType.type===EA){
                                    _.forEach(data,function(d){
                                        d.gran=$scope.neGranularity.type;
                                        d.ne=$scope.subNeType.type;
                                    });
                                }
                                $scope.srcKPIs=data;
                            }else{
                                $scope.srcKPIs=[];
                            }
                        });
                    }
                };
                $scope.update=function(){
                    updateSubOptions(function(ret){
                        if(ret){
                            getSourceKPIList();
                        }
                    });
                };
                function updateSubOptions(callback){
                    console.log('*********updateSubOptions');
                    //console.log('update:'+$scope.neKPIType.type);
                    if(!$scope.neKPIType) {
                         callback(false);
                    }else{
                        if($scope.neKPIType.type===TA){
                            $scope.subGranList= _.sortBy(_.filter($scope.granList,function(l){
                                return l.num< $scope.neGranularity.num;
                            }),'num');
                            if(!$scope.subNeGranularity||$scope.subNeGranularity.num>=$scope.neGranularity.num){
                                $scope.subNeGranularity=$scope.subGranList[0];
                            }
                            callback(true);
                        }else if($scope.neKPIType.type===EA){
                            if($scope.neType){
                                var route1='/kpis/templates/'+$scope.neType.type+'/sub';
                                var p1 = dataAccessService.getRouteDeferred(route1, '', false).promise;
                                p1.then(
                                    function(response) {
                                        $scope.subNeList=response.data;
                                        if($scope.subNeList&&!$scope.subNeType||!_.find($scope.subNeList,{type:$scope.subNeType.type})){
                                            $scope.subNeType=$scope.subNeList[0];
                                        }
                                        callback(true);
                                    },
                                    function(error) {
                                        messageNotifierService.error(JSON.stringify(error));
                                        logger.error('Cant get data', route1, error);
                                        $scope.subNEList=[];
                                        $scope.subNeType=undefined;
                                        callback(true);
                                    }
                                );
                            }


                        }else{
                            callback(true);
                        }
                    }


                }

                /*$scope.getType=function(t){
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
                };*/
                $scope.isReadToSearchSourceKPI=function(){
                    console.log('*********isReadToSearchSourceKPI');
                    if(!$scope.neKPIType){
                        return false;
                    }
                    switch($scope.neKPIType.type){
                        case RAW:
                        case CAL:
                            return $scope.neType&&$scope.neGranularity&&$scope.neKPIType;
                        case TA:
                            return $scope.neType&&$scope.neGranularity&&$scope.neKPIType&&$scope.subNeGranularity;
                        case EA:
                            return $scope.neType&&$scope.neGranularity&&$scope.neKPIType&&$scope.subNeType;

                    }

                };
                $scope.createNewKPI=function(){
                    var route1='/kpis/create';
                    var p1 = dataAccessService.postRouteDeferred(route1, '', {
                        kpi_name:$scope.kpiName,
                        kpi_desc:$scope.kpiDesc,
                        kpi_forumla:$scope.kpiFormula,
                        kpi_unit:$scope.kpiUnit,
                        ne_type:$scope.neType.type,
                        granularity:$scope.neGranularity.id,
                        kpi_type: _.indexOf($scope.kpiTypeList,$scope.neKPIType)

                    },false).promise;
                    p1.then(
                        function(response) {
                            logger.info('createNewKPI succ', response.data);
                        },
                        function(error) {
                            messageNotifierService.error(JSON.stringify(error));
                            logger.error('Cant get data', route1, error);
                        }
                    );
                };
                $scope.$on('webgui.widgetRefresh', function() {
                    //logger.debug($scope.widget.uniqueId, 'event webgui.widgetRefresh');
                    refresh();
                });
                refresh();
            }

        ]);

        return mpmKPINewControllers;
    });
