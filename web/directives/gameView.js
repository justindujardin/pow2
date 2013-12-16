twoFiftySix.app.directive('gameView', function ($compile, game) {
   return {
      restrict: 'A',
      link: function ($scope, element, attrs) {
         var renderCanvas = $compile('<canvas style="position:absolute;left:-9000px;top:-9000px;" width="256" height="256"></canvas>')($scope);
         var context = renderCanvas[0].getContext("2d");
         $scope.canvas = element[0];
         context.webkitImageSmoothingEnabled = false;
         context.mozImageSmoothingEnabled = false;
         element.append(renderCanvas);
         game.load().then(function () {

            // Inspired by : http://seb.ly/2011/04/multi-touch-game-controller-in-javascripthtml5-for-ipad/
            $scope.canvas.addEventListener('touchstart', onTouchStart, false);
            $scope.canvas.addEventListener('touchmove', onTouchMove, false);
            $scope.canvas.addEventListener('touchend', onTouchEnd, false);

            /**
             * Game analog input
             */
            var halfWidth = $scope.canvas.width / 2;
            game.world.input.touchId = -1;
            game.world.input.touchCurrent = new eburp.Point(0, 0);
            game.world.input.touchStart = new eburp.Point(0, 0);
            game.world.input.analogVector = new eburp.Point(0, 0);


            function relTouch(touch){
               var canoffset = $($scope.canvas).offset();
               touch.gameX = touch.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
               touch.gameY = touch.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;
               return touch;
            }


            /*
             *	Touch event (e) properties :
             *	e.touches: 			Array of touch objects for every finger currently touching the screen
             *	e.targetTouches: 	Array of touch objects for every finger touching the screen that
             *						originally touched down on the DOM object the transmitted the event.
             *	e.changedTouches	Array of touch objects for touches that are changed for this event.
             *						I'm not sure if this would ever be a list of more than one, but would
             *						be bad to assume.
             *
             *	Touch objects :
             *
             *	identifier: An identifying number, unique to each touch event
             *	target: DOM object that broadcast the event
             *	clientX: X coordinate of touch relative to the viewport (excludes scroll offset)
             *	clientY: Y coordinate of touch relative to the viewport (excludes scroll offset)
             *	screenX: Relative to the screen
             *	screenY: Relative to the screen
             *	pageX: Relative to the full page (includes scrolling)
             *	pageY: Relative to the full page (includes scrolling)
             */
            function onTouchStart(e) {
               _.each(e.touches,function(t){relTouch(t)});
               _.each(e.changedTouches,function(t){relTouch(t)});
               for (var i = 0; i < e.changedTouches.length; i++) {
                  var touch = e.changedTouches[i];
                  if (game.world.input.touchId < 0) {
                     game.world.input.touchId = touch.identifier;
                     console.log(touch.gameX);
                     game.world.input.touchStart.set(touch.gameX, touch.gameY);
                     game.world.input.touchCurrent.copy(game.world.input.touchStart);
                     game.world.input.analogVector.zero();
                  }
               }
               game.world.input.touches = e.touches;
            }

            function onTouchMove(e) {
               // Prevent the browser from doing its default thing (scroll, zoom)
               e.preventDefault();
               _.each(e.touches,function(t){relTouch(t)});
               _.each(e.changedTouches,function(t){relTouch(t)});
               for (var i = 0; i < e.changedTouches.length; i++) {
                  var touch = e.changedTouches[i];
                  if (game.world.input.touchId == touch.identifier) {
                     game.world.input.touchCurrent.set(touch.gameX, touch.gameY);
                     game.world.input.analogVector.copy(game.world.input.touchCurrent);
                     game.world.input.analogVector.subtract(game.world.input.touchStart);
                     break;
                  }
               }
               game.world.input.touches = e.touches;
            }

            function onTouchEnd(e) {
               _.each(e.touches,function(t){relTouch(t)});
               _.each(e.changedTouches,function(t){relTouch(t)});
               game.world.input.touches = e.touches;
               for (var i = 0; i < e.changedTouches.length; i++) {
                  var touch = e.changedTouches[i];
                  if (game.world.input.touchId == touch.identifier) {
                     game.world.input.touchId = -1;
                     game.world.input.analogVector.zero();
                     break;
                  }
               }

            }


            game.tileView = new eburp.TileMapView(element[0], game.loader);
            game.tileView.camera.extent.set(10, 10);
            game.tileView.tileMap = game.tileMap;
            game.scene.addView(game.tileView);
            game.tileView.trackObject(game.sprite);

            function _done(image){
               game.sprite.image = image;
               dropContext.clearRect(0, 0, 96, 96);
               dropContext.drawImage(image, 0, 0, 96, 96);
            }
            var image = $(".user-sprite img")[0];
            var dropCanvas = $("canvas.image-drop")[0];
            var dropContext = dropCanvas.getContext("2d");
            var storedImage = $scope.getImageData();
            if (!image.src) {
               if (!storedImage) {
                  game.world.sprites.getSingleSprite("party.png",function(img){
                     _done(img);
                  });
               }
               else {
                  $scope.setImageData(storedImage);
                  image.src = storedImage;
               }
               image.onload = function () {
                  _done(image);
               };
            }
            else {
               _done(image);
            }
            console.log("READY TO GO!");
         });
      }
   };
});
