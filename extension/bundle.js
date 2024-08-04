// /components/webcomponentsjs/webcomponents.js
/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
// @version 0.7.24
(function() {
  window.WebComponents = window.WebComponents || {
    flags: {}
  };
  var file = "webcomponents.js";
  var script = document.querySelector('script[src*="' + file + '"]');
  var flags = {};
  if (!flags.noOpts) {
    location.search.slice(1).split("&").forEach(function(option) {
      var parts = option.split("=");
      var match;
      if (parts[0] && (match = parts[0].match(/wc-(.+)/))) {
        flags[match[1]] = parts[1] || true;
      }
    });
    if (script) {
      for (var i = 0, a; a = script.attributes[i]; i++) {
        if (a.name !== "src") {
          flags[a.name] = a.value || true;
        }
      }
    }
    if (flags.log && flags.log.split) {
      var parts = flags.log.split(",");
      flags.log = {};
      parts.forEach(function(f) {
        flags.log[f] = true;
      });
    } else {
      flags.log = {};
    }
  }
  flags.shadow = flags.shadow || flags.shadowdom || flags.polyfill;
  if (flags.shadow === "native") {
    flags.shadow = false;
  } else {
    flags.shadow = flags.shadow || !HTMLElement.prototype.createShadowRoot;
  }
  if (flags.register) {
    window.CustomElements = window.CustomElements || {
      flags: {}
    };
    window.CustomElements.flags.register = flags.register;
  }
  WebComponents.flags = flags;
})();

if (WebComponents.flags.shadow) {
  if (typeof WeakMap === "undefined") {
    (function() {
      var defineProperty = Object.defineProperty;
      var counter = Date.now() % 1e9;
      var WeakMap = function() {
        this.name = "__st" + (Math.random() * 1e9 >>> 0) + (counter++ + "__");
      };
      WeakMap.prototype = {
        set: function(key, value) {
          var entry = key[this.name];
          if (entry && entry[0] === key) entry[1] = value; else defineProperty(key, this.name, {
            value: [ key, value ],
            writable: true
          });
          return this;
        },
        get: function(key) {
          var entry;
          return (entry = key[this.name]) && entry[0] === key ? entry[1] : undefined;
        },
        "delete": function(key) {
          var entry = key[this.name];
          if (!entry || entry[0] !== key) return false;
          entry[0] = entry[1] = undefined;
          return true;
        },
        has: function(key) {
          var entry = key[this.name];
          if (!entry) return false;
          return entry[0] === key;
        }
      };
      window.WeakMap = WeakMap;
    })();
  }
  window.ShadowDOMPolyfill = {};
  (function(scope) {
    "use strict";
    var constructorTable = new WeakMap();
    var nativePrototypeTable = new WeakMap();
    var wrappers = Object.create(null);
    function detectEval() {
      if (typeof chrome !== "undefined" && chrome.app && chrome.app.runtime) {
        return false;
      }
      if (navigator.getDeviceStorage) {
        return false;
      }
      try {
        var f = new Function("return true;");
        return f();
      } catch (ex) {
        return false;
      }
    }
    var hasEval = detectEval();
    function assert(b) {
      if (!b) throw new Error("Assertion failed");
    }
    var defineProperty = Object.defineProperty;
    var getOwnPropertyNames = Object.getOwnPropertyNames;
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    function mixin(to, from) {
      var names = getOwnPropertyNames(from);
      for (var i = 0; i < names.length; i++) {
        var name = names[i];
        defineProperty(to, name, getOwnPropertyDescriptor(from, name));
      }
      return to;
    }
    function mixinStatics(to, from) {
      var names = getOwnPropertyNames(from);
      for (var i = 0; i < names.length; i++) {
        var name = names[i];
        switch (name) {
         case "arguments":
         case "caller":
         case "length":
         case "name":
         case "prototype":
         case "toString":
          continue;
        }
        defineProperty(to, name, getOwnPropertyDescriptor(from, name));
      }
      return to;
    }
    function oneOf(object, propertyNames) {
      for (var i = 0; i < propertyNames.length; i++) {
        if (propertyNames[i] in object) return propertyNames[i];
      }
    }
    var nonEnumerableDataDescriptor = {
      value: undefined,
      configurable: true,
      enumerable: false,
      writable: true
    };
    function defineNonEnumerableDataProperty(object, name, value) {
      nonEnumerableDataDescriptor.value = value;
      defineProperty(object, name, nonEnumerableDataDescriptor);
    }
    getOwnPropertyNames(window);
    function getWrapperConstructor(node, opt_instance) {
      var nativePrototype = node.__proto__ || Object.getPrototypeOf(node);
      if (isFirefox) {
        try {
          getOwnPropertyNames(nativePrototype);
        } catch (error) {
          nativePrototype = nativePrototype.__proto__;
        }
      }
      var wrapperConstructor = constructorTable.get(nativePrototype);
      if (wrapperConstructor) return wrapperConstructor;
      var parentWrapperConstructor = getWrapperConstructor(nativePrototype);
      var GeneratedWrapper = createWrapperConstructor(parentWrapperConstructor);
      registerInternal(nativePrototype, GeneratedWrapper, opt_instance);
      return GeneratedWrapper;
    }
    function addForwardingProperties(nativePrototype, wrapperPrototype) {
      installProperty(nativePrototype, wrapperPrototype, true);
    }
    function registerInstanceProperties(wrapperPrototype, instanceObject) {
      installProperty(instanceObject, wrapperPrototype, false);
    }
    var isFirefox = /Firefox/.test(navigator.userAgent);
    var dummyDescriptor = {
      get: function() {},
      set: function(v) {},
      configurable: true,
      enumerable: true
    };
    function isEventHandlerName(name) {
      return /^on[a-z]+$/.test(name);
    }
    function isIdentifierName(name) {
      return /^[a-zA-Z_$][a-zA-Z_$0-9]*$/.test(name);
    }
    function getGetter(name) {
      return hasEval && isIdentifierName(name) ? new Function("return this.__impl4cf1e782hg__." + name) : function() {
        return this.__impl4cf1e782hg__[name];
      };
    }
    function getSetter(name) {
      return hasEval && isIdentifierName(name) ? new Function("v", "this.__impl4cf1e782hg__." + name + " = v") : function(v) {
        this.__impl4cf1e782hg__[name] = v;
      };
    }
    function getMethod(name) {
      return hasEval && isIdentifierName(name) ? new Function("return this.__impl4cf1e782hg__." + name + ".apply(this.__impl4cf1e782hg__, arguments)") : function() {
        return this.__impl4cf1e782hg__[name].apply(this.__impl4cf1e782hg__, arguments);
      };
    }
    function getDescriptor(source, name) {
      try {
        if (source === window && name === "showModalDialog") {
          return dummyDescriptor;
        }
        return Object.getOwnPropertyDescriptor(source, name);
      } catch (ex) {
        return dummyDescriptor;
      }
    }
    var isBrokenSafari = function() {
      var descr = Object.getOwnPropertyDescriptor(Node.prototype, "nodeType");
      return descr && !descr.get && !descr.set;
    }();
    function installProperty(source, target, allowMethod, opt_blacklist) {
      var names = getOwnPropertyNames(source);
      for (var i = 0; i < names.length; i++) {
        var name = names[i];
        if (name === "polymerBlackList_") continue;
        if (name in target) continue;
        if (source.polymerBlackList_ && source.polymerBlackList_[name]) continue;
        if (isFirefox) {
          source.__lookupGetter__(name);
        }
        var descriptor = getDescriptor(source, name);
        var getter, setter;
        if (typeof descriptor.value === "function") {
          if (allowMethod) {
            target[name] = getMethod(name);
          }
          continue;
        }
        var isEvent = isEventHandlerName(name);
        if (isEvent) getter = scope.getEventHandlerGetter(name); else getter = getGetter(name);
        if (descriptor.writable || descriptor.set || isBrokenSafari) {
          if (isEvent) setter = scope.getEventHandlerSetter(name); else setter = getSetter(name);
        }
        var configurable = isBrokenSafari || descriptor.configurable;
        defineProperty(target, name, {
          get: getter,
          set: setter,
          configurable: configurable,
          enumerable: descriptor.enumerable
        });
      }
    }
    function register(nativeConstructor, wrapperConstructor, opt_instance) {
      if (nativeConstructor == null) {
        return;
      }
      var nativePrototype = nativeConstructor.prototype;
      registerInternal(nativePrototype, wrapperConstructor, opt_instance);
      mixinStatics(wrapperConstructor, nativeConstructor);
    }
    function registerInternal(nativePrototype, wrapperConstructor, opt_instance) {
      var wrapperPrototype = wrapperConstructor.prototype;
      assert(constructorTable.get(nativePrototype) === undefined);
      constructorTable.set(nativePrototype, wrapperConstructor);
      nativePrototypeTable.set(wrapperPrototype, nativePrototype);
      addForwardingProperties(nativePrototype, wrapperPrototype);
      if (opt_instance) registerInstanceProperties(wrapperPrototype, opt_instance);
      defineNonEnumerableDataProperty(wrapperPrototype, "constructor", wrapperConstructor);
      wrapperConstructor.prototype = wrapperPrototype;
    }
    function isWrapperFor(wrapperConstructor, nativeConstructor) {
      return constructorTable.get(nativeConstructor.prototype) === wrapperConstructor;
    }
    function registerObject(object) {
      var nativePrototype = Object.getPrototypeOf(object);
      var superWrapperConstructor = getWrapperConstructor(nativePrototype);
      var GeneratedWrapper = createWrapperConstructor(superWrapperConstructor);
      registerInternal(nativePrototype, GeneratedWrapper, object);
      return GeneratedWrapper;
    }
    function createWrapperConstructor(superWrapperConstructor) {
      function GeneratedWrapper(node) {
        superWrapperConstructor.call(this, node);
      }
      var p = Object.create(superWrapperConstructor.prototype);
      p.constructor = GeneratedWrapper;
      GeneratedWrapper.prototype = p;
      return GeneratedWrapper;
    }
    function isWrapper(object) {
      return object && object.__impl4cf1e782hg__;
    }
    function isNative(object) {
      return !isWrapper(object);
    }
    function wrap(impl) {
      if (impl === null) return null;
      assert(isNative(impl));
      var wrapper = impl.__wrapper8e3dd93a60__;
      if (wrapper != null) {
        return wrapper;
      }
      return impl.__wrapper8e3dd93a60__ = new (getWrapperConstructor(impl, impl))(impl);
    }
    function unwrap(wrapper) {
      if (wrapper === null) return null;
      assert(isWrapper(wrapper));
      return wrapper.__impl4cf1e782hg__;
    }
    function unsafeUnwrap(wrapper) {
      return wrapper.__impl4cf1e782hg__;
    }
    function setWrapper(impl, wrapper) {
      wrapper.__impl4cf1e782hg__ = impl;
      impl.__wrapper8e3dd93a60__ = wrapper;
    }
    function unwrapIfNeeded(object) {
      return object && isWrapper(object) ? unwrap(object) : object;
    }
    function wrapIfNeeded(object) {
      return object && !isWrapper(object) ? wrap(object) : object;
    }
    function rewrap(node, wrapper) {
      if (wrapper === null) return;
      assert(isNative(node));
      assert(wrapper === undefined || isWrapper(wrapper));
      node.__wrapper8e3dd93a60__ = wrapper;
    }
    var getterDescriptor = {
      get: undefined,
      configurable: true,
      enumerable: true
    };
    function defineGetter(constructor, name, getter) {
      getterDescriptor.get = getter;
      defineProperty(constructor.prototype, name, getterDescriptor);
    }
    function defineWrapGetter(constructor, name) {
      defineGetter(constructor, name, function() {
        return wrap(this.__impl4cf1e782hg__[name]);
      });
    }
    function forwardMethodsToWrapper(constructors, names) {
      constructors.forEach(function(constructor) {
        names.forEach(function(name) {
          constructor.prototype[name] = function() {
            var w = wrapIfNeeded(this);
            return w[name].apply(w, arguments);
          };
        });
      });
    }
    scope.addForwardingProperties = addForwardingProperties;
    scope.assert = assert;
    scope.constructorTable = constructorTable;
    scope.defineGetter = defineGetter;
    scope.defineWrapGetter = defineWrapGetter;
    scope.forwardMethodsToWrapper = forwardMethodsToWrapper;
    scope.isIdentifierName = isIdentifierName;
    scope.isWrapper = isWrapper;
    scope.isWrapperFor = isWrapperFor;
    scope.mixin = mixin;
    scope.nativePrototypeTable = nativePrototypeTable;
    scope.oneOf = oneOf;
    scope.registerObject = registerObject;
    scope.registerWrapper = register;
    scope.rewrap = rewrap;
    scope.setWrapper = setWrapper;
    scope.unsafeUnwrap = unsafeUnwrap;
    scope.unwrap = unwrap;
    scope.unwrapIfNeeded = unwrapIfNeeded;
    scope.wrap = wrap;
    scope.wrapIfNeeded = wrapIfNeeded;
    scope.wrappers = wrappers;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    function newSplice(index, removed, addedCount) {
      return {
        index: index,
        removed: removed,
        addedCount: addedCount
      };
    }
    var EDIT_LEAVE = 0;
    var EDIT_UPDATE = 1;
    var EDIT_ADD = 2;
    var EDIT_DELETE = 3;
    function ArraySplice() {}
    ArraySplice.prototype = {
      calcEditDistances: function(current, currentStart, currentEnd, old, oldStart, oldEnd) {
        var rowCount = oldEnd - oldStart + 1;
        var columnCount = currentEnd - currentStart + 1;
        var distances = new Array(rowCount);
        for (var i = 0; i < rowCount; i++) {
          distances[i] = new Array(columnCount);
          distances[i][0] = i;
        }
        for (var j = 0; j < columnCount; j++) distances[0][j] = j;
        for (var i = 1; i < rowCount; i++) {
          for (var j = 1; j < columnCount; j++) {
            if (this.equals(current[currentStart + j - 1], old[oldStart + i - 1])) distances[i][j] = distances[i - 1][j - 1]; else {
              var north = distances[i - 1][j] + 1;
              var west = distances[i][j - 1] + 1;
              distances[i][j] = north < west ? north : west;
            }
          }
        }
        return distances;
      },
      spliceOperationsFromEditDistances: function(distances) {
        var i = distances.length - 1;
        var j = distances[0].length - 1;
        var current = distances[i][j];
        var edits = [];
        while (i > 0 || j > 0) {
          if (i == 0) {
            edits.push(EDIT_ADD);
            j--;
            continue;
          }
          if (j == 0) {
            edits.push(EDIT_DELETE);
            i--;
            continue;
          }
          var northWest = distances[i - 1][j - 1];
          var west = distances[i - 1][j];
          var north = distances[i][j - 1];
          var min;
          if (west < north) min = west < northWest ? west : northWest; else min = north < northWest ? north : northWest;
          if (min == northWest) {
            if (northWest == current) {
              edits.push(EDIT_LEAVE);
            } else {
              edits.push(EDIT_UPDATE);
              current = northWest;
            }
            i--;
            j--;
          } else if (min == west) {
            edits.push(EDIT_DELETE);
            i--;
            current = west;
          } else {
            edits.push(EDIT_ADD);
            j--;
            current = north;
          }
        }
        edits.reverse();
        return edits;
      },
      calcSplices: function(current, currentStart, currentEnd, old, oldStart, oldEnd) {
        var prefixCount = 0;
        var suffixCount = 0;
        var minLength = Math.min(currentEnd - currentStart, oldEnd - oldStart);
        if (currentStart == 0 && oldStart == 0) prefixCount = this.sharedPrefix(current, old, minLength);
        if (currentEnd == current.length && oldEnd == old.length) suffixCount = this.sharedSuffix(current, old, minLength - prefixCount);
        currentStart += prefixCount;
        oldStart += prefixCount;
        currentEnd -= suffixCount;
        oldEnd -= suffixCount;
        if (currentEnd - currentStart == 0 && oldEnd - oldStart == 0) return [];
        if (currentStart == currentEnd) {
          var splice = newSplice(currentStart, [], 0);
          while (oldStart < oldEnd) splice.removed.push(old[oldStart++]);
          return [ splice ];
        } else if (oldStart == oldEnd) return [ newSplice(currentStart, [], currentEnd - currentStart) ];
        var ops = this.spliceOperationsFromEditDistances(this.calcEditDistances(current, currentStart, currentEnd, old, oldStart, oldEnd));
        var splice = undefined;
        var splices = [];
        var index = currentStart;
        var oldIndex = oldStart;
        for (var i = 0; i < ops.length; i++) {
          switch (ops[i]) {
           case EDIT_LEAVE:
            if (splice) {
              splices.push(splice);
              splice = undefined;
            }
            index++;
            oldIndex++;
            break;

           case EDIT_UPDATE:
            if (!splice) splice = newSplice(index, [], 0);
            splice.addedCount++;
            index++;
            splice.removed.push(old[oldIndex]);
            oldIndex++;
            break;

           case EDIT_ADD:
            if (!splice) splice = newSplice(index, [], 0);
            splice.addedCount++;
            index++;
            break;

           case EDIT_DELETE:
            if (!splice) splice = newSplice(index, [], 0);
            splice.removed.push(old[oldIndex]);
            oldIndex++;
            break;
          }
        }
        if (splice) {
          splices.push(splice);
        }
        return splices;
      },
      sharedPrefix: function(current, old, searchLength) {
        for (var i = 0; i < searchLength; i++) if (!this.equals(current[i], old[i])) return i;
        return searchLength;
      },
      sharedSuffix: function(current, old, searchLength) {
        var index1 = current.length;
        var index2 = old.length;
        var count = 0;
        while (count < searchLength && this.equals(current[--index1], old[--index2])) count++;
        return count;
      },
      calculateSplices: function(current, previous) {
        return this.calcSplices(current, 0, current.length, previous, 0, previous.length);
      },
      equals: function(currentValue, previousValue) {
        return currentValue === previousValue;
      }
    };
    scope.ArraySplice = ArraySplice;
  })(window.ShadowDOMPolyfill);
  (function(context) {
    "use strict";
    var OriginalMutationObserver = window.MutationObserver;
    var callbacks = [];
    var pending = false;
    var timerFunc;
    function handle() {
      pending = false;
      var copies = callbacks.slice(0);
      callbacks = [];
      for (var i = 0; i < copies.length; i++) {
        (0, copies[i])();
      }
    }
    if (OriginalMutationObserver) {
      var counter = 1;
      var observer = new OriginalMutationObserver(handle);
      var textNode = document.createTextNode(counter);
      observer.observe(textNode, {
        characterData: true
      });
      timerFunc = function() {
        counter = (counter + 1) % 2;
        textNode.data = counter;
      };
    } else {
      timerFunc = window.setTimeout;
    }
    function setEndOfMicrotask(func) {
      callbacks.push(func);
      if (pending) return;
      pending = true;
      timerFunc(handle, 0);
    }
    context.setEndOfMicrotask = setEndOfMicrotask;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var setEndOfMicrotask = scope.setEndOfMicrotask;
    var wrapIfNeeded = scope.wrapIfNeeded;
    var wrappers = scope.wrappers;
    var registrationsTable = new WeakMap();
    var globalMutationObservers = [];
    var isScheduled = false;
    function scheduleCallback(observer) {
      if (observer.scheduled_) return;
      observer.scheduled_ = true;
      globalMutationObservers.push(observer);
      if (isScheduled) return;
      setEndOfMicrotask(notifyObservers);
      isScheduled = true;
    }
    function notifyObservers() {
      isScheduled = false;
      while (globalMutationObservers.length) {
        var notifyList = globalMutationObservers;
        globalMutationObservers = [];
        notifyList.sort(function(x, y) {
          return x.uid_ - y.uid_;
        });
        for (var i = 0; i < notifyList.length; i++) {
          var mo = notifyList[i];
          mo.scheduled_ = false;
          var queue = mo.takeRecords();
          removeTransientObserversFor(mo);
          if (queue.length) {
            mo.callback_(queue, mo);
          }
        }
      }
    }
    function MutationRecord(type, target) {
      this.type = type;
      this.target = target;
      this.addedNodes = new wrappers.NodeList();
      this.removedNodes = new wrappers.NodeList();
      this.previousSibling = null;
      this.nextSibling = null;
      this.attributeName = null;
      this.attributeNamespace = null;
      this.oldValue = null;
    }
    function registerTransientObservers(ancestor, node) {
      for (;ancestor; ancestor = ancestor.parentNode) {
        var registrations = registrationsTable.get(ancestor);
        if (!registrations) continue;
        for (var i = 0; i < registrations.length; i++) {
          var registration = registrations[i];
          if (registration.options.subtree) registration.addTransientObserver(node);
        }
      }
    }
    function removeTransientObserversFor(observer) {
      for (var i = 0; i < observer.nodes_.length; i++) {
        var node = observer.nodes_[i];
        var registrations = registrationsTable.get(node);
        if (!registrations) return;
        for (var j = 0; j < registrations.length; j++) {
          var registration = registrations[j];
          if (registration.observer === observer) registration.removeTransientObservers();
        }
      }
    }
    function enqueueMutation(target, type, data) {
      var interestedObservers = Object.create(null);
      var associatedStrings = Object.create(null);
      for (var node = target; node; node = node.parentNode) {
        var registrations = registrationsTable.get(node);
        if (!registrations) continue;
        for (var j = 0; j < registrations.length; j++) {
          var registration = registrations[j];
          var options = registration.options;
          if (node !== target && !options.subtree) continue;
          if (type === "attributes" && !options.attributes) continue;
          if (type === "attributes" && options.attributeFilter && (data.namespace !== null || options.attributeFilter.indexOf(data.name) === -1)) {
            continue;
          }
          if (type === "characterData" && !options.characterData) continue;
          if (type === "childList" && !options.childList) continue;
          var observer = registration.observer;
          interestedObservers[observer.uid_] = observer;
          if (type === "attributes" && options.attributeOldValue || type === "characterData" && options.characterDataOldValue) {
            associatedStrings[observer.uid_] = data.oldValue;
          }
        }
      }
      for (var uid in interestedObservers) {
        var observer = interestedObservers[uid];
        var record = new MutationRecord(type, target);
        if ("name" in data && "namespace" in data) {
          record.attributeName = data.name;
          record.attributeNamespace = data.namespace;
        }
        if (data.addedNodes) record.addedNodes = data.addedNodes;
        if (data.removedNodes) record.removedNodes = data.removedNodes;
        if (data.previousSibling) record.previousSibling = data.previousSibling;
        if (data.nextSibling) record.nextSibling = data.nextSibling;
        if (associatedStrings[uid] !== undefined) record.oldValue = associatedStrings[uid];
        scheduleCallback(observer);
        observer.records_.push(record);
      }
    }
    var slice = Array.prototype.slice;
    function MutationObserverOptions(options) {
      this.childList = !!options.childList;
      this.subtree = !!options.subtree;
      if (!("attributes" in options) && ("attributeOldValue" in options || "attributeFilter" in options)) {
        this.attributes = true;
      } else {
        this.attributes = !!options.attributes;
      }
      if ("characterDataOldValue" in options && !("characterData" in options)) this.characterData = true; else this.characterData = !!options.characterData;
      if (!this.attributes && (options.attributeOldValue || "attributeFilter" in options) || !this.characterData && options.characterDataOldValue) {
        throw new TypeError();
      }
      this.characterData = !!options.characterData;
      this.attributeOldValue = !!options.attributeOldValue;
      this.characterDataOldValue = !!options.characterDataOldValue;
      if ("attributeFilter" in options) {
        if (options.attributeFilter == null || typeof options.attributeFilter !== "object") {
          throw new TypeError();
        }
        this.attributeFilter = slice.call(options.attributeFilter);
      } else {
        this.attributeFilter = null;
      }
    }
    var uidCounter = 0;
    function MutationObserver(callback) {
      this.callback_ = callback;
      this.nodes_ = [];
      this.records_ = [];
      this.uid_ = ++uidCounter;
      this.scheduled_ = false;
    }
    MutationObserver.prototype = {
      constructor: MutationObserver,
      observe: function(target, options) {
        target = wrapIfNeeded(target);
        var newOptions = new MutationObserverOptions(options);
        var registration;
        var registrations = registrationsTable.get(target);
        if (!registrations) registrationsTable.set(target, registrations = []);
        for (var i = 0; i < registrations.length; i++) {
          if (registrations[i].observer === this) {
            registration = registrations[i];
            registration.removeTransientObservers();
            registration.options = newOptions;
          }
        }
        if (!registration) {
          registration = new Registration(this, target, newOptions);
          registrations.push(registration);
          this.nodes_.push(target);
        }
      },
      disconnect: function() {
        this.nodes_.forEach(function(node) {
          var registrations = registrationsTable.get(node);
          for (var i = 0; i < registrations.length; i++) {
            var registration = registrations[i];
            if (registration.observer === this) {
              registrations.splice(i, 1);
              break;
            }
          }
        }, this);
        this.records_ = [];
      },
      takeRecords: function() {
        var copyOfRecords = this.records_;
        this.records_ = [];
        return copyOfRecords;
      }
    };
    function Registration(observer, target, options) {
      this.observer = observer;
      this.target = target;
      this.options = options;
      this.transientObservedNodes = [];
    }
    Registration.prototype = {
      addTransientObserver: function(node) {
        if (node === this.target) return;
        scheduleCallback(this.observer);
        this.transientObservedNodes.push(node);
        var registrations = registrationsTable.get(node);
        if (!registrations) registrationsTable.set(node, registrations = []);
        registrations.push(this);
      },
      removeTransientObservers: function() {
        var transientObservedNodes = this.transientObservedNodes;
        this.transientObservedNodes = [];
        for (var i = 0; i < transientObservedNodes.length; i++) {
          var node = transientObservedNodes[i];
          var registrations = registrationsTable.get(node);
          for (var j = 0; j < registrations.length; j++) {
            if (registrations[j] === this) {
              registrations.splice(j, 1);
              break;
            }
          }
        }
      }
    };
    scope.enqueueMutation = enqueueMutation;
    scope.registerTransientObservers = registerTransientObservers;
    scope.wrappers.MutationObserver = MutationObserver;
    scope.wrappers.MutationRecord = MutationRecord;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    function TreeScope(root, parent) {
      this.root = root;
      this.parent = parent;
    }
    TreeScope.prototype = {
      get renderer() {
        if (this.root instanceof scope.wrappers.ShadowRoot) {
          return scope.getRendererForHost(this.root.host);
        }
        return null;
      },
      contains: function(treeScope) {
        for (;treeScope; treeScope = treeScope.parent) {
          if (treeScope === this) return true;
        }
        return false;
      }
    };
    function setTreeScope(node, treeScope) {
      if (node.treeScope_ !== treeScope) {
        node.treeScope_ = treeScope;
        for (var sr = node.shadowRoot; sr; sr = sr.olderShadowRoot) {
          sr.treeScope_.parent = treeScope;
        }
        for (var child = node.firstChild; child; child = child.nextSibling) {
          setTreeScope(child, treeScope);
        }
      }
    }
    function getTreeScope(node) {
      if (node instanceof scope.wrappers.Window) {
        debugger;
      }
      if (node.treeScope_) return node.treeScope_;
      var parent = node.parentNode;
      var treeScope;
      if (parent) treeScope = getTreeScope(parent); else treeScope = new TreeScope(node, null);
      return node.treeScope_ = treeScope;
    }
    scope.TreeScope = TreeScope;
    scope.getTreeScope = getTreeScope;
    scope.setTreeScope = setTreeScope;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var forwardMethodsToWrapper = scope.forwardMethodsToWrapper;
    var getTreeScope = scope.getTreeScope;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var setWrapper = scope.setWrapper;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var unwrap = scope.unwrap;
    var wrap = scope.wrap;
    var wrappers = scope.wrappers;
    var wrappedFuns = new WeakMap();
    var listenersTable = new WeakMap();
    var handledEventsTable = new WeakMap();
    var currentlyDispatchingEvents = new WeakMap();
    var targetTable = new WeakMap();
    var currentTargetTable = new WeakMap();
    var relatedTargetTable = new WeakMap();
    var eventPhaseTable = new WeakMap();
    var stopPropagationTable = new WeakMap();
    var stopImmediatePropagationTable = new WeakMap();
    var eventHandlersTable = new WeakMap();
    var eventPathTable = new WeakMap();
    function isShadowRoot(node) {
      return node instanceof wrappers.ShadowRoot;
    }
    function rootOfNode(node) {
      return getTreeScope(node).root;
    }
    function getEventPath(node, event) {
      var path = [];
      var current = node;
      path.push(current);
      while (current) {
        var destinationInsertionPoints = getDestinationInsertionPoints(current);
        if (destinationInsertionPoints && destinationInsertionPoints.length > 0) {
          for (var i = 0; i < destinationInsertionPoints.length; i++) {
            var insertionPoint = destinationInsertionPoints[i];
            if (isShadowInsertionPoint(insertionPoint)) {
              var shadowRoot = rootOfNode(insertionPoint);
              var olderShadowRoot = shadowRoot.olderShadowRoot;
              if (olderShadowRoot) path.push(olderShadowRoot);
            }
            path.push(insertionPoint);
          }
          current = destinationInsertionPoints[destinationInsertionPoints.length - 1];
        } else {
          if (isShadowRoot(current)) {
            if (inSameTree(node, current) && eventMustBeStopped(event)) {
              break;
            }
            current = current.host;
            path.push(current);
          } else {
            current = current.parentNode;
            if (current) path.push(current);
          }
        }
      }
      return path;
    }
    function eventMustBeStopped(event) {
      if (!event) return false;
      switch (event.type) {
       case "abort":
       case "error":
       case "select":
       case "change":
       case "load":
       case "reset":
       case "resize":
       case "scroll":
       case "selectstart":
        return true;
      }
      return false;
    }
    function isShadowInsertionPoint(node) {
      return node instanceof HTMLShadowElement;
    }
    function getDestinationInsertionPoints(node) {
      return scope.getDestinationInsertionPoints(node);
    }
    function eventRetargetting(path, currentTarget) {
      if (path.length === 0) return currentTarget;
      if (currentTarget instanceof wrappers.Window) currentTarget = currentTarget.document;
      var currentTargetTree = getTreeScope(currentTarget);
      var originalTarget = path[0];
      var originalTargetTree = getTreeScope(originalTarget);
      var relativeTargetTree = lowestCommonInclusiveAncestor(currentTargetTree, originalTargetTree);
      for (var i = 0; i < path.length; i++) {
        var node = path[i];
        if (getTreeScope(node) === relativeTargetTree) return node;
      }
      return path[path.length - 1];
    }
    function getTreeScopeAncestors(treeScope) {
      var ancestors = [];
      for (;treeScope; treeScope = treeScope.parent) {
        ancestors.push(treeScope);
      }
      return ancestors;
    }
    function lowestCommonInclusiveAncestor(tsA, tsB) {
      var ancestorsA = getTreeScopeAncestors(tsA);
      var ancestorsB = getTreeScopeAncestors(tsB);
      var result = null;
      while (ancestorsA.length > 0 && ancestorsB.length > 0) {
        var a = ancestorsA.pop();
        var b = ancestorsB.pop();
        if (a === b) result = a; else break;
      }
      return result;
    }
    function getTreeScopeRoot(ts) {
      if (!ts.parent) return ts;
      return getTreeScopeRoot(ts.parent);
    }
    function relatedTargetResolution(event, currentTarget, relatedTarget) {
      if (currentTarget instanceof wrappers.Window) currentTarget = currentTarget.document;
      var currentTargetTree = getTreeScope(currentTarget);
      var relatedTargetTree = getTreeScope(relatedTarget);
      var relatedTargetEventPath = getEventPath(relatedTarget, event);
      var lowestCommonAncestorTree;
      var lowestCommonAncestorTree = lowestCommonInclusiveAncestor(currentTargetTree, relatedTargetTree);
      if (!lowestCommonAncestorTree) lowestCommonAncestorTree = relatedTargetTree.root;
      for (var commonAncestorTree = lowestCommonAncestorTree; commonAncestorTree; commonAncestorTree = commonAncestorTree.parent) {
        var adjustedRelatedTarget;
        for (var i = 0; i < relatedTargetEventPath.length; i++) {
          var node = relatedTargetEventPath[i];
          if (getTreeScope(node) === commonAncestorTree) return node;
        }
      }
      return null;
    }
    function inSameTree(a, b) {
      return getTreeScope(a) === getTreeScope(b);
    }
    var NONE = 0;
    var CAPTURING_PHASE = 1;
    var AT_TARGET = 2;
    var BUBBLING_PHASE = 3;
    var pendingError;
    function dispatchOriginalEvent(originalEvent) {
      if (handledEventsTable.get(originalEvent)) return;
      handledEventsTable.set(originalEvent, true);
      dispatchEvent(wrap(originalEvent), wrap(originalEvent.target));
      if (pendingError) {
        var err = pendingError;
        pendingError = null;
        throw err;
      }
    }
    function isLoadLikeEvent(event) {
      switch (event.type) {
       case "load":
       case "beforeunload":
       case "unload":
        return true;
      }
      return false;
    }
    function dispatchEvent(event, originalWrapperTarget) {
      if (currentlyDispatchingEvents.get(event)) throw new Error("InvalidStateError");
      currentlyDispatchingEvents.set(event, true);
      scope.renderAllPending();
      var eventPath;
      var overrideTarget;
      var win;
      if (isLoadLikeEvent(event) && !event.bubbles) {
        var doc = originalWrapperTarget;
        if (doc instanceof wrappers.Document && (win = doc.defaultView)) {
          overrideTarget = doc;
          eventPath = [];
        }
      }
      if (!eventPath) {
        if (originalWrapperTarget instanceof wrappers.Window) {
          win = originalWrapperTarget;
          eventPath = [];
        } else {
          eventPath = getEventPath(originalWrapperTarget, event);
          if (!isLoadLikeEvent(event)) {
            var doc = eventPath[eventPath.length - 1];
            if (doc instanceof wrappers.Document) win = doc.defaultView;
          }
        }
      }
      eventPathTable.set(event, eventPath);
      if (dispatchCapturing(event, eventPath, win, overrideTarget)) {
        if (dispatchAtTarget(event, eventPath, win, overrideTarget)) {
          dispatchBubbling(event, eventPath, win, overrideTarget);
        }
      }
      eventPhaseTable.set(event, NONE);
      currentTargetTable.delete(event, null);
      currentlyDispatchingEvents.delete(event);
      return event.defaultPrevented;
    }
    function dispatchCapturing(event, eventPath, win, overrideTarget) {
      var phase = CAPTURING_PHASE;
      if (win) {
        if (!invoke(win, event, phase, eventPath, overrideTarget)) return false;
      }
      for (var i = eventPath.length - 1; i > 0; i--) {
        if (!invoke(eventPath[i], event, phase, eventPath, overrideTarget)) return false;
      }
      return true;
    }
    function dispatchAtTarget(event, eventPath, win, overrideTarget) {
      var phase = AT_TARGET;
      var currentTarget = eventPath[0] || win;
      return invoke(currentTarget, event, phase, eventPath, overrideTarget);
    }
    function dispatchBubbling(event, eventPath, win, overrideTarget) {
      var phase = BUBBLING_PHASE;
      for (var i = 1; i < eventPath.length; i++) {
        if (!invoke(eventPath[i], event, phase, eventPath, overrideTarget)) return;
      }
      if (win && eventPath.length > 0) {
        invoke(win, event, phase, eventPath, overrideTarget);
      }
    }
    function invoke(currentTarget, event, phase, eventPath, overrideTarget) {
      var listeners = listenersTable.get(currentTarget);
      if (!listeners) return true;
      var target = overrideTarget || eventRetargetting(eventPath, currentTarget);
      if (target === currentTarget) {
        if (phase === CAPTURING_PHASE) return true;
        if (phase === BUBBLING_PHASE) phase = AT_TARGET;
      } else if (phase === BUBBLING_PHASE && !event.bubbles) {
        return true;
      }
      if ("relatedTarget" in event) {
        var originalEvent = unwrap(event);
        var unwrappedRelatedTarget = originalEvent.relatedTarget;
        if (unwrappedRelatedTarget) {
          if (unwrappedRelatedTarget instanceof Object && unwrappedRelatedTarget.addEventListener) {
            var relatedTarget = wrap(unwrappedRelatedTarget);
            var adjusted = relatedTargetResolution(event, currentTarget, relatedTarget);
            if (adjusted === target) return true;
          } else {
            adjusted = null;
          }
          relatedTargetTable.set(event, adjusted);
        }
      }
      eventPhaseTable.set(event, phase);
      var type = event.type;
      var anyRemoved = false;
      targetTable.set(event, target);
      currentTargetTable.set(event, currentTarget);
      listeners.depth++;
      for (var i = 0, len = listeners.length; i < len; i++) {
        var listener = listeners[i];
        if (listener.removed) {
          anyRemoved = true;
          continue;
        }
        if (listener.type !== type || !listener.capture && phase === CAPTURING_PHASE || listener.capture && phase === BUBBLING_PHASE) {
          continue;
        }
        try {
          if (typeof listener.handler === "function") listener.handler.call(currentTarget, event); else listener.handler.handleEvent(event);
          if (stopImmediatePropagationTable.get(event)) return false;
        } catch (ex) {
          if (!pendingError) pendingError = ex;
        }
      }
      listeners.depth--;
      if (anyRemoved && listeners.depth === 0) {
        var copy = listeners.slice();
        listeners.length = 0;
        for (var i = 0; i < copy.length; i++) {
          if (!copy[i].removed) listeners.push(copy[i]);
        }
      }
      return !stopPropagationTable.get(event);
    }
    function Listener(type, handler, capture) {
      this.type = type;
      this.handler = handler;
      this.capture = Boolean(capture);
    }
    Listener.prototype = {
      equals: function(that) {
        return this.handler === that.handler && this.type === that.type && this.capture === that.capture;
      },
      get removed() {
        return this.handler === null;
      },
      remove: function() {
        this.handler = null;
      }
    };
    var OriginalEvent = window.Event;
    OriginalEvent.prototype.polymerBlackList_ = {
      returnValue: true,
      keyLocation: true
    };
    function Event(type, options) {
      if (type instanceof OriginalEvent) {
        var impl = type;
        if (!OriginalBeforeUnloadEvent && impl.type === "beforeunload" && !(this instanceof BeforeUnloadEvent)) {
          return new BeforeUnloadEvent(impl);
        }
        setWrapper(impl, this);
      } else {
        return wrap(constructEvent(OriginalEvent, "Event", type, options));
      }
    }
    Event.prototype = {
      get target() {
        return targetTable.get(this);
      },
      get currentTarget() {
        return currentTargetTable.get(this);
      },
      get eventPhase() {
        return eventPhaseTable.get(this);
      },
      get path() {
        var eventPath = eventPathTable.get(this);
        if (!eventPath) return [];
        return eventPath.slice();
      },
      stopPropagation: function() {
        stopPropagationTable.set(this, true);
      },
      stopImmediatePropagation: function() {
        stopPropagationTable.set(this, true);
        stopImmediatePropagationTable.set(this, true);
      }
    };
    var supportsDefaultPrevented = function() {
      var e = document.createEvent("Event");
      e.initEvent("test", true, true);
      e.preventDefault();
      return e.defaultPrevented;
    }();
    if (!supportsDefaultPrevented) {
      Event.prototype.preventDefault = function() {
        if (!this.cancelable) return;
        unsafeUnwrap(this).preventDefault();
        Object.defineProperty(this, "defaultPrevented", {
          get: function() {
            return true;
          },
          configurable: true
        });
      };
    }
    registerWrapper(OriginalEvent, Event, document.createEvent("Event"));
    function unwrapOptions(options) {
      if (!options || !options.relatedTarget) return options;
      return Object.create(options, {
        relatedTarget: {
          value: unwrap(options.relatedTarget)
        }
      });
    }
    function registerGenericEvent(name, SuperEvent, prototype) {
      var OriginalEvent = window[name];
      var GenericEvent = function(type, options) {
        if (type instanceof OriginalEvent) setWrapper(type, this); else return wrap(constructEvent(OriginalEvent, name, type, options));
      };
      GenericEvent.prototype = Object.create(SuperEvent.prototype);
      if (prototype) mixin(GenericEvent.prototype, prototype);
      if (OriginalEvent) {
        try {
          registerWrapper(OriginalEvent, GenericEvent, new OriginalEvent("temp"));
        } catch (ex) {
          registerWrapper(OriginalEvent, GenericEvent, document.createEvent(name));
        }
      }
      return GenericEvent;
    }
    var UIEvent = registerGenericEvent("UIEvent", Event);
    var CustomEvent = registerGenericEvent("CustomEvent", Event);
    var relatedTargetProto = {
      get relatedTarget() {
        var relatedTarget = relatedTargetTable.get(this);
        if (relatedTarget !== undefined) return relatedTarget;
        return wrap(unwrap(this).relatedTarget);
      }
    };
    function getInitFunction(name, relatedTargetIndex) {
      return function() {
        arguments[relatedTargetIndex] = unwrap(arguments[relatedTargetIndex]);
        var impl = unwrap(this);
        impl[name].apply(impl, arguments);
      };
    }
    var mouseEventProto = mixin({
      initMouseEvent: getInitFunction("initMouseEvent", 14)
    }, relatedTargetProto);
    var focusEventProto = mixin({
      initFocusEvent: getInitFunction("initFocusEvent", 5)
    }, relatedTargetProto);
    var MouseEvent = registerGenericEvent("MouseEvent", UIEvent, mouseEventProto);
    var FocusEvent = registerGenericEvent("FocusEvent", UIEvent, focusEventProto);
    var defaultInitDicts = Object.create(null);
    var supportsEventConstructors = function() {
      try {
        new window.FocusEvent("focus");
      } catch (ex) {
        return false;
      }
      return true;
    }();
    function constructEvent(OriginalEvent, name, type, options) {
      if (supportsEventConstructors) return new OriginalEvent(type, unwrapOptions(options));
      var event = unwrap(document.createEvent(name));
      var defaultDict = defaultInitDicts[name];
      var args = [ type ];
      Object.keys(defaultDict).forEach(function(key) {
        var v = options != null && key in options ? options[key] : defaultDict[key];
        if (key === "relatedTarget") v = unwrap(v);
        args.push(v);
      });
      event["init" + name].apply(event, args);
      return event;
    }
    if (!supportsEventConstructors) {
      var configureEventConstructor = function(name, initDict, superName) {
        if (superName) {
          var superDict = defaultInitDicts[superName];
          initDict = mixin(mixin({}, superDict), initDict);
        }
        defaultInitDicts[name] = initDict;
      };
      configureEventConstructor("Event", {
        bubbles: false,
        cancelable: false
      });
      configureEventConstructor("CustomEvent", {
        detail: null
      }, "Event");
      configureEventConstructor("UIEvent", {
        view: null,
        detail: 0
      }, "Event");
      configureEventConstructor("MouseEvent", {
        screenX: 0,
        screenY: 0,
        clientX: 0,
        clientY: 0,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
        button: 0,
        relatedTarget: null
      }, "UIEvent");
      configureEventConstructor("FocusEvent", {
        relatedTarget: null
      }, "UIEvent");
    }
    var OriginalBeforeUnloadEvent = window.BeforeUnloadEvent;
    function BeforeUnloadEvent(impl) {
      Event.call(this, impl);
    }
    BeforeUnloadEvent.prototype = Object.create(Event.prototype);
    mixin(BeforeUnloadEvent.prototype, {
      get returnValue() {
        return unsafeUnwrap(this).returnValue;
      },
      set returnValue(v) {
        unsafeUnwrap(this).returnValue = v;
      }
    });
    if (OriginalBeforeUnloadEvent) registerWrapper(OriginalBeforeUnloadEvent, BeforeUnloadEvent);
    function isValidListener(fun) {
      if (typeof fun === "function") return true;
      return fun && fun.handleEvent;
    }
    function isMutationEvent(type) {
      switch (type) {
       case "DOMAttrModified":
       case "DOMAttributeNameChanged":
       case "DOMCharacterDataModified":
       case "DOMElementNameChanged":
       case "DOMNodeInserted":
       case "DOMNodeInsertedIntoDocument":
       case "DOMNodeRemoved":
       case "DOMNodeRemovedFromDocument":
       case "DOMSubtreeModified":
        return true;
      }
      return false;
    }
    var OriginalEventTarget = window.EventTarget;
    function EventTarget(impl) {
      setWrapper(impl, this);
    }
    var methodNames = [ "addEventListener", "removeEventListener", "dispatchEvent" ];
    [ Node, Window ].forEach(function(constructor) {
      var p = constructor.prototype;
      methodNames.forEach(function(name) {
        Object.defineProperty(p, name + "_", {
          value: p[name]
        });
      });
    });
    function getTargetToListenAt(wrapper) {
      if (wrapper instanceof wrappers.ShadowRoot) wrapper = wrapper.host;
      return unwrap(wrapper);
    }
    EventTarget.prototype = {
      addEventListener: function(type, fun, capture) {
        if (!isValidListener(fun) || isMutationEvent(type)) return;
        var listener = new Listener(type, fun, capture);
        var listeners = listenersTable.get(this);
        if (!listeners) {
          listeners = [];
          listeners.depth = 0;
          listenersTable.set(this, listeners);
        } else {
          for (var i = 0; i < listeners.length; i++) {
            if (listener.equals(listeners[i])) return;
          }
        }
        listeners.push(listener);
        var target = getTargetToListenAt(this);
        target.addEventListener_(type, dispatchOriginalEvent, true);
      },
      removeEventListener: function(type, fun, capture) {
        capture = Boolean(capture);
        var listeners = listenersTable.get(this);
        if (!listeners) return;
        var count = 0, found = false;
        for (var i = 0; i < listeners.length; i++) {
          if (listeners[i].type === type && listeners[i].capture === capture) {
            count++;
            if (listeners[i].handler === fun) {
              found = true;
              listeners[i].remove();
            }
          }
        }
        if (found && count === 1) {
          var target = getTargetToListenAt(this);
          target.removeEventListener_(type, dispatchOriginalEvent, true);
        }
      },
      dispatchEvent: function(event) {
        var nativeEvent = unwrap(event);
        var eventType = nativeEvent.type;
        handledEventsTable.set(nativeEvent, false);
        scope.renderAllPending();
        var tempListener;
        if (!hasListenerInAncestors(this, eventType)) {
          tempListener = function() {};
          this.addEventListener(eventType, tempListener, true);
        }
        try {
          return unwrap(this).dispatchEvent_(nativeEvent);
        } finally {
          if (tempListener) this.removeEventListener(eventType, tempListener, true);
        }
      }
    };
    function hasListener(node, type) {
      var listeners = listenersTable.get(node);
      if (listeners) {
        for (var i = 0; i < listeners.length; i++) {
          if (!listeners[i].removed && listeners[i].type === type) return true;
        }
      }
      return false;
    }
    function hasListenerInAncestors(target, type) {
      for (var node = unwrap(target); node; node = node.parentNode) {
        if (hasListener(wrap(node), type)) return true;
      }
      return false;
    }
    if (OriginalEventTarget) registerWrapper(OriginalEventTarget, EventTarget);
    function wrapEventTargetMethods(constructors) {
      forwardMethodsToWrapper(constructors, methodNames);
    }
    var originalElementFromPoint = document.elementFromPoint;
    function elementFromPoint(self, document, x, y) {
      scope.renderAllPending();
      var element = wrap(originalElementFromPoint.call(unsafeUnwrap(document), x, y));
      if (!element) return null;
      var path = getEventPath(element, null);
      var idx = path.lastIndexOf(self);
      if (idx == -1) return null; else path = path.slice(0, idx);
      return eventRetargetting(path, self);
    }
    function getEventHandlerGetter(name) {
      return function() {
        var inlineEventHandlers = eventHandlersTable.get(this);
        return inlineEventHandlers && inlineEventHandlers[name] && inlineEventHandlers[name].value || null;
      };
    }
    function getEventHandlerSetter(name) {
      var eventType = name.slice(2);
      return function(value) {
        var inlineEventHandlers = eventHandlersTable.get(this);
        if (!inlineEventHandlers) {
          inlineEventHandlers = Object.create(null);
          eventHandlersTable.set(this, inlineEventHandlers);
        }
        var old = inlineEventHandlers[name];
        if (old) this.removeEventListener(eventType, old.wrapped, false);
        if (typeof value === "function") {
          var wrapped = function(e) {
            var rv = value.call(this, e);
            if (rv === false) e.preventDefault(); else if (name === "onbeforeunload" && typeof rv === "string") e.returnValue = rv;
          };
          this.addEventListener(eventType, wrapped, false);
          inlineEventHandlers[name] = {
            value: value,
            wrapped: wrapped
          };
        }
      };
    }
    scope.elementFromPoint = elementFromPoint;
    scope.getEventHandlerGetter = getEventHandlerGetter;
    scope.getEventHandlerSetter = getEventHandlerSetter;
    scope.wrapEventTargetMethods = wrapEventTargetMethods;
    scope.wrappers.BeforeUnloadEvent = BeforeUnloadEvent;
    scope.wrappers.CustomEvent = CustomEvent;
    scope.wrappers.Event = Event;
    scope.wrappers.EventTarget = EventTarget;
    scope.wrappers.FocusEvent = FocusEvent;
    scope.wrappers.MouseEvent = MouseEvent;
    scope.wrappers.UIEvent = UIEvent;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var UIEvent = scope.wrappers.UIEvent;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var setWrapper = scope.setWrapper;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var wrap = scope.wrap;
    var OriginalTouchEvent = window.TouchEvent;
    if (!OriginalTouchEvent) return;
    var nativeEvent;
    try {
      nativeEvent = document.createEvent("TouchEvent");
    } catch (ex) {
      return;
    }
    var nonEnumDescriptor = {
      enumerable: false
    };
    function nonEnum(obj, prop) {
      Object.defineProperty(obj, prop, nonEnumDescriptor);
    }
    function Touch(impl) {
      setWrapper(impl, this);
    }
    Touch.prototype = {
      get target() {
        return wrap(unsafeUnwrap(this).target);
      }
    };
    var descr = {
      configurable: true,
      enumerable: true,
      get: null
    };
    [ "clientX", "clientY", "screenX", "screenY", "pageX", "pageY", "identifier", "webkitRadiusX", "webkitRadiusY", "webkitRotationAngle", "webkitForce" ].forEach(function(name) {
      descr.get = function() {
        return unsafeUnwrap(this)[name];
      };
      Object.defineProperty(Touch.prototype, name, descr);
    });
    function TouchList() {
      this.length = 0;
      nonEnum(this, "length");
    }
    TouchList.prototype = {
      item: function(index) {
        return this[index];
      }
    };
    function wrapTouchList(nativeTouchList) {
      var list = new TouchList();
      for (var i = 0; i < nativeTouchList.length; i++) {
        list[i] = new Touch(nativeTouchList[i]);
      }
      list.length = i;
      return list;
    }
    function TouchEvent(impl) {
      UIEvent.call(this, impl);
    }
    TouchEvent.prototype = Object.create(UIEvent.prototype);
    mixin(TouchEvent.prototype, {
      get touches() {
        return wrapTouchList(unsafeUnwrap(this).touches);
      },
      get targetTouches() {
        return wrapTouchList(unsafeUnwrap(this).targetTouches);
      },
      get changedTouches() {
        return wrapTouchList(unsafeUnwrap(this).changedTouches);
      },
      initTouchEvent: function() {
        throw new Error("Not implemented");
      }
    });
    registerWrapper(OriginalTouchEvent, TouchEvent, nativeEvent);
    scope.wrappers.Touch = Touch;
    scope.wrappers.TouchEvent = TouchEvent;
    scope.wrappers.TouchList = TouchList;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var unsafeUnwrap = scope.unsafeUnwrap;
    var wrap = scope.wrap;
    var nonEnumDescriptor = {
      enumerable: false
    };
    function nonEnum(obj, prop) {
      Object.defineProperty(obj, prop, nonEnumDescriptor);
    }
    function NodeList() {
      this.length = 0;
      nonEnum(this, "length");
    }
    NodeList.prototype = {
      item: function(index) {
        return this[index];
      }
    };
    nonEnum(NodeList.prototype, "item");
    function wrapNodeList(list) {
      if (list == null) return list;
      var wrapperList = new NodeList();
      for (var i = 0, length = list.length; i < length; i++) {
        wrapperList[i] = wrap(list[i]);
      }
      wrapperList.length = length;
      return wrapperList;
    }
    function addWrapNodeListMethod(wrapperConstructor, name) {
      wrapperConstructor.prototype[name] = function() {
        return wrapNodeList(unsafeUnwrap(this)[name].apply(unsafeUnwrap(this), arguments));
      };
    }
    scope.wrappers.NodeList = NodeList;
    scope.addWrapNodeListMethod = addWrapNodeListMethod;
    scope.wrapNodeList = wrapNodeList;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    scope.wrapHTMLCollection = scope.wrapNodeList;
    scope.wrappers.HTMLCollection = scope.wrappers.NodeList;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var EventTarget = scope.wrappers.EventTarget;
    var NodeList = scope.wrappers.NodeList;
    var TreeScope = scope.TreeScope;
    var assert = scope.assert;
    var defineWrapGetter = scope.defineWrapGetter;
    var enqueueMutation = scope.enqueueMutation;
    var getTreeScope = scope.getTreeScope;
    var isWrapper = scope.isWrapper;
    var mixin = scope.mixin;
    var registerTransientObservers = scope.registerTransientObservers;
    var registerWrapper = scope.registerWrapper;
    var setTreeScope = scope.setTreeScope;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var unwrap = scope.unwrap;
    var unwrapIfNeeded = scope.unwrapIfNeeded;
    var wrap = scope.wrap;
    var wrapIfNeeded = scope.wrapIfNeeded;
    var wrappers = scope.wrappers;
    function assertIsNodeWrapper(node) {
      assert(node instanceof Node);
    }
    function createOneElementNodeList(node) {
      var nodes = new NodeList();
      nodes[0] = node;
      nodes.length = 1;
      return nodes;
    }
    var surpressMutations = false;
    function enqueueRemovalForInsertedNodes(node, parent, nodes) {
      enqueueMutation(parent, "childList", {
        removedNodes: nodes,
        previousSibling: node.previousSibling,
        nextSibling: node.nextSibling
      });
    }
    function enqueueRemovalForInsertedDocumentFragment(df, nodes) {
      enqueueMutation(df, "childList", {
        removedNodes: nodes
      });
    }
    function collectNodes(node, parentNode, previousNode, nextNode) {
      if (node instanceof DocumentFragment) {
        var nodes = collectNodesForDocumentFragment(node);
        surpressMutations = true;
        for (var i = nodes.length - 1; i >= 0; i--) {
          node.removeChild(nodes[i]);
          nodes[i].parentNode_ = parentNode;
        }
        surpressMutations = false;
        for (var i = 0; i < nodes.length; i++) {
          nodes[i].previousSibling_ = nodes[i - 1] || previousNode;
          nodes[i].nextSibling_ = nodes[i + 1] || nextNode;
        }
        if (previousNode) previousNode.nextSibling_ = nodes[0];
        if (nextNode) nextNode.previousSibling_ = nodes[nodes.length - 1];
        return nodes;
      }
      var nodes = createOneElementNodeList(node);
      var oldParent = node.parentNode;
      if (oldParent) {
        oldParent.removeChild(node);
      }
      node.parentNode_ = parentNode;
      node.previousSibling_ = previousNode;
      node.nextSibling_ = nextNode;
      if (previousNode) previousNode.nextSibling_ = node;
      if (nextNode) nextNode.previousSibling_ = node;
      return nodes;
    }
    function collectNodesNative(node) {
      if (node instanceof DocumentFragment) return collectNodesForDocumentFragment(node);
      var nodes = createOneElementNodeList(node);
      var oldParent = node.parentNode;
      if (oldParent) enqueueRemovalForInsertedNodes(node, oldParent, nodes);
      return nodes;
    }
    function collectNodesForDocumentFragment(node) {
      var nodes = new NodeList();
      var i = 0;
      for (var child = node.firstChild; child; child = child.nextSibling) {
        nodes[i++] = child;
      }
      nodes.length = i;
      enqueueRemovalForInsertedDocumentFragment(node, nodes);
      return nodes;
    }
    function snapshotNodeList(nodeList) {
      return nodeList;
    }
    function nodeWasAdded(node, treeScope) {
      setTreeScope(node, treeScope);
      node.nodeIsInserted_();
    }
    function nodesWereAdded(nodes, parent) {
      var treeScope = getTreeScope(parent);
      for (var i = 0; i < nodes.length; i++) {
        nodeWasAdded(nodes[i], treeScope);
      }
    }
    function nodeWasRemoved(node) {
      setTreeScope(node, new TreeScope(node, null));
    }
    function nodesWereRemoved(nodes) {
      for (var i = 0; i < nodes.length; i++) {
        nodeWasRemoved(nodes[i]);
      }
    }
    function ensureSameOwnerDocument(parent, child) {
      var ownerDoc = parent.nodeType === Node.DOCUMENT_NODE ? parent : parent.ownerDocument;
      if (ownerDoc !== child.ownerDocument) ownerDoc.adoptNode(child);
    }
    function adoptNodesIfNeeded(owner, nodes) {
      if (!nodes.length) return;
      var ownerDoc = owner.ownerDocument;
      if (ownerDoc === nodes[0].ownerDocument) return;
      for (var i = 0; i < nodes.length; i++) {
        scope.adoptNodeNoRemove(nodes[i], ownerDoc);
      }
    }
    function unwrapNodesForInsertion(owner, nodes) {
      adoptNodesIfNeeded(owner, nodes);
      var length = nodes.length;
      if (length === 1) return unwrap(nodes[0]);
      var df = unwrap(owner.ownerDocument.createDocumentFragment());
      for (var i = 0; i < length; i++) {
        df.appendChild(unwrap(nodes[i]));
      }
      return df;
    }
    function clearChildNodes(wrapper) {
      if (wrapper.firstChild_ !== undefined) {
        var child = wrapper.firstChild_;
        while (child) {
          var tmp = child;
          child = child.nextSibling_;
          tmp.parentNode_ = tmp.previousSibling_ = tmp.nextSibling_ = undefined;
        }
      }
      wrapper.firstChild_ = wrapper.lastChild_ = undefined;
    }
    function removeAllChildNodes(wrapper) {
      if (wrapper.invalidateShadowRenderer()) {
        var childWrapper = wrapper.firstChild;
        while (childWrapper) {
          assert(childWrapper.parentNode === wrapper);
          var nextSibling = childWrapper.nextSibling;
          var childNode = unwrap(childWrapper);
          var parentNode = childNode.parentNode;
          if (parentNode) originalRemoveChild.call(parentNode, childNode);
          childWrapper.previousSibling_ = childWrapper.nextSibling_ = childWrapper.parentNode_ = null;
          childWrapper = nextSibling;
        }
        wrapper.firstChild_ = wrapper.lastChild_ = null;
      } else {
        var node = unwrap(wrapper);
        var child = node.firstChild;
        var nextSibling;
        while (child) {
          nextSibling = child.nextSibling;
          originalRemoveChild.call(node, child);
          child = nextSibling;
        }
      }
    }
    function invalidateParent(node) {
      var p = node.parentNode;
      return p && p.invalidateShadowRenderer();
    }
    function cleanupNodes(nodes) {
      for (var i = 0, n; i < nodes.length; i++) {
        n = nodes[i];
        n.parentNode.removeChild(n);
      }
    }
    var originalImportNode = document.importNode;
    var originalCloneNode = window.Node.prototype.cloneNode;
    function cloneNode(node, deep, opt_doc) {
      var clone;
      if (opt_doc) clone = wrap(originalImportNode.call(opt_doc, unsafeUnwrap(node), false)); else clone = wrap(originalCloneNode.call(unsafeUnwrap(node), false));
      if (deep) {
        for (var child = node.firstChild; child; child = child.nextSibling) {
          clone.appendChild(cloneNode(child, true, opt_doc));
        }
        if (node instanceof wrappers.HTMLTemplateElement) {
          var cloneContent = clone.content;
          for (var child = node.content.firstChild; child; child = child.nextSibling) {
            cloneContent.appendChild(cloneNode(child, true, opt_doc));
          }
        }
      }
      return clone;
    }
    function contains(self, child) {
      if (!child || getTreeScope(self) !== getTreeScope(child)) return false;
      for (var node = child; node; node = node.parentNode) {
        if (node === self) return true;
      }
      return false;
    }
    var OriginalNode = window.Node;
    function Node(original) {
      assert(original instanceof OriginalNode);
      EventTarget.call(this, original);
      this.parentNode_ = undefined;
      this.firstChild_ = undefined;
      this.lastChild_ = undefined;
      this.nextSibling_ = undefined;
      this.previousSibling_ = undefined;
      this.treeScope_ = undefined;
    }
    var OriginalDocumentFragment = window.DocumentFragment;
    var originalAppendChild = OriginalNode.prototype.appendChild;
    var originalCompareDocumentPosition = OriginalNode.prototype.compareDocumentPosition;
    var originalIsEqualNode = OriginalNode.prototype.isEqualNode;
    var originalInsertBefore = OriginalNode.prototype.insertBefore;
    var originalRemoveChild = OriginalNode.prototype.removeChild;
    var originalReplaceChild = OriginalNode.prototype.replaceChild;
    var isIEOrEdge = /Trident|Edge/.test(navigator.userAgent);
    var removeChildOriginalHelper = isIEOrEdge ? function(parent, child) {
      try {
        originalRemoveChild.call(parent, child);
      } catch (ex) {
        if (!(parent instanceof OriginalDocumentFragment)) throw ex;
      }
    } : function(parent, child) {
      originalRemoveChild.call(parent, child);
    };
    Node.prototype = Object.create(EventTarget.prototype);
    mixin(Node.prototype, {
      appendChild: function(childWrapper) {
        return this.insertBefore(childWrapper, null);
      },
      insertBefore: function(childWrapper, refWrapper) {
        assertIsNodeWrapper(childWrapper);
        var refNode;
        if (refWrapper) {
          if (isWrapper(refWrapper)) {
            refNode = unwrap(refWrapper);
          } else {
            refNode = refWrapper;
            refWrapper = wrap(refNode);
          }
        } else {
          refWrapper = null;
          refNode = null;
        }
        refWrapper && assert(refWrapper.parentNode === this);
        var nodes;
        var previousNode = refWrapper ? refWrapper.previousSibling : this.lastChild;
        var useNative = !this.invalidateShadowRenderer() && !invalidateParent(childWrapper);
        if (useNative) nodes = collectNodesNative(childWrapper); else nodes = collectNodes(childWrapper, this, previousNode, refWrapper);
        if (useNative) {
          ensureSameOwnerDocument(this, childWrapper);
          clearChildNodes(this);
          originalInsertBefore.call(unsafeUnwrap(this), unwrap(childWrapper), refNode);
        } else {
          if (!previousNode) this.firstChild_ = nodes[0];
          if (!refWrapper) {
            this.lastChild_ = nodes[nodes.length - 1];
            if (this.firstChild_ === undefined) this.firstChild_ = this.firstChild;
          }
          var parentNode = refNode ? refNode.parentNode : unsafeUnwrap(this);
          if (parentNode) {
            originalInsertBefore.call(parentNode, unwrapNodesForInsertion(this, nodes), refNode);
          } else {
            adoptNodesIfNeeded(this, nodes);
          }
        }
        enqueueMutation(this, "childList", {
          addedNodes: nodes,
          nextSibling: refWrapper,
          previousSibling: previousNode
        });
        nodesWereAdded(nodes, this);
        return childWrapper;
      },
      removeChild: function(childWrapper) {
        assertIsNodeWrapper(childWrapper);
        if (childWrapper.parentNode !== this) {
          var found = false;
          var childNodes = this.childNodes;
          for (var ieChild = this.firstChild; ieChild; ieChild = ieChild.nextSibling) {
            if (ieChild === childWrapper) {
              found = true;
              break;
            }
          }
          if (!found) {
            throw new Error("NotFoundError");
          }
        }
        var childNode = unwrap(childWrapper);
        var childWrapperNextSibling = childWrapper.nextSibling;
        var childWrapperPreviousSibling = childWrapper.previousSibling;
        if (this.invalidateShadowRenderer()) {
          var thisFirstChild = this.firstChild;
          var thisLastChild = this.lastChild;
          var parentNode = childNode.parentNode;
          if (parentNode) removeChildOriginalHelper(parentNode, childNode);
          if (thisFirstChild === childWrapper) this.firstChild_ = childWrapperNextSibling;
          if (thisLastChild === childWrapper) this.lastChild_ = childWrapperPreviousSibling;
          if (childWrapperPreviousSibling) childWrapperPreviousSibling.nextSibling_ = childWrapperNextSibling;
          if (childWrapperNextSibling) {
            childWrapperNextSibling.previousSibling_ = childWrapperPreviousSibling;
          }
          childWrapper.previousSibling_ = childWrapper.nextSibling_ = childWrapper.parentNode_ = undefined;
        } else {
          clearChildNodes(this);
          removeChildOriginalHelper(unsafeUnwrap(this), childNode);
        }
        if (!surpressMutations) {
          enqueueMutation(this, "childList", {
            removedNodes: createOneElementNodeList(childWrapper),
            nextSibling: childWrapperNextSibling,
            previousSibling: childWrapperPreviousSibling
          });
        }
        registerTransientObservers(this, childWrapper);
        return childWrapper;
      },
      replaceChild: function(newChildWrapper, oldChildWrapper) {
        assertIsNodeWrapper(newChildWrapper);
        var oldChildNode;
        if (isWrapper(oldChildWrapper)) {
          oldChildNode = unwrap(oldChildWrapper);
        } else {
          oldChildNode = oldChildWrapper;
          oldChildWrapper = wrap(oldChildNode);
        }
        if (oldChildWrapper.parentNode !== this) {
          throw new Error("NotFoundError");
        }
        var nextNode = oldChildWrapper.nextSibling;
        var previousNode = oldChildWrapper.previousSibling;
        var nodes;
        var useNative = !this.invalidateShadowRenderer() && !invalidateParent(newChildWrapper);
        if (useNative) {
          nodes = collectNodesNative(newChildWrapper);
        } else {
          if (nextNode === newChildWrapper) nextNode = newChildWrapper.nextSibling;
          nodes = collectNodes(newChildWrapper, this, previousNode, nextNode);
        }
        if (!useNative) {
          if (this.firstChild === oldChildWrapper) this.firstChild_ = nodes[0];
          if (this.lastChild === oldChildWrapper) this.lastChild_ = nodes[nodes.length - 1];
          oldChildWrapper.previousSibling_ = oldChildWrapper.nextSibling_ = oldChildWrapper.parentNode_ = undefined;
          if (oldChildNode.parentNode) {
            originalReplaceChild.call(oldChildNode.parentNode, unwrapNodesForInsertion(this, nodes), oldChildNode);
          }
        } else {
          ensureSameOwnerDocument(this, newChildWrapper);
          clearChildNodes(this);
          originalReplaceChild.call(unsafeUnwrap(this), unwrap(newChildWrapper), oldChildNode);
        }
        enqueueMutation(this, "childList", {
          addedNodes: nodes,
          removedNodes: createOneElementNodeList(oldChildWrapper),
          nextSibling: nextNode,
          previousSibling: previousNode
        });
        nodeWasRemoved(oldChildWrapper);
        nodesWereAdded(nodes, this);
        return oldChildWrapper;
      },
      nodeIsInserted_: function() {
        for (var child = this.firstChild; child; child = child.nextSibling) {
          child.nodeIsInserted_();
        }
      },
      hasChildNodes: function() {
        return this.firstChild !== null;
      },
      get parentNode() {
        return this.parentNode_ !== undefined ? this.parentNode_ : wrap(unsafeUnwrap(this).parentNode);
      },
      get firstChild() {
        return this.firstChild_ !== undefined ? this.firstChild_ : wrap(unsafeUnwrap(this).firstChild);
      },
      get lastChild() {
        return this.lastChild_ !== undefined ? this.lastChild_ : wrap(unsafeUnwrap(this).lastChild);
      },
      get nextSibling() {
        return this.nextSibling_ !== undefined ? this.nextSibling_ : wrap(unsafeUnwrap(this).nextSibling);
      },
      get previousSibling() {
        return this.previousSibling_ !== undefined ? this.previousSibling_ : wrap(unsafeUnwrap(this).previousSibling);
      },
      get parentElement() {
        var p = this.parentNode;
        while (p && p.nodeType !== Node.ELEMENT_NODE) {
          p = p.parentNode;
        }
        return p;
      },
      get textContent() {
        var s = "";
        for (var child = this.firstChild; child; child = child.nextSibling) {
          if (child.nodeType != Node.COMMENT_NODE) {
            s += child.textContent;
          }
        }
        return s;
      },
      set textContent(textContent) {
        if (textContent == null) textContent = "";
        var removedNodes = snapshotNodeList(this.childNodes);
        if (this.invalidateShadowRenderer()) {
          removeAllChildNodes(this);
          if (textContent !== "") {
            var textNode = unsafeUnwrap(this).ownerDocument.createTextNode(textContent);
            this.appendChild(textNode);
          }
        } else {
          clearChildNodes(this);
          unsafeUnwrap(this).textContent = textContent;
        }
        var addedNodes = snapshotNodeList(this.childNodes);
        enqueueMutation(this, "childList", {
          addedNodes: addedNodes,
          removedNodes: removedNodes
        });
        nodesWereRemoved(removedNodes);
        nodesWereAdded(addedNodes, this);
      },
      get childNodes() {
        var wrapperList = new NodeList();
        var i = 0;
        for (var child = this.firstChild; child; child = child.nextSibling) {
          wrapperList[i++] = child;
        }
        wrapperList.length = i;
        return wrapperList;
      },
      cloneNode: function(deep) {
        return cloneNode(this, deep);
      },
      contains: function(child) {
        return contains(this, wrapIfNeeded(child));
      },
      compareDocumentPosition: function(otherNode) {
        return originalCompareDocumentPosition.call(unsafeUnwrap(this), unwrapIfNeeded(otherNode));
      },
      isEqualNode: function(otherNode) {
        return originalIsEqualNode.call(unsafeUnwrap(this), unwrapIfNeeded(otherNode));
      },
      normalize: function() {
        var nodes = snapshotNodeList(this.childNodes);
        var remNodes = [];
        var s = "";
        var modNode;
        for (var i = 0, n; i < nodes.length; i++) {
          n = nodes[i];
          if (n.nodeType === Node.TEXT_NODE) {
            if (!modNode && !n.data.length) this.removeChild(n); else if (!modNode) modNode = n; else {
              s += n.data;
              remNodes.push(n);
            }
          } else {
            if (modNode && remNodes.length) {
              modNode.data += s;
              cleanupNodes(remNodes);
            }
            remNodes = [];
            s = "";
            modNode = null;
            if (n.childNodes.length) n.normalize();
          }
        }
        if (modNode && remNodes.length) {
          modNode.data += s;
          cleanupNodes(remNodes);
        }
      }
    });
    defineWrapGetter(Node, "ownerDocument");
    registerWrapper(OriginalNode, Node, document.createDocumentFragment());
    delete Node.prototype.querySelector;
    delete Node.prototype.querySelectorAll;
    Node.prototype = mixin(Object.create(EventTarget.prototype), Node.prototype);
    scope.cloneNode = cloneNode;
    scope.nodeWasAdded = nodeWasAdded;
    scope.nodeWasRemoved = nodeWasRemoved;
    scope.nodesWereAdded = nodesWereAdded;
    scope.nodesWereRemoved = nodesWereRemoved;
    scope.originalInsertBefore = originalInsertBefore;
    scope.originalRemoveChild = originalRemoveChild;
    scope.snapshotNodeList = snapshotNodeList;
    scope.wrappers.Node = Node;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLCollection = scope.wrappers.HTMLCollection;
    var NodeList = scope.wrappers.NodeList;
    var getTreeScope = scope.getTreeScope;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var wrap = scope.wrap;
    var originalDocumentQuerySelector = document.querySelector;
    var originalElementQuerySelector = document.documentElement.querySelector;
    var originalDocumentQuerySelectorAll = document.querySelectorAll;
    var originalElementQuerySelectorAll = document.documentElement.querySelectorAll;
    var originalDocumentGetElementsByTagName = document.getElementsByTagName;
    var originalElementGetElementsByTagName = document.documentElement.getElementsByTagName;
    var originalDocumentGetElementsByTagNameNS = document.getElementsByTagNameNS;
    var originalElementGetElementsByTagNameNS = document.documentElement.getElementsByTagNameNS;
    var OriginalElement = window.Element;
    var OriginalDocument = window.HTMLDocument || window.Document;
    function filterNodeList(list, index, result, deep) {
      var wrappedItem = null;
      var root = null;
      for (var i = 0, length = list.length; i < length; i++) {
        wrappedItem = wrap(list[i]);
        if (!deep && (root = getTreeScope(wrappedItem).root)) {
          if (root instanceof scope.wrappers.ShadowRoot) {
            continue;
          }
        }
        result[index++] = wrappedItem;
      }
      return index;
    }
    function shimSelector(selector) {
      return String(selector).replace(/\/deep\/|::shadow|>>>/g, " ");
    }
    function shimMatchesSelector(selector) {
      return String(selector).replace(/:host\(([^\s]+)\)/g, "$1").replace(/([^\s]):host/g, "$1").replace(":host", "*").replace(/\^|\/shadow\/|\/shadow-deep\/|::shadow|\/deep\/|::content|>>>/g, " ");
    }
    function findOne(node, selector) {
      var m, el = node.firstElementChild;
      while (el) {
        if (el.matches(selector)) return el;
        m = findOne(el, selector);
        if (m) return m;
        el = el.nextElementSibling;
      }
      return null;
    }
    function matchesSelector(el, selector) {
      return el.matches(selector);
    }
    var XHTML_NS = "http://www.w3.org/1999/xhtml";
    function matchesTagName(el, localName, localNameLowerCase) {
      var ln = el.localName;
      return ln === localName || ln === localNameLowerCase && el.namespaceURI === XHTML_NS;
    }
    function matchesEveryThing() {
      return true;
    }
    function matchesLocalNameOnly(el, ns, localName) {
      return el.localName === localName;
    }
    function matchesNameSpace(el, ns) {
      return el.namespaceURI === ns;
    }
    function matchesLocalNameNS(el, ns, localName) {
      return el.namespaceURI === ns && el.localName === localName;
    }
    function findElements(node, index, result, p, arg0, arg1) {
      var el = node.firstElementChild;
      while (el) {
        if (p(el, arg0, arg1)) result[index++] = el;
        index = findElements(el, index, result, p, arg0, arg1);
        el = el.nextElementSibling;
      }
      return index;
    }
    function querySelectorAllFiltered(p, index, result, selector, deep) {
      var target = unsafeUnwrap(this);
      var list;
      var root = getTreeScope(this).root;
      if (root instanceof scope.wrappers.ShadowRoot) {
        return findElements(this, index, result, p, selector, null);
      } else if (target instanceof OriginalElement) {
        list = originalElementQuerySelectorAll.call(target, selector);
      } else if (target instanceof OriginalDocument) {
        list = originalDocumentQuerySelectorAll.call(target, selector);
      } else {
        return findElements(this, index, result, p, selector, null);
      }
      return filterNodeList(list, index, result, deep);
    }
    var SelectorsInterface = {
      querySelector: function(selector) {
        var shimmed = shimSelector(selector);
        var deep = shimmed !== selector;
        selector = shimmed;
        var target = unsafeUnwrap(this);
        var wrappedItem;
        var root = getTreeScope(this).root;
        if (root instanceof scope.wrappers.ShadowRoot) {
          return findOne(this, selector);
        } else if (target instanceof OriginalElement) {
          wrappedItem = wrap(originalElementQuerySelector.call(target, selector));
        } else if (target instanceof OriginalDocument) {
          wrappedItem = wrap(originalDocumentQuerySelector.call(target, selector));
        } else {
          return findOne(this, selector);
        }
        if (!wrappedItem) {
          return wrappedItem;
        } else if (!deep && (root = getTreeScope(wrappedItem).root)) {
          if (root instanceof scope.wrappers.ShadowRoot) {
            return findOne(this, selector);
          }
        }
        return wrappedItem;
      },
      querySelectorAll: function(selector) {
        var shimmed = shimSelector(selector);
        var deep = shimmed !== selector;
        selector = shimmed;
        var result = new NodeList();
        result.length = querySelectorAllFiltered.call(this, matchesSelector, 0, result, selector, deep);
        return result;
      }
    };
    var MatchesInterface = {
      matches: function(selector) {
        selector = shimMatchesSelector(selector);
        return scope.originalMatches.call(unsafeUnwrap(this), selector);
      }
    };
    function getElementsByTagNameFiltered(p, index, result, localName, lowercase) {
      var target = unsafeUnwrap(this);
      var list;
      var root = getTreeScope(this).root;
      if (root instanceof scope.wrappers.ShadowRoot) {
        return findElements(this, index, result, p, localName, lowercase);
      } else if (target instanceof OriginalElement) {
        list = originalElementGetElementsByTagName.call(target, localName, lowercase);
      } else if (target instanceof OriginalDocument) {
        list = originalDocumentGetElementsByTagName.call(target, localName, lowercase);
      } else {
        return findElements(this, index, result, p, localName, lowercase);
      }
      return filterNodeList(list, index, result, false);
    }
    function getElementsByTagNameNSFiltered(p, index, result, ns, localName) {
      var target = unsafeUnwrap(this);
      var list;
      var root = getTreeScope(this).root;
      if (root instanceof scope.wrappers.ShadowRoot) {
        return findElements(this, index, result, p, ns, localName);
      } else if (target instanceof OriginalElement) {
        list = originalElementGetElementsByTagNameNS.call(target, ns, localName);
      } else if (target instanceof OriginalDocument) {
        list = originalDocumentGetElementsByTagNameNS.call(target, ns, localName);
      } else {
        return findElements(this, index, result, p, ns, localName);
      }
      return filterNodeList(list, index, result, false);
    }
    var GetElementsByInterface = {
      getElementsByTagName: function(localName) {
        var result = new HTMLCollection();
        var match = localName === "*" ? matchesEveryThing : matchesTagName;
        result.length = getElementsByTagNameFiltered.call(this, match, 0, result, localName, localName.toLowerCase());
        return result;
      },
      getElementsByClassName: function(className) {
        return this.querySelectorAll("." + className);
      },
      getElementsByTagNameNS: function(ns, localName) {
        var result = new HTMLCollection();
        var match = null;
        if (ns === "*") {
          match = localName === "*" ? matchesEveryThing : matchesLocalNameOnly;
        } else {
          match = localName === "*" ? matchesNameSpace : matchesLocalNameNS;
        }
        result.length = getElementsByTagNameNSFiltered.call(this, match, 0, result, ns || null, localName);
        return result;
      }
    };
    scope.GetElementsByInterface = GetElementsByInterface;
    scope.SelectorsInterface = SelectorsInterface;
    scope.MatchesInterface = MatchesInterface;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var NodeList = scope.wrappers.NodeList;
    function forwardElement(node) {
      while (node && node.nodeType !== Node.ELEMENT_NODE) {
        node = node.nextSibling;
      }
      return node;
    }
    function backwardsElement(node) {
      while (node && node.nodeType !== Node.ELEMENT_NODE) {
        node = node.previousSibling;
      }
      return node;
    }
    var ParentNodeInterface = {
      get firstElementChild() {
        return forwardElement(this.firstChild);
      },
      get lastElementChild() {
        return backwardsElement(this.lastChild);
      },
      get childElementCount() {
        var count = 0;
        for (var child = this.firstElementChild; child; child = child.nextElementSibling) {
          count++;
        }
        return count;
      },
      get children() {
        var wrapperList = new NodeList();
        var i = 0;
        for (var child = this.firstElementChild; child; child = child.nextElementSibling) {
          wrapperList[i++] = child;
        }
        wrapperList.length = i;
        return wrapperList;
      },
      remove: function() {
        var p = this.parentNode;
        if (p) p.removeChild(this);
      }
    };
    var ChildNodeInterface = {
      get nextElementSibling() {
        return forwardElement(this.nextSibling);
      },
      get previousElementSibling() {
        return backwardsElement(this.previousSibling);
      }
    };
    var NonElementParentNodeInterface = {
      getElementById: function(id) {
        if (/[ \t\n\r\f]/.test(id)) return null;
        return this.querySelector('[id="' + id + '"]');
      }
    };
    scope.ChildNodeInterface = ChildNodeInterface;
    scope.NonElementParentNodeInterface = NonElementParentNodeInterface;
    scope.ParentNodeInterface = ParentNodeInterface;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var ChildNodeInterface = scope.ChildNodeInterface;
    var Node = scope.wrappers.Node;
    var enqueueMutation = scope.enqueueMutation;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var OriginalCharacterData = window.CharacterData;
    function CharacterData(node) {
      Node.call(this, node);
    }
    CharacterData.prototype = Object.create(Node.prototype);
    mixin(CharacterData.prototype, {
      get nodeValue() {
        return this.data;
      },
      set nodeValue(data) {
        this.data = data;
      },
      get textContent() {
        return this.data;
      },
      set textContent(value) {
        this.data = value;
      },
      get data() {
        return unsafeUnwrap(this).data;
      },
      set data(value) {
        var oldValue = unsafeUnwrap(this).data;
        enqueueMutation(this, "characterData", {
          oldValue: oldValue
        });
        unsafeUnwrap(this).data = value;
      }
    });
    mixin(CharacterData.prototype, ChildNodeInterface);
    registerWrapper(OriginalCharacterData, CharacterData, document.createTextNode(""));
    scope.wrappers.CharacterData = CharacterData;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var CharacterData = scope.wrappers.CharacterData;
    var enqueueMutation = scope.enqueueMutation;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    function toUInt32(x) {
      return x >>> 0;
    }
    var OriginalText = window.Text;
    function Text(node) {
      CharacterData.call(this, node);
    }
    Text.prototype = Object.create(CharacterData.prototype);
    mixin(Text.prototype, {
      splitText: function(offset) {
        offset = toUInt32(offset);
        var s = this.data;
        if (offset > s.length) throw new Error("IndexSizeError");
        var head = s.slice(0, offset);
        var tail = s.slice(offset);
        this.data = head;
        var newTextNode = this.ownerDocument.createTextNode(tail);
        if (this.parentNode) this.parentNode.insertBefore(newTextNode, this.nextSibling);
        return newTextNode;
      }
    });
    registerWrapper(OriginalText, Text, document.createTextNode(""));
    scope.wrappers.Text = Text;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    if (!window.DOMTokenList) {
      console.warn("Missing DOMTokenList prototype, please include a " + "compatible classList polyfill such as http://goo.gl/uTcepH.");
      return;
    }
    var unsafeUnwrap = scope.unsafeUnwrap;
    var enqueueMutation = scope.enqueueMutation;
    function getClass(el) {
      return unsafeUnwrap(el).getAttribute("class");
    }
    function enqueueClassAttributeChange(el, oldValue) {
      enqueueMutation(el, "attributes", {
        name: "class",
        namespace: null,
        oldValue: oldValue
      });
    }
    function invalidateClass(el) {
      scope.invalidateRendererBasedOnAttribute(el, "class");
    }
    function changeClass(tokenList, method, args) {
      var ownerElement = tokenList.ownerElement_;
      if (ownerElement == null) {
        return method.apply(tokenList, args);
      }
      var oldValue = getClass(ownerElement);
      var retv = method.apply(tokenList, args);
      if (getClass(ownerElement) !== oldValue) {
        enqueueClassAttributeChange(ownerElement, oldValue);
        invalidateClass(ownerElement);
      }
      return retv;
    }
    var oldAdd = DOMTokenList.prototype.add;
    DOMTokenList.prototype.add = function() {
      changeClass(this, oldAdd, arguments);
    };
    var oldRemove = DOMTokenList.prototype.remove;
    DOMTokenList.prototype.remove = function() {
      changeClass(this, oldRemove, arguments);
    };
    var oldToggle = DOMTokenList.prototype.toggle;
    DOMTokenList.prototype.toggle = function() {
      return changeClass(this, oldToggle, arguments);
    };
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var ChildNodeInterface = scope.ChildNodeInterface;
    var GetElementsByInterface = scope.GetElementsByInterface;
    var Node = scope.wrappers.Node;
    var ParentNodeInterface = scope.ParentNodeInterface;
    var SelectorsInterface = scope.SelectorsInterface;
    var MatchesInterface = scope.MatchesInterface;
    var addWrapNodeListMethod = scope.addWrapNodeListMethod;
    var enqueueMutation = scope.enqueueMutation;
    var mixin = scope.mixin;
    var oneOf = scope.oneOf;
    var registerWrapper = scope.registerWrapper;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var wrappers = scope.wrappers;
    var OriginalElement = window.Element;
    var matchesNames = [ "matches", "mozMatchesSelector", "msMatchesSelector", "webkitMatchesSelector" ].filter(function(name) {
      return OriginalElement.prototype[name];
    });
    var matchesName = matchesNames[0];
    var originalMatches = OriginalElement.prototype[matchesName];
    function invalidateRendererBasedOnAttribute(element, name) {
      var p = element.parentNode;
      if (!p || !p.shadowRoot) return;
      var renderer = scope.getRendererForHost(p);
      if (renderer.dependsOnAttribute(name)) renderer.invalidate();
    }
    function enqueAttributeChange(element, name, oldValue) {
      enqueueMutation(element, "attributes", {
        name: name,
        namespace: null,
        oldValue: oldValue
      });
    }
    var classListTable = new WeakMap();
    function Element(node) {
      Node.call(this, node);
    }
    Element.prototype = Object.create(Node.prototype);
    mixin(Element.prototype, {
      createShadowRoot: function() {
        var newShadowRoot = new wrappers.ShadowRoot(this);
        unsafeUnwrap(this).polymerShadowRoot_ = newShadowRoot;
        var renderer = scope.getRendererForHost(this);
        renderer.invalidate();
        return newShadowRoot;
      },
      get shadowRoot() {
        return unsafeUnwrap(this).polymerShadowRoot_ || null;
      },
      setAttribute: function(name, value) {
        var oldValue = unsafeUnwrap(this).getAttribute(name);
        unsafeUnwrap(this).setAttribute(name, value);
        enqueAttributeChange(this, name, oldValue);
        invalidateRendererBasedOnAttribute(this, name);
      },
      removeAttribute: function(name) {
        var oldValue = unsafeUnwrap(this).getAttribute(name);
        unsafeUnwrap(this).removeAttribute(name);
        enqueAttributeChange(this, name, oldValue);
        invalidateRendererBasedOnAttribute(this, name);
      },
      get classList() {
        var list = classListTable.get(this);
        if (!list) {
          list = unsafeUnwrap(this).classList;
          if (!list) return;
          list.ownerElement_ = this;
          classListTable.set(this, list);
        }
        return list;
      },
      get className() {
        return unsafeUnwrap(this).className;
      },
      set className(v) {
        this.setAttribute("class", v);
      },
      get id() {
        return unsafeUnwrap(this).id;
      },
      set id(v) {
        this.setAttribute("id", v);
      }
    });
    matchesNames.forEach(function(name) {
      if (name !== "matches") {
        Element.prototype[name] = function(selector) {
          return this.matches(selector);
        };
      }
    });
    if (OriginalElement.prototype.webkitCreateShadowRoot) {
      Element.prototype.webkitCreateShadowRoot = Element.prototype.createShadowRoot;
    }
    mixin(Element.prototype, ChildNodeInterface);
    mixin(Element.prototype, GetElementsByInterface);
    mixin(Element.prototype, ParentNodeInterface);
    mixin(Element.prototype, SelectorsInterface);
    mixin(Element.prototype, MatchesInterface);
    registerWrapper(OriginalElement, Element, document.createElementNS(null, "x"));
    scope.invalidateRendererBasedOnAttribute = invalidateRendererBasedOnAttribute;
    scope.matchesNames = matchesNames;
    scope.originalMatches = originalMatches;
    scope.wrappers.Element = Element;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var Element = scope.wrappers.Element;
    var defineGetter = scope.defineGetter;
    var enqueueMutation = scope.enqueueMutation;
    var mixin = scope.mixin;
    var nodesWereAdded = scope.nodesWereAdded;
    var nodesWereRemoved = scope.nodesWereRemoved;
    var registerWrapper = scope.registerWrapper;
    var snapshotNodeList = scope.snapshotNodeList;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var unwrap = scope.unwrap;
    var wrap = scope.wrap;
    var wrappers = scope.wrappers;
    var escapeAttrRegExp = /[&\u00A0"]/g;
    var escapeDataRegExp = /[&\u00A0<>]/g;
    function escapeReplace(c) {
      switch (c) {
       case "&":
        return "&amp;";

       case "<":
        return "&lt;";

       case ">":
        return "&gt;";

       case '"':
        return "&quot;";

       case " ":
        return "&nbsp;";
      }
    }
    function escapeAttr(s) {
      return s.replace(escapeAttrRegExp, escapeReplace);
    }
    function escapeData(s) {
      return s.replace(escapeDataRegExp, escapeReplace);
    }
    function makeSet(arr) {
      var set = {};
      for (var i = 0; i < arr.length; i++) {
        set[arr[i]] = true;
      }
      return set;
    }
    var voidElements = makeSet([ "area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr" ]);
    var plaintextParents = makeSet([ "style", "script", "xmp", "iframe", "noembed", "noframes", "plaintext", "noscript" ]);
    var XHTML_NS = "http://www.w3.org/1999/xhtml";
    function needsSelfClosingSlash(node) {
      if (node.namespaceURI !== XHTML_NS) return true;
      var doctype = node.ownerDocument.doctype;
      return doctype && doctype.publicId && doctype.systemId;
    }
    function getOuterHTML(node, parentNode) {
      switch (node.nodeType) {
       case Node.ELEMENT_NODE:
        var tagName = node.tagName.toLowerCase();
        var s = "<" + tagName;
        var attrs = node.attributes;
        for (var i = 0, attr; attr = attrs[i]; i++) {
          s += " " + attr.name + '="' + escapeAttr(attr.value) + '"';
        }
        if (voidElements[tagName]) {
          if (needsSelfClosingSlash(node)) s += "/";
          return s + ">";
        }
        return s + ">" + getInnerHTML(node) + "</" + tagName + ">";

       case Node.TEXT_NODE:
        var data = node.data;
        if (parentNode && plaintextParents[parentNode.localName]) return data;
        return escapeData(data);

       case Node.COMMENT_NODE:
        return "\x3c!--" + node.data + "--\x3e";

       default:
        console.error(node);
        throw new Error("not implemented");
      }
    }
    function getInnerHTML(node) {
      if (node instanceof wrappers.HTMLTemplateElement) node = node.content;
      var s = "";
      for (var child = node.firstChild; child; child = child.nextSibling) {
        s += getOuterHTML(child, node);
      }
      return s;
    }
    function setInnerHTML(node, value, opt_tagName) {
      var tagName = opt_tagName || "div";
      node.textContent = "";
      var tempElement = unwrap(node.ownerDocument.createElement(tagName));
      tempElement.innerHTML = value;
      var firstChild;
      while (firstChild = tempElement.firstChild) {
        node.appendChild(wrap(firstChild));
      }
    }
    var oldIe = /MSIE/.test(navigator.userAgent);
    var OriginalHTMLElement = window.HTMLElement;
    var OriginalHTMLTemplateElement = window.HTMLTemplateElement;
    function HTMLElement(node) {
      Element.call(this, node);
    }
    HTMLElement.prototype = Object.create(Element.prototype);
    mixin(HTMLElement.prototype, {
      get innerHTML() {
        return getInnerHTML(this);
      },
      set innerHTML(value) {
        if (oldIe && plaintextParents[this.localName]) {
          this.textContent = value;
          return;
        }
        var removedNodes = snapshotNodeList(this.childNodes);
        if (this.invalidateShadowRenderer()) {
          if (this instanceof wrappers.HTMLTemplateElement) setInnerHTML(this.content, value); else setInnerHTML(this, value, this.tagName);
        } else if (!OriginalHTMLTemplateElement && this instanceof wrappers.HTMLTemplateElement) {
          setInnerHTML(this.content, value);
        } else {
          unsafeUnwrap(this).innerHTML = value;
        }
        var addedNodes = snapshotNodeList(this.childNodes);
        enqueueMutation(this, "childList", {
          addedNodes: addedNodes,
          removedNodes: removedNodes
        });
        nodesWereRemoved(removedNodes);
        nodesWereAdded(addedNodes, this);
      },
      get outerHTML() {
        return getOuterHTML(this, this.parentNode);
      },
      set outerHTML(value) {
        var p = this.parentNode;
        if (p) {
          p.invalidateShadowRenderer();
          var df = frag(p, value);
          p.replaceChild(df, this);
        }
      },
      insertAdjacentHTML: function(position, text) {
        var contextElement, refNode;
        switch (String(position).toLowerCase()) {
         case "beforebegin":
          contextElement = this.parentNode;
          refNode = this;
          break;

         case "afterend":
          contextElement = this.parentNode;
          refNode = this.nextSibling;
          break;

         case "afterbegin":
          contextElement = this;
          refNode = this.firstChild;
          break;

         case "beforeend":
          contextElement = this;
          refNode = null;
          break;

         default:
          return;
        }
        var df = frag(contextElement, text);
        contextElement.insertBefore(df, refNode);
      },
      get hidden() {
        return this.hasAttribute("hidden");
      },
      set hidden(v) {
        if (v) {
          this.setAttribute("hidden", "");
        } else {
          this.removeAttribute("hidden");
        }
      }
    });
    function frag(contextElement, html) {
      var p = unwrap(contextElement.cloneNode(false));
      p.innerHTML = html;
      var df = unwrap(document.createDocumentFragment());
      var c;
      while (c = p.firstChild) {
        df.appendChild(c);
      }
      return wrap(df);
    }
    function getter(name) {
      return function() {
        scope.renderAllPending();
        return unsafeUnwrap(this)[name];
      };
    }
    function getterRequiresRendering(name) {
      defineGetter(HTMLElement, name, getter(name));
    }
    [ "clientHeight", "clientLeft", "clientTop", "clientWidth", "offsetHeight", "offsetLeft", "offsetTop", "offsetWidth", "scrollHeight", "scrollWidth" ].forEach(getterRequiresRendering);
    function getterAndSetterRequiresRendering(name) {
      Object.defineProperty(HTMLElement.prototype, name, {
        get: getter(name),
        set: function(v) {
          scope.renderAllPending();
          unsafeUnwrap(this)[name] = v;
        },
        configurable: true,
        enumerable: true
      });
    }
    [ "scrollLeft", "scrollTop" ].forEach(getterAndSetterRequiresRendering);
    function methodRequiresRendering(name) {
      Object.defineProperty(HTMLElement.prototype, name, {
        value: function() {
          scope.renderAllPending();
          return unsafeUnwrap(this)[name].apply(unsafeUnwrap(this), arguments);
        },
        configurable: true,
        enumerable: true
      });
    }
    [ "focus", "getBoundingClientRect", "getClientRects", "scrollIntoView" ].forEach(methodRequiresRendering);
    registerWrapper(OriginalHTMLElement, HTMLElement, document.createElement("b"));
    scope.wrappers.HTMLElement = HTMLElement;
    scope.getInnerHTML = getInnerHTML;
    scope.setInnerHTML = setInnerHTML;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLElement = scope.wrappers.HTMLElement;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var wrap = scope.wrap;
    var OriginalHTMLCanvasElement = window.HTMLCanvasElement;
    function HTMLCanvasElement(node) {
      HTMLElement.call(this, node);
    }
    HTMLCanvasElement.prototype = Object.create(HTMLElement.prototype);
    mixin(HTMLCanvasElement.prototype, {
      getContext: function() {
        var context = unsafeUnwrap(this).getContext.apply(unsafeUnwrap(this), arguments);
        return context && wrap(context);
      }
    });
    registerWrapper(OriginalHTMLCanvasElement, HTMLCanvasElement, document.createElement("canvas"));
    scope.wrappers.HTMLCanvasElement = HTMLCanvasElement;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLElement = scope.wrappers.HTMLElement;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var OriginalHTMLContentElement = window.HTMLContentElement;
    function HTMLContentElement(node) {
      HTMLElement.call(this, node);
    }
    HTMLContentElement.prototype = Object.create(HTMLElement.prototype);
    mixin(HTMLContentElement.prototype, {
      constructor: HTMLContentElement,
      get select() {
        return this.getAttribute("select");
      },
      set select(value) {
        this.setAttribute("select", value);
      },
      setAttribute: function(n, v) {
        HTMLElement.prototype.setAttribute.call(this, n, v);
        if (String(n).toLowerCase() === "select") this.invalidateShadowRenderer(true);
      }
    });
    if (OriginalHTMLContentElement) registerWrapper(OriginalHTMLContentElement, HTMLContentElement);
    scope.wrappers.HTMLContentElement = HTMLContentElement;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLElement = scope.wrappers.HTMLElement;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var wrapHTMLCollection = scope.wrapHTMLCollection;
    var unwrap = scope.unwrap;
    var OriginalHTMLFormElement = window.HTMLFormElement;
    function HTMLFormElement(node) {
      HTMLElement.call(this, node);
    }
    HTMLFormElement.prototype = Object.create(HTMLElement.prototype);
    mixin(HTMLFormElement.prototype, {
      get elements() {
        return wrapHTMLCollection(unwrap(this).elements);
      }
    });
    registerWrapper(OriginalHTMLFormElement, HTMLFormElement, document.createElement("form"));
    scope.wrappers.HTMLFormElement = HTMLFormElement;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLElement = scope.wrappers.HTMLElement;
    var registerWrapper = scope.registerWrapper;
    var unwrap = scope.unwrap;
    var rewrap = scope.rewrap;
    var OriginalHTMLImageElement = window.HTMLImageElement;
    function HTMLImageElement(node) {
      HTMLElement.call(this, node);
    }
    HTMLImageElement.prototype = Object.create(HTMLElement.prototype);
    registerWrapper(OriginalHTMLImageElement, HTMLImageElement, document.createElement("img"));
    function Image(width, height) {
      if (!(this instanceof Image)) {
        throw new TypeError("DOM object constructor cannot be called as a function.");
      }
      var node = unwrap(document.createElement("img"));
      HTMLElement.call(this, node);
      rewrap(node, this);
      if (width !== undefined) node.width = width;
      if (height !== undefined) node.height = height;
    }
    Image.prototype = HTMLImageElement.prototype;
    scope.wrappers.HTMLImageElement = HTMLImageElement;
    scope.wrappers.Image = Image;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLElement = scope.wrappers.HTMLElement;
    var mixin = scope.mixin;
    var NodeList = scope.wrappers.NodeList;
    var registerWrapper = scope.registerWrapper;
    var OriginalHTMLShadowElement = window.HTMLShadowElement;
    function HTMLShadowElement(node) {
      HTMLElement.call(this, node);
    }
    HTMLShadowElement.prototype = Object.create(HTMLElement.prototype);
    HTMLShadowElement.prototype.constructor = HTMLShadowElement;
    if (OriginalHTMLShadowElement) registerWrapper(OriginalHTMLShadowElement, HTMLShadowElement);
    scope.wrappers.HTMLShadowElement = HTMLShadowElement;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLElement = scope.wrappers.HTMLElement;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var unwrap = scope.unwrap;
    var wrap = scope.wrap;
    var contentTable = new WeakMap();
    var templateContentsOwnerTable = new WeakMap();
    function getTemplateContentsOwner(doc) {
      if (!doc.defaultView) return doc;
      var d = templateContentsOwnerTable.get(doc);
      if (!d) {
        d = doc.implementation.createHTMLDocument("");
        while (d.lastChild) {
          d.removeChild(d.lastChild);
        }
        templateContentsOwnerTable.set(doc, d);
      }
      return d;
    }
    function extractContent(templateElement) {
      var doc = getTemplateContentsOwner(templateElement.ownerDocument);
      var df = unwrap(doc.createDocumentFragment());
      var child;
      while (child = templateElement.firstChild) {
        df.appendChild(child);
      }
      return df;
    }
    var OriginalHTMLTemplateElement = window.HTMLTemplateElement;
    function HTMLTemplateElement(node) {
      HTMLElement.call(this, node);
      if (!OriginalHTMLTemplateElement) {
        var content = extractContent(node);
        contentTable.set(this, wrap(content));
      }
    }
    HTMLTemplateElement.prototype = Object.create(HTMLElement.prototype);
    mixin(HTMLTemplateElement.prototype, {
      constructor: HTMLTemplateElement,
      get content() {
        if (OriginalHTMLTemplateElement) return wrap(unsafeUnwrap(this).content);
        return contentTable.get(this);
      }
    });
    if (OriginalHTMLTemplateElement) registerWrapper(OriginalHTMLTemplateElement, HTMLTemplateElement);
    scope.wrappers.HTMLTemplateElement = HTMLTemplateElement;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLElement = scope.wrappers.HTMLElement;
    var registerWrapper = scope.registerWrapper;
    var OriginalHTMLMediaElement = window.HTMLMediaElement;
    if (!OriginalHTMLMediaElement) return;
    function HTMLMediaElement(node) {
      HTMLElement.call(this, node);
    }
    HTMLMediaElement.prototype = Object.create(HTMLElement.prototype);
    registerWrapper(OriginalHTMLMediaElement, HTMLMediaElement, document.createElement("audio"));
    scope.wrappers.HTMLMediaElement = HTMLMediaElement;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLMediaElement = scope.wrappers.HTMLMediaElement;
    var registerWrapper = scope.registerWrapper;
    var unwrap = scope.unwrap;
    var rewrap = scope.rewrap;
    var OriginalHTMLAudioElement = window.HTMLAudioElement;
    if (!OriginalHTMLAudioElement) return;
    function HTMLAudioElement(node) {
      HTMLMediaElement.call(this, node);
    }
    HTMLAudioElement.prototype = Object.create(HTMLMediaElement.prototype);
    registerWrapper(OriginalHTMLAudioElement, HTMLAudioElement, document.createElement("audio"));
    function Audio(src) {
      if (!(this instanceof Audio)) {
        throw new TypeError("DOM object constructor cannot be called as a function.");
      }
      var node = unwrap(document.createElement("audio"));
      HTMLMediaElement.call(this, node);
      rewrap(node, this);
      node.setAttribute("preload", "auto");
      if (src !== undefined) node.setAttribute("src", src);
    }
    Audio.prototype = HTMLAudioElement.prototype;
    scope.wrappers.HTMLAudioElement = HTMLAudioElement;
    scope.wrappers.Audio = Audio;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLElement = scope.wrappers.HTMLElement;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var rewrap = scope.rewrap;
    var unwrap = scope.unwrap;
    var wrap = scope.wrap;
    var OriginalHTMLOptionElement = window.HTMLOptionElement;
    function trimText(s) {
      return s.replace(/\s+/g, " ").trim();
    }
    function HTMLOptionElement(node) {
      HTMLElement.call(this, node);
    }
    HTMLOptionElement.prototype = Object.create(HTMLElement.prototype);
    mixin(HTMLOptionElement.prototype, {
      get text() {
        return trimText(this.textContent);
      },
      set text(value) {
        this.textContent = trimText(String(value));
      },
      get form() {
        return wrap(unwrap(this).form);
      }
    });
    registerWrapper(OriginalHTMLOptionElement, HTMLOptionElement, document.createElement("option"));
    function Option(text, value, defaultSelected, selected) {
      if (!(this instanceof Option)) {
        throw new TypeError("DOM object constructor cannot be called as a function.");
      }
      var node = unwrap(document.createElement("option"));
      HTMLElement.call(this, node);
      rewrap(node, this);
      if (text !== undefined) node.text = text;
      if (value !== undefined) node.setAttribute("value", value);
      if (defaultSelected === true) node.setAttribute("selected", "");
      node.selected = selected === true;
    }
    Option.prototype = HTMLOptionElement.prototype;
    scope.wrappers.HTMLOptionElement = HTMLOptionElement;
    scope.wrappers.Option = Option;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLElement = scope.wrappers.HTMLElement;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var unwrap = scope.unwrap;
    var wrap = scope.wrap;
    var OriginalHTMLSelectElement = window.HTMLSelectElement;
    function HTMLSelectElement(node) {
      HTMLElement.call(this, node);
    }
    HTMLSelectElement.prototype = Object.create(HTMLElement.prototype);
    mixin(HTMLSelectElement.prototype, {
      add: function(element, before) {
        if (typeof before === "object") before = unwrap(before);
        unwrap(this).add(unwrap(element), before);
      },
      remove: function(indexOrNode) {
        if (indexOrNode === undefined) {
          HTMLElement.prototype.remove.call(this);
          return;
        }
        if (typeof indexOrNode === "object") indexOrNode = unwrap(indexOrNode);
        unwrap(this).remove(indexOrNode);
      },
      get form() {
        return wrap(unwrap(this).form);
      }
    });
    registerWrapper(OriginalHTMLSelectElement, HTMLSelectElement, document.createElement("select"));
    scope.wrappers.HTMLSelectElement = HTMLSelectElement;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLElement = scope.wrappers.HTMLElement;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var unwrap = scope.unwrap;
    var wrap = scope.wrap;
    var wrapHTMLCollection = scope.wrapHTMLCollection;
    var OriginalHTMLTableElement = window.HTMLTableElement;
    function HTMLTableElement(node) {
      HTMLElement.call(this, node);
    }
    HTMLTableElement.prototype = Object.create(HTMLElement.prototype);
    mixin(HTMLTableElement.prototype, {
      get caption() {
        return wrap(unwrap(this).caption);
      },
      createCaption: function() {
        return wrap(unwrap(this).createCaption());
      },
      get tHead() {
        return wrap(unwrap(this).tHead);
      },
      createTHead: function() {
        return wrap(unwrap(this).createTHead());
      },
      createTFoot: function() {
        return wrap(unwrap(this).createTFoot());
      },
      get tFoot() {
        return wrap(unwrap(this).tFoot);
      },
      get tBodies() {
        return wrapHTMLCollection(unwrap(this).tBodies);
      },
      createTBody: function() {
        return wrap(unwrap(this).createTBody());
      },
      get rows() {
        return wrapHTMLCollection(unwrap(this).rows);
      },
      insertRow: function(index) {
        return wrap(unwrap(this).insertRow(index));
      }
    });
    registerWrapper(OriginalHTMLTableElement, HTMLTableElement, document.createElement("table"));
    scope.wrappers.HTMLTableElement = HTMLTableElement;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLElement = scope.wrappers.HTMLElement;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var wrapHTMLCollection = scope.wrapHTMLCollection;
    var unwrap = scope.unwrap;
    var wrap = scope.wrap;
    var OriginalHTMLTableSectionElement = window.HTMLTableSectionElement;
    function HTMLTableSectionElement(node) {
      HTMLElement.call(this, node);
    }
    HTMLTableSectionElement.prototype = Object.create(HTMLElement.prototype);
    mixin(HTMLTableSectionElement.prototype, {
      constructor: HTMLTableSectionElement,
      get rows() {
        return wrapHTMLCollection(unwrap(this).rows);
      },
      insertRow: function(index) {
        return wrap(unwrap(this).insertRow(index));
      }
    });
    registerWrapper(OriginalHTMLTableSectionElement, HTMLTableSectionElement, document.createElement("thead"));
    scope.wrappers.HTMLTableSectionElement = HTMLTableSectionElement;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLElement = scope.wrappers.HTMLElement;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var wrapHTMLCollection = scope.wrapHTMLCollection;
    var unwrap = scope.unwrap;
    var wrap = scope.wrap;
    var OriginalHTMLTableRowElement = window.HTMLTableRowElement;
    function HTMLTableRowElement(node) {
      HTMLElement.call(this, node);
    }
    HTMLTableRowElement.prototype = Object.create(HTMLElement.prototype);
    mixin(HTMLTableRowElement.prototype, {
      get cells() {
        return wrapHTMLCollection(unwrap(this).cells);
      },
      insertCell: function(index) {
        return wrap(unwrap(this).insertCell(index));
      }
    });
    registerWrapper(OriginalHTMLTableRowElement, HTMLTableRowElement, document.createElement("tr"));
    scope.wrappers.HTMLTableRowElement = HTMLTableRowElement;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLContentElement = scope.wrappers.HTMLContentElement;
    var HTMLElement = scope.wrappers.HTMLElement;
    var HTMLShadowElement = scope.wrappers.HTMLShadowElement;
    var HTMLTemplateElement = scope.wrappers.HTMLTemplateElement;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var OriginalHTMLUnknownElement = window.HTMLUnknownElement;
    function HTMLUnknownElement(node) {
      switch (node.localName) {
       case "content":
        return new HTMLContentElement(node);

       case "shadow":
        return new HTMLShadowElement(node);

       case "template":
        return new HTMLTemplateElement(node);
      }
      HTMLElement.call(this, node);
    }
    HTMLUnknownElement.prototype = Object.create(HTMLElement.prototype);
    registerWrapper(OriginalHTMLUnknownElement, HTMLUnknownElement);
    scope.wrappers.HTMLUnknownElement = HTMLUnknownElement;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var Element = scope.wrappers.Element;
    var HTMLElement = scope.wrappers.HTMLElement;
    var registerWrapper = scope.registerWrapper;
    var defineWrapGetter = scope.defineWrapGetter;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var wrap = scope.wrap;
    var mixin = scope.mixin;
    var SVG_NS = "http://www.w3.org/2000/svg";
    var OriginalSVGElement = window.SVGElement;
    var svgTitleElement = document.createElementNS(SVG_NS, "title");
    if (!("classList" in svgTitleElement)) {
      var descr = Object.getOwnPropertyDescriptor(Element.prototype, "classList");
      Object.defineProperty(HTMLElement.prototype, "classList", descr);
      delete Element.prototype.classList;
    }
    function SVGElement(node) {
      Element.call(this, node);
    }
    SVGElement.prototype = Object.create(Element.prototype);
    mixin(SVGElement.prototype, {
      get ownerSVGElement() {
        return wrap(unsafeUnwrap(this).ownerSVGElement);
      }
    });
    registerWrapper(OriginalSVGElement, SVGElement, document.createElementNS(SVG_NS, "title"));
    scope.wrappers.SVGElement = SVGElement;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var unwrap = scope.unwrap;
    var wrap = scope.wrap;
    var OriginalSVGUseElement = window.SVGUseElement;
    var SVG_NS = "http://www.w3.org/2000/svg";
    var gWrapper = wrap(document.createElementNS(SVG_NS, "g"));
    var useElement = document.createElementNS(SVG_NS, "use");
    var SVGGElement = gWrapper.constructor;
    var parentInterfacePrototype = Object.getPrototypeOf(SVGGElement.prototype);
    var parentInterface = parentInterfacePrototype.constructor;
    function SVGUseElement(impl) {
      parentInterface.call(this, impl);
    }
    SVGUseElement.prototype = Object.create(parentInterfacePrototype);
    if ("instanceRoot" in useElement) {
      mixin(SVGUseElement.prototype, {
        get instanceRoot() {
          return wrap(unwrap(this).instanceRoot);
        },
        get animatedInstanceRoot() {
          return wrap(unwrap(this).animatedInstanceRoot);
        }
      });
    }
    registerWrapper(OriginalSVGUseElement, SVGUseElement, useElement);
    scope.wrappers.SVGUseElement = SVGUseElement;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var EventTarget = scope.wrappers.EventTarget;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var wrap = scope.wrap;
    var OriginalSVGElementInstance = window.SVGElementInstance;
    if (!OriginalSVGElementInstance) return;
    function SVGElementInstance(impl) {
      EventTarget.call(this, impl);
    }
    SVGElementInstance.prototype = Object.create(EventTarget.prototype);
    mixin(SVGElementInstance.prototype, {
      get correspondingElement() {
        return wrap(unsafeUnwrap(this).correspondingElement);
      },
      get correspondingUseElement() {
        return wrap(unsafeUnwrap(this).correspondingUseElement);
      },
      get parentNode() {
        return wrap(unsafeUnwrap(this).parentNode);
      },
      get childNodes() {
        throw new Error("Not implemented");
      },
      get firstChild() {
        return wrap(unsafeUnwrap(this).firstChild);
      },
      get lastChild() {
        return wrap(unsafeUnwrap(this).lastChild);
      },
      get previousSibling() {
        return wrap(unsafeUnwrap(this).previousSibling);
      },
      get nextSibling() {
        return wrap(unsafeUnwrap(this).nextSibling);
      }
    });
    registerWrapper(OriginalSVGElementInstance, SVGElementInstance);
    scope.wrappers.SVGElementInstance = SVGElementInstance;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var setWrapper = scope.setWrapper;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var unwrap = scope.unwrap;
    var unwrapIfNeeded = scope.unwrapIfNeeded;
    var wrap = scope.wrap;
    var OriginalCanvasRenderingContext2D = window.CanvasRenderingContext2D;
    function CanvasRenderingContext2D(impl) {
      setWrapper(impl, this);
    }
    mixin(CanvasRenderingContext2D.prototype, {
      get canvas() {
        return wrap(unsafeUnwrap(this).canvas);
      },
      drawImage: function() {
        arguments[0] = unwrapIfNeeded(arguments[0]);
        unsafeUnwrap(this).drawImage.apply(unsafeUnwrap(this), arguments);
      },
      createPattern: function() {
        arguments[0] = unwrap(arguments[0]);
        return unsafeUnwrap(this).createPattern.apply(unsafeUnwrap(this), arguments);
      }
    });
    registerWrapper(OriginalCanvasRenderingContext2D, CanvasRenderingContext2D, document.createElement("canvas").getContext("2d"));
    scope.wrappers.CanvasRenderingContext2D = CanvasRenderingContext2D;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var addForwardingProperties = scope.addForwardingProperties;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var setWrapper = scope.setWrapper;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var unwrapIfNeeded = scope.unwrapIfNeeded;
    var wrap = scope.wrap;
    var OriginalWebGLRenderingContext = window.WebGLRenderingContext;
    if (!OriginalWebGLRenderingContext) return;
    function WebGLRenderingContext(impl) {
      setWrapper(impl, this);
    }
    mixin(WebGLRenderingContext.prototype, {
      get canvas() {
        return wrap(unsafeUnwrap(this).canvas);
      },
      texImage2D: function() {
        arguments[5] = unwrapIfNeeded(arguments[5]);
        unsafeUnwrap(this).texImage2D.apply(unsafeUnwrap(this), arguments);
      },
      texSubImage2D: function() {
        arguments[6] = unwrapIfNeeded(arguments[6]);
        unsafeUnwrap(this).texSubImage2D.apply(unsafeUnwrap(this), arguments);
      }
    });
    var OriginalWebGLRenderingContextBase = Object.getPrototypeOf(OriginalWebGLRenderingContext.prototype);
    if (OriginalWebGLRenderingContextBase !== Object.prototype) {
      addForwardingProperties(OriginalWebGLRenderingContextBase, WebGLRenderingContext.prototype);
    }
    var instanceProperties = /WebKit/.test(navigator.userAgent) ? {
      drawingBufferHeight: null,
      drawingBufferWidth: null
    } : {};
    registerWrapper(OriginalWebGLRenderingContext, WebGLRenderingContext, instanceProperties);
    scope.wrappers.WebGLRenderingContext = WebGLRenderingContext;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var Node = scope.wrappers.Node;
    var GetElementsByInterface = scope.GetElementsByInterface;
    var NonElementParentNodeInterface = scope.NonElementParentNodeInterface;
    var ParentNodeInterface = scope.ParentNodeInterface;
    var SelectorsInterface = scope.SelectorsInterface;
    var mixin = scope.mixin;
    var registerObject = scope.registerObject;
    var registerWrapper = scope.registerWrapper;
    var OriginalDocumentFragment = window.DocumentFragment;
    function DocumentFragment(node) {
      Node.call(this, node);
    }
    DocumentFragment.prototype = Object.create(Node.prototype);
    mixin(DocumentFragment.prototype, ParentNodeInterface);
    mixin(DocumentFragment.prototype, SelectorsInterface);
    mixin(DocumentFragment.prototype, GetElementsByInterface);
    mixin(DocumentFragment.prototype, NonElementParentNodeInterface);
    registerWrapper(OriginalDocumentFragment, DocumentFragment, document.createDocumentFragment());
    scope.wrappers.DocumentFragment = DocumentFragment;
    var Comment = registerObject(document.createComment(""));
    scope.wrappers.Comment = Comment;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var DocumentFragment = scope.wrappers.DocumentFragment;
    var TreeScope = scope.TreeScope;
    var elementFromPoint = scope.elementFromPoint;
    var getInnerHTML = scope.getInnerHTML;
    var getTreeScope = scope.getTreeScope;
    var mixin = scope.mixin;
    var rewrap = scope.rewrap;
    var setInnerHTML = scope.setInnerHTML;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var unwrap = scope.unwrap;
    var wrap = scope.wrap;
    var shadowHostTable = new WeakMap();
    var nextOlderShadowTreeTable = new WeakMap();
    function ShadowRoot(hostWrapper) {
      var node = unwrap(unsafeUnwrap(hostWrapper).ownerDocument.createDocumentFragment());
      DocumentFragment.call(this, node);
      rewrap(node, this);
      var oldShadowRoot = hostWrapper.shadowRoot;
      nextOlderShadowTreeTable.set(this, oldShadowRoot);
      this.treeScope_ = new TreeScope(this, getTreeScope(oldShadowRoot || hostWrapper));
      shadowHostTable.set(this, hostWrapper);
    }
    ShadowRoot.prototype = Object.create(DocumentFragment.prototype);
    mixin(ShadowRoot.prototype, {
      constructor: ShadowRoot,
      get innerHTML() {
        return getInnerHTML(this);
      },
      set innerHTML(value) {
        setInnerHTML(this, value);
        this.invalidateShadowRenderer();
      },
      get olderShadowRoot() {
        return nextOlderShadowTreeTable.get(this) || null;
      },
      get host() {
        return shadowHostTable.get(this) || null;
      },
      invalidateShadowRenderer: function() {
        return shadowHostTable.get(this).invalidateShadowRenderer();
      },
      elementFromPoint: function(x, y) {
        return elementFromPoint(this, this.ownerDocument, x, y);
      },
      getSelection: function() {
        return document.getSelection();
      },
      get activeElement() {
        var unwrappedActiveElement = unwrap(this).ownerDocument.activeElement;
        if (!unwrappedActiveElement || !unwrappedActiveElement.nodeType) return null;
        var activeElement = wrap(unwrappedActiveElement);
        while (!this.contains(activeElement)) {
          while (activeElement.parentNode) {
            activeElement = activeElement.parentNode;
          }
          if (activeElement.host) {
            activeElement = activeElement.host;
          } else {
            return null;
          }
        }
        return activeElement;
      }
    });
    scope.wrappers.ShadowRoot = ShadowRoot;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var registerWrapper = scope.registerWrapper;
    var setWrapper = scope.setWrapper;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var unwrap = scope.unwrap;
    var unwrapIfNeeded = scope.unwrapIfNeeded;
    var wrap = scope.wrap;
    var getTreeScope = scope.getTreeScope;
    var OriginalRange = window.Range;
    var ShadowRoot = scope.wrappers.ShadowRoot;
    function getHost(node) {
      var root = getTreeScope(node).root;
      if (root instanceof ShadowRoot) {
        return root.host;
      }
      return null;
    }
    function hostNodeToShadowNode(refNode, offset) {
      if (refNode.shadowRoot) {
        offset = Math.min(refNode.childNodes.length - 1, offset);
        var child = refNode.childNodes[offset];
        if (child) {
          var insertionPoint = scope.getDestinationInsertionPoints(child);
          if (insertionPoint.length > 0) {
            var parentNode = insertionPoint[0].parentNode;
            if (parentNode.nodeType == Node.ELEMENT_NODE) {
              refNode = parentNode;
            }
          }
        }
      }
      return refNode;
    }
    function shadowNodeToHostNode(node) {
      node = wrap(node);
      return getHost(node) || node;
    }
    function Range(impl) {
      setWrapper(impl, this);
    }
    Range.prototype = {
      get startContainer() {
        return shadowNodeToHostNode(unsafeUnwrap(this).startContainer);
      },
      get endContainer() {
        return shadowNodeToHostNode(unsafeUnwrap(this).endContainer);
      },
      get commonAncestorContainer() {
        return shadowNodeToHostNode(unsafeUnwrap(this).commonAncestorContainer);
      },
      setStart: function(refNode, offset) {
        refNode = hostNodeToShadowNode(refNode, offset);
        unsafeUnwrap(this).setStart(unwrapIfNeeded(refNode), offset);
      },
      setEnd: function(refNode, offset) {
        refNode = hostNodeToShadowNode(refNode, offset);
        unsafeUnwrap(this).setEnd(unwrapIfNeeded(refNode), offset);
      },
      setStartBefore: function(refNode) {
        unsafeUnwrap(this).setStartBefore(unwrapIfNeeded(refNode));
      },
      setStartAfter: function(refNode) {
        unsafeUnwrap(this).setStartAfter(unwrapIfNeeded(refNode));
      },
      setEndBefore: function(refNode) {
        unsafeUnwrap(this).setEndBefore(unwrapIfNeeded(refNode));
      },
      setEndAfter: function(refNode) {
        unsafeUnwrap(this).setEndAfter(unwrapIfNeeded(refNode));
      },
      selectNode: function(refNode) {
        unsafeUnwrap(this).selectNode(unwrapIfNeeded(refNode));
      },
      selectNodeContents: function(refNode) {
        unsafeUnwrap(this).selectNodeContents(unwrapIfNeeded(refNode));
      },
      compareBoundaryPoints: function(how, sourceRange) {
        return unsafeUnwrap(this).compareBoundaryPoints(how, unwrap(sourceRange));
      },
      extractContents: function() {
        return wrap(unsafeUnwrap(this).extractContents());
      },
      cloneContents: function() {
        return wrap(unsafeUnwrap(this).cloneContents());
      },
      insertNode: function(node) {
        unsafeUnwrap(this).insertNode(unwrapIfNeeded(node));
      },
      surroundContents: function(newParent) {
        unsafeUnwrap(this).surroundContents(unwrapIfNeeded(newParent));
      },
      cloneRange: function() {
        return wrap(unsafeUnwrap(this).cloneRange());
      },
      isPointInRange: function(node, offset) {
        return unsafeUnwrap(this).isPointInRange(unwrapIfNeeded(node), offset);
      },
      comparePoint: function(node, offset) {
        return unsafeUnwrap(this).comparePoint(unwrapIfNeeded(node), offset);
      },
      intersectsNode: function(node) {
        return unsafeUnwrap(this).intersectsNode(unwrapIfNeeded(node));
      },
      toString: function() {
        return unsafeUnwrap(this).toString();
      }
    };
    if (OriginalRange.prototype.createContextualFragment) {
      Range.prototype.createContextualFragment = function(html) {
        return wrap(unsafeUnwrap(this).createContextualFragment(html));
      };
    }
    registerWrapper(window.Range, Range, document.createRange());
    scope.wrappers.Range = Range;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var Element = scope.wrappers.Element;
    var HTMLContentElement = scope.wrappers.HTMLContentElement;
    var HTMLShadowElement = scope.wrappers.HTMLShadowElement;
    var Node = scope.wrappers.Node;
    var ShadowRoot = scope.wrappers.ShadowRoot;
    var assert = scope.assert;
    var getTreeScope = scope.getTreeScope;
    var mixin = scope.mixin;
    var oneOf = scope.oneOf;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var unwrap = scope.unwrap;
    var wrap = scope.wrap;
    var ArraySplice = scope.ArraySplice;
    function updateWrapperUpAndSideways(wrapper) {
      wrapper.previousSibling_ = wrapper.previousSibling;
      wrapper.nextSibling_ = wrapper.nextSibling;
      wrapper.parentNode_ = wrapper.parentNode;
    }
    function updateWrapperDown(wrapper) {
      wrapper.firstChild_ = wrapper.firstChild;
      wrapper.lastChild_ = wrapper.lastChild;
    }
    function updateAllChildNodes(parentNodeWrapper) {
      assert(parentNodeWrapper instanceof Node);
      for (var childWrapper = parentNodeWrapper.firstChild; childWrapper; childWrapper = childWrapper.nextSibling) {
        updateWrapperUpAndSideways(childWrapper);
      }
      updateWrapperDown(parentNodeWrapper);
    }
    function insertBefore(parentNodeWrapper, newChildWrapper, refChildWrapper) {
      var parentNode = unwrap(parentNodeWrapper);
      var newChild = unwrap(newChildWrapper);
      var refChild = refChildWrapper ? unwrap(refChildWrapper) : null;
      remove(newChildWrapper);
      updateWrapperUpAndSideways(newChildWrapper);
      if (!refChildWrapper) {
        parentNodeWrapper.lastChild_ = parentNodeWrapper.lastChild;
        if (parentNodeWrapper.lastChild === parentNodeWrapper.firstChild) parentNodeWrapper.firstChild_ = parentNodeWrapper.firstChild;
        var lastChildWrapper = wrap(parentNode.lastChild);
        if (lastChildWrapper) lastChildWrapper.nextSibling_ = lastChildWrapper.nextSibling;
      } else {
        if (parentNodeWrapper.firstChild === refChildWrapper) parentNodeWrapper.firstChild_ = refChildWrapper;
        refChildWrapper.previousSibling_ = refChildWrapper.previousSibling;
      }
      scope.originalInsertBefore.call(parentNode, newChild, refChild);
    }
    function remove(nodeWrapper) {
      var node = unwrap(nodeWrapper);
      var parentNode = node.parentNode;
      if (!parentNode) return;
      var parentNodeWrapper = wrap(parentNode);
      updateWrapperUpAndSideways(nodeWrapper);
      if (nodeWrapper.previousSibling) nodeWrapper.previousSibling.nextSibling_ = nodeWrapper;
      if (nodeWrapper.nextSibling) nodeWrapper.nextSibling.previousSibling_ = nodeWrapper;
      if (parentNodeWrapper.lastChild === nodeWrapper) parentNodeWrapper.lastChild_ = nodeWrapper;
      if (parentNodeWrapper.firstChild === nodeWrapper) parentNodeWrapper.firstChild_ = nodeWrapper;
      scope.originalRemoveChild.call(parentNode, node);
    }
    var distributedNodesTable = new WeakMap();
    var destinationInsertionPointsTable = new WeakMap();
    var rendererForHostTable = new WeakMap();
    function resetDistributedNodes(insertionPoint) {
      distributedNodesTable.set(insertionPoint, []);
    }
    function getDistributedNodes(insertionPoint) {
      var rv = distributedNodesTable.get(insertionPoint);
      if (!rv) distributedNodesTable.set(insertionPoint, rv = []);
      return rv;
    }
    function getChildNodesSnapshot(node) {
      var result = [], i = 0;
      for (var child = node.firstChild; child; child = child.nextSibling) {
        result[i++] = child;
      }
      return result;
    }
    var request = oneOf(window, [ "requestAnimationFrame", "mozRequestAnimationFrame", "webkitRequestAnimationFrame", "setTimeout" ]);
    var pendingDirtyRenderers = [];
    var renderTimer;
    function renderAllPending() {
      for (var i = 0; i < pendingDirtyRenderers.length; i++) {
        var renderer = pendingDirtyRenderers[i];
        var parentRenderer = renderer.parentRenderer;
        if (parentRenderer && parentRenderer.dirty) continue;
        renderer.render();
      }
      pendingDirtyRenderers = [];
    }
    function handleRequestAnimationFrame() {
      renderTimer = null;
      renderAllPending();
    }
    function getRendererForHost(host) {
      var renderer = rendererForHostTable.get(host);
      if (!renderer) {
        renderer = new ShadowRenderer(host);
        rendererForHostTable.set(host, renderer);
      }
      return renderer;
    }
    function getShadowRootAncestor(node) {
      var root = getTreeScope(node).root;
      if (root instanceof ShadowRoot) return root;
      return null;
    }
    function getRendererForShadowRoot(shadowRoot) {
      return getRendererForHost(shadowRoot.host);
    }
    var spliceDiff = new ArraySplice();
    spliceDiff.equals = function(renderNode, rawNode) {
      return unwrap(renderNode.node) === rawNode;
    };
    function RenderNode(node) {
      this.skip = false;
      this.node = node;
      this.childNodes = [];
    }
    RenderNode.prototype = {
      append: function(node) {
        var rv = new RenderNode(node);
        this.childNodes.push(rv);
        return rv;
      },
      sync: function(opt_added) {
        if (this.skip) return;
        var nodeWrapper = this.node;
        var newChildren = this.childNodes;
        var oldChildren = getChildNodesSnapshot(unwrap(nodeWrapper));
        var added = opt_added || new WeakMap();
        var splices = spliceDiff.calculateSplices(newChildren, oldChildren);
        var newIndex = 0, oldIndex = 0;
        var lastIndex = 0;
        for (var i = 0; i < splices.length; i++) {
          var splice = splices[i];
          for (;lastIndex < splice.index; lastIndex++) {
            oldIndex++;
            newChildren[newIndex++].sync(added);
          }
          var removedCount = splice.removed.length;
          for (var j = 0; j < removedCount; j++) {
            var wrapper = wrap(oldChildren[oldIndex++]);
            if (!added.get(wrapper)) remove(wrapper);
          }
          var addedCount = splice.addedCount;
          var refNode = oldChildren[oldIndex] && wrap(oldChildren[oldIndex]);
          for (var j = 0; j < addedCount; j++) {
            var newChildRenderNode = newChildren[newIndex++];
            var newChildWrapper = newChildRenderNode.node;
            insertBefore(nodeWrapper, newChildWrapper, refNode);
            added.set(newChildWrapper, true);
            newChildRenderNode.sync(added);
          }
          lastIndex += addedCount;
        }
        for (var i = lastIndex; i < newChildren.length; i++) {
          newChildren[i].sync(added);
        }
      }
    };
    function ShadowRenderer(host) {
      this.host = host;
      this.dirty = false;
      this.invalidateAttributes();
      this.associateNode(host);
    }
    ShadowRenderer.prototype = {
      render: function(opt_renderNode) {
        if (!this.dirty) return;
        this.invalidateAttributes();
        var host = this.host;
        this.distribution(host);
        var renderNode = opt_renderNode || new RenderNode(host);
        this.buildRenderTree(renderNode, host);
        var topMostRenderer = !opt_renderNode;
        if (topMostRenderer) renderNode.sync();
        this.dirty = false;
      },
      get parentRenderer() {
        return getTreeScope(this.host).renderer;
      },
      invalidate: function() {
        if (!this.dirty) {
          this.dirty = true;
          var parentRenderer = this.parentRenderer;
          if (parentRenderer) parentRenderer.invalidate();
          pendingDirtyRenderers.push(this);
          if (renderTimer) return;
          renderTimer = window[request](handleRequestAnimationFrame, 0);
        }
      },
      distribution: function(root) {
        this.resetAllSubtrees(root);
        this.distributionResolution(root);
      },
      resetAll: function(node) {
        if (isInsertionPoint(node)) resetDistributedNodes(node); else resetDestinationInsertionPoints(node);
        this.resetAllSubtrees(node);
      },
      resetAllSubtrees: function(node) {
        for (var child = node.firstChild; child; child = child.nextSibling) {
          this.resetAll(child);
        }
        if (node.shadowRoot) this.resetAll(node.shadowRoot);
        if (node.olderShadowRoot) this.resetAll(node.olderShadowRoot);
      },
      distributionResolution: function(node) {
        if (isShadowHost(node)) {
          var shadowHost = node;
          var pool = poolPopulation(shadowHost);
          var shadowTrees = getShadowTrees(shadowHost);
          for (var i = 0; i < shadowTrees.length; i++) {
            this.poolDistribution(shadowTrees[i], pool);
          }
          for (var i = shadowTrees.length - 1; i >= 0; i--) {
            var shadowTree = shadowTrees[i];
            var shadow = getShadowInsertionPoint(shadowTree);
            if (shadow) {
              var olderShadowRoot = shadowTree.olderShadowRoot;
              if (olderShadowRoot) {
                pool = poolPopulation(olderShadowRoot);
              }
              for (var j = 0; j < pool.length; j++) {
                destributeNodeInto(pool[j], shadow);
              }
            }
            this.distributionResolution(shadowTree);
          }
        }
        for (var child = node.firstChild; child; child = child.nextSibling) {
          this.distributionResolution(child);
        }
      },
      poolDistribution: function(node, pool) {
        if (node instanceof HTMLShadowElement) return;
        if (node instanceof HTMLContentElement) {
          var content = node;
          this.updateDependentAttributes(content.getAttribute("select"));
          var anyDistributed = false;
          for (var i = 0; i < pool.length; i++) {
            var node = pool[i];
            if (!node) continue;
            if (matches(node, content)) {
              destributeNodeInto(node, content);
              pool[i] = undefined;
              anyDistributed = true;
            }
          }
          if (!anyDistributed) {
            for (var child = content.firstChild; child; child = child.nextSibling) {
              destributeNodeInto(child, content);
            }
          }
          return;
        }
        for (var child = node.firstChild; child; child = child.nextSibling) {
          this.poolDistribution(child, pool);
        }
      },
      buildRenderTree: function(renderNode, node) {
        var children = this.compose(node);
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          var childRenderNode = renderNode.append(child);
          this.buildRenderTree(childRenderNode, child);
        }
        if (isShadowHost(node)) {
          var renderer = getRendererForHost(node);
          renderer.dirty = false;
        }
      },
      compose: function(node) {
        var children = [];
        var p = node.shadowRoot || node;
        for (var child = p.firstChild; child; child = child.nextSibling) {
          if (isInsertionPoint(child)) {
            this.associateNode(p);
            var distributedNodes = getDistributedNodes(child);
            for (var j = 0; j < distributedNodes.length; j++) {
              var distributedNode = distributedNodes[j];
              if (isFinalDestination(child, distributedNode)) children.push(distributedNode);
            }
          } else {
            children.push(child);
          }
        }
        return children;
      },
      invalidateAttributes: function() {
        this.attributes = Object.create(null);
      },
      updateDependentAttributes: function(selector) {
        if (!selector) return;
        var attributes = this.attributes;
        if (/\.\w+/.test(selector)) attributes["class"] = true;
        if (/#\w+/.test(selector)) attributes["id"] = true;
        selector.replace(/\[\s*([^\s=\|~\]]+)/g, function(_, name) {
          attributes[name] = true;
        });
      },
      dependsOnAttribute: function(name) {
        return this.attributes[name];
      },
      associateNode: function(node) {
        unsafeUnwrap(node).polymerShadowRenderer_ = this;
      }
    };
    function poolPopulation(node) {
      var pool = [];
      for (var child = node.firstChild; child; child = child.nextSibling) {
        if (isInsertionPoint(child)) {
          pool.push.apply(pool, getDistributedNodes(child));
        } else {
          pool.push(child);
        }
      }
      return pool;
    }
    function getShadowInsertionPoint(node) {
      if (node instanceof HTMLShadowElement) return node;
      if (node instanceof HTMLContentElement) return null;
      for (var child = node.firstChild; child; child = child.nextSibling) {
        var res = getShadowInsertionPoint(child);
        if (res) return res;
      }
      return null;
    }
    function destributeNodeInto(child, insertionPoint) {
      getDistributedNodes(insertionPoint).push(child);
      var points = destinationInsertionPointsTable.get(child);
      if (!points) destinationInsertionPointsTable.set(child, [ insertionPoint ]); else points.push(insertionPoint);
    }
    function getDestinationInsertionPoints(node) {
      return destinationInsertionPointsTable.get(node);
    }
    function resetDestinationInsertionPoints(node) {
      destinationInsertionPointsTable.set(node, undefined);
    }
    var selectorStartCharRe = /^(:not\()?[*.#[a-zA-Z_|]/;
    function matches(node, contentElement) {
      var select = contentElement.getAttribute("select");
      if (!select) return true;
      select = select.trim();
      if (!select) return true;
      if (!(node instanceof Element)) return false;
      if (!selectorStartCharRe.test(select)) return false;
      try {
        return node.matches(select);
      } catch (ex) {
        return false;
      }
    }
    function isFinalDestination(insertionPoint, node) {
      var points = getDestinationInsertionPoints(node);
      return points && points[points.length - 1] === insertionPoint;
    }
    function isInsertionPoint(node) {
      return node instanceof HTMLContentElement || node instanceof HTMLShadowElement;
    }
    function isShadowHost(shadowHost) {
      return shadowHost.shadowRoot;
    }
    function getShadowTrees(host) {
      var trees = [];
      for (var tree = host.shadowRoot; tree; tree = tree.olderShadowRoot) {
        trees.push(tree);
      }
      return trees;
    }
    function render(host) {
      new ShadowRenderer(host).render();
    }
    Node.prototype.invalidateShadowRenderer = function(force) {
      var renderer = unsafeUnwrap(this).polymerShadowRenderer_;
      if (renderer) {
        renderer.invalidate();
        return true;
      }
      return false;
    };
    HTMLContentElement.prototype.getDistributedNodes = HTMLShadowElement.prototype.getDistributedNodes = function() {
      renderAllPending();
      return getDistributedNodes(this);
    };
    Element.prototype.getDestinationInsertionPoints = function() {
      renderAllPending();
      return getDestinationInsertionPoints(this) || [];
    };
    HTMLContentElement.prototype.nodeIsInserted_ = HTMLShadowElement.prototype.nodeIsInserted_ = function() {
      this.invalidateShadowRenderer();
      var shadowRoot = getShadowRootAncestor(this);
      var renderer;
      if (shadowRoot) renderer = getRendererForShadowRoot(shadowRoot);
      unsafeUnwrap(this).polymerShadowRenderer_ = renderer;
      if (renderer) renderer.invalidate();
    };
    scope.getRendererForHost = getRendererForHost;
    scope.getShadowTrees = getShadowTrees;
    scope.renderAllPending = renderAllPending;
    scope.getDestinationInsertionPoints = getDestinationInsertionPoints;
    scope.visual = {
      insertBefore: insertBefore,
      remove: remove
    };
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLElement = scope.wrappers.HTMLElement;
    var assert = scope.assert;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var unwrap = scope.unwrap;
    var wrap = scope.wrap;
    var elementsWithFormProperty = [ "HTMLButtonElement", "HTMLFieldSetElement", "HTMLInputElement", "HTMLKeygenElement", "HTMLLabelElement", "HTMLLegendElement", "HTMLObjectElement", "HTMLOutputElement", "HTMLTextAreaElement" ];
    function createWrapperConstructor(name) {
      if (!window[name]) return;
      assert(!scope.wrappers[name]);
      var GeneratedWrapper = function(node) {
        HTMLElement.call(this, node);
      };
      GeneratedWrapper.prototype = Object.create(HTMLElement.prototype);
      mixin(GeneratedWrapper.prototype, {
        get form() {
          return wrap(unwrap(this).form);
        }
      });
      registerWrapper(window[name], GeneratedWrapper, document.createElement(name.slice(4, -7)));
      scope.wrappers[name] = GeneratedWrapper;
    }
    elementsWithFormProperty.forEach(createWrapperConstructor);
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var registerWrapper = scope.registerWrapper;
    var setWrapper = scope.setWrapper;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var unwrap = scope.unwrap;
    var unwrapIfNeeded = scope.unwrapIfNeeded;
    var wrap = scope.wrap;
    var OriginalSelection = window.Selection;
    function Selection(impl) {
      setWrapper(impl, this);
    }
    Selection.prototype = {
      get anchorNode() {
        return wrap(unsafeUnwrap(this).anchorNode);
      },
      get focusNode() {
        return wrap(unsafeUnwrap(this).focusNode);
      },
      addRange: function(range) {
        unsafeUnwrap(this).addRange(unwrapIfNeeded(range));
      },
      collapse: function(node, index) {
        unsafeUnwrap(this).collapse(unwrapIfNeeded(node), index);
      },
      containsNode: function(node, allowPartial) {
        return unsafeUnwrap(this).containsNode(unwrapIfNeeded(node), allowPartial);
      },
      getRangeAt: function(index) {
        return wrap(unsafeUnwrap(this).getRangeAt(index));
      },
      removeRange: function(range) {
        unsafeUnwrap(this).removeRange(unwrap(range));
      },
      selectAllChildren: function(node) {
        unsafeUnwrap(this).selectAllChildren(node instanceof ShadowRoot ? unsafeUnwrap(node.host) : unwrapIfNeeded(node));
      },
      toString: function() {
        return unsafeUnwrap(this).toString();
      }
    };
    if (OriginalSelection.prototype.extend) {
      Selection.prototype.extend = function(node, offset) {
        unsafeUnwrap(this).extend(unwrapIfNeeded(node), offset);
      };
    }
    registerWrapper(window.Selection, Selection, window.getSelection());
    scope.wrappers.Selection = Selection;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var registerWrapper = scope.registerWrapper;
    var setWrapper = scope.setWrapper;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var unwrapIfNeeded = scope.unwrapIfNeeded;
    var wrap = scope.wrap;
    var OriginalTreeWalker = window.TreeWalker;
    function TreeWalker(impl) {
      setWrapper(impl, this);
    }
    TreeWalker.prototype = {
      get root() {
        return wrap(unsafeUnwrap(this).root);
      },
      get currentNode() {
        return wrap(unsafeUnwrap(this).currentNode);
      },
      set currentNode(node) {
        unsafeUnwrap(this).currentNode = unwrapIfNeeded(node);
      },
      get filter() {
        return unsafeUnwrap(this).filter;
      },
      parentNode: function() {
        return wrap(unsafeUnwrap(this).parentNode());
      },
      firstChild: function() {
        return wrap(unsafeUnwrap(this).firstChild());
      },
      lastChild: function() {
        return wrap(unsafeUnwrap(this).lastChild());
      },
      previousSibling: function() {
        return wrap(unsafeUnwrap(this).previousSibling());
      },
      previousNode: function() {
        return wrap(unsafeUnwrap(this).previousNode());
      },
      nextNode: function() {
        return wrap(unsafeUnwrap(this).nextNode());
      }
    };
    registerWrapper(OriginalTreeWalker, TreeWalker);
    scope.wrappers.TreeWalker = TreeWalker;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var GetElementsByInterface = scope.GetElementsByInterface;
    var Node = scope.wrappers.Node;
    var ParentNodeInterface = scope.ParentNodeInterface;
    var NonElementParentNodeInterface = scope.NonElementParentNodeInterface;
    var Selection = scope.wrappers.Selection;
    var SelectorsInterface = scope.SelectorsInterface;
    var ShadowRoot = scope.wrappers.ShadowRoot;
    var TreeScope = scope.TreeScope;
    var cloneNode = scope.cloneNode;
    var defineGetter = scope.defineGetter;
    var defineWrapGetter = scope.defineWrapGetter;
    var elementFromPoint = scope.elementFromPoint;
    var forwardMethodsToWrapper = scope.forwardMethodsToWrapper;
    var matchesNames = scope.matchesNames;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var renderAllPending = scope.renderAllPending;
    var rewrap = scope.rewrap;
    var setWrapper = scope.setWrapper;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var unwrap = scope.unwrap;
    var wrap = scope.wrap;
    var wrapEventTargetMethods = scope.wrapEventTargetMethods;
    var wrapNodeList = scope.wrapNodeList;
    var implementationTable = new WeakMap();
    function Document(node) {
      Node.call(this, node);
      this.treeScope_ = new TreeScope(this, null);
    }
    Document.prototype = Object.create(Node.prototype);
    defineWrapGetter(Document, "documentElement");
    defineWrapGetter(Document, "body");
    defineWrapGetter(Document, "head");
    defineGetter(Document, "activeElement", function() {
      var unwrappedActiveElement = unwrap(this).activeElement;
      if (!unwrappedActiveElement || !unwrappedActiveElement.nodeType) return null;
      var activeElement = wrap(unwrappedActiveElement);
      while (!this.contains(activeElement)) {
        while (activeElement.parentNode) {
          activeElement = activeElement.parentNode;
        }
        if (activeElement.host) {
          activeElement = activeElement.host;
        } else {
          return null;
        }
      }
      return activeElement;
    });
    function wrapMethod(name) {
      var original = document[name];
      Document.prototype[name] = function() {
        return wrap(original.apply(unsafeUnwrap(this), arguments));
      };
    }
    [ "createComment", "createDocumentFragment", "createElement", "createElementNS", "createEvent", "createEventNS", "createRange", "createTextNode" ].forEach(wrapMethod);
    var originalAdoptNode = document.adoptNode;
    function adoptNodeNoRemove(node, doc) {
      originalAdoptNode.call(unsafeUnwrap(doc), unwrap(node));
      adoptSubtree(node, doc);
    }
    function adoptSubtree(node, doc) {
      if (node.shadowRoot) doc.adoptNode(node.shadowRoot);
      if (node instanceof ShadowRoot) adoptOlderShadowRoots(node, doc);
      for (var child = node.firstChild; child; child = child.nextSibling) {
        adoptSubtree(child, doc);
      }
    }
    function adoptOlderShadowRoots(shadowRoot, doc) {
      var oldShadowRoot = shadowRoot.olderShadowRoot;
      if (oldShadowRoot) doc.adoptNode(oldShadowRoot);
    }
    var originalGetSelection = document.getSelection;
    mixin(Document.prototype, {
      adoptNode: function(node) {
        if (node.parentNode) node.parentNode.removeChild(node);
        adoptNodeNoRemove(node, this);
        return node;
      },
      elementFromPoint: function(x, y) {
        return elementFromPoint(this, this, x, y);
      },
      importNode: function(node, deep) {
        return cloneNode(node, deep, unsafeUnwrap(this));
      },
      getSelection: function() {
        renderAllPending();
        return new Selection(originalGetSelection.call(unwrap(this)));
      },
      getElementsByName: function(name) {
        return SelectorsInterface.querySelectorAll.call(this, "[name=" + JSON.stringify(String(name)) + "]");
      }
    });
    var originalCreateTreeWalker = document.createTreeWalker;
    var TreeWalkerWrapper = scope.wrappers.TreeWalker;
    Document.prototype.createTreeWalker = function(root, whatToShow, filter, expandEntityReferences) {
      var newFilter = null;
      if (filter) {
        if (filter.acceptNode && typeof filter.acceptNode === "function") {
          newFilter = {
            acceptNode: function(node) {
              return filter.acceptNode(wrap(node));
            }
          };
        } else if (typeof filter === "function") {
          newFilter = function(node) {
            return filter(wrap(node));
          };
        }
      }
      return new TreeWalkerWrapper(originalCreateTreeWalker.call(unwrap(this), unwrap(root), whatToShow, newFilter, expandEntityReferences));
    };
    if (document.registerElement) {
      var originalRegisterElement = document.registerElement;
      Document.prototype.registerElement = function(tagName, object) {
        var prototype, extendsOption;
        if (object !== undefined) {
          prototype = object.prototype;
          extendsOption = object.extends;
        }
        if (!prototype) prototype = Object.create(HTMLElement.prototype);
        if (scope.nativePrototypeTable.get(prototype)) {
          throw new Error("NotSupportedError");
        }
        var proto = Object.getPrototypeOf(prototype);
        var nativePrototype;
        var prototypes = [];
        while (proto) {
          nativePrototype = scope.nativePrototypeTable.get(proto);
          if (nativePrototype) break;
          prototypes.push(proto);
          proto = Object.getPrototypeOf(proto);
        }
        if (!nativePrototype) {
          throw new Error("NotSupportedError");
        }
        var newPrototype = Object.create(nativePrototype);
        for (var i = prototypes.length - 1; i >= 0; i--) {
          newPrototype = Object.create(newPrototype);
        }
        [ "createdCallback", "attachedCallback", "detachedCallback", "attributeChangedCallback" ].forEach(function(name) {
          var f = prototype[name];
          if (!f) return;
          newPrototype[name] = function() {
            if (!(wrap(this) instanceof CustomElementConstructor)) {
              rewrap(this);
            }
            f.apply(wrap(this), arguments);
          };
        });
        var p = {
          prototype: newPrototype
        };
        if (extendsOption) p.extends = extendsOption;
        function CustomElementConstructor(node) {
          if (!node) {
            if (extendsOption) {
              return document.createElement(extendsOption, tagName);
            } else {
              return document.createElement(tagName);
            }
          }
          setWrapper(node, this);
        }
        CustomElementConstructor.prototype = prototype;
        CustomElementConstructor.prototype.constructor = CustomElementConstructor;
        scope.constructorTable.set(newPrototype, CustomElementConstructor);
        scope.nativePrototypeTable.set(prototype, newPrototype);
        var nativeConstructor = originalRegisterElement.call(unwrap(this), tagName, p);
        return CustomElementConstructor;
      };
      forwardMethodsToWrapper([ window.HTMLDocument || window.Document ], [ "registerElement" ]);
    }
    forwardMethodsToWrapper([ window.HTMLBodyElement, window.HTMLDocument || window.Document, window.HTMLHeadElement, window.HTMLHtmlElement ], [ "appendChild", "compareDocumentPosition", "contains", "getElementsByClassName", "getElementsByTagName", "getElementsByTagNameNS", "insertBefore", "querySelector", "querySelectorAll", "removeChild", "replaceChild" ]);
    forwardMethodsToWrapper([ window.HTMLBodyElement, window.HTMLHeadElement, window.HTMLHtmlElement ], matchesNames);
    forwardMethodsToWrapper([ window.HTMLDocument || window.Document ], [ "adoptNode", "importNode", "contains", "createComment", "createDocumentFragment", "createElement", "createElementNS", "createEvent", "createEventNS", "createRange", "createTextNode", "createTreeWalker", "elementFromPoint", "getElementById", "getElementsByName", "getSelection" ]);
    mixin(Document.prototype, GetElementsByInterface);
    mixin(Document.prototype, ParentNodeInterface);
    mixin(Document.prototype, SelectorsInterface);
    mixin(Document.prototype, NonElementParentNodeInterface);
    mixin(Document.prototype, {
      get implementation() {
        var implementation = implementationTable.get(this);
        if (implementation) return implementation;
        implementation = new DOMImplementation(unwrap(this).implementation);
        implementationTable.set(this, implementation);
        return implementation;
      },
      get defaultView() {
        return wrap(unwrap(this).defaultView);
      }
    });
    registerWrapper(window.Document, Document, document.implementation.createHTMLDocument(""));
    if (window.HTMLDocument) registerWrapper(window.HTMLDocument, Document);
    wrapEventTargetMethods([ window.HTMLBodyElement, window.HTMLDocument || window.Document, window.HTMLHeadElement ]);
    function DOMImplementation(impl) {
      setWrapper(impl, this);
    }
    var originalCreateDocument = document.implementation.createDocument;
    DOMImplementation.prototype.createDocument = function() {
      arguments[2] = unwrap(arguments[2]);
      return wrap(originalCreateDocument.apply(unsafeUnwrap(this), arguments));
    };
    function wrapImplMethod(constructor, name) {
      var original = document.implementation[name];
      constructor.prototype[name] = function() {
        return wrap(original.apply(unsafeUnwrap(this), arguments));
      };
    }
    function forwardImplMethod(constructor, name) {
      var original = document.implementation[name];
      constructor.prototype[name] = function() {
        return original.apply(unsafeUnwrap(this), arguments);
      };
    }
    wrapImplMethod(DOMImplementation, "createDocumentType");
    wrapImplMethod(DOMImplementation, "createHTMLDocument");
    forwardImplMethod(DOMImplementation, "hasFeature");
    registerWrapper(window.DOMImplementation, DOMImplementation);
    forwardMethodsToWrapper([ window.DOMImplementation ], [ "createDocument", "createDocumentType", "createHTMLDocument", "hasFeature" ]);
    scope.adoptNodeNoRemove = adoptNodeNoRemove;
    scope.wrappers.DOMImplementation = DOMImplementation;
    scope.wrappers.Document = Document;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var EventTarget = scope.wrappers.EventTarget;
    var Selection = scope.wrappers.Selection;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var renderAllPending = scope.renderAllPending;
    var unwrap = scope.unwrap;
    var unwrapIfNeeded = scope.unwrapIfNeeded;
    var wrap = scope.wrap;
    var OriginalWindow = window.Window;
    var originalGetComputedStyle = window.getComputedStyle;
    var originalGetDefaultComputedStyle = window.getDefaultComputedStyle;
    var originalGetSelection = window.getSelection;
    function Window(impl) {
      EventTarget.call(this, impl);
    }
    Window.prototype = Object.create(EventTarget.prototype);
    OriginalWindow.prototype.getComputedStyle = function(el, pseudo) {
      return wrap(this || window).getComputedStyle(unwrapIfNeeded(el), pseudo);
    };
    if (originalGetDefaultComputedStyle) {
      OriginalWindow.prototype.getDefaultComputedStyle = function(el, pseudo) {
        return wrap(this || window).getDefaultComputedStyle(unwrapIfNeeded(el), pseudo);
      };
    }
    OriginalWindow.prototype.getSelection = function() {
      return wrap(this || window).getSelection();
    };
    delete window.getComputedStyle;
    delete window.getDefaultComputedStyle;
    delete window.getSelection;
    [ "addEventListener", "removeEventListener", "dispatchEvent" ].forEach(function(name) {
      OriginalWindow.prototype[name] = function() {
        var w = wrap(this || window);
        return w[name].apply(w, arguments);
      };
      delete window[name];
    });
    mixin(Window.prototype, {
      getComputedStyle: function(el, pseudo) {
        renderAllPending();
        return originalGetComputedStyle.call(unwrap(this), unwrapIfNeeded(el), pseudo);
      },
      getSelection: function() {
        renderAllPending();
        return new Selection(originalGetSelection.call(unwrap(this)));
      },
      get document() {
        return wrap(unwrap(this).document);
      }
    });
    if (originalGetDefaultComputedStyle) {
      Window.prototype.getDefaultComputedStyle = function(el, pseudo) {
        renderAllPending();
        return originalGetDefaultComputedStyle.call(unwrap(this), unwrapIfNeeded(el), pseudo);
      };
    }
    registerWrapper(OriginalWindow, Window, window);
    scope.wrappers.Window = Window;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var unwrap = scope.unwrap;
    var OriginalDataTransfer = window.DataTransfer || window.Clipboard;
    var OriginalDataTransferSetDragImage = OriginalDataTransfer.prototype.setDragImage;
    if (OriginalDataTransferSetDragImage) {
      OriginalDataTransfer.prototype.setDragImage = function(image, x, y) {
        OriginalDataTransferSetDragImage.call(this, unwrap(image), x, y);
      };
    }
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var registerWrapper = scope.registerWrapper;
    var setWrapper = scope.setWrapper;
    var unwrap = scope.unwrap;
    var OriginalFormData = window.FormData;
    if (!OriginalFormData) return;
    function FormData(formElement) {
      var impl;
      if (formElement instanceof OriginalFormData) {
        impl = formElement;
      } else {
        impl = new OriginalFormData(formElement && unwrap(formElement));
      }
      setWrapper(impl, this);
    }
    registerWrapper(OriginalFormData, FormData, new OriginalFormData());
    scope.wrappers.FormData = FormData;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var unwrapIfNeeded = scope.unwrapIfNeeded;
    var originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(obj) {
      return originalSend.call(this, unwrapIfNeeded(obj));
    };
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var isWrapperFor = scope.isWrapperFor;
    var elements = {
      a: "HTMLAnchorElement",
      area: "HTMLAreaElement",
      audio: "HTMLAudioElement",
      base: "HTMLBaseElement",
      body: "HTMLBodyElement",
      br: "HTMLBRElement",
      button: "HTMLButtonElement",
      canvas: "HTMLCanvasElement",
      caption: "HTMLTableCaptionElement",
      col: "HTMLTableColElement",
      content: "HTMLContentElement",
      data: "HTMLDataElement",
      datalist: "HTMLDataListElement",
      del: "HTMLModElement",
      dir: "HTMLDirectoryElement",
      div: "HTMLDivElement",
      dl: "HTMLDListElement",
      embed: "HTMLEmbedElement",
      fieldset: "HTMLFieldSetElement",
      font: "HTMLFontElement",
      form: "HTMLFormElement",
      frame: "HTMLFrameElement",
      frameset: "HTMLFrameSetElement",
      h1: "HTMLHeadingElement",
      head: "HTMLHeadElement",
      hr: "HTMLHRElement",
      html: "HTMLHtmlElement",
      iframe: "HTMLIFrameElement",
      img: "HTMLImageElement",
      input: "HTMLInputElement",
      keygen: "HTMLKeygenElement",
      label: "HTMLLabelElement",
      legend: "HTMLLegendElement",
      li: "HTMLLIElement",
      link: "HTMLLinkElement",
      map: "HTMLMapElement",
      marquee: "HTMLMarqueeElement",
      menu: "HTMLMenuElement",
      menuitem: "HTMLMenuItemElement",
      meta: "HTMLMetaElement",
      meter: "HTMLMeterElement",
      object: "HTMLObjectElement",
      ol: "HTMLOListElement",
      optgroup: "HTMLOptGroupElement",
      option: "HTMLOptionElement",
      output: "HTMLOutputElement",
      p: "HTMLParagraphElement",
      param: "HTMLParamElement",
      pre: "HTMLPreElement",
      progress: "HTMLProgressElement",
      q: "HTMLQuoteElement",
      script: "HTMLScriptElement",
      select: "HTMLSelectElement",
      shadow: "HTMLShadowElement",
      source: "HTMLSourceElement",
      span: "HTMLSpanElement",
      style: "HTMLStyleElement",
      table: "HTMLTableElement",
      tbody: "HTMLTableSectionElement",
      template: "HTMLTemplateElement",
      textarea: "HTMLTextAreaElement",
      thead: "HTMLTableSectionElement",
      time: "HTMLTimeElement",
      title: "HTMLTitleElement",
      tr: "HTMLTableRowElement",
      track: "HTMLTrackElement",
      ul: "HTMLUListElement",
      video: "HTMLVideoElement"
    };
    function overrideConstructor(tagName) {
      var nativeConstructorName = elements[tagName];
      var nativeConstructor = window[nativeConstructorName];
      if (!nativeConstructor) return;
      var element = document.createElement(tagName);
      var wrapperConstructor = element.constructor;
      window[nativeConstructorName] = wrapperConstructor;
    }
    Object.keys(elements).forEach(overrideConstructor);
    Object.getOwnPropertyNames(scope.wrappers).forEach(function(name) {
      window[name] = scope.wrappers[name];
    });
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    var ShadowCSS = {
      strictStyling: false,
      registry: {},
      shimStyling: function(root, name, extendsName) {
        var scopeStyles = this.prepareRoot(root, name, extendsName);
        var typeExtension = this.isTypeExtension(extendsName);
        var scopeSelector = this.makeScopeSelector(name, typeExtension);
        var cssText = stylesToCssText(scopeStyles, true);
        cssText = this.scopeCssText(cssText, scopeSelector);
        if (root) {
          root.shimmedStyle = cssText;
        }
        this.addCssToDocument(cssText, name);
      },
      shimStyle: function(style, selector) {
        return this.shimCssText(style.textContent, selector);
      },
      shimCssText: function(cssText, selector) {
        cssText = this.insertDirectives(cssText);
        return this.scopeCssText(cssText, selector);
      },
      makeScopeSelector: function(name, typeExtension) {
        if (name) {
          return typeExtension ? "[is=" + name + "]" : name;
        }
        return "";
      },
      isTypeExtension: function(extendsName) {
        return extendsName && extendsName.indexOf("-") < 0;
      },
      prepareRoot: function(root, name, extendsName) {
        var def = this.registerRoot(root, name, extendsName);
        this.replaceTextInStyles(def.rootStyles, this.insertDirectives);
        this.removeStyles(root, def.rootStyles);
        if (this.strictStyling) {
          this.applyScopeToContent(root, name);
        }
        return def.scopeStyles;
      },
      removeStyles: function(root, styles) {
        for (var i = 0, l = styles.length, s; i < l && (s = styles[i]); i++) {
          s.parentNode.removeChild(s);
        }
      },
      registerRoot: function(root, name, extendsName) {
        var def = this.registry[name] = {
          root: root,
          name: name,
          extendsName: extendsName
        };
        var styles = this.findStyles(root);
        def.rootStyles = styles;
        def.scopeStyles = def.rootStyles;
        var extendee = this.registry[def.extendsName];
        if (extendee) {
          def.scopeStyles = extendee.scopeStyles.concat(def.scopeStyles);
        }
        return def;
      },
      findStyles: function(root) {
        if (!root) {
          return [];
        }
        var styles = root.querySelectorAll("style");
        return Array.prototype.filter.call(styles, function(s) {
          return !s.hasAttribute(NO_SHIM_ATTRIBUTE);
        });
      },
      applyScopeToContent: function(root, name) {
        if (root) {
          Array.prototype.forEach.call(root.querySelectorAll("*"), function(node) {
            node.setAttribute(name, "");
          });
          Array.prototype.forEach.call(root.querySelectorAll("template"), function(template) {
            this.applyScopeToContent(template.content, name);
          }, this);
        }
      },
      insertDirectives: function(cssText) {
        cssText = this.insertPolyfillDirectivesInCssText(cssText);
        return this.insertPolyfillRulesInCssText(cssText);
      },
      insertPolyfillDirectivesInCssText: function(cssText) {
        cssText = cssText.replace(cssCommentNextSelectorRe, function(match, p1) {
          return p1.slice(0, -2) + "{";
        });
        return cssText.replace(cssContentNextSelectorRe, function(match, p1) {
          return p1 + " {";
        });
      },
      insertPolyfillRulesInCssText: function(cssText) {
        cssText = cssText.replace(cssCommentRuleRe, function(match, p1) {
          return p1.slice(0, -1);
        });
        return cssText.replace(cssContentRuleRe, function(match, p1, p2, p3) {
          var rule = match.replace(p1, "").replace(p2, "");
          return p3 + rule;
        });
      },
      scopeCssText: function(cssText, scopeSelector) {
        var unscoped = this.extractUnscopedRulesFromCssText(cssText);
        cssText = this.insertPolyfillHostInCssText(cssText);
        cssText = this.convertColonHost(cssText);
        cssText = this.convertColonHostContext(cssText);
        cssText = this.convertShadowDOMSelectors(cssText);
        if (scopeSelector) {
          var self = this, cssText;
          withCssRules(cssText, function(rules) {
            cssText = self.scopeRules(rules, scopeSelector);
          });
        }
        cssText = cssText + "\n" + unscoped;
        return cssText.trim();
      },
      extractUnscopedRulesFromCssText: function(cssText) {
        var r = "", m;
        while (m = cssCommentUnscopedRuleRe.exec(cssText)) {
          r += m[1].slice(0, -1) + "\n\n";
        }
        while (m = cssContentUnscopedRuleRe.exec(cssText)) {
          r += m[0].replace(m[2], "").replace(m[1], m[3]) + "\n\n";
        }
        return r;
      },
      convertColonHost: function(cssText) {
        return this.convertColonRule(cssText, cssColonHostRe, this.colonHostPartReplacer);
      },
      convertColonHostContext: function(cssText) {
        return this.convertColonRule(cssText, cssColonHostContextRe, this.colonHostContextPartReplacer);
      },
      convertColonRule: function(cssText, regExp, partReplacer) {
        return cssText.replace(regExp, function(m, p1, p2, p3) {
          p1 = polyfillHostNoCombinator;
          if (p2) {
            var parts = p2.split(","), r = [];
            for (var i = 0, l = parts.length, p; i < l && (p = parts[i]); i++) {
              p = p.trim();
              r.push(partReplacer(p1, p, p3));
            }
            return r.join(",");
          } else {
            return p1 + p3;
          }
        });
      },
      colonHostContextPartReplacer: function(host, part, suffix) {
        if (part.match(polyfillHost)) {
          return this.colonHostPartReplacer(host, part, suffix);
        } else {
          return host + part + suffix + ", " + part + " " + host + suffix;
        }
      },
      colonHostPartReplacer: function(host, part, suffix) {
        return host + part.replace(polyfillHost, "") + suffix;
      },
      convertShadowDOMSelectors: function(cssText) {
        for (var i = 0; i < shadowDOMSelectorsRe.length; i++) {
          cssText = cssText.replace(shadowDOMSelectorsRe[i], " ");
        }
        return cssText;
      },
      scopeRules: function(cssRules, scopeSelector) {
        var cssText = "";
        if (cssRules) {
          Array.prototype.forEach.call(cssRules, function(rule) {
            if (rule.selectorText && (rule.style && rule.style.cssText !== undefined)) {
              cssText += this.scopeSelector(rule.selectorText, scopeSelector, this.strictStyling) + " {\n\t";
              cssText += this.propertiesFromRule(rule) + "\n}\n\n";
            } else if (rule.type === CSSRule.MEDIA_RULE) {
              cssText += "@media " + rule.media.mediaText + " {\n";
              cssText += this.scopeRules(rule.cssRules, scopeSelector);
              cssText += "\n}\n\n";
            } else {
              try {
                if (rule.cssText) {
                  cssText += rule.cssText + "\n\n";
                }
              } catch (x) {
                if (rule.type === CSSRule.KEYFRAMES_RULE && rule.cssRules) {
                  cssText += this.ieSafeCssTextFromKeyFrameRule(rule);
                }
              }
            }
          }, this);
        }
        return cssText;
      },
      ieSafeCssTextFromKeyFrameRule: function(rule) {
        var cssText = "@keyframes " + rule.name + " {";
        Array.prototype.forEach.call(rule.cssRules, function(rule) {
          cssText += " " + rule.keyText + " {" + rule.style.cssText + "}";
        });
        cssText += " }";
        return cssText;
      },
      scopeSelector: function(selector, scopeSelector, strict) {
        var r = [], parts = selector.split(",");
        parts.forEach(function(p) {
          p = p.trim();
          if (this.selectorNeedsScoping(p, scopeSelector)) {
            p = strict && !p.match(polyfillHostNoCombinator) ? this.applyStrictSelectorScope(p, scopeSelector) : this.applySelectorScope(p, scopeSelector);
          }
          r.push(p);
        }, this);
        return r.join(", ");
      },
      selectorNeedsScoping: function(selector, scopeSelector) {
        if (Array.isArray(scopeSelector)) {
          return true;
        }
        var re = this.makeScopeMatcher(scopeSelector);
        return !selector.match(re);
      },
      makeScopeMatcher: function(scopeSelector) {
        scopeSelector = scopeSelector.replace(/\[/g, "\\[").replace(/\]/g, "\\]");
        return new RegExp("^(" + scopeSelector + ")" + selectorReSuffix, "m");
      },
      applySelectorScope: function(selector, selectorScope) {
        return Array.isArray(selectorScope) ? this.applySelectorScopeList(selector, selectorScope) : this.applySimpleSelectorScope(selector, selectorScope);
      },
      applySelectorScopeList: function(selector, scopeSelectorList) {
        var r = [];
        for (var i = 0, s; s = scopeSelectorList[i]; i++) {
          r.push(this.applySimpleSelectorScope(selector, s));
        }
        return r.join(", ");
      },
      applySimpleSelectorScope: function(selector, scopeSelector) {
        if (selector.match(polyfillHostRe)) {
          selector = selector.replace(polyfillHostNoCombinator, scopeSelector);
          return selector.replace(polyfillHostRe, scopeSelector + " ");
        } else {
          return scopeSelector + " " + selector;
        }
      },
      applyStrictSelectorScope: function(selector, scopeSelector) {
        scopeSelector = scopeSelector.replace(/\[is=([^\]]*)\]/g, "$1");
        var splits = [ " ", ">", "+", "~" ], scoped = selector, attrName = "[" + scopeSelector + "]";
        splits.forEach(function(sep) {
          var parts = scoped.split(sep);
          scoped = parts.map(function(p) {
            var t = p.trim().replace(polyfillHostRe, "");
            if (t && splits.indexOf(t) < 0 && t.indexOf(attrName) < 0) {
              p = t.replace(/([^:]*)(:*)(.*)/, "$1" + attrName + "$2$3");
            }
            return p;
          }).join(sep);
        });
        return scoped;
      },
      insertPolyfillHostInCssText: function(selector) {
        return selector.replace(colonHostContextRe, polyfillHostContext).replace(colonHostRe, polyfillHost);
      },
      propertiesFromRule: function(rule) {
        var cssText = rule.style.cssText;
        if (rule.style.content && !rule.style.content.match(/['"]+|attr/)) {
          cssText = cssText.replace(/content:[^;]*;/g, "content: '" + rule.style.content + "';");
        }
        var style = rule.style;
        for (var i in style) {
          if (style[i] === "initial") {
            cssText += i + ": initial; ";
          }
        }
        return cssText;
      },
      replaceTextInStyles: function(styles, action) {
        if (styles && action) {
          if (!(styles instanceof Array)) {
            styles = [ styles ];
          }
          Array.prototype.forEach.call(styles, function(s) {
            s.textContent = action.call(this, s.textContent);
          }, this);
        }
      },
      addCssToDocument: function(cssText, name) {
        if (cssText.match("@import")) {
          addOwnSheet(cssText, name);
        } else {
          addCssToDocument(cssText);
        }
      }
    };
    var selectorRe = /([^{]*)({[\s\S]*?})/gim, cssCommentRe = /\/\*[^*]*\*+([^\/*][^*]*\*+)*\//gim, cssCommentNextSelectorRe = /\/\*\s*@polyfill ([^*]*\*+([^\/*][^*]*\*+)*\/)([^{]*?){/gim, cssContentNextSelectorRe = /polyfill-next-selector[^}]*content\:[\s]*?['"](.*?)['"][;\s]*}([^{]*?){/gim, cssCommentRuleRe = /\/\*\s@polyfill-rule([^*]*\*+([^\/*][^*]*\*+)*)\//gim, cssContentRuleRe = /(polyfill-rule)[^}]*(content\:[\s]*['"](.*?)['"])[;\s]*[^}]*}/gim, cssCommentUnscopedRuleRe = /\/\*\s@polyfill-unscoped-rule([^*]*\*+([^\/*][^*]*\*+)*)\//gim, cssContentUnscopedRuleRe = /(polyfill-unscoped-rule)[^}]*(content\:[\s]*['"](.*?)['"])[;\s]*[^}]*}/gim, cssPseudoRe = /::(x-[^\s{,(]*)/gim, cssPartRe = /::part\(([^)]*)\)/gim, polyfillHost = "-shadowcsshost", polyfillHostContext = "-shadowcsscontext", parenSuffix = ")(?:\\((" + "(?:\\([^)(]*\\)|[^)(]*)+?" + ")\\))?([^,{]*)";
    var cssColonHostRe = new RegExp("(" + polyfillHost + parenSuffix, "gim"), cssColonHostContextRe = new RegExp("(" + polyfillHostContext + parenSuffix, "gim"), selectorReSuffix = "([>\\s~+[.,{:][\\s\\S]*)?$", colonHostRe = /\:host/gim, colonHostContextRe = /\:host-context/gim, polyfillHostNoCombinator = polyfillHost + "-no-combinator", polyfillHostRe = new RegExp(polyfillHost, "gim"), polyfillHostContextRe = new RegExp(polyfillHostContext, "gim"), shadowDOMSelectorsRe = [ />>>/g, /::shadow/g, /::content/g, /\/deep\//g, /\/shadow\//g, /\/shadow-deep\//g, /\^\^/g, /\^(?!=)/g ];
    function stylesToCssText(styles, preserveComments) {
      var cssText = "";
      Array.prototype.forEach.call(styles, function(s) {
        cssText += s.textContent + "\n\n";
      });
      if (!preserveComments) {
        cssText = cssText.replace(cssCommentRe, "");
      }
      return cssText;
    }
    function cssTextToStyle(cssText) {
      var style = document.createElement("style");
      style.textContent = cssText;
      return style;
    }
    function cssToRules(cssText) {
      var style = cssTextToStyle(cssText);
      document.head.appendChild(style);
      var rules = [];
      if (style.sheet) {
        try {
          rules = style.sheet.cssRules;
        } catch (e) {}
      } else {
        console.warn("sheet not found", style);
      }
      style.parentNode.removeChild(style);
      return rules;
    }
    var frame = document.createElement("iframe");
    frame.style.display = "none";
    function initFrame() {
      frame.initialized = true;
      document.body.appendChild(frame);
      var doc = frame.contentDocument;
      var base = doc.createElement("base");
      base.href = document.baseURI;
      doc.head.appendChild(base);
    }
    function inFrame(fn) {
      if (!frame.initialized) {
        initFrame();
      }
      document.body.appendChild(frame);
      fn(frame.contentDocument);
      document.body.removeChild(frame);
    }
    var isChrome = navigator.userAgent.match("Chrome");
    function withCssRules(cssText, callback) {
      if (!callback) {
        return;
      }
      var rules;
      if (cssText.match("@import") && isChrome) {
        var style = cssTextToStyle(cssText);
        inFrame(function(doc) {
          doc.head.appendChild(style.impl);
          rules = Array.prototype.slice.call(style.sheet.cssRules, 0);
          callback(rules);
        });
      } else {
        rules = cssToRules(cssText);
        callback(rules);
      }
    }
    function rulesToCss(cssRules) {
      for (var i = 0, css = []; i < cssRules.length; i++) {
        css.push(cssRules[i].cssText);
      }
      return css.join("\n\n");
    }
    function addCssToDocument(cssText) {
      if (cssText) {
        getSheet().appendChild(document.createTextNode(cssText));
      }
    }
    function addOwnSheet(cssText, name) {
      var style = cssTextToStyle(cssText);
      style.setAttribute(name, "");
      style.setAttribute(SHIMMED_ATTRIBUTE, "");
      document.head.appendChild(style);
    }
    var SHIM_ATTRIBUTE = "shim-shadowdom";
    var SHIMMED_ATTRIBUTE = "shim-shadowdom-css";
    var NO_SHIM_ATTRIBUTE = "no-shim";
    var sheet;
    function getSheet() {
      if (!sheet) {
        sheet = document.createElement("style");
        sheet.setAttribute(SHIMMED_ATTRIBUTE, "");
        sheet[SHIMMED_ATTRIBUTE] = true;
      }
      return sheet;
    }
    if (window.ShadowDOMPolyfill) {
      addCssToDocument("style { display: none !important; }\n");
      var doc = ShadowDOMPolyfill.wrap(document);
      var head = doc.querySelector("head");
      head.insertBefore(getSheet(), head.childNodes[0]);
      document.addEventListener("DOMContentLoaded", function() {
        var urlResolver = scope.urlResolver;
        if (window.HTMLImports && !HTMLImports.useNative) {
          var SHIM_SHEET_SELECTOR = "link[rel=stylesheet]" + "[" + SHIM_ATTRIBUTE + "]";
          var SHIM_STYLE_SELECTOR = "style[" + SHIM_ATTRIBUTE + "]";
          HTMLImports.importer.documentPreloadSelectors += "," + SHIM_SHEET_SELECTOR;
          HTMLImports.importer.importsPreloadSelectors += "," + SHIM_SHEET_SELECTOR;
          HTMLImports.parser.documentSelectors = [ HTMLImports.parser.documentSelectors, SHIM_SHEET_SELECTOR, SHIM_STYLE_SELECTOR ].join(",");
          var originalParseGeneric = HTMLImports.parser.parseGeneric;
          HTMLImports.parser.parseGeneric = function(elt) {
            if (elt[SHIMMED_ATTRIBUTE]) {
              return;
            }
            var style = elt.__importElement || elt;
            if (!style.hasAttribute(SHIM_ATTRIBUTE)) {
              originalParseGeneric.call(this, elt);
              return;
            }
            if (elt.__resource) {
              style = elt.ownerDocument.createElement("style");
              style.textContent = elt.__resource;
            }
            HTMLImports.path.resolveUrlsInStyle(style, elt.href);
            style.textContent = ShadowCSS.shimStyle(style);
            style.removeAttribute(SHIM_ATTRIBUTE, "");
            style.setAttribute(SHIMMED_ATTRIBUTE, "");
            style[SHIMMED_ATTRIBUTE] = true;
            if (style.parentNode !== head) {
              if (elt.parentNode === head) {
                head.replaceChild(style, elt);
              } else {
                this.addElementToDocument(style);
              }
            }
            style.__importParsed = true;
            this.markParsingComplete(elt);
            this.parseNext();
          };
          var hasResource = HTMLImports.parser.hasResource;
          HTMLImports.parser.hasResource = function(node) {
            if (node.localName === "link" && node.rel === "stylesheet" && node.hasAttribute(SHIM_ATTRIBUTE)) {
              return node.__resource;
            } else {
              return hasResource.call(this, node);
            }
          };
        }
      });
    }
    scope.ShadowCSS = ShadowCSS;
  })(window.WebComponents);
}

(function(scope) {
  if (window.ShadowDOMPolyfill) {
    window.wrap = ShadowDOMPolyfill.wrapIfNeeded;
    window.unwrap = ShadowDOMPolyfill.unwrapIfNeeded;
  } else {
    window.wrap = window.unwrap = function(n) {
      return n;
    };
  }
})(window.WebComponents);

(function(scope) {
  "use strict";
  var hasWorkingUrl = false;
  if (!scope.forceJURL) {
    try {
      var u = new URL("b", "http://a");
      u.pathname = "c%20d";
      hasWorkingUrl = u.href === "http://a/c%20d";
    } catch (e) {}
  }
  if (hasWorkingUrl) return;
  var relative = Object.create(null);
  relative["ftp"] = 21;
  relative["file"] = 0;
  relative["gopher"] = 70;
  relative["http"] = 80;
  relative["https"] = 443;
  relative["ws"] = 80;
  relative["wss"] = 443;
  var relativePathDotMapping = Object.create(null);
  relativePathDotMapping["%2e"] = ".";
  relativePathDotMapping[".%2e"] = "..";
  relativePathDotMapping["%2e."] = "..";
  relativePathDotMapping["%2e%2e"] = "..";
  function isRelativeScheme(scheme) {
    return relative[scheme] !== undefined;
  }
  function invalid() {
    clear.call(this);
    this._isInvalid = true;
  }
  function IDNAToASCII(h) {
    if ("" == h) {
      invalid.call(this);
    }
    return h.toLowerCase();
  }
  function percentEscape(c) {
    var unicode = c.charCodeAt(0);
    if (unicode > 32 && unicode < 127 && [ 34, 35, 60, 62, 63, 96 ].indexOf(unicode) == -1) {
      return c;
    }
    return encodeURIComponent(c);
  }
  function percentEscapeQuery(c) {
    var unicode = c.charCodeAt(0);
    if (unicode > 32 && unicode < 127 && [ 34, 35, 60, 62, 96 ].indexOf(unicode) == -1) {
      return c;
    }
    return encodeURIComponent(c);
  }
  var EOF = undefined, ALPHA = /[a-zA-Z]/, ALPHANUMERIC = /[a-zA-Z0-9\+\-\.]/;
  function parse(input, stateOverride, base) {
    function err(message) {
      errors.push(message);
    }
    var state = stateOverride || "scheme start", cursor = 0, buffer = "", seenAt = false, seenBracket = false, errors = [];
    loop: while ((input[cursor - 1] != EOF || cursor == 0) && !this._isInvalid) {
      var c = input[cursor];
      switch (state) {
       case "scheme start":
        if (c && ALPHA.test(c)) {
          buffer += c.toLowerCase();
          state = "scheme";
        } else if (!stateOverride) {
          buffer = "";
          state = "no scheme";
          continue;
        } else {
          err("Invalid scheme.");
          break loop;
        }
        break;

       case "scheme":
        if (c && ALPHANUMERIC.test(c)) {
          buffer += c.toLowerCase();
        } else if (":" == c) {
          this._scheme = buffer;
          buffer = "";
          if (stateOverride) {
            break loop;
          }
          if (isRelativeScheme(this._scheme)) {
            this._isRelative = true;
          }
          if ("file" == this._scheme) {
            state = "relative";
          } else if (this._isRelative && base && base._scheme == this._scheme) {
            state = "relative or authority";
          } else if (this._isRelative) {
            state = "authority first slash";
          } else {
            state = "scheme data";
          }
        } else if (!stateOverride) {
          buffer = "";
          cursor = 0;
          state = "no scheme";
          continue;
        } else if (EOF == c) {
          break loop;
        } else {
          err("Code point not allowed in scheme: " + c);
          break loop;
        }
        break;

       case "scheme data":
        if ("?" == c) {
          this._query = "?";
          state = "query";
        } else if ("#" == c) {
          this._fragment = "#";
          state = "fragment";
        } else {
          if (EOF != c && "\t" != c && "\n" != c && "\r" != c) {
            this._schemeData += percentEscape(c);
          }
        }
        break;

       case "no scheme":
        if (!base || !isRelativeScheme(base._scheme)) {
          err("Missing scheme.");
          invalid.call(this);
        } else {
          state = "relative";
          continue;
        }
        break;

       case "relative or authority":
        if ("/" == c && "/" == input[cursor + 1]) {
          state = "authority ignore slashes";
        } else {
          err("Expected /, got: " + c);
          state = "relative";
          continue;
        }
        break;

       case "relative":
        this._isRelative = true;
        if ("file" != this._scheme) this._scheme = base._scheme;
        if (EOF == c) {
          this._host = base._host;
          this._port = base._port;
          this._path = base._path.slice();
          this._query = base._query;
          this._username = base._username;
          this._password = base._password;
          break loop;
        } else if ("/" == c || "\\" == c) {
          if ("\\" == c) err("\\ is an invalid code point.");
          state = "relative slash";
        } else if ("?" == c) {
          this._host = base._host;
          this._port = base._port;
          this._path = base._path.slice();
          this._query = "?";
          this._username = base._username;
          this._password = base._password;
          state = "query";
        } else if ("#" == c) {
          this._host = base._host;
          this._port = base._port;
          this._path = base._path.slice();
          this._query = base._query;
          this._fragment = "#";
          this._username = base._username;
          this._password = base._password;
          state = "fragment";
        } else {
          var nextC = input[cursor + 1];
          var nextNextC = input[cursor + 2];
          if ("file" != this._scheme || !ALPHA.test(c) || nextC != ":" && nextC != "|" || EOF != nextNextC && "/" != nextNextC && "\\" != nextNextC && "?" != nextNextC && "#" != nextNextC) {
            this._host = base._host;
            this._port = base._port;
            this._username = base._username;
            this._password = base._password;
            this._path = base._path.slice();
            this._path.pop();
          }
          state = "relative path";
          continue;
        }
        break;

       case "relative slash":
        if ("/" == c || "\\" == c) {
          if ("\\" == c) {
            err("\\ is an invalid code point.");
          }
          if ("file" == this._scheme) {
            state = "file host";
          } else {
            state = "authority ignore slashes";
          }
        } else {
          if ("file" != this._scheme) {
            this._host = base._host;
            this._port = base._port;
            this._username = base._username;
            this._password = base._password;
          }
          state = "relative path";
          continue;
        }
        break;

       case "authority first slash":
        if ("/" == c) {
          state = "authority second slash";
        } else {
          err("Expected '/', got: " + c);
          state = "authority ignore slashes";
          continue;
        }
        break;

       case "authority second slash":
        state = "authority ignore slashes";
        if ("/" != c) {
          err("Expected '/', got: " + c);
          continue;
        }
        break;

       case "authority ignore slashes":
        if ("/" != c && "\\" != c) {
          state = "authority";
          continue;
        } else {
          err("Expected authority, got: " + c);
        }
        break;

       case "authority":
        if ("@" == c) {
          if (seenAt) {
            err("@ already seen.");
            buffer += "%40";
          }
          seenAt = true;
          for (var i = 0; i < buffer.length; i++) {
            var cp = buffer[i];
            if ("\t" == cp || "\n" == cp || "\r" == cp) {
              err("Invalid whitespace in authority.");
              continue;
            }
            if (":" == cp && null === this._password) {
              this._password = "";
              continue;
            }
            var tempC = percentEscape(cp);
            null !== this._password ? this._password += tempC : this._username += tempC;
          }
          buffer = "";
        } else if (EOF == c || "/" == c || "\\" == c || "?" == c || "#" == c) {
          cursor -= buffer.length;
          buffer = "";
          state = "host";
          continue;
        } else {
          buffer += c;
        }
        break;

       case "file host":
        if (EOF == c || "/" == c || "\\" == c || "?" == c || "#" == c) {
          if (buffer.length == 2 && ALPHA.test(buffer[0]) && (buffer[1] == ":" || buffer[1] == "|")) {
            state = "relative path";
          } else if (buffer.length == 0) {
            state = "relative path start";
          } else {
            this._host = IDNAToASCII.call(this, buffer);
            buffer = "";
            state = "relative path start";
          }
          continue;
        } else if ("\t" == c || "\n" == c || "\r" == c) {
          err("Invalid whitespace in file host.");
        } else {
          buffer += c;
        }
        break;

       case "host":
       case "hostname":
        if (":" == c && !seenBracket) {
          this._host = IDNAToASCII.call(this, buffer);
          buffer = "";
          state = "port";
          if ("hostname" == stateOverride) {
            break loop;
          }
        } else if (EOF == c || "/" == c || "\\" == c || "?" == c || "#" == c) {
          this._host = IDNAToASCII.call(this, buffer);
          buffer = "";
          state = "relative path start";
          if (stateOverride) {
            break loop;
          }
          continue;
        } else if ("\t" != c && "\n" != c && "\r" != c) {
          if ("[" == c) {
            seenBracket = true;
          } else if ("]" == c) {
            seenBracket = false;
          }
          buffer += c;
        } else {
          err("Invalid code point in host/hostname: " + c);
        }
        break;

       case "port":
        if (/[0-9]/.test(c)) {
          buffer += c;
        } else if (EOF == c || "/" == c || "\\" == c || "?" == c || "#" == c || stateOverride) {
          if ("" != buffer) {
            var temp = parseInt(buffer, 10);
            if (temp != relative[this._scheme]) {
              this._port = temp + "";
            }
            buffer = "";
          }
          if (stateOverride) {
            break loop;
          }
          state = "relative path start";
          continue;
        } else if ("\t" == c || "\n" == c || "\r" == c) {
          err("Invalid code point in port: " + c);
        } else {
          invalid.call(this);
        }
        break;

       case "relative path start":
        if ("\\" == c) err("'\\' not allowed in path.");
        state = "relative path";
        if ("/" != c && "\\" != c) {
          continue;
        }
        break;

       case "relative path":
        if (EOF == c || "/" == c || "\\" == c || !stateOverride && ("?" == c || "#" == c)) {
          if ("\\" == c) {
            err("\\ not allowed in relative path.");
          }
          var tmp;
          if (tmp = relativePathDotMapping[buffer.toLowerCase()]) {
            buffer = tmp;
          }
          if (".." == buffer) {
            this._path.pop();
            if ("/" != c && "\\" != c) {
              this._path.push("");
            }
          } else if ("." == buffer && "/" != c && "\\" != c) {
            this._path.push("");
          } else if ("." != buffer) {
            if ("file" == this._scheme && this._path.length == 0 && buffer.length == 2 && ALPHA.test(buffer[0]) && buffer[1] == "|") {
              buffer = buffer[0] + ":";
            }
            this._path.push(buffer);
          }
          buffer = "";
          if ("?" == c) {
            this._query = "?";
            state = "query";
          } else if ("#" == c) {
            this._fragment = "#";
            state = "fragment";
          }
        } else if ("\t" != c && "\n" != c && "\r" != c) {
          buffer += percentEscape(c);
        }
        break;

       case "query":
        if (!stateOverride && "#" == c) {
          this._fragment = "#";
          state = "fragment";
        } else if (EOF != c && "\t" != c && "\n" != c && "\r" != c) {
          this._query += percentEscapeQuery(c);
        }
        break;

       case "fragment":
        if (EOF != c && "\t" != c && "\n" != c && "\r" != c) {
          this._fragment += c;
        }
        break;
      }
      cursor++;
    }
  }
  function clear() {
    this._scheme = "";
    this._schemeData = "";
    this._username = "";
    this._password = null;
    this._host = "";
    this._port = "";
    this._path = [];
    this._query = "";
    this._fragment = "";
    this._isInvalid = false;
    this._isRelative = false;
  }
  function jURL(url, base) {
    if (base !== undefined && !(base instanceof jURL)) base = new jURL(String(base));
    this._url = url;
    clear.call(this);
    var input = url.replace(/^[ \t\r\n\f]+|[ \t\r\n\f]+$/g, "");
    parse.call(this, input, null, base);
  }
  jURL.prototype = {
    toString: function() {
      return this.href;
    },
    get href() {
      if (this._isInvalid) return this._url;
      var authority = "";
      if ("" != this._username || null != this._password) {
        authority = this._username + (null != this._password ? ":" + this._password : "") + "@";
      }
      return this.protocol + (this._isRelative ? "//" + authority + this.host : "") + this.pathname + this._query + this._fragment;
    },
    set href(href) {
      clear.call(this);
      parse.call(this, href);
    },
    get protocol() {
      return this._scheme + ":";
    },
    set protocol(protocol) {
      if (this._isInvalid) return;
      parse.call(this, protocol + ":", "scheme start");
    },
    get host() {
      return this._isInvalid ? "" : this._port ? this._host + ":" + this._port : this._host;
    },
    set host(host) {
      if (this._isInvalid || !this._isRelative) return;
      parse.call(this, host, "host");
    },
    get hostname() {
      return this._host;
    },
    set hostname(hostname) {
      if (this._isInvalid || !this._isRelative) return;
      parse.call(this, hostname, "hostname");
    },
    get port() {
      return this._port;
    },
    set port(port) {
      if (this._isInvalid || !this._isRelative) return;
      parse.call(this, port, "port");
    },
    get pathname() {
      return this._isInvalid ? "" : this._isRelative ? "/" + this._path.join("/") : this._schemeData;
    },
    set pathname(pathname) {
      if (this._isInvalid || !this._isRelative) return;
      this._path = [];
      parse.call(this, pathname, "relative path start");
    },
    get search() {
      return this._isInvalid || !this._query || "?" == this._query ? "" : this._query;
    },
    set search(search) {
      if (this._isInvalid || !this._isRelative) return;
      this._query = "?";
      if ("?" == search[0]) search = search.slice(1);
      parse.call(this, search, "query");
    },
    get hash() {
      return this._isInvalid || !this._fragment || "#" == this._fragment ? "" : this._fragment;
    },
    set hash(hash) {
      if (this._isInvalid) return;
      this._fragment = "#";
      if ("#" == hash[0]) hash = hash.slice(1);
      parse.call(this, hash, "fragment");
    },
    get origin() {
      var host;
      if (this._isInvalid || !this._scheme) {
        return "";
      }
      switch (this._scheme) {
       case "data":
       case "file":
       case "javascript":
       case "mailto":
        return "null";
      }
      host = this.host;
      if (!host) {
        return "";
      }
      return this._scheme + "://" + host;
    }
  };
  var OriginalURL = scope.URL;
  if (OriginalURL) {
    jURL.createObjectURL = function(blob) {
      return OriginalURL.createObjectURL.apply(OriginalURL, arguments);
    };
    jURL.revokeObjectURL = function(url) {
      OriginalURL.revokeObjectURL(url);
    };
  }
  scope.URL = jURL;
})(self);

(function(global) {
  if (global.JsMutationObserver) {
    return;
  }
  var registrationsTable = new WeakMap();
  var setImmediate;
  if (/Trident|Edge/.test(navigator.userAgent)) {
    setImmediate = setTimeout;
  } else if (window.setImmediate) {
    setImmediate = window.setImmediate;
  } else {
    var setImmediateQueue = [];
    var sentinel = String(Math.random());
    window.addEventListener("message", function(e) {
      if (e.data === sentinel) {
        var queue = setImmediateQueue;
        setImmediateQueue = [];
        queue.forEach(function(func) {
          func();
        });
      }
    });
    setImmediate = function(func) {
      setImmediateQueue.push(func);
      window.postMessage(sentinel, "*");
    };
  }
  var isScheduled = false;
  var scheduledObservers = [];
  function scheduleCallback(observer) {
    scheduledObservers.push(observer);
    if (!isScheduled) {
      isScheduled = true;
      setImmediate(dispatchCallbacks);
    }
  }
  function wrapIfNeeded(node) {
    return window.ShadowDOMPolyfill && window.ShadowDOMPolyfill.wrapIfNeeded(node) || node;
  }
  function dispatchCallbacks() {
    isScheduled = false;
    var observers = scheduledObservers;
    scheduledObservers = [];
    observers.sort(function(o1, o2) {
      return o1.uid_ - o2.uid_;
    });
    var anyNonEmpty = false;
    observers.forEach(function(observer) {
      var queue = observer.takeRecords();
      removeTransientObserversFor(observer);
      if (queue.length) {
        observer.callback_(queue, observer);
        anyNonEmpty = true;
      }
    });
    if (anyNonEmpty) dispatchCallbacks();
  }
  function removeTransientObserversFor(observer) {
    observer.nodes_.forEach(function(node) {
      var registrations = registrationsTable.get(node);
      if (!registrations) return;
      registrations.forEach(function(registration) {
        if (registration.observer === observer) registration.removeTransientObservers();
      });
    });
  }
  function forEachAncestorAndObserverEnqueueRecord(target, callback) {
    for (var node = target; node; node = node.parentNode) {
      var registrations = registrationsTable.get(node);
      if (registrations) {
        for (var j = 0; j < registrations.length; j++) {
          var registration = registrations[j];
          var options = registration.options;
          if (node !== target && !options.subtree) continue;
          var record = callback(options);
          if (record) registration.enqueue(record);
        }
      }
    }
  }
  var uidCounter = 0;
  function JsMutationObserver(callback) {
    this.callback_ = callback;
    this.nodes_ = [];
    this.records_ = [];
    this.uid_ = ++uidCounter;
  }
  JsMutationObserver.prototype = {
    observe: function(target, options) {
      target = wrapIfNeeded(target);
      if (!options.childList && !options.attributes && !options.characterData || options.attributeOldValue && !options.attributes || options.attributeFilter && options.attributeFilter.length && !options.attributes || options.characterDataOldValue && !options.characterData) {
        throw new SyntaxError();
      }
      var registrations = registrationsTable.get(target);
      if (!registrations) registrationsTable.set(target, registrations = []);
      var registration;
      for (var i = 0; i < registrations.length; i++) {
        if (registrations[i].observer === this) {
          registration = registrations[i];
          registration.removeListeners();
          registration.options = options;
          break;
        }
      }
      if (!registration) {
        registration = new Registration(this, target, options);
        registrations.push(registration);
        this.nodes_.push(target);
      }
      registration.addListeners();
    },
    disconnect: function() {
      this.nodes_.forEach(function(node) {
        var registrations = registrationsTable.get(node);
        for (var i = 0; i < registrations.length; i++) {
          var registration = registrations[i];
          if (registration.observer === this) {
            registration.removeListeners();
            registrations.splice(i, 1);
            break;
          }
        }
      }, this);
      this.records_ = [];
    },
    takeRecords: function() {
      var copyOfRecords = this.records_;
      this.records_ = [];
      return copyOfRecords;
    }
  };
  function MutationRecord(type, target) {
    this.type = type;
    this.target = target;
    this.addedNodes = [];
    this.removedNodes = [];
    this.previousSibling = null;
    this.nextSibling = null;
    this.attributeName = null;
    this.attributeNamespace = null;
    this.oldValue = null;
  }
  function copyMutationRecord(original) {
    var record = new MutationRecord(original.type, original.target);
    record.addedNodes = original.addedNodes.slice();
    record.removedNodes = original.removedNodes.slice();
    record.previousSibling = original.previousSibling;
    record.nextSibling = original.nextSibling;
    record.attributeName = original.attributeName;
    record.attributeNamespace = original.attributeNamespace;
    record.oldValue = original.oldValue;
    return record;
  }
  var currentRecord, recordWithOldValue;
  function getRecord(type, target) {
    return currentRecord = new MutationRecord(type, target);
  }
  function getRecordWithOldValue(oldValue) {
    if (recordWithOldValue) return recordWithOldValue;
    recordWithOldValue = copyMutationRecord(currentRecord);
    recordWithOldValue.oldValue = oldValue;
    return recordWithOldValue;
  }
  function clearRecords() {
    currentRecord = recordWithOldValue = undefined;
  }
  function recordRepresentsCurrentMutation(record) {
    return record === recordWithOldValue || record === currentRecord;
  }
  function selectRecord(lastRecord, newRecord) {
    if (lastRecord === newRecord) return lastRecord;
    if (recordWithOldValue && recordRepresentsCurrentMutation(lastRecord)) return recordWithOldValue;
    return null;
  }
  function Registration(observer, target, options) {
    this.observer = observer;
    this.target = target;
    this.options = options;
    this.transientObservedNodes = [];
  }
  Registration.prototype = {
    enqueue: function(record) {
      var records = this.observer.records_;
      var length = records.length;
      if (records.length > 0) {
        var lastRecord = records[length - 1];
        var recordToReplaceLast = selectRecord(lastRecord, record);
        if (recordToReplaceLast) {
          records[length - 1] = recordToReplaceLast;
          return;
        }
      } else {
        scheduleCallback(this.observer);
      }
      records[length] = record;
    },
    addListeners: function() {
      this.addListeners_(this.target);
    },
    addListeners_: function(node) {
      var options = this.options;
      if (options.attributes) node.addEventListener("DOMAttrModified", this, true);
      if (options.characterData) node.addEventListener("DOMCharacterDataModified", this, true);
      if (options.childList) node.addEventListener("DOMNodeInserted", this, true);
      if (options.childList || options.subtree) node.addEventListener("DOMNodeRemoved", this, true);
    },
    removeListeners: function() {
      this.removeListeners_(this.target);
    },
    removeListeners_: function(node) {
      var options = this.options;
      if (options.attributes) node.removeEventListener("DOMAttrModified", this, true);
      if (options.characterData) node.removeEventListener("DOMCharacterDataModified", this, true);
      if (options.childList) node.removeEventListener("DOMNodeInserted", this, true);
      if (options.childList || options.subtree) node.removeEventListener("DOMNodeRemoved", this, true);
    },
    addTransientObserver: function(node) {
      if (node === this.target) return;
      this.addListeners_(node);
      this.transientObservedNodes.push(node);
      var registrations = registrationsTable.get(node);
      if (!registrations) registrationsTable.set(node, registrations = []);
      registrations.push(this);
    },
    removeTransientObservers: function() {
      var transientObservedNodes = this.transientObservedNodes;
      this.transientObservedNodes = [];
      transientObservedNodes.forEach(function(node) {
        this.removeListeners_(node);
        var registrations = registrationsTable.get(node);
        for (var i = 0; i < registrations.length; i++) {
          if (registrations[i] === this) {
            registrations.splice(i, 1);
            break;
          }
        }
      }, this);
    },
    handleEvent: function(e) {
      e.stopImmediatePropagation();
      switch (e.type) {
       case "DOMAttrModified":
        var name = e.attrName;
        var namespace = e.relatedNode.namespaceURI;
        var target = e.target;
        var record = new getRecord("attributes", target);
        record.attributeName = name;
        record.attributeNamespace = namespace;
        var oldValue = e.attrChange === MutationEvent.ADDITION ? null : e.prevValue;
        forEachAncestorAndObserverEnqueueRecord(target, function(options) {
          if (!options.attributes) return;
          if (options.attributeFilter && options.attributeFilter.length && options.attributeFilter.indexOf(name) === -1 && options.attributeFilter.indexOf(namespace) === -1) {
            return;
          }
          if (options.attributeOldValue) return getRecordWithOldValue(oldValue);
          return record;
        });
        break;

       case "DOMCharacterDataModified":
        var target = e.target;
        var record = getRecord("characterData", target);
        var oldValue = e.prevValue;
        forEachAncestorAndObserverEnqueueRecord(target, function(options) {
          if (!options.characterData) return;
          if (options.characterDataOldValue) return getRecordWithOldValue(oldValue);
          return record;
        });
        break;

       case "DOMNodeRemoved":
        this.addTransientObserver(e.target);

       case "DOMNodeInserted":
        var changedNode = e.target;
        var addedNodes, removedNodes;
        if (e.type === "DOMNodeInserted") {
          addedNodes = [ changedNode ];
          removedNodes = [];
        } else {
          addedNodes = [];
          removedNodes = [ changedNode ];
        }
        var previousSibling = changedNode.previousSibling;
        var nextSibling = changedNode.nextSibling;
        var record = getRecord("childList", e.target.parentNode);
        record.addedNodes = addedNodes;
        record.removedNodes = removedNodes;
        record.previousSibling = previousSibling;
        record.nextSibling = nextSibling;
        forEachAncestorAndObserverEnqueueRecord(e.relatedNode, function(options) {
          if (!options.childList) return;
          return record;
        });
      }
      clearRecords();
    }
  };
  global.JsMutationObserver = JsMutationObserver;
  if (!global.MutationObserver) {
    global.MutationObserver = JsMutationObserver;
    JsMutationObserver._isPolyfilled = true;
  }
})(self);

(function(scope) {
  "use strict";
  if (!(window.performance && window.performance.now)) {
    var start = Date.now();
    window.performance = {
      now: function() {
        return Date.now() - start;
      }
    };
  }
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function() {
      var nativeRaf = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
      return nativeRaf ? function(callback) {
        return nativeRaf(function() {
          callback(performance.now());
        });
      } : function(callback) {
        return window.setTimeout(callback, 1e3 / 60);
      };
    }();
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function() {
      return window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || function(id) {
        clearTimeout(id);
      };
    }();
  }
  var workingDefaultPrevented = function() {
    var e = document.createEvent("Event");
    e.initEvent("foo", true, true);
    e.preventDefault();
    return e.defaultPrevented;
  }();
  if (!workingDefaultPrevented) {
    var origPreventDefault = Event.prototype.preventDefault;
    Event.prototype.preventDefault = function() {
      if (!this.cancelable) {
        return;
      }
      origPreventDefault.call(this);
      Object.defineProperty(this, "defaultPrevented", {
        get: function() {
          return true;
        },
        configurable: true
      });
    };
  }
  var isIE = /Trident/.test(navigator.userAgent);
  if (!window.CustomEvent || isIE && typeof window.CustomEvent !== "function") {
    window.CustomEvent = function(inType, params) {
      params = params || {};
      var e = document.createEvent("CustomEvent");
      e.initCustomEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable), params.detail);
      return e;
    };
    window.CustomEvent.prototype = window.Event.prototype;
  }
  if (!window.Event || isIE && typeof window.Event !== "function") {
    var origEvent = window.Event;
    window.Event = function(inType, params) {
      params = params || {};
      var e = document.createEvent("Event");
      e.initEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable));
      return e;
    };
    window.Event.prototype = origEvent.prototype;
  }
})(window.WebComponents);

window.HTMLImports = window.HTMLImports || {
  flags: {}
};

(function(scope) {
  var IMPORT_LINK_TYPE = "import";
  var useNative = Boolean(IMPORT_LINK_TYPE in document.createElement("link"));
  var hasShadowDOMPolyfill = Boolean(window.ShadowDOMPolyfill);
  var wrap = function(node) {
    return hasShadowDOMPolyfill ? window.ShadowDOMPolyfill.wrapIfNeeded(node) : node;
  };
  var rootDocument = wrap(document);
  var currentScriptDescriptor = {
    get: function() {
      var script = window.HTMLImports.currentScript || document.currentScript || (document.readyState !== "complete" ? document.scripts[document.scripts.length - 1] : null);
      return wrap(script);
    },
    configurable: true
  };
  Object.defineProperty(document, "_currentScript", currentScriptDescriptor);
  Object.defineProperty(rootDocument, "_currentScript", currentScriptDescriptor);
  var isIE = /Trident/.test(navigator.userAgent);
  function whenReady(callback, doc) {
    doc = doc || rootDocument;
    whenDocumentReady(function() {
      watchImportsLoad(callback, doc);
    }, doc);
  }
  var requiredReadyState = isIE ? "complete" : "interactive";
  var READY_EVENT = "readystatechange";
  function isDocumentReady(doc) {
    return doc.readyState === "complete" || doc.readyState === requiredReadyState;
  }
  function whenDocumentReady(callback, doc) {
    if (!isDocumentReady(doc)) {
      var checkReady = function() {
        if (doc.readyState === "complete" || doc.readyState === requiredReadyState) {
          doc.removeEventListener(READY_EVENT, checkReady);
          whenDocumentReady(callback, doc);
        }
      };
      doc.addEventListener(READY_EVENT, checkReady);
    } else if (callback) {
      callback();
    }
  }
  function markTargetLoaded(event) {
    event.target.__loaded = true;
  }
  function watchImportsLoad(callback, doc) {
    var imports = doc.querySelectorAll("link[rel=import]");
    var parsedCount = 0, importCount = imports.length, newImports = [], errorImports = [];
    function checkDone() {
      if (parsedCount == importCount && callback) {
        callback({
          allImports: imports,
          loadedImports: newImports,
          errorImports: errorImports
        });
      }
    }
    function loadedImport(e) {
      markTargetLoaded(e);
      newImports.push(this);
      parsedCount++;
      checkDone();
    }
    function errorLoadingImport(e) {
      errorImports.push(this);
      parsedCount++;
      checkDone();
    }
    if (importCount) {
      for (var i = 0, imp; i < importCount && (imp = imports[i]); i++) {
        if (isImportLoaded(imp)) {
          newImports.push(this);
          parsedCount++;
          checkDone();
        } else {
          imp.addEventListener("load", loadedImport);
          imp.addEventListener("error", errorLoadingImport);
        }
      }
    } else {
      checkDone();
    }
  }
  function isImportLoaded(link) {
    return useNative ? link.__loaded || link.import && link.import.readyState !== "loading" : link.__importParsed;
  }
  if (useNative) {
    new MutationObserver(function(mxns) {
      for (var i = 0, l = mxns.length, m; i < l && (m = mxns[i]); i++) {
        if (m.addedNodes) {
          handleImports(m.addedNodes);
        }
      }
    }).observe(document.head, {
      childList: true
    });
    function handleImports(nodes) {
      for (var i = 0, l = nodes.length, n; i < l && (n = nodes[i]); i++) {
        if (isImport(n)) {
          handleImport(n);
        }
      }
    }
    function isImport(element) {
      return element.localName === "link" && element.rel === "import";
    }
    function handleImport(element) {
      var loaded = element.import;
      if (loaded) {
        markTargetLoaded({
          target: element
        });
      } else {
        element.addEventListener("load", markTargetLoaded);
        element.addEventListener("error", markTargetLoaded);
      }
    }
    (function() {
      if (document.readyState === "loading") {
        var imports = document.querySelectorAll("link[rel=import]");
        for (var i = 0, l = imports.length, imp; i < l && (imp = imports[i]); i++) {
          handleImport(imp);
        }
      }
    })();
  }
  whenReady(function(detail) {
    window.HTMLImports.ready = true;
    window.HTMLImports.readyTime = new Date().getTime();
    var evt = rootDocument.createEvent("CustomEvent");
    evt.initCustomEvent("HTMLImportsLoaded", true, true, detail);
    rootDocument.dispatchEvent(evt);
  });
  scope.IMPORT_LINK_TYPE = IMPORT_LINK_TYPE;
  scope.useNative = useNative;
  scope.rootDocument = rootDocument;
  scope.whenReady = whenReady;
  scope.isIE = isIE;
})(window.HTMLImports);

(function(scope) {
  var modules = [];
  var addModule = function(module) {
    modules.push(module);
  };
  var initializeModules = function() {
    modules.forEach(function(module) {
      module(scope);
    });
  };
  scope.addModule = addModule;
  scope.initializeModules = initializeModules;
})(window.HTMLImports);

window.HTMLImports.addModule(function(scope) {
  var CSS_URL_REGEXP = /(url\()([^)]*)(\))/g;
  var CSS_IMPORT_REGEXP = /(@import[\s]+(?!url\())([^;]*)(;)/g;
  var path = {
    resolveUrlsInStyle: function(style, linkUrl) {
      var doc = style.ownerDocument;
      var resolver = doc.createElement("a");
      style.textContent = this.resolveUrlsInCssText(style.textContent, linkUrl, resolver);
      return style;
    },
    resolveUrlsInCssText: function(cssText, linkUrl, urlObj) {
      var r = this.replaceUrls(cssText, urlObj, linkUrl, CSS_URL_REGEXP);
      r = this.replaceUrls(r, urlObj, linkUrl, CSS_IMPORT_REGEXP);
      return r;
    },
    replaceUrls: function(text, urlObj, linkUrl, regexp) {
      return text.replace(regexp, function(m, pre, url, post) {
        var urlPath = url.replace(/["']/g, "");
        if (linkUrl) {
          urlPath = new URL(urlPath, linkUrl).href;
        }
        urlObj.href = urlPath;
        urlPath = urlObj.href;
        return pre + "'" + urlPath + "'" + post;
      });
    }
  };
  scope.path = path;
});

window.HTMLImports.addModule(function(scope) {
  var xhr = {
    async: true,
    ok: function(request) {
      return request.status >= 200 && request.status < 300 || request.status === 304 || request.status === 0;
    },
    load: function(url, next, nextContext) {
      var request = new XMLHttpRequest();
      if (scope.flags.debug || scope.flags.bust) {
        url += "?" + Math.random();
      }
      request.open("GET", url, xhr.async);
      request.addEventListener("readystatechange", function(e) {
        if (request.readyState === 4) {
          var redirectedUrl = null;
          try {
            var locationHeader = request.getResponseHeader("Location");
            if (locationHeader) {
              redirectedUrl = locationHeader.substr(0, 1) === "/" ? location.origin + locationHeader : locationHeader;
            }
          } catch (e) {
            console.error(e.message);
          }
          next.call(nextContext, !xhr.ok(request) && request, request.response || request.responseText, redirectedUrl);
        }
      });
      request.send();
      return request;
    },
    loadDocument: function(url, next, nextContext) {
      this.load(url, next, nextContext).responseType = "document";
    }
  };
  scope.xhr = xhr;
});

window.HTMLImports.addModule(function(scope) {
  var xhr = scope.xhr;
  var flags = scope.flags;
  var Loader = function(onLoad, onComplete) {
    this.cache = {};
    this.onload = onLoad;
    this.oncomplete = onComplete;
    this.inflight = 0;
    this.pending = {};
  };
  Loader.prototype = {
    addNodes: function(nodes) {
      this.inflight += nodes.length;
      for (var i = 0, l = nodes.length, n; i < l && (n = nodes[i]); i++) {
        this.require(n);
      }
      this.checkDone();
    },
    addNode: function(node) {
      this.inflight++;
      this.require(node);
      this.checkDone();
    },
    require: function(elt) {
      var url = elt.src || elt.href;
      elt.__nodeUrl = url;
      if (!this.dedupe(url, elt)) {
        this.fetch(url, elt);
      }
    },
    dedupe: function(url, elt) {
      if (this.pending[url]) {
        this.pending[url].push(elt);
        return true;
      }
      var resource;
      if (this.cache[url]) {
        this.onload(url, elt, this.cache[url]);
        this.tail();
        return true;
      }
      this.pending[url] = [ elt ];
      return false;
    },
    fetch: function(url, elt) {
      flags.load && console.log("fetch", url, elt);
      if (!url) {
        setTimeout(function() {
          this.receive(url, elt, {
            error: "href must be specified"
          }, null);
        }.bind(this), 0);
      } else if (url.match(/^data:/)) {
        var pieces = url.split(",");
        var header = pieces[0];
        var body = pieces[1];
        if (header.indexOf(";base64") > -1) {
          body = atob(body);
        } else {
          body = decodeURIComponent(body);
        }
        setTimeout(function() {
          this.receive(url, elt, null, body);
        }.bind(this), 0);
      } else {
        var receiveXhr = function(err, resource, redirectedUrl) {
          this.receive(url, elt, err, resource, redirectedUrl);
        }.bind(this);
        xhr.load(url, receiveXhr);
      }
    },
    receive: function(url, elt, err, resource, redirectedUrl) {
      this.cache[url] = resource;
      var $p = this.pending[url];
      for (var i = 0, l = $p.length, p; i < l && (p = $p[i]); i++) {
        this.onload(url, p, resource, err, redirectedUrl);
        this.tail();
      }
      this.pending[url] = null;
    },
    tail: function() {
      --this.inflight;
      this.checkDone();
    },
    checkDone: function() {
      if (!this.inflight) {
        this.oncomplete();
      }
    }
  };
  scope.Loader = Loader;
});

window.HTMLImports.addModule(function(scope) {
  var Observer = function(addCallback) {
    this.addCallback = addCallback;
    this.mo = new MutationObserver(this.handler.bind(this));
  };
  Observer.prototype = {
    handler: function(mutations) {
      for (var i = 0, l = mutations.length, m; i < l && (m = mutations[i]); i++) {
        if (m.type === "childList" && m.addedNodes.length) {
          this.addedNodes(m.addedNodes);
        }
      }
    },
    addedNodes: function(nodes) {
      if (this.addCallback) {
        this.addCallback(nodes);
      }
      for (var i = 0, l = nodes.length, n, loading; i < l && (n = nodes[i]); i++) {
        if (n.children && n.children.length) {
          this.addedNodes(n.children);
        }
      }
    },
    observe: function(root) {
      this.mo.observe(root, {
        childList: true,
        subtree: true
      });
    }
  };
  scope.Observer = Observer;
});

window.HTMLImports.addModule(function(scope) {
  var path = scope.path;
  var rootDocument = scope.rootDocument;
  var flags = scope.flags;
  var isIE = scope.isIE;
  var IMPORT_LINK_TYPE = scope.IMPORT_LINK_TYPE;
  var IMPORT_SELECTOR = "link[rel=" + IMPORT_LINK_TYPE + "]";
  var importParser = {
    documentSelectors: IMPORT_SELECTOR,
    importsSelectors: [ IMPORT_SELECTOR, "link[rel=stylesheet]:not([type])", "style:not([type])", "script:not([type])", 'script[type="application/javascript"]', 'script[type="text/javascript"]' ].join(","),
    map: {
      link: "parseLink",
      script: "parseScript",
      style: "parseStyle"
    },
    dynamicElements: [],
    parseNext: function() {
      var next = this.nextToParse();
      if (next) {
        this.parse(next);
      }
    },
    parse: function(elt) {
      if (this.isParsed(elt)) {
        flags.parse && console.log("[%s] is already parsed", elt.localName);
        return;
      }
      var fn = this[this.map[elt.localName]];
      if (fn) {
        this.markParsing(elt);
        fn.call(this, elt);
      }
    },
    parseDynamic: function(elt, quiet) {
      this.dynamicElements.push(elt);
      if (!quiet) {
        this.parseNext();
      }
    },
    markParsing: function(elt) {
      flags.parse && console.log("parsing", elt);
      this.parsingElement = elt;
    },
    markParsingComplete: function(elt) {
      elt.__importParsed = true;
      this.markDynamicParsingComplete(elt);
      if (elt.__importElement) {
        elt.__importElement.__importParsed = true;
        this.markDynamicParsingComplete(elt.__importElement);
      }
      this.parsingElement = null;
      flags.parse && console.log("completed", elt);
    },
    markDynamicParsingComplete: function(elt) {
      var i = this.dynamicElements.indexOf(elt);
      if (i >= 0) {
        this.dynamicElements.splice(i, 1);
      }
    },
    parseImport: function(elt) {
      elt.import = elt.__doc;
      if (window.HTMLImports.__importsParsingHook) {
        window.HTMLImports.__importsParsingHook(elt);
      }
      if (elt.import) {
        elt.import.__importParsed = true;
      }
      this.markParsingComplete(elt);
      if (elt.__resource && !elt.__error) {
        elt.dispatchEvent(new CustomEvent("load", {
          bubbles: false
        }));
      } else {
        elt.dispatchEvent(new CustomEvent("error", {
          bubbles: false
        }));
      }
      if (elt.__pending) {
        var fn;
        while (elt.__pending.length) {
          fn = elt.__pending.shift();
          if (fn) {
            fn({
              target: elt
            });
          }
        }
      }
      this.parseNext();
    },
    parseLink: function(linkElt) {
      if (nodeIsImport(linkElt)) {
        this.parseImport(linkElt);
      } else {
        linkElt.href = linkElt.href;
        this.parseGeneric(linkElt);
      }
    },
    parseStyle: function(elt) {
      var src = elt;
      elt = cloneStyle(elt);
      src.__appliedElement = elt;
      elt.__importElement = src;
      this.parseGeneric(elt);
    },
    parseGeneric: function(elt) {
      this.trackElement(elt);
      this.addElementToDocument(elt);
    },
    rootImportForElement: function(elt) {
      var n = elt;
      while (n.ownerDocument.__importLink) {
        n = n.ownerDocument.__importLink;
      }
      return n;
    },
    addElementToDocument: function(elt) {
      var port = this.rootImportForElement(elt.__importElement || elt);
      port.parentNode.insertBefore(elt, port);
    },
    trackElement: function(elt, callback) {
      var self = this;
      var done = function(e) {
        elt.removeEventListener("load", done);
        elt.removeEventListener("error", done);
        if (callback) {
          callback(e);
        }
        self.markParsingComplete(elt);
        self.parseNext();
      };
      elt.addEventListener("load", done);
      elt.addEventListener("error", done);
      if (isIE && elt.localName === "style") {
        var fakeLoad = false;
        if (elt.textContent.indexOf("@import") == -1) {
          fakeLoad = true;
        } else if (elt.sheet) {
          fakeLoad = true;
          var csr = elt.sheet.cssRules;
          var len = csr ? csr.length : 0;
          for (var i = 0, r; i < len && (r = csr[i]); i++) {
            if (r.type === CSSRule.IMPORT_RULE) {
              fakeLoad = fakeLoad && Boolean(r.styleSheet);
            }
          }
        }
        if (fakeLoad) {
          setTimeout(function() {
            elt.dispatchEvent(new CustomEvent("load", {
              bubbles: false
            }));
          });
        }
      }
    },
    parseScript: function(scriptElt) {
      var script = document.createElement("script");
      script.__importElement = scriptElt;
      script.src = scriptElt.src ? scriptElt.src : generateScriptDataUrl(scriptElt);
      scope.currentScript = scriptElt;
      this.trackElement(script, function(e) {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
        scope.currentScript = null;
      });
      this.addElementToDocument(script);
    },
    nextToParse: function() {
      this._mayParse = [];
      return !this.parsingElement && (this.nextToParseInDoc(rootDocument) || this.nextToParseDynamic());
    },
    nextToParseInDoc: function(doc, link) {
      if (doc && this._mayParse.indexOf(doc) < 0) {
        this._mayParse.push(doc);
        var nodes = doc.querySelectorAll(this.parseSelectorsForNode(doc));
        for (var i = 0, l = nodes.length, n; i < l && (n = nodes[i]); i++) {
          if (!this.isParsed(n)) {
            if (this.hasResource(n)) {
              return nodeIsImport(n) ? this.nextToParseInDoc(n.__doc, n) : n;
            } else {
              return;
            }
          }
        }
      }
      return link;
    },
    nextToParseDynamic: function() {
      return this.dynamicElements[0];
    },
    parseSelectorsForNode: function(node) {
      var doc = node.ownerDocument || node;
      return doc === rootDocument ? this.documentSelectors : this.importsSelectors;
    },
    isParsed: function(node) {
      return node.__importParsed;
    },
    needsDynamicParsing: function(elt) {
      return this.dynamicElements.indexOf(elt) >= 0;
    },
    hasResource: function(node) {
      if (nodeIsImport(node) && node.__doc === undefined) {
        return false;
      }
      return true;
    }
  };
  function nodeIsImport(elt) {
    return elt.localName === "link" && elt.rel === IMPORT_LINK_TYPE;
  }
  function generateScriptDataUrl(script) {
    var scriptContent = generateScriptContent(script);
    return "data:text/javascript;charset=utf-8," + encodeURIComponent(scriptContent);
  }
  function generateScriptContent(script) {
    return script.textContent + generateSourceMapHint(script);
  }
  function generateSourceMapHint(script) {
    var owner = script.ownerDocument;
    owner.__importedScripts = owner.__importedScripts || 0;
    var moniker = script.ownerDocument.baseURI;
    var num = owner.__importedScripts ? "-" + owner.__importedScripts : "";
    owner.__importedScripts++;
    return "\n//# sourceURL=" + moniker + num + ".js\n";
  }
  function cloneStyle(style) {
    var clone = style.ownerDocument.createElement("style");
    clone.textContent = style.textContent;
    path.resolveUrlsInStyle(clone);
    return clone;
  }
  scope.parser = importParser;
  scope.IMPORT_SELECTOR = IMPORT_SELECTOR;
});

window.HTMLImports.addModule(function(scope) {
  var flags = scope.flags;
  var IMPORT_LINK_TYPE = scope.IMPORT_LINK_TYPE;
  var IMPORT_SELECTOR = scope.IMPORT_SELECTOR;
  var rootDocument = scope.rootDocument;
  var Loader = scope.Loader;
  var Observer = scope.Observer;
  var parser = scope.parser;
  var importer = {
    documents: {},
    documentPreloadSelectors: IMPORT_SELECTOR,
    importsPreloadSelectors: [ IMPORT_SELECTOR ].join(","),
    loadNode: function(node) {
      importLoader.addNode(node);
    },
    loadSubtree: function(parent) {
      var nodes = this.marshalNodes(parent);
      importLoader.addNodes(nodes);
    },
    marshalNodes: function(parent) {
      return parent.querySelectorAll(this.loadSelectorsForNode(parent));
    },
    loadSelectorsForNode: function(node) {
      var doc = node.ownerDocument || node;
      return doc === rootDocument ? this.documentPreloadSelectors : this.importsPreloadSelectors;
    },
    loaded: function(url, elt, resource, err, redirectedUrl) {
      flags.load && console.log("loaded", url, elt);
      elt.__resource = resource;
      elt.__error = err;
      if (isImportLink(elt)) {
        var doc = this.documents[url];
        if (doc === undefined) {
          doc = err ? null : makeDocument(resource, redirectedUrl || url);
          if (doc) {
            doc.__importLink = elt;
            this.bootDocument(doc);
          }
          this.documents[url] = doc;
        }
        elt.__doc = doc;
      }
      parser.parseNext();
    },
    bootDocument: function(doc) {
      this.loadSubtree(doc);
      this.observer.observe(doc);
      parser.parseNext();
    },
    loadedAll: function() {
      parser.parseNext();
    }
  };
  var importLoader = new Loader(importer.loaded.bind(importer), importer.loadedAll.bind(importer));
  importer.observer = new Observer();
  function isImportLink(elt) {
    return isLinkRel(elt, IMPORT_LINK_TYPE);
  }
  function isLinkRel(elt, rel) {
    return elt.localName === "link" && elt.getAttribute("rel") === rel;
  }
  function hasBaseURIAccessor(doc) {
    return !!Object.getOwnPropertyDescriptor(doc, "baseURI");
  }
  function makeDocument(resource, url) {
    var doc = document.implementation.createHTMLDocument(IMPORT_LINK_TYPE);
    doc._URL = url;
    var base = doc.createElement("base");
    base.setAttribute("href", url);
    if (!doc.baseURI && !hasBaseURIAccessor(doc)) {
      Object.defineProperty(doc, "baseURI", {
        value: url
      });
    }
    var meta = doc.createElement("meta");
    meta.setAttribute("charset", "utf-8");
    doc.head.appendChild(meta);
    doc.head.appendChild(base);
    doc.body.innerHTML = resource;
    if (window.HTMLTemplateElement && HTMLTemplateElement.bootstrap) {
      HTMLTemplateElement.bootstrap(doc);
    }
    return doc;
  }
  if (!document.baseURI) {
    var baseURIDescriptor = {
      get: function() {
        var base = document.querySelector("base");
        return base ? base.href : window.location.href;
      },
      configurable: true
    };
    Object.defineProperty(document, "baseURI", baseURIDescriptor);
    Object.defineProperty(rootDocument, "baseURI", baseURIDescriptor);
  }
  scope.importer = importer;
  scope.importLoader = importLoader;
});

window.HTMLImports.addModule(function(scope) {
  var parser = scope.parser;
  var importer = scope.importer;
  var dynamic = {
    added: function(nodes) {
      var owner, parsed, loading;
      for (var i = 0, l = nodes.length, n; i < l && (n = nodes[i]); i++) {
        if (!owner) {
          owner = n.ownerDocument;
          parsed = parser.isParsed(owner);
        }
        loading = this.shouldLoadNode(n);
        if (loading) {
          importer.loadNode(n);
        }
        if (this.shouldParseNode(n) && parsed) {
          parser.parseDynamic(n, loading);
        }
      }
    },
    shouldLoadNode: function(node) {
      return node.nodeType === 1 && matches.call(node, importer.loadSelectorsForNode(node));
    },
    shouldParseNode: function(node) {
      return node.nodeType === 1 && matches.call(node, parser.parseSelectorsForNode(node));
    }
  };
  importer.observer.addCallback = dynamic.added.bind(dynamic);
  var matches = HTMLElement.prototype.matches || HTMLElement.prototype.matchesSelector || HTMLElement.prototype.webkitMatchesSelector || HTMLElement.prototype.mozMatchesSelector || HTMLElement.prototype.msMatchesSelector;
});

(function(scope) {
  var initializeModules = scope.initializeModules;
  var isIE = scope.isIE;
  if (scope.useNative) {
    return;
  }
  initializeModules();
  var rootDocument = scope.rootDocument;
  function bootstrap() {
    window.HTMLImports.importer.bootDocument(rootDocument);
  }
  if (document.readyState === "complete" || document.readyState === "interactive" && !window.attachEvent) {
    bootstrap();
  } else {
    document.addEventListener("DOMContentLoaded", bootstrap);
  }
})(window.HTMLImports);

window.CustomElements = window.CustomElements || {
  flags: {}
};

(function(scope) {
  var flags = scope.flags;
  var modules = [];
  var addModule = function(module) {
    modules.push(module);
  };
  var initializeModules = function() {
    modules.forEach(function(module) {
      module(scope);
    });
  };
  scope.addModule = addModule;
  scope.initializeModules = initializeModules;
  scope.hasNative = Boolean(document.registerElement);
  scope.isIE = /Trident/.test(navigator.userAgent);
  scope.useNative = !flags.register && scope.hasNative && !window.ShadowDOMPolyfill && (!window.HTMLImports || window.HTMLImports.useNative);
})(window.CustomElements);

window.CustomElements.addModule(function(scope) {
  var IMPORT_LINK_TYPE = window.HTMLImports ? window.HTMLImports.IMPORT_LINK_TYPE : "none";
  function forSubtree(node, cb) {
    findAllElements(node, function(e) {
      if (cb(e)) {
        return true;
      }
      forRoots(e, cb);
    });
    forRoots(node, cb);
  }
  function findAllElements(node, find, data) {
    var e = node.firstElementChild;
    if (!e) {
      e = node.firstChild;
      while (e && e.nodeType !== Node.ELEMENT_NODE) {
        e = e.nextSibling;
      }
    }
    while (e) {
      if (find(e, data) !== true) {
        findAllElements(e, find, data);
      }
      e = e.nextElementSibling;
    }
    return null;
  }
  function forRoots(node, cb) {
    var root = node.shadowRoot;
    while (root) {
      forSubtree(root, cb);
      root = root.olderShadowRoot;
    }
  }
  function forDocumentTree(doc, cb) {
    _forDocumentTree(doc, cb, []);
  }
  function _forDocumentTree(doc, cb, processingDocuments) {
    doc = window.wrap(doc);
    if (processingDocuments.indexOf(doc) >= 0) {
      return;
    }
    processingDocuments.push(doc);
    var imports = doc.querySelectorAll("link[rel=" + IMPORT_LINK_TYPE + "]");
    for (var i = 0, l = imports.length, n; i < l && (n = imports[i]); i++) {
      if (n.import) {
        _forDocumentTree(n.import, cb, processingDocuments);
      }
    }
    cb(doc);
  }
  scope.forDocumentTree = forDocumentTree;
  scope.forSubtree = forSubtree;
});

window.CustomElements.addModule(function(scope) {
  var flags = scope.flags;
  var forSubtree = scope.forSubtree;
  var forDocumentTree = scope.forDocumentTree;
  function addedNode(node, isAttached) {
    return added(node, isAttached) || addedSubtree(node, isAttached);
  }
  function added(node, isAttached) {
    if (scope.upgrade(node, isAttached)) {
      return true;
    }
    if (isAttached) {
      attached(node);
    }
  }
  function addedSubtree(node, isAttached) {
    forSubtree(node, function(e) {
      if (added(e, isAttached)) {
        return true;
      }
    });
  }
  var hasThrottledAttached = window.MutationObserver._isPolyfilled && flags["throttle-attached"];
  scope.hasPolyfillMutations = hasThrottledAttached;
  scope.hasThrottledAttached = hasThrottledAttached;
  var isPendingMutations = false;
  var pendingMutations = [];
  function deferMutation(fn) {
    pendingMutations.push(fn);
    if (!isPendingMutations) {
      isPendingMutations = true;
      setTimeout(takeMutations);
    }
  }
  function takeMutations() {
    isPendingMutations = false;
    var $p = pendingMutations;
    for (var i = 0, l = $p.length, p; i < l && (p = $p[i]); i++) {
      p();
    }
    pendingMutations = [];
  }
  function attached(element) {
    if (hasThrottledAttached) {
      deferMutation(function() {
        _attached(element);
      });
    } else {
      _attached(element);
    }
  }
  function _attached(element) {
    if (element.__upgraded__ && !element.__attached) {
      element.__attached = true;
      if (element.attachedCallback) {
        element.attachedCallback();
      }
    }
  }
  function detachedNode(node) {
    detached(node);
    forSubtree(node, function(e) {
      detached(e);
    });
  }
  function detached(element) {
    if (hasThrottledAttached) {
      deferMutation(function() {
        _detached(element);
      });
    } else {
      _detached(element);
    }
  }
  function _detached(element) {
    if (element.__upgraded__ && element.__attached) {
      element.__attached = false;
      if (element.detachedCallback) {
        element.detachedCallback();
      }
    }
  }
  function inDocument(element) {
    var p = element;
    var doc = window.wrap(document);
    while (p) {
      if (p == doc) {
        return true;
      }
      p = p.parentNode || p.nodeType === Node.DOCUMENT_FRAGMENT_NODE && p.host;
    }
  }
  function watchShadow(node) {
    if (node.shadowRoot && !node.shadowRoot.__watched) {
      flags.dom && console.log("watching shadow-root for: ", node.localName);
      var root = node.shadowRoot;
      while (root) {
        observe(root);
        root = root.olderShadowRoot;
      }
    }
  }
  function handler(root, mutations) {
    if (flags.dom) {
      var mx = mutations[0];
      if (mx && mx.type === "childList" && mx.addedNodes) {
        if (mx.addedNodes) {
          var d = mx.addedNodes[0];
          while (d && d !== document && !d.host) {
            d = d.parentNode;
          }
          var u = d && (d.URL || d._URL || d.host && d.host.localName) || "";
          u = u.split("/?").shift().split("/").pop();
        }
      }
      console.group("mutations (%d) [%s]", mutations.length, u || "");
    }
    var isAttached = inDocument(root);
    mutations.forEach(function(mx) {
      if (mx.type === "childList") {
        forEach(mx.addedNodes, function(n) {
          if (!n.localName) {
            return;
          }
          addedNode(n, isAttached);
        });
        forEach(mx.removedNodes, function(n) {
          if (!n.localName) {
            return;
          }
          detachedNode(n);
        });
      }
    });
    flags.dom && console.groupEnd();
  }
  function takeRecords(node) {
    node = window.wrap(node);
    if (!node) {
      node = window.wrap(document);
    }
    while (node.parentNode) {
      node = node.parentNode;
    }
    var observer = node.__observer;
    if (observer) {
      handler(node, observer.takeRecords());
      takeMutations();
    }
  }
  var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);
  function observe(inRoot) {
    if (inRoot.__observer) {
      return;
    }
    var observer = new MutationObserver(handler.bind(this, inRoot));
    observer.observe(inRoot, {
      childList: true,
      subtree: true
    });
    inRoot.__observer = observer;
  }
  function upgradeDocument(doc) {
    doc = window.wrap(doc);
    flags.dom && console.group("upgradeDocument: ", doc.baseURI.split("/").pop());
    var isMainDocument = doc === window.wrap(document);
    addedNode(doc, isMainDocument);
    observe(doc);
    flags.dom && console.groupEnd();
  }
  function upgradeDocumentTree(doc) {
    forDocumentTree(doc, upgradeDocument);
  }
  var originalCreateShadowRoot = Element.prototype.createShadowRoot;
  if (originalCreateShadowRoot) {
    Element.prototype.createShadowRoot = function() {
      var root = originalCreateShadowRoot.call(this);
      window.CustomElements.watchShadow(this);
      return root;
    };
  }
  scope.watchShadow = watchShadow;
  scope.upgradeDocumentTree = upgradeDocumentTree;
  scope.upgradeDocument = upgradeDocument;
  scope.upgradeSubtree = addedSubtree;
  scope.upgradeAll = addedNode;
  scope.attached = attached;
  scope.takeRecords = takeRecords;
});

window.CustomElements.addModule(function(scope) {
  var flags = scope.flags;
  function upgrade(node, isAttached) {
    if (node.localName === "template") {
      if (window.HTMLTemplateElement && HTMLTemplateElement.decorate) {
        HTMLTemplateElement.decorate(node);
      }
    }
    if (!node.__upgraded__ && node.nodeType === Node.ELEMENT_NODE) {
      var is = node.getAttribute("is");
      var definition = scope.getRegisteredDefinition(node.localName) || scope.getRegisteredDefinition(is);
      if (definition) {
        if (is && definition.tag == node.localName || !is && !definition.extends) {
          return upgradeWithDefinition(node, definition, isAttached);
        }
      }
    }
  }
  function upgradeWithDefinition(element, definition, isAttached) {
    flags.upgrade && console.group("upgrade:", element.localName);
    if (definition.is) {
      element.setAttribute("is", definition.is);
    }
    implementPrototype(element, definition);
    element.__upgraded__ = true;
    created(element);
    if (isAttached) {
      scope.attached(element);
    }
    scope.upgradeSubtree(element, isAttached);
    flags.upgrade && console.groupEnd();
    return element;
  }
  function implementPrototype(element, definition) {
    if (Object.__proto__) {
      element.__proto__ = definition.prototype;
    } else {
      customMixin(element, definition.prototype, definition.native);
      element.__proto__ = definition.prototype;
    }
  }
  function customMixin(inTarget, inSrc, inNative) {
    var used = {};
    var p = inSrc;
    while (p !== inNative && p !== HTMLElement.prototype) {
      var keys = Object.getOwnPropertyNames(p);
      for (var i = 0, k; k = keys[i]; i++) {
        if (!used[k]) {
          Object.defineProperty(inTarget, k, Object.getOwnPropertyDescriptor(p, k));
          used[k] = 1;
        }
      }
      p = Object.getPrototypeOf(p);
    }
  }
  function created(element) {
    if (element.createdCallback) {
      element.createdCallback();
    }
  }
  scope.upgrade = upgrade;
  scope.upgradeWithDefinition = upgradeWithDefinition;
  scope.implementPrototype = implementPrototype;
});

window.CustomElements.addModule(function(scope) {
  var isIE = scope.isIE;
  var upgradeDocumentTree = scope.upgradeDocumentTree;
  var upgradeAll = scope.upgradeAll;
  var upgradeWithDefinition = scope.upgradeWithDefinition;
  var implementPrototype = scope.implementPrototype;
  var useNative = scope.useNative;
  function register(name, options) {
    var definition = options || {};
    if (!name) {
      throw new Error("document.registerElement: first argument `name` must not be empty");
    }
    if (name.indexOf("-") < 0) {
      throw new Error("document.registerElement: first argument ('name') must contain a dash ('-'). Argument provided was '" + String(name) + "'.");
    }
    if (isReservedTag(name)) {
      throw new Error("Failed to execute 'registerElement' on 'Document': Registration failed for type '" + String(name) + "'. The type name is invalid.");
    }
    if (getRegisteredDefinition(name)) {
      throw new Error("DuplicateDefinitionError: a type with name '" + String(name) + "' is already registered");
    }
    if (!definition.prototype) {
      definition.prototype = Object.create(HTMLElement.prototype);
    }
    definition.__name = name.toLowerCase();
    if (definition.extends) {
      definition.extends = definition.extends.toLowerCase();
    }
    definition.lifecycle = definition.lifecycle || {};
    definition.ancestry = ancestry(definition.extends);
    resolveTagName(definition);
    resolvePrototypeChain(definition);
    overrideAttributeApi(definition.prototype);
    registerDefinition(definition.__name, definition);
    definition.ctor = generateConstructor(definition);
    definition.ctor.prototype = definition.prototype;
    definition.prototype.constructor = definition.ctor;
    if (scope.ready) {
      upgradeDocumentTree(document);
    }
    return definition.ctor;
  }
  function overrideAttributeApi(prototype) {
    if (prototype.setAttribute._polyfilled) {
      return;
    }
    var setAttribute = prototype.setAttribute;
    prototype.setAttribute = function(name, value) {
      changeAttribute.call(this, name, value, setAttribute);
    };
    var removeAttribute = prototype.removeAttribute;
    prototype.removeAttribute = function(name) {
      changeAttribute.call(this, name, null, removeAttribute);
    };
    prototype.setAttribute._polyfilled = true;
  }
  function changeAttribute(name, value, operation) {
    name = name.toLowerCase();
    var oldValue = this.getAttribute(name);
    operation.apply(this, arguments);
    var newValue = this.getAttribute(name);
    if (this.attributeChangedCallback && newValue !== oldValue) {
      this.attributeChangedCallback(name, oldValue, newValue);
    }
  }
  function isReservedTag(name) {
    for (var i = 0; i < reservedTagList.length; i++) {
      if (name === reservedTagList[i]) {
        return true;
      }
    }
  }
  var reservedTagList = [ "annotation-xml", "color-profile", "font-face", "font-face-src", "font-face-uri", "font-face-format", "font-face-name", "missing-glyph" ];
  function ancestry(extnds) {
    var extendee = getRegisteredDefinition(extnds);
    if (extendee) {
      return ancestry(extendee.extends).concat([ extendee ]);
    }
    return [];
  }
  function resolveTagName(definition) {
    var baseTag = definition.extends;
    for (var i = 0, a; a = definition.ancestry[i]; i++) {
      baseTag = a.is && a.tag;
    }
    definition.tag = baseTag || definition.__name;
    if (baseTag) {
      definition.is = definition.__name;
    }
  }
  function resolvePrototypeChain(definition) {
    if (!Object.__proto__) {
      var nativePrototype = HTMLElement.prototype;
      if (definition.is) {
        var inst = document.createElement(definition.tag);
        nativePrototype = Object.getPrototypeOf(inst);
      }
      var proto = definition.prototype, ancestor;
      var foundPrototype = false;
      while (proto) {
        if (proto == nativePrototype) {
          foundPrototype = true;
        }
        ancestor = Object.getPrototypeOf(proto);
        if (ancestor) {
          proto.__proto__ = ancestor;
        }
        proto = ancestor;
      }
      if (!foundPrototype) {
        console.warn(definition.tag + " prototype not found in prototype chain for " + definition.is);
      }
      definition.native = nativePrototype;
    }
  }
  function instantiate(definition) {
    return upgradeWithDefinition(domCreateElement(definition.tag), definition);
  }
  var registry = {};
  function getRegisteredDefinition(name) {
    if (name) {
      return registry[name.toLowerCase()];
    }
  }
  function registerDefinition(name, definition) {
    registry[name] = definition;
  }
  function generateConstructor(definition) {
    return function() {
      return instantiate(definition);
    };
  }
  var HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
  function createElementNS(namespace, tag, typeExtension) {
    if (namespace === HTML_NAMESPACE) {
      return createElement(tag, typeExtension);
    } else {
      return domCreateElementNS(namespace, tag);
    }
  }
  function createElement(tag, typeExtension) {
    if (tag) {
      tag = tag.toLowerCase();
    }
    if (typeExtension) {
      typeExtension = typeExtension.toLowerCase();
    }
    var definition = getRegisteredDefinition(typeExtension || tag);
    if (definition) {
      if (tag == definition.tag && typeExtension == definition.is) {
        return new definition.ctor();
      }
      if (!typeExtension && !definition.is) {
        return new definition.ctor();
      }
    }
    var element;
    if (typeExtension) {
      element = createElement(tag);
      element.setAttribute("is", typeExtension);
      return element;
    }
    element = domCreateElement(tag);
    if (tag.indexOf("-") >= 0) {
      implementPrototype(element, HTMLElement);
    }
    return element;
  }
  var domCreateElement = document.createElement.bind(document);
  var domCreateElementNS = document.createElementNS.bind(document);
  var isInstance;
  if (!Object.__proto__ && !useNative) {
    isInstance = function(obj, ctor) {
      if (obj instanceof ctor) {
        return true;
      }
      var p = obj;
      while (p) {
        if (p === ctor.prototype) {
          return true;
        }
        p = p.__proto__;
      }
      return false;
    };
  } else {
    isInstance = function(obj, base) {
      return obj instanceof base;
    };
  }
  function wrapDomMethodToForceUpgrade(obj, methodName) {
    var orig = obj[methodName];
    obj[methodName] = function() {
      var n = orig.apply(this, arguments);
      upgradeAll(n);
      return n;
    };
  }
  wrapDomMethodToForceUpgrade(Node.prototype, "cloneNode");
  wrapDomMethodToForceUpgrade(document, "importNode");
  document.registerElement = register;
  document.createElement = createElement;
  document.createElementNS = createElementNS;
  scope.registry = registry;
  scope.instanceof = isInstance;
  scope.reservedTagList = reservedTagList;
  scope.getRegisteredDefinition = getRegisteredDefinition;
  document.register = document.registerElement;
});

(function(scope) {
  var useNative = scope.useNative;
  var initializeModules = scope.initializeModules;
  var isIE = scope.isIE;
  if (useNative) {
    var nop = function() {};
    scope.watchShadow = nop;
    scope.upgrade = nop;
    scope.upgradeAll = nop;
    scope.upgradeDocumentTree = nop;
    scope.upgradeSubtree = nop;
    scope.takeRecords = nop;
    scope.instanceof = function(obj, base) {
      return obj instanceof base;
    };
  } else {
    initializeModules();
  }
  var upgradeDocumentTree = scope.upgradeDocumentTree;
  var upgradeDocument = scope.upgradeDocument;
  if (!window.wrap) {
    if (window.ShadowDOMPolyfill) {
      window.wrap = window.ShadowDOMPolyfill.wrapIfNeeded;
      window.unwrap = window.ShadowDOMPolyfill.unwrapIfNeeded;
    } else {
      window.wrap = window.unwrap = function(node) {
        return node;
      };
    }
  }
  if (window.HTMLImports) {
    window.HTMLImports.__importsParsingHook = function(elt) {
      if (elt.import) {
        upgradeDocument(wrap(elt.import));
      }
    };
  }
  function bootstrap() {
    upgradeDocumentTree(window.wrap(document));
    window.CustomElements.ready = true;
    var requestAnimationFrame = window.requestAnimationFrame || function(f) {
      setTimeout(f, 16);
    };
    requestAnimationFrame(function() {
      setTimeout(function() {
        window.CustomElements.readyTime = Date.now();
        if (window.HTMLImports) {
          window.CustomElements.elapsed = window.CustomElements.readyTime - window.HTMLImports.readyTime;
        }
        document.dispatchEvent(new CustomEvent("WebComponentsReady", {
          bubbles: true
        }));
      });
    });
  }
  if (document.readyState === "complete" || scope.flags.eager) {
    bootstrap();
  } else if (document.readyState === "interactive" && !window.attachEvent && (!window.HTMLImports || window.HTMLImports.ready)) {
    bootstrap();
  } else {
    var loadEvent = window.HTMLImports && !window.HTMLImports.ready ? "HTMLImportsLoaded" : "DOMContentLoaded";
    window.addEventListener(loadEvent, bootstrap);
  }
})(window.CustomElements);

(function(scope) {
  if (!Function.prototype.bind) {
    Function.prototype.bind = function(scope) {
      var self = this;
      var args = Array.prototype.slice.call(arguments, 1);
      return function() {
        var args2 = args.slice();
        args2.push.apply(args2, arguments);
        return self.apply(scope, args2);
      };
    };
  }
})(window.WebComponents);

(function(scope) {
  var style = document.createElement("style");
  style.textContent = "" + "body {" + "transition: opacity ease-in 0.2s;" + " } \n" + "body[unresolved] {" + "opacity: 0; display: block; overflow: hidden; position: relative;" + " } \n";
  var head = document.querySelector("head");
  head.insertBefore(style, head.firstChild);
})(window.WebComponents);

(function(scope) {
  window.Platform = scope;
})(window.WebComponents);
(function () {
function resolve() {
document.body.removeAttribute('unresolved');
}
if (window.WebComponents) {
addEventListener('WebComponentsReady', resolve);
} else {
if (document.readyState === 'interactive' || document.readyState === 'complete') {
resolve();
} else {
addEventListener('DOMContentLoaded', resolve);
}
}
}());window.Polymer = {
Settings: function () {
var settings = window.Polymer || {};
if (!settings.noUrlSettings) {
var parts = location.search.slice(1).split('&');
for (var i = 0, o; i < parts.length && (o = parts[i]); i++) {
o = o.split('=');
o[0] && (settings[o[0]] = o[1] || true);
}
}
settings.wantShadow = settings.dom === 'shadow';
settings.hasShadow = Boolean(Element.prototype.createShadowRoot);
settings.nativeShadow = settings.hasShadow && !window.ShadowDOMPolyfill;
settings.useShadow = settings.wantShadow && settings.hasShadow;
settings.hasNativeImports = Boolean('import' in document.createElement('link'));
settings.useNativeImports = settings.hasNativeImports;
settings.useNativeCustomElements = !window.CustomElements || window.CustomElements.useNative;
settings.useNativeShadow = settings.useShadow && settings.nativeShadow;
settings.usePolyfillProto = !settings.useNativeCustomElements && !Object.__proto__;
settings.hasNativeCSSProperties = !navigator.userAgent.match(/AppleWebKit\/601|Edge\/15/) && window.CSS && CSS.supports && CSS.supports('box-shadow', '0 0 0 var(--foo)');
settings.useNativeCSSProperties = settings.hasNativeCSSProperties && settings.lazyRegister && settings.useNativeCSSProperties;
settings.isIE = navigator.userAgent.match('Trident');
settings.passiveTouchGestures = settings.passiveTouchGestures || false;
return settings;
}()
};(function () {
var userPolymer = window.Polymer;
window.Polymer = function (prototype) {
if (typeof prototype === 'function') {
prototype = prototype.prototype;
}
if (!prototype) {
prototype = {};
}
prototype = desugar(prototype);
var customCtor = prototype === prototype.constructor.prototype ? prototype.constructor : null;
var options = { prototype: prototype };
if (prototype.extends) {
options.extends = prototype.extends;
}
Polymer.telemetry._registrate(prototype);
var ctor = document.registerElement(prototype.is, options);
return customCtor || ctor;
};
var desugar = function (prototype) {
var base = Polymer.Base;
if (prototype.extends) {
base = Polymer.Base._getExtendedPrototype(prototype.extends);
}
prototype = Polymer.Base.chainObject(prototype, base);
prototype.registerCallback();
return prototype;
};
if (userPolymer) {
for (var i in userPolymer) {
Polymer[i] = userPolymer[i];
}
}
Polymer.Class = function (prototype) {
if (!prototype.factoryImpl) {
prototype.factoryImpl = function () {
};
}
return desugar(prototype).constructor;
};
}());
Polymer.telemetry = {
registrations: [],
_regLog: function (prototype) {
console.log('[' + prototype.is + ']: registered');
},
_registrate: function (prototype) {
this.registrations.push(prototype);
Polymer.log && this._regLog(prototype);
},
dumpRegistrations: function () {
this.registrations.forEach(this._regLog);
}
};Object.defineProperty(window, 'currentImport', {
enumerable: true,
configurable: true,
get: function () {
return (document._currentScript || document.currentScript || {}).ownerDocument;
}
});Polymer.RenderStatus = {
_ready: false,
_callbacks: [],
whenReady: function (cb) {
if (this._ready) {
cb();
} else {
this._callbacks.push(cb);
}
},
_makeReady: function () {
this._ready = true;
for (var i = 0; i < this._callbacks.length; i++) {
this._callbacks[i]();
}
this._callbacks = [];
},
_catchFirstRender: function () {
requestAnimationFrame(function () {
Polymer.RenderStatus._makeReady();
});
},
_afterNextRenderQueue: [],
_waitingNextRender: false,
afterNextRender: function (element, fn, args) {
this._watchNextRender();
this._afterNextRenderQueue.push([
element,
fn,
args
]);
},
hasRendered: function () {
return this._ready;
},
_watchNextRender: function () {
if (!this._waitingNextRender) {
this._waitingNextRender = true;
var fn = function () {
Polymer.RenderStatus._flushNextRender();
};
if (!this._ready) {
this.whenReady(fn);
} else {
requestAnimationFrame(fn);
}
}
},
_flushNextRender: function () {
var self = this;
setTimeout(function () {
self._flushRenderCallbacks(self._afterNextRenderQueue);
self._afterNextRenderQueue = [];
self._waitingNextRender = false;
});
},
_flushRenderCallbacks: function (callbacks) {
for (var i = 0, h; i < callbacks.length; i++) {
h = callbacks[i];
h[1].apply(h[0], h[2] || Polymer.nar);
}
}
};
if (window.HTMLImports) {
HTMLImports.whenReady(function () {
Polymer.RenderStatus._catchFirstRender();
});
} else {
Polymer.RenderStatus._catchFirstRender();
}
Polymer.ImportStatus = Polymer.RenderStatus;
Polymer.ImportStatus.whenLoaded = Polymer.ImportStatus.whenReady;(function () {
'use strict';
var settings = Polymer.Settings;
Polymer.Base = {
__isPolymerInstance__: true,
_addFeature: function (feature) {
this.mixin(this, feature);
},
registerCallback: function () {
if (settings.lazyRegister === 'max') {
if (this.beforeRegister) {
this.beforeRegister();
}
} else {
this._desugarBehaviors();
for (var i = 0, b; i < this.behaviors.length; i++) {
b = this.behaviors[i];
if (b.beforeRegister) {
b.beforeRegister.call(this);
}
}
if (this.beforeRegister) {
this.beforeRegister();
}
}
this._registerFeatures();
if (!settings.lazyRegister) {
this.ensureRegisterFinished();
}
},
createdCallback: function () {
if (settings.disableUpgradeEnabled) {
if (this.hasAttribute('disable-upgrade')) {
this._propertySetter = disableUpgradePropertySetter;
this._configValue = null;
this.__data__ = {};
return;
} else {
this.__hasInitialized = true;
}
}
this.__initialize();
},
__initialize: function () {
if (!this.__hasRegisterFinished) {
this._ensureRegisterFinished(this.__proto__);
}
Polymer.telemetry.instanceCount++;
this.root = this;
for (var i = 0, b; i < this.behaviors.length; i++) {
b = this.behaviors[i];
if (b.created) {
b.created.call(this);
}
}
if (this.created) {
this.created();
}
this._initFeatures();
},
ensureRegisterFinished: function () {
this._ensureRegisterFinished(this);
},
_ensureRegisterFinished: function (proto) {
if (proto.__hasRegisterFinished !== proto.is || !proto.is) {
if (settings.lazyRegister === 'max') {
proto._desugarBehaviors();
for (var i = 0, b; i < proto.behaviors.length; i++) {
b = proto.behaviors[i];
if (b.beforeRegister) {
b.beforeRegister.call(proto);
}
}
}
proto.__hasRegisterFinished = proto.is;
if (proto._finishRegisterFeatures) {
proto._finishRegisterFeatures();
}
for (var j = 0, pb; j < proto.behaviors.length; j++) {
pb = proto.behaviors[j];
if (pb.registered) {
pb.registered.call(proto);
}
}
if (proto.registered) {
proto.registered();
}
if (settings.usePolyfillProto && proto !== this) {
proto.extend(this, proto);
}
}
},
attachedCallback: function () {
var self = this;
Polymer.RenderStatus.whenReady(function () {
self.isAttached = true;
for (var i = 0, b; i < self.behaviors.length; i++) {
b = self.behaviors[i];
if (b.attached) {
b.attached.call(self);
}
}
if (self.attached) {
self.attached();
}
});
},
detachedCallback: function () {
var self = this;
Polymer.RenderStatus.whenReady(function () {
self.isAttached = false;
for (var i = 0, b; i < self.behaviors.length; i++) {
b = self.behaviors[i];
if (b.detached) {
b.detached.call(self);
}
}
if (self.detached) {
self.detached();
}
});
},
attributeChangedCallback: function (name, oldValue, newValue) {
this._attributeChangedImpl(name);
for (var i = 0, b; i < this.behaviors.length; i++) {
b = this.behaviors[i];
if (b.attributeChanged) {
b.attributeChanged.call(this, name, oldValue, newValue);
}
}
if (this.attributeChanged) {
this.attributeChanged(name, oldValue, newValue);
}
},
_attributeChangedImpl: function (name) {
this._setAttributeToProperty(this, name);
},
extend: function (target, source) {
if (target && source) {
var n$ = Object.getOwnPropertyNames(source);
for (var i = 0, n; i < n$.length && (n = n$[i]); i++) {
this.copyOwnProperty(n, source, target);
}
}
return target || source;
},
mixin: function (target, source) {
for (var i in source) {
target[i] = source[i];
}
return target;
},
copyOwnProperty: function (name, source, target) {
var pd = Object.getOwnPropertyDescriptor(source, name);
if (pd) {
Object.defineProperty(target, name, pd);
}
},
_logger: function (level, args) {
if (args.length === 1 && Array.isArray(args[0])) {
args = args[0];
}
switch (level) {
case 'log':
case 'warn':
case 'error':
console[level].apply(console, args);
break;
}
},
_log: function () {
var args = Array.prototype.slice.call(arguments, 0);
this._logger('log', args);
},
_warn: function () {
var args = Array.prototype.slice.call(arguments, 0);
this._logger('warn', args);
},
_error: function () {
var args = Array.prototype.slice.call(arguments, 0);
this._logger('error', args);
},
_logf: function () {
return this._logPrefix.concat(this.is).concat(Array.prototype.slice.call(arguments, 0));
}
};
Polymer.Base._logPrefix = function () {
var color = window.chrome && !/edge/i.test(navigator.userAgent) || /firefox/i.test(navigator.userAgent);
return color ? [
'%c[%s::%s]:',
'font-weight: bold; background-color:#EEEE00;'
] : ['[%s::%s]:'];
}();
Polymer.Base.chainObject = function (object, inherited) {
if (object && inherited && object !== inherited) {
if (!Object.__proto__) {
object = Polymer.Base.extend(Object.create(inherited), object);
}
object.__proto__ = inherited;
}
return object;
};
Polymer.Base = Polymer.Base.chainObject(Polymer.Base, HTMLElement.prototype);
Polymer.BaseDescriptors = {};
var disableUpgradePropertySetter;
if (settings.disableUpgradeEnabled) {
disableUpgradePropertySetter = function (property, value) {
this.__data__[property] = value;
};
var origAttributeChangedCallback = Polymer.Base.attributeChangedCallback;
Polymer.Base.attributeChangedCallback = function (name, oldValue, newValue) {
if (!this.__hasInitialized && name === 'disable-upgrade') {
this.__hasInitialized = true;
this._propertySetter = Polymer.Bind._modelApi._propertySetter;
this._configValue = Polymer.Base._configValue;
this.__initialize();
}
origAttributeChangedCallback.call(this, name, oldValue, newValue);
};
}
if (window.CustomElements) {
Polymer.instanceof = CustomElements.instanceof;
} else {
Polymer.instanceof = function (obj, ctor) {
return obj instanceof ctor;
};
}
Polymer.isInstance = function (obj) {
return Boolean(obj && obj.__isPolymerInstance__);
};
Polymer.telemetry.instanceCount = 0;
}());(function () {
var modules = {};
var lcModules = {};
var findModule = function (id) {
return modules[id] || lcModules[id.toLowerCase()];
};
var DomModule = function () {
return document.createElement('dom-module');
};
DomModule.prototype = Object.create(HTMLElement.prototype);
Polymer.Base.mixin(DomModule.prototype, {
createdCallback: function () {
this.register();
},
register: function (id) {
id = id || this.id || this.getAttribute('name') || this.getAttribute('is');
if (id) {
this.id = id;
modules[id] = this;
lcModules[id.toLowerCase()] = this;
}
},
import: function (id, selector) {
if (id) {
var m = findModule(id);
if (!m) {
forceDomModulesUpgrade();
m = findModule(id);
}
if (m && selector) {
m = m.querySelector(selector);
}
return m;
}
}
});
Object.defineProperty(DomModule.prototype, 'constructor', {
value: DomModule,
configurable: true,
writable: true
});
var cePolyfill = window.CustomElements && !CustomElements.useNative;
document.registerElement('dom-module', DomModule);
function forceDomModulesUpgrade() {
if (cePolyfill) {
var script = document._currentScript || document.currentScript;
var doc = script && script.ownerDocument || document;
var modules = doc.querySelectorAll('dom-module');
for (var i = modules.length - 1, m; i >= 0 && (m = modules[i]); i--) {
if (m.__upgraded__) {
return;
} else {
CustomElements.upgrade(m);
}
}
}
}
}());Polymer.Base._addFeature({
_prepIs: function () {
if (!this.is) {
var module = (document._currentScript || document.currentScript).parentNode;
if (module.localName === 'dom-module') {
var id = module.id || module.getAttribute('name') || module.getAttribute('is');
this.is = id;
}
}
if (this.is) {
this.is = this.is.toLowerCase();
}
}
});Polymer.Base._addFeature({
behaviors: [],
_desugarBehaviors: function () {
if (this.behaviors.length) {
this.behaviors = this._desugarSomeBehaviors(this.behaviors);
}
},
_desugarSomeBehaviors: function (behaviors) {
var behaviorSet = [];
behaviors = this._flattenBehaviorsList(behaviors);
for (var i = behaviors.length - 1; i >= 0; i--) {
var b = behaviors[i];
if (behaviorSet.indexOf(b) === -1) {
this._mixinBehavior(b);
behaviorSet.unshift(b);
}
}
return behaviorSet;
},
_flattenBehaviorsList: function (behaviors) {
var flat = [];
for (var i = 0; i < behaviors.length; i++) {
var b = behaviors[i];
if (b instanceof Array) {
flat = flat.concat(this._flattenBehaviorsList(b));
} else if (b) {
flat.push(b);
} else {
this._warn(this._logf('_flattenBehaviorsList', 'behavior is null, check for missing or 404 import'));
}
}
return flat;
},
_mixinBehavior: function (b) {
var n$ = Object.getOwnPropertyNames(b);
var useAssignment = b._noAccessors;
for (var i = 0, n; i < n$.length && (n = n$[i]); i++) {
if (!Polymer.Base._behaviorProperties[n] && !this.hasOwnProperty(n)) {
if (useAssignment) {
this[n] = b[n];
} else {
this.copyOwnProperty(n, b, this);
}
}
}
},
_prepBehaviors: function () {
this._prepFlattenedBehaviors(this.behaviors);
},
_prepFlattenedBehaviors: function (behaviors) {
for (var i = 0, l = behaviors.length; i < l; i++) {
this._prepBehavior(behaviors[i]);
}
this._prepBehavior(this);
},
_marshalBehaviors: function () {
for (var i = 0; i < this.behaviors.length; i++) {
this._marshalBehavior(this.behaviors[i]);
}
this._marshalBehavior(this);
}
});
Polymer.Base._behaviorProperties = {
hostAttributes: true,
beforeRegister: true,
registered: true,
properties: true,
observers: true,
listeners: true,
created: true,
attached: true,
detached: true,
attributeChanged: true,
ready: true,
_noAccessors: true
};Polymer.Base._addFeature({
_getExtendedPrototype: function (tag) {
return this._getExtendedNativePrototype(tag);
},
_nativePrototypes: {},
_getExtendedNativePrototype: function (tag) {
var p = this._nativePrototypes[tag];
if (!p) {
p = Object.create(this.getNativePrototype(tag));
var p$ = Object.getOwnPropertyNames(Polymer.Base);
for (var i = 0, n; i < p$.length && (n = p$[i]); i++) {
if (!Polymer.BaseDescriptors[n]) {
p[n] = Polymer.Base[n];
}
}
Object.defineProperties(p, Polymer.BaseDescriptors);
this._nativePrototypes[tag] = p;
}
return p;
},
getNativePrototype: function (tag) {
return Object.getPrototypeOf(document.createElement(tag));
}
});Polymer.Base._addFeature({
_prepConstructor: function () {
this._factoryArgs = this.extends ? [
this.extends,
this.is
] : [this.is];
var ctor = function () {
return this._factory(arguments);
};
if (this.hasOwnProperty('extends')) {
ctor.extends = this.extends;
}
Object.defineProperty(this, 'constructor', {
value: ctor,
writable: true,
configurable: true
});
ctor.prototype = this;
},
_factory: function (args) {
var elt = document.createElement.apply(document, this._factoryArgs);
if (this.factoryImpl) {
this.factoryImpl.apply(elt, args);
}
return elt;
}
});Polymer.nob = Object.create(null);
Polymer.Base._addFeature({
getPropertyInfo: function (property) {
var info = this._getPropertyInfo(property, this.properties);
if (!info) {
for (var i = 0; i < this.behaviors.length; i++) {
info = this._getPropertyInfo(property, this.behaviors[i].properties);
if (info) {
return info;
}
}
}
return info || Polymer.nob;
},
_getPropertyInfo: function (property, properties) {
var p = properties && properties[property];
if (typeof p === 'function') {
p = properties[property] = { type: p };
}
if (p) {
p.defined = true;
}
return p;
},
_prepPropertyInfo: function () {
this._propertyInfo = {};
for (var i = 0; i < this.behaviors.length; i++) {
this._addPropertyInfo(this._propertyInfo, this.behaviors[i].properties);
}
this._addPropertyInfo(this._propertyInfo, this.properties);
this._addPropertyInfo(this._propertyInfo, this._propertyEffects);
},
_addPropertyInfo: function (target, source) {
if (source) {
var t, s;
for (var i in source) {
t = target[i];
s = source[i];
if (i[0] === '_' && !s.readOnly) {
continue;
}
if (!target[i]) {
target[i] = {
type: typeof s === 'function' ? s : s.type,
readOnly: s.readOnly,
attribute: Polymer.CaseMap.camelToDashCase(i)
};
} else {
if (!t.type) {
t.type = s.type;
}
if (!t.readOnly) {
t.readOnly = s.readOnly;
}
}
}
}
}
});
(function () {
var propertiesDesc = {
configurable: true,
writable: true,
enumerable: true,
value: {}
};
Polymer.BaseDescriptors.properties = propertiesDesc;
Object.defineProperty(Polymer.Base, 'properties', propertiesDesc);
}());Polymer.CaseMap = {
_caseMap: {},
_rx: {
dashToCamel: /-[a-z]/g,
camelToDash: /([A-Z])/g
},
dashToCamelCase: function (dash) {
return this._caseMap[dash] || (this._caseMap[dash] = dash.indexOf('-') < 0 ? dash : dash.replace(this._rx.dashToCamel, function (m) {
return m[1].toUpperCase();
}));
},
camelToDashCase: function (camel) {
return this._caseMap[camel] || (this._caseMap[camel] = camel.replace(this._rx.camelToDash, '-$1').toLowerCase());
}
};Polymer.Base._addFeature({
_addHostAttributes: function (attributes) {
if (!this._aggregatedAttributes) {
this._aggregatedAttributes = {};
}
if (attributes) {
this.mixin(this._aggregatedAttributes, attributes);
}
},
_marshalHostAttributes: function () {
if (this._aggregatedAttributes) {
this._applyAttributes(this, this._aggregatedAttributes);
}
},
_applyAttributes: function (node, attr$) {
for (var n in attr$) {
if (!this.hasAttribute(n) && n !== 'class') {
var v = attr$[n];
this.serializeValueToAttribute(v, n, this);
}
}
},
_marshalAttributes: function () {
this._takeAttributesToModel(this);
},
_takeAttributesToModel: function (model) {
if (this.hasAttributes()) {
for (var i in this._propertyInfo) {
var info = this._propertyInfo[i];
if (this.hasAttribute(info.attribute)) {
this._setAttributeToProperty(model, info.attribute, i, info);
}
}
}
},
_setAttributeToProperty: function (model, attribute, property, info) {
if (!this._serializing) {
property = property || Polymer.CaseMap.dashToCamelCase(attribute);
info = info || this._propertyInfo && this._propertyInfo[property];
if (info && !info.readOnly) {
var v = this.getAttribute(attribute);
model[property] = this.deserialize(v, info.type);
}
}
},
_serializing: false,
reflectPropertyToAttribute: function (property, attribute, value) {
this._serializing = true;
value = value === undefined ? this[property] : value;
this.serializeValueToAttribute(value, attribute || Polymer.CaseMap.camelToDashCase(property));
this._serializing = false;
},
serializeValueToAttribute: function (value, attribute, node) {
var str = this.serialize(value);
node = node || this;
if (str === undefined) {
node.removeAttribute(attribute);
} else {
node.setAttribute(attribute, str);
}
},
deserialize: function (value, type) {
switch (type) {
case Number:
value = Number(value);
break;
case Boolean:
value = value != null;
break;
case Object:
try {
value = JSON.parse(value);
} catch (x) {
}
break;
case Array:
try {
value = JSON.parse(value);
} catch (x) {
value = null;
console.warn('Polymer::Attributes: couldn`t decode Array as JSON');
}
break;
case Date:
value = new Date(value);
break;
case String:
default:
break;
}
return value;
},
serialize: function (value) {
switch (typeof value) {
case 'boolean':
return value ? '' : undefined;
case 'object':
if (value instanceof Date) {
return value.toString();
} else if (value) {
try {
return JSON.stringify(value);
} catch (x) {
return '';
}
}
default:
return value != null ? value : undefined;
}
}
});Polymer.version = "1.11.3";Polymer.Base._addFeature({
_registerFeatures: function () {
this._prepIs();
this._prepBehaviors();
this._prepConstructor();
this._prepPropertyInfo();
},
_prepBehavior: function (b) {
this._addHostAttributes(b.hostAttributes);
},
_marshalBehavior: function (b) {
},
_initFeatures: function () {
this._marshalHostAttributes();
this._marshalBehaviors();
}
});
(function () {
function resolveCss(cssText, ownerDocument) {
return cssText.replace(CSS_URL_RX, function (m, pre, url, post) {
return pre + '\'' + resolve(url.replace(/["']/g, ''), ownerDocument) + '\'' + post;
});
}
function resolveAttrs(element, ownerDocument) {
for (var name in URL_ATTRS) {
var a$ = URL_ATTRS[name];
for (var i = 0, l = a$.length, a, at, v; i < l && (a = a$[i]); i++) {
if (name === '*' || element.localName === name) {
at = element.attributes[a];
v = at && at.value;
if (v && v.search(BINDING_RX) < 0) {
at.value = a === 'style' ? resolveCss(v, ownerDocument) : resolve(v, ownerDocument);
}
}
}
}
}
function resolve(url, ownerDocument) {
if (url && ABS_URL.test(url)) {
return url;
}
var resolver = getUrlResolver(ownerDocument);
resolver.href = url;
return resolver.href || url;
}
var tempDoc;
var tempDocBase;
function resolveUrl(url, baseUri) {
if (!tempDoc) {
tempDoc = document.implementation.createHTMLDocument('temp');
tempDocBase = tempDoc.createElement('base');
tempDoc.head.appendChild(tempDocBase);
}
tempDocBase.href = baseUri;
return resolve(url, tempDoc);
}
function getUrlResolver(ownerDocument) {
return ownerDocument.body.__urlResolver || (ownerDocument.body.__urlResolver = ownerDocument.createElement('a'));
}
function pathFromUrl(url) {
return url.substring(0, url.lastIndexOf('/') + 1);
}
var CSS_URL_RX = /(url\()([^)]*)(\))/g;
var URL_ATTRS = {
'*': [
'href',
'src',
'style',
'url'
],
form: ['action']
};
var ABS_URL = /(^\/)|(^#)|(^[\w-\d]*:)/;
var BINDING_RX = /\{\{|\[\[/;
Polymer.ResolveUrl = {
resolveCss: resolveCss,
resolveAttrs: resolveAttrs,
resolveUrl: resolveUrl,
pathFromUrl: pathFromUrl
};
Polymer.rootPath = Polymer.Settings.rootPath || pathFromUrl(document.baseURI || window.location.href);
}());Polymer.Base._addFeature({
_prepTemplate: function () {
var module;
if (this._template === undefined) {
module = Polymer.DomModule.import(this.is);
this._template = module && module.querySelector('template');
}
if (module) {
var assetPath = module.getAttribute('assetpath') || '';
var importURL = Polymer.ResolveUrl.resolveUrl(assetPath, module.ownerDocument.baseURI);
this._importPath = Polymer.ResolveUrl.pathFromUrl(importURL);
} else {
this._importPath = '';
}
if (this._template && this._template.hasAttribute('is')) {
this._warn(this._logf('_prepTemplate', 'top-level Polymer template ' + 'must not be a type-extension, found', this._template, 'Move inside simple <template>.'));
}
if (this._template && !this._template.content && window.HTMLTemplateElement && HTMLTemplateElement.decorate) {
HTMLTemplateElement.decorate(this._template);
}
},
_stampTemplate: function () {
if (this._template) {
this.root = this.instanceTemplate(this._template);
}
},
instanceTemplate: function (template) {
var dom = document.importNode(template._content || template.content, true);
return dom;
}
});(function () {
var baseAttachedCallback = Polymer.Base.attachedCallback;
var baseDetachedCallback = Polymer.Base.detachedCallback;
Polymer.Base._addFeature({
_hostStack: [],
ready: function () {
},
_registerHost: function (host) {
this.dataHost = host = host || Polymer.Base._hostStack[Polymer.Base._hostStack.length - 1];
if (host && host._clients) {
host._clients.push(this);
}
this._clients = null;
this._clientsReadied = false;
},
_beginHosting: function () {
Polymer.Base._hostStack.push(this);
if (!this._clients) {
this._clients = [];
}
},
_endHosting: function () {
Polymer.Base._hostStack.pop();
},
_tryReady: function () {
this._readied = false;
if (this._canReady()) {
this._ready();
}
},
_canReady: function () {
return !this.dataHost || this.dataHost._clientsReadied;
},
_ready: function () {
this._beforeClientsReady();
if (this._template) {
this._setupRoot();
this._readyClients();
}
this._clientsReadied = true;
this._clients = null;
this._afterClientsReady();
this._readySelf();
},
_readyClients: function () {
this._beginDistribute();
var c$ = this._clients;
if (c$) {
for (var i = 0, l = c$.length, c; i < l && (c = c$[i]); i++) {
c._ready();
}
}
this._finishDistribute();
},
_readySelf: function () {
for (var i = 0, b; i < this.behaviors.length; i++) {
b = this.behaviors[i];
if (b.ready) {
b.ready.call(this);
}
}
if (this.ready) {
this.ready();
}
this._readied = true;
if (this._attachedPending) {
this._attachedPending = false;
this.attachedCallback();
}
},
_beforeClientsReady: function () {
},
_afterClientsReady: function () {
},
_beforeAttached: function () {
},
attachedCallback: function () {
if (this._readied) {
this._beforeAttached();
baseAttachedCallback.call(this);
} else {
this._attachedPending = true;
}
},
detachedCallback: function () {
if (this._readied) {
baseDetachedCallback.call(this);
} else {
this._attachedPending = false;
}
}
});
}());Polymer.ArraySplice = function () {
function newSplice(index, removed, addedCount) {
return {
index: index,
removed: removed,
addedCount: addedCount
};
}
var EDIT_LEAVE = 0;
var EDIT_UPDATE = 1;
var EDIT_ADD = 2;
var EDIT_DELETE = 3;
function ArraySplice() {
}
ArraySplice.prototype = {
calcEditDistances: function (current, currentStart, currentEnd, old, oldStart, oldEnd) {
var rowCount = oldEnd - oldStart + 1;
var columnCount = currentEnd - currentStart + 1;
var distances = new Array(rowCount);
for (var i = 0; i < rowCount; i++) {
distances[i] = new Array(columnCount);
distances[i][0] = i;
}
for (var j = 0; j < columnCount; j++)
distances[0][j] = j;
for (i = 1; i < rowCount; i++) {
for (j = 1; j < columnCount; j++) {
if (this.equals(current[currentStart + j - 1], old[oldStart + i - 1]))
distances[i][j] = distances[i - 1][j - 1];
else {
var north = distances[i - 1][j] + 1;
var west = distances[i][j - 1] + 1;
distances[i][j] = north < west ? north : west;
}
}
}
return distances;
},
spliceOperationsFromEditDistances: function (distances) {
var i = distances.length - 1;
var j = distances[0].length - 1;
var current = distances[i][j];
var edits = [];
while (i > 0 || j > 0) {
if (i == 0) {
edits.push(EDIT_ADD);
j--;
continue;
}
if (j == 0) {
edits.push(EDIT_DELETE);
i--;
continue;
}
var northWest = distances[i - 1][j - 1];
var west = distances[i - 1][j];
var north = distances[i][j - 1];
var min;
if (west < north)
min = west < northWest ? west : northWest;
else
min = north < northWest ? north : northWest;
if (min == northWest) {
if (northWest == current) {
edits.push(EDIT_LEAVE);
} else {
edits.push(EDIT_UPDATE);
current = northWest;
}
i--;
j--;
} else if (min == west) {
edits.push(EDIT_DELETE);
i--;
current = west;
} else {
edits.push(EDIT_ADD);
j--;
current = north;
}
}
edits.reverse();
return edits;
},
calcSplices: function (current, currentStart, currentEnd, old, oldStart, oldEnd) {
var prefixCount = 0;
var suffixCount = 0;
var minLength = Math.min(currentEnd - currentStart, oldEnd - oldStart);
if (currentStart == 0 && oldStart == 0)
prefixCount = this.sharedPrefix(current, old, minLength);
if (currentEnd == current.length && oldEnd == old.length)
suffixCount = this.sharedSuffix(current, old, minLength - prefixCount);
currentStart += prefixCount;
oldStart += prefixCount;
currentEnd -= suffixCount;
oldEnd -= suffixCount;
if (currentEnd - currentStart == 0 && oldEnd - oldStart == 0)
return [];
if (currentStart == currentEnd) {
var splice = newSplice(currentStart, [], 0);
while (oldStart < oldEnd)
splice.removed.push(old[oldStart++]);
return [splice];
} else if (oldStart == oldEnd)
return [newSplice(currentStart, [], currentEnd - currentStart)];
var ops = this.spliceOperationsFromEditDistances(this.calcEditDistances(current, currentStart, currentEnd, old, oldStart, oldEnd));
splice = undefined;
var splices = [];
var index = currentStart;
var oldIndex = oldStart;
for (var i = 0; i < ops.length; i++) {
switch (ops[i]) {
case EDIT_LEAVE:
if (splice) {
splices.push(splice);
splice = undefined;
}
index++;
oldIndex++;
break;
case EDIT_UPDATE:
if (!splice)
splice = newSplice(index, [], 0);
splice.addedCount++;
index++;
splice.removed.push(old[oldIndex]);
oldIndex++;
break;
case EDIT_ADD:
if (!splice)
splice = newSplice(index, [], 0);
splice.addedCount++;
index++;
break;
case EDIT_DELETE:
if (!splice)
splice = newSplice(index, [], 0);
splice.removed.push(old[oldIndex]);
oldIndex++;
break;
}
}
if (splice) {
splices.push(splice);
}
return splices;
},
sharedPrefix: function (current, old, searchLength) {
for (var i = 0; i < searchLength; i++)
if (!this.equals(current[i], old[i]))
return i;
return searchLength;
},
sharedSuffix: function (current, old, searchLength) {
var index1 = current.length;
var index2 = old.length;
var count = 0;
while (count < searchLength && this.equals(current[--index1], old[--index2]))
count++;
return count;
},
calculateSplices: function (current, previous) {
return this.calcSplices(current, 0, current.length, previous, 0, previous.length);
},
equals: function (currentValue, previousValue) {
return currentValue === previousValue;
}
};
return new ArraySplice();
}();Polymer.domInnerHTML = function () {
var escapeAttrRegExp = /[&\u00A0"]/g;
var escapeDataRegExp = /[&\u00A0<>]/g;
function escapeReplace(c) {
switch (c) {
case '&':
return '&amp;';
case '<':
return '&lt;';
case '>':
return '&gt;';
case '"':
return '&quot;';
case '\xA0':
return '&nbsp;';
}
}
function escapeAttr(s) {
return s.replace(escapeAttrRegExp, escapeReplace);
}
function escapeData(s) {
return s.replace(escapeDataRegExp, escapeReplace);
}
function makeSet(arr) {
var set = {};
for (var i = 0; i < arr.length; i++) {
set[arr[i]] = true;
}
return set;
}
var voidElements = makeSet([
'area',
'base',
'br',
'col',
'command',
'embed',
'hr',
'img',
'input',
'keygen',
'link',
'meta',
'param',
'source',
'track',
'wbr'
]);
var plaintextParents = makeSet([
'style',
'script',
'xmp',
'iframe',
'noembed',
'noframes',
'plaintext',
'noscript'
]);
function getOuterHTML(node, parentNode, composed) {
switch (node.nodeType) {
case Node.ELEMENT_NODE:
var tagName = node.localName;
var s = '<' + tagName;
var attrs = node.attributes;
for (var i = 0, attr; attr = attrs[i]; i++) {
s += ' ' + attr.name + '="' + escapeAttr(attr.value) + '"';
}
s += '>';
if (voidElements[tagName]) {
return s;
}
return s + getInnerHTML(node, composed) + '</' + tagName + '>';
case Node.TEXT_NODE:
var data = node.data;
if (parentNode && plaintextParents[parentNode.localName]) {
return data;
}
return escapeData(data);
case Node.COMMENT_NODE:
return '<!--' + node.data + '-->';
default:
console.error(node);
throw new Error('not implemented');
}
}
function getInnerHTML(node, composed) {
if (node instanceof HTMLTemplateElement)
node = node.content;
var s = '';
var c$ = Polymer.dom(node).childNodes;
for (var i = 0, l = c$.length, child; i < l && (child = c$[i]); i++) {
s += getOuterHTML(child, node, composed);
}
return s;
}
return { getInnerHTML: getInnerHTML };
}();(function () {
'use strict';
var nativeInsertBefore = Element.prototype.insertBefore;
var nativeAppendChild = Element.prototype.appendChild;
var nativeRemoveChild = Element.prototype.removeChild;
Polymer.TreeApi = {
arrayCopyChildNodes: function (parent) {
var copy = [], i = 0;
for (var n = parent.firstChild; n; n = n.nextSibling) {
copy[i++] = n;
}
return copy;
},
arrayCopyChildren: function (parent) {
var copy = [], i = 0;
for (var n = parent.firstElementChild; n; n = n.nextElementSibling) {
copy[i++] = n;
}
return copy;
},
arrayCopy: function (a$) {
var l = a$.length;
var copy = new Array(l);
for (var i = 0; i < l; i++) {
copy[i] = a$[i];
}
return copy;
}
};
Polymer.TreeApi.Logical = {
hasParentNode: function (node) {
return Boolean(node.__dom && node.__dom.parentNode);
},
hasChildNodes: function (node) {
return Boolean(node.__dom && node.__dom.childNodes !== undefined);
},
getChildNodes: function (node) {
return this.hasChildNodes(node) ? this._getChildNodes(node) : node.childNodes;
},
_getChildNodes: function (node) {
if (!node.__dom.childNodes) {
node.__dom.childNodes = [];
for (var n = node.__dom.firstChild; n; n = n.__dom.nextSibling) {
node.__dom.childNodes.push(n);
}
}
return node.__dom.childNodes;
},
getParentNode: function (node) {
return node.__dom && node.__dom.parentNode !== undefined ? node.__dom.parentNode : node.parentNode;
},
getFirstChild: function (node) {
return node.__dom && node.__dom.firstChild !== undefined ? node.__dom.firstChild : node.firstChild;
},
getLastChild: function (node) {
return node.__dom && node.__dom.lastChild !== undefined ? node.__dom.lastChild : node.lastChild;
},
getNextSibling: function (node) {
return node.__dom && node.__dom.nextSibling !== undefined ? node.__dom.nextSibling : node.nextSibling;
},
getPreviousSibling: function (node) {
return node.__dom && node.__dom.previousSibling !== undefined ? node.__dom.previousSibling : node.previousSibling;
},
getFirstElementChild: function (node) {
return node.__dom && node.__dom.firstChild !== undefined ? this._getFirstElementChild(node) : node.firstElementChild;
},
_getFirstElementChild: function (node) {
var n = node.__dom.firstChild;
while (n && n.nodeType !== Node.ELEMENT_NODE) {
n = n.__dom.nextSibling;
}
return n;
},
getLastElementChild: function (node) {
return node.__dom && node.__dom.lastChild !== undefined ? this._getLastElementChild(node) : node.lastElementChild;
},
_getLastElementChild: function (node) {
var n = node.__dom.lastChild;
while (n && n.nodeType !== Node.ELEMENT_NODE) {
n = n.__dom.previousSibling;
}
return n;
},
getNextElementSibling: function (node) {
return node.__dom && node.__dom.nextSibling !== undefined ? this._getNextElementSibling(node) : node.nextElementSibling;
},
_getNextElementSibling: function (node) {
var n = node.__dom.nextSibling;
while (n && n.nodeType !== Node.ELEMENT_NODE) {
n = n.__dom.nextSibling;
}
return n;
},
getPreviousElementSibling: function (node) {
return node.__dom && node.__dom.previousSibling !== undefined ? this._getPreviousElementSibling(node) : node.previousElementSibling;
},
_getPreviousElementSibling: function (node) {
var n = node.__dom.previousSibling;
while (n && n.nodeType !== Node.ELEMENT_NODE) {
n = n.__dom.previousSibling;
}
return n;
},
saveChildNodes: function (node) {
if (!this.hasChildNodes(node)) {
node.__dom = node.__dom || {};
node.__dom.firstChild = node.firstChild;
node.__dom.lastChild = node.lastChild;
node.__dom.childNodes = [];
for (var n = node.firstChild; n; n = n.nextSibling) {
n.__dom = n.__dom || {};
n.__dom.parentNode = node;
node.__dom.childNodes.push(n);
n.__dom.nextSibling = n.nextSibling;
n.__dom.previousSibling = n.previousSibling;
}
}
},
recordInsertBefore: function (node, container, ref_node) {
container.__dom.childNodes = null;
if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
for (var n = node.firstChild; n; n = n.nextSibling) {
this._linkNode(n, container, ref_node);
}
} else {
this._linkNode(node, container, ref_node);
}
},
_linkNode: function (node, container, ref_node) {
node.__dom = node.__dom || {};
container.__dom = container.__dom || {};
if (ref_node) {
ref_node.__dom = ref_node.__dom || {};
}
node.__dom.previousSibling = ref_node ? ref_node.__dom.previousSibling : container.__dom.lastChild;
if (node.__dom.previousSibling) {
node.__dom.previousSibling.__dom.nextSibling = node;
}
node.__dom.nextSibling = ref_node || null;
if (node.__dom.nextSibling) {
node.__dom.nextSibling.__dom.previousSibling = node;
}
node.__dom.parentNode = container;
if (ref_node) {
if (ref_node === container.__dom.firstChild) {
container.__dom.firstChild = node;
}
} else {
container.__dom.lastChild = node;
if (!container.__dom.firstChild) {
container.__dom.firstChild = node;
}
}
container.__dom.childNodes = null;
},
recordRemoveChild: function (node, container) {
node.__dom = node.__dom || {};
container.__dom = container.__dom || {};
if (node === container.__dom.firstChild) {
container.__dom.firstChild = node.__dom.nextSibling;
}
if (node === container.__dom.lastChild) {
container.__dom.lastChild = node.__dom.previousSibling;
}
var p = node.__dom.previousSibling;
var n = node.__dom.nextSibling;
if (p) {
p.__dom.nextSibling = n;
}
if (n) {
n.__dom.previousSibling = p;
}
node.__dom.parentNode = node.__dom.previousSibling = node.__dom.nextSibling = undefined;
container.__dom.childNodes = null;
}
};
Polymer.TreeApi.Composed = {
getChildNodes: function (node) {
return Polymer.TreeApi.arrayCopyChildNodes(node);
},
getParentNode: function (node) {
return node.parentNode;
},
clearChildNodes: function (node) {
node.textContent = '';
},
insertBefore: function (parentNode, newChild, refChild) {
return nativeInsertBefore.call(parentNode, newChild, refChild || null);
},
appendChild: function (parentNode, newChild) {
return nativeAppendChild.call(parentNode, newChild);
},
removeChild: function (parentNode, node) {
return nativeRemoveChild.call(parentNode, node);
}
};
}());Polymer.DomApi = function () {
'use strict';
var Settings = Polymer.Settings;
var TreeApi = Polymer.TreeApi;
var DomApi = function (node) {
this.node = needsToWrap ? DomApi.wrap(node) : node;
};
var needsToWrap = Settings.hasShadow && !Settings.nativeShadow;
DomApi.wrap = window.wrap ? window.wrap : function (node) {
return node;
};
DomApi.prototype = {
flush: function () {
Polymer.dom.flush();
},
deepContains: function (node) {
if (this.node.contains(node)) {
return true;
}
var n = node;
var doc = node.ownerDocument;
while (n && n !== doc && n !== this.node) {
n = Polymer.dom(n).parentNode || n.host;
}
return n === this.node;
},
queryDistributedElements: function (selector) {
var c$ = this.getEffectiveChildNodes();
var list = [];
for (var i = 0, l = c$.length, c; i < l && (c = c$[i]); i++) {
if (c.nodeType === Node.ELEMENT_NODE && DomApi.matchesSelector.call(c, selector)) {
list.push(c);
}
}
return list;
},
getEffectiveChildNodes: function () {
var list = [];
var c$ = this.childNodes;
for (var i = 0, l = c$.length, c; i < l && (c = c$[i]); i++) {
if (c.localName === CONTENT) {
var d$ = dom(c).getDistributedNodes();
for (var j = 0; j < d$.length; j++) {
list.push(d$[j]);
}
} else {
list.push(c);
}
}
return list;
},
observeNodes: function (callback) {
if (callback) {
if (!this.observer) {
this.observer = this.node.localName === CONTENT ? new DomApi.DistributedNodesObserver(this) : new DomApi.EffectiveNodesObserver(this);
}
return this.observer.addListener(callback);
}
},
unobserveNodes: function (handle) {
if (this.observer) {
this.observer.removeListener(handle);
}
},
notifyObserver: function () {
if (this.observer) {
this.observer.notify();
}
},
_query: function (matcher, node, halter) {
node = node || this.node;
var list = [];
this._queryElements(TreeApi.Logical.getChildNodes(node), matcher, halter, list);
return list;
},
_queryElements: function (elements, matcher, halter, list) {
for (var i = 0, l = elements.length, c; i < l && (c = elements[i]); i++) {
if (c.nodeType === Node.ELEMENT_NODE) {
if (this._queryElement(c, matcher, halter, list)) {
return true;
}
}
}
},
_queryElement: function (node, matcher, halter, list) {
var result = matcher(node);
if (result) {
list.push(node);
}
if (halter && halter(result)) {
return result;
}
this._queryElements(TreeApi.Logical.getChildNodes(node), matcher, halter, list);
}
};
var CONTENT = DomApi.CONTENT = 'content';
var dom = DomApi.factory = function (node) {
node = node || document;
if (!node.__domApi) {
node.__domApi = new DomApi.ctor(node);
}
return node.__domApi;
};
DomApi.hasApi = function (node) {
return Boolean(node.__domApi);
};
DomApi.ctor = DomApi;
Polymer.dom = function (obj, patch) {
if (obj instanceof Event) {
return Polymer.EventApi.factory(obj);
} else {
return DomApi.factory(obj, patch);
}
};
var p = Element.prototype;
DomApi.matchesSelector = p.matches || p.matchesSelector || p.mozMatchesSelector || p.msMatchesSelector || p.oMatchesSelector || p.webkitMatchesSelector;
return DomApi;
}();(function () {
'use strict';
var Settings = Polymer.Settings;
var DomApi = Polymer.DomApi;
var dom = DomApi.factory;
var TreeApi = Polymer.TreeApi;
var getInnerHTML = Polymer.domInnerHTML.getInnerHTML;
var CONTENT = DomApi.CONTENT;
if (Settings.useShadow) {
return;
}
var nativeCloneNode = Element.prototype.cloneNode;
var nativeImportNode = Document.prototype.importNode;
Polymer.Base.mixin(DomApi.prototype, {
_lazyDistribute: function (host) {
if (host.shadyRoot && host.shadyRoot._distributionClean) {
host.shadyRoot._distributionClean = false;
Polymer.dom.addDebouncer(host.debounce('_distribute', host._distributeContent));
}
},
appendChild: function (node) {
return this.insertBefore(node);
},
insertBefore: function (node, ref_node) {
if (ref_node && TreeApi.Logical.getParentNode(ref_node) !== this.node) {
throw Error('The ref_node to be inserted before is not a child ' + 'of this node');
}
if (node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
var parent = TreeApi.Logical.getParentNode(node);
if (parent) {
if (DomApi.hasApi(parent)) {
dom(parent).notifyObserver();
}
this._removeNode(node);
} else {
this._removeOwnerShadyRoot(node);
}
}
if (!this._addNode(node, ref_node)) {
if (ref_node) {
ref_node = ref_node.localName === CONTENT ? this._firstComposedNode(ref_node) : ref_node;
}
var container = this.node._isShadyRoot ? this.node.host : this.node;
if (ref_node) {
TreeApi.Composed.insertBefore(container, node, ref_node);
} else {
TreeApi.Composed.appendChild(container, node);
}
}
this.notifyObserver();
return node;
},
_addNode: function (node, ref_node) {
var root = this.getOwnerRoot();
if (root) {
var ipAdded = this._maybeAddInsertionPoint(node, this.node);
if (!root._invalidInsertionPoints) {
root._invalidInsertionPoints = ipAdded;
}
this._addNodeToHost(root.host, node);
}
if (TreeApi.Logical.hasChildNodes(this.node)) {
TreeApi.Logical.recordInsertBefore(node, this.node, ref_node);
}
var handled = this._maybeDistribute(node) || this.node.shadyRoot;
if (handled) {
if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
while (node.firstChild) {
TreeApi.Composed.removeChild(node, node.firstChild);
}
} else {
var parent = TreeApi.Composed.getParentNode(node);
if (parent) {
TreeApi.Composed.removeChild(parent, node);
}
}
}
return handled;
},
removeChild: function (node) {
if (TreeApi.Logical.getParentNode(node) !== this.node) {
throw Error('The node to be removed is not a child of this node: ' + node);
}
if (!this._removeNode(node)) {
var container = this.node._isShadyRoot ? this.node.host : this.node;
var parent = TreeApi.Composed.getParentNode(node);
if (container === parent) {
TreeApi.Composed.removeChild(container, node);
}
}
this.notifyObserver();
return node;
},
_removeNode: function (node) {
var logicalParent = TreeApi.Logical.hasParentNode(node) && TreeApi.Logical.getParentNode(node);
var distributed;
var root = this._ownerShadyRootForNode(node);
if (logicalParent) {
distributed = dom(node)._maybeDistributeParent();
TreeApi.Logical.recordRemoveChild(node, logicalParent);
if (root && this._removeDistributedChildren(root, node)) {
root._invalidInsertionPoints = true;
this._lazyDistribute(root.host);
}
}
this._removeOwnerShadyRoot(node);
if (root) {
this._removeNodeFromHost(root.host, node);
}
return distributed;
},
replaceChild: function (node, ref_node) {
this.insertBefore(node, ref_node);
this.removeChild(ref_node);
return node;
},
_hasCachedOwnerRoot: function (node) {
return Boolean(node._ownerShadyRoot !== undefined);
},
getOwnerRoot: function () {
return this._ownerShadyRootForNode(this.node);
},
_ownerShadyRootForNode: function (node) {
if (!node) {
return;
}
var root = node._ownerShadyRoot;
if (root === undefined) {
if (node._isShadyRoot) {
root = node;
} else {
var parent = TreeApi.Logical.getParentNode(node);
if (parent) {
root = parent._isShadyRoot ? parent : this._ownerShadyRootForNode(parent);
} else {
root = null;
}
}
if (root || document.documentElement.contains(node)) {
node._ownerShadyRoot = root;
}
}
return root;
},
_maybeDistribute: function (node) {
var fragContent = node.nodeType === Node.DOCUMENT_FRAGMENT_NODE && !node.__noContent && dom(node).querySelector(CONTENT);
var wrappedContent = fragContent && TreeApi.Logical.getParentNode(fragContent).nodeType !== Node.DOCUMENT_FRAGMENT_NODE;
var hasContent = fragContent || node.localName === CONTENT;
if (hasContent) {
var root = this.getOwnerRoot();
if (root) {
this._lazyDistribute(root.host);
}
}
var needsDist = this._nodeNeedsDistribution(this.node);
if (needsDist) {
this._lazyDistribute(this.node);
}
return needsDist || hasContent && !wrappedContent;
},
_maybeAddInsertionPoint: function (node, parent) {
var added;
if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE && !node.__noContent) {
var c$ = dom(node).querySelectorAll(CONTENT);
for (var i = 0, n, np, na; i < c$.length && (n = c$[i]); i++) {
np = TreeApi.Logical.getParentNode(n);
if (np === node) {
np = parent;
}
na = this._maybeAddInsertionPoint(n, np);
added = added || na;
}
} else if (node.localName === CONTENT) {
TreeApi.Logical.saveChildNodes(parent);
TreeApi.Logical.saveChildNodes(node);
added = true;
}
return added;
},
_updateInsertionPoints: function (host) {
var i$ = host.shadyRoot._insertionPoints = dom(host.shadyRoot).querySelectorAll(CONTENT);
for (var i = 0, c; i < i$.length; i++) {
c = i$[i];
TreeApi.Logical.saveChildNodes(c);
TreeApi.Logical.saveChildNodes(TreeApi.Logical.getParentNode(c));
}
},
_nodeNeedsDistribution: function (node) {
return node && node.shadyRoot && DomApi.hasInsertionPoint(node.shadyRoot);
},
_addNodeToHost: function (host, node) {
if (host._elementAdd) {
host._elementAdd(node);
}
},
_removeNodeFromHost: function (host, node) {
if (host._elementRemove) {
host._elementRemove(node);
}
},
_removeDistributedChildren: function (root, container) {
var hostNeedsDist;
var ip$ = root._insertionPoints;
for (var i = 0; i < ip$.length; i++) {
var content = ip$[i];
if (this._contains(container, content)) {
var dc$ = dom(content).getDistributedNodes();
for (var j = 0; j < dc$.length; j++) {
hostNeedsDist = true;
var node = dc$[j];
var parent = TreeApi.Composed.getParentNode(node);
if (parent) {
TreeApi.Composed.removeChild(parent, node);
}
}
}
}
return hostNeedsDist;
},
_contains: function (container, node) {
while (node) {
if (node == container) {
return true;
}
node = TreeApi.Logical.getParentNode(node);
}
},
_removeOwnerShadyRoot: function (node) {
if (this._hasCachedOwnerRoot(node)) {
var c$ = TreeApi.Logical.getChildNodes(node);
for (var i = 0, l = c$.length, n; i < l && (n = c$[i]); i++) {
this._removeOwnerShadyRoot(n);
}
}
node._ownerShadyRoot = undefined;
},
_firstComposedNode: function (content) {
var n$ = dom(content).getDistributedNodes();
for (var i = 0, l = n$.length, n, p$; i < l && (n = n$[i]); i++) {
p$ = dom(n).getDestinationInsertionPoints();
if (p$[p$.length - 1] === content) {
return n;
}
}
},
querySelector: function (selector) {
var result = this._query(function (n) {
return DomApi.matchesSelector.call(n, selector);
}, this.node, function (n) {
return Boolean(n);
})[0];
return result || null;
},
querySelectorAll: function (selector) {
return this._query(function (n) {
return DomApi.matchesSelector.call(n, selector);
}, this.node);
},
getDestinationInsertionPoints: function () {
return this.node._destinationInsertionPoints || [];
},
getDistributedNodes: function () {
return this.node._distributedNodes || [];
},
_clear: function () {
while (this.childNodes.length) {
this.removeChild(this.childNodes[0]);
}
},
setAttribute: function (name, value) {
this.node.setAttribute(name, value);
this._maybeDistributeParent();
},
removeAttribute: function (name) {
this.node.removeAttribute(name);
this._maybeDistributeParent();
},
_maybeDistributeParent: function () {
if (this._nodeNeedsDistribution(this.parentNode)) {
this._lazyDistribute(this.parentNode);
return true;
}
},
cloneNode: function (deep) {
var n = nativeCloneNode.call(this.node, false);
if (deep) {
var c$ = this.childNodes;
var d = dom(n);
for (var i = 0, nc; i < c$.length; i++) {
nc = dom(c$[i]).cloneNode(true);
d.appendChild(nc);
}
}
return n;
},
importNode: function (externalNode, deep) {
var doc = this.node instanceof Document ? this.node : this.node.ownerDocument;
var n = nativeImportNode.call(doc, externalNode, false);
if (deep) {
var c$ = TreeApi.Logical.getChildNodes(externalNode);
var d = dom(n);
for (var i = 0, nc; i < c$.length; i++) {
nc = dom(doc).importNode(c$[i], true);
d.appendChild(nc);
}
}
return n;
},
_getComposedInnerHTML: function () {
return getInnerHTML(this.node, true);
}
});
Object.defineProperties(DomApi.prototype, {
activeElement: {
get: function () {
var active = document.activeElement;
if (!active) {
return null;
}
var isShadyRoot = !!this.node._isShadyRoot;
if (this.node !== document) {
if (!isShadyRoot) {
return null;
}
if (this.node.host === active || !this.node.host.contains(active)) {
return null;
}
}
var activeRoot = dom(active).getOwnerRoot();
while (activeRoot && activeRoot !== this.node) {
active = activeRoot.host;
activeRoot = dom(active).getOwnerRoot();
}
if (this.node === document) {
return activeRoot ? null : active;
} else {
return activeRoot === this.node ? active : null;
}
},
configurable: true
},
childNodes: {
get: function () {
var c$ = TreeApi.Logical.getChildNodes(this.node);
return Array.isArray(c$) ? c$ : TreeApi.arrayCopyChildNodes(this.node);
},
configurable: true
},
children: {
get: function () {
if (TreeApi.Logical.hasChildNodes(this.node)) {
return Array.prototype.filter.call(this.childNodes, function (n) {
return n.nodeType === Node.ELEMENT_NODE;
});
} else {
return TreeApi.arrayCopyChildren(this.node);
}
},
configurable: true
},
parentNode: {
get: function () {
return TreeApi.Logical.getParentNode(this.node);
},
configurable: true
},
firstChild: {
get: function () {
return TreeApi.Logical.getFirstChild(this.node);
},
configurable: true
},
lastChild: {
get: function () {
return TreeApi.Logical.getLastChild(this.node);
},
configurable: true
},
nextSibling: {
get: function () {
return TreeApi.Logical.getNextSibling(this.node);
},
configurable: true
},
previousSibling: {
get: function () {
return TreeApi.Logical.getPreviousSibling(this.node);
},
configurable: true
},
firstElementChild: {
get: function () {
return TreeApi.Logical.getFirstElementChild(this.node);
},
configurable: true
},
lastElementChild: {
get: function () {
return TreeApi.Logical.getLastElementChild(this.node);
},
configurable: true
},
nextElementSibling: {
get: function () {
return TreeApi.Logical.getNextElementSibling(this.node);
},
configurable: true
},
previousElementSibling: {
get: function () {
return TreeApi.Logical.getPreviousElementSibling(this.node);
},
configurable: true
},
textContent: {
get: function () {
var nt = this.node.nodeType;
if (nt === Node.TEXT_NODE || nt === Node.COMMENT_NODE) {
return this.node.textContent;
} else {
var tc = [];
for (var i = 0, cn = this.childNodes, c; c = cn[i]; i++) {
if (c.nodeType !== Node.COMMENT_NODE) {
tc.push(c.textContent);
}
}
return tc.join('');
}
},
set: function (text) {
var nt = this.node.nodeType;
if (nt === Node.TEXT_NODE || nt === Node.COMMENT_NODE) {
this.node.textContent = text;
} else {
this._clear();
if (text) {
this.appendChild(document.createTextNode(text));
}
}
},
configurable: true
},
innerHTML: {
get: function () {
var nt = this.node.nodeType;
if (nt === Node.TEXT_NODE || nt === Node.COMMENT_NODE) {
return null;
} else {
return getInnerHTML(this.node);
}
},
set: function (text) {
var nt = this.node.nodeType;
if (nt !== Node.TEXT_NODE || nt !== Node.COMMENT_NODE) {
this._clear();
var d = document.createElement('div');
d.innerHTML = text;
var c$ = TreeApi.arrayCopyChildNodes(d);
for (var i = 0; i < c$.length; i++) {
this.appendChild(c$[i]);
}
}
},
configurable: true
}
});
DomApi.hasInsertionPoint = function (root) {
return Boolean(root && root._insertionPoints.length);
};
}());(function () {
'use strict';
var Settings = Polymer.Settings;
var TreeApi = Polymer.TreeApi;
var DomApi = Polymer.DomApi;
if (!Settings.useShadow) {
return;
}
Polymer.Base.mixin(DomApi.prototype, {
querySelectorAll: function (selector) {
return TreeApi.arrayCopy(this.node.querySelectorAll(selector));
},
getOwnerRoot: function () {
var n = this.node;
while (n) {
if (n.nodeType === Node.DOCUMENT_FRAGMENT_NODE && n.host) {
return n;
}
n = n.parentNode;
}
},
importNode: function (externalNode, deep) {
var doc = this.node instanceof Document ? this.node : this.node.ownerDocument;
return doc.importNode(externalNode, deep);
},
getDestinationInsertionPoints: function () {
var n$ = this.node.getDestinationInsertionPoints && this.node.getDestinationInsertionPoints();
return n$ ? TreeApi.arrayCopy(n$) : [];
},
getDistributedNodes: function () {
var n$ = this.node.getDistributedNodes && this.node.getDistributedNodes();
return n$ ? TreeApi.arrayCopy(n$) : [];
}
});
Object.defineProperties(DomApi.prototype, {
activeElement: {
get: function () {
var node = DomApi.wrap(this.node);
var activeElement = node.activeElement;
return node.contains(activeElement) ? activeElement : null;
},
configurable: true
},
childNodes: {
get: function () {
return TreeApi.arrayCopyChildNodes(this.node);
},
configurable: true
},
children: {
get: function () {
return TreeApi.arrayCopyChildren(this.node);
},
configurable: true
},
textContent: {
get: function () {
return this.node.textContent;
},
set: function (value) {
return this.node.textContent = value;
},
configurable: true
},
innerHTML: {
get: function () {
return this.node.innerHTML;
},
set: function (value) {
return this.node.innerHTML = value;
},
configurable: true
}
});
var forwardMethods = function (m$) {
for (var i = 0; i < m$.length; i++) {
forwardMethod(m$[i]);
}
};
var forwardMethod = function (method) {
DomApi.prototype[method] = function () {
return this.node[method].apply(this.node, arguments);
};
};
forwardMethods([
'cloneNode',
'appendChild',
'insertBefore',
'removeChild',
'replaceChild',
'setAttribute',
'removeAttribute',
'querySelector'
]);
var forwardProperties = function (f$) {
for (var i = 0; i < f$.length; i++) {
forwardProperty(f$[i]);
}
};
var forwardProperty = function (name) {
Object.defineProperty(DomApi.prototype, name, {
get: function () {
return this.node[name];
},
configurable: true
});
};
forwardProperties([
'parentNode',
'firstChild',
'lastChild',
'nextSibling',
'previousSibling',
'firstElementChild',
'lastElementChild',
'nextElementSibling',
'previousElementSibling'
]);
}());Polymer.Base.mixin(Polymer.dom, {
_flushGuard: 0,
_FLUSH_MAX: 100,
_needsTakeRecords: !Polymer.Settings.useNativeCustomElements,
_debouncers: [],
_staticFlushList: [],
_finishDebouncer: null,
flush: function () {
this._flushGuard = 0;
this._prepareFlush();
while (this._debouncers.length && this._flushGuard < this._FLUSH_MAX) {
while (this._debouncers.length) {
this._debouncers.shift().complete();
}
if (this._finishDebouncer) {
this._finishDebouncer.complete();
}
this._prepareFlush();
this._flushGuard++;
}
if (this._flushGuard >= this._FLUSH_MAX) {
console.warn('Polymer.dom.flush aborted. Flush may not be complete.');
}
},
_prepareFlush: function () {
if (this._needsTakeRecords) {
CustomElements.takeRecords();
}
for (var i = 0; i < this._staticFlushList.length; i++) {
this._staticFlushList[i]();
}
},
addStaticFlush: function (fn) {
this._staticFlushList.push(fn);
},
removeStaticFlush: function (fn) {
var i = this._staticFlushList.indexOf(fn);
if (i >= 0) {
this._staticFlushList.splice(i, 1);
}
},
addDebouncer: function (debouncer) {
this._debouncers.push(debouncer);
this._finishDebouncer = Polymer.Debounce(this._finishDebouncer, this._finishFlush);
},
_finishFlush: function () {
Polymer.dom._debouncers = [];
}
});Polymer.EventApi = function () {
'use strict';
var DomApi = Polymer.DomApi.ctor;
var Settings = Polymer.Settings;
DomApi.Event = function (event) {
this.event = event;
};
if (Settings.useShadow) {
DomApi.Event.prototype = {
get rootTarget() {
return this.event.path[0];
},
get localTarget() {
return this.event.target;
},
get path() {
var path = this.event.path;
if (!Array.isArray(path)) {
path = Array.prototype.slice.call(path);
}
return path;
}
};
} else {
DomApi.Event.prototype = {
get rootTarget() {
return this.event.target;
},
get localTarget() {
var current = this.event.currentTarget;
var currentRoot = current && Polymer.dom(current).getOwnerRoot();
var p$ = this.path;
for (var i = 0; i < p$.length; i++) {
if (Polymer.dom(p$[i]).getOwnerRoot() === currentRoot) {
return p$[i];
}
}
},
get path() {
if (!this.event._path) {
var path = [];
var current = this.rootTarget;
while (current) {
path.push(current);
var insertionPoints = Polymer.dom(current).getDestinationInsertionPoints();
if (insertionPoints.length) {
for (var i = 0; i < insertionPoints.length - 1; i++) {
path.push(insertionPoints[i]);
}
current = insertionPoints[insertionPoints.length - 1];
} else {
current = Polymer.dom(current).parentNode || current.host;
}
}
path.push(window);
this.event._path = path;
}
return this.event._path;
}
};
}
var factory = function (event) {
if (!event.__eventApi) {
event.__eventApi = new DomApi.Event(event);
}
return event.__eventApi;
};
return { factory: factory };
}();(function () {
'use strict';
var DomApi = Polymer.DomApi.ctor;
var useShadow = Polymer.Settings.useShadow;
Object.defineProperty(DomApi.prototype, 'classList', {
get: function () {
if (!this._classList) {
this._classList = new DomApi.ClassList(this);
}
return this._classList;
},
configurable: true
});
DomApi.ClassList = function (host) {
this.domApi = host;
this.node = host.node;
};
DomApi.ClassList.prototype = {
add: function () {
this.node.classList.add.apply(this.node.classList, arguments);
this._distributeParent();
},
remove: function () {
this.node.classList.remove.apply(this.node.classList, arguments);
this._distributeParent();
},
toggle: function () {
this.node.classList.toggle.apply(this.node.classList, arguments);
this._distributeParent();
},
_distributeParent: function () {
if (!useShadow) {
this.domApi._maybeDistributeParent();
}
},
contains: function () {
return this.node.classList.contains.apply(this.node.classList, arguments);
}
};
}());(function () {
'use strict';
var DomApi = Polymer.DomApi.ctor;
var Settings = Polymer.Settings;
DomApi.EffectiveNodesObserver = function (domApi) {
this.domApi = domApi;
this.node = this.domApi.node;
this._listeners = [];
};
DomApi.EffectiveNodesObserver.prototype = {
addListener: function (callback) {
if (!this._isSetup) {
this._setup();
this._isSetup = true;
}
var listener = {
fn: callback,
_nodes: []
};
this._listeners.push(listener);
this._scheduleNotify();
return listener;
},
removeListener: function (handle) {
var i = this._listeners.indexOf(handle);
if (i >= 0) {
this._listeners.splice(i, 1);
handle._nodes = [];
}
if (!this._hasListeners()) {
this._cleanup();
this._isSetup = false;
}
},
_setup: function () {
this._observeContentElements(this.domApi.childNodes);
},
_cleanup: function () {
this._unobserveContentElements(this.domApi.childNodes);
},
_hasListeners: function () {
return Boolean(this._listeners.length);
},
_scheduleNotify: function () {
if (this._debouncer) {
this._debouncer.stop();
}
this._debouncer = Polymer.Debounce(this._debouncer, this._notify);
this._debouncer.context = this;
Polymer.dom.addDebouncer(this._debouncer);
},
notify: function () {
if (this._hasListeners()) {
this._scheduleNotify();
}
},
_notify: function () {
this._beforeCallListeners();
this._callListeners();
},
_beforeCallListeners: function () {
this._updateContentElements();
},
_updateContentElements: function () {
this._observeContentElements(this.domApi.childNodes);
},
_observeContentElements: function (elements) {
for (var i = 0, n; i < elements.length && (n = elements[i]); i++) {
if (this._isContent(n)) {
n.__observeNodesMap = n.__observeNodesMap || new WeakMap();
if (!n.__observeNodesMap.has(this)) {
n.__observeNodesMap.set(this, this._observeContent(n));
}
}
}
},
_observeContent: function (content) {
var self = this;
var h = Polymer.dom(content).observeNodes(function () {
self._scheduleNotify();
});
h._avoidChangeCalculation = true;
return h;
},
_unobserveContentElements: function (elements) {
for (var i = 0, n, h; i < elements.length && (n = elements[i]); i++) {
if (this._isContent(n)) {
h = n.__observeNodesMap.get(this);
if (h) {
Polymer.dom(n).unobserveNodes(h);
n.__observeNodesMap.delete(this);
}
}
}
},
_isContent: function (node) {
return node.localName === 'content';
},
_callListeners: function () {
var o$ = this._listeners;
var nodes = this._getEffectiveNodes();
for (var i = 0, o; i < o$.length && (o = o$[i]); i++) {
var info = this._generateListenerInfo(o, nodes);
if (info || o._alwaysNotify) {
this._callListener(o, info);
}
}
},
_getEffectiveNodes: function () {
return this.domApi.getEffectiveChildNodes();
},
_generateListenerInfo: function (listener, newNodes) {
if (listener._avoidChangeCalculation) {
return true;
}
var oldNodes = listener._nodes;
var info = {
target: this.node,
addedNodes: [],
removedNodes: []
};
var splices = Polymer.ArraySplice.calculateSplices(newNodes, oldNodes);
for (var i = 0, s; i < splices.length && (s = splices[i]); i++) {
for (var j = 0, n; j < s.removed.length && (n = s.removed[j]); j++) {
info.removedNodes.push(n);
}
}
for (i = 0, s; i < splices.length && (s = splices[i]); i++) {
for (j = s.index; j < s.index + s.addedCount; j++) {
info.addedNodes.push(newNodes[j]);
}
}
listener._nodes = newNodes;
if (info.addedNodes.length || info.removedNodes.length) {
return info;
}
},
_callListener: function (listener, info) {
return listener.fn.call(this.node, info);
},
enableShadowAttributeTracking: function () {
}
};
if (Settings.useShadow) {
var baseSetup = DomApi.EffectiveNodesObserver.prototype._setup;
var baseCleanup = DomApi.EffectiveNodesObserver.prototype._cleanup;
Polymer.Base.mixin(DomApi.EffectiveNodesObserver.prototype, {
_setup: function () {
if (!this._observer) {
var self = this;
this._mutationHandler = function (mxns) {
if (mxns && mxns.length) {
self._scheduleNotify();
}
};
this._observer = new MutationObserver(this._mutationHandler);
this._boundFlush = function () {
self._flush();
};
Polymer.dom.addStaticFlush(this._boundFlush);
this._observer.observe(this.node, { childList: true });
}
baseSetup.call(this);
},
_cleanup: function () {
this._observer.disconnect();
this._observer = null;
this._mutationHandler = null;
Polymer.dom.removeStaticFlush(this._boundFlush);
baseCleanup.call(this);
},
_flush: function () {
if (this._observer) {
this._mutationHandler(this._observer.takeRecords());
}
},
enableShadowAttributeTracking: function () {
if (this._observer) {
this._makeContentListenersAlwaysNotify();
this._observer.disconnect();
this._observer.observe(this.node, {
childList: true,
attributes: true,
subtree: true
});
var root = this.domApi.getOwnerRoot();
var host = root && root.host;
if (host && Polymer.dom(host).observer) {
Polymer.dom(host).observer.enableShadowAttributeTracking();
}
}
},
_makeContentListenersAlwaysNotify: function () {
for (var i = 0, h; i < this._listeners.length; i++) {
h = this._listeners[i];
h._alwaysNotify = h._isContentListener;
}
}
});
}
}());(function () {
'use strict';
var DomApi = Polymer.DomApi.ctor;
var Settings = Polymer.Settings;
DomApi.DistributedNodesObserver = function (domApi) {
DomApi.EffectiveNodesObserver.call(this, domApi);
};
DomApi.DistributedNodesObserver.prototype = Object.create(DomApi.EffectiveNodesObserver.prototype);
Polymer.Base.mixin(DomApi.DistributedNodesObserver.prototype, {
_setup: function () {
},
_cleanup: function () {
},
_beforeCallListeners: function () {
},
_getEffectiveNodes: function () {
return this.domApi.getDistributedNodes();
}
});
if (Settings.useShadow) {
Polymer.Base.mixin(DomApi.DistributedNodesObserver.prototype, {
_setup: function () {
if (!this._observer) {
var root = this.domApi.getOwnerRoot();
var host = root && root.host;
if (host) {
var self = this;
this._observer = Polymer.dom(host).observeNodes(function () {
self._scheduleNotify();
});
this._observer._isContentListener = true;
if (this._hasAttrSelect()) {
Polymer.dom(host).observer.enableShadowAttributeTracking();
}
}
}
},
_hasAttrSelect: function () {
var select = this.node.getAttribute('select');
return select && select.match(/[[.]+/);
},
_cleanup: function () {
var root = this.domApi.getOwnerRoot();
var host = root && root.host;
if (host) {
Polymer.dom(host).unobserveNodes(this._observer);
}
this._observer = null;
}
});
}
}());(function () {
var DomApi = Polymer.DomApi;
var TreeApi = Polymer.TreeApi;
Polymer.Base._addFeature({
_prepShady: function () {
this._useContent = this._useContent || Boolean(this._template);
},
_setupShady: function () {
this.shadyRoot = null;
if (!this.__domApi) {
this.__domApi = null;
}
if (!this.__dom) {
this.__dom = null;
}
if (!this._ownerShadyRoot) {
this._ownerShadyRoot = undefined;
}
},
_poolContent: function () {
if (this._useContent) {
TreeApi.Logical.saveChildNodes(this);
}
},
_setupRoot: function () {
if (this._useContent) {
this._createLocalRoot();
if (!this.dataHost) {
upgradeLogicalChildren(TreeApi.Logical.getChildNodes(this));
}
}
},
_createLocalRoot: function () {
this.shadyRoot = this.root;
this.shadyRoot._distributionClean = false;
this.shadyRoot._hasDistributed = false;
this.shadyRoot._isShadyRoot = true;
this.shadyRoot._dirtyRoots = [];
var i$ = this.shadyRoot._insertionPoints = !this._notes || this._notes._hasContent ? this.shadyRoot.querySelectorAll('content') : [];
TreeApi.Logical.saveChildNodes(this.shadyRoot);
for (var i = 0, c; i < i$.length; i++) {
c = i$[i];
TreeApi.Logical.saveChildNodes(c);
TreeApi.Logical.saveChildNodes(c.parentNode);
}
this.shadyRoot.host = this;
},
distributeContent: function (updateInsertionPoints) {
if (this.shadyRoot) {
this.shadyRoot._invalidInsertionPoints = this.shadyRoot._invalidInsertionPoints || updateInsertionPoints;
var host = getTopDistributingHost(this);
Polymer.dom(this)._lazyDistribute(host);
}
},
_distributeContent: function () {
if (this._useContent && !this.shadyRoot._distributionClean) {
if (this.shadyRoot._invalidInsertionPoints) {
Polymer.dom(this)._updateInsertionPoints(this);
this.shadyRoot._invalidInsertionPoints = false;
}
this._beginDistribute();
this._distributeDirtyRoots();
this._finishDistribute();
}
},
_beginDistribute: function () {
if (this._useContent && DomApi.hasInsertionPoint(this.shadyRoot)) {
this._resetDistribution();
this._distributePool(this.shadyRoot, this._collectPool());
}
},
_distributeDirtyRoots: function () {
var c$ = this.shadyRoot._dirtyRoots;
for (var i = 0, l = c$.length, c; i < l && (c = c$[i]); i++) {
c._distributeContent();
}
this.shadyRoot._dirtyRoots = [];
},
_finishDistribute: function () {
if (this._useContent) {
this.shadyRoot._distributionClean = true;
if (DomApi.hasInsertionPoint(this.shadyRoot)) {
this._composeTree();
notifyContentObservers(this.shadyRoot);
} else {
if (!this.shadyRoot._hasDistributed) {
TreeApi.Composed.clearChildNodes(this);
this.appendChild(this.shadyRoot);
} else {
var children = this._composeNode(this);
this._updateChildNodes(this, children);
}
}
if (!this.shadyRoot._hasDistributed) {
notifyInitialDistribution(this);
}
this.shadyRoot._hasDistributed = true;
}
},
elementMatches: function (selector, node) {
node = node || this;
return DomApi.matchesSelector.call(node, selector);
},
_resetDistribution: function () {
var children = TreeApi.Logical.getChildNodes(this);
for (var i = 0; i < children.length; i++) {
var child = children[i];
if (child._destinationInsertionPoints) {
child._destinationInsertionPoints = undefined;
}
if (isInsertionPoint(child)) {
clearDistributedDestinationInsertionPoints(child);
}
}
var root = this.shadyRoot;
var p$ = root._insertionPoints;
for (var j = 0; j < p$.length; j++) {
p$[j]._distributedNodes = [];
}
},
_collectPool: function () {
var pool = [];
var children = TreeApi.Logical.getChildNodes(this);
for (var i = 0; i < children.length; i++) {
var child = children[i];
if (isInsertionPoint(child)) {
pool.push.apply(pool, child._distributedNodes);
} else {
pool.push(child);
}
}
return pool;
},
_distributePool: function (node, pool) {
var p$ = node._insertionPoints;
for (var i = 0, l = p$.length, p; i < l && (p = p$[i]); i++) {
this._distributeInsertionPoint(p, pool);
maybeRedistributeParent(p, this);
}
},
_distributeInsertionPoint: function (content, pool) {
var anyDistributed = false;
for (var i = 0, l = pool.length, node; i < l; i++) {
node = pool[i];
if (!node) {
continue;
}
if (this._matchesContentSelect(node, content)) {
distributeNodeInto(node, content);
pool[i] = undefined;
anyDistributed = true;
}
}
if (!anyDistributed) {
var children = TreeApi.Logical.getChildNodes(content);
for (var j = 0; j < children.length; j++) {
distributeNodeInto(children[j], content);
}
}
},
_composeTree: function () {
this._updateChildNodes(this, this._composeNode(this));
var p$ = this.shadyRoot._insertionPoints;
for (var i = 0, l = p$.length, p, parent; i < l && (p = p$[i]); i++) {
parent = TreeApi.Logical.getParentNode(p);
if (!parent._useContent && parent !== this && parent !== this.shadyRoot) {
this._updateChildNodes(parent, this._composeNode(parent));
}
}
},
_composeNode: function (node) {
var children = [];
var c$ = TreeApi.Logical.getChildNodes(node.shadyRoot || node);
for (var i = 0; i < c$.length; i++) {
var child = c$[i];
if (isInsertionPoint(child)) {
var distributedNodes = child._distributedNodes;
for (var j = 0; j < distributedNodes.length; j++) {
var distributedNode = distributedNodes[j];
if (isFinalDestination(child, distributedNode)) {
children.push(distributedNode);
}
}
} else {
children.push(child);
}
}
return children;
},
_updateChildNodes: function (container, children) {
var composed = TreeApi.Composed.getChildNodes(container);
var splices = Polymer.ArraySplice.calculateSplices(children, composed);
for (var i = 0, d = 0, s; i < splices.length && (s = splices[i]); i++) {
for (var j = 0, n; j < s.removed.length && (n = s.removed[j]); j++) {
if (TreeApi.Composed.getParentNode(n) === container) {
TreeApi.Composed.removeChild(container, n);
}
composed.splice(s.index + d, 1);
}
d -= s.addedCount;
}
for (var i = 0, s, next; i < splices.length && (s = splices[i]); i++) {
next = composed[s.index];
for (j = s.index, n; j < s.index + s.addedCount; j++) {
n = children[j];
TreeApi.Composed.insertBefore(container, n, next);
composed.splice(j, 0, n);
}
}
},
_matchesContentSelect: function (node, contentElement) {
var select = contentElement.getAttribute('select');
if (!select) {
return true;
}
select = select.trim();
if (!select) {
return true;
}
if (!(node instanceof Element)) {
return false;
}
var validSelectors = /^(:not\()?[*.#[a-zA-Z_|]/;
if (!validSelectors.test(select)) {
return false;
}
return this.elementMatches(select, node);
},
_elementAdd: function () {
},
_elementRemove: function () {
}
});
var domHostDesc = {
get: function () {
var root = Polymer.dom(this).getOwnerRoot();
return root && root.host;
},
configurable: true
};
Object.defineProperty(Polymer.Base, 'domHost', domHostDesc);
Polymer.BaseDescriptors.domHost = domHostDesc;
function distributeNodeInto(child, insertionPoint) {
insertionPoint._distributedNodes.push(child);
var points = child._destinationInsertionPoints;
if (!points) {
child._destinationInsertionPoints = [insertionPoint];
} else {
points.push(insertionPoint);
}
}
function clearDistributedDestinationInsertionPoints(content) {
var e$ = content._distributedNodes;
if (e$) {
for (var i = 0; i < e$.length; i++) {
var d = e$[i]._destinationInsertionPoints;
if (d) {
d.splice(d.indexOf(content) + 1, d.length);
}
}
}
}
function maybeRedistributeParent(content, host) {
var parent = TreeApi.Logical.getParentNode(content);
if (parent && parent.shadyRoot && DomApi.hasInsertionPoint(parent.shadyRoot) && parent.shadyRoot._distributionClean) {
parent.shadyRoot._distributionClean = false;
host.shadyRoot._dirtyRoots.push(parent);
}
}
function isFinalDestination(insertionPoint, node) {
var points = node._destinationInsertionPoints;
return points && points[points.length - 1] === insertionPoint;
}
function isInsertionPoint(node) {
return node.localName == 'content';
}
function getTopDistributingHost(host) {
while (host && hostNeedsRedistribution(host)) {
host = host.domHost;
}
return host;
}
function hostNeedsRedistribution(host) {
var c$ = TreeApi.Logical.getChildNodes(host);
for (var i = 0, c; i < c$.length; i++) {
c = c$[i];
if (c.localName && c.localName === 'content') {
return host.domHost;
}
}
}
function notifyContentObservers(root) {
for (var i = 0, c; i < root._insertionPoints.length; i++) {
c = root._insertionPoints[i];
if (DomApi.hasApi(c)) {
Polymer.dom(c).notifyObserver();
}
}
}
function notifyInitialDistribution(host) {
if (DomApi.hasApi(host)) {
Polymer.dom(host).notifyObserver();
}
}
var needsUpgrade = window.CustomElements && !CustomElements.useNative;
function upgradeLogicalChildren(children) {
if (needsUpgrade && children) {
for (var i = 0; i < children.length; i++) {
CustomElements.upgrade(children[i]);
}
}
}
}());if (Polymer.Settings.useShadow) {
Polymer.Base._addFeature({
_poolContent: function () {
},
_beginDistribute: function () {
},
distributeContent: function () {
},
_distributeContent: function () {
},
_finishDistribute: function () {
},
_createLocalRoot: function () {
this.createShadowRoot();
this.shadowRoot.appendChild(this.root);
this.root = this.shadowRoot;
}
});
}Polymer.Async = {
_currVal: 0,
_lastVal: 0,
_callbacks: [],
_twiddleContent: 0,
_twiddle: document.createTextNode(''),
run: function (callback, waitTime) {
if (waitTime > 0) {
return ~setTimeout(callback, waitTime);
} else {
this._twiddle.textContent = this._twiddleContent++;
this._callbacks.push(callback);
return this._currVal++;
}
},
cancel: function (handle) {
if (handle < 0) {
clearTimeout(~handle);
} else {
var idx = handle - this._lastVal;
if (idx >= 0) {
if (!this._callbacks[idx]) {
throw 'invalid async handle: ' + handle;
}
this._callbacks[idx] = null;
}
}
},
_atEndOfMicrotask: function () {
var len = this._callbacks.length;
for (var i = 0; i < len; i++) {
var cb = this._callbacks[i];
if (cb) {
try {
cb();
} catch (e) {
i++;
this._callbacks.splice(0, i);
this._lastVal += i;
this._twiddle.textContent = this._twiddleContent++;
throw e;
}
}
}
this._callbacks.splice(0, len);
this._lastVal += len;
}
};
new window.MutationObserver(function () {
Polymer.Async._atEndOfMicrotask();
}).observe(Polymer.Async._twiddle, { characterData: true });Polymer.Debounce = function () {
var Async = Polymer.Async;
var Debouncer = function (context) {
this.context = context;
var self = this;
this.boundComplete = function () {
self.complete();
};
};
Debouncer.prototype = {
go: function (callback, wait) {
var h;
this.finish = function () {
Async.cancel(h);
};
h = Async.run(this.boundComplete, wait);
this.callback = callback;
},
stop: function () {
if (this.finish) {
this.finish();
this.finish = null;
this.callback = null;
}
},
complete: function () {
if (this.finish) {
var callback = this.callback;
this.stop();
callback.call(this.context);
}
}
};
function debounce(debouncer, callback, wait) {
if (debouncer) {
debouncer.stop();
} else {
debouncer = new Debouncer(this);
}
debouncer.go(callback, wait);
return debouncer;
}
return debounce;
}();Polymer.Base._addFeature({
_setupDebouncers: function () {
this._debouncers = {};
},
debounce: function (jobName, callback, wait) {
return this._debouncers[jobName] = Polymer.Debounce.call(this, this._debouncers[jobName], callback, wait);
},
isDebouncerActive: function (jobName) {
var debouncer = this._debouncers[jobName];
return !!(debouncer && debouncer.finish);
},
flushDebouncer: function (jobName) {
var debouncer = this._debouncers[jobName];
if (debouncer) {
debouncer.complete();
}
},
cancelDebouncer: function (jobName) {
var debouncer = this._debouncers[jobName];
if (debouncer) {
debouncer.stop();
}
}
});Polymer.DomModule = document.createElement('dom-module');
Polymer.Base._addFeature({
_registerFeatures: function () {
this._prepIs();
this._prepBehaviors();
this._prepConstructor();
this._prepTemplate();
this._prepShady();
this._prepPropertyInfo();
},
_prepBehavior: function (b) {
this._addHostAttributes(b.hostAttributes);
},
_initFeatures: function () {
this._registerHost();
if (this._template) {
this._poolContent();
this._beginHosting();
this._stampTemplate();
this._endHosting();
}
this._marshalHostAttributes();
this._setupDebouncers();
this._marshalBehaviors();
this._tryReady();
},
_marshalBehavior: function (b) {
}
});
(function () {
Polymer.nar = [];
var disableUpgradeEnabled = Polymer.Settings.disableUpgradeEnabled;
Polymer.Annotations = {
parseAnnotations: function (template, stripWhiteSpace) {
var list = [];
var content = template._content || template.content;
this._parseNodeAnnotations(content, list, stripWhiteSpace || template.hasAttribute('strip-whitespace'));
return list;
},
_parseNodeAnnotations: function (node, list, stripWhiteSpace) {
return node.nodeType === Node.TEXT_NODE ? this._parseTextNodeAnnotation(node, list) : this._parseElementAnnotations(node, list, stripWhiteSpace);
},
_bindingRegex: function () {
var IDENT = '(?:' + '[a-zA-Z_$][\\w.:$\\-*]*' + ')';
var NUMBER = '(?:' + '[-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?' + ')';
var SQUOTE_STRING = '(?:' + '\'(?:[^\'\\\\]|\\\\.)*\'' + ')';
var DQUOTE_STRING = '(?:' + '"(?:[^"\\\\]|\\\\.)*"' + ')';
var STRING = '(?:' + SQUOTE_STRING + '|' + DQUOTE_STRING + ')';
var ARGUMENT = '(?:' + IDENT + '|' + NUMBER + '|' + STRING + '\\s*' + ')';
var ARGUMENTS = '(?:' + ARGUMENT + '(?:,\\s*' + ARGUMENT + ')*' + ')';
var ARGUMENT_LIST = '(?:' + '\\(\\s*' + '(?:' + ARGUMENTS + '?' + ')' + '\\)\\s*' + ')';
var BINDING = '(' + IDENT + '\\s*' + ARGUMENT_LIST + '?' + ')';
var OPEN_BRACKET = '(\\[\\[|{{)' + '\\s*';
var CLOSE_BRACKET = '(?:]]|}})';
var NEGATE = '(?:(!)\\s*)?';
var EXPRESSION = OPEN_BRACKET + NEGATE + BINDING + CLOSE_BRACKET;
return new RegExp(EXPRESSION, 'g');
}(),
_parseBindings: function (text) {
var re = this._bindingRegex;
var parts = [];
var lastIndex = 0;
var m;
while ((m = re.exec(text)) !== null) {
if (m.index > lastIndex) {
parts.push({ literal: text.slice(lastIndex, m.index) });
}
var mode = m[1][0];
var negate = Boolean(m[2]);
var value = m[3].trim();
var customEvent, notifyEvent, colon;
if (mode == '{' && (colon = value.indexOf('::')) > 0) {
notifyEvent = value.substring(colon + 2);
value = value.substring(0, colon);
customEvent = true;
}
parts.push({
compoundIndex: parts.length,
value: value,
mode: mode,
negate: negate,
event: notifyEvent,
customEvent: customEvent
});
lastIndex = re.lastIndex;
}
if (lastIndex && lastIndex < text.length) {
var literal = text.substring(lastIndex);
if (literal) {
parts.push({ literal: literal });
}
}
if (parts.length) {
return parts;
}
},
_literalFromParts: function (parts) {
var s = '';
for (var i = 0; i < parts.length; i++) {
var literal = parts[i].literal;
s += literal || '';
}
return s;
},
_parseTextNodeAnnotation: function (node, list) {
var parts = this._parseBindings(node.textContent);
if (parts) {
node.textContent = this._literalFromParts(parts) || ' ';
var annote = {
bindings: [{
kind: 'text',
name: 'textContent',
parts: parts,
isCompound: parts.length !== 1
}]
};
list.push(annote);
return annote;
}
},
_parseElementAnnotations: function (element, list, stripWhiteSpace) {
var annote = {
bindings: [],
events: []
};
if (element.localName === 'content') {
list._hasContent = true;
}
this._parseChildNodesAnnotations(element, annote, list, stripWhiteSpace);
if (element.attributes) {
this._parseNodeAttributeAnnotations(element, annote, list);
if (this.prepElement) {
this.prepElement(element);
}
}
if (annote.bindings.length || annote.events.length || annote.id) {
list.push(annote);
}
return annote;
},
_parseChildNodesAnnotations: function (root, annote, list, stripWhiteSpace) {
if (root.firstChild) {
var node = root.firstChild;
var i = 0;
while (node) {
var next = node.nextSibling;
if (node.localName === 'template' && !node.hasAttribute('preserve-content')) {
this._parseTemplate(node, i, list, annote, stripWhiteSpace);
}
if (node.localName == 'slot') {
node = this._replaceSlotWithContent(node);
}
if (node.nodeType === Node.TEXT_NODE) {
var n = next;
while (n && n.nodeType === Node.TEXT_NODE) {
node.textContent += n.textContent;
next = n.nextSibling;
root.removeChild(n);
n = next;
}
if (stripWhiteSpace && !node.textContent.trim()) {
root.removeChild(node);
i--;
}
}
if (node.parentNode) {
var childAnnotation = this._parseNodeAnnotations(node, list, stripWhiteSpace);
if (childAnnotation) {
childAnnotation.parent = annote;
childAnnotation.index = i;
}
}
node = next;
i++;
}
}
},
_replaceSlotWithContent: function (slot) {
var content = slot.ownerDocument.createElement('content');
while (slot.firstChild) {
content.appendChild(slot.firstChild);
}
var attrs = slot.attributes;
for (var i = 0; i < attrs.length; i++) {
var attr = attrs[i];
content.setAttribute(attr.name, attr.value);
}
var name = slot.getAttribute('name');
if (name) {
content.setAttribute('select', '[slot=\'' + name + '\']');
}
slot.parentNode.replaceChild(content, slot);
return content;
},
_parseTemplate: function (node, index, list, parent, stripWhiteSpace) {
var content = document.createDocumentFragment();
content._notes = this.parseAnnotations(node, stripWhiteSpace);
content.appendChild(node.content);
list.push({
bindings: Polymer.nar,
events: Polymer.nar,
templateContent: content,
parent: parent,
index: index
});
},
_parseNodeAttributeAnnotations: function (node, annotation) {
var attrs = Array.prototype.slice.call(node.attributes);
for (var i = attrs.length - 1, a; a = attrs[i]; i--) {
var n = a.name;
var v = a.value;
var b;
if (n.slice(0, 3) === 'on-') {
node.removeAttribute(n);
annotation.events.push({
name: n.slice(3),
value: v
});
} else if (b = this._parseNodeAttributeAnnotation(node, n, v)) {
annotation.bindings.push(b);
} else if (n === 'id') {
annotation.id = v;
}
}
},
_parseNodeAttributeAnnotation: function (node, name, value) {
var parts = this._parseBindings(value);
if (parts) {
var origName = name;
var kind = 'property';
if (name[name.length - 1] == '$') {
name = name.slice(0, -1);
kind = 'attribute';
}
var literal = this._literalFromParts(parts);
if (literal && kind == 'attribute') {
node.setAttribute(name, literal);
}
if (node.localName === 'input' && origName === 'value') {
node.setAttribute(origName, '');
}
if (disableUpgradeEnabled && origName === 'disable-upgrade$') {
node.setAttribute(name, '');
}
node.removeAttribute(origName);
var propertyName = Polymer.CaseMap.dashToCamelCase(name);
if (kind === 'property') {
name = propertyName;
}
return {
kind: kind,
name: name,
propertyName: propertyName,
parts: parts,
literal: literal,
isCompound: parts.length !== 1
};
}
},
findAnnotatedNode: function (root, annote) {
var parent = annote.parent && Polymer.Annotations.findAnnotatedNode(root, annote.parent);
if (parent) {
for (var n = parent.firstChild, i = 0; n; n = n.nextSibling) {
if (annote.index === i++) {
return n;
}
}
} else {
return root;
}
}
};
}());Polymer.Path = {
root: function (path) {
var dotIndex = path.indexOf('.');
if (dotIndex === -1) {
return path;
}
return path.slice(0, dotIndex);
},
isDeep: function (path) {
return path.indexOf('.') !== -1;
},
isAncestor: function (base, path) {
return base.indexOf(path + '.') === 0;
},
isDescendant: function (base, path) {
return path.indexOf(base + '.') === 0;
},
translate: function (base, newBase, path) {
return newBase + path.slice(base.length);
},
matches: function (base, wildcard, path) {
return base === path || this.isAncestor(base, path) || Boolean(wildcard) && this.isDescendant(base, path);
}
};Polymer.Base._addFeature({
_prepAnnotations: function () {
if (!this._template) {
this._notes = [];
} else {
var self = this;
Polymer.Annotations.prepElement = function (element) {
self._prepElement(element);
};
if (this._template._content && this._template._content._notes) {
this._notes = this._template._content._notes;
} else {
this._notes = Polymer.Annotations.parseAnnotations(this._template);
this._processAnnotations(this._notes);
}
Polymer.Annotations.prepElement = null;
}
},
_processAnnotations: function (notes) {
for (var i = 0; i < notes.length; i++) {
var note = notes[i];
for (var j = 0; j < note.bindings.length; j++) {
var b = note.bindings[j];
for (var k = 0; k < b.parts.length; k++) {
var p = b.parts[k];
if (!p.literal) {
var signature = this._parseMethod(p.value);
if (signature) {
p.signature = signature;
} else {
p.model = Polymer.Path.root(p.value);
}
}
}
}
if (note.templateContent) {
this._processAnnotations(note.templateContent._notes);
var pp = note.templateContent._parentProps = this._discoverTemplateParentProps(note.templateContent._notes);
var bindings = [];
for (var prop in pp) {
var name = '_parent_' + prop;
bindings.push({
index: note.index,
kind: 'property',
name: name,
propertyName: name,
parts: [{
mode: '{',
model: prop,
value: prop
}]
});
}
note.bindings = note.bindings.concat(bindings);
}
}
},
_discoverTemplateParentProps: function (notes) {
var pp = {};
for (var i = 0, n; i < notes.length && (n = notes[i]); i++) {
for (var j = 0, b$ = n.bindings, b; j < b$.length && (b = b$[j]); j++) {
for (var k = 0, p$ = b.parts, p; k < p$.length && (p = p$[k]); k++) {
if (p.signature) {
var args = p.signature.args;
for (var kk = 0; kk < args.length; kk++) {
var model = args[kk].model;
if (model) {
pp[model] = true;
}
}
if (p.signature.dynamicFn) {
pp[p.signature.method] = true;
}
} else {
if (p.model) {
pp[p.model] = true;
}
}
}
}
if (n.templateContent) {
var tpp = n.templateContent._parentProps;
Polymer.Base.mixin(pp, tpp);
}
}
return pp;
},
_prepElement: function (element) {
Polymer.ResolveUrl.resolveAttrs(element, this._template.ownerDocument);
},
_findAnnotatedNode: Polymer.Annotations.findAnnotatedNode,
_marshalAnnotationReferences: function () {
if (this._template) {
this._marshalIdNodes();
this._marshalAnnotatedNodes();
this._marshalAnnotatedListeners();
}
},
_configureAnnotationReferences: function () {
var notes = this._notes;
var nodes = this._nodes;
for (var i = 0; i < notes.length; i++) {
var note = notes[i];
var node = nodes[i];
this._configureTemplateContent(note, node);
this._configureCompoundBindings(note, node);
}
},
_configureTemplateContent: function (note, node) {
if (note.templateContent) {
node._content = note.templateContent;
}
},
_configureCompoundBindings: function (note, node) {
var bindings = note.bindings;
for (var i = 0; i < bindings.length; i++) {
var binding = bindings[i];
if (binding.isCompound) {
var storage = node.__compoundStorage__ || (node.__compoundStorage__ = {});
var parts = binding.parts;
var literals = new Array(parts.length);
for (var j = 0; j < parts.length; j++) {
literals[j] = parts[j].literal;
}
var name = binding.name;
storage[name] = literals;
if (binding.literal && binding.kind == 'property') {
if (node._configValue) {
node._configValue(name, binding.literal);
} else {
node[name] = binding.literal;
}
}
}
}
},
_marshalIdNodes: function () {
this.$ = {};
for (var i = 0, l = this._notes.length, a; i < l && (a = this._notes[i]); i++) {
if (a.id) {
this.$[a.id] = this._findAnnotatedNode(this.root, a);
}
}
},
_marshalAnnotatedNodes: function () {
if (this._notes && this._notes.length) {
var r = new Array(this._notes.length);
for (var i = 0; i < this._notes.length; i++) {
r[i] = this._findAnnotatedNode(this.root, this._notes[i]);
}
this._nodes = r;
}
},
_marshalAnnotatedListeners: function () {
for (var i = 0, l = this._notes.length, a; i < l && (a = this._notes[i]); i++) {
if (a.events && a.events.length) {
var node = this._findAnnotatedNode(this.root, a);
for (var j = 0, e$ = a.events, e; j < e$.length && (e = e$[j]); j++) {
this.listen(node, e.name, e.value);
}
}
}
}
});Polymer.Base._addFeature({
listeners: {},
_listenListeners: function (listeners) {
var node, name, eventName;
for (eventName in listeners) {
if (eventName.indexOf('.') < 0) {
node = this;
name = eventName;
} else {
name = eventName.split('.');
node = this.$[name[0]];
name = name[1];
}
this.listen(node, name, listeners[eventName]);
}
},
listen: function (node, eventName, methodName) {
var handler = this._recallEventHandler(this, eventName, node, methodName);
if (!handler) {
handler = this._createEventHandler(node, eventName, methodName);
}
if (handler._listening) {
return;
}
this._listen(node, eventName, handler);
handler._listening = true;
},
_boundListenerKey: function (eventName, methodName) {
return eventName + ':' + methodName;
},
_recordEventHandler: function (host, eventName, target, methodName, handler) {
var hbl = host.__boundListeners;
if (!hbl) {
hbl = host.__boundListeners = new WeakMap();
}
var bl = hbl.get(target);
if (!bl) {
bl = {};
if (!Polymer.Settings.isIE || target != window) {
hbl.set(target, bl);
}
}
var key = this._boundListenerKey(eventName, methodName);
bl[key] = handler;
},
_recallEventHandler: function (host, eventName, target, methodName) {
var hbl = host.__boundListeners;
if (!hbl) {
return;
}
var bl = hbl.get(target);
if (!bl) {
return;
}
var key = this._boundListenerKey(eventName, methodName);
return bl[key];
},
_createEventHandler: function (node, eventName, methodName) {
var host = this;
var handler = function (e) {
if (host[methodName]) {
host[methodName](e, e.detail);
} else {
host._warn(host._logf('_createEventHandler', 'listener method `' + methodName + '` not defined'));
}
};
handler._listening = false;
this._recordEventHandler(host, eventName, node, methodName, handler);
return handler;
},
unlisten: function (node, eventName, methodName) {
var handler = this._recallEventHandler(this, eventName, node, methodName);
if (handler) {
this._unlisten(node, eventName, handler);
handler._listening = false;
}
},
_listen: function (node, eventName, handler) {
node.addEventListener(eventName, handler);
},
_unlisten: function (node, eventName, handler) {
node.removeEventListener(eventName, handler);
}
});(function () {
'use strict';
var wrap = Polymer.DomApi.wrap;
var HAS_NATIVE_TA = typeof document.head.style.touchAction === 'string';
var GESTURE_KEY = '__polymerGestures';
var HANDLED_OBJ = '__polymerGesturesHandled';
var TOUCH_ACTION = '__polymerGesturesTouchAction';
var TAP_DISTANCE = 25;
var TRACK_DISTANCE = 5;
var TRACK_LENGTH = 2;
var MOUSE_TIMEOUT = 2500;
var MOUSE_EVENTS = [
'mousedown',
'mousemove',
'mouseup',
'click'
];
var MOUSE_WHICH_TO_BUTTONS = [
0,
1,
4,
2
];
var MOUSE_HAS_BUTTONS = function () {
try {
return new MouseEvent('test', { buttons: 1 }).buttons === 1;
} catch (e) {
return false;
}
}();
function isMouseEvent(name) {
return MOUSE_EVENTS.indexOf(name) > -1;
}
var SUPPORTS_PASSIVE = false;
(function () {
try {
var opts = Object.defineProperty({}, 'passive', {
get: function () {
SUPPORTS_PASSIVE = true;
}
});
window.addEventListener('test', null, opts);
window.removeEventListener('test', null, opts);
} catch (e) {
}
}());
function PASSIVE_TOUCH(eventName) {
if (isMouseEvent(eventName) || eventName === 'touchend') {
return;
}
if (HAS_NATIVE_TA && SUPPORTS_PASSIVE && Polymer.Settings.passiveTouchGestures) {
return { passive: true };
}
}
var IS_TOUCH_ONLY = navigator.userAgent.match(/iP(?:[oa]d|hone)|Android/);
var mouseCanceller = function (mouseEvent) {
var sc = mouseEvent.sourceCapabilities;
if (sc && !sc.firesTouchEvents) {
return;
}
mouseEvent[HANDLED_OBJ] = { skip: true };
if (mouseEvent.type === 'click') {
var path = Polymer.dom(mouseEvent).path;
if (path) {
for (var i = 0; i < path.length; i++) {
if (path[i] === POINTERSTATE.mouse.target) {
return;
}
}
}
mouseEvent.preventDefault();
mouseEvent.stopPropagation();
}
};
function setupTeardownMouseCanceller(setup) {
var events = IS_TOUCH_ONLY ? ['click'] : MOUSE_EVENTS;
for (var i = 0, en; i < events.length; i++) {
en = events[i];
if (setup) {
document.addEventListener(en, mouseCanceller, true);
} else {
document.removeEventListener(en, mouseCanceller, true);
}
}
}
function ignoreMouse(ev) {
if (!POINTERSTATE.mouse.mouseIgnoreJob) {
setupTeardownMouseCanceller(true);
}
var unset = function () {
setupTeardownMouseCanceller();
POINTERSTATE.mouse.target = null;
POINTERSTATE.mouse.mouseIgnoreJob = null;
};
POINTERSTATE.mouse.target = Polymer.dom(ev).rootTarget;
POINTERSTATE.mouse.mouseIgnoreJob = Polymer.Debounce(POINTERSTATE.mouse.mouseIgnoreJob, unset, MOUSE_TIMEOUT);
}
function hasLeftMouseButton(ev) {
var type = ev.type;
if (!isMouseEvent(type)) {
return false;
}
if (type === 'mousemove') {
var buttons = ev.buttons === undefined ? 1 : ev.buttons;
if (ev instanceof window.MouseEvent && !MOUSE_HAS_BUTTONS) {
buttons = MOUSE_WHICH_TO_BUTTONS[ev.which] || 0;
}
return Boolean(buttons & 1);
} else {
var button = ev.button === undefined ? 0 : ev.button;
return button === 0;
}
}
function isSyntheticClick(ev) {
if (ev.type === 'click') {
if (ev.detail === 0) {
return true;
}
var t = Gestures.findOriginalTarget(ev);
var bcr = t.getBoundingClientRect();
var x = ev.pageX, y = ev.pageY;
return !(x >= bcr.left && x <= bcr.right && (y >= bcr.top && y <= bcr.bottom));
}
return false;
}
var POINTERSTATE = {
mouse: {
target: null,
mouseIgnoreJob: null
},
touch: {
x: 0,
y: 0,
id: -1,
scrollDecided: false
}
};
function firstTouchAction(ev) {
var path = Polymer.dom(ev).path;
var ta = 'auto';
for (var i = 0, n; i < path.length; i++) {
n = path[i];
if (n[TOUCH_ACTION]) {
ta = n[TOUCH_ACTION];
break;
}
}
return ta;
}
function trackDocument(stateObj, movefn, upfn) {
stateObj.movefn = movefn;
stateObj.upfn = upfn;
document.addEventListener('mousemove', movefn);
document.addEventListener('mouseup', upfn);
}
function untrackDocument(stateObj) {
document.removeEventListener('mousemove', stateObj.movefn);
document.removeEventListener('mouseup', stateObj.upfn);
stateObj.movefn = null;
stateObj.upfn = null;
}
document.addEventListener('touchend', ignoreMouse, SUPPORTS_PASSIVE ? { passive: true } : false);
var Gestures = {
gestures: {},
recognizers: [],
deepTargetFind: function (x, y) {
var node = document.elementFromPoint(x, y);
var next = node;
while (next && next.shadowRoot) {
next = next.shadowRoot.elementFromPoint(x, y);
if (next) {
node = next;
}
}
return node;
},
findOriginalTarget: function (ev) {
if (ev.path) {
return ev.path[0];
}
return ev.target;
},
handleNative: function (ev) {
var handled;
var type = ev.type;
var node = wrap(ev.currentTarget);
var gobj = node[GESTURE_KEY];
if (!gobj) {
return;
}
var gs = gobj[type];
if (!gs) {
return;
}
if (!ev[HANDLED_OBJ]) {
ev[HANDLED_OBJ] = {};
if (type.slice(0, 5) === 'touch') {
var t = ev.changedTouches[0];
if (type === 'touchstart') {
if (ev.touches.length === 1) {
POINTERSTATE.touch.id = t.identifier;
}
}
if (POINTERSTATE.touch.id !== t.identifier) {
return;
}
if (!HAS_NATIVE_TA) {
if (type === 'touchstart' || type === 'touchmove') {
Gestures.handleTouchAction(ev);
}
}
}
}
handled = ev[HANDLED_OBJ];
if (handled.skip) {
return;
}
var recognizers = Gestures.recognizers;
for (var i = 0, r; i < recognizers.length; i++) {
r = recognizers[i];
if (gs[r.name] && !handled[r.name]) {
if (r.flow && r.flow.start.indexOf(ev.type) > -1 && r.reset) {
r.reset();
}
}
}
for (i = 0, r; i < recognizers.length; i++) {
r = recognizers[i];
if (gs[r.name] && !handled[r.name]) {
handled[r.name] = true;
r[type](ev);
}
}
},
handleTouchAction: function (ev) {
var t = ev.changedTouches[0];
var type = ev.type;
if (type === 'touchstart') {
POINTERSTATE.touch.x = t.clientX;
POINTERSTATE.touch.y = t.clientY;
POINTERSTATE.touch.scrollDecided = false;
} else if (type === 'touchmove') {
if (POINTERSTATE.touch.scrollDecided) {
return;
}
POINTERSTATE.touch.scrollDecided = true;
var ta = firstTouchAction(ev);
var prevent = false;
var dx = Math.abs(POINTERSTATE.touch.x - t.clientX);
var dy = Math.abs(POINTERSTATE.touch.y - t.clientY);
if (!ev.cancelable) {
} else if (ta === 'none') {
prevent = true;
} else if (ta === 'pan-x') {
prevent = dy > dx;
} else if (ta === 'pan-y') {
prevent = dx > dy;
}
if (prevent) {
ev.preventDefault();
} else {
Gestures.prevent('track');
}
}
},
add: function (node, evType, handler) {
node = wrap(node);
var recognizer = this.gestures[evType];
var deps = recognizer.deps;
var name = recognizer.name;
var gobj = node[GESTURE_KEY];
if (!gobj) {
node[GESTURE_KEY] = gobj = {};
}
for (var i = 0, dep, gd; i < deps.length; i++) {
dep = deps[i];
if (IS_TOUCH_ONLY && isMouseEvent(dep) && dep !== 'click') {
continue;
}
gd = gobj[dep];
if (!gd) {
gobj[dep] = gd = { _count: 0 };
}
if (gd._count === 0) {
node.addEventListener(dep, this.handleNative, PASSIVE_TOUCH(dep));
}
gd[name] = (gd[name] || 0) + 1;
gd._count = (gd._count || 0) + 1;
}
node.addEventListener(evType, handler);
if (recognizer.touchAction) {
this.setTouchAction(node, recognizer.touchAction);
}
},
remove: function (node, evType, handler) {
node = wrap(node);
var recognizer = this.gestures[evType];
var deps = recognizer.deps;
var name = recognizer.name;
var gobj = node[GESTURE_KEY];
if (gobj) {
for (var i = 0, dep, gd; i < deps.length; i++) {
dep = deps[i];
gd = gobj[dep];
if (gd && gd[name]) {
gd[name] = (gd[name] || 1) - 1;
gd._count = (gd._count || 1) - 1;
if (gd._count === 0) {
node.removeEventListener(dep, this.handleNative, PASSIVE_TOUCH(dep));
}
}
}
}
node.removeEventListener(evType, handler);
},
register: function (recog) {
this.recognizers.push(recog);
for (var i = 0; i < recog.emits.length; i++) {
this.gestures[recog.emits[i]] = recog;
}
},
findRecognizerByEvent: function (evName) {
for (var i = 0, r; i < this.recognizers.length; i++) {
r = this.recognizers[i];
for (var j = 0, n; j < r.emits.length; j++) {
n = r.emits[j];
if (n === evName) {
return r;
}
}
}
return null;
},
setTouchAction: function (node, value) {
if (HAS_NATIVE_TA) {
node.style.touchAction = value;
}
node[TOUCH_ACTION] = value;
},
fire: function (target, type, detail) {
var ev = Polymer.Base.fire(type, detail, {
node: target,
bubbles: true,
cancelable: true
});
if (ev.defaultPrevented) {
var preventer = detail.preventer || detail.sourceEvent;
if (preventer && preventer.preventDefault) {
preventer.preventDefault();
}
}
},
prevent: function (evName) {
var recognizer = this.findRecognizerByEvent(evName);
if (recognizer.info) {
recognizer.info.prevent = true;
}
},
resetMouseCanceller: function () {
if (POINTERSTATE.mouse.mouseIgnoreJob) {
POINTERSTATE.mouse.mouseIgnoreJob.complete();
}
}
};
Gestures.register({
name: 'downup',
deps: [
'mousedown',
'touchstart',
'touchend'
],
flow: {
start: [
'mousedown',
'touchstart'
],
end: [
'mouseup',
'touchend'
]
},
emits: [
'down',
'up'
],
info: {
movefn: null,
upfn: null
},
reset: function () {
untrackDocument(this.info);
},
mousedown: function (e) {
if (!hasLeftMouseButton(e)) {
return;
}
var t = Gestures.findOriginalTarget(e);
var self = this;
var movefn = function movefn(e) {
if (!hasLeftMouseButton(e)) {
self.fire('up', t, e);
untrackDocument(self.info);
}
};
var upfn = function upfn(e) {
if (hasLeftMouseButton(e)) {
self.fire('up', t, e);
}
untrackDocument(self.info);
};
trackDocument(this.info, movefn, upfn);
this.fire('down', t, e);
},
touchstart: function (e) {
this.fire('down', Gestures.findOriginalTarget(e), e.changedTouches[0], e);
},
touchend: function (e) {
this.fire('up', Gestures.findOriginalTarget(e), e.changedTouches[0], e);
},
fire: function (type, target, event, preventer) {
Gestures.fire(target, type, {
x: event.clientX,
y: event.clientY,
sourceEvent: event,
preventer: preventer,
prevent: function (e) {
return Gestures.prevent(e);
}
});
}
});
Gestures.register({
name: 'track',
touchAction: 'none',
deps: [
'mousedown',
'touchstart',
'touchmove',
'touchend'
],
flow: {
start: [
'mousedown',
'touchstart'
],
end: [
'mouseup',
'touchend'
]
},
emits: ['track'],
info: {
x: 0,
y: 0,
state: 'start',
started: false,
moves: [],
addMove: function (move) {
if (this.moves.length > TRACK_LENGTH) {
this.moves.shift();
}
this.moves.push(move);
},
movefn: null,
upfn: null,
prevent: false
},
reset: function () {
this.info.state = 'start';
this.info.started = false;
this.info.moves = [];
this.info.x = 0;
this.info.y = 0;
this.info.prevent = false;
untrackDocument(this.info);
},
hasMovedEnough: function (x, y) {
if (this.info.prevent) {
return false;
}
if (this.info.started) {
return true;
}
var dx = Math.abs(this.info.x - x);
var dy = Math.abs(this.info.y - y);
return dx >= TRACK_DISTANCE || dy >= TRACK_DISTANCE;
},
mousedown: function (e) {
if (!hasLeftMouseButton(e)) {
return;
}
var t = Gestures.findOriginalTarget(e);
var self = this;
var movefn = function movefn(e) {
var x = e.clientX, y = e.clientY;
if (self.hasMovedEnough(x, y)) {
self.info.state = self.info.started ? e.type === 'mouseup' ? 'end' : 'track' : 'start';
if (self.info.state === 'start') {
Gestures.prevent('tap');
}
self.info.addMove({
x: x,
y: y
});
if (!hasLeftMouseButton(e)) {
self.info.state = 'end';
untrackDocument(self.info);
}
self.fire(t, e);
self.info.started = true;
}
};
var upfn = function upfn(e) {
if (self.info.started) {
movefn(e);
}
untrackDocument(self.info);
};
trackDocument(this.info, movefn, upfn);
this.info.x = e.clientX;
this.info.y = e.clientY;
},
touchstart: function (e) {
var ct = e.changedTouches[0];
this.info.x = ct.clientX;
this.info.y = ct.clientY;
},
touchmove: function (e) {
var t = Gestures.findOriginalTarget(e);
var ct = e.changedTouches[0];
var x = ct.clientX, y = ct.clientY;
if (this.hasMovedEnough(x, y)) {
if (this.info.state === 'start') {
Gestures.prevent('tap');
}
this.info.addMove({
x: x,
y: y
});
this.fire(t, ct);
this.info.state = 'track';
this.info.started = true;
}
},
touchend: function (e) {
var t = Gestures.findOriginalTarget(e);
var ct = e.changedTouches[0];
if (this.info.started) {
this.info.state = 'end';
this.info.addMove({
x: ct.clientX,
y: ct.clientY
});
this.fire(t, ct, e);
}
},
fire: function (target, touch, preventer) {
var secondlast = this.info.moves[this.info.moves.length - 2];
var lastmove = this.info.moves[this.info.moves.length - 1];
var dx = lastmove.x - this.info.x;
var dy = lastmove.y - this.info.y;
var ddx, ddy = 0;
if (secondlast) {
ddx = lastmove.x - secondlast.x;
ddy = lastmove.y - secondlast.y;
}
return Gestures.fire(target, 'track', {
state: this.info.state,
x: touch.clientX,
y: touch.clientY,
dx: dx,
dy: dy,
ddx: ddx,
ddy: ddy,
sourceEvent: touch,
preventer: preventer,
hover: function () {
return Gestures.deepTargetFind(touch.clientX, touch.clientY);
}
});
}
});
Gestures.register({
name: 'tap',
deps: [
'mousedown',
'click',
'touchstart',
'touchend'
],
flow: {
start: [
'mousedown',
'touchstart'
],
end: [
'click',
'touchend'
]
},
emits: ['tap'],
info: {
x: NaN,
y: NaN,
prevent: false
},
reset: function () {
this.info.x = NaN;
this.info.y = NaN;
this.info.prevent = false;
},
save: function (e) {
this.info.x = e.clientX;
this.info.y = e.clientY;
},
mousedown: function (e) {
if (hasLeftMouseButton(e)) {
this.save(e);
}
},
click: function (e) {
if (hasLeftMouseButton(e)) {
this.forward(e);
}
},
touchstart: function (e) {
this.save(e.changedTouches[0], e);
},
touchend: function (e) {
this.forward(e.changedTouches[0], e);
},
forward: function (e, preventer) {
var dx = Math.abs(e.clientX - this.info.x);
var dy = Math.abs(e.clientY - this.info.y);
var t = Gestures.findOriginalTarget(e);
if (isNaN(dx) || isNaN(dy) || dx <= TAP_DISTANCE && dy <= TAP_DISTANCE || isSyntheticClick(e)) {
if (!this.info.prevent) {
Gestures.fire(t, 'tap', {
x: e.clientX,
y: e.clientY,
sourceEvent: e,
preventer: preventer
});
}
}
}
});
var DIRECTION_MAP = {
x: 'pan-x',
y: 'pan-y',
none: 'none',
all: 'auto'
};
Polymer.Base._addFeature({
_setupGestures: function () {
this.__polymerGestures = null;
},
_listen: function (node, eventName, handler) {
if (Gestures.gestures[eventName]) {
Gestures.add(node, eventName, handler);
} else {
node.addEventListener(eventName, handler);
}
},
_unlisten: function (node, eventName, handler) {
if (Gestures.gestures[eventName]) {
Gestures.remove(node, eventName, handler);
} else {
node.removeEventListener(eventName, handler);
}
},
setScrollDirection: function (direction, node) {
node = node || this;
Gestures.setTouchAction(node, DIRECTION_MAP[direction] || 'auto');
}
});
Polymer.Gestures = Gestures;
}());(function () {
'use strict';
Polymer.Base._addFeature({
$$: function (slctr) {
return Polymer.dom(this.root).querySelector(slctr);
},
toggleClass: function (name, bool, node) {
node = node || this;
if (arguments.length == 1) {
bool = !node.classList.contains(name);
}
if (bool) {
Polymer.dom(node).classList.add(name);
} else {
Polymer.dom(node).classList.remove(name);
}
},
toggleAttribute: function (name, bool, node) {
node = node || this;
if (arguments.length == 1) {
bool = !node.hasAttribute(name);
}
if (bool) {
Polymer.dom(node).setAttribute(name, '');
} else {
Polymer.dom(node).removeAttribute(name);
}
},
classFollows: function (name, toElement, fromElement) {
if (fromElement) {
Polymer.dom(fromElement).classList.remove(name);
}
if (toElement) {
Polymer.dom(toElement).classList.add(name);
}
},
attributeFollows: function (name, toElement, fromElement) {
if (fromElement) {
Polymer.dom(fromElement).removeAttribute(name);
}
if (toElement) {
Polymer.dom(toElement).setAttribute(name, '');
}
},
getEffectiveChildNodes: function () {
return Polymer.dom(this).getEffectiveChildNodes();
},
getEffectiveChildren: function () {
var list = Polymer.dom(this).getEffectiveChildNodes();
return list.filter(function (n) {
return n.nodeType === Node.ELEMENT_NODE;
});
},
getEffectiveTextContent: function () {
var cn = this.getEffectiveChildNodes();
var tc = [];
for (var i = 0, c; c = cn[i]; i++) {
if (c.nodeType !== Node.COMMENT_NODE) {
tc.push(Polymer.dom(c).textContent);
}
}
return tc.join('');
},
queryEffectiveChildren: function (slctr) {
var e$ = Polymer.dom(this).queryDistributedElements(slctr);
return e$ && e$[0];
},
queryAllEffectiveChildren: function (slctr) {
return Polymer.dom(this).queryDistributedElements(slctr);
},
getContentChildNodes: function (slctr) {
var content = Polymer.dom(this.root).querySelector(slctr || 'content');
return content ? Polymer.dom(content).getDistributedNodes() : [];
},
getContentChildren: function (slctr) {
return this.getContentChildNodes(slctr).filter(function (n) {
return n.nodeType === Node.ELEMENT_NODE;
});
},
fire: function (type, detail, options) {
options = options || Polymer.nob;
var node = options.node || this;
detail = detail === null || detail === undefined ? {} : detail;
var bubbles = options.bubbles === undefined ? true : options.bubbles;
var cancelable = Boolean(options.cancelable);
var useCache = options._useCache;
var event = this._getEvent(type, bubbles, cancelable, useCache);
event.detail = detail;
if (useCache) {
this.__eventCache[type] = null;
}
node.dispatchEvent(event);
if (useCache) {
this.__eventCache[type] = event;
}
return event;
},
__eventCache: {},
_getEvent: function (type, bubbles, cancelable, useCache) {
var event = useCache && this.__eventCache[type];
if (!event || (event.bubbles != bubbles || event.cancelable != cancelable)) {
event = new Event(type, {
bubbles: Boolean(bubbles),
cancelable: cancelable
});
}
return event;
},
async: function (callback, waitTime) {
var self = this;
return Polymer.Async.run(function () {
callback.call(self);
}, waitTime);
},
cancelAsync: function (handle) {
Polymer.Async.cancel(handle);
},
arrayDelete: function (path, item) {
var index;
if (Array.isArray(path)) {
index = path.indexOf(item);
if (index >= 0) {
return path.splice(index, 1);
}
} else {
var arr = this._get(path);
index = arr.indexOf(item);
if (index >= 0) {
return this.splice(path, index, 1);
}
}
},
transform: function (transform, node) {
node = node || this;
node.style.webkitTransform = transform;
node.style.transform = transform;
},
translate3d: function (x, y, z, node) {
node = node || this;
this.transform('translate3d(' + x + ',' + y + ',' + z + ')', node);
},
importHref: function (href, onload, onerror, optAsync) {
var link = document.createElement('link');
link.rel = 'import';
link.href = href;
var list = Polymer.Base.importHref.imported = Polymer.Base.importHref.imported || {};
var cached = list[link.href];
var imprt = cached || link;
var self = this;
var loadListener = function (e) {
e.target.__firedLoad = true;
e.target.removeEventListener('load', loadListener);
e.target.removeEventListener('error', errorListener);
return onload.call(self, e);
};
var errorListener = function (e) {
e.target.__firedError = true;
e.target.removeEventListener('load', loadListener);
e.target.removeEventListener('error', errorListener);
return onerror.call(self, e);
};
if (onload) {
imprt.addEventListener('load', loadListener);
}
if (onerror) {
imprt.addEventListener('error', errorListener);
}
if (cached) {
if (cached.__firedLoad) {
cached.dispatchEvent(new Event('load'));
}
if (cached.__firedError) {
cached.dispatchEvent(new Event('error'));
}
} else {
list[link.href] = link;
optAsync = Boolean(optAsync);
if (optAsync) {
link.setAttribute('async', '');
}
document.head.appendChild(link);
}
return imprt;
},
create: function (tag, props) {
var elt = document.createElement(tag);
if (props) {
for (var n in props) {
elt[n] = props[n];
}
}
return elt;
},
isLightDescendant: function (node) {
return this !== node && this.contains(node) && Polymer.dom(this).getOwnerRoot() === Polymer.dom(node).getOwnerRoot();
},
isLocalDescendant: function (node) {
return this.root === Polymer.dom(node).getOwnerRoot();
}
});
if (!Polymer.Settings.useNativeCustomElements) {
var importHref = Polymer.Base.importHref;
Polymer.Base.importHref = function (href, onload, onerror, optAsync) {
CustomElements.ready = false;
var loadFn = function (e) {
CustomElements.upgradeDocumentTree(document);
CustomElements.ready = true;
if (onload) {
return onload.call(this, e);
}
};
return importHref.call(this, href, loadFn, onerror, optAsync);
};
}
}());Polymer.Bind = {
prepareModel: function (model) {
Polymer.Base.mixin(model, this._modelApi);
},
_modelApi: {
_notifyChange: function (source, event, value) {
value = value === undefined ? this[source] : value;
event = event || Polymer.CaseMap.camelToDashCase(source) + '-changed';
this.fire(event, { value: value }, {
bubbles: false,
cancelable: false,
_useCache: Polymer.Settings.eventDataCache || !Polymer.Settings.isIE
});
},
_propertySetter: function (property, value, effects, fromAbove) {
var old = this.__data__[property];
if (old !== value && (old === old || value === value)) {
this.__data__[property] = value;
if (typeof value == 'object') {
this._clearPath(property);
}
if (this._propertyChanged) {
this._propertyChanged(property, value, old);
}
if (effects) {
this._effectEffects(property, value, effects, old, fromAbove);
}
}
return old;
},
__setProperty: function (property, value, quiet, node) {
node = node || this;
var effects = node._propertyEffects && node._propertyEffects[property];
if (effects) {
node._propertySetter(property, value, effects, quiet);
} else if (node[property] !== value) {
node[property] = value;
}
},
_effectEffects: function (property, value, effects, old, fromAbove) {
for (var i = 0, l = effects.length, fx; i < l && (fx = effects[i]); i++) {
fx.fn.call(this, property, this[property], fx.effect, old, fromAbove);
}
},
_clearPath: function (path) {
for (var prop in this.__data__) {
if (Polymer.Path.isDescendant(path, prop)) {
this.__data__[prop] = undefined;
}
}
}
},
ensurePropertyEffects: function (model, property) {
if (!model._propertyEffects) {
model._propertyEffects = {};
}
var fx = model._propertyEffects[property];
if (!fx) {
fx = model._propertyEffects[property] = [];
}
return fx;
},
addPropertyEffect: function (model, property, kind, effect) {
var fx = this.ensurePropertyEffects(model, property);
var propEffect = {
kind: kind,
effect: effect,
fn: Polymer.Bind['_' + kind + 'Effect']
};
fx.push(propEffect);
return propEffect;
},
createBindings: function (model) {
var fx$ = model._propertyEffects;
if (fx$) {
for (var n in fx$) {
var fx = fx$[n];
fx.sort(this._sortPropertyEffects);
this._createAccessors(model, n, fx);
}
}
},
_sortPropertyEffects: function () {
var EFFECT_ORDER = {
'compute': 0,
'annotation': 1,
'annotatedComputation': 2,
'reflect': 3,
'notify': 4,
'observer': 5,
'complexObserver': 6,
'function': 7
};
return function (a, b) {
return EFFECT_ORDER[a.kind] - EFFECT_ORDER[b.kind];
};
}(),
_createAccessors: function (model, property, effects) {
var defun = {
get: function () {
return this.__data__[property];
}
};
var setter = function (value) {
this._propertySetter(property, value, effects);
};
var info = model.getPropertyInfo && model.getPropertyInfo(property);
if (info && info.readOnly) {
if (!info.computed) {
model['_set' + this.upper(property)] = setter;
}
} else {
defun.set = setter;
}
Object.defineProperty(model, property, defun);
},
upper: function (name) {
return name[0].toUpperCase() + name.substring(1);
},
_addAnnotatedListener: function (model, index, property, path, event, negated) {
if (!model._bindListeners) {
model._bindListeners = [];
}
var fn = this._notedListenerFactory(property, path, Polymer.Path.isDeep(path), negated);
var eventName = event || Polymer.CaseMap.camelToDashCase(property) + '-changed';
model._bindListeners.push({
index: index,
property: property,
path: path,
changedFn: fn,
event: eventName
});
},
_isEventBogus: function (e, target) {
return e.path && e.path[0] !== target;
},
_notedListenerFactory: function (property, path, isStructured, negated) {
return function (target, value, targetPath) {
if (targetPath) {
var newPath = Polymer.Path.translate(property, path, targetPath);
this._notifyPath(newPath, value);
} else {
value = target[property];
if (negated) {
value = !value;
}
if (!isStructured) {
this[path] = value;
} else {
if (this.__data__[path] != value) {
this.set(path, value);
}
}
}
};
},
prepareInstance: function (inst) {
inst.__data__ = Object.create(null);
},
setupBindListeners: function (inst) {
var b$ = inst._bindListeners;
for (var i = 0, l = b$.length, info; i < l && (info = b$[i]); i++) {
var node = inst._nodes[info.index];
this._addNotifyListener(node, inst, info.event, info.changedFn);
}
},
_addNotifyListener: function (element, context, event, changedFn) {
element.addEventListener(event, function (e) {
return context._notifyListener(changedFn, e);
});
}
};Polymer.Base.mixin(Polymer.Bind, {
_shouldAddListener: function (effect) {
return effect.name && effect.kind != 'attribute' && effect.kind != 'text' && !effect.isCompound && effect.parts[0].mode === '{';
},
_annotationEffect: function (source, value, effect) {
if (source != effect.value) {
value = this._get(effect.value);
this.__data__[effect.value] = value;
}
this._applyEffectValue(effect, value);
},
_reflectEffect: function (source, value, effect) {
this.reflectPropertyToAttribute(source, effect.attribute, value);
},
_notifyEffect: function (source, value, effect, old, fromAbove) {
if (!fromAbove) {
this._notifyChange(source, effect.event, value);
}
},
_functionEffect: function (source, value, fn, old, fromAbove) {
fn.call(this, source, value, old, fromAbove);
},
_observerEffect: function (source, value, effect, old) {
var fn = this[effect.method];
if (fn) {
fn.call(this, value, old);
} else {
this._warn(this._logf('_observerEffect', 'observer method `' + effect.method + '` not defined'));
}
},
_complexObserverEffect: function (source, value, effect) {
var fn = this[effect.method];
if (fn) {
var args = Polymer.Bind._marshalArgs(this.__data__, effect, source, value);
if (args) {
fn.apply(this, args);
}
} else if (effect.dynamicFn) {
} else {
this._warn(this._logf('_complexObserverEffect', 'observer method `' + effect.method + '` not defined'));
}
},
_computeEffect: function (source, value, effect) {
var fn = this[effect.method];
if (fn) {
var args = Polymer.Bind._marshalArgs(this.__data__, effect, source, value);
if (args) {
var computedvalue = fn.apply(this, args);
this.__setProperty(effect.name, computedvalue);
}
} else if (effect.dynamicFn) {
} else {
this._warn(this._logf('_computeEffect', 'compute method `' + effect.method + '` not defined'));
}
},
_annotatedComputationEffect: function (source, value, effect) {
var computedHost = this._rootDataHost || this;
var fn = computedHost[effect.method];
if (fn) {
var args = Polymer.Bind._marshalArgs(this.__data__, effect, source, value);
if (args) {
var computedvalue = fn.apply(computedHost, args);
this._applyEffectValue(effect, computedvalue);
}
} else if (effect.dynamicFn) {
} else {
computedHost._warn(computedHost._logf('_annotatedComputationEffect', 'compute method `' + effect.method + '` not defined'));
}
},
_marshalArgs: function (model, effect, path, value) {
var values = [];
var args = effect.args;
var bailoutEarly = args.length > 1 || effect.dynamicFn;
for (var i = 0, l = args.length; i < l; i++) {
var arg = args[i];
var name = arg.name;
var v;
if (arg.literal) {
v = arg.value;
} else if (path === name) {
v = value;
} else {
v = model[name];
if (v === undefined && arg.structured) {
v = Polymer.Base._get(name, model);
}
}
if (bailoutEarly && v === undefined) {
return;
}
if (arg.wildcard) {
var matches = Polymer.Path.isAncestor(path, name);
values[i] = {
path: matches ? path : name,
value: matches ? value : v,
base: v
};
} else {
values[i] = v;
}
}
return values;
}
});Polymer.Base._addFeature({
_addPropertyEffect: function (property, kind, effect) {
var prop = Polymer.Bind.addPropertyEffect(this, property, kind, effect);
prop.pathFn = this['_' + prop.kind + 'PathEffect'];
},
_prepEffects: function () {
Polymer.Bind.prepareModel(this);
this._addAnnotationEffects(this._notes);
},
_prepBindings: function () {
Polymer.Bind.createBindings(this);
},
_addPropertyEffects: function (properties) {
if (properties) {
for (var p in properties) {
var prop = properties[p];
if (prop.observer) {
this._addObserverEffect(p, prop.observer);
}
if (prop.computed) {
prop.readOnly = true;
this._addComputedEffect(p, prop.computed);
}
if (prop.notify) {
this._addPropertyEffect(p, 'notify', { event: Polymer.CaseMap.camelToDashCase(p) + '-changed' });
}
if (prop.reflectToAttribute) {
var attr = Polymer.CaseMap.camelToDashCase(p);
if (attr[0] === '-') {
this._warn(this._logf('_addPropertyEffects', 'Property ' + p + ' cannot be reflected to attribute ' + attr + ' because "-" is not a valid starting attribute name. Use a lowercase first letter for the property instead.'));
} else {
this._addPropertyEffect(p, 'reflect', { attribute: attr });
}
}
if (prop.readOnly) {
Polymer.Bind.ensurePropertyEffects(this, p);
}
}
}
},
_addComputedEffect: function (name, expression) {
var sig = this._parseMethod(expression);
var dynamicFn = sig.dynamicFn;
for (var i = 0, arg; i < sig.args.length && (arg = sig.args[i]); i++) {
this._addPropertyEffect(arg.model, 'compute', {
method: sig.method,
args: sig.args,
trigger: arg,
name: name,
dynamicFn: dynamicFn
});
}
if (dynamicFn) {
this._addPropertyEffect(sig.method, 'compute', {
method: sig.method,
args: sig.args,
trigger: null,
name: name,
dynamicFn: dynamicFn
});
}
},
_addObserverEffect: function (property, observer) {
this._addPropertyEffect(property, 'observer', {
method: observer,
property: property
});
},
_addComplexObserverEffects: function (observers) {
if (observers) {
for (var i = 0, o; i < observers.length && (o = observers[i]); i++) {
this._addComplexObserverEffect(o);
}
}
},
_addComplexObserverEffect: function (observer) {
var sig = this._parseMethod(observer);
if (!sig) {
throw new Error('Malformed observer expression \'' + observer + '\'');
}
var dynamicFn = sig.dynamicFn;
for (var i = 0, arg; i < sig.args.length && (arg = sig.args[i]); i++) {
this._addPropertyEffect(arg.model, 'complexObserver', {
method: sig.method,
args: sig.args,
trigger: arg,
dynamicFn: dynamicFn
});
}
if (dynamicFn) {
this._addPropertyEffect(sig.method, 'complexObserver', {
method: sig.method,
args: sig.args,
trigger: null,
dynamicFn: dynamicFn
});
}
},
_addAnnotationEffects: function (notes) {
for (var i = 0, note; i < notes.length && (note = notes[i]); i++) {
var b$ = note.bindings;
for (var j = 0, binding; j < b$.length && (binding = b$[j]); j++) {
this._addAnnotationEffect(binding, i);
}
}
},
_addAnnotationEffect: function (note, index) {
if (Polymer.Bind._shouldAddListener(note)) {
Polymer.Bind._addAnnotatedListener(this, index, note.name, note.parts[0].value, note.parts[0].event, note.parts[0].negate);
}
for (var i = 0; i < note.parts.length; i++) {
var part = note.parts[i];
if (part.signature) {
this._addAnnotatedComputationEffect(note, part, index);
} else if (!part.literal) {
if (note.kind === 'attribute' && note.name[0] === '-') {
this._warn(this._logf('_addAnnotationEffect', 'Cannot set attribute ' + note.name + ' because "-" is not a valid attribute starting character'));
} else {
this._addPropertyEffect(part.model, 'annotation', {
kind: note.kind,
index: index,
name: note.name,
propertyName: note.propertyName,
value: part.value,
isCompound: note.isCompound,
compoundIndex: part.compoundIndex,
event: part.event,
customEvent: part.customEvent,
negate: part.negate
});
}
}
}
},
_addAnnotatedComputationEffect: function (note, part, index) {
var sig = part.signature;
if (sig.static) {
this.__addAnnotatedComputationEffect('__static__', index, note, part, null);
} else {
for (var i = 0, arg; i < sig.args.length && (arg = sig.args[i]); i++) {
if (!arg.literal) {
this.__addAnnotatedComputationEffect(arg.model, index, note, part, arg);
}
}
if (sig.dynamicFn) {
this.__addAnnotatedComputationEffect(sig.method, index, note, part, null);
}
}
},
__addAnnotatedComputationEffect: function (property, index, note, part, trigger) {
this._addPropertyEffect(property, 'annotatedComputation', {
index: index,
isCompound: note.isCompound,
compoundIndex: part.compoundIndex,
kind: note.kind,
name: note.name,
negate: part.negate,
method: part.signature.method,
args: part.signature.args,
trigger: trigger,
dynamicFn: part.signature.dynamicFn
});
},
_parseMethod: function (expression) {
var m = expression.match(/([^\s]+?)\(([\s\S]*)\)/);
if (m) {
var sig = {
method: m[1],
static: true
};
if (this.getPropertyInfo(sig.method) !== Polymer.nob) {
sig.static = false;
sig.dynamicFn = true;
}
if (m[2].trim()) {
var args = m[2].replace(/\\,/g, '&comma;').split(',');
return this._parseArgs(args, sig);
} else {
sig.args = Polymer.nar;
return sig;
}
}
},
_parseArgs: function (argList, sig) {
sig.args = argList.map(function (rawArg) {
var arg = this._parseArg(rawArg);
if (!arg.literal) {
sig.static = false;
}
return arg;
}, this);
return sig;
},
_parseArg: function (rawArg) {
var arg = rawArg.trim().replace(/&comma;/g, ',').replace(/\\(.)/g, '$1');
var a = { name: arg };
var fc = arg[0];
if (fc === '-') {
fc = arg[1];
}
if (fc >= '0' && fc <= '9') {
fc = '#';
}
switch (fc) {
case '\'':
case '"':
a.value = arg.slice(1, -1);
a.literal = true;
break;
case '#':
a.value = Number(arg);
a.literal = true;
break;
}
if (!a.literal) {
a.model = Polymer.Path.root(arg);
a.structured = Polymer.Path.isDeep(arg);
if (a.structured) {
a.wildcard = arg.slice(-2) == '.*';
if (a.wildcard) {
a.name = arg.slice(0, -2);
}
}
}
return a;
},
_marshalInstanceEffects: function () {
Polymer.Bind.prepareInstance(this);
if (this._bindListeners) {
Polymer.Bind.setupBindListeners(this);
}
},
_applyEffectValue: function (info, value) {
var node = this._nodes[info.index];
var property = info.name;
value = this._computeFinalAnnotationValue(node, property, value, info);
if (info.kind == 'attribute') {
this.serializeValueToAttribute(value, property, node);
} else {
var pinfo = node._propertyInfo && node._propertyInfo[property];
if (pinfo && pinfo.readOnly) {
return;
}
this.__setProperty(property, value, Polymer.Settings.suppressBindingNotifications, node);
}
},
_computeFinalAnnotationValue: function (node, property, value, info) {
if (info.negate) {
value = !value;
}
if (info.isCompound) {
var storage = node.__compoundStorage__[property];
storage[info.compoundIndex] = value;
value = storage.join('');
}
if (info.kind !== 'attribute') {
if (property === 'className') {
value = this._scopeElementClass(node, value);
}
if (property === 'textContent' || node.localName == 'input' && property == 'value') {
value = value == undefined ? '' : value;
}
}
return value;
},
_executeStaticEffects: function () {
if (this._propertyEffects && this._propertyEffects.__static__) {
this._effectEffects('__static__', null, this._propertyEffects.__static__);
}
}
});(function () {
var usePolyfillProto = Polymer.Settings.usePolyfillProto;
var avoidInstanceProperties = Boolean(Object.getOwnPropertyDescriptor(document.documentElement, 'properties'));
Polymer.Base._addFeature({
_setupConfigure: function (initialConfig) {
this._config = {};
this._handlers = [];
this._aboveConfig = null;
if (initialConfig) {
for (var i in initialConfig) {
if (initialConfig[i] !== undefined) {
this._config[i] = initialConfig[i];
}
}
}
},
_marshalAttributes: function () {
this._takeAttributesToModel(this._config);
},
_attributeChangedImpl: function (name) {
var model = this._clientsReadied ? this : this._config;
this._setAttributeToProperty(model, name);
},
_configValue: function (name, value) {
var info = this._propertyInfo[name];
if (!info || !info.readOnly) {
this._config[name] = value;
}
},
_beforeClientsReady: function () {
this._configure();
},
_configure: function () {
this._configureAnnotationReferences();
this._configureInstanceProperties();
this._aboveConfig = this.mixin({}, this._config);
var config = {};
for (var i = 0; i < this.behaviors.length; i++) {
this._configureProperties(this.behaviors[i].properties, config);
}
this._configureProperties(avoidInstanceProperties ? this.__proto__.properties : this.properties, config);
this.mixin(config, this._aboveConfig);
this._config = config;
if (this._clients && this._clients.length) {
this._distributeConfig(this._config);
}
},
_configureInstanceProperties: function () {
for (var i in this._propertyEffects) {
if (!usePolyfillProto && this.hasOwnProperty(i)) {
this._configValue(i, this[i]);
delete this[i];
}
}
},
_configureProperties: function (properties, config) {
for (var i in properties) {
var c = properties[i];
if (c.value !== undefined) {
var value = c.value;
if (typeof value == 'function') {
value = value.call(this, this._config);
}
config[i] = value;
}
}
},
_distributeConfig: function (config) {
var fx$ = this._propertyEffects;
if (fx$) {
for (var p in config) {
var fx = fx$[p];
if (fx) {
for (var i = 0, l = fx.length, x; i < l && (x = fx[i]); i++) {
if (x.kind === 'annotation') {
var node = this._nodes[x.effect.index];
var name = x.effect.propertyName;
var isAttr = x.effect.kind == 'attribute';
var hasEffect = node._propertyEffects && node._propertyEffects[name];
if (node._configValue && (hasEffect || !isAttr)) {
var value = p === x.effect.value ? config[p] : this._get(x.effect.value, config);
value = this._computeFinalAnnotationValue(node, name, value, x.effect);
if (isAttr) {
value = node.deserialize(this.serialize(value), node._propertyInfo[name].type);
}
node._configValue(name, value);
}
}
}
}
}
}
},
_afterClientsReady: function () {
this.importPath = this._importPath;
this.rootPath = Polymer.rootPath;
this._executeStaticEffects();
this._applyConfig(this._config, this._aboveConfig);
this._flushHandlers();
},
_applyConfig: function (config, aboveConfig) {
for (var n in config) {
if (this[n] === undefined) {
this.__setProperty(n, config[n], n in aboveConfig);
}
}
},
_notifyListener: function (fn, e) {
if (!Polymer.Bind._isEventBogus(e, e.target)) {
var value, path;
if (e.detail) {
value = e.detail.value;
path = e.detail.path;
}
if (!this._clientsReadied) {
this._queueHandler([
fn,
e.target,
value,
path
]);
} else {
return fn.call(this, e.target, value, path);
}
}
},
_queueHandler: function (args) {
this._handlers.push(args);
},
_flushHandlers: function () {
var h$ = this._handlers;
for (var i = 0, l = h$.length, h; i < l && (h = h$[i]); i++) {
h[0].call(this, h[1], h[2], h[3]);
}
this._handlers = [];
}
});
}());(function () {
'use strict';
var Path = Polymer.Path;
Polymer.Base._addFeature({
notifyPath: function (path, value, fromAbove) {
var info = {};
var v = this._get(path, this, info);
if (arguments.length === 1) {
value = v;
}
if (info.path) {
this._notifyPath(info.path, value, fromAbove);
}
},
_notifyPath: function (path, value, fromAbove) {
var old = this._propertySetter(path, value);
if (old !== value && (old === old || value === value)) {
this._pathEffector(path, value);
if (!fromAbove) {
this._notifyPathUp(path, value);
}
return true;
}
},
_getPathParts: function (path) {
if (Array.isArray(path)) {
var parts = [];
for (var i = 0; i < path.length; i++) {
var args = path[i].toString().split('.');
for (var j = 0; j < args.length; j++) {
parts.push(args[j]);
}
}
return parts;
} else {
return path.toString().split('.');
}
},
set: function (path, value, root) {
var prop = root || this;
var parts = this._getPathParts(path);
var array;
var last = parts[parts.length - 1];
if (parts.length > 1) {
for (var i = 0; i < parts.length - 1; i++) {
var part = parts[i];
if (array && part[0] == '#') {
prop = Polymer.Collection.get(array).getItem(part);
} else {
prop = prop[part];
if (array && parseInt(part, 10) == part) {
parts[i] = Polymer.Collection.get(array).getKey(prop);
}
}
if (!prop) {
return;
}
array = Array.isArray(prop) ? prop : null;
}
if (array) {
var coll = Polymer.Collection.get(array);
var old, key;
if (last[0] == '#') {
key = last;
old = coll.getItem(key);
last = array.indexOf(old);
coll.setItem(key, value);
} else if (parseInt(last, 10) == last) {
old = prop[last];
key = coll.getKey(old);
parts[i] = key;
coll.setItem(key, value);
}
}
prop[last] = value;
if (!root) {
this._notifyPath(parts.join('.'), value);
}
} else {
prop[path] = value;
}
},
get: function (path, root) {
return this._get(path, root);
},
_get: function (path, root, info) {
var prop = root || this;
var parts = this._getPathParts(path);
var array;
for (var i = 0; i < parts.length; i++) {
if (!prop) {
return;
}
var part = parts[i];
if (array && part[0] == '#') {
prop = Polymer.Collection.get(array).getItem(part);
} else {
prop = prop[part];
if (info && array && parseInt(part, 10) == part) {
parts[i] = Polymer.Collection.get(array).getKey(prop);
}
}
array = Array.isArray(prop) ? prop : null;
}
if (info) {
info.path = parts.join('.');
}
return prop;
},
_pathEffector: function (path, value) {
var model = Path.root(path);
var fx$ = this._propertyEffects && this._propertyEffects[model];
if (fx$) {
for (var i = 0, fx; i < fx$.length && (fx = fx$[i]); i++) {
var fxFn = fx.pathFn;
if (fxFn) {
fxFn.call(this, path, value, fx.effect);
}
}
}
if (this._boundPaths) {
this._notifyBoundPaths(path, value);
}
},
_annotationPathEffect: function (path, value, effect) {
if (Path.matches(effect.value, false, path)) {
Polymer.Bind._annotationEffect.call(this, path, value, effect);
} else if (!effect.negate && Path.isDescendant(effect.value, path)) {
var node = this._nodes[effect.index];
if (node && node._notifyPath) {
var newPath = Path.translate(effect.value, effect.name, path);
node._notifyPath(newPath, value, true);
}
}
},
_complexObserverPathEffect: function (path, value, effect) {
if (Path.matches(effect.trigger.name, effect.trigger.wildcard, path)) {
Polymer.Bind._complexObserverEffect.call(this, path, value, effect);
}
},
_computePathEffect: function (path, value, effect) {
if (Path.matches(effect.trigger.name, effect.trigger.wildcard, path)) {
Polymer.Bind._computeEffect.call(this, path, value, effect);
}
},
_annotatedComputationPathEffect: function (path, value, effect) {
if (Path.matches(effect.trigger.name, effect.trigger.wildcard, path)) {
Polymer.Bind._annotatedComputationEffect.call(this, path, value, effect);
}
},
linkPaths: function (to, from) {
this._boundPaths = this._boundPaths || {};
if (from) {
this._boundPaths[to] = from;
} else {
this.unlinkPaths(to);
}
},
unlinkPaths: function (path) {
if (this._boundPaths) {
delete this._boundPaths[path];
}
},
_notifyBoundPaths: function (path, value) {
for (var a in this._boundPaths) {
var b = this._boundPaths[a];
if (Path.isDescendant(a, path)) {
this._notifyPath(Path.translate(a, b, path), value);
} else if (Path.isDescendant(b, path)) {
this._notifyPath(Path.translate(b, a, path), value);
}
}
},
_notifyPathUp: function (path, value) {
var rootName = Path.root(path);
var dashCaseName = Polymer.CaseMap.camelToDashCase(rootName);
var eventName = dashCaseName + this._EVENT_CHANGED;
this.fire(eventName, {
path: path,
value: value
}, {
bubbles: false,
_useCache: Polymer.Settings.eventDataCache || !Polymer.Settings.isIE
});
},
_EVENT_CHANGED: '-changed',
notifySplices: function (path, splices) {
var info = {};
var array = this._get(path, this, info);
this._notifySplices(array, info.path, splices);
},
_notifySplices: function (array, path, splices) {
var change = {
keySplices: Polymer.Collection.applySplices(array, splices),
indexSplices: splices
};
var splicesPath = path + '.splices';
this._notifyPath(splicesPath, change);
this._notifyPath(path + '.length', array.length);
this.__data__[splicesPath] = {
keySplices: null,
indexSplices: null
};
},
_notifySplice: function (array, path, index, added, removed) {
this._notifySplices(array, path, [{
index: index,
addedCount: added,
removed: removed,
object: array,
type: 'splice'
}]);
},
push: function (path) {
var info = {};
var array = this._get(path, this, info);
var args = Array.prototype.slice.call(arguments, 1);
var len = array.length;
var ret = array.push.apply(array, args);
if (args.length) {
this._notifySplice(array, info.path, len, args.length, []);
}
return ret;
},
pop: function (path) {
var info = {};
var array = this._get(path, this, info);
var hadLength = Boolean(array.length);
var args = Array.prototype.slice.call(arguments, 1);
var ret = array.pop.apply(array, args);
if (hadLength) {
this._notifySplice(array, info.path, array.length, 0, [ret]);
}
return ret;
},
splice: function (path, start) {
var info = {};
var array = this._get(path, this, info);
if (start < 0) {
start = array.length - Math.floor(-start);
} else {
start = Math.floor(start);
}
if (!start) {
start = 0;
}
var args = Array.prototype.slice.call(arguments, 1);
var ret = array.splice.apply(array, args);
var addedCount = Math.max(args.length - 2, 0);
if (addedCount || ret.length) {
this._notifySplice(array, info.path, start, addedCount, ret);
}
return ret;
},
shift: function (path) {
var info = {};
var array = this._get(path, this, info);
var hadLength = Boolean(array.length);
var args = Array.prototype.slice.call(arguments, 1);
var ret = array.shift.apply(array, args);
if (hadLength) {
this._notifySplice(array, info.path, 0, 0, [ret]);
}
return ret;
},
unshift: function (path) {
var info = {};
var array = this._get(path, this, info);
var args = Array.prototype.slice.call(arguments, 1);
var ret = array.unshift.apply(array, args);
if (args.length) {
this._notifySplice(array, info.path, 0, args.length, []);
}
return ret;
},
prepareModelNotifyPath: function (model) {
this.mixin(model, {
fire: Polymer.Base.fire,
_getEvent: Polymer.Base._getEvent,
__eventCache: Polymer.Base.__eventCache,
notifyPath: Polymer.Base.notifyPath,
_get: Polymer.Base._get,
_EVENT_CHANGED: Polymer.Base._EVENT_CHANGED,
_notifyPath: Polymer.Base._notifyPath,
_notifyPathUp: Polymer.Base._notifyPathUp,
_pathEffector: Polymer.Base._pathEffector,
_annotationPathEffect: Polymer.Base._annotationPathEffect,
_complexObserverPathEffect: Polymer.Base._complexObserverPathEffect,
_annotatedComputationPathEffect: Polymer.Base._annotatedComputationPathEffect,
_computePathEffect: Polymer.Base._computePathEffect,
_notifyBoundPaths: Polymer.Base._notifyBoundPaths,
_getPathParts: Polymer.Base._getPathParts
});
}
});
}());Polymer.Base._addFeature({
resolveUrl: function (url) {
return Polymer.ResolveUrl.resolveUrl(url, this._importPath);
}
});Polymer.CssParse = function () {
return {
parse: function (text) {
text = this._clean(text);
return this._parseCss(this._lex(text), text);
},
_clean: function (cssText) {
return cssText.replace(this._rx.comments, '').replace(this._rx.port, '');
},
_lex: function (text) {
var root = {
start: 0,
end: text.length
};
var n = root;
for (var i = 0, l = text.length; i < l; i++) {
switch (text[i]) {
case this.OPEN_BRACE:
if (!n.rules) {
n.rules = [];
}
var p = n;
var previous = p.rules[p.rules.length - 1];
n = {
start: i + 1,
parent: p,
previous: previous
};
p.rules.push(n);
break;
case this.CLOSE_BRACE:
n.end = i + 1;
n = n.parent || root;
break;
}
}
return root;
},
_parseCss: function (node, text) {
var t = text.substring(node.start, node.end - 1);
node.parsedCssText = node.cssText = t.trim();
if (node.parent) {
var ss = node.previous ? node.previous.end : node.parent.start;
t = text.substring(ss, node.start - 1);
t = this._expandUnicodeEscapes(t);
t = t.replace(this._rx.multipleSpaces, ' ');
t = t.substring(t.lastIndexOf(';') + 1);
var s = node.parsedSelector = node.selector = t.trim();
node.atRule = s.indexOf(this.AT_START) === 0;
if (node.atRule) {
if (s.indexOf(this.MEDIA_START) === 0) {
node.type = this.types.MEDIA_RULE;
} else if (s.match(this._rx.keyframesRule)) {
node.type = this.types.KEYFRAMES_RULE;
node.keyframesName = node.selector.split(this._rx.multipleSpaces).pop();
}
} else {
if (s.indexOf(this.VAR_START) === 0) {
node.type = this.types.MIXIN_RULE;
} else {
node.type = this.types.STYLE_RULE;
}
}
}
var r$ = node.rules;
if (r$) {
for (var i = 0, l = r$.length, r; i < l && (r = r$[i]); i++) {
this._parseCss(r, text);
}
}
return node;
},
_expandUnicodeEscapes: function (s) {
return s.replace(/\\([0-9a-f]{1,6})\s/gi, function () {
var code = arguments[1], repeat = 6 - code.length;
while (repeat--) {
code = '0' + code;
}
return '\\' + code;
});
},
stringify: function (node, preserveProperties, text) {
text = text || '';
var cssText = '';
if (node.cssText || node.rules) {
var r$ = node.rules;
if (r$ && !this._hasMixinRules(r$)) {
for (var i = 0, l = r$.length, r; i < l && (r = r$[i]); i++) {
cssText = this.stringify(r, preserveProperties, cssText);
}
} else {
cssText = preserveProperties ? node.cssText : this.removeCustomProps(node.cssText);
cssText = cssText.trim();
if (cssText) {
cssText = '  ' + cssText + '\n';
}
}
}
if (cssText) {
if (node.selector) {
text += node.selector + ' ' + this.OPEN_BRACE + '\n';
}
text += cssText;
if (node.selector) {
text += this.CLOSE_BRACE + '\n\n';
}
}
return text;
},
_hasMixinRules: function (rules) {
return rules[0].selector.indexOf(this.VAR_START) === 0;
},
removeCustomProps: function (cssText) {
cssText = this.removeCustomPropAssignment(cssText);
return this.removeCustomPropApply(cssText);
},
removeCustomPropAssignment: function (cssText) {
return cssText.replace(this._rx.customProp, '').replace(this._rx.mixinProp, '');
},
removeCustomPropApply: function (cssText) {
return cssText.replace(this._rx.mixinApply, '').replace(this._rx.varApply, '');
},
types: {
STYLE_RULE: 1,
KEYFRAMES_RULE: 7,
MEDIA_RULE: 4,
MIXIN_RULE: 1000
},
OPEN_BRACE: '{',
CLOSE_BRACE: '}',
_rx: {
comments: /\/\*[^*]*\*+([^\/*][^*]*\*+)*\//gim,
port: /@import[^;]*;/gim,
customProp: /(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?(?:[;\n]|$)/gim,
mixinProp: /(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?{[^}]*?}(?:[;\n]|$)?/gim,
mixinApply: /@apply\s*\(?[^);]*\)?\s*(?:[;\n]|$)?/gim,
varApply: /[^;:]*?:[^;]*?var\([^;]*\)(?:[;\n]|$)?/gim,
keyframesRule: /^@[^\s]*keyframes/,
multipleSpaces: /\s+/g
},
VAR_START: '--',
MEDIA_START: '@media',
AT_START: '@'
};
}();Polymer.StyleUtil = function () {
var settings = Polymer.Settings;
return {
unscopedStyleImports: new WeakMap(),
SHADY_UNSCOPED_ATTR: 'shady-unscoped',
NATIVE_VARIABLES: Polymer.Settings.useNativeCSSProperties,
MODULE_STYLES_SELECTOR: 'style, link[rel=import][type~=css], template',
INCLUDE_ATTR: 'include',
toCssText: function (rules, callback) {
if (typeof rules === 'string') {
rules = this.parser.parse(rules);
}
if (callback) {
this.forEachRule(rules, callback);
}
return this.parser.stringify(rules, this.NATIVE_VARIABLES);
},
forRulesInStyles: function (styles, styleRuleCallback, keyframesRuleCallback) {
if (styles) {
for (var i = 0, l = styles.length, s; i < l && (s = styles[i]); i++) {
this.forEachRuleInStyle(s, styleRuleCallback, keyframesRuleCallback);
}
}
},
forActiveRulesInStyles: function (styles, styleRuleCallback, keyframesRuleCallback) {
if (styles) {
for (var i = 0, l = styles.length, s; i < l && (s = styles[i]); i++) {
this.forEachRuleInStyle(s, styleRuleCallback, keyframesRuleCallback, true);
}
}
},
rulesForStyle: function (style) {
if (!style.__cssRules && style.textContent) {
style.__cssRules = this.parser.parse(style.textContent);
}
return style.__cssRules;
},
isKeyframesSelector: function (rule) {
return rule.parent && rule.parent.type === this.ruleTypes.KEYFRAMES_RULE;
},
forEachRuleInStyle: function (style, styleRuleCallback, keyframesRuleCallback, onlyActiveRules) {
var rules = this.rulesForStyle(style);
var styleCallback, keyframeCallback;
if (styleRuleCallback) {
styleCallback = function (rule) {
styleRuleCallback(rule, style);
};
}
if (keyframesRuleCallback) {
keyframeCallback = function (rule) {
keyframesRuleCallback(rule, style);
};
}
this.forEachRule(rules, styleCallback, keyframeCallback, onlyActiveRules);
},
forEachRule: function (node, styleRuleCallback, keyframesRuleCallback, onlyActiveRules) {
if (!node) {
return;
}
var skipRules = false;
if (onlyActiveRules) {
if (node.type === this.ruleTypes.MEDIA_RULE) {
var matchMedia = node.selector.match(this.rx.MEDIA_MATCH);
if (matchMedia) {
if (!window.matchMedia(matchMedia[1]).matches) {
skipRules = true;
}
}
}
}
if (node.type === this.ruleTypes.STYLE_RULE) {
styleRuleCallback(node);
} else if (keyframesRuleCallback && node.type === this.ruleTypes.KEYFRAMES_RULE) {
keyframesRuleCallback(node);
} else if (node.type === this.ruleTypes.MIXIN_RULE) {
skipRules = true;
}
var r$ = node.rules;
if (r$ && !skipRules) {
for (var i = 0, l = r$.length, r; i < l && (r = r$[i]); i++) {
this.forEachRule(r, styleRuleCallback, keyframesRuleCallback, onlyActiveRules);
}
}
},
applyCss: function (cssText, moniker, target, contextNode) {
var style = this.createScopeStyle(cssText, moniker);
return this.applyStyle(style, target, contextNode);
},
applyStyle: function (style, target, contextNode) {
target = target || document.head;
var after = contextNode && contextNode.nextSibling || target.firstChild;
this.__lastHeadApplyNode = style;
return target.insertBefore(style, after);
},
createScopeStyle: function (cssText, moniker) {
var style = document.createElement('style');
if (moniker) {
style.setAttribute('scope', moniker);
}
style.textContent = cssText;
return style;
},
__lastHeadApplyNode: null,
applyStylePlaceHolder: function (moniker) {
var placeHolder = document.createComment(' Shady DOM styles for ' + moniker + ' ');
var after = this.__lastHeadApplyNode ? this.__lastHeadApplyNode.nextSibling : null;
var scope = document.head;
scope.insertBefore(placeHolder, after || scope.firstChild);
this.__lastHeadApplyNode = placeHolder;
return placeHolder;
},
cssFromModules: function (moduleIds, warnIfNotFound) {
var modules = moduleIds.trim().split(/\s+/);
var cssText = '';
for (var i = 0; i < modules.length; i++) {
cssText += this.cssFromModule(modules[i], warnIfNotFound);
}
return cssText;
},
cssFromModule: function (moduleId, warnIfNotFound) {
var m = Polymer.DomModule.import(moduleId);
if (m && !m._cssText) {
m._cssText = this.cssFromElement(m);
}
if (!m && warnIfNotFound) {
console.warn('Could not find style data in module named', moduleId);
}
return m && m._cssText || '';
},
cssFromElement: function (element) {
var cssText = '';
var content = element.content || element;
var e$ = Polymer.TreeApi.arrayCopy(content.querySelectorAll(this.MODULE_STYLES_SELECTOR));
for (var i = 0, e; i < e$.length; i++) {
e = e$[i];
if (e.localName === 'template') {
if (!e.hasAttribute('preserve-content')) {
cssText += this.cssFromElement(e);
}
} else {
if (e.localName === 'style') {
var include = e.getAttribute(this.INCLUDE_ATTR);
if (include) {
cssText += this.cssFromModules(include, true);
}
e = e.__appliedElement || e;
e.parentNode.removeChild(e);
var css = this.resolveCss(e.textContent, element.ownerDocument);
if (!settings.useNativeShadow && e.hasAttribute(this.SHADY_UNSCOPED_ATTR)) {
e.textContent = css;
document.head.insertBefore(e, document.head.firstChild);
} else {
cssText += css;
}
} else if (e.import && e.import.body) {
var importCss = this.resolveCss(e.import.body.textContent, e.import);
if (!settings.useNativeShadow && e.hasAttribute(this.SHADY_UNSCOPED_ATTR)) {
if (!this.unscopedStyleImports.has(e.import)) {
this.unscopedStyleImports.set(e.import, true);
var importStyle = document.createElement('style');
importStyle.setAttribute(this.SHADY_UNSCOPED_ATTR, '');
importStyle.textContent = importCss;
document.head.insertBefore(importStyle, document.head.firstChild);
}
} else {
cssText += importCss;
}
}
}
}
return cssText;
},
styleIncludesToTemplate: function (targetTemplate) {
var styles = targetTemplate.content.querySelectorAll('style[include]');
for (var i = 0, s; i < styles.length; i++) {
s = styles[i];
s.parentNode.insertBefore(this._includesToFragment(s.getAttribute('include')), s);
}
},
_includesToFragment: function (styleIncludes) {
var includeArray = styleIncludes.trim().split(' ');
var frag = document.createDocumentFragment();
for (var i = 0; i < includeArray.length; i++) {
var t = Polymer.DomModule.import(includeArray[i], 'template');
if (t) {
this._addStylesToFragment(frag, t.content);
}
}
return frag;
},
_addStylesToFragment: function (frag, source) {
var s$ = source.querySelectorAll('style');
for (var i = 0, s; i < s$.length; i++) {
s = s$[i];
var include = s.getAttribute('include');
if (include) {
frag.appendChild(this._includesToFragment(include));
}
if (s.textContent) {
frag.appendChild(s.cloneNode(true));
}
}
},
isTargetedBuild: function (buildType) {
return settings.useNativeShadow ? buildType === 'shadow' : buildType === 'shady';
},
cssBuildTypeForModule: function (module) {
var dm = Polymer.DomModule.import(module);
if (dm) {
return this.getCssBuildType(dm);
}
},
getCssBuildType: function (element) {
return element.getAttribute('css-build');
},
_findMatchingParen: function (text, start) {
var level = 0;
for (var i = start, l = text.length; i < l; i++) {
switch (text[i]) {
case '(':
level++;
break;
case ')':
if (--level === 0) {
return i;
}
break;
}
}
return -1;
},
processVariableAndFallback: function (str, callback) {
var start = str.indexOf('var(');
if (start === -1) {
return callback(str, '', '', '');
}
var end = this._findMatchingParen(str, start + 3);
var inner = str.substring(start + 4, end);
var prefix = str.substring(0, start);
var suffix = this.processVariableAndFallback(str.substring(end + 1), callback);
var comma = inner.indexOf(',');
if (comma === -1) {
return callback(prefix, inner.trim(), '', suffix);
}
var value = inner.substring(0, comma).trim();
var fallback = inner.substring(comma + 1).trim();
return callback(prefix, value, fallback, suffix);
},
rx: {
VAR_ASSIGN: /(?:^|[;\s{]\s*)(--[\w-]*?)\s*:\s*(?:([^;{]*)|{([^}]*)})(?:(?=[;\s}])|$)/gi,
MIXIN_MATCH: /(?:^|\W+)@apply\s*\(?([^);\n]*)\)?/gi,
VAR_CONSUMED: /(--[\w-]+)\s*([:,;)]|$)/gi,
ANIMATION_MATCH: /(animation\s*:)|(animation-name\s*:)/,
MEDIA_MATCH: /@media[^(]*(\([^)]*\))/,
IS_VAR: /^--/,
BRACKETED: /\{[^}]*\}/g,
HOST_PREFIX: '(?:^|[^.#[:])',
HOST_SUFFIX: '($|[.:[\\s>+~])'
},
resolveCss: Polymer.ResolveUrl.resolveCss,
parser: Polymer.CssParse,
ruleTypes: Polymer.CssParse.types
};
}();Polymer.StyleTransformer = function () {
var styleUtil = Polymer.StyleUtil;
var settings = Polymer.Settings;
var api = {
dom: function (node, scope, useAttr, shouldRemoveScope) {
this._transformDom(node, scope || '', useAttr, shouldRemoveScope);
},
_transformDom: function (node, selector, useAttr, shouldRemoveScope) {
if (node.setAttribute) {
this.element(node, selector, useAttr, shouldRemoveScope);
}
var c$ = Polymer.dom(node).childNodes;
for (var i = 0; i < c$.length; i++) {
this._transformDom(c$[i], selector, useAttr, shouldRemoveScope);
}
},
element: function (element, scope, useAttr, shouldRemoveScope) {
if (useAttr) {
if (shouldRemoveScope) {
element.removeAttribute(SCOPE_NAME);
} else {
element.setAttribute(SCOPE_NAME, scope);
}
} else {
if (scope) {
if (element.classList) {
if (shouldRemoveScope) {
element.classList.remove(SCOPE_NAME);
element.classList.remove(scope);
} else {
element.classList.add(SCOPE_NAME);
element.classList.add(scope);
}
} else if (element.getAttribute) {
var c = element.getAttribute(CLASS);
if (shouldRemoveScope) {
if (c) {
element.setAttribute(CLASS, c.replace(SCOPE_NAME, '').replace(scope, ''));
}
} else {
element.setAttribute(CLASS, (c ? c + ' ' : '') + SCOPE_NAME + ' ' + scope);
}
}
}
}
},
elementStyles: function (element, callback) {
var styles = element._styles;
var cssText = '';
var cssBuildType = element.__cssBuild;
var passthrough = settings.useNativeShadow || cssBuildType === 'shady';
var cb;
if (passthrough) {
var self = this;
cb = function (rule) {
rule.selector = self._slottedToContent(rule.selector);
rule.selector = rule.selector.replace(ROOT, ':host > *');
rule.selector = self._dirShadowTransform(rule.selector);
if (callback) {
callback(rule);
}
};
}
for (var i = 0, l = styles.length, s; i < l && (s = styles[i]); i++) {
var rules = styleUtil.rulesForStyle(s);
cssText += passthrough ? styleUtil.toCssText(rules, cb) : this.css(rules, element.is, element.extends, callback, element._scopeCssViaAttr) + '\n\n';
}
return cssText.trim();
},
css: function (rules, scope, ext, callback, useAttr) {
var hostScope = this._calcHostScope(scope, ext);
scope = this._calcElementScope(scope, useAttr);
var self = this;
return styleUtil.toCssText(rules, function (rule) {
if (!rule.isScoped) {
self.rule(rule, scope, hostScope);
rule.isScoped = true;
}
if (callback) {
callback(rule, scope, hostScope);
}
});
},
_calcElementScope: function (scope, useAttr) {
if (scope) {
return useAttr ? CSS_ATTR_PREFIX + scope + CSS_ATTR_SUFFIX : CSS_CLASS_PREFIX + scope;
} else {
return '';
}
},
_calcHostScope: function (scope, ext) {
return ext ? '[is=' + scope + ']' : scope;
},
rule: function (rule, scope, hostScope) {
this._transformRule(rule, this._transformComplexSelector, scope, hostScope);
},
_transformRule: function (rule, transformer, scope, hostScope) {
rule.selector = rule.transformedSelector = this._transformRuleCss(rule, transformer, scope, hostScope);
},
_splitSelectorList: function (selector) {
var parts = [];
var part = '';
for (var i = 0; i >= 0 && i < selector.length; i++) {
if (selector[i] === '(') {
var end = styleUtil._findMatchingParen(selector, i);
part += selector.slice(i, end + 1);
i = end;
} else if (selector[i] === COMPLEX_SELECTOR_SEP) {
parts.push(part);
part = '';
} else {
part += selector[i];
}
}
if (part) {
parts.push(part);
}
if (parts.length === 0) {
parts.push(selector);
}
return parts;
},
_transformRuleCss: function (rule, transformer, scope, hostScope) {
var p$ = this._splitSelectorList(rule.selector);
if (!styleUtil.isKeyframesSelector(rule)) {
for (var i = 0, l = p$.length, p; i < l && (p = p$[i]); i++) {
p$[i] = transformer.call(this, p, scope, hostScope);
}
}
return p$.join(COMPLEX_SELECTOR_SEP);
},
_ensureScopedDir: function (s) {
var m = s.match(DIR_PAREN);
if (m && m[1] === '' && m[0].length === s.length) {
s = '*' + s;
}
return s;
},
_additionalDirSelectors: function (dir, after, prefix) {
if (!dir || !after) {
return '';
}
prefix = prefix || '';
return COMPLEX_SELECTOR_SEP + prefix + ' ' + dir + ' ' + after;
},
_transformComplexSelector: function (selector, scope, hostScope) {
var stop = false;
var hostContext = false;
var dir = false;
var self = this;
selector = selector.trim();
selector = this._slottedToContent(selector);
selector = selector.replace(ROOT, ':host > *');
selector = selector.replace(CONTENT_START, HOST + ' $1');
selector = this._ensureScopedDir(selector);
selector = selector.replace(SIMPLE_SELECTOR_SEP, function (m, c, s) {
if (!stop) {
var info = self._transformCompoundSelector(s, c, scope, hostScope);
stop = stop || info.stop;
hostContext = hostContext || info.hostContext;
dir = dir || info.dir;
c = info.combinator;
s = info.value;
} else {
s = s.replace(SCOPE_JUMP, ' ');
}
return c + s;
});
if (hostContext) {
selector = selector.replace(HOST_CONTEXT_PAREN, function (m, pre, paren, post) {
var replacement = pre + paren + ' ' + hostScope + post + COMPLEX_SELECTOR_SEP + ' ' + pre + hostScope + paren + post;
if (dir) {
replacement += self._additionalDirSelectors(paren, post, hostScope);
}
return replacement;
});
}
return selector;
},
_transformDir: function (s) {
s = s.replace(HOST_DIR, HOST_DIR_REPLACE);
s = s.replace(DIR_PAREN, DIR_REPLACE);
return s;
},
_transformCompoundSelector: function (selector, combinator, scope, hostScope) {
var jumpIndex = selector.search(SCOPE_JUMP);
var hostContext = false;
var dir = false;
if (selector.match(DIR_PAREN)) {
selector = this._transformDir(selector);
dir = true;
}
if (selector.indexOf(HOST_CONTEXT) >= 0) {
hostContext = true;
} else if (selector.indexOf(HOST) >= 0) {
selector = this._transformHostSelector(selector, hostScope);
} else if (jumpIndex !== 0) {
selector = scope ? this._transformSimpleSelector(selector, scope) : selector;
}
if (selector.indexOf(CONTENT) >= 0) {
combinator = '';
}
var stop;
if (jumpIndex >= 0) {
selector = selector.replace(SCOPE_JUMP, ' ');
stop = true;
}
return {
value: selector,
combinator: combinator,
stop: stop,
hostContext: hostContext,
dir: dir
};
},
_transformSimpleSelector: function (selector, scope) {
var p$ = selector.split(PSEUDO_PREFIX);
p$[0] += scope;
return p$.join(PSEUDO_PREFIX);
},
_transformHostSelector: function (selector, hostScope) {
var m = selector.match(HOST_PAREN);
var paren = m && m[2].trim() || '';
if (paren) {
if (!paren[0].match(SIMPLE_SELECTOR_PREFIX)) {
var typeSelector = paren.split(SIMPLE_SELECTOR_PREFIX)[0];
if (typeSelector === hostScope) {
return paren;
} else {
return SELECTOR_NO_MATCH;
}
} else {
return selector.replace(HOST_PAREN, function (m, host, paren) {
return hostScope + paren;
});
}
} else {
return selector.replace(HOST, hostScope);
}
},
documentRule: function (rule) {
rule.selector = rule.parsedSelector;
this.normalizeRootSelector(rule);
if (!settings.useNativeShadow) {
this._transformRule(rule, this._transformDocumentSelector);
}
},
normalizeRootSelector: function (rule) {
rule.selector = rule.selector.replace(ROOT, 'html');
var parts = this._splitSelectorList(rule.selector);
parts = parts.filter(function (part) {
return !part.match(HOST_OR_HOST_GT_STAR);
});
rule.selector = parts.join(COMPLEX_SELECTOR_SEP);
},
_transformDocumentSelector: function (selector) {
return this._transformComplexSelector(selector, SCOPE_DOC_SELECTOR);
},
_slottedToContent: function (cssText) {
return cssText.replace(SLOTTED_PAREN, CONTENT + '> $1');
},
_dirShadowTransform: function (selector) {
if (!selector.match(/:dir\(/)) {
return selector;
}
return this._splitSelectorList(selector).map(function (s) {
s = this._ensureScopedDir(s);
s = this._transformDir(s);
var m = HOST_CONTEXT_PAREN.exec(s);
if (m) {
s += this._additionalDirSelectors(m[2], m[3], '');
}
return s;
}, this).join(COMPLEX_SELECTOR_SEP);
},
SCOPE_NAME: 'style-scope'
};
var SCOPE_NAME = api.SCOPE_NAME;
var SCOPE_DOC_SELECTOR = ':not([' + SCOPE_NAME + '])' + ':not(.' + SCOPE_NAME + ')';
var COMPLEX_SELECTOR_SEP = ',';
var SIMPLE_SELECTOR_SEP = /(^|[\s>+~]+)((?:\[.+?\]|[^\s>+~=\[])+)/g;
var SIMPLE_SELECTOR_PREFIX = /[[.:#*]/;
var HOST = ':host';
var ROOT = ':root';
var HOST_PAREN = /(:host)(?:\(((?:\([^)(]*\)|[^)(]*)+?)\))/;
var HOST_CONTEXT = ':host-context';
var HOST_CONTEXT_PAREN = /(.*)(?::host-context)(?:\(((?:\([^)(]*\)|[^)(]*)+?)\))(.*)/;
var CONTENT = '::content';
var SCOPE_JUMP = /::content|::shadow|\/deep\//;
var CSS_CLASS_PREFIX = '.';
var CSS_ATTR_PREFIX = '[' + SCOPE_NAME + '~=';
var CSS_ATTR_SUFFIX = ']';
var PSEUDO_PREFIX = ':';
var CLASS = 'class';
var CONTENT_START = new RegExp('^(' + CONTENT + ')');
var SELECTOR_NO_MATCH = 'should_not_match';
var SLOTTED_PAREN = /(?:::slotted)(?:\(((?:\([^)(]*\)|[^)(]*)+?)\))/g;
var HOST_OR_HOST_GT_STAR = /:host(?:\s*>\s*\*)?/;
var DIR_PAREN = /(.*):dir\((ltr|rtl)\)/;
var DIR_REPLACE = ':host-context([dir="$2"]) $1';
var HOST_DIR = /:host\(:dir\((rtl|ltr)\)\)/g;
var HOST_DIR_REPLACE = ':host-context([dir="$1"])';
return api;
}();Polymer.StyleExtends = function () {
var styleUtil = Polymer.StyleUtil;
return {
hasExtends: function (cssText) {
return Boolean(cssText.match(this.rx.EXTEND));
},
transform: function (style) {
var rules = styleUtil.rulesForStyle(style);
var self = this;
styleUtil.forEachRule(rules, function (rule) {
self._mapRuleOntoParent(rule);
if (rule.parent) {
var m;
while (m = self.rx.EXTEND.exec(rule.cssText)) {
var extend = m[1];
var extendor = self._findExtendor(extend, rule);
if (extendor) {
self._extendRule(rule, extendor);
}
}
}
rule.cssText = rule.cssText.replace(self.rx.EXTEND, '');
});
return styleUtil.toCssText(rules, function (rule) {
if (rule.selector.match(self.rx.STRIP)) {
rule.cssText = '';
}
}, true);
},
_mapRuleOntoParent: function (rule) {
if (rule.parent) {
var map = rule.parent.map || (rule.parent.map = {});
var parts = rule.selector.split(',');
for (var i = 0, p; i < parts.length; i++) {
p = parts[i];
map[p.trim()] = rule;
}
return map;
}
},
_findExtendor: function (extend, rule) {
return rule.parent && rule.parent.map && rule.parent.map[extend] || this._findExtendor(extend, rule.parent);
},
_extendRule: function (target, source) {
if (target.parent !== source.parent) {
this._cloneAndAddRuleToParent(source, target.parent);
}
target.extends = target.extends || [];
target.extends.push(source);
source.selector = source.selector.replace(this.rx.STRIP, '');
source.selector = (source.selector && source.selector + ',\n') + target.selector;
if (source.extends) {
source.extends.forEach(function (e) {
this._extendRule(target, e);
}, this);
}
},
_cloneAndAddRuleToParent: function (rule, parent) {
rule = Object.create(rule);
rule.parent = parent;
if (rule.extends) {
rule.extends = rule.extends.slice();
}
parent.rules.push(rule);
},
rx: {
EXTEND: /@extends\(([^)]*)\)\s*?;/gim,
STRIP: /%[^,]*$/
}
};
}();Polymer.ApplyShim = function () {
'use strict';
var styleUtil = Polymer.StyleUtil;
var MIXIN_MATCH = styleUtil.rx.MIXIN_MATCH;
var VAR_ASSIGN = styleUtil.rx.VAR_ASSIGN;
var BAD_VAR = /var\(\s*(--[^,]*),\s*(--[^)]*)\)/g;
var APPLY_NAME_CLEAN = /;\s*/m;
var INITIAL_INHERIT = /^\s*(initial)|(inherit)\s*$/;
var MIXIN_VAR_SEP = '_-_';
var mixinMap = {};
function mapSet(name, props) {
name = name.trim();
mixinMap[name] = {
properties: props,
dependants: {}
};
}
function mapGet(name) {
name = name.trim();
return mixinMap[name];
}
function replaceInitialOrInherit(property, value) {
var match = INITIAL_INHERIT.exec(value);
if (match) {
if (match[1]) {
value = ApplyShim._getInitialValueForProperty(property);
} else {
value = 'apply-shim-inherit';
}
}
return value;
}
function cssTextToMap(text) {
var props = text.split(';');
var property, value;
var out = {};
for (var i = 0, p, sp; i < props.length; i++) {
p = props[i];
if (p) {
sp = p.split(':');
if (sp.length > 1) {
property = sp[0].trim();
value = replaceInitialOrInherit(property, sp.slice(1).join(':'));
out[property] = value;
}
}
}
return out;
}
function invalidateMixinEntry(mixinEntry) {
var currentProto = ApplyShim.__currentElementProto;
var currentElementName = currentProto && currentProto.is;
for (var elementName in mixinEntry.dependants) {
if (elementName !== currentElementName) {
mixinEntry.dependants[elementName].__applyShimInvalid = true;
}
}
}
function produceCssProperties(matchText, propertyName, valueProperty, valueMixin) {
if (valueProperty) {
styleUtil.processVariableAndFallback(valueProperty, function (prefix, value) {
if (value && mapGet(value)) {
valueMixin = '@apply ' + value + ';';
}
});
}
if (!valueMixin) {
return matchText;
}
var mixinAsProperties = consumeCssProperties(valueMixin);
var prefix = matchText.slice(0, matchText.indexOf('--'));
var mixinValues = cssTextToMap(mixinAsProperties);
var combinedProps = mixinValues;
var mixinEntry = mapGet(propertyName);
var oldProps = mixinEntry && mixinEntry.properties;
if (oldProps) {
combinedProps = Object.create(oldProps);
combinedProps = Polymer.Base.mixin(combinedProps, mixinValues);
} else {
mapSet(propertyName, combinedProps);
}
var out = [];
var p, v;
var needToInvalidate = false;
for (p in combinedProps) {
v = mixinValues[p];
if (v === undefined) {
v = 'initial';
}
if (oldProps && !(p in oldProps)) {
needToInvalidate = true;
}
out.push(propertyName + MIXIN_VAR_SEP + p + ': ' + v);
}
if (needToInvalidate) {
invalidateMixinEntry(mixinEntry);
}
if (mixinEntry) {
mixinEntry.properties = combinedProps;
}
if (valueProperty) {
prefix = matchText + ';' + prefix;
}
return prefix + out.join('; ') + ';';
}
function fixVars(matchText, varA, varB) {
return 'var(' + varA + ',' + 'var(' + varB + '))';
}
function atApplyToCssProperties(mixinName, fallbacks) {
mixinName = mixinName.replace(APPLY_NAME_CLEAN, '');
var vars = [];
var mixinEntry = mapGet(mixinName);
if (!mixinEntry) {
mapSet(mixinName, {});
mixinEntry = mapGet(mixinName);
}
if (mixinEntry) {
var currentProto = ApplyShim.__currentElementProto;
if (currentProto) {
mixinEntry.dependants[currentProto.is] = currentProto;
}
var p, parts, f;
for (p in mixinEntry.properties) {
f = fallbacks && fallbacks[p];
parts = [
p,
': var(',
mixinName,
MIXIN_VAR_SEP,
p
];
if (f) {
parts.push(',', f);
}
parts.push(')');
vars.push(parts.join(''));
}
}
return vars.join('; ');
}
function consumeCssProperties(text) {
var m;
while (m = MIXIN_MATCH.exec(text)) {
var matchText = m[0];
var mixinName = m[1];
var idx = m.index;
var applyPos = idx + matchText.indexOf('@apply');
var afterApplyPos = idx + matchText.length;
var textBeforeApply = text.slice(0, applyPos);
var textAfterApply = text.slice(afterApplyPos);
var defaults = cssTextToMap(textBeforeApply);
var replacement = atApplyToCssProperties(mixinName, defaults);
text = [
textBeforeApply,
replacement,
textAfterApply
].join('');
MIXIN_MATCH.lastIndex = idx + replacement.length;
}
return text;
}
var ApplyShim = {
_measureElement: null,
_map: mixinMap,
_separator: MIXIN_VAR_SEP,
transform: function (styles, elementProto) {
this.__currentElementProto = elementProto;
styleUtil.forRulesInStyles(styles, this._boundFindDefinitions);
styleUtil.forRulesInStyles(styles, this._boundFindApplications);
if (elementProto) {
elementProto.__applyShimInvalid = false;
}
this.__currentElementProto = null;
},
_findDefinitions: function (rule) {
var cssText = rule.parsedCssText;
cssText = cssText.replace(BAD_VAR, fixVars);
cssText = cssText.replace(VAR_ASSIGN, produceCssProperties);
rule.cssText = cssText;
if (rule.selector === ':root') {
rule.selector = ':host > *';
}
},
_findApplications: function (rule) {
rule.cssText = consumeCssProperties(rule.cssText);
},
transformRule: function (rule) {
this._findDefinitions(rule);
this._findApplications(rule);
},
_getInitialValueForProperty: function (property) {
if (!this._measureElement) {
this._measureElement = document.createElement('meta');
this._measureElement.style.all = 'initial';
document.head.appendChild(this._measureElement);
}
return window.getComputedStyle(this._measureElement).getPropertyValue(property);
}
};
ApplyShim._boundTransformRule = ApplyShim.transformRule.bind(ApplyShim);
ApplyShim._boundFindDefinitions = ApplyShim._findDefinitions.bind(ApplyShim);
ApplyShim._boundFindApplications = ApplyShim._findApplications.bind(ApplyShim);
return ApplyShim;
}();(function () {
var prepElement = Polymer.Base._prepElement;
var nativeShadow = Polymer.Settings.useNativeShadow;
var styleUtil = Polymer.StyleUtil;
var styleTransformer = Polymer.StyleTransformer;
var styleExtends = Polymer.StyleExtends;
var applyShim = Polymer.ApplyShim;
var settings = Polymer.Settings;
Polymer.Base._addFeature({
_prepElement: function (element) {
if (this._encapsulateStyle && this.__cssBuild !== 'shady') {
styleTransformer.element(element, this.is, this._scopeCssViaAttr);
}
prepElement.call(this, element);
},
_prepStyles: function () {
if (this._encapsulateStyle === undefined) {
this._encapsulateStyle = !nativeShadow;
}
if (!nativeShadow) {
this._scopeStyle = styleUtil.applyStylePlaceHolder(this.is);
}
this.__cssBuild = styleUtil.cssBuildTypeForModule(this.is);
},
_prepShimStyles: function () {
if (this._template) {
var hasTargetedCssBuild = styleUtil.isTargetedBuild(this.__cssBuild);
if (settings.useNativeCSSProperties && this.__cssBuild === 'shadow' && hasTargetedCssBuild) {
if (settings.preserveStyleIncludes) {
styleUtil.styleIncludesToTemplate(this._template);
}
return;
}
this._styles = this._styles || this._collectStyles();
if (settings.useNativeCSSProperties && !this.__cssBuild) {
applyShim.transform(this._styles, this);
}
var cssText = settings.useNativeCSSProperties && hasTargetedCssBuild ? this._styles.length && this._styles[0].textContent.trim() : styleTransformer.elementStyles(this);
this._prepStyleProperties();
if (!this._needsStyleProperties() && cssText) {
styleUtil.applyCss(cssText, this.is, nativeShadow ? this._template.content : null, this._scopeStyle);
}
} else {
this._styles = [];
}
},
_collectStyles: function () {
var styles = [];
var cssText = '', m$ = this.styleModules;
if (m$) {
for (var i = 0, l = m$.length, m; i < l && (m = m$[i]); i++) {
cssText += styleUtil.cssFromModule(m);
}
}
cssText += styleUtil.cssFromModule(this.is);
var p = this._template && this._template.parentNode;
if (this._template && (!p || p.id.toLowerCase() !== this.is)) {
cssText += styleUtil.cssFromElement(this._template);
}
if (cssText) {
var style = document.createElement('style');
style.textContent = cssText;
if (styleExtends.hasExtends(style.textContent)) {
cssText = styleExtends.transform(style);
}
styles.push(style);
}
return styles;
},
_elementAdd: function (node) {
if (this._encapsulateStyle) {
if (node.__styleScoped) {
node.__styleScoped = false;
} else {
styleTransformer.dom(node, this.is, this._scopeCssViaAttr);
}
}
},
_elementRemove: function (node) {
if (this._encapsulateStyle) {
styleTransformer.dom(node, this.is, this._scopeCssViaAttr, true);
}
},
scopeSubtree: function (container, shouldObserve) {
if (nativeShadow) {
return;
}
var self = this;
var scopify = function (node) {
if (node.nodeType === Node.ELEMENT_NODE) {
var className = node.getAttribute('class');
node.setAttribute('class', self._scopeElementClass(node, className));
var n$ = node.querySelectorAll('*');
for (var i = 0, n; i < n$.length && (n = n$[i]); i++) {
className = n.getAttribute('class');
n.setAttribute('class', self._scopeElementClass(n, className));
}
}
};
scopify(container);
if (shouldObserve) {
var mo = new MutationObserver(function (mxns) {
for (var i = 0, m; i < mxns.length && (m = mxns[i]); i++) {
if (m.addedNodes) {
for (var j = 0; j < m.addedNodes.length; j++) {
scopify(m.addedNodes[j]);
}
}
}
});
mo.observe(container, {
childList: true,
subtree: true
});
return mo;
}
}
});
}());Polymer.StyleProperties = function () {
'use strict';
var matchesSelector = Polymer.DomApi.matchesSelector;
var styleUtil = Polymer.StyleUtil;
var styleTransformer = Polymer.StyleTransformer;
var IS_IE = navigator.userAgent.match('Trident');
var settings = Polymer.Settings;
return {
decorateStyles: function (styles, scope) {
var self = this, props = {}, keyframes = [], ruleIndex = 0;
var scopeSelector = styleTransformer._calcHostScope(scope.is, scope.extends);
styleUtil.forRulesInStyles(styles, function (rule, style) {
self.decorateRule(rule);
rule.index = ruleIndex++;
self.whenHostOrRootRule(scope, rule, style, function (info) {
if (rule.parent.type === styleUtil.ruleTypes.MEDIA_RULE) {
scope.__notStyleScopeCacheable = true;
}
if (info.isHost) {
var hostContextOrFunction = info.selector.split(' ').some(function (s) {
return s.indexOf(scopeSelector) === 0 && s.length !== scopeSelector.length;
});
scope.__notStyleScopeCacheable = scope.__notStyleScopeCacheable || hostContextOrFunction;
}
});
self.collectPropertiesInCssText(rule.propertyInfo.cssText, props);
}, function onKeyframesRule(rule) {
keyframes.push(rule);
});
styles._keyframes = keyframes;
var names = [];
for (var i in props) {
names.push(i);
}
return names;
},
decorateRule: function (rule) {
if (rule.propertyInfo) {
return rule.propertyInfo;
}
var info = {}, properties = {};
var hasProperties = this.collectProperties(rule, properties);
if (hasProperties) {
info.properties = properties;
rule.rules = null;
}
info.cssText = this.collectCssText(rule);
rule.propertyInfo = info;
return info;
},
collectProperties: function (rule, properties) {
var info = rule.propertyInfo;
if (info) {
if (info.properties) {
Polymer.Base.mixin(properties, info.properties);
return true;
}
} else {
var m, rx = this.rx.VAR_ASSIGN;
var cssText = rule.parsedCssText;
var value;
var any;
while (m = rx.exec(cssText)) {
value = (m[2] || m[3]).trim();
if (value !== 'inherit') {
properties[m[1].trim()] = value;
}
any = true;
}
return any;
}
},
collectCssText: function (rule) {
return this.collectConsumingCssText(rule.parsedCssText);
},
collectConsumingCssText: function (cssText) {
return cssText.replace(this.rx.BRACKETED, '').replace(this.rx.VAR_ASSIGN, '');
},
collectPropertiesInCssText: function (cssText, props) {
var m;
while (m = this.rx.VAR_CONSUMED.exec(cssText)) {
var name = m[1];
if (m[2] !== ':') {
props[name] = true;
}
}
},
reify: function (props) {
var names = Object.getOwnPropertyNames(props);
for (var i = 0, n; i < names.length; i++) {
n = names[i];
props[n] = this.valueForProperty(props[n], props);
}
},
valueForProperty: function (property, props) {
if (property) {
if (property.indexOf(';') >= 0) {
property = this.valueForProperties(property, props);
} else {
var self = this;
var fn = function (prefix, value, fallback, suffix) {
var propertyValue = self.valueForProperty(props[value], props);
if (!propertyValue || propertyValue === 'initial') {
propertyValue = self.valueForProperty(props[fallback] || fallback, props) || fallback;
} else if (propertyValue === 'apply-shim-inherit') {
propertyValue = 'inherit';
}
return prefix + (propertyValue || '') + suffix;
};
property = styleUtil.processVariableAndFallback(property, fn);
}
}
return property && property.trim() || '';
},
valueForProperties: function (property, props) {
var parts = property.split(';');
for (var i = 0, p, m; i < parts.length; i++) {
if (p = parts[i]) {
this.rx.MIXIN_MATCH.lastIndex = 0;
m = this.rx.MIXIN_MATCH.exec(p);
if (m) {
p = this.valueForProperty(props[m[1]], props);
} else {
var colon = p.indexOf(':');
if (colon !== -1) {
var pp = p.substring(colon);
pp = pp.trim();
pp = this.valueForProperty(pp, props) || pp;
p = p.substring(0, colon) + pp;
}
}
parts[i] = p && p.lastIndexOf(';') === p.length - 1 ? p.slice(0, -1) : p || '';
}
}
return parts.join(';');
},
applyProperties: function (rule, props) {
var output = '';
if (!rule.propertyInfo) {
this.decorateRule(rule);
}
if (rule.propertyInfo.cssText) {
output = this.valueForProperties(rule.propertyInfo.cssText, props);
}
rule.cssText = output;
},
applyKeyframeTransforms: function (rule, keyframeTransforms) {
var input = rule.cssText;
var output = rule.cssText;
if (rule.hasAnimations == null) {
rule.hasAnimations = this.rx.ANIMATION_MATCH.test(input);
}
if (rule.hasAnimations) {
var transform;
if (rule.keyframeNamesToTransform == null) {
rule.keyframeNamesToTransform = [];
for (var keyframe in keyframeTransforms) {
transform = keyframeTransforms[keyframe];
output = transform(input);
if (input !== output) {
input = output;
rule.keyframeNamesToTransform.push(keyframe);
}
}
} else {
for (var i = 0; i < rule.keyframeNamesToTransform.length; ++i) {
transform = keyframeTransforms[rule.keyframeNamesToTransform[i]];
input = transform(input);
}
output = input;
}
}
rule.cssText = output;
},
propertyDataFromStyles: function (styles, element) {
var props = {}, self = this;
var o = [];
styleUtil.forActiveRulesInStyles(styles, function (rule) {
if (!rule.propertyInfo) {
self.decorateRule(rule);
}
var selectorToMatch = rule.transformedSelector || rule.parsedSelector;
if (element && rule.propertyInfo.properties && selectorToMatch) {
if (matchesSelector.call(element, selectorToMatch)) {
self.collectProperties(rule, props);
addToBitMask(rule.index, o);
}
}
});
return {
properties: props,
key: o
};
},
_rootSelector: /:root|:host\s*>\s*\*/,
_checkRoot: function (hostScope, selector) {
return Boolean(selector.match(this._rootSelector)) || hostScope === 'html' && selector.indexOf('html') > -1;
},
whenHostOrRootRule: function (scope, rule, style, callback) {
if (!rule.propertyInfo) {
self.decorateRule(rule);
}
if (!rule.propertyInfo.properties) {
return;
}
var hostScope = scope.is ? styleTransformer._calcHostScope(scope.is, scope.extends) : 'html';
var parsedSelector = rule.parsedSelector;
var isRoot = this._checkRoot(hostScope, parsedSelector);
var isHost = !isRoot && parsedSelector.indexOf(':host') === 0;
var cssBuild = scope.__cssBuild || style.__cssBuild;
if (cssBuild === 'shady') {
isRoot = parsedSelector === hostScope + ' > *.' + hostScope || parsedSelector.indexOf('html') > -1;
isHost = !isRoot && parsedSelector.indexOf(hostScope) === 0;
}
if (!isRoot && !isHost) {
return;
}
var selectorToMatch = hostScope;
if (isHost) {
if (settings.useNativeShadow && !rule.transformedSelector) {
rule.transformedSelector = styleTransformer._transformRuleCss(rule, styleTransformer._transformComplexSelector, scope.is, hostScope);
}
selectorToMatch = rule.transformedSelector || rule.parsedSelector;
}
if (isRoot && hostScope === 'html') {
selectorToMatch = rule.transformedSelector || rule.parsedSelector;
}
callback({
selector: selectorToMatch,
isHost: isHost,
isRoot: isRoot
});
},
hostAndRootPropertiesForScope: function (scope) {
var hostProps = {}, rootProps = {}, self = this;
styleUtil.forActiveRulesInStyles(scope._styles, function (rule, style) {
self.whenHostOrRootRule(scope, rule, style, function (info) {
var element = scope._element || scope;
if (matchesSelector.call(element, info.selector)) {
if (info.isHost) {
self.collectProperties(rule, hostProps);
} else {
self.collectProperties(rule, rootProps);
}
}
});
});
return {
rootProps: rootProps,
hostProps: hostProps
};
},
transformStyles: function (element, properties, scopeSelector) {
var self = this;
var hostSelector = styleTransformer._calcHostScope(element.is, element.extends);
var rxHostSelector = element.extends ? '\\' + hostSelector.slice(0, -1) + '\\]' : hostSelector;
var hostRx = new RegExp(this.rx.HOST_PREFIX + rxHostSelector + this.rx.HOST_SUFFIX);
var keyframeTransforms = this._elementKeyframeTransforms(element, scopeSelector);
return styleTransformer.elementStyles(element, function (rule) {
self.applyProperties(rule, properties);
if (!settings.useNativeShadow && !Polymer.StyleUtil.isKeyframesSelector(rule) && rule.cssText) {
self.applyKeyframeTransforms(rule, keyframeTransforms);
self._scopeSelector(rule, hostRx, hostSelector, element._scopeCssViaAttr, scopeSelector);
}
});
},
_elementKeyframeTransforms: function (element, scopeSelector) {
var keyframesRules = element._styles._keyframes;
var keyframeTransforms = {};
if (!settings.useNativeShadow && keyframesRules) {
for (var i = 0, keyframesRule = keyframesRules[i]; i < keyframesRules.length; keyframesRule = keyframesRules[++i]) {
this._scopeKeyframes(keyframesRule, scopeSelector);
keyframeTransforms[keyframesRule.keyframesName] = this._keyframesRuleTransformer(keyframesRule);
}
}
return keyframeTransforms;
},
_keyframesRuleTransformer: function (keyframesRule) {
return function (cssText) {
return cssText.replace(keyframesRule.keyframesNameRx, keyframesRule.transformedKeyframesName);
};
},
_scopeKeyframes: function (rule, scopeId) {
rule.keyframesNameRx = new RegExp('\\b' + rule.keyframesName + '(?!\\B|-)', 'g');
rule.transformedKeyframesName = rule.keyframesName + '-' + scopeId;
rule.transformedSelector = rule.transformedSelector || rule.selector;
rule.selector = rule.transformedSelector.replace(rule.keyframesName, rule.transformedKeyframesName);
},
_hasDirOrHostContext: function (parsedSelector) {
return /:host-context|:dir/.test(parsedSelector);
},
_scopeSelector: function (rule, hostRx, hostSelector, viaAttr, scopeId) {
rule.transformedSelector = rule.transformedSelector || rule.selector;
var selector = rule.transformedSelector;
var scope = styleTransformer._calcElementScope(scopeId, viaAttr);
var hostScope = styleTransformer._calcElementScope(hostSelector, viaAttr);
var parts = selector.split(',');
var isDirOrHostContextSelector = this._hasDirOrHostContext(rule.parsedSelector);
for (var i = 0, l = parts.length, p; i < l && (p = parts[i]); i++) {
parts[i] = p.match(hostRx) ? p.replace(hostSelector, scope) : isDirOrHostContextSelector ? p.replace(hostScope, scope + ' ' + hostScope) : scope + ' ' + p;
}
rule.selector = parts.join(',');
},
applyElementScopeSelector: function (element, selector, old, viaAttr) {
var c = viaAttr ? element.getAttribute(styleTransformer.SCOPE_NAME) : element.getAttribute('class') || '';
var v = old ? c.replace(old, selector) : (c ? c + ' ' : '') + this.XSCOPE_NAME + ' ' + selector;
if (c !== v) {
if (viaAttr) {
element.setAttribute(styleTransformer.SCOPE_NAME, v);
} else {
element.setAttribute('class', v);
}
}
},
applyElementStyle: function (element, properties, selector, style) {
var cssText = style ? style.textContent || '' : this.transformStyles(element, properties, selector);
var s = element._customStyle;
if (s && !settings.useNativeShadow && s !== style) {
s._useCount--;
if (s._useCount <= 0 && s.parentNode) {
s.parentNode.removeChild(s);
}
}
if (settings.useNativeShadow) {
if (element._customStyle) {
element._customStyle.textContent = cssText;
style = element._customStyle;
} else if (cssText) {
style = styleUtil.applyCss(cssText, selector, element.root, element._scopeStyle);
}
} else {
if (!style) {
if (cssText) {
style = styleUtil.applyCss(cssText, selector, null, element._scopeStyle);
}
} else if (!style.parentNode) {
if (IS_IE && cssText.indexOf('@media') > -1) {
style.textContent = cssText;
}
styleUtil.applyStyle(style, null, element._scopeStyle);
}
}
if (style) {
style._useCount = style._useCount || 0;
if (element._customStyle != style) {
style._useCount++;
}
element._customStyle = style;
}
return style;
},
mixinCustomStyle: function (props, customStyle) {
var v;
for (var i in customStyle) {
v = customStyle[i];
if (v || v === 0) {
props[i] = v;
}
}
},
updateNativeStyleProperties: function (element, properties) {
var oldPropertyNames = element.__customStyleProperties;
if (oldPropertyNames) {
for (var i = 0; i < oldPropertyNames.length; i++) {
element.style.removeProperty(oldPropertyNames[i]);
}
}
var propertyNames = [];
for (var p in properties) {
if (properties[p] !== null) {
element.style.setProperty(p, properties[p]);
propertyNames.push(p);
}
}
element.__customStyleProperties = propertyNames;
},
rx: styleUtil.rx,
XSCOPE_NAME: 'x-scope'
};
function addToBitMask(n, bits) {
var o = parseInt(n / 32);
var v = 1 << n % 32;
bits[o] = (bits[o] || 0) | v;
}
}();(function () {
Polymer.StyleCache = function () {
this.cache = {};
};
Polymer.StyleCache.prototype = {
MAX: 100,
store: function (is, data, keyValues, keyStyles) {
data.keyValues = keyValues;
data.styles = keyStyles;
var s$ = this.cache[is] = this.cache[is] || [];
s$.push(data);
if (s$.length > this.MAX) {
s$.shift();
}
},
retrieve: function (is, keyValues, keyStyles) {
var cache = this.cache[is];
if (cache) {
for (var i = cache.length - 1, data; i >= 0; i--) {
data = cache[i];
if (keyStyles === data.styles && this._objectsEqual(keyValues, data.keyValues)) {
return data;
}
}
}
},
clear: function () {
this.cache = {};
},
_objectsEqual: function (target, source) {
var t, s;
for (var i in target) {
t = target[i], s = source[i];
if (!(typeof t === 'object' && t ? this._objectsStrictlyEqual(t, s) : t === s)) {
return false;
}
}
if (Array.isArray(target)) {
return target.length === source.length;
}
return true;
},
_objectsStrictlyEqual: function (target, source) {
return this._objectsEqual(target, source) && this._objectsEqual(source, target);
}
};
}());Polymer.StyleDefaults = function () {
var styleProperties = Polymer.StyleProperties;
var StyleCache = Polymer.StyleCache;
var nativeVariables = Polymer.Settings.useNativeCSSProperties;
var api = {
_styles: [],
_properties: null,
customStyle: {},
_styleCache: new StyleCache(),
_element: Polymer.DomApi.wrap(document.documentElement),
addStyle: function (style) {
this._styles.push(style);
this._properties = null;
},
get _styleProperties() {
if (!this._properties) {
styleProperties.decorateStyles(this._styles, this);
this._styles._scopeStyleProperties = null;
this._properties = styleProperties.hostAndRootPropertiesForScope(this).rootProps;
styleProperties.mixinCustomStyle(this._properties, this.customStyle);
styleProperties.reify(this._properties);
}
return this._properties;
},
hasStyleProperties: function () {
return Boolean(this._properties);
},
_needsStyleProperties: function () {
},
_computeStyleProperties: function () {
return this._styleProperties;
},
updateStyles: function (properties) {
this._properties = null;
if (properties) {
Polymer.Base.mixin(this.customStyle, properties);
}
this._styleCache.clear();
for (var i = 0, s; i < this._styles.length; i++) {
s = this._styles[i];
s = s.__importElement || s;
s._apply();
}
if (nativeVariables) {
styleProperties.updateNativeStyleProperties(document.documentElement, this.customStyle);
}
}
};
return api;
}();(function () {
'use strict';
var serializeValueToAttribute = Polymer.Base.serializeValueToAttribute;
var propertyUtils = Polymer.StyleProperties;
var styleTransformer = Polymer.StyleTransformer;
var styleDefaults = Polymer.StyleDefaults;
var nativeShadow = Polymer.Settings.useNativeShadow;
var nativeVariables = Polymer.Settings.useNativeCSSProperties;
Polymer.Base._addFeature({
_prepStyleProperties: function () {
if (!nativeVariables) {
this._ownStylePropertyNames = this._styles && this._styles.length ? propertyUtils.decorateStyles(this._styles, this) : null;
}
},
customStyle: null,
getComputedStyleValue: function (property) {
if (!nativeVariables && !this._styleProperties) {
this._computeStyleProperties();
}
return !nativeVariables && this._styleProperties && this._styleProperties[property] || getComputedStyle(this).getPropertyValue(property);
},
_setupStyleProperties: function () {
this.customStyle = {};
this._styleCache = null;
this._styleProperties = null;
this._scopeSelector = null;
this._ownStyleProperties = null;
this._customStyle = null;
},
_needsStyleProperties: function () {
return Boolean(!nativeVariables && this._ownStylePropertyNames && this._ownStylePropertyNames.length);
},
_validateApplyShim: function () {
if (this.__applyShimInvalid) {
Polymer.ApplyShim.transform(this._styles, this.__proto__);
var cssText = styleTransformer.elementStyles(this);
if (nativeShadow) {
var templateStyle = this._template.content.querySelector('style');
if (templateStyle) {
templateStyle.textContent = cssText;
}
} else {
var shadyStyle = this._scopeStyle && this._scopeStyle.nextSibling;
if (shadyStyle) {
shadyStyle.textContent = cssText;
}
}
}
},
_beforeAttached: function () {
if ((!this._scopeSelector || this.__stylePropertiesInvalid) && this._needsStyleProperties()) {
this.__stylePropertiesInvalid = false;
this._updateStyleProperties();
}
},
_findStyleHost: function () {
var e = this, root;
while (root = Polymer.dom(e).getOwnerRoot()) {
if (Polymer.isInstance(root.host)) {
return root.host;
}
e = root.host;
}
return styleDefaults;
},
_updateStyleProperties: function () {
var info, scope = this._findStyleHost();
if (!scope._styleProperties) {
scope._computeStyleProperties();
}
if (!scope._styleCache) {
scope._styleCache = new Polymer.StyleCache();
}
var scopeData = propertyUtils.propertyDataFromStyles(scope._styles, this);
var scopeCacheable = !this.__notStyleScopeCacheable;
if (scopeCacheable) {
scopeData.key.customStyle = this.customStyle;
info = scope._styleCache.retrieve(this.is, scopeData.key, this._styles);
}
var scopeCached = Boolean(info);
if (scopeCached) {
this._styleProperties = info._styleProperties;
} else {
this._computeStyleProperties(scopeData.properties);
}
this._computeOwnStyleProperties();
if (!scopeCached) {
info = styleCache.retrieve(this.is, this._ownStyleProperties, this._styles);
}
var globalCached = Boolean(info) && !scopeCached;
var style = this._applyStyleProperties(info);
if (!scopeCached) {
style = style && nativeShadow ? style.cloneNode(true) : style;
info = {
style: style,
_scopeSelector: this._scopeSelector,
_styleProperties: this._styleProperties
};
if (scopeCacheable) {
scopeData.key.customStyle = {};
this.mixin(scopeData.key.customStyle, this.customStyle);
scope._styleCache.store(this.is, info, scopeData.key, this._styles);
}
if (!globalCached) {
styleCache.store(this.is, Object.create(info), this._ownStyleProperties, this._styles);
}
}
},
_computeStyleProperties: function (scopeProps) {
var scope = this._findStyleHost();
if (!scope._styleProperties) {
scope._computeStyleProperties();
}
var props = Object.create(scope._styleProperties);
var hostAndRootProps = propertyUtils.hostAndRootPropertiesForScope(this);
this.mixin(props, hostAndRootProps.hostProps);
scopeProps = scopeProps || propertyUtils.propertyDataFromStyles(scope._styles, this).properties;
this.mixin(props, scopeProps);
this.mixin(props, hostAndRootProps.rootProps);
propertyUtils.mixinCustomStyle(props, this.customStyle);
propertyUtils.reify(props);
this._styleProperties = props;
},
_computeOwnStyleProperties: function () {
var props = {};
for (var i = 0, n; i < this._ownStylePropertyNames.length; i++) {
n = this._ownStylePropertyNames[i];
props[n] = this._styleProperties[n];
}
this._ownStyleProperties = props;
},
_scopeCount: 0,
_applyStyleProperties: function (info) {
var oldScopeSelector = this._scopeSelector;
this._scopeSelector = info ? info._scopeSelector : this.is + '-' + this.__proto__._scopeCount++;
var style = propertyUtils.applyElementStyle(this, this._styleProperties, this._scopeSelector, info && info.style);
if (!nativeShadow) {
propertyUtils.applyElementScopeSelector(this, this._scopeSelector, oldScopeSelector, this._scopeCssViaAttr);
}
return style;
},
serializeValueToAttribute: function (value, attribute, node) {
node = node || this;
if (attribute === 'class' && !nativeShadow) {
var host = node === this ? this.domHost || this.dataHost : this;
if (host) {
value = host._scopeElementClass(node, value);
}
}
node = this.shadyRoot && this.shadyRoot._hasDistributed ? Polymer.dom(node) : node;
serializeValueToAttribute.call(this, value, attribute, node);
},
_scopeElementClass: function (element, selector) {
if (!nativeShadow && !this._scopeCssViaAttr) {
selector = (selector ? selector + ' ' : '') + SCOPE_NAME + ' ' + this.is + (element._scopeSelector ? ' ' + XSCOPE_NAME + ' ' + element._scopeSelector : '');
}
return selector;
},
updateStyles: function (properties) {
if (properties) {
this.mixin(this.customStyle, properties);
}
if (nativeVariables) {
propertyUtils.updateNativeStyleProperties(this, this.customStyle);
} else {
if (this.isAttached) {
if (this._needsStyleProperties()) {
this._updateStyleProperties();
} else {
this._styleProperties = null;
}
} else {
this.__stylePropertiesInvalid = true;
}
if (this._styleCache) {
this._styleCache.clear();
}
this._updateRootStyles();
}
},
_updateRootStyles: function (root) {
root = root || this.root;
var c$ = Polymer.dom(root)._query(function (e) {
return e.shadyRoot || e.shadowRoot;
});
for (var i = 0, l = c$.length, c; i < l && (c = c$[i]); i++) {
if (c.updateStyles) {
c.updateStyles();
}
}
}
});
Polymer.updateStyles = function (properties) {
styleDefaults.updateStyles(properties);
Polymer.Base._updateRootStyles(document);
};
var styleCache = new Polymer.StyleCache();
Polymer.customStyleCache = styleCache;
var SCOPE_NAME = styleTransformer.SCOPE_NAME;
var XSCOPE_NAME = propertyUtils.XSCOPE_NAME;
}());Polymer.Base._addFeature({
_registerFeatures: function () {
this._prepIs();
if (this.factoryImpl) {
this._prepConstructor();
}
this._prepStyles();
},
_finishRegisterFeatures: function () {
this._prepTemplate();
this._prepShimStyles();
this._prepAnnotations();
this._prepEffects();
this._prepBehaviors();
this._prepPropertyInfo();
this._prepBindings();
this._prepShady();
},
_prepBehavior: function (b) {
this._addPropertyEffects(b.properties);
this._addComplexObserverEffects(b.observers);
this._addHostAttributes(b.hostAttributes);
},
_initFeatures: function () {
this._setupGestures();
this._setupConfigure(this.__data__);
this._setupStyleProperties();
this._setupDebouncers();
this._setupShady();
this._registerHost();
if (this._template) {
this._validateApplyShim();
this._poolContent();
this._beginHosting();
this._stampTemplate();
this._endHosting();
this._marshalAnnotationReferences();
}
this._marshalInstanceEffects();
this._marshalBehaviors();
this._marshalHostAttributes();
this._marshalAttributes();
this._tryReady();
},
_marshalBehavior: function (b) {
if (b.listeners) {
this._listenListeners(b.listeners);
}
}
});(function () {
var propertyUtils = Polymer.StyleProperties;
var styleUtil = Polymer.StyleUtil;
var cssParse = Polymer.CssParse;
var styleDefaults = Polymer.StyleDefaults;
var styleTransformer = Polymer.StyleTransformer;
var applyShim = Polymer.ApplyShim;
var debounce = Polymer.Debounce;
var settings = Polymer.Settings;
var updateDebouncer;
Polymer({
is: 'custom-style',
extends: 'style',
_template: null,
properties: { include: String },
ready: function () {
this.__appliedElement = this.__appliedElement || this;
this.__cssBuild = styleUtil.getCssBuildType(this);
if (this.__appliedElement !== this) {
this.__appliedElement.__cssBuild = this.__cssBuild;
}
if (this.ownerDocument !== window.document && this.__appliedElement === this) {
document.head.appendChild(this);
}
this._tryApply();
},
attached: function () {
this._tryApply();
},
_tryApply: function () {
if (!this._appliesToDocument) {
if (this.parentNode && this.parentNode.localName !== 'dom-module') {
this._appliesToDocument = true;
var e = this.__appliedElement;
if (!settings.useNativeCSSProperties) {
this.__needsUpdateStyles = styleDefaults.hasStyleProperties();
styleDefaults.addStyle(e);
}
if (e.textContent || this.include) {
this._apply(true);
} else {
var self = this;
var observer = new MutationObserver(function () {
observer.disconnect();
self._apply(true);
});
observer.observe(e, { childList: true });
}
}
}
},
_updateStyles: function () {
Polymer.updateStyles();
},
_apply: function (initialApply) {
var e = this.__appliedElement;
if (this.include) {
e.textContent = styleUtil.cssFromModules(this.include, true) + e.textContent;
}
if (!e.textContent) {
return;
}
var buildType = this.__cssBuild;
var targetedBuild = styleUtil.isTargetedBuild(buildType);
if (settings.useNativeCSSProperties && targetedBuild) {
return;
}
var styleRules = styleUtil.rulesForStyle(e);
if (!targetedBuild) {
styleUtil.forEachRule(styleRules, function (rule) {
styleTransformer.documentRule(rule);
});
if (settings.useNativeCSSProperties && !buildType) {
applyShim.transform([e]);
}
}
if (settings.useNativeCSSProperties) {
e.textContent = styleUtil.toCssText(styleRules);
} else {
var self = this;
var fn = function fn() {
self._flushCustomProperties();
};
if (initialApply) {
Polymer.RenderStatus.whenReady(fn);
} else {
fn();
}
}
},
_flushCustomProperties: function () {
if (this.__needsUpdateStyles) {
this.__needsUpdateStyles = false;
updateDebouncer = debounce(updateDebouncer, this._updateStyles);
} else {
this._applyCustomProperties();
}
},
_applyCustomProperties: function () {
var element = this.__appliedElement;
this._computeStyleProperties();
var props = this._styleProperties;
var rules = styleUtil.rulesForStyle(element);
if (!rules) {
return;
}
element.textContent = styleUtil.toCssText(rules, function (rule) {
var css = rule.cssText = rule.parsedCssText;
if (rule.propertyInfo && rule.propertyInfo.cssText) {
css = cssParse.removeCustomPropAssignment(css);
rule.cssText = propertyUtils.valueForProperties(css, props);
}
});
}
});
}());Polymer.Templatizer = {
properties: { __hideTemplateChildren__: { observer: '_showHideChildren' } },
_instanceProps: Polymer.nob,
_parentPropPrefix: '_parent_',
templatize: function (template) {
this._templatized = template;
if (!template._content) {
template._content = template.content;
}
if (template._content._ctor) {
this.ctor = template._content._ctor;
this._prepParentProperties(this.ctor.prototype, template);
return;
}
var archetype = Object.create(Polymer.Base);
this._customPrepAnnotations(archetype, template);
this._prepParentProperties(archetype, template);
archetype._prepEffects();
this._customPrepEffects(archetype);
archetype._prepBehaviors();
archetype._prepPropertyInfo();
archetype._prepBindings();
archetype._notifyPathUp = this._notifyPathUpImpl;
archetype._scopeElementClass = this._scopeElementClassImpl;
archetype.listen = this._listenImpl;
archetype._showHideChildren = this._showHideChildrenImpl;
archetype.__setPropertyOrig = this.__setProperty;
archetype.__setProperty = this.__setPropertyImpl;
var _constructor = this._constructorImpl;
var ctor = function TemplateInstance(model, host) {
_constructor.call(this, model, host);
};
ctor.prototype = archetype;
archetype.constructor = ctor;
template._content._ctor = ctor;
this.ctor = ctor;
},
_getRootDataHost: function () {
return this.dataHost && this.dataHost._rootDataHost || this.dataHost;
},
_showHideChildrenImpl: function (hide) {
var c = this._children;
for (var i = 0; i < c.length; i++) {
var n = c[i];
if (Boolean(hide) != Boolean(n.__hideTemplateChildren__)) {
if (n.nodeType === Node.TEXT_NODE) {
if (hide) {
n.__polymerTextContent__ = n.textContent;
n.textContent = '';
} else {
n.textContent = n.__polymerTextContent__;
}
} else if (n.style) {
if (hide) {
n.__polymerDisplay__ = n.style.display;
n.style.display = 'none';
} else {
n.style.display = n.__polymerDisplay__;
}
}
}
n.__hideTemplateChildren__ = hide;
}
},
__setPropertyImpl: function (property, value, fromAbove, node) {
if (node && node.__hideTemplateChildren__ && property == 'textContent') {
property = '__polymerTextContent__';
}
this.__setPropertyOrig(property, value, fromAbove, node);
},
_debounceTemplate: function (fn) {
Polymer.dom.addDebouncer(this.debounce('_debounceTemplate', fn));
},
_flushTemplates: function () {
Polymer.dom.flush();
},
_customPrepEffects: function (archetype) {
var parentProps = archetype._parentProps;
for (var prop in parentProps) {
archetype._addPropertyEffect(prop, 'function', this._createHostPropEffector(prop));
}
for (prop in this._instanceProps) {
archetype._addPropertyEffect(prop, 'function', this._createInstancePropEffector(prop));
}
},
_customPrepAnnotations: function (archetype, template) {
var t = archetype._template = document.createElement('template');
var c = t._content = template._content;
if (!c._notes) {
var rootDataHost = archetype._rootDataHost;
if (rootDataHost) {
Polymer.Annotations.prepElement = function () {
rootDataHost._prepElement();
};
}
c._notes = Polymer.Annotations.parseAnnotations(template);
Polymer.Annotations.prepElement = null;
this._processAnnotations(c._notes);
}
archetype._notes = c._notes;
archetype._parentProps = c._parentProps;
},
_prepParentProperties: function (archetype, template) {
var parentProps = this._parentProps = archetype._parentProps;
if (this._forwardParentProp && parentProps) {
var proto = archetype._parentPropProto;
var prop;
if (!proto) {
for (prop in this._instanceProps) {
delete parentProps[prop];
}
proto = archetype._parentPropProto = Object.create(null);
if (template != this) {
Polymer.Bind.prepareModel(proto);
Polymer.Base.prepareModelNotifyPath(proto);
}
for (prop in parentProps) {
var parentProp = this._parentPropPrefix + prop;
var effects = [
{
kind: 'function',
effect: this._createForwardPropEffector(prop),
fn: Polymer.Bind._functionEffect
},
{
kind: 'notify',
fn: Polymer.Bind._notifyEffect,
effect: { event: Polymer.CaseMap.camelToDashCase(parentProp) + '-changed' }
}
];
proto._propertyEffects = proto._propertyEffects || {};
proto._propertyEffects[parentProp] = effects;
Polymer.Bind._createAccessors(proto, parentProp, effects);
}
}
var self = this;
if (template != this) {
Polymer.Bind.prepareInstance(template);
template._forwardParentProp = function (source, value) {
self._forwardParentProp(source, value);
};
}
this._extendTemplate(template, proto);
template._pathEffector = function (path, value, fromAbove) {
return self._pathEffectorImpl(path, value, fromAbove);
};
}
},
_createForwardPropEffector: function (prop) {
return function (source, value) {
this._forwardParentProp(prop, value);
};
},
_createHostPropEffector: function (prop) {
var prefix = this._parentPropPrefix;
return function (source, value) {
this.dataHost._templatized[prefix + prop] = value;
};
},
_createInstancePropEffector: function (prop) {
return function (source, value, old, fromAbove) {
if (!fromAbove) {
this.dataHost._forwardInstanceProp(this, prop, value);
}
};
},
_extendTemplate: function (template, proto) {
var n$ = Object.getOwnPropertyNames(proto);
if (proto._propertySetter) {
template._propertySetter = proto._propertySetter;
}
for (var i = 0, n; i < n$.length && (n = n$[i]); i++) {
var val = template[n];
if (val && n == '_propertyEffects') {
var pe = Polymer.Base.mixin({}, val);
template._propertyEffects = Polymer.Base.mixin(pe, proto._propertyEffects);
} else {
var pd = Object.getOwnPropertyDescriptor(proto, n);
Object.defineProperty(template, n, pd);
if (val !== undefined) {
template._propertySetter(n, val);
}
}
}
},
_showHideChildren: function (hidden) {
},
_forwardInstancePath: function (inst, path, value) {
},
_forwardInstanceProp: function (inst, prop, value) {
},
_notifyPathUpImpl: function (path, value) {
var dataHost = this.dataHost;
var root = Polymer.Path.root(path);
dataHost._forwardInstancePath.call(dataHost, this, path, value);
if (root in dataHost._parentProps) {
dataHost._templatized._notifyPath(dataHost._parentPropPrefix + path, value);
}
},
_pathEffectorImpl: function (path, value, fromAbove) {
if (this._forwardParentPath) {
if (path.indexOf(this._parentPropPrefix) === 0) {
var subPath = path.substring(this._parentPropPrefix.length);
var model = Polymer.Path.root(subPath);
if (model in this._parentProps) {
this._forwardParentPath(subPath, value);
}
}
}
Polymer.Base._pathEffector.call(this._templatized, path, value, fromAbove);
},
_constructorImpl: function (model, host) {
this._rootDataHost = host._getRootDataHost();
this._setupConfigure(model);
this._registerHost(host);
this._beginHosting();
this.root = this.instanceTemplate(this._template);
this.root.__noContent = !this._notes._hasContent;
this.root.__styleScoped = true;
this._endHosting();
this._marshalAnnotatedNodes();
this._marshalInstanceEffects();
this._marshalAnnotatedListeners();
var children = [];
for (var n = this.root.firstChild; n; n = n.nextSibling) {
children.push(n);
n._templateInstance = this;
}
this._children = children;
if (host.__hideTemplateChildren__) {
this._showHideChildren(true);
}
this._tryReady();
},
_listenImpl: function (node, eventName, methodName) {
var model = this;
var host = this._rootDataHost;
var handler = host._createEventHandler(node, eventName, methodName);
var decorated = function (e) {
e.model = model;
handler(e);
};
host._listen(node, eventName, decorated);
},
_scopeElementClassImpl: function (node, value) {
var host = this._rootDataHost;
if (host) {
return host._scopeElementClass(node, value);
}
return value;
},
stamp: function (model) {
model = model || {};
if (this._parentProps) {
var templatized = this._templatized;
for (var prop in this._parentProps) {
if (model[prop] === undefined) {
model[prop] = templatized[this._parentPropPrefix + prop];
}
}
}
return new this.ctor(model, this);
},
modelForElement: function (el) {
var model;
while (el) {
if (model = el._templateInstance) {
if (model.dataHost != this) {
el = model.dataHost;
} else {
return model;
}
} else {
el = el.parentNode;
}
}
}
};Polymer({
is: 'dom-template',
extends: 'template',
_template: null,
behaviors: [Polymer.Templatizer],
ready: function () {
this.templatize(this);
}
});Polymer._collections = new WeakMap();
Polymer.Collection = function (userArray) {
Polymer._collections.set(userArray, this);
this.userArray = userArray;
this.store = userArray.slice();
this.initMap();
};
Polymer.Collection.prototype = {
constructor: Polymer.Collection,
initMap: function () {
var omap = this.omap = new WeakMap();
var pmap = this.pmap = {};
var s = this.store;
for (var i = 0; i < s.length; i++) {
var item = s[i];
if (item && typeof item == 'object') {
omap.set(item, i);
} else {
pmap[item] = i;
}
}
},
add: function (item) {
var key = this.store.push(item) - 1;
if (item && typeof item == 'object') {
this.omap.set(item, key);
} else {
this.pmap[item] = key;
}
return '#' + key;
},
removeKey: function (key) {
if (key = this._parseKey(key)) {
this._removeFromMap(this.store[key]);
delete this.store[key];
}
},
_removeFromMap: function (item) {
if (item && typeof item == 'object') {
this.omap.delete(item);
} else {
delete this.pmap[item];
}
},
remove: function (item) {
var key = this.getKey(item);
this.removeKey(key);
return key;
},
getKey: function (item) {
var key;
if (item && typeof item == 'object') {
key = this.omap.get(item);
} else {
key = this.pmap[item];
}
if (key != undefined) {
return '#' + key;
}
},
getKeys: function () {
return Object.keys(this.store).map(function (key) {
return '#' + key;
});
},
_parseKey: function (key) {
if (key && key[0] == '#') {
return key.slice(1);
}
},
setItem: function (key, item) {
if (key = this._parseKey(key)) {
var old = this.store[key];
if (old) {
this._removeFromMap(old);
}
if (item && typeof item == 'object') {
this.omap.set(item, key);
} else {
this.pmap[item] = key;
}
this.store[key] = item;
}
},
getItem: function (key) {
if (key = this._parseKey(key)) {
return this.store[key];
}
},
getItems: function () {
var items = [], store = this.store;
for (var key in store) {
items.push(store[key]);
}
return items;
},
_applySplices: function (splices) {
var keyMap = {}, key;
for (var i = 0, s; i < splices.length && (s = splices[i]); i++) {
s.addedKeys = [];
for (var j = 0; j < s.removed.length; j++) {
key = this.getKey(s.removed[j]);
keyMap[key] = keyMap[key] ? null : -1;
}
for (j = 0; j < s.addedCount; j++) {
var item = this.userArray[s.index + j];
key = this.getKey(item);
key = key === undefined ? this.add(item) : key;
keyMap[key] = keyMap[key] ? null : 1;
s.addedKeys.push(key);
}
}
var removed = [];
var added = [];
for (key in keyMap) {
if (keyMap[key] < 0) {
this.removeKey(key);
removed.push(key);
}
if (keyMap[key] > 0) {
added.push(key);
}
}
return [{
removed: removed,
added: added
}];
}
};
Polymer.Collection.get = function (userArray) {
return Polymer._collections.get(userArray) || new Polymer.Collection(userArray);
};
Polymer.Collection.applySplices = function (userArray, splices) {
var coll = Polymer._collections.get(userArray);
return coll ? coll._applySplices(splices) : null;
};Polymer({
is: 'dom-repeat',
extends: 'template',
_template: null,
properties: {
items: { type: Array },
as: {
type: String,
value: 'item'
},
indexAs: {
type: String,
value: 'index'
},
sort: {
type: Function,
observer: '_sortChanged'
},
filter: {
type: Function,
observer: '_filterChanged'
},
observe: {
type: String,
observer: '_observeChanged'
},
delay: Number,
renderedItemCount: {
type: Number,
notify: !Polymer.Settings.suppressTemplateNotifications,
readOnly: true
},
initialCount: {
type: Number,
observer: '_initializeChunking'
},
targetFramerate: {
type: Number,
value: 20
},
notifyDomChange: { type: Boolean },
_targetFrameTime: {
type: Number,
computed: '_computeFrameTime(targetFramerate)'
}
},
behaviors: [Polymer.Templatizer],
observers: ['_itemsChanged(items.*)'],
created: function () {
this._instances = [];
this._pool = [];
this._limit = Infinity;
var self = this;
this._boundRenderChunk = function () {
self._renderChunk();
};
},
detached: function () {
this.__isDetached = true;
for (var i = 0; i < this._instances.length; i++) {
this._detachInstance(i);
}
},
attached: function () {
if (this.__isDetached) {
this.__isDetached = false;
var refNode;
var parentNode = Polymer.dom(this).parentNode;
if (parentNode.localName == this.is) {
refNode = parentNode;
parentNode = Polymer.dom(parentNode).parentNode;
} else {
refNode = this;
}
var parent = Polymer.dom(parentNode);
for (var i = 0; i < this._instances.length; i++) {
this._attachInstance(i, parent, refNode);
}
}
},
ready: function () {
this._instanceProps = { __key__: true };
this._instanceProps[this.as] = true;
this._instanceProps[this.indexAs] = true;
if (!this.ctor) {
this.templatize(this);
}
},
_sortChanged: function (sort) {
var dataHost = this._getRootDataHost();
this._sortFn = sort && (typeof sort == 'function' ? sort : function () {
return dataHost[sort].apply(dataHost, arguments);
});
this._needFullRefresh = true;
if (this.items) {
this._debounceTemplate(this._render);
}
},
_filterChanged: function (filter) {
var dataHost = this._getRootDataHost();
this._filterFn = filter && (typeof filter == 'function' ? filter : function () {
return dataHost[filter].apply(dataHost, arguments);
});
this._needFullRefresh = true;
if (this.items) {
this._debounceTemplate(this._render);
}
},
_computeFrameTime: function (rate) {
return Math.ceil(1000 / rate);
},
_initializeChunking: function () {
if (this.initialCount) {
this._limit = this.initialCount;
this._chunkCount = this.initialCount;
this._lastChunkTime = performance.now();
}
},
_tryRenderChunk: function () {
if (this.items && this._limit < this.items.length) {
this.debounce('renderChunk', this._requestRenderChunk);
}
},
_requestRenderChunk: function () {
requestAnimationFrame(this._boundRenderChunk);
},
_renderChunk: function () {
var currChunkTime = performance.now();
var ratio = this._targetFrameTime / (currChunkTime - this._lastChunkTime);
this._chunkCount = Math.round(this._chunkCount * ratio) || 1;
this._limit += this._chunkCount;
this._lastChunkTime = currChunkTime;
this._debounceTemplate(this._render);
},
_observeChanged: function () {
this._observePaths = this.observe && this.observe.replace('.*', '.').split(' ');
},
_itemsChanged: function (change) {
if (change.path == 'items') {
if (Array.isArray(this.items)) {
this.collection = Polymer.Collection.get(this.items);
} else if (!this.items) {
this.collection = null;
} else {
this._error(this._logf('dom-repeat', 'expected array for `items`,' + ' found', this.items));
}
this._keySplices = [];
this._indexSplices = [];
this._needFullRefresh = true;
this._initializeChunking();
this._debounceTemplate(this._render);
} else if (change.path == 'items.splices') {
this._keySplices = this._keySplices.concat(change.value.keySplices);
this._indexSplices = this._indexSplices.concat(change.value.indexSplices);
this._debounceTemplate(this._render);
} else {
var subpath = change.path.slice(6);
this._forwardItemPath(subpath, change.value);
this._checkObservedPaths(subpath);
}
},
_checkObservedPaths: function (path) {
if (this._observePaths) {
path = path.substring(path.indexOf('.') + 1);
var paths = this._observePaths;
for (var i = 0; i < paths.length; i++) {
if (path.indexOf(paths[i]) === 0) {
this._needFullRefresh = true;
if (this.delay) {
this.debounce('render', this._render, this.delay);
} else {
this._debounceTemplate(this._render);
}
return;
}
}
}
},
render: function () {
this._needFullRefresh = true;
this._debounceTemplate(this._render);
this._flushTemplates();
},
_render: function () {
if (this._needFullRefresh) {
this._applyFullRefresh();
this._needFullRefresh = false;
} else if (this._keySplices.length) {
if (this._sortFn) {
this._applySplicesUserSort(this._keySplices);
} else {
if (this._filterFn) {
this._applyFullRefresh();
} else {
this._applySplicesArrayOrder(this._indexSplices);
}
}
} else {
}
this._keySplices = [];
this._indexSplices = [];
var keyToIdx = this._keyToInstIdx = {};
for (var i = this._instances.length - 1; i >= 0; i--) {
var inst = this._instances[i];
if (inst.isPlaceholder && i < this._limit) {
inst = this._insertInstance(i, inst.__key__);
} else if (!inst.isPlaceholder && i >= this._limit) {
inst = this._downgradeInstance(i, inst.__key__);
}
keyToIdx[inst.__key__] = i;
if (!inst.isPlaceholder) {
inst.__setProperty(this.indexAs, i, true);
}
}
this._pool.length = 0;
this._setRenderedItemCount(this._instances.length);
if (!Polymer.Settings.suppressTemplateNotifications || this.notifyDomChange) {
this.fire('dom-change');
}
this._tryRenderChunk();
},
_applyFullRefresh: function () {
var c = this.collection;
var keys;
if (this._sortFn) {
keys = c ? c.getKeys() : [];
} else {
keys = [];
var items = this.items;
if (items) {
for (var i = 0; i < items.length; i++) {
keys.push(c.getKey(items[i]));
}
}
}
var self = this;
if (this._filterFn) {
keys = keys.filter(function (a) {
return self._filterFn(c.getItem(a));
});
}
if (this._sortFn) {
keys.sort(function (a, b) {
return self._sortFn(c.getItem(a), c.getItem(b));
});
}
for (i = 0; i < keys.length; i++) {
var key = keys[i];
var inst = this._instances[i];
if (inst) {
inst.__key__ = key;
if (!inst.isPlaceholder && i < this._limit) {
inst.__setProperty(this.as, c.getItem(key), true);
}
} else if (i < this._limit) {
this._insertInstance(i, key);
} else {
this._insertPlaceholder(i, key);
}
}
for (var j = this._instances.length - 1; j >= i; j--) {
this._detachAndRemoveInstance(j);
}
},
_numericSort: function (a, b) {
return a - b;
},
_applySplicesUserSort: function (splices) {
var c = this.collection;
var keyMap = {};
var key;
for (var i = 0, s; i < splices.length && (s = splices[i]); i++) {
for (var j = 0; j < s.removed.length; j++) {
key = s.removed[j];
keyMap[key] = keyMap[key] ? null : -1;
}
for (j = 0; j < s.added.length; j++) {
key = s.added[j];
keyMap[key] = keyMap[key] ? null : 1;
}
}
var removedIdxs = [];
var addedKeys = [];
for (key in keyMap) {
if (keyMap[key] === -1) {
removedIdxs.push(this._keyToInstIdx[key]);
}
if (keyMap[key] === 1) {
addedKeys.push(key);
}
}
if (removedIdxs.length) {
removedIdxs.sort(this._numericSort);
for (i = removedIdxs.length - 1; i >= 0; i--) {
var idx = removedIdxs[i];
if (idx !== undefined) {
this._detachAndRemoveInstance(idx);
}
}
}
var self = this;
if (addedKeys.length) {
if (this._filterFn) {
addedKeys = addedKeys.filter(function (a) {
return self._filterFn(c.getItem(a));
});
}
addedKeys.sort(function (a, b) {
return self._sortFn(c.getItem(a), c.getItem(b));
});
var start = 0;
for (i = 0; i < addedKeys.length; i++) {
start = this._insertRowUserSort(start, addedKeys[i]);
}
}
},
_insertRowUserSort: function (start, key) {
var c = this.collection;
var item = c.getItem(key);
var end = this._instances.length - 1;
var idx = -1;
while (start <= end) {
var mid = start + end >> 1;
var midKey = this._instances[mid].__key__;
var cmp = this._sortFn(c.getItem(midKey), item);
if (cmp < 0) {
start = mid + 1;
} else if (cmp > 0) {
end = mid - 1;
} else {
idx = mid;
break;
}
}
if (idx < 0) {
idx = end + 1;
}
this._insertPlaceholder(idx, key);
return idx;
},
_applySplicesArrayOrder: function (splices) {
for (var i = 0, s; i < splices.length && (s = splices[i]); i++) {
for (var j = 0; j < s.removed.length; j++) {
this._detachAndRemoveInstance(s.index);
}
for (j = 0; j < s.addedKeys.length; j++) {
this._insertPlaceholder(s.index + j, s.addedKeys[j]);
}
}
},
_detachInstance: function (idx) {
var inst = this._instances[idx];
if (!inst.isPlaceholder) {
for (var i = 0; i < inst._children.length; i++) {
var el = inst._children[i];
Polymer.dom(inst.root).appendChild(el);
}
return inst;
}
},
_attachInstance: function (idx, parent, refNode) {
var inst = this._instances[idx];
if (!inst.isPlaceholder) {
parent.insertBefore(inst.root, refNode);
}
},
_detachAndRemoveInstance: function (idx) {
var inst = this._detachInstance(idx);
if (inst) {
this._pool.push(inst);
}
this._instances.splice(idx, 1);
},
_insertPlaceholder: function (idx, key) {
this._instances.splice(idx, 0, {
isPlaceholder: true,
__key__: key
});
},
_stampInstance: function (idx, key) {
var model = { __key__: key };
model[this.as] = this.collection.getItem(key);
model[this.indexAs] = idx;
return this.stamp(model);
},
_insertInstance: function (idx, key) {
var inst = this._pool.pop();
if (inst) {
inst.__setProperty(this.as, this.collection.getItem(key), true);
inst.__setProperty('__key__', key, true);
} else {
inst = this._stampInstance(idx, key);
}
var beforeRow = this._instances[idx + 1];
var beforeNode = beforeRow && !beforeRow.isPlaceholder ? beforeRow._children[0] : this;
var parentNode = Polymer.dom(this).parentNode;
if (parentNode.localName == this.is) {
if (beforeNode == this) {
beforeNode = parentNode;
}
parentNode = Polymer.dom(parentNode).parentNode;
}
Polymer.dom(parentNode).insertBefore(inst.root, beforeNode);
this._instances[idx] = inst;
return inst;
},
_downgradeInstance: function (idx, key) {
var inst = this._detachInstance(idx);
if (inst) {
this._pool.push(inst);
}
inst = {
isPlaceholder: true,
__key__: key
};
this._instances[idx] = inst;
return inst;
},
_showHideChildren: function (hidden) {
for (var i = 0; i < this._instances.length; i++) {
if (!this._instances[i].isPlaceholder)
this._instances[i]._showHideChildren(hidden);
}
},
_forwardInstanceProp: function (inst, prop, value) {
if (prop == this.as) {
var idx;
if (this._sortFn || this._filterFn) {
idx = this.items.indexOf(this.collection.getItem(inst.__key__));
} else {
idx = inst[this.indexAs];
}
this.set('items.' + idx, value);
}
},
_forwardInstancePath: function (inst, path, value) {
if (path.indexOf(this.as + '.') === 0) {
this._notifyPath('items.' + inst.__key__ + '.' + path.slice(this.as.length + 1), value);
}
},
_forwardParentProp: function (prop, value) {
var i$ = this._instances;
for (var i = 0, inst; i < i$.length && (inst = i$[i]); i++) {
if (!inst.isPlaceholder) {
inst.__setProperty(prop, value, true);
}
}
},
_forwardParentPath: function (path, value) {
var i$ = this._instances;
for (var i = 0, inst; i < i$.length && (inst = i$[i]); i++) {
if (!inst.isPlaceholder) {
inst._notifyPath(path, value, true);
}
}
},
_forwardItemPath: function (path, value) {
if (this._keyToInstIdx) {
var dot = path.indexOf('.');
var key = path.substring(0, dot < 0 ? path.length : dot);
var idx = this._keyToInstIdx[key];
var inst = this._instances[idx];
if (inst && !inst.isPlaceholder) {
if (dot >= 0) {
path = this.as + '.' + path.substring(dot + 1);
inst._notifyPath(path, value, true);
} else {
inst.__setProperty(this.as, value, true);
}
}
}
},
itemForElement: function (el) {
var instance = this.modelForElement(el);
return instance && instance[this.as];
},
keyForElement: function (el) {
var instance = this.modelForElement(el);
return instance && instance.__key__;
},
indexForElement: function (el) {
var instance = this.modelForElement(el);
return instance && instance[this.indexAs];
}
});Polymer({
is: 'array-selector',
_template: null,
properties: {
items: {
type: Array,
observer: 'clearSelection'
},
multi: {
type: Boolean,
value: false,
observer: 'clearSelection'
},
selected: {
type: Object,
notify: true
},
selectedItem: {
type: Object,
notify: true
},
toggle: {
type: Boolean,
value: false
}
},
clearSelection: function () {
if (Array.isArray(this.selected)) {
for (var i = 0; i < this.selected.length; i++) {
this.unlinkPaths('selected.' + i);
}
} else {
this.unlinkPaths('selected');
this.unlinkPaths('selectedItem');
}
if (this.multi) {
if (!this.selected || this.selected.length) {
this.selected = [];
this._selectedColl = Polymer.Collection.get(this.selected);
}
} else {
this.selected = null;
this._selectedColl = null;
}
this.selectedItem = null;
},
isSelected: function (item) {
if (this.multi) {
return this._selectedColl.getKey(item) !== undefined;
} else {
return this.selected == item;
}
},
deselect: function (item) {
if (this.multi) {
if (this.isSelected(item)) {
var skey = this._selectedColl.getKey(item);
this.arrayDelete('selected', item);
this.unlinkPaths('selected.' + skey);
}
} else {
this.selected = null;
this.selectedItem = null;
this.unlinkPaths('selected');
this.unlinkPaths('selectedItem');
}
},
select: function (item) {
var icol = Polymer.Collection.get(this.items);
var key = icol.getKey(item);
if (this.multi) {
if (this.isSelected(item)) {
if (this.toggle) {
this.deselect(item);
}
} else {
this.push('selected', item);
var skey = this._selectedColl.getKey(item);
this.linkPaths('selected.' + skey, 'items.' + key);
}
} else {
if (this.toggle && item == this.selected) {
this.deselect();
} else {
this.selected = item;
this.selectedItem = item;
this.linkPaths('selected', 'items.' + key);
this.linkPaths('selectedItem', 'items.' + key);
}
}
}
});Polymer({
is: 'dom-if',
extends: 'template',
_template: null,
properties: {
'if': {
type: Boolean,
value: false,
observer: '_queueRender'
},
restamp: {
type: Boolean,
value: false,
observer: '_queueRender'
},
notifyDomChange: { type: Boolean }
},
behaviors: [Polymer.Templatizer],
_queueRender: function () {
this._debounceTemplate(this._render);
},
detached: function () {
var parentNode = this.parentNode;
if (parentNode && parentNode.localName == this.is) {
parentNode = Polymer.dom(parentNode).parentNode;
}
if (!parentNode || parentNode.nodeType == Node.DOCUMENT_FRAGMENT_NODE && (!Polymer.Settings.hasShadow || !(parentNode instanceof ShadowRoot))) {
this._teardownInstance();
}
},
attached: function () {
if (this.if && this.ctor) {
this.async(this._ensureInstance);
}
},
render: function () {
this._flushTemplates();
},
_render: function () {
if (this.if) {
if (!this.ctor) {
this.templatize(this);
}
this._ensureInstance();
this._showHideChildren();
} else if (this.restamp) {
this._teardownInstance();
}
if (!this.restamp && this._instance) {
this._showHideChildren();
}
if (this.if != this._lastIf) {
if (!Polymer.Settings.suppressTemplateNotifications || this.notifyDomChange) {
this.fire('dom-change');
}
this._lastIf = this.if;
}
},
_ensureInstance: function () {
var refNode;
var parentNode = Polymer.dom(this).parentNode;
if (parentNode && parentNode.localName == this.is) {
refNode = parentNode;
parentNode = Polymer.dom(parentNode).parentNode;
} else {
refNode = this;
}
if (parentNode) {
if (!this._instance) {
this._instance = this.stamp();
var root = this._instance.root;
Polymer.dom(parentNode).insertBefore(root, refNode);
} else {
var c$ = this._instance._children;
if (c$ && c$.length) {
var lastChild = Polymer.dom(refNode).previousSibling;
if (lastChild !== c$[c$.length - 1]) {
for (var i = 0, n; i < c$.length && (n = c$[i]); i++) {
Polymer.dom(parentNode).insertBefore(n, refNode);
}
}
}
}
}
},
_teardownInstance: function () {
if (this._instance) {
var c$ = this._instance._children;
if (c$ && c$.length) {
var parent = Polymer.dom(Polymer.dom(c$[0]).parentNode);
for (var i = 0, n; i < c$.length && (n = c$[i]); i++) {
parent.removeChild(n);
}
}
this._instance = null;
}
},
_showHideChildren: function () {
var hidden = this.__hideTemplateChildren__ || !this.if;
if (this._instance) {
this._instance._showHideChildren(hidden);
}
},
_forwardParentProp: function (prop, value) {
if (this._instance) {
this._instance.__setProperty(prop, value, true);
}
},
_forwardParentPath: function (path, value) {
if (this._instance) {
this._instance._notifyPath(path, value, true);
}
}
});Polymer({
is: 'dom-bind',
properties: { notifyDomChange: { type: Boolean } },
extends: 'template',
_template: null,
created: function () {
var self = this;
Polymer.RenderStatus.whenReady(function () {
if (document.readyState == 'loading') {
document.addEventListener('DOMContentLoaded', function () {
self._markImportsReady();
});
} else {
self._markImportsReady();
}
});
},
_ensureReady: function () {
if (!this._readied) {
this._readySelf();
}
},
_markImportsReady: function () {
this._importsReady = true;
this._ensureReady();
},
_registerFeatures: function () {
this._prepConstructor();
},
_insertChildren: function () {
var refNode;
var parentNode = Polymer.dom(this).parentNode;
if (parentNode.localName == this.is) {
refNode = parentNode;
parentNode = Polymer.dom(parentNode).parentNode;
} else {
refNode = this;
}
Polymer.dom(parentNode).insertBefore(this.root, refNode);
},
_removeChildren: function () {
if (this._children) {
for (var i = 0; i < this._children.length; i++) {
this.root.appendChild(this._children[i]);
}
}
},
_initFeatures: function () {
},
_scopeElementClass: function (element, selector) {
if (this.dataHost) {
return this.dataHost._scopeElementClass(element, selector);
} else {
return selector;
}
},
_configureInstanceProperties: function () {
},
_prepConfigure: function () {
var config = {};
for (var prop in this._propertyEffects) {
config[prop] = this[prop];
}
var setupConfigure = this._setupConfigure;
this._setupConfigure = function () {
setupConfigure.call(this, config);
};
},
attached: function () {
if (this._importsReady) {
this.render();
}
},
detached: function () {
this._removeChildren();
},
render: function () {
this._ensureReady();
if (!this._children) {
this._template = this;
this._prepAnnotations();
this._prepEffects();
this._prepBehaviors();
this._prepConfigure();
this._prepBindings();
this._prepPropertyInfo();
Polymer.Base._initFeatures.call(this);
this._children = Polymer.TreeApi.arrayCopyChildNodes(this.root);
}
this._insertChildren();
if (!Polymer.Settings.suppressTemplateNotifications || this.notifyDomChange) {
this.fire('dom-change');
}
}
});
Polymer({
      is: 'top-bar-view'
    });
Polymer({
      is: 'proxy-view',
    });
'use strict';
Polymer({
      is: 'dns-view',
    });
Polymer({
      is: 'sockets-view',
    });
Polymer({
      is: 'alt-svc-view',
    });
Polymer({
      is: 'spdy-view',
    });
Polymer({
      is: 'quic-view'
    });
'use strict';
    Polymer({
      is: 'reporting-view'
    });
Polymer({
      is: 'http-cache-view',
    });
Polymer({
      is: 'prerender-view',
    });
Polymer({
      is: 'modules-view',
    });
Polymer({
      is: 'import-view',
    });
Polymer({
      is: 'events-view',
    });
Polymer({
      is: 'timeline-view',
    });
// cr.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

/** Platform, package, object property, and Event support. **/
const cr = function() {
  /**
   * Adds a {@code getInstance} static method that always return the same
   * instance object.
   * @param {!Function} ctor The constructor for the class to add the static
   *     method to.
   */
  function addSingletonGetter(ctor) {
    ctor.getInstance = function() {
      return ctor.instance_ || (ctor.instance_ = new ctor());
    };
  }

  return {
    addSingletonGetter
  };
}();
// assert.js
// Copyright (c) 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Assertion support.
 */

/**
 * Verify |condition| is truthy and return |condition| if so.
 * @template T
 * @param {T} condition A condition to check for truthiness.  Note that this
 *     may be used to test whether a value is defined or not, and we don't want
 *     to force a cast to Boolean.
 * @param {string=} opt_message A message to show on failure.
 * @return {T} A non-null |condition|.
 */
function assert(condition, opt_message) {
  if (!condition) {
    var message = 'Assertion failed';
    if (opt_message)
      message = message + ': ' + opt_message;
    var error = new Error(message);
    var global = function() { return this; }();
    if (global.traceAssertionsForTesting)
      console.warn(error.stack);
    throw error;
  }
  return condition;
}

/**
 * Call this from places in the code that should never be reached.
 *
 * For example, handling all the values of enum with a switch() like this:
 *
 *   function getValueFromEnum(enum) {
 *     switch (enum) {
 *       case ENUM_FIRST_OF_TWO:
 *         return first
 *       case ENUM_LAST_OF_TWO:
 *         return last;
 *     }
 *     assertNotReached();
 *     return document;
 *   }
 *
 * This code should only be hit in the case of serious programmer error or
 * unexpected input.
 *
 * @param {string=} opt_message A message to show when this is hit.
 */
function assertNotReached(opt_message) {
  assert(false, opt_message || 'Unreachable code hit');
}

/**
 * @param {*} value The value to check.
 * @param {function(new: T, ...)} type A user-defined constructor.
 * @param {string=} opt_message A message to show when this is hit.
 * @return {T}
 * @template T
 */
function assertInstanceof(value, type, opt_message) {
  // We don't use assert immediately here so that we avoid constructing an error
  // message if we don't have to.
  if (!(value instanceof type)) {
    assertNotReached(opt_message || 'Value ' + value +
                     ' is not a[n] ' + (type.name || typeof type));
  }
  return value;
}
// ui_webui_resources_js_util.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

/**
 * Alias for document.getElementById. Found elements must be HTMLElements.
 * @param {string} id The ID of the element to find.
 * @return {HTMLElement} The found element or null if not found.
 */
function $(id) {
  const el = document.getElementById(id);
  return el ? assertInstanceof(el, HTMLElement) : null;
}

/**
 * Generates a CSS url string.
 * @param {string} s The URL to generate the CSS url for.
 * @return {string} The CSS url string.
 */
function url(s) {
  // http://www.w3.org/TR/css3-values/#uris
  // Parentheses, commas, whitespace characters, single quotes (') and double
  // quotes (") appearing in a URI must be escaped with a backslash
  let s2 = s.replace(/(\(|\)|\,|\s|\'|\"|\\)/g, '\\$1');
  // WebKit has a bug when it comes to URLs that end with \
  // https://bugs.webkit.org/show_bug.cgi?id=28885
  if (/\\\\$/.test(s2)) {
    // Add a space to work around the WebKit bug.
    s2 += ' ';
  }
  return 'url("' + s2 + '")';
}
// util.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Sets the width (in pixels) on a DOM node.
 * @param {!HtmlNode} node The node whose width is being set.
 * @param {number} widthPx The width in pixels.
 */
function setNodeWidth(node, widthPx) {
  node.style.width = widthPx.toFixed(0) + 'px';
}

/**
 * Sets the height (in pixels) on a DOM node.
 * @param {!HtmlNode} node The node whose height is being set.
 * @param {number} heightPx The height in pixels.
 */
function setNodeHeight(node, heightPx) {
  node.style.height = heightPx.toFixed(0) + 'px';
}

/**
 * Sets the position and size of a DOM node (in pixels).
 * @param {!HtmlNode} node The node being positioned.
 * @param {number} leftPx The left position in pixels.
 * @param {number} topPx The top position in pixels.
 * @param {number} widthPx The width in pixels.
 * @param {number} heightPx The height in pixels.
 */
function setNodePosition(node, leftPx, topPx, widthPx, heightPx) {
  node.style.left = leftPx.toFixed(0) + 'px';
  node.style.top = topPx.toFixed(0) + 'px';
  setNodeWidth(node, widthPx);
  setNodeHeight(node, heightPx);
}

/**
 * Sets the visibility for a DOM node.
 * @param {!HtmlNode} node The node being positioned.
 * @param {boolean} isVisible Whether to show the node or not.
 */
function setNodeDisplay(node, isVisible) {
  node.style.display = isVisible ? '' : 'none';
}

/**
 * Toggles the visibility of a DOM node.
 * @param {!HtmlNode} node The node to show or hide.
 */
function toggleNodeDisplay(node) {
  setNodeDisplay(node, !getNodeDisplay(node));
}

/**
 * Returns the visibility of a DOM node.
 * @param {!HtmlNode} node The node to query.
 */
function getNodeDisplay(node) {
  return node.style.display != 'none';
}

/**
 * Adds a node to |parentNode|, of type |tagName|.
 * @param {!HtmlNode} parentNode The node that will be the parent of the new
 *     element.
 * @param {string} tagName the tag name of the new element.
 * @return {!HtmlElement} The newly created element.
 */
function addNode(parentNode, tagName) {
  var elem = parentNode.ownerDocument.createElement(tagName);
  parentNode.appendChild(elem);
  return elem;
}

/**
 * Adds |text| to node |parentNode|.
 * @param {!HtmlNode} parentNode The node to add text to.
 * @param {string} text The text to be added.
 * @return {!Object} The newly created text node.
 */
function addTextNode(parentNode, text) {
  var textNode = parentNode.ownerDocument.createTextNode(text);
  parentNode.appendChild(textNode);
  return textNode;
}

/**
 * Adds a node to |parentNode|, of type |tagName|.  Then adds
 * |text| to the new node.
 * @param {!HtmlNode} parentNode The node that will be the parent of the new
 *     element.
 * @param {string} tagName the tag name of the new element.
 * @param {string} text The text to be added.
 * @return {!HtmlElement} The newly created element.
 */
function addNodeWithText(parentNode, tagName, text) {
  var elem = parentNode.ownerDocument.createElement(tagName);
  parentNode.appendChild(elem);
  addTextNode(elem, text);
  return elem;
}

/**
 * Returns the key such that map[key] == value, or the string '?' if
 * there is no such key.
 * @param {!Object} map The object being used as a lookup table.
 * @param {Object} value The value to be found in |map|.
 * @return {string} The key for |value|, or '?' if there is no such key.
 */
function getKeyWithValue(map, value) {
  for (var key in map) {
    if (map[key] == value)
      return key;
  }
  return '?';
}

/**
 * Returns a new map with the keys and values of the input map inverted.
 * @param {!Object} map The object to have its keys and values reversed.  Not
 *     modified by the function call.
 * @return {Object} The new map with the reversed keys and values.
 */
function makeInverseMap(map) {
  var reversed = {};
  for (var key in map)
    reversed[map[key]] = key;
  return reversed;
}

/**
 * Looks up |key| in |map|, and returns the resulting entry, if there is one.
 * Otherwise, returns |key|.  Intended primarily for use with incomplete
 * tables, and for reasonable behavior with system enumerations that may be
 * extended in the future.
 * @param {!Object} map The table in which |key| is looked up.
 * @param {string} key The key to look up.
 * @return {Object|string} map[key], if it exists, or |key| if it doesn't.
 */
function tryGetValueWithKey(map, key) {
  if (key in map)
    return map[key];
  return key;
}

/**
 * Builds a string by repeating |str| |count| times.
 * @param {string} str The string to be repeated.
 * @param {number} count The number of times to repeat |str|.
 * @return {string} The constructed string
 */
function makeRepeatedString(str, count) {
  var out = [];
  for (var i = 0; i < count; ++i)
    out.push(str);
  return out.join('');
}

/**
 * Clones a basic POD object.  Only a new top level object will be cloned.  It
 * will continue to reference the same values as the original object.
 * @param {Object} object The object to be cloned.
 * @return {Object} A copy of |object|.
 */
function shallowCloneObject(object) {
  if (!(object instanceof Object))
    return object;
  var copy = {};
  for (var key in object) {
    copy[key] = object[key];
  }
  return copy;
}

/**
 * Helper to make sure singleton classes are not instantiated more than once.
 * @param {Function} ctor The constructor function being checked.
 */
function assertFirstConstructorCall(ctor) {
  // This is the variable which is set by cr.addSingletonGetter().
  if (ctor.hasCreateFirstInstance_) {
    throw Error(
        'The class ' + ctor.name + ' is a singleton, and should ' +
        'only be accessed using ' + ctor.name + '.getInstance().');
  }
  ctor.hasCreateFirstInstance_ = true;
}

function hasTouchScreen() {
  return 'ontouchstart' in window;
}
// table_printer.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * TablePrinter is a helper to format a table as ASCII art or an HTML table.
 *
 * Usage: call addRow() and addCell() repeatedly to specify the data.
 *
 * addHeaderCell() can optionally be called to specify header cells for a
 * single header row.  The header row appears at the top of an HTML formatted
 * table, and uses thead and th tags.  In ascii tables, the header is separated
 * from the table body by a partial row of dashes.
 *
 * setTitle() can optionally be used to set a title that is displayed before
 * the header row.  In HTML tables, it uses the title class and in ascii tables
 * it's between two rows of dashes.
 *
 * Once all the fields have been input, call toText() to format it as text or
 * toHTML() to format it as HTML.
 */
var TablePrinter = (function() {
  'use strict';

  /**
   * @constructor
   */
  function TablePrinter() {
    this.rows_ = [];
    this.hasHeaderRow_ = false;
    this.title_ = null;
    // Number of cells automatically added at the start of new rows.
    this.newRowCellIndent_ = 0;
  }

  TablePrinter.prototype = {
    /**
     * Sets the number of blank cells to add after each call to addRow.
     */
    setNewRowCellIndent: function(newRowCellIndent) {
      this.newRowCellIndent_ = newRowCellIndent;
    },

    /**
     * Starts a new row.
     */
    addRow: function() {
      this.rows_.push([]);
      for (var i = 0; i < this.newRowCellIndent_; ++i)
        this.addCell('');
    },

    /**
     * Adds a column to the current row, setting its value to cellText.
     *
     * @return {!TablePrinterCell} the cell that was added.
     */
    addCell: function(cellText) {
      var r = this.rows_[this.rows_.length - 1];
      var cell = new TablePrinterCell(cellText);
      r.push(cell);
      return cell;
    },

    /**
     * Sets the title displayed at the top of a table.  Titles are optional.
     */
    setTitle: function(title) {
      this.title_ = title;
    },

    /**
     * Adds a header row, if not already present, and adds a new column to it,
     * setting its contents to |headerText|.
     *
     * @return {!TablePrinterCell} the cell that was added.
     */
    addHeaderCell: function(headerText) {
      // Insert empty new row at start of |rows_| if currently no header row.
      if (!this.hasHeaderRow_) {
        this.rows_.splice(0, 0, []);
        this.hasHeaderRow_ = true;
      }
      var cell = new TablePrinterCell(headerText);
      this.rows_[0].push(cell);
      return cell;
    },

    /**
     * Returns the maximum number of columns this table contains.
     */
    getNumColumns: function() {
      var numColumns = 0;
      for (var i = 0; i < this.rows_.length; ++i) {
        numColumns = Math.max(numColumns, this.rows_[i].length);
      }
      return numColumns;
    },

    /**
     * Returns the cell at position (rowIndex, columnIndex), or null if there is
     * no such cell.
     */
    getCell_: function(rowIndex, columnIndex) {
      if (rowIndex >= this.rows_.length)
        return null;
      var row = this.rows_[rowIndex];
      if (columnIndex >= row.length)
        return null;
      return row[columnIndex];
    },

    /**
     * Returns true if searchString can be found entirely within a cell.
     * Case insensitive.
     *
     * @param {string} string String to search for, must be lowercase.
     * @return {boolean} True if some cell contains searchString.
     */
    search: function(searchString) {
      var numColumns = this.getNumColumns();
      for (var r = 0; r < this.rows_.length; ++r) {
        for (var c = 0; c < numColumns; ++c) {
          var cell = this.getCell_(r, c);
          if (!cell)
            continue;
          if (cell.text.toLowerCase().indexOf(searchString) != -1)
            return true;
        }
      }
      return false;
    },

    /**
     * Prints a formatted text representation of the table data to the
     * node |parent|.  |spacing| indicates number of extra spaces, if any,
     * to add between columns.
     */
    toText: function(spacing, parent) {
      var pre = addNode(parent, 'pre');
      var numColumns = this.getNumColumns();

      // Figure out the maximum width of each column.
      var columnWidths = [];
      columnWidths.length = numColumns;
      for (var i = 0; i < numColumns; ++i)
        columnWidths[i] = 0;

      // If header row is present, temporarily add a spacer row to |rows_|.
      if (this.hasHeaderRow_) {
        var headerSpacerRow = [];
        for (var c = 0; c < numColumns; ++c) {
          var cell = this.getCell_(0, c);
          if (!cell)
            continue;
          var spacerStr = makeRepeatedString('-', cell.text.length);
          headerSpacerRow.push(new TablePrinterCell(spacerStr));
        }
        this.rows_.splice(1, 0, headerSpacerRow);
      }

      var numRows = this.rows_.length;
      for (var c = 0; c < numColumns; ++c) {
        for (var r = 0; r < numRows; ++r) {
          var cell = this.getCell_(r, c);
          if (cell && !cell.allowOverflow) {
            columnWidths[c] = Math.max(columnWidths[c], cell.text.length);
          }
        }
      }

      var out = [];

      // Print title, if present.
      if (this.title_) {
        var titleSpacerStr = makeRepeatedString('-', this.title_.length);
        out.push(titleSpacerStr);
        out.push('\n');
        out.push(this.title_);
        out.push('\n');
        out.push(titleSpacerStr);
        out.push('\n');
      }

      // Print each row.
      var spacingStr = makeRepeatedString(' ', spacing);
      for (var r = 0; r < numRows; ++r) {
        for (var c = 0; c < numColumns; ++c) {
          var cell = this.getCell_(r, c);
          if (cell) {
            // Pad the cell with spaces to make it fit the maximum column width.
            var padding = columnWidths[c] - cell.text.length;
            var paddingStr = makeRepeatedString(' ', padding);

            if (cell.alignRight)
              out.push(paddingStr);
            if (cell.link) {
              // Output all previous text, and clear |out|.
              addTextNode(pre, out.join(''));
              out = [];

              var linkNode = addNodeWithText(pre, 'a', cell.text);
              linkNode.href = cell.link;
            } else {
              out.push(cell.text);
            }
            if (!cell.alignRight)
              out.push(paddingStr);
            out.push(spacingStr);
          }
        }
        out.push('\n');
      }

      // Remove spacer row under the header row, if one was added.
      if (this.hasHeaderRow_)
        this.rows_.splice(1, 1);

      addTextNode(pre, out.join(''));
    },

    /**
     * Adds a new HTML table to the node |parent| using the specified style.
     */
    toHTML: function(parent, style) {
      var numRows = this.rows_.length;
      var numColumns = this.getNumColumns();

      var table = addNode(parent, 'table');
      table.setAttribute('class', style);

      var thead = addNode(table, 'thead');
      var tbody = addNode(table, 'tbody');

      // Add title, if needed.
      if (this.title_) {
        var tableTitleRow = addNode(thead, 'tr');
        var tableTitle = addNodeWithText(tableTitleRow, 'th', this.title_);
        tableTitle.colSpan = numColumns;
        tableTitle.classList.add('title');
      }

      // Fill table body, adding header row first, if needed.
      for (var r = 0; r < numRows; ++r) {
        var cellType;
        var row;
        if (r == 0 && this.hasHeaderRow_) {
          row = addNode(thead, 'tr');
          cellType = 'th';
        } else {
          row = addNode(tbody, 'tr');
          cellType = 'td';
        }
        for (var c = 0; c < numColumns; ++c) {
          var cell = this.getCell_(r, c);
          if (cell) {
            var tableCell = addNode(row, cellType, cell.text);
            if (cell.alignRight)
              tableCell.alignRight = true;
            // If allowing overflow on the rightmost cell of a row,
            // make the cell span the rest of the columns.  Otherwise,
            // ignore the flag.
            if (cell.allowOverflow && !this.getCell_(r, c + 1))
              tableCell.colSpan = numColumns - c;
            if (cell.link) {
              var linkNode = addNodeWithText(tableCell, 'a', cell.text);
              linkNode.href = cell.link;
            } else {
              addTextNode(tableCell, cell.text);
            }
          }
        }
      }
      return table;
    }
  };

  /**
   * Links are only used in HTML tables.
   */
  function TablePrinterCell(value) {
    this.text = '' + value;
    this.link = null;
    this.alignRight = false;
    this.allowOverflow = false;
  }

  return TablePrinter;
})();
// view.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * TODO(eroman): This is an old abstraction, switch to custom element instead.
 */
var View = (function() {
  'use strict';

  /**
   * @constructor
   */
  function View() {
    this.isVisible_ = true;
  }

  View.prototype = {
    /**
     * Called to show/hide the view.
     */
    show: function(isVisible) {
      this.isVisible_ = isVisible;
    },

    isVisible: function() {
      return this.isVisible_;
    },

    /**
     * Method of the observer class.
     *
     * Called to check if an observer needs the data it is
     * observing to be actively updated.
     */
    isActive: function() {
      return this.isVisible();
    },

    setParameters: function(params) {},

    /**
     * Called when loading a log file, after clearing all events, but before
     * loading the new ones.  |polledData| contains the data from all
     * PollableData helpers.  |tabData| contains the data for the particular
     * tab.  |logDump| is the entire log dump, which includes the other two
     * values.  It's included separately so most views don't have to depend on
     * its specifics.
     */
    onLoadLogStart: function(polledData, tabData, logDump) {},

    /**
     * Called as the final step of loading a log file.  Arguments are the same
     * as onLoadLogStart.  Returns true to indicate the tab should be shown,
     * false otherwise.
     */
    onLoadLogFinish: function(polledData, tabData, logDump) {
      return false;
    }
  };

  return View;
})();

//-----------------------------------------------------------------------------

/**
 * TODO(eroman): This is an old abstraction, switch to custom element instead.
 */
var DivView = (function() {
  'use strict';

  // We inherit from View.
  var superClass = View;

  /**
   * @constructor
   */
  function DivView(divId) {
    // Call superclass's constructor.
    superClass.call(this);

    this.node_ = $(divId);
    if (!this.node_)
      throw new Error('Element ' + divId + ' not found');

    this.isVisible_ = this.node_.style.display != 'none';
  }

  DivView.prototype = {
    // Inherit the superclass's methods.
    __proto__: superClass.prototype,

    show: function(isVisible) {
      superClass.prototype.show.call(this, isVisible);

      // TODO(eroman): In the process of getting rid of this view
      // hiearchy and just using custom elements directly. DivView is mostly
      // used to represent a custom element, however the root node is the first
      // node within the custom element, rather than the custom element itself.
      // To work around this, if it looks like this is the root of a custom
      // element, change the visibility of the custom element.
      let n = this.node_;
      if (this.node_.parentNode.nodeName.includes('-')) {
        n = this.node_.parentNode;
      }

      setNodeDisplay(n, isVisible);
    },

    /**
     * Returns the wrapped DIV
     */
    getNode: function() {
      return this.node_;
    }
  };

  return DivView;
})();
// mouse_over_help.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Class to handle display and placement of a div that appears under the cursor
 * when it overs over a specied element.  The div always appears below and to
 * the left of the cursor.
 */
var MouseOverHelp = (function() {
  'use strict';

  /**
   * @param {string} helpDivId Name of the div to position and display
   * @param {string} mouseOverElementId Name the element that displays the
   *     |helpDivId| div on mouse over.
   * @constructor
   */
  function MouseOverHelp(helpDivId, mouseOverElementId) {
    this.node_ = $(helpDivId);

    $(mouseOverElementId).onmouseover = this.onMouseOver.bind(this);
    $(mouseOverElementId).onmouseout = this.onMouseOut.bind(this);

    this.show(false);
  }

  MouseOverHelp.prototype = {
    /**
     * Positions and displays the div, if not already visible.
     * @param {MouseEvent} event Mouse event that triggered the call.
     */
    onMouseOver: function(event) {
      if (this.isVisible_)
        return;

      this.node_.style.position = 'absolute';

      this.show(true);

      this.node_.style.left = (event.clientX + 15).toFixed(0) + 'px';
      this.node_.style.top = event.clientY.toFixed(0) + 'px';
    },

    /**
     * Hides the div when the cursor leaves the hover element.
     * @param {MouseEvent} event Mouse event that triggered the call.
     */
    onMouseOut: function(event) {
      this.show(false);
    },

    /**
     * Sets the div's visibility.
     * @param {boolean} isVisible True if the help div should be shown.
     */
    show: function(isVisible) {
      setNodeDisplay(this.node_, isVisible);
      this.isVisible_ = isVisible;
    },
  };

  return MouseOverHelp;
})();
// tab_switcher_view.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Controller and View for switching between tabs.
 *
 * The View part of TabSwitcherView displays the contents of the currently
 * selected tab (only one tab can be active at a time).
 *
 * The controller part of TabSwitcherView hooks up a dropdown menu (i.e. HTML
 * SELECT) to control switching between tabs.
 */
var TabSwitcherView = (function() {
  'use strict';

  // We inherit from View.
  var superClass = View;

  var TAB_LIST_ID = 'tab-list';

  /**
   * @constructor
   *
   * @param {?Function} opt_onTabSwitched Optional callback to run when the
   *                    active tab changes. Called as
   *                    opt_onTabSwitched(oldTabId, newTabId).
   */
  function TabSwitcherView(opt_onTabSwitched) {
    assertFirstConstructorCall(TabSwitcherView);

    this.tabIdToView_ = {};
    this.tabIdToLink_ = {};
    // Map from tab id to the views link visiblity.
    this.tabIdsLinkVisibility_ = new Map();
    this.activeTabId_ = null;

    this.onTabSwitched_ = opt_onTabSwitched;

    // The ideal width of the tab list.  If width is reduced below this, the
    // tab list will be shrunk, but it will be returned to this width once it
    // can be.
    this.tabListWidth_ = $(TAB_LIST_ID).offsetWidth;

    superClass.call(this);
  }

  TabSwitcherView.prototype = {
    // Inherit the superclass's methods.
    __proto__: superClass.prototype,

    show: function(isVisible) {
      superClass.prototype.show.call(this, isVisible);
      var activeView = this.getActiveTabView();
      if (activeView)
        activeView.show(isVisible);
    },

    // ---------------------------------------------

    /**
     * Adds a new tab (initially hidden).  To ensure correct tab list sizing,
     * may only be called before first layout.
     *
     * @param {string} tabId The ID to refer to the tab by.
     * @param {!View} view The tab's actual contents.
     * @param {string} name The name for the menu item that selects the tab.
     */
    addTab: function(tabId, view, name, hash) {
      if (!tabId) {
        throw Error('Must specify a non-false tabId');
      }

      this.tabIdToView_[tabId] = view;
      this.tabIdsLinkVisibility_.set(tabId, true);

      var node = addNodeWithText($(TAB_LIST_ID), 'a', name);
      node.href = hash;
      this.tabIdToLink_[tabId] = node;
      addNode($(TAB_LIST_ID), 'br');

      // Tab content views start off hidden.
      view.show(false);

      this.tabListWidth_ = $(TAB_LIST_ID).offsetWidth;
    },

    showTabLink: function(tabId, isVisible) {
      var wasActive = this.activeTabId_ == tabId;

      setNodeDisplay(this.tabIdToLink_[tabId], isVisible);
      this.tabIdsLinkVisibility_.set(tabId, isVisible);

      if (wasActive && !isVisible) {
        // If the link for active tab is being hidden, then switch to the first
        // tab which is still visible.
        for (var [localTabId, enabled] of this.tabIdsLinkVisibility_) {
          if (enabled) {
            this.switchToTab(localTabId);
            break;
          }
        }
      }
    },

    getAllTabViews: function() {
      return this.tabIdToView_;
    },

    getTabView: function(tabId) {
      return this.tabIdToView_[tabId];
    },

    getActiveTabView: function() {
      return this.tabIdToView_[this.activeTabId_];
    },

    getActiveTabId: function() {
      return this.activeTabId_;
    },

    /**
     * Changes the currently active tab to |tabId|. This has several effects:
     *   (1) Replace the tab contents view with that of the new tab.
     *   (2) Update the dropdown menu's current selection.
     *   (3) Invoke the optional onTabSwitched callback.
     */
    switchToTab: function(tabId) {
      var newView = this.getTabView(tabId);

      if (!newView) {
        throw Error('Invalid tabId');
      }

      var oldTabId = this.activeTabId_;
      this.activeTabId_ = tabId;

      if (oldTabId) {
        this.tabIdToLink_[oldTabId].classList.remove('selected');
        // Hide the previously visible tab contents.
        this.getTabView(oldTabId).show(false);
      }

      this.tabIdToLink_[tabId].classList.add('selected');

      newView.show(this.isVisible());

      if (this.onTabSwitched_)
        this.onTabSwitched_(oldTabId, tabId);
    },
  };

  return TabSwitcherView;
})();
// import_view.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * This view displays options for importing data from a log file.
 */
var ImportView = (function() {
  'use strict';

  // We inherit from DivView.
  var superClass = DivView;

  /**
   * @constructor
   */
  function ImportView() {
    assertFirstConstructorCall(ImportView);

    // Call superclass's constructor.
    superClass.call(this, ImportView.MAIN_BOX_ID);

    this.loadedDiv_ = $(ImportView.LOADED_DIV_ID);

    this.loadFileElement_ = $(ImportView.LOAD_LOG_FILE_ID);
    this.loadFileElement_.onchange = this.logFileChanged.bind(this);
    this.loadStatusText_ = $(ImportView.LOAD_STATUS_TEXT_ID);

    var dropTarget = document.body;
    dropTarget.ondragenter = this.onDrag.bind(this);
    dropTarget.ondragover = this.onDrag.bind(this);
    dropTarget.ondrop = this.onDrop.bind(this);
  }

  ImportView.TAB_ID = 'tab-handle-import';
  ImportView.TAB_NAME = 'Import';
  ImportView.TAB_HASH = '#import';

  // IDs for special HTML elements in import_view.html.
  ImportView.MAIN_BOX_ID = 'import-view-tab-content';
  ImportView.LOADED_DIV_ID = 'import-view-loaded-div';
  ImportView.LOAD_LOG_FILE_ID = 'import-view-load-log-file';
  ImportView.LOAD_STATUS_TEXT_ID = 'import-view-load-status-text';

  // IDs for HTML elements pertaining to log dump information.
  ImportView.LOADED_INFO_NUMERIC_DATE_ID = 'import-view-numericDate';
  ImportView.LOADED_INFO_CAPTURE_MODE_ID = 'import-view-capture-mode';
  ImportView.LOADED_INFO_NAME_ID = 'import-view-name';
  ImportView.LOADED_INFO_VERSION_ID = 'import-view-version';
  ImportView.LOADED_INFO_OFFICIAL_ID = 'import-view-official';
  ImportView.LOADED_INFO_CL_ID = 'import-view-cl';
  ImportView.LOADED_INFO_VERSION_MOD_ID = 'import-view-version-mod';
  ImportView.LOADED_INFO_OS_TYPE_ID = 'import-view-os-type';
  ImportView.LOADED_INFO_COMMAND_LINE_ID = 'import-view-command-line';
  ImportView.LOADED_INFO_ACTIVE_FIELD_TRIAL_GROUPS_ID =
      'import-view-activeFieldTrialGroups';
  ImportView.LOADED_INFO_ROW_ADDED_FIELD_TRIAL_GROUPS_ID =
      'import-view-row-addedFieldTrialGroups';
  ImportView.LOADED_INFO_ADDED_FIELD_TRIAL_GROUPS_ID =
      'import-view-addedFieldTrialGroups';
  ImportView.LOADED_INFO_ROW_REMOVED_FIELD_TRIAL_GROUPS_ID =
      'import-view-row-removedFieldTrialGroups';
  ImportView.LOADED_INFO_REMOVED_FIELD_TRIAL_GROUPS_ID =
      'import-view-removedFieldTrialGroups';
  ImportView.LOADED_INFO_ROW_USER_COMMENTS_ID = 'import-view-row-user-comments';
  ImportView.LOADED_INFO_USER_COMMENTS_ID = 'import-view-user-comments';

  cr.addSingletonGetter(ImportView);

  ImportView.prototype = {
    // Inherit the superclass's methods.
    __proto__: superClass.prototype,

    /**
     * Called when a log file is loaded, after clearing the old log entries and
     * loading the new ones.  Returns true to indicate the view should
     * still be visible.
     */
    onLoadLogFinish(polledData, unused, logDump) {
      $(ImportView.LOADED_INFO_NUMERIC_DATE_ID).textContent =
          timeutil.dateToString(new Date(Constants.clientInfo.numericDate));
      $(ImportView.LOADED_INFO_CAPTURE_MODE_ID).textContent =
          Constants.logCaptureMode || '(Not Recorded)';
      $(ImportView.LOADED_INFO_NAME_ID).textContent =
          Constants.clientInfo.name;
      $(ImportView.LOADED_INFO_VERSION_ID).textContent =
          Constants.clientInfo.version;
      $(ImportView.LOADED_INFO_OFFICIAL_ID).textContent =
          Constants.clientInfo.official;
      $(ImportView.LOADED_INFO_CL_ID).textContent =
          Constants.clientInfo.cl;
      $(ImportView.LOADED_INFO_VERSION_MOD_ID).textContent =
          Constants.clientInfo.version_mod;
      $(ImportView.LOADED_INFO_OS_TYPE_ID).textContent =
          Constants.clientInfo.os_type;
      $(ImportView.LOADED_INFO_COMMAND_LINE_ID).textContent =
          Constants.clientInfo.command_line;
      this.displayTrials_(Constants.activeFieldTrialGroups,
                          polledData.activeFieldTrialGroups);
      this.displayUserComments_(logDump.userComments);
      setNodeDisplay(this.loadedDiv_, true);
      return true;
    },

    /**
     * Display the active Field Trials and Trials activated or deactivated
     * during the capture (if possible).
     */
    displayTrials_(trialsAtStart, trialsAtEnd) {
      if (trialsAtStart && trialsAtStart.constructor !== Array) {
        trialsAtStart = undefined;
      }
      if (trialsAtEnd && trialsAtEnd.constructor !== Array) {
        trialsAtEnd = undefined;
      }

      // Display the Active Trials, preferring the list of Trials Active at the
      // end of the capture, if available. |trialsAtEnd| is absent from netlogs
      // captured before Chrome 88, and logs captured using the command-line
      // --log-net-log command (crbug.com/739487).
      $(ImportView.LOADED_INFO_ACTIVE_FIELD_TRIAL_GROUPS_ID).textContent =
          (trialsAtEnd || trialsAtStart || []).join(' ');

      // Calculate and display the lists of Trials activated or deactivated
      // during the capture.
      const rowAdded =
          $(ImportView.LOADED_INFO_ROW_ADDED_FIELD_TRIAL_GROUPS_ID);
      const rowRemoved =
          $(ImportView.LOADED_INFO_ROW_REMOVED_FIELD_TRIAL_GROUPS_ID);

      // Without Field Trial lists recorded at both the start and the end of the
      // capture, we cannot calculate the diff.
      if (!trialsAtStart || !trialsAtEnd) {
        setNodeDisplay(rowAdded, false);
        setNodeDisplay(rowRemoved, false);
        return;
      }

      // Helper to render the Diff between two lists of Trials.
      function showDiff(listFirst, listSecond, rowDiff, spanDiff) {
        const setSecond = new Set(listSecond);
        const listDiff = listFirst.filter(item => !setSecond.has(item));
        spanDiff.textContent = listDiff.join(' ');
        setNodeDisplay(rowDiff, listDiff.length > 0);
      }

      // Display Field Trials activated during the capture.
      showDiff(trialsAtEnd, trialsAtStart, rowAdded,
               $(ImportView.LOADED_INFO_ADDED_FIELD_TRIAL_GROUPS_ID));
      // Display Field Trials deactivated during the capture.
      showDiff(trialsAtStart, trialsAtEnd, rowRemoved,
               $(ImportView.LOADED_INFO_REMOVED_FIELD_TRIAL_GROUPS_ID));
    },

    /**
     * Display User Comments (if any).
     */
    displayUserComments_(comments) {
      $(ImportView.LOADED_INFO_USER_COMMENTS_ID).textContent = comments || '';
      setNodeDisplay($(ImportView.LOADED_INFO_ROW_USER_COMMENTS_ID),
                     !!comments);
    },

    /**
     * Prevent default browser behavior when a file is dragged over the page to
     * allow our onDrop() handler to handle the drop.
     */
    onDrag(event) {
      if (event.dataTransfer.types.includes('Files')) {
        event.preventDefault();
      }
    },

    /**
     * If a single file is dropped, try to load it as a log file.
     */
    onDrop(event) {
      if (event.dataTransfer.files.length !== 1) {
        return;
      }

      event.preventDefault();

      // Loading a log file may hide the currently active tab.  Switch to the
      // import tab to prevent this.
      document.location.hash = 'import';

      this.loadLogFile(event.dataTransfer.files[0]);
    },

    /**
     * Called when a log file is selected.
     *
     * Gets the log file from the input element and tries to read from it.
     */
    logFileChanged() { this.loadLogFile(this.loadFileElement_.files[0]); },

    /**
     * Attempts to read from the File |logFile|.
     */
    loadLogFile(logFile) {
      if (logFile) {
        this.setLoadFileStatus('Loading log...', true);
        var fileReader = new FileReader();
        fileReader.onerror = this.onLoadLogFileError.bind(this);

        if (logFile.name.toLowerCase().endsWith('.zip')) {
          fileReader.onload = this.onLoadZip.bind(this, logFile);
          fileReader.readAsArrayBuffer(logFile);
        } else {
          fileReader.onload = this.onLoadLogFile.bind(this, logFile);
          fileReader.readAsText(logFile);
        }
      }
    },

    /**
     * Opens a ZIP and finds the first *.json file within, then attempts to
     * decompress the JSON content and parse it as a netlog.
     */
    onLoadZip(logFile, data) {
      const zip = new JSZip();
      zip.loadAsync(data.target.result)
          .then(zip => {
            for (const filename in zip.files) {
              if (!filename.toLowerCase().endsWith('.json')) {
                console.log('Netlog Import skipping: ' + filename);
                continue;
              }

              zip.files[filename].async('string').then(content => {
                var result = LogUtil.loadLogFile(content, logFile.name +
                                                              '::' + filename);
                this.setLoadFileStatus(result, false);
              });
              // We only attempt to parse one log.
              return;
            }
            // If we made it this far, we did not find any JSON.
            throw new Error('The ZIP file did not contain a netlog.json file.');
          })
          .catch(e => {
            console.log('ZIP load failed: ' + e.message);
            this.loadFileElement_.value = null;
            this.setLoadFileStatus(
                'Error: Unable to find json inside the ZIP file.', false);
          });
    },

    /**
     * Displays an error message when unable to read the selected log file.
     * Also clears the file input control, so the same file can be reloaded.
     */
    onLoadLogFileError(event) {
      this.loadFileElement_.value = null;
      this.setLoadFileStatus(
          'Error ' + getKeyWithValue(FileError, event.target.error.code) +
              '.  Unable to read file.',
          false);
    },

    onLoadLogFile(logFile, event) {
      var result = LogUtil.loadLogFile(event.target.result, logFile.name);
      this.setLoadFileStatus(result, false);
    },

    /**
     * Sets the load from file status text, displayed below the load file
     * button, to |text|. Also enables or disables the load buttons based on
     * the value of |isLoading|, which must be true if the load process is still
     * ongoing, and false when the operation has stopped, regardless of success
     * of failure. Also, when loading is done, clears the file input control, so
     * the same file can be reloaded.
     */
    setLoadFileStatus(text, isLoading) {
      this.enableLoadFileElement_(!isLoading);
      this.loadStatusText_.textContent = text;

      if (!isLoading) {
        // Clear the input, so the same file can be reloaded.
        this.loadFileElement_.value = null;
      }

      // Style the log output differently depending on what just happened.
      const pos = text.indexOf('Log loaded.');
      if (isLoading) {
        this.loadStatusText_.className = 'import-view-pending-log';
      } else if (pos == 0) {
        this.loadStatusText_.className = 'import-view-success-log';
      } else if (pos != -1) {
        this.loadStatusText_.className = 'import-view-warning-log';
      } else {
        this.loadStatusText_.className = 'import-view-error-log';
      }
    },

    enableLoadFileElement_(enabled) {
      this.loadFileElement_.disabled = !enabled;
    },
  };

  return ImportView;
})();
// http_cache_view.js
// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * This view displays information on the HTTP cache.
 */
var HttpCacheView = (function() {
  'use strict';

  // We inherit from DivView.
  var superClass = DivView;

  /**
   *  @constructor
   */
  function HttpCacheView() {
    assertFirstConstructorCall(HttpCacheView);

    // Call superclass's constructor.
    superClass.call(this, HttpCacheView.MAIN_BOX_ID);

    this.statsDiv_ = $(HttpCacheView.STATS_DIV_ID);

    // Register to receive http cache info.
    g_browser.addHttpCacheInfoObserver(this, true);
  }

  HttpCacheView.TAB_ID = 'tab-handle-http-cache';
  HttpCacheView.TAB_NAME = 'Cache';
  HttpCacheView.TAB_HASH = '#httpCache';

  // IDs for special HTML elements in http_cache_view.html
  HttpCacheView.MAIN_BOX_ID = 'http-cache-view-tab-content';
  HttpCacheView.STATS_DIV_ID = 'http-cache-view-cache-stats';

  cr.addSingletonGetter(HttpCacheView);

  HttpCacheView.prototype = {
    // Inherit the superclass's methods.
    __proto__: superClass.prototype,

    onLoadLogFinish: function(data) {
      return this.onHttpCacheInfoChanged(data.httpCacheInfo);
    },

    onHttpCacheInfoChanged: function(info) {
      this.statsDiv_.innerHTML = '';

      if (!info)
        return false;

      // Print the statistics.
      var statsUl = addNode(this.statsDiv_, 'ul');
      for (var statName in info.stats) {
        var li = addNode(statsUl, 'li');
        addTextNode(li, statName + ': ' + info.stats[statName]);
      }
      return true;
    }
  };

  return HttpCacheView;
})();
// browser_bridge.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

// Populated by constants from the browser.  Used only by this file.
let NetInfoSources = null;

/**
 * This class provides a "bridge" for communicating between the javascript and
 * the browser.
 */
const BrowserBridge = (function() {
  /**
   * Delay in milliseconds between updates of certain browser information.
   */
  const POLL_INTERVAL_MS = 5000;

  /**
   * @constructor
   */
  function BrowserBridge() {
    assertFirstConstructorCall(BrowserBridge);

    // List of observers for various bits of browser state.
    this.constantsObservers_ = [];

    this.pollableDataHelpers_ = {};

    // Add PollableDataHelpers for NetInfoSources, which retrieve information
    // directly from the network stack.
    this.addNetInfoPollableDataHelper(
        'proxySettings', 'onProxySettingsChanged');
    this.addNetInfoPollableDataHelper('badProxies', 'onBadProxiesChanged');
    this.addNetInfoPollableDataHelper(
        'hostResolverInfo', 'onHostResolverInfoChanged');
    this.addNetInfoPollableDataHelper(
        'socketPoolInfo', 'onSocketPoolInfoChanged');
    this.addNetInfoPollableDataHelper(
        'spdySessionInfo', 'onSpdySessionInfoChanged');
    this.addNetInfoPollableDataHelper('spdyStatus', 'onSpdyStatusChanged');
    this.addNetInfoPollableDataHelper(
        'altSvcMappings', 'onAltSvcMappingsChanged');
    this.addNetInfoPollableDataHelper('quicInfo', 'onQuicInfoChanged');
    this.addNetInfoPollableDataHelper(
        'reportingInfo', 'onReportingInfoChanged');
    this.addNetInfoPollableDataHelper(
        'httpCacheInfo', 'onHttpCacheInfoChanged');

    // Add other PollableDataHelpers.
    this.pollableDataHelpers_.serviceProviders = new PollableDataHelper(
        'onServiceProvidersChanged');
    this.pollableDataHelpers_.prerenderInfo = new PollableDataHelper(
        'onPrerenderInfoChanged');
    this.pollableDataHelpers_.extensionInfo = new PollableDataHelper(
        'onExtensionInfoChanged');
  }

  cr.addSingletonGetter(BrowserBridge);

  BrowserBridge.prototype = {

    // -------------------------------------------------------------------------
    // Messages received from the browser.
    // -------------------------------------------------------------------------

    receivedConstants(constants) {
      NetInfoSources = constants.netInfoSources;
      for (let i = 0; i < this.constantsObservers_.length; i++) {
        this.constantsObservers_[i].onReceivedConstants(constants);
      }
    },

    receivedLogEntries(logEntries) {
      EventsTracker.getInstance().addLogEntries(logEntries);
    },

    receivedNetInfo(netInfo) {
      // Dispatch |netInfo| to the various PollableDataHelpers listening to
      // each field it contains.
      //
      // Currently information is only received from one source at a time, but
      // the API does allow for data from more that one to be requested at once.
      for (const source in netInfo) {
        this.pollableDataHelpers_[source].update(netInfo[source]);
      }
    },

    receivedServiceProviders(serviceProviders) {
      this.pollableDataHelpers_.serviceProviders.update(serviceProviders);
    },

    receivedPrerenderInfo(prerenderInfo) {
      this.pollableDataHelpers_.prerenderInfo.update(prerenderInfo);
    },

    receivedExtensionInfo(extensionInfo) {
      this.pollableDataHelpers_.extensionInfo.update(extensionInfo);
    },

    receivedDataReductionProxyInfo(dataReductionProxyInfo) {
      this.pollableDataHelpers_.dataReductionProxyInfo.update(
          dataReductionProxyInfo);
    },

    // -------------------------------------------------------------------------

    /**
     * Adds a listener of the proxy settings. |observer| will be called back
     * when data is received, through:
     *
     *   observer.onProxySettingsChanged(proxySettings)
     *
     * |proxySettings| is a dictionary with (up to) two properties:
     *
     *   "original"  -- The settings that chrome was configured to use
     *                  (i.e. system settings.)
     *   "effective" -- The "effective" proxy settings that chrome is using.
     *                  (decides between the manual/automatic modes of the
     *                  fetched settings).
     *
     * Each of these two configurations is formatted as a string, and may be
     * omitted if not yet initialized.
     *
     * If |ignoreWhenUnchanged| is true, data is only sent when it changes.
     * If it's false, data is sent whenever it's received from the browser.
     */
    addProxySettingsObserver(observer, ignoreWhenUnchanged) {
      this.pollableDataHelpers_.proxySettings.addObserver(
          observer, ignoreWhenUnchanged);
    },

    /**
     * Adds a listener of the proxy settings. |observer| will be called back
     * when data is received, through:
     *
     *   observer.onBadProxiesChanged(badProxies)
     *
     * |badProxies| is an array, where each entry has the property:
     *   badProxies[i].proxy_uri: String identify the proxy.
     *   badProxies[i].bad_until: The time when the proxy stops being considered
     *                            bad. Note the time is in time ticks.
     */
    addBadProxiesObserver(observer, ignoreWhenUnchanged) {
      this.pollableDataHelpers_.badProxies.addObserver(
          observer, ignoreWhenUnchanged);
    },

    /**
     * Adds a listener of the host resolver info. |observer| will be called back
     * when data is received, through:
     *
     *   observer.onHostResolverInfoChanged(hostResolverInfo)
     */
    addHostResolverInfoObserver(observer, ignoreWhenUnchanged) {
      this.pollableDataHelpers_.hostResolverInfo.addObserver(
          observer, ignoreWhenUnchanged);
    },

    /**
     * Adds a listener of the socket pool. |observer| will be called back
     * when data is received, through:
     *
     *   observer.onSocketPoolInfoChanged(socketPoolInfo)
     */
    addSocketPoolInfoObserver(observer, ignoreWhenUnchanged) {
      this.pollableDataHelpers_.socketPoolInfo.addObserver(
          observer, ignoreWhenUnchanged);
    },

    /**
     * Adds a listener of the QUIC info. |observer| will be called back
     * when data is received, through:
     *
     *   observer.onQuicInfoChanged(quicInfo)
     */
    addQuicInfoObserver(observer, ignoreWhenUnchanged) {
      this.pollableDataHelpers_.quicInfo.addObserver(
          observer, ignoreWhenUnchanged);
    },

    /**
     * Adds a listener of the Reporting info. |observer| will be called back
     * when data is received, through:
     *
     *   observer.onReportingInfoChanged(reportingInfo)
     */
    addReportingInfoObserver(observer, ignoreWhenUnchanged) {
      this.pollableDataHelpers_.reportingInfo.addObserver(
          observer, ignoreWhenUnchanged);
    },

    /**
     * Adds a listener of the SPDY info. |observer| will be called back
     * when data is received, through:
     *
     *   observer.onSpdySessionInfoChanged(spdySessionInfo)
     */
    addSpdySessionInfoObserver(observer, ignoreWhenUnchanged) {
      this.pollableDataHelpers_.spdySessionInfo.addObserver(
          observer, ignoreWhenUnchanged);
    },

    /**
     * Adds a listener of the SPDY status. |observer| will be called back
     * when data is received, through:
     *
     *   observer.onSpdyStatusChanged(spdyStatus)
     */
    addSpdyStatusObserver(observer, ignoreWhenUnchanged) {
      this.pollableDataHelpers_.spdyStatus.addObserver(
          observer, ignoreWhenUnchanged);
    },

    /**
     * Adds a listener of the altSvcMappings. |observer| will be
     * called back when data is received, through:
     *
     *   observer.onAltSvcMappingsChanged(altSvcMappings)
     */
    addAltSvcMappingsObserver(observer, ignoreWhenUnchanged) {
      this.pollableDataHelpers_.altSvcMappings.addObserver(
          observer, ignoreWhenUnchanged);
    },

    /**
     * Adds a listener of the service providers info. |observer| will be called
     * back when data is received, through:
     *
     *   observer.onServiceProvidersChanged(serviceProviders)
     *
     * Will do nothing if on a platform other than Windows, as service providers
     * are only present on Windows.
     */
    addServiceProvidersObserver(observer, ignoreWhenUnchanged) {
      if (this.pollableDataHelpers_.serviceProviders) {
        this.pollableDataHelpers_.serviceProviders.addObserver(
            observer, ignoreWhenUnchanged);
      }
    },

    /**
     * Adds a listener for the http cache info results.
     * The observer will be called back with:
     *
     *   observer.onHttpCacheInfoChanged(info);
     */
    addHttpCacheInfoObserver(observer, ignoreWhenUnchanged) {
      this.pollableDataHelpers_.httpCacheInfo.addObserver(
          observer, ignoreWhenUnchanged);
    },

    /**
     * Adds a listener for the received constants event. |observer| will be
     * called back when the constants are received, through:
     *
     *   observer.onReceivedConstants(constants);
     */
    addConstantsObserver(observer) {
      this.constantsObservers_.push(observer);
    },

    /**
     * Adds a listener for updated prerender info events
     * |observer| will be called back with:
     *
     *   observer.onPrerenderInfoChanged(prerenderInfo);
     */
    addPrerenderInfoObserver(observer, ignoreWhenUnchanged) {
      this.pollableDataHelpers_.prerenderInfo.addObserver(
          observer, ignoreWhenUnchanged);
    },

    /**
     * Adds a listener of extension information. |observer| will be called
     * back when data is received, through:
     *
     *   observer.onExtensionInfoChanged(extensionInfo)
     */
    addExtensionInfoObserver(observer, ignoreWhenUnchanged) {
      this.pollableDataHelpers_.extensionInfo.addObserver(
          observer, ignoreWhenUnchanged);
    },

    /**
     * Adds a PollableDataHelper that listens to the specified NetInfoSource.
     */
    addNetInfoPollableDataHelper(sourceName, observerMethodName) {
      this.pollableDataHelpers_[sourceName] = new PollableDataHelper(
          observerMethodName);
    },
  };

  /**
   * This is a helper class used by BrowserBridge, to keep track of:
   *   - the list of observers interested in some piece of data.
   *   - the last known value of that piece of data.
   *   - the name of the callback method to invoke on observers.
   *   - the update function.
   * @constructor
   */
  function PollableDataHelper(observerMethodName) {
    this.observerMethodName_ = observerMethodName;
    this.observerInfos_ = [];
  }

  PollableDataHelper.prototype = {
    getObserverMethodName() {
      return this.observerMethodName_;
    },

    isObserver(object) {
      for (let i = 0; i < this.observerInfos_.length; i++) {
        if (this.observerInfos_[i].observer === object) {
          return true;
        }
      }
      return false;
    },

    /**
     * If |ignoreWhenUnchanged| is true, we won't send data again until it
     * changes.
     */
    addObserver(observer, ignoreWhenUnchanged) {
      this.observerInfos_.push(new ObserverInfo(observer, ignoreWhenUnchanged));
    },

    removeObserver(observer) {
      for (let i = 0; i < this.observerInfos_.length; i++) {
        if (this.observerInfos_[i].observer === observer) {
          this.observerInfos_.splice(i, 1);
          return;
        }
      }
    },

    /**
     * Helper function to handle calling all the observers, but ONLY if the data
     * has actually changed since last time or the observer has yet to receive
     * any data. This is used for data we received from browser on an update
     * loop.
     */
    update(data) {
      const prevData = this.currentData_;
      let changed = false;

      // If the data hasn't changed since last time, will only need to notify
      // observers that have not yet received any data.
      if (!prevData || JSON.stringify(prevData) !== JSON.stringify(data)) {
        changed = true;
        this.currentData_ = data;
      }

      // Notify the observers of the change, as needed.
      for (let i = 0; i < this.observerInfos_.length; i++) {
        const observerInfo = this.observerInfos_[i];
        if (changed || !observerInfo.hasReceivedData ||
            !observerInfo.ignoreWhenUnchanged) {
          observerInfo.observer[this.observerMethodName_](this.currentData_);
          observerInfo.hasReceivedData = true;
        }
      }
    },

    /**
     * Returns true if one of the observers actively wants the data
     * (i.e. is visible).
     */
    hasActiveObserver() {
      for (let i = 0; i < this.observerInfos_.length; i++) {
        if (this.observerInfos_[i].observer.isActive()) {
          return true;
        }
      }
      return false;
    }
  };

  /**
   * This is a helper class used by PollableDataHelper, to keep track of
   * each observer and whether or not it has received any data.  The
   * latter is used to make sure that new observers get sent data on the
   * update following their creation.
   * @constructor
   */
  function ObserverInfo(observer, ignoreWhenUnchanged) {
    this.observer = observer;
    this.hasReceivedData = false;
    this.ignoreWhenUnchanged = ignoreWhenUnchanged;
  }

  return BrowserBridge;
})();
// events_tracker.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var EventsTracker = (function() {
  'use strict';

  /**
   * This class keeps track of all NetLog events.
   * It receives events from the browser and when loading a log file, and passes
   * them on to all its observers.
   *
   * @constructor
   */
  function EventsTracker() {
    assertFirstConstructorCall(EventsTracker);

    this.capturedEvents_ = [];
    this.observers_ = [];

    // Controls how large |capturedEvents_| can grow.
    this.softLimit_ = Infinity;
    this.hardLimit_ = Infinity;
  }

  cr.addSingletonGetter(EventsTracker);

  EventsTracker.prototype = {
    /**
     * Returns a list of all captured events.
     */
    getAllCapturedEvents: function() {
      return this.capturedEvents_;
    },

    /**
     * Returns the number of events that were captured.
     */
    getNumCapturedEvents: function() {
      return this.capturedEvents_.length;
    },

    /**
     * Deletes all the tracked events, and notifies any observers.
     */
    deleteAllLogEntries: function() {
      timeutil.clearBaseTime();
      this.capturedEvents_ = [];
      for (var i = 0; i < this.observers_.length; ++i)
        this.observers_[i].onAllLogEntriesDeleted();
    },

    /**
     * Adds captured events, and broadcasts them to any observers.
     */
    addLogEntries: function(logEntries) {
      // When reloading a page, it's possible to receive events before
      // Constants.  Discard those events, as they can cause the fake
      // "REQUEST_ALIVE" events for pre-existing requests not be the first
      // events for those requests.
      if (Constants == null)
        return;
      // This can happen when loading logs with no events.
      if (!logEntries.length)
        return;

      if (!timeutil.isBaseTimeSet()) {
        timeutil.setBaseTime(
            timeutil.convertTimeTicksToTime(logEntries[0].time));
      }

      this.capturedEvents_ = this.capturedEvents_.concat(logEntries);
      for (var i = 0; i < this.observers_.length; ++i) {
        this.observers_[i].onReceivedLogEntries(logEntries);
      }

      // Check that we haven't grown too big. If so, toss out older events.
      if (this.getNumCapturedEvents() > this.hardLimit_) {
        var originalEvents = this.capturedEvents_;
        this.deleteAllLogEntries();
        // Delete the oldest events until we reach the soft limit.
        originalEvents.splice(0, originalEvents.length - this.softLimit_);
        this.addLogEntries(originalEvents);
      }
    },

    /**
     * Adds a listener of log entries. |observer| will be called back when new
     * log data arrives or all entries are deleted:
     *
     *   observer.onReceivedLogEntries(entries)
     *   observer.onAllLogEntriesDeleted()
     */
    addLogEntryObserver: function(observer) {
      this.observers_.push(observer);
    },

    /**
     * Set bounds on the maximum number of events that will be tracked. This
     * helps to bound the total amount of memory usage, since otherwise
     * long-running capture sessions can exhaust the renderer's memory and
     * crash.
     *
     * Once |hardLimit| number of events have been captured we do a garbage
     * collection and toss out old events, bringing our count down to
     * |softLimit|.
     *
     * To log observers this will look like all the events got deleted, and
     * then subsequently a bunch of new events were received. In other words, it
     * behaves the same as if the user had simply started logging a bit later
     * in time!
     */
    setLimits: function(softLimit, hardLimit) {
      if (hardLimit != Infinity && softLimit >= hardLimit)
        throw 'hardLimit must be greater than softLimit';

      this.softLimit_ = softLimit;
      this.hardLimit_ = hardLimit;
    }
  };

  return EventsTracker;
})();
// source_tracker.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var SourceTracker = (function() {
  'use strict';

  /**
   * This class keeps track of all NetLog events, grouped into per-source
   * streams. It receives events from EventsTracker, and passes
   * them on to all its observers.
   *
   * @constructor
   */
  function SourceTracker() {
    assertFirstConstructorCall(SourceTracker);

    // Observers that only want to receive lists of updated SourceEntries.
    this.sourceEntryObservers_ = [];

    // True when times should be displayed as milliseconds since the first
    // event, as opposed to milliseconds since January 1, 1970.
    this.useRelativeTimes_ = true;

    this.clearEntries_();

    EventsTracker.getInstance().addLogEntryObserver(this);
  }

  cr.addSingletonGetter(SourceTracker);

  SourceTracker.prototype = {
    /**
     * Clears all log entries and SourceEntries and related state.
     */
    clearEntries_: function() {
      // Ordered list of log entries.  Needed to maintain original order when
      // generating log dumps
      this.capturedEvents_ = [];

      this.sourceEntries_ = {};
    },

    /**
     * Returns a list of all SourceEntries.
     */
    getAllSourceEntries: function() {
      return this.sourceEntries_;
    },

    /**
     * Returns the description of the specified SourceEntry, or an empty string
     * if it doesn't exist.
     */
    getDescription: function(id) {
      var entry = this.getSourceEntry(id);
      if (entry)
        return entry.getDescription();
      return '';
    },

    /**
     * Returns the specified SourceEntry.
     */
    getSourceEntry: function(id) {
      return this.sourceEntries_[id];
    },

    /**
     * Sends each entry to all observers and updates |capturedEvents_|.
     * Also assigns unique ids to log entries without a source.
     */
    onReceivedLogEntries: function(logEntries) {
      // List source entries with new log entries.  Sorted chronologically, by
      // first new log entry.
      var updatedSourceEntries = [];

      var updatedSourceEntryIdMap = {};

      for (var e = 0; e < logEntries.length; ++e) {
        var logEntry = logEntries[e];

        // Create/update SourceEntry object.
        var sourceEntry = this.sourceEntries_[logEntry.source.id];
        if (!sourceEntry) {
          sourceEntry = new SourceEntry(logEntry);
          this.sourceEntries_[logEntry.source.id] = sourceEntry;
        } else {
          sourceEntry.update(logEntry);
        }

        // Add to updated SourceEntry list, if not already in it.
        if (!updatedSourceEntryIdMap[logEntry.source.id]) {
          updatedSourceEntryIdMap[logEntry.source.id] = sourceEntry;
          updatedSourceEntries.push(sourceEntry);
        }
      }

      this.capturedEvents_ = this.capturedEvents_.concat(logEntries);
      for (var i = 0; i < this.sourceEntryObservers_.length; ++i) {
        this.sourceEntryObservers_[i].onSourceEntriesUpdated(
            updatedSourceEntries);
      }
    },

    /**
     * Called when all log events have been deleted.
     */
    onAllLogEntriesDeleted: function() {
      this.clearEntries_();
      for (var i = 0; i < this.sourceEntryObservers_.length; ++i)
        this.sourceEntryObservers_[i].onAllSourceEntriesDeleted();
    },

    /**
     * Sets the value of |useRelativeTimes_| and informs log observers
     * of the change.
     */
    setUseRelativeTimes: function(useRelativeTimes) {
      this.useRelativeTimes_ = useRelativeTimes;
      for (var i = 0; i < this.sourceEntryObservers_.length; ++i) {
        if (this.sourceEntryObservers_[i].onUseRelativeTimesChanged)
          this.sourceEntryObservers_[i].onUseRelativeTimesChanged();
      }
    },

    /**
     * Returns true if times should be displayed as milliseconds since the first
     * event.
     */
    getUseRelativeTimes: function() {
      return this.useRelativeTimes_;
    },

    /**
     * Adds a listener of SourceEntries. |observer| will be called back when
     * SourceEntries are added or modified or source entries are deleted.
     *
     *   observer.onSourceEntriesUpdated(sourceEntries)
     *   observer.onAllSourceEntriesDeleted()
     */
    addSourceEntryObserver: function(observer) {
      this.sourceEntryObservers_.push(observer);
    }
  };

  return SourceTracker;
})();
// resizable_vertical_split_view.js
// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * This view implements a vertically split display with a draggable divider.
 *
 *                  <<-- sizer --\x3e>
 *
 *  +----------------------++----------------+
 *  |                      ||                |
 *  |                      ||                |
 *  |                      ||                |
 *  |                      ||                |
 *  |       leftView       ||   rightView    |
 *  |                      ||                |
 *  |                      ||                |
 *  |                      ||                |
 *  |                      ||                |
 *  |                      ||                |
 *  +----------------------++----------------+
 *
 * @param {!View} leftView The widget to position on the left.
 * @param {!View} rightView The widget to position on the right.
 * @param {!DivView} sizerView The widget that will serve as draggable divider.
 */
var ResizableVerticalSplitView = (function() {
  'use strict';

  // Minimum width to size panels to, in pixels.
  var MIN_PANEL_WIDTH = 50;

  // We inherit from View.
  var superClass = View;

  /**
   * @constructor
   */
  function ResizableVerticalSplitView(leftView, rightView, sizerView) {
    // Call superclass's constructor.
    superClass.call(this);

    this.leftView_ = leftView;
    this.rightView_ = rightView;
    this.sizerView_ = sizerView;

    this.mouseDragging_ = false;
    this.touchDragging_ = false;

    // Setup the "sizer" so it can be dragged left/right to reposition the
    // vertical split.  The start event must occur within the sizer's node,
    // but subsequent events may occur anywhere.
    var node = sizerView.getNode();
    node.addEventListener('mousedown', this.onMouseDragSizerStart_.bind(this));
    window.addEventListener('mousemove', this.onMouseDragSizer_.bind(this));
    window.addEventListener('mouseup', this.onMouseDragSizerEnd_.bind(this));

    node.addEventListener('touchstart', this.onTouchDragSizerStart_.bind(this));
    window.addEventListener('touchmove', this.onTouchDragSizer_.bind(this));
    window.addEventListener('touchend', this.onTouchDragSizerEnd_.bind(this));
    window.addEventListener(
        'touchcancel', this.onTouchDragSizerEnd_.bind(this));
  }

  ResizableVerticalSplitView.prototype = {
    // Inherit the superclass's methods.
    __proto__: superClass.prototype,

    show: function(isVisible) {
      superClass.prototype.show.call(this, isVisible);
      this.leftView_.show(isVisible);
      this.sizerView_.show(isVisible);
      this.rightView_.show(isVisible);
    },

    /**
     * Called once the sizer is clicked on. Starts moving the sizer in response
     * to future mouse movement.
     */
    onMouseDragSizerStart_: function(event) {
      this.mouseDragging_ = true;
      event.preventDefault();
    },

    /**
     * Called when the mouse has moved.
     */
    onMouseDragSizer_: function(event) {
      if (!this.mouseDragging_)
        return;
      // If dragging has started, move the sizer.
      this.onDragSizer_(event.pageX);
      event.preventDefault();
    },

    /**
     * Called once the mouse has been released.
     */
    onMouseDragSizerEnd_: function(event) {
      if (!this.mouseDragging_)
        return;
      // Dragging is over.
      this.mouseDragging_ = false;
      event.preventDefault();
    },

    /**
     * Called when the user touches the sizer.  Starts moving the sizer in
     * response to future touch events.
     */
    onTouchDragSizerStart_: function(event) {
      this.touchDragging_ = true;
      event.preventDefault();
    },

    /**
     * Called when the mouse has moved after dragging started.
     */
    onTouchDragSizer_: function(event) {
      if (!this.touchDragging_)
        return;
      // If dragging has started, move the sizer.
      this.onDragSizer_(event.touches[0].pageX);
      event.preventDefault();
    },

    /**
     * Called once the user stops touching the screen.
     */
    onTouchDragSizerEnd_: function(event) {
      if (!this.touchDragging_)
        return;
      // Dragging is over.
      this.touchDragging_ = false;
      event.preventDefault();
    },

    /**
     * Common code used for both mouse and touch dragging.
     */
    onDragSizer_: function(pageX) {
      // Convert the mouse coordinate to a coordinate relative to leftView_.
      let newWidth = (pageX - this.leftView_.getNode().offsetLeft);

      // Avoid shrinking the left box too much.
      newWidth = Math.max(newWidth, MIN_PANEL_WIDTH);

      // TODO(eroman): Prevent the rightView from becoming smaller than MIN_PANEL_WIDTH.

      // Resize the left view.
      this.leftView_.getNode().style.width = newWidth + 'px';
    },
  };

  return ResizableVerticalSplitView;
})();
// main.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

/**
 * Dictionary of constants (Initialized soon after loading by data from browser,
 * updated on load log).  The *Types dictionaries map strings to numeric IDs,
 * while the *TypeNames are the other way around.
 */
let EventType = null;
let EventTypeNames = null;
let EventPhase = null;
let EventSourceType = null;
let EventSourceTypeNames = null;
let ClientInfo = null;
let NetError = null;
let QuicError = null;
let QuicRstStreamError = null;
let LoadFlag = null;
let CertStatusFlag = null;
let CertVerifierFlags = null;
let CertVerifyFlags = null;
let CertPathBuilderDigestPolicy = null;
let LoadState = null;
let AddressFamily = null;
let DataReductionProxyBypassEventType = null;
let DataReductionProxyBypassActionType = null;

/**
 * Dictionary of all constants, used for saving log files.
 */
let Constants = null;

/**
 * Object to communicate between the renderer and the browser.
 * @type {!BrowserBridge}
 */
let g_browser = null;

/**
 * This class is the root view object of the page.  It owns all the other
 * views, and manages switching between them.  It is also responsible for
 * initializing the views and the BrowserBridge.
 */
const MainView = (function() {
  'use strict';

  // We inherit from DivView
  const superClass = DivView;

  /**
   * Main entry point. Called once the page has loaded.
   *  @constructor
   */
  function MainView() {
    assertFirstConstructorCall(MainView);

    // TODO(eroman): This element ID is not the host element.
    superClass.call(this, 'tab-list');

    if (hasTouchScreen()) {
      document.body.classList.add('touch');
    }

    // This must be initialized before the tabs, so they can register as
    // observers.
    g_browser = BrowserBridge.getInstance();

    // This must be the first constants observer, so other constants observers
    // can safely use the globals, rather than depending on walking through
    // the constants themselves.
    g_browser.addConstantsObserver(new ConstantsObserver());

    // Create the tab switcher.
    this.initTabs_();

    this.topBarView_ = TopBarView.getInstance(this);

    window.onhashchange = this.onUrlHashChange_.bind(this);

    // Select the initial view based on the current URL.
    window.onhashchange();

    // No log file loaded yet so set the status bar to that state.
    this.topBarView_.switchToSubView('loaded').setFileName(
        'No log to display.');
  }

  cr.addSingletonGetter(MainView);

  // Tracks if we're viewing a loaded log file, so views can behave
  // appropriately.  Global so safe to call during construction.
  let isViewingLoadedLog = false;

  MainView.isViewingLoadedLog = function() {
    return isViewingLoadedLog;
  };

  MainView.prototype = {
    // Inherit the superclass's methods.
    __proto__: superClass.prototype,

    // This is exposed both so the log import/export code can enumerate all the
    // tabs, and for testing.
    tabSwitcher() {
      return this.tabSwitcher_;
    },

    /**
     * Prevents receiving/sending events to/from the browser, so loaded data
     * will not be mixed with current Chrome state.  Also hides any interactive
     * HTML elements that send messages to the browser.  Cannot be undone
     * without reloading the page.  Must be called before passing loaded data
     * to the individual views.
     *
     * @param {string} opt_fileName The name of the log file that has been
     *     loaded, if we're loading a log file.
     */
    onLoadLog(opt_fileName) {
      isViewingLoadedLog = true;

      if (opt_fileName !== undefined) {
        // If there's a file name, a log file was loaded, so display the
        // file's name in the status bar.
        this.topBarView_.switchToSubView('loaded').setFileName(opt_fileName);
      }
    },

    initTabs_() {
      this.tabIdToHash_ = {};
      this.hashToTabId_ = {};

      this.tabSwitcher_ = new TabSwitcherView(this.onTabSwitched_.bind(this));

      // Helper function to add a tab given the class for a view singleton.
      const addTab = function(viewClass) {
        const tabId = viewClass.TAB_ID;
        const tabHash = viewClass.TAB_HASH;
        const tabName = viewClass.TAB_NAME;
        const view = viewClass.getInstance();

        if (!tabId || !view || !tabHash || !tabName) {
          throw Error('Invalid view class for tab');
        }

        if (tabHash.charAt(0) !== '#') {
          throw Error('Tab hashes must start with a #');
        }

        this.tabSwitcher_.addTab(tabId, view, tabName, tabHash);
        this.tabIdToHash_[tabId] = tabHash;
        this.hashToTabId_[tabHash] = tabId;
      }.bind(this);

      // Populate the main tabs.  Even tabs that don't contain information for
      // the running OS should be created, so they can load log dumps from other
      // OSes.
      addTab(ImportView);
      addTab(ProxyView);
      addTab(EventsView);
      addTab(TimelineView);
      addTab(DnsView);
      addTab(SocketsView);
      addTab(AltSvcView);
      addTab(SpdyView);
      addTab(QuicView);
      addTab(ReportingView);
      addTab(HttpCacheView);
      addTab(ModulesView);
      addTab(PrerenderView);

      // Tab links start off hidden (besides import) since a log file has not
      // been loaded yet. This must be done after all the tabs are added so
      // that the width of the tab-list div is correctly styled.
      for (const tabId in this.tabSwitcher_.getAllTabViews()) {
        if (tabId !== ImportView.TAB_ID) {
          this.tabSwitcher_.showTabLink(tabId, false);
        }
      }
    },

    /**
     * This function is called by the tab switcher when the current tab has been
     * changed. It will update the current URL to reflect the new active tab,
     * so the back can be used to return to previous view.
     */
    onTabSwitched_(oldTabId, newTabId) {
      // Change the URL to match the new tab.

      const newTabHash = this.tabIdToHash_[newTabId];
      const parsed = parseUrlHash_(window.location.hash);
      if (parsed.tabHash !== newTabHash) {
        window.location.hash = newTabHash;
      }
    },

    onUrlHashChange_() {
      const parsed = parseUrlHash_(window.location.hash);

      if (!parsed) {
        return;
      }

      if (!parsed.tabHash) {
        // Default to the import tab.
        parsed.tabHash = ImportView.TAB_HASH;
      }

      const tabId = this.hashToTabId_[parsed.tabHash];

      if (tabId) {
        this.tabSwitcher_.switchToTab(tabId);
        if (parsed.parameters) {
          const view = this.tabSwitcher_.getTabView(tabId);
          view.setParameters(parsed.parameters);
        }
      }
    },

  };

  /**
   * Takes the current hash in form of "#tab&param1=value1&param2=value2&..."
   * and parses it into a dictionary.
   *
   * Parameters and values are decoded with decodeURIComponent().
   */
  function parseUrlHash_(hash) {
    const parameters = hash.split('&');

    let tabHash = parameters[0];
    if (tabHash === '' || tabHash === '#') {
      tabHash = undefined;
    }

    // Split each string except the first around the '='.
    let paramDict = null;
    for (let i = 1; i < parameters.length; i++) {
      const paramStrings = parameters[i].split('=');
      if (paramStrings.length !== 2) {
        continue;
      }
      if (paramDict === null) {
        paramDict = {};
      }
      const key = decodeURIComponent(paramStrings[0]);
      const value = decodeURIComponent(paramStrings[1]);
      paramDict[key] = value;
    }

    return {tabHash, parameters: paramDict};
  }

  return MainView;
})();

function ConstantsObserver() {}

/**
 * Loads all constants from |constants|.  On failure, global dictionaries are
 * not modifed.
 * @param {Object} receivedConstants The map of received constants.
 */
ConstantsObserver.prototype.onReceivedConstants = function(receivedConstants) {
  if (!areValidConstants(receivedConstants)) {
    return;
  }

  Constants = receivedConstants;

  EventType = Constants.logEventTypes;
  EventTypeNames = makeInverseMap(EventType);
  EventPhase = Constants.logEventPhase;
  EventSourceType = Constants.logSourceType;
  EventSourceTypeNames = makeInverseMap(EventSourceType);
  ClientInfo = Constants.clientInfo;
  LoadFlag = Constants.loadFlag;
  NetError = Constants.netError;
  QuicError = Constants.quicError;
  QuicRstStreamError = Constants.quicRstStreamError;
  AddressFamily = Constants.addressFamily;
  LoadState = Constants.loadState;
  DataReductionProxyBypassEventType =
      Constants.dataReductionProxyBypassEventType;
  DataReductionProxyBypassActionType =
      Constants.dataReductionProxyBypassActionType;
  // certStatusFlag may not be present when loading old log Files
  if (typeof(Constants.certStatusFlag) === 'object') {
    CertStatusFlag = Constants.certStatusFlag;
  } else {
    CertStatusFlag = {};
  }
  CertVerifierFlags = Constants.certVerifierFlags;
  CertVerifyFlags = Constants.certVerifyFlags;
  CertPathBuilderDigestPolicy = Constants.certPathBuilderDigestPolicy;

  timeutil.setTimeTickOffset(Constants.timeTickOffset);
};


function isNetLogNumber(value) {
  return (typeof(value) === 'number') ||
         (typeof(value) === 'string' && !isNaN(parseInt(value)));
}

/**
 * Returns true if it's given a valid-looking constants object.
 * @param {Object} receivedConstants The received map of constants.
 * @return {boolean} True if the |receivedConstants| object appears valid.
 */
function areValidConstants(receivedConstants) {
  return typeof(receivedConstants) === 'object' &&
      typeof(receivedConstants.logEventTypes) === 'object' &&
      typeof(receivedConstants.clientInfo) === 'object' &&
      typeof(receivedConstants.logEventPhase) === 'object' &&
      typeof(receivedConstants.logSourceType) === 'object' &&
      typeof(receivedConstants.loadFlag) === 'object' &&
      typeof(receivedConstants.netError) === 'object' &&
      typeof(receivedConstants.addressFamily) === 'object' &&
      isNetLogNumber(receivedConstants.timeTickOffset) &&
      typeof(receivedConstants.logFormatVersion) === 'number';
}

/**
 * Returns the name for netError.
 *
 * Example: netErrorToString(-105) should return
 * "ERR_NAME_NOT_RESOLVED".
 * @param {number} netError The net error code.
 * @return {string} The name of the given error.
 */
function netErrorToString(netError) {
  return getKeyWithValue(NetError, netError);
}

/**
 * Returns the name for quicError.
 *
 * Example: quicErrorToString(25) should return
 * "TIMED_OUT".
 * @param {number} quicError The QUIC error code.
 * @return {string} The name of the given error.
 */
function quicErrorToString(quicError) {
  return getKeyWithValue(QuicError, quicError);
}

/**
 * Returns the name for quicRstStreamError.
 *
 * Example: quicRstStreamErrorToString(3) should return
 * "BAD_APPLICATION_PAYLOAD".
 * @param {number} quicRstStreamError The QUIC RST_STREAM error code.
 * @return {string} The name of the given error.
 */
function quicRstStreamErrorToString(quicRstStreamError) {
  return getKeyWithValue(QuicRstStreamError, quicRstStreamError);
}

/**
 * Returns a string representation of |family|.
 * @param {number} family An AddressFamily
 * @return {string} A representation of the given family.
 */
function addressFamilyToString(family) {
  const str = getKeyWithValue(AddressFamily, family);
  // All the address family start with ADDRESS_FAMILY_*.
  // Strip that prefix since it is redundant and only clutters the output.
  return str.replace(/^ADDRESS_FAMILY_/, '');
}
// time_util.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var timeutil = (function() {
  'use strict';

  /**
   * Offset needed to convert event times to Date objects.
   * Updated whenever constants are loaded.
   */
  var timeTickOffset = 0;

  /**
   * The time of the first observed event.  Used for more friendly time display.
   */
  var baseTime = 0;

  /**
   * Sets the offset used to convert tick counts to dates.
   */
  function setTimeTickOffset(offset) {
    // Note that the subtraction by 0 is to cast to a number (probably a float
    // since the numbers are big).
    timeTickOffset = offset - 0;
  }

  /**
   * The browser gives us times in terms of "time ticks" in milliseconds.
   * This function converts the tick count to a Javascript "time", which is
   * the UTC time in milliseconds.
   *
   * @param {string} timeTicks A time represented in "time ticks".
   * @return {number} The Javascript time that |timeTicks| represents.
   */
  function convertTimeTicksToTime(timeTicks) {
    return timeTickOffset + (timeTicks - 0);
  }

  /**
   * The browser gives us times in terms of "time ticks" in milliseconds.
   * This function converts the tick count to a Date() object.
   *
   * @param {string} timeTicks A time represented in "time ticks".
   * @return {Date} The time that |timeTicks| represents.
   */
  function convertTimeTicksToDate(timeTicks) {
    return new Date(convertTimeTicksToTime(timeTicks));
  }

  /**
   * Returns the current time.
   *
   * @return {number} Milliseconds since the Unix epoch.
   */
  function getCurrentTime() {
    return Date.now();
  }

  /**
   * Returns the curent time in time ticks.
   *
   * @return {number} Current time, in TimeTicks.
   */
  function getCurrentTimeTicks() {
    return getCurrentTime() - timeTickOffset;
  }

  /**
   * Sets the base time more friendly display.
   *
   * @param {string} firstEventTime The time of the first event, as a Javascript
   *     numeric time.  Other times can be displayed relative to this time.
   */
  function setBaseTime(firstEventTime) {
    baseTime = firstEventTime;
  }

  /**
   * Sets the base time more friendly display.
   *
   * @return {number} Time set by setBaseTime, or 0 if no time has been set.
   */
  function getBaseTime() {
    return baseTime;
  }

  /**
   * Clears the base time, so isBaseTimeSet() returns 0.
   */
  function clearBaseTime() {
    baseTime = 0;
  }

  /**
   * Returns true if the base time has been initialized.
   *
   * @return {bool} True if the base time is set.
   */
  function isBaseTimeSet() {
    return baseTime != 0;
  }

  /**
   * Takes in a "time ticks" and returns it as a time since the base time, in
   * milliseconds.
   *
   * @param {string} timeTicks A time represented in "time ticks".
   * @return {number} Milliseconds since the base time.
   */
  function convertTimeTicksToRelativeTime(timeTicks) {
    return convertTimeTicksToTime(timeTicks) - baseTime;
  }

  /**
   * Adds an HTML representation of |date| to |parentNode|.
   *
   * @param {DomNode} parentNode The node that will contain the new node.
   * @param {Date} date The date to be displayed.
   * @return {DomNode} The new node containing the date/time.
   */
  function addNodeWithDate(parentNode, date) {
    var span = addNodeWithText(parentNode, 'span', dateToString(date));
    span.title = 't=' + date.getTime();
    return span;
  }

  /**
   * Returns a string representation of |date|.
   *
   * @param {Date} date The date to be represented.
   * @return {string} A string representation of |date|.
   */
  function dateToString(date) {
    var dateStr = date.getFullYear() + '-' + zeroPad_(date.getMonth() + 1, 2) +
        '-' + zeroPad_(date.getDate(), 2);

    var timeStr = zeroPad_(date.getHours(), 2) + ':' +
        zeroPad_(date.getMinutes(), 2) + ':' + zeroPad_(date.getSeconds(), 2) +
        '.' + zeroPad_(date.getMilliseconds(), 3);

    return dateStr + ' ' + timeStr;
  }

  /**
   * Prefixes enough zeros to |num| so that it has length |len|.
   * @param {number} num The number to be padded.
   * @param {number} len The desired length of the returned string.
   * @return {string} The zero-padded representation of |num|.
   */
  function zeroPad_(num, len) {
    var str = num + '';
    while (str.length < len)
      str = '0' + str;
    return str;
  }

  return {
    setTimeTickOffset: setTimeTickOffset,
    convertTimeTicksToTime: convertTimeTicksToTime,
    convertTimeTicksToDate: convertTimeTicksToDate,
    getCurrentTime: getCurrentTime,
    getCurrentTimeTicks: getCurrentTimeTicks,
    setBaseTime: setBaseTime,
    getBaseTime: getBaseTime,
    clearBaseTime: clearBaseTime,
    isBaseTimeSet: isBaseTimeSet,
    convertTimeTicksToRelativeTime: convertTimeTicksToRelativeTime,
    addNodeWithDate: addNodeWithDate,
    dateToString: dateToString,
  };
})();
// log_util.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

const LogUtil = (function() {
  /**
   * Gather any tab-specific state information prior to creating a log dump.
   */
  function getTabData_() {
    const tabData = {};
    const tabSwitcher = MainView.getInstance().tabSwitcher();
    const tabIdToView = tabSwitcher.getAllTabViews();
    for (const tabId in tabIdToView) {
      const view = tabIdToView[tabId];
      if (view.saveState) {
        tabData[tabId] = view.saveState();
      }
    }
  }

  /**
   * Loads a full log dump.  Returns a string containing a log of the load.
   * |opt_fileName| should always be given when loading from a file, instead of
   * from a log dump generated in-memory.
   * The process goes like this:
   * 1)  Load constants.  If this fails, or the version number can't be handled,
   *     abort the load.  If this step succeeds, the load cannot be aborted.
   * 2)  Clear all events.  Any event observers are informed of the clear as
   *     normal.
   * 3)  Call onLoadLogStart(polledData, tabData) for each view with an
   *     onLoadLogStart function.  This allows tabs to clear any extra state
   *     that would affect the next step.  |polledData| contains the data polled
   *     for all helpers, but |tabData| contains only the data from that
   *     specific tab.
   * 4)  Add all events from the log file.
   * 5)  Call onLoadLogFinish(polledData, tabData) for each view with an
   *     onLoadLogFinish function.  The arguments are the same as in step 3.  If
   *     there is no onLoadLogFinish function, it throws an exception, or it
   *     returns false instead of true, the data dump is assumed to contain no
   *     valid data for the tab, so the tab is hidden.  Otherwise, the tab is
   *     shown.
   */
  function loadLogDump(logDump, opt_fileName) {
    // Perform minimal validity check, and abort if it fails.
    if (typeof(logDump) !== 'object') {
      return 'Load failed.  Top level JSON data is not an object.';
    }

    // String listing text summary of load errors, if any.
    let errorString = '';

    if (!areValidConstants(logDump.constants)) {
      errorString += 'Invalid constants object.\n';
    }
    if (typeof(logDump.events) !== 'object') {
      errorString += 'NetLog events missing.\n';
    }
    if (logDump.constants &&
        typeof(logDump.constants.logFormatVersion) !== 'number') {
      errorString += 'Invalid version number.\n';
    }

    if (errorString.length > 0) {
      return 'Load failed:\n\n' + errorString;
    }

    if (typeof(logDump.polledData) !== 'object') {
      logDump.polledData = {};
    }
    if (typeof(logDump.tabData) !== 'object') {
      logDump.tabData = {};
    }

    const kSupportedLogFormatVersion = 1;

    if (logDump.constants.logFormatVersion !== kSupportedLogFormatVersion) {
      return 'Unable to load different log version.' +
          ' Found ' + logDump.constants.logFormatVersion + ', Expected ' +
          Constants.logFormatVersion;
    }

    g_browser.receivedConstants(logDump.constants);

    // Check for validity of each log entry, and then add the ones that pass.
    // Since the events are kept around, and we can't just hide a single view
    // on a bad event, we have more error checking for them than other data.
    const validEvents = [];
    let numDeprecatedPassiveEvents = 0;
    for (let eventIndex = 0; eventIndex < logDump.events.length; ++eventIndex) {
      const event = logDump.events[eventIndex];
      if (typeof event === 'object' && typeof event.source === 'object' &&
          typeof event.time === 'string' &&
          typeof EventTypeNames[event.type] === 'string' &&
          typeof EventSourceTypeNames[event.source.type] === 'string' &&
          getKeyWithValue(EventPhase, event.phase) !== '?') {
        if (event.wasPassivelyCaptured) {
          // NOTE: Up until Chrome 18, log dumps included "passively captured"
          // events. These are no longer supported, so skip past them
          // to avoid confusing the rest of the code.
          numDeprecatedPassiveEvents++;
          continue;
        }
        validEvents.push(event);
      }
    }

    // Determine the export date for the loaded log.
    //
    // Dumps created from chrome://net-internals (Chrome 17 - Chrome 59) will
    // have this set in constants.clientInfo.numericDate.
    //
    // However more recent dumping mechanisms (chrome://net-export/ and
    // --log-net-log) write the constants object directly to a file when the
    // dump is *started* so lack this ability.
    //
    // In this case, we will synthesize this field by looking at the timestamp
    // of the last event logged. In practice this works fine since there tend
    // to be lots of events logged.
    //
    // TODO(eroman): Fix the log format / writers to avoid this problem. Dumps
    // *should* contain the time when capturing started, and when capturing
    // ended.
    if (typeof logDump.constants.clientInfo.numericDate !== 'number') {
      if (validEvents.length > 0) {
        const lastEvent = validEvents[validEvents.length - 1];
        ClientInfo.numericDate =
            timeutil.convertTimeTicksToDate(lastEvent.time).getTime();
      } else {
        errorString += 'Can\'t guess export date as there are no events.\n';
        ClientInfo.numericDate = 0;
      }
    }

    // Prevent communication with the browser.  Once the constants have been
    // loaded, it's safer to continue trying to load the log, even in the case
    // of bad data.
    MainView.getInstance().onLoadLog(opt_fileName);

    // Delete all events.  This will also update all logObservers.
    EventsTracker.getInstance().deleteAllLogEntries();

    // Inform all the views that a log file is being loaded, and pass in
    // view-specific saved state, if any.
    const tabSwitcher = MainView.getInstance().tabSwitcher();
    const tabIdToView = tabSwitcher.getAllTabViews();
    for (const tabId in tabIdToView) {
      const view = tabIdToView[tabId];
      view.onLoadLogStart(logDump.polledData, logDump.tabData[tabId]);
    }
    EventsTracker.getInstance().addLogEntries(validEvents);

    const numInvalidEvents = logDump.events.length -
        (validEvents.length + numDeprecatedPassiveEvents);
    if (numInvalidEvents > 0) {
      errorString += 'Unable to load ' + numInvalidEvents +
          ' events, due to invalid data.\n\n';
    }

    if (numDeprecatedPassiveEvents > 0) {
      errorString += 'Discarded ' + numDeprecatedPassiveEvents +
          ' passively collected events. Use an older version of Chrome to' +
          ' load this dump if you want to see them.\n\n';
    }

    // Update all views with data from the file.  Show only those views which
    // successfully load the data.
    for (const tabId in tabIdToView) {
      const view = tabIdToView[tabId];
      let showView = false;
      // The try block eliminates the need for checking every single value
      // before trying to access it.
      try {
        if (view.onLoadLogFinish(
            logDump.polledData, logDump.tabData[tabId], logDump)) {
          showView = true;
        }
      } catch (error) {
        errorString +=
            'Caught error while calling onLoadLogFinish: ' + error + '\n\n';
      }
      tabSwitcher.showTabLink(tabId, showView);
    }

    return errorString + 'Log loaded.';
  }

  /**
   * Loads a log dump from the string |logFileContents|, which can be either a
   * full net-internals dump, or a NetLog dump only.  Returns a string
   * containing a log of the load.
   */
  function loadLogFile(logFileContents, fileName) {
    // Try and parse the log dump as a single JSON string.  If this succeeds,
    // it's most likely a full log dump.  Otherwise, it may be a dump created by
    // --log-net-log.
    let parsedDump = null;
    let errorString = '';
    try {
      parsedDump = JSON.parse(logFileContents);
    } catch (error) {
      try {
        // We may have a --log-net-log=blah log dump.  If so, remove the comma
        // after the final good entry, and add the necessary close brackets.
        const end = Math.max(
            logFileContents.lastIndexOf(',\n'),
            logFileContents.lastIndexOf(',\r'));
        if (end !== -1) {
          parsedDump = JSON.parse(logFileContents.substring(0, end) + ']}');
          errorString += 'Log file truncated.  Events may be missing.\n';
        }
      } catch (error2) {
      }
    }

    if (!parsedDump) {
      return 'Unable to parse log dump as JSON file.';
    }
    return errorString + loadLogDump(parsedDump, fileName);
  }

  // Exports.
  return {loadLogFile};
})();
// loaded_status_view.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * The status view at the top of the page when viewing a loaded dump file.
 */
var LoadedStatusView = (function() {
  'use strict';

  // We inherit from DivView.
  var superClass = DivView;

  function LoadedStatusView() {
    superClass.call(this, LoadedStatusView.MAIN_BOX_ID);
  }

  LoadedStatusView.MAIN_BOX_ID = 'loaded-status-view';
  LoadedStatusView.DUMP_FILE_NAME_ID = 'loaded-status-view-dump-file-name';

  LoadedStatusView.prototype = {
    // Inherit the superclass's methods.
    __proto__: superClass.prototype,

    setFileName: function(fileName) {
      $(LoadedStatusView.DUMP_FILE_NAME_ID).innerText = fileName;
      document.title = fileName + ' - NetLog Viewer';
    }
  };

  return LoadedStatusView;
})();
// top_bar_view.js
// Copyright (c) 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * The status view at the top of the page.  It displays what mode net-internals
 * is in (capturing, viewing only, viewing loaded log), and may have extra
 * information and actions depending on the mode.
 */
var TopBarView = (function() {
  'use strict';

  // We inherit from View.
  var superClass = DivView;

  /**
   * Main entry point. Called once the page has loaded.
   * @constructor
   */
  function TopBarView() {
    assertFirstConstructorCall(TopBarView);

    superClass.call(this, TopBarView.BOX_ID);

    this.nameToSubView_ = {
      loaded: new LoadedStatusView()
    };

    this.activeSubView_ = null;
  }

  TopBarView.BOX_ID = 'top-bar-view-content';

  cr.addSingletonGetter(TopBarView);

  TopBarView.prototype = {
    // Inherit the superclass's methods.
    __proto__: superClass.prototype,

    switchToSubView: function(name) {
      var newSubView = this.nameToSubView_[name];

      if (!newSubView)
        throw Error('Invalid subview name');

      var prevSubView = this.activeSubView_;
      this.activeSubView_ = newSubView;

      if (prevSubView)
        prevSubView.show(false);
      newSubView.show(this.isVisible());

      // Let the subview change the color scheme of the top bar.
      $(TopBarView.BOX_ID).className = name + '-status-view';

      return newSubView;
    },
  };

  return TopBarView;
})();
// dns_view.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * This view displays information on the host resolver:
 *
 *   - Shows the default address family.
 *   - Shows the current host cache contents.
 *   - Has a button to clear the host cache.
 *   - Shows the parameters used to construct the host cache (capacity, ttl).
 */

'use strict';
// TODO(mmenke):  Add links for each address entry to the corresponding NetLog
//                source.  This could either be done by adding NetLog source ids
//                to cache entries, or tracking sources based on their type and
//                description.  Former is simpler, latter may be useful
//                elsewhere as well.
var DnsView = (function() {
  'use strict';

  // We inherit from DivView.
  var superClass = DivView;

  /**
   *  @constructor
   */
  function DnsView() {
    assertFirstConstructorCall(DnsView);

    // Call superclass's constructor.
    superClass.call(this, DnsView.MAIN_BOX_ID);

    // Register to receive changes to the host resolver info.
    g_browser.addHostResolverInfoObserver(this, false);
  }

  DnsView.TAB_ID = 'tab-handle-dns';
  DnsView.TAB_NAME = 'DNS';
  DnsView.TAB_HASH = '#dns';

  // IDs for special HTML elements in dns_view.html
  DnsView.MAIN_BOX_ID = 'dns-view-tab-content';

  DnsView.INTERNAL_DNS_ENABLED_FOR_INSECURE_SPAN_ID =
      'dns-view-internal-dns-enabled-for-insecure';
  DnsView.INTERNAL_DNS_ENABLED_FOR_SECURE_SPAN_ID =
      'dns-view-internal-dns-enabled-for-secure';
  DnsView.INTERNAL_DNS_CONFIG_TBODY_ID = 'dns-view-internal-dns-config-tbody';
  DnsView.INTERNAL_DISABLED_DOH_PROVIDERS_UL_ID =
      'dns-view-internal-disabled-doh-providers';

  DnsView.CAPACITY_SPAN_ID = 'dns-view-cache-capacity';

  DnsView.ACTIVE_SPAN_ID = 'dns-view-cache-active';
  DnsView.EXPIRED_SPAN_ID = 'dns-view-cache-expired';
  DnsView.NETWORK_SPAN_ID = 'dns-view-network-changes';
  DnsView.CACHE_TBODY_ID = 'dns-view-cache-tbody';

  cr.addSingletonGetter(DnsView);

  DnsView.prototype = {
    // Inherit the superclass's methods.
    __proto__: superClass.prototype,

    onLoadLogFinish: function(data) {
      return this.onHostResolverInfoChanged(
          data.hostResolverInfo, data.dohProvidersDisabledDueToFeature);
    },

    onHostResolverInfoChanged: function(
        hostResolverInfo, dohProvidersDisabledDueToFeature) {
      // Clear the existing values.
      $(DnsView.CAPACITY_SPAN_ID).innerHTML = '';
      $(DnsView.CACHE_TBODY_ID).innerHTML = '';
      $(DnsView.ACTIVE_SPAN_ID).innerHTML = '0';
      $(DnsView.EXPIRED_SPAN_ID).innerHTML = '0';
      $(DnsView.NETWORK_SPAN_ID).innerHTML = '0';

      // Update fields containing async DNS configuration information.
      displayAsyncDnsConfig_(
          hostResolverInfo, dohProvidersDisabledDueToFeature);

      // No info.
      if (!hostResolverInfo || !hostResolverInfo.cache)
        return false;

      // Fill in the basic cache information.
      var hostResolverCache = hostResolverInfo.cache;
      $(DnsView.CAPACITY_SPAN_ID).innerText = hostResolverCache.capacity;
      $(DnsView.NETWORK_SPAN_ID).innerText = hostResolverCache.network_changes;

      var expiredEntries = 0;
      // Date the cache was logged.  This will be either now, when actively
      // logging data, or the date the log dump was created.
      var logDate;
      if (MainView.isViewingLoadedLog()) {
        logDate = new Date(ClientInfo.numericDate);
      } else {
        logDate = new Date();
      }

      // Fill in the cache contents table.
      for (const e of hostResolverCache.entries) {
        var tr = addNode($(DnsView.CACHE_TBODY_ID), 'tr');
        var expired = false;

        var hostnameCell = addNode(tr, 'td');
        addTextNode(hostnameCell, e.hostname);

        var familyCell = addNode(tr, 'td');
        addTextNode(familyCell, addressFamilyToString(e.address_family));

        var addressesCell = addNode(tr, 'td');

        if (e.net_error != undefined) {
          var errorText = e.error + ' (' + netErrorToString(e.error) + ')';
          var errorNode = addTextNode(addressesCell, 'error: ' + errorText);
          addressesCell.classList.add('warning-text');
        } else {
          // Concatenate the legacy `addresses` and `ip_endpoints`.
          let addresses = [];
          if ('addresses' in e)
            addresses = addresses.concat(e.addresses);
          if ('ip_endpoints' in e)
            addresses = addresses.concat(e.ip_endpoints.map(JSON.stringify));
          if (addresses.length > 0)
            addListToNode_(addNode(addressesCell, 'div'), addresses);
        }

        var ttlCell = addNode(tr, 'td');
        addTextNode(ttlCell, e.ttl);

        var expiresDate = timeutil.convertTimeTicksToDate(e.expiration);
        var expiresCell = addNode(tr, 'td');
        timeutil.addNodeWithDate(expiresCell, expiresDate);
        if (logDate > timeutil.convertTimeTicksToDate(e.expiration)) {
          expired = true;
          var expiredSpan = addNode(expiresCell, 'span');
          expiredSpan.classList.add('warning-text');
          addTextNode(expiredSpan, ' [Expired]');
        }

        var nikCell = addNode(tr, 'td');
        var networkKey;
        if ('network_anonymization_key' in e) {
          networkKey = e.network_anonymization_key;
        } else {
          // Versions prior to M84 used lists instead of strings for logged
          // NIKs.
          networkKey = '' + e.network_isolation_key;
          // Around M108 the network_isolation_key changed to be named
          // network_anonymization_key, so we do this check for backwards
          // compatibility.
        }
        addTextNode(nikCell, networkKey);

        // HostCache keeps track of how many network changes have happened since
        // it was created, and entries store what that number was at the time
        // they were created. If more network changes have happened since an
        // entry was created, the entry is expired.
        var networkChangesCell = addNode(tr, 'td');
        addTextNode(networkChangesCell, e.network_changes);
        if (e.network_changes < hostResolverCache.network_changes) {
          expired = true;
          var expiredSpan = addNode(networkChangesCell, 'span');
          expiredSpan.classList.add('warning-text');
          addTextNode(expiredSpan, ' [Expired]');
        }

        if (expired) {
          expiredEntries++;
        }
      }

      $(DnsView.ACTIVE_SPAN_ID).innerText =
          hostResolverCache.entries.length - expiredEntries;
      $(DnsView.EXPIRED_SPAN_ID).innerText = expiredEntries;
      return true;
    },
  };

  /**
   * Displays information corresponding to the current async DNS configuration.
   * @param {Object} hostResolverInfo The host resolver information.
   */
  function displayAsyncDnsConfig_(
      hostResolverInfo, dohProvidersDisabledDueToFeature) {
    // Clear the existing values.
    $(DnsView.INTERNAL_DISABLED_DOH_PROVIDERS_UL_ID).innerHTML = '';
    $(DnsView.INTERNAL_DNS_CONFIG_TBODY_ID).innerHTML = '';

    // Determine whether the async resolver is enabled for both Do53 and DoH.
    // Update the display accordingly.
    const enabled_for_insecure =
        hostResolverInfo && hostResolverInfo.dns_config &&
        hostResolverInfo.dns_config.can_use_insecure_dns_transactions;
    const enabled_for_secure =
        hostResolverInfo && hostResolverInfo.dns_config &&
        hostResolverInfo.dns_config.can_use_secure_dns_transactions;
    $(DnsView.INTERNAL_DNS_ENABLED_FOR_INSECURE_SPAN_ID).innerText =
        enabled_for_insecure;
    $(DnsView.INTERNAL_DNS_ENABLED_FOR_SECURE_SPAN_ID).innerText =
        enabled_for_secure;

    // Show the list of disabled DoH providers.
    if (dohProvidersDisabledDueToFeature) {
      for (let disabledProvider of dohProvidersDisabledDueToFeature) {
        addNodeWithText(
            $(DnsView.INTERNAL_DISABLED_DOH_PROVIDERS_UL_ID), 'li',
            disabledProvider);
      }
    }

    // Attempt to display the async resolver's DNS configuration. It may be
    // relevant if there were any DoH queries.
    const dnsConfig = hostResolverInfo && hostResolverInfo.dns_config;
    if (!dnsConfig)
      return;

    // Decide the display order for the keys of `dnsConfig`.
    let keys = Object.keys(dnsConfig).sort();
    const keysToDrop = [
      // Nameservers will be re-added at the front later.
      'nameservers',
      // These keys have already been rendered outside of the table.
      'can_use_insecure_dns_transactions',
      'can_use_secure_dns_transactions',
    ];
    keys = keys.filter((k) => !keysToDrop.includes(k));
    keys.unshift('nameservers');  // Push 'nameservers' to the front.

    // Add selected keys from `dnsConfig` to the table.
    for (const key of keys) {
      const tr = addNode($(DnsView.INTERNAL_DNS_CONFIG_TBODY_ID), 'tr');
      addNodeWithText(tr, 'th', key);
      const td = addNode(tr, 'td');

      // For lists, display each list entry on a separate line.
      if (Array.isArray(dnsConfig[key])) {
        const strings = dnsConfig[key].map(JSON.stringify);
        addListToNode_(td, strings);
        continue;
      }

      addTextNode(td, dnsConfig[key]);
    }
  }

  /**
   * Takes a last of strings and adds them all to a DOM node, displaying them
   * on separate lines.
   * @param {DomNode} node The parent node.
   * @param {Array<string>} list List of strings to add to the node.
   */
  function addListToNode_(node, list) {
    for (var i = 0; i < list.length; ++i)
      addNodeWithText(node, 'div', list[i]);
  }

  return DnsView;
})();
// source_filter_parser.js
// Copyright (c) 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var SourceFilterParser = (function() {
  'use strict';

  /**
   * Parses |filterText|, extracting a sort method, a list of filters, and a
   * copy of |filterText| with all sort parameters removed.
   */
  function SourceFilterParser(filterText) {
    // Final output will be stored here.
    this.filter = null;
    this.sort = {};
    this.filterTextWithoutSort = '';
    var filterList = parseFilter_(filterText);

    // Text filters are stored here as strings and then added as a function at
    // the end, for performance reasons.
    var textFilters = [];

    // Filter functions are first created individually, and then merged.
    var filterFunctions = [];

    for (var i = 0; i < filterList.length; ++i) {
      var filterElement = filterList[i].parsed;
      var negated = filterList[i].negated;

      var sort = parseSortDirective_(filterElement, negated);
      if (sort) {
        this.sort = sort;
        continue;
      }

      this.filterTextWithoutSort += filterList[i].original;

      var filter = parseRestrictDirective_(filterElement, negated);
      if (!filter)
        filter = parseStringDirective_(filterElement, negated);
      if (filter) {
        if (negated) {
          filter = (function(func, sourceEntry) {
                     return !func(sourceEntry);
                   }).bind(null, filter);
        }
        filterFunctions.push(filter);
        continue;
      }
      textFilters.push({text: filterElement, negated: negated});
    }

    // Create a single filter for all text filters, so they can share a
    // TabePrinter.
    filterFunctions.push(textFilter_.bind(null, textFilters));

    // Create function to go through all the filters.
    this.filter = function(sourceEntry) {
      for (var i = 0; i < filterFunctions.length; ++i) {
        if (!filterFunctions[i](sourceEntry))
          return false;
      }
      return true;
    };
  }

  /**
   * Parses a single "sort:" directive, and returns a dictionary containing
   * the sort function and direction.  Returns null on failure, including
   * the case when no such sort function exists.
   */
  function parseSortDirective_(filterElement, backwards) {
    var match = /^sort:(.*)$/.exec(filterElement);
    if (!match)
      return null;
    return {method: match[1], backwards: backwards};
  }

  /**
   * Tries to parses |filterElement| as a single "is:" directive, and returns a
   * new filter function.  Returns null on failure.
   */
  function parseRestrictDirective_(filterElement) {
    var match = /^is:(.*)$/.exec(filterElement);
    if (!match)
      return null;
    if (match[1] == 'active') {
      return function(sourceEntry) {
        return !sourceEntry.isInactive();
      };
    }
    if (match[1] == 'error') {
      return function(sourceEntry) {
        return sourceEntry.isError();
      };
    }
    return null;
  }

  /**
   * Tries to parse |filterElement| as a single filter of a type that takes
   * arbitrary strings as input, and returns a new filter function on success.
   * Returns null on failure.
   */
  function parseStringDirective_(filterElement) {
    var match = RegExp('^([^:]*):(.*)$').exec(filterElement);
    if (!match)
      return null;

    // Split parameters around commas and remove empty elements.
    var parameters = match[2].split(',');
    parameters = parameters.filter(function(string) {
      return string.length > 0;
    });

    if (match[1] == 'type') {
      return function(sourceEntry) {
        var i;
        var sourceType = sourceEntry.getSourceTypeString().toLowerCase();
        for (i = 0; i < parameters.length; ++i) {
          if (sourceType.search(parameters[i]) != -1)
            return true;
        }
        return false;
      };
    }

    if (match[1] == 'id') {
      return function(sourceEntry) {
        return parameters.indexOf(sourceEntry.getSourceId() + '') != -1;
      };
    }

    return null;
  }

  /**
   * Takes in the text of a filter and returns a list of
   * {parsed, original, negated} values that correspond to substrings of the
   * filter before and after filtering, and whether or not it started with a
   * '-'.  Extra whitespace other than a single character after each element is
   * ignored.  Parsed strings are all lowercase.
   */
  function parseFilter_(filterText) {
    // Assemble a list of quoted and unquoted strings in the filter.
    var filterList = [];
    var position = 0;
    while (position < filterText.length) {
      var inQuote = false;
      var filterElement = '';
      var negated = false;
      var startPosition = position;
      while (position < filterText.length) {
        var nextCharacter = filterText[position];
        ++position;
        if (nextCharacter == '\\' && position < filterText.length) {
          // If there's a backslash, skip the backslash and add the next
          // character to the element.
          filterElement += filterText[position];
          ++position;
          continue;
        } else if (nextCharacter == '"') {
          // If there's an unescaped quote character, toggle |inQuote| without
          // modifying the element.
          inQuote = !inQuote;
        } else if (!inQuote && /\s/.test(nextCharacter)) {
          // If not in a quote and have a whitespace character, that's the
          // end of the element.
          break;
        } else if (nextCharacter == '-' && startPosition == position - 1) {
          // If this is the first character, and it's a '-', this entry is
          // negated.
          negated = true;
        } else {
          // Otherwise, add the next character to the element.
          filterElement += nextCharacter;
        }
      }

      if (filterElement.length > 0) {
        var filter = {
          parsed: filterElement.toLowerCase(),
          original: filterText.substring(startPosition, position),
          negated: negated,
        };
        filterList.push(filter);
      }
    }
    return filterList;
  }

  /**
   * Takes in a list of text filters and a SourceEntry.  Each filter has
   * "text" and "negated" fields.  Returns true if the SourceEntry matches all
   * filters in the (possibly empty) list.
   */
  function textFilter_(textFilters, sourceEntry) {
    let tablePrinter = null;
    for (var i = 0; i < textFilters.length; ++i) {
      let text = textFilters[i].text;
      let negated = textFilters[i].negated;
      let match = false;
      // The description, id, and source type are not always contained in the
      // log entries, so search them directly.
      let description = sourceEntry.getDescription().toLowerCase();
      let type = sourceEntry.getSourceTypeString().toLowerCase();
      let id = sourceEntry.getSourceId() + '';
      if (description.indexOf(text) != -1 || type.indexOf(text) != -1 ||
          id.indexOf(text) != -1) {
        match = true;
      } else {
        if (!tablePrinter)
          tablePrinter = sourceEntry.createTablePrinter(true /* forSearch */);
        match = tablePrinter.search(text);
      }
      if (negated)
        match = !match;
      if (!match)
        return false;
    }
    return true;
  }

  return SourceFilterParser;
})();
// source_row.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var SourceRow = (function() {
  'use strict';

  /**
   * A SourceRow represents the row corresponding to a single SourceEntry
   * displayed by the EventsView.
   *
   * @constructor
   */
  function SourceRow(parentView, sourceEntry) {
    this.parentView_ = parentView;

    this.sourceEntry_ = sourceEntry;
    this.isSelected_ = false;
    this.isMatchedByFilter_ = false;

    // Used to set CSS class for display.  Must only be modified by calling
    // corresponding set functions.
    this.isSelected_ = false;
    this.isMouseOver_ = false;

    // Mirror sourceEntry's values, so we only update the DOM when necessary.
    this.isError_ = sourceEntry.isError();
    this.isInactive_ = sourceEntry.isInactive();
    this.description_ = sourceEntry.getDescription();

    this.createRow_();
    this.onSourceUpdated();
  }

  SourceRow.prototype = {
    createRow_: function() {
      // Create a row.
      var tr = addNode(this.parentView_.tableBody_, 'tr');
      tr._id = this.getSourceId();
      tr.style.display = 'none';
      this.row_ = tr;

      var selectionCol = addNode(tr, 'td');
      var checkbox = addNode(selectionCol, 'input');
      checkbox.title = this.getSourceId();
      selectionCol.style.borderLeft = '0';
      checkbox.type = 'checkbox';

      var idCell = addNode(tr, 'td');
      idCell.style.textAlign = 'right';

      var typeCell = addNode(tr, 'td');
      var descriptionCell = addNode(tr, 'td');
      this.descriptionCell_ = descriptionCell;

      // Connect listeners.
      checkbox.onchange = this.onCheckboxToggled_.bind(this);

      var onclick = this.onClicked_.bind(this);
      idCell.onclick = onclick;
      typeCell.onclick = onclick;
      descriptionCell.onclick = onclick;

      tr.onmouseover = this.onMouseover_.bind(this);
      tr.onmouseout = this.onMouseout_.bind(this);

      // Set the cell values to match this source's data.
      addTextNode(idCell, this.getSourceId());
      var sourceTypeString = this.sourceEntry_.getSourceTypeString();
      addTextNode(typeCell, sourceTypeString);
      this.updateDescription_();

      // Add a CSS classname specific to this source type (so CSS can specify
      // different stylings for different types).
      var sourceTypeClass = sourceTypeString.toLowerCase().replace(/_/g, '-');
      this.row_.classList.add('source-' + sourceTypeClass);

      this.updateClass_();
    },

    onSourceUpdated: function() {
      if (this.sourceEntry_.isInactive() != this.isInactive_ ||
          this.sourceEntry_.isError() != this.isError_) {
        this.updateClass_();
      }

      if (this.description_ != this.sourceEntry_.getDescription())
        this.updateDescription_();

      // Update filters.
      var matchesFilter = this.parentView_.currentFilter_(this.sourceEntry_);
      this.setIsMatchedByFilter(matchesFilter);
    },

    /**
     * Changes |row_|'s class based on currently set flags.  Clears any previous
     * class set by this method.  This method is needed so that some styles
     * override others.
     */
    updateClass_: function() {
      this.isInactive_ = this.sourceEntry_.isInactive();
      this.isError_ = this.sourceEntry_.isError();

      // Each element of this list contains a property of |this| and the
      // corresponding class name to set if that property is true.  Entries
      // earlier in the list take precedence.
      var propertyNames = [
        ['isSelected_', 'selected'],
        ['isMouseOver_', 'mouseover'],
        ['isError_', 'error'],
        ['isInactive_', 'inactive'],
      ];

      // Loop through |propertyNames| in order, checking if each property
      // is true.  For the first such property found, if any, add the
      // corresponding class to the SourceEntry's row.  Remove classes
      // that correspond to any other property.
      var noStyleSet = true;
      for (var i = 0; i < propertyNames.length; ++i) {
        var setStyle = noStyleSet && this[propertyNames[i][0]];
        if (setStyle) {
          this.row_.classList.add(propertyNames[i][1]);
          noStyleSet = false;
        } else {
          this.row_.classList.remove(propertyNames[i][1]);
        }
      }
    },

    getSourceEntry: function() {
      return this.sourceEntry_;
    },

    setIsMatchedByFilter: function(isMatchedByFilter) {
      if (this.isMatchedByFilter() == isMatchedByFilter)
        return;  // No change.

      this.isMatchedByFilter_ = isMatchedByFilter;

      this.setFilterStyles(isMatchedByFilter);

      if (isMatchedByFilter) {
        this.parentView_.incrementPostfilterCount(1);
      } else {
        this.parentView_.incrementPostfilterCount(-1);
        // If we are filtering an entry away, make sure it is no longer
        // part of the selection.
        this.setSelected(false);
      }
    },

    isMatchedByFilter: function() {
      return this.isMatchedByFilter_;
    },

    setFilterStyles: function(isMatchedByFilter) {
      // Hide rows which have been filtered away.
      if (isMatchedByFilter) {
        this.row_.style.display = '';
      } else {
        this.row_.style.display = 'none';
      }
    },

    isSelected: function() {
      return this.isSelected_;
    },

    setSelected: function(isSelected) {
      if (isSelected == this.isSelected())
        return;

      this.isSelected_ = isSelected;

      this.setSelectedStyles(isSelected);
      this.parentView_.modifySelectionArray(this.getSourceId(), isSelected);
      this.parentView_.onSelectionChanged();
    },

    setSelectedStyles: function(isSelected) {
      this.isSelected_ = isSelected;
      this.getSelectionCheckbox().checked = isSelected;
      this.updateClass_();
    },

    setMouseoverStyle: function(isMouseOver) {
      this.isMouseOver_ = isMouseOver;
      this.updateClass_();
    },

    onClicked_: function() {
      this.parentView_.clearSelection();
      this.setSelected(true);
      if (this.isSelected())
        this.parentView_.scrollToSourceId(this.getSourceId());
    },

    onMouseover_: function() {
      this.setMouseoverStyle(true);
    },

    onMouseout_: function() {
      this.setMouseoverStyle(false);
    },

    updateDescription_: function() {
      this.description_ = this.sourceEntry_.getDescription();
      this.descriptionCell_.innerHTML = '';
      addTextNode(this.descriptionCell_, this.description_);
    },

    onCheckboxToggled_: function() {
      this.setSelected(this.getSelectionCheckbox().checked);
      if (this.isSelected())
        this.parentView_.scrollToSourceId(this.getSourceId());
    },

    getSelectionCheckbox: function() {
      return this.row_.childNodes[0].firstChild;
    },

    getSourceId: function() {
      return this.sourceEntry_.getSourceId();
    },

    /**
     * Returns source ID of the entry whose row is currently above this one's.
     * Returns null if no such node exists.
     */
    getPreviousNodeSourceId: function() {
      var prevNode = this.row_.previousSibling;
      if (prevNode == null)
        return null;
      return prevNode._id;
    },

    /**
     * Returns source ID of the entry whose row is currently below this one's.
     * Returns null if no such node exists.
     */
    getNextNodeSourceId: function() {
      var nextNode = this.row_.nextSibling;
      if (nextNode == null)
        return null;
      return nextNode._id;
    },

    /**
     * Moves current object's row before |entry|'s row.
     */
    moveBefore: function(entry) {
      this.row_.parentNode.insertBefore(this.row_, entry.row_);
    },

    /**
     * Moves current object's row after |entry|'s row.
     */
    moveAfter: function(entry) {
      this.row_.parentNode.insertBefore(this.row_, entry.row_.nextSibling);
    }
  };

  return SourceRow;
})();
// events_view.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * EventsView displays a filtered list of all events sharing a source, and
 * a details pane for the selected sources.
 *
 *  +----------------------++----------------+
 *  |      filter box      ||                |
 *  +----------------------+|                |
 *  |                      ||                |
 *  |                      ||                |
 *  |                      ||                |
 *  |                      ||                |
 *  |     source list      ||    details     |
 *  |                      ||    view        |
 *  |                      ||                |
 *  |                      ||                |
 *  |                      ||                |
 *  |                      ||                |
 *  |                      ||                |
 *  |                      ||                |
 *  +----------------------++----------------+
 */
var EventsView = (function() {
  'use strict';

  // How soon after updating the filter list the counter should be updated.
  var REPAINT_FILTER_COUNTER_TIMEOUT_MS = 0;

  // We inherit from DivView.
  var superClass = DivView;

  /*
   * @constructor
   */
  function EventsView() {
    assertFirstConstructorCall(EventsView);

    // Call superclass's constructor.
    // TODO(eroman): Not host element.
    superClass.call(this, EventsView.LEFT_PANE_ID);

    // Initialize the sub-views.
    var leftPane = new DivView(EventsView.LEFT_PANE_ID);

    this.detailsView_ = new DetailsView(EventsView.DETAILS_LOG_BOX_ID);

    this.splitterView_ = new ResizableVerticalSplitView(
        leftPane, this.detailsView_, new DivView(EventsView.SIZER_ID));

    SourceTracker.getInstance().addSourceEntryObserver(this);

    this.tableBody_ = $(EventsView.TBODY_ID);

    this.filterInput_ = $(EventsView.FILTER_INPUT_ID);
    this.filterCount_ = $(EventsView.FILTER_COUNT_ID);

    this.filterInput_.addEventListener(
        'search', this.onFilterTextChanged_.bind(this), true);

    $(EventsView.SELECT_ALL_ID)
        .addEventListener('click', this.selectAll_.bind(this), true);

    $(EventsView.SORT_BY_ID_ID)
        .addEventListener('click', this.sortById_.bind(this), true);

    $(EventsView.SORT_BY_SOURCE_TYPE_ID)
        .addEventListener('click', this.sortBySourceType_.bind(this), true);

    $(EventsView.SORT_BY_DESCRIPTION_ID)
        .addEventListener('click', this.sortByDescription_.bind(this), true);

    new MouseOverHelp(
        EventsView.FILTER_HELP_ID, EventsView.FILTER_HELP_HOVER_ID);

    // Sets sort order and filter.
    this.setFilter_('');

    this.initializeSourceList_();
  }

  EventsView.TAB_ID = 'tab-handle-events';
  EventsView.TAB_NAME = 'Events';
  EventsView.TAB_HASH = '#events';

  // IDs for special HTML elements in events_view.html
  EventsView.TBODY_ID = 'events-view-source-list-tbody';
  EventsView.FILTER_INPUT_ID = 'events-view-filter-input';
  EventsView.FILTER_COUNT_ID = 'events-view-filter-count';
  EventsView.FILTER_HELP_ID = 'events-view-filter-help';
  EventsView.FILTER_HELP_HOVER_ID = 'events-view-filter-help-hover';
  EventsView.SELECT_ALL_ID = 'events-view-select-all';
  EventsView.SORT_BY_ID_ID = 'events-view-sort-by-id';
  EventsView.SORT_BY_SOURCE_TYPE_ID = 'events-view-sort-by-source';
  EventsView.SORT_BY_DESCRIPTION_ID = 'events-view-sort-by-description';
  EventsView.DETAILS_LOG_BOX_ID = 'events-view-details-log-box';
  EventsView.LEFT_PANE_ID = 'events-view-left-pane';
  EventsView.TOPBAR_ID = 'events-view-filter-box';
  EventsView.LIST_BOX_ID = 'events-view-source-list';
  EventsView.SIZER_ID = 'events-view-splitter-box';

  cr.addSingletonGetter(EventsView);

  EventsView.prototype = {
    // Inherit the superclass's methods.
    __proto__: superClass.prototype,

    /**
     * Initializes the list of source entries.  If source entries are already,
     * being displayed, removes them all in the process.
     */
    initializeSourceList_: function() {
      this.currentSelectedRows_ = [];
      this.sourceIdToRowMap_ = {};
      this.tableBody_.innerHTML = '';
      this.numPrefilter_ = 0;
      this.numPostfilter_ = 0;
      this.invalidateFilterCounter_();
      this.invalidateDetailsView_();
    },

    show: function(isVisible) {
      superClass.prototype.show.call(this, isVisible);
      this.splitterView_.show(isVisible);
    },

    getFilterText_: function() {
      return this.filterInput_.value;
    },

    setFilterText_: function(filterText) {
      this.filterInput_.value = filterText;
      this.onFilterTextChanged_();
    },

    onFilterTextChanged_: function() {
      this.setFilter_(this.getFilterText_());
    },

    /**
     * Updates text in the details view when time display mode is toggled.
     */
    onUseRelativeTimesChanged: function() {
      this.invalidateDetailsView_();
    },

    comparisonFuncWithReversing_: function(a, b) {
      var result = this.comparisonFunction_(a, b);
      if (this.doSortBackwards_)
        result *= -1;
      return result;
    },

    sort_: function() {
      var sourceEntries = [];
      for (var id in this.sourceIdToRowMap_) {
        sourceEntries.push(this.sourceIdToRowMap_[id].getSourceEntry());
      }
      sourceEntries.sort(this.comparisonFuncWithReversing_.bind(this));

      // Reposition source rows from back to front.
      for (var i = sourceEntries.length - 2; i >= 0; --i) {
        var sourceRow = this.sourceIdToRowMap_[sourceEntries[i].getSourceId()];
        var nextSourceId = sourceEntries[i + 1].getSourceId();
        if (sourceRow.getNextNodeSourceId() != nextSourceId) {
          var nextSourceRow = this.sourceIdToRowMap_[nextSourceId];
          sourceRow.moveBefore(nextSourceRow);
        }
      }
    },

    setFilter_: function(filterText) {
      var lastComparisonFunction = this.comparisonFunction_;
      var lastDoSortBackwards = this.doSortBackwards_;

      var filterParser = new SourceFilterParser(filterText);
      this.currentFilter_ = filterParser.filter;

      this.pickSortFunction_(filterParser.sort);

      if (lastComparisonFunction != this.comparisonFunction_ ||
          lastDoSortBackwards != this.doSortBackwards_) {
        this.sort_();
      }

      // Iterate through all of the rows and see if they match the filter.
      for (var id in this.sourceIdToRowMap_) {
        var entry = this.sourceIdToRowMap_[id];
        entry.setIsMatchedByFilter(this.currentFilter_(entry.getSourceEntry()));
      }
    },

    /**
     * Given a "sort" object with "method" and "backwards" keys, looks up and
     * sets |comparisonFunction_| and |doSortBackwards_|.  If the ID does not
     * correspond to a sort function, defaults to sorting by ID.
     */
    pickSortFunction_: function(sort) {
      this.doSortBackwards_ = sort.backwards;
      this.comparisonFunction_ = COMPARISON_FUNCTION_TABLE[sort.method];
      if (!this.comparisonFunction_) {
        this.doSortBackwards_ = false;
        this.comparisonFunction_ = compareSourceStartTime_;
      }
    },

    /**
     * Repositions |sourceRow|'s in the table using an insertion sort.
     * Significantly faster than sorting the entire table again, when only
     * one entry has changed.
     */
    insertionSort_: function(sourceRow) {
      // SourceRow that should be after |sourceRow|, if it needs
      // to be moved earlier in the list.
      var sourceRowAfter = sourceRow;
      while (true) {
        var prevSourceId = sourceRowAfter.getPreviousNodeSourceId();
        if (prevSourceId == null)
          break;
        var prevSourceRow = this.sourceIdToRowMap_[prevSourceId];
        if (this.comparisonFuncWithReversing_(
                sourceRow.getSourceEntry(), prevSourceRow.getSourceEntry()) >=
            0) {
          break;
        }
        sourceRowAfter = prevSourceRow;
      }
      if (sourceRowAfter != sourceRow) {
        sourceRow.moveBefore(sourceRowAfter);
        return;
      }

      var sourceRowBefore = sourceRow;
      while (true) {
        var nextSourceId = sourceRowBefore.getNextNodeSourceId();
        if (nextSourceId == null)
          break;
        var nextSourceRow = this.sourceIdToRowMap_[nextSourceId];
        if (this.comparisonFuncWithReversing_(
                sourceRow.getSourceEntry(), nextSourceRow.getSourceEntry()) <=
            0) {
          break;
        }
        sourceRowBefore = nextSourceRow;
      }
      if (sourceRowBefore != sourceRow)
        sourceRow.moveAfter(sourceRowBefore);
    },

    /**
     * Called whenever SourceEntries are updated with new log entries.  Updates
     * the corresponding table rows, sort order, and the details view as needed.
     */
    onSourceEntriesUpdated: function(sourceEntries) {
      var isUpdatedSourceSelected = false;
      var numNewSourceEntries = 0;

      for (var i = 0; i < sourceEntries.length; ++i) {
        var sourceEntry = sourceEntries[i];

        // Lookup the row.
        var sourceRow = this.sourceIdToRowMap_[sourceEntry.getSourceId()];

        if (!sourceRow) {
          sourceRow = new SourceRow(this, sourceEntry);
          this.sourceIdToRowMap_[sourceEntry.getSourceId()] = sourceRow;
          ++numNewSourceEntries;
        } else {
          sourceRow.onSourceUpdated();
        }

        if (sourceRow.isSelected())
          isUpdatedSourceSelected = true;

        // TODO(mmenke): Fix sorting when sorting by duration.
        //               Duration continuously increases for all entries that
        //               are still active.  This can result in incorrect
        //               sorting, until sort_ is called.
        this.insertionSort_(sourceRow);
      }

      if (isUpdatedSourceSelected)
        this.invalidateDetailsView_();
      if (numNewSourceEntries)
        this.incrementPrefilterCount(numNewSourceEntries);
    },

    /**
     * Returns the SourceRow with the specified ID, if there is one.
     * Otherwise, returns undefined.
     */
    getSourceRow: function(id) {
      return this.sourceIdToRowMap_[id];
    },

    /**
     * Called whenever all log events are deleted.
     */
    onAllSourceEntriesDeleted: function() {
      this.initializeSourceList_();
    },

    /**
     * Called when either a log file is loaded, after clearing the old entries,
     * but before getting any new ones.
     */
    onLoadLogStart: function() {},

    onLoadLogFinish: function(data) {
      return true;
    },

    incrementPrefilterCount: function(offset) {
      this.numPrefilter_ += offset;
      this.invalidateFilterCounter_();
    },

    incrementPostfilterCount: function(offset) {
      this.numPostfilter_ += offset;
      this.invalidateFilterCounter_();
    },

    onSelectionChanged: function() {
      this.invalidateDetailsView_();
    },

    clearSelection: function() {
      var prevSelection = this.currentSelectedRows_;
      this.currentSelectedRows_ = [];

      // Unselect everything that is currently selected.
      for (var i = 0; i < prevSelection.length; ++i) {
        prevSelection[i].setSelected(false);
      }

      this.onSelectionChanged();
    },

    selectAll_: function(event) {
      for (var id in this.sourceIdToRowMap_) {
        var sourceRow = this.sourceIdToRowMap_[id];
        if (sourceRow.isMatchedByFilter()) {
          sourceRow.setSelected(true);
        }
      }
      event.preventDefault();
    },

    unselectAll_: function() {
      var entries = this.currentSelectedRows_.slice(0);
      for (var i = 0; i < entries.length; ++i) {
        entries[i].setSelected(false);
      }
    },

    /**
     * If |params| includes a query, replaces the current filter and unselects.
     * all items.  If it includes a selection, tries to select the relevant
     * item.
     */
    setParameters: function(params) {
      if (params.q) {
        this.unselectAll_();
        this.setFilterText_(params.q);
      }

      if (params.s) {
        var sourceRow = this.sourceIdToRowMap_[params.s];
        if (sourceRow) {
          sourceRow.setSelected(true);
          this.scrollToSourceId(params.s);
        }
      }
    },

    /**
     * Scrolls to the source indicated by |sourceId|, if displayed.
     */
    scrollToSourceId: function(sourceId) {
      this.detailsView_.scrollToSourceId(sourceId);
    },

    /**
     * If already using the specified sort method, flips direction.  Otherwise,
     * removes pre-existing sort parameter before adding the new one.
     */
    toggleSortMethod_: function(sortMethod) {
      // Get old filter text and remove old sort directives, if any.
      var filterParser = new SourceFilterParser(this.getFilterText_());
      var filterText = filterParser.filterTextWithoutSort;

      filterText = 'sort:' + sortMethod + ' ' + filterText;

      // If already using specified sortMethod, sort backwards.
      if (!this.doSortBackwards_ &&
          COMPARISON_FUNCTION_TABLE[sortMethod] == this.comparisonFunction_) {
        filterText = '-' + filterText;
      }

      this.setFilterText_(filterText.trim());
    },

    sortById_: function(event) {
      this.toggleSortMethod_('id');
    },

    sortBySourceType_: function(event) {
      this.toggleSortMethod_('source');
    },

    sortByDescription_: function(event) {
      this.toggleSortMethod_('desc');
    },

    /**
     * Modifies the map of selected rows to include/exclude the one with
     * |sourceId|, if present.  Does not modify checkboxes or the LogView.
     * Should only be called by a SourceRow in response to its selection
     * state changing.
     */
    modifySelectionArray: function(sourceId, addToSelection) {
      var sourceRow = this.sourceIdToRowMap_[sourceId];
      if (!sourceRow)
        return;
      // Find the index for |sourceEntry| in the current selection list.
      var index = -1;
      for (var i = 0; i < this.currentSelectedRows_.length; ++i) {
        if (this.currentSelectedRows_[i] == sourceRow) {
          index = i;
          break;
        }
      }

      if (index != -1 && !addToSelection) {
        // Remove from the selection.
        this.currentSelectedRows_.splice(index, 1);
      }

      if (index == -1 && addToSelection) {
        this.currentSelectedRows_.push(sourceRow);
      }
    },

    getSelectedSourceEntries_: function() {
      var sourceEntries = [];
      for (var i = 0; i < this.currentSelectedRows_.length; ++i) {
        sourceEntries.push(this.currentSelectedRows_[i].getSourceEntry());
      }
      return sourceEntries;
    },

    invalidateDetailsView_: function() {
      this.detailsView_.setData(this.getSelectedSourceEntries_());
    },

    invalidateFilterCounter_: function() {
      if (!this.outstandingRepaintFilterCounter_) {
        this.outstandingRepaintFilterCounter_ = true;
        window.setTimeout(
            this.repaintFilterCounter_.bind(this),
            REPAINT_FILTER_COUNTER_TIMEOUT_MS);
      }
    },

    repaintFilterCounter_: function() {
      this.outstandingRepaintFilterCounter_ = false;
      this.filterCount_.innerHTML = '';
      addTextNode(
          this.filterCount_, this.numPostfilter_ + ' of ' + this.numPrefilter_);
    }
  };  // end of prototype.

  // ------------------------------------------------------------------------
  // Helper code for comparisons
  // ------------------------------------------------------------------------

  var COMPARISON_FUNCTION_TABLE = {
    // sort: and -sort: are allowed
    '': compareSourceStartTime_,
    'active': compareActive_,
    'desc': compareDescription_,
    'description': compareDescription_,
    'duration': compareDuration_,
    'id': compareSourceStartTime_,
    'source': compareSourceType_,
    'type': compareSourceType_
  };

  /**
   * Sorts active entries first.  If both entries are inactive, puts the one
   * that was active most recently first.  If both are active, uses source
   * start time or source ID, which puts longer lived events at the top, and
   * behaves better than using duration or time of first event.
   */
  function compareActive_(source1, source2) {
    if (!source1.isInactive() && source2.isInactive())
      return -1;
    if (source1.isInactive() && !source2.isInactive())
      return 1;
    if (source1.isInactive()) {
      var deltaEndTime = source1.getEndTicks() - source2.getEndTicks();
      if (deltaEndTime != 0) {
        // The one that ended most recently (Highest end time) should be sorted
        // first.
        return -deltaEndTime;
      }
      // If both ended at the same time, then odds are they were related events,
      // started one after another, so sort in the opposite order of their
      // source start time or source IDs to get a more intuitive ordering.
      return -compareSourceStartTime_(source1, source2);
    }
    return compareSourceStartTime_(source1, source2);
  }

  function compareDescription_(source1, source2) {
    var source1Text = source1.getDescription().toLowerCase();
    var source2Text = source2.getDescription().toLowerCase();
    var compareResult = source1Text.localeCompare(source2Text);
    if (compareResult != 0)
      return compareResult;
    return compareSourceStartTime_(source1, source2);
  }

  function compareDuration_(source1, source2) {
    var durationDifference = source2.getDuration() - source1.getDuration();
    if (durationDifference)
      return durationDifference;
    return compareSourceStartTime_(source1, source2);
  }

  function compareSourceId_(source1, source2) {
    return source1.getSourceId() - source2.getSourceId();
  }

  function compareSourceType_(source1, source2) {
    var source1Text = source1.getSourceTypeString();
    var source2Text = source2.getSourceTypeString();
    var compareResult = source1Text.localeCompare(source2Text);
    if (compareResult != 0)
      return compareResult;
    return compareSourceStartTime_(source1, source2);
  }

  /**
   * If the log contains source start_time fields, and the sources have
   * differing start times, sort by that.
   * Otherwise, sort by source id. Older logs that don't contain source start
   * time also won't contain source id partitioning, so sorting by source id is
   * equivalent to sorting by source start time.  If the start_times are the
   * same, the source ID will indicate the true order the sources were created,
   * if they were created in the same process.
   */
  function compareSourceStartTime_(source1, source2) {
    if (source1.hasSourceStartTime() && source2.hasSourceStartTime()) {
      var startDifference = source1.getStartTicks() - source2.getStartTicks();
      if (startDifference) {
        return startDifference;
      }
    }
    return compareSourceId_(source1, source2);
  }

  return EventsView;
})();
// details_view.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var DetailsView = (function() {
  'use strict';

  // We inherit from DivView.
  var superClass = DivView;

  /**
   * The DetailsView displays the "log" view. This class keeps track of the
   * selected SourceEntries, and repaints when they change.
   *
   * @constructor
   */
  function DetailsView(boxId) {
    superClass.call(this, boxId);
    this.sourceEntries_ = [];
    // Map of source IDs to their corresponding DIVs.
    this.sourceIdToDivMap_ = {};
    // True when there's an asychronous repaint outstanding.
    this.outstandingRepaint_ = false;
    // ID of source entry we should jump to after the oustanding repaint.
    // 0 if none, or there's no such repaint.
    this.outstandingScrollToId_ = 0;
  }

  // The delay between updates to repaint.
  var REPAINT_TIMEOUT_MS = 50;

  DetailsView.prototype = {
    // Inherit the superclass's methods.
    __proto__: superClass.prototype,

    setData: function(sourceEntries) {
      // Make a copy of the array (in case the caller mutates it), and sort it
      // by the source ID.
      this.sourceEntries_ = createSortedCopy_(sourceEntries);

      // Repaint the view.
      if (this.isVisible() && !this.outstandingRepaint_) {
        this.outstandingRepaint_ = true;
        window.setTimeout(this.repaint.bind(this), REPAINT_TIMEOUT_MS);
      }
    },

    repaint: function() {
      this.outstandingRepaint_ = false;
      this.sourceIdToDivMap_ = {};
      this.getNode().innerHTML = '';

      var node = this.getNode();

      for (var i = 0; i < this.sourceEntries_.length; ++i) {
        if (i != 0)
          addNode(node, 'hr');

        var sourceEntry = this.sourceEntries_[i];
        var div = addNode(node, 'div');
        div.className = 'log-source-entry';

        var p = addNode(div, 'p');
        addNodeWithText(
            p, 'h4',
            sourceEntry.getSourceId() + ': ' +
                sourceEntry.getSourceTypeString());

        if (sourceEntry.getDescription())
          addNodeWithText(p, 'h4', sourceEntry.getDescription());

        const startDate =
            timeutil.convertTimeTicksToDate(sourceEntry.getStartTicks());
        var startTimeDiv = addNodeWithText(p, 'div', 'Start Time: ');
        timeutil.addNodeWithDate(startTimeDiv, startDate);

        sourceEntry.printAsText(div);

        this.sourceIdToDivMap_[sourceEntry.getSourceId()] = div;
      }

      if (this.outstandingScrollToId_) {
        this.scrollToSourceId(this.outstandingScrollToId_);
        this.outstandingScrollToId_ = 0;
      }
    },

    show: function(isVisible) {
      superClass.prototype.show.call(this, isVisible);
      if (isVisible) {
        this.repaint();
      } else {
        this.getNode().innerHTML = '';
      }
    },

    /**
     * Scrolls to the source indicated by |sourceId|, if displayed.  If a
     * repaint is outstanding, waits for it to complete before scrolling.
     */
    scrollToSourceId: function(sourceId) {
      if (this.outstandingRepaint_) {
        this.outstandingScrollToId_ = sourceId;
        return;
      }
      var div = this.sourceIdToDivMap_[sourceId];
      if (div)
        div.scrollIntoView();
    }
  };

  function createSortedCopy_(origArray) {
    var sortedArray = origArray.slice(0);
    sortedArray.sort(function(a, b) {
      return a.getSourceId() - b.getSourceId();
    });
    return sortedArray;
  }

  return DetailsView;
})();
// source_entry.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

class SourceEntry {
  /**
   * A SourceEntry gathers all log entries with the same source.
   *
   * @constructor
   */
  constructor(logEntry) {
    this.entries_ = [];
    this.description_ = '';

    // Set to true on most net errors.
    this.isError_ = false;

    // If the first entry is a BEGIN_PHASE, set to false.
    // Set to true when an END_PHASE matching the first entry is encountered.
    this.isInactive_ = true;

    if (logEntry.phase === EventPhase.PHASE_BEGIN) {
      this.isInactive_ = false;
    }

    this.update(logEntry);
  }

  update(logEntry) {
    // Only the last event should have the same type first event,
    if (!this.isInactive_ && logEntry.phase === EventPhase.PHASE_END &&
        logEntry.type === this.entries_[0].type) {
      this.isInactive_ = true;
    }

    // If we have a net error code, update |this.isError_| if appropriate.
    if (logEntry.params) {
      const netErrorCode = logEntry.params.net_error;
      // Skip both cases where netErrorCode is undefined, and cases where it
      // is 0, indicating no actual error occurred.
      if (netErrorCode) {
        // Ignore error code caused by not finding an entry in the cache.
        if (logEntry.type !== EventType.HTTP_CACHE_OPEN_ENTRY ||
            netErrorCode !== NetError.ERR_FAILED) {
          this.isError_ = true;
        }
      }
    }

    const prevStartEntry = this.getStartEntry_();
    this.entries_.push(logEntry);
    const curStartEntry = this.getStartEntry_();

    // If we just got the first entry for this source.
    if (prevStartEntry !== curStartEntry) {
      this.updateDescription_();
    }
  }

  updateDescription_() {
    const e = this.getStartEntry_();
    this.description_ = '';
    if (!e) {
      return;
    }

    if (e.source.type === EventSourceType.NONE) {
      // NONE is what we use for global events that aren't actually grouped
      // by a "source ID", so we will just stringize the event's type.
      this.description_ = EventTypeNames[e.type];
      return;
    }

    if (e.params === undefined) {
      return;
    }

    switch (e.source.type) {
      case EventSourceType.URL_REQUEST:
      case EventSourceType.DOH_URL_REQUEST:
      case EventSourceType.HTTP_STREAM_JOB:
      case EventSourceType.HTTP_STREAM_JOB_CONTROLLER:
      case EventSourceType.BIDIRECTIONAL_STREAM:
        this.description_ = e.params.url;
        break;
      case EventSourceType.TRANSPORT_CONNECT_JOB:
      case EventSourceType.SSL_CONNECT_JOB:
      case EventSourceType.SOCKS_CONNECT_JOB:
      case EventSourceType.HTTP_PROXY_CONNECT_JOB:
      case EventSourceType.WEB_SOCKET_TRANSPORT_CONNECT_JOB:
        if ((typeof e.params.group_id) === 'string') {
          this.description_ = e.params.group_id;
        } else if ((typeof e.params.group_name) === 'string') {
          // Prior to M75, the connect job group name was here.
          this.description_ = e.params.group_name;
        }
        break;
      case EventSourceType.HOST_RESOLVER_IMPL_JOB:
      case EventSourceType.HOST_RESOLVER_IMPL_PROC_TASK:
        this.description_ = e.params.host;
        break;
      case EventSourceType.DISK_CACHE_ENTRY:
      case EventSourceType.MEMORY_CACHE_ENTRY:
        this.description_ = e.params.key;
        break;
      case EventSourceType.CERT_VERIFIER_JOB:
      case EventSourceType.CERT_VERIFIER_TASK:
      case EventSourceType.QUIC_SESSION:
      case EventSourceType.QUIC_SESSION_POOL_JOB:
        if (e.params.host !== undefined) {
          this.description_ = e.params.host;
        }
        break;
      case EventSourceType.HTTP2_SESSION:
        if (e.params.host) {
          this.description_ = e.params.host + ' (' + e.params.proxy + ')';
        }
        break;
      case EventSourceType.HTTP_PIPELINED_CONNECTION:
        if (e.params.host_and_port) {
          this.description_ = e.params.host_and_port;
        }
        break;
      case EventSourceType.SOCKET:
      case EventSourceType.PROXY_CLIENT_SOCKET:
        // Use description of parent source, if any.
        if (e.params.source_dependency !== undefined) {
          const parentId = e.params.source_dependency.id;
          this.description_ =
              SourceTracker.getInstance().getDescription(parentId);
        }
        break;
      case EventSourceType.UDP_SOCKET:
        if (e.params.address !== undefined) {
          this.description_ = e.params.address;
          // If the parent of |this| is a HOST_RESOLVER_IMPL_JOB, use
          // '<DNS Server IP> [<host we're resolving>]'.
          if (this.entries_[0].type === EventType.SOCKET_ALIVE &&
              this.entries_[0].params &&
              this.entries_[0].params.source_dependency !== undefined) {
            const parentId = this.entries_[0].params.source_dependency.id;
            const parent = SourceTracker.getInstance().getSourceEntry(parentId);
            if (parent &&
                parent.getSourceType() ===
                    EventSourceType.HOST_RESOLVER_IMPL_JOB &&
                parent.getDescription().length > 0) {
              this.description_ += ' [' + parent.getDescription() + ']';
            }
          }
        }
        break;
      case EventSourceType.ASYNC_HOST_RESOLVER_REQUEST:
      case EventSourceType.DNS_TRANSACTION:
      case EventSourceType.DNS_OVER_HTTPS:
        this.description_ = e.params.hostname;
        break;
      case EventSourceType.DOWNLOAD:
        switch (e.type) {
          case EventType.DOWNLOAD_FILE_RENAMED:
            this.description_ = e.params.new_filename;
            break;
          case EventType.DOWNLOAD_FILE_OPENED:
            this.description_ = e.params.file_name;
            break;
          case EventType.DOWNLOAD_ITEM_ACTIVE:
            this.description_ = e.params.file_name;
            break;
        }
        break;
      case EventSourceType.WEB_TRANSPORT_CLIENT:
        if (e.params.url) {
          this.description_ = e.params.url;
        }
        break;
    }

    if (this.description_ === undefined) {
      this.description_ = '';
    }
  }

  /**
   * Returns a description for this source log stream, which will be displayed
   * in the list view. Most often this is a URL that identifies the request,
   * or a hostname for a connect job, etc...
   */
  getDescription() {
    return this.description_;
  }

  /**
   * Returns the starting entry for this source. Conceptually this is the
   * first entry that was logged to this source. However, we skip over the
   * TYPE_REQUEST_ALIVE entries without parameters which wrap
   * TYPE_URL_REQUEST_START_JOB entries.  (TYPE_REQUEST_ALIVE may or may not
   * have parameters depending on what version of Chromium they were
   * generated from.)
   */
  getStartEntry_() {
    if (this.entries_.length < 1) {
      return undefined;
    }
    if (this.entries_[0].source.type === EventSourceType.FILESTREAM) {
      const e = this.findLogEntryByType_(EventType.FILE_STREAM_OPEN);
      if (e !== undefined) {
        return e;
      }
    }
    if (this.entries_[0].source.type === EventSourceType.DOWNLOAD) {
      // If any rename occurred, use the last name
      e = this.findLastLogEntryStartByType_(EventType.DOWNLOAD_FILE_RENAMED);
      if (e !== undefined) {
        return e;
      }
      // Otherwise, if the file was opened, use that name
      e = this.findLogEntryByType_(EventType.DOWNLOAD_FILE_OPENED);
      if (e !== undefined) {
        return e;
      }
      // History items are never opened, so use the activation info
      e = this.findLogEntryByType_(EventType.DOWNLOAD_ITEM_ACTIVE);
      if (e !== undefined) {
        return e;
      }
    }
    if (this.entries_.length >= 2) {
      if (this.entries_[1].type === EventType.UDP_CONNECT) {
        return this.entries_[1];
      }
      if (this.entries_[1].type === EventType.IPV6_PROBE_RUNNING) {
        return this.entries_[1];
      }

      if (this.entries_[1].type === EventType.SOCKET_POOL_CONNECT_JOB_CREATED) {
        return this.entries_[1];
      }
      if (this.entries_[1].type === EventType.CERT_VERIFY_PROC) {
        return this.entries_[1];
      }
    }
    return this.entries_[0];
  }

  /**
   * Returns the first entry with the specified type, or undefined if not
   * found.
   */
  findLogEntryByType_(type) {
    for (let i = 0; i < this.entries_.length; ++i) {
      if (this.entries_[i].type === type) {
        return this.entries_[i];
      }
    }
    return undefined;
  }

  /**
   * Returns the beginning of the last entry with the specified type, or
   * undefined if not found.
   */
  findLastLogEntryStartByType_(type) {
    for (let i = this.entries_.length - 1; i >= 0; --i) {
      if (this.entries_[i].type === type) {
        if (this.entries_[i].phase !== EventPhase.PHASE_END) {
          return this.entries_[i];
        }
      }
    }
    return undefined;
  }

  getLogEntries() {
    return this.entries_;
  }

  getSourceTypeString() {
    return EventSourceTypeNames[this.entries_[0].source.type];
  }

  getSourceType() {
    return this.entries_[0].source.type;
  }

  getSourceId() {
    return this.entries_[0].source.id;
  }

  isInactive() {
    return this.isInactive_;
  }

  isError() {
    return this.isError_;
  }

  /**
   * Returns time ticks of start of source. This may differ from
   * the time of the first event if netlogging was started in the middle of a
   * source, or if the source was created some time before the first event is
   * logged.
   */
  getStartTicks() {
    if (this.entries_[0].source.start_time !== undefined) {
      return this.entries_[0].source.start_time;
    }
    return this.entries_[0].time;
  }

  /**
   * Returns true if this entry was created by a version of Chrome that records
   * the start time of each source.
   */
  hasSourceStartTime() {
    return this.entries_[0].source.start_time !== undefined;
  }

  /**
   * Returns time of last event if inactive.  Returns current time otherwise.
   * Returned time is a "time ticks" value.
   */
  getEndTicks() {
    if (!this.isInactive_) {
      return timeutil.getCurrentTimeTicks();
    }
    return this.entries_[this.entries_.length - 1].time;
  }

  /**
   * Returns the time between the first and last events with a matching
   * source ID.  If source is still active, uses the current time for the
   * last event.
   */
  getDuration() {
    const startTime = this.getStartTicks();
    const endTime = this.getEndTicks();
    return endTime - startTime;
  }

  /**
   * Prints descriptive text about |entries_| to a new node added to the end
   * of |parent|.
   */
  printAsText(parent) {
    const tablePrinter = this.createTablePrinter();

    // Format the table for fixed-width text.
    tablePrinter.toText(0, parent);
  }

  /**
   * Creates a table printer for the SourceEntry.
   */
  createTablePrinter(forSearch=false) {
    return createLogEntryTablePrinter(
        this.entries_,
        SourceTracker.getInstance().getUseRelativeTimes() ?
          timeutil.getBaseTime() :
          0,
        Constants.clientInfo.numericDate, forSearch);
  }
}
// horizontal_scrollbar_view.js
// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * This view consists of two nested divs.  The outer one has a horizontal
 * scrollbar and the inner one has a height of 1 pixel and a width set to
 * allow an appropriate scroll range.  The view reports scroll events to
 * a callback specified on construction.
 *
 * All this funkiness is necessary because there is no HTML scroll control.
 * TODO(mmenke):  Consider implementing our own scrollbar directly.
 */
var HorizontalScrollbarView = (function() {
  'use strict';

  // We inherit from DivView.
  var superClass = DivView;

  /**
   * @constructor
   */
  function HorizontalScrollbarView(divId, innerDivId, callback) {
    superClass.call(this, divId);
    this.callback_ = callback;
    this.innerDiv_ = $(innerDivId);
    $(divId).onscroll = this.onScroll_.bind(this);

    // The current range and position of the scrollbar.  Because DOM updates
    // are asynchronous, the current state cannot be read directly from the DOM
    // after updating the range.
    this.range_ = 0;
    this.position_ = 0;

    // The DOM updates asynchronously, so sometimes we need a timer to update
    // the current scroll position after resizing the scrollbar.
    this.updatePositionTimerId_ = null;
  }

  HorizontalScrollbarView.prototype = {
    // Inherit the superclass's methods.
    __proto__: superClass.prototype,

    onResized: function() {
      this.setRange(this.range_);
    },

    show: function(isVisible) {
      superClass.prototype.show.call(this, isVisible);
    },

    /**
     * Sets the range of the scrollbar.  The scrollbar can have a value
     * anywhere from 0 to |range|, inclusive.  The width of the drag area
     * on the scrollbar will generally be based on the width of the scrollbar
     * relative to the size of |range|, so if the scrollbar is about the size
     * of the thing we're scrolling, we get fairly nice behavior.
     *
     * If |range| is less than the original position, |position_| is set to
     * |range|.  Otherwise, it is not modified.
     */
    setRange: function(range) {
      this.range_ = range;
      setNodeWidth(this.innerDiv_, this.getNode().offsetWidth + range);
      if (range < this.position_)
        this.position_ = range;
      this.setPosition(this.position_);
    },

    /**
     * Sets the position of the scrollbar.  |position| must be between 0 and
     * |range_|, inclusive.
     */
    setPosition: function(position) {
      this.position_ = position;
      this.updatePosition_();
    },

    /**
     * Updates the visible position of the scrollbar to be |position_|.
     * On failure, calls itself again after a timeout.  This is needed because
     * setRange does not synchronously update the DOM.
     */
    updatePosition_: function() {
      // Clear the timer if we have one, so we don't have two timers running at
      // once.  This is safe even if we were just called from the timer, in
      // which case clearTimeout will silently fail.
      if (this.updatePositionTimerId_ !== null) {
        window.clearTimeout(this.updatePositionTimerId_);
        this.updatePositionTimerId_ = null;
      }

      this.getNode().scrollLeft = this.position_;
      if (this.getNode().scrollLeft != this.position_) {
        this.updatePositionTimerId_ =
            window.setTimeout(this.updatePosition_.bind(this));
      }
    },

    getRange: function() {
      return this.range_;
    },

    getPosition: function() {
      return this.position_;
    },

    onScroll_: function() {
      // If we're waiting to update the range, ignore messages from the
      // scrollbar.
      if (this.updatePositionTimerId_ !== null)
        return;
      var newPosition = this.getNode().scrollLeft;
      if (newPosition == this.position_)
        return;
      this.position_ = newPosition;
      this.callback_();
    }
  };

  return HorizontalScrollbarView;
})();
// timeline_data_series.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Different data types that each require their own labelled axis.
 */
var TimelineDataType = {SOURCE_COUNT: 0, BYTES_PER_SECOND: 1};

/**
 * A TimelineDataSeries collects an ordered series of (time, value) pairs,
 * and converts them to graph points.  It also keeps track of its color and
 * current visibility state.  DataSeries are solely responsible for tracking
 * data, and do not send notifications on state changes.
 *
 * Abstract class, doesn't implement onReceivedLogEntry.
 */
var TimelineDataSeries = (function() {
  'use strict';

  /**
   * @constructor
   */
  function TimelineDataSeries(dataType) {
    // List of DataPoints in chronological order.
    this.dataPoints_ = [];

    // Data type of the DataSeries.  This is used to scale all values with
    // the same units in the same way.
    this.dataType_ = dataType;
    // Default color.  Should always be overridden prior to display.
    this.color_ = 'red';
    // Whether or not the data series should be drawn.
    this.isVisible_ = false;

    this.cacheStartTime_ = null;
    this.cacheStepSize_ = 0;
    this.cacheValues_ = [];
  }

  TimelineDataSeries.prototype = {
    /**
     * Adds a DataPoint to |this| with the specified time and value.
     * DataPoints are assumed to be received in chronological order.
     */
    addPoint: function(timeTicks, value) {
      var time = timeutil.convertTimeTicksToDate(timeTicks).getTime();
      this.dataPoints_.push(new DataPoint(time, value));
    },

    isVisible: function() {
      return this.isVisible_;
    },

    show: function(isVisible) {
      this.isVisible_ = isVisible;
    },

    getColor: function() {
      return this.color_;
    },

    setColor: function(color) {
      this.color_ = color;
    },

    getDataType: function() {
      return this.dataType_;
    },

    /**
     * Returns a list containing the values of the data series at |count|
     * points, starting at |startTime|, and |stepSize| milliseconds apart.
     * Caches values, so showing/hiding individual data series is fast, and
     * derived data series can be efficiently computed, if we add any.
     */
    getValues: function(startTime, stepSize, count) {
      // Use cached values, if we can.
      if (this.cacheStartTime_ == startTime &&
          this.cacheStepSize_ == stepSize &&
          this.cacheValues_.length == count) {
        return this.cacheValues_;
      }

      // Do all the work.
      this.cacheValues_ = this.getValuesInternal_(startTime, stepSize, count);
      this.cacheStartTime_ = startTime;
      this.cacheStepSize_ = stepSize;

      return this.cacheValues_;
    },

    /**
     * Does all the work of getValues when we can't use cached data.
     *
     * The default implementation just uses the |value| of the most recently
     * seen DataPoint before each time, but other DataSeries may use some
     * form of interpolation.
     * TODO(mmenke):  Consider returning the maximum value over each interval
     *                to create graphs more stable with respect to zooming.
     */
    getValuesInternal_: function(startTime, stepSize, count) {
      var values = [];
      var nextPoint = 0;
      var currentValue = 0;
      var time = startTime;
      for (var i = 0; i < count; ++i) {
        while (nextPoint < this.dataPoints_.length &&
               this.dataPoints_[nextPoint].time < time) {
          currentValue = this.dataPoints_[nextPoint].value;
          ++nextPoint;
        }
        values[i] = currentValue;
        time += stepSize;
      }
      return values;
    }
  };

  /**
   * A single point in a data series.  Each point has a time, in the form of
   * milliseconds since the Unix epoch, and a numeric value.
   * @constructor
   */
  function DataPoint(time, value) {
    this.time = time;
    this.value = value;
  }

  return TimelineDataSeries;
})();

/**
 * Tracks how many sources of the given type have seen a begin
 * event of type |eventType| more recently than an end event.
 */
var SourceCountDataSeries = (function() {
  'use strict';

  var superClass = TimelineDataSeries;

  /**
   * @constructor
   */
  function SourceCountDataSeries(sourceType, eventType) {
    superClass.call(this, TimelineDataType.SOURCE_COUNT);
    this.sourceType_ = sourceType;
    this.eventType_ = eventType;

    // Map of sources for which we've seen a begin event more recently than an
    // end event.  Each such source has a value of "true".  All others are
    // undefined.
    this.activeSources_ = {};
    // Number of entries in |activeSources_|.
    this.activeCount_ = 0;
  }

  SourceCountDataSeries.prototype = {
    // Inherit the superclass's methods.
    __proto__: superClass.prototype,

    onReceivedLogEntry: function(entry) {
      if (entry.source.type != this.sourceType_ ||
          entry.type != this.eventType_) {
        return;
      }

      if (entry.phase == EventPhase.PHASE_BEGIN) {
        this.onBeginEvent(entry.source.id, entry.time);
        return;
      }
      if (entry.phase == EventPhase.PHASE_END)
        this.onEndEvent(entry.source.id, entry.time);
    },

    /**
     * Called when the source with the specified id begins doing whatever we
     * care about.  If it's not already an active source, we add it to the map
     * and add a data point.
     */
    onBeginEvent: function(id, time) {
      if (this.activeSources_[id])
        return;
      this.activeSources_[id] = true;
      ++this.activeCount_;
      this.addPoint(time, this.activeCount_);
    },

    /**
     * Called when the source with the specified id stops doing whatever we
     * care about.  If it's an active source, we remove it from the map and add
     * a data point.
     */
    onEndEvent: function(id, time) {
      if (!this.activeSources_[id])
        return;
      delete this.activeSources_[id];
      --this.activeCount_;
      this.addPoint(time, this.activeCount_);
    }
  };

  return SourceCountDataSeries;
})();

/**
 * Tracks the number of sockets currently in use.  Needs special handling of
 * SSL sockets, so can't just use a normal SourceCountDataSeries.
 */
var SocketsInUseDataSeries = (function() {
  'use strict';

  var superClass = SourceCountDataSeries;

  /**
   * @constructor
   */
  function SocketsInUseDataSeries() {
    superClass.call(this, EventSourceType.SOCKET, EventType.SOCKET_IN_USE);
  }

  SocketsInUseDataSeries.prototype = {
    // Inherit the superclass's methods.
    __proto__: superClass.prototype,

    onReceivedLogEntry: function(entry) {
      // SSL sockets have two nested SOCKET_IN_USE events.  This is needed to
      // mark SSL sockets as unused after SSL negotiation.
      if (entry.type == EventType.SSL_CONNECT &&
          entry.phase == EventPhase.PHASE_END) {
        this.onEndEvent(entry.source.id, entry.time);
        return;
      }
      superClass.prototype.onReceivedLogEntry.call(this, entry);
    }
  };

  return SocketsInUseDataSeries;
})();

/**
 * Tracks approximate data rate using individual data transfer events.
 * Abstract class, doesn't implement onReceivedLogEntry.
 */
var TransferRateDataSeries = (function() {
  'use strict';

  var superClass = TimelineDataSeries;

  /**
   * @constructor
   */
  function TransferRateDataSeries() {
    superClass.call(this, TimelineDataType.BYTES_PER_SECOND);
  }

  TransferRateDataSeries.prototype = {
    // Inherit the superclass's methods.
    __proto__: superClass.prototype,

    /**
     * Returns the average data rate over each interval, only taking into
     * account transfers that occurred within each interval.
     * TODO(mmenke): Do something better.
     */
    getValuesInternal_: function(startTime, stepSize, count) {
      // Find the first DataPoint after |startTime| - |stepSize|.
      var nextPoint = 0;
      while (nextPoint < this.dataPoints_.length &&
             this.dataPoints_[nextPoint].time < startTime - stepSize) {
        ++nextPoint;
      }

      var values = [];
      var time = startTime;
      for (var i = 0; i < count; ++i) {
        // Calculate total bytes transferred from |time| - |stepSize|
        // to |time|.  We look at the transfers before |time| to give
        // us generally non-varying values for a given time.
        var transferred = 0;
        while (nextPoint < this.dataPoints_.length &&
               this.dataPoints_[nextPoint].time < time) {
          transferred += this.dataPoints_[nextPoint].value;
          ++nextPoint;
        }
        // Calculate bytes per second.
        values[i] = 1000 * transferred / stepSize;
        time += stepSize;
      }
      return values;
    }
  };

  return TransferRateDataSeries;
})();

/**
 * Tracks TCP and UDP transfer rate.
 */
var NetworkTransferRateDataSeries = (function() {
  'use strict';

  var superClass = TransferRateDataSeries;

  /**
   * |tcpEvent| and |udpEvent| are the event types for data transfers using
   * TCP and UDP, respectively.
   * @constructor
   */
  function NetworkTransferRateDataSeries(tcpEvent, udpEvent) {
    superClass.call(this);
    this.tcpEvent_ = tcpEvent;
    this.udpEvent_ = udpEvent;
  }

  NetworkTransferRateDataSeries.prototype = {
    // Inherit the superclass's methods.
    __proto__: superClass.prototype,

    onReceivedLogEntry: function(entry) {
      if (entry.type != this.tcpEvent_ && entry.type != this.udpEvent_)
        return;
      this.addPoint(entry.time, entry.params.byte_count);
    },
  };

  return NetworkTransferRateDataSeries;
})();

/**
 * Tracks disk cache read or write rate.  Doesn't include clearing, opening,
 * or dooming entries, as they don't have clear size values.
 */
var DiskCacheTransferRateDataSeries = (function() {
  'use strict';

  var superClass = TransferRateDataSeries;

  /**
   * @constructor
   */
  function DiskCacheTransferRateDataSeries(eventType) {
    superClass.call(this);
    this.eventType_ = eventType;
  }

  DiskCacheTransferRateDataSeries.prototype = {
    // Inherit the superclass's methods.
    __proto__: superClass.prototype,

    onReceivedLogEntry: function(entry) {
      if (entry.source.type != EventSourceType.DISK_CACHE_ENTRY ||
          entry.type != this.eventType_ ||
          entry.phase != EventPhase.PHASE_END) {
        return;
      }
      // The disk cache has a lot of 0-length writes, when truncating entries.
      // Ignore those.
      if (entry.params.bytes_copied != 0)
        this.addPoint(entry.time, entry.params.bytes_copied);
    }
  };

  return DiskCacheTransferRateDataSeries;
})();
// timeline_graph_view.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * A TimelineGraphView displays a timeline graph on a canvas element.
 */
var TimelineGraphView = (function() {
  'use strict';
  // We inherit from DivView.
  var superClass = DivView;

  // Default starting scale factor, in terms of milliseconds per pixel.
  var DEFAULT_SCALE = 1000;

  // Maximum number of labels placed vertically along the sides of the graph.
  var MAX_VERTICAL_LABELS = 6;

  // Vertical spacing between labels and between the graph and labels.
  var LABEL_VERTICAL_SPACING = 4;
  // Horizontal spacing between vertically placed labels and the edges of the
  // graph.
  var LABEL_HORIZONTAL_SPACING = 3;
  // Horizintal spacing between two horitonally placed labels along the bottom
  // of the graph.
  var LABEL_LABEL_HORIZONTAL_SPACING = 25;

  // Length of ticks, in pixels, next to y-axis labels.  The x-axis only has
  // one set of labels, so it can use lines instead.
  var Y_AXIS_TICK_LENGTH = 10;

  // The number of units mouse wheel deltas increase for each tick of the
  // wheel.
  var MOUSE_WHEEL_UNITS_PER_CLICK = 120;

  // Amount we zoom for one vertical tick of the mouse wheel, as a ratio.
  var MOUSE_WHEEL_ZOOM_RATE = 1.25;
  // Amount we scroll for one horizontal tick of the mouse wheel, in pixels.
  var MOUSE_WHEEL_SCROLL_RATE = MOUSE_WHEEL_UNITS_PER_CLICK;
  // Number of pixels to scroll per pixel the mouse is dragged.
  var MOUSE_WHEEL_DRAG_RATE = 3;

  var GRID_COLOR = '#CCC';
  var TEXT_COLOR = '#000';
  var BACKGROUND_COLOR = '#FFF';

  // Which side of the canvas y-axis labels should go on, for a given Graph.
  // TODO(mmenke):  Figure out a reasonable way to handle more than 2 sets
  //                of labels.
  var LabelAlign = {LEFT: 0, RIGHT: 1};

  /**
   * @constructor
   */
  function TimelineGraphView(graphDivId, canvasId, scrollbarId,
                             scrollbarInnerId) {
    // Call superclass's constructor.
    superClass.call(this, graphDivId);

    this.scrollbar_ = new HorizontalScrollbarView(
        scrollbarId, scrollbarInnerId, this.onScroll_.bind(this));

    this.graphDiv_ = $(graphDivId);
    this.canvas_ = $(canvasId);
    this.canvas_.onmousewheel = this.onMouseWheel_.bind(this);
    this.canvas_.onmousedown = this.onMouseDown_.bind(this);
    this.canvas_.onmousemove = this.onMouseMove_.bind(this);
    this.canvas_.onmouseup = this.onMouseUp_.bind(this);
    this.canvas_.onmouseout = this.onMouseUp_.bind(this);

    // Used for click and drag scrolling of graph.  Drag-zooming not supported,
    // for a more stable scrolling experience.
    this.isDragging_ = false;
    this.dragX_ = 0;

    // Set the range and scale of the graph.  Times are in milliseconds since
    // the Unix epoch.

    // All measurements we have must be after this time.
    this.startTime_ = 0;
    // The current rightmost position of the graph is always at most this.
    // We may have some later events.  When actively capturing new events, it's
    // updated on a timer.
    this.endTime_ = 1;

    // Current scale, in terms of milliseconds per pixel.  Each column of
    // pixels represents a point in time |scale_| milliseconds after the
    // previous one.  We only display times that are of the form
    // |startTime_| + K * |scale_| to avoid jittering, and the rightmost
    // pixel that we can display has a time <= |endTime_|.  Non-integer values
    // are allowed.
    this.scale_ = DEFAULT_SCALE;

    this.graphs_ = [];

    // Initialize the scrollbar.
    this.updateScrollbarRange_(true);

    this.initResizePolling_(true);
  }

  // Smallest allowed scaling factor.
  TimelineGraphView.MIN_SCALE = 5;

  TimelineGraphView.prototype = {
    // Inherit the superclass's methods.
    __proto__: superClass.prototype,

    getPreferredCanvasSize_: function() {
      // The size of the canvas can only be set by using its |width| and
      // |height| properties, which do not take padding into account, so we
      // need to use them ourselves.
      var style = getComputedStyle(this.canvas_);
      var horizontalPadding =
          parseInt(style.paddingRight) + parseInt(style.paddingLeft);
      var verticalPadding =
          parseInt(style.paddingTop) + parseInt(style.paddingBottom);
      var canvasWidth =
          parseInt(this.graphDiv_.clientWidth) - horizontalPadding;
      // For unknown reasons, there's an extra 3 pixels border between the
      // bottom of the canvas and the bottom margin of the enclosing div.
      var canvasHeight =
          parseInt(this.graphDiv_.clientHeight) - verticalPadding - 3;

      // Protect against degenerates.
      if (canvasWidth < 10)
        canvasWidth = 10;
      if (canvasHeight < 10)
        canvasHeight = 10;

      return {
        width: canvasWidth,
        height: canvasHeight
      };
    },

    onResized: function() {
      this.scrollbar_.onResized();

      let preferredSize = this.getPreferredCanvasSize_();

      this.canvas_.width = preferredSize.width;
      this.canvas_.height = preferredSize.height;

      // Use the same font style for the canvas as we use elsewhere.
      // Has to be updated every resize.
      this.canvas_.getContext('2d').font = getComputedStyle(this.canvas_).font;

      this.updateScrollbarRange_(this.graphScrolledToRightEdge_());
      this.repaint();
    },

    show: function(isVisible) {
      superClass.prototype.show.call(this, isVisible);

      this.initResizePolling_(isVisible);

      if (isVisible)
        this.repaint();
    },

    // TODO(eroman): This is a bit silly, but good enough for now. Canvas needs
    // to be sized explicitly, however in this case we want it to occupy all
    // remaining space. Use polling to check when the canvas logical dimensions
    // needs to be updated to match the layout size.
    initResizePolling_: function(active) {
      if (active && !this.resizeTimer_) {
        this.resizeTimer_ = window.setInterval(
            this.checkForResize_.bind(this), 1000);
      } else if (!active && this.resizeTimer_) {
        window.clearInterval(this.resizeTimer_);
        this.resizeTimer_ = null;
      }
    },

    checkForResize_: function() {
      let preferredSize = this.getPreferredCanvasSize_();
      if ((preferredSize.width != this.canvas_.width) ||
          (preferredSize.height != this.canvas_.height)) {
        this.onResized();
      }
    },

    // Returns the total length of the graph, in pixels.
    getLength_: function() {
      var timeRange = this.endTime_ - this.startTime_;
      // Math.floor is used to ignore the last partial area, of length less
      // than |scale_|.
      return Math.floor(timeRange / this.scale_);
    },

    /**
     * Returns true if the graph is scrolled all the way to the right.
     */
    graphScrolledToRightEdge_: function() {
      return this.scrollbar_.getPosition() == this.scrollbar_.getRange();
    },

    /**
     * Update the range of the scrollbar.  If |resetPosition| is true, also
     * sets the slider to point at the rightmost position and triggers a
     * repaint.
     */
    updateScrollbarRange_: function(resetPosition) {
      var scrollbarRange = this.getLength_() - this.canvas_.width;
      if (scrollbarRange < 0)
        scrollbarRange = 0;

      // If we've decreased the range to less than the current scroll position,
      // we need to move the scroll position.
      if (this.scrollbar_.getPosition() > scrollbarRange)
        resetPosition = true;

      this.scrollbar_.setRange(scrollbarRange);
      if (resetPosition) {
        this.scrollbar_.setPosition(scrollbarRange);
        this.repaint();
      }
    },

    /**
     * Sets the date range displayed on the graph, switches to the default
     * scale factor, and moves the scrollbar all the way to the right.
     */
    setDateRange: function(startDate, endDate) {
      this.startTime_ = startDate.getTime();
      this.endTime_ = endDate.getTime();

      // Safety check.
      if (this.endTime_ <= this.startTime_)
        this.startTime_ = this.endTime_ - 1;

      this.scale_ = DEFAULT_SCALE;
      this.updateScrollbarRange_(true);
    },

    /**
     * Updates the end time at the right of the graph to be the current time.
     * Specifically, updates the scrollbar's range, and if the scrollbar is
     * all the way to the right, keeps it all the way to the right.  Otherwise,
     * leaves the view as-is and doesn't redraw anything.
     */
    updateEndDate: function() {
      this.endTime_ = timeutil.getCurrentTime();
      this.updateScrollbarRange_(this.graphScrolledToRightEdge_());
    },

    getStartDate: function() {
      return new Date(this.startTime_);
    },

    /**
     * Scrolls the graph horizontally by the specified amount.
     */
    horizontalScroll_: function(delta) {
      var newPosition = this.scrollbar_.getPosition() + Math.round(delta);
      // Make sure the new position is in the right range.
      if (newPosition < 0) {
        newPosition = 0;
      } else if (newPosition > this.scrollbar_.getRange()) {
        newPosition = this.scrollbar_.getRange();
      }

      if (this.scrollbar_.getPosition() == newPosition)
        return;
      this.scrollbar_.setPosition(newPosition);
      this.onScroll_();
    },

    /**
     * Zooms the graph by the specified amount.
     */
    zoom_: function(ratio) {
      var oldScale = this.scale_;
      this.scale_ *= ratio;
      if (this.scale_ < TimelineGraphView.MIN_SCALE)
        this.scale_ = TimelineGraphView.MIN_SCALE;

      if (this.scale_ == oldScale)
        return;

      // If we were at the end of the range before, remain at the end of the
      // range.
      if (this.graphScrolledToRightEdge_()) {
        this.updateScrollbarRange_(true);
        return;
      }

      // Otherwise, do our best to maintain the old position.  We use the
      // position at the far right of the graph for consistency.
      var oldMaxTime =
          oldScale * (this.scrollbar_.getPosition() + this.canvas_.width);
      var newMaxTime = Math.round(oldMaxTime / this.scale_);
      var newPosition = newMaxTime - this.canvas_.width;

      // Update range and scroll position.
      this.updateScrollbarRange_(false);
      this.horizontalScroll_(newPosition - this.scrollbar_.getPosition());
    },

    onMouseWheel_: function(event) {
      event.preventDefault();
      this.horizontalScroll_(
          MOUSE_WHEEL_SCROLL_RATE * -event.wheelDeltaX /
          MOUSE_WHEEL_UNITS_PER_CLICK);
      this.zoom_(Math.pow(
          MOUSE_WHEEL_ZOOM_RATE,
          -event.wheelDeltaY / MOUSE_WHEEL_UNITS_PER_CLICK));
    },

    onMouseDown_: function(event) {
      event.preventDefault();
      this.isDragging_ = true;
      this.dragX_ = event.clientX;
    },

    onMouseMove_: function(event) {
      if (!this.isDragging_)
        return;
      event.preventDefault();
      this.horizontalScroll_(
          MOUSE_WHEEL_DRAG_RATE * (event.clientX - this.dragX_));
      this.dragX_ = event.clientX;
    },

    onMouseUp_: function(event) {
      this.isDragging_ = false;
    },

    onScroll_: function() {
      this.repaint();
    },

    /**
     * Replaces the current TimelineDataSeries with |dataSeries|.
     */
    setDataSeries: function(dataSeries) {
      // Simplest just to recreate the Graphs.
      this.graphs_ = [];
      this.graphs_[TimelineDataType.BYTES_PER_SECOND] =
          new Graph(TimelineDataType.BYTES_PER_SECOND, LabelAlign.RIGHT);
      this.graphs_[TimelineDataType.SOURCE_COUNT] =
          new Graph(TimelineDataType.SOURCE_COUNT, LabelAlign.LEFT);
      for (var i = 0; i < dataSeries.length; ++i)
        this.graphs_[dataSeries[i].getDataType()].addDataSeries(dataSeries[i]);

      this.repaint();
    },

    /**
     * Draws the graph on |canvas_|.
     */
    repaint: function() {
      this.repaintTimerRunning_ = false;
      if (!this.isVisible())
        return;

      var width = this.canvas_.width;
      var height = this.canvas_.height;
      var context = this.canvas_.getContext('2d');

      // Clear the canvas.
      context.fillStyle = BACKGROUND_COLOR;
      context.fillRect(0, 0, width, height);

      // Try to get font height in pixels.  Needed for layout.
      var fontHeightString = context.font.match(/([0-9]+)px/)[1];
      var fontHeight = parseInt(fontHeightString);

      // Safety check, to avoid drawing anything too ugly.
      if (fontHeightString.length == 0 || fontHeight <= 0 ||
          fontHeight * 4 > height || width < 50) {
        return;
      }

      // Save current transformation matrix so we can restore it later.
      context.save();

      // The center of an HTML canvas pixel is technically at (0.5, 0.5).  This
      // makes near straight lines look bad, due to anti-aliasing.  This
      // translation reduces the problem a little.
      context.translate(0.5, 0.5);

      // Figure out what time values to display.
      var position = this.scrollbar_.getPosition();
      // If the entire time range is being displayed, align the right edge of
      // the graph to the end of the time range.
      if (this.scrollbar_.getRange() == 0)
        position = this.getLength_() - this.canvas_.width;
      var visibleStartTime = this.startTime_ + position * this.scale_;

      // Make space at the bottom of the graph for the time labels, and then
      // draw the labels.
      var textHeight = height;
      height -= fontHeight + LABEL_VERTICAL_SPACING;
      this.drawTimeLabels(context, width, height, textHeight, visibleStartTime);

      // Draw outline of the main graph area.
      context.strokeStyle = GRID_COLOR;
      context.strokeRect(0, 0, width - 1, height - 1);

      // Layout graphs and have them draw their tick marks.
      for (var i = 0; i < this.graphs_.length; ++i) {
        this.graphs_[i].layout(
            width, height, fontHeight, visibleStartTime, this.scale_);
        this.graphs_[i].drawTicks(context);
      }

      // Draw the lines of all graphs, and then draw their labels.
      for (var i = 0; i < this.graphs_.length; ++i)
        this.graphs_[i].drawLines(context);
      for (var i = 0; i < this.graphs_.length; ++i)
        this.graphs_[i].drawLabels(context);

      // Restore original transformation matrix.
      context.restore();
    },

    /**
     * Draw time labels below the graph.  Takes in start time as an argument
     * since it may not be |startTime_|, when we're displaying the entire
     * time range.
     */
    drawTimeLabels: function(context, width, height, textHeight, startTime) {
      // Text for a time string to use in determining how far apart
      // to place text labels.
      var sampleText = (new Date(startTime)).toLocaleTimeString();

      // The desired spacing for text labels.
      var targetSpacing = context.measureText(sampleText).width +
          LABEL_LABEL_HORIZONTAL_SPACING;

      // The allowed time step values between adjacent labels.  Anything much
      // over a couple minutes isn't terribly realistic, given how much memory
      // we use, and how slow a lot of the net-internals code is.
      var timeStepValues = [
        1000,  // 1 second
        1000 * 5, 1000 * 30,
        1000 * 60,  // 1 minute
        1000 * 60 * 5, 1000 * 60 * 30,
        1000 * 60 * 60,  // 1 hour
        1000 * 60 * 60 * 5
      ];

      // Find smallest time step value that gives us at least |targetSpacing|,
      // if any.
      var timeStep = null;
      for (var i = 0; i < timeStepValues.length; ++i) {
        if (timeStepValues[i] / this.scale_ >= targetSpacing) {
          timeStep = timeStepValues[i];
          break;
        }
      }

      // If no such value, give up.
      if (!timeStep)
        return;

      // Find the time for the first label.  This time is a perfect multiple of
      // timeStep because of how UTC times work.
      var time = Math.ceil(startTime / timeStep) * timeStep;

      context.textBaseline = 'bottom';
      context.textAlign = 'center';
      context.fillStyle = TEXT_COLOR;
      context.strokeStyle = GRID_COLOR;

      // Draw labels and vertical grid lines.
      while (true) {
        var x = Math.round((time - startTime) / this.scale_);
        if (x >= width)
          break;
        var text = (new Date(time)).toLocaleTimeString();
        context.fillText(text, x, textHeight);
        context.beginPath();
        context.lineTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
        time += timeStep;
      }
    }
  };

  /**
   * A Graph is responsible for drawing all the TimelineDataSeries that have
   * the same data type.  Graphs are responsible for scaling the values, laying
   * out labels, and drawing both labels and lines for its data series.
   */
  var Graph = (function() {
    /**
     * |dataType| is the DataType that will be shared by all its DataSeries.
     * |labelAlign| is the LabelAlign value indicating whether the labels
     * should be aligned to the right of left of the graph.
     * @constructor
     */
    function Graph(dataType, labelAlign) {
      this.dataType_ = dataType;
      this.dataSeries_ = [];
      this.labelAlign_ = labelAlign;

      // Cached properties of the graph, set in layout.
      this.width_ = 0;
      this.height_ = 0;
      this.fontHeight_ = 0;
      this.startTime_ = 0;
      this.scale_ = 0;

      // At least the highest value in the displayed range of the graph.
      // Used for scaling and setting labels.  Set in layoutLabels.
      this.max_ = 0;

      // Cached text of equally spaced labels.  Set in layoutLabels.
      this.labels_ = [];
    }

    /**
     * A Label is the label at a particular position along the y-axis.
     * @constructor
     */
    function Label(height, text) {
      this.height = height;
      this.text = text;
    }

    Graph.prototype = {
      addDataSeries: function(dataSeries) {
        this.dataSeries_.push(dataSeries);
      },

      /**
       * Returns a list of all the values that should be displayed for a given
       * data series, using the current graph layout.
       */
      getValues: function(dataSeries) {
        if (!dataSeries.isVisible())
          return null;
        return dataSeries.getValues(this.startTime_, this.scale_, this.width_);
      },

      /**
       * Updates the graph's layout.  In particular, both the max value and
       * label positions are updated.  Must be called before calling any of the
       * drawing functions.
       */
      layout: function(width, height, fontHeight, startTime, scale) {
        this.width_ = width;
        this.height_ = height;
        this.fontHeight_ = fontHeight;
        this.startTime_ = startTime;
        this.scale_ = scale;

        // Find largest value.
        var max = 0;
        for (var i = 0; i < this.dataSeries_.length; ++i) {
          var values = this.getValues(this.dataSeries_[i]);
          if (!values)
            continue;
          for (var j = 0; j < values.length; ++j) {
            if (values[j] > max)
              max = values[j];
          }
        }

        this.layoutLabels_(max);
      },

      /**
       * Lays out labels and sets |max_|, taking the time units into
       * consideration.  |maxValue| is the actual maximum value, and
       * |max_| will be set to the value of the largest label, which
       * will be at least |maxValue|.
       */
      layoutLabels_: function(maxValue) {
        if (this.dataType_ != TimelineDataType.BYTES_PER_SECOND) {
          this.layoutLabelsBasic_(maxValue, 0);
          return;
        }

        // Special handling for data rates.

        // Find appropriate units to use.
        var units = ['B/s', 'kB/s', 'MB/s', 'GB/s', 'TB/s', 'PB/s'];
        // Units to use for labels.  0 is bytes, 1 is kilobytes, etc.
        // We start with kilobytes, and work our way up.
        var unit = 1;
        // Update |maxValue| to be in the right units.
        maxValue = maxValue / 1024;
        while (units[unit + 1] && maxValue >= 999) {
          maxValue /= 1024;
          ++unit;
        }

        // Calculate labels.
        this.layoutLabelsBasic_(maxValue, 1);

        // Append units to labels.
        for (var i = 0; i < this.labels_.length; ++i)
          this.labels_[i] += ' ' + units[unit];

        // Convert |max_| back to bytes, so it can be used when scaling values
        // for display.
        this.max_ *= Math.pow(1024, unit);
      },

      /**
       * Same as layoutLabels_, but ignores units.  |maxDecimalDigits| is the
       * maximum number of decimal digits allowed.  The minimum allowed
       * difference between two adjacent labels is 10^-|maxDecimalDigits|.
       */
      layoutLabelsBasic_: function(maxValue, maxDecimalDigits) {
        this.labels_ = [];
        // No labels if |maxValue| is 0.
        if (maxValue == 0) {
          this.max_ = maxValue;
          return;
        }

        // The maximum number of equally spaced labels allowed.  |fontHeight_|
        // is doubled because the top two labels are both drawn in the same
        // gap.
        var minLabelSpacing = 2 * this.fontHeight_ + LABEL_VERTICAL_SPACING;

        // The + 1 is for the top label.
        var maxLabels = 1 + this.height_ / minLabelSpacing;
        if (maxLabels < 2) {
          maxLabels = 2;
        } else if (maxLabels > MAX_VERTICAL_LABELS) {
          maxLabels = MAX_VERTICAL_LABELS;
        }

        // Initial try for step size between conecutive labels.
        var stepSize = Math.pow(10, -maxDecimalDigits);
        // Number of digits to the right of the decimal of |stepSize|.
        // Used for formating label strings.
        var stepSizeDecimalDigits = maxDecimalDigits;

        // Pick a reasonable step size.
        while (true) {
          // If we use a step size of |stepSize| between labels, we'll need:
          //
          // Math.ceil(maxValue / stepSize) + 1
          //
          // labels.  The + 1 is because we need labels at both at 0 and at
          // the top of the graph.

          // Check if we can use steps of size |stepSize|.
          if (Math.ceil(maxValue / stepSize) + 1 <= maxLabels)
            break;
          // Check |stepSize| * 2.
          if (Math.ceil(maxValue / (stepSize * 2)) + 1 <= maxLabels) {
            stepSize *= 2;
            break;
          }
          // Check |stepSize| * 5.
          if (Math.ceil(maxValue / (stepSize * 5)) + 1 <= maxLabels) {
            stepSize *= 5;
            break;
          }
          stepSize *= 10;
          if (stepSizeDecimalDigits > 0)
            --stepSizeDecimalDigits;
        }

        // Set the max so it's an exact multiple of the chosen step size.
        this.max_ = Math.ceil(maxValue / stepSize) * stepSize;

        // Create labels.
        for (var label = this.max_; label >= 0; label -= stepSize)
          this.labels_.push(label.toFixed(stepSizeDecimalDigits));
      },

      /**
       * Draws tick marks for each of the labels in |labels_|.
       */
      drawTicks: function(context) {
        var x1;
        var x2;
        if (this.labelAlign_ == LabelAlign.RIGHT) {
          x1 = this.width_ - 1;
          x2 = this.width_ - 1 - Y_AXIS_TICK_LENGTH;
        } else {
          x1 = 0;
          x2 = Y_AXIS_TICK_LENGTH;
        }

        context.fillStyle = GRID_COLOR;
        context.beginPath();
        for (var i = 1; i < this.labels_.length - 1; ++i) {
          // The rounding is needed to avoid ugly 2-pixel wide anti-aliased
          // lines.
          var y = Math.round(this.height_ * i / (this.labels_.length - 1));
          context.moveTo(x1, y);
          context.lineTo(x2, y);
        }
        context.stroke();
      },

      /**
       * Draws a graph line for each of the data series.
       */
      drawLines: function(context) {
        // Factor by which to scale all values to convert them to a number from
        // 0 to height - 1.
        var scale = 0;
        var bottom = this.height_ - 1;
        if (this.max_)
          scale = bottom / this.max_;

        // Draw in reverse order, so earlier data series are drawn on top of
        // subsequent ones.
        for (var i = this.dataSeries_.length - 1; i >= 0; --i) {
          var values = this.getValues(this.dataSeries_[i]);
          if (!values)
            continue;
          context.strokeStyle = this.dataSeries_[i].getColor();
          context.beginPath();
          for (var x = 0; x < values.length; ++x) {
            // The rounding is needed to avoid ugly 2-pixel wide anti-aliased
            // horizontal lines.
            context.lineTo(x, bottom - Math.round(values[x] * scale));
          }
          context.stroke();
        }
      },

      /**
       * Draw labels in |labels_|.
       */
      drawLabels: function(context) {
        if (this.labels_.length == 0)
          return;
        var x;
        if (this.labelAlign_ == LabelAlign.RIGHT) {
          x = this.width_ - LABEL_HORIZONTAL_SPACING;
        } else {
          // Find the width of the widest label.
          var maxTextWidth = 0;
          for (var i = 0; i < this.labels_.length; ++i) {
            var textWidth = context.measureText(this.labels_[i]).width;
            if (maxTextWidth < textWidth)
              maxTextWidth = textWidth;
          }
          x = maxTextWidth + LABEL_HORIZONTAL_SPACING;
        }

        // Set up the context.
        context.fillStyle = TEXT_COLOR;
        context.textAlign = 'right';

        // Draw top label, which is the only one that appears below its tick
        // mark.
        context.textBaseline = 'top';
        context.fillText(this.labels_[0], x, 0);

        // Draw all the other labels.
        context.textBaseline = 'bottom';
        var step = (this.height_ - 1) / (this.labels_.length - 1);
        for (var i = 1; i < this.labels_.length; ++i)
          context.fillText(this.labels_[i], x, step * i);
      }
    };

    return Graph;
  })();

  return TimelineGraphView;
})();
// timeline_view.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * TimelineView displays a zoomable and scrollable graph of a number of values
 * over time.  The TimelineView class itself is responsible primarily for
 * updating the TimelineDataSeries its GraphView displays.
 */
var TimelineView = (function() {
  'use strict';

  // We inherit from DivView.
  var superClass = DivView;

  /**
   * @constructor
   */
  function TimelineView() {
    assertFirstConstructorCall(TimelineView);

    // TODO(eroman): Shouldn't be naming a node ID.
    superClass.call(this, 'timeline-view-host');

    this.graphView_ = new TimelineGraphView(
        TimelineView.GRAPH_DIV_ID, TimelineView.GRAPH_CANVAS_ID,
        TimelineView.SCROLLBAR_DIV_ID, TimelineView.SCROLLBAR_INNER_DIV_ID);

    // Call superclass's constructor.

    var selectionView = new DivView(TimelineView.SELECTION_DIV_ID);

    $(TimelineView.SELECTION_TOGGLE_ID).onclick =
        this.toggleSelectionDiv_.bind(this);

    // Interval id returned by window.setInterval for update timer.
    this.updateIntervalId_ = null;

    // List of DataSeries.  These are shared with the TimelineGraphView.  The
    // TimelineView updates their state, the TimelineGraphView reads their
    // state and draws them.
    this.dataSeries_ = [];

    // DataSeries depend on some of the global constants, so they're only
    // created once constants have been received.  We also use this message to
    // recreate DataSeries when log files are being loaded.
    g_browser.addConstantsObserver(this);

    // We observe new log entries to determine the range of the graph, and pass
    // them on to each DataSource.  We initialize the graph range to initially
    // include all events, but after that, we only update it to be the current
    // time on a timer.
    EventsTracker.getInstance().addLogEntryObserver(this);
    this.graphRangeInitialized_ = false;
  }

  TimelineView.TAB_ID = 'tab-handle-timeline';
  TimelineView.TAB_NAME = 'Timeline';
  TimelineView.TAB_HASH = '#timeline';

  // IDs for special HTML elements in timeline_view.html
  TimelineView.GRAPH_DIV_ID = 'timeline-view-graph-div';
  TimelineView.GRAPH_CANVAS_ID = 'timeline-view-graph-canvas';
  TimelineView.SELECTION_DIV_ID = 'timeline-view-selection-div';
  TimelineView.SELECTION_TOGGLE_ID = 'timeline-view-selection-toggle';
  TimelineView.SELECTION_UL_ID = 'timeline-view-selection-ul';
  TimelineView.SCROLLBAR_DIV_ID = 'timeline-view-scrollbar-div';
  TimelineView.SCROLLBAR_INNER_DIV_ID = 'timeline-view-scrollbar-inner-div';

  TimelineView.OPEN_SOCKETS_ID = 'timeline-view-open-sockets';
  TimelineView.IN_USE_SOCKETS_ID = 'timeline-view-in-use-sockets';
  TimelineView.URL_REQUESTS_ID = 'timeline-view-url-requests';
  TimelineView.DNS_JOBS_ID = 'timeline-view-dns-jobs';
  TimelineView.BYTES_RECEIVED_ID = 'timeline-view-bytes-received';
  TimelineView.BYTES_SENT_ID = 'timeline-view-bytes-sent';
  TimelineView.DISK_CACHE_BYTES_READ_ID = 'timeline-view-disk-cache-bytes-read';
  TimelineView.DISK_CACHE_BYTES_WRITTEN_ID =
      'timeline-view-disk-cache-bytes-written';

  // Class used for hiding the colored squares next to the labels for the
  // lines.
  TimelineView.HIDDEN_CLASS = 'timeline-view-hidden';

  cr.addSingletonGetter(TimelineView);

  // Frequency with which we increase update the end date to be the current
  // time, when actively capturing events.
  var UPDATE_INTERVAL_MS = 2000;

  TimelineView.prototype = {
    // Inherit the superclass's methods.
    __proto__: superClass.prototype,

    show: function(isVisible) {
      superClass.prototype.show.call(this, isVisible);

      this.graphView_.show(isVisible);

      // Live capture is no longer supported, so don't need to constantly
      // update the graph's range.
      this.setUpdateEndDateInterval_(0);
    },

    /**
     * Starts calling the GraphView's updateEndDate function every |intervalMs|
     * milliseconds.  If |intervalMs| is 0, stops calling the function.
     */
    setUpdateEndDateInterval_: function(intervalMs) {
      if (this.updateIntervalId_ !== null) {
        window.clearInterval(this.updateIntervalId_);
        this.updateIntervalId_ = null;
      }
      if (intervalMs > 0) {
        this.updateIntervalId_ =
            window.setInterval(this.updateEndDate_.bind(this), intervalMs);
      }
    },

    /**
     * Updates the end date of graph to be the current time, unless the
     * BrowserBridge is disabled.
     */
    updateEndDate_: function() {
      // If we loaded a log file or capturing data was stopped, stop the timer.
      if (g_browser.isDisabled()) {
        this.setUpdateEndDateInterval_(0);
        return;
      }
      this.graphView_.updateEndDate();
    },

    onLoadLogFinish: function(data) {
      this.setUpdateEndDateInterval_(0);
      return true;
    },

    /**
     * Updates the visibility state of |dataSeries| to correspond to the
     * current checked state of |checkBox|.  Also updates the class of
     * |listItem| based on the new visibility state.
     */
    updateDataSeriesVisibility_: function(dataSeries, listItem, checkBox) {
      dataSeries.show(checkBox.checked);
      if (checkBox.checked)
        listItem.classList.remove(TimelineView.HIDDEN_CLASS);
      else
        listItem.classList.add(TimelineView.HIDDEN_CLASS);
    },

    dataSeriesClicked_: function(dataSeries, listItem, checkBox) {
      this.updateDataSeriesVisibility_(dataSeries, listItem, checkBox);
      this.graphView_.repaint();
    },

    /**
     * Adds the specified DataSeries to |dataSeries_|, and hooks up
     * |listItemId|'s checkbox and color to correspond to the current state
     * of the given DataSeries.
     */
    addDataSeries_: function(dataSeries, listItemId) {
      this.dataSeries_.push(dataSeries);
      var listItem = $(listItemId);
      var checkBox = $(listItemId).querySelector('input');

      // Make sure |listItem| is visible, and then use its color for the
      // DataSource.
      listItem.classList.remove(TimelineView.HIDDEN_CLASS);
      dataSeries.setColor(getComputedStyle(listItem).color);

      this.updateDataSeriesVisibility_(dataSeries, listItem, checkBox);
      checkBox.onclick =
          this.dataSeriesClicked_.bind(this, dataSeries, listItem, checkBox);
    },

    /**
     * Recreate all DataSeries.  Global constants must have been set before
     * this is called.
     */
    createDataSeries_: function() {
      this.graphRangeInitialized_ = false;
      this.dataSeries_ = [];

      this.addDataSeries_(
          new SourceCountDataSeries(
              EventSourceType.SOCKET, EventType.SOCKET_ALIVE),
          TimelineView.OPEN_SOCKETS_ID);

      this.addDataSeries_(
          new SocketsInUseDataSeries(), TimelineView.IN_USE_SOCKETS_ID);

      this.addDataSeries_(
          new SourceCountDataSeries(
              EventSourceType.URL_REQUEST, EventType.REQUEST_ALIVE),
          TimelineView.URL_REQUESTS_ID);

      this.addDataSeries_(
          new SourceCountDataSeries(
              EventSourceType.HOST_RESOLVER_IMPL_JOB,
              EventType.HOST_RESOLVER_IMPL_JOB),
          TimelineView.DNS_JOBS_ID);

      this.addDataSeries_(
          new NetworkTransferRateDataSeries(
              EventType.SOCKET_BYTES_RECEIVED, EventType.UDP_BYTES_RECEIVED),
          TimelineView.BYTES_RECEIVED_ID);

      this.addDataSeries_(
          new NetworkTransferRateDataSeries(
              EventType.SOCKET_BYTES_SENT, EventType.UDP_BYTES_SENT),
          TimelineView.BYTES_SENT_ID);

      this.addDataSeries_(
          new DiskCacheTransferRateDataSeries(EventType.ENTRY_READ_DATA),
          TimelineView.DISK_CACHE_BYTES_READ_ID);

      this.addDataSeries_(
          new DiskCacheTransferRateDataSeries(EventType.ENTRY_WRITE_DATA),
          TimelineView.DISK_CACHE_BYTES_WRITTEN_ID);

      this.graphView_.setDataSeries(this.dataSeries_);
    },

    /**
     * When we receive the constants, create or recreate the DataSeries.
     */
    onReceivedConstants: function(constants) {
      this.createDataSeries_();
    },

    /**
     * When all log entries are deleted, recreate the DataSeries.
     */
    onAllLogEntriesDeleted: function() {
      this.graphRangeInitialized_ = false;
      this.createDataSeries_();
    },

    onReceivedLogEntries: function(entries) {
      // Pass each entry to every DataSeries, one at a time.  Not having each
      // data series get data directly from the EventsTracker saves us from
      // having very un-Javascript-like destructors for when we load new,
      // constants and slightly simplifies DataSeries objects.
      for (var entry = 0; entry < entries.length; ++entry) {
        for (var i = 0; i < this.dataSeries_.length; ++i)
          this.dataSeries_[i].onReceivedLogEntry(entries[entry]);
      }

      // If this is the first non-empty set of entries we've received, or we're
      // viewing a loaded log file, we will need to update the date range.
      if (this.graphRangeInitialized_ && !MainView.isViewingLoadedLog())
        return;
      if (entries.length == 0)
        return;

      // Update the date range.
      var startDate;
      if (!this.graphRangeInitialized_) {
        startDate = timeutil.convertTimeTicksToDate(entries[0].time);
      } else {
        startDate = this.graphView_.getStartDate();
      }
      var endDate =
          timeutil.convertTimeTicksToDate(entries[entries.length - 1].time);
      this.graphView_.setDateRange(startDate, endDate);
      this.graphRangeInitialized_ = true;
    },

    toggleSelectionDiv_: function() {
      var toggle = $(TimelineView.SELECTION_TOGGLE_ID);
      var shouldCollapse = toggle.className == 'timeline-view-rotateleft';

      setNodeDisplay($(TimelineView.SELECTION_UL_ID), !shouldCollapse);
      toggle.className = shouldCollapse ? 'timeline-view-rotateright' :
                                          'timeline-view-rotateleft';

      // Notify the graph view that it may need to update the canvas size. This
      // isn's strictly necessary since that view will also poll to see when a
      // nresize has happened, but this makes the update happen right away.
      //
      // TODO(eroman): Shouldn't be calling a private method on graphView_.
      this.graphView_.checkForResize_();
    }
  };

  return TimelineView;
})();
// log_view_painter.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

// TODO(eroman): put these methods into a namespace.

let createLogEntryTablePrinter;
let proxySettingsToString;

// Start of anonymous namespace.
(function() {
  'use strict';

  function canCollapseBeginWithEnd(beginEntry) {
    return beginEntry && beginEntry.isBegin() && beginEntry.end &&
        beginEntry.end.index === beginEntry.index + 1 &&
        (!beginEntry.orig.params || !beginEntry.end.orig.params);
  }

  /**
   * Creates a TablePrinter for use by the above two functions.  baseTime is
   * the time relative to which other times are displayed.
   */
  createLogEntryTablePrinter = function(logEntries, baseTime, logCreationTime,
                                        forSearch=false) {
    const entries = LogGroupEntry.createArrayFrom(logEntries);
    const tablePrinter = new TablePrinter();
    const parameterOutputter = new ParameterOutputter(tablePrinter, forSearch);

    if (entries.length === 0) {
      return tablePrinter;
    }

    const startTime = timeutil.convertTimeTicksToTime(
        (logEntries[0].source.start_time !== undefined) ?
          logEntries[0].source.start_time :
          entries[0].orig.time);

    for (let i = 0; i < entries.length; ++i) {
      const entry = entries[i];

      // Avoid printing the END for a BEGIN that was immediately before, unless
      // both have extra parameters.
      if (!entry.isEnd() || !canCollapseBeginWithEnd(entry.begin)) {
        const entryTime = timeutil.convertTimeTicksToTime(entry.orig.time);
        addRowWithTime(tablePrinter, entryTime - baseTime,
            startTime - baseTime);

        for (let j = entry.getDepth(); j > 0; --j) {
          tablePrinter.addCell('  ');
        }

        let eventText = getTextForEvent(entry);
        // Get the elapsed time, and append it to the event text.
        if (entry.isBegin()) {
          let dt = '?';
          // Definite time.
          if (entry.end) {
            dt = entry.end.orig.time - entry.orig.time;
          } else if (logCreationTime !== undefined) {
            dt = (logCreationTime - entryTime) + '+';
          }
          eventText += '  [dt=' + dt + ']';
        }

        const mainCell = tablePrinter.addCell(eventText);
        mainCell.allowOverflow = true;
      }

      // Output the extra parameters.
      if (typeof entry.orig.params === 'object') {
        // Those 5 skipped cells are: two for "t=", and three for "st=".
        tablePrinter.setNewRowCellIndent(5 + entry.getDepth());
        writeParameters(entry.orig, parameterOutputter);

        tablePrinter.setNewRowCellIndent(0);
      }
    }

    // If viewing a saved log file, add row with just the time the log was
    // created, if the event never completed.
    const lastEntry = entries[entries.length - 1];
    // If the last entry has a non-zero depth or is a begin event, the source is
    // still active.
    const isSourceActive = lastEntry.getDepth() !== 0 || lastEntry.isBegin();
    if (logCreationTime !== undefined && isSourceActive) {
      addRowWithTime(
          tablePrinter, logCreationTime - baseTime, startTime - baseTime);
    }

    return tablePrinter;
  };

  /**
   * Adds a new row to the given TablePrinter, and adds five cells containing
   * information about the time an event occured.
   * Format is '[t=<time of the event in ms>] [st=<ms since the source
   * started>]'.
   * @param {TablePrinter} tablePrinter The table printer to add the cells to.
   * @param {number} eventTime The time the event occured, in milliseconds,
   *     relative to some base time.
   * @param {number} startTime The time the first event for the source occured,
   *     relative to the same base time as eventTime.
   */
  function addRowWithTime(tablePrinter, eventTime, startTime) {
    tablePrinter.addRow();
    tablePrinter.addCell('t=');
    const tCell = tablePrinter.addCell(eventTime);
    tCell.alignRight = true;
    tablePrinter.addCell(' [st=');
    const stCell = tablePrinter.addCell(eventTime - startTime);
    stCell.alignRight = true;
    tablePrinter.addCell('] ');
  }

  /** Append an ASCII representation of the bytes for search filtering
   *  purposes. ASCII codes 32 though 126 display the corresponding
   *  characters, nulls are represented by spaces, and any other
   *  character is represented by a period.
  */
  function writeBytesAsSearchableString(bytes, out) {
    let result = ' ';
    bytes.forEach(curByte => {
      if (curByte >= 0x20 && curByte <= 0x7E) {
        result += String.fromCharCode(curByte);
      } else if (curByte === 0x00) {
        result += ' ';
      } else {
        result += '.';
      }
    });
    out.writeLine(result);
  }

  /**
   * |bytes| must be an array-like object of bytes.  Writes multiple lines to
   * |out| with the hexadecimal characters from |bytes| on the left, in
   * groups of two, and their corresponding ASCII characters on the
   * right.
   *
   * 16 bytes will be placed on each line of the output string, split into two
   * columns of 8.
   */
  function writeHexString(bytes, out) {
    function byteToPaddedHex(b) {
      let str = b.toString(16).toUpperCase();
      if (str.length < 2) {
        str = '0' + str;
      }
      return str;
    }

    const kBytesPerLine = 16;
    // Returns pretty printed kBytesPerLine bytes starting from
    // bytes[startIndex], in hexdump style format.
    function formatLine(startIndex) {
      let result = ' ';

      // Append a hex formatting of |bytes|.
      for (let i = 0; i < kBytesPerLine; ++i) {
        result += ' ';

        // Add a separator every 8 bytes.
        if ((i % 8) === 0) {
          result += ' ';
        }

        // Output hex for the byte, or space if no bytes remain.
        const byteIndex = startIndex + i;
        if (byteIndex < bytes.length) {
          result += byteToPaddedHex(bytes[byteIndex]);
        } else {
          result += '  ';
        }
      }

      result += '   ';

      // Append an ASCII formatting of the bytes, where ASCII codes 32
      // though 126 display the corresponding characters, nulls are
      // represented by spaces, and any other character is represented
      // by a period.
      for (let i = 0; i < kBytesPerLine; ++i) {
        const byteIndex = startIndex + i;
        if (byteIndex >= bytes.length) {
          break;
        }

        const curByte = bytes[byteIndex];

        if (curByte >= 0x20 && curByte <= 0x7E) {
          result += String.fromCharCode(curByte);
        } else if (curByte === 0x00) {
          result += ' ';
        } else {
          result += '.';
        }
      }

      return result;
    }

    // Output lines for each group of kBytesPerLine bytes.
    for (let i = 0; i < bytes.length; i += kBytesPerLine) {
      out.writeLine(formatLine(i));
    }
  }

  const kArrow = ' --\x3e ';
  const kArrowIndentation = '     ';

  /**
   * Wrapper around a TablePrinter to simplify outputting lines of text for
   * event
   * parameters.
   */
  class ParameterOutputter {
    /**
     * @constructor
     */
    constructor(tablePrinter, forSearch=false) {
      this.tablePrinter_ = tablePrinter;
      this.forSearch_ = forSearch;
    }

    /**
     * Returns |true| if this ParameterOutputter is being used
     * to write output that will be used for search filtering
     * rather than display to the end-user.
    */
    isForSearch() {
      return this.forSearch_;
    }

    /**
     * Outputs a single line.
     */
    writeLine(line) {
      this.tablePrinter_.addRow();
      const cell = this.tablePrinter_.addCell(line);
      cell.allowOverflow = true;
      return cell;
    }

    /**
     * Outputs a key=value line which looks like:
     *
     *   --\x3e key = value
     */
    writeArrowKeyValue(key, value, link) {
      const cell = this.writeLine(kArrow + key + ' = ' + value);
      cell.link = link;
    }

    /**
     * Outputs key and prettified value lines which looks like:
     *
     *   --\x3e key = {
     *         "field1": [
     *         "field1_value1",
     *           "field1_value2"
     *         ],
     *         "field2": "field2_value"
     *       }
     */
    writeArrowKeyJSONValue(key, value) {
      const lines = JSON.stringify(value, null, 2).split('\n');
      this.writeArrowKeyValue(key, lines[0]);
      this.writeSpaceIndentedLines(5, lines.slice(1));
    }

    /**
     * Outputs a key= line which looks like:
     *
     *   --\x3e key =
     */
    writeArrowKey(key) {
      this.writeLine(kArrow + key + ' =');
    }

    /**
     * Outputs multiple lines, each indented by numSpaces.
     * For instance if numSpaces=8 it might look like this:
     *
     *         line 1
     *         line 2
     *         line 3
     */
    writeSpaceIndentedLines(numSpaces, lines) {
      const prefix = makeRepeatedString(' ', numSpaces);
      for (let i = 0; i < lines.length; ++i) {
        this.writeLine(prefix + lines[i]);
      }
    }

    /**
     * Outputs multiple lines such that the first line has
     * an arrow pointing at it, and subsequent lines
     * align with the first one. For example:
     *
     *   --\x3e line 1
     *       line 2
     *       line 3
     */
    writeArrowIndentedLines(lines) {
      if (lines.length === 0) {
        return;
      }

      this.writeLine(kArrow + lines[0]);

      for (let i = 1; i < lines.length; ++i) {
        this.writeLine(kArrowIndentation + lines[i]);
      }
    }
  }

  /**
   * Formats the parameters for |entry| and writes them to |out|.
   * Certain event types have custom pretty printers. Everything else will
   * default to a JSON-like format.
   */
  function writeParameters(entry, out) {
    // If headers are in an object, convert them to an array for better
    // display.
    entry = reformatHeaders(entry);

    // Use any parameter writer available for this event type.
    const paramsWriter = getParameterWriterForEventType(entry.type);
    const consumedParams = {};
    if (paramsWriter) {
      paramsWriter(entry, out, consumedParams);
    }

    // Write any un-consumed parameters.
    for (const k in entry.params) {
      if (consumedParams[k]) {
        continue;
      }
      defaultWriteParameter(k, entry.params[k], out);
    }
  }

  /**
   * Finds a writer to format the parameters for events of type |eventType|.
   *
   * @return {function} The returned function "writer" can be invoked
   *                    as |writer(entry, writer, consumedParams)|. It will
   *                    output the parameters of |entry| to |out|, and fill
   *                    |consumedParams| with the keys of the parameters
   *                    consumed. If no writer is available for |eventType| then
   *                    returns null.
   */
  function getParameterWriterForEventType(eventType) {
    switch (eventType) {
      case EventType.HTTP_TRANSACTION_SEND_REQUEST_HEADERS:
      case EventType.HTTP_TRANSACTION_SEND_TUNNEL_HEADERS:
      case EventType.TYPE_HTTP_CACHE_CALLER_REQUEST_HEADERS:
        return writeParamsForRequestHeaders;

      case EventType.PROXY_CONFIG_CHANGED:
        return writeParamsForProxyConfigChanged;

      case EventType.CERT_VERIFIER_JOB:
      case EventType.SSL_CERTIFICATES_RECEIVED:
        return writeParamsForCertificates;
      case EventType.CERT_VERIFY_PROC:
        return writeParamsForCertVerifyProc;
      case EventType.CERT_VERIFY_PROC_PATH_BUILD_ATTEMPT:
        return writeParamsForCertVerifyProcPathBuildAttempt;
      case EventType.CERT_VERIFY_PROC_PATH_BUILT:
        return writeParamsForCertVerifyProcPathBuilt;
      case EventType.CERT_CT_COMPLIANCE_CHECKED:
      case EventType.EV_CERT_CT_COMPLIANCE_CHECKED:
        return writeParamsForCheckedCertificates;
    }
    return null;
  }

  /**
   * Parses |hexStr| to an array of bytes, or returns null if the input is not a
   * valid hex string.
   */
  function tryParseHexToBytes(hexStr) {
    if ((hexStr.length % 2) !== 0) {
      return null;
    }

    const result = [];
    for (let i = 0; i < hexStr.length; i += 2) {
      const value = parseInt(hexStr.substr(i, 2), 16);
      if (isNaN(value)) {
        return null;
      }
      result.push(value);
    }

    return result;
  }

  /**
   * Parses a base64 encoded string to a Uint8Array of bytes.
   */
  function tryParseBase64ToBytes(b64Str) {
    let decodedStr;

    try {
      decodedStr = atob(b64Str);
    } catch (e) {
      return null;
    }

    return Uint8Array.from(decodedStr, c => c.charCodeAt(0));
  }

  /**
   * Default parameter writer that outputs a visualization of field named |key|
   * with value |value| to |out|.
   */
  function defaultWriteParameter(key, value, out) {
    if (key === 'headers' && value instanceof Array) {
      out.writeArrowIndentedLines(value);
      return;
    }

    if (key === 'bytes' && typeof value === 'string') {
      const bytes = tryParseBase64ToBytes(value);
      if (bytes) {
        if (out.isForSearch()) {
          writeBytesAsSearchableString(bytes, out);
        } else {
          out.writeArrowKey(key);
          writeHexString(bytes, out);
        }
        return;
      }
    }

    // Handle source_dependency entries - add link and map source type to
    // string.
    if (key === 'source_dependency' && typeof value === 'object') {
      const link = '#events&s=' + value.id;
      const valueStr = value.id + ' (' + EventSourceTypeNames[value.type] + ')';
      out.writeArrowKeyValue(key, valueStr, link);
      return;
    }

    if (key === 'net_error' && typeof value === 'number') {
      const valueStr = value + ' (' + netErrorToString(value) + ')';
      out.writeArrowKeyValue(key, valueStr);
      return;
    }

    if (key === 'quic_error' && typeof value === 'number') {
      const valueStr = value + ' (' + quicErrorToString(value) + ')';
      out.writeArrowKeyValue(key, valueStr);
      return;
    }

    if (key === 'quic_crypto_handshake_message' && typeof value === 'string') {
      const lines = value.split('\n');
      out.writeArrowIndentedLines(lines);
      return;
    }

    if (key === 'quic_rst_stream_error' && typeof value === 'number') {
      const valueStr = value + ' (' + quicRstStreamErrorToString(value) + ')';
      out.writeArrowKeyValue(key, valueStr);
      return;
    }

    if (key === 'load_flags' && typeof value === 'number') {
      const valueStr = value + ' (' + getLoadFlagSymbolicString(value) + ')';
      out.writeArrowKeyValue(key, valueStr);
      return;
    }

    if (key === 'load_state' && typeof value === 'number') {
      const valueStr = value + ' (' + getKeyWithValue(LoadState, value) + ')';
      out.writeArrowKeyValue(key, valueStr);
      return;
    }

    // Otherwise just default to JSON formatting of the value.
    out.writeArrowKeyJSONValue(key, value);
  }

  /**
   * Returns the set of LoadFlags that make up the integer |loadFlag|.
   * For example: getLoadFlagSymbolicString(
   */
  function getLoadFlagSymbolicString(loadFlag) {
    return getSymbolicString(
        loadFlag, LoadFlag, getKeyWithValue(LoadFlag, loadFlag));
  }

  /**
   * Returns the set of CertStatusFlags that make up the integer
   * |certStatusFlag|
   */
  function getCertStatusFlagSymbolicString(certStatusFlag) {
    return getSymbolicString(certStatusFlag, CertStatusFlag, '');
  }

  /**
   * Returns the set of CertVerifierFlags that make up the integer
   * |certVerifierFlags|
   */
  function getCertVerifierFlagsSymbolicString(certVerifierFlags) {
    return getSymbolicString(certVerifierFlags, CertVerifierFlags, '');
  }

  /**
   * Returns the set of CertVerifyFlags that make up the integer
   * |certVerifyFlags|
   */
  function getCertVerifyFlagsSymbolicString(certVerifyFlags) {
    return getSymbolicString(certVerifyFlags, CertVerifyFlags, '');
  }

  /**
   * Returns the symbolic name of the |digestPolicy| enum value.
   */
  function getCertPathBuilderDigestPolicySymbolicString(digestPolicy) {
    return getKeyWithValue(CertPathBuilderDigestPolicy, digestPolicy);
  }

  /**
   * Returns a string representing the flags composing the given bitmask.
   */
  function getSymbolicString(bitmask, valueToName, zeroName) {
    const matchingFlagNames = [];

    for (const k in valueToName) {
      if (bitmask & valueToName[k]) {
        matchingFlagNames.push(k);
      }
    }

    // If no flags were matched, returns a special value.
    if (matchingFlagNames.length === 0) {
      return zeroName;
    }

    return matchingFlagNames.join(' | ');
  }

  /**
   * TODO(eroman): get rid of this, as it is only used by 1 callsite.
   *
   * Indent |lines| by |start|.
   *
   * For example, if |start| = ' -> ' and |lines| = ['line1', 'line2', 'line3']
   * the output will be:
   *
   *   " -> line1\n" +
   *   "    line2\n" +
   *   "    line3"
   */
  function indentLines(start, lines) {
    return start + lines.join('\n' + makeRepeatedString(' ', start.length));
  }

  /**
   * If entry.param.headers exists and is an object other than an array,
   * converts
   * it into an array and returns a new entry.  Otherwise, just returns the
   * original entry.
   */
  function reformatHeaders(entry) {
    // If there are no headers, or it is not an object other than an array,
    // return |entry| without modification.
    if (!entry.params || entry.params.headers === undefined ||
        typeof entry.params.headers !== 'object' ||
        entry.params.headers instanceof Array) {
      return entry;
    }

    // Duplicate the top level object, and |entry.params|, so the original
    // object
    // will not be modified.
    entry = shallowCloneObject(entry);
    entry.params = shallowCloneObject(entry.params);

    // Convert headers to an array.
    const headers = [];
    for (const key in entry.params.headers) {
      headers.push(key + ': ' + entry.params.headers[key]);
    }
    entry.params.headers = headers;

    return entry;
  }

  /**
   * Outputs the request header parameters of |entry| to |out|.
   */
  function writeParamsForRequestHeaders(entry, out, consumedParams) {
    const params = entry.params;

    if (!(typeof params.line === 'string') ||
        !(params.headers instanceof Array)) {
      // Unrecognized params.
      return;
    }

    // Strip the trailing CRLF that params.line contains.
    const lineWithoutCRLF = params.line.replace(/\r\n$/g, '');
    out.writeArrowIndentedLines([lineWithoutCRLF].concat(params.headers));

    consumedParams.line = true;
    consumedParams.headers = true;
  }

  function writeIndentedMultiLineParam(lines, out, consumedParams, paramName) {
    out.writeArrowKey(paramName);
    out.writeSpaceIndentedLines(8, lines);
    consumedParams[paramName] = true;
  }

  function writeCertificateParam(
      certsContainer, out, consumedParams, paramName) {
    if (certsContainer.certificates instanceof Array) {
      const certs =
          certsContainer.certificates.reduce(function(previous, current) {
            return previous.concat(current.split('\n'));
          }, []);
      writeIndentedMultiLineParam(certs, out, consumedParams, paramName);
    }
  }

  /**
   * Outputs the certificate parameters of |entry| to |out|.
   */
  function writeParamsForCertificates(entry, out, consumedParams) {
    writeCertificateParam(entry.params, out, consumedParams, 'certificates');

    if (typeof(entry.params.verified_cert) === 'object') {
      writeCertificateParam(
          entry.params.verified_cert, out, consumedParams, 'verified_cert');
    }

    if (typeof(entry.params.ocsp_response) === 'string') {
      writeIndentedMultiLineParam(
          entry.params.ocsp_response.split('\n'), out, consumedParams,
          'ocsp_response');
    }

    if (typeof(entry.params.sct_list) === 'string') {
      writeIndentedMultiLineParam(
          entry.params.sct_list.split('\n'), out, consumedParams, 'sct_list');
    }

    if (typeof(entry.params.cert_status) === 'number') {
      const valueStr = entry.params.cert_status + ' (' +
          getCertStatusFlagSymbolicString(entry.params.cert_status) + ')';
      out.writeArrowKeyValue('cert_status', valueStr);
      consumedParams.cert_status = true;
    }

    if (typeof(entry.params.verifier_flags) === 'number') {
      const valueStr = entry.params.verifier_flags + ' (' +
          getCertVerifierFlagsSymbolicString(entry.params.verifier_flags) + ')';
      out.writeArrowKeyValue('verifier_flags', valueStr);
      consumedParams.verifier_flags = true;
    }
  }

  function writeParamsForCertVerifyProc(entry, out, consumedParams) {
    if (typeof(entry.params.cert_status) === 'number') {
      const valueStr = entry.params.cert_status + ' (' +
          getCertStatusFlagSymbolicString(entry.params.cert_status) + ')';
      out.writeArrowKeyValue('cert_status', valueStr);
      consumedParams.cert_status = true;
    }

    if (typeof(entry.params.verify_flags) === 'number') {
      const valueStr = entry.params.verify_flags + ' (' +
          getCertVerifyFlagsSymbolicString(entry.params.verify_flags) + ')';
      out.writeArrowKeyValue('verify_flags', valueStr);
      consumedParams.verify_flags = true;
    }
  }

  function writeParamsForCertVerifyProcPathBuildAttempt(entry, out,
                                                        consumedParams) {
    if (typeof(entry.params.digest_policy) === 'number') {
      const valueStr = entry.params.digest_policy + ' (' +
          getCertPathBuilderDigestPolicySymbolicString(
            entry.params.digest_policy) + ')';
      out.writeArrowKeyValue('digest_policy', valueStr);
      consumedParams.digest_policy = true;
    }
  }

  function writeParamsForCertVerifyProcPathBuilt(entry, out, consumedParams) {
    if (typeof(entry.params.errors) === 'string') {
      writeIndentedMultiLineParam(
          entry.params.errors.split('\n'), out, consumedParams,
          'errors');
    }
  }

  function writeParamsForCheckedCertificates(entry, out, consumedParams) {
    if (typeof(entry.params.certificate) === 'object') {
      writeCertificateParam(
          entry.params.certificate, out, consumedParams, 'certificate');
    }
  }

  function writeParamsForProxyConfigChanged(entry, out, consumedParams) {
    const params = entry.params;

    if (typeof params.new_config !== 'object') {
      // Unrecognized params.
      return;
    }

    if (typeof params.old_config === 'object') {
      const oldConfigString = proxySettingsToString(params.old_config);
      // The previous configuration may not be present in the case of
      // the initial proxy settings fetch.
      out.writeArrowKey('old_config');

      out.writeSpaceIndentedLines(8, oldConfigString.split('\n'));

      consumedParams.old_config = true;
    }

    const newConfigString = proxySettingsToString(params.new_config);
    out.writeArrowKey('new_config');
    out.writeSpaceIndentedLines(8, newConfigString.split('\n'));

    consumedParams.new_config = true;
  }

  function getTextForEvent(entry) {
    let text = '';

    if (entry.isBegin() && canCollapseBeginWithEnd(entry)) {
      // Don't prefix with '+' if we are going to collapse the END event.
      text = ' ';
    } else if (entry.isBegin()) {
      text = '+' + text;
    } else if (entry.isEnd()) {
      text = '-' + text;
    } else {
      text = ' ';
    }

    text += EventTypeNames[entry.orig.type];
    return text;
  }

  proxySettingsToString = function(config) {
    if (!config) {
      return '';
    }

    // TODO(eroman): if |config| has unexpected properties, print it as JSON
    //               rather than hide them.

    function getProxyListString(proxies) {
      // Older versions of Chrome would set these values as strings, whereas
      // newer
      // logs use arrays.
      // TODO(eroman): This behavior changed in M27. Support for older logs can
      //               safely be removed circa M29.
      if (Array.isArray(proxies)) {
        const listString = proxies.join(', ');
        if (proxies.length > 1) {
          return '[' + listString + ']';
        }
        return listString;
      }
      return proxies;
    }

    // The proxy settings specify up to three major fallback choices
    // (auto-detect, custom pac url, or manual settings).
    // We enumerate these to a list so we can later number them.
    const modes = [];

    // Output any automatic settings.
    if (config.auto_detect) {
      modes.push(['Auto-detect']);
    }
    if (config.pac_url) {
      modes.push(['PAC script: ' + config.pac_url]);
    }

    // Output any manual settings.
    if (config.single_proxy || config.proxy_per_scheme) {
      const lines = [];

      if (config.single_proxy) {
        lines.push('Proxy server: ' + getProxyListString(config.single_proxy));
      } else if (config.proxy_per_scheme) {
        for (const urlScheme in config.proxy_per_scheme) {
          if (urlScheme !== 'fallback') {
            lines.push(
                'Proxy server for ' + urlScheme.toUpperCase() + ': ' +
                getProxyListString(config.proxy_per_scheme[urlScheme]));
          }
        }
        if (config.proxy_per_scheme.fallback) {
          lines.push(
              'Proxy server for everything else: ' +
              getProxyListString(config.proxy_per_scheme.fallback));
        }
      }

      // Output any proxy bypass rules.
      if (config.bypass_list) {
        if (config.reverse_bypass) {
          lines.push('Reversed bypass list: ');
        } else {
          lines.push('Bypass list: ');
        }

        for (let i = 0; i < config.bypass_list.length; ++i) {
          lines.push('  ' + config.bypass_list[i]);
        }
      }

      modes.push(lines);
    }

    const result = [];
    if (modes.length < 1) {
      // If we didn't find any proxy settings modes, we are using DIRECT.
      result.push('Use DIRECT connections.');
    } else if (modes.length === 1) {
      // If there was just one mode, don't bother numbering it.
      result.push(modes[0].join('\n'));
    } else {
      // Otherwise concatenate all of the modes into a numbered list
      // (which correspond with the fallback order).
      for (let i = 0; i < modes.length; ++i) {
        result.push(indentLines('(' + (i + 1) + ') ', modes[i]));
      }
    }

    if (config.source !== undefined && config.source !== 'UNKNOWN') {
      result.push('Source: ' + config.source);
    }

    return result.join('\n');
  };

  // End of anonymous namespace.
})();
// log_grouper.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * LogGroupEntry is a wrapper around log entries, which makes it easier to
 * find the corresponding start/end of events.
 *
 * This is used internally by the log and timeline views to pretty print
 * collections of log entries.
 */

// TODO(eroman): document these methods!

var LogGroupEntry = (function() {
  'use strict';

  function LogGroupEntry(origEntry, index) {
    this.orig = origEntry;
    this.index = index;
  }

  LogGroupEntry.prototype = {
    isBegin: function() {
      return this.orig.phase == EventPhase.PHASE_BEGIN;
    },

    isEnd: function() {
      return this.orig.phase == EventPhase.PHASE_END;
    },

    getDepth: function() {
      var depth = 0;
      var p = this.parentEntry;
      while (p) {
        depth += 1;
        p = p.parentEntry;
      }
      return depth;
    }
  };

  function findParentIndex(parentStack, eventType) {
    for (var i = parentStack.length - 1; i >= 0; --i) {
      if (parentStack[i].orig.type == eventType)
        return i;
    }
    return -1;
  }

  /**
   * Returns a list of LogGroupEntrys. This basically wraps the original log
   * entry, but makes it easier to find the start/end of the event.
   */
  LogGroupEntry.createArrayFrom = function(origEntries) {
    var groupedEntries = [];

    // Stack of enclosing PHASE_BEGIN elements.
    var parentStack = [];

    for (var i = 0; i < origEntries.length; ++i) {
      var origEntry = origEntries[i];

      var groupEntry = new LogGroupEntry(origEntry, i);
      groupedEntries.push(groupEntry);

      // If this is the end of an event, match it to the start.
      if (groupEntry.isEnd()) {
        // Walk up the parent stack to find the corresponding BEGIN for this
        // END.
        var parentIndex = findParentIndex(parentStack, groupEntry.orig.type);

        if (parentIndex == -1) {
          // Unmatched end.
        } else {
          groupEntry.begin = parentStack[parentIndex];

          // Consider this as the terminator for all open BEGINs up until
          // parentIndex.
          while (parentIndex < parentStack.length) {
            var p = parentStack.pop();
            p.end = groupEntry;
          }
        }
      }

      // Inherit the current parent.
      if (parentStack.length > 0)
        groupEntry.parentEntry = parentStack[parentStack.length - 1];

      if (groupEntry.isBegin())
        parentStack.push(groupEntry);
    }

    return groupedEntries;
  };

  return LogGroupEntry;
})();
// proxy_view.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * This view displays information on the proxy setup:
 *
 *   - Shows the current proxy settings.
 *   - Has a button to reload these settings.
 *   - Shows the list of proxy hostnames that are cached as "bad".
 *   - Has a button to clear the cached bad proxies.
 */
var ProxyView = (function() {
  'use strict';

  // We inherit from DivView.
  var superClass = DivView;

  /**
   * @constructor
   */
  function ProxyView() {
    assertFirstConstructorCall(ProxyView);

    // Call superclass's constructor.
    superClass.call(this, ProxyView.MAIN_BOX_ID);

    // Register to receive proxy information as it changes.
    g_browser.addProxySettingsObserver(this, true);
    g_browser.addBadProxiesObserver(this, true);
  }

  ProxyView.TAB_ID = 'tab-handle-proxy';
  ProxyView.TAB_NAME = 'Proxy';
  ProxyView.TAB_HASH = '#proxy';

  // IDs for special HTML elements in proxy_view.html
  ProxyView.MAIN_BOX_ID = 'proxy-view-tab-content';
  ProxyView.ORIGINAL_SETTINGS_DIV_ID = 'proxy-view-original-settings';
  ProxyView.EFFECTIVE_SETTINGS_DIV_ID = 'proxy-view-effective-settings';
  ProxyView.ORIGINAL_CONTENT_DIV_ID = 'proxy-view-original-content';
  ProxyView.EFFECTIVE_CONTENT_DIV_ID = 'proxy-view-effective-content';
  ProxyView.BAD_PROXIES_DIV_ID = 'proxy-view-bad-proxies-div';
  ProxyView.BAD_PROXIES_TBODY_ID = 'proxy-view-bad-proxies-tbody';
  ProxyView.SOCKS_HINTS_DIV_ID = 'proxy-view-socks-hints';
  ProxyView.SOCKS_HINTS_FLAG_DIV_ID = 'proxy-view-socks-hints-flag';

  cr.addSingletonGetter(ProxyView);

  ProxyView.prototype = {
    // Inherit the superclass's methods.
    __proto__: superClass.prototype,

    onLoadLogFinish: function(data) {
      return this.onProxySettingsChanged(data.proxySettings) &&
          this.onBadProxiesChanged(data.badProxies);
    },

    onProxySettingsChanged: function(proxySettings) {
      $(ProxyView.ORIGINAL_SETTINGS_DIV_ID).innerHTML = '';
      $(ProxyView.EFFECTIVE_SETTINGS_DIV_ID).innerHTML = '';
      this.updateSocksHints_(null);

      if (!proxySettings)
        return false;

      // Both |original| and |effective| are dictionaries describing the
      // settings.
      var original = proxySettings.original;
      var effective = proxySettings.effective;

      var originalStr = proxySettingsToString(original);
      var effectiveStr = proxySettingsToString(effective);

      setNodeDisplay(
          $(ProxyView.ORIGINAL_CONTENT_DIV_ID), originalStr != effectiveStr);

      $(ProxyView.ORIGINAL_SETTINGS_DIV_ID).innerText = originalStr;
      $(ProxyView.EFFECTIVE_SETTINGS_DIV_ID).innerText = effectiveStr;

      this.updateSocksHints_(effective);

      return true;
    },

    onBadProxiesChanged: function(badProxies) {
      $(ProxyView.BAD_PROXIES_TBODY_ID).innerHTML = '';
      setNodeDisplay(
          $(ProxyView.BAD_PROXIES_DIV_ID), badProxies && badProxies.length > 0);

      if (!badProxies)
        return false;

      // Add a table row for each bad proxy entry.
      for (var i = 0; i < badProxies.length; ++i) {
        var entry = badProxies[i];
        var badUntilDate = timeutil.convertTimeTicksToDate(entry.bad_until);

        var tr = addNode($(ProxyView.BAD_PROXIES_TBODY_ID), 'tr');

        var nameCell = addNode(tr, 'td');
        var badUntilCell = addNode(tr, 'td');

        addTextNode(nameCell, entry.proxy_uri);
        timeutil.addNodeWithDate(badUntilCell, badUntilDate);
      }
      return true;
    },

    updateSocksHints_: function(proxySettings) {
      setNodeDisplay($(ProxyView.SOCKS_HINTS_DIV_ID), false);

      if (!proxySettings)
        return;

      var socksProxy = getSingleSocks5Proxy_(proxySettings.single_proxy);
      if (!socksProxy)
        return;

      // Suggest a recommended --host-resolver-rules.
      // NOTE: This does not compensate for any proxy bypass rules. If the
      // proxy settings include proxy bypasses the user may need to expand the
      // exclusions for host resolving.
      var hostResolverRules = 'MAP * ~NOTFOUND , EXCLUDE ' + socksProxy.host;
      var hostResolverRulesFlag =
          '--host-resolver-rules="' + hostResolverRules + '"';

      // TODO(eroman): On Linux the ClientInfo.command_line is wrong in that it
      // doesn't include any quotes around the parameters. This means the
      // string search above is going to fail :(
      if (ClientInfo.command_line &&
          ClientInfo.command_line.indexOf(hostResolverRulesFlag) != -1) {
        // Chrome is already using the suggested resolver rules.
        return;
      }

      $(ProxyView.SOCKS_HINTS_FLAG_DIV_ID).innerText = hostResolverRulesFlag;
      setNodeDisplay($(ProxyView.SOCKS_HINTS_DIV_ID), true);
    }
  };

  function getSingleSocks5Proxy_(proxyList) {
    var proxyString;
    if (typeof proxyList == 'string') {
      // Older versions of Chrome passed single_proxy as a string.
      // TODO(eroman): This behavior changed in M27. Support for older logs can
      //               safely be removed circa M29.
      proxyString = proxyList;
    } else if (Array.isArray(proxyList) && proxyList.length == 1) {
      proxyString = proxyList[0];
    } else {
      return null;
    }

    var pattern = /^socks5:\/\/(.*)$/;
    var matches = pattern.exec(proxyString);

    if (!matches)
      return null;

    var hostPortString = matches[1];

    matches = /^(.*):(\d+)$/.exec(hostPortString);
    if (!matches)
      return null;

    var result = {host: matches[1], port: matches[2]};

    // Strip brackets off of IPv6 literals.
    matches = /^\[(.*)\]$/.exec(result.host);
    if (matches)
      result.host = matches[1];

    return result;
  }

  return ProxyView;
})();
// quic_view.js
// Copyright (c) 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * This view displays a summary of the state of each QUIC session, and
 * has links to display them in the events tab.
 */
var QuicView = (function() {
  'use strict';

  // We inherit from DivView.
  var superClass = DivView;

  /**
   * @constructor
   */
  function QuicView() {
    assertFirstConstructorCall(QuicView);

    // Call superclass's constructor.
    superClass.call(this, QuicView.MAIN_BOX_ID);

    g_browser.addQuicInfoObserver(this, true);
  }

  QuicView.TAB_ID = 'tab-handle-quic';
  QuicView.TAB_NAME = 'QUIC';
  QuicView.TAB_HASH = '#quic';

  // IDs for special HTML elements in quic_view.html
  QuicView.MAIN_BOX_ID = 'quic-view-tab-content';

  QuicView.QUIC_ENABLED_CONTENT_ID =
      'quic-view-quic-enabled-content';
  QuicView.QUIC_ENABLED_NO_CONTENT_ID =
      'quic-view-quic-enabled-no-content';

  QuicView.STATUS_SUPPORTED_VERSIONS = 'quic-view-supported-versions';
  QuicView.STATUS_CONNECTION_OPTIONS = 'quic-view-connection-options';
  QuicView.STATUS_MAX_PACKET_LENGTH = 'quic-view-max-packet-length';
  QuicView.STATUS_IDLE_CONNECTION_TIMEOUTS_SECONDS= 'quic-view-idle-connection-timeout-seconds';
  QuicView.STATUS_REDUCED_PING_TIMEOUTS_SECONDS  = 'quic-view-reduced-ping-timeout-seconds';
  QuicView.STATUS_PACKET_READER_YIELD =
      'quic-view-packet-reader-yield-after-duration-milliseconds';
  QuicView.STATUS_MARK_QUIC_BROKEN =
      'quic-view-mark-quic-broken-when-network-blackholes';
  QuicView.STATUS_DO_NOT_MARK_AS_BROKEN =
      'quic-view-do-not-mark-as-broken-on-network-change';
  QuicView.STATUS_RETRY_WITHOUT_ALT =
      'quic-view-retry-without-alt-svc-on-quic-errors';
  QuicView.STATUS_DO_NOT_FRAGMENT = 'quic-view-do-not-fragment';
  QuicView.STATUS_ALLOW_SERVER_MIGRATION = 'quic-view-allow-server-migration';
  QuicView.STATUS_MIGRATE_SESSIONS_EARLY_V2 =
      'quic-view-migrate-sessions-early-v2';
  QuicView.STATUS_MIGRATE_SESSION_ON_NETWORK_CHANGE_V2 =
      'quic-view-migrate-sessions-on-network-change-v2';
  QuicView.STATUS_RETRANSMITTABLE_ON_WIRE_TIMEOUT =
      'quic-view-retransmittable-on-wire-timeout-milliseconds';
  QuicView.STATUS_DISABLE_BIDIRECTIONAL_STREAMS =
      'quic-view-disable-bidirectional-streams';
  QuicView.STATUS_RACE_CERT_VERIFICATION = 'quic-view-race-cert-verification';
  QuicView.STATUS_RACE_STALE_DNS_ON_CONNECTION = 'quic-view-race-stale-dns-on-connection';
  QuicView.STATUS_ESTIMATE_INITIAL_RTT = 'quic-view-estimate-initial-rtt';
  QuicView.STATUS_FORCE_HOL_BLOCKING = 'quic-view-force-hol-blocking';
  QuicView.STATUS_MAX_SERVER_CONFIGS_STORED_IN_PROPERTIES =
      'quic-view-max-server-configs-stored-in-properties';
  QuicView.STATUS_ORIGINS_TO_FORCE_QUIC_ON =
      'quic-view-origins-to-force-quic-on';
  QuicView.STATUS_SERVER_PUSH_CANCELLATION =
      'quic-view-server-push-cancellation';

  QuicView.SESSION_INFO_CONTENT_ID =
      'quic-view-session-info-content';
  QuicView.SESSION_INFO_NO_CONTENT_ID =
      'quic-view-session-info-no-content';
  QuicView.SESSION_INFO_TBODY_ID = 'quic-view-session-info-tbody';

  cr.addSingletonGetter(QuicView);

  QuicView.prototype = {
    // Inherit the superclass's methods.
    __proto__: superClass.prototype,

    onLoadLogFinish: function(data) {
      return this.onQuicInfoChanged(data.quicInfo);
    },

    /**
     * If there are any sessions, display a single table with
     * information on each QUIC session.  Otherwise, displays "None".
     */
    onQuicInfoChanged: function(quicInfo) {
      if (!quicInfo)
        return false;

      setNodeDisplay($(QuicView.QUIC_ENABLED_NO_CONTENT_ID),
          !quicInfo.quic_enabled);
      setNodeDisplay($(QuicView.QUIC_ENABLED_CONTENT_ID),
          !!quicInfo.quic_enabled);

      $(QuicView.STATUS_SUPPORTED_VERSIONS).textContent =
          quicInfo.supported_versions;
      $(QuicView.STATUS_CONNECTION_OPTIONS).textContent =
          quicInfo.connection_options;
      $(QuicView.STATUS_MAX_PACKET_LENGTH).textContent =
          quicInfo.max_packet_length;
      $(QuicView.STATUS_IDLE_CONNECTION_TIMEOUTS_SECONDS).textContent =
          quicInfo.idle_connection_timeout_seconds;
      $(QuicView.STATUS_REDUCED_PING_TIMEOUTS_SECONDS).textContent =
          quicInfo.reduced_ping_timeout_seconds;
      $(QuicView.STATUS_PACKET_READER_YIELD).textContent =
          quicInfo.packet_reader_yield_after_duration_milliseconds;
      $(QuicView.STATUS_MARK_QUIC_BROKEN).textContent =
          !!quicInfo.mark_quic_broken_when_network_blackholes;
      $(QuicView.STATUS_DO_NOT_MARK_AS_BROKEN).textContent =
          !!quicInfo.do_not_mark_as_broken_on_network_change;
      $(QuicView.STATUS_RETRY_WITHOUT_ALT).textContent =
          !!quicInfo.retry_without_alt_svc_on_quic_errors;
      $(QuicView.STATUS_DO_NOT_FRAGMENT).textContent =
          !!quicInfo.do_not_fragment;
      $(QuicView.STATUS_ALLOW_SERVER_MIGRATION).textContent =
          !!quicInfo.allow_server_migration;
      $(QuicView.STATUS_MIGRATE_SESSIONS_EARLY_V2).textContent =
          !!quicInfo.migrate_sessions_early_v2;
      $(QuicView.STATUS_MIGRATE_SESSION_ON_NETWORK_CHANGE_V2).textContent =
          !!quicInfo.migrate_sessions_on_network_change_v2;
      $(QuicView.STATUS_RETRANSMITTABLE_ON_WIRE_TIMEOUT).textContent =
          !!quicInfo.retransmittable_on_wire_timeout_milliseconds;
      $(QuicView.STATUS_DISABLE_BIDIRECTIONAL_STREAMS).textContent =
          !!quicInfo.disable_bidirectional_streams;
      $(QuicView.STATUS_RACE_CERT_VERIFICATION).textContent =
          !!quicInfo.race_cert_verification;
      $(QuicView.STATUS_RACE_STALE_DNS_ON_CONNECTION).textContent =
          !!quicInfo.race_stale_dns_on_connection;
      $(QuicView.STATUS_ESTIMATE_INITIAL_RTT).textContent =
          !!quicInfo.estimate_initial_rtt;
      $(QuicView.STATUS_FORCE_HOL_BLOCKING).textContent =
          !!quicInfo.force_hol_blocking;
      $(QuicView.STATUS_MAX_SERVER_CONFIGS_STORED_IN_PROPERTIES).textContent =
          quicInfo.max_server_configs_stored_in_properties;
      $(QuicView.STATUS_ORIGINS_TO_FORCE_QUIC_ON).textContent =
          quicInfo.origins_to_force_quic_on;
      $(QuicView.STATUS_SERVER_PUSH_CANCELLATION).textContent =
          !!quicInfo.server_push_cancellation;

      var sessions = quicInfo.sessions;

      var hasSessions = sessions && sessions.length > 0;

      setNodeDisplay($(QuicView.SESSION_INFO_CONTENT_ID), hasSessions);
      setNodeDisplay($(QuicView.SESSION_INFO_NO_CONTENT_ID), !hasSessions);

      var tbody = $(QuicView.SESSION_INFO_TBODY_ID);
      tbody.innerHTML = '';

      // Fill in the sessions info table.
      for (var i = 0; i < sessions.length; ++i) {
        var q = sessions[i];
        var tr = addNode(tbody, 'tr');

        addNodeWithText(tr, 'td', q.aliases ? q.aliases.join(' ') : '');
        addNodeWithText(tr, 'td', q.version);
        addNodeWithText(tr, 'td', q.peer_address);

        var connectionUIDCell = addNode(tr, 'td');
        var a = addNode(connectionUIDCell, 'a');
        a.href = '#events&q=type:QUIC_SESSION%20' + q.connection_id;
        a.textContent = q.connection_id;

        addNodeWithText(tr, 'td', q.open_streams);

        addNodeWithText(tr, 'td',
            q.active_streams && q.active_streams.length > 0 ?
            q.active_streams.join(', ') : 'None');

        addNodeWithText(tr, 'td', q.total_streams);
        addNodeWithText(tr, 'td', q.packets_sent);
        addNodeWithText(tr, 'td', q.packets_lost);
        addNodeWithText(tr, 'td', q.packets_received);
        addNodeWithText(tr, 'td', q.connected);
      }

      return true;
    },
  };

  return QuicView;
})();
// reporting_view.js
// Copyright (c) 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * This view displays a summary of the current Reporting cache, including the
 * configuration headers received for Reporting-enabled origins, and any queued
 * reports that are waiting to be uploaded.
 */
'use strict';
var ReportingView = (function() {
  'use strict';

  // We inherit from DivView.
  var superClass = DivView;

  /**
   * @constructor
   */
  function ReportingView() {
    assertFirstConstructorCall(ReportingView);

    // Call superclass's constructor.
    superClass.call(this, ReportingView.MAIN_BOX_ID);

    g_browser.addReportingInfoObserver(this, true);
  }

  ReportingView.TAB_ID = 'tab-handle-reporting';
  ReportingView.TAB_NAME = 'Reporting';
  ReportingView.TAB_HASH = '#reporting';

  // IDs for special HTML elements in reporting_view.html
  ReportingView.MAIN_BOX_ID = 'reporting-view-tab-content';

  ReportingView.DISABLED_BOX_ID = 'reporting-view-disabled-content';
  ReportingView.ENABLED_BOX_ID = 'reporting-view-enabled-content';

  ReportingView.CLIENTS_EMPTY_ID = 'reporting-view-clients-empty';
  ReportingView.CLIENTS_TABLE_ID = 'reporting-view-clients-table';
  ReportingView.CLIENTS_TBODY_ID = 'reporting-view-clients-tbody';
  ReportingView.REPORTS_EMPTY_ID = 'reporting-view-reports-empty';
  ReportingView.REPORTS_TABLE_ID = 'reporting-view-reports-table';
  ReportingView.REPORTS_TBODY_ID = 'reporting-view-reports-tbody';

  ReportingView.NEL_POLICIES_DISABLED_ID =
      'reporting-view-nel-policies-disabled';
  ReportingView.NEL_POLICIES_EMPTY_ID = 'reporting-view-nel-policies-empty';
  ReportingView.NEL_POLICIES_TABLE_ID = 'reporting-view-nel-policies-table';
  ReportingView.NEL_POLICIES_TBODY_ID = 'reporting-view-nel-policies-tbody';

  cr.addSingletonGetter(ReportingView);

  ReportingView.prototype = {
    // Inherit the superclass's methods.
    __proto__: superClass.prototype,

    onLoadLogFinish: function(data) {
      return this.onReportingInfoChanged(data.reportingInfo);
    },

    onReportingInfoChanged: function(reportingInfo) {
      if (!isObject_(reportingInfo))
        return false;

      var enabled = !!reportingInfo.reportingEnabled;
      setNodeDisplay($(ReportingView.DISABLED_BOX_ID), !enabled);
      setNodeDisplay($(ReportingView.ENABLED_BOX_ID), enabled);
      if (!enabled)
        return true;

      displayReportDetail_(ensureArray_(reportingInfo.reports));
      displayClientDetail_(ensureArray_(reportingInfo.clients));
      displayNELPolicyDetail_(reportingInfo.networkErrorLogging);
      return true;
    },
  };

  /**
   * Displays information about each queued report in the Reporting cache.
   * REQUIRES: |reportList| must be an array
   */
  function displayReportDetail_(reportList) {
    // Clear the existing content.
    $(ReportingView.REPORTS_TBODY_ID).innerHTML = '';

    var empty = reportList.length == 0;
    setNodeDisplay($(ReportingView.REPORTS_EMPTY_ID), empty);
    setNodeDisplay($(ReportingView.REPORTS_TABLE_ID), !empty);
    if (empty)
      return;

    for (var i = 0; i < reportList.length; ++i) {
      var report = ensureObject_(reportList[i]);
      var tr = addNode($(ReportingView.REPORTS_TBODY_ID), 'tr');

      var queuedNode = addNode(tr, 'td');
      if (report.queued != undefined) {
        var queuedDate = timeutil.convertTimeTicksToDate(report.queued);
        timeutil.addNodeWithDate(queuedNode, queuedDate);
      }

      addNodeWithText(tr, 'td', report.url);

      var statusNode = addNode(tr, 'td');
      addTextNode(statusNode, report.status);
      addTextNode(statusNode, ' (' + report.group);
      if (report.depth !== undefined && report.depth > 0)
        addTextNode(statusNode, ', depth: ' + report.depth);
      if (report.attempts !== undefined && report.attempts > 0)
        addTextNode(statusNode, ', attempts: ' + report.attempts);
      addTextNode(statusNode, ')');

      addNodeWithText(tr, 'td', report.type);

      var networkKey;
      if ('network_anonymization_key' in report) {
        networkKey = report.network_anonymization_key;
      } else {
        networkKey = report.network_isolation_key;
        // Around M108 the network_isolation_key changed to be named
        // network_anonymization_key, so we do this check for backwards
        // compatibility.
      }
      addNodeWithText(tr, 'td', networkKey);

      var contentNode = addNode(tr, 'td');
      if (report.type == 'network-error')
        displayNetworkErrorContent_(contentNode, report);
      else
        displayGenericReportContent_(contentNode, report);
    }
  }

  /**
   * Adds nodes to the "content" cell for a report that allow you to show a
   * summary as well as collapsable detail.  We will add a clickable button that
   * toggles between showing and hiding the detail; its label will be `showText`
   * when the detail is hidden, and `hideText` when it's visible.
   *
   * The result is an object containing `summary` and `detail` nodes.  You can
   * add whatever content you want to each of these nodes.  The summary should
   * be a one-liner, and will be a <span>.  The detail can be as large as you
   * want, and will be a <div>.
   */
  function addContentSections_(contentNode, showText, hideText) {
    var sections = {};

    sections.summary = addNode(contentNode, 'span');
    sections.summary.classList.add('reporting-content-summary');

    var button = addNode(contentNode, 'span');
    button.classList.add('reporting-content-expand-button');
    addTextNode(button, showText);
    button.onclick = function() {
      toggleNodeDisplay(sections.detail);
      button.textContent =
          getNodeDisplay(sections.detail) ? hideText : showText;
    };

    sections.detail = addNode(contentNode, 'div');
    sections.detail.classList.add('reporting-content-detail');
    setNodeDisplay(sections.detail, false);

    return sections;
  }

  /**
   * Displays format-specific detail for Network Error Logging reports.
   * REQUIRES: |report| must be an object
   */
  function displayNetworkErrorContent_(contentNode, report) {
    var contentSections =
        addContentSections_(contentNode, 'Show raw report', 'Hide raw report');

    var body = ensureObject_(report.body);
    addTextNode(contentSections.summary, body.type);
    // Only show the status code if it's present and not 0.
    if (body.status_code)
      addTextNode(
          contentSections.summary, ' (' + report.body.status_code + ')');

    addNodeWithText(
        contentSections.detail, 'pre', JSON.stringify(report, null, '  '));
  }

  /**
   * Displays a generic content cell for reports whose type we don't know how to
   * render something specific for.
   * REQUIRES: |report| must be an object
   */
  function displayGenericReportContent_(contentNode, report) {
    var contentSections =
        addContentSections_(contentNode, 'Show raw report', 'Hide raw report');
    addNodeWithText(
        contentSections.detail, 'pre', JSON.stringify(report, null, '  '));
  }

  /**
   * Displays information about each origin that has provided Reporting headers.
   * REQUIRES: |clientList| must be an array
   */
  function displayClientDetail_(clientList) {
    // Clear the existing content.
    $(ReportingView.CLIENTS_TBODY_ID).innerHTML = '';

    var empty = clientList.length == 0;
    setNodeDisplay($(ReportingView.CLIENTS_EMPTY_ID), empty);
    setNodeDisplay($(ReportingView.CLIENTS_TABLE_ID), !empty);
    if (empty)
      return;

    for (var i = 0; i < clientList.length; ++i) {
      var client = ensureObject_(clientList[i]);
      var groups = ensureArray_(client.groups);
      if (groups.length == 0)
        continue;

      // Calculate the total number of endpoints for this client, so that we can
      // rowspan its origin and NIK cells.
      var clientHeight = 0;
      for (var j = 0; j < groups.length; ++j) {
        var group = ensureObject_(groups[j]);
        var endpoints = ensureArray_(group.endpoints);
        clientHeight += group.endpoints.length;
      }
      if (clientHeight == 0)
        continue;

      for (var j = 0; j < groups.length; ++j) {
        var group = ensureObject_(groups[j]);
        var endpoints = ensureArray_(group.endpoints);
        for (var k = 0; k < endpoints.length; ++k) {
          var endpoint = ensureObject_(endpoints[k]);
          var tr = addNode($(ReportingView.CLIENTS_TBODY_ID), 'tr');

          if (j == 0 && k == 0) {
            var originNode = addNode(tr, 'td');
            originNode.setAttribute('rowspan', clientHeight);
            addTextNode(originNode, client.origin);
            var nikNode = addNode(tr, 'td');
            nikNode.setAttribute('rowspan', clientHeight);
            var networkKey;
            if ('network_anonymization_key' in client) {
              networkKey = client.network_anonymization_key;
            } else {
              networkKey = client.network_isolation_key;
              // Around M108 the network_isolation_key changed to be named
              // network_anonymization_key, so we do this check for backwards
              // compatibility.
            }
            addTextNode(nikNode, networkKey);
          }

          if (k == 0) {
            var groupNode = addNode(tr, 'td');
            groupNode.setAttribute('rowspan', group.endpoints.length);
            addTextNode(groupNode, group.name);

            var subdomainsNode = addNode(tr, 'td');
            subdomainsNode.classList.add('reporting-centered');
            subdomainsNode.setAttribute('rowspan', group.endpoints.length);
            addTextNode(
                subdomainsNode, !!group.includeSubdomains ? 'yes' : 'no');

            var expiresNode = addNode(tr, 'td');
            expiresNode.setAttribute('rowspan', group.endpoints.length);
            if (group.expires !== undefined) {
              var expiresDate = timeutil.convertTimeTicksToDate(group.expires);
              timeutil.addNodeWithDate(expiresNode, expiresDate);
              if (expired_(expiresDate)) {
                var expiredSpan = addNode(expiresNode, 'span');
                expiredSpan.classList.add('warning-text');
                addTextNode(expiredSpan, ' [expired]');
              }
            }
          }

          var endpointNode = addNode(tr, 'td');
          addTextNode(endpointNode, endpoint.url);

          var priorityNode = addNode(tr, 'td');
          priorityNode.classList.add('reporting-centered');
          addTextNode(priorityNode, valueOrDefault_(endpoint.priority, 0));

          var weightNode = addNode(tr, 'td');
          weightNode.classList.add('reporting-centered');
          addTextNode(weightNode, valueOrDefault_(endpoint.weight, 1));

          addUploadCount_(tr, ensureObject_(endpoint.successful));
          addUploadCount_(tr, ensureObject_(endpoint.failed));
        }
      }
    }
  }

  /**
   * Adds an upload count cell to the client details table.
   * REQUIRES: |counts| must be an object
   */
  function addUploadCount_(tr, counts) {
    var node = addNode(tr, 'td');
    node.classList.add('reporting-centered');
    var uploads = valueOrDefault_(counts.uploads, 0);
    var reports = valueOrDefault_(counts.reports, 0);
    if (uploads == 0 && reports == 0) {
      addTextNode(node, '-');
    } else {
      addTextNode(node, uploads + ' (' + reports + ')');
    }
  }

  /**
   * Displays information about each origin that has provided NEL headers.
   */
  function displayNELPolicyDetail_(nelInfo) {
    // Clear the existing content.
    $(ReportingView.NEL_POLICIES_TBODY_ID).innerHTML = '';

    var disabled = (nelInfo === undefined);
    setNodeDisplay($(ReportingView.NEL_POLICIES_DISABLED_ID), disabled);
    if (disabled) {
      setNodeDisplay($(ReportingView.NEL_POLICIES_EMPTY_ID), false);
      setNodeDisplay($(ReportingView.NEL_POLICIES_TABLE_ID), false);
      return;
    }

    nelInfo = ensureObject_(nelInfo);
    var policies = ensureArray_(nelInfo.originPolicies);
    var empty = policies.length == 0;
    setNodeDisplay($(ReportingView.NEL_POLICIES_EMPTY_ID), empty);
    setNodeDisplay($(ReportingView.NEL_POLICIES_TABLE_ID), !empty);
    if (empty)
      return;

    for (var i = 0; i < policies.length; ++i) {
      var policy = ensureObject_(policies[i]);
      var tr = addNode($(ReportingView.NEL_POLICIES_TBODY_ID), 'tr');

      addNodeWithText(tr, 'td', policy.origin);

      var subdomainsNode = addNode(tr, 'td');
      subdomainsNode.classList.add('reporting-centered');
      addTextNode(subdomainsNode, !!policy.includeSubdomains ? 'yes' : 'no');

      var expiresNode = addNode(tr, 'td');
      if (policy.expires !== undefined) {
        var expiresDate = timeutil.convertTimeTicksToDate(policy.expires);
        timeutil.addNodeWithDate(expiresNode, expiresDate);
        if (expired_(expiresDate)) {
          var expiredSpan = addNode(expiresNode, 'span');
          expiredSpan.classList.add('warning-text');
          addTextNode(expiredSpan, ' [expired]');
        }
      }

      addNodeWithText(tr, 'td', policy.reportTo);
      if ('NetworkAnonymizationKey' in policy) {
        // In M108 this key was changed as part of the network state
        // partitioning project.
        addNodeWithText(tr, 'td', policy.NetworkAnonymizationKey);
      } else {
        addNodeWithText(tr, 'td', policy.networkIsolationKey);
      }

      var successFractionNode = addNode(tr, 'td');
      successFractionNode.classList.add('reporting-right-justified');
      addTextNode(successFractionNode, percent_(policy.successFraction));

      var failureFractionNode = addNode(tr, 'td');
      failureFractionNode.classList.add('reporting-right-justified');
      addTextNode(failureFractionNode, percent_(policy.failureFraction));
    }
  }

  /**
   * Returns whether an expiry timestamp has expired.  If we're viewing live
   * data, uses the actual current time to determine whether it's expired.  If
   * we're viewing data from a saved log file, uses the timestamp when the file
   * was recorded.
   *
   * @param {Date} expiry An expiry time
   */
  function expired_(expiry) {
    var now;
    if (MainView.isViewingLoadedLog()) {
      now = new Date(ClientInfo.numericDate);
    } else {
      now = new Date();
    }
    return expiry < now;
  }

  /**
   * Formats a float fraction as a percentage.
   */
  function percent_(fraction) {
    return (valueOrDefault_(fraction, 0) * 100).toFixed(2) + '%';
  }

  function isObject_(value) {
    return value && typeof(value) === 'object';
  }

  function isArray_(value) {
    return value !== undefined && value instanceof Array;
  }

  function ensureObject_(value) {
    if (isObject_(value))
      return value;
    return {};
  }

  function ensureArray_(value) {
    if (isArray_(value))
      return value;
    return [];
  }

  function valueOrDefault_(value, defaultValue) {
    if (value != undefined)
      return value;
    return defaultValue;
  }

  return ReportingView;
})();
// socket_pool_wrapper.js
// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var SocketPoolWrapper = (function() {
  'use strict';

  /**
   * SocketPoolWrapper is a wrapper around socket pools entries.  It's
   * used by the log and sockets view to print tables containing both
   * a synopsis of the state of all pools, and listing the groups within
   * individual pools.
   *
   * The constructor takes a socket pool and its parent, and generates a
   * unique name from the two, which is stored as |fullName|.  |parent|
   * must itself be a SocketPoolWrapper.
   *
   * @constructor
   */
  function SocketPoolWrapper(socketPool, parent) {
    this.origPool = socketPool;
    this.fullName = socketPool.name;
    if (this.fullName != socketPool.type)
      this.fullName += ' (' + socketPool.type + ')';
    if (parent)
      this.fullName = parent.fullName + '->' + this.fullName;
  }

  /**
   * Returns an array of SocketPoolWrappers created from each of the socket
   * pools in |socketPoolInfo|.  Nested socket pools appear immediately after
   * their parent, and groups of nodes from trees with root nodes with the same
   * id are placed adjacent to each other.
   */
  SocketPoolWrapper.createArrayFrom = function(socketPoolInfo) {
    // Create SocketPoolWrappers for each socket pool and separate socket pools
    // them into different arrays based on root node name.
    var socketPoolGroups = [];
    var socketPoolNameLists = {};
    for (var i = 0; i < socketPoolInfo.length; ++i) {
      var name = socketPoolInfo[i].name;
      if (!socketPoolNameLists[name]) {
        socketPoolNameLists[name] = [];
        socketPoolGroups.push(socketPoolNameLists[name]);
      }
      addSocketPoolsToList(socketPoolNameLists[name], socketPoolInfo[i], null);
    }

    // Merge the arrays.
    var socketPoolList = [];
    for (var i = 0; i < socketPoolGroups.length; ++i) {
      socketPoolList = socketPoolList.concat(socketPoolGroups[i]);
    }
    return socketPoolList;
  };

  /**
   * Recursively creates SocketPoolWrappers from |origPool| and all its
   * children and adds them all to |socketPoolList|.  |parent| is the
   * SocketPoolWrapper for the parent of |origPool|, or null, if it's
   * a top level socket pool.
   */
  function addSocketPoolsToList(socketPoolList, origPool, parent) {
    var socketPool = new SocketPoolWrapper(origPool, parent);
    socketPoolList.push(socketPool);
    if (origPool.nested_pools) {
      for (var i = 0; i < origPool.nested_pools.length; ++i) {
        addSocketPoolsToList(
            socketPoolList, origPool.nested_pools[i], socketPool);
      }
    }
  }

  /**
   * Returns a table printer containing information on each
   * SocketPoolWrapper in |socketPools|.
   */
  SocketPoolWrapper.createTablePrinter = function(socketPools) {
    var tablePrinter = new TablePrinter();
    tablePrinter.addHeaderCell('Name');
    tablePrinter.addHeaderCell('Handed Out');
    tablePrinter.addHeaderCell('Idle');
    tablePrinter.addHeaderCell('Connecting');
    tablePrinter.addHeaderCell('Max');
    tablePrinter.addHeaderCell('Max Per Group');
    tablePrinter.addHeaderCell('Generation');

    for (var i = 0; i < socketPools.length; i++) {
      var origPool = socketPools[i].origPool;

      tablePrinter.addRow();
      tablePrinter.addCell(socketPools[i].fullName);

      tablePrinter.addCell(origPool.handed_out_socket_count);
      var idleCell = tablePrinter.addCell(origPool.idle_socket_count);
      var connectingCell =
          tablePrinter.addCell(origPool.connecting_socket_count);

      if (origPool.groups) {
        var idleSources = [];
        var connectingSources = [];
        for (var groupName in origPool.groups) {
          var group = origPool.groups[groupName];
          idleSources = idleSources.concat(group.idle_sockets);
          connectingSources = connectingSources.concat(group.connect_jobs);
        }
        idleCell.link = sourceListLink(idleSources);
        connectingCell.link = sourceListLink(connectingSources);
      }

      tablePrinter.addCell(origPool.max_socket_count);
      tablePrinter.addCell(origPool.max_sockets_per_group);
      tablePrinter.addCell(origPool.pool_generation_number);
    }
    return tablePrinter;
  };

  SocketPoolWrapper.prototype = {
    /**
     * Returns a table printer containing information on all a
     * socket pool's groups.
     */
    createGroupTablePrinter: function() {
      var tablePrinter = new TablePrinter();
      tablePrinter.setTitle(this.fullName);

      tablePrinter.addHeaderCell('Name');
      tablePrinter.addHeaderCell('Pending');
      tablePrinter.addHeaderCell('Top Priority');
      tablePrinter.addHeaderCell('Active');
      tablePrinter.addHeaderCell('Idle');
      tablePrinter.addHeaderCell('Connect Jobs');
      tablePrinter.addHeaderCell('Backup Timer');
      tablePrinter.addHeaderCell('Stalled');

      for (var groupName in this.origPool.groups) {
        var group = this.origPool.groups[groupName];

        tablePrinter.addRow();
        tablePrinter.addCell(groupName);
        tablePrinter.addCell(group.pending_request_count);
        if (group.top_pending_priority != undefined)
          tablePrinter.addCell(group.top_pending_priority);
        else
          tablePrinter.addCell('-');

        tablePrinter.addCell(group.active_socket_count);
        var idleCell = tablePrinter.addCell(group.idle_sockets.length);
        var connectingCell = tablePrinter.addCell(group.connect_jobs.length);

        idleCell.link = sourceListLink(group.idle_sockets);
        connectingCell.link = sourceListLink(group.connect_jobs);

        tablePrinter.addCell(
            group.backup_job_timer_is_running ? 'started' : 'stopped');
        tablePrinter.addCell(group.is_stalled);
      }
      return tablePrinter;
    }
  };

  /**
   * Takes in a list of source IDs and returns a link that will select the
   * specified sources.
   */
  function sourceListLink(sources) {
    if (!sources.length)
      return null;
    return '#events&q=id:' + sources.join(',');
  }

  return SocketPoolWrapper;
})();
// sockets_view.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * This view displays information on the state of all socket pools.
 *
 *   - Shows a summary of the state of each socket pool at the top.
 *   - For each pool with allocated sockets or connect jobs, shows all its
 *     groups with any allocated sockets.
 */
var SocketsView = (function() {
  'use strict';

  // We inherit from DivView.
  var superClass = DivView;

  /**
   * @constructor
   */
  function SocketsView() {
    assertFirstConstructorCall(SocketsView);

    // Call superclass's constructor.
    superClass.call(this, SocketsView.MAIN_BOX_ID);

    g_browser.addSocketPoolInfoObserver(this, true);
    this.socketPoolDiv_ = $(SocketsView.SOCKET_POOL_DIV_ID);
    this.socketPoolGroupsDiv_ = $(SocketsView.SOCKET_POOL_GROUPS_DIV_ID);
  }

  SocketsView.TAB_ID = 'tab-handle-sockets';
  SocketsView.TAB_NAME = 'Sockets';
  SocketsView.TAB_HASH = '#sockets';

  // IDs for special HTML elements in sockets_view.html
  SocketsView.MAIN_BOX_ID = 'sockets-view-tab-content';
  SocketsView.SOCKET_POOL_DIV_ID = 'sockets-view-pool-div';
  SocketsView.SOCKET_POOL_GROUPS_DIV_ID = 'sockets-view-pool-groups-div';

  cr.addSingletonGetter(SocketsView);

  SocketsView.prototype = {
    // Inherit the superclass's methods.
    __proto__: superClass.prototype,

    onLoadLogFinish: function(data) {
      return this.onSocketPoolInfoChanged(data.socketPoolInfo);
    },

    onSocketPoolInfoChanged: function(socketPoolInfo) {
      this.socketPoolDiv_.innerHTML = '';
      this.socketPoolGroupsDiv_.innerHTML = '';

      if (!socketPoolInfo)
        return false;

      var socketPools = SocketPoolWrapper.createArrayFrom(socketPoolInfo);
      var tablePrinter = SocketPoolWrapper.createTablePrinter(socketPools);
      tablePrinter.toHTML(this.socketPoolDiv_, 'styled-table');

      // Add table for each socket pool with information on each of its groups.
      for (var i = 0; i < socketPools.length; ++i) {
        if (socketPools[i].origPool.groups != undefined) {
          var p = addNode(this.socketPoolGroupsDiv_, 'p');
          var br = addNode(p, 'br');
          var groupTablePrinter = socketPools[i].createGroupTablePrinter();
          groupTablePrinter.toHTML(p, 'styled-table');
        }
      }
      return true;
    }
  };

  return SocketsView;
})();
// alt_svc_view.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * This view displays the Alt-Svc mappings.
 */
var AltSvcView = (function() {
  'use strict';

  // We inherit from DivView.
  var superClass = DivView;

  /**
   * @constructor
   */
  function AltSvcView() {
    assertFirstConstructorCall(AltSvcView);

    // Call superclass's constructor.
    superClass.call(this, AltSvcView.MAIN_BOX_ID);

    g_browser.addAltSvcMappingsObserver(this, true);
  }

  AltSvcView.TAB_ID = 'tab-handle-alt-svc';
  AltSvcView.TAB_NAME = 'Alt-Svc';
  AltSvcView.TAB_HASH = '#alt-svc';

  // IDs for special HTML elements in alt_svc_view.html
  AltSvcView.MAIN_BOX_ID = 'alt-svc-view-tab-content';
  AltSvcView.ALTERNATE_PROTOCOL_MAPPINGS_ID =
      'alt-svc-view-alternate-protocol-mappings';
  AltSvcView.MAPPINGS_CONTENT_ID =
      'alt-svc-view-mappings-content';
  AltSvcView.MAPPINGS_NO_CONTENT_ID =
      'alt-svc-view-mappings-no-content';
  AltSvcView.MAPPINGS_TBODY_ID = 'alt-svc-view-mappings-tbody';

  cr.addSingletonGetter(AltSvcView);

  AltSvcView.prototype = {
    // Inherit the superclass's methods.
    __proto__: superClass.prototype,

    onLoadLogFinish: function(data) {
      return this.onAltSvcMappingsChanged(data.altSvcMappings);
    },

    /**
     * Displays the alternate service mappings.
     */
    onAltSvcMappingsChanged: function(altSvcMappings) {
      if (!altSvcMappings)
        return false;

      var hasMappings = altSvcMappings && altSvcMappings.length > 0;

      setNodeDisplay($(AltSvcView.MAPPINGS_CONTENT_ID), hasMappings);
      setNodeDisplay($(AltSvcView.MAPPINGS_NO_CONTENT_ID), !hasMappings);

      var tbody = $(AltSvcView.MAPPINGS_TBODY_ID);
      tbody.innerHTML = '';

      // Fill in the alternate service mappings table.
      for (var i = 0; i < altSvcMappings.length; ++i) {
        var a = altSvcMappings[i];
        var tr = addNode(tbody, 'tr');

        addNodeWithText(tr, 'td', a.server);
        addNodeWithText(tr, 'td', a.alternative_service);
      }

      return true;
    }
  };

  return AltSvcView;
})();
// spdy_view.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * This view displays a summary of the state of each SPDY sessions, and
 * has links to display them in the events tab.
 */
var SpdyView = (function() {
  'use strict';

  // We inherit from DivView.
  var superClass = DivView;

  /**
   * @constructor
   */
  function SpdyView() {
    assertFirstConstructorCall(SpdyView);

    // Call superclass's constructor.
    superClass.call(this, SpdyView.MAIN_BOX_ID);

    g_browser.addSpdySessionInfoObserver(this, true);
    g_browser.addSpdyStatusObserver(this, true);
  }

  SpdyView.TAB_ID = 'tab-handle-spdy';
  SpdyView.TAB_NAME = 'HTTP/2';
  SpdyView.TAB_HASH = '#http2';

  // IDs for special HTML elements in spdy_view.html
  SpdyView.MAIN_BOX_ID = 'spdy-view-tab-content';
  SpdyView.STATUS_ID = 'spdy-view-status';
  SpdyView.STATUS_HTTP2_ENABLED = 'spdy-view-http2-enabled';
  SpdyView.STATUS_ALPN_PROTOCOLS = 'spdy-view-alpn-protocols';
  SpdyView.SESSION_INFO_ID = 'spdy-view-session-info';
  SpdyView.SESSION_INFO_CONTENT_ID = 'spdy-view-session-info-content';
  SpdyView.SESSION_INFO_NO_CONTENT_ID =
      'spdy-view-session-info-no-content';
  SpdyView.SESSION_INFO_TBODY_ID = 'spdy-view-session-info-tbody';

  cr.addSingletonGetter(SpdyView);

  SpdyView.prototype = {
    // Inherit the superclass's methods.
    __proto__: superClass.prototype,

    onLoadLogFinish: function(data) {
      return this.onSpdySessionInfoChanged(data.spdySessionInfo) &&
          this.onSpdyStatusChanged(data.spdyStatus);
    },

    /**
     * If |spdySessionInfo| contains any sessions, displays a single table with
     * information on each SPDY session.  Otherwise, displays "None".
     */
    onSpdySessionInfoChanged: function(spdySessionInfo) {
      if (!spdySessionInfo)
        return false;

      var hasSpdySessionInfo = spdySessionInfo && spdySessionInfo.length > 0;

      setNodeDisplay($(SpdyView.SESSION_INFO_CONTENT_ID), hasSpdySessionInfo);
      setNodeDisplay($(SpdyView.SESSION_INFO_NO_CONTENT_ID),
          !hasSpdySessionInfo);

      var tbody = $(SpdyView.SESSION_INFO_TBODY_ID);
      tbody.innerHTML = '';

      // Fill in the sessions info table.
      for (var i = 0; i < spdySessionInfo.length; ++i) {
        var s = spdySessionInfo[i];
        var tr = addNode(tbody, 'tr');

        var hostCell = addNode(tr, 'td');
        addNodeWithText(hostCell, 'span', s.host_port_pair);
        addNodeWithText(hostCell, 'span',
            s.aliases ? ' ' + s.aliases.join(' ') : '');

        addNodeWithText(tr, 'td', s.proxy);

        var idCell = addNode(tr, 'td');
        var a = addNodeWithText(idCell, 'a', s.source_id);
        a.href = '#events&q=id:' + s.source_id;

        var kFields = ['negotiated_protocol', 'active_streams',
          'unclaimed_pushed_streams', 'max_concurrent_streams',
          'streams_initiated_count', 'streams_pushed_count',
          'streams_pushed_and_claimed_count',
          'streams_abandoned_count', 'frames_received', 'is_secure',
          'sent_settings', 'received_settings', 'send_window_size',
          'recv_window_size', 'unacked_recv_window_bytes', 'error'];

        for (var fieldIndex = 0; fieldIndex < kFields.length; ++fieldIndex) {
          addNodeWithText(tr, 'td', s[kFields[fieldIndex]]);
        }
      }

      return true;
    },

    /**
     * Displays information on the global SPDY status.
     */
    onSpdyStatusChanged: function(spdyStatus) {
      if (!spdyStatus)
        return false;

      $(SpdyView.STATUS_HTTP2_ENABLED).textContent = spdyStatus.enable_http2;

      $(SpdyView.STATUS_ALPN_PROTOCOLS).textContent = spdyStatus.alpn_protos;

      return true;
    }
  };

  return SpdyView;
})();
// modules_view.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * This view displays information on installed Chrome extensions / apps as well
 * as Winsock layered service providers and namespace providers.
 *
 * For each layered service provider, shows the name, dll, and type
 * information.  For each namespace provider, shows the name and
 * whether or not it's active.
 */
var ModulesView = (function() {
  'use strict';

  // We inherit from DivView.
  var superClass = DivView;

  /**
   * @constructor
   */
  function ModulesView() {
    assertFirstConstructorCall(ModulesView);

    // Call superclass's constructor.
    superClass.call(this, ModulesView.MAIN_BOX_ID);

    this.serviceProvidersTbody_ = $(ModulesView.SERVICE_PROVIDERS_TBODY_ID);
    this.namespaceProvidersTbody_ = $(ModulesView.NAMESPACE_PROVIDERS_TBODY_ID);

    g_browser.addServiceProvidersObserver(this, false);
    g_browser.addExtensionInfoObserver(this, true);
  }

  ModulesView.TAB_ID = 'tab-handle-modules';
  ModulesView.TAB_NAME = 'Modules';
  ModulesView.TAB_HASH = '#modules';

  // IDs for special HTML elements in modules_view.html.
  ModulesView.MAIN_BOX_ID = 'modules-view-tab-content';
  ModulesView.EXTENSION_INFO_ID = 'modules-view-extension-info';
  ModulesView.EXTENSION_INFO_UNAVAILABLE_ID =
      'modules-view-extension-info-unavailable';
  ModulesView.EXTENSION_INFO_NO_CONTENT_ID =
      'modules-view-extension-info-no-content';
  ModulesView.EXTENSION_INFO_CONTENT_ID =
      'modules-view-extension-info-content';
  ModulesView.EXTENSION_INFO_TBODY_ID =
      'modules-view-extension-info-tbody';
  ModulesView.WINDOWS_SERVICE_PROVIDERS_ID =
      'modules-view-windows-service-providers';
  ModulesView.SERVICE_PROVIDERS_TBODY_ID =
      'modules-view-service-providers-tbody';
  ModulesView.NAMESPACE_PROVIDERS_TBODY_ID =
      'modules-view-namespace-providers-tbody';

  cr.addSingletonGetter(ModulesView);

  ModulesView.prototype = {
    // Inherit the superclass's methods.
    __proto__: superClass.prototype,

    onLoadLogFinish: function(data) {
      // Show the tab if there are either service providers or extension info.
      var hasExtensionInfo = this.onExtensionInfoChanged(data.extensionInfo);
      var hasSpiInfo = this.onServiceProvidersChanged(data.serviceProviders);
      return hasExtensionInfo || hasSpiInfo;
    },

    onExtensionInfoChanged: function(extensionInfo) {
      setNodeDisplay($(ModulesView.EXTENSION_INFO_CONTENT_ID),
          extensionInfo && extensionInfo.length > 0);
      setNodeDisplay($(ModulesView.EXTENSION_INFO_UNAVAILABLE_ID),
          !extensionInfo);
      setNodeDisplay($(ModulesView.EXTENSION_INFO_NO_CONTENT_ID),
          extensionInfo && extensionInfo.length == 0);

      var tbodyExtension = $(ModulesView.EXTENSION_INFO_TBODY_ID);
      tbodyExtension.innerHTML = '';

      if (extensionInfo && extensionInfo.length > 0) {
        // Fill in the extensions table.
        for (var i = 0; i < extensionInfo.length; ++i) {
          var e = extensionInfo[i];
          var tr = addNode(tbodyExtension, 'tr');
          tr.className = (e.enabled ? 'enabled' : '');

          addNodeWithText(tr, 'td', e.id);
          addNodeWithText(tr, 'td', e.packagedApp);
          addNodeWithText(tr, 'td', e.enabled);
          addNodeWithText(tr, 'td', e.name);
          addNodeWithText(tr, 'td', e.version);
          addNodeWithText(tr, 'td', e.description);
        }
      }

      return !!extensionInfo;
    },

    onServiceProvidersChanged: function(serviceProviders) {
      setNodeDisplay($(ModulesView.WINDOWS_SERVICE_PROVIDERS_ID),
          serviceProviders);
      if (serviceProviders) {
        var tbodyService = $(ModulesView.SERVICE_PROVIDERS_TBODY_ID);
        tbodyService.innerHTML = '';

        // Fill in the service providers table.
        for (var i = 0; i < serviceProviders.service_providers.length; ++i) {
          var s = serviceProviders.service_providers[i];
          var tr = addNode(tbodyService, 'tr');

          addNodeWithText(tr, 'td', s.name);
          addNodeWithText(tr, 'td', s.version);
          addNodeWithText(tr, 'td',
              ModulesView.getLayeredServiceProviderType(s));
          addNodeWithText(tr, 'td',
              ModulesView.getLayeredServiceProviderSocketType(s));
          addNodeWithText(tr, 'td',
              ModulesView.getLayeredServiceProviderProtocolType(s));
        }

        var tbodyNamespace = $(ModulesView.NAMESPACE_PROVIDERS_TBODY_ID);
        tbodyNamespace.innerHTML = '';

        // Fill in the namespace providers table.
        for (var i = 0; i < serviceProviders.namespace_providers.length; ++i) {
          var n = serviceProviders.namespace_providers[i];
          var tr = addNode(tbodyNamespace, 'tr');

          addNodeWithText(tr, 'td', n.name);
          addNodeWithText(tr, 'td', n.version);
          addNodeWithText(tr, 'td', ModulesView.getNamespaceProviderType(n));
          addNodeWithText(tr, 'td', n.active);
        }
      }

      return !!serviceProviders;
    },
  };

  /**
   * Returns type of a layered service provider.
   */
  ModulesView.getLayeredServiceProviderType = function(serviceProvider) {
    if (serviceProvider.chain_length == 0)
      return 'Layer';
    if (serviceProvider.chain_length == 1)
      return 'Base';
    return 'Chain';
  };

  var SOCKET_TYPE = {
    '1': 'SOCK_STREAM',
    '2': 'SOCK_DGRAM',
    '3': 'SOCK_RAW',
    '4': 'SOCK_RDM',
    '5': 'SOCK_SEQPACKET'
  };

  /**
   * Returns socket type of a layered service provider as a string.
   */
  ModulesView.getLayeredServiceProviderSocketType = function(serviceProvider) {
    return tryGetValueWithKey(SOCKET_TYPE, serviceProvider.socket_type);
  };

  var PROTOCOL_TYPE = {
    '1': 'IPPROTO_ICMP',
    '6': 'IPPROTO_TCP',
    '17': 'IPPROTO_UDP',
    '58': 'IPPROTO_ICMPV6'
  };

  /**
   * Returns protocol type of a layered service provider as a string.
   */
  ModulesView.getLayeredServiceProviderProtocolType = function(
      serviceProvider) {
    return tryGetValueWithKey(PROTOCOL_TYPE, serviceProvider.socket_protocol);
  };

  var NAMESPACE_PROVIDER_PTYPE = {
    '12': 'NS_DNS',
    '15': 'NS_NLA',
    '16': 'NS_BTH',
    '32': 'NS_NTDS',
    '37': 'NS_EMAIL',
    '38': 'NS_PNRPNAME',
    '39': 'NS_PNRPCLOUD'
  };

  /**
   * Returns the type of a namespace provider as a string.
   */
  ModulesView.getNamespaceProviderType = function(namespaceProvider) {
    return tryGetValueWithKey(NAMESPACE_PROVIDER_PTYPE, namespaceProvider.type);
  };

  return ModulesView;
})();
// prerender_view.js
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * This view displays information related to Prerendering.
 */
var PrerenderView = (function() {
  'use strict';

  // We inherit from DivView.
  var superClass = DivView;

  /**
   * @constructor
   */
  function PrerenderView() {
    assertFirstConstructorCall(PrerenderView);

    // Call superclass's constructor.
    superClass.call(this, PrerenderView.MAIN_BOX_ID);

    g_browser.addPrerenderInfoObserver(this, true);
  }

  PrerenderView.TAB_ID = 'tab-handle-prerender';
  PrerenderView.TAB_NAME = 'Prerender';
  PrerenderView.TAB_HASH = '#prerender';

  // IDs for special HTML elements in prerender_view.html
  PrerenderView.MAIN_BOX_ID = 'prerender-view-tab-content';
  PrerenderView.PRERENDER_VIEW_ENABLED_ID =
      'prerender-view-enabled';
  PrerenderView.PRERENDER_VIEW_ENABLED_NOTE_ID =
      'prerender-view-enabled-note';
  PrerenderView.PRERENDER_VIEW_OMNIBOX_ENABLED_ID =
      'prerender-view-omnibox-enabled';
  PrerenderView.HISTORY_TABLE_ID = 'prerender-view-history-table';
  PrerenderView.ACTIVE_TABLE_ID = 'prerender-view-active-table';

  cr.addSingletonGetter(PrerenderView);

  PrerenderView.prototype = {
    // Inherit the superclass's methods.
    __proto__: superClass.prototype,

    onLoadLogFinish: function(data) {
      return this.onPrerenderInfoChanged(data.prerenderInfo);
    },

    onPrerenderInfoChanged: function(prerenderInfo) {
      if (!prerenderInfo)
        return false;

      $(PrerenderView.PRERENDER_VIEW_ENABLED_ID).textContent =
          prerenderInfo.enabled;
      $(PrerenderView.PRERENDER_VIEW_ENABLED_NOTE_ID).textContent =
          prerenderInfo.enabled_note;
      $(PrerenderView.PRERENDER_VIEW_OMNIBOX_ENABLED_ID).textContent =
          prerenderInfo.omnibox_enabled;

      var tbodyActive = $(PrerenderView.ACTIVE_TABLE_ID);
      tbodyActive.innerHTML = '';

      // Fill in Active Prerender Pages table
      for (var i = 0; i < prerenderInfo.active.length; ++i) {
        var a = prerenderInfo.active[i];
        var tr = addNode(tbodyActive, 'tr');

        addNodeWithText(tr, 'td', a.url);
        addNodeWithText(tr, 'td', a.duration);
        addNodeWithText(tr, 'td', a.is_loaded);
      }

      var tbodyHistory = $(PrerenderView.HISTORY_TABLE_ID);
      tbodyHistory.innerHTML = '';

      // Fill in Prerender History table
      for (var i = 0; i < prerenderInfo.history.length; ++i) {
        var h = prerenderInfo.history[i];
        var tr = addNode(tbodyHistory, 'tr');
        tr.className = h.final_status.toLowerCase();

        addNodeWithText(tr, 'td', h.origin);
        addNodeWithText(tr, 'td', h.url);
        addNodeWithText(tr, 'td', h.final_status);
        addNodeWithText(tr, 'td',
            timeutil.dateToString(new Date(parseInt(h.end_time))));
      }

      return true;
    }
  };

  return PrerenderView;
})();
// /third_party/jszip/jszip.min.js
/*!

JSZip v3.5.0 - A JavaScript class for generating and reading zip files
<http://stuartk.com/jszip>

(c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/master/LICENSE.markdown.

JSZip uses the library pako released under the MIT license :
https://github.com/nodeca/pako/blob/master/LICENSE
*/

!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).JSZip=t()}}(function(){return function s(a,o,h){function u(r,t){if(!o[r]){if(!a[r]){var e="function"==typeof require&&require;if(!t&&e)return e(r,!0);if(l)return l(r,!0);var i=new Error("Cannot find module '"+r+"'");throw i.code="MODULE_NOT_FOUND",i}var n=o[r]={exports:{}};a[r][0].call(n.exports,function(t){var e=a[r][1][t];return u(e||t)},n,n.exports,s,a,o,h)}return o[r].exports}for(var l="function"==typeof require&&require,t=0;t<h.length;t++)u(h[t]);return u}({1:[function(t,e,r){"use strict";var c=t("./utils"),d=t("./support"),p="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";r.encode=function(t){for(var e,r,i,n,s,a,o,h=[],u=0,l=t.length,f=l,d="string"!==c.getTypeOf(t);u<t.length;)f=l-u,i=d?(e=t[u++],r=u<l?t[u++]:0,u<l?t[u++]:0):(e=t.charCodeAt(u++),r=u<l?t.charCodeAt(u++):0,u<l?t.charCodeAt(u++):0),n=e>>2,s=(3&e)<<4|r>>4,a=1<f?(15&r)<<2|i>>6:64,o=2<f?63&i:64,h.push(p.charAt(n)+p.charAt(s)+p.charAt(a)+p.charAt(o));return h.join("")},r.decode=function(t){var e,r,i,n,s,a,o=0,h=0,u="data:";if(t.substr(0,u.length)===u)throw new Error("Invalid base64 input, it looks like a data url.");var l,f=3*(t=t.replace(/[^A-Za-z0-9\+\/\=]/g,"")).length/4;if(t.charAt(t.length-1)===p.charAt(64)&&f--,t.charAt(t.length-2)===p.charAt(64)&&f--,f%1!=0)throw new Error("Invalid base64 input, bad content length.");for(l=d.uint8array?new Uint8Array(0|f):new Array(0|f);o<t.length;)e=p.indexOf(t.charAt(o++))<<2|(n=p.indexOf(t.charAt(o++)))>>4,r=(15&n)<<4|(s=p.indexOf(t.charAt(o++)))>>2,i=(3&s)<<6|(a=p.indexOf(t.charAt(o++))),l[h++]=e,64!==s&&(l[h++]=r),64!==a&&(l[h++]=i);return l}},{"./support":30,"./utils":32}],2:[function(t,e,r){"use strict";var i=t("./external"),n=t("./stream/DataWorker"),s=t("./stream/DataLengthProbe"),a=t("./stream/Crc32Probe");s=t("./stream/DataLengthProbe");function o(t,e,r,i,n){this.compressedSize=t,this.uncompressedSize=e,this.crc32=r,this.compression=i,this.compressedContent=n}o.prototype={getContentWorker:function(){var t=new n(i.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new s("data_length")),e=this;return t.on("end",function(){if(this.streamInfo.data_length!==e.uncompressedSize)throw new Error("Bug : uncompressed data size mismatch")}),t},getCompressedWorker:function(){return new n(i.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize",this.compressedSize).withStreamInfo("uncompressedSize",this.uncompressedSize).withStreamInfo("crc32",this.crc32).withStreamInfo("compression",this.compression)}},o.createWorkerFrom=function(t,e,r){return t.pipe(new a).pipe(new s("uncompressedSize")).pipe(e.compressWorker(r)).pipe(new s("compressedSize")).withStreamInfo("compression",e)},e.exports=o},{"./external":6,"./stream/Crc32Probe":25,"./stream/DataLengthProbe":26,"./stream/DataWorker":27}],3:[function(t,e,r){"use strict";var i=t("./stream/GenericWorker");r.STORE={magic:"\0\0",compressWorker:function(t){return new i("STORE compression")},uncompressWorker:function(){return new i("STORE decompression")}},r.DEFLATE=t("./flate")},{"./flate":7,"./stream/GenericWorker":28}],4:[function(t,e,r){"use strict";var i=t("./utils");var o=function(){for(var t,e=[],r=0;r<256;r++){t=r;for(var i=0;i<8;i++)t=1&t?3988292384^t>>>1:t>>>1;e[r]=t}return e}();e.exports=function(t,e){return void 0!==t&&t.length?"string"!==i.getTypeOf(t)?function(t,e,r,i){var n=o,s=i+r;t^=-1;for(var a=i;a<s;a++)t=t>>>8^n[255&(t^e[a])];return-1^t}(0|e,t,t.length,0):function(t,e,r,i){var n=o,s=i+r;t^=-1;for(var a=i;a<s;a++)t=t>>>8^n[255&(t^e.charCodeAt(a))];return-1^t}(0|e,t,t.length,0):0}},{"./utils":32}],5:[function(t,e,r){"use strict";r.base64=!1,r.binary=!1,r.dir=!1,r.createFolders=!0,r.date=null,r.compression=null,r.compressionOptions=null,r.comment=null,r.unixPermissions=null,r.dosPermissions=null},{}],6:[function(t,e,r){"use strict";var i=null;i="undefined"!=typeof Promise?Promise:t("lie"),e.exports={Promise:i}},{lie:37}],7:[function(t,e,r){"use strict";var i="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Uint32Array,n=t("pako"),s=t("./utils"),a=t("./stream/GenericWorker"),o=i?"uint8array":"array";function h(t,e){a.call(this,"FlateWorker/"+t),this._pako=null,this._pakoAction=t,this._pakoOptions=e,this.meta={}}r.magic="\b\0",s.inherits(h,a),h.prototype.processChunk=function(t){this.meta=t.meta,null===this._pako&&this._createPako(),this._pako.push(s.transformTo(o,t.data),!1)},h.prototype.flush=function(){a.prototype.flush.call(this),null===this._pako&&this._createPako(),this._pako.push([],!0)},h.prototype.cleanUp=function(){a.prototype.cleanUp.call(this),this._pako=null},h.prototype._createPako=function(){this._pako=new n[this._pakoAction]({raw:!0,level:this._pakoOptions.level||-1});var e=this;this._pako.onData=function(t){e.push({data:t,meta:e.meta})}},r.compressWorker=function(t){return new h("Deflate",t)},r.uncompressWorker=function(){return new h("Inflate",{})}},{"./stream/GenericWorker":28,"./utils":32,pako:38}],8:[function(t,e,r){"use strict";function A(t,e){var r,i="";for(r=0;r<e;r++)i+=String.fromCharCode(255&t),t>>>=8;return i}function i(t,e,r,i,n,s){var a,o,h=t.file,u=t.compression,l=s!==O.utf8encode,f=I.transformTo("string",s(h.name)),d=I.transformTo("string",O.utf8encode(h.name)),c=h.comment,p=I.transformTo("string",s(c)),m=I.transformTo("string",O.utf8encode(c)),_=d.length!==h.name.length,g=m.length!==c.length,b="",v="",y="",w=h.dir,k=h.date,x={crc32:0,compressedSize:0,uncompressedSize:0};e&&!r||(x.crc32=t.crc32,x.compressedSize=t.compressedSize,x.uncompressedSize=t.uncompressedSize);var S=0;e&&(S|=8),l||!_&&!g||(S|=2048);var z=0,C=0;w&&(z|=16),"UNIX"===n?(C=798,z|=function(t,e){var r=t;return t||(r=e?16893:33204),(65535&r)<<16}(h.unixPermissions,w)):(C=20,z|=function(t){return 63&(t||0)}(h.dosPermissions)),a=k.getUTCHours(),a<<=6,a|=k.getUTCMinutes(),a<<=5,a|=k.getUTCSeconds()/2,o=k.getUTCFullYear()-1980,o<<=4,o|=k.getUTCMonth()+1,o<<=5,o|=k.getUTCDate(),_&&(v=A(1,1)+A(B(f),4)+d,b+="up"+A(v.length,2)+v),g&&(y=A(1,1)+A(B(p),4)+m,b+="uc"+A(y.length,2)+y);var E="";return E+="\n\0",E+=A(S,2),E+=u.magic,E+=A(a,2),E+=A(o,2),E+=A(x.crc32,4),E+=A(x.compressedSize,4),E+=A(x.uncompressedSize,4),E+=A(f.length,2),E+=A(b.length,2),{fileRecord:R.LOCAL_FILE_HEADER+E+f+b,dirRecord:R.CENTRAL_FILE_HEADER+A(C,2)+E+A(p.length,2)+"\0\0\0\0"+A(z,4)+A(i,4)+f+b+p}}var I=t("../utils"),n=t("../stream/GenericWorker"),O=t("../utf8"),B=t("../crc32"),R=t("../signature");function s(t,e,r,i){n.call(this,"ZipFileWorker"),this.bytesWritten=0,this.zipComment=e,this.zipPlatform=r,this.encodeFileName=i,this.streamFiles=t,this.accumulate=!1,this.contentBuffer=[],this.dirRecords=[],this.currentSourceOffset=0,this.entriesCount=0,this.currentFile=null,this._sources=[]}I.inherits(s,n),s.prototype.push=function(t){var e=t.meta.percent||0,r=this.entriesCount,i=this._sources.length;this.accumulate?this.contentBuffer.push(t):(this.bytesWritten+=t.data.length,n.prototype.push.call(this,{data:t.data,meta:{currentFile:this.currentFile,percent:r?(e+100*(r-i-1))/r:100}}))},s.prototype.openedSource=function(t){this.currentSourceOffset=this.bytesWritten,this.currentFile=t.file.name;var e=this.streamFiles&&!t.file.dir;if(e){var r=i(t,e,!1,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);this.push({data:r.fileRecord,meta:{percent:0}})}else this.accumulate=!0},s.prototype.closedSource=function(t){this.accumulate=!1;var e=this.streamFiles&&!t.file.dir,r=i(t,e,!0,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);if(this.dirRecords.push(r.dirRecord),e)this.push({data:function(t){return R.DATA_DESCRIPTOR+A(t.crc32,4)+A(t.compressedSize,4)+A(t.uncompressedSize,4)}(t),meta:{percent:100}});else for(this.push({data:r.fileRecord,meta:{percent:0}});this.contentBuffer.length;)this.push(this.contentBuffer.shift());this.currentFile=null},s.prototype.flush=function(){for(var t=this.bytesWritten,e=0;e<this.dirRecords.length;e++)this.push({data:this.dirRecords[e],meta:{percent:100}});var r=this.bytesWritten-t,i=function(t,e,r,i,n){var s=I.transformTo("string",n(i));return R.CENTRAL_DIRECTORY_END+"\0\0\0\0"+A(t,2)+A(t,2)+A(e,4)+A(r,4)+A(s.length,2)+s}(this.dirRecords.length,r,t,this.zipComment,this.encodeFileName);this.push({data:i,meta:{percent:100}})},s.prototype.prepareNextSource=function(){this.previous=this._sources.shift(),this.openedSource(this.previous.streamInfo),this.isPaused?this.previous.pause():this.previous.resume()},s.prototype.registerPrevious=function(t){this._sources.push(t);var e=this;return t.on("data",function(t){e.processChunk(t)}),t.on("end",function(){e.closedSource(e.previous.streamInfo),e._sources.length?e.prepareNextSource():e.end()}),t.on("error",function(t){e.error(t)}),this},s.prototype.resume=function(){return!!n.prototype.resume.call(this)&&(!this.previous&&this._sources.length?(this.prepareNextSource(),!0):this.previous||this._sources.length||this.generatedError?void 0:(this.end(),!0))},s.prototype.error=function(t){var e=this._sources;if(!n.prototype.error.call(this,t))return!1;for(var r=0;r<e.length;r++)try{e[r].error(t)}catch(t){}return!0},s.prototype.lock=function(){n.prototype.lock.call(this);for(var t=this._sources,e=0;e<t.length;e++)t[e].lock()},e.exports=s},{"../crc32":4,"../signature":23,"../stream/GenericWorker":28,"../utf8":31,"../utils":32}],9:[function(t,e,r){"use strict";var u=t("../compressions"),i=t("./ZipFileWorker");r.generateWorker=function(t,a,e){var o=new i(a.streamFiles,e,a.platform,a.encodeFileName),h=0;try{t.forEach(function(t,e){h++;var r=function(t,e){var r=t||e,i=u[r];if(!i)throw new Error(r+" is not a valid compression method !");return i}(e.options.compression,a.compression),i=e.options.compressionOptions||a.compressionOptions||{},n=e.dir,s=e.date;e._compressWorker(r,i).withStreamInfo("file",{name:t,dir:n,date:s,comment:e.comment||"",unixPermissions:e.unixPermissions,dosPermissions:e.dosPermissions}).pipe(o)}),o.entriesCount=h}catch(t){o.error(t)}return o}},{"../compressions":3,"./ZipFileWorker":8}],10:[function(t,e,r){"use strict";function i(){if(!(this instanceof i))return new i;if(arguments.length)throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");this.files={},this.comment=null,this.root="",this.clone=function(){var t=new i;for(var e in this)"function"!=typeof this[e]&&(t[e]=this[e]);return t}}(i.prototype=t("./object")).loadAsync=t("./load"),i.support=t("./support"),i.defaults=t("./defaults"),i.version="3.5.0",i.loadAsync=function(t,e){return(new i).loadAsync(t,e)},i.external=t("./external"),e.exports=i},{"./defaults":5,"./external":6,"./load":11,"./object":15,"./support":30}],11:[function(t,e,r){"use strict";var i=t("./utils"),n=t("./external"),o=t("./utf8"),h=(i=t("./utils"),t("./zipEntries")),s=t("./stream/Crc32Probe"),u=t("./nodejsUtils");function l(i){return new n.Promise(function(t,e){var r=i.decompressed.getContentWorker().pipe(new s);r.on("error",function(t){e(t)}).on("end",function(){r.streamInfo.crc32!==i.decompressed.crc32?e(new Error("Corrupted zip : CRC32 mismatch")):t()}).resume()})}e.exports=function(t,s){var a=this;return s=i.extend(s||{},{base64:!1,checkCRC32:!1,optimizedBinaryString:!1,createFolders:!1,decodeFileName:o.utf8decode}),u.isNode&&u.isStream(t)?n.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")):i.prepareContent("the loaded zip file",t,!0,s.optimizedBinaryString,s.base64).then(function(t){var e=new h(s);return e.load(t),e}).then(function(t){var e=[n.Promise.resolve(t)],r=t.files;if(s.checkCRC32)for(var i=0;i<r.length;i++)e.push(l(r[i]));return n.Promise.all(e)}).then(function(t){for(var e=t.shift(),r=e.files,i=0;i<r.length;i++){var n=r[i];a.file(n.fileNameStr,n.decompressed,{binary:!0,optimizedBinaryString:!0,date:n.date,dir:n.dir,comment:n.fileCommentStr.length?n.fileCommentStr:null,unixPermissions:n.unixPermissions,dosPermissions:n.dosPermissions,createFolders:s.createFolders})}return e.zipComment.length&&(a.comment=e.zipComment),a})}},{"./external":6,"./nodejsUtils":14,"./stream/Crc32Probe":25,"./utf8":31,"./utils":32,"./zipEntries":33}],12:[function(t,e,r){"use strict";var i=t("../utils"),n=t("../stream/GenericWorker");function s(t,e){n.call(this,"Nodejs stream input adapter for "+t),this._upstreamEnded=!1,this._bindStream(e)}i.inherits(s,n),s.prototype._bindStream=function(t){var e=this;(this._stream=t).pause(),t.on("data",function(t){e.push({data:t,meta:{percent:0}})}).on("error",function(t){e.isPaused?this.generatedError=t:e.error(t)}).on("end",function(){e.isPaused?e._upstreamEnded=!0:e.end()})},s.prototype.pause=function(){return!!n.prototype.pause.call(this)&&(this._stream.pause(),!0)},s.prototype.resume=function(){return!!n.prototype.resume.call(this)&&(this._upstreamEnded?this.end():this._stream.resume(),!0)},e.exports=s},{"../stream/GenericWorker":28,"../utils":32}],13:[function(t,e,r){"use strict";var n=t("readable-stream").Readable;function i(t,e,r){n.call(this,e),this._helper=t;var i=this;t.on("data",function(t,e){i.push(t)||i._helper.pause(),r&&r(e)}).on("error",function(t){i.emit("error",t)}).on("end",function(){i.push(null)})}t("../utils").inherits(i,n),i.prototype._read=function(){this._helper.resume()},e.exports=i},{"../utils":32,"readable-stream":16}],14:[function(t,e,r){"use strict";e.exports={isNode:"undefined"!=typeof Buffer,newBufferFrom:function(t,e){if(Buffer.from&&Buffer.from!==Uint8Array.from)return Buffer.from(t,e);if("number"==typeof t)throw new Error('The "data" argument must not be a number');return new Buffer(t,e)},allocBuffer:function(t){if(Buffer.alloc)return Buffer.alloc(t);var e=new Buffer(t);return e.fill(0),e},isBuffer:function(t){return Buffer.isBuffer(t)},isStream:function(t){return t&&"function"==typeof t.on&&"function"==typeof t.pause&&"function"==typeof t.resume}}},{}],15:[function(t,e,r){"use strict";function s(t,e,r){var i,n=u.getTypeOf(e),s=u.extend(r||{},f);s.date=s.date||new Date,null!==s.compression&&(s.compression=s.compression.toUpperCase()),"string"==typeof s.unixPermissions&&(s.unixPermissions=parseInt(s.unixPermissions,8)),s.unixPermissions&&16384&s.unixPermissions&&(s.dir=!0),s.dosPermissions&&16&s.dosPermissions&&(s.dir=!0),s.dir&&(t=g(t)),s.createFolders&&(i=_(t))&&b.call(this,i,!0);var a="string"===n&&!1===s.binary&&!1===s.base64;r&&void 0!==r.binary||(s.binary=!a),(e instanceof d&&0===e.uncompressedSize||s.dir||!e||0===e.length)&&(s.base64=!1,s.binary=!0,e="",s.compression="STORE",n="string");var o=null;o=e instanceof d||e instanceof l?e:p.isNode&&p.isStream(e)?new m(t,e):u.prepareContent(t,e,s.binary,s.optimizedBinaryString,s.base64);var h=new c(t,o,s);this.files[t]=h}var n=t("./utf8"),u=t("./utils"),l=t("./stream/GenericWorker"),a=t("./stream/StreamHelper"),f=t("./defaults"),d=t("./compressedObject"),c=t("./zipObject"),o=t("./generate"),p=t("./nodejsUtils"),m=t("./nodejs/NodejsStreamInputAdapter"),_=function(t){"/"===t.slice(-1)&&(t=t.substring(0,t.length-1));var e=t.lastIndexOf("/");return 0<e?t.substring(0,e):""},g=function(t){return"/"!==t.slice(-1)&&(t+="/"),t},b=function(t,e){return e=void 0!==e?e:f.createFolders,t=g(t),this.files[t]||s.call(this,t,null,{dir:!0,createFolders:e}),this.files[t]};function h(t){return"[object RegExp]"===Object.prototype.toString.call(t)}var i={load:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},forEach:function(t){var e,r,i;for(e in this.files)this.files.hasOwnProperty(e)&&(i=this.files[e],(r=e.slice(this.root.length,e.length))&&e.slice(0,this.root.length)===this.root&&t(r,i))},filter:function(r){var i=[];return this.forEach(function(t,e){r(t,e)&&i.push(e)}),i},file:function(t,e,r){if(1!==arguments.length)return t=this.root+t,s.call(this,t,e,r),this;if(h(t)){var i=t;return this.filter(function(t,e){return!e.dir&&i.test(t)})}var n=this.files[this.root+t];return n&&!n.dir?n:null},folder:function(r){if(!r)return this;if(h(r))return this.filter(function(t,e){return e.dir&&r.test(t)});var t=this.root+r,e=b.call(this,t),i=this.clone();return i.root=e.name,i},remove:function(r){r=this.root+r;var t=this.files[r];if(t||("/"!==r.slice(-1)&&(r+="/"),t=this.files[r]),t&&!t.dir)delete this.files[r];else for(var e=this.filter(function(t,e){return e.name.slice(0,r.length)===r}),i=0;i<e.length;i++)delete this.files[e[i].name];return this},generate:function(t){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},generateInternalStream:function(t){var e,r={};try{if((r=u.extend(t||{},{streamFiles:!1,compression:"STORE",compressionOptions:null,type:"",platform:"DOS",comment:null,mimeType:"application/zip",encodeFileName:n.utf8encode})).type=r.type.toLowerCase(),r.compression=r.compression.toUpperCase(),"binarystring"===r.type&&(r.type="string"),!r.type)throw new Error("No output type specified.");u.checkSupport(r.type),"darwin"!==r.platform&&"freebsd"!==r.platform&&"linux"!==r.platform&&"sunos"!==r.platform||(r.platform="UNIX"),"win32"===r.platform&&(r.platform="DOS");var i=r.comment||this.comment||"";e=o.generateWorker(this,r,i)}catch(t){(e=new l("error")).error(t)}return new a(e,r.type||"string",r.mimeType)},generateAsync:function(t,e){return this.generateInternalStream(t).accumulate(e)},generateNodeStream:function(t,e){return(t=t||{}).type||(t.type="nodebuffer"),this.generateInternalStream(t).toNodejsStream(e)}};e.exports=i},{"./compressedObject":2,"./defaults":5,"./generate":9,"./nodejs/NodejsStreamInputAdapter":12,"./nodejsUtils":14,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31,"./utils":32,"./zipObject":35}],16:[function(t,e,r){e.exports=t("stream")},{stream:void 0}],17:[function(t,e,r){"use strict";var i=t("./DataReader");function n(t){i.call(this,t);for(var e=0;e<this.data.length;e++)t[e]=255&t[e]}t("../utils").inherits(n,i),n.prototype.byteAt=function(t){return this.data[this.zero+t]},n.prototype.lastIndexOfSignature=function(t){for(var e=t.charCodeAt(0),r=t.charCodeAt(1),i=t.charCodeAt(2),n=t.charCodeAt(3),s=this.length-4;0<=s;--s)if(this.data[s]===e&&this.data[s+1]===r&&this.data[s+2]===i&&this.data[s+3]===n)return s-this.zero;return-1},n.prototype.readAndCheckSignature=function(t){var e=t.charCodeAt(0),r=t.charCodeAt(1),i=t.charCodeAt(2),n=t.charCodeAt(3),s=this.readData(4);return e===s[0]&&r===s[1]&&i===s[2]&&n===s[3]},n.prototype.readData=function(t){if(this.checkOffset(t),0===t)return[];var e=this.data.slice(this.zero+this.index,this.zero+this.index+t);return this.index+=t,e},e.exports=n},{"../utils":32,"./DataReader":18}],18:[function(t,e,r){"use strict";var i=t("../utils");function n(t){this.data=t,this.length=t.length,this.index=0,this.zero=0}n.prototype={checkOffset:function(t){this.checkIndex(this.index+t)},checkIndex:function(t){if(this.length<this.zero+t||t<0)throw new Error("End of data reached (data length = "+this.length+", asked index = "+t+"). Corrupted zip ?")},setIndex:function(t){this.checkIndex(t),this.index=t},skip:function(t){this.setIndex(this.index+t)},byteAt:function(t){},readInt:function(t){var e,r=0;for(this.checkOffset(t),e=this.index+t-1;e>=this.index;e--)r=(r<<8)+this.byteAt(e);return this.index+=t,r},readString:function(t){return i.transformTo("string",this.readData(t))},readData:function(t){},lastIndexOfSignature:function(t){},readAndCheckSignature:function(t){},readDate:function(){var t=this.readInt(4);return new Date(Date.UTC(1980+(t>>25&127),(t>>21&15)-1,t>>16&31,t>>11&31,t>>5&63,(31&t)<<1))}},e.exports=n},{"../utils":32}],19:[function(t,e,r){"use strict";var i=t("./Uint8ArrayReader");function n(t){i.call(this,t)}t("../utils").inherits(n,i),n.prototype.readData=function(t){this.checkOffset(t);var e=this.data.slice(this.zero+this.index,this.zero+this.index+t);return this.index+=t,e},e.exports=n},{"../utils":32,"./Uint8ArrayReader":21}],20:[function(t,e,r){"use strict";var i=t("./DataReader");function n(t){i.call(this,t)}t("../utils").inherits(n,i),n.prototype.byteAt=function(t){return this.data.charCodeAt(this.zero+t)},n.prototype.lastIndexOfSignature=function(t){return this.data.lastIndexOf(t)-this.zero},n.prototype.readAndCheckSignature=function(t){return t===this.readData(4)},n.prototype.readData=function(t){this.checkOffset(t);var e=this.data.slice(this.zero+this.index,this.zero+this.index+t);return this.index+=t,e},e.exports=n},{"../utils":32,"./DataReader":18}],21:[function(t,e,r){"use strict";var i=t("./ArrayReader");function n(t){i.call(this,t)}t("../utils").inherits(n,i),n.prototype.readData=function(t){if(this.checkOffset(t),0===t)return new Uint8Array(0);var e=this.data.subarray(this.zero+this.index,this.zero+this.index+t);return this.index+=t,e},e.exports=n},{"../utils":32,"./ArrayReader":17}],22:[function(t,e,r){"use strict";var i=t("../utils"),n=t("../support"),s=t("./ArrayReader"),a=t("./StringReader"),o=t("./NodeBufferReader"),h=t("./Uint8ArrayReader");e.exports=function(t){var e=i.getTypeOf(t);return i.checkSupport(e),"string"!==e||n.uint8array?"nodebuffer"===e?new o(t):n.uint8array?new h(i.transformTo("uint8array",t)):new s(i.transformTo("array",t)):new a(t)}},{"../support":30,"../utils":32,"./ArrayReader":17,"./NodeBufferReader":19,"./StringReader":20,"./Uint8ArrayReader":21}],23:[function(t,e,r){"use strict";r.LOCAL_FILE_HEADER="PK",r.CENTRAL_FILE_HEADER="PK",r.CENTRAL_DIRECTORY_END="PK",r.ZIP64_CENTRAL_DIRECTORY_LOCATOR="PK",r.ZIP64_CENTRAL_DIRECTORY_END="PK",r.DATA_DESCRIPTOR="PK\b"},{}],24:[function(t,e,r){"use strict";var i=t("./GenericWorker"),n=t("../utils");function s(t){i.call(this,"ConvertWorker to "+t),this.destType=t}n.inherits(s,i),s.prototype.processChunk=function(t){this.push({data:n.transformTo(this.destType,t.data),meta:t.meta})},e.exports=s},{"../utils":32,"./GenericWorker":28}],25:[function(t,e,r){"use strict";var i=t("./GenericWorker"),n=t("../crc32");function s(){i.call(this,"Crc32Probe"),this.withStreamInfo("crc32",0)}t("../utils").inherits(s,i),s.prototype.processChunk=function(t){this.streamInfo.crc32=n(t.data,this.streamInfo.crc32||0),this.push(t)},e.exports=s},{"../crc32":4,"../utils":32,"./GenericWorker":28}],26:[function(t,e,r){"use strict";var i=t("../utils"),n=t("./GenericWorker");function s(t){n.call(this,"DataLengthProbe for "+t),this.propName=t,this.withStreamInfo(t,0)}i.inherits(s,n),s.prototype.processChunk=function(t){if(t){var e=this.streamInfo[this.propName]||0;this.streamInfo[this.propName]=e+t.data.length}n.prototype.processChunk.call(this,t)},e.exports=s},{"../utils":32,"./GenericWorker":28}],27:[function(t,e,r){"use strict";var i=t("../utils"),n=t("./GenericWorker");function s(t){n.call(this,"DataWorker");var e=this;this.dataIsReady=!1,this.index=0,this.max=0,this.data=null,this.type="",this._tickScheduled=!1,t.then(function(t){e.dataIsReady=!0,e.data=t,e.max=t&&t.length||0,e.type=i.getTypeOf(t),e.isPaused||e._tickAndRepeat()},function(t){e.error(t)})}i.inherits(s,n),s.prototype.cleanUp=function(){n.prototype.cleanUp.call(this),this.data=null},s.prototype.resume=function(){return!!n.prototype.resume.call(this)&&(!this._tickScheduled&&this.dataIsReady&&(this._tickScheduled=!0,i.delay(this._tickAndRepeat,[],this)),!0)},s.prototype._tickAndRepeat=function(){this._tickScheduled=!1,this.isPaused||this.isFinished||(this._tick(),this.isFinished||(i.delay(this._tickAndRepeat,[],this),this._tickScheduled=!0))},s.prototype._tick=function(){if(this.isPaused||this.isFinished)return!1;var t=null,e=Math.min(this.max,this.index+16384);if(this.index>=this.max)return this.end();switch(this.type){case"string":t=this.data.substring(this.index,e);break;case"uint8array":t=this.data.subarray(this.index,e);break;case"array":case"nodebuffer":t=this.data.slice(this.index,e)}return this.index=e,this.push({data:t,meta:{percent:this.max?this.index/this.max*100:0}})},e.exports=s},{"../utils":32,"./GenericWorker":28}],28:[function(t,e,r){"use strict";function i(t){this.name=t||"default",this.streamInfo={},this.generatedError=null,this.extraStreamInfo={},this.isPaused=!0,this.isFinished=!1,this.isLocked=!1,this._listeners={data:[],end:[],error:[]},this.previous=null}i.prototype={push:function(t){this.emit("data",t)},end:function(){if(this.isFinished)return!1;this.flush();try{this.emit("end"),this.cleanUp(),this.isFinished=!0}catch(t){this.emit("error",t)}return!0},error:function(t){return!this.isFinished&&(this.isPaused?this.generatedError=t:(this.isFinished=!0,this.emit("error",t),this.previous&&this.previous.error(t),this.cleanUp()),!0)},on:function(t,e){return this._listeners[t].push(e),this},cleanUp:function(){this.streamInfo=this.generatedError=this.extraStreamInfo=null,this._listeners=[]},emit:function(t,e){if(this._listeners[t])for(var r=0;r<this._listeners[t].length;r++)this._listeners[t][r].call(this,e)},pipe:function(t){return t.registerPrevious(this)},registerPrevious:function(t){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.streamInfo=t.streamInfo,this.mergeStreamInfo(),this.previous=t;var e=this;return t.on("data",function(t){e.processChunk(t)}),t.on("end",function(){e.end()}),t.on("error",function(t){e.error(t)}),this},pause:function(){return!this.isPaused&&!this.isFinished&&(this.isPaused=!0,this.previous&&this.previous.pause(),!0)},resume:function(){if(!this.isPaused||this.isFinished)return!1;var t=this.isPaused=!1;return this.generatedError&&(this.error(this.generatedError),t=!0),this.previous&&this.previous.resume(),!t},flush:function(){},processChunk:function(t){this.push(t)},withStreamInfo:function(t,e){return this.extraStreamInfo[t]=e,this.mergeStreamInfo(),this},mergeStreamInfo:function(){for(var t in this.extraStreamInfo)this.extraStreamInfo.hasOwnProperty(t)&&(this.streamInfo[t]=this.extraStreamInfo[t])},lock:function(){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.isLocked=!0,this.previous&&this.previous.lock()},toString:function(){var t="Worker "+this.name;return this.previous?this.previous+" -> "+t:t}},e.exports=i},{}],29:[function(t,e,r){"use strict";var h=t("../utils"),n=t("./ConvertWorker"),s=t("./GenericWorker"),u=t("../base64"),i=t("../support"),a=t("../external"),o=null;if(i.nodestream)try{o=t("../nodejs/NodejsStreamOutputAdapter")}catch(t){}function l(t,o){return new a.Promise(function(e,r){var i=[],n=t._internalType,s=t._outputType,a=t._mimeType;t.on("data",function(t,e){i.push(t),o&&o(e)}).on("error",function(t){i=[],r(t)}).on("end",function(){try{var t=function(t,e,r){switch(t){case"blob":return h.newBlob(h.transformTo("arraybuffer",e),r);case"base64":return u.encode(e);default:return h.transformTo(t,e)}}(s,function(t,e){var r,i=0,n=null,s=0;for(r=0;r<e.length;r++)s+=e[r].length;switch(t){case"string":return e.join("");case"array":return Array.prototype.concat.apply([],e);case"uint8array":for(n=new Uint8Array(s),r=0;r<e.length;r++)n.set(e[r],i),i+=e[r].length;return n;case"nodebuffer":return Buffer.concat(e);default:throw new Error("concat : unsupported type '"+t+"'")}}(n,i),a);e(t)}catch(t){r(t)}i=[]}).resume()})}function f(t,e,r){var i=e;switch(e){case"blob":case"arraybuffer":i="uint8array";break;case"base64":i="string"}try{this._internalType=i,this._outputType=e,this._mimeType=r,h.checkSupport(i),this._worker=t.pipe(new n(i)),t.lock()}catch(t){this._worker=new s("error"),this._worker.error(t)}}f.prototype={accumulate:function(t){return l(this,t)},on:function(t,e){var r=this;return"data"===t?this._worker.on(t,function(t){e.call(r,t.data,t.meta)}):this._worker.on(t,function(){h.delay(e,arguments,r)}),this},resume:function(){return h.delay(this._worker.resume,[],this._worker),this},pause:function(){return this._worker.pause(),this},toNodejsStream:function(t){if(h.checkSupport("nodestream"),"nodebuffer"!==this._outputType)throw new Error(this._outputType+" is not supported by this method");return new o(this,{objectMode:"nodebuffer"!==this._outputType},t)}},e.exports=f},{"../base64":1,"../external":6,"../nodejs/NodejsStreamOutputAdapter":13,"../support":30,"../utils":32,"./ConvertWorker":24,"./GenericWorker":28}],30:[function(t,e,r){"use strict";if(r.base64=!0,r.array=!0,r.string=!0,r.arraybuffer="undefined"!=typeof ArrayBuffer&&"undefined"!=typeof Uint8Array,r.nodebuffer="undefined"!=typeof Buffer,r.uint8array="undefined"!=typeof Uint8Array,"undefined"==typeof ArrayBuffer)r.blob=!1;else{var i=new ArrayBuffer(0);try{r.blob=0===new Blob([i],{type:"application/zip"}).size}catch(t){try{var n=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);n.append(i),r.blob=0===n.getBlob("application/zip").size}catch(t){r.blob=!1}}}try{r.nodestream=!!t("readable-stream").Readable}catch(t){r.nodestream=!1}},{"readable-stream":16}],31:[function(t,e,s){"use strict";for(var o=t("./utils"),h=t("./support"),r=t("./nodejsUtils"),i=t("./stream/GenericWorker"),u=new Array(256),n=0;n<256;n++)u[n]=252<=n?6:248<=n?5:240<=n?4:224<=n?3:192<=n?2:1;u[254]=u[254]=1;function a(){i.call(this,"utf-8 decode"),this.leftOver=null}function l(){i.call(this,"utf-8 encode")}s.utf8encode=function(t){return h.nodebuffer?r.newBufferFrom(t,"utf-8"):function(t){var e,r,i,n,s,a=t.length,o=0;for(n=0;n<a;n++)55296==(64512&(r=t.charCodeAt(n)))&&n+1<a&&56320==(64512&(i=t.charCodeAt(n+1)))&&(r=65536+(r-55296<<10)+(i-56320),n++),o+=r<128?1:r<2048?2:r<65536?3:4;for(e=h.uint8array?new Uint8Array(o):new Array(o),n=s=0;s<o;n++)55296==(64512&(r=t.charCodeAt(n)))&&n+1<a&&56320==(64512&(i=t.charCodeAt(n+1)))&&(r=65536+(r-55296<<10)+(i-56320),n++),r<128?e[s++]=r:(r<2048?e[s++]=192|r>>>6:(r<65536?e[s++]=224|r>>>12:(e[s++]=240|r>>>18,e[s++]=128|r>>>12&63),e[s++]=128|r>>>6&63),e[s++]=128|63&r);return e}(t)},s.utf8decode=function(t){return h.nodebuffer?o.transformTo("nodebuffer",t).toString("utf-8"):function(t){var e,r,i,n,s=t.length,a=new Array(2*s);for(e=r=0;e<s;)if((i=t[e++])<128)a[r++]=i;else if(4<(n=u[i]))a[r++]=65533,e+=n-1;else{for(i&=2===n?31:3===n?15:7;1<n&&e<s;)i=i<<6|63&t[e++],n--;1<n?a[r++]=65533:i<65536?a[r++]=i:(i-=65536,a[r++]=55296|i>>10&1023,a[r++]=56320|1023&i)}return a.length!==r&&(a.subarray?a=a.subarray(0,r):a.length=r),o.applyFromCharCode(a)}(t=o.transformTo(h.uint8array?"uint8array":"array",t))},o.inherits(a,i),a.prototype.processChunk=function(t){var e=o.transformTo(h.uint8array?"uint8array":"array",t.data);if(this.leftOver&&this.leftOver.length){if(h.uint8array){var r=e;(e=new Uint8Array(r.length+this.leftOver.length)).set(this.leftOver,0),e.set(r,this.leftOver.length)}else e=this.leftOver.concat(e);this.leftOver=null}var i=function(t,e){var r;for((e=e||t.length)>t.length&&(e=t.length),r=e-1;0<=r&&128==(192&t[r]);)r--;return r<0?e:0===r?e:r+u[t[r]]>e?r:e}(e),n=e;i!==e.length&&(h.uint8array?(n=e.subarray(0,i),this.leftOver=e.subarray(i,e.length)):(n=e.slice(0,i),this.leftOver=e.slice(i,e.length))),this.push({data:s.utf8decode(n),meta:t.meta})},a.prototype.flush=function(){this.leftOver&&this.leftOver.length&&(this.push({data:s.utf8decode(this.leftOver),meta:{}}),this.leftOver=null)},s.Utf8DecodeWorker=a,o.inherits(l,i),l.prototype.processChunk=function(t){this.push({data:s.utf8encode(t.data),meta:t.meta})},s.Utf8EncodeWorker=l},{"./nodejsUtils":14,"./stream/GenericWorker":28,"./support":30,"./utils":32}],32:[function(t,e,a){"use strict";var o=t("./support"),h=t("./base64"),r=t("./nodejsUtils"),i=t("set-immediate-shim"),u=t("./external");function n(t){return t}function l(t,e){for(var r=0;r<t.length;++r)e[r]=255&t.charCodeAt(r);return e}a.newBlob=function(e,r){a.checkSupport("blob");try{return new Blob([e],{type:r})}catch(t){try{var i=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);return i.append(e),i.getBlob(r)}catch(t){throw new Error("Bug : can't construct the Blob.")}}};var s={stringifyByChunk:function(t,e,r){var i=[],n=0,s=t.length;if(s<=r)return String.fromCharCode.apply(null,t);for(;n<s;)"array"===e||"nodebuffer"===e?i.push(String.fromCharCode.apply(null,t.slice(n,Math.min(n+r,s)))):i.push(String.fromCharCode.apply(null,t.subarray(n,Math.min(n+r,s)))),n+=r;return i.join("")},stringifyByChar:function(t){for(var e="",r=0;r<t.length;r++)e+=String.fromCharCode(t[r]);return e},applyCanBeUsed:{uint8array:function(){try{return o.uint8array&&1===String.fromCharCode.apply(null,new Uint8Array(1)).length}catch(t){return!1}}(),nodebuffer:function(){try{return o.nodebuffer&&1===String.fromCharCode.apply(null,r.allocBuffer(1)).length}catch(t){return!1}}()}};function f(t){var e=65536,r=a.getTypeOf(t),i=!0;if("uint8array"===r?i=s.applyCanBeUsed.uint8array:"nodebuffer"===r&&(i=s.applyCanBeUsed.nodebuffer),i)for(;1<e;)try{return s.stringifyByChunk(t,r,e)}catch(t){e=Math.floor(e/2)}return s.stringifyByChar(t)}function d(t,e){for(var r=0;r<t.length;r++)e[r]=t[r];return e}a.applyFromCharCode=f;var c={};c.string={string:n,array:function(t){return l(t,new Array(t.length))},arraybuffer:function(t){return c.string.uint8array(t).buffer},uint8array:function(t){return l(t,new Uint8Array(t.length))},nodebuffer:function(t){return l(t,r.allocBuffer(t.length))}},c.array={string:f,array:n,arraybuffer:function(t){return new Uint8Array(t).buffer},uint8array:function(t){return new Uint8Array(t)},nodebuffer:function(t){return r.newBufferFrom(t)}},c.arraybuffer={string:function(t){return f(new Uint8Array(t))},array:function(t){return d(new Uint8Array(t),new Array(t.byteLength))},arraybuffer:n,uint8array:function(t){return new Uint8Array(t)},nodebuffer:function(t){return r.newBufferFrom(new Uint8Array(t))}},c.uint8array={string:f,array:function(t){return d(t,new Array(t.length))},arraybuffer:function(t){return t.buffer},uint8array:n,nodebuffer:function(t){return r.newBufferFrom(t)}},c.nodebuffer={string:f,array:function(t){return d(t,new Array(t.length))},arraybuffer:function(t){return c.nodebuffer.uint8array(t).buffer},uint8array:function(t){return d(t,new Uint8Array(t.length))},nodebuffer:n},a.transformTo=function(t,e){if(e=e||"",!t)return e;a.checkSupport(t);var r=a.getTypeOf(e);return c[r][t](e)},a.getTypeOf=function(t){return"string"==typeof t?"string":"[object Array]"===Object.prototype.toString.call(t)?"array":o.nodebuffer&&r.isBuffer(t)?"nodebuffer":o.uint8array&&t instanceof Uint8Array?"uint8array":o.arraybuffer&&t instanceof ArrayBuffer?"arraybuffer":void 0},a.checkSupport=function(t){if(!o[t.toLowerCase()])throw new Error(t+" is not supported by this platform")},a.MAX_VALUE_16BITS=65535,a.MAX_VALUE_32BITS=-1,a.pretty=function(t){var e,r,i="";for(r=0;r<(t||"").length;r++)i+="\\x"+((e=t.charCodeAt(r))<16?"0":"")+e.toString(16).toUpperCase();return i},a.delay=function(t,e,r){i(function(){t.apply(r||null,e||[])})},a.inherits=function(t,e){function r(){}r.prototype=e.prototype,t.prototype=new r},a.extend=function(){var t,e,r={};for(t=0;t<arguments.length;t++)for(e in arguments[t])arguments[t].hasOwnProperty(e)&&void 0===r[e]&&(r[e]=arguments[t][e]);return r},a.prepareContent=function(r,t,i,n,s){return u.Promise.resolve(t).then(function(i){return o.blob&&(i instanceof Blob||-1!==["[object File]","[object Blob]"].indexOf(Object.prototype.toString.call(i)))&&"undefined"!=typeof FileReader?new u.Promise(function(e,r){var t=new FileReader;t.onload=function(t){e(t.target.result)},t.onerror=function(t){r(t.target.error)},t.readAsArrayBuffer(i)}):i}).then(function(t){var e=a.getTypeOf(t);return e?("arraybuffer"===e?t=a.transformTo("uint8array",t):"string"===e&&(s?t=h.decode(t):i&&!0!==n&&(t=function(t){return l(t,o.uint8array?new Uint8Array(t.length):new Array(t.length))}(t))),t):u.Promise.reject(new Error("Can't read the data of '"+r+"'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"))})}},{"./base64":1,"./external":6,"./nodejsUtils":14,"./support":30,"set-immediate-shim":54}],33:[function(t,e,r){"use strict";var i=t("./reader/readerFor"),n=t("./utils"),s=t("./signature"),a=t("./zipEntry"),o=(t("./utf8"),t("./support"));function h(t){this.files=[],this.loadOptions=t}h.prototype={checkSignature:function(t){if(!this.reader.readAndCheckSignature(t)){this.reader.index-=4;var e=this.reader.readString(4);throw new Error("Corrupted zip or bug: unexpected signature ("+n.pretty(e)+", expected "+n.pretty(t)+")")}},isSignature:function(t,e){var r=this.reader.index;this.reader.setIndex(t);var i=this.reader.readString(4)===e;return this.reader.setIndex(r),i},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2);var t=this.reader.readData(this.zipCommentLength),e=o.uint8array?"uint8array":"array",r=n.transformTo(e,t);this.zipComment=this.loadOptions.decodeFileName(r)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.reader.skip(4),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var t,e,r,i=this.zip64EndOfCentralSize-44;0<i;)t=this.reader.readInt(2),e=this.reader.readInt(4),r=this.reader.readData(e),this.zip64ExtensibleData[t]={id:t,length:e,value:r}},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),1<this.disksCount)throw new Error("Multi-volumes zip are not supported")},readLocalFiles:function(){var t,e;for(t=0;t<this.files.length;t++)e=this.files[t],this.reader.setIndex(e.localHeaderOffset),this.checkSignature(s.LOCAL_FILE_HEADER),e.readLocalPart(this.reader),e.handleUTF8(),e.processAttributes()},readCentralDir:function(){var t;for(this.reader.setIndex(this.centralDirOffset);this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER);)(t=new a({zip64:this.zip64},this.loadOptions)).readCentralPart(this.reader),this.files.push(t);if(this.centralDirRecords!==this.files.length&&0!==this.centralDirRecords&&0===this.files.length)throw new Error("Corrupted zip or bug: expected "+this.centralDirRecords+" records in central dir, got "+this.files.length)},readEndOfCentral:function(){var t=this.reader.lastIndexOfSignature(s.CENTRAL_DIRECTORY_END);if(t<0)throw!this.isSignature(0,s.LOCAL_FILE_HEADER)?new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html"):new Error("Corrupted zip: can't find end of central directory");this.reader.setIndex(t);var e=t;if(this.checkSignature(s.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),this.diskNumber===n.MAX_VALUE_16BITS||this.diskWithCentralDirStart===n.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===n.MAX_VALUE_16BITS||this.centralDirRecords===n.MAX_VALUE_16BITS||this.centralDirSize===n.MAX_VALUE_32BITS||this.centralDirOffset===n.MAX_VALUE_32BITS){if(this.zip64=!0,(t=this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR))<0)throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");if(this.reader.setIndex(t),this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),!this.isSignature(this.relativeOffsetEndOfZip64CentralDir,s.ZIP64_CENTRAL_DIRECTORY_END)&&(this.relativeOffsetEndOfZip64CentralDir=this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_END),this.relativeOffsetEndOfZip64CentralDir<0))throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral()}var r=this.centralDirOffset+this.centralDirSize;this.zip64&&(r+=20,r+=12+this.zip64EndOfCentralSize);var i=e-r;if(0<i)this.isSignature(e,s.CENTRAL_FILE_HEADER)||(this.reader.zero=i);else if(i<0)throw new Error("Corrupted zip: missing "+Math.abs(i)+" bytes.")},prepareReader:function(t){this.reader=i(t)},load:function(t){this.prepareReader(t),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles()}},e.exports=h},{"./reader/readerFor":22,"./signature":23,"./support":30,"./utf8":31,"./utils":32,"./zipEntry":34}],34:[function(t,e,r){"use strict";var i=t("./reader/readerFor"),s=t("./utils"),n=t("./compressedObject"),a=t("./crc32"),o=t("./utf8"),h=t("./compressions"),u=t("./support");function l(t,e){this.options=t,this.loadOptions=e}l.prototype={isEncrypted:function(){return 1==(1&this.bitFlag)},useUTF8:function(){return 2048==(2048&this.bitFlag)},readLocalPart:function(t){var e,r;if(t.skip(22),this.fileNameLength=t.readInt(2),r=t.readInt(2),this.fileName=t.readData(this.fileNameLength),t.skip(r),-1===this.compressedSize||-1===this.uncompressedSize)throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");if(null===(e=function(t){for(var e in h)if(h.hasOwnProperty(e)&&h[e].magic===t)return h[e];return null}(this.compressionMethod)))throw new Error("Corrupted zip : compression "+s.pretty(this.compressionMethod)+" unknown (inner file : "+s.transformTo("string",this.fileName)+")");this.decompressed=new n(this.compressedSize,this.uncompressedSize,this.crc32,e,t.readData(this.compressedSize))},readCentralPart:function(t){this.versionMadeBy=t.readInt(2),t.skip(2),this.bitFlag=t.readInt(2),this.compressionMethod=t.readString(2),this.date=t.readDate(),this.crc32=t.readInt(4),this.compressedSize=t.readInt(4),this.uncompressedSize=t.readInt(4);var e=t.readInt(2);if(this.extraFieldsLength=t.readInt(2),this.fileCommentLength=t.readInt(2),this.diskNumberStart=t.readInt(2),this.internalFileAttributes=t.readInt(2),this.externalFileAttributes=t.readInt(4),this.localHeaderOffset=t.readInt(4),this.isEncrypted())throw new Error("Encrypted zip are not supported");t.skip(e),this.readExtraFields(t),this.parseZIP64ExtraField(t),this.fileComment=t.readData(this.fileCommentLength)},processAttributes:function(){this.unixPermissions=null,this.dosPermissions=null;var t=this.versionMadeBy>>8;this.dir=!!(16&this.externalFileAttributes),0==t&&(this.dosPermissions=63&this.externalFileAttributes),3==t&&(this.unixPermissions=this.externalFileAttributes>>16&65535),this.dir||"/"!==this.fileNameStr.slice(-1)||(this.dir=!0)},parseZIP64ExtraField:function(t){if(this.extraFields[1]){var e=i(this.extraFields[1].value);this.uncompressedSize===s.MAX_VALUE_32BITS&&(this.uncompressedSize=e.readInt(8)),this.compressedSize===s.MAX_VALUE_32BITS&&(this.compressedSize=e.readInt(8)),this.localHeaderOffset===s.MAX_VALUE_32BITS&&(this.localHeaderOffset=e.readInt(8)),this.diskNumberStart===s.MAX_VALUE_32BITS&&(this.diskNumberStart=e.readInt(4))}},readExtraFields:function(t){var e,r,i,n=t.index+this.extraFieldsLength;for(this.extraFields||(this.extraFields={});t.index+4<n;)e=t.readInt(2),r=t.readInt(2),i=t.readData(r),this.extraFields[e]={id:e,length:r,value:i};t.setIndex(n)},handleUTF8:function(){var t=u.uint8array?"uint8array":"array";if(this.useUTF8())this.fileNameStr=o.utf8decode(this.fileName),this.fileCommentStr=o.utf8decode(this.fileComment);else{var e=this.findExtraFieldUnicodePath();if(null!==e)this.fileNameStr=e;else{var r=s.transformTo(t,this.fileName);this.fileNameStr=this.loadOptions.decodeFileName(r)}var i=this.findExtraFieldUnicodeComment();if(null!==i)this.fileCommentStr=i;else{var n=s.transformTo(t,this.fileComment);this.fileCommentStr=this.loadOptions.decodeFileName(n)}}},findExtraFieldUnicodePath:function(){var t=this.extraFields[28789];if(t){var e=i(t.value);return 1!==e.readInt(1)?null:a(this.fileName)!==e.readInt(4)?null:o.utf8decode(e.readData(t.length-5))}return null},findExtraFieldUnicodeComment:function(){var t=this.extraFields[25461];if(t){var e=i(t.value);return 1!==e.readInt(1)?null:a(this.fileComment)!==e.readInt(4)?null:o.utf8decode(e.readData(t.length-5))}return null}},e.exports=l},{"./compressedObject":2,"./compressions":3,"./crc32":4,"./reader/readerFor":22,"./support":30,"./utf8":31,"./utils":32}],35:[function(t,e,r){"use strict";function i(t,e,r){this.name=t,this.dir=r.dir,this.date=r.date,this.comment=r.comment,this.unixPermissions=r.unixPermissions,this.dosPermissions=r.dosPermissions,this._data=e,this._dataBinary=r.binary,this.options={compression:r.compression,compressionOptions:r.compressionOptions}}var s=t("./stream/StreamHelper"),n=t("./stream/DataWorker"),a=t("./utf8"),o=t("./compressedObject"),h=t("./stream/GenericWorker");i.prototype={internalStream:function(t){var e=null,r="string";try{if(!t)throw new Error("No output type specified.");var i="string"===(r=t.toLowerCase())||"text"===r;"binarystring"!==r&&"text"!==r||(r="string"),e=this._decompressWorker();var n=!this._dataBinary;n&&!i&&(e=e.pipe(new a.Utf8EncodeWorker)),!n&&i&&(e=e.pipe(new a.Utf8DecodeWorker))}catch(t){(e=new h("error")).error(t)}return new s(e,r,"")},async:function(t,e){return this.internalStream(t).accumulate(e)},nodeStream:function(t,e){return this.internalStream(t||"nodebuffer").toNodejsStream(e)},_compressWorker:function(t,e){if(this._data instanceof o&&this._data.compression.magic===t.magic)return this._data.getCompressedWorker();var r=this._decompressWorker();return this._dataBinary||(r=r.pipe(new a.Utf8EncodeWorker)),o.createWorkerFrom(r,t,e)},_decompressWorker:function(){return this._data instanceof o?this._data.getContentWorker():this._data instanceof h?this._data:new n(this._data)}};for(var u=["asText","asBinary","asNodeBuffer","asUint8Array","asArrayBuffer"],l=function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},f=0;f<u.length;f++)i.prototype[u[f]]=l;e.exports=i},{"./compressedObject":2,"./stream/DataWorker":27,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31}],36:[function(t,l,e){(function(e){"use strict";var r,i,t=e.MutationObserver||e.WebKitMutationObserver;if(t){var n=0,s=new t(u),a=e.document.createTextNode("");s.observe(a,{characterData:!0}),r=function(){a.data=n=++n%2}}else if(e.setImmediate||void 0===e.MessageChannel)r="document"in e&&"onreadystatechange"in e.document.createElement("script")?function(){var t=e.document.createElement("script");t.onreadystatechange=function(){u(),t.onreadystatechange=null,t.parentNode.removeChild(t),t=null},e.document.documentElement.appendChild(t)}:function(){setTimeout(u,0)};else{var o=new e.MessageChannel;o.port1.onmessage=u,r=function(){o.port2.postMessage(0)}}var h=[];function u(){var t,e;i=!0;for(var r=h.length;r;){for(e=h,h=[],t=-1;++t<r;)e[t]();r=h.length}i=!1}l.exports=function(t){1!==h.push(t)||i||r()}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],37:[function(t,e,r){"use strict";var n=t("immediate");function u(){}var l={},s=["REJECTED"],a=["FULFILLED"],i=["PENDING"];function o(t){if("function"!=typeof t)throw new TypeError("resolver must be a function");this.state=i,this.queue=[],this.outcome=void 0,t!==u&&c(this,t)}function h(t,e,r){this.promise=t,"function"==typeof e&&(this.onFulfilled=e,this.callFulfilled=this.otherCallFulfilled),"function"==typeof r&&(this.onRejected=r,this.callRejected=this.otherCallRejected)}function f(e,r,i){n(function(){var t;try{t=r(i)}catch(t){return l.reject(e,t)}t===e?l.reject(e,new TypeError("Cannot resolve promise with itself")):l.resolve(e,t)})}function d(t){var e=t&&t.then;if(t&&("object"==typeof t||"function"==typeof t)&&"function"==typeof e)return function(){e.apply(t,arguments)}}function c(e,t){var r=!1;function i(t){r||(r=!0,l.reject(e,t))}function n(t){r||(r=!0,l.resolve(e,t))}var s=p(function(){t(n,i)});"error"===s.status&&i(s.value)}function p(t,e){var r={};try{r.value=t(e),r.status="success"}catch(t){r.status="error",r.value=t}return r}(e.exports=o).prototype.finally=function(e){if("function"!=typeof e)return this;var r=this.constructor;return this.then(function(t){return r.resolve(e()).then(function(){return t})},function(t){return r.resolve(e()).then(function(){throw t})})},o.prototype.catch=function(t){return this.then(null,t)},o.prototype.then=function(t,e){if("function"!=typeof t&&this.state===a||"function"!=typeof e&&this.state===s)return this;var r=new this.constructor(u);this.state!==i?f(r,this.state===a?t:e,this.outcome):this.queue.push(new h(r,t,e));return r},h.prototype.callFulfilled=function(t){l.resolve(this.promise,t)},h.prototype.otherCallFulfilled=function(t){f(this.promise,this.onFulfilled,t)},h.prototype.callRejected=function(t){l.reject(this.promise,t)},h.prototype.otherCallRejected=function(t){f(this.promise,this.onRejected,t)},l.resolve=function(t,e){var r=p(d,e);if("error"===r.status)return l.reject(t,r.value);var i=r.value;if(i)c(t,i);else{t.state=a,t.outcome=e;for(var n=-1,s=t.queue.length;++n<s;)t.queue[n].callFulfilled(e)}return t},l.reject=function(t,e){t.state=s,t.outcome=e;for(var r=-1,i=t.queue.length;++r<i;)t.queue[r].callRejected(e);return t},o.resolve=function(t){if(t instanceof this)return t;return l.resolve(new this(u),t)},o.reject=function(t){var e=new this(u);return l.reject(e,t)},o.all=function(t){var r=this;if("[object Array]"!==Object.prototype.toString.call(t))return this.reject(new TypeError("must be an array"));var i=t.length,n=!1;if(!i)return this.resolve([]);var s=new Array(i),a=0,e=-1,o=new this(u);for(;++e<i;)h(t[e],e);return o;function h(t,e){r.resolve(t).then(function(t){s[e]=t,++a!==i||n||(n=!0,l.resolve(o,s))},function(t){n||(n=!0,l.reject(o,t))})}},o.race=function(t){var e=this;if("[object Array]"!==Object.prototype.toString.call(t))return this.reject(new TypeError("must be an array"));var r=t.length,i=!1;if(!r)return this.resolve([]);var n=-1,s=new this(u);for(;++n<r;)a=t[n],e.resolve(a).then(function(t){i||(i=!0,l.resolve(s,t))},function(t){i||(i=!0,l.reject(s,t))});var a;return s}},{immediate:36}],38:[function(t,e,r){"use strict";var i={};(0,t("./lib/utils/common").assign)(i,t("./lib/deflate"),t("./lib/inflate"),t("./lib/zlib/constants")),e.exports=i},{"./lib/deflate":39,"./lib/inflate":40,"./lib/utils/common":41,"./lib/zlib/constants":44}],39:[function(t,e,r){"use strict";var a=t("./zlib/deflate"),o=t("./utils/common"),h=t("./utils/strings"),n=t("./zlib/messages"),s=t("./zlib/zstream"),u=Object.prototype.toString,l=0,f=-1,d=0,c=8;function p(t){if(!(this instanceof p))return new p(t);this.options=o.assign({level:f,method:c,chunkSize:16384,windowBits:15,memLevel:8,strategy:d,to:""},t||{});var e=this.options;e.raw&&0<e.windowBits?e.windowBits=-e.windowBits:e.gzip&&0<e.windowBits&&e.windowBits<16&&(e.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new s,this.strm.avail_out=0;var r=a.deflateInit2(this.strm,e.level,e.method,e.windowBits,e.memLevel,e.strategy);if(r!==l)throw new Error(n[r]);if(e.header&&a.deflateSetHeader(this.strm,e.header),e.dictionary){var i;if(i="string"==typeof e.dictionary?h.string2buf(e.dictionary):"[object ArrayBuffer]"===u.call(e.dictionary)?new Uint8Array(e.dictionary):e.dictionary,(r=a.deflateSetDictionary(this.strm,i))!==l)throw new Error(n[r]);this._dict_set=!0}}function i(t,e){var r=new p(e);if(r.push(t,!0),r.err)throw r.msg||n[r.err];return r.result}p.prototype.push=function(t,e){var r,i,n=this.strm,s=this.options.chunkSize;if(this.ended)return!1;i=e===~~e?e:!0===e?4:0,"string"==typeof t?n.input=h.string2buf(t):"[object ArrayBuffer]"===u.call(t)?n.input=new Uint8Array(t):n.input=t,n.next_in=0,n.avail_in=n.input.length;do{if(0===n.avail_out&&(n.output=new o.Buf8(s),n.next_out=0,n.avail_out=s),1!==(r=a.deflate(n,i))&&r!==l)return this.onEnd(r),!(this.ended=!0);0!==n.avail_out&&(0!==n.avail_in||4!==i&&2!==i)||("string"===this.options.to?this.onData(h.buf2binstring(o.shrinkBuf(n.output,n.next_out))):this.onData(o.shrinkBuf(n.output,n.next_out)))}while((0<n.avail_in||0===n.avail_out)&&1!==r);return 4===i?(r=a.deflateEnd(this.strm),this.onEnd(r),this.ended=!0,r===l):2!==i||(this.onEnd(l),!(n.avail_out=0))},p.prototype.onData=function(t){this.chunks.push(t)},p.prototype.onEnd=function(t){t===l&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=o.flattenChunks(this.chunks)),this.chunks=[],this.err=t,this.msg=this.strm.msg},r.Deflate=p,r.deflate=i,r.deflateRaw=function(t,e){return(e=e||{}).raw=!0,i(t,e)},r.gzip=function(t,e){return(e=e||{}).gzip=!0,i(t,e)}},{"./utils/common":41,"./utils/strings":42,"./zlib/deflate":46,"./zlib/messages":51,"./zlib/zstream":53}],40:[function(t,e,r){"use strict";var d=t("./zlib/inflate"),c=t("./utils/common"),p=t("./utils/strings"),m=t("./zlib/constants"),i=t("./zlib/messages"),n=t("./zlib/zstream"),s=t("./zlib/gzheader"),_=Object.prototype.toString;function a(t){if(!(this instanceof a))return new a(t);this.options=c.assign({chunkSize:16384,windowBits:0,to:""},t||{});var e=this.options;e.raw&&0<=e.windowBits&&e.windowBits<16&&(e.windowBits=-e.windowBits,0===e.windowBits&&(e.windowBits=-15)),!(0<=e.windowBits&&e.windowBits<16)||t&&t.windowBits||(e.windowBits+=32),15<e.windowBits&&e.windowBits<48&&0==(15&e.windowBits)&&(e.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new n,this.strm.avail_out=0;var r=d.inflateInit2(this.strm,e.windowBits);if(r!==m.Z_OK)throw new Error(i[r]);this.header=new s,d.inflateGetHeader(this.strm,this.header)}function o(t,e){var r=new a(e);if(r.push(t,!0),r.err)throw r.msg||i[r.err];return r.result}a.prototype.push=function(t,e){var r,i,n,s,a,o,h=this.strm,u=this.options.chunkSize,l=this.options.dictionary,f=!1;if(this.ended)return!1;i=e===~~e?e:!0===e?m.Z_FINISH:m.Z_NO_FLUSH,"string"==typeof t?h.input=p.binstring2buf(t):"[object ArrayBuffer]"===_.call(t)?h.input=new Uint8Array(t):h.input=t,h.next_in=0,h.avail_in=h.input.length;do{if(0===h.avail_out&&(h.output=new c.Buf8(u),h.next_out=0,h.avail_out=u),(r=d.inflate(h,m.Z_NO_FLUSH))===m.Z_NEED_DICT&&l&&(o="string"==typeof l?p.string2buf(l):"[object ArrayBuffer]"===_.call(l)?new Uint8Array(l):l,r=d.inflateSetDictionary(this.strm,o)),r===m.Z_BUF_ERROR&&!0===f&&(r=m.Z_OK,f=!1),r!==m.Z_STREAM_END&&r!==m.Z_OK)return this.onEnd(r),!(this.ended=!0);h.next_out&&(0!==h.avail_out&&r!==m.Z_STREAM_END&&(0!==h.avail_in||i!==m.Z_FINISH&&i!==m.Z_SYNC_FLUSH)||("string"===this.options.to?(n=p.utf8border(h.output,h.next_out),s=h.next_out-n,a=p.buf2string(h.output,n),h.next_out=s,h.avail_out=u-s,s&&c.arraySet(h.output,h.output,n,s,0),this.onData(a)):this.onData(c.shrinkBuf(h.output,h.next_out)))),0===h.avail_in&&0===h.avail_out&&(f=!0)}while((0<h.avail_in||0===h.avail_out)&&r!==m.Z_STREAM_END);return r===m.Z_STREAM_END&&(i=m.Z_FINISH),i===m.Z_FINISH?(r=d.inflateEnd(this.strm),this.onEnd(r),this.ended=!0,r===m.Z_OK):i!==m.Z_SYNC_FLUSH||(this.onEnd(m.Z_OK),!(h.avail_out=0))},a.prototype.onData=function(t){this.chunks.push(t)},a.prototype.onEnd=function(t){t===m.Z_OK&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=c.flattenChunks(this.chunks)),this.chunks=[],this.err=t,this.msg=this.strm.msg},r.Inflate=a,r.inflate=o,r.inflateRaw=function(t,e){return(e=e||{}).raw=!0,o(t,e)},r.ungzip=o},{"./utils/common":41,"./utils/strings":42,"./zlib/constants":44,"./zlib/gzheader":47,"./zlib/inflate":49,"./zlib/messages":51,"./zlib/zstream":53}],41:[function(t,e,r){"use strict";var i="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;r.assign=function(t){for(var e=Array.prototype.slice.call(arguments,1);e.length;){var r=e.shift();if(r){if("object"!=typeof r)throw new TypeError(r+"must be non-object");for(var i in r)r.hasOwnProperty(i)&&(t[i]=r[i])}}return t},r.shrinkBuf=function(t,e){return t.length===e?t:t.subarray?t.subarray(0,e):(t.length=e,t)};var n={arraySet:function(t,e,r,i,n){if(e.subarray&&t.subarray)t.set(e.subarray(r,r+i),n);else for(var s=0;s<i;s++)t[n+s]=e[r+s]},flattenChunks:function(t){var e,r,i,n,s,a;for(e=i=0,r=t.length;e<r;e++)i+=t[e].length;for(a=new Uint8Array(i),e=n=0,r=t.length;e<r;e++)s=t[e],a.set(s,n),n+=s.length;return a}},s={arraySet:function(t,e,r,i,n){for(var s=0;s<i;s++)t[n+s]=e[r+s]},flattenChunks:function(t){return[].concat.apply([],t)}};r.setTyped=function(t){t?(r.Buf8=Uint8Array,r.Buf16=Uint16Array,r.Buf32=Int32Array,r.assign(r,n)):(r.Buf8=Array,r.Buf16=Array,r.Buf32=Array,r.assign(r,s))},r.setTyped(i)},{}],42:[function(t,e,r){"use strict";var h=t("./common"),n=!0,s=!0;try{String.fromCharCode.apply(null,[0])}catch(t){n=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch(t){s=!1}for(var u=new h.Buf8(256),i=0;i<256;i++)u[i]=252<=i?6:248<=i?5:240<=i?4:224<=i?3:192<=i?2:1;function l(t,e){if(e<65537&&(t.subarray&&s||!t.subarray&&n))return String.fromCharCode.apply(null,h.shrinkBuf(t,e));for(var r="",i=0;i<e;i++)r+=String.fromCharCode(t[i]);return r}u[254]=u[254]=1,r.string2buf=function(t){var e,r,i,n,s,a=t.length,o=0;for(n=0;n<a;n++)55296==(64512&(r=t.charCodeAt(n)))&&n+1<a&&56320==(64512&(i=t.charCodeAt(n+1)))&&(r=65536+(r-55296<<10)+(i-56320),n++),o+=r<128?1:r<2048?2:r<65536?3:4;for(e=new h.Buf8(o),n=s=0;s<o;n++)55296==(64512&(r=t.charCodeAt(n)))&&n+1<a&&56320==(64512&(i=t.charCodeAt(n+1)))&&(r=65536+(r-55296<<10)+(i-56320),n++),r<128?e[s++]=r:(r<2048?e[s++]=192|r>>>6:(r<65536?e[s++]=224|r>>>12:(e[s++]=240|r>>>18,e[s++]=128|r>>>12&63),e[s++]=128|r>>>6&63),e[s++]=128|63&r);return e},r.buf2binstring=function(t){return l(t,t.length)},r.binstring2buf=function(t){for(var e=new h.Buf8(t.length),r=0,i=e.length;r<i;r++)e[r]=t.charCodeAt(r);return e},r.buf2string=function(t,e){var r,i,n,s,a=e||t.length,o=new Array(2*a);for(r=i=0;r<a;)if((n=t[r++])<128)o[i++]=n;else if(4<(s=u[n]))o[i++]=65533,r+=s-1;else{for(n&=2===s?31:3===s?15:7;1<s&&r<a;)n=n<<6|63&t[r++],s--;1<s?o[i++]=65533:n<65536?o[i++]=n:(n-=65536,o[i++]=55296|n>>10&1023,o[i++]=56320|1023&n)}return l(o,i)},r.utf8border=function(t,e){var r;for((e=e||t.length)>t.length&&(e=t.length),r=e-1;0<=r&&128==(192&t[r]);)r--;return r<0?e:0===r?e:r+u[t[r]]>e?r:e}},{"./common":41}],43:[function(t,e,r){"use strict";e.exports=function(t,e,r,i){for(var n=65535&t|0,s=t>>>16&65535|0,a=0;0!==r;){for(r-=a=2e3<r?2e3:r;s=s+(n=n+e[i++]|0)|0,--a;);n%=65521,s%=65521}return n|s<<16|0}},{}],44:[function(t,e,r){"use strict";e.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],45:[function(t,e,r){"use strict";var o=function(){for(var t,e=[],r=0;r<256;r++){t=r;for(var i=0;i<8;i++)t=1&t?3988292384^t>>>1:t>>>1;e[r]=t}return e}();e.exports=function(t,e,r,i){var n=o,s=i+r;t^=-1;for(var a=i;a<s;a++)t=t>>>8^n[255&(t^e[a])];return-1^t}},{}],46:[function(t,e,r){"use strict";var h,d=t("../utils/common"),u=t("./trees"),c=t("./adler32"),p=t("./crc32"),i=t("./messages"),l=0,f=4,m=0,_=-2,g=-1,b=4,n=2,v=8,y=9,s=286,a=30,o=19,w=2*s+1,k=15,x=3,S=258,z=S+x+1,C=42,E=113,A=1,I=2,O=3,B=4;function R(t,e){return t.msg=i[e],e}function T(t){return(t<<1)-(4<t?9:0)}function D(t){for(var e=t.length;0<=--e;)t[e]=0}function F(t){var e=t.state,r=e.pending;r>t.avail_out&&(r=t.avail_out),0!==r&&(d.arraySet(t.output,e.pending_buf,e.pending_out,r,t.next_out),t.next_out+=r,e.pending_out+=r,t.total_out+=r,t.avail_out-=r,e.pending-=r,0===e.pending&&(e.pending_out=0))}function N(t,e){u._tr_flush_block(t,0<=t.block_start?t.block_start:-1,t.strstart-t.block_start,e),t.block_start=t.strstart,F(t.strm)}function U(t,e){t.pending_buf[t.pending++]=e}function P(t,e){t.pending_buf[t.pending++]=e>>>8&255,t.pending_buf[t.pending++]=255&e}function L(t,e){var r,i,n=t.max_chain_length,s=t.strstart,a=t.prev_length,o=t.nice_match,h=t.strstart>t.w_size-z?t.strstart-(t.w_size-z):0,u=t.window,l=t.w_mask,f=t.prev,d=t.strstart+S,c=u[s+a-1],p=u[s+a];t.prev_length>=t.good_match&&(n>>=2),o>t.lookahead&&(o=t.lookahead);do{if(u[(r=e)+a]===p&&u[r+a-1]===c&&u[r]===u[s]&&u[++r]===u[s+1]){s+=2,r++;do{}while(u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&s<d);if(i=S-(d-s),s=d-S,a<i){if(t.match_start=e,o<=(a=i))break;c=u[s+a-1],p=u[s+a]}}}while((e=f[e&l])>h&&0!=--n);return a<=t.lookahead?a:t.lookahead}function j(t){var e,r,i,n,s,a,o,h,u,l,f=t.w_size;do{if(n=t.window_size-t.lookahead-t.strstart,t.strstart>=f+(f-z)){for(d.arraySet(t.window,t.window,f,f,0),t.match_start-=f,t.strstart-=f,t.block_start-=f,e=r=t.hash_size;i=t.head[--e],t.head[e]=f<=i?i-f:0,--r;);for(e=r=f;i=t.prev[--e],t.prev[e]=f<=i?i-f:0,--r;);n+=f}if(0===t.strm.avail_in)break;if(a=t.strm,o=t.window,h=t.strstart+t.lookahead,u=n,l=void 0,l=a.avail_in,u<l&&(l=u),r=0===l?0:(a.avail_in-=l,d.arraySet(o,a.input,a.next_in,l,h),1===a.state.wrap?a.adler=c(a.adler,o,l,h):2===a.state.wrap&&(a.adler=p(a.adler,o,l,h)),a.next_in+=l,a.total_in+=l,l),t.lookahead+=r,t.lookahead+t.insert>=x)for(s=t.strstart-t.insert,t.ins_h=t.window[s],t.ins_h=(t.ins_h<<t.hash_shift^t.window[s+1])&t.hash_mask;t.insert&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[s+x-1])&t.hash_mask,t.prev[s&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=s,s++,t.insert--,!(t.lookahead+t.insert<x)););}while(t.lookahead<z&&0!==t.strm.avail_in)}function Z(t,e){for(var r,i;;){if(t.lookahead<z){if(j(t),t.lookahead<z&&e===l)return A;if(0===t.lookahead)break}if(r=0,t.lookahead>=x&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+x-1])&t.hash_mask,r=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),0!==r&&t.strstart-r<=t.w_size-z&&(t.match_length=L(t,r)),t.match_length>=x)if(i=u._tr_tally(t,t.strstart-t.match_start,t.match_length-x),t.lookahead-=t.match_length,t.match_length<=t.max_lazy_match&&t.lookahead>=x){for(t.match_length--;t.strstart++,t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+x-1])&t.hash_mask,r=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart,0!=--t.match_length;);t.strstart++}else t.strstart+=t.match_length,t.match_length=0,t.ins_h=t.window[t.strstart],t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+1])&t.hash_mask;else i=u._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++;if(i&&(N(t,!1),0===t.strm.avail_out))return A}return t.insert=t.strstart<x-1?t.strstart:x-1,e===f?(N(t,!0),0===t.strm.avail_out?O:B):t.last_lit&&(N(t,!1),0===t.strm.avail_out)?A:I}function W(t,e){for(var r,i,n;;){if(t.lookahead<z){if(j(t),t.lookahead<z&&e===l)return A;if(0===t.lookahead)break}if(r=0,t.lookahead>=x&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+x-1])&t.hash_mask,r=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),t.prev_length=t.match_length,t.prev_match=t.match_start,t.match_length=x-1,0!==r&&t.prev_length<t.max_lazy_match&&t.strstart-r<=t.w_size-z&&(t.match_length=L(t,r),t.match_length<=5&&(1===t.strategy||t.match_length===x&&4096<t.strstart-t.match_start)&&(t.match_length=x-1)),t.prev_length>=x&&t.match_length<=t.prev_length){for(n=t.strstart+t.lookahead-x,i=u._tr_tally(t,t.strstart-1-t.prev_match,t.prev_length-x),t.lookahead-=t.prev_length-1,t.prev_length-=2;++t.strstart<=n&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+x-1])&t.hash_mask,r=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),0!=--t.prev_length;);if(t.match_available=0,t.match_length=x-1,t.strstart++,i&&(N(t,!1),0===t.strm.avail_out))return A}else if(t.match_available){if((i=u._tr_tally(t,0,t.window[t.strstart-1]))&&N(t,!1),t.strstart++,t.lookahead--,0===t.strm.avail_out)return A}else t.match_available=1,t.strstart++,t.lookahead--}return t.match_available&&(i=u._tr_tally(t,0,t.window[t.strstart-1]),t.match_available=0),t.insert=t.strstart<x-1?t.strstart:x-1,e===f?(N(t,!0),0===t.strm.avail_out?O:B):t.last_lit&&(N(t,!1),0===t.strm.avail_out)?A:I}function M(t,e,r,i,n){this.good_length=t,this.max_lazy=e,this.nice_length=r,this.max_chain=i,this.func=n}function H(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=v,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new d.Buf16(2*w),this.dyn_dtree=new d.Buf16(2*(2*a+1)),this.bl_tree=new d.Buf16(2*(2*o+1)),D(this.dyn_ltree),D(this.dyn_dtree),D(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new d.Buf16(k+1),this.heap=new d.Buf16(2*s+1),D(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new d.Buf16(2*s+1),D(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function G(t){var e;return t&&t.state?(t.total_in=t.total_out=0,t.data_type=n,(e=t.state).pending=0,e.pending_out=0,e.wrap<0&&(e.wrap=-e.wrap),e.status=e.wrap?C:E,t.adler=2===e.wrap?0:1,e.last_flush=l,u._tr_init(e),m):R(t,_)}function K(t){var e=G(t);return e===m&&function(t){t.window_size=2*t.w_size,D(t.head),t.max_lazy_match=h[t.level].max_lazy,t.good_match=h[t.level].good_length,t.nice_match=h[t.level].nice_length,t.max_chain_length=h[t.level].max_chain,t.strstart=0,t.block_start=0,t.lookahead=0,t.insert=0,t.match_length=t.prev_length=x-1,t.match_available=0,t.ins_h=0}(t.state),e}function Y(t,e,r,i,n,s){if(!t)return _;var a=1;if(e===g&&(e=6),i<0?(a=0,i=-i):15<i&&(a=2,i-=16),n<1||y<n||r!==v||i<8||15<i||e<0||9<e||s<0||b<s)return R(t,_);8===i&&(i=9);var o=new H;return(t.state=o).strm=t,o.wrap=a,o.gzhead=null,o.w_bits=i,o.w_size=1<<o.w_bits,o.w_mask=o.w_size-1,o.hash_bits=n+7,o.hash_size=1<<o.hash_bits,o.hash_mask=o.hash_size-1,o.hash_shift=~~((o.hash_bits+x-1)/x),o.window=new d.Buf8(2*o.w_size),o.head=new d.Buf16(o.hash_size),o.prev=new d.Buf16(o.w_size),o.lit_bufsize=1<<n+6,o.pending_buf_size=4*o.lit_bufsize,o.pending_buf=new d.Buf8(o.pending_buf_size),o.d_buf=1*o.lit_bufsize,o.l_buf=3*o.lit_bufsize,o.level=e,o.strategy=s,o.method=r,K(t)}h=[new M(0,0,0,0,function(t,e){var r=65535;for(r>t.pending_buf_size-5&&(r=t.pending_buf_size-5);;){if(t.lookahead<=1){if(j(t),0===t.lookahead&&e===l)return A;if(0===t.lookahead)break}t.strstart+=t.lookahead,t.lookahead=0;var i=t.block_start+r;if((0===t.strstart||t.strstart>=i)&&(t.lookahead=t.strstart-i,t.strstart=i,N(t,!1),0===t.strm.avail_out))return A;if(t.strstart-t.block_start>=t.w_size-z&&(N(t,!1),0===t.strm.avail_out))return A}return t.insert=0,e===f?(N(t,!0),0===t.strm.avail_out?O:B):(t.strstart>t.block_start&&(N(t,!1),t.strm.avail_out),A)}),new M(4,4,8,4,Z),new M(4,5,16,8,Z),new M(4,6,32,32,Z),new M(4,4,16,16,W),new M(8,16,32,32,W),new M(8,16,128,128,W),new M(8,32,128,256,W),new M(32,128,258,1024,W),new M(32,258,258,4096,W)],r.deflateInit=function(t,e){return Y(t,e,v,15,8,0)},r.deflateInit2=Y,r.deflateReset=K,r.deflateResetKeep=G,r.deflateSetHeader=function(t,e){return t&&t.state?2!==t.state.wrap?_:(t.state.gzhead=e,m):_},r.deflate=function(t,e){var r,i,n,s;if(!t||!t.state||5<e||e<0)return t?R(t,_):_;if(i=t.state,!t.output||!t.input&&0!==t.avail_in||666===i.status&&e!==f)return R(t,0===t.avail_out?-5:_);if(i.strm=t,r=i.last_flush,i.last_flush=e,i.status===C)if(2===i.wrap)t.adler=0,U(i,31),U(i,139),U(i,8),i.gzhead?(U(i,(i.gzhead.text?1:0)+(i.gzhead.hcrc?2:0)+(i.gzhead.extra?4:0)+(i.gzhead.name?8:0)+(i.gzhead.comment?16:0)),U(i,255&i.gzhead.time),U(i,i.gzhead.time>>8&255),U(i,i.gzhead.time>>16&255),U(i,i.gzhead.time>>24&255),U(i,9===i.level?2:2<=i.strategy||i.level<2?4:0),U(i,255&i.gzhead.os),i.gzhead.extra&&i.gzhead.extra.length&&(U(i,255&i.gzhead.extra.length),U(i,i.gzhead.extra.length>>8&255)),i.gzhead.hcrc&&(t.adler=p(t.adler,i.pending_buf,i.pending,0)),i.gzindex=0,i.status=69):(U(i,0),U(i,0),U(i,0),U(i,0),U(i,0),U(i,9===i.level?2:2<=i.strategy||i.level<2?4:0),U(i,3),i.status=E);else{var a=v+(i.w_bits-8<<4)<<8;a|=(2<=i.strategy||i.level<2?0:i.level<6?1:6===i.level?2:3)<<6,0!==i.strstart&&(a|=32),a+=31-a%31,i.status=E,P(i,a),0!==i.strstart&&(P(i,t.adler>>>16),P(i,65535&t.adler)),t.adler=1}if(69===i.status)if(i.gzhead.extra){for(n=i.pending;i.gzindex<(65535&i.gzhead.extra.length)&&(i.pending!==i.pending_buf_size||(i.gzhead.hcrc&&i.pending>n&&(t.adler=p(t.adler,i.pending_buf,i.pending-n,n)),F(t),n=i.pending,i.pending!==i.pending_buf_size));)U(i,255&i.gzhead.extra[i.gzindex]),i.gzindex++;i.gzhead.hcrc&&i.pending>n&&(t.adler=p(t.adler,i.pending_buf,i.pending-n,n)),i.gzindex===i.gzhead.extra.length&&(i.gzindex=0,i.status=73)}else i.status=73;if(73===i.status)if(i.gzhead.name){n=i.pending;do{if(i.pending===i.pending_buf_size&&(i.gzhead.hcrc&&i.pending>n&&(t.adler=p(t.adler,i.pending_buf,i.pending-n,n)),F(t),n=i.pending,i.pending===i.pending_buf_size)){s=1;break}s=i.gzindex<i.gzhead.name.length?255&i.gzhead.name.charCodeAt(i.gzindex++):0,U(i,s)}while(0!==s);i.gzhead.hcrc&&i.pending>n&&(t.adler=p(t.adler,i.pending_buf,i.pending-n,n)),0===s&&(i.gzindex=0,i.status=91)}else i.status=91;if(91===i.status)if(i.gzhead.comment){n=i.pending;do{if(i.pending===i.pending_buf_size&&(i.gzhead.hcrc&&i.pending>n&&(t.adler=p(t.adler,i.pending_buf,i.pending-n,n)),F(t),n=i.pending,i.pending===i.pending_buf_size)){s=1;break}s=i.gzindex<i.gzhead.comment.length?255&i.gzhead.comment.charCodeAt(i.gzindex++):0,U(i,s)}while(0!==s);i.gzhead.hcrc&&i.pending>n&&(t.adler=p(t.adler,i.pending_buf,i.pending-n,n)),0===s&&(i.status=103)}else i.status=103;if(103===i.status&&(i.gzhead.hcrc?(i.pending+2>i.pending_buf_size&&F(t),i.pending+2<=i.pending_buf_size&&(U(i,255&t.adler),U(i,t.adler>>8&255),t.adler=0,i.status=E)):i.status=E),0!==i.pending){if(F(t),0===t.avail_out)return i.last_flush=-1,m}else if(0===t.avail_in&&T(e)<=T(r)&&e!==f)return R(t,-5);if(666===i.status&&0!==t.avail_in)return R(t,-5);if(0!==t.avail_in||0!==i.lookahead||e!==l&&666!==i.status){var o=2===i.strategy?function(t,e){for(var r;;){if(0===t.lookahead&&(j(t),0===t.lookahead)){if(e===l)return A;break}if(t.match_length=0,r=u._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++,r&&(N(t,!1),0===t.strm.avail_out))return A}return t.insert=0,e===f?(N(t,!0),0===t.strm.avail_out?O:B):t.last_lit&&(N(t,!1),0===t.strm.avail_out)?A:I}(i,e):3===i.strategy?function(t,e){for(var r,i,n,s,a=t.window;;){if(t.lookahead<=S){if(j(t),t.lookahead<=S&&e===l)return A;if(0===t.lookahead)break}if(t.match_length=0,t.lookahead>=x&&0<t.strstart&&(i=a[n=t.strstart-1])===a[++n]&&i===a[++n]&&i===a[++n]){s=t.strstart+S;do{}while(i===a[++n]&&i===a[++n]&&i===a[++n]&&i===a[++n]&&i===a[++n]&&i===a[++n]&&i===a[++n]&&i===a[++n]&&n<s);t.match_length=S-(s-n),t.match_length>t.lookahead&&(t.match_length=t.lookahead)}if(t.match_length>=x?(r=u._tr_tally(t,1,t.match_length-x),t.lookahead-=t.match_length,t.strstart+=t.match_length,t.match_length=0):(r=u._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++),r&&(N(t,!1),0===t.strm.avail_out))return A}return t.insert=0,e===f?(N(t,!0),0===t.strm.avail_out?O:B):t.last_lit&&(N(t,!1),0===t.strm.avail_out)?A:I}(i,e):h[i.level].func(i,e);if(o!==O&&o!==B||(i.status=666),o===A||o===O)return 0===t.avail_out&&(i.last_flush=-1),m;if(o===I&&(1===e?u._tr_align(i):5!==e&&(u._tr_stored_block(i,0,0,!1),3===e&&(D(i.head),0===i.lookahead&&(i.strstart=0,i.block_start=0,i.insert=0))),F(t),0===t.avail_out))return i.last_flush=-1,m}return e!==f?m:i.wrap<=0?1:(2===i.wrap?(U(i,255&t.adler),U(i,t.adler>>8&255),U(i,t.adler>>16&255),U(i,t.adler>>24&255),U(i,255&t.total_in),U(i,t.total_in>>8&255),U(i,t.total_in>>16&255),U(i,t.total_in>>24&255)):(P(i,t.adler>>>16),P(i,65535&t.adler)),F(t),0<i.wrap&&(i.wrap=-i.wrap),0!==i.pending?m:1)},r.deflateEnd=function(t){var e;return t&&t.state?(e=t.state.status)!==C&&69!==e&&73!==e&&91!==e&&103!==e&&e!==E&&666!==e?R(t,_):(t.state=null,e===E?R(t,-3):m):_},r.deflateSetDictionary=function(t,e){var r,i,n,s,a,o,h,u,l=e.length;if(!t||!t.state)return _;if(2===(s=(r=t.state).wrap)||1===s&&r.status!==C||r.lookahead)return _;for(1===s&&(t.adler=c(t.adler,e,l,0)),r.wrap=0,l>=r.w_size&&(0===s&&(D(r.head),r.strstart=0,r.block_start=0,r.insert=0),u=new d.Buf8(r.w_size),d.arraySet(u,e,l-r.w_size,r.w_size,0),e=u,l=r.w_size),a=t.avail_in,o=t.next_in,h=t.input,t.avail_in=l,t.next_in=0,t.input=e,j(r);r.lookahead>=x;){for(i=r.strstart,n=r.lookahead-(x-1);r.ins_h=(r.ins_h<<r.hash_shift^r.window[i+x-1])&r.hash_mask,r.prev[i&r.w_mask]=r.head[r.ins_h],r.head[r.ins_h]=i,i++,--n;);r.strstart=i,r.lookahead=x-1,j(r)}return r.strstart+=r.lookahead,r.block_start=r.strstart,r.insert=r.lookahead,r.lookahead=0,r.match_length=r.prev_length=x-1,r.match_available=0,t.next_in=o,t.input=h,t.avail_in=a,r.wrap=s,m},r.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./messages":51,"./trees":52}],47:[function(t,e,r){"use strict";e.exports=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}},{}],48:[function(t,e,r){"use strict";e.exports=function(t,e){var r,i,n,s,a,o,h,u,l,f,d,c,p,m,_,g,b,v,y,w,k,x,S,z,C;r=t.state,i=t.next_in,z=t.input,n=i+(t.avail_in-5),s=t.next_out,C=t.output,a=s-(e-t.avail_out),o=s+(t.avail_out-257),h=r.dmax,u=r.wsize,l=r.whave,f=r.wnext,d=r.window,c=r.hold,p=r.bits,m=r.lencode,_=r.distcode,g=(1<<r.lenbits)-1,b=(1<<r.distbits)-1;t:do{p<15&&(c+=z[i++]<<p,p+=8,c+=z[i++]<<p,p+=8),v=m[c&g];e:for(;;){if(c>>>=y=v>>>24,p-=y,0===(y=v>>>16&255))C[s++]=65535&v;else{if(!(16&y)){if(0==(64&y)){v=m[(65535&v)+(c&(1<<y)-1)];continue e}if(32&y){r.mode=12;break t}t.msg="invalid literal/length code",r.mode=30;break t}w=65535&v,(y&=15)&&(p<y&&(c+=z[i++]<<p,p+=8),w+=c&(1<<y)-1,c>>>=y,p-=y),p<15&&(c+=z[i++]<<p,p+=8,c+=z[i++]<<p,p+=8),v=_[c&b];r:for(;;){if(c>>>=y=v>>>24,p-=y,!(16&(y=v>>>16&255))){if(0==(64&y)){v=_[(65535&v)+(c&(1<<y)-1)];continue r}t.msg="invalid distance code",r.mode=30;break t}if(k=65535&v,p<(y&=15)&&(c+=z[i++]<<p,(p+=8)<y&&(c+=z[i++]<<p,p+=8)),h<(k+=c&(1<<y)-1)){t.msg="invalid distance too far back",r.mode=30;break t}if(c>>>=y,p-=y,(y=s-a)<k){if(l<(y=k-y)&&r.sane){t.msg="invalid distance too far back",r.mode=30;break t}if(S=d,(x=0)===f){if(x+=u-y,y<w){for(w-=y;C[s++]=d[x++],--y;);x=s-k,S=C}}else if(f<y){if(x+=u+f-y,(y-=f)<w){for(w-=y;C[s++]=d[x++],--y;);if(x=0,f<w){for(w-=y=f;C[s++]=d[x++],--y;);x=s-k,S=C}}}else if(x+=f-y,y<w){for(w-=y;C[s++]=d[x++],--y;);x=s-k,S=C}for(;2<w;)C[s++]=S[x++],C[s++]=S[x++],C[s++]=S[x++],w-=3;w&&(C[s++]=S[x++],1<w&&(C[s++]=S[x++]))}else{for(x=s-k;C[s++]=C[x++],C[s++]=C[x++],C[s++]=C[x++],2<(w-=3););w&&(C[s++]=C[x++],1<w&&(C[s++]=C[x++]))}break}}break}}while(i<n&&s<o);i-=w=p>>3,c&=(1<<(p-=w<<3))-1,t.next_in=i,t.next_out=s,t.avail_in=i<n?n-i+5:5-(i-n),t.avail_out=s<o?o-s+257:257-(s-o),r.hold=c,r.bits=p}},{}],49:[function(t,e,r){"use strict";var I=t("../utils/common"),O=t("./adler32"),B=t("./crc32"),R=t("./inffast"),T=t("./inftrees"),D=1,F=2,N=0,U=-2,P=1,i=852,n=592;function L(t){return(t>>>24&255)+(t>>>8&65280)+((65280&t)<<8)+((255&t)<<24)}function s(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new I.Buf16(320),this.work=new I.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function a(t){var e;return t&&t.state?(e=t.state,t.total_in=t.total_out=e.total=0,t.msg="",e.wrap&&(t.adler=1&e.wrap),e.mode=P,e.last=0,e.havedict=0,e.dmax=32768,e.head=null,e.hold=0,e.bits=0,e.lencode=e.lendyn=new I.Buf32(i),e.distcode=e.distdyn=new I.Buf32(n),e.sane=1,e.back=-1,N):U}function o(t){var e;return t&&t.state?((e=t.state).wsize=0,e.whave=0,e.wnext=0,a(t)):U}function h(t,e){var r,i;return t&&t.state?(i=t.state,e<0?(r=0,e=-e):(r=1+(e>>4),e<48&&(e&=15)),e&&(e<8||15<e)?U:(null!==i.window&&i.wbits!==e&&(i.window=null),i.wrap=r,i.wbits=e,o(t))):U}function u(t,e){var r,i;return t?(i=new s,(t.state=i).window=null,(r=h(t,e))!==N&&(t.state=null),r):U}var l,f,d=!0;function j(t){if(d){var e;for(l=new I.Buf32(512),f=new I.Buf32(32),e=0;e<144;)t.lens[e++]=8;for(;e<256;)t.lens[e++]=9;for(;e<280;)t.lens[e++]=7;for(;e<288;)t.lens[e++]=8;for(T(D,t.lens,0,288,l,0,t.work,{bits:9}),e=0;e<32;)t.lens[e++]=5;T(F,t.lens,0,32,f,0,t.work,{bits:5}),d=!1}t.lencode=l,t.lenbits=9,t.distcode=f,t.distbits=5}function Z(t,e,r,i){var n,s=t.state;return null===s.window&&(s.wsize=1<<s.wbits,s.wnext=0,s.whave=0,s.window=new I.Buf8(s.wsize)),i>=s.wsize?(I.arraySet(s.window,e,r-s.wsize,s.wsize,0),s.wnext=0,s.whave=s.wsize):(i<(n=s.wsize-s.wnext)&&(n=i),I.arraySet(s.window,e,r-i,n,s.wnext),(i-=n)?(I.arraySet(s.window,e,r-i,i,0),s.wnext=i,s.whave=s.wsize):(s.wnext+=n,s.wnext===s.wsize&&(s.wnext=0),s.whave<s.wsize&&(s.whave+=n))),0}r.inflateReset=o,r.inflateReset2=h,r.inflateResetKeep=a,r.inflateInit=function(t){return u(t,15)},r.inflateInit2=u,r.inflate=function(t,e){var r,i,n,s,a,o,h,u,l,f,d,c,p,m,_,g,b,v,y,w,k,x,S,z,C=0,E=new I.Buf8(4),A=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!t||!t.state||!t.output||!t.input&&0!==t.avail_in)return U;12===(r=t.state).mode&&(r.mode=13),a=t.next_out,n=t.output,h=t.avail_out,s=t.next_in,i=t.input,o=t.avail_in,u=r.hold,l=r.bits,f=o,d=h,x=N;t:for(;;)switch(r.mode){case P:if(0===r.wrap){r.mode=13;break}for(;l<16;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}if(2&r.wrap&&35615===u){E[r.check=0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0),l=u=0,r.mode=2;break}if(r.flags=0,r.head&&(r.head.done=!1),!(1&r.wrap)||(((255&u)<<8)+(u>>8))%31){t.msg="incorrect header check",r.mode=30;break}if(8!=(15&u)){t.msg="unknown compression method",r.mode=30;break}if(l-=4,k=8+(15&(u>>>=4)),0===r.wbits)r.wbits=k;else if(k>r.wbits){t.msg="invalid window size",r.mode=30;break}r.dmax=1<<k,t.adler=r.check=1,r.mode=512&u?10:12,l=u=0;break;case 2:for(;l<16;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}if(r.flags=u,8!=(255&r.flags)){t.msg="unknown compression method",r.mode=30;break}if(57344&r.flags){t.msg="unknown header flags set",r.mode=30;break}r.head&&(r.head.text=u>>8&1),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0)),l=u=0,r.mode=3;case 3:for(;l<32;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}r.head&&(r.head.time=u),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,E[2]=u>>>16&255,E[3]=u>>>24&255,r.check=B(r.check,E,4,0)),l=u=0,r.mode=4;case 4:for(;l<16;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}r.head&&(r.head.xflags=255&u,r.head.os=u>>8),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0)),l=u=0,r.mode=5;case 5:if(1024&r.flags){for(;l<16;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}r.length=u,r.head&&(r.head.extra_len=u),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0)),l=u=0}else r.head&&(r.head.extra=null);r.mode=6;case 6:if(1024&r.flags&&(o<(c=r.length)&&(c=o),c&&(r.head&&(k=r.head.extra_len-r.length,r.head.extra||(r.head.extra=new Array(r.head.extra_len)),I.arraySet(r.head.extra,i,s,c,k)),512&r.flags&&(r.check=B(r.check,i,c,s)),o-=c,s+=c,r.length-=c),r.length))break t;r.length=0,r.mode=7;case 7:if(2048&r.flags){if(0===o)break t;for(c=0;k=i[s+c++],r.head&&k&&r.length<65536&&(r.head.name+=String.fromCharCode(k)),k&&c<o;);if(512&r.flags&&(r.check=B(r.check,i,c,s)),o-=c,s+=c,k)break t}else r.head&&(r.head.name=null);r.length=0,r.mode=8;case 8:if(4096&r.flags){if(0===o)break t;for(c=0;k=i[s+c++],r.head&&k&&r.length<65536&&(r.head.comment+=String.fromCharCode(k)),k&&c<o;);if(512&r.flags&&(r.check=B(r.check,i,c,s)),o-=c,s+=c,k)break t}else r.head&&(r.head.comment=null);r.mode=9;case 9:if(512&r.flags){for(;l<16;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}if(u!==(65535&r.check)){t.msg="header crc mismatch",r.mode=30;break}l=u=0}r.head&&(r.head.hcrc=r.flags>>9&1,r.head.done=!0),t.adler=r.check=0,r.mode=12;break;case 10:for(;l<32;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}t.adler=r.check=L(u),l=u=0,r.mode=11;case 11:if(0===r.havedict)return t.next_out=a,t.avail_out=h,t.next_in=s,t.avail_in=o,r.hold=u,r.bits=l,2;t.adler=r.check=1,r.mode=12;case 12:if(5===e||6===e)break t;case 13:if(r.last){u>>>=7&l,l-=7&l,r.mode=27;break}for(;l<3;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}switch(r.last=1&u,l-=1,3&(u>>>=1)){case 0:r.mode=14;break;case 1:if(j(r),r.mode=20,6!==e)break;u>>>=2,l-=2;break t;case 2:r.mode=17;break;case 3:t.msg="invalid block type",r.mode=30}u>>>=2,l-=2;break;case 14:for(u>>>=7&l,l-=7&l;l<32;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}if((65535&u)!=(u>>>16^65535)){t.msg="invalid stored block lengths",r.mode=30;break}if(r.length=65535&u,l=u=0,r.mode=15,6===e)break t;case 15:r.mode=16;case 16:if(c=r.length){if(o<c&&(c=o),h<c&&(c=h),0===c)break t;I.arraySet(n,i,s,c,a),o-=c,s+=c,h-=c,a+=c,r.length-=c;break}r.mode=12;break;case 17:for(;l<14;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}if(r.nlen=257+(31&u),u>>>=5,l-=5,r.ndist=1+(31&u),u>>>=5,l-=5,r.ncode=4+(15&u),u>>>=4,l-=4,286<r.nlen||30<r.ndist){t.msg="too many length or distance symbols",r.mode=30;break}r.have=0,r.mode=18;case 18:for(;r.have<r.ncode;){for(;l<3;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}r.lens[A[r.have++]]=7&u,u>>>=3,l-=3}for(;r.have<19;)r.lens[A[r.have++]]=0;if(r.lencode=r.lendyn,r.lenbits=7,S={bits:r.lenbits},x=T(0,r.lens,0,19,r.lencode,0,r.work,S),r.lenbits=S.bits,x){t.msg="invalid code lengths set",r.mode=30;break}r.have=0,r.mode=19;case 19:for(;r.have<r.nlen+r.ndist;){for(;g=(C=r.lencode[u&(1<<r.lenbits)-1])>>>16&255,b=65535&C,!((_=C>>>24)<=l);){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}if(b<16)u>>>=_,l-=_,r.lens[r.have++]=b;else{if(16===b){for(z=_+2;l<z;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}if(u>>>=_,l-=_,0===r.have){t.msg="invalid bit length repeat",r.mode=30;break}k=r.lens[r.have-1],c=3+(3&u),u>>>=2,l-=2}else if(17===b){for(z=_+3;l<z;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}l-=_,k=0,c=3+(7&(u>>>=_)),u>>>=3,l-=3}else{for(z=_+7;l<z;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}l-=_,k=0,c=11+(127&(u>>>=_)),u>>>=7,l-=7}if(r.have+c>r.nlen+r.ndist){t.msg="invalid bit length repeat",r.mode=30;break}for(;c--;)r.lens[r.have++]=k}}if(30===r.mode)break;if(0===r.lens[256]){t.msg="invalid code -- missing end-of-block",r.mode=30;break}if(r.lenbits=9,S={bits:r.lenbits},x=T(D,r.lens,0,r.nlen,r.lencode,0,r.work,S),r.lenbits=S.bits,x){t.msg="invalid literal/lengths set",r.mode=30;break}if(r.distbits=6,r.distcode=r.distdyn,S={bits:r.distbits},x=T(F,r.lens,r.nlen,r.ndist,r.distcode,0,r.work,S),r.distbits=S.bits,x){t.msg="invalid distances set",r.mode=30;break}if(r.mode=20,6===e)break t;case 20:r.mode=21;case 21:if(6<=o&&258<=h){t.next_out=a,t.avail_out=h,t.next_in=s,t.avail_in=o,r.hold=u,r.bits=l,R(t,d),a=t.next_out,n=t.output,h=t.avail_out,s=t.next_in,i=t.input,o=t.avail_in,u=r.hold,l=r.bits,12===r.mode&&(r.back=-1);break}for(r.back=0;g=(C=r.lencode[u&(1<<r.lenbits)-1])>>>16&255,b=65535&C,!((_=C>>>24)<=l);){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}if(g&&0==(240&g)){for(v=_,y=g,w=b;g=(C=r.lencode[w+((u&(1<<v+y)-1)>>v)])>>>16&255,b=65535&C,!(v+(_=C>>>24)<=l);){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}u>>>=v,l-=v,r.back+=v}if(u>>>=_,l-=_,r.back+=_,r.length=b,0===g){r.mode=26;break}if(32&g){r.back=-1,r.mode=12;break}if(64&g){t.msg="invalid literal/length code",r.mode=30;break}r.extra=15&g,r.mode=22;case 22:if(r.extra){for(z=r.extra;l<z;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}r.length+=u&(1<<r.extra)-1,u>>>=r.extra,l-=r.extra,r.back+=r.extra}r.was=r.length,r.mode=23;case 23:for(;g=(C=r.distcode[u&(1<<r.distbits)-1])>>>16&255,b=65535&C,!((_=C>>>24)<=l);){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}if(0==(240&g)){for(v=_,y=g,w=b;g=(C=r.distcode[w+((u&(1<<v+y)-1)>>v)])>>>16&255,b=65535&C,!(v+(_=C>>>24)<=l);){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}u>>>=v,l-=v,r.back+=v}if(u>>>=_,l-=_,r.back+=_,64&g){t.msg="invalid distance code",r.mode=30;break}r.offset=b,r.extra=15&g,r.mode=24;case 24:if(r.extra){for(z=r.extra;l<z;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}r.offset+=u&(1<<r.extra)-1,u>>>=r.extra,l-=r.extra,r.back+=r.extra}if(r.offset>r.dmax){t.msg="invalid distance too far back",r.mode=30;break}r.mode=25;case 25:if(0===h)break t;if(c=d-h,r.offset>c){if((c=r.offset-c)>r.whave&&r.sane){t.msg="invalid distance too far back",r.mode=30;break}p=c>r.wnext?(c-=r.wnext,r.wsize-c):r.wnext-c,c>r.length&&(c=r.length),m=r.window}else m=n,p=a-r.offset,c=r.length;for(h<c&&(c=h),h-=c,r.length-=c;n[a++]=m[p++],--c;);0===r.length&&(r.mode=21);break;case 26:if(0===h)break t;n[a++]=r.length,h--,r.mode=21;break;case 27:if(r.wrap){for(;l<32;){if(0===o)break t;o--,u|=i[s++]<<l,l+=8}if(d-=h,t.total_out+=d,r.total+=d,d&&(t.adler=r.check=r.flags?B(r.check,n,d,a-d):O(r.check,n,d,a-d)),d=h,(r.flags?u:L(u))!==r.check){t.msg="incorrect data check",r.mode=30;break}l=u=0}r.mode=28;case 28:if(r.wrap&&r.flags){for(;l<32;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}if(u!==(4294967295&r.total)){t.msg="incorrect length check",r.mode=30;break}l=u=0}r.mode=29;case 29:x=1;break t;case 30:x=-3;break t;case 31:return-4;case 32:default:return U}return t.next_out=a,t.avail_out=h,t.next_in=s,t.avail_in=o,r.hold=u,r.bits=l,(r.wsize||d!==t.avail_out&&r.mode<30&&(r.mode<27||4!==e))&&Z(t,t.output,t.next_out,d-t.avail_out)?(r.mode=31,-4):(f-=t.avail_in,d-=t.avail_out,t.total_in+=f,t.total_out+=d,r.total+=d,r.wrap&&d&&(t.adler=r.check=r.flags?B(r.check,n,d,t.next_out-d):O(r.check,n,d,t.next_out-d)),t.data_type=r.bits+(r.last?64:0)+(12===r.mode?128:0)+(20===r.mode||15===r.mode?256:0),(0==f&&0===d||4===e)&&x===N&&(x=-5),x)},r.inflateEnd=function(t){if(!t||!t.state)return U;var e=t.state;return e.window&&(e.window=null),t.state=null,N},r.inflateGetHeader=function(t,e){var r;return t&&t.state?0==(2&(r=t.state).wrap)?U:((r.head=e).done=!1,N):U},r.inflateSetDictionary=function(t,e){var r,i=e.length;return t&&t.state?0!==(r=t.state).wrap&&11!==r.mode?U:11===r.mode&&O(1,e,i,0)!==r.check?-3:Z(t,e,i,i)?(r.mode=31,-4):(r.havedict=1,N):U},r.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./inffast":48,"./inftrees":50}],50:[function(t,e,r){"use strict";var D=t("../utils/common"),F=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],N=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],U=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],P=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];e.exports=function(t,e,r,i,n,s,a,o){var h,u,l,f,d,c,p,m,_,g=o.bits,b=0,v=0,y=0,w=0,k=0,x=0,S=0,z=0,C=0,E=0,A=null,I=0,O=new D.Buf16(16),B=new D.Buf16(16),R=null,T=0;for(b=0;b<=15;b++)O[b]=0;for(v=0;v<i;v++)O[e[r+v]]++;for(k=g,w=15;1<=w&&0===O[w];w--);if(w<k&&(k=w),0===w)return n[s++]=20971520,n[s++]=20971520,o.bits=1,0;for(y=1;y<w&&0===O[y];y++);for(k<y&&(k=y),b=z=1;b<=15;b++)if(z<<=1,(z-=O[b])<0)return-1;if(0<z&&(0===t||1!==w))return-1;for(B[1]=0,b=1;b<15;b++)B[b+1]=B[b]+O[b];for(v=0;v<i;v++)0!==e[r+v]&&(a[B[e[r+v]]++]=v);if(c=0===t?(A=R=a,19):1===t?(A=F,I-=257,R=N,T-=257,256):(A=U,R=P,-1),b=y,d=s,S=v=E=0,l=-1,f=(C=1<<(x=k))-1,1===t&&852<C||2===t&&592<C)return 1;for(;;){for(p=b-S,_=a[v]<c?(m=0,a[v]):a[v]>c?(m=R[T+a[v]],A[I+a[v]]):(m=96,0),h=1<<b-S,y=u=1<<x;n[d+(E>>S)+(u-=h)]=p<<24|m<<16|_|0,0!==u;);for(h=1<<b-1;E&h;)h>>=1;if(0!==h?(E&=h-1,E+=h):E=0,v++,0==--O[b]){if(b===w)break;b=e[r+a[v]]}if(k<b&&(E&f)!==l){for(0===S&&(S=k),d+=y,z=1<<(x=b-S);x+S<w&&!((z-=O[x+S])<=0);)x++,z<<=1;if(C+=1<<x,1===t&&852<C||2===t&&592<C)return 1;n[l=E&f]=k<<24|x<<16|d-s|0}}return 0!==E&&(n[d+E]=b-S<<24|64<<16|0),o.bits=k,0}},{"../utils/common":41}],51:[function(t,e,r){"use strict";e.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],52:[function(t,e,r){"use strict";var n=t("../utils/common"),o=0,h=1;function i(t){for(var e=t.length;0<=--e;)t[e]=0}var s=0,a=29,u=256,l=u+1+a,f=30,d=19,_=2*l+1,g=15,c=16,p=7,m=256,b=16,v=17,y=18,w=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],k=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],x=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],S=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],z=new Array(2*(l+2));i(z);var C=new Array(2*f);i(C);var E=new Array(512);i(E);var A=new Array(256);i(A);var I=new Array(a);i(I);var O,B,R,T=new Array(f);function D(t,e,r,i,n){this.static_tree=t,this.extra_bits=e,this.extra_base=r,this.elems=i,this.max_length=n,this.has_stree=t&&t.length}function F(t,e){this.dyn_tree=t,this.max_code=0,this.stat_desc=e}function N(t){return t<256?E[t]:E[256+(t>>>7)]}function U(t,e){t.pending_buf[t.pending++]=255&e,t.pending_buf[t.pending++]=e>>>8&255}function P(t,e,r){t.bi_valid>c-r?(t.bi_buf|=e<<t.bi_valid&65535,U(t,t.bi_buf),t.bi_buf=e>>c-t.bi_valid,t.bi_valid+=r-c):(t.bi_buf|=e<<t.bi_valid&65535,t.bi_valid+=r)}function L(t,e,r){P(t,r[2*e],r[2*e+1])}function j(t,e){for(var r=0;r|=1&t,t>>>=1,r<<=1,0<--e;);return r>>>1}function Z(t,e,r){var i,n,s=new Array(g+1),a=0;for(i=1;i<=g;i++)s[i]=a=a+r[i-1]<<1;for(n=0;n<=e;n++){var o=t[2*n+1];0!==o&&(t[2*n]=j(s[o]++,o))}}function W(t){var e;for(e=0;e<l;e++)t.dyn_ltree[2*e]=0;for(e=0;e<f;e++)t.dyn_dtree[2*e]=0;for(e=0;e<d;e++)t.bl_tree[2*e]=0;t.dyn_ltree[2*m]=1,t.opt_len=t.static_len=0,t.last_lit=t.matches=0}function M(t){8<t.bi_valid?U(t,t.bi_buf):0<t.bi_valid&&(t.pending_buf[t.pending++]=t.bi_buf),t.bi_buf=0,t.bi_valid=0}function H(t,e,r,i){var n=2*e,s=2*r;return t[n]<t[s]||t[n]===t[s]&&i[e]<=i[r]}function G(t,e,r){for(var i=t.heap[r],n=r<<1;n<=t.heap_len&&(n<t.heap_len&&H(e,t.heap[n+1],t.heap[n],t.depth)&&n++,!H(e,i,t.heap[n],t.depth));)t.heap[r]=t.heap[n],r=n,n<<=1;t.heap[r]=i}function K(t,e,r){var i,n,s,a,o=0;if(0!==t.last_lit)for(;i=t.pending_buf[t.d_buf+2*o]<<8|t.pending_buf[t.d_buf+2*o+1],n=t.pending_buf[t.l_buf+o],o++,0===i?L(t,n,e):(L(t,(s=A[n])+u+1,e),0!==(a=w[s])&&P(t,n-=I[s],a),L(t,s=N(--i),r),0!==(a=k[s])&&P(t,i-=T[s],a)),o<t.last_lit;);L(t,m,e)}function Y(t,e){var r,i,n,s=e.dyn_tree,a=e.stat_desc.static_tree,o=e.stat_desc.has_stree,h=e.stat_desc.elems,u=-1;for(t.heap_len=0,t.heap_max=_,r=0;r<h;r++)0!==s[2*r]?(t.heap[++t.heap_len]=u=r,t.depth[r]=0):s[2*r+1]=0;for(;t.heap_len<2;)s[2*(n=t.heap[++t.heap_len]=u<2?++u:0)]=1,t.depth[n]=0,t.opt_len--,o&&(t.static_len-=a[2*n+1]);for(e.max_code=u,r=t.heap_len>>1;1<=r;r--)G(t,s,r);for(n=h;r=t.heap[1],t.heap[1]=t.heap[t.heap_len--],G(t,s,1),i=t.heap[1],t.heap[--t.heap_max]=r,t.heap[--t.heap_max]=i,s[2*n]=s[2*r]+s[2*i],t.depth[n]=(t.depth[r]>=t.depth[i]?t.depth[r]:t.depth[i])+1,s[2*r+1]=s[2*i+1]=n,t.heap[1]=n++,G(t,s,1),2<=t.heap_len;);t.heap[--t.heap_max]=t.heap[1],function(t,e){var r,i,n,s,a,o,h=e.dyn_tree,u=e.max_code,l=e.stat_desc.static_tree,f=e.stat_desc.has_stree,d=e.stat_desc.extra_bits,c=e.stat_desc.extra_base,p=e.stat_desc.max_length,m=0;for(s=0;s<=g;s++)t.bl_count[s]=0;for(h[2*t.heap[t.heap_max]+1]=0,r=t.heap_max+1;r<_;r++)p<(s=h[2*h[2*(i=t.heap[r])+1]+1]+1)&&(s=p,m++),h[2*i+1]=s,u<i||(t.bl_count[s]++,a=0,c<=i&&(a=d[i-c]),o=h[2*i],t.opt_len+=o*(s+a),f&&(t.static_len+=o*(l[2*i+1]+a)));if(0!==m){do{for(s=p-1;0===t.bl_count[s];)s--;t.bl_count[s]--,t.bl_count[s+1]+=2,t.bl_count[p]--,m-=2}while(0<m);for(s=p;0!==s;s--)for(i=t.bl_count[s];0!==i;)u<(n=t.heap[--r])||(h[2*n+1]!==s&&(t.opt_len+=(s-h[2*n+1])*h[2*n],h[2*n+1]=s),i--)}}(t,e),Z(s,u,t.bl_count)}function X(t,e,r){var i,n,s=-1,a=e[1],o=0,h=7,u=4;for(0===a&&(h=138,u=3),e[2*(r+1)+1]=65535,i=0;i<=r;i++)n=a,a=e[2*(i+1)+1],++o<h&&n===a||(o<u?t.bl_tree[2*n]+=o:0!==n?(n!==s&&t.bl_tree[2*n]++,t.bl_tree[2*b]++):o<=10?t.bl_tree[2*v]++:t.bl_tree[2*y]++,s=n,u=(o=0)===a?(h=138,3):n===a?(h=6,3):(h=7,4))}function V(t,e,r){var i,n,s=-1,a=e[1],o=0,h=7,u=4;for(0===a&&(h=138,u=3),i=0;i<=r;i++)if(n=a,a=e[2*(i+1)+1],!(++o<h&&n===a)){if(o<u)for(;L(t,n,t.bl_tree),0!=--o;);else 0!==n?(n!==s&&(L(t,n,t.bl_tree),o--),L(t,b,t.bl_tree),P(t,o-3,2)):o<=10?(L(t,v,t.bl_tree),P(t,o-3,3)):(L(t,y,t.bl_tree),P(t,o-11,7));s=n,u=(o=0)===a?(h=138,3):n===a?(h=6,3):(h=7,4)}}i(T);var q=!1;function J(t,e,r,i){P(t,(s<<1)+(i?1:0),3),function(t,e,r,i){M(t),i&&(U(t,r),U(t,~r)),n.arraySet(t.pending_buf,t.window,e,r,t.pending),t.pending+=r}(t,e,r,!0)}r._tr_init=function(t){q||(function(){var t,e,r,i,n,s=new Array(g+1);for(i=r=0;i<a-1;i++)for(I[i]=r,t=0;t<1<<w[i];t++)A[r++]=i;for(A[r-1]=i,i=n=0;i<16;i++)for(T[i]=n,t=0;t<1<<k[i];t++)E[n++]=i;for(n>>=7;i<f;i++)for(T[i]=n<<7,t=0;t<1<<k[i]-7;t++)E[256+n++]=i;for(e=0;e<=g;e++)s[e]=0;for(t=0;t<=143;)z[2*t+1]=8,t++,s[8]++;for(;t<=255;)z[2*t+1]=9,t++,s[9]++;for(;t<=279;)z[2*t+1]=7,t++,s[7]++;for(;t<=287;)z[2*t+1]=8,t++,s[8]++;for(Z(z,l+1,s),t=0;t<f;t++)C[2*t+1]=5,C[2*t]=j(t,5);O=new D(z,w,u+1,l,g),B=new D(C,k,0,f,g),R=new D(new Array(0),x,0,d,p)}(),q=!0),t.l_desc=new F(t.dyn_ltree,O),t.d_desc=new F(t.dyn_dtree,B),t.bl_desc=new F(t.bl_tree,R),t.bi_buf=0,t.bi_valid=0,W(t)},r._tr_stored_block=J,r._tr_flush_block=function(t,e,r,i){var n,s,a=0;0<t.level?(2===t.strm.data_type&&(t.strm.data_type=function(t){var e,r=4093624447;for(e=0;e<=31;e++,r>>>=1)if(1&r&&0!==t.dyn_ltree[2*e])return o;if(0!==t.dyn_ltree[18]||0!==t.dyn_ltree[20]||0!==t.dyn_ltree[26])return h;for(e=32;e<u;e++)if(0!==t.dyn_ltree[2*e])return h;return o}(t)),Y(t,t.l_desc),Y(t,t.d_desc),a=function(t){var e;for(X(t,t.dyn_ltree,t.l_desc.max_code),X(t,t.dyn_dtree,t.d_desc.max_code),Y(t,t.bl_desc),e=d-1;3<=e&&0===t.bl_tree[2*S[e]+1];e--);return t.opt_len+=3*(e+1)+5+5+4,e}(t),n=t.opt_len+3+7>>>3,(s=t.static_len+3+7>>>3)<=n&&(n=s)):n=s=r+5,r+4<=n&&-1!==e?J(t,e,r,i):4===t.strategy||s===n?(P(t,2+(i?1:0),3),K(t,z,C)):(P(t,4+(i?1:0),3),function(t,e,r,i){var n;for(P(t,e-257,5),P(t,r-1,5),P(t,i-4,4),n=0;n<i;n++)P(t,t.bl_tree[2*S[n]+1],3);V(t,t.dyn_ltree,e-1),V(t,t.dyn_dtree,r-1)}(t,t.l_desc.max_code+1,t.d_desc.max_code+1,a+1),K(t,t.dyn_ltree,t.dyn_dtree)),W(t),i&&M(t)},r._tr_tally=function(t,e,r){return t.pending_buf[t.d_buf+2*t.last_lit]=e>>>8&255,t.pending_buf[t.d_buf+2*t.last_lit+1]=255&e,t.pending_buf[t.l_buf+t.last_lit]=255&r,t.last_lit++,0===e?t.dyn_ltree[2*r]++:(t.matches++,e--,t.dyn_ltree[2*(A[r]+u+1)]++,t.dyn_dtree[2*N(e)]++),t.last_lit===t.lit_bufsize-1},r._tr_align=function(t){P(t,2,3),L(t,m,z),function(t){16===t.bi_valid?(U(t,t.bi_buf),t.bi_buf=0,t.bi_valid=0):8<=t.bi_valid&&(t.pending_buf[t.pending++]=255&t.bi_buf,t.bi_buf>>=8,t.bi_valid-=8)}(t)}},{"../utils/common":41}],53:[function(t,e,r){"use strict";e.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}},{}],54:[function(t,e,r){"use strict";e.exports="function"==typeof setImmediate?setImmediate:function(){var t=[].slice.apply(arguments);t.splice(1,0,0),setTimeout.apply(null,t)}},{}]},{},[10])(10)});
'use strict';

    Polymer({
      is: 'netlog-viewer',
      attached: function() {
        MainView.getInstance();  // entry point, from main.js
      }
    });

