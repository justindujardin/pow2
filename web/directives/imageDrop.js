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
            if(typeof files === 'undefined' || files.length <= 0){
               return $scope.finishDrop("SORRY: You can only drop files");
            }
            if(files.length > 1){
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
                  var sprite = $(".user-sprite img")[0];
                  sprite.src = null;
                  sprite.src = data;
                  sprite.onload = function(){
                     $scope.setImageData(data);
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