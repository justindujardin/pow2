// Carrot -- Copyright (C) 2012 Carrot Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
(function() {
  var Carrot;

  Carrot = (function() {
    Carrot.Status = {
      NotAuthorized: 'Carrot user has not authorized application.',
      NotCreated: 'Carrot user does not exist.',
      Unknown: 'Carrot user status unknown.',
      ReadOnly: 'Carrot user has not granted \'publish_actions\' permission.',
      Authorized: 'Carrot user authorized.',
      Ok: 'Operation successful.',
      Error: 'Operation unsuccessful.'
    };

    Carrot.trackLoad = function(appId, signedRequest) {
      var img;
      img = new Image();
      return img.src = 'https://gocarrot.com/tracking?app_id=' + appId + '&signed_request=' + signedRequest;
    };

    function Carrot(appId, udid, appSecret, hostname) {
      var err;
      try {
        this.request = require('request');
      } catch (_error) {
        err = _error;
        this.request = null;
      }
      this.appId = appId;
      this.udid = udid;
      this.appSecret = appSecret;
      this.status = Carrot.Status.Unknown;
      this.hostname = hostname || "gocarrot.com";
      this.scheme = ((hostname != null ? hostname.match(/^localhost/) : void 0) ? "http" : void 0) || "https";
    }

    Carrot.prototype.ajaxGet = function(url, callback) {
      var _this = this;
      if (this.request) {
        this.request(url, function(error, response, body) {
          if (callback) {
            callback(response.statusCode);
          }
          return response.end;
        });
      } else {
        $.ajax({
          async: true,
          url: url,
          complete: function(jqXHR, textStatus) {
            if (callback) {
              return callback(jqXHR);
            }
          }
        });
      }
      return true;
    };

    Carrot.prototype.ajaxPost = function(url, data, callback) {
      var _this = this;
      if (this.request) {
        this.request.post(url, {
          'form': data
        }, function(error, response, body) {
          if (callback) {
            callback(response.statusCode);
          }
          return response.end;
        });
      } else {
        $.ajax({
          async: true,
          type: 'POST',
          data: data,
          url: url,
          complete: function(jqXHR, textStatus) {
            if (callback) {
              return callback(jqXHR);
            }
          }
        });
      }
      return true;
    };

    Carrot.prototype.validateUser = function(accessToken, callback) {
      var _this = this;
      return this.ajaxPost("" + this.scheme + "://" + this.hostname + "/games/" + this.appId + "/users.json", {
        'access_token': accessToken,
        'api_key': this.udid
      }, function(jqXHR) {
        switch (jqXHR.status) {
          case 201:
            _this.status = Carrot.Status.Authorized;
            break;
          case 401:
            _this.status = Carrot.Status.ReadOnly;
            break;
          case 405:
            _this.status = Carrot.Status.NotAuthorized;
            break;
          default:
            _this.status = Carrot.Status.Unknown;
        }
        if (callback) {
          return callback(_this.status);
        }
      });
    };

    Carrot.prototype.callbackHandler = function(callback) {
      var _this = this;
      return function(jqXHR) {
        var ret;
        ret = Carrot.Status.Error;
        switch (jqXHR) {
          case 200:
            ret = Carrot.Status.Ok;
            break;
          case 201:
            ret = Carrot.Status.Ok;
            break;
          case 401:
            _this.status = Carrot.Status.ReadOnly;
            break;
          case 404:
            _this.status = _this.status;
            break;
          case 405:
            _this.status = Carrot.Status.NotAuthorized;
            break;
          default:
            _this.status = Carrot.Status.Unknown;
        }
        if (callback) {
          return callback(ret);
        } else {
          return ret;
        }
      };
    };

    Carrot.prototype.postAchievement = function(achievementId, callback) {
      return this.postSignedRequest("/me/achievements.json", {
        'achievement_id': achievementId
      }, this.callbackHandler(callback));
    };

    Carrot.prototype.postHighScore = function(score, callback) {
      return this.postSignedRequest("/me/scores.json", {
        'value': score
      }, this.callbackHandler(callback));
    };

    Carrot.prototype.postAction = function(actionId, objectInstanceId, actionProperties, objectProperties, callback) {
      var params;
      actionProperties = typeof actionProperties === "string" ? actionProperties : JSON.stringify(actionProperties || {});
      objectProperties = typeof objectProperties === "string" ? objectProperties : JSON.stringify(objectProperties || {});
      params = {
        'action_id': actionId,
        'action_properties': actionProperties,
        'object_properties': objectProperties
      };
      if (objectInstanceId) {
        params['object_instance_id'] = objectInstanceId;
      }
      return this.postSignedRequest("/me/actions.json", params, this.callbackHandler(callback));
    };

    Carrot.prototype.getTweet = function(actionId, objectInstanceId, actionProperties, objectProperties, callback) {
      var params;
      actionProperties = typeof actionProperties === "string" ? actionProperties : JSON.stringify(actionProperties || {});
      objectProperties = typeof objectProperties === "string" ? objectProperties : JSON.stringify(objectProperties || {});
      params = {
        'action_id': actionId,
        'action_properties': actionProperties,
        'object_properties': objectProperties
      };
      if (objectInstanceId) {
        params['object_instance_id'] = objectInstanceId;
      }
      return this.getSignedRequest("/me/tweet.json", params, function(jqXHR) {
        if (callback) {
          return callback(jqXHR.responseJSON);
        }
      });
    };

    Carrot.prototype.showTweet = function(actionId, objectInstanceId, actionProperties, objectProperties, callback) {
      return this.getTweet(actionId, objectInstanceId, actionProperties, objectProperties, function(reply) {
        var height, leftPosition, topPosition, url, width;
        if (callback) {
          callback(reply);
        }
        if (reply) {
          width = 512;
          height = 258;
          leftPosition = (window.screen.width / 2) - (width / 2);
          topPosition = (window.screen.height / 2) - (height / 2);
          url = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(reply.tweet.contents) + "&url=" + encodeURIComponent(reply.tweet.short_url);
          return window.open(url, "Twitter", "status=no,height=" + height + ",width=" + width + ",resizable=no,left=" + leftPosition + ",top=" + topPosition + ",screenX=" + leftPosition + ",screenY=" + topPosition + ",toolbar=no,menubar=no,scrollbars=no,location=yes,directories=no,dialog=yes");
        }
      });
    };

    Carrot.prototype.getSignedRequest = function(endpoint, query_params, callback) {
      query_params['_method'] = "GET";
      return this.doSignedRequest(endpoint, query_params, callback);
    };

    Carrot.prototype.postSignedRequest = function(endpoint, query_params, callback) {
      return this.doSignedRequest(endpoint, query_params, callback);
    };

    Carrot.prototype.doSignedRequest = function(endpoint, query_params, callback) {
      var digest, k, keys, sign_string, url_params, url_string, v, _i, _len;
      url_params = {
        'api_key': this.udid,
        'game_id': this.appId,
        'request_date': Math.round((new Date()).getTime() / 1000),
        'request_id': this.GUID()
      };
      for (k in query_params) {
        v = query_params[k];
        url_params[k] = v;
      }
      keys = (function() {
        var _results;
        _results = [];
        for (k in url_params) {
          v = url_params[k];
          _results.push(k);
        }
        return _results;
      })();
      keys.sort();
      url_string = "";
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        k = keys[_i];
        url_string = url_string + ("" + k + "=" + url_params[k] + "&");
      }
      url_string = url_string.slice(0, url_string.length - 1);
      sign_string = "POST\n" + (this.hostname.split(':')[0]) + "\n" + endpoint + "\n" + url_string;
      digest = CryptoJS.HmacSHA256(sign_string, this.appSecret).toString(CryptoJS.enc.Base64);
      url_params.sig = digest;
      return this.ajaxPost("" + this.scheme + "://" + this.hostname + endpoint, url_params, callback);
    };

    Carrot.prototype.GUID = function() {
      var S4,
        _this = this;
      S4 = function() {
        return Math.floor(Math.random() * 0x10000).toString(16);
      };
      return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
    };

    return Carrot;

  })();

  (typeof exports !== "undefined" && exports !== null ? exports : this).Carrot = Carrot;

}).call(this);
/*
CryptoJS v3.0.2
code.google.com/p/crypto-js
(c) 2009-2012 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS=CryptoJS||function(h,i){var e={},f=e.lib={},l=f.Base=function(){function a(){}return{extend:function(j){a.prototype=this;var d=new a;j&&d.mixIn(j);d.$super=this;return d},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var d in a)a.hasOwnProperty(d)&&(this[d]=a[d]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.$super.extend(this)}}}(),k=f.WordArray=l.extend({init:function(a,j){a=
this.words=a||[];this.sigBytes=j!=i?j:4*a.length},toString:function(a){return(a||m).stringify(this)},concat:function(a){var j=this.words,d=a.words,c=this.sigBytes,a=a.sigBytes;this.clamp();if(c%4)for(var b=0;b<a;b++)j[c+b>>>2]|=(d[b>>>2]>>>24-8*(b%4)&255)<<24-8*((c+b)%4);else if(65535<d.length)for(b=0;b<a;b+=4)j[c+b>>>2]=d[b>>>2];else j.push.apply(j,d);this.sigBytes+=a;return this},clamp:function(){var a=this.words,b=this.sigBytes;a[b>>>2]&=4294967295<<32-8*(b%4);a.length=h.ceil(b/4)},clone:function(){var a=
l.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var b=[],d=0;d<a;d+=4)b.push(4294967296*h.random()|0);return k.create(b,a)}}),o=e.enc={},m=o.Hex={stringify:function(a){for(var b=a.words,a=a.sigBytes,d=[],c=0;c<a;c++){var e=b[c>>>2]>>>24-8*(c%4)&255;d.push((e>>>4).toString(16));d.push((e&15).toString(16))}return d.join("")},parse:function(a){for(var b=a.length,d=[],c=0;c<b;c+=2)d[c>>>3]|=parseInt(a.substr(c,2),16)<<24-4*(c%8);return k.create(d,b/2)}},q=o.Latin1={stringify:function(a){for(var b=
a.words,a=a.sigBytes,d=[],c=0;c<a;c++)d.push(String.fromCharCode(b[c>>>2]>>>24-8*(c%4)&255));return d.join("")},parse:function(a){for(var b=a.length,d=[],c=0;c<b;c++)d[c>>>2]|=(a.charCodeAt(c)&255)<<24-8*(c%4);return k.create(d,b)}},r=o.Utf8={stringify:function(a){try{return decodeURIComponent(escape(q.stringify(a)))}catch(b){throw Error("Malformed UTF-8 data");}},parse:function(a){return q.parse(unescape(encodeURIComponent(a)))}},b=f.BufferedBlockAlgorithm=l.extend({reset:function(){this._data=k.create();
this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=r.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var b=this._data,d=b.words,c=b.sigBytes,e=this.blockSize,g=c/(4*e),g=a?h.ceil(g):h.max((g|0)-this._minBufferSize,0),a=g*e,c=h.min(4*a,c);if(a){for(var f=0;f<a;f+=e)this._doProcessBlock(d,f);f=d.splice(0,a);b.sigBytes-=c}return k.create(f,c)},clone:function(){var a=l.clone.call(this);a._data=this._data.clone();return a},_minBufferSize:0});f.Hasher=b.extend({init:function(){this.reset()},
reset:function(){b.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);this._doFinalize();return this._hash},clone:function(){var a=b.clone.call(this);a._hash=this._hash.clone();return a},blockSize:16,_createHelper:function(a){return function(b,d){return a.create(d).finalize(b)}},_createHmacHelper:function(a){return function(b,d){return g.HMAC.create(a,d).finalize(b)}}});var g=e.algo={};return e}(Math);
(function(h){var i=CryptoJS,e=i.lib,f=e.WordArray,e=e.Hasher,l=i.algo,k=[],o=[];(function(){function e(a){for(var b=h.sqrt(a),d=2;d<=b;d++)if(!(a%d))return!1;return!0}function f(a){return 4294967296*(a-(a|0))|0}for(var b=2,g=0;64>g;)e(b)&&(8>g&&(k[g]=f(h.pow(b,0.5))),o[g]=f(h.pow(b,1/3)),g++),b++})();var m=[],l=l.SHA256=e.extend({_doReset:function(){this._hash=f.create(k.slice(0))},_doProcessBlock:function(e,f){for(var b=this._hash.words,g=b[0],a=b[1],j=b[2],d=b[3],c=b[4],h=b[5],l=b[6],k=b[7],n=0;64>
n;n++){if(16>n)m[n]=e[f+n]|0;else{var i=m[n-15],p=m[n-2];m[n]=((i<<25|i>>>7)^(i<<14|i>>>18)^i>>>3)+m[n-7]+((p<<15|p>>>17)^(p<<13|p>>>19)^p>>>10)+m[n-16]}i=k+((c<<26|c>>>6)^(c<<21|c>>>11)^(c<<7|c>>>25))+(c&h^~c&l)+o[n]+m[n];p=((g<<30|g>>>2)^(g<<19|g>>>13)^(g<<10|g>>>22))+(g&a^g&j^a&j);k=l;l=h;h=c;c=d+i|0;d=j;j=a;a=g;g=i+p|0}b[0]=b[0]+g|0;b[1]=b[1]+a|0;b[2]=b[2]+j|0;b[3]=b[3]+d|0;b[4]=b[4]+c|0;b[5]=b[5]+h|0;b[6]=b[6]+l|0;b[7]=b[7]+k|0},_doFinalize:function(){var e=this._data,f=e.words,b=8*this._nDataBytes,
g=8*e.sigBytes;f[g>>>5]|=128<<24-g%32;f[(g+64>>>9<<4)+15]=b;e.sigBytes=4*f.length;this._process()}});i.SHA256=e._createHelper(l);i.HmacSHA256=e._createHmacHelper(l)})(Math);
(function(){var h=CryptoJS,i=h.enc.Utf8;h.algo.HMAC=h.lib.Base.extend({init:function(e,f){e=this._hasher=e.create();"string"==typeof f&&(f=i.parse(f));var h=e.blockSize,k=4*h;f.sigBytes>k&&(f=e.finalize(f));for(var o=this._oKey=f.clone(),m=this._iKey=f.clone(),q=o.words,r=m.words,b=0;b<h;b++)q[b]^=1549556828,r[b]^=909522486;o.sigBytes=m.sigBytes=k;this.reset()},reset:function(){var e=this._hasher;e.reset();e.update(this._iKey)},update:function(e){this._hasher.update(e);return this},finalize:function(e){var f=
this._hasher,e=f.finalize(e);f.reset();return f.finalize(this._oKey.clone().concat(e))}})})();
/*
CryptoJS v3.0.2
code.google.com/p/crypto-js
(c) 2009-2012 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){var h=CryptoJS,i=h.lib.WordArray;h.enc.Base64={stringify:function(b){var e=b.words,f=b.sigBytes,c=this._map;b.clamp();for(var b=[],a=0;a<f;a+=3)for(var d=(e[a>>>2]>>>24-8*(a%4)&255)<<16|(e[a+1>>>2]>>>24-8*((a+1)%4)&255)<<8|e[a+2>>>2]>>>24-8*((a+2)%4)&255,g=0;4>g&&a+0.75*g<f;g++)b.push(c.charAt(d>>>6*(3-g)&63));if(e=c.charAt(64))for(;b.length%4;)b.push(e);return b.join("")},parse:function(b){var b=b.replace(/\s/g,""),e=b.length,f=this._map,c=f.charAt(64);c&&(c=b.indexOf(c),-1!=c&&(e=c));
for(var c=[],a=0,d=0;d<e;d++)if(d%4){var g=f.indexOf(b.charAt(d-1))<<2*(d%4),h=f.indexOf(b.charAt(d))>>>6-2*(d%4);c[a>>>2]|=(g|h)<<24-8*(a%4);a++}return i.create(c,a)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}})();
