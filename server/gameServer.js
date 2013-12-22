"use strict";
var express = require('express');
var fs = require('graceful-fs');
var _ = require('underscore');
var path = require('path');
var Q = require('q');
var fb = require('./facebook');

var server = express();
var serverPort = process.env.PORT || 5215;
server.staticPath = function (url, path) {
   if (url) {
      server.use(url, express.static(path));
   } else {
      server.use(express.static(path));
   }
};
server.getProp = function(propName){
  return process.env[propName] || require('../.env.json')[propName];
};
server.use(express.bodyParser());
server.use(express.cookieParser());
server.use(express.compress());
// Encrypt session cookies
server.use(express.session({
   secret: process.env.SESSION_SECRET || require("../.env.json").SESSION_SECRET
}));

/**
 * Enumerate js files produced by grunt that a page should include.
 */
function getPageScripts(){
   var grunt = require("grunt");
   require("../Gruntfile")(grunt);
   var _ = require('underscore');
   var sourceFiles = grunt.file.expand([
      "web/game/core/api.js",
      "web/game/core/**/*.js",
      "web/game/scene/*.js",
      "web/game/scene/components/*.js",
      "web/game/tile/*.js",
      "web/game/tile/components/*.js",
      "web/game/tile/objects/*.js",
      "web/game/tile/features/*.js",
      "web/game/tile/render/*.js",
      "web/game/**/*.js",
      "web/game/core/resources/*.js"
   ]);
   sourceFiles = _.map(sourceFiles,function(f){
      return f.replace('web/','');
   });
   return sourceFiles;
}

server.get('/', function(req,res){
   res.render('../web/index.html',{
      scripts:getPageScripts()
   });
});


server.all('/fbcanvas/', function (req, res) {
   var props = {
      fbAppId:server.getProp("FB_APPID"),
      mixpanelToken:server.getProp("MIXPANEL_POW2")
   };
   var data = _.extend({},props,{
      pageContext: JSON.stringify(props)
   });
   if(req.session && req.session.fbToken){
      fb.graph.setAccessToken(req.session.fbToken);
      fb.graph.get('/me',function(err,user){
         data.user = fb.parseUser(req,user);
         res.render('../web/facebook.html',data);
      });
   }
   else {
      res.render('../web/facebook.html',data);
   }
});



server.use(express.static(path.resolve(__dirname + "/../web")));
server.use('/data', express.static(path.resolve(__dirname + "/../data")));
server.use('/src', express.static(path.resolve(__dirname + "/../src")));
server.use('/game', express.static(path.resolve(__dirname + "/../game")));
server.use('/images', express.static(path.resolve(__dirname + "/../images")));
fb.routes(server);

// Use EJS templating with Express, and assign .html as the default extension.
server.engine('.html', require('ejs').__express);
server.set('view engine', 'html');

server.configure("development", function () {
   server.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
   }));
});
server.configure("production", function () {
   server.use(express.errorHandler());
});
var listen = server.listen(serverPort);
listen.on('error', function (e) {
   console.error('Received error ' + e.code + ' on syscall ' + e.syscall);
   process.exit(1);
});
console.log('POW2 server on http://localhost:' + serverPort);
