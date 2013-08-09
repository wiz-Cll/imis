'use strict';



angular.module('imis',[]).
	config([ '$routeProvider', function($routeProvider){
		$routeProvider.
		when('/login', { templateUrl: 'partial/login.html', controller: LoginCtrl}).
		when('/memo', {templateUrl: 'partial/memo.html', controller: MemoCtrl}).
		when('/').
		when('/404', { templateUrl: 'partial/404.html'} ).
		otherwise({ redirectTo: '/404'});
	}]);

