/* jslint node: true */
"use strict";

var fs = require('fs');
var path = require('path');
var Q = require('q');
var _ = require('underscore');
var PNG = require('pngjs').PNG;
var boxPacker = require('binpacking').GrowingPacker;

/**
 * Read PNG data for a file, and resolve with an object containing the file name
 * and the PNG object instance representing its data.
 */
function readPngData(file){
   var deferred = Q.defer();
   var readFile = Q.denodeify(fs.readFile);
   return readFile(file).then(function(data){
      var stream = new PNG();
      stream.on('parsed', function() {
         deferred.resolve({
            png: this,
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
function writePackedImage(name,cells,width,height,spriteSize){
   var deferred = Q.defer();
   var stream = new PNG({
      width:width,
      height:height
   });
   _.each(cells,function(cell){
      cell.png.bitblt(stream,0,0,cell.width,cell.height,cell.x,cell.y);
   });
   stream.pack().pipe(fs.createWriteStream(name + '.png'));
   stream.on('end', function() {
      deferred.resolve();
   });

   // Last transformation: produce expected gurk output format.
   // Don't mark block, just set to 0.
   var metaData = {};
   _.each(cells,function(cell){
      var fileName = cell.file.substr(cell.file.lastIndexOf("/") + 1);
      metaData[fileName] = {
         block: 0,
         frames: cell.png.width / spriteSize,
         x: cell.x / spriteSize,
         y: cell.y / spriteSize
      };
   });

   var metaJS = "eburp.registerSprites('" + path.basename(name) + "'," + JSON.stringify(metaData,null,3)+");";
   fs.writeFileSync(name + ".js",metaJS);
   return deferred.promise;
}

/**
 * Sprite packing function.  Takes an array of file names, an output name,
 * and an optional spriteSize/callback.
 */
module.exports = function(files,outName,spriteSize,callback){
   if(path.extname(outName) !== ''){
      outName = outName.substr(0,outName.lastIndexOf('.'));
   }
   files = _.filter(files,function(file){
      return path.extname(file) == '.png';
   });
   var readFiles = _.map(files,function(file){
      return readPngData(file);
   });
   Q.all(readFiles).then(function(fileDatas){
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
      writePackedImage(outName,cells,packer.root.w,packer.root.h,spriteSize).then(function(){
         callback();
      });
   });
};
