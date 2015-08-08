module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    /**
     * System notifications about build step completion.
     */
    notify: {
      options: {
        title: 'Pow2'
      },
      sprites: {
        options: {
          message: 'Sprite Sheets built.'
        }
      },
      code: {
        options: {
          message: 'Code build complete.'
        }
      }
    },

    clean: {
      pow2: {
        src: ["lib/"]
      }
    },

    /**
     * Compile TypeScript library
     */
    typescript: {
      options: {
        module: 'amd', //or commonjs
        target: 'es5', //or es3
        rootPath: 'source',
        sourceMap: true,
        declaration: true
      },
      tasks: {
        src: [
          "tasks/*.ts"
        ]
      },
      pow2: {
        src: [
          "source/core/api.ts",
          "source/core/*.ts",
          "source/scene/*.ts",
          "source/scene/components/*.ts",
          "source/interfaces/*.ts",
          "source/tile/*.ts",
          "source/tile/components/*.ts",
          "source/tile/objects/*.ts",
          "source/tile/resources/*.ts",
          "source/tile/features/*.ts",
          "source/tile/render/*.ts",
          "source/game/*.ts",
          "source/game/components/*.ts",
          "source/game/resources/*.ts"
        ],
        dest: 'lib/<%= pkg.name %>.js'
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
        sourceMap: true,
        banner: '\n/*!\n  <%= pkg.name %> - v<%= pkg.version %>\n  built: <%= grunt.template.today("yyyy-mm-dd") %>\n */\n'
      },
      game: {
        files: {
          'lib/<%= pkg.name %>.min.js': ['lib/<%= pkg.name %>.js'],
          'lib/<%= pkg.name %>.min.sprites.js': ['lib/<%= pkg.name %>.sprites.js']
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
          {src: 'data/textures/creatures/*.png', dest: 'lib/images/creatures'},
          {src: 'data/textures/vehicles/*.png', dest: 'lib/images/vehicles'},
          {src: 'data/textures/environment/*.png', dest: 'lib/images/environment'},
          {src: 'data/textures/characters/punch/*.png', dest: 'lib/images/punch'},
          {src: 'data/textures/characters/magic/*.png', dest: 'lib/images/magic'},
          {src: 'data/textures/characters/*.png', dest: 'lib/images/characters'},
          {src: 'data/textures/animation/*.png', dest: 'lib/images/animation'},
          {src: 'data/textures/equipment/*.png', dest: 'lib/images/equipment'},
          {src: 'data/textures/items/*.png', dest: 'lib/images/items'}
        ]
      }
    },

    /**
     * Trigger a new build when files change
     */
    watch: {
      // Pow2 Game Core
      //--------------------------------------------------------------------
      tasks: {
        files: [
          '<%= typescript.tasks.src %>'
        ],
        tasks: ['typescript:tasks', 'notify:code']
      },
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

      // Game Metadata
      //--------------------------------------------------------------------
      sprites: {
        files: [
          'data/textures/**/*.png',
          'data/textures/**/*.json'
        ],
        tasks: ['sprites', 'notify:sprites']
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
      options: {
        files: [
          'lib/*.*',
          'lib/images/*.*'
        ]
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
        coverageDir: '.coverage/',
        debug: process.env.TRAVIS ? false : true,
        dryRun: process.env.TRAVIS ? false : true,
        force: true,
        recursive: true
      }
    },

    // Documentation
    copy: {},

    docs: {
      dorkapon: {
        entities: ['games/dorkapon/**/*.powEntities'],
        files: [
          {src: 'games/dorkapon/services/*.ts', dest: 'web/docs/dorkapon'}
        ]
      },
      api: {
        files: [
          {src: 'source/**/*.ts', dest: 'web/docs/api'}
        ]
      }
    }

  });


  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-typescript');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['typescript', 'sprites']);
  grunt.registerTask('develop', ['default', 'watch']);

  // Test Coverage
  // --------------------------------------------------
  grunt.loadNpmTasks('grunt-karma-coveralls');


  grunt.loadTasks('tasks');

};
