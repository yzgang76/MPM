define([
		'angular',
		'addons/mpm-n/modules/mpm-data-access/mpm-data-access-services'
	],
	function(angular) {
		'use strict';
		var mpmDataAccess = angular.module('mpmDataAccess', ['mpmDataAccessServices']);
		return mpmDataAccess;
	});