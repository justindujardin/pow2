"use strict";
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var Q = require('q');

var _ready = false;
var _error = null;
var _db = null;
var db = module.exports = {
   SPRITES: "spriteSubmissions",
   USERS: "users",
   routes:function(server){
      MongoClient.connect(process.env.MONGOHQ_URL || require("../.env.json").MONGOHQ_URL, {}, function(err, db) {
         _error = err;
         _db = db;
      });
   },

   instance: function(){
      if(_error){
         throw new Error("Failed to connect to DB");
      }
      if(!_db){
         throw new Error("DB not connected.  Connection is established when routes(expressServer) is called.");
      }
      return _db;
   },

   users: function(){
      var inst = db.instance();
      return inst.collection(db.USERS);
   },

   sprites: function(){
      var inst = db.instance();
      return inst.collection(db.SPRITES);
   },

   findUser: function(facebookId){
      var deferred = Q.defer();
      var collection = db.users();
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

   createUser: function(data){
      if(!data || typeof data.facebookId === 'undefined'){
         throw new Error("Invalid user data");
      }
      var deferred = Q.defer();
      var collection = db.users();
      collection.insert(data,function(err,result){
         if(err){
            return deferred.reject(err);
         }
         return deferred.resolve(result[0]);
      });
      return deferred.promise;
   },


   storeImage: function(userId,url,imageData){
      var deferred = Q.defer();
      var collection = db.sprites();
      collection.insert({
         user: userId,
         url: url,
         data: imageData
      },function(err,result){
         if(err){
            return deferred.reject(err);
         }
         return deferred.resolve(result[0]);
      });
      return deferred.promise;
   },


   getImage: function(url){
      var deferred = Q.defer();
      var collection = db.sprites();
      collection.find({url:parseInt(url,10)})
         .each(function(err,result){
            if(err || !result){
               return deferred.reject(err);
            }
            return deferred.resolve(result.data);
         });
      return deferred.promise;
   },

   findImage: function(url){
      var deferred = Q.defer();
      var collection = db.sprites();
      collection.find({url:parseInt(url,10)})
         .each(function(err,result){
            if(err){
               return deferred.reject(err);
            }
            return deferred.resolve(result);
         });
      return deferred.promise;
   }
};
