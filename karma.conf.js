/*globals module,process,require */
module.exports = function(config) {
   "use strict";

   var coverageDebug = false;

   config.set({
      basePath: '',
      frameworks: ['jasmine'],
      files: [
         "web/bower/jquery/jquery.min.js",
         "web/bower/underscore/underscore-min.js",
         "web/bower/backbone/backbone.js",
         "web/bower/angular/angular.min.js",
         "web/bower/angular-animate/angular-animate.min.js",
         "web/bower/angular-sanitize/angular-sanitize.min.js",
         "web/bower/angular-touch/angular-touch.min.js",
         "web/bower/astar/astar.js",
         "web/bower/tabletop/src/tabletop.js",
         "web/bower/pow-core/lib/pow-core.js",
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