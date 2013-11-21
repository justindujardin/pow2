"use strict";
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var Q = require('q');

var _ready = false;
var _db = null;
var db = module.exports = {
   routes:function(server){
      MongoClient.connect(process.env.MONGOHQ_URL || require("../.env.json").MONGOHQ_URL, {}, function(err, db) {
         _db = db;
      });
   },

   findUser: function(facebookId){
      var deferred = Q.defer();
      if(!_db){
         throw new Error("No database connection");
      }
      var collection = _db.collection('users');
      collection.find({
         facebookId:facebookId
      }).each(function(err,result){
            if(err){
               return deferred.reject(err);
            }
            return deferred.resolve(result);
         });
      return deferred.promise;
   },

   getUser: function(facebookId){
      var deferred = Q.defer();
      if(!_db){
         throw new Error("No database connection");
      }
      var collection = _db.collection('users');
      collection.find({
         facebookId:facebookId
      }).each(function(err,result){
            if(err){
               return deferred.reject(err);
            }
            if(result){
               return deferred.resolve(result);

            }
            return db.createUser(facebookId).then(function(user){
               deferred.resolve(user);
            });
         });
      return deferred.promise;
   },

   createUser: function(data){
      var deferred = Q.defer();
      if(!_db){
         throw new Error("No database connection");
      }
      if(!data || typeof data.facebookId === 'undefined'){
         throw new Error("Invalid user data");
      }
      var collection = _db.collection('users');
      collection.insert(data,function(err,result){
         if(err){
            return deferred.reject(err);
         }
         return deferred.resolve(result[0]);
      });
      return deferred.promise;
   }


};
