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
      maps: _.keys(eburp.getMaps()),
      state:'Uninitialized',
      listeners:[],
      currentMap: 23,
      loader: new eburp.ResourceLoader(),
      load : function(){
         var deferred = $q.defer();
         var self = this;
         this.listeners.push(deferred);
         function done(){
            _.defer(function(){
               var listeners = self.listeners;
               self.listeners = [];
               $rootScope.$apply(function(){
                  angular.forEach(listeners,function(l){
                     l.resolve();
                  });
               });
            });
         }
         if(this.state === 'Loaded'){
            done();
            return deferred.promise;
         }
         else if(this.state === 'Loading'){
            return deferred.promise;
         }
         this.state = 'Loading';
         self.scene = new eburp.Scene({
            autoStart: true,
            debugRender:true
         });
         self.input = self.scene.input = new eburp.Input();
         self.tileMap = new eburp.TileMap(self.maps[self.currentMap]);
         self.sprite = new eburp.MovableTileObject({
            point: self.tileMap.bounds.getCenter()
         });
         self.scene.addObject(self.sprite);
         self.scene.addObject(self.tileMap);
         this.loader.loadAll(this.files,function(){
            self.state = 'Loaded';
            return done();
         });
         return deferred.promise;
      },
      getCurrentMapName: function(){
         if(!this.tileMap || !this.tileMap.map){
            return null;
         }
         return this.tileMap.map.name;
      },
      /**
       * Guess a good starting point for a player in a new map.
       *
       * Try to get a transition feature (door or exit), then
       * fall back to the map center.
       */
      setMapSpawn: function(mapName) {
         this.tileMap.setMap(mapName);
         var map = this.tileMap.map;
         var point = new eburp.Point(0,0);
         if(map){
            point = this.tileMap.bounds.getCenter();
            if(map.features){
               // Pick the first transition feature we find.
               var feature = _.where(this.tileMap.map.features,{type : "transition"})[0];
               if(feature){
                  point = new eburp.Point(feature.x,feature.y);
               }
            }
         }
         this.sprite.point = point;
         //self.tileMap.bounds.getCenter()
      },
      nextMap: function(){
         var curr = this.currentMap;
         var next = curr + 1;
         if(next >= this.maps.length){
            next = 0;
         }
         this.currentMap = next;
         this.setMapSpawn(this.maps[next]);
      },
      previousMap : function(){
         var curr = this.currentMap;
         var next = curr - 1;
         if(next < 0){
            next = this.maps.length - 1;
         }
         this.currentMap = next;
         this.setMapSpawn(this.maps[next]);
      }

   }
});

twoFiftySix.app.controller('twoFiftySixApp',function($scope,$rootScope,$http,game,sourceSprites){
   $scope.hasImage = false;
   $scope.sprites = [];
   $scope.spriteCategories = {};
   $scope.spriteCatalog = false;
   if(window._user){
      mixpanel.identify(window._user.id);
      mixpanel.people.set({
         "Last name": window._user.first,
         "First name": window._user.last,
         "Gender": window._user.gender,
         "$email": window._user.email
      });
   }
   mixpanel.track("Art: PageView",{
      LoggedIn:(typeof window._user !== 'undefined')
   });

   $scope.showSpriteCatalog = function() {
      mixpanel.track("Art: SpriteCatalog");
      $scope.spriteCatalog = true;
      if($scope.spriteCategories.length > 0){
         return;
      }
      setTimeout(function() {
         $scope.$apply(function() {
            var cats = sourceSprites.getCategories();
            _.each(cats,function(cat){
               sourceSprites.getSprites(cat,2).then(function(sources){
                  $scope.spriteCategories[cat] = sources;
               });
            });
         });
      }, 100);
   };
   $scope.hideSpriteCatalog = function(){
     $scope.spriteCatalog = false;
   };
   $scope.shareImage = function(){
      mixpanel.track("Art: Share");
      $http.post('/share', {data:game.imageData}).success(function(data){
         $scope.sharedUrl = data.url;
         $scope.clearImageData();
      });
   };
   $scope.clearImageData = function() {
      $scope.hasImage = false;
      game.imageData = null;
      localStorage.removeItem("sharedImage");
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

   $scope.login = function() {
      mixpanel.track("Art: Login");
     window.location.href = "/auth/facebook";
   };
   $scope.logout = function() {
      mixpanel.track("Art: Logout");
     window.location.href = "/auth/logout";
   };

   $scope.nextMap = function(){
      game.nextMap();
      $scope.mapName = game.getCurrentMapName();
   };
   $scope.previousMap = function(){
      game.previousMap();
      $scope.mapName = game.getCurrentMapName();
   };
   game.load().then(function(){
      $scope.mapName = game.getCurrentMapName();
   });

});



