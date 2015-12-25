define(
    ['angular',
        'lodash',
        'angularBootstrap',
        'components/data-access/format-url-lib',
        'components/data-exchange/data-exchange-services',
        'components/datetime-range/datetime-range-services'
    ],
    function(angular, _, U) {
        'use strict';

        var mpmDataAccessServices = angular.module('mpmDataAccessServices', ['ui.bootstrap', 'dataExchangeServices', 'datetimeRangeServices']);

        // Data is accessed by querying server-side using a standardized REST API
        // The URI to invoke is built from a combination of information:
        // + a "widget" object, for facts, dimensions and dimension filters
        //   and any other needed selection information
        // + a dataExchange service where to retrieve the reserved information
        //   through specific ids given in the widget's "inputs" fields

        mpmDataAccessServices.service(
            'mpmDataAccessService', ['$http',
                '$q',
                '$log',
                'dataExchangeService',
                'datetimeRangeService',
                '$modal',
                '$location', 
                '$timeout',
                function($http, $q, $log, dataExchangeService, datetimeRangeService, $modal, $location, $timeout) {

                    var logger = $log.getInstance('mpmDataAccessService');
                    var CONST = Object.freeze({
                        DOMAIN: 'mpm-n',
                        PACKAGE: 'mpm'
                    });

                    this.getCatalogDataDeferred = function(filters, cache, delay) {
                        return this.getDataDeferred('catalog', undefined, filters, cache, delay);
                    };
                    this.getCatalogItemDeferred = function(id, cache, delay) {
                        return this.getDataDeferred('catalog', id, undefined, cache, delay);
                    };
                    this.getInstanceDataDeferred = function(filters, cache, delay) {
                        return this.getDataDeferred('instance', undefined, filters, cache, delay);
                    };
                    this.getInstanceItemDeferred = function(id, cache, delay) {
                        return this.getDataDeferred('instance', id, undefined, cache, delay);
                    };

                    // For mpm private routes
                    this.getRouteDeferred = function(route, query, cache, delay) {

                        function buildUrl(route, query) {

                            var uri = '';
                            uri += '/V1.0';
                            uri += '/domains/' + CONST.DOMAIN;
                            uri += route;
                            if (query) {
                                uri += '?' + query;
                            }

                            logger.info('MPM dataAccessService: url=', uri);
                            return uri;
                        }

                        return getDeferred(buildUrl(route, query), cache, delay);
                    };

                    this.getRouteDeferredWithFullUrl = function(route, query, cache, delay) {

                        function buildUrl(route, query) {

                            var uri = '';
                            //uri += '/V1.0';
                            //uri += '/domains/' + CONST.DOMAIN;
                            uri += route;
                            if (query) {
                                uri += '?' + query;
                            }

                            logger.info('NFV dataAccessService: url=', uri);
                            return uri;
                        }

                        return getDeferred(buildUrl(route, query), cache, delay);
                    };

                    function getDeferred(url, cache, delay) {

                        var deferred = $q.defer();

                        var timeout = delay || 180000;
                        var useCache = cache === undefined ? true : cache;


                        if (url) {
                            logger.info('Getting data from URL', url, new Date());
                            deferred.promise = $http.get(url, {
                                timeout: deferred.promise,
                                cache: useCache
                            });

                            if (timeout !== 0) {
                                $timeout(function() {
                                    deferred.resolve('Abort request on timeout ' + timeout);
                                }, timeout);
                            }
                        } else {
                            var message = 'Invalid URL: ' + url;
                            deferred.reject(message);
                        }

                        // handle an expired athorization token
                        var p1 = deferred.promise;
                        p1.then(function() {},
                            function(error) {
                                // Testing the case of a token expiration to force a logout
                                console.log('getDeferred error, but will continue', error);
                                var internalerror = error.data;
                                if (internalerror && internalerror.statusCode === 403 && internalerror.error === 'Token expired') {
                                    var modalInstance = $modal.open({
                                        templateUrl: 'addons/mpm-n/modules/mpm-data-access/session-expiration-modal-window.html',
                                        // windowClass: 'view-designer-code-editor-modal-window',
                                        controller: ['$scope', '$modalInstance', function($scope, $modalInstance) {

                                            $scope.apply = function() {
                                                $modalInstance.close();
                                            };
                                            $scope.cancel = function() {
                                                // $modalInstance.dismiss();
                                                $modalInstance.close();
                                            };
                                        }],
                                        size: 'lg',
                                        backdrop: 'static' // Disable dismiss on click on the overlay around the modal window
                                    });

                                    // Handle result
                                    modalInstance.result.then(function() {
                                        console.log('GO TO LOGOUT');
                                        $location.url('/logout');
                                    });
                                }
                                return null;
                            });


                        return deferred;
                    }

                    // Service for OSSA like routes
                    this.getDataDeferred = function(type, id, filters, cache, delay) {

                        function buildUrl(type, id, filters) {

                            // Internal funtion to build query parameters
                            function addQueryParam(query, name, param) {
                                if (param !== undefined && param !== null) {
                                    query.push({
                                        name: name,
                                        value: param
                                    });
                                }
                            }

                            // String URI to be built and return
                            var uri = '';

                            // Mandatory URI parts
                            uri += '/V1.0';
                            uri += '/domains/' + CONST.DOMAIN;
                            uri += '/packages/' + CONST.PACKAGE;
                            uri += '/types/' + type + '/objects';

                            if (id) {
                                uri += '/' + id;
                            } else {

                                // Query part

                                var query = [];

                                // if (filters) {
                                //     for (var i =0; i< filters.length; i++)
                                //     {
                                //     addQueryParam(query, filters[i].dimensionId, filters[i].eq[0]);

                                //     }
                                // }
                                // Dimension filters
                                if (filters && filters.filters && filters.filters[0] && filters.filters[0].dimensionFilters && filters.filters[0].dimensionFilters.length) {
                                    filters.filters[0].dimensionFilters.forEach(function(dimFilter) {
                                        U.getFilterQueryParams(dimFilter).forEach(function(filterQueryParam) {
                                            addQueryParam(query, 'where', filterQueryParam);
                                        });
                                    });
                                } else {
                                    logger.info('dataAccessService buildUrl:filters', filters);
                                }

                                // Build query string
                                var queryString = '';
                                if (query.length > 0) {
                                    queryString += '?' + _.map(query, function(e) {
                                        return e.name + '=' + e.value;
                                    }).join('&');
                                }

                                uri += queryString;
                            }

                            logger.info('dataAccessService: url=', uri);

                            // Return the URI or validation errors
                            return uri;
                        }

                        return getDeferred(buildUrl(type, id, filters), cache, delay);

                    };

                    function putDeferred(url, data, cache, delay) {

                        var deferred = $q.defer();

                        var timeout = delay || 180000;
                        var useCache = cache === undefined ? true : cache;


                        if (url) {
                            logger.info('Getting data from URL', url, new Date());
                            deferred.promise = $http.put(url, data, {
                                timeout: deferred.promise,
                                cache: useCache
                            });

                            if (timeout !== 0) {
                                $timeout(function() {
                                    deferred.resolve('Abort request on timeout ' + timeout);
                                }, timeout);
                            }
                        } else {
                            var message = 'Invalid URL: ' + url;
                            deferred.reject(message);
                        }

                        return deferred;
                    }


                    this.putRouteDeferred = function(route, query, data, cache, delay) {

                        function buildUrl(route, query) {

                            var uri = '';
                            uri += '/V1.0';
                            uri += '/domains/' + CONST.DOMAIN;
                            uri += route;
                            if (query) {
                                uri += '?' + query;
                            }

                            logger.info('NFV dataAccessService: url=', uri);
                            return uri;
                        }

                        return putDeferred(buildUrl(route, query), data, cache, delay);
                    };

                    function postDeferred(url, data, cache, delay) {

                        var deferred = $q.defer();

                        var timeout = delay || 180000;
                        var useCache = cache === undefined ? true : cache;


                        if (url) {
                            logger.info('Getting data from URL', url, new Date());
                            deferred.promise = $http.post(url, data, {
                                timeout: deferred.promise,
                                cache: useCache
                            });

                            if (timeout !== 0) {
                                $timeout(function() {
                                    deferred.resolve('Abort request on timeout ' + timeout);
                                }, timeout);
                            }
                        } else {
                            var message = 'Invalid URL: ' + url;
                            deferred.reject(message);
                        }

                        return deferred;
                    }

                    this.postRouteDeferred = function(route, query, data, cache, delay) {

                        function buildUrl(route, query) {

                            var uri = '';
                            uri += '/V1.0';
                            uri += '/domains/' + CONST.DOMAIN;
                            uri += route;
                            if (query) {
                                uri += '?' + query;
                            }

                            logger.info('NFV dataAccessService: url=', uri);
                            return uri;
                        }

                        //console.log('post body=',data);
                        return postDeferred(buildUrl(route, query), data, cache, delay);
                    };

                    function deleteDeferred(url, cache, delay) {

                        var deferred = $q.defer();

                        var timeout = delay || 180000;
                        var useCache = cache === undefined ? true : cache;


                        if (url) {
                            logger.info('deleting data from URL', url, new Date());
                            deferred.promise = $http.delete(url, {
                                timeout: deferred.promise,
                                cache: useCache
                            });

                            if (timeout !== 0) {
                                $timeout(function() {
                                    deferred.resolve('Abort request on timeout ' + timeout);
                                }, timeout);
                            }
                        } else {
                            var message = 'Invalid URL: ' + url;
                            deferred.reject(message);
                        }
                        return deferred.promise;
                    }

                    this.deleteRouteDeferred = function(route, query, cache, delay) {

                        function buildUrl(route, query) {

                            var uri = '';
                            uri += '/V1.0';
                            uri += '/domains/' + CONST.DOMAIN;
                            uri += route;
                            if (query) {
                                uri += '?' + query;
                            }

                            logger.info('NFV dataAccessService: url=', uri);
                            return uri;
                        }

                        return deleteDeferred(buildUrl(route, query), cache, delay);
                    };

                    function patchDeferred(url, data, cache, delay) {

                        var deferred = $q.defer();

                        var timeout = delay || 180000;
                        var useCache = cache === undefined ? true : cache;


                        if (url) {
                            logger.info('Getting data from URL', url, new Date());
                            deferred.promise = $http.patch(url, data, {
                                timeout: deferred.promise,
                                cache: useCache
                            });

                            if (timeout !== 0) {
                                $timeout(function() {
                                    deferred.resolve('Abort request on timeout ' + timeout);
                                }, timeout);
                            }
                        } else {
                            var message = 'Invalid URL: ' + url;
                            deferred.reject(message);
                        }

                        return deferred;
                    }

                    this.patchRouteDeferred = function(route, query, data, cache, delay) {

                        function buildUrl(route, query) {

                            var uri = '';
                            uri += '/V1.0';
                            uri += '/domains/' + CONST.DOMAIN;
                            uri += route;
                            if (query) {
                                uri += '?' + query;
                            }

                            logger.info('NFV dataAccessService: url=', uri);
                            return uri;
                        }

                        return patchDeferred(buildUrl(route, query), data, cache, delay);
                    };

                }
            ]);

        return mpmDataAccessServices;
    });
