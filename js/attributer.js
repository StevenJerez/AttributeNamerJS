"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 *  Referral Tracker
 *
 *  @function FlareTrk
 *  @description Add to any site to start tracking referral data
 *  @author Ash Durham and James Demmery and Callan McNamara
 */
// BTOA polyfill from https://base64.guru/developers/javascript/examples/polyfill
(function () {
  // Do not implement polyfill if browser already support Base64 algorithms
  if (typeof btoa === "function") {
    return false;
  } // A helper that returns Base64 characters and their indices.


  var chars = {
    ascii: function ascii() {
      return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    },
    indices: function indices() {
      if (!this.cache) {
        this.cache = {};
        var ascii = chars.ascii();

        for (var c = 0; c < ascii.length; c++) {
          var chr = ascii[c];
          this.cache[chr] = c;
        }
      }

      return this.cache;
    }
  };
  /**
   * Binary to ASCII (encode data to Base64)
   * @param {String} data
   * @returns {String}
   */

  window.btoa = function (data) {
    var ascii = chars.ascii(),
        len = data.length - 1,
        i = -1,
        b64 = "";

    while (i < len) {
      var code = data.charCodeAt(++i) << 16 | data.charCodeAt(++i) << 8 | data.charCodeAt(++i);
      b64 += ascii[code >>> 18 & 63] + ascii[code >>> 12 & 63] + ascii[code >>> 6 & 63] + ascii[code & 63];
    }

    var pads = data.length % 3;

    if (pads > 0) {
      b64 = b64.slice(0, pads - 3);

      while (b64.length % 4 !== 0) {
        b64 += "=";
      }
    }

    return b64;
  };
  /**
   * ASCII to binary (decode Base64 to original data)
   * @param {String} b64
   * @returns {String}
   */


  window.atob = function (b64) {
    var indices = chars.indices(),
        pos = b64.indexOf("="),
        padded = pos > -1,
        len = padded ? pos : b64.length,
        i = -1,
        data = "";

    while (i < len) {
      var code = indices[b64[++i]] << 18 | indices[b64[++i]] << 12 | indices[b64[++i]] << 6 | indices[b64[++i]];

      if (code !== 0) {
        data += String.fromCharCode(code >>> 16 & 255, code >>> 8 & 255, code & 255);
      }
    }

    if (padded) {
      data = data.slice(0, pos - b64.length);
    }

    return data;
  };
})();

var _VERSION = "1.3.4";
var _BLOCKED = false;
var _BLOCKED_MESSAGE = "Expired Attributer License";

var FlareTrk_Class = function FlareTrk_Class() {
  var _this = this;

  _classCallCheck(this, FlareTrk_Class);

  _defineProperty(this, "storageName", function (name) {
    if (typeof name === "undefined" || name === "") name = _this.settings.storageName;
    return name;
  });

  _defineProperty(this, "testLocalstorage", function () {
    try {
      localStorage.setItem("ping", "test");
      localStorage.removeItem("ping");
      return true;
    } catch (e) {
      return false;
    }
  });

  _defineProperty(this, "getData", function (name) {
    if (!_this.data) {
      if (_this.getCookie(name)) {
        _this.data = _this.getCookie(name);
      } else {
        _this.data = {};
      }
    }

    return _this.data;
  });

  _defineProperty(this, "setData", function (value, name) {
    _this.setCookie(value, name);
  });

  _defineProperty(this, "removeData", function (name) {
    switch (_this.settings.output) {
      case "cookie":
        _this.removeCookie(name);

        break;

      default:
        _this.removeLocalStorage(name);

    }
  });

  _defineProperty(this, "clearData", function () {
    switch (_this.settings.output) {
      case "cookie":
        _this.clearCookies();

        break;

      default:
        _this.clearLocalStorage();

    }
  });

  _defineProperty(this, "processCustomData", function () {
    var points = {};
    var fieldNames = _this.settings.customFields || [];
    _this.data["customFields"] = _this.data["customFields"] || {};

    for (var dp = 0; dp < fieldNames.length; dp++) {
      var key = fieldNames[dp];

      if (_this.data["customFields"][key]) {
        points[key] = _this.data["customFields"][key];
      } else {
        points[fieldNames[dp]] = _this.getParam(_this.data.landingURL, key);
      }
    }

    _this.data["customFields"] = points;
  });

  _defineProperty(this, "processData", function (name) {
    _this.getData(_this.storageName(name));

    for (var dp = 0; dp < _this.dataPoints.length; dp++) {
      var func = "DP" + _this.dataPoints[dp];
      _this.data[_this.dataPoints[dp]] = _this[func]();
    }

    _this.processCustomData();

    var clean_url, test_data;

    if (_this.data.landingURL !== "") {
      clean_url = _this.data.landingURL.split("?")[0];
      test_data = "From referrer, original URL: " + _this.data.landingURL;
    } else {
      clean_url = "Could not detect";
      test_data = "";
    }

    _this.data.landing_url = clean_url;
    _this.data.test_data = test_data;
    var regex2 = /^http(s):\/\/(.*?)\/(.*?)\/.*$/;
    var match, landing_page_group; //if (this.data.referrerURL == "") {

    match = _this.data.landingURL.match(regex2); //} else {
    //  match = this.data.referrerURL.match(regex2);
    //}

    if (match && 3 in match) {
      landing_page_group = decodeURIComponent("/" + match[3] + "/");
    } else {
      landing_page_group = "/";
    }

    _this.data.landing_page_group = landing_page_group;

    _this.setData(_this.data);

    if (_BLOCKED) {
      _this.blockData(_this.data);
    }
  });

  _defineProperty(this, "blockData", function (data) {
    for (var key in data) {
      if (typeof data[key] == 'string' || data[key] instanceof String) {
        data[key] = _BLOCKED_MESSAGE;
      } else {
        _this.blockData(data[key]);
      }
    }
  });

  _defineProperty(this, "getLocalStorage", function (name) {
    name = _this.storageName(name);
    return JSON.parse(localStorage.getItem(name));
  });

  _defineProperty(this, "setLocalStorage", function (value, name) {
    name = _this.storageName(name);
    localStorage.setItem(name, JSON.stringify(value));
  });

  _defineProperty(this, "removeLocalStorage", function (name) {
    name = _this.storageName(name);
    localStorage.removeItem(name);
  });

  _defineProperty(this, "clearLocalStorage", function () {
    localStorage.clear();
  });

  _defineProperty(this, "getCookie", function (name) {
    name = _this.storageName(name);
    var results = document.cookie.match("".concat(name, "=(.*?)(;|$)"));
    return results ? JSON.parse(window.atob(results[1])) : null;
  });

  _defineProperty(this, "setCookie", function (value, name) {
    name = _this.storageName(name);
    var domain = document.location.hostname;
    var parts = domain.toString().split("."); // Try setting cookies until we can read them back

    for (var i = parts.length - 2; i >= 0; i--) {
      var cookie_domain = parts.slice(i).join(".");
      var cookie_value = "".concat(name, "=").concat(window.btoa(JSON.stringify(value)));
      var cookie = [cookie_value, "expires=".concat(_this.getExpiration()), "path=/", "domain=".concat(cookie_domain), "secure"];
      document.cookie = cookie.join(";");

      if (document.cookie.indexOf(cookie_value) > -1) {
        console.log("Set cookie for ".concat(cookie_domain, ".")); // We were able to store a cookie

        return;
      }
    } // we were not.. able top store a cookie...


    console.log("Failed to set cookie for ".concat(domain, "."));
  });

  _defineProperty(this, "removeCookie", function (name) {
    name = _this.storageName(name);
    var cookie = ["".concat(name, "="), "expires=".concat(_this.getExpiration(true)), "path=/", "domain=".concat(document.location.host === "localhost:8000" ? "localhost" : document.location.host)];
    document.cookie = cookie.join(";");
  });

  _defineProperty(this, "clearCookies", function () {
    var cookie = ["expires=".concat(_this.getExpiration(true)), "path=/", "domain=".concat(document.location.host === "localhost:8000" ? "localhost" : document.location.host)];
    document.cookie.split(";").forEach(function (c) {
      console.log(c, c.replace(/^ +/, ""), c.replace(/^ +/, "").replace(/=.*/, "=;" + cookie.join(";")));
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;" + cookie.join(";"));
    });
  });

  _defineProperty(this, "getExpiration", function (expire) {
    var expiration = new Date();
    var days = expire ? -9999 : _this.settings.cookieLife;
    expiration.setDate(expiration.getDate() + days);
    return expiration.toUTCString();
  });

  _defineProperty(this, "getTimestamp", function (output) {
    var now = new Date();
    return output === "ms" ? now.getTime() : now.toGMTString();
  });

  _defineProperty(this, "isExternalReferrer", function () {
    var referrer = document.referrer;
    if (referrer && referrer.indexOf(document.location.protocol + "//" + document.location.host) === -1) return true;
    return false;
  });

  _defineProperty(this, "getQueryVars", function (url) {
    if (!_this.queryVars.hasOwnProperty(url)) {
      var vars = {};
      if (!url) url = document.location.href;
      url.replace(/[?&]+(.*?)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
      });
      _this.queryVars[url] = vars;
    }

    return _this.queryVars[url];
  });

  _defineProperty(this, "getUTMParam", function (url, key) {
    var param = key === "gclid" || key === "fbclid" || key === "msclkid" ? key : "utm_".concat(key);
    return _this.getParam(url, param);
  });

  _defineProperty(this, "getParam", function (url, key) {
    return _this.getQueryVars(url)[key] || "";
  });

  _defineProperty(this, "hasUTMParam", function (url) {
    return url.match("utm_") != null;
  });

  _defineProperty(this, "pathparts", function (url) {
    var el = document.createElement("a");
    el.href = url;
    return el;
  });

  _defineProperty(this, "mdIndexOf", function (keys, values) {
    for (var k = 0; k < keys.length; k++) {
      for (var v = 0; v < values.length; v++) {
        if (values[v] !== null && typeof values[v] !== "undefined") {
          var match = values[v].indexOf(keys[k]);
          if (match > -1) return true;
        }
      }
    }

    return false;
  });

  _defineProperty(this, "mdIndexOfHost", function (keys, values) {
    for (var k = 0; k < keys.length; k++) {
      for (var v = 0; v < values.length; v++) {
        if (values[v] !== null && typeof values[v] !== "undefined") {
          //  `(^|\.|\/)${value}([^a-zA-Z_0-9]|$)`
          var re = "(^|.|/)".concat(keys[k].replace(".", "."), "([^a-zA-Z_0-9]|$)");
          var match = values[v].match(re);
          if (match != null) return true;
        }
      }
    }

    return false;
  });

  _defineProperty(this, "getNormalisedSearchName", function (url) {
    for (var searchEngineName in _this.drillSubSources["search-association"]) {
      for (var searchEngineURL in _this.drillSubSources["search-association"][searchEngineName]) {
        if (_this.drillSubSources["search-association"][searchEngineName][searchEngineURL] == url) {
          return searchEngineName;
        }
      }
    }

    return "Other";
  });

  _defineProperty(this, "getNormalisedSocialName", function (url) {
    for (var searchEngineName in _this.drillSubSources["social-association"]) {
      for (var searchEngineURL in _this.drillSubSources["social-association"][searchEngineName]) {
        if (_this.drillSubSources["social-association"][searchEngineName][searchEngineURL] == url) {
          return searchEngineName;
        }
      }
    }

    return "Other";
  });

  _defineProperty(this, "getDrill", function (referrer) {
    if (!referrer) return {
      channel: "Direct traffic",
      drillDown1: "None",
      drillDown2: "None",
      drillDown3: "None",
      drillDown4: "None"
    };

    var pathparts = _this.pathparts(referrer);

    var queryVars = _this.getQueryVars(referrer);

    if ("domain_override" in queryVars) {
      console.log("Using domain override: " + queryVars["domain_override"]);
      pathparts.hostname = queryVars["domain_override"];
    }

    var drillSource = decodeURIComponent(_this.getDrillSource(pathparts, queryVars));
    var drillSubSource = decodeURIComponent(_this.getDrillSubSource(drillSource, pathparts, queryVars));
    var drillSourceDetail = decodeURIComponent(_this.getDrillSourceDetail(drillSource, pathparts, queryVars));
    var drillSourceSubdetail = decodeURIComponent(_this.getDrillSourceSubdetail(drillSource, pathparts, queryVars));
    var drillSourceSubSubdetail = decodeURIComponent(_this.getDrillSourceSubSubdetail(drillSource, pathparts, queryVars));
    return {
      channel: drillSource,
      drillDown1: drillSubSource,
      drillDown2: drillSourceDetail,
      drillDown3: drillSourceSubdetail,
      drillDown4: drillSourceSubSubdetail
    };
  });

  _defineProperty(this, "getDrillSource", function (pathparts, queryVars) {
    // Check Display
    if (_this.getUTMParam(pathparts.href, "medium") === "display") {
      return "Display";
    } // Check Basic email


    if (_this.getUTMParam(pathparts.href, "medium") === "email") {
      return "Email marketing";
    } // Check Social Media


    if (_this.getUTMParam(pathparts.href, "medium") === "social") return "Organic social"; // Check Email Marketing

    if (_this.mdIndexOf(["email"], [_this.getUTMParam(pathparts.href, "source"), _this.getUTMParam(pathparts.href, "medium"), _this.getUTMParam(pathparts.href, "campaign"), queryVars["source"]])) return "Email marketing"; // Check Affialiates

    if (["affiliate", "affiliates"].indexOf(_this.getUTMParam(pathparts.href, "medium")) > -1) {
      return "Affiliates";
    } // Check Paid Social


    if (["paid", "ppc", "cpc"].indexOf(_this.getUTMParam(pathparts.href, "medium")) > -1 && (_this.mdIndexOfHost(_this.drillSubSources["social-source"], [_this.getUTMParam(pathparts.href, "source").toLowerCase()]) || _this.mdIndexOfHost(_this.drillSubSources["social-domains"], [pathparts.hostname])) || _this.getUTMParam(pathparts.href, "medium") === "paidsocial" || _this.getUTMParam(pathparts.href, "source") === "paidsocial") return "Paid social"; // Check Paid Search

    if (_this.mdIndexOf(["adword", "ppc", "cpc"], [_this.getUTMParam(pathparts.href, "source"), _this.getUTMParam(pathparts.href, "medium"), _this.getUTMParam(pathparts.href, "campaign"), queryVars["source"]]) || "gclid" in queryVars || ("utm_campaign" in queryVars || "utm_medium" in queryVars || "utm_source" in queryVars) && _this.mdIndexOfHost(_this.drillSubSources["engine-domains"], [pathparts.hostname]) || _this.getUTMParam(pathparts.href, "source") == "paidsearch" || _this.getUTMParam(pathparts.href, "medium") == "paidsearch") return "Paid search"; // Check Other Campaigns

    if (("utm_campaign" in queryVars || "utm_medium" in queryVars || "utm_source" in queryVars || "source" in queryVars) && !_this.mdIndexOf(["email", "adword", "ppc", "cpc"], [_this.getUTMParam(pathparts.href, "source"), _this.getUTMParam(pathparts.href, "medium"), _this.getUTMParam(pathparts.href, "campaign"), queryVars["source"]])) return "Other campaigns"; // Check Domains

    if (_this.mdIndexOfHost(_this.drillSubSources["social-domains"], [pathparts.hostname])) return "Organic social";
    if (_this.mdIndexOfHost(_this.drillSubSources["engine-domains"], [pathparts.hostname])) return "Organic search";

    if (!_this.data.referrerURL || pathparts.href.indexOf(document.location.host) > -1) {
      return "Direct traffic";
    } // Check if internal


    if (pathparts.href.indexOf(document.location.host) > -1 && !_this.getUTMParam(pathparts.href, "source") && false) return "Internal";
    return "Referral";
  });

  _defineProperty(this, "getDrillSubSource", function (drillSource, pathparts, queryVars) {
    switch (drillSource) {
      case "Organic search":
        var clean_hostname = pathparts.hostname.replace("www.", "");
        return _this.getNormalisedSearchName(clean_hostname);
        break;

      case "Referral":
        return pathparts.host;
        break;

      case "Organic social":
        var drill_source = _this.getUTMParam(pathparts.href, "source");

        var clean_hostname = pathparts.hostname.replace("www.", "");

        var host_source = _this.getNormalisedSocialName(clean_hostname);

        return _this.hasUTMParam(pathparts.href) ? drill_source || "No Source" : host_source;
        break;

      case "Email marketing":
      case "Paid search":
      case "Paid social":
      case "Other campaigns":
      case "Display":
      case "Affiliates":
        // Return utm_source value
        var drill_source = _this.getUTMParam(pathparts.href, "source");

        if (drill_source !== "") return drill_source; // else

        return "No Source";
        break;

      case "Direct traffic":
        return "None";
        break;
    }
  });

  _defineProperty(this, "getDrillSourceDetail", function (drillSource, pathparts, queryVars) {
    switch (drillSource) {
      case "Organic search":
        return pathparts.host;
        break;

      case "Referral":
        return pathparts.href;
        break;

      case "Display":
      case "Email marketing":
      case "Paid search":
      case "Paid social":
      case "Other campaigns":
      case "Affiliates":
        // Return utm_campaign value
        var dsd_campaign = _this.getUTMParam(pathparts.href, "campaign");

        if (dsd_campaign !== "") return dsd_campaign; // else

        return "No Campaign";
        break;

      case "Organic social":
        var term = _this.getUTMParam(pathparts.href, "campaign");

        return _this.hasUTMParam(pathparts.href) ? term || "No Campaign" : pathparts.host;
        break;

      case "Direct traffic":
        return "None";
        break;
    }
  });

  _defineProperty(this, "getDrillSourceSubdetail", function (drillSource, pathparts, queryVars) {
    switch (drillSource) {
      case "Organic search":
        var term = _this.getUTMParam(pathparts.href, "term");

        return term || "None";
        break;

      case "Referral":
      case "Direct traffic":
        return "None";
        break;

      case "Organic social":
        var term = _this.getUTMParam(pathparts.href, "term");

        return _this.hasUTMParam(pathparts.href) ? term || "No Terms" : "None";
        break;

      case "Paid search":
      case "Email marketing":
      case "Paid social":
      case "Other campaigns":
      case "Display":
      case "Affiliates":
        var term = _this.getUTMParam(pathparts.href, "term");

        if (term !== "") return term;
        return "No Terms";
        break;
    }
  });

  _defineProperty(this, "getDrillSourceSubSubdetail", function (drillSource, pathparts, queryVars) {
    switch (drillSource) {
      case "Organic search":
      case "Referral":
      case "Direct traffic":
        return "None";
        break;

      case "Organic social":
        var content = _this.getUTMParam(pathparts.href, "content");

        return _this.hasUTMParam(pathparts.href) ? content || "No Content" : "None";

      case "Paid search":
      case "Email marketing":
      case "Paid social":
      case "Other campaigns":
      case "Display":
      case "Affiliates":
        var term = _this.getUTMParam(pathparts.href, "content");

        if (term !== "") return term;
        return "No Content";
        break;
    }
  });

  _defineProperty(this, "DPfirstVisitDate", function () {
    if (!_this.data.hasOwnProperty("firstVisitDate")) {
      return _this.getTimestamp();
    } else return _this.data.firstVisitDate;
  });

  _defineProperty(this, "DPgclid", function () {
    if (!_this.data.hasOwnProperty("gclid")) {
      return _this.getUTMParam(_this.data.landingURL, "gclid") || "";
    } else return _this.data.gclid;
  });

  _defineProperty(this, "DPmsclkid", function () {
    if (!_this.data.hasOwnProperty("msclkid")) {
      return _this.getUTMParam(_this.data.landingURL, "msclkid") || "";
    } else return _this.data.msclkid;
  });

  _defineProperty(this, "DPid", function () {
    if (!_this.data.hasOwnProperty("id")) {
      return _this.getUTMParam(_this.data.landingURL, "id") || "";
    } else return _this.data.id;
  });

  _defineProperty(this, "DPfbclid", function () {
    if (!_this.data.hasOwnProperty("fbclid")) {
      return _this.getUTMParam(_this.data.landingURL, "fbclid") || "";
    } else return _this.data.fbclid;
  });

  _defineProperty(this, "DPreferrerURL", function () {
    if (!_this.data.hasOwnProperty("referrerURL")) return document.referrer;else return _this.data.referrerURL;
  });

  _defineProperty(this, "DPlastReferrerURL", function () {
    if (document.referrer && document.referrer.indexOf(location.protocol + "//" + location.host) === -1) return document.referrer;else if (!_this.data.hasOwnProperty("lastReferrerURL")) return document.referrer;else return _this.data.lastReferrerURL;
  });

  _defineProperty(this, "DPlastViewedURL", function () {
    return document.referrer;
  });

  _defineProperty(this, "DPlandingURL", function () {
    if (!_this.data.hasOwnProperty("landingURL")) return location.href;else return _this.data.landingURL;
  });

  _defineProperty(this, "DPlastLandingURL", function () {
    if (document.referrer && document.referrer.indexOf(location.protocol + "//" + location.host) === -1) return location.href;else if (!_this.data.hasOwnProperty("lastLandingURL")) return location.href;else return _this.data.lastLandingURL;
  });

  _defineProperty(this, "DPdrillData", function () {
    if (!_this.data.hasOwnProperty("drillData")) {
      var drillData;
      drillData = _this.getDrill(_this.data.landingURL);

      if (drillData.channel == "Direct traffic" && _this.data.referrerURL != "") {
        drillData = _this.getDrill(_this.data.referrerURL);
      }

      return drillData;
    } else {
      return _this.data.drillData;
    }
  });

  _defineProperty(this, "DPlastDrillData", function () {
    if (!_this.data.hasOwnProperty("lastDrillData")) return _this.getDrill(_this.data.lastReferrerURL);else return _this.data.lastDrillData;
  });

  _defineProperty(this, "repop", function () {
    if (_this._repoping) {
      return;
    }

    _this._repoping = true;
    setTimeout(function () {
      _this._repoping = false;

      _this.watchForm();
    }, 500);
  });

  _defineProperty(this, "watchForm", function () {
    function setFormValue(form, qs, value) {
      var qsexpand = ["input[value='[".concat(qs, "]']"), "input[name='[attributer-".concat(qs, "]']"), "input[id='[attributer-".concat(qs, "]']")];

      var _loop = function _loop(i) {
        var el = form.querySelector(qsexpand[i]);

        if (el) {
          var lastValue = el.value;
          el.value = value;
          el.setAttribute("value", value);
          window.requestAnimationFrame(function () {
            var tracker = el._valueTracker;

            if (tracker) {
              tracker.setValue(lastValue);
            }

            var event = new Event('change', {
              target: el,
              "bubbles": true,
              "cancelable": false
            });
            event.simulated = true;
            el.dispatchEvent(event);
            event = new Event('input', {
              target: el,
              "bubbles": true,
              "cancelable": false
            });
            event.simulated = true;
            el.dispatchEvent(event);
          });
          return {
            v: true
          };
        }
      };

      for (var i = 0; i < qsexpand.length; i++) {
        var _ret = _loop(i);

        if (_typeof(_ret) === "object") return _ret.v;
      }

      return false;
    }

    var forms = document.querySelectorAll("form, .form");
    _this.data["customFields"] = _this.data["customFields"] || {};
    var SET_FORMS = 0;

    if (forms.length > 0) {
      for (var f = 0; f < forms.length; f++) {
        var form = forms[f];
        var hasSet = setFormValue(form, "channel", _this.data.drillData.channel);

        if (!hasSet) {
          continue;
        }

        setFormValue(form, "channeldrilldown1", _this.data.drillData.drillDown1);
        setFormValue(form, "channeldrilldown2", _this.data.drillData.drillDown2);
        setFormValue(form, "channeldrilldown3", _this.data.drillData.drillDown3);
        setFormValue(form, "channeldrilldown4", _this.data.drillData.drillDown4);
        setFormValue(form, "gclid", _this.data.gclid || "");
        setFormValue(form, "msclkid", _this.data.msclkid || "");
        setFormValue(form, "fbclid", _this.data.fbclid || "");
        setFormValue(form, "id", _this.data.id || "");
        setFormValue(form, "landingpage", _this.data.landing_url);
        setFormValue(form, "testingdata", _this.data.test_data);
        setFormValue(form, "landingpagegroup", _this.data.landing_page_group);

        for (var dp = 0; dp < _this.settings.customFields.length; dp++) {
          var key = _this.settings.customFields[dp];
          setFormValue(form, "custom-".concat(key), _this.data["customFields"][key] || "");
        }

        SET_FORMS += 1;
      }
    }

    var zohoForms = document.querySelectorAll("[data-attributer-iframe]");

    if (zohoForms.length > 0) {
      for (var f = 0; f < zohoForms.length; f++) {
        var getAttrib = function getAttrib(name) {
          return form.getAttribute("data-attributer-" + name) || name;
        };

        var form = zohoForms[f];
        var url = new URL(form.src);
        url.searchParams.set(getAttrib("channel"), _this.data.drillData.channel);
        url.searchParams.set(getAttrib("channeldrilldown1"), _this.data.drillData.drillDown1);
        url.searchParams.set(getAttrib("channeldrilldown2"), _this.data.drillData.drillDown2);
        url.searchParams.set(getAttrib("channeldrilldown3"), _this.data.drillData.drillDown3);
        url.searchParams.set(getAttrib("channeldrilldown4"), _this.data.drillData.drillDown4);
        url.searchParams.set(getAttrib("gclid"), _this.data.gclid || "");
        url.searchParams.set(getAttrib("msclkid"), _this.data.msclkid || "");
        url.searchParams.set(getAttrib("fbclid"), _this.data.fbclid || "");
        url.searchParams.set(getAttrib("id"), _this.data.id || "");
        url.searchParams.set(getAttrib("landingpage"), _this.data.landing_url);
        url.searchParams.set(getAttrib("testingdata"), _this.data.test_data);
        url.searchParams.set(getAttrib("landingpagegroup"), _this.data.landing_page_group);

        for (var dp = 0; dp < _this.settings.customFields.length; dp++) {
          var _key = _this.settings.customFields[dp];
          url.searchParams.set(getAttrib("custom-".concat(_key)), _this.data["customFields"][_key] || "");
        }

        var new_url = url.toString().replaceAll("+", " ");

        if (new_url != form.src) {
          form.src = new_url;
          SET_FORMS += 1;
        }
      }
    }

    var tfForms = document.querySelectorAll("[data-attributer-tf]");

    if (tfForms.length > 0) {
      for (var f = 0; f < tfForms.length; f++) {
        var tf = tfForms[f];
        var customFields = '';

        for (var dp = 0; dp < _this.settings.customFields.length; dp++) {
          var _key2 = _this.settings.customFields[dp];
          customFields += ",custom".concat(_key2, "=").concat(_this.data["customFields"][_key2] || "");
        }

        tf.setAttribute("data-tf-hidden", "channel=".concat(_this.data.drillData.channel, ",") + "channeldrilldown1=".concat(_this.data.drillData.drillDown1, ",") + "channeldrilldown2=".concat(_this.data.drillData.drillDown2, ",") + "channeldrilldown3=".concat(_this.data.drillData.drillDown3, ",") + "channeldrilldown4=".concat(_this.data.drillData.drillDown4, ",") + "gclid=".concat(_this.data.gclid, ",") + "fbclid=".concat(_this.data.fbclid, ",") + "msclkid=".concat(_this.data.msclkid, ",") + "id=".concat(_this.data.id, ",") + "landingpage=".concat(_this.data.landing_url, ",") + "landingpagegroup=".concat(_this.data.landing_page_group) + customFields);

        var _form = tf.querySelector("iframe");

        if (_form) {
          var customFields = '';

          for (var dp = 0; dp < _this.settings.customFields.length; dp++) {
            var _key3 = _this.settings.customFields[dp];
            customFields += "&custom".concat(_key3, "=").concat(encodeURIComponent(_this.data["customFields"][_key3] || ""));
          }

          var url = new URL(_form.src);
          url.hash = "#" + "channel=".concat(encodeURIComponent(_this.data.drillData.channel), "&") + "channeldrilldown1=".concat(encodeURIComponent(_this.data.drillData.drillDown1), "&") + "channeldrilldown2=".concat(encodeURIComponent(_this.data.drillData.drillDown2), "&") + "channeldrilldown3=".concat(encodeURIComponent(_this.data.drillData.drillDown3), "&") + "channeldrilldown4=".concat(encodeURIComponent(_this.data.drillData.drillDown4), "&") + "gclid=".concat(encodeURIComponent(_this.data.gclid), "&") + "fbclid=".concat(encodeURIComponent(_this.data.fbclid), "&") + "msclkid=".concat(encodeURIComponent(_this.data.msclkid), "&") + "id=".concat(encodeURIComponent(_this.data.id), "&") + "landingpage=".concat(encodeURIComponent(_this.data.landing_url), "&") + "landingpagegroup=".concat(encodeURIComponent(_this.data.landing_page_group)) + customFields;
          _form.src = url;
          SET_FORMS += 1;
        }
      }

      if (window.tf) {
        var _window$tf;

        (_window$tf = window.tf) === null || _window$tf === void 0 ? void 0 : _window$tf.reload();
      }
    }

    if (SET_FORMS == 0) {
      _this.repop();
    } else {
      console.log("Attributer Populated.");
    }
  });

  this._repoping = false;
  this.dataPoints = ["firstVisitDate", "referrerURL", "landingURL", "lastReferrerURL", "lastLandingURL", "lastViewedURL", "drillData", "lastDrillData", "gclid", "msclkid", "fbclid", "id"];
  this.drillSubSources = {
    "search-association": {
      Google: ["google.ac", "google.ad", "google.ae", "google.al", "google.am", "google.as", "google.at", "google.az", "google.ba", "google.be", "google.bf", "google.bg", "google.bi", "google.bj", "google.bs", "google.bt", "google.by", "google.ca", "google.cat", "google.cc", "google.cd", "google.cf", "google.cg", "google.ch", "google.ci", "google.cl", "google.cm", "google.cn", "google.co.ao", "google.co.bw", "google.co.ck", "google.co.cr", "google.co.id", "google.co.il", "google.co.in", "google.co.jp", "google.co.ke", "google.co.kr", "google.co.ls", "google.co.ma", "google.co.mz", "google.co.nz", "google.co.th", "google.co.tz", "google.co.ug", "google.co.uk", "google.co.uz", "google.co.ve", "google.co.vi", "google.co.za", "google.co.zm", "google.co.zw", "google.com", "google.com.af", "google.com.ag", "google.com.ai", "google.com.ar", "google.com.au", "google.com.bd", "google.com.bh", "google.com.bn", "google.com.bo", "google.com.br", "google.com.by", "google.com.bz", "google.com.co", "google.com.cu", "google.com.cy", "google.com.do", "google.com.ec", "google.com.eg", "google.com.et", "google.com.fj", "google.com.gh", "google.com.gi", "google.com.gt", "google.com.hk", "google.com.jm", "google.com.kh", "google.com.kw", "google.com.lb", "google.com.lc", "google.com.ly", "google.com.mm", "google.com.mt", "google.com.mx", "google.com.my", "google.com.na", "google.com.nf", "google.com.ng", "google.com.ni", "google.com.np", "google.com.om", "google.com.pa", "google.com.pe", "google.com.pg", "google.com.ph", "google.com.pk", "google.com.pr", "google.com.py", "google.com.qa", "google.com.sa", "google.com.sb", "google.com.sg", "google.com.sl", "google.com.sv", "google.com.tj", "google.com.tn", "google.com.tr", "google.com.tw", "google.com.ua", "google.com.uy", "google.com.vc", "google.com.vn", "google.cv", "google.cz", "google.de", "google.dj", "google.dk", "google.dm", "google.dz", "google.ee", "google.es", "google.fi", "google.fm", "google.fr", "google.ga", "google.gd", "google.ge", "google.gf", "google.gg", "google.gl", "google.gm", "google.gp", "google.gr", "google.gy", "google.hn", "google.hr", "google.ht", "google.hu", "google.ie", "google.im", "google.io", "google.iq", "google.is", "google.it", "google.it.ao", "google.je", "google.jo", "google.kg", "google.ki", "google.kz", "google.la", "google.li", "google.lk", "google.lt", "google.lu", "google.lv", "google.md", "google.me", "google.mg", "google.mk", "google.ml", "google.mn", "google.ms", "google.mu", "google.mv", "google.mw", "google.ne", "google.nl", "google.no", "google.nr", "google.nu", "google.pl", "google.pn", "google.ps", "google.pt", "google.ro", "google.rs", "google.ru", "google.rw", "google.sc", "google.se", "google.sh", "google.si", "google.sk", "google.sm", "google.sn", "google.so", "google.st", "google.td", "google.tg", "google.tk", "google.tl", "google.tm", "google.tn", "google.to", "google.tt", "google.us", "google.vg", "google.vu", "google.ws"],
      Bing: ["bing.com"],
      Yahoo: ["yahoo.co.jp", "yahoo.com"],
      DuckDuckGo: ["duckduckgo.com"],
      Yandex: ["yandex.by", "yandex.com", "yandex.com.tr", "yandex.kz", "yandex.ru", "yandex.ua"],
      Baidu: ["baidu.cn", "baidu.co.th", "baidu.com"]
    },
    engine: ["Google", "Bing", "Yahoo"],
    "social-source": ["facebook", "twitter", "linkedin", "youtube", "instagram", "tumblr", "pinterest", "slideshare", "digg", "reddit", "stumbleupon", "sphinn", "myspace", "propeller", "mixx", "fark", "tip'd", "triiibes", "livejournal", "technorati", "slashdot", "ning", "orkut", "mybloglog", "metacafe", "meebo", "squidoo", "wikipedia", "flickr", "slide", "plurk", "blogcatalog", "delicious", "knol", "links.hubspot.com", "friendfeed", "hootsuite", "cotweet", "seesmic", "quora", "xing", "vimeo", "hackernews"],
    "social-association": {
      Facebook: ["facebook.com", "m.facebook.com", "mobile.facebook.com", "l.facebook.com", "lm.facebook.com", "web.facebook.com", "touch.facebook.com"],
      Twitter: ["twitter.com", "t.co"],
      LinkedIn: ["linkedin.at", "linkedin.cn", "linkedin.com", "lnkd.in"],
      Pinterest: ["pinterest.at", "pinterest.ca", "pinterest.ch", "pinterest.cl", "pinterest.co.kr", "pinterest.co.uk", "pinterest.com", "pinterest.com.au", "pinterest.com.mx", "pinterest.de", "pinterest.dk", "pinterest.es", "pinterest.fr", "pinterest.ie", "pinterest.it", "pinterest.jp", "pinterest.net", "pinterest.nz", "pinterest.ph", "pinterest.pt", "pinterest.ru", "pinterest.se"],
      YouTube: ["youtube.com", "m.youtube.com"],
      Instagram: ["instagram.com", "m.instagram.com", "l.instagram.com", "lm.instagram.com"],
      Reddit: ["reddit.com"],
      Quora: ["quora.com"],
      TikTok: ["tiktok.com"],
      Weibo: ["weibo.cn", "weibo.com"]
    },
    "engine-domains": ["100searchengines.com", "20searchengines.com", "21searchengines.com", "22searchengines.com", "23searchengines.com", "24searchengines.com", "25searchengines.com", "26searchengines.com", "27searchengines.com", "28searchengines.com", "29searchengines.com", "30searchengines.com", "31searchengines.com", "32searchengines.com", "33searchengines.com", "34searchengines.com", "35searchengines.com", "36searchengines.com", "37searchengines.com", "38searchengines.com", "39searchengines.com", "40searchengines.com", "41searchengines.com", "42searchengines.com", "43searchengines.com", "44searchengines.com", "45searchengines.com", "46searchengines.com", "47searchengines.com", "48searchengines.com", "49searchengines.com", "4loot.com", "50searchengines.com", "51searchengines.com", "52searchengines.com", "53searchengines.com", "54searchengines.com", "55searchengines.com", "56searchengines.com", "57searchengines.com", "58searchengines.com", "59searchengines.com", "60searchengines.com", "61searchengines.com", "62searchengines.com", "63searchengines.com", "64searchengines.com", "65searchengines.com", "66searchengines.com", "67searchengines.com", "68searchengines.com", "69searchengines.com", "70searchengines.com", "71searchengines.com", "72searchengines.com", "73searchengines.com", "74searchengines.com", "75searchengines.com", "76searchengines.com", "77searchengines.com", "78searchengines.com", "79searchengines.com", "80searchengines.com", "81searchengines.com", "82searchengines.com", "83searchengines.com", "84searchengines.com", "85searchengines.com", "86searchengines.com", "87searchengines.com", "88searchengines.com", "89searchengines.com", "90searchengines.com", "91searchengines.com", "92searchengines.com", "93searchengines.com", "94searchengines.com", "95searchengines.com", "96searchengines.com", "97searchengines.com", "98searchengines.com", "99searchengines.com", "alhea.com", "alot.com", "aol.com", "aolsearch.com", "ask.com", "avg.com", "b1.org", "babylon.com", "baidu.cn", "baidu.co.th", "baidu.com", "bing.com", "blackle.com", "blekko.com", "blindsearch.fejus.com", "bt.com", "centurylink.net", "charter.net", "clearch.org", "cnn.com", "daum.net", "devilfinder.com", "dmoz.org", "dogpile.com", "duckduckgo.com", "ekolay.net", "entireweb.com", "excite.com", "fast.ng", "findgala.com", "findsmarter.com", "findsmarter.ru", "g.cn", "genieo.com", "go.speedbit.com", "goofram.com", "google.ac", "google.ad", "google.ae", "google.al", "google.am", "google.as", "google.at", "google.az", "google.ba", "google.be", "google.bf", "google.bg", "google.bi", "google.bj", "google.bs", "google.bt", "google.by", "google.ca", "google.cat", "google.cc", "google.cd", "google.cf", "google.cg", "google.ch", "google.ci", "google.cl", "google.cm", "google.cn", "google.co.ao", "google.co.bw", "google.co.ck", "google.co.cr", "google.co.id", "google.co.il", "google.co.in", "google.co.jp", "google.co.ke", "google.co.kr", "google.co.ls", "google.co.ma", "google.co.mz", "google.co.nz", "google.co.th", "google.co.tz", "google.co.ug", "google.co.uk", "google.co.uz", "google.co.ve", "google.co.vi", "google.co.za", "google.co.zm", "google.co.zw", "google.com", "google.com.af", "google.com.ag", "google.com.ai", "google.com.ar", "google.com.au", "google.com.bd", "google.com.bh", "google.com.bn", "google.com.bo", "google.com.br", "google.com.by", "google.com.bz", "google.com.co", "google.com.cu", "google.com.cy", "google.com.do", "google.com.ec", "google.com.eg", "google.com.et", "google.com.fj", "google.com.gh", "google.com.gi", "google.com.gt", "google.com.hk", "google.com.jm", "google.com.kh", "google.com.kw", "google.com.lb", "google.com.lc", "google.com.ly", "google.com.mm", "google.com.mt", "google.com.mx", "google.com.my", "google.com.na", "google.com.nf", "google.com.ng", "google.com.ni", "google.com.np", "google.com.om", "google.com.pa", "google.com.pe", "google.com.pg", "google.com.ph", "google.com.pk", "google.com.pr", "google.com.py", "google.com.qa", "google.com.sa", "google.com.sb", "google.com.sg", "google.com.sl", "google.com.sv", "google.com.tj", "google.com.tn", "google.com.tr", "google.com.tw", "google.com.ua", "google.com.uy", "google.com.vc", "google.com.vn", "google.cv", "google.cz", "google.de", "google.dj", "google.dk", "google.dm", "google.dz", "google.ee", "google.es", "google.fi", "google.fm", "google.fr", "google.ga", "google.gd", "google.ge", "google.gf", "google.gg", "google.gl", "google.gm", "google.gp", "google.gr", "google.gy", "google.hn", "google.hr", "google.ht", "google.hu", "google.ie", "google.im", "google.io", "google.iq", "google.is", "google.it", "google.it.ao", "google.je", "google.jo", "google.kg", "google.ki", "google.kz", "google.la", "google.li", "google.lk", "google.lt", "google.lu", "google.lv", "google.md", "google.me", "google.mg", "google.mk", "google.ml", "google.mn", "google.ms", "google.mu", "google.mv", "google.mw", "google.ne", "google.nl", "google.no", "google.nr", "google.nu", "google.pl", "google.pn", "google.ps", "google.pt", "google.ro", "google.rs", "google.ru", "google.rw", "google.sc", "google.se", "google.sh", "google.si", "google.sk", "google.sm", "google.sn", "google.so", "google.st", "google.td", "google.tg", "google.tk", "google.tl", "google.tm", "google.tn", "google.to", "google.tt", "google.us", "google.vg", "google.vu", "google.ws", "heapr.com", "hotbot.com", "iboogie.com", "inbox.com", "incredibar.com", "info.com", "infospace.com", "isearch-123.com", "iseek.com", "izito.com", "k9safesearch.com", "kidrex.org", "kvasir.no", "lycos.com", "mamma.com", "monstercrawler.com", "myallsearch.com", "mynet.com", "mysearchresults.com", "myway.com", "mywebsearch.com", "naver.com", "out1000.com", "pageset.com", "portal.tds.net", "qone8.com", "qrobe.it", "rambler.ru", "redz.com", "safehomepage.com", "safesearch.net", "search-results.com", "search.centurylink.com", "search.com", "search.comcast.net", "search.earthlink.net", "search.frontier.com", "search.iminent.com", "search.incredimail.com", "search.juno.com", "search.mail.com", "search.orange.co.uk", "search.pch.com", "search.peoplepc.com", "search.quebles.com", "search.snap.do", "search.snapdo.com", "search.sweetim.com", "search.thunderstone.com", "search.toolbars.alexa.com", "search.twcc.com", "search.walla.co.il", "search.zonealarm.com", "searchalot.com", "searchassist.verizon.com", "searchfunmoods.com", "searchlock.com", "searchresults.verizon.com", "searchtool.com", "seznam.cz", "similarsitesearch.com", "so.com", "sogou.com", "spacetime3d.com", "spezify.com", "start.funmoods.com", "start.iminent.com", "start.toshiba.com", "startgoogle.startpagina.nl", "startpage.com", "startsiden.no", "surfcanyon.com", "swagbucks.com", "terra.com", "thenet1.com", "torcho.com", "tuvaro.com", "ustart.org", "virgilio.it", "voila.fr", "web.canoe.ca", "webcache.googleusercontent.com", "webcrawler.com", "webhelper.centurylink.com", "webssearches.com", "windstream.net", "wolframalpha.com", "wow.com", "wowway.net", "wp.pl", "www1.dlinksearch.com", "yabigo.com", "yahoo.co.jp", "yahoo.com", "yaimo.com", "yam.com", "yandex.by", "yandex.com", "yandex.com.tr", "yandex.kz", "yandex.ru", "yandex.ua", "yippy.com", "zapmeta.com", "ecosia.org", "qwant.com", "search.brave.com"],
    "social-domains": ["12seconds.tv", "4travel.jp", "advogato.org", "ameba.jp", "anobii.com", "answers.yahoo.com", "asmallworld.net", "avforums.com", "backtype.com", "badoo.com", "bebo.com", "bigadda.com", "bigtent.com", "biip.no", "blackplanet.com", "blog.seesaa.jp", "blogspot.com", "blogster.com", "blomotion.jp", "bolt.com", "brightkite.com", "buzznet.com", "cafemom.com", "care2.com", "classmates.com", "cloob.com", "collegeblender.com", "cyworld.co.kr", "cyworld.com.cn", "dailymotion.com", "delicious.com", "deviantart.com", "digg.com", "diigo.com", "disqus.com", "draugiem.lv", "facebook.com", "m.facebook.com", "faceparty.com", "fc2.com", "flickr.com", "flixster.com", "fotolog.com", "foursquare.com", "friendfeed.com", "friendsreunited.co.uk", "friendsreunited.com", "friendster.com", "fubar.com", "gaiaonline.com", "geni.com", "goodreads.com", "grono.net", "habbo.com", "hatena.ne.jp", "hi5.com", "hotnews.infoseek.co.jp", "hyves.nl", "ibibo.com", "identi.ca", "imeem.com", "instagram.com", "intensedebate.com", "irc-galleria.net", "iwiw.hu", "jaiku.com", "jp.myspace.com", "kaixin001.com", "kaixin002.com", "kakaku.com", "kanshin.com", "kozocom.com", "last.fm", "linkedin.com", "livejournal.com", "lnkd.in", "matome.naver.jp", "me2day.net", "meetup.com", "mister-wong.com", "mixi.jp", "mixx.com", "mouthshut.com", "mp.weixin.qq.com", "multiply.com", "mumsnet.com", "myheritage.com", "mylife.com", "myspace.com", "myyearbook.com", "nasza-klasa.pl", "netlog.com", "nettby.no", "netvibes.com", "nextdoor.com", "nicovideo.jp", "ning.com", "odnoklassniki.ru", "ok.ru", "orkut.com", "pakila.jp", "photobucket.com", "pinterest.at", "pinterest.be", "pinterest.ca", "pinterest.ch", "pinterest.cl", "pinterest.co", "pinterest.co.kr", "pinterest.co.uk", "pinterest.com", "pinterest.de", "pinterest.dk", "pinterest.es", "pinterest.fr", "pinterest.hu", "pinterest.ie", "pinterest.in", "pinterest.jp", "pinterest.nz", "pinterest.ph", "pinterest.pt", "pinterest.se", "plaxo.com", "plurk.com", "plus.google.com", "plus.url.google.com", "po.st", "reddit.com", "renren.com", "skyrock.com", "slideshare.net", "smcb.jp", "smugmug.com", "sonico.com", "studivz.net", "stumbleupon.com", "t.163.com", "t.co", "t.hexun.com", "t.ifeng.com", "t.people.com.cn", "t.qq.com", "t.sina.com.cn", "t.sohu.com", "tabelog.com", "tagged.com", "taringa.net", "thefancy.com", "toutiao.com", "tripit.com", "trombi.com", "trytrend.jp", "tuenti.com", "tumblr.com", "tiktok.com", "twine.com", "twitter.com", "uhuru.jp", "viadeo.com", "vimeo.com", "vk.com", "wayn.com", "weibo.com", "weourfamily.com", "wer-kennt-wen.de", "wordpress.com", "xanga.com", "xing.com", "yammer.com", "yaplog.jp", "yelp.co.uk", "yelp.com", "youku.com", "youtube.com", "yozm.daum.net", "yuku.com", "zhihu.com", "zooomr.com"]
  };

  if (!!!window.attributersettings) {
    window.attributersettings = {
      cookieLife: 365,
      customFields: []
    };
  }

  this.settings = {
    output: this.testLocalstorage() ? "localstorage" : "cookie",
    cookieLife: window.attributersettings.cookieLife || 365,
    storageName: "flaretrk",
    customFields: window.attributersettings.customFields || []
  };
  this.queryVars = {};
  this.data = false;
  console.log("attributer.io ready, version ".concat(_VERSION).concat(_BLOCKED ? " - UNLICENSED" : ""));
  this.processData();
  console.log("Attributer Starting Populate.");
  this.watchForm();
}
/**
 *  Ensure we have a name
 */
;

if (document.readyState !== "loading") {
  document.FlareTrk = new FlareTrk_Class();
} else {
  document.addEventListener("DOMContentLoaded", function (event) {
    document.FlareTrk = new FlareTrk_Class();
  });
}

