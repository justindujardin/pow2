"use strict";
var express = require('express');
var fs = require('fs');
var _ = require('underscore');
var path = require('path');
var graph = require('fbgraph');

var server = express();
var serverPort = process.env.PORT || 5215;

if(!process.env.FB_APPID || !process.env.FB_SECRET){
   console.log("No Facebook environment variables, attempting to load from '../.env.json'");
   var config = require('../.env.json');
}
var conf = {
   appId: process.env.FB_APPID || require("../.env.json").appId,
   appSecret: process.env.FB_SECRET || require("../.env.json").appSecret,
   scope: 'email',
   redirect_uri: 'http://localhost:5215/auth/facebook'
};

server.staticPath = function (url, path) {
   if (url) {
      server.use(url, express.static(path));
   } else {
      server.use(express.static(path));
   }
};

server.use(express.logger());
server.use(express.bodyParser());
server.use(express.cookieParser());
// set this to a secret value to encrypt session cookies
server.use(express.session({ secret: process.env.SESSION_SECRET || require("../.env.json").sessionSecret }));
server.use(express.compress());
server.use(express.static(path.resolve(__dirname + "/../web")));
server.use('/data', express.static(path.resolve(__dirname + "/../data")));
server.use('/images', express.static(path.resolve(__dirname + "/../images")));

// assign the underscore engine to .html files
server.engine('.html', require('ejs').__express);
// set .html as the default extension
server.set('view engine', 'html');

// log errors
server.use(function errorHandler(err, req, res, next) {
   try {
      console.error("Node error:");
      console.error(err.stack);
      console.error("Request:");
      console.error(JSON.stringify(_.pick(req, "httpVersion", "method", "originalUrl", "body", "params", "headers"), undefined, "  "));
      console.error("Response:");
      console.error(JSON.stringify(_.pick(res, "statusCode", "body", "output", "_headers"), undefined, "  "));
   }
   catch (exception) {
      console.log(exception);
   }
   next();
});

server.configure("development", function () {
   server.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
   }));
});

server.configure("production", function () {
   server.use(express.errorHandler());
});

server.get('/', function (req, res) {
   fs.readFile(path.join(__dirname, '../web/index.html'), 'utf8', function (err, text) {
      res.send(text);
   });
});


server.get('/auth/facebook', function (req, res) {
// we don't have a code yet
// so we'll redirect to the oauth dialog
   if (!req.query.code) {
      var authUrl = graph.getOauthUrl({
         "appId": conf.appId,
         "redirect_uri": conf.redirect_uri,
         "scope": conf.scope
      });

      if (!req.query.error) { //checks whether a user denied the app facebook login/permissions
         res.redirect(authUrl);
      } else {  //req.query.error == 'access_denied'
         res.send('access denied');
      }
      return;
   }

   // code is set
   // we'll send that and get the access token

   graph.authorize({
      "appId": conf.appId,
      "redirect_uri": conf.redirect_uri,
      "appSecret": conf.appSecret,
      "code": req.query.code
   }, function (err, result) {
      if(!err){
         req.session.fbToken = result.access_token;
         res.redirect('/256');
      }
   });
});


server.get('/256', function (req, res) {
   if(req.session && req.session.fbToken){
      graph.setAccessToken(req.session.fbToken);
      graph.get('/' + conf.appId,function(err,app){
         graph.get('/me',function(err,user){
            res.render('../web/twofiftysix.html', {
               app:app,
               user:user
            });
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

server.get("/auth/logout",function(req,res){
   req.session.destroy();
   res.redirect("/256");
});


var listen = server.listen(serverPort);
listen.on('error', function (e) {
   console.error('Received error ' + e.code + ' on syscall ' + e.syscall);
   process.exit(1);
});

console.log('E.B.U.R.P. server on http://localhost:' + serverPort);
