'use strict'

function MemoCtrl($scope, $http){
	// $http.get('asset/script/stus.json').success(function(data){
		var cookieArr = document.cookie.split('; ');
		var cookie = {};

		for(var i=0; i< cookieArr.length; i++){
			var tempArr = cookieArr[i].split('=');
			cookie[tempArr[0]] = tempArr[1];
		}


	// $http.get('/app/stu?token='+ cookie.token ).success(function(data){
	// 	$scope.stus = data;
	// });

	$http({
		method: 'get',
		url: '/app/stu?token=' + cookie.token,
		header: {
			cookie: document.cookie
		},
	}).success( function( data ){
		$scope.stus = data;
	}).error(function(){
		alert('ajax req err!');
	})
}

MemoCtrl.$inject = ['$scope', '$http'];