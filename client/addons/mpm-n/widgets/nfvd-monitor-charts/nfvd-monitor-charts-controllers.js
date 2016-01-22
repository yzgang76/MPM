define([
        'angular',
        'lodash',
        'addons/mpm-n/bower_components/async/dist/async',
        'commons/events/commons-events',
        'components/data-exchange/data-exchange-services',
        'addons/mpm-n/modules/mpm-data-access/mpm-data-access-services',
        'components/message-notifier/message-notifier-services'
    ],
    function (angular, _, async) {
        'use strict';
        var nfvdMonitorChartsControllers = angular.module('nfvdMonitorChartsControllers', ['commonsEvents', 'dataExchangeServices', 'mpmDataAccessServices', 'messageNotifierServices']);

        nfvdMonitorChartsControllers.controller('nfvdMonitorChartsController', [
            '$rootScope',
            '$scope',
            '$log',
            '$location',
            'dataExchangeService',
            'mpmDataAccessService',
            'messageNotifierService',
            function ($rootScope, $scope, $log, $location, dataExchangeService, dataAccessService, messageNotifierService) {
                var logger = $log.getInstance('nfvdMonitorChartsController');
                logger.debug('in nfvdMonitorChartsController');
                var vm = $scope.vm = {};
                vm.dims = [];
                vm.facts = [];
                vm.configuration = {
                    chart: {
                        zoomType: 'xy'
                    },
                    title: {
                        text: 'NFVD GUI Server Request Monitor'
                    },
                    subtitle: {
                        text: 'for all users'
                    },
                    xAxis: [{
                        categories: [
                           /* "2015-12-09",
                            "2015-12-11",
                            "2015-12-14",
                            "2015-12-15",
                            "2015-12-16",
                            "2015-12-21",
                            "2015-12-22",
                            "2015-12-23",
                            "2015-12-24",
                            "2015-12-25",
                            "2015-12-29",
                            "2015-12-30",
                            "2016-01-04",
                            "2016-01-05",
                            "2016-01-06",
                            "2016-01-07",
                            "2016-01-08",
                            "2016-01-09",
                            "2016-01-10",
                            "2016-01-11",
                            "2016-01-12",
                            "2016-01-13",
                            "2016-01-14",
                            "2016-01-15",
                            "2016-01-16",
                            "2016-01-18"*/],
                        crosshair: true
                    }],
                    yAxis: [{ // Primary yAxis
                        labels: {
                            format: '{value} s',
                            style: {
                                color: 'green'
                            }
                        },
                        title: {
                            text: 'max cost',
                            style: {
                                color: 'green'
                            }
                        },
                        opposite: true

                    },
                        { // Secondary yAxis
                            gridLineWidth: 0,
                            title: {
                                text: 'number of request',
                                style: {
                                    color: 'blue'
                                }
                            },
                            labels: {
                                format: '{value}',
                                style: {
                                    color: 'blue'
                                }
                            }

                        },
                        { // Tertiary yAxis
                            gridLineWidth: 0,
                            title: {
                                text: 'average cost',
                                style: {
                                    color: 'black'
                                }
                            },
                            labels: {
                                format: '{value} s',
                                style: {
                                    color: 'black'
                                }
                            },
                            opposite: true
                        }],
                    tooltip: {
                        shared: true
                    },
                    legend: {
                        layout: 'vertical',
                        align: 'left',
                        x: 80,
                        verticalAlign: 'top',
                        y: 55,
                        floating: false,
                        backgroundColor: '#FFFFFF'
                    },
                    series: [/*{
                        name: 'num_of_reqeust',
                        type: 'column',
                        yAxis: 1,
                        data: [458,
                            179,
                            100,
                            155,
                            264,
                            271,
                            735,
                            16,
                            330,
                            84,
                            0,
                            383,
                            235,
                            35,
                            0,
                            1,
                            774,
                            0,
                            0,
                            356,
                            142,
                            840,
                            558,
                            156,
                            0,
                            1903],
                        tooltip: {
                            valueSuffix: ''
                        }

                    }, {
                        name: 'avg_cost',
                        type: 'spline',
                        yAxis: 2,
                        data: [4.678061044104854,
                            10.070248610614591,
                            5.772628935000025,
                            8.009296903871109,
                            9.069914591666667,
                            2.740669797416997,
                            2.842066158231591,
                            3.030605999999864,
                            3.332501879090999,
                            4.400938282142844,
                            null,
                            7.871025534986933,
                            3.470150711914949,
                            3.5422571428569167,
                            null,
                            0.8850000000002183,
                            2.251342388501262,
                            null,
                            null,
                            1.8840952019663106,
                            1.420437852112608,
                            1.3304739476189757,
                            1.8938289372760397,
                            1.3938843596154318,
                            null,
                            1.007405996899603],
                        marker: {
                            enabled: false
                        },
                        dashStyle: 'shortdot',
                        tooltip: {
                            valueSuffix: ' s'
                        }
                    }, {
                        name: 'max_cost',
                        type: 'spline',
                        data: [40.711999999999534,
                            179.52300000000105,
                            22.65626539999994,
                            30.709999999999127,
                            110.33703259999675,
                            17.609760799998185,
                            11.254125300009036,
                            14.405880599999364,
                            25.26800000000003,
                            25.58011499999975,
                            null,
                            137.00300000000425,
                            22.76327609999953,
                            23.24199999999837,
                            null,
                            0.8850000000002183,
                            16.31863169999997,
                            null,
                            null,
                            8.829882899999575,
                            7.040000000000873,
                            10.738073699999404,
                            11.909381399997073,
                            8.730999999999767,
                            null,
                            18.98199999999997],
                        tooltip: {
                            valueSuffix: ' s'
                        }
                    }*/]
                };
                refresh();
                function refresh(){
                    var route1='/kpis/values/nfvdgui';
                    var p1 = dataAccessService.getRouteDeferred(route1, '', false).promise;
                    p1.then(
                        function(response) {
                            $scope.data=response.data;
                            console.log('ddddddddddddd', $scope.data);
                            vm.configuration.xAxis[0].categories=$scope.data.categories;
                            $scope.data.series[0].type='column';
                            $scope.data.series[0].yAxis= 1;
                            $scope.data.series[0].tooltip= {valueSuffix: '' };


                            $scope.data.series[1].type='spline';
                            $scope.data.series[1].yAxis= 2;
                            $scope.data.series[1].tooltip= {valueSuffix: ' s' };
                            $scope.data.series[1].marker= {enabled: false};
                            $scope.data.series[1].dashStyle='shortdot';

                            $scope.data.series[2].type='spline';
                            //$scope.data.series[2].yAxis= 3;
                            $scope.data.series[2].tooltip= {valueSuffix: ' s' };
                            //$scope.data.series[2].marker= {enabled: false};
                            //$scope.data.series[2].dashStyle='shortdot';


                            vm.configuration.series=$scope.data.series;


                            vm.configuration.series=$scope.data.series;

                        },
                        function(error) {
                            messageNotifierService.error(JSON.stringify(error));
                            logger.error('Cant get data', route1, error);
                        }
                    );
                }
            }
        ]);

        return nfvdMonitorChartsControllers;
    });
