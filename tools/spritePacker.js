/* jslint node: true */
"use strict";

var fs = require('fs');
var path = require('path');
var Q = require('q');
var _ = require('underscore');
var PNG = require('pngjs').PNG;
var boxPacker = require('binpacking').GrowingPacker;

/**
 * Scale an image up/down by an integer scaling factor.
 * @param {PNG} png The pngjs PNG instance to scale.
 * @param {Number} scale The scale factor to apply.  This is floored to an integer value.
 * @returns {PNG} The scaled PNG instance.
 */
function scalePng(png,scale){
   scale = Math.floor(scale);
   var scaledPng = new PNG({
      width:png.width * scale,
      height:png.height *scale,
      filterType:0
   });
   for (var y = 0; y < scaledPng.height; y++) {
      for (var x = 0; x < scaledPng.width; x++) {

         // Source texture data index
         var baseX = Math.floor(x / scale);
         var baseY = Math.floor(y / scale);
         var baseIdx = (png.width * baseY + baseX) << 2;
         var idx = (scaledPng.width * y + x) << 2;

         // Apply source index to scaled image
         scaledPng.data[idx] = png.data[baseIdx];
         scaledPng.data[idx+1] = png.data[baseIdx+1];
         scaledPng.data[idx+2] = png.data[baseIdx+2];
         scaledPng.data[idx+3] = png.data[baseIdx+3];
      }
   }
   return scaledPng;
}

/**
 * Read PNG data for a file, and resolve with an object containing the file name
 * and the PNG object instance representing its data.
 */
function readPngData(file,scale){
   var deferred = Q.defer();
   var readFile = Q.denodeify(fs.readFile);
   return readFile(file).then(function(data){
      var stream = new PNG();
      stream.on('parsed', function() {
         var png = scale > 1 ? scalePng(this,scale) : this;
         deferred.resolve({
            png: png,
            file: file
         });
      });
      stream.write(data);
      return deferred.promise;
   });
}

/**
 * Write out a composite PNG image that has been packed into a sheet,
 * and a JSON file that describes where the sprites are in the sheet.
 */
function writePackedImage(name,cells,width,height,spriteSize,scale){
   var deferred = Q.defer();
   var stream = new PNG({
      width:width,
      height:height
   });
   var baseName = path.basename(name);
   var pngName = name + '.png';
   var metaName = name + '.js';
   _.each(cells,function(cell){
      cell.png.bitblt(stream,0,0,cell.width,cell.height,cell.x,cell.y);
   });
   stream.pack().pipe(fs.createWriteStream(pngName));
   stream.on('end', function() {
      deferred.resolve(pngName);
   });

   // Last transformation: produce expected gurk output format.
   // Don't mark block, just set to 0.
   var metaData = {};
   _.each(cells,function(cell){
      var fileName = cell.file.substr(cell.file.lastIndexOf("/") + 1);
      metaData[fileName] = {
         frames: cell.png.width / (spriteSize * scale),
         src: baseName,
         x: cell.x,
         y: cell.y
      };
   });

   var metaJS = "eburp.registerSprites('" + baseName + "'," + JSON.stringify(metaData,null,3)+");";
   fs.writeFileSync(metaName,metaJS);
   return deferred.promise;
}

/**
 * Sprite packing function.  Takes an array of file names, an output name,
 * and an optional scale/callback.
 */
module.exports = function(files,options){
   options = _.extend({},{
      outName : 'spriteSheet',
      scale : 1
   },options || {});
   var SOURCE_SPRITE_SIZE = 16;
   if(path.extname(options.outName) !== ''){
      options.outName = options.outName.substr(0,options.outName.lastIndexOf('.'));
   }
   files = _.filter(files,function(file){
      return path.extname(file) == '.png';
   });
   var readFiles = _.map(files,function(file){
      return readPngData(file,options.scale);
   });
   return Q.all(readFiles).then(function(fileDatas){
      var blocks = _.map(fileDatas,function(d){
         return {
            w: d.png.width,
            h: d.png.height,
            data: d
         };
      });
      var packer = new boxPacker();
      packer.fit(blocks);
      var cells = _.map(blocks,function(b){
         return {
            width: b.w,
            height: b.h,
            x: b.fit.x,
            y: b.fit.y,
            png: b.data.png,
            file: b.data.file
         };
      });
      return writePackedImage(options.outName,cells,packer.root.w,packer.root.h,SOURCE_SPRITE_SIZE,options.scale)
   });
};
