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
      template: '<div class="ebp-frame"><div class="tl"></div><div class="tr"></div><div class="bl"></div><div class="br"></div><div class="content"  ng-transclude></div></div>',
      link: function (scope, element, attrs) {
         element.addClass('ebp');
         var compiled = $compile('')(scope);
         element.append(compiled);
      }
   };
});

//

twoFiftySix.app.factory('gameData', function($q,$rootScope){
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

twoFiftySix.app.controller('twoFiftySixApp',function($scope,$rootScope,$http,gameData){
   $scope.error = null;
   $scope.notify = function(){};
   $scope.shareImage = function(){
      $http.post('/share', {data:gameData.imageData}).success(function(data){
         $scope.sharedUrl = data.url;
         $scope.notify("Your image has been updated.");
      });
   };
   gameData.load().then(function(){
      $scope.gameData = gameData;
   });
});



twoFiftySix.app.directive('twoFiftySix', function($compile,gameData) {
   return {
      restrict: 'A',
      link: function (scope, element, attrs) {
         var renderCanvas = $compile('<canvas style="position:absolute;left:-9000px;top:-9000px;" width="256" height="256"></canvas>')(scope);
         var context = renderCanvas[0].getContext("2d");
         context.webkitImageSmoothingEnabled = false;
         context.mozImageSmoothingEnabled = false;

         element.append(renderCanvas);


         var loader = gameData.loader;
         gameData.load().then(function(){
            var image = $(".drop-target img")[0];
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
                  context.clearRect(0,0,128,128);
                  context.drawImage(sprite,0,0,128,128);
               };
            }
            else {
               context.clearRect(0,0,128,128);
               context.drawImage(image,0,0,128,128);
            }
            console.log("READY TO GO!");
         });
      }
   };
});


//


///
twoFiftySix.app.directive('imageDrop', function($compile,gameData) {
   return {
      restrict: 'A',
      scope:true,
      controller: function($scope) {
         $scope.noopHandler = function(evt) {
            evt.stopPropagation();
            evt.preventDefault();
         };

         $scope.onDrop = function(evt) {
            $scope.noopHandler(evt);
            var files = evt.originalEvent.dataTransfer.files;
            if(typeof files !== "undefined" && files.length > 0){
               for(var i = 0, length = files.length; i < length; i++) {
                  $scope.processDropImage(files[i]);
               }
            }
            $(".drop-overlay").fadeOut(125);

         };
         $scope.onDragEnter = function(evt) {
            $(".drop-overlay").fadeIn(125);
         };

         $scope.onDragLeave = function(e) {
            var evt = e.originalEvent;
            /*
             * We have to double-check the 'leave' event state because this event stupidly
             * gets fired by JavaScript when you mouse over the child of a parent element;
             * instead of firing a subsequent enter event for the child, JavaScript first
             * fires a LEAVE event for the parent then an ENTER event for the child even
             * though the mouse is still technically inside the parent bounds. If we trust
             * the dragenter/dragleave events as-delivered, it leads to "flickering" when
             * a child element (drop prompt) is hovered over as it becomes invisible,
             * then visible then invisible again as that continually triggers the enter/leave
             * events back to back. Instead, we use a 10px buffer around the window frame
             * to capture the mouse leaving the window manually instead. (using 1px didn't
             * work as the mouse can skip out of the window before hitting 1px with high
             * enough acceleration).
             */
            if(evt.pageX < 10 || evt.pageY < 10 || $(window).width() - evt.pageX < 10  || $(window).height - evt.pageY < 10) {
               $(".drop-overlay").fadeOut(125);
            }
         };

         $scope.processDropImage = function(file){

            if(file.type !== 'image/png'){
               $scope.error = "You have to drop a png image.";
               return;
            }
            var reader = new FileReader();
            reader.onloadend = function(evt){
               var data = evt.target.result;
               var image = new Image();
               image.onload = function(){
                  if(image.naturalWidth !== 16 || image.naturalHeight !== 16){
                     $scope.error = "Image must be 16x16 pixels.";
                     return;
                  }
                  gameData.imageData = data;
                  var sprite = $(".drop-target img")[0];
                  sprite.src = null;
                  sprite.src = data;
                  sprite.onload = function(){
                     $scope.context.clearRect(0,0,128,128);
                     $scope.context.drawImage(sprite,0,0,128,128);
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
               $scope.error = message;
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
         var overlay = $(".drop-overlay");
         $("body").on("dragenter", scope.onDragEnter);
         overlay.on("dragleave", scope.onDragLeave);
         overlay.on("dragover", scope.noopHandler);
         overlay.on('drop',scope.onDrop);

      }
   };
});
