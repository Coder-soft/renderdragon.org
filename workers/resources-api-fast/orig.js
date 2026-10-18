var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.js
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
function defaultSetTimout() {
  throw new Error("setTimeout has not been defined");
}
__name(defaultSetTimout, "defaultSetTimout");
__name2(defaultSetTimout, "defaultSetTimout");
function defaultClearTimeout() {
  throw new Error("clearTimeout has not been defined");
}
__name(defaultClearTimeout, "defaultClearTimeout");
__name2(defaultClearTimeout, "defaultClearTimeout");
var cachedSetTimeout = defaultSetTimout;
var cachedClearTimeout = defaultClearTimeout;
if (typeof globalThis.setTimeout === "function") {
  cachedSetTimeout = setTimeout;
}
if (typeof globalThis.clearTimeout === "function") {
  cachedClearTimeout = clearTimeout;
}
function runTimeout(fun) {
  if (cachedSetTimeout === setTimeout) {
    return setTimeout(fun, 0);
  }
  if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
    cachedSetTimeout = setTimeout;
    return setTimeout(fun, 0);
  }
  try {
    return cachedSetTimeout(fun, 0);
  } catch (e) {
    try {
      return cachedSetTimeout.call(null, fun, 0);
    } catch (e2) {
      return cachedSetTimeout.call(this, fun, 0);
    }
  }
}
__name(runTimeout, "runTimeout");
__name2(runTimeout, "runTimeout");
function runClearTimeout(marker) {
  if (cachedClearTimeout === clearTimeout) {
    return clearTimeout(marker);
  }
  if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
    cachedClearTimeout = clearTimeout;
    return clearTimeout(marker);
  }
  try {
    return cachedClearTimeout(marker);
  } catch (e) {
    try {
      return cachedClearTimeout.call(null, marker);
    } catch (e2) {
      return cachedClearTimeout.call(this, marker);
    }
  }
}
__name(runClearTimeout, "runClearTimeout");
__name2(runClearTimeout, "runClearTimeout");
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;
function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }
  draining = false;
  if (currentQueue.length) {
    queue = currentQueue.concat(queue);
  } else {
    queueIndex = -1;
  }
  if (queue.length) {
    drainQueue();
  }
}
__name(cleanUpNextTick, "cleanUpNextTick");
__name2(cleanUpNextTick, "cleanUpNextTick");
function drainQueue() {
  if (draining) {
    return;
  }
  var timeout = runTimeout(cleanUpNextTick);
  draining = true;
  var len = queue.length;
  while (len) {
    currentQueue = queue;
    queue = [];
    while (++queueIndex < len) {
      if (currentQueue) {
        currentQueue[queueIndex].run();
      }
    }
    queueIndex = -1;
    len = queue.length;
  }
  currentQueue = null;
  draining = false;
  runClearTimeout(timeout);
}
__name(drainQueue, "drainQueue");
__name2(drainQueue, "drainQueue");
function nextTick(fun) {
  var args = new Array(arguments.length - 1);
  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
  }
  queue.push(new Item(fun, args));
  if (queue.length === 1 && !draining) {
    runTimeout(drainQueue);
  }
}
__name(nextTick, "nextTick");
__name2(nextTick, "nextTick");
function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}
__name(Item, "Item");
__name2(Item, "Item");
Item.prototype.run = function() {
  this.fun.apply(null, this.array);
};
var title = "browser";
var platform = "browser";
var browser = true;
var env = {};
var argv = [];
var version = "";
var versions = {};
var release = {};
var config = {};
function noop() {
}
__name(noop, "noop");
__name2(noop, "noop");
var on = noop;
var addListener = noop;
var once = noop;
var off = noop;
var removeListener = noop;
var removeAllListeners = noop;
var emit = noop;
function binding(name) {
  throw new Error("process.binding is not supported");
}
__name(binding, "binding");
__name2(binding, "binding");
function cwd() {
  return "/";
}
__name(cwd, "cwd");
__name2(cwd, "cwd");
function chdir(dir) {
  throw new Error("process.chdir is not supported");
}
__name(chdir, "chdir");
__name2(chdir, "chdir");
function umask() {
  return 0;
}
__name(umask, "umask");
__name2(umask, "umask");
var performance = globalThis.performance || {};
var performanceNow = performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow || function() {
  return (/* @__PURE__ */ new Date()).getTime();
};
function hrtime(previousTimestamp) {
  var clocktime = performanceNow.call(performance) * 1e-3;
  var seconds = Math.floor(clocktime);
  var nanoseconds = Math.floor(clocktime % 1 * 1e9);
  if (previousTimestamp) {
    seconds = seconds - previousTimestamp[0];
    nanoseconds = nanoseconds - previousTimestamp[1];
    if (nanoseconds < 0) {
      seconds--;
      nanoseconds += 1e9;
    }
  }
  return [seconds, nanoseconds];
}
__name(hrtime, "hrtime");
__name2(hrtime, "hrtime");
var startTime = /* @__PURE__ */ new Date();
function uptime() {
  var currentTime = /* @__PURE__ */ new Date();
  var dif = currentTime - startTime;
  return dif / 1e3;
}
__name(uptime, "uptime");
__name2(uptime, "uptime");
var process = {
  nextTick,
  title,
  browser,
  env,
  argv,
  version,
  versions,
  on,
  addListener,
  once,
  off,
  removeListener,
  removeAllListeners,
  emit,
  binding,
  cwd,
  chdir,
  umask,
  hrtime,
  platform,
  release,
  config,
  uptime
};
var defines = {};
Object.keys(defines).forEach((key) => {
  const segs = key.split(".");
  let target = process;
  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i];
    if (i === segs.length - 1) {
      target[seg] = defines[key];
    } else {
      target = target[seg] || (target[seg] = {});
    }
  }
});
var lookup = [];
var revLookup = [];
var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
var inited = false;
function init() {
  inited = true;
  var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i];
    revLookup[code.charCodeAt(i)] = i;
  }
  revLookup["-".charCodeAt(0)] = 62;
  revLookup["_".charCodeAt(0)] = 63;
}
__name(init, "init");
__name2(init, "init");
function base64toByteArray(b64) {
  if (!inited) {
    init();
  }
  var i, j, l, tmp, placeHolders, arr;
  var len = b64.length;
  if (len % 4 > 0) {
    throw new Error("Invalid string. Length must be a multiple of 4");
  }
  placeHolders = b64[len - 2] === "=" ? 2 : b64[len - 1] === "=" ? 1 : 0;
  arr = new Arr(len * 3 / 4 - placeHolders);
  l = placeHolders > 0 ? len - 4 : len;
  var L = 0;
  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
    arr[L++] = tmp >> 16 & 255;
    arr[L++] = tmp >> 8 & 255;
    arr[L++] = tmp & 255;
  }
  if (placeHolders === 2) {
    tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
    arr[L++] = tmp & 255;
  } else if (placeHolders === 1) {
    tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
    arr[L++] = tmp >> 8 & 255;
    arr[L++] = tmp & 255;
  }
  return arr;
}
__name(base64toByteArray, "base64toByteArray");
__name2(base64toByteArray, "base64toByteArray");
function tripletToBase64(num) {
  return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
}
__name(tripletToBase64, "tripletToBase64");
__name2(tripletToBase64, "tripletToBase64");
function encodeChunk(uint8, start, end) {
  var tmp;
  var output = [];
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
    output.push(tripletToBase64(tmp));
  }
  return output.join("");
}
__name(encodeChunk, "encodeChunk");
__name2(encodeChunk, "encodeChunk");
function base64fromByteArray(uint8) {
  if (!inited) {
    init();
  }
  var tmp;
  var len = uint8.length;
  var extraBytes = len % 3;
  var output = "";
  var parts = [];
  var maxChunkLength = 16383;
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(
      encodeChunk(
        uint8,
        i,
        i + maxChunkLength > len2 ? len2 : i + maxChunkLength
      )
    );
  }
  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    output += lookup[tmp >> 2];
    output += lookup[tmp << 4 & 63];
    output += "==";
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
    output += lookup[tmp >> 10];
    output += lookup[tmp >> 4 & 63];
    output += lookup[tmp << 2 & 63];
    output += "=";
  }
  parts.push(output);
  return parts.join("");
}
__name(base64fromByteArray, "base64fromByteArray");
__name2(base64fromByteArray, "base64fromByteArray");
Buffer2.TYPED_ARRAY_SUPPORT = globalThis.TYPED_ARRAY_SUPPORT !== void 0 ? globalThis.TYPED_ARRAY_SUPPORT : true;
function kMaxLength() {
  return Buffer2.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
}
__name(kMaxLength, "kMaxLength");
__name2(kMaxLength, "kMaxLength");
function createBuffer(that, length) {
  if (kMaxLength() < length) {
    throw new RangeError("Invalid typed array length");
  }
  if (Buffer2.TYPED_ARRAY_SUPPORT) {
    that = new Uint8Array(length);
    that.__proto__ = Buffer2.prototype;
  } else {
    if (that === null) {
      that = new Buffer2(length);
    }
    that.length = length;
  }
  return that;
}
__name(createBuffer, "createBuffer");
__name2(createBuffer, "createBuffer");
function Buffer2(arg, encodingOrOffset, length) {
  if (!Buffer2.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer2)) {
    return new Buffer2(arg, encodingOrOffset, length);
  }
  if (typeof arg === "number") {
    if (typeof encodingOrOffset === "string") {
      throw new Error(
        "If encoding is specified then the first argument must be a string"
      );
    }
    return allocUnsafe(this, arg);
  }
  return from(this, arg, encodingOrOffset, length);
}
__name(Buffer2, "Buffer2");
__name2(Buffer2, "Buffer");
Buffer2.poolSize = 8192;
Buffer2._augment = function(arr) {
  arr.__proto__ = Buffer2.prototype;
  return arr;
};
function from(that, value, encodingOrOffset, length) {
  if (typeof value === "number") {
    throw new TypeError('"value" argument must not be a number');
  }
  if (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length);
  }
  if (typeof value === "string") {
    return fromString(that, value, encodingOrOffset);
  }
  return fromObject(that, value);
}
__name(from, "from");
__name2(from, "from");
Buffer2.from = function(value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length);
};
Buffer2.kMaxLength = kMaxLength();
if (Buffer2.TYPED_ARRAY_SUPPORT) {
  Buffer2.prototype.__proto__ = Uint8Array.prototype;
  Buffer2.__proto__ = Uint8Array;
  if (typeof Symbol !== "undefined" && Symbol.species && Buffer2[Symbol.species] === Buffer2) {
  }
}
function assertSize(size) {
  if (typeof size !== "number") {
    throw new TypeError('"size" argument must be a number');
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative');
  }
}
__name(assertSize, "assertSize");
__name2(assertSize, "assertSize");
function alloc(that, size, fill2, encoding) {
  assertSize(size);
  if (size <= 0) {
    return createBuffer(that, size);
  }
  if (fill2 !== void 0) {
    return typeof encoding === "string" ? createBuffer(that, size).fill(fill2, encoding) : createBuffer(that, size).fill(fill2);
  }
  return createBuffer(that, size);
}
__name(alloc, "alloc");
__name2(alloc, "alloc");
Buffer2.alloc = function(size, fill2, encoding) {
  return alloc(null, size, fill2, encoding);
};
function allocUnsafe(that, size) {
  assertSize(size);
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
  if (!Buffer2.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0;
    }
  }
  return that;
}
__name(allocUnsafe, "allocUnsafe");
__name2(allocUnsafe, "allocUnsafe");
Buffer2.allocUnsafe = function(size) {
  return allocUnsafe(null, size);
};
Buffer2.allocUnsafeSlow = function(size) {
  return allocUnsafe(null, size);
};
function fromString(that, string, encoding) {
  if (typeof encoding !== "string" || encoding === "") {
    encoding = "utf8";
  }
  if (!Buffer2.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding');
  }
  var length = byteLength(string, encoding) | 0;
  that = createBuffer(that, length);
  var actual = that.write(string, encoding);
  if (actual !== length) {
    that = that.slice(0, actual);
  }
  return that;
}
__name(fromString, "fromString");
__name2(fromString, "fromString");
function fromArrayLike(that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0;
  that = createBuffer(that, length);
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255;
  }
  return that;
}
__name(fromArrayLike, "fromArrayLike");
__name2(fromArrayLike, "fromArrayLike");
function fromArrayBuffer(that, array, byteOffset, length) {
  array.byteLength;
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError("'offset' is out of bounds");
  }
  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError("'length' is out of bounds");
  }
  if (byteOffset === void 0 && length === void 0) {
    array = new Uint8Array(array);
  } else if (length === void 0) {
    array = new Uint8Array(array, byteOffset);
  } else {
    array = new Uint8Array(array, byteOffset, length);
  }
  if (Buffer2.TYPED_ARRAY_SUPPORT) {
    that = array;
    that.__proto__ = Buffer2.prototype;
  } else {
    that = fromArrayLike(that, array);
  }
  return that;
}
__name(fromArrayBuffer, "fromArrayBuffer");
__name2(fromArrayBuffer, "fromArrayBuffer");
function fromObject(that, obj) {
  if (internalIsBuffer(obj)) {
    var len = checked(obj.length) | 0;
    that = createBuffer(that, len);
    if (that.length === 0) {
      return that;
    }
    obj.copy(that, 0, 0, len);
    return that;
  }
  if (obj) {
    if (typeof ArrayBuffer !== "undefined" && obj.buffer instanceof ArrayBuffer || "length" in obj) {
      if (typeof obj.length !== "number" || isnan(obj.length)) {
        return createBuffer(that, 0);
      }
      return fromArrayLike(that, obj);
    }
    if (obj.type === "Buffer" && Array.isArray(obj.data)) {
      return fromArrayLike(that, obj.data);
    }
  }
  throw new TypeError(
    "First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object."
  );
}
__name(fromObject, "fromObject");
__name2(fromObject, "fromObject");
function checked(length) {
  if (length >= kMaxLength()) {
    throw new RangeError(
      "Attempt to allocate Buffer larger than maximum size: 0x" + kMaxLength().toString(16) + " bytes"
    );
  }
  return length | 0;
}
__name(checked, "checked");
__name2(checked, "checked");
Buffer2.isBuffer = isBuffer;
function internalIsBuffer(b) {
  return !!(b != null && b._isBuffer);
}
__name(internalIsBuffer, "internalIsBuffer");
__name2(internalIsBuffer, "internalIsBuffer");
Buffer2.compare = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function compare(a, b) {
  if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
    throw new TypeError("Arguments must be Buffers");
  }
  if (a === b)
    return 0;
  var x = a.length;
  var y = b.length;
  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }
  if (x < y)
    return -1;
  if (y < x)
    return 1;
  return 0;
}, "compare"), "compare");
Buffer2.isEncoding = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function isEncoding(encoding) {
  switch (String(encoding).toLowerCase()) {
    case "hex":
    case "utf8":
    case "utf-8":
    case "ascii":
    case "latin1":
    case "binary":
    case "base64":
    case "ucs2":
    case "ucs-2":
    case "utf16le":
    case "utf-16le":
      return true;
    default:
      return false;
  }
}, "isEncoding"), "isEncoding");
Buffer2.concat = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function concat(list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers');
  }
  if (list.length === 0) {
    return Buffer2.alloc(0);
  }
  var i;
  if (length === void 0) {
    length = 0;
    for (i = 0; i < list.length; ++i) {
      length += list[i].length;
    }
  }
  var buffer = Buffer2.allocUnsafe(length);
  var pos = 0;
  for (i = 0; i < list.length; ++i) {
    var buf = list[i];
    if (!internalIsBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers');
    }
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer;
}, "concat"), "concat");
function byteLength(string, encoding) {
  if (internalIsBuffer(string)) {
    return string.length;
  }
  if (typeof ArrayBuffer !== "undefined" && typeof ArrayBuffer.isView === "function" && (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength;
  }
  if (typeof string !== "string") {
    string = "" + string;
  }
  var len = string.length;
  if (len === 0)
    return 0;
  var loweredCase = false;
  for (; ; ) {
    switch (encoding) {
      case "ascii":
      case "latin1":
      case "binary":
        return len;
      case "utf8":
      case "utf-8":
      case void 0:
        return utf8ToBytes(string).length;
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return len * 2;
      case "hex":
        return len >>> 1;
      case "base64":
        return base64ToBytes(string).length;
      default:
        if (loweredCase)
          return utf8ToBytes(string).length;
        encoding = ("" + encoding).toLowerCase();
        loweredCase = true;
    }
  }
}
__name(byteLength, "byteLength");
__name2(byteLength, "byteLength");
Buffer2.byteLength = byteLength;
function slowToString(encoding, start, end) {
  var loweredCase = false;
  if (start === void 0 || start < 0) {
    start = 0;
  }
  if (start > this.length) {
    return "";
  }
  if (end === void 0 || end > this.length) {
    end = this.length;
  }
  if (end <= 0) {
    return "";
  }
  end >>>= 0;
  start >>>= 0;
  if (end <= start) {
    return "";
  }
  if (!encoding)
    encoding = "utf8";
  while (true) {
    switch (encoding) {
      case "hex":
        return hexSlice(this, start, end);
      case "utf8":
      case "utf-8":
        return utf8Slice(this, start, end);
      case "ascii":
        return asciiSlice(this, start, end);
      case "latin1":
      case "binary":
        return latin1Slice(this, start, end);
      case "base64":
        return base64Slice(this, start, end);
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return utf16leSlice(this, start, end);
      default:
        if (loweredCase)
          throw new TypeError("Unknown encoding: " + encoding);
        encoding = (encoding + "").toLowerCase();
        loweredCase = true;
    }
  }
}
__name(slowToString, "slowToString");
__name2(slowToString, "slowToString");
Buffer2.prototype._isBuffer = true;
function swap(b, n, m) {
  var i = b[n];
  b[n] = b[m];
  b[m] = i;
}
__name(swap, "swap");
__name2(swap, "swap");
Buffer2.prototype.swap16 = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function swap16() {
  var len = this.length;
  if (len % 2 !== 0) {
    throw new RangeError("Buffer size must be a multiple of 16-bits");
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1);
  }
  return this;
}, "swap16"), "swap16");
Buffer2.prototype.swap32 = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function swap32() {
  var len = this.length;
  if (len % 4 !== 0) {
    throw new RangeError("Buffer size must be a multiple of 32-bits");
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3);
    swap(this, i + 1, i + 2);
  }
  return this;
}, "swap32"), "swap32");
Buffer2.prototype.swap64 = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function swap64() {
  var len = this.length;
  if (len % 8 !== 0) {
    throw new RangeError("Buffer size must be a multiple of 64-bits");
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7);
    swap(this, i + 1, i + 6);
    swap(this, i + 2, i + 5);
    swap(this, i + 3, i + 4);
  }
  return this;
}, "swap64"), "swap64");
Buffer2.prototype.toString = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function toString() {
  var length = this.length | 0;
  if (length === 0)
    return "";
  if (arguments.length === 0)
    return utf8Slice(this, 0, length);
  return slowToString.apply(this, arguments);
}, "toString"), "toString");
Buffer2.prototype.equals = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function equals(b) {
  if (!internalIsBuffer(b))
    throw new TypeError("Argument must be a Buffer");
  if (this === b)
    return true;
  return Buffer2.compare(this, b) === 0;
}, "equals"), "equals");
Buffer2.prototype.compare = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function compare2(target, start, end, thisStart, thisEnd) {
  if (!internalIsBuffer(target)) {
    throw new TypeError("Argument must be a Buffer");
  }
  if (start === void 0) {
    start = 0;
  }
  if (end === void 0) {
    end = target ? target.length : 0;
  }
  if (thisStart === void 0) {
    thisStart = 0;
  }
  if (thisEnd === void 0) {
    thisEnd = this.length;
  }
  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError("out of range index");
  }
  if (thisStart >= thisEnd && start >= end) {
    return 0;
  }
  if (thisStart >= thisEnd) {
    return -1;
  }
  if (start >= end) {
    return 1;
  }
  start >>>= 0;
  end >>>= 0;
  thisStart >>>= 0;
  thisEnd >>>= 0;
  if (this === target)
    return 0;
  var x = thisEnd - thisStart;
  var y = end - start;
  var len = Math.min(x, y);
  var thisCopy = this.slice(thisStart, thisEnd);
  var targetCopy = target.slice(start, end);
  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i];
      y = targetCopy[i];
      break;
    }
  }
  if (x < y)
    return -1;
  if (y < x)
    return 1;
  return 0;
}, "compare2"), "compare");
function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
  if (buffer.length === 0)
    return -1;
  if (typeof byteOffset === "string") {
    encoding = byteOffset;
    byteOffset = 0;
  } else if (byteOffset > 2147483647) {
    byteOffset = 2147483647;
  } else if (byteOffset < -2147483648) {
    byteOffset = -2147483648;
  }
  byteOffset = +byteOffset;
  if (isNaN(byteOffset)) {
    byteOffset = dir ? 0 : buffer.length - 1;
  }
  if (byteOffset < 0)
    byteOffset = buffer.length + byteOffset;
  if (byteOffset >= buffer.length) {
    if (dir)
      return -1;
    else
      byteOffset = buffer.length - 1;
  } else if (byteOffset < 0) {
    if (dir)
      byteOffset = 0;
    else
      return -1;
  }
  if (typeof val === "string") {
    val = Buffer2.from(val, encoding);
  }
  if (internalIsBuffer(val)) {
    if (val.length === 0) {
      return -1;
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
  } else if (typeof val === "number") {
    val = val & 255;
    if (Buffer2.TYPED_ARRAY_SUPPORT && typeof Uint8Array.prototype.indexOf === "function") {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(
          buffer,
          val,
          byteOffset
        );
      } else {
        return Uint8Array.prototype.lastIndexOf.call(
          buffer,
          val,
          byteOffset
        );
      }
    }
    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
  }
  throw new TypeError("val must be string, number or Buffer");
}
__name(bidirectionalIndexOf, "bidirectionalIndexOf");
__name2(bidirectionalIndexOf, "bidirectionalIndexOf");
function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
  var indexSize = 1;
  var arrLength = arr.length;
  var valLength = val.length;
  if (encoding !== void 0) {
    encoding = String(encoding).toLowerCase();
    if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
      if (arr.length < 2 || val.length < 2) {
        return -1;
      }
      indexSize = 2;
      arrLength /= 2;
      valLength /= 2;
      byteOffset /= 2;
    }
  }
  function read(buf, i2) {
    if (indexSize === 1) {
      return buf[i2];
    } else {
      return buf.readUInt16BE(i2 * indexSize);
    }
  }
  __name(read, "read");
  __name2(read, "read");
  var i;
  if (dir) {
    var foundIndex = -1;
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1)
          foundIndex = i;
        if (i - foundIndex + 1 === valLength)
          return foundIndex * indexSize;
      } else {
        if (foundIndex !== -1)
          i -= i - foundIndex;
        foundIndex = -1;
      }
    }
  } else {
    if (byteOffset + valLength > arrLength)
      byteOffset = arrLength - valLength;
    for (i = byteOffset; i >= 0; i--) {
      var found = true;
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false;
          break;
        }
      }
      if (found)
        return i;
    }
  }
  return -1;
}
__name(arrayIndexOf, "arrayIndexOf");
__name2(arrayIndexOf, "arrayIndexOf");
Buffer2.prototype.includes = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function includes(val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1;
}, "includes"), "includes");
Buffer2.prototype.indexOf = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function indexOf(val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
}, "indexOf"), "indexOf");
Buffer2.prototype.lastIndexOf = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function lastIndexOf(val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
}, "lastIndexOf"), "lastIndexOf");
function hexWrite(buf, string, offset, length) {
  offset = Number(offset) || 0;
  var remaining = buf.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = Number(length);
    if (length > remaining) {
      length = remaining;
    }
  }
  var strLen = string.length;
  if (strLen % 2 !== 0)
    throw new TypeError("Invalid hex string");
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(parsed))
      return i;
    buf[offset + i] = parsed;
  }
  return i;
}
__name(hexWrite, "hexWrite");
__name2(hexWrite, "hexWrite");
function utf8Write(buf, string, offset, length) {
  return blitBuffer(
    utf8ToBytes(string, buf.length - offset),
    buf,
    offset,
    length
  );
}
__name(utf8Write, "utf8Write");
__name2(utf8Write, "utf8Write");
function asciiWrite(buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length);
}
__name(asciiWrite, "asciiWrite");
__name2(asciiWrite, "asciiWrite");
function latin1Write(buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length);
}
__name(latin1Write, "latin1Write");
__name2(latin1Write, "latin1Write");
function base64Write(buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length);
}
__name(base64Write, "base64Write");
__name2(base64Write, "base64Write");
function ucs2Write(buf, string, offset, length) {
  return blitBuffer(
    utf16leToBytes(string, buf.length - offset),
    buf,
    offset,
    length
  );
}
__name(ucs2Write, "ucs2Write");
__name2(ucs2Write, "ucs2Write");
Buffer2.prototype.write = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function write(string, offset, length, encoding) {
  if (offset === void 0) {
    encoding = "utf8";
    length = this.length;
    offset = 0;
  } else if (length === void 0 && typeof offset === "string") {
    encoding = offset;
    length = this.length;
    offset = 0;
  } else if (isFinite(offset)) {
    offset = offset | 0;
    if (isFinite(length)) {
      length = length | 0;
      if (encoding === void 0)
        encoding = "utf8";
    } else {
      encoding = length;
      length = void 0;
    }
  } else {
    throw new Error(
      "Buffer.write(string, encoding, offset[, length]) is no longer supported"
    );
  }
  var remaining = this.length - offset;
  if (length === void 0 || length > remaining)
    length = remaining;
  if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
    throw new RangeError("Attempt to write outside buffer bounds");
  }
  if (!encoding)
    encoding = "utf8";
  var loweredCase = false;
  for (; ; ) {
    switch (encoding) {
      case "hex":
        return hexWrite(this, string, offset, length);
      case "utf8":
      case "utf-8":
        return utf8Write(this, string, offset, length);
      case "ascii":
        return asciiWrite(this, string, offset, length);
      case "latin1":
      case "binary":
        return latin1Write(this, string, offset, length);
      case "base64":
        return base64Write(this, string, offset, length);
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return ucs2Write(this, string, offset, length);
      default:
        if (loweredCase)
          throw new TypeError("Unknown encoding: " + encoding);
        encoding = ("" + encoding).toLowerCase();
        loweredCase = true;
    }
  }
}, "write"), "write");
Buffer2.prototype.toJSON = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function toJSON() {
  return {
    type: "Buffer",
    data: Array.prototype.slice.call(this._arr || this, 0)
  };
}, "toJSON"), "toJSON");
function base64Slice(buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64fromByteArray(buf);
  } else {
    return base64fromByteArray(buf.slice(start, end));
  }
}
__name(base64Slice, "base64Slice");
__name2(base64Slice, "base64Slice");
function utf8Slice(buf, start, end) {
  end = Math.min(buf.length, end);
  var res = [];
  var i = start;
  while (i < end) {
    var firstByte = buf[i];
    var codePoint = null;
    var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint;
      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 128) {
            codePoint = firstByte;
          }
          break;
        case 2:
          secondByte = buf[i + 1];
          if ((secondByte & 192) === 128) {
            tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
            if (tempCodePoint > 127) {
              codePoint = tempCodePoint;
            }
          }
          break;
        case 3:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
            tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
            if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
              codePoint = tempCodePoint;
            }
          }
          break;
        case 4:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          fourthByte = buf[i + 3];
          if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
            tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
            if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
              codePoint = tempCodePoint;
            }
          }
      }
    }
    if (codePoint === null) {
      codePoint = 65533;
      bytesPerSequence = 1;
    } else if (codePoint > 65535) {
      codePoint -= 65536;
      res.push(codePoint >>> 10 & 1023 | 55296);
      codePoint = 56320 | codePoint & 1023;
    }
    res.push(codePoint);
    i += bytesPerSequence;
  }
  return decodeCodePointsArray(res);
}
__name(utf8Slice, "utf8Slice");
__name2(utf8Slice, "utf8Slice");
var MAX_ARGUMENTS_LENGTH = 4096;
function decodeCodePointsArray(codePoints) {
  var len = codePoints.length;
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints);
  }
  var res = "";
  var i = 0;
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    );
  }
  return res;
}
__name(decodeCodePointsArray, "decodeCodePointsArray");
__name2(decodeCodePointsArray, "decodeCodePointsArray");
function asciiSlice(buf, start, end) {
  var ret = "";
  end = Math.min(buf.length, end);
  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 127);
  }
  return ret;
}
__name(asciiSlice, "asciiSlice");
__name2(asciiSlice, "asciiSlice");
function latin1Slice(buf, start, end) {
  var ret = "";
  end = Math.min(buf.length, end);
  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i]);
  }
  return ret;
}
__name(latin1Slice, "latin1Slice");
__name2(latin1Slice, "latin1Slice");
function hexSlice(buf, start, end) {
  var len = buf.length;
  if (!start || start < 0)
    start = 0;
  if (!end || end < 0 || end > len)
    end = len;
  var out = "";
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i]);
  }
  return out;
}
__name(hexSlice, "hexSlice");
__name2(hexSlice, "hexSlice");
function utf16leSlice(buf, start, end) {
  var bytes = buf.slice(start, end);
  var res = "";
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
  }
  return res;
}
__name(utf16leSlice, "utf16leSlice");
__name2(utf16leSlice, "utf16leSlice");
Buffer2.prototype.slice = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function slice(start, end) {
  var len = this.length;
  start = ~~start;
  end = end === void 0 ? len : ~~end;
  if (start < 0) {
    start += len;
    if (start < 0)
      start = 0;
  } else if (start > len) {
    start = len;
  }
  if (end < 0) {
    end += len;
    if (end < 0)
      end = 0;
  } else if (end > len) {
    end = len;
  }
  if (end < start)
    end = start;
  var newBuf;
  if (Buffer2.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end);
    newBuf.__proto__ = Buffer2.prototype;
  } else {
    var sliceLen = end - start;
    newBuf = new Buffer2(sliceLen, void 0);
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start];
    }
  }
  return newBuf;
}, "slice"), "slice");
function checkOffset(offset, ext, length) {
  if (offset % 1 !== 0 || offset < 0)
    throw new RangeError("offset is not uint");
  if (offset + ext > length)
    throw new RangeError("Trying to access beyond buffer length");
}
__name(checkOffset, "checkOffset");
__name2(checkOffset, "checkOffset");
Buffer2.prototype.readUIntLE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function readUIntLE(offset, byteLength2, noAssert) {
  offset = offset | 0;
  byteLength2 = byteLength2 | 0;
  if (!noAssert)
    checkOffset(offset, byteLength2, this.length);
  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength2 && (mul *= 256)) {
    val += this[offset + i] * mul;
  }
  return val;
}, "readUIntLE"), "readUIntLE");
Buffer2.prototype.readUIntBE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function readUIntBE(offset, byteLength2, noAssert) {
  offset = offset | 0;
  byteLength2 = byteLength2 | 0;
  if (!noAssert) {
    checkOffset(offset, byteLength2, this.length);
  }
  var val = this[offset + --byteLength2];
  var mul = 1;
  while (byteLength2 > 0 && (mul *= 256)) {
    val += this[offset + --byteLength2] * mul;
  }
  return val;
}, "readUIntBE"), "readUIntBE");
Buffer2.prototype.readUInt8 = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function readUInt8(offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length);
  return this[offset];
}, "readUInt8"), "readUInt8");
Buffer2.prototype.readUInt16LE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function readUInt16LE(offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length);
  return this[offset] | this[offset + 1] << 8;
}, "readUInt16LE"), "readUInt16LE");
Buffer2.prototype.readUInt16BE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function readUInt16BE(offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length);
  return this[offset] << 8 | this[offset + 1];
}, "readUInt16BE"), "readUInt16BE");
Buffer2.prototype.readUInt32LE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function readUInt32LE(offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length);
  return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
}, "readUInt32LE"), "readUInt32LE");
Buffer2.prototype.readUInt32BE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function readUInt32BE(offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length);
  return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
}, "readUInt32BE"), "readUInt32BE");
Buffer2.prototype.readIntLE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function readIntLE(offset, byteLength2, noAssert) {
  offset = offset | 0;
  byteLength2 = byteLength2 | 0;
  if (!noAssert)
    checkOffset(offset, byteLength2, this.length);
  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength2 && (mul *= 256)) {
    val += this[offset + i] * mul;
  }
  mul *= 128;
  if (val >= mul)
    val -= Math.pow(2, 8 * byteLength2);
  return val;
}, "readIntLE"), "readIntLE");
Buffer2.prototype.readIntBE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function readIntBE(offset, byteLength2, noAssert) {
  offset = offset | 0;
  byteLength2 = byteLength2 | 0;
  if (!noAssert)
    checkOffset(offset, byteLength2, this.length);
  var i = byteLength2;
  var mul = 1;
  var val = this[offset + --i];
  while (i > 0 && (mul *= 256)) {
    val += this[offset + --i] * mul;
  }
  mul *= 128;
  if (val >= mul)
    val -= Math.pow(2, 8 * byteLength2);
  return val;
}, "readIntBE"), "readIntBE");
Buffer2.prototype.readInt8 = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function readInt8(offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length);
  if (!(this[offset] & 128))
    return this[offset];
  return (255 - this[offset] + 1) * -1;
}, "readInt8"), "readInt8");
Buffer2.prototype.readInt16LE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function readInt16LE(offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length);
  var val = this[offset] | this[offset + 1] << 8;
  return val & 32768 ? val | 4294901760 : val;
}, "readInt16LE"), "readInt16LE");
Buffer2.prototype.readInt16BE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function readInt16BE(offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length);
  var val = this[offset + 1] | this[offset] << 8;
  return val & 32768 ? val | 4294901760 : val;
}, "readInt16BE"), "readInt16BE");
Buffer2.prototype.readInt32LE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function readInt32LE(offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length);
  return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
}, "readInt32LE"), "readInt32LE");
Buffer2.prototype.readInt32BE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function readInt32BE(offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length);
  return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
}, "readInt32BE"), "readInt32BE");
Buffer2.prototype.readFloatLE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function readFloatLE(offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length);
  return ieee754read(this, offset, true, 23, 4);
}, "readFloatLE"), "readFloatLE");
Buffer2.prototype.readFloatBE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function readFloatBE(offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length);
  return ieee754read(this, offset, false, 23, 4);
}, "readFloatBE"), "readFloatBE");
Buffer2.prototype.readDoubleLE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function readDoubleLE(offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length);
  return ieee754read(this, offset, true, 52, 8);
}, "readDoubleLE"), "readDoubleLE");
Buffer2.prototype.readDoubleBE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function readDoubleBE(offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length);
  return ieee754read(this, offset, false, 52, 8);
}, "readDoubleBE"), "readDoubleBE");
function checkInt(buf, value, offset, ext, max, min) {
  if (!internalIsBuffer(buf))
    throw new TypeError('"buffer" argument must be a Buffer instance');
  if (value > max || value < min)
    throw new RangeError('"value" argument is out of bounds');
  if (offset + ext > buf.length)
    throw new RangeError("Index out of range");
}
__name(checkInt, "checkInt");
__name2(checkInt, "checkInt");
Buffer2.prototype.writeUIntLE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function writeUIntLE(value, offset, byteLength2, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength2 = byteLength2 | 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength2) - 1;
    checkInt(this, value, offset, byteLength2, maxBytes, 0);
  }
  var mul = 1;
  var i = 0;
  this[offset] = value & 255;
  while (++i < byteLength2 && (mul *= 256)) {
    this[offset + i] = value / mul & 255;
  }
  return offset + byteLength2;
}, "writeUIntLE"), "writeUIntLE");
Buffer2.prototype.writeUIntBE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function writeUIntBE(value, offset, byteLength2, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength2 = byteLength2 | 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength2) - 1;
    checkInt(this, value, offset, byteLength2, maxBytes, 0);
  }
  var i = byteLength2 - 1;
  var mul = 1;
  this[offset + i] = value & 255;
  while (--i >= 0 && (mul *= 256)) {
    this[offset + i] = value / mul & 255;
  }
  return offset + byteLength2;
}, "writeUIntBE"), "writeUIntBE");
Buffer2.prototype.writeUInt8 = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function writeUInt8(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert)
    checkInt(this, value, offset, 1, 255, 0);
  if (!Buffer2.TYPED_ARRAY_SUPPORT)
    value = Math.floor(value);
  this[offset] = value & 255;
  return offset + 1;
}, "writeUInt8"), "writeUInt8");
function objectWriteUInt16(buf, value, offset, littleEndian) {
  if (value < 0)
    value = 65535 + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & 255 << 8 * (littleEndian ? i : 1 - i)) >>> (littleEndian ? i : 1 - i) * 8;
  }
}
__name(objectWriteUInt16, "objectWriteUInt16");
__name2(objectWriteUInt16, "objectWriteUInt16");
Buffer2.prototype.writeUInt16LE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function writeUInt16LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert)
    checkInt(this, value, offset, 2, 65535, 0);
  if (Buffer2.TYPED_ARRAY_SUPPORT) {
    this[offset] = value & 255;
    this[offset + 1] = value >>> 8;
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2;
}, "writeUInt16LE"), "writeUInt16LE");
Buffer2.prototype.writeUInt16BE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function writeUInt16BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert)
    checkInt(this, value, offset, 2, 65535, 0);
  if (Buffer2.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 8;
    this[offset + 1] = value & 255;
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2;
}, "writeUInt16BE"), "writeUInt16BE");
function objectWriteUInt32(buf, value, offset, littleEndian) {
  if (value < 0)
    value = 4294967295 + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = value >>> (littleEndian ? i : 3 - i) * 8 & 255;
  }
}
__name(objectWriteUInt32, "objectWriteUInt32");
__name2(objectWriteUInt32, "objectWriteUInt32");
Buffer2.prototype.writeUInt32LE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function writeUInt32LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert)
    checkInt(this, value, offset, 4, 4294967295, 0);
  if (Buffer2.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = value >>> 24;
    this[offset + 2] = value >>> 16;
    this[offset + 1] = value >>> 8;
    this[offset] = value & 255;
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4;
}, "writeUInt32LE"), "writeUInt32LE");
Buffer2.prototype.writeUInt32BE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function writeUInt32BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert)
    checkInt(this, value, offset, 4, 4294967295, 0);
  if (Buffer2.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 255;
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4;
}, "writeUInt32BE"), "writeUInt32BE");
Buffer2.prototype.writeIntLE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function writeIntLE(value, offset, byteLength2, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength2 - 1);
    checkInt(this, value, offset, byteLength2, limit - 1, -limit);
  }
  var i = 0;
  var mul = 1;
  var sub = 0;
  this[offset] = value & 255;
  while (++i < byteLength2 && (mul *= 256)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = (value / mul >> 0) - sub & 255;
  }
  return offset + byteLength2;
}, "writeIntLE"), "writeIntLE");
Buffer2.prototype.writeIntBE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function writeIntBE(value, offset, byteLength2, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength2 - 1);
    checkInt(this, value, offset, byteLength2, limit - 1, -limit);
  }
  var i = byteLength2 - 1;
  var mul = 1;
  var sub = 0;
  this[offset + i] = value & 255;
  while (--i >= 0 && (mul *= 256)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = (value / mul >> 0) - sub & 255;
  }
  return offset + byteLength2;
}, "writeIntBE"), "writeIntBE");
Buffer2.prototype.writeInt8 = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function writeInt8(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert)
    checkInt(this, value, offset, 1, 127, -128);
  if (!Buffer2.TYPED_ARRAY_SUPPORT)
    value = Math.floor(value);
  if (value < 0)
    value = 255 + value + 1;
  this[offset] = value & 255;
  return offset + 1;
}, "writeInt8"), "writeInt8");
Buffer2.prototype.writeInt16LE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function writeInt16LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert)
    checkInt(this, value, offset, 2, 32767, -32768);
  if (Buffer2.TYPED_ARRAY_SUPPORT) {
    this[offset] = value & 255;
    this[offset + 1] = value >>> 8;
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2;
}, "writeInt16LE"), "writeInt16LE");
Buffer2.prototype.writeInt16BE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function writeInt16BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert)
    checkInt(this, value, offset, 2, 32767, -32768);
  if (Buffer2.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 8;
    this[offset + 1] = value & 255;
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2;
}, "writeInt16BE"), "writeInt16BE");
Buffer2.prototype.writeInt32LE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function writeInt32LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert)
    checkInt(this, value, offset, 4, 2147483647, -2147483648);
  if (Buffer2.TYPED_ARRAY_SUPPORT) {
    this[offset] = value & 255;
    this[offset + 1] = value >>> 8;
    this[offset + 2] = value >>> 16;
    this[offset + 3] = value >>> 24;
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4;
}, "writeInt32LE"), "writeInt32LE");
Buffer2.prototype.writeInt32BE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function writeInt32BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert)
    checkInt(this, value, offset, 4, 2147483647, -2147483648);
  if (value < 0)
    value = 4294967295 + value + 1;
  if (Buffer2.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 255;
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4;
}, "writeInt32BE"), "writeInt32BE");
function checkIEEE754(buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length)
    throw new RangeError("Index out of range");
  if (offset < 0)
    throw new RangeError("Index out of range");
}
__name(checkIEEE754, "checkIEEE754");
__name2(checkIEEE754, "checkIEEE754");
function writeFloat(buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(
      buf,
      value,
      offset,
      4,
      34028234663852886e22,
      -34028234663852886e22
    );
  }
  ieee754write(buf, value, offset, littleEndian, 23, 4);
  return offset + 4;
}
__name(writeFloat, "writeFloat");
__name2(writeFloat, "writeFloat");
Buffer2.prototype.writeFloatLE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function writeFloatLE(value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert);
}, "writeFloatLE"), "writeFloatLE");
Buffer2.prototype.writeFloatBE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function writeFloatBE(value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert);
}, "writeFloatBE"), "writeFloatBE");
function writeDouble(buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(
      buf,
      value,
      offset,
      8,
      17976931348623157e292,
      -17976931348623157e292
    );
  }
  ieee754write(buf, value, offset, littleEndian, 52, 8);
  return offset + 8;
}
__name(writeDouble, "writeDouble");
__name2(writeDouble, "writeDouble");
Buffer2.prototype.writeDoubleLE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function writeDoubleLE(value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert);
}, "writeDoubleLE"), "writeDoubleLE");
Buffer2.prototype.writeDoubleBE = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function writeDoubleBE(value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert);
}, "writeDoubleBE"), "writeDoubleBE");
Buffer2.prototype.copy = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function copy(target, targetStart, start, end) {
  if (!start)
    start = 0;
  if (!end && end !== 0)
    end = this.length;
  if (targetStart >= target.length)
    targetStart = target.length;
  if (!targetStart)
    targetStart = 0;
  if (end > 0 && end < start)
    end = start;
  if (end === start)
    return 0;
  if (target.length === 0 || this.length === 0)
    return 0;
  if (targetStart < 0) {
    throw new RangeError("targetStart out of bounds");
  }
  if (start < 0 || start >= this.length)
    throw new RangeError("sourceStart out of bounds");
  if (end < 0)
    throw new RangeError("sourceEnd out of bounds");
  if (end > this.length)
    end = this.length;
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start;
  }
  var len = end - start;
  var i;
  if (this === target && start < targetStart && targetStart < end) {
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start];
    }
  } else if (len < 1e3 || !Buffer2.TYPED_ARRAY_SUPPORT) {
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start];
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    );
  }
  return len;
}, "copy"), "copy");
Buffer2.prototype.fill = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function fill(val, start, end, encoding) {
  if (typeof val === "string") {
    if (typeof start === "string") {
      encoding = start;
      start = 0;
      end = this.length;
    } else if (typeof end === "string") {
      encoding = end;
      end = this.length;
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0);
      if (code < 256) {
        val = code;
      }
    }
    if (encoding !== void 0 && typeof encoding !== "string") {
      throw new TypeError("encoding must be a string");
    }
    if (typeof encoding === "string" && !Buffer2.isEncoding(encoding)) {
      throw new TypeError("Unknown encoding: " + encoding);
    }
  } else if (typeof val === "number") {
    val = val & 255;
  }
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError("Out of range index");
  }
  if (end <= start) {
    return this;
  }
  start = start >>> 0;
  end = end === void 0 ? this.length : end >>> 0;
  if (!val)
    val = 0;
  var i;
  if (typeof val === "number") {
    for (i = start; i < end; ++i) {
      this[i] = val;
    }
  } else {
    var bytes = internalIsBuffer(val) ? val : utf8ToBytes(new Buffer2(val, encoding).toString());
    var len = bytes.length;
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len];
    }
  }
  return this;
}, "fill"), "fill");
var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;
function base64clean(str) {
  str = stringtrim(str).replace(INVALID_BASE64_RE, "");
  if (str.length < 2)
    return "";
  while (str.length % 4 !== 0) {
    str = str + "=";
  }
  return str;
}
__name(base64clean, "base64clean");
__name2(base64clean, "base64clean");
function stringtrim(str) {
  if (str.trim)
    return str.trim();
  return str.replace(/^\s+|\s+$/g, "");
}
__name(stringtrim, "stringtrim");
__name2(stringtrim, "stringtrim");
function toHex(n) {
  if (n < 16)
    return "0" + n.toString(16);
  return n.toString(16);
}
__name(toHex, "toHex");
__name2(toHex, "toHex");
function utf8ToBytes(string, units) {
  units = units || Infinity;
  var codePoint;
  var length = string.length;
  var leadSurrogate = null;
  var bytes = [];
  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i);
    if (codePoint > 55295 && codePoint < 57344) {
      if (!leadSurrogate) {
        if (codePoint > 56319) {
          if ((units -= 3) > -1)
            bytes.push(239, 191, 189);
          continue;
        } else if (i + 1 === length) {
          if ((units -= 3) > -1)
            bytes.push(239, 191, 189);
          continue;
        }
        leadSurrogate = codePoint;
        continue;
      }
      if (codePoint < 56320) {
        if ((units -= 3) > -1)
          bytes.push(239, 191, 189);
        leadSurrogate = codePoint;
        continue;
      }
      codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
    } else if (leadSurrogate) {
      if ((units -= 3) > -1)
        bytes.push(239, 191, 189);
    }
    leadSurrogate = null;
    if (codePoint < 128) {
      if ((units -= 1) < 0)
        break;
      bytes.push(codePoint);
    } else if (codePoint < 2048) {
      if ((units -= 2) < 0)
        break;
      bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
    } else if (codePoint < 65536) {
      if ((units -= 3) < 0)
        break;
      bytes.push(
        codePoint >> 12 | 224,
        codePoint >> 6 & 63 | 128,
        codePoint & 63 | 128
      );
    } else if (codePoint < 1114112) {
      if ((units -= 4) < 0)
        break;
      bytes.push(
        codePoint >> 18 | 240,
        codePoint >> 12 & 63 | 128,
        codePoint >> 6 & 63 | 128,
        codePoint & 63 | 128
      );
    } else {
      throw new Error("Invalid code point");
    }
  }
  return bytes;
}
__name(utf8ToBytes, "utf8ToBytes");
__name2(utf8ToBytes, "utf8ToBytes");
function asciiToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    byteArray.push(str.charCodeAt(i) & 255);
  }
  return byteArray;
}
__name(asciiToBytes, "asciiToBytes");
__name2(asciiToBytes, "asciiToBytes");
function utf16leToBytes(str, units) {
  var c, hi, lo;
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0)
      break;
    c = str.charCodeAt(i);
    hi = c >> 8;
    lo = c % 256;
    byteArray.push(lo);
    byteArray.push(hi);
  }
  return byteArray;
}
__name(utf16leToBytes, "utf16leToBytes");
__name2(utf16leToBytes, "utf16leToBytes");
function base64ToBytes(str) {
  return base64toByteArray(base64clean(str));
}
__name(base64ToBytes, "base64ToBytes");
__name2(base64ToBytes, "base64ToBytes");
function blitBuffer(src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if (i + offset >= dst.length || i >= src.length)
      break;
    dst[i + offset] = src[i];
  }
  return i;
}
__name(blitBuffer, "blitBuffer");
__name2(blitBuffer, "blitBuffer");
function isnan(val) {
  return val !== val;
}
__name(isnan, "isnan");
__name2(isnan, "isnan");
function isBuffer(obj) {
  return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj));
}
__name(isBuffer, "isBuffer");
__name2(isBuffer, "isBuffer");
function isFastBuffer(obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj);
}
__name(isFastBuffer, "isFastBuffer");
__name2(isFastBuffer, "isFastBuffer");
function isSlowBuffer(obj) {
  return typeof obj.readFloatLE === "function" && typeof obj.slice === "function" && isFastBuffer(obj.slice(0, 0));
}
__name(isSlowBuffer, "isSlowBuffer");
__name2(isSlowBuffer, "isSlowBuffer");
function ieee754read(buffer, offset, isLE, mLen, nBytes) {
  var e, m;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = -7;
  var i = isLE ? nBytes - 1 : 0;
  var d = isLE ? -1 : 1;
  var s = buffer[offset + i];
  i += d;
  e = s & (1 << -nBits) - 1;
  s >>= -nBits;
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
  }
  m = e & (1 << -nBits) - 1;
  e >>= -nBits;
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
  }
  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : (s ? -1 : 1) * Infinity;
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
}
__name(ieee754read, "ieee754read");
__name2(ieee754read, "ieee754read");
function ieee754write(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
  var i = isLE ? 0 : nBytes - 1;
  var d = isLE ? 1 : -1;
  var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
  value = Math.abs(value);
  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }
    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }
  for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
  }
  e = e << mLen | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
  }
  buffer[offset + i - d] |= s * 128;
}
__name(ieee754write, "ieee754write");
__name2(ieee754write, "ieee754write");
var GITHUB_REPO = "Renderdragonorg/resources_renderdragon";
var GITHUB_BRANCH = "main";
var RAW_BASE_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/refs/heads/${GITHUB_BRANCH}`;
var API_BASE_URL = `https://api.github.com/repos/${GITHUB_REPO}`;
var CACHE_TTL = 3600;
var STALE_TTL = 86400;
var CACHE_VERSION = "v3";
var CATEGORIES = [
  "animations",
  "fonts",
  "images",
  "mcicons",
  "mcsounds",
  "music",
  "presets",
  "resources",
  "sfx"
];
var inflightRequests = /* @__PURE__ */ new Map();
var src_default = {
  async fetch(request, env2, ctx) {
    const startTime2 = Date.now();
    const url = new URL(request.url);
    const path = url.pathname;
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }
    const limiter = await checkApiRateLimit(env2, ip);
    if (!limiter.success) {
      ctx.waitUntil(logAudit(env2, "rate_limit_exceeded", { ip, path }));
      return jsonResponse({ error: "Rate limit exceeded" }, 429, startTime2);
    }
    const queryKey = url.searchParams.get("key");
    if (queryKey && env2?.REVOKED_KEYS) {
      const revoked = await env2.REVOKED_KEYS.get(queryKey);
      if (revoked) {
        ctx.waitUntil(logAudit(env2, "revoked_key_attempt", { ip, key: queryKey }));
        return jsonResponse({ error: "API key has been revoked" }, 403, startTime2);
      }
    }
    if (path === "/favicon.ico") {
      return new Response(null, { status: 204 });
    }
    if (path === "/ui" || path === "/ui/") {
      const auth = await authorizeAdmin(request, env2);
      if (!auth.authorized) {
        ctx.waitUntil(logAudit(env2, "ui_access_failed", {
          ip: request.headers.get("cf-connecting-ip"),
          userAgent: request.headers.get("user-agent"),
          path
        }));
        return new Response(getLoginUI(), {
          headers: { "Content-Type": "text/html", ...corsHeaders() }
        });
      }
      ctx.waitUntil(logAudit(env2, "ui_access_success", {
        ip: request.headers.get("cf-connecting-ip"),
        path
      }));
      const response = new Response(getWebUI(env2.ADMIN_KEY), {
        headers: { "Content-Type": "text/html", ...corsHeaders() }
      });
      if (auth.key === env2.ADMIN_KEY && !getSession(request)) {
        response.headers.append("Set-Cookie", setSession(env2.ADMIN_KEY));
      }
      return response;
    }
    if (path === "/api/credits" && request.method === "GET") {
      const auth = await authorizeAdmin(request, env2);
      if (!auth.authorized) {
        return jsonResponse({ error: auth.error }, auth.status, startTime2);
      }
      return await getCredits(env2);
    }
    if (path === "/api/credits" && request.method === "POST") {
      const auth = await authorizeAdmin(request, env2);
      if (!auth.authorized) {
        ctx.waitUntil(logAudit(env2, "credit_save_unauthorized", { ip, path }));
        return jsonResponse({ error: auth.error }, auth.status, startTime2);
      }
      ctx.waitUntil(logAudit(env2, "credit_save", { ip, path }));
      return await saveCredit(request, env2);
    }
    if (path === "/api/credits" && request.method === "DELETE") {
      const auth = await authorizeAdmin(request, env2);
      if (!auth.authorized) {
        ctx.waitUntil(logAudit(env2, "credit_delete_unauthorized", { ip, path }));
        return jsonResponse({ error: auth.error }, auth.status, startTime2);
      }
      ctx.waitUntil(logAudit(env2, "credit_delete", { ip, path }));
      return await deleteCredit(request, env2);
    }
    if (path === "/api/webhook" && request.method === "POST") {
      return await handleWebhook(request, env2);
    }
    if (path === "/api/cache/purge" && request.method === "POST") {
      const auth = await authorizeAdmin(request, env2);
      if (!auth.authorized) {
        ctx.waitUntil(logAudit(env2, "cache_purge_unauthorized", { ip, path }));
        return jsonResponse({ error: auth.error }, auth.status, startTime2);
      }
      ctx.waitUntil(logAudit(env2, "cache_purge", { ip, path }));
      await updateAllCache(env2);
      return jsonResponse({ success: true, message: "Cache rebuilt" }, 200, startTime2);
    }
    if (path === "/docs" || path === "/docs/") {
      ctx.waitUntil(logAudit(env2, "docs_access", { ip, path }));
      return jsonResponse(getAPIDocs(), 200, startTime2);
    }
    if (path === "/docs/openapi.yaml") {
      return new Response(OPENAPI_SPEC, {
        headers: { "Content-Type": "text/yaml", ...corsHeaders() }
      });
    }
    if ((path === "/music_moods" || path === "/music-moods" || path === "/moods") && request.method === "GET") {
      return await fetchMusicMoods(env2);
    }
    if (request.method !== "GET") {
      return jsonResponse({ error: "Method not allowed" }, 405, startTime2);
    }
    const isCacheable = path === "/all" || path.startsWith("/category/") || path === "/categories" && false;
    try {
      if (isCacheable) {
        const cache = caches.default;
        const cacheKey = new Request(url.toString(), { method: "GET" });
        let response = await cache.match(cacheKey);
        let cacheStatus = "MISS";
        if (response) {
          const cachedAt = response.headers.get("X-Cached-At");
          const age = cachedAt ? Date.now() - parseInt(cachedAt) : STALE_TTL * 1e3;
          if (age < CACHE_TTL * 1e3) {
            cacheStatus = "HIT";
            const data2 = await response.json();
            return jsonResponse(data2, 200, startTime2, cacheStatus);
          }
          if (age < STALE_TTL * 1e3) {
            cacheStatus = "STALE";
            const data2 = await response.json();
            ctx.waitUntil(refreshCache(path, env2, cache, cacheKey));
            return jsonResponse(data2, 200, startTime2, cacheStatus);
          }
        }
        const data = await handleRequest(path, env2);
        const responseToCache = new Response(JSON.stringify(data), {
          headers: {
            "Content-Type": "application/json",
            "X-Cached-At": Date.now().toString(),
            "Cache-Control": `public, max-age=${CACHE_TTL}`,
            ...corsHeaders()
          }
        });
        ctx.waitUntil(cache.put(cacheKey, responseToCache.clone()));
        return jsonResponse(data, 200, startTime2, cacheStatus);
      } else {
        const data = await handleRequest(path, env2);
        return jsonResponse(data, 200, startTime2, "BYPASS");
      }
    } catch (error) {
      console.error("Error:", error);
      return jsonResponse(
        { error: "Internal server error", message: error.message },
        500,
        startTime2
      );
    }
  }
};
async function refreshCache(path, env2, cache, cacheKey) {
  try {
    const data = await handleRequest(path, env2);
    const response = new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "X-Cached-At": Date.now().toString(),
        "Cache-Control": `public, max-age=${CACHE_TTL}`,
        ...corsHeaders()
      }
    });
    await cache.put(cacheKey, response);
  } catch (error) {
    console.error("Cache refresh failed:", error);
  }
}
__name(refreshCache, "refreshCache");
__name2(refreshCache, "refreshCache");
async function handleRequest(path, env2) {
  if (path === "/" || path === "") {
    return {
      name: "Resources RenderDragon API",
      version: "3.0.0",
      description: "API for accessing resources from Renderdragonorg/resources_renderdragon GitHub repository",
      repository: `https://github.com/${GITHUB_REPO}`,
      endpoints: {
        "/": "API information",
        "/ui": "Web UI for managing credits",
        "/categories": "List all available categories",
        "/category/:name": "Get all files from a specific category",
        "/all": "Get all files from all categories",
        "/api/credits": "GET/POST/DELETE credits for resources",
        "/docs": "Full API Documentation (Megadocs)"
      },
      categories: CATEGORIES
    };
  }
  if (path === "/categories") {
    const categories = discoverCategories(await fetchRepoTree(env2));
    return { categories, total: categories.length };
  }
  if (path === "/rate-limit") {
    return await getGitHubRateLimit(env2);
  }
  if (path === "/all") {
    return await fetchAllCategories(env2);
  }
  const categoryMatch = path.match(/^\/category\/(.+)$/);
  if (categoryMatch) {
    const category = categoryMatch[1].toLowerCase();
    return await fetchCategoryData(category, env2);
  }
  const segments = path.split("/").filter(Boolean);
  if (segments.length > 0) {
    return await fetchCategoryData(segments.join("/").toLowerCase(), env2);
  }
  throw new Error("Endpoint not found");
}
__name(handleRequest, "handleRequest");
__name2(handleRequest, "handleRequest");
async function fetchCategoryData(category, env2) {
  const rootCategory = category.split("/")[0];
  if (env2?.RESOURCES_KV) {
    try {
      const cached = await env2.RESOURCES_KV.get(`category:${category}`, "json");
      if (cached) {
        return {
          category,
          files: cached,
          total: cached.length,
          repository: `https://github.com/${GITHUB_REPO}/tree/${GITHUB_BRANCH}/${category}`,
          source: "kv-cache"
        };
      }
    } catch (e) {
      console.warn(`Failed to read from RESOURCES_KV for ${category}:`, e);
    }
  }
  const coalesceKey = `category:${category}`;
  let promise = inflightRequests.get(coalesceKey);
  if (!promise) {
    promise = (async () => {
      const tree = await fetchRepoTree(env2);
      const categories = discoverCategories(tree);
      if (!categories.includes(rootCategory)) {
        return { notFound: true, categories };
      }
      const files = await fetchFolderContents(category, env2, tree, null, categories);
      if (env2?.RESOURCES_KV && files.length > 0) {
        try {
          await env2.RESOURCES_KV.put(
            `category:${category}`,
            JSON.stringify(files)
          );
        } catch (e) {
          console.error(`Failed to write to RESOURCES_KV for ${category}:`, e);
        }
      }
      return { files, categories };
    })();
    inflightRequests.set(coalesceKey, promise);
    promise.finally(() => inflightRequests.delete(coalesceKey));
  }
  const result = await promise;
  if (result.notFound) {
    return {
      error: "Category not found",
      availableCategories: result.categories,
      hint: "Try one of the available categories or a sub-path like 'mcicons/blocks'"
    };
  }
  return {
    category,
    files: result.files,
    total: result.files.length,
    repository: `https://github.com/${GITHUB_REPO}/tree/${GITHUB_BRANCH}/${category}`,
    source: "github-api"
  };
}
__name(fetchCategoryData, "fetchCategoryData");
__name2(fetchCategoryData, "fetchCategoryData");
async function fetchAllCategories(env2) {
  const headers = {
    "User-Agent": "Cloudflare-Worker",
    Accept: "application/vnd.github.v3+json"
  };
  if (env2?.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${env2.GITHUB_TOKEN}`;
  }
  const treeUrl = `${API_BASE_URL}/git/trees/${GITHUB_BRANCH}?recursive=1`;
  const treeResponse = await fetch(treeUrl, { headers });
  if (!treeResponse.ok) {
    throw new Error(`Failed to fetch git tree for all: ${treeResponse.status}`);
  }
  const treeData = await treeResponse.json();
  const tree = treeData.tree || [];
  const categories = discoverCategories(tree);
  const previewMap = {};
  tree.forEach((item) => {
    if (item.type === "blob" && item.path.includes("/PREVIEWS/")) {
      const previewName = item.path.split("/").pop();
      const baseName = previewName.replace(/\.[^/.]+$/, "");
      const encodedPath = item.path.split("/").map((segment) => encodeURIComponent(segment)).join("/");
      previewMap[baseName.toLowerCase()] = `${RAW_BASE_URL}/${encodedPath}`;
    }
  });
  let credits = {};
  if (env2?.CREDITS_KV) {
    credits = await env2.CREDITS_KV.get("credits", "json") || {};
  }
  const allFiles = {};
  let totalFiles = 0;
  categories.forEach((cat) => {
    allFiles[cat] = [];
  });
  tree.forEach((item) => {
    if (item.type !== "blob")
      return;
    if (item.path.includes("/PREVIEWS/"))
      return;
    if (item.path.includes("/_list.json"))
      return;
    const rootCategory = item.path.split("/")[0];
    if (categories.includes(rootCategory)) {
      const pathParts = item.path.split("/");
      const name = pathParts[pathParts.length - 1];
      if (rootCategory === "mcsounds" && !name.toLowerCase().endsWith(".ogg")) {
        return;
      }
      const index = allFiles[rootCategory].length;
      const id = generateId(rootCategory, index, categories);
      const creditKey = `${rootCategory}:${item.path}`;
      let subcategoryField = null;
      if (rootCategory === "mcicons" || rootCategory === "presets" || rootCategory === "mcsounds") {
        const parts = item.path.split("/");
        if (parts.length > 2) {
          subcategoryField = parts.slice(1, -1).join("/");
        }
      }
      let previewUrl = null;
      if (rootCategory === "presets") {
        const baseName = name.replace(/\.[^/.]+$/, "").toLowerCase();
        const subcat = subcategoryField ? subcategoryField.toLowerCase() : "";
        const prefix = subcat === "davinci" ? "d" : subcat === "adobe" ? "a" : "";
        const prefixedName = prefix + baseName;
        if (previewMap[prefixedName]) {
          previewUrl = previewMap[prefixedName];
        } else if (previewMap[baseName]) {
          previewUrl = previewMap[baseName];
        }
      }
      allFiles[rootCategory].push(
        createFileObject(
          name,
          item.path,
          item.size,
          id,
          credits[creditKey] || "",
          subcategoryField,
          previewUrl
        )
      );
      totalFiles++;
    }
  });
  return {
    categories: allFiles,
    totalCategories: categories.length,
    totalFiles,
    source: "github-api-optimized"
  };
}
__name(fetchAllCategories, "fetchAllCategories");
__name2(fetchAllCategories, "fetchAllCategories");
async function getGitHubRateLimit(env2) {
  const headers = {
    "User-Agent": "Cloudflare-Worker",
    Accept: "application/vnd.github.v3+json"
  };
  if (env2?.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${env2.GITHUB_TOKEN}`;
  }
  let response;
  try {
    response = await fetch("https://api.github.com/rate_limit", { headers });
  } catch (error) {
    return { error: "Failed to check rate limit", message: error.message };
  }
  if (response.status === 401 && headers["Authorization"]) {
    console.warn("GitHub token invalid (401). Retrying without token...");
    delete headers["Authorization"];
    try {
      response = await fetch("https://api.github.com/rate_limit", { headers });
    } catch (error) {
      return {
        error: "Failed to check rate limit (fallback)",
        message: error.message
      };
    }
  }
  try {
    if (!response.ok) {
      return { error: "Failed to check rate limit", status: response.status };
    }
    const data = await response.json();
    return {
      rateLimit: {
        limit: data.rate.limit,
        remaining: data.rate.remaining,
        reset: new Date(data.rate.reset * 1e3).toISOString(),
        resetIn: Math.ceil((data.rate.reset * 1e3 - Date.now()) / 1e3 / 60) + " minutes"
      },
      authenticated: !!headers["Authorization"]
    };
  } catch (error) {
    return { error: "Failed to parse rate limit data", message: error.message };
  }
}
__name(getGitHubRateLimit, "getGitHubRateLimit");
__name2(getGitHubRateLimit, "getGitHubRateLimit");
async function fetchMusicMoods(env2) {
  const headers = {
    "User-Agent": "Cloudflare-Worker",
    Accept: "application/vnd.github.raw"
  };
  if (env2?.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${env2.GITHUB_TOKEN}`;
  }
  const url = `${API_BASE_URL}/contents/music/music_moods.json?ref=${GITHUB_BRANCH}`;
  let res = await fetch(url, { headers });
  if (res.status === 401 && headers["Authorization"]) {
    console.warn("GitHub token invalid (401) for music_moods.json. Retrying without token...");
    delete headers["Authorization"];
    res = await fetch(url, { headers });
  }
  if (!res.ok) {
    return jsonResponse(
      { error: "Failed to fetch music_moods.json", upstream: res.status },
      502
    );
  }
  const body = await res.text();
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...corsHeaders()
    }
  });
}
__name(fetchMusicMoods, "fetchMusicMoods");
__name2(fetchMusicMoods, "fetchMusicMoods");
async function fetchRepoTree(env2) {
  const headers = {
    "User-Agent": "Cloudflare-Worker",
    Accept: "application/vnd.github.v3+json"
  };
  if (env2?.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${env2.GITHUB_TOKEN}`;
  }
  const treeUrl = `${API_BASE_URL}/git/trees/${GITHUB_BRANCH}?recursive=1`;
  let treeResponse = await fetch(treeUrl, { headers });
  if (treeResponse.status === 401 && headers["Authorization"]) {
    console.warn(
      `GitHub token invalid (401) for tree fetch. Retrying without token...`
    );
    delete headers["Authorization"];
    treeResponse = await fetch(treeUrl, { headers });
  }
  if (!treeResponse.ok) {
    const remaining = treeResponse.headers.get("X-RateLimit-Remaining");
    const resetTime = treeResponse.headers.get("X-RateLimit-Reset");
    if (treeResponse.status === 403 && remaining === "0") {
      const resetDate = resetTime ? new Date(parseInt(resetTime) * 1e3).toISOString() : "unknown";
      throw new Error(
        `GitHub API rate limit exceeded. Resets at: ${resetDate}`
      );
    }
    throw new Error(`Failed to fetch git tree: ${treeResponse.status}`);
  }
  const treeData = await treeResponse.json();
  if (!treeData.tree || !Array.isArray(treeData.tree))
    return [];
  return treeData.tree;
}
__name(fetchRepoTree, "fetchRepoTree");
__name2(fetchRepoTree, "fetchRepoTree");
function discoverCategories(tree) {
  const categories = CATEGORIES.slice();
  const seen = new Set(categories);
  const extra = [];
  for (const item of tree) {
    if (item.type !== "blob")
      continue;
    if (!item.path.includes("/"))
      continue;
    const root = item.path.split("/")[0];
    if (!/^[a-z0-9][a-z0-9_-]*$/.test(root))
      continue;
    if (seen.has(root))
      continue;
    seen.add(root);
    extra.push(root);
  }
  extra.sort();
  return categories.concat(extra);
}
__name(discoverCategories, "discoverCategories");
__name2(discoverCategories, "discoverCategories");
async function fetchFolderContents(category, env2, tree = null, preloadedCredits = null, categories = null) {
  let credits = preloadedCredits;
  if (!credits) {
    credits = {};
    try {
      if (env2?.CREDITS_KV) {
        const stored = await env2.CREDITS_KV.get("credits", "json");
        if (stored)
          credits = stored;
      }
    } catch (e) {
      console.error("Failed to load credits:", e);
    }
  }
  const treeArray = tree || await fetchRepoTree(env2);
  const categoryList = categories || discoverCategories(treeArray);
  const previewMap = {};
  if (category === "presets" || category.startsWith("presets/")) {
    treeArray.forEach((item) => {
      if (item.type === "blob" && item.path.includes("/PREVIEWS/")) {
        const previewName = item.path.split("/").pop();
        const baseName = previewName.replace(/\.[^/.]+$/, "");
        const encodedPath = item.path.split("/").map((segment) => encodeURIComponent(segment)).join("/");
        previewMap[baseName.toLowerCase()] = `${RAW_BASE_URL}/${encodedPath}`;
      }
    });
  }
  const rootCategory = category.split("/")[0];
  const categoryPrefix = category.endsWith("/") ? category : `${category}/`;
  const allFiles = treeArray.filter((item) => {
    if (item.type !== "blob")
      return false;
    if (item.path !== category && !item.path.startsWith(categoryPrefix))
      return false;
    if (item.path.includes("/PREVIEWS/"))
      return false;
    if (item.path.includes("/_list.json"))
      return false;
    if (rootCategory === "mcsounds") {
      return item.path.toLowerCase().endsWith(".ogg");
    }
    return true;
  }).map((item) => {
    const pathParts = item.path.split("/");
    const name = pathParts[pathParts.length - 1];
    return {
      name,
      path: item.path,
      size: item.size
    };
  });
  return allFiles.map((file, index) => {
    const id = generateId(category, index, categoryList);
    const creditKey = `${category}:${file.path}`;
    let subcategoryField = null;
    if (rootCategory === "mcicons" || rootCategory === "presets" || rootCategory === "mcsounds") {
      const parts = file.path.split("/");
      if (parts.length > 2) {
        subcategoryField = parts.slice(1, -1).join("/");
      }
    }
    let previewUrl = null;
    if (rootCategory === "presets") {
      const baseName = file.name.replace(/\.[^/.]+$/, "").toLowerCase();
      const subcat = subcategoryField ? subcategoryField.toLowerCase() : "";
      const prefix = subcat === "davinci" ? "d" : subcat === "adobe" ? "a" : "";
      const prefixedName = prefix + baseName;
      if (previewMap[prefixedName]) {
        previewUrl = previewMap[prefixedName];
      } else if (previewMap[baseName]) {
        previewUrl = previewMap[baseName];
      }
    }
    return createFileObject(
      file.name,
      file.path,
      file.size,
      id,
      credits[creditKey] || "",
      subcategoryField,
      previewUrl
    );
  });
}
__name(fetchFolderContents, "fetchFolderContents");
__name2(fetchFolderContents, "fetchFolderContents");
function generateId(category, index, categories = CATEGORIES) {
  const rootCategory = category.split("/")[0];
  const categoryIndex = categories.indexOf(rootCategory);
  const baseId = (categoryIndex + 1) * 1e3;
  return baseId + index + 1;
}
__name(generateId, "generateId");
__name2(generateId, "generateId");
function createFileObject(name, path, size, id, credit, subcategory = null, previewUrl = null) {
  const ext = getFileExtension(name);
  const encodedPath = path.split("/").map((segment) => encodeURIComponent(segment)).join("/");
  const titleBase = name.replace(/\.[^/.]+$/, "");
  const title2 = titleBase.split(/[\s_-]+/).map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
  const fileObj = {
    id,
    title: title2,
    credit,
    filename: name,
    ext,
    url: `${RAW_BASE_URL}/${encodedPath}`,
    size: size || 0
  };
  if (subcategory) {
    fileObj.subcategory = subcategory;
  }
  if (previewUrl) {
    fileObj.preview = previewUrl;
  }
  return fileObj;
}
__name(createFileObject, "createFileObject");
__name2(createFileObject, "createFileObject");
function getFileExtension(filename) {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}
__name(getFileExtension, "getFileExtension");
__name2(getFileExtension, "getFileExtension");
async function getCredits(env2) {
  try {
    if (!env2?.CREDITS_KV) {
      return jsonResponse({ error: "Credits storage not configured" }, 500);
    }
    const credits = await env2.CREDITS_KV.get("credits", "json") || {};
    return jsonResponse({ credits });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}
__name(getCredits, "getCredits");
__name2(getCredits, "getCredits");
async function saveCredit(request, env2) {
  try {
    if (!env2?.CREDITS_KV) {
      return jsonResponse({ error: "Credits storage not configured" }, 500);
    }
    const body = await request.json();
    const { category, path, credit } = body;
    if (!category || !path) {
      return jsonResponse({ error: "Missing category or path" }, 400);
    }
    const credits = await env2.CREDITS_KV.get("credits", "json") || {};
    const key = `${category}:${path}`;
    credits[key] = credit || "";
    await env2.CREDITS_KV.put("credits", JSON.stringify(credits));
    return jsonResponse({ success: true, key, credit: credits[key] });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}
__name(saveCredit, "saveCredit");
__name2(saveCredit, "saveCredit");
async function deleteCredit(request, env2) {
  try {
    if (!env2?.CREDITS_KV) {
      return jsonResponse({ error: "Credits storage not configured" }, 500);
    }
    const body = await request.json();
    const { category, path } = body;
    if (!category || !path) {
      return jsonResponse({ error: "Missing category or path" }, 400);
    }
    const credits = await env2.CREDITS_KV.get("credits", "json") || {};
    const key = `${category}:${path}`;
    delete credits[key];
    await env2.CREDITS_KV.put("credits", JSON.stringify(credits));
    return jsonResponse({ success: true, deleted: key });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}
__name(deleteCredit, "deleteCredit");
__name2(deleteCredit, "deleteCredit");
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}
__name(corsHeaders, "corsHeaders");
__name2(corsHeaders, "corsHeaders");
function jsonResponse(data, status = 200, startTime2 = Date.now(), cacheStatus = "MISS") {
  const duration = Date.now() - startTime2;
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "X-Response-Time": `${duration}ms`,
      "X-Cache": cacheStatus,
      "X-Cache-Version": CACHE_VERSION,
      ...corsHeaders()
    }
  });
}
__name(jsonResponse, "jsonResponse");
__name2(jsonResponse, "jsonResponse");
function getLoginUI() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resources RenderDragon - Login</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0d1117;
      color: #c9d1d9;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .login-container {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 40px;
      width: 100%;
      max-width: 400px;
      text-align: center;
    }
    h1 {
      color: #58a6ff;
      margin-bottom: 10px;
      font-size: 24px;
    }
    .subtitle {
      color: #8b949e;
      margin-bottom: 30px;
      font-size: 14px;
    }
    .form-group {
      margin-bottom: 20px;
      text-align: left;
    }
    label {
      display: block;
      color: #c9d1d9;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 500;
    }
    input[type="password"] {
      width: 100%;
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 10px 15px;
      color: #c9d1d9;
      font-size: 14px;
    }
    input[type="password"]:focus {
      outline: none;
      border-color: #58a6ff;
    }
    .login-btn {
      width: 100%;
      background: #238636;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }
    .login-btn:hover {
      background: #2ea043;
    }
    .login-btn:disabled {
      background: #21262d;
      cursor: not-allowed;
    }
    .error-message {
      background: #f851491a;
      border: 1px solid #f85149;
      color: #f85149;
      padding: 10px;
      border-radius: 6px;
      margin-bottom: 20px;
      font-size: 14px;
      display: none;
    }
    .error-message.show {
      display: block;
    }
  </style>
</head>
<body>
  <div class="login-container">
    <h1>\u{1F354} Resources RenderDragon</h1>
    <p class="subtitle">Enter password to access Credit Manager</p>

    <div class="error-message" id="error-message">
      Invalid password. Please try again.
    </div>

    <form id="login-form">
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" placeholder="Enter admin password" autofocus required>
      </div>
      <button type="submit" class="login-btn" id="login-btn">Unlock UI</button>
    </form>
  </div>

  <script>
    const form = document.getElementById('login-form');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const errorMessage = document.getElementById('error-message');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const password = passwordInput.value.trim();
      if (!password) return;

      loginBtn.disabled = true;
      loginBtn.textContent = 'Verifying...';
      errorMessage.classList.remove('show');

      // Try to access the UI with the provided key
      const url = new URL(window.location.href);
      url.searchParams.set('key', password);

      try {
        const response = await fetch(url.toString());

        if (response.ok) {
          // Password is correct, redirect to UI with key
          window.location.href = url.toString();
        } else {
          // Password is incorrect
          errorMessage.classList.add('show');
          passwordInput.value = '';
          passwordInput.focus();
          loginBtn.disabled = false;
          loginBtn.textContent = 'Unlock UI';
        }
      } catch (error) {
        errorMessage.textContent = 'Connection error. Please try again.';
        errorMessage.classList.add('show');
        loginBtn.disabled = false;
        loginBtn.textContent = 'Unlock UI';
      }
    });
  <\/script>
</body>
</html>`;
}
__name(getLoginUI, "getLoginUI");
__name2(getLoginUI, "getLoginUI");
function getWebUI(adminKey) {
  const keyParam = adminKey ? "?key=" + encodeURIComponent(adminKey) : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resources RenderDragon - Credit Manager</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0d1117;
      color: #c9d1d9;
      min-height: 100vh;
    }
    .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
    header {
      background: #161b22;
      border-bottom: 1px solid #30363d;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
    }
    h1 { color: #58a6ff; margin-bottom: 10px; }
    .subtitle { color: #8b949e; }

    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .tab {
      padding: 10px 20px;
      background: #21262d;
      border: 1px solid #30363d;
      border-radius: 6px;
      cursor: pointer;
      color: #c9d1d9;
      transition: all 0.2s;
    }
    .tab:hover { background: #30363d; }
    .tab.active { background: #238636; border-color: #238636; }

    .content { background: #161b22; border-radius: 8px; border: 1px solid #30363d; }

    .category-header {
      padding: 15px 20px;
      border-bottom: 1px solid #30363d;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .category-title { font-size: 18px; color: #58a6ff; }
    .category-count { color: #8b949e; font-size: 14px; }

    .resources-list { max-height: 600px; overflow-y: auto; }

    .resource-item {
      display: grid;
      grid-template-columns: 60px 1fr 200px 100px;
      gap: 15px;
      padding: 12px 20px;
      border-bottom: 1px solid #21262d;
      align-items: center;
    }
    .resource-item:hover { background: #21262d; }

    .resource-id {
      font-family: monospace;
      color: #7ee787;
      font-weight: bold;
    }
    .resource-info { min-width: 0; }
    .resource-title {
      font-weight: 500;
      color: #c9d1d9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .resource-filename {
      font-size: 12px;
      color: #8b949e;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .credit-input {
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 4px;
      padding: 6px 10px;
      color: #c9d1d9;
      width: 100%;
    }
    .credit-input:focus { outline: none; border-color: #58a6ff; }

    .save-btn {
      background: #238636;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    .save-btn:hover { background: #2ea043; }
    .save-btn:disabled { background: #21262d; cursor: not-allowed; }
    .save-btn.saved { background: #1f6feb; }

    .loading {
      text-align: center;
      padding: 40px;
      color: #8b949e;
    }
    .spinner {
      border: 3px solid #30363d;
      border-top: 3px solid #58a6ff;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      animation: spin 1s linear infinite;
      margin: 0 auto 15px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .error { color: #f85149; padding: 20px; text-align: center; }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
    }
    .stat-value { font-size: 24px; color: #58a6ff; font-weight: bold; }
    .stat-label { font-size: 12px; color: #8b949e; margin-top: 5px; }

    .search-box {
      padding: 15px 20px;
      border-bottom: 1px solid #30363d;
    }
    .search-input {
      width: 100%;
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 10px 15px;
      color: #c9d1d9;
      font-size: 14px;
    }
    .search-input:focus { outline: none; border-color: #58a6ff; }

    .toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #238636;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      opacity: 0;
      transition: opacity 0.3s;
      z-index: 1000;
    }
    .toast.show { opacity: 1; }
    .toast.error { background: #f85149; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>\u{1F354} Resources RenderDragon</h1>
      <p class="subtitle">Credit Manager - View and edit credits for resources</p>
    </header>

    <div class="stats" id="stats">
      <div class="stat-card">
        <div class="stat-value" id="total-resources">-</div>
        <div class="stat-label">Total Resources</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="total-credits">-</div>
        <div class="stat-label">With Credits</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="total-categories">-</div>
        <div class="stat-label">Categories</div>
      </div>
    </div>

    <div class="tabs" id="tabs"></div>

    <div class="content">
      <div class="category-header">
        <span class="category-title" id="current-category">Select a category</span>
        <span class="category-count" id="current-count"></span>
      </div>
      <div class="search-box">
        <input type="text" class="search-input" id="search" placeholder="Search resources...">
      </div>
      <div class="resources-list" id="resources-list">
        <div class="loading">
          <div class="spinner"></div>
          <div>Select a category to view resources</div>
        </div>
      </div>
    </div>
  </div>

  <div class="toast" id="toast"></div>

  <script>
    const API_BASE = window.location.origin;
    let allData = {};
    let currentCategory = null;
    let credits = {};

    async function init() {
      // Load credits first
      try {
        const res = await fetch(API_BASE + '/api/credits${keyParam}');
        const data = await res.json();
        credits = data.credits || {};
      } catch (e) {
        console.error('Failed to load credits:', e);
      }

      // Load all categories
      try {
        const res = await fetch(API_BASE + '/all${keyParam}');
        allData = await res.json();

        renderTabs();
        updateStats();

        if (allData.categories) {
          const firstCat = Object.keys(allData.categories)[0];
          if (firstCat) selectCategory(firstCat);
        }
      } catch (e) {
        document.getElementById('resources-list').innerHTML =
          '<div class="error">Failed to load resources: ' + e.message + '</div>';
      }
    }



    function renderTabs() {
      const tabs = document.getElementById('tabs');
      if (!allData.categories) return;

      tabs.innerHTML = Object.keys(allData.categories).map(cat => {
        const catFiles = allData.categories[cat];
        const count = Array.isArray(catFiles) ? catFiles.length : 0;
        return '<div class="tab" data-category="' + cat + '">' +
          cat.charAt(0).toUpperCase() + cat.slice(1) +
          ' <small>(' + count + ')</small></div>';
      }).join('');

      tabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.tab');
        if (tab) selectCategory(tab.dataset.category);
      });
    }

    function updateStats() {
      let total = 0;
      let withCredits = 0;

      if (allData.categories) {
        Object.values(allData.categories).forEach(files => {
          if (Array.isArray(files)) {
            total += files.length;
            files.forEach(f => {
              const key = currentCategory + ':' + f.filename;
              if (credits[key]) withCredits++;
            });
          }
        });
      }

      document.getElementById('total-resources').textContent = total;
      document.getElementById('total-credits').textContent = Object.keys(credits).length;
      document.getElementById('total-categories').textContent =
        allData.categories ? Object.keys(allData.categories).length : 0;
    }

    function selectCategory(category) {
      currentCategory = category;

      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelector('.tab[data-category="' + category + '"]')?.classList.add('active');

      document.getElementById('current-category').textContent =
        category.charAt(0).toUpperCase() + category.slice(1);

      const files = allData.categories?.[category];
      const fileList = Array.isArray(files) ? files : [];
      document.getElementById('current-count').textContent = fileList.length + ' resources';

      renderResources(fileList);
    }

    function renderResources(files) {
      const list = document.getElementById('resources-list');
      const searchTerm = document.getElementById('search').value.toLowerCase();

      if (!Array.isArray(files)) {
        list.innerHTML = '<div class="error">Failed to load resources: Invalid data format</div>';
        return;
      }

      const filtered = files.filter(f =>
        f.title.toLowerCase().includes(searchTerm) ||
        f.filename.toLowerCase().includes(searchTerm) ||
        String(f.id).includes(searchTerm)
      );

      if (filtered.length === 0) {
        list.innerHTML = '<div class="loading">No resources found</div>';
        return;
      }

      list.innerHTML = filtered.map(f => {
        const creditKey = currentCategory + ':' + f.filename;
        const credit = credits[creditKey] || f.credit || '';

        return '<div class="resource-item">' +
          '<div class="resource-id">#' + f.id + '</div>' +
          '<div class="resource-info">' +
            '<div class="resource-title" title="' + f.title + '">' + f.title + '</div>' +
            '<div class="resource-filename" title="' + f.filename + '">' + f.filename + '</div>' +
          '</div>' +
          '<input type="text" class="credit-input" data-path="' + f.filename + '" ' +
            'value="' + escapeHtml(credit) + '" placeholder="Enter credit...">' +
          '<button class="save-btn" data-path="' + f.filename + '">Save</button>' +
        '</div>';
      }).join('');

      // Add event listeners
      list.querySelectorAll('.save-btn').forEach(btn => {
        btn.addEventListener('click', () => saveCredit(btn.dataset.path));
      });

      list.querySelectorAll('.credit-input').forEach(input => {
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') saveCredit(input.dataset.path);
        });
      });
    }

    async function saveCredit(path) {
      const input = document.querySelector('.credit-input[data-path="' + path + '"]');
      const btn = document.querySelector('.save-btn[data-path="' + path + '"]');
      const credit = input.value.trim();

      btn.disabled = true;
      btn.textContent = 'Saving...';

      try {
        const res = await fetch(API_BASE + '/api/credits${keyParam}', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: currentCategory, path, credit })
        });

        const data = await res.json();

        if (data.success) {
          credits[currentCategory + ':' + path] = credit;
          btn.textContent = 'Saved!';
          btn.classList.add('saved');
          showToast('Credit saved successfully');
          updateStats();

          setTimeout(() => {
            btn.textContent = 'Save';
            btn.classList.remove('saved');
          }, 2000);
        } else {
          throw new Error(data.error);
        }
      } catch (e) {
        showToast('Failed to save: ' + e.message, true);
        btn.textContent = 'Save';
      }

      btn.disabled = false;
    }

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function showToast(message, isError = false) {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.className = 'toast show' + (isError ? ' error' : '');
      setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // Search functionality
    document.getElementById('search').addEventListener('input', () => {
      if (currentCategory && allData.categories) {
        renderResources(allData.categories[currentCategory] || []);
      }
    });

    // Initialize
    init();
  <\/script>
</body>
</html>`;
}
__name(getWebUI, "getWebUI");
__name2(getWebUI, "getWebUI");
async function handleWebhook(request, env2) {
  try {
    const secret = env2.WEBHOOK_SECRET;
    if (!secret) {
      return jsonResponse({ error: "Webhook secret not configured" }, 500);
    }
    const signature = request.headers.get("x-hub-signature-256");
    if (!signature) {
      return jsonResponse({ error: "Missing signature" }, 401);
    }
    const bodyText = await request.text();
    const verified = await verifySignature(secret, signature, bodyText);
    if (!verified) {
      return jsonResponse({ error: "Invalid signature" }, 401);
    }
    const payload = JSON.parse(bodyText);
    if (payload.ref === `refs/heads/${GITHUB_BRANCH}`) {
      await updateAllCache(env2);
      return jsonResponse({ success: true, message: "Cache updated" });
    }
    return jsonResponse({ success: true, message: "Ignored event" });
  } catch (error) {
    console.error("Webhook error:", error);
    return jsonResponse({ error: error.message }, 500);
  }
}
__name(handleWebhook, "handleWebhook");
__name2(handleWebhook, "handleWebhook");
async function verifySignature(secret, signature, body) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const signatureParts = signature.split("=");
  if (signatureParts.length !== 2)
    return false;
  const signatureHex = signatureParts[1];
  const signatureBytes = new Uint8Array(
    signatureHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  );
  return await crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes,
    encoder.encode(body)
  );
}
__name(verifySignature, "verifySignature");
__name2(verifySignature, "verifySignature");
async function updateAllCache(env2) {
  console.log("Starting cache update via webhook...");
  const tree = await fetchRepoTree(env2);
  const categories = discoverCategories(tree);
  let credits = {};
  try {
    if (env2?.CREDITS_KV) {
      credits = await env2.CREDITS_KV.get("credits", "json") || {};
    }
  } catch (e) {
    console.error("Failed to load credits for cache update:", e);
  }
  let updated = 0;
  for (const category of categories) {
    try {
      const files = await fetchFolderContents(category, env2, tree, credits, categories);
      if (env2?.RESOURCES_KV && files.length > 0) {
        await env2.RESOURCES_KV.put(
          `category:${category}`,
          JSON.stringify(files)
        );
        updated++;
        console.log(`Updated cache for ${category}`);
      }
    } catch (e) {
      console.error(`Failed to update cache for ${category}:`, e);
    }
  }
  console.log(`Cache update complete. Updated ${updated}/${categories.length} categories.`);
}
__name(updateAllCache, "updateAllCache");
__name2(updateAllCache, "updateAllCache");
function getAPIDocs() {
  return {
    info: {
      name: "RenderDragon Resources API",
      version: "3.1.0",
      description: "A structured REST API for accessing and managing gaming resources from the Renderdragonorg/resources_renderdragon repository.",
      repository: `https://github.com/${GITHUB_REPO}`,
      contact: {
        github: "https://github.com/Yxmura"
      }
    },
    authorization: {
      type: "Bearer Token / API Key / Admin Key",
      description: "Access to /ui and /api/credits requires a valid API_KEY or ADMIN_KEY. Public endpoints like /docs are open to all.",
      methods: [
        {
          method: "Header",
          format: "Authorization: Bearer <API_KEY>",
          preferred: true
        },
        {
          method: "Query Parameter",
          format: "?key=<API_KEY>"
        },
        {
          method: "Session Cookie",
          name: "docs_session"
        }
      ]
    },
    endpoints: {
      public: [
        {
          path: "/",
          method: "GET",
          description: "Get API overview and base configuration"
        },
        {
          path: "/docs",
          method: "GET",
          description: "Retrieve this documentation in JSON format"
        },
        {
          path: "/categories",
          method: "GET",
          description: "List all available resource categories",
          response: {
            categories: ["animations", "fonts", "images", "..."],
            total: 7
          }
        },
        {
          path: "/category/:name",
          method: "GET",
          description: "Get all files within a specific category",
          parameters: {
            name: "Category name (e.g., 'images')"
          }
        },
        {
          path: "/all",
          method: "GET",
          description: "Get a complete listing of all resources across all categories"
        },
        {
          path: "/rate-limit",
          method: "GET",
          description: "Check current GitHub API rate limit status"
        }
      ],
      protected: [
        {
          path: "/ui",
          method: "GET",
          description: "Access the Web Management Interface",
          requires_auth: true
        },
        {
          path: "/api/credits",
          method: "GET",
          description: "Retrieve all stored resource credits",
          requires_auth: true
        },
        {
          path: "/api/credits",
          method: "POST",
          description: "Save or update a credit for a specific resource",
          requires_auth: true,
          body: {
            category: "string",
            path: "string (relative path inside category)",
            credit: "string (author name)"
          }
        },
        {
          path: "/api/credits",
          method: "DELETE",
          description: "Remove a credit for a resource",
          requires_auth: true,
          body: {
            category: "string",
            path: "string"
          }
        }
      ]
    },
    status_codes: {
      "200": "Success",
      "401": "Unauthorized: Invalid or missing admin credentials",
      "403": "Forbidden: Key revoked or access denied",
      "404": "Endpoint not found",
      "429": "Rate limit exceeded (60 req/min)",
      "500": "Internal server error"
    }
  };
}
__name(getAPIDocs, "getAPIDocs");
__name2(getAPIDocs, "getAPIDocs");
async function authorizeAdmin(request, env2) {
  if (!env2.ADMIN_KEY)
    return { authorized: true };
  const authHeader = request.headers.get("Authorization");
  const url = new URL(request.url);
  const queryKey = url.searchParams.get("key");
  const sessionKey = getSession(request);
  let key = null;
  if (authHeader) {
    if (authHeader.startsWith("Bearer ")) {
      key = authHeader.substring(7);
    } else {
      key = authHeader;
    }
  } else {
    key = queryKey || sessionKey;
  }
  if (key === env2.ADMIN_KEY || key === env2.API_KEY) {
    if (env2.REVOKED_KEYS) {
      const revoked = await env2.REVOKED_KEYS.get(key);
      if (revoked)
        return { authorized: false, error: "API key has been revoked", status: 403 };
    }
    return { authorized: true, key };
  }
  return { authorized: false, error: "Unauthorized: Invalid or missing admin credentials", status: 401 };
}
__name(authorizeAdmin, "authorizeAdmin");
__name2(authorizeAdmin, "authorizeAdmin");
function getSession(request) {
  const cookie = request.headers.get("Cookie");
  if (!cookie)
    return null;
  const match = cookie.match(/docs_session=([^;]+)/);
  return match ? match[1] : null;
}
__name(getSession, "getSession");
__name2(getSession, "getSession");
function setSession(key) {
  return `docs_session=${key}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600; Secure`;
}
__name(setSession, "setSession");
__name2(setSession, "setSession");
async function logAudit(env2, event, details) {
  try {
    if (!env2?.CREDITS_KV)
      return;
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const logEntry = {
      timestamp,
      event,
      ...details
    };
    await env2.CREDITS_KV.put(`audit:${timestamp}:${Math.random().toString(36).slice(2, 7)}`, JSON.stringify(logEntry));
  } catch (e) {
    console.error("Audit log failed:", e);
  }
}
__name(logAudit, "logAudit");
__name2(logAudit, "logAudit");
var __rateLimitMemory = /* @__PURE__ */ new Map();
async function checkApiRateLimit(env2, ip) {
  try {
    if (env2?.RATE_LIMITER?.limit) {
      const result = await env2.RATE_LIMITER.limit({ key: ip });
      return { success: result.success, limit: 60, remaining: result.success ? 1 : 0 };
    }
    if (!env2?.CREDITS_KV)
      return { success: true };
    const key = `ratelimit:${ip}`;
    const now = Math.floor(Date.now() / 6e4);
    const windowKey = `${key}:${now}`;
    const seen = __rateLimitMemory.get(windowKey) || 0;
    if (seen >= 60) {
      return { success: false, limit: 60, remaining: 0 };
    }
    __rateLimitMemory.set(windowKey, seen + 1);
    if (__rateLimitMemory.size > 1e4) {
      __rateLimitMemory.clear();
    }
    if (seen === 0) {
      const current = await env2.CREDITS_KV.get(windowKey, "json") || 0;
      if (current >= 60) {
        return { success: false, limit: 60, remaining: 0 };
      }
      await env2.CREDITS_KV.put(windowKey, JSON.stringify(current + 1), { expirationTtl: 120 });
      return { success: true, limit: 60, remaining: 60 - current - 1 };
    }
    return { success: true, limit: 60, remaining: 60 - seen - 1 };
  } catch (e) {
    console.error("Rate limit check failed; allowing request:", e);
    return { success: true };
  }
}
__name(checkApiRateLimit, "checkApiRateLimit");
__name2(checkApiRateLimit, "checkApiRateLimit");
var OPENAPI_SPEC = `openapi: 3.0.3
info:
  title: Hamburger API - Resources RenderDragon
  description: |
    REST API for accessing files from the Renderdragonorg/resources_renderdragon GitHub repository.
    
    This API provides endpoints to list and access various resource files organized by category.
    All files are served via direct raw GitHub URLs with metadata including name, extension, size, and path.
  version: 3.0.0
servers:
  - url: https://hamburger-api.powernplant101-c6b.workers.dev
    description: Production server
tags:
  - name: Info
    description: API information and metadata
  - name: Categories
    description: Category management and listing
  - name: Files
    description: File retrieval and listing
  - name: Credits
    description: Management of resource credits
paths:
  /:
    get:
      tags: [Info]
      summary: Get API information
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiInfo'
  /categories:
    get:
      tags: [Categories]
      summary: List all categories
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CategoriesResponse'
  /category/{categoryName}:
    get:
      tags: [Files]
      summary: Get files from a category
      parameters:
        - name: categoryName
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CategoryFilesResponse'
  /all:
    get:
      tags: [Files]
      summary: Get all files from all categories
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AllFilesResponse'
  /api/credits:
    get:
      tags: [Credits]
      summary: Get all credits
      security: [{ ApiKeyAuth: [] }]
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CreditsResponse'
    post:
      tags: [Credits]
      summary: Save a credit
      security: [{ ApiKeyAuth: [] }]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SaveCreditRequest'
      responses:
        '200':
          description: Success
    delete:
      tags: [Credits]
      summary: Delete a credit
      security: [{ ApiKeyAuth: [] }]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DeleteCreditRequest'
      responses:
        '200':
          description: Success
components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: query
      name: key
  schemas:
    ApiInfo:
      type: object
      properties:
        name: { type: string }
        version: { type: string }
        description: { type: string }
        repository: { type: string }
        endpoints: { type: object, additionalProperties: { type: string } }
        categories: { type: array, items: { type: string } }
    CategoriesResponse:
      type: object
      properties:
        categories: { type: array, items: { type: string } }
        total: { type: integer }
    FileObject:
      type: object
      properties:
        id: { type: integer }
        title: { type: string }
        filename: { type: string }
        ext: { type: string }
        url: { type: string }
        size: { type: integer }
        credit: { type: string }
    CategoryFilesResponse:
      type: object
      properties:
        category: { type: string }
        files: { type: array, items: { $ref: '#/components/schemas/FileObject' } }
        total: { type: integer }
        repository: { type: string }
    AllFilesResponse:
      type: object
      properties:
        categories: { type: object, additionalProperties: { type: array, items: { $ref: '#/components/schemas/FileObject' } } }
        totalCategories: { type: integer }
        totalFiles: { type: integer }
    CreditsResponse:
      type: object
      properties:
        credits: { type: object, additionalProperties: { type: string } }
    SaveCreditRequest:
      type: object
      required: [category, path, credit]
      properties:
        category: { type: string }
        path: { type: string }
        credit: { type: string }
    DeleteCreditRequest:
      type: object
      required: [category, path]
      properties:
        category: { type: string }
        path: { type: string }
`;
export {
  src_default as default
};
/*! Bundled license information:

@esbuild-plugins/node-globals-polyfill/Buffer.js:
  (*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
   * @license  MIT
   *)
*/
//# sourceMappingURL=index.js.map