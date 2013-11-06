module.exports = function(grunt) {

   grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      notify: {
         watch: {
            options: {
               title: 'E.B.U.R.P.',
               message: 'Game build complete.'
            }
         }
      },

      /**
       * Concatenate data files
       */
      concat: {
         options: {
            separator: '\n'
         },
         maps: {
            src: [
               "data/maps/*.js"
            ],
            dest: '<%= pkg.name %>.maps.js'
         }
      },

      /**
       * Compile CoffeeScript
       */
      coffee: {
         options:{
            join:true
         },
         game: {
            inputs: [
               "src/device.coffee",
               "src/core/util.coffee",
               "src/core/view.coffee",
               "src/core/*.coffee",
               "src/model/*.coffee",
               "src/adventure/*.coffee",
               "src/combat/*.coffee",
               "src/gurk.coffee"
            ]
         },
         web: {
            src: ['<%= coffee.game.inputs %>'],
            dest: '<%= pkg.name %>.js',
            ext: '.js'
         }
      },

      /**
       * Build sprite sheets.
       */
      sprites: {
         characters: {
            src: ['data/textures/characters/*.png'],
            dest: 'images/characters'
         },
         animation: {
            src: ['data/textures/animation/*.png'],
            dest: 'images/animation'
         },
         creatures: {
            src: ['data/textures/creatures/*.png'],
            dest: 'images/creatures'
         },
         environment: {
            src: ['data/textures/environment/*.png'],
            dest: 'images/environment'
         },
         equipment: {
            src: ['data/textures/equipment/*.png'],
            dest: 'images/equipment'
         },
         items: {
            src: ['data/textures/items/*.png'],
            dest: 'images/items'
         }
      },
      /**
       * Trigger a new build when files change
       */
      watch: {
         options:{
            atBegin:true
         },
         code: {
            files: [
               '<%= coffee.game.inputs %>'
            ],
            tasks: ['default']
         },
         maps: {
            files: [
               '<%= concat.maps.src %>'
            ],
            tasks: ['concat']
         },
         sprites: {
            files: [
               '<%= sprites.icons.src %>'
            ],
            tasks: ['sprites']
         }

      }
   });

   grunt.loadNpmTasks('grunt-contrib-watch');
   grunt.loadNpmTasks('grunt-contrib-coffee');
   grunt.loadNpmTasks('grunt-contrib-concat');
   grunt.loadNpmTasks('grunt-notify');

   grunt.registerTask('default', ['concat', 'coffee', 'sprites','notify']);



   grunt.registerMultiTask('sprites', 'Pack sprites in to output sheets', function()
   {
      var done = this.async();
      var spritePacker = require('./tools/spritePacker');
      this.files.forEach(function(f) {
         spritePacker(f.src, f.dest, 16,function(){
            grunt.log.writeln('File "' + f.dest + '" created.');
            done()
         });
      });

   });
};