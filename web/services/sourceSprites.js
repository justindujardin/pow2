twoFiftySix.app.service('sourceSprites',function($http,$q,game,$rootScope,$compile){
   var render = document.createElement('canvas');
   var context = render.getContext("2d");

   this.categories = [
      'characters','creatures','environment','equipment','items'
   ];
   this.getCategories = function(){
      return this.categories;
   };

   this.getSprites = function(category,scale){
      scale = scale || 1;
      var extent = 16 * scale;
      context.canvas.width = context.canvas.height = extent;
      context.webkitImageSmoothingEnabled = context.mozImageSmoothingEnabled = false;

      var deferred = $q.defer();
      // Load the source sprite mapping file for a given sprite sheet
      game.loader.load('/images/' + category + '.json',function(resource){
         function _done(result){
            deferred.resolve(result);
            if (!$rootScope.$$phase) {
               $rootScope.$apply();
            }
         }
         var absFiles = _.map(resource.data,function(r){
            return '/' + r;
         });
         if(scale === 1){
            return _done(absFiles);
         }
         var images = game.loader.load(absFiles,function(){
            var scaled = _.map(images,function(img){
               context.clearRect(0,0,extent,extent);
               context.drawImage(img.data,0,0,extent,extent);
               return render.toDataURL();
            });
            _done(scaled);
         });
      });
      return deferred.promise;
   };

});