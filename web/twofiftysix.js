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


twoFiftySix.app.directive('twoFiftySix', function($compile) {
   return {
      restrict: 'A',
      link: function (scope, element, attrs) {
         var self = this;

         var renderCanvas = $compile('<canvas style="position:absolute;left:-9000px;top:-9000px;" width="256" height="256"></canvas>')(scope);
         var context = renderCanvas[0].getContext("2d");
         context.webkitImageSmoothingEnabled = false;
         context.mozImageSmoothingEnabled = false;

         element.append(renderCanvas);


         var loader = new eburp.ResourceLoader();
         loader.loadAll([
            "/images/animation.png",
            "/images/characters.png",
            "/images/creatures.png",
            "/images/environment.png",
            "/images/equipment.png",
            "/images/items.png",
            "/images/ui.png"
         ],function(){
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
            var sprite = tileView.imageProcessor.isolateSprite("party.png");
            image.src = sprite.src;
            image.onload = function(){
               var canvas = $("canvas.image-drop")[0];
               var context = canvas.getContext("2d");
               context.clearRect(0,0,128,128);
               context.drawImage(sprite,0,0,128,128); // Or at whatever offset you like

            };
            console.log("READY TO GO!");
         });
      }
   };
});


//


///
twoFiftySix.app.directive('imageDrop', function($compile) {
   function noopHandler(evt) {
      evt.stopPropagation();
      evt.preventDefault();
   }

   function onDragEnter(evt) {
      $(".drop-overlay").fadeIn(125);
   }

   function onDragLeave(e) {
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
   }

   function processDropImage(file,context){

      if(file.type !== 'image/png'){
         // TODO: Error in scope.
         return;
      }
      var reader = new FileReader();

      // When the file is done loading, POST to the server.
      reader.onloadend = function(evt){
         var data = evt.target.result;
         var image = $(".drop-target img")[0];
         image.onload = function(){
            context.clearRect(0,0,128,128);
            context.drawImage(image,0,0,128,128);
            // TODO: Append this image and stretch it up.  This way designers can save-as.
            $(".drop-target .filename").text(file.name);
         };
         image.src =  data;
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
         console.log(message);
      };
      // Start reading the image off disk into a Data URI format.
      reader.readAsDataURL(file);
   }

   return {
      restrict: 'A',
      link: function (scope, element, attrs) {
         element.addClass("image-drop");
         var canvas = element[0];
         var context = canvas.getContext("2d");
         context.webkitImageSmoothingEnabled = false;
         context.mozImageSmoothingEnabled = false;
         function onDrop(evt) {
            noopHandler(evt);
            var files = evt.originalEvent.dataTransfer.files;
            if(typeof files !== "undefined" && files.length > 0){
               for(var i = 0, length = files.length; i < length; i++) {
                  processDropImage(files[i],context);
               }
            }
            $(".drop-overlay").fadeOut(125);

         }
         var overlay = $(".drop-overlay");
         $("body").on("dragenter", onDragEnter);
         overlay.on("dragleave", onDragLeave);
         overlay.on("dragover", noopHandler);
         overlay.on('drop',onDrop);

      }
   };
});


// Inspired by:
// http://stackoverflow.com/questions/6381548/dragging-and-dropping-images-into-a-web-page-and-automatically-resizing-them-wit
