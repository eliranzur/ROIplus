'use strict';

/* Controllers */

var advertiserDataApp = angular.module('advertiserDataApp', []);
var url = 'http://ec2-54-191-38-173.us-west-2.compute.amazonaws.com:3000/profiles/22A0';
advertiserDataApp.controller('advertiserDataCtrl', function($scope, $http) {
  //$http.jsonp(url).success(function(data) {
  $http.get(url).success(function(data) {
    $scope.advertiserData = data;
  }).
  error(function(data, status, headers, config) {
    alert ("data:" +data + " status:" + status +" headears:" + headers + " config:" + config);
  });
  

  /*$scope.orderProp = 'age';*/
});
