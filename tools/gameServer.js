"use strict";
var express = require('express');
var fs = require('fs');
var _ = require('underscore');
var path = require('path');

var server = express();
var serverPort = process.env.PORT || 5215;



server.staticPath = function(url,path) {
   if (url) {
      server.use(url, express.static(path));
   } else {
      server.use(express.static(path));
   }
};

//server.staticPath(null,);
server.use(express.static(path.resolve(__dirname + "/../")));


// log errors
server.use(function errorHandler(err, req, res, next){
   try {
      console.error("Node error:");
      console.error(err.stack);
      console.error("Request:");
      console.error(JSON.stringify(_.pick(req, "httpVersion", "method", "originalUrl", "body","params", "headers"), undefined, "  "));
      console.error("Response:");
      console.error(JSON.stringify(_.pick(res, "statusCode", "body", "output", "_headers"), undefined, "  "));
   }
   catch (exception) {
      console.log(exception);
   }
   next();
});

server.configure("development", function(){
   server.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
   }));
});

server.configure("production", function(){
   server.use(express.errorHandler());
});

server.get('/', function(req, res) {
    fs.readFile(path.join(__dirname,'../index.html'), 'utf8', function(err, text){
        res.send(text);
    });
});


var listen = server.listen(serverPort);
listen.on('error', function (e) {
   console.error('Received error ' + e.code + ' on syscall ' + e.syscall);
   process.exit(1);
});

console.log('E.B.U.R.P. server on http://localhost:' + serverPort);
