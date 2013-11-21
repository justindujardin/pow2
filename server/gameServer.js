"use strict";
var express = require('express');
var fs = require('graceful-fs');
var _ = require('underscore');
var path = require('path');


var fb = require('./facebook');
var db = require('./database');

var server = express();
var serverPort = process.env.PORT || 5215;

server.staticPath = function (url, path) {
   if (url) {
      server.use(url, express.static(path));
   } else {
      server.use(express.static(path));
   }
};

server.use(express.bodyParser());
server.use(express.cookieParser());
server.use(express.compress());
server.use(express.static(path.resolve(__dirname + "/../web")));
server.use('/data', express.static(path.resolve(__dirname + "/../data")));
server.use('/images', express.static(path.resolve(__dirname + "/../images")));

fb.routes(server);
db.routes(server);

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

// Routes
server.get('/', function (req, res) {
   fs.readFile(path.join(__dirname, '../web/index.html'), 'utf8', function (err, text) {
      res.send(text);
   });
});
server.get('/256', function (req, res) {
   if(req.session && req.session.fbToken){
      fb.graph.setAccessToken(req.session.fbToken);
      fb.graph.get('/me',function(err,user){
         res.render('../web/twofiftysix.html', {
            user:user
         });
      });
   }
   else {
      res.render('../web/twofiftysix.html',{
         user:null,
         app:null
      });
   }
});

var listen = server.listen(serverPort);
listen.on('error', function (e) {
   console.error('Received error ' + e.code + ' on syscall ' + e.syscall);
   process.exit(1);
});

console.log('E.B.U.R.P. server on http://localhost:' + serverPort);
