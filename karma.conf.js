/*globals module,process,require */
module.exports = function(config) {
   "use strict";

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
         "lib/pow2.game.js",
         "lib/pow2.data.js",
         "lib/pow2.sprites.js",
         "lib/pow2.ui.js",
         "lib/test/*.js"
      ],
      reporters: ['dots'],
      port: 9876,
      autoWatch: true,
      background:true,
      // - Chrome, ChromeCanary, Firefox, Opera, Safari (only Mac), PhantomJS, IE (only Windows)
      browsers: process.env.TRAVIS ? ['Firefox'] : ['Firefox'],
      singleRun: false,
      reportSlowerThan: 500,
      plugins: [
         'karma-firefox-launcher',
         'karma-chrome-launcher',
         'karma-jasmine'
      ]
   });
};