///<reference path="../types/node/node.d.ts"/>
///<reference path="../types/express/express.d.ts"/>

"use strict";
import express = require('express');
var fs = require('graceful-fs');
var _:any = require('underscore');
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

server.get('/', function(req,res){
   res.render('../games/rpg/index.html',{});
});

server.get('/dorkapon', function(req,res){
   res.render('../games/dorkapon/index.html',{});
});

server.use(express.static(path.resolve(__dirname + "/../web")));
server.use('/web',express.static(path.resolve(__dirname + "/../web")));
server.use('/lib',express.static(path.resolve(__dirname + "/../lib")));
server.use('/data', express.static(path.resolve(__dirname + "/../data")));
server.use('/source', express.static(path.resolve(__dirname + "/../source")));
server.use('/games', express.static(path.resolve(__dirname + "/../games")));
server.use('/build', express.static(path.resolve(__dirname + "/../build")));
server.use('/bower', express.static(path.resolve(__dirname + "/../bower_components")));

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
