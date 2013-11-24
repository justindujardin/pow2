twoFiftySix.app.directive('gameView', function($compile,game) {
   return {
      restrict: 'A',
      link: function (scope, element, attrs) {
         var renderCanvas = $compile('<canvas style="position:absolute;left:-9000px;top:-9000px;" width="256" height="256"></canvas>')(scope);
         var context = renderCanvas[0].getContext("2d");
         context.webkitImageSmoothingEnabled = false;
         context.mozImageSmoothingEnabled = false;

         element.append(renderCanvas);
         $(document).keyup(function(e){
            switch(e.keyCode){
               case 37: // Left
                  game.sprite.velocity.x = 0;
                  break;
               case 38: // Up
                  game.sprite.velocity.y = 0;
                  break;
               case 39: // Right
                  game.sprite.velocity.x = 0;
                  break;
               case 40: // Down
                  game.sprite.velocity.y = 0;
                  break;
               default:
                  return true;
            }
            e.stopImmediatePropagation();
         });
         $(document).keydown(function(e){
            switch(e.keyCode){
               case 37: // Left
                  game.sprite.velocity.x = -1;
                  break;
               case 38: // Up
                  game.sprite.velocity.y = -1;
                  break;
               case 39: // Right
                  game.sprite.velocity.x = 1;
                  break;
               case 40: // Down
                  game.sprite.velocity.y = 1;
                  break;
               default:
                  return true;
            }
            e.stopImmediatePropagation();
         });

         var loader = game.loader;
         game.load().then(function(){
            var image = $(".user-sprite img")[0];
            var tileView = new eburp.TileMapView(element[0],loader);
            tileView.imageProcessor = new eburp.ImageProcessor(renderCanvas[0], tileView);
            tileView.tileMap = game.tileMap;
            game.scene.addView(tileView);

            tileView.camera.point.set(15,10);
            tileView.trackObject(game.sprite);

            var canvas = $("canvas.image-drop")[0];
            var context = canvas.getContext("2d");
            var storedImage = scope.getImageData();
            if(!image.src){
               if(!storedImage){
                  var sprite = tileView.imageProcessor.isolateSprite("party.png");
                  image.src = sprite.src;
               }
               else {
                  scope.setImageData(storedImage);
                  image.src = storedImage;
               }
               image.onload = function(){
                  game.sprite.image = image;
                  context.clearRect(0,0,96,96);
                  context.drawImage(image,0,0,96,96);
               };
            }
            else {
               game.sprite.image = image;
               context.clearRect(0,0,96,96);
               context.drawImage(image,0,0,96,96);
            }
            console.log("READY TO GO!");
         });
      }
   };
});


//



