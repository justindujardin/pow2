"use strict";
var express = require('express');
var fs = require('graceful-fs');
var _ = require('underscore');
var path = require('path');
var Q = require('q');

var carrot = new require("./Carrot");
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

var mixpanelToken = process.env.MIXPANEL_TOKEN || require('../.env.json').MIXPANEL_TOKEN;

server.use(express.bodyParser());
server.use(express.cookieParser());
server.use(express.compress());
// Encrypt session cookies
server.use(express.session({
   secret: process.env.SESSION_SECRET || require("../.env.json").SESSION_SECRET
}));

// 256px challenge game
server.get('/', function (req, res) {
   var data = {
      user:null,
      mixpanelToken:mixpanelToken
   };
   if(req.session && req.session.fbToken){
      fb.graph.setAccessToken(req.session.fbToken);
      fb.graph.get('/me',function(err,user){
         data.user = fb.parseUser(req,user);
         res.render('../web/index.html',data);
      });
   }
   else {
      res.render('../web/index.html',data);
   }
});


// 8 hour challenge code
server.get('/8', function (req, res) {
   var data = {
      user:null,
      title:"8hr Code Challenge",
      code:fs.readFileSync(path.join(__dirname, '../src/core/rect.coffee'), 'utf8'),
      mixpanelToken:mixpanelToken
   };

   if(req.session && req.session.fbToken){
      fb.graph.setAccessToken(req.session.fbToken);
      fb.graph.get('/me',function(err,user){
         data.user = fb.parseUser(req,user);
         res.render('../web/code.html',data);
      });
   }
   else {
      res.render('../web/code.html',data);
   }
});

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


// Share a sprite for others to see.
server.post("/share",function(req, res){
   function _nope(){
      res.json({authenticated:false});
      res.end();
   }
   var imageData = req.body.data;
   if(!imageData){
      return _nope();
   }
   if(!req.session || !req.session.fbToken || !req.session.userId){
      return _nope();
   }
//   var c = new carrot.Carrot(fb.config.FB_APPID, req.session.fbToken, fb.config.FB_SECRET, req.headers.host);
//   c.postAction("create", "first_sprite");
   var url = require('./crc32').crc32(req.session.userId + imageData);
   db.storeImage(req.session.userId,url,imageData).then(function(){
      var fullUrl = "http://" + req.headers.host + "/256/" + url;
      res.json({url:fullUrl});
   });
});

// Share a sprite for others to see.
server.post("/c/quest/:id",function(req, res){
   function _nope(){
      res.json({authenticated:false},400);
      res.end();
   }
   if(!req.session || !req.session.fbToken || !req.session.userId){
      return _nope();
   }
   var cSecret = process.env.CARROT_SECRET || require("../.env.json").CARROT_SECRET;
   var cAppId = process.env.CARROT_APPID || require("../.env.json").CARROT_APPID;
   var c = new carrot.Carrot(cAppId, req.session.userId, cSecret);
   c.validateUser(req.session.fbToken,function(result){
      c.postAction("complete", req.params.id,null,null,function(result){
         res.json({success:true});
         res.end();
      });

   });
});


function twoFiftySixHandler(req,res){
   function noOp(){
      var deferred = Q.defer();
      _.defer(function(){
         deferred.resolve()
      });
      return deferred.promise;
   }
   var data = {
      user:null,
      shared:null,
      mixpanelToken:mixpanelToken
   };
   function render(){
      if(req.session && req.session.fbToken){
         fb.graph.setAccessToken(req.session.fbToken);
         fb.graph.get('/me',function(err,user){
            data.user = fb.parseUser(req,user);
            res.render('../web/twofiftysix.html',data);
         });
      }
      else {
         res.render('../web/twofiftysix.html',data);
      }
   }
   var getImage = req.params.id ? db.getImage(req.params.id) : noOp();
   getImage.then(function(image){
      data.shared = image;
      render();
   },function(){
      render();
   });
}
server.get('/256', twoFiftySixHandler);
server.get('/256/:id', twoFiftySixHandler);

var listen = server.listen(serverPort);
listen.on('error', function (e) {
   console.error('Received error ' + e.code + ' on syscall ' + e.syscall);
   process.exit(1);
});

console.log('E.B.U.R.P. server on http://localhost:' + serverPort);
