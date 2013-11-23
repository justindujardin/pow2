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
         this.loader.loadAll(this.files,function(){
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
   $scope.shareImage = function(){
      $http.post('/share', {data:game.imageData}).success(function(data){
         $scope.sharedUrl = data.url;
         $scope.notify("Your image has been updated.");
      });
   };
   game.load().then(function(){
      $scope.game = game;
   });
});



twoFiftySix.app.directive('twoFiftySix', function($compile,game) {
   return {
      restrict: 'A',
      link: function (scope, element, attrs) {
         var renderCanvas = $compile('<canvas style="position:absolute;left:-9000px;top:-9000px;" width="256" height="256"></canvas>')(scope);
         var context = renderCanvas[0].getContext("2d");
         context.webkitImageSmoothingEnabled = false;
         context.mozImageSmoothingEnabled = false;

         element.append(renderCanvas);


         var loader = game.loader;
         game.load().then(function(){
            var image = $(".user-sprite img")[0];
            var tileView = new eburp.TileMapView(element[0],loader);
            tileView.imageProcessor = new eburp.ImageProcessor(renderCanvas[0], tileView);
            tileView.tileMap = new eburp.TileMap("town");
            var scene = new eburp.Scene({autoStart: true});
            scene.addView(tileView);

            // Rig the view, and toss a party sprite in there.
            tileView.camera.point.set(8,4);
            var challengeSpriteFeature = {
               type : "sign",
               x : 12,
               y : 8,
               image : image
            };
            tileView.tileMap.map.features.push(challengeSpriteFeature);
            // HACKS: Draw the party sprite.  TODO: require image-drop directive.

            var canvas = $("canvas.image-drop")[0];
            var context = canvas.getContext("2d");
            if(!image.src){
               var sprite = tileView.imageProcessor.isolateSprite("party.png");
               image.src = sprite.src;
               image.onload = function(){
                  context.clearRect(0,0,96,96);
                  context.drawImage(sprite,0,0,96,96);
               };
            }
            else {
               context.clearRect(0,0,96,96);
               context.drawImage(image,0,0,96,96);
            }
            console.log("READY TO GO!");
         });
      }
   };
});


//


///
twoFiftySix.app.directive('imageDrop', function($compile,$timeout,game) {
   return {
      restrict: 'A',
      controller: function($scope) {
         $scope.toggleOverlay = function(show){
            return $(".drop-overlay")[show ? 'fadeIn' : 'fadeOut'](125);
         };

         $scope.beginDrop = function(message) {
            $scope.overlayText.text(message);
            $scope.toggleOverlay(true);
         };
         $scope.finishDrop = function(message) {
            $scope.overlayText.text(message);
            $timeout(function(){
               $scope.toggleOverlay(false);
            },1500);
         };

         $scope.noopHandler = function(evt) {
            evt.stopPropagation();
            evt.preventDefault();
         };

         $scope.onDrop = function(evt) {
            $scope.noopHandler(evt);
            var files = evt.originalEvent.dataTransfer.files;
            if(typeof files === 'undefined'){
               return $scope.finishDrop("SORRY: You can only drop files here.");
            }
            if(files.length !== 1){
               return $scope.finishDrop("SORRY: You can only drop one file");
            }
            var file = files[0];
            if(!file){
               return $scope.finishDrop("SORRY: That's not a valid file.");
            }
            if(file.type !== 'image/png'){
               return $scope.finishDrop("SORRY: You have to drop a png image.");
            }
            $scope.processDropImage(files[0]);
         };
         $scope.onDragEnter = function(evt) {
            $scope.beginDrop("Drop a 16x16 PNG anywhere.");
         };

         $scope.onDragLeave = function(e) {
            var evt = e.originalEvent;
            /* Create a buffer around the window to catch dragleave at high velocities. */
            if(evt.pageX < 10 || evt.pageY < 10 || $(window).width() - evt.pageX < 10  || $(window).height - evt.pageY < 10) {
               $scope.toggleOverlay(false);
            }
         };

         $scope.processDropImage = function(file){
            var reader = new FileReader();
            reader.onloadend = function(evt){
               var data = evt.target.result;
               var image = new Image();
               image.onload = function(){
                  if(image.naturalWidth !== 16 || image.naturalHeight !== 16){
                     $scope.finishDrop("Image must be 16x16 pixels.");
                     return;
                  }
                  game.imageData = data;
                  var sprite = $(".user-sprite img")[0];
                  sprite.src = null;
                  sprite.src = data;
                  sprite.onload = function(){
                     $scope.context.clearRect(0,0,96,96);
                     $scope.context.drawImage(sprite,0,0,96,96);
                     $scope.finishDrop("Got it!");
                  }
               };
               image.src = data;
            };

            // Handle errors that might occur while reading the file (before upload).
            reader.onerror = function(evt) {
               var message;
               // REF: http://www.w3.org/TR/FileAPI/#ErrorDescriptions
               switch(evt.target.error.code) {
                  case 1:
                     message = file.name + " not found.";
                     break;
                  case 2:
                     message = file.name + " has changed on disk, please re-try.";
                     break;
                  case 4:
                     message = "Cannot read " + file.name + ".";
                     break;
               }
               $scope.finishDrop(message);
            };
            // Start reading the image off disk into a Data URI format.
            reader.readAsDataURL(file);
         };
      },

      link: function (scope, element, attrs) {
         element.addClass("image-drop");
         scope.canvas = element[0];
         scope.context = scope.canvas.getContext("2d");
         scope.context.webkitImageSmoothingEnabled = false;
         scope.context.mozImageSmoothingEnabled = false;
         scope.overlay = $(".drop-overlay");
         scope.overlayText = scope.overlay.find('.content');
         $("body").on("dragenter", scope.onDragEnter);
         scope.overlay.on("dragleave", scope.onDragLeave);
         scope.overlay.on("dragover", scope.noopHandler);
         scope.overlay.on('drop',scope.onDrop);

      }
   };
});
