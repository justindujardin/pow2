module.exports = function(grunt) {

   grunt.option('force', true);
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
         recess:{
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
         core: {
            src: ["build/core"]
         },
         scene: {
            src: ["build/scene"]
         },
         tile: {
            src: ["build/tile"]
         },
         game: {
            src: ["build/game"]
         },
         ui: {
            src: ["build/ui"]
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
            base_path: 'source',
            sourcemap: true,
            declaration: false
         },
         data: {
            src: [
               "data/*.ts",
               "data/creatures/*.ts"
            ],
            dest: 'web/<%= pkg.name %>.data.js'
         },

         core: {
            src: [
               "source/core/api.ts",
               "source/core/*.ts",
               "source/core/resources/*.ts"
            ],
            dest: 'build'
         },
         scene: {
            src: [
               "source/scene/*.ts",
               "source/scene/components/*.ts"
            ],
            dest: 'build'
         },
         tile: {
            src: [
               "source/tile/*.ts",
               "source/tile/components/*.ts",
               "source/tile/objects/*.ts",
               "source/tile/resources/*.ts",
               "source/tile/features/*.ts",
               "source/tile/render/*.ts"
            ],
            dest: 'build'
         },
         game: {
            src: [
               "source/game/*.ts",
               "source/game/objects/*.ts",
               "source/game/models/entityModel.ts",
               "source/game/models/itemModel.ts",
               "source/game/models/*.ts",
               "source/game/states/*.ts",
               "source/game/states/combat/*.ts",
               "source/game/components/*.ts",
               "source/game/components/features/*.ts"
            ],
            dest: 'build'
         },
         ui: {
            src: [
               "source/ui/index.ts",
               "source/ui/*.ts",
               "source/ui/**/*.ts"
            ],
            dest:'build'
         },
         server: {
            options: {
               module: 'commonjs', //or commonjs
               target: 'es5', //or es3
               sourcemap: true,
               declaration: false
            },
            src: [
               "server/*.ts"
            ]
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
            banner: '\n/*!\n  <%= pkg.name %> - v<%= pkg.version %>\n  built: <%= grunt.template.today("yyyy-mm-dd") %>\n */\n'
         },
         game: {
            files: {
               'web/<%= pkg.name %>.core.js'    : ['web/<%= pkg.name %>.core.js'],
               'web/<%= pkg.name %>.typescript.js'    : ['web/<%= pkg.name %>.typescript.js'],
               'web/<%= pkg.name %>.data.js'    : ['web/<%= pkg.name %>.data.js'],
               'web/<%= pkg.name %>.maps.js'    : ['web/<%= pkg.name %>.maps.js'],
               'web/<%= pkg.name %>.sprites.js' : ['web/<%= pkg.name %>.sprites.js']
            }
         }
      },

      /**
       * Build sprite sheets.
       */
      sprites: {
         game: {
            options: {
               metaFile: 'web/<%= pkg.name %>.sprites.js',
               indexFiles: true
            },
            files: [
               {src: 'data/textures/vehicles/*.png', dest: 'web/images/vehicles'},
               {src: 'data/textures/characters/*.png', dest: 'web/images/characters'},
               {src: 'data/textures/animation/*.png', dest: 'web/images/animation'},
               {src: 'data/textures/creatures/*.png', dest: 'web/images/creatures'},
               {src: 'data/textures/environment/*.png', dest: 'web/images/environment'},
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
      recess: {
         options: {
            compile: true,
            includePath: ["web"]
         },
         game: {
            files: [
               {src: 'web/index.less', dest: 'web/css/index.css'}
            ]
         }
      },


      /**
       * Trigger a new build when files change
       */
      watch: {
         options:{
            spawn: false
         },

         // Game Source outputs
         //--------------------------------------------------------------------
         core: {
            files: [
               '<%= typescript.core.src %>'
            ],
            tasks: ['clean:core', 'typescript:core', 'notify:code']
         },
         data: {
            files: [
               '<%= typescript.data.src %>'
            ],
            tasks: ['typescript:data', 'notify:data']
         },
         scene: {
            files: [
               '<%= typescript.scene.src %>'
            ],
            tasks: ['clean:scene', 'typescript:scene', 'notify:code']
         },
         tile: {
            files: [
               '<%= typescript.tile.src %>'
            ],
            tasks: ['clean:tile', 'typescript:tile', 'notify:code']
         },
         game: {
            files: [
               '<%= typescript.game.src %>'
            ],
            tasks: ['clean:game', 'typescript:game', 'notify:code']
         },
         ui: {
            files: [
               '<%= typescript.ui.src %>'
            ],
            tasks: ['typescript:ui']
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
               'data/textures/**/*.png'
            ],
            tasks: ['sprites', 'notify:sprites']
         },
         styles: {
            files: [
               'web/*.less',
               'web/less/*.less',
               'web/less/bootstrap/*.less'
            ],
            tasks: ['recess', 'notify:recess']
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
            files:  [ 'web/*.html', 'server/*.js' ],
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
   grunt.loadNpmTasks('grunt-contrib-clean');
   grunt.loadNpmTasks('grunt-typescript');
   grunt.loadNpmTasks('grunt-recess');
   grunt.loadNpmTasks('grunt-contrib-copy');
   // Support system notifications in non-production environments
   if(process && process.env && process.env.NODE_ENV !== 'production'){
      grunt.loadNpmTasks('grunt-express-server');
      grunt.loadNpmTasks('grunt-contrib-watch');
      grunt.loadNpmTasks('grunt-notify');
      grunt.registerTask('default', ['typescript', 'copy','recess','sprites']);
   }
   else {
      grunt.registerTask('default', ['typescript', 'copy','recess','sprites']);
      grunt.registerTask('heroku:production', ['typescript', 'copy','recess','sprites','uglify']);
   }
};
