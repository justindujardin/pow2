module.exports = function(grunt) {

   grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),

      /**
       * System notifications about build step completion.
       */
      notify: {
         options: {
            title: 'E.B.U.R.P.'
         },
         sprites:{
            options: {
               message: 'Sprite Sheets built.'
            }
         },
         less:{
            options: {
               message: 'CSS styles built.'
            }
         },
         maps:{
            options: {
               message: 'Maps compiled.'
            }
         },
         server:{
            options: {
               message: 'Server restarted.'
            }
         },
         data:{
            options: {
               message: 'Data files built.'
            }
         },
         code:{
            options: {
               message: 'Code build complete.'
            }
         }
      },

      clean: {
         pow2: {
            src: ["lib/"]
         },
         server: {
            src: [
               "server/*.d.ts",
               "server/*.js",
               "server/*.js.map"
            ]
         }
      },

      /**
       * Compile TypeScript library
       */
      typescript: {
         options: {
            module: 'amd', //or commonjs
            target: 'es5', //or es3
            basePath: 'source',
            sourceMap: true,
            declaration: true
         },

         server: {
            options: {
               module: 'commonjs', //or commonjs
               target: 'es5', //or es3
               sourceMap: true,
               declaration: false
            },
            src: [
               "server/*.ts"
            ]
         },

         pow2: {
            src: [
               "source/core/api.ts",
               "source/core/events.ts",
               "source/core/*.ts",
               "source/core/resources/*.ts",
               "source/core/scene/*.ts",
               "source/core/scene/components/*.ts"
            ],
            dest: 'lib/<%= pkg.name %>.js'
         },
         game: {
            src: [
               "source/tile/*.ts",
               "source/tile/components/*.ts",
               "source/tile/objects/*.ts",
               "source/tile/resources/*.ts",
               "source/tile/features/*.ts",
               "source/tile/render/*.ts",
               "source/game/*.ts",
               "source/game/components/gameComponent.ts",
               "source/game/models/entityModel.ts",
               "source/game/models/itemModel.ts",
               "source/game/models/*.ts",
               "source/game/states/*.ts",
               "source/game/objects/*.ts",
               "source/game/components/*.ts",
               "source/game/components/features/*.ts",
               "source/combat/*.ts",
               "source/combat/states/*.ts",
               "source/combat/components/*.ts"
            ],
            dest: 'lib/<%= pkg.name %>.game.js'
         },
         ui: {
            src: [
               "source/ui/index.ts",
               "source/ui/*.ts",
               "source/ui/**/*.ts"
            ],
            dest: 'lib/<%= pkg.name %>.ui.js'
         },
         data: {
            src: [
               "data/*.ts",
               "data/creatures/*.ts"
            ],
            dest: 'lib/<%= pkg.name %>.data.js'
         }

      },

      /**
       * Copy typescript typedefs to build/ to satisfy compiler.
       */
      copy: {
         core: {
            expand: true,
            cwd: '',
            src: 'types/**/*.d.ts',
            dest: 'build'
         }
      },

      /**
       * Uglify the output javascript files in production builds.  This task is only
       * ever invoked with `heroku:production`, and simply obfuscates/minifies the existing
       * files.
       */
      uglify: {
         options: {
            sourceMap:true,
            banner: '\n/*!\n  <%= pkg.name %> - v<%= pkg.version %>\n  built: <%= grunt.template.today("yyyy-mm-dd") %>\n */\n'
         },
         game: {
            files: {
               'lib/<%= pkg.name %>.min.js'    : ['lib/<%= pkg.name %>.js'],
               'lib/<%= pkg.name %>.min.game.js'    : ['lib/<%= pkg.name %>.game.js'],
               'lib/<%= pkg.name %>.min.data.js'    : ['lib/<%= pkg.name %>.data.js'],
               'lib/<%= pkg.name %>.min.ui.js'    : ['lib/<%= pkg.name %>.ui.js'],
               'lib/<%= pkg.name %>.min.sprites.js' : ['lib/<%= pkg.name %>.sprites.js']
            }
         }
      },

      /**
       * Build sprite sheets.
       */
      sprites: {
         game: {
            options: {
               metaFile: 'lib/<%= pkg.name %>.sprites.js',
               indexFiles: true
            },
            files: [
               {src: 'data/textures/creatures/*.png', dest: 'web/images/creatures'},
               {src: 'data/textures/vehicles/*.png', dest: 'web/images/vehicles'},
               {src: 'data/textures/ui/*.png', dest: 'web/images/ui'},
               {src: 'data/textures/environment/*.png', dest: 'web/images/environment'},
               {src: 'data/textures/characters/punch/*.png', dest: 'web/images/punch'},
               {src: 'data/textures/characters/magic/*.png', dest: 'web/images/magic'},
               {src: 'data/textures/characters/*.png', dest: 'web/images/characters'},
               {src: 'data/textures/animation/*.png', dest: 'web/images/animation'},
               {src: 'data/textures/equipment/*.png', dest: 'web/images/equipment'},
               {src: 'data/textures/items/*.png', dest: 'web/images/items'}
            ]
         }
      },

      /**
       * Game server. Useful for deploys (e.g. to heroku), and for getting
       * around security restrictions of running the game from index.html on your
       * hard drive.
       */
      express: {
         options: {
            script: 'server/gameServer.js',
            port: 5215
         },
         production: {
            options: {
               node_env: 'production'
            }
         }
      },


      /**
       * Compile game LESS styles to CSS
       */
      less: {
         game: {
            options: {
               paths: [
                  "source/ui/",
                  "web/bower/bootstrap/less/"
               ]
            },
            files: {
               'web/css/index.css':'source/ui/index.less'
            }
         }
      },

      /**
       * Trigger a new build when files change
       */
      watch: {
         options:{
            spawn: true
         },

         // Game Source outputs
         //--------------------------------------------------------------------
         pow2: {
            files: [
               '<%= typescript.pow2.src %>'
            ],
            tasks: ['typescript:pow2', 'notify:code']
         },
         game: {
            files: [
               '<%= typescript.game.src %>'
            ],
            tasks: ['typescript:game', 'notify:code']
         },
         ui: {
            files: [
               '<%= typescript.ui.src %>'
            ],
            tasks: ['typescript:ui', 'notify:code']
         },
         data: {
            files: [
               '<%= typescript.data.src %>'
            ],
            tasks: ['typescript:data', 'notify:data']
         },
         typedefs: {
            files: [
               'types/**'
            ],
            tasks: ['copy']
         },


         // Game Metadata
         //--------------------------------------------------------------------
         sprites: {
            files: [
               'data/textures/**/*.png',
               'data/textures/**/*.json'
            ],
            tasks: ['sprites', 'notify:sprites']
         },
         styles: {
            files: [
               'source/ui/*.less',
               'source/ui/**/*.less'
            ],
            tasks: ['less', 'notify:less']
         },
         expressts: {
            files:  [ 'server/*.ts' ],
            tasks:  [ 'typescript:server', 'express', 'notify:server' ],
            options: {
               atBegin:true,
               nospawn: true
            }
         },
         express: {
            files:  [ 'source/**/*.html' ],
            tasks:  [ 'express', 'notify:server' ],
            options: {
               nospawn: true //Without this option specified express won't be reloaded
            }
         }
      }
   });

   grunt.registerMultiTask('sprites', 'Pack sprites into output sheets', function()
   {
      var done = this.async();
      var spritePacker = require('./server/spritePacker');
      var options = this.options({
         metaFile: null,
         indexFiles:false
      });
      var queue = this.files.slice();
      var jsChunks = [];
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
         // Write out metadata if specified.
         if(options.metaFile){
            grunt.file.write(options.metaFile,jsChunks.join('\n'));
            grunt.log.writeln('File "' + options.metaFile + '" created.');
         }
         done();
      }
      _next();
   });

   grunt.loadNpmTasks('grunt-contrib-uglify');
   grunt.loadNpmTasks('grunt-typescript');
   grunt.loadNpmTasks('grunt-contrib-less');
   grunt.loadNpmTasks('grunt-contrib-copy');
   // Support system notifications in non-production environments
   if(process && process.env && process.env.NODE_ENV !== 'production'){
      grunt.loadNpmTasks('grunt-contrib-clean');
      grunt.loadNpmTasks('grunt-notify');
      grunt.loadNpmTasks('grunt-express-server');
      grunt.loadNpmTasks('grunt-contrib-watch');

      grunt.registerTask('default', ['typescript', 'copy','less','sprites']);
      grunt.registerTask('develop', ['default', 'watch']);
   }
   else {
      grunt.registerTask('default', ['typescript', 'copy','less','sprites']);
      grunt.registerTask('heroku:production', ['typescript', 'copy','less','sprites','uglify']);
   }
};
