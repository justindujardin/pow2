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

      /**
       * Concatenate data files
       */
      concat: {
         options: {
            separator: '\n'
         },
         data: {
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
       * Compile TypeScript library
       */
      typescript: {
         core: {
            options: {
               module: 'amd', //or commonjs
               target: 'es5', //or es3
               base_path: 'src',
               sourcemap: true,
               declaration: true
            },
            src: [
               "src/core/api.ts",
               "src/core/*.ts",
               "src/resources/*.ts",
               "src/scene/*.ts"
            ],
            dest: 'web/game'
         }
      },

      /**
       * Copy typescript typedefs to build/ to satisfy compiler.
       */
      copy: {
         core: {
          expand: true,
          cwd: 'src/',
          src: 'typedef/**/*.d.ts',
          dest: 'web/game'
         }
      },

      /**
       * Compile CoffeeScript
       */
      coffee: {
         options:{
            join:true
         },
         core: {
            src: [
               "src/core/api.coffee",
               "src/core/*.coffee",
               "src/resources/*.coffee",
               "src/scene/*.coffee",
               "src/scene/objects/*.coffee",
               "src/scene/views/*.coffee",
               "src/tile/*.coffee",
               "src/tile/objects/*.coffee",
               "src/tile/features/*.coffee",
               "src/tile/render/*.coffee"
            ],
            dest: 'web/<%= pkg.name %>.core.js',
            ext: '.js'
         },
         game: {
            src: [
               "src/game/util.coffee",
               "src/device.coffee",
               "src/ui/view.coffee",
               "src/ui/*.coffee",
               "src/model/*.coffee",
               "src/adventure/*.coffee",
               "src/combat/*.coffee",
               "src/game/*.coffee",
               "src/gurk.coffee"
            ],
            dest: 'web/<%= pkg.name %>.js',
            ext: '.js'
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
               'web/<%= pkg.name %>.sprites.js' : ['web/<%= pkg.name %>.sprites.js'],
               'web/<%= pkg.name %>.js'         : ['web/<%= pkg.name %>.js']
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
               {src: 'web/index.less', dest: 'web/css/index.css'},
               {src: 'web/twofiftysix.less', dest: 'web/css/twofiftysix.css'},
               {src: 'web/fbcanvas.less', dest: 'web/css/fbcanvas.css'}
            ]
         }
      },

      /**
       * Trigger a new build when files change
       */
      watch: {
         options:{
            atBegin:true,
            spawn: false
         },
         code: {
            files: [
               '<%= coffee.core.src %>',
               '<%= coffee.game.src %>'
            ],
            tasks: ['coffee', 'notify:code']
         },
         typescript: {
            files: [
               '<%= typescript.core.src %>'
            ],
            tasks: ['typescript', 'notify:code']
         },
         typedefs: {
            files: [
               'src/typedef/**'
            ],
            tasks: ['copy']
         },
         data: {
            files: [
               '<%= concat.data.src %>'
            ],
            tasks: ['concat:data', 'notify:data']
         },
         maps: {
            files: [
               '<%= concat.maps.src %>'
            ],
            tasks: ['concat:maps', 'notify:maps']
         },
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
                  jsChunks.push("eburp.registerSprites('" + result.name + "'," + JSON.stringify(result.meta,null,3)+");");
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

   grunt.loadNpmTasks('grunt-contrib-coffee');
   grunt.loadNpmTasks('grunt-contrib-concat');
   grunt.loadNpmTasks('grunt-contrib-uglify');
   grunt.loadNpmTasks('grunt-typescript');
   grunt.loadNpmTasks('grunt-recess');
   grunt.loadNpmTasks('grunt-contrib-copy');
   // Support system notifications in non-production environments
   if(process && process.env && process.env.NODE_ENV !== 'production'){
      grunt.loadNpmTasks('grunt-express-server');
      grunt.loadNpmTasks('grunt-contrib-watch');
      grunt.loadNpmTasks('grunt-notify');
      grunt.registerTask('default', ['sprites', 'concat', 'coffee', 'typescript', 'copy','recess']);
   }
   else {
      grunt.registerTask('default', ['sprites', 'concat', 'coffee', 'typescript', 'copy','recess']);
      grunt.registerTask('heroku:production', ['sprites','concat','coffee', 'typescript', 'copy','uglify', 'recess']);
   }
};
