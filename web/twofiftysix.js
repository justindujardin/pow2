"use strict";
/*globals angular,window*/

window.twoFiftySix = {
   controllers: {},
   directives: {}
};
twoFiftySix.app = angular.module('twoFiftySix', []);


twoFiftySix.app.directive('eightBitPanel', function($compile) {
   return {
      restrict: 'A',
      transclude:true,
      template: '<div class="tl"></div><div class="tr"></div><div class="bl"></div><div class="br"></div><div class="content"  ng-transclude></div>',
      link: function (scope, element, attrs) {
         element.addClass('ebp');
         var compiled = $compile('')(scope);
         element.append(compiled);
      }
   };
});

//

twoFiftySix.app.factory('game', function($q,$rootScope){
   return {
      files:[
         "/images/animation.png",
         "/images/characters.png",
         "/images/creatures.png",
         "/images/environment.png",
         "/images/equipment.png",
         "/images/items.png",
         "/images/ui.png"
      ],
      loader: new eburp.ResourceLoader(),
      load : function(){
         var deferred = $q.defer();
         var self = this;
         this.loader.loadAll(this.files,function(){
            self.scene = new eburp.Scene({autoStart: true});
            self.tileMap = new eburp.TileMap("town");
            self.sprite = new eburp.MovableTileObject({
               point: self.tileMap.bounds.getCenter()
            });
            self.scene.addObject(self.sprite);
            self.scene.addObject(self.tileMap);

            deferred.resolve();
            if (!$rootScope.$$phase) {
               $rootScope.$apply();
            }
         });
         return deferred.promise;
      }
   }
});

twoFiftySix.app.controller('twoFiftySixApp',function($scope,$rootScope,$http,game){
   $scope.error = null;
   $scope.notify = function(){};
   $scope.hasImage = false;
   $scope.shareImage = function(){
      $http.post('/share', {data:game.imageData}).success(function(data){
         $scope.sharedUrl = data.url;
         $scope.clearImageData();
      });
   };
   $scope.clearImageData = function() {
      $scope.hasImage = false;
      game.imageData = null;
      localStorage.removeItem("sharedImage")
   };
   $scope.setImageData = function(data){
      if(!data){
         return $scope.clearImageData();
      }
      localStorage.setItem("sharedImage",data);
      game.imageData = data;
      $scope.hasImage = true;
   };
   $scope.getImageData = function(){

      return localStorage.getItem("sharedImage");
   };
   $scope.syncImageData = function(){
      $scope.setImageData($scope.getImageData());
   };
   game.load().then(function(){
      $scope.game = game;
   });
});



