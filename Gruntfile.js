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
         }
      }
   });

   grunt.loadNpmTasks('grunt-contrib-watch');
   grunt.loadNpmTasks('grunt-contrib-coffee');
   grunt.loadNpmTasks('grunt-contrib-concat');
   grunt.loadNpmTasks('grunt-notify');

   grunt.registerTask('default', ['concat', 'coffee','notify']);

};