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
      less: {
        options: {
          message: 'CSS styles built.'
        }
      },
      server: {
        options: {
          message: 'Server restarted.'
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
      },
      server: {
        src: [
          "server/*.d.ts",
          "server/*.js",
          "server/*.js.map",
          "tasks/*.d.ts",
          "tasks/*.js",
          "tasks/*.js.map"
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
      tasks: {
        src: [
          "tasks/*.ts"
        ]
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
      ui: {
        src: [
          "source/ui/*.ts",
          "source/ui/**/*.ts"
        ],
        dest: 'lib/<%= pkg.name %>.ui.js'
      },
      dorkapon: {
        src: [
          "games/dorkapon/index.ts",
          "games/dorkapon/**/*.ts"
        ],
        dest: 'lib/<%= pkg.name %>.dorkapon.js'
      },
      rpg: {
        src: [
          "games/rpg/index.ts",
          "games/rpg/**/*.ts"
        ],
        dest: 'lib/<%= pkg.name %>.rpg.js'
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
          'lib/<%= pkg.name %>.min.dorkapon.js': ['lib/<%= pkg.name %>.dorkapon.js'],
          'lib/<%= pkg.name %>.min.rpg.js': ['lib/<%= pkg.name %>.rpg.js'],
          'lib/<%= pkg.name %>.min.ui.js': ['lib/<%= pkg.name %>.ui.js'],
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

    html2js: {
      options: {
        rename: function (moduleName) {
          return moduleName.replace('../','');
        }
      },
      ui: {
        src: [
          "source/ui/**/*.html"
        ],
        dest: 'lib/<%= pkg.name %>.ui.templates.js'
      },
      dorkapon: {
        src: [
          "games/dorkapon/**/*.html"
        ],
        dest: 'lib/<%= pkg.name %>.dorkapon.templates.js'
      },
      rpg: {
        src: [
          "games/rpg/**/*.html"
        ],
        dest: 'lib/<%= pkg.name %>.rpg.templates.js'
      }
    },


    /**
     * Compile game LESS styles to CSS
     */
    less: {
      options: {
        paths: [
          "bower_components/bootstrap/less/"
        ]
      },
      game: {
        files: {
          'web/css/rpg.css': 'games/rpg/index.less',
          'web/css/pow2.ui.css': 'source/ui/index.less',
          'web/css/dorkapon.css': 'games/dorkapon/index.less'
        }
      }
    },

    /**
     * Trigger a new build when files change
     */
    watch: {
      options: {
        spawn: true
      },
      // Game Source outputs
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
      dorkapon: {
        files: [
          '<%= typescript.dorkapon.src %>'
        ],
        tasks: ['typescript:dorkapon', 'html2js:dorkapon', 'notify:code']
      },
      ui: {
        files: [
          '<%= typescript.ui.src %>'
        ],
        tasks: ['typescript:ui', 'html2js:ui', 'notify:code']
      },
      rpg: {
        files: [
          '<%= typescript.rpg.src %>'
        ],
        tasks: ['typescript:rpg', 'html2js:rpg', 'notify:code']
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
          'games/**/*.less',
          'source/**/*.less'
        ],
        tasks: ['less', 'notify:less']
      },
      expressts: {
        files: ['server/*.ts'],
        tasks: ['typescript:server', 'express', 'notify:server'],
        options: {
          atBegin: true,
          nospawn: true
        }
      },
      express: {
        files: [
          'source/**/*.html',
          'games/**/*.html'
        ],
        tasks: ['express', 'notify:server'],
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
      options: {
        files: [
          'lib/*.*',
          'web/images/*.*',
          'web/css/*.*'
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
        coverage_dir: '.coverage/',
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
      },
      rpg: {
        entities: ['games/rpg/**/*.powEntities'],
        files: [
          {src: 'games/rpg/**/*.ts', dest: 'web/docs/rpg'}
        ]
      }
    }

  });


  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-typescript');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-html2js');
  // Support system notifications in non-production environments
  if (process && process.env && process.env.NODE_ENV === 'production') {
    grunt.registerTask('default', ['typescript', 'less', 'sprites', 'html2js']);
    grunt.registerTask('heroku:production', ['default', 'uglify']);
  }
  else {
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['typescript', 'less', 'sprites', 'html2js']);
    grunt.registerTask('develop', ['default', 'watch']);
  }

  // Test Coverage
  // --------------------------------------------------
  grunt.loadNpmTasks('grunt-karma-coveralls');


  grunt.loadTasks('tasks');

};
