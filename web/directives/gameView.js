twoFiftySix.app.directive('gameView', function($compile,game) {
   return {
      restrict: 'A',
      link: function ($scope, element, attrs) {
         var renderCanvas = $compile('<canvas style="position:absolute;left:-9000px;top:-9000px;" width="256" height="256"></canvas>')($scope);
         var context = renderCanvas[0].getContext("2d");
         context.webkitImageSmoothingEnabled = false;
         context.mozImageSmoothingEnabled = false;
         element.append(renderCanvas);
         game.load().then(function(){

            game.tileView = new eburp.TileMapView(element[0],game.loader);
            game.tileView.camera.extent.set(10,10);
            game.tileView.imageProcessor = new eburp.ImageProcessor(renderCanvas[0], game.tileView);
            game.tileView.tileMap = game.tileMap;
            game.scene.addView(game.tileView);
            game.tileView.trackObject(game.sprite);

            var image = $(".user-sprite img")[0];
            var canvas = $("canvas.image-drop")[0];
            var context = canvas.getContext("2d");
            var storedImage = $scope.getImageData();
            if(!image.src){
               if(!storedImage){
                  var sprite = game.tileView.imageProcessor.isolateSprite("party.png");
                  image.src = sprite.src;
               }
               else {
                  $scope.setImageData(storedImage);
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



