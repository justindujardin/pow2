"use strict";
var express = require('express');
var fs = require('graceful-fs');
var _ = require('underscore');
var path = require('path');
var Q = require('q');
var fb = require('./facebook');
var grunt = require("grunt");
var server = express();
var serverPort = process.env.PORT || 5215;
function getProp(propName) {
    return process.env[propName] || require('../.env.json')[propName];
}
;
server.use(express.bodyParser());
server.use(express.cookieParser());
server.use(express.compress());

server.use(express.session({
    secret: process.env.SESSION_SECRET || require("../.env.json").SESSION_SECRET
}));

function getPageScripts() {
    require("../Gruntfile")(grunt);
    var app = grunt.config.get('typescript.core');
    var src = app.options.base_path;
    var dst = app.dest;
    var sourceFiles = grunt.file.expand(app.src);
    sourceFiles = _.map(sourceFiles, function (f) {
        return f.replace(src + '/', dst + '/').replace('.ts', '.js');
    });
    return sourceFiles;
}

server.get('/', function (req, res) {
    res.render('../web/index.html', {
        scripts: getPageScripts()
    });
});

server.all('/fbcanvas/', function (req, res) {
    var props = {
        fbAppId: getProp("FB_APPID"),
        mixpanelToken: getProp("MIXPANEL_POW2")
    };
    var data = _.extend({}, props, {
        pageContext: JSON.stringify(props)
    });
    var session = req.session;
    if (session && session.fbToken) {
        fb.graph.setAccessToken(session.fbToken);
        fb.graph.get('/me', function (err, user) {
            data.user = fb.parseUser(req, user);
            res.render('../web/facebook.html', data);
        });
    } else {
        res.render('../web/facebook.html', data);
    }
});

server.use(express.static(path.resolve(__dirname + "/../web")));
server.use('/data', express.static(path.resolve(__dirname + "/../data")));
server.use('/source', express.static(path.resolve(__dirname + "/../source")));
server.use('/build', express.static(path.resolve(__dirname + "/../build")));
server.use('/game', express.static(path.resolve(__dirname + "/../game")));
server.use('/images', express.static(path.resolve(__dirname + "/../images")));
fb.routes(server);

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
//# sourceMappingURL=gameServer.js.map
