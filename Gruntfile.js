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
         game: {
            src: [
               "data/game.js",
               "data/*.js"
            ],
            dest: 'web/<%= pkg.name %>.data.js'
         },
         maps: {
            src: [
               "data/maps/*.js"
            ],
            dest: 'web/<%= pkg.name %>.maps.js'
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
            src: [
               "src/device.coffee",
               "src/core/util.coffee",
               "src/core/view.coffee",
               "src/core/*.coffee",
               "src/model/*.coffee",
               "src/adventure/*.coffee",
               "src/combat/*.coffee",
               "src/gurk.coffee"
            ],
            dest: 'web/<%= pkg.name %>.js',
            ext: '.js'
         }
      },

      /**
       * Build sprite sheets.
       */
      sprites: {
         game: {
            options: {
               metaFile: 'web/<%= pkg.name %>.sprites.js'
            },
            files: [
               {src: 'data/textures/characters/*.png', dest: 'web/images/characters'},
               {src: 'data/textures/animation/*.png', dest: 'web/images/animation'},
               {src: 'data/textures/creatures/*.png', dest: 'web/images/creatures'},
               {src: 'data/textures/environment/*.png', dest: 'web/images/environment'},
               {src: 'data/textures/equipment/*.png', dest: 'web/images/equipment'},
               {src: 'data/textures/items/*.png', dest: 'web/images/items'},
               {src: 'data/textures/ui/*.png', dest: 'web/images/ui'}
            ]
         }
      },

      /**
       * Uglify the output javascript files in production builds.  This task is only
       * ever invoked with `heroku:production`, and simply obfuscates/minifies the existing
       * files.
       */
      uglify: {
         options: {
            mangle: false,
            banner: '\n/*!\n  <%= pkg.name %> - v<%= pkg.version %>\n  built: <%= grunt.template.today("yyyy-mm-dd") %>\n */\n'
         },
         game: {
            files: {
               'web/<%= pkg.name %>.data.js'    : ['web/<%= pkg.name %>.data.js'],
               'web/<%= pkg.name %>.maps.js'    : ['web/<%= pkg.name %>.maps.js'],
               'web/<%= pkg.name %>.sprites.js' : ['web/<%= pkg.name %>.sprites.js'],
               'web/<%= pkg.name %>.js'         : ['web/<%= pkg.name %>.js']
            }
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
               '<%= coffee.game.src %>'
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
            files:  [ 'index.html', 'tools/gameServer.js' ],
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
      var options = this.options({
         metaFile: null
      });
      this.files.forEach(function(f) {
         queue.push(spritePacker(f.src, {
            outName: f.dest,
            scale: 1
         }));
      });
      var jsChunks = [];
      Q.all(queue).then(function(results){
         results.forEach(function(r){
            grunt.log.writeln('File "' + r.file + '" created.');
            jsChunks.push("eburp.registerSprites('" + r.name + "'," + JSON.stringify(r.meta,null,3)+");");
         });
         // Write out metadata if specified.
         if(options.metaFile){
            grunt.file.write(options.metaFile,jsChunks.join('\n'));
            grunt.log.writeln('File "' + options.metaFile + '" created.');
         }
         done();
      },function(error){
         grunt.log.error('Failed to create spritesheet: ' + error);
         done(error);
      });
   });

   grunt.loadNpmTasks('grunt-contrib-coffee');
   grunt.loadNpmTasks('grunt-contrib-concat');
   grunt.loadNpmTasks('grunt-contrib-uglify');
   // Support system notifications in non-production environments
   if(process.env.NODE_ENV !== 'production'){
      grunt.loadNpmTasks('grunt-express-server');
      grunt.loadNpmTasks('grunt-contrib-watch');
      grunt.loadNpmTasks('grunt-notify');
      grunt.registerTask('default', ['sprites', 'concat', 'coffee', 'notify']);
   }
   grunt.registerTask('default', ['sprites', 'concat', 'coffee']);
   grunt.registerTask('heroku:production', ['sprites','concat','coffee','uglify']);
};