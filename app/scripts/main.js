// jshint ignore: start

var ngMap = {
    services: {},
    directives: {}
};

ngMap.services.Attr2Options = function() {
    return {
        filter: function(e) {
            var t = {};
            for (var n in e) n.match(/^\$/) || (t[n] = e[n]);
            return t
        },
        getOptions: function(attrs, scope) {
            var options = {};
            for (var key in attrs)
                if (attrs[key]) {
                    if (key.match(/^on[A-Z]/)) continue;
                    if (key.match(/ControlOptions$/)) continue;
                    var val = attrs[key];
                    try {
                        var num = Number(val);
                        if (isNaN(num)) throw "Not a number";
                        options[key] = num
                    } catch (err) {
                        try {
                            options[key] = JSON.parse(val)
                        } catch (err2) {
                            if (val.match(/^[A-Z][a-zA-Z0-9]+\(.*\)$/)) try {
                                var exp = "new google.maps." + val;
                                options[key] = eval(exp)
                            } catch (e) {
                                options[key] = val
                            } else if (val.match(/^[A-Z][a-zA-Z0-9]+\.[A-Z]+$/)) try {
                                options[key] = scope.$eval("google.maps." + val)
                            } catch (e) {
                                options[key] = val
                            } else if (val.match(/^[A-Z]+$/)) try {
                                var capitializedKey = key.charAt(0).toUpperCase() + key.slice(1);
                                options[key] = scope.$eval("google.maps." + capitializedKey + "." + val)
                            } catch (e) {
                                options[key] = val
                            } else options[key] = val
                        }
                    }
                }
                //options['style'] = [{featureType:"landscape",stylers:[{saturation:-100},{lightness:65},{visibility:"on"}]},{featureType:"poi",stylers:[{saturation:-100},{lightness:51},{visibility:"simplified"}]},{featureType:"road.highway",stylers:[{saturation:-100},{visibility:"simplified"}]},{featureType:"road.arterial",stylers:[{saturation:-100},{lightness:30},{visibility:"on"}]},{featureType:"road.local",stylers:[{saturation:-100},{lightness:40},{visibility:"on"}]},{featureType:"transit",stylers:[{saturation:-100},{visibility:"simplified"}]},{featureType:"administrative.province",stylers:[{visibility:"off"}]/**/},{featureType:"administrative.locality",stylers:[{visibility:"off"}]},{featureType:"administrative.neighborhood",stylers:[{visibility:"on"}]/**/},{featureType:"water",elementType:"labels",stylers:[{visibility:"on"},{lightness:-25},{saturation:-100}]},{featureType:"water",elementType:"geometry",stylers:[{hue:"#ffff00"},{lightness:-25},{saturation:-97}]}]
            return options
        },
        getEvents: function(e, t) {
            var n = {},
                r = function(e) {
                    return "_" + e.toLowerCase()
                },
                o = function(t) {
                    var n = t.match(/([^\(]+)\(([^\)]*)\)/),
                        r = n[1],
                        o = n[2].replace(/event[ ,]*/, ""),
                        i = e.$eval("[" + o + "]");
                    return function(t) {
                        e[r].apply(this, [t].concat(i))
                    }
                };
            for (var i in t)
                if (t[i]) {
                    if (!i.match(/^on[A-Z]/)) continue;
                    var a = i.replace(/^on/, "");
                    a = a.charAt(0).toLowerCase() + a.slice(1), a = a.replace(/([A-Z])/g, r);
                    var s = t[i];
                    n[a] = new o(s)
                }
            return n
        },
        getControlOptions: function(e) {
            var t = {};
            if ("object" != typeof e) return !1;
            for (var n in e)
                if (e[n]) {
                    if (!n.match(/(.*)ControlOptions$/)) continue;
                    var r = e[n],
                        o = r.replace(/'/g, '"');
                    o = o.replace(/([^"]+)|("[^"]+")/g, function(e, t, n) {
                        return t ? t.replace(/([a-zA-Z0-9]+?):/g, '"$1":') : n
                    });
                    try {
                        var i = JSON.parse(o);
                        for (var a in i)
                            if (i[a]) {
                                var s = i[a];
                                if ("string" == typeof s ? s = s.toUpperCase() : "mapTypeIds" === a && (s = s.map(function(e) {
                                    return google.maps.MapTypeId[e.toUpperCase()]
                                })), "style" === a) {
                                    var p = n.charAt(0).toUpperCase() + n.slice(1),
                                        c = p.replace(/Options$/, "") + "Style";
                                    i[a] = google.maps[c][s]
                                } else i[a] = "position" === a ? google.maps.ControlPosition[s] : s
                            }
                        t[n] = i
                    } catch (l) {}
                }
            return t
        }
    }
}, ngMap.services.GeoCoder = function(e) {
    return {
        geocode: function(t) {
            var n = e.defer(),
                r = new google.maps.Geocoder;
            return r.geocode(t, function(e, t) {
                t == google.maps.GeocoderStatus.OK ? n.resolve(e) : n.reject("Geocoder failed due to: " + t)
            }), n.promise
        }
    }
}, ngMap.services.GeoCoder.$inject = ["$q"], ngMap.services.NavigatorGeolocation = function(e) {
    return {
        getCurrentPosition: function() {
            var t = e.defer();
            return navigator.geolocation ? navigator.geolocation.getCurrentPosition(function(e) {
                t.resolve(e)
            }, function(e) {
                t.reject(e)
            }) : t.reject("Browser Geolocation service failed."), t.promise
        },
        watchPosition: function() {
            return "TODO"
        },
        clearWatch: function() {
            return "TODO"
        }
    }
}, ngMap.services.NavigatorGeolocation.$inject = ["$q"], ngMap.services.StreetView = function(e) {
    return {
        getPanorama: function(t, n) {
            n = n || t.getCenter();
            var r = e.defer(),
                o = new google.maps.StreetViewService;
            return o.getPanoramaByLocation(n || t.getCenter, 100, function(e, t) {
                r.resolve(t === google.maps.StreetViewStatus.OK ? e.location.pano : !1)
            }), r.promise
        },
        setPanorama: function(e, t) {
            var n = new google.maps.StreetViewPanorama(e.getDiv(), {
                enableCloseButton: !0
            });
            n.setPano(t)
        }
    }
}, ngMap.services.StreetView.$inject = ["$q"], ngMap.directives.infoWindow = function(Attr2Options) {
    var parser = Attr2Options;
    return {
        restrict: "AE",
        require: "^map",
        link: function(scope, element, attrs, mapController) {
            var filtered = parser.filter(attrs);
            scope.google = google;
            var options = parser.getOptions(filtered, scope);
            options.pixelOffset && (options.pixelOffset = google.maps.Size.apply(this, options.pixelOffset));
            var infoWindow = new google.maps.InfoWindow(options);
            infoWindow.contents = element.html();
            var events = parser.getEvents(scope, filtered);
            for (var eventName in events) eventName && google.maps.event.addListener(infoWindow, eventName, events[eventName]);
            mapController.infoWindows.push(infoWindow), element.css({
                display: "none"
            }), scope.showInfoWindow = function(event, id, options) {
                var infoWindow = scope.infoWindows[id],
                    contents = infoWindow.contents,
                    matches = contents.match(/\[\[[^\]]+\]\]/g);
                if (matches)
                    for (var i = 0, length = matches.length; length > i; i++) {
                        var expression = matches[i].replace(/\[\[/, "").replace(/\]\]/, "");
                        try {
                            contents = contents.replace(matches[i], eval(expression))
                        } catch (e) {
                            expression = "options." + expression, contents = contents.replace(matches[i], eval(expression))
                        }
                    }
                infoWindow.setContent(contents), infoWindow.open(scope.map, this)
            }
        }
    }
}, ngMap.directives.infoWindow.$inject = ["Attr2Options"], ngMap.directives.map = function(e, t, n, r) {
    var o = e;
    return {
        restrict: "AE",
        controller: ngMap.directives.MapController,
        link: function(e, t, i, a) {
            e.google = google;
            var s = document.createElement("div");
            s.style.width = "100%", s.style.height = "100%", t.prepend(s), e.map = new google.maps.Map(s, {});
            var p = o.filter(i),
                c = o.getOptions(p, e),
                l = o.getControlOptions(p),
                g = o.getEvents(e, p),
                v = angular.extend(c, l);
            if (v.zoom = v.zoom || 15, v.center instanceof Array) {
                var u = v.center[0],
                    f = v.center[1];
                a.initMap(v, new google.maps.LatLng(u, f), g)
            } else "string" == typeof v.center ? r.geocode({
                address: v.center
            }).then(function(e) {
                a.initMap(v, e[0].geometry.location, g)
            }) : v.center || n.getCurrentPosition().then(function(e) {
                var t = e.coords.latitude,
                    n = e.coords.longitude;
                a.initMap(v, new google.maps.LatLng(t, n), g)
            }, function() {
                if (v.geoFallbackCenter instanceof Array) {
                    var e = v.geoFallbackCenter[0],
                        t = v.geoFallbackCenter[1];
                    a.initMap(v, new google.maps.LatLng(e, t), g)
                } else a.initMap(v, new google.maps.LatLng(0, 0), g)
            });
            var m = a.initMarkers();
            e.$emit("markersInitialized", m);
            var d = a.initShapes();
            e.$emit("shapesInitialized", d);
            var h = a.initInfoWindows();
            e.$emit("infoWindowsInitialized", [h, e.showInfoWindow]);
            var k = a.initMarkerClusterer();
            e.$emit("markerClustererInitialized", k)
        }
    }
}, ngMap.directives.map.$inject = ["Attr2Options", "$parse", "NavigatorGeolocation", "GeoCoder", "$compile"], ngMap.directives.MapController = function(e) {
    this.controls = {}, this.markers = [], this.shapes = [], this.infoWindows = [], this.markerClusterer = null, this.initMap = function(t, n, r) {
        t.center = null, e.map.setOptions(t), e.map.setCenter(n);
        for (var o in r) o && google.maps.event.addListener(e.map, o, r[o]);
        e.$emit("mapInitialized", e.map)
    }, this.addMarker = function(t) {
        t.setMap(e.map), t.centered && e.map.setCenter(t.position);
        var n = Object.keys(e.markers).length;
        e.markers[t.id || n] = t
    }, this.initMarkers = function() {
        e.markers = {};
        for (var t = 0; t < this.markers.length; t++) {
            var n = this.markers[t];
            this.addMarker(n)
        }
        return e.markers
    }, this.addShape = function(t) {
        t.setMap(e.map);
        var n = Object.keys(e.shapes).length;
        e.shapes[t.id || n] = t
    }, this.initShapes = function() {
        e.shapes = {};
        for (var t = 0; t < this.shapes.length; t++) {
            var n = this.shapes[t];
            n.setMap(e.map), e.shapes[n.id || t] = n
        }
        return e.shapes
    }, this.initInfoWindows = function() {
        e.infoWindows = {};
        for (var t = 0; t < this.infoWindows.length; t++) {
            var n = this.infoWindows[t];
            e.infoWindows[n.id || t] = n
        }
        return e.infoWindows
    }, this.initMarkerClusterer = function() {
        return this.markerClusterer && (e.markerClusterer = new MarkerClusterer(e.map, this.markerClusterer.data, this.markerClusterer.options)), e.markerClusterer
    }
}, ngMap.directives.MapController.$inject = ["$scope"], ngMap.directives.marker = function(e, t, n) {
    var r = e;
    return {
        restrict: "AE",
        require: "^map",
        link: function(e, o, i, a) {
            var s = r.filter(i);
            e.google = google;
            var p = r.getOptions(s, e),
                c = r.getEvents(e, s),
                l = function(e, t) {
                    var n = new google.maps.Marker(e);
                    Object.keys(t).length > 0;
                    for (var r in t) r && google.maps.event.addListener(n, r, t[r]);
                    return n
                };
            if (p.position instanceof Array) {
                var g = p.position[0],
                    v = p.position[1];
                p.position = new google.maps.LatLng(g, v);
                var u = l(p, c);
                p.ngRepeat ? a.addMarker(u) : a.markers.push(u)
            } else if ("string" == typeof p.position) {
                var f = p.position;
                f.match(/^current/i) ? n.getCurrentPosition().then(function(e) {
                    var t = e.coords.latitude,
                        n = e.coords.longitude;
                    p.position = new google.maps.LatLng(t, n);
                    var r = l(p, c);
                    a.addMarker(r)
                }) : t.geocode({
                    address: p.position
                }).then(function(e) {
                    var t = e[0].geometry.location;
                    p.position = t;
                    var n = l(p, c);
                    a.addMarker(n)
                })
            }
        }
    }
}, ngMap.directives.marker.$inject = ["Attr2Options", "GeoCoder", "NavigatorGeolocation"], ngMap.directives.markerClusterer = function(e) {
    var t = e;
    return {
        restrict: "AE",
        require: "^map",
        link: function(e, n, r, o) {
            var i = e.$eval(r.markers);
            delete r.markers;
            for (var a = t.filter(r), s = [], p = 0; p < i.length; p++) {
                var c = i[p],
                    l = c.position[0],
                    g = c.position[1];
                c.position = new google.maps.LatLng(l, g);
                var v = new google.maps.Marker(c),
                    u = t.getEvents(e, c);
                for (var f in u) f && google.maps.event.addListener(v, f, u[f]);
                s.push(v)
            }
            o.markers = s, o.markerClusterer = {
                data: s,
                options: a
            }
        }
    }
}, ngMap.directives.markerClusterer.$inject = ["Attr2Options"], ngMap.directives.shape = function(e) {
    var t = e,
        n = function(e) {
            return e[0] && e[0] instanceof Array ? e.map(function(e) {
                return new google.maps.LatLng(e[0], e[1])
            }) : new google.maps.LatLng(e[0], e[1])
        },
        r = function(e) {
            var t = n(e);
            return new google.maps.LatLngBounds(t[0], t[1])
        },
        o = function(e, t) {
            switch (e) {
                case "circle":
                    return t.center = n(t.center), new google.maps.Circle(t);
                case "polygon":
                    return t.paths = n(t.paths), new google.maps.Polygon(t);
                case "polyline":
                    return t.path = n(t.path), new google.maps.Polyline(t);
                case "rectangle":
                    return t.bounds = r(t.bounds), new google.maps.Rectangle(t);
                case "groundOverlay":
                case "image":
                    var o = t.url,
                        i = r(t.bounds),
                        a = {
                            opacity: t.opacity,
                            clickable: t.clickable,
                            id: t.id
                        };
                    return new google.maps.GroundOverlay(o, i, a)
            }
            return null
        };
    return {
        restrict: "AE",
        require: "^map",
        link: function(e, n, r, i) {
            var a = t.filter(r),
                s = a.name;
            delete a.name;
            var p = t.getOptions(a),
                c = o(s, p);
            p.ngRepeat ? i.addShape(c) : c && i.shapes.push(c);
            var l = t.getEvents(e, a);
            for (var g in l) l[g] && google.maps.event.addListener(c, g, l[g])
        }
    }
}, ngMap.directives.shape.$inject = ["Attr2Options"];
var ngMapModule = angular.module("ngMap", []);
for (var key in ngMap.services) ngMapModule.service(key, ngMap.services[key]);
for (var key in ngMap.directives) "MapController" != key && ngMapModule.directive(key, ngMap.directives[key]);

// jshint ignore: end

// jshint ignore: start
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/


(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

// jshint ignore: end
// jshint ignore: start
// Reveal Animations When Scrolling — WOW.js
// https://github.com/matthieua/WOW

(function() {
  var MutationObserver, Util, WeakMap, getComputedStyle, getComputedStyleRX,
	__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
	__indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Util = (function() {
	function Util() {}

	Util.prototype.extend = function(custom, defaults) {
	  var key, value;
	  for (key in defaults) {
		value = defaults[key];
		if (custom[key] == null) {
		  custom[key] = value;
		}
	  }
	  return custom;
	};

	Util.prototype.isMobile = function(agent) {
	  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(agent);
	};

	Util.prototype.addEvent = function(elem, event, fn) {
	  if (elem.addEventListener != null) {
		return elem.addEventListener(event, fn, false);
	  } else if (elem.attachEvent != null) {
		return elem.attachEvent("on" + event, fn);
	  } else {
		return elem[event] = fn;
	  }
	};

	Util.prototype.removeEvent = function(elem, event, fn) {
	  if (elem.removeEventListener != null) {
		return elem.removeEventListener(event, fn, false);
	  } else if (elem.detachEvent != null) {
		return elem.detachEvent("on" + event, fn);
	  } else {
		return delete elem[event];
	  }
	};

	Util.prototype.innerHeight = function() {
	  if ('innerHeight' in window) {
		return window.innerHeight;
	  } else {
		return document.documentElement.clientHeight;
	  }
	};

	return Util;

  })();

  WeakMap = this.WeakMap || this.MozWeakMap || (WeakMap = (function() {
	function WeakMap() {
	  this.keys = [];
	  this.values = [];
	}

	WeakMap.prototype.get = function(key) {
	  var i, item, _i, _len, _ref;
	  _ref = this.keys;
	  for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
		item = _ref[i];
		if (item === key) {
		  return this.values[i];
		}
	  }
	};

	WeakMap.prototype.set = function(key, value) {
	  var i, item, _i, _len, _ref;
	  _ref = this.keys;
	  for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
		item = _ref[i];
		if (item === key) {
		  this.values[i] = value;
		  return;
		}
	  }
	  this.keys.push(key);
	  return this.values.push(value);
	};

	return WeakMap;

  })());

  MutationObserver = this.MutationObserver || this.WebkitMutationObserver || this.MozMutationObserver || (MutationObserver = (function() {
	function MutationObserver() {
	  if (typeof console !== "undefined" && console !== null) {
		console.warn('MutationObserver is not supported by your browser.');
	  }
	  if (typeof console !== "undefined" && console !== null) {
		console.warn('WOW.js cannot detect dom mutations, please call .sync() after loading new content.');
	  }
	}

	MutationObserver.notSupported = true;

	MutationObserver.prototype.observe = function() {};

	return MutationObserver;

  })());

  getComputedStyle = this.getComputedStyle || function(el, pseudo) {
	this.getPropertyValue = function(prop) {
	  var _ref;
	  if (prop === 'float') {
		prop = 'styleFloat';
	  }
	  if (getComputedStyleRX.test(prop)) {
		prop.replace(getComputedStyleRX, function(_, char) {
		  return char.toUpperCase();
		});
	  }
	  return ((_ref = el.currentStyle) != null ? _ref[prop] : void 0) || null;
	};
	return this;
  };

  getComputedStyleRX = /(\-([a-z]){1})/g;

  this.WOW = (function() {
	WOW.prototype.defaults = {
	  boxClass: 'wow',
	  animateClass: 'animated',
	  offset: 0,
	  mobile: true,
	  live: true
	};

	function WOW(options) {
	  if (options == null) {
		options = {};
	  }
	  this.scrollCallback = __bind(this.scrollCallback, this);
	  this.scrollHandler = __bind(this.scrollHandler, this);
	  this.start = __bind(this.start, this);
	  this.scrolled = true;
	  this.config = this.util().extend(options, this.defaults);
	  this.animationNameCache = new WeakMap();
	}

	WOW.prototype.init = function() {
	  var _ref;
	  this.element = window.document.documentElement;
	  if ((_ref = document.readyState) === "interactive" || _ref === "complete") {
		this.start();
	  } else {
		this.util().addEvent(document, 'DOMContentLoaded', this.start);
	  }
	  return this.finished = [];
	};

	WOW.prototype.start = function() {
	  var box, _i, _len, _ref;
	  this.stopped = false;
	  this.boxes = (function() {
		var _i, _len, _ref, _results;
		_ref = this.element.querySelectorAll("." + this.config.boxClass);
		_results = [];
		for (_i = 0, _len = _ref.length; _i < _len; _i++) {
		  box = _ref[_i];
		  _results.push(box);
		}
		return _results;
	  }).call(this);
	  this.all = (function() {
		var _i, _len, _ref, _results;
		_ref = this.boxes;
		_results = [];
		for (_i = 0, _len = _ref.length; _i < _len; _i++) {
		  box = _ref[_i];
		  _results.push(box);
		}
		return _results;
	  }).call(this);
	  if (this.boxes.length) {
		if (this.disabled()) {
		  this.resetStyle();
		} else {
		  _ref = this.boxes;
		  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
			box = _ref[_i];
			this.applyStyle(box, true);
		  }
		}
	  }
	  if (!this.disabled()) {
		this.util().addEvent(window, 'scroll', this.scrollHandler);
		this.util().addEvent(window, 'resize', this.scrollHandler);
		this.interval = setInterval(this.scrollCallback, 50);
	  }
	  if (this.config.live) {
		return new MutationObserver((function(_this) {
		  return function(records) {
			var node, record, _j, _len1, _results;
			_results = [];
			for (_j = 0, _len1 = records.length; _j < _len1; _j++) {
			  record = records[_j];
			  _results.push((function() {
				var _k, _len2, _ref1, _results1;
				_ref1 = record.addedNodes || [];
				_results1 = [];
				for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
				  node = _ref1[_k];
				  _results1.push(this.doSync(node));
				}
				return _results1;
			  }).call(_this));
			}
			return _results;
		  };
		})(this)).observe(document.body, {
		  childList: true,
		  subtree: true
		});
	  }
	};

	WOW.prototype.stop = function() {
	  this.stopped = true;
	  this.util().removeEvent(window, 'scroll', this.scrollHandler);
	  this.util().removeEvent(window, 'resize', this.scrollHandler);
	  if (this.interval != null) {
		return clearInterval(this.interval);
	  }
	};

	WOW.prototype.sync = function(element) {
	  if (MutationObserver.notSupported) {
		return this.doSync(this.element);
	  }
	};

	WOW.prototype.doSync = function(element) {
	  var box, _i, _len, _ref, _results;
	  if (element == null) {
		element = this.element;
	  }
	  if (element.nodeType !== 1) {
		return;
	  }
	  element = element.parentNode || element;
	  _ref = element.querySelectorAll("." + this.config.boxClass);
	  _results = [];
	  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
		box = _ref[_i];
		if (__indexOf.call(this.all, box) < 0) {
		  this.boxes.push(box);
		  this.all.push(box);
		  if (this.stopped || this.disabled()) {
			this.resetStyle();
		  } else {
			this.applyStyle(box, true);
		  }
		  _results.push(this.scrolled = true);
		} else {
		  _results.push(void 0);
		}
	  }
	  return _results;
	};

	WOW.prototype.show = function(box) {
	  this.applyStyle(box);
	  return box.className = "" + box.className + " " + this.config.animateClass;
	};

	WOW.prototype.applyStyle = function(box, hidden) {
	  var delay, duration, iteration;
	  duration = box.getAttribute('data-wow-duration');
	  delay = box.getAttribute('data-wow-delay');
	  iteration = box.getAttribute('data-wow-iteration');
	  return this.animate((function(_this) {
		return function() {
		  return _this.customStyle(box, hidden, duration, delay, iteration);
		};
	  })(this));
	};

	WOW.prototype.animate = (function() {
	  if ('requestAnimationFrame' in window) {
		return function(callback) {
		  return window.requestAnimationFrame(callback);
		};
	  } else {
		return function(callback) {
		  return callback();
		};
	  }
	})();

	WOW.prototype.resetStyle = function() {
	  var box, _i, _len, _ref, _results;
	  _ref = this.boxes;
	  _results = [];
	  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
		box = _ref[_i];
		_results.push(box.style.visibility = 'visible');
	  }
	  return _results;
	};

	WOW.prototype.customStyle = function(box, hidden, duration, delay, iteration) {
	  if (hidden) {
		this.cacheAnimationName(box);
	  }
	  box.style.visibility = hidden ? 'hidden' : 'visible';
	  if (duration) {
		this.vendorSet(box.style, {
		  animationDuration: duration
		});
	  }
	  if (delay) {
		this.vendorSet(box.style, {
		  animationDelay: delay
		});
	  }
	  if (iteration) {
		this.vendorSet(box.style, {
		  animationIterationCount: iteration
		});
	  }
	  this.vendorSet(box.style, {
		animationName: hidden ? 'none' : this.cachedAnimationName(box)
	  });
	  return box;
	};

	WOW.prototype.vendors = ["moz", "webkit"];

	WOW.prototype.vendorSet = function(elem, properties) {
	  var name, value, vendor, _results;
	  _results = [];
	  for (name in properties) {
		value = properties[name];
		elem["" + name] = value;
		_results.push((function() {
		  var _i, _len, _ref, _results1;
		  _ref = this.vendors;
		  _results1 = [];
		  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
			vendor = _ref[_i];
			_results1.push(elem["" + vendor + (name.charAt(0).toUpperCase()) + (name.substr(1))] = value);
		  }
		  return _results1;
		}).call(this));
	  }
	  return _results;
	};

	WOW.prototype.vendorCSS = function(elem, property) {
	  var result, style, vendor, _i, _len, _ref;
	  style = getComputedStyle(elem);
	  result = style.getPropertyCSSValue(property);
	  _ref = this.vendors;
	  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
		vendor = _ref[_i];
		result = result || style.getPropertyCSSValue("-" + vendor + "-" + property);
	  }
	  return result;
	};

	WOW.prototype.animationName = function(box) {
	  var animationName;
	  try {
		animationName = this.vendorCSS(box, 'animation-name').cssText;
	  } catch (_error) {
		animationName = getComputedStyle(box).getPropertyValue('animation-name');
	  }
	  if (animationName === 'none') {
		return '';
	  } else {
		return animationName;
	  }
	};

	WOW.prototype.cacheAnimationName = function(box) {
	  return this.animationNameCache.set(box, this.animationName(box));
	};

	WOW.prototype.cachedAnimationName = function(box) {
	  return this.animationNameCache.get(box);
	};

	WOW.prototype.scrollHandler = function() {
	  return this.scrolled = true;
	};

	WOW.prototype.scrollCallback = function() {
	  var box;
	  if (this.scrolled) {
		this.scrolled = false;
		this.boxes = (function() {
		  var _i, _len, _ref, _results;
		  _ref = this.boxes;
		  _results = [];
		  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
			box = _ref[_i];
			if (!(box)) {
			  continue;
			}
			if (this.isVisible(box)) {
			  this.show(box);
			  continue;
			}
			_results.push(box);
		  }
		  return _results;
		}).call(this);
		if (!(this.boxes.length || this.config.live)) {
		  return this.stop();
		}
	  }
	};

	WOW.prototype.offsetTop = function(element) {
	  var top;
	  while (element.offsetTop === void 0) {
		element = element.parentNode;
	  }
	  top = element.offsetTop;
	  while (element = element.offsetParent) {
		top += element.offsetTop;
	  }
	  return top;
	};

	WOW.prototype.isVisible = function(box) {
	  var bottom, offset, top, viewBottom, viewTop;
	  offset = box.getAttribute('data-wow-offset') || this.config.offset;
	  viewTop = window.pageYOffset;
	  viewBottom = viewTop + Math.min(this.element.clientHeight, this.util().innerHeight()) - offset;
	  top = this.offsetTop(box);
	  bottom = top + box.clientHeight;
	  return top <= viewBottom && bottom >= viewTop;
	};

	WOW.prototype.util = function() {
	  return this._util != null ? this._util : this._util = new Util();
	};

	WOW.prototype.disabled = function() {
	  return !this.config.mobile && this.util().isMobile(navigator.userAgent);
	};

	return WOW;

  })();

}).call(this);

// jshint ignore: end
// jshint ignore: start

var blossom = angular.module('blossom', ['ngMap']);
blossom.directive('body', function(){

	return {

		restrict: 'E',
		
		link: function(scope, element, attrs){

			var img = new Image();
			img.src = attrs.background;

			img.onload = function(){
				
				element.addClass('content-loaded');

			}

		}

	};

});

blossom.controller('footerCtrl', ['$scope', function($scope){

    var date = new Date();
    $scope.year = date.getFullYear();

}]);
blossom.controller('mapCtrl', ['$scope', function($scope){
    
    $scope.mapstyle = [{"featureType":"landscape","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"stylers":[{"hue":"#00aaff"},{"saturation":-100},{"gamma":2.15},{"lightness":12}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"visibility":"on"},{"lightness":24}]},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":57}]}];

}]);