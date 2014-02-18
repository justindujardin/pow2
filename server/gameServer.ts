///<reference path="../types/node/node.d.ts"/>
///<reference path="../types/express/express.d.ts"/>
///<reference path="../types/underscore/underscore.d.ts"/>
"use strict";
import express = require('express');
var fs = require('graceful-fs');
import _ = require('underscore');
var path = require('path');
var grunt:any = require("grunt");
var server = express();
var serverPort = process.env.PORT || 5215;

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
   require("../Gruntfile")(grunt);
   var ts = grunt.config.get('typescript');
   var names = ['pow2'];
   var src = grunt.config.get('typescript.options.base_path');
   var scripts:string[] = [];
   _.each(names, (name:string) => {
      var app = grunt.config.get('typescript.' + name);
      if(!app){
         console.log("Failed to include specified app: " + name);
         return;
      }
      var sourceFiles:any = grunt.file.expand(app.src);
      sourceFiles = _.map(sourceFiles,function(f:string){
         return f.replace(src + '/',app.dest + '/').replace('.ts','.js');
      });
      scripts = scripts.concat(sourceFiles)
   });
   return scripts;
}

server.get('/', function(req,res){
   res.render('../source/ui/index.html',{
      scripts:getPageScripts()
   });
});

server.use(express.static(path.resolve(__dirname + "/../web")));
server.use('/data', express.static(path.resolve(__dirname + "/../data")));
server.use('/source', express.static(path.resolve(__dirname + "/../source")));
server.use('/build', express.static(path.resolve(__dirname + "/../build")));
server.use('/fonts', express.static(path.resolve(__dirname + "/../data/fonts")));

// Path for Angular UI templates
server.use('/templates', express.static(path.resolve(__dirname + "/../source/ui/templates")));

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
console.log('POW2 server on http://localhost:' + serverPort);
