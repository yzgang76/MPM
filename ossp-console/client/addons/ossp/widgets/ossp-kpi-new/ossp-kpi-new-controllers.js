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
        var osspKPINewControllers = angular.module('osspKPINewControllers', [ 'commonsEvents','dataExchangeServices','osspDataAccessServices','messageNotifierServices']);
        osspKPINewControllers.controller('osspKPINewController', [
            '$rootScope',
            '$scope',
            '$log',
            '$location',
            'dataExchangeService',
            'osspDataAccessService',
            'messageNotifierService',
            function($rootScope, $scope, $log, $location,dataExchangeService,dataAccessService,messageNotifierService) {
                var logger = $log.getInstance('osspKPINewControllers');

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
                    function _getDomains(callback){
                        var route1='/kpis/domains';
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
                    //function _getTemplates(callback){
                    //    var route1='/kpis/templates';
                    //    var p1 = dataAccessService.getRouteDeferred(route1, '', false).promise;
                    //    p1.then(
                    //        function(response) {
                    //            callback(null,response.data);
                    //        },
                    //        function(error) {
                    //            messageNotifierService.error(JSON.stringify(error));
                    //            logger.error('Cant get data', route1, error);
                    //            callback(error,null);
                    //        }
                    //    );
                    //}
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
                    async.parallel({
                        domainList:async.apply(_getDomains),
                        //neList:async.apply(_getTemplates),
                        granList:async.apply(_getGranularity)

                    },function(err,result){
                        if(err){
                            messageNotifierService.error(JSON.stringify(err));
                        }else{
                            $scope.domainList=result.domainList;
                            //$scope.neList=result.neList;
                            $scope.granList=result.granList;
                        }
                    });
                    //if(KPIID){  //edit KPI Definition
                        //$scope.neType=dataExchangeService.getData('netype');
                        //$scope.neGranularity=dataExchangeService.getData('gran');
                        //$scope.neKPIType=dataExchangeService.getData('kpitype');
                    //}



                }

                $scope.srcKPIs=[];

                var getSourceKPIList=function(){
                    console.log('*********getSourceKPIList');
                    function _getSourceKPI(domain,neType,neGranularity,neKPIType,subNeType,subNeGranularity,callback){
                        //console.log('_getSourceKPI:',neType,neGranularity,neKPIType);
                        if(neKPIType.type==='Raw'){
                            callback(null,[]);
                        }else{
                            var route1='/kpis/source/';
                            var req='neType='+neType.id+'&neGranularity='+neGranularity.id+'&neKPIType='+neKPIType.type+'&domain='+domain;
                            if(neKPIType.type===TA){
                                req=req+'&subNeGranularity='+subNeGranularity.id;
                            }else if(neKPIType.type===EA){
                                req=req+'&subNeType='+subNeType.id;
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
                        _getSourceKPI($scope.domain.name,$scope.neType,$scope.neGranularity,$scope.neKPIType,$scope.subNeType,$scope.subNeGranularity ,function(err,data){
                            if(!err){
                                if($scope.neKPIType.type===CAL){
                                    _.forEach(data,function(d){
                                        d.gran=$scope.neGranularity.type;
                                        d.ne=$scope.neType.id;
                                    });
                                }else if($scope.neKPIType.type===TA){
                                    _.forEach(data,function(d){
                                        d.gran=$scope.subNeGranularity.type;
                                        d.ne=$scope.neType.id;
                                    });
                                }else if($scope.neKPIType.type===EA){
                                    _.forEach(data,function(d){
                                        d.gran=$scope.neGranularity.type;
                                        d.ne=$scope.subNeType.id;
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
                $scope.onDomainSelected=function(){
                    function _getTemplates(callback){
                        //console.log('tttttttttttttttttttttttttt',$scope.domain);
                        var route1='/kpis/templates/'+$scope.domain.name+'/domain';
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
                    if($scope.domain){
                        _getTemplates(function(err,result){
                            $scope.neList=result;
                        });
                    }else{
                        $scope.neList=[];
                    }
                };
                function updateSubOptions(callback){
                    console.log('*********updateSubOptions',$scope.neKPIType);
                    if(!$scope.neKPIType) {
                        callback(false);
                    }else {
                        if ($scope.neKPIType.type === TA) {
                            $scope.subGranList = _.sortBy(_.filter($scope.granList, function (l) {
                                return l.seconds < $scope.neGranularity.seconds;
                            }), 'num');
                            if (!$scope.subNeGranularity || $scope.subNeGranularity.seconds >= $scope.neGranularity.seconds) {
                                $scope.subNeGranularity = $scope.subGranList[0];
                            }
                            callback(true);
                        } else if ($scope.neKPIType.type === EA) {
                            if ($scope.neType) {
                                var route1 = '/kpis/templates/' + $scope.domain.name+'/'+$scope.neType.id + '/sub';
                                var p1 = dataAccessService.getRouteDeferred(route1, '', false).promise;
                                p1.then(
                                    function (response) {
                                        $scope.subNeList = response.data;
                                        if ($scope.subNeList && !$scope.subNeType || !_.find($scope.subNeList, {type: $scope.subNeType.id})) {
                                            $scope.subNeType = $scope.subNeList[0];
                                        }
                                        callback(true);
                                    },
                                    function (error) {
                                        messageNotifierService.error(JSON.stringify(error));
                                        logger.error('Cant get data', route1, error);
                                        $scope.subNEList = [];
                                        $scope.subNeType = undefined;
                                        callback(true);
                                    }
                                );
                            }
                        }else{
                            callback(true);
                        }
                    }
                }
                $scope.isReadToSearchSourceKPI=function(){
                    //console.log('*********isReadToSearchSourceKPI');
                    if(!$scope.neKPIType){
                        return false;
                    }
                    switch($scope.neKPIType.type){
                        case RAW:
                        case CAL:
                            return $scope.domain&&$scope.neType&&$scope.neGranularity&&$scope.neKPIType;
                        case TA:
                            return $scope.domain&&$scope.neType&&$scope.neGranularity&&$scope.neKPIType&&$scope.subNeGranularity;
                        case EA:
                            return $scope.domain&&$scope.neType&&$scope.neGranularity&&$scope.neKPIType&&$scope.subNeType;

                    }

                };
                $scope.createNewKPI=function(){
                    var route1='/kpis/create';
                    var p1 = dataAccessService.postRouteDeferred(route1, '', {
                        domain:$scope.domain.name,
                        kpi_name:$scope.kpiName,
                        kpi_desc:$scope.kpiDesc,
                        kpi_formula:$scope.kpiFormula,
                        kpi_unit:$scope.kpiUnit,
                        ne_type:$scope.neType.id,
                        granularity:$scope.neGranularity.seconds,
                        kpi_type: _.indexOf($scope.kpiTypeList,$scope.neKPIType)

                    },false).promise;
                    p1.then(
                        function(response) {
                            logger.info('createNewKPI succ', response.data);
                            $scope.back();
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
                $scope.back=function(){
                    var url = '/workspaces/'+_.get($scope,'context.workspace._id') + '/views/osspKPIManager';
                    $location.url(url);
                };
                refresh();
            }

        ]);

        return osspKPINewControllers;
    });
