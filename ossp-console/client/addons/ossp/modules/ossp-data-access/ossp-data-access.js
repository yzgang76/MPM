define([
		'angular',
		'addons/ossp/modules/ossp-data-access/ossp-data-access-services'
	],
	function(angular) {
		'use strict';
		var osspDataAccess = angular.module('osspDataAccess', ['osspDataAccessServices']);
		return osspDataAccess;
	});