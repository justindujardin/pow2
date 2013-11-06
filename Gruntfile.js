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
         },
         ui: {
            src: ['data/textures/ui/*.png'],
            dest: 'images/ui'
         }
      },

      /**
       * Game server. Useful for deploys (e.g. to heroku), and for getting
       * around security restrictions of running the game from index.html on your
       * hard drive.
       */
      express: {
         options: {
            script: 'tools/gameServer.js',
            port: 5215
         },
         production: {
            options: {
               node_env: 'production'
            }
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
               'data/textures/**/*.png'
            ],
            tasks: ['sprites']
         },
         express: {
            files:  [ 'tools/gameServer.js' ],
            tasks:  [ 'express' ],
            options: {
               nospawn: true //Without this option specified express won't be reloaded
            }
         }
      }
   });

   grunt.registerMultiTask('sprites', 'Pack sprites into output sheets', function()
   {
      var Q = require('q');
      var done = this.async();
      var spritePacker = require('./tools/spritePacker');
      var queue = [];
      this.files.forEach(function(f) {
         queue.push(spritePacker(f.src, {
            outName: f.dest,
            scale: 1
         }));
      });
      Q.all(queue).then(function(results){
         results.forEach(function(r){
            grunt.log.writeln('File "' + r + '" created.');
         });
         done()
      },function(error){
         grunt.log.error('Failed to create spritesheet: ' + error);
         done(error);
      });
   });

   grunt.loadNpmTasks('grunt-contrib-coffee');
   grunt.loadNpmTasks('grunt-contrib-concat');

   // Support system notifications in non-production environments
   if(process.env.NODE_ENV !== 'production'){
      grunt.loadNpmTasks('grunt-express-server');
      grunt.loadNpmTasks('grunt-contrib-watch');
      grunt.loadNpmTasks('grunt-notify');
      grunt.registerTask('default', ['sprites', 'concat', 'coffee', 'notify']);
   }
   grunt.registerTask('heroku:production', ['sprites','concat','coffee']);
};