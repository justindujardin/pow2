"use strict";
var express = require('express');
var graph = require('fbgraph');

module.exports = {
    graph: graph,
    config: {
        FB_APPID: process.env.FB_APPID || require("../.env.json").FB_APPID,
        FB_SECRET: process.env.FB_SECRET || require("../.env.json").FB_SECRET,
        scope: 'email'
    },
    parseUser: function (req, user) {
        if (!user || !req) {
            return {};
        }
        var result = {
            email: user.email,
            gender: user.gender,
            first: user.first_name,
            last: user.last_name
        };
        if (user.location && user.location.name) {
            result.location = user.location.name;
        }
        if (req.session && req.session.userId) {
            result.id = req.session.userId;
        }
        return result;
    },
    resumeSession: function (req) {
        var deferred = Q.defer();
        return deferred.promise;
    },
    routes: function (server) {
        if (!process.env.FB_APPID || !process.env.FB_SECRET) {
            console.log("No Facebook environment variables, attempting to load from '../.env.json'");
            require('../.env.json');
        }
        var conf = module.exports.config;

        server.get('/auth/facebook', function (req, res) {
            var redirectTo = req.query.r || req.session.authCallback || '/';
            var redirect = "http://" + req.headers.host + "/auth/facebook";

            if (!req.query.code) {
                req.session.authCallback = redirectTo;
                var authUrl = graph.getOauthUrl({
                    "client_id": conf.FB_APPID,
                    "redirect_uri": redirect,
                    "scope": conf.scope
                });

                if (!req.query.error) {
                    res.redirect(authUrl);
                } else {
                    res.send('access denied');
                }
                return;
            }

            graph.authorize({
                "client_id": conf.FB_APPID,
                "redirect_uri": redirect,
                "client_secret": conf.FB_SECRET,
                "code": req.query.code
            }, function (err, result) {
                if (!err) {
                    req.session.fbToken = result.access_token;
                    graph.get('/me', function (err, fbUser) {
                        if (err) {
                            res.send("failed to query FB user with access token");
                        } else {
                            res.redirect(redirectTo);
                        }
                    });
                }
            });
        });

        server.get("/auth/logout", function (req, res) {
            var redirectTo = req.query.r || '/';
            req.session.destroy();
            res.redirect(redirectTo);
        });
    }
};
//# sourceMappingURL=facebook.js.map
