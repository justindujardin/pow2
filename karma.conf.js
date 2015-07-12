/*globals module,process,require */
module.exports = function(config) {
   "use strict";

   var coverageDebug = false;

   config.set({
      basePath: '',
      frameworks: ['jasmine'],
      files: [
         "bower_components/jquery/jquery.min.js",
         "bower_components/underscore/underscore-min.js",
         "bower_components/backbone/backbone.js",
         "bower_components/angular/angular.min.js",
         "bower_components/angular-animate/angular-animate.min.js",
         "bower_components/angular-sanitize/angular-sanitize.min.js",
         "bower_components/angular-touch/angular-touch.min.js",
         "bower_components/astar/astar.js",
         "bower_components/tabletop/src/tabletop.js",
         "bower_components/pow-core/lib/pow-core.js",
         "lib/pow2.js",
         "lib/pow2.sprites.js",
         "lib/test/*.js",
         {pattern: 'test/fixtures/*.*', watched: true, included: false, served: true}
      ],
      reporters: ['dots','coverage'],
      port: 9876,
      autoWatch: true,
      background:true,
      // - Chrome, ChromeCanary, Firefox, Opera, Safari (only Mac), PhantomJS, IE (only Windows)
      browsers: process.env.TRAVIS ? ['Firefox'] : ['Chrome'],
      singleRun: false,
      reportSlowerThan: 500,
      plugins: [
         'karma-firefox-launcher',
         'karma-chrome-launcher',
         'karma-jasmine',
         'karma-coverage'
      ],
      preprocessors: (process.env.TRAVIS || coverageDebug) ? { "lib/*.js": "coverage" } : {},
      coverageReporter: {
         type: "lcov",
         dir: ".coverage/"
      }
   });
};