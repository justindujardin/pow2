module.exports = function(grunt) {

   grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),

      /**
       * System notifications about build step completion.
       */
      notify: {
         options: {
            title: 'Pow2'
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
         server:{
            options: {
               message: 'Server restarted.'
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
               "source/core/*.ts",
               "source/core/scene/*.ts",
               "source/core/scene/components/*.ts",
               "source/interfaces/*.ts"
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
               "source/game/resources/*.ts",
               "source/game/components/*.ts",
               "source/game/components/features/*.ts",
               "source/combat/*.ts",
               "source/combat/states/*.ts",
               "source/combat/components/*.ts",
               "source/combat/components/actions/*.ts",
               "source/combat/components/players/*.ts"
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
         tests: {
            src: [
               "test/fixtures/*.ts",
               "test/fixtures/**/*.ts",
               "test/*.ts",
               "test/**/*.ts"
            ],
            dest: 'lib/test/<%= pkg.name %>.tests.js'
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
               jsonFile: 'lib/<%= pkg.name %>.sprites.json',
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
         tests: {
            files: [
               '<%= typescript.tests.src %>'
            ],
            tasks: ['typescript:tests', 'notify:code']
         },
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
      },
      /**
       * Release Tasks
       */
      bump: {
         options: {
            files: ['package.json', 'bower.json'],
            updateConfigs: ['pkg'],
            commit: true,
            commitMessage: 'chore(deploy): release v%VERSION%',
            commitFiles: [
               'package.json',
               'bower.json',
               'CHANGELOG.md'
            ],
            createTag: true,
            tagName: 'v%VERSION%',
            tagMessage: 'Version %VERSION%',
            push: true,
            pushTo: 'origin',
            gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
         }
      },
      artifacts: {
         options:{
            files: [ 'lib/*.*' ]
         }
      },
      changelog: {},

      'npm-contributors': {
         options: {
            commitMessage: 'chore(attribution): update contributors'
         }
      },

      /**
       * Code Coverage
       */
      coveralls: {
         options: {
            coverage_dir: '.coverage/',
            debug: process.env.TRAVIS ? false : true,
            dryRun: process.env.TRAVIS ? false : true,
            force: true,
            recursive: true
         }
      }

   });

   // Build sprite sheets
   // --------------------------------------------------
   grunt.registerMultiTask('sprites', 'Pack sprites into output sheets', function()
   {
      var done = this.async();
      var spritePacker = require('./server/spritePacker');
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

   grunt.loadNpmTasks('grunt-contrib-uglify');
   grunt.loadNpmTasks('grunt-typescript');
   grunt.loadNpmTasks('grunt-contrib-less');
   grunt.loadNpmTasks('grunt-contrib-copy');
   grunt.loadNpmTasks('grunt-contrib-clean');
   grunt.loadNpmTasks('grunt-notify');
   // Support system notifications in non-production environments
   if(process && process.env && process.env.NODE_ENV === 'production'){
      grunt.registerTask('default', ['typescript', 'less','sprites']);
      grunt.registerTask('heroku:production', ['default','uglify']);
   }
   else {
      grunt.loadNpmTasks('grunt-express-server');
      grunt.loadNpmTasks('grunt-contrib-watch');

      grunt.registerTask('default', ['typescript', 'less','sprites']);
      grunt.registerTask('develop', ['default', 'watch']);
   }


   // Test Coverage
   // --------------------------------------------------
   grunt.loadNpmTasks('grunt-karma-coveralls');

   // Release a version
   // --------------------------------------------------
   grunt.loadNpmTasks('grunt-bump');
   grunt.loadNpmTasks('grunt-conventional-changelog');
   grunt.loadNpmTasks('grunt-npm');
   grunt.registerTask('release', 'Build, bump and tag a new release.', function(type) {
      type = type || 'patch';
      grunt.task.run([
         'npm-contributors',
         'default',
         'uglify',
         'bump:' + type + ':bump-only',
         'changelog',
         'artifacts:add',
         'bump-commit',
         'artifacts:remove'
      ]);
   });


   var exec = require('child_process').exec;
   grunt.registerTask('artifacts', 'temporarily version output libs for release tags', function(type) {
      var opts = this.options({
         files: [],
         pushTo: 'origin',
         commitAdd:"chore: add artifacts for release",
         commitRemove:"chore: remove release artifacts"
      });
      var done = this.async();
      console.log(opts.files);
      if(type === 'add') {
         exec('git add -f ' + opts.files.join(' '), function (err, stdout, stderr) {
            if (err) {
               grunt.fatal('Cannot add the release artifacts:\n  ' + stderr);
            }
            var commitMessage = opts.commitAdd;
            exec('git commit ' + opts.files.join(' ') + ' -m "' + commitMessage + '"', function (err, stdout, stderr) {
               if (err) {
                  grunt.fatal('Cannot create the commit:\n  ' + stderr);
               }
               grunt.log.ok('Committed as "' + commitMessage + '"');
               done();
            });
         });
      }
      else if(type === 'remove'){
         exec('git rm -f ' + opts.files.join(' ') + ' --cached', function(err, stdout, stderr) {
            if (err) {
               grunt.fatal('Cannot remove the release artifacts:\n  ' + stderr);
            }
            var commitMessage = opts.commitRemove;
            exec('git commit -m "' + commitMessage + '"', function(err, stdout, stderr) {
               if (err) {
                  grunt.fatal('Cannot create the commit:\n  ' + stderr);
               }
               grunt.log.ok('Committed as "' + commitMessage + '"');
               exec('git push ' + opts.pushTo, function(err, stdout, stderr) {
                  if (err) {
                     grunt.fatal('Can not push to ' + opts.pushTo + ':\n  ' + stderr);
                  }
                  grunt.log.ok('Pushed to ' + opts.pushTo);
                  done();
               });
            });
         });
      }
      else {
         grunt.fatal('Invalid type to artifacts');
      }
   });

};
