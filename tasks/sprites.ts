///<reference path="../types/node/node.d.ts"/>
'use strict';

module.exports = function(grunt) {

   // Build sprite sheets
   // --------------------------------------------------
   grunt.registerMultiTask('sprites', 'Pack sprites into output sheets', function()
   {
      var done = this.async();
      var spritePacker = require('../server/spritePacker');
      var options = this.options({
         metaFile: null,
         jsonFile: null,
         indexFiles:false
      });
      var queue = this.files.slice();
      var jsChunks = [];
      var jsonData = {};
      function _next(){
         if(queue.length > 0){
            var exec = queue.shift();
            return spritePacker(exec.src, {outName: exec.dest,scale: 1})
               .then(function(result){
                  grunt.log.writeln('File "' + result.file + '" created.');
                  if(options.indexFiles){
                     var index = exec.dest + '.json';
                     grunt.file.write(index, JSON.stringify(exec.src,null,3));
                     grunt.log.writeln('File "' + index + '" created.');
                  }
                  jsonData[result.file] = result.meta;
                  jsChunks.push("pow2.registerSprites('" + result.name + "'," + JSON.stringify(result.meta,null,3)+");");
                  return _next();
               },function(error){
                  grunt.log.error('Failed to create spritesheet: ' + error);
                  done(error);
               });
         }
         _done();
      }
      function _done(){
         // Write out javascript metadata if specified.
         if(options.metaFile){
            grunt.file.write(options.metaFile,jsChunks.join('\n'));
            grunt.log.writeln('File "' + options.metaFile + '" created.');
         }
         // Write out JSON metadata if specified.
         if(options.jsonFile){
            grunt.file.write(options.jsonFile,JSON.stringify(jsonData,null,2));
            grunt.log.writeln('File "' + options.jsonFile + '" created.');
         }
         done();
      }
      _next();
   });
};