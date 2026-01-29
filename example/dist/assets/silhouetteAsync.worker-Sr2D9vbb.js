(function() {
  "use strict";
  /**
   * @license
   * Copyright 2010-2025 Three.js Authors
   * SPDX-License-Identifier: MIT
   */
  const REVISION = "182";
  const UVMapping = 300;
  const RepeatWrapping = 1e3;
  const ClampToEdgeWrapping = 1001;
  const MirroredRepeatWrapping = 1002;
  const LinearFilter = 1006;
  const LinearMipmapLinearFilter = 1008;
  const UnsignedByteType = 1009;
  const FloatType = 1015;
  const RGBAFormat = 1023;
  const NoColorSpace = "";
  const StaticDrawUsage = 35044;
  const WebGLCoordinateSystem = 2e3;
  const WebGPUCoordinateSystem = 2001;
  function arrayNeedsUint32(array) {
    for (let i = array.length - 1; i >= 0; --i) {
      if (array[i] >= 65535) return true;
    }
    return false;
  }
  function createElementNS(name) {
    return document.createElementNS("http://www.w3.org/1999/xhtml", name);
  }
  function warn(...params) {
    const message = "THREE." + params.shift();
    {
      console.warn(message, ...params);
    }
  }
  function error(...params) {
    const message = "THREE." + params.shift();
    {
      console.error(message, ...params);
    }
  }
  class EventDispatcher {
    /**
     * Adds the given event listener to the given event type.
     *
     * @param {string} type - The type of event to listen to.
     * @param {Function} listener - The function that gets called when the event is fired.
     */
    addEventListener(type, listener) {
      if (this._listeners === void 0) this._listeners = {};
      const listeners = this._listeners;
      if (listeners[type] === void 0) {
        listeners[type] = [];
      }
      if (listeners[type].indexOf(listener) === -1) {
        listeners[type].push(listener);
      }
    }
    /**
     * Returns `true` if the given event listener has been added to the given event type.
     *
     * @param {string} type - The type of event.
     * @param {Function} listener - The listener to check.
     * @return {boolean} Whether the given event listener has been added to the given event type.
     */
    hasEventListener(type, listener) {
      const listeners = this._listeners;
      if (listeners === void 0) return false;
      return listeners[type] !== void 0 && listeners[type].indexOf(listener) !== -1;
    }
    /**
     * Removes the given event listener from the given event type.
     *
     * @param {string} type - The type of event.
     * @param {Function} listener - The listener to remove.
     */
    removeEventListener(type, listener) {
      const listeners = this._listeners;
      if (listeners === void 0) return;
      const listenerArray = listeners[type];
      if (listenerArray !== void 0) {
        const index = listenerArray.indexOf(listener);
        if (index !== -1) {
          listenerArray.splice(index, 1);
        }
      }
    }
    /**
     * Dispatches an event object.
     *
     * @param {Object} event - The event that gets fired.
     */
    dispatchEvent(event) {
      const listeners = this._listeners;
      if (listeners === void 0) return;
      const listenerArray = listeners[event.type];
      if (listenerArray !== void 0) {
        event.target = this;
        const array = listenerArray.slice(0);
        for (let i = 0, l = array.length; i < l; i++) {
          array[i].call(this, event);
        }
        event.target = null;
      }
    }
  }
  const _lut = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff"];
  function generateUUID() {
    const d0 = Math.random() * 4294967295 | 0;
    const d1 = Math.random() * 4294967295 | 0;
    const d2 = Math.random() * 4294967295 | 0;
    const d3 = Math.random() * 4294967295 | 0;
    const uuid = _lut[d0 & 255] + _lut[d0 >> 8 & 255] + _lut[d0 >> 16 & 255] + _lut[d0 >> 24 & 255] + "-" + _lut[d1 & 255] + _lut[d1 >> 8 & 255] + "-" + _lut[d1 >> 16 & 15 | 64] + _lut[d1 >> 24 & 255] + "-" + _lut[d2 & 63 | 128] + _lut[d2 >> 8 & 255] + "-" + _lut[d2 >> 16 & 255] + _lut[d2 >> 24 & 255] + _lut[d3 & 255] + _lut[d3 >> 8 & 255] + _lut[d3 >> 16 & 255] + _lut[d3 >> 24 & 255];
    return uuid.toLowerCase();
  }
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  function denormalize(value, array) {
    switch (array.constructor) {
      case Float32Array:
        return value;
      case Uint32Array:
        return value / 4294967295;
      case Uint16Array:
        return value / 65535;
      case Uint8Array:
        return value / 255;
      case Int32Array:
        return Math.max(value / 2147483647, -1);
      case Int16Array:
        return Math.max(value / 32767, -1);
      case Int8Array:
        return Math.max(value / 127, -1);
      default:
        throw new Error("Invalid component type.");
    }
  }
  function normalize(value, array) {
    switch (array.constructor) {
      case Float32Array:
        return value;
      case Uint32Array:
        return Math.round(value * 4294967295);
      case Uint16Array:
        return Math.round(value * 65535);
      case Uint8Array:
        return Math.round(value * 255);
      case Int32Array:
        return Math.round(value * 2147483647);
      case Int16Array:
        return Math.round(value * 32767);
      case Int8Array:
        return Math.round(value * 127);
      default:
        throw new Error("Invalid component type.");
    }
  }
  class Vector2 {
    /**
     * Constructs a new 2D vector.
     *
     * @param {number} [x=0] - The x value of this vector.
     * @param {number} [y=0] - The y value of this vector.
     */
    constructor(x = 0, y = 0) {
      Vector2.prototype.isVector2 = true;
      this.x = x;
      this.y = y;
    }
    /**
     * Alias for {@link Vector2#x}.
     *
     * @type {number}
     */
    get width() {
      return this.x;
    }
    set width(value) {
      this.x = value;
    }
    /**
     * Alias for {@link Vector2#y}.
     *
     * @type {number}
     */
    get height() {
      return this.y;
    }
    set height(value) {
      this.y = value;
    }
    /**
     * Sets the vector components.
     *
     * @param {number} x - The value of the x component.
     * @param {number} y - The value of the y component.
     * @return {Vector2} A reference to this vector.
     */
    set(x, y) {
      this.x = x;
      this.y = y;
      return this;
    }
    /**
     * Sets the vector components to the same value.
     *
     * @param {number} scalar - The value to set for all vector components.
     * @return {Vector2} A reference to this vector.
     */
    setScalar(scalar) {
      this.x = scalar;
      this.y = scalar;
      return this;
    }
    /**
     * Sets the vector's x component to the given value
     *
     * @param {number} x - The value to set.
     * @return {Vector2} A reference to this vector.
     */
    setX(x) {
      this.x = x;
      return this;
    }
    /**
     * Sets the vector's y component to the given value
     *
     * @param {number} y - The value to set.
     * @return {Vector2} A reference to this vector.
     */
    setY(y) {
      this.y = y;
      return this;
    }
    /**
     * Allows to set a vector component with an index.
     *
     * @param {number} index - The component index. `0` equals to x, `1` equals to y.
     * @param {number} value - The value to set.
     * @return {Vector2} A reference to this vector.
     */
    setComponent(index, value) {
      switch (index) {
        case 0:
          this.x = value;
          break;
        case 1:
          this.y = value;
          break;
        default:
          throw new Error("index is out of range: " + index);
      }
      return this;
    }
    /**
     * Returns the value of the vector component which matches the given index.
     *
     * @param {number} index - The component index. `0` equals to x, `1` equals to y.
     * @return {number} A vector component value.
     */
    getComponent(index) {
      switch (index) {
        case 0:
          return this.x;
        case 1:
          return this.y;
        default:
          throw new Error("index is out of range: " + index);
      }
    }
    /**
     * Returns a new vector with copied values from this instance.
     *
     * @return {Vector2} A clone of this instance.
     */
    clone() {
      return new this.constructor(this.x, this.y);
    }
    /**
     * Copies the values of the given vector to this instance.
     *
     * @param {Vector2} v - The vector to copy.
     * @return {Vector2} A reference to this vector.
     */
    copy(v) {
      this.x = v.x;
      this.y = v.y;
      return this;
    }
    /**
     * Adds the given vector to this instance.
     *
     * @param {Vector2} v - The vector to add.
     * @return {Vector2} A reference to this vector.
     */
    add(v) {
      this.x += v.x;
      this.y += v.y;
      return this;
    }
    /**
     * Adds the given scalar value to all components of this instance.
     *
     * @param {number} s - The scalar to add.
     * @return {Vector2} A reference to this vector.
     */
    addScalar(s) {
      this.x += s;
      this.y += s;
      return this;
    }
    /**
     * Adds the given vectors and stores the result in this instance.
     *
     * @param {Vector2} a - The first vector.
     * @param {Vector2} b - The second vector.
     * @return {Vector2} A reference to this vector.
     */
    addVectors(a, b) {
      this.x = a.x + b.x;
      this.y = a.y + b.y;
      return this;
    }
    /**
     * Adds the given vector scaled by the given factor to this instance.
     *
     * @param {Vector2} v - The vector.
     * @param {number} s - The factor that scales `v`.
     * @return {Vector2} A reference to this vector.
     */
    addScaledVector(v, s) {
      this.x += v.x * s;
      this.y += v.y * s;
      return this;
    }
    /**
     * Subtracts the given vector from this instance.
     *
     * @param {Vector2} v - The vector to subtract.
     * @return {Vector2} A reference to this vector.
     */
    sub(v) {
      this.x -= v.x;
      this.y -= v.y;
      return this;
    }
    /**
     * Subtracts the given scalar value from all components of this instance.
     *
     * @param {number} s - The scalar to subtract.
     * @return {Vector2} A reference to this vector.
     */
    subScalar(s) {
      this.x -= s;
      this.y -= s;
      return this;
    }
    /**
     * Subtracts the given vectors and stores the result in this instance.
     *
     * @param {Vector2} a - The first vector.
     * @param {Vector2} b - The second vector.
     * @return {Vector2} A reference to this vector.
     */
    subVectors(a, b) {
      this.x = a.x - b.x;
      this.y = a.y - b.y;
      return this;
    }
    /**
     * Multiplies the given vector with this instance.
     *
     * @param {Vector2} v - The vector to multiply.
     * @return {Vector2} A reference to this vector.
     */
    multiply(v) {
      this.x *= v.x;
      this.y *= v.y;
      return this;
    }
    /**
     * Multiplies the given scalar value with all components of this instance.
     *
     * @param {number} scalar - The scalar to multiply.
     * @return {Vector2} A reference to this vector.
     */
    multiplyScalar(scalar) {
      this.x *= scalar;
      this.y *= scalar;
      return this;
    }
    /**
     * Divides this instance by the given vector.
     *
     * @param {Vector2} v - The vector to divide.
     * @return {Vector2} A reference to this vector.
     */
    divide(v) {
      this.x /= v.x;
      this.y /= v.y;
      return this;
    }
    /**
     * Divides this vector by the given scalar.
     *
     * @param {number} scalar - The scalar to divide.
     * @return {Vector2} A reference to this vector.
     */
    divideScalar(scalar) {
      return this.multiplyScalar(1 / scalar);
    }
    /**
     * Multiplies this vector (with an implicit 1 as the 3rd component) by
     * the given 3x3 matrix.
     *
     * @param {Matrix3} m - The matrix to apply.
     * @return {Vector2} A reference to this vector.
     */
    applyMatrix3(m) {
      const x = this.x, y = this.y;
      const e = m.elements;
      this.x = e[0] * x + e[3] * y + e[6];
      this.y = e[1] * x + e[4] * y + e[7];
      return this;
    }
    /**
     * If this vector's x or y value is greater than the given vector's x or y
     * value, replace that value with the corresponding min value.
     *
     * @param {Vector2} v - The vector.
     * @return {Vector2} A reference to this vector.
     */
    min(v) {
      this.x = Math.min(this.x, v.x);
      this.y = Math.min(this.y, v.y);
      return this;
    }
    /**
     * If this vector's x or y value is less than the given vector's x or y
     * value, replace that value with the corresponding max value.
     *
     * @param {Vector2} v - The vector.
     * @return {Vector2} A reference to this vector.
     */
    max(v) {
      this.x = Math.max(this.x, v.x);
      this.y = Math.max(this.y, v.y);
      return this;
    }
    /**
     * If this vector's x or y value is greater than the max vector's x or y
     * value, it is replaced by the corresponding value.
     * If this vector's x or y value is less than the min vector's x or y value,
     * it is replaced by the corresponding value.
     *
     * @param {Vector2} min - The minimum x and y values.
     * @param {Vector2} max - The maximum x and y values in the desired range.
     * @return {Vector2} A reference to this vector.
     */
    clamp(min, max) {
      this.x = clamp(this.x, min.x, max.x);
      this.y = clamp(this.y, min.y, max.y);
      return this;
    }
    /**
     * If this vector's x or y values are greater than the max value, they are
     * replaced by the max value.
     * If this vector's x or y values are less than the min value, they are
     * replaced by the min value.
     *
     * @param {number} minVal - The minimum value the components will be clamped to.
     * @param {number} maxVal - The maximum value the components will be clamped to.
     * @return {Vector2} A reference to this vector.
     */
    clampScalar(minVal, maxVal) {
      this.x = clamp(this.x, minVal, maxVal);
      this.y = clamp(this.y, minVal, maxVal);
      return this;
    }
    /**
     * If this vector's length is greater than the max value, it is replaced by
     * the max value.
     * If this vector's length is less than the min value, it is replaced by the
     * min value.
     *
     * @param {number} min - The minimum value the vector length will be clamped to.
     * @param {number} max - The maximum value the vector length will be clamped to.
     * @return {Vector2} A reference to this vector.
     */
    clampLength(min, max) {
      const length = this.length();
      return this.divideScalar(length || 1).multiplyScalar(clamp(length, min, max));
    }
    /**
     * The components of this vector are rounded down to the nearest integer value.
     *
     * @return {Vector2} A reference to this vector.
     */
    floor() {
      this.x = Math.floor(this.x);
      this.y = Math.floor(this.y);
      return this;
    }
    /**
     * The components of this vector are rounded up to the nearest integer value.
     *
     * @return {Vector2} A reference to this vector.
     */
    ceil() {
      this.x = Math.ceil(this.x);
      this.y = Math.ceil(this.y);
      return this;
    }
    /**
     * The components of this vector are rounded to the nearest integer value
     *
     * @return {Vector2} A reference to this vector.
     */
    round() {
      this.x = Math.round(this.x);
      this.y = Math.round(this.y);
      return this;
    }
    /**
     * The components of this vector are rounded towards zero (up if negative,
     * down if positive) to an integer value.
     *
     * @return {Vector2} A reference to this vector.
     */
    roundToZero() {
      this.x = Math.trunc(this.x);
      this.y = Math.trunc(this.y);
      return this;
    }
    /**
     * Inverts this vector - i.e. sets x = -x and y = -y.
     *
     * @return {Vector2} A reference to this vector.
     */
    negate() {
      this.x = -this.x;
      this.y = -this.y;
      return this;
    }
    /**
     * Calculates the dot product of the given vector with this instance.
     *
     * @param {Vector2} v - The vector to compute the dot product with.
     * @return {number} The result of the dot product.
     */
    dot(v) {
      return this.x * v.x + this.y * v.y;
    }
    /**
     * Calculates the cross product of the given vector with this instance.
     *
     * @param {Vector2} v - The vector to compute the cross product with.
     * @return {number} The result of the cross product.
     */
    cross(v) {
      return this.x * v.y - this.y * v.x;
    }
    /**
     * Computes the square of the Euclidean length (straight-line length) from
     * (0, 0) to (x, y). If you are comparing the lengths of vectors, you should
     * compare the length squared instead as it is slightly more efficient to calculate.
     *
     * @return {number} The square length of this vector.
     */
    lengthSq() {
      return this.x * this.x + this.y * this.y;
    }
    /**
     * Computes the  Euclidean length (straight-line length) from (0, 0) to (x, y).
     *
     * @return {number} The length of this vector.
     */
    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    /**
     * Computes the Manhattan length of this vector.
     *
     * @return {number} The length of this vector.
     */
    manhattanLength() {
      return Math.abs(this.x) + Math.abs(this.y);
    }
    /**
     * Converts this vector to a unit vector - that is, sets it equal to a vector
     * with the same direction as this one, but with a vector length of `1`.
     *
     * @return {Vector2} A reference to this vector.
     */
    normalize() {
      return this.divideScalar(this.length() || 1);
    }
    /**
     * Computes the angle in radians of this vector with respect to the positive x-axis.
     *
     * @return {number} The angle in radians.
     */
    angle() {
      const angle = Math.atan2(-this.y, -this.x) + Math.PI;
      return angle;
    }
    /**
     * Returns the angle between the given vector and this instance in radians.
     *
     * @param {Vector2} v - The vector to compute the angle with.
     * @return {number} The angle in radians.
     */
    angleTo(v) {
      const denominator = Math.sqrt(this.lengthSq() * v.lengthSq());
      if (denominator === 0) return Math.PI / 2;
      const theta = this.dot(v) / denominator;
      return Math.acos(clamp(theta, -1, 1));
    }
    /**
     * Computes the distance from the given vector to this instance.
     *
     * @param {Vector2} v - The vector to compute the distance to.
     * @return {number} The distance.
     */
    distanceTo(v) {
      return Math.sqrt(this.distanceToSquared(v));
    }
    /**
     * Computes the squared distance from the given vector to this instance.
     * If you are just comparing the distance with another distance, you should compare
     * the distance squared instead as it is slightly more efficient to calculate.
     *
     * @param {Vector2} v - The vector to compute the squared distance to.
     * @return {number} The squared distance.
     */
    distanceToSquared(v) {
      const dx = this.x - v.x, dy = this.y - v.y;
      return dx * dx + dy * dy;
    }
    /**
     * Computes the Manhattan distance from the given vector to this instance.
     *
     * @param {Vector2} v - The vector to compute the Manhattan distance to.
     * @return {number} The Manhattan distance.
     */
    manhattanDistanceTo(v) {
      return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
    }
    /**
     * Sets this vector to a vector with the same direction as this one, but
     * with the specified length.
     *
     * @param {number} length - The new length of this vector.
     * @return {Vector2} A reference to this vector.
     */
    setLength(length) {
      return this.normalize().multiplyScalar(length);
    }
    /**
     * Linearly interpolates between the given vector and this instance, where
     * alpha is the percent distance along the line - alpha = 0 will be this
     * vector, and alpha = 1 will be the given one.
     *
     * @param {Vector2} v - The vector to interpolate towards.
     * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
     * @return {Vector2} A reference to this vector.
     */
    lerp(v, alpha) {
      this.x += (v.x - this.x) * alpha;
      this.y += (v.y - this.y) * alpha;
      return this;
    }
    /**
     * Linearly interpolates between the given vectors, where alpha is the percent
     * distance along the line - alpha = 0 will be first vector, and alpha = 1 will
     * be the second one. The result is stored in this instance.
     *
     * @param {Vector2} v1 - The first vector.
     * @param {Vector2} v2 - The second vector.
     * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
     * @return {Vector2} A reference to this vector.
     */
    lerpVectors(v1, v2, alpha) {
      this.x = v1.x + (v2.x - v1.x) * alpha;
      this.y = v1.y + (v2.y - v1.y) * alpha;
      return this;
    }
    /**
     * Returns `true` if this vector is equal with the given one.
     *
     * @param {Vector2} v - The vector to test for equality.
     * @return {boolean} Whether this vector is equal with the given one.
     */
    equals(v) {
      return v.x === this.x && v.y === this.y;
    }
    /**
     * Sets this vector's x value to be `array[ offset ]` and y
     * value to be `array[ offset + 1 ]`.
     *
     * @param {Array<number>} array - An array holding the vector component values.
     * @param {number} [offset=0] - The offset into the array.
     * @return {Vector2} A reference to this vector.
     */
    fromArray(array, offset = 0) {
      this.x = array[offset];
      this.y = array[offset + 1];
      return this;
    }
    /**
     * Writes the components of this vector to the given array. If no array is provided,
     * the method returns a new instance.
     *
     * @param {Array<number>} [array=[]] - The target array holding the vector components.
     * @param {number} [offset=0] - Index of the first element in the array.
     * @return {Array<number>} The vector components.
     */
    toArray(array = [], offset = 0) {
      array[offset] = this.x;
      array[offset + 1] = this.y;
      return array;
    }
    /**
     * Sets the components of this vector from the given buffer attribute.
     *
     * @param {BufferAttribute} attribute - The buffer attribute holding vector data.
     * @param {number} index - The index into the attribute.
     * @return {Vector2} A reference to this vector.
     */
    fromBufferAttribute(attribute, index) {
      this.x = attribute.getX(index);
      this.y = attribute.getY(index);
      return this;
    }
    /**
     * Rotates this vector around the given center by the given angle.
     *
     * @param {Vector2} center - The point around which to rotate.
     * @param {number} angle - The angle to rotate, in radians.
     * @return {Vector2} A reference to this vector.
     */
    rotateAround(center, angle) {
      const c = Math.cos(angle), s = Math.sin(angle);
      const x = this.x - center.x;
      const y = this.y - center.y;
      this.x = x * c - y * s + center.x;
      this.y = x * s + y * c + center.y;
      return this;
    }
    /**
     * Sets each component of this vector to a pseudo-random value between `0` and
     * `1`, excluding `1`.
     *
     * @return {Vector2} A reference to this vector.
     */
    random() {
      this.x = Math.random();
      this.y = Math.random();
      return this;
    }
    *[Symbol.iterator]() {
      yield this.x;
      yield this.y;
    }
  }
  class Quaternion {
    /**
     * Constructs a new quaternion.
     *
     * @param {number} [x=0] - The x value of this quaternion.
     * @param {number} [y=0] - The y value of this quaternion.
     * @param {number} [z=0] - The z value of this quaternion.
     * @param {number} [w=1] - The w value of this quaternion.
     */
    constructor(x = 0, y = 0, z = 0, w = 1) {
      this.isQuaternion = true;
      this._x = x;
      this._y = y;
      this._z = z;
      this._w = w;
    }
    /**
     * Interpolates between two quaternions via SLERP. This implementation assumes the
     * quaternion data are managed in flat arrays.
     *
     * @param {Array<number>} dst - The destination array.
     * @param {number} dstOffset - An offset into the destination array.
     * @param {Array<number>} src0 - The source array of the first quaternion.
     * @param {number} srcOffset0 - An offset into the first source array.
     * @param {Array<number>} src1 -  The source array of the second quaternion.
     * @param {number} srcOffset1 - An offset into the second source array.
     * @param {number} t - The interpolation factor in the range `[0,1]`.
     * @see {@link Quaternion#slerp}
     */
    static slerpFlat(dst, dstOffset, src0, srcOffset0, src1, srcOffset1, t) {
      let x0 = src0[srcOffset0 + 0], y0 = src0[srcOffset0 + 1], z0 = src0[srcOffset0 + 2], w0 = src0[srcOffset0 + 3];
      let x1 = src1[srcOffset1 + 0], y1 = src1[srcOffset1 + 1], z1 = src1[srcOffset1 + 2], w1 = src1[srcOffset1 + 3];
      if (t <= 0) {
        dst[dstOffset + 0] = x0;
        dst[dstOffset + 1] = y0;
        dst[dstOffset + 2] = z0;
        dst[dstOffset + 3] = w0;
        return;
      }
      if (t >= 1) {
        dst[dstOffset + 0] = x1;
        dst[dstOffset + 1] = y1;
        dst[dstOffset + 2] = z1;
        dst[dstOffset + 3] = w1;
        return;
      }
      if (w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1) {
        let dot = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1;
        if (dot < 0) {
          x1 = -x1;
          y1 = -y1;
          z1 = -z1;
          w1 = -w1;
          dot = -dot;
        }
        let s = 1 - t;
        if (dot < 0.9995) {
          const theta = Math.acos(dot);
          const sin = Math.sin(theta);
          s = Math.sin(s * theta) / sin;
          t = Math.sin(t * theta) / sin;
          x0 = x0 * s + x1 * t;
          y0 = y0 * s + y1 * t;
          z0 = z0 * s + z1 * t;
          w0 = w0 * s + w1 * t;
        } else {
          x0 = x0 * s + x1 * t;
          y0 = y0 * s + y1 * t;
          z0 = z0 * s + z1 * t;
          w0 = w0 * s + w1 * t;
          const f = 1 / Math.sqrt(x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0);
          x0 *= f;
          y0 *= f;
          z0 *= f;
          w0 *= f;
        }
      }
      dst[dstOffset] = x0;
      dst[dstOffset + 1] = y0;
      dst[dstOffset + 2] = z0;
      dst[dstOffset + 3] = w0;
    }
    /**
     * Multiplies two quaternions. This implementation assumes the quaternion data are managed
     * in flat arrays.
     *
     * @param {Array<number>} dst - The destination array.
     * @param {number} dstOffset - An offset into the destination array.
     * @param {Array<number>} src0 - The source array of the first quaternion.
     * @param {number} srcOffset0 - An offset into the first source array.
     * @param {Array<number>} src1 -  The source array of the second quaternion.
     * @param {number} srcOffset1 - An offset into the second source array.
     * @return {Array<number>} The destination array.
     * @see {@link Quaternion#multiplyQuaternions}.
     */
    static multiplyQuaternionsFlat(dst, dstOffset, src0, srcOffset0, src1, srcOffset1) {
      const x0 = src0[srcOffset0];
      const y0 = src0[srcOffset0 + 1];
      const z0 = src0[srcOffset0 + 2];
      const w0 = src0[srcOffset0 + 3];
      const x1 = src1[srcOffset1];
      const y1 = src1[srcOffset1 + 1];
      const z1 = src1[srcOffset1 + 2];
      const w1 = src1[srcOffset1 + 3];
      dst[dstOffset] = x0 * w1 + w0 * x1 + y0 * z1 - z0 * y1;
      dst[dstOffset + 1] = y0 * w1 + w0 * y1 + z0 * x1 - x0 * z1;
      dst[dstOffset + 2] = z0 * w1 + w0 * z1 + x0 * y1 - y0 * x1;
      dst[dstOffset + 3] = w0 * w1 - x0 * x1 - y0 * y1 - z0 * z1;
      return dst;
    }
    /**
     * The x value of this quaternion.
     *
     * @type {number}
     * @default 0
     */
    get x() {
      return this._x;
    }
    set x(value) {
      this._x = value;
      this._onChangeCallback();
    }
    /**
     * The y value of this quaternion.
     *
     * @type {number}
     * @default 0
     */
    get y() {
      return this._y;
    }
    set y(value) {
      this._y = value;
      this._onChangeCallback();
    }
    /**
     * The z value of this quaternion.
     *
     * @type {number}
     * @default 0
     */
    get z() {
      return this._z;
    }
    set z(value) {
      this._z = value;
      this._onChangeCallback();
    }
    /**
     * The w value of this quaternion.
     *
     * @type {number}
     * @default 1
     */
    get w() {
      return this._w;
    }
    set w(value) {
      this._w = value;
      this._onChangeCallback();
    }
    /**
     * Sets the quaternion components.
     *
     * @param {number} x - The x value of this quaternion.
     * @param {number} y - The y value of this quaternion.
     * @param {number} z - The z value of this quaternion.
     * @param {number} w - The w value of this quaternion.
     * @return {Quaternion} A reference to this quaternion.
     */
    set(x, y, z, w) {
      this._x = x;
      this._y = y;
      this._z = z;
      this._w = w;
      this._onChangeCallback();
      return this;
    }
    /**
     * Returns a new quaternion with copied values from this instance.
     *
     * @return {Quaternion} A clone of this instance.
     */
    clone() {
      return new this.constructor(this._x, this._y, this._z, this._w);
    }
    /**
     * Copies the values of the given quaternion to this instance.
     *
     * @param {Quaternion} quaternion - The quaternion to copy.
     * @return {Quaternion} A reference to this quaternion.
     */
    copy(quaternion) {
      this._x = quaternion.x;
      this._y = quaternion.y;
      this._z = quaternion.z;
      this._w = quaternion.w;
      this._onChangeCallback();
      return this;
    }
    /**
     * Sets this quaternion from the rotation specified by the given
     * Euler angles.
     *
     * @param {Euler} euler - The Euler angles.
     * @param {boolean} [update=true] - Whether the internal `onChange` callback should be executed or not.
     * @return {Quaternion} A reference to this quaternion.
     */
    setFromEuler(euler, update = true) {
      const x = euler._x, y = euler._y, z = euler._z, order = euler._order;
      const cos = Math.cos;
      const sin = Math.sin;
      const c1 = cos(x / 2);
      const c2 = cos(y / 2);
      const c3 = cos(z / 2);
      const s1 = sin(x / 2);
      const s2 = sin(y / 2);
      const s3 = sin(z / 2);
      switch (order) {
        case "XYZ":
          this._x = s1 * c2 * c3 + c1 * s2 * s3;
          this._y = c1 * s2 * c3 - s1 * c2 * s3;
          this._z = c1 * c2 * s3 + s1 * s2 * c3;
          this._w = c1 * c2 * c3 - s1 * s2 * s3;
          break;
        case "YXZ":
          this._x = s1 * c2 * c3 + c1 * s2 * s3;
          this._y = c1 * s2 * c3 - s1 * c2 * s3;
          this._z = c1 * c2 * s3 - s1 * s2 * c3;
          this._w = c1 * c2 * c3 + s1 * s2 * s3;
          break;
        case "ZXY":
          this._x = s1 * c2 * c3 - c1 * s2 * s3;
          this._y = c1 * s2 * c3 + s1 * c2 * s3;
          this._z = c1 * c2 * s3 + s1 * s2 * c3;
          this._w = c1 * c2 * c3 - s1 * s2 * s3;
          break;
        case "ZYX":
          this._x = s1 * c2 * c3 - c1 * s2 * s3;
          this._y = c1 * s2 * c3 + s1 * c2 * s3;
          this._z = c1 * c2 * s3 - s1 * s2 * c3;
          this._w = c1 * c2 * c3 + s1 * s2 * s3;
          break;
        case "YZX":
          this._x = s1 * c2 * c3 + c1 * s2 * s3;
          this._y = c1 * s2 * c3 + s1 * c2 * s3;
          this._z = c1 * c2 * s3 - s1 * s2 * c3;
          this._w = c1 * c2 * c3 - s1 * s2 * s3;
          break;
        case "XZY":
          this._x = s1 * c2 * c3 - c1 * s2 * s3;
          this._y = c1 * s2 * c3 - s1 * c2 * s3;
          this._z = c1 * c2 * s3 + s1 * s2 * c3;
          this._w = c1 * c2 * c3 + s1 * s2 * s3;
          break;
        default:
          warn("Quaternion: .setFromEuler() encountered an unknown order: " + order);
      }
      if (update === true) this._onChangeCallback();
      return this;
    }
    /**
     * Sets this quaternion from the given axis and angle.
     *
     * @param {Vector3} axis - The normalized axis.
     * @param {number} angle - The angle in radians.
     * @return {Quaternion} A reference to this quaternion.
     */
    setFromAxisAngle(axis, angle) {
      const halfAngle = angle / 2, s = Math.sin(halfAngle);
      this._x = axis.x * s;
      this._y = axis.y * s;
      this._z = axis.z * s;
      this._w = Math.cos(halfAngle);
      this._onChangeCallback();
      return this;
    }
    /**
     * Sets this quaternion from the given rotation matrix.
     *
     * @param {Matrix4} m - A 4x4 matrix of which the upper 3x3 of matrix is a pure rotation matrix (i.e. unscaled).
     * @return {Quaternion} A reference to this quaternion.
     */
    setFromRotationMatrix(m) {
      const te = m.elements, m11 = te[0], m12 = te[4], m13 = te[8], m21 = te[1], m22 = te[5], m23 = te[9], m31 = te[2], m32 = te[6], m33 = te[10], trace = m11 + m22 + m33;
      if (trace > 0) {
        const s = 0.5 / Math.sqrt(trace + 1);
        this._w = 0.25 / s;
        this._x = (m32 - m23) * s;
        this._y = (m13 - m31) * s;
        this._z = (m21 - m12) * s;
      } else if (m11 > m22 && m11 > m33) {
        const s = 2 * Math.sqrt(1 + m11 - m22 - m33);
        this._w = (m32 - m23) / s;
        this._x = 0.25 * s;
        this._y = (m12 + m21) / s;
        this._z = (m13 + m31) / s;
      } else if (m22 > m33) {
        const s = 2 * Math.sqrt(1 + m22 - m11 - m33);
        this._w = (m13 - m31) / s;
        this._x = (m12 + m21) / s;
        this._y = 0.25 * s;
        this._z = (m23 + m32) / s;
      } else {
        const s = 2 * Math.sqrt(1 + m33 - m11 - m22);
        this._w = (m21 - m12) / s;
        this._x = (m13 + m31) / s;
        this._y = (m23 + m32) / s;
        this._z = 0.25 * s;
      }
      this._onChangeCallback();
      return this;
    }
    /**
     * Sets this quaternion to the rotation required to rotate the direction vector
     * `vFrom` to the direction vector `vTo`.
     *
     * @param {Vector3} vFrom - The first (normalized) direction vector.
     * @param {Vector3} vTo - The second (normalized) direction vector.
     * @return {Quaternion} A reference to this quaternion.
     */
    setFromUnitVectors(vFrom, vTo) {
      let r = vFrom.dot(vTo) + 1;
      if (r < 1e-8) {
        r = 0;
        if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {
          this._x = -vFrom.y;
          this._y = vFrom.x;
          this._z = 0;
          this._w = r;
        } else {
          this._x = 0;
          this._y = -vFrom.z;
          this._z = vFrom.y;
          this._w = r;
        }
      } else {
        this._x = vFrom.y * vTo.z - vFrom.z * vTo.y;
        this._y = vFrom.z * vTo.x - vFrom.x * vTo.z;
        this._z = vFrom.x * vTo.y - vFrom.y * vTo.x;
        this._w = r;
      }
      return this.normalize();
    }
    /**
     * Returns the angle between this quaternion and the given one in radians.
     *
     * @param {Quaternion} q - The quaternion to compute the angle with.
     * @return {number} The angle in radians.
     */
    angleTo(q) {
      return 2 * Math.acos(Math.abs(clamp(this.dot(q), -1, 1)));
    }
    /**
     * Rotates this quaternion by a given angular step to the given quaternion.
     * The method ensures that the final quaternion will not overshoot `q`.
     *
     * @param {Quaternion} q - The target quaternion.
     * @param {number} step - The angular step in radians.
     * @return {Quaternion} A reference to this quaternion.
     */
    rotateTowards(q, step) {
      const angle = this.angleTo(q);
      if (angle === 0) return this;
      const t = Math.min(1, step / angle);
      this.slerp(q, t);
      return this;
    }
    /**
     * Sets this quaternion to the identity quaternion; that is, to the
     * quaternion that represents "no rotation".
     *
     * @return {Quaternion} A reference to this quaternion.
     */
    identity() {
      return this.set(0, 0, 0, 1);
    }
    /**
     * Inverts this quaternion via {@link Quaternion#conjugate}. The
     * quaternion is assumed to have unit length.
     *
     * @return {Quaternion} A reference to this quaternion.
     */
    invert() {
      return this.conjugate();
    }
    /**
     * Returns the rotational conjugate of this quaternion. The conjugate of a
     * quaternion represents the same rotation in the opposite direction about
     * the rotational axis.
     *
     * @return {Quaternion} A reference to this quaternion.
     */
    conjugate() {
      this._x *= -1;
      this._y *= -1;
      this._z *= -1;
      this._onChangeCallback();
      return this;
    }
    /**
     * Calculates the dot product of this quaternion and the given one.
     *
     * @param {Quaternion} v - The quaternion to compute the dot product with.
     * @return {number} The result of the dot product.
     */
    dot(v) {
      return this._x * v._x + this._y * v._y + this._z * v._z + this._w * v._w;
    }
    /**
     * Computes the squared Euclidean length (straight-line length) of this quaternion,
     * considered as a 4 dimensional vector. This can be useful if you are comparing the
     * lengths of two quaternions, as this is a slightly more efficient calculation than
     * {@link Quaternion#length}.
     *
     * @return {number} The squared Euclidean length.
     */
    lengthSq() {
      return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
    }
    /**
     * Computes the Euclidean length (straight-line length) of this quaternion,
     * considered as a 4 dimensional vector.
     *
     * @return {number} The Euclidean length.
     */
    length() {
      return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
    }
    /**
     * Normalizes this quaternion - that is, calculated the quaternion that performs
     * the same rotation as this one, but has a length equal to `1`.
     *
     * @return {Quaternion} A reference to this quaternion.
     */
    normalize() {
      let l = this.length();
      if (l === 0) {
        this._x = 0;
        this._y = 0;
        this._z = 0;
        this._w = 1;
      } else {
        l = 1 / l;
        this._x = this._x * l;
        this._y = this._y * l;
        this._z = this._z * l;
        this._w = this._w * l;
      }
      this._onChangeCallback();
      return this;
    }
    /**
     * Multiplies this quaternion by the given one.
     *
     * @param {Quaternion} q - The quaternion.
     * @return {Quaternion} A reference to this quaternion.
     */
    multiply(q) {
      return this.multiplyQuaternions(this, q);
    }
    /**
     * Pre-multiplies this quaternion by the given one.
     *
     * @param {Quaternion} q - The quaternion.
     * @return {Quaternion} A reference to this quaternion.
     */
    premultiply(q) {
      return this.multiplyQuaternions(q, this);
    }
    /**
     * Multiplies the given quaternions and stores the result in this instance.
     *
     * @param {Quaternion} a - The first quaternion.
     * @param {Quaternion} b - The second quaternion.
     * @return {Quaternion} A reference to this quaternion.
     */
    multiplyQuaternions(a, b) {
      const qax = a._x, qay = a._y, qaz = a._z, qaw = a._w;
      const qbx = b._x, qby = b._y, qbz = b._z, qbw = b._w;
      this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
      this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
      this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
      this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
      this._onChangeCallback();
      return this;
    }
    /**
     * Performs a spherical linear interpolation between quaternions.
     *
     * @param {Quaternion} qb - The target quaternion.
     * @param {number} t - The interpolation factor in the closed interval `[0, 1]`.
     * @return {Quaternion} A reference to this quaternion.
     */
    slerp(qb, t) {
      if (t <= 0) return this;
      if (t >= 1) return this.copy(qb);
      let x = qb._x, y = qb._y, z = qb._z, w = qb._w;
      let dot = this.dot(qb);
      if (dot < 0) {
        x = -x;
        y = -y;
        z = -z;
        w = -w;
        dot = -dot;
      }
      let s = 1 - t;
      if (dot < 0.9995) {
        const theta = Math.acos(dot);
        const sin = Math.sin(theta);
        s = Math.sin(s * theta) / sin;
        t = Math.sin(t * theta) / sin;
        this._x = this._x * s + x * t;
        this._y = this._y * s + y * t;
        this._z = this._z * s + z * t;
        this._w = this._w * s + w * t;
        this._onChangeCallback();
      } else {
        this._x = this._x * s + x * t;
        this._y = this._y * s + y * t;
        this._z = this._z * s + z * t;
        this._w = this._w * s + w * t;
        this.normalize();
      }
      return this;
    }
    /**
     * Performs a spherical linear interpolation between the given quaternions
     * and stores the result in this quaternion.
     *
     * @param {Quaternion} qa - The source quaternion.
     * @param {Quaternion} qb - The target quaternion.
     * @param {number} t - The interpolation factor in the closed interval `[0, 1]`.
     * @return {Quaternion} A reference to this quaternion.
     */
    slerpQuaternions(qa, qb, t) {
      return this.copy(qa).slerp(qb, t);
    }
    /**
     * Sets this quaternion to a uniformly random, normalized quaternion.
     *
     * @return {Quaternion} A reference to this quaternion.
     */
    random() {
      const theta1 = 2 * Math.PI * Math.random();
      const theta2 = 2 * Math.PI * Math.random();
      const x0 = Math.random();
      const r1 = Math.sqrt(1 - x0);
      const r2 = Math.sqrt(x0);
      return this.set(
        r1 * Math.sin(theta1),
        r1 * Math.cos(theta1),
        r2 * Math.sin(theta2),
        r2 * Math.cos(theta2)
      );
    }
    /**
     * Returns `true` if this quaternion is equal with the given one.
     *
     * @param {Quaternion} quaternion - The quaternion to test for equality.
     * @return {boolean} Whether this quaternion is equal with the given one.
     */
    equals(quaternion) {
      return quaternion._x === this._x && quaternion._y === this._y && quaternion._z === this._z && quaternion._w === this._w;
    }
    /**
     * Sets this quaternion's components from the given array.
     *
     * @param {Array<number>} array - An array holding the quaternion component values.
     * @param {number} [offset=0] - The offset into the array.
     * @return {Quaternion} A reference to this quaternion.
     */
    fromArray(array, offset = 0) {
      this._x = array[offset];
      this._y = array[offset + 1];
      this._z = array[offset + 2];
      this._w = array[offset + 3];
      this._onChangeCallback();
      return this;
    }
    /**
     * Writes the components of this quaternion to the given array. If no array is provided,
     * the method returns a new instance.
     *
     * @param {Array<number>} [array=[]] - The target array holding the quaternion components.
     * @param {number} [offset=0] - Index of the first element in the array.
     * @return {Array<number>} The quaternion components.
     */
    toArray(array = [], offset = 0) {
      array[offset] = this._x;
      array[offset + 1] = this._y;
      array[offset + 2] = this._z;
      array[offset + 3] = this._w;
      return array;
    }
    /**
     * Sets the components of this quaternion from the given buffer attribute.
     *
     * @param {BufferAttribute} attribute - The buffer attribute holding quaternion data.
     * @param {number} index - The index into the attribute.
     * @return {Quaternion} A reference to this quaternion.
     */
    fromBufferAttribute(attribute, index) {
      this._x = attribute.getX(index);
      this._y = attribute.getY(index);
      this._z = attribute.getZ(index);
      this._w = attribute.getW(index);
      this._onChangeCallback();
      return this;
    }
    /**
     * This methods defines the serialization result of this class. Returns the
     * numerical elements of this quaternion in an array of format `[x, y, z, w]`.
     *
     * @return {Array<number>} The serialized quaternion.
     */
    toJSON() {
      return this.toArray();
    }
    _onChange(callback) {
      this._onChangeCallback = callback;
      return this;
    }
    _onChangeCallback() {
    }
    *[Symbol.iterator]() {
      yield this._x;
      yield this._y;
      yield this._z;
      yield this._w;
    }
  }
  class Vector3 {
    /**
     * Constructs a new 3D vector.
     *
     * @param {number} [x=0] - The x value of this vector.
     * @param {number} [y=0] - The y value of this vector.
     * @param {number} [z=0] - The z value of this vector.
     */
    constructor(x = 0, y = 0, z = 0) {
      Vector3.prototype.isVector3 = true;
      this.x = x;
      this.y = y;
      this.z = z;
    }
    /**
     * Sets the vector components.
     *
     * @param {number} x - The value of the x component.
     * @param {number} y - The value of the y component.
     * @param {number} z - The value of the z component.
     * @return {Vector3} A reference to this vector.
     */
    set(x, y, z) {
      if (z === void 0) z = this.z;
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    }
    /**
     * Sets the vector components to the same value.
     *
     * @param {number} scalar - The value to set for all vector components.
     * @return {Vector3} A reference to this vector.
     */
    setScalar(scalar) {
      this.x = scalar;
      this.y = scalar;
      this.z = scalar;
      return this;
    }
    /**
     * Sets the vector's x component to the given value
     *
     * @param {number} x - The value to set.
     * @return {Vector3} A reference to this vector.
     */
    setX(x) {
      this.x = x;
      return this;
    }
    /**
     * Sets the vector's y component to the given value
     *
     * @param {number} y - The value to set.
     * @return {Vector3} A reference to this vector.
     */
    setY(y) {
      this.y = y;
      return this;
    }
    /**
     * Sets the vector's z component to the given value
     *
     * @param {number} z - The value to set.
     * @return {Vector3} A reference to this vector.
     */
    setZ(z) {
      this.z = z;
      return this;
    }
    /**
     * Allows to set a vector component with an index.
     *
     * @param {number} index - The component index. `0` equals to x, `1` equals to y, `2` equals to z.
     * @param {number} value - The value to set.
     * @return {Vector3} A reference to this vector.
     */
    setComponent(index, value) {
      switch (index) {
        case 0:
          this.x = value;
          break;
        case 1:
          this.y = value;
          break;
        case 2:
          this.z = value;
          break;
        default:
          throw new Error("index is out of range: " + index);
      }
      return this;
    }
    /**
     * Returns the value of the vector component which matches the given index.
     *
     * @param {number} index - The component index. `0` equals to x, `1` equals to y, `2` equals to z.
     * @return {number} A vector component value.
     */
    getComponent(index) {
      switch (index) {
        case 0:
          return this.x;
        case 1:
          return this.y;
        case 2:
          return this.z;
        default:
          throw new Error("index is out of range: " + index);
      }
    }
    /**
     * Returns a new vector with copied values from this instance.
     *
     * @return {Vector3} A clone of this instance.
     */
    clone() {
      return new this.constructor(this.x, this.y, this.z);
    }
    /**
     * Copies the values of the given vector to this instance.
     *
     * @param {Vector3} v - The vector to copy.
     * @return {Vector3} A reference to this vector.
     */
    copy(v) {
      this.x = v.x;
      this.y = v.y;
      this.z = v.z;
      return this;
    }
    /**
     * Adds the given vector to this instance.
     *
     * @param {Vector3} v - The vector to add.
     * @return {Vector3} A reference to this vector.
     */
    add(v) {
      this.x += v.x;
      this.y += v.y;
      this.z += v.z;
      return this;
    }
    /**
     * Adds the given scalar value to all components of this instance.
     *
     * @param {number} s - The scalar to add.
     * @return {Vector3} A reference to this vector.
     */
    addScalar(s) {
      this.x += s;
      this.y += s;
      this.z += s;
      return this;
    }
    /**
     * Adds the given vectors and stores the result in this instance.
     *
     * @param {Vector3} a - The first vector.
     * @param {Vector3} b - The second vector.
     * @return {Vector3} A reference to this vector.
     */
    addVectors(a, b) {
      this.x = a.x + b.x;
      this.y = a.y + b.y;
      this.z = a.z + b.z;
      return this;
    }
    /**
     * Adds the given vector scaled by the given factor to this instance.
     *
     * @param {Vector3|Vector4} v - The vector.
     * @param {number} s - The factor that scales `v`.
     * @return {Vector3} A reference to this vector.
     */
    addScaledVector(v, s) {
      this.x += v.x * s;
      this.y += v.y * s;
      this.z += v.z * s;
      return this;
    }
    /**
     * Subtracts the given vector from this instance.
     *
     * @param {Vector3} v - The vector to subtract.
     * @return {Vector3} A reference to this vector.
     */
    sub(v) {
      this.x -= v.x;
      this.y -= v.y;
      this.z -= v.z;
      return this;
    }
    /**
     * Subtracts the given scalar value from all components of this instance.
     *
     * @param {number} s - The scalar to subtract.
     * @return {Vector3} A reference to this vector.
     */
    subScalar(s) {
      this.x -= s;
      this.y -= s;
      this.z -= s;
      return this;
    }
    /**
     * Subtracts the given vectors and stores the result in this instance.
     *
     * @param {Vector3} a - The first vector.
     * @param {Vector3} b - The second vector.
     * @return {Vector3} A reference to this vector.
     */
    subVectors(a, b) {
      this.x = a.x - b.x;
      this.y = a.y - b.y;
      this.z = a.z - b.z;
      return this;
    }
    /**
     * Multiplies the given vector with this instance.
     *
     * @param {Vector3} v - The vector to multiply.
     * @return {Vector3} A reference to this vector.
     */
    multiply(v) {
      this.x *= v.x;
      this.y *= v.y;
      this.z *= v.z;
      return this;
    }
    /**
     * Multiplies the given scalar value with all components of this instance.
     *
     * @param {number} scalar - The scalar to multiply.
     * @return {Vector3} A reference to this vector.
     */
    multiplyScalar(scalar) {
      this.x *= scalar;
      this.y *= scalar;
      this.z *= scalar;
      return this;
    }
    /**
     * Multiplies the given vectors and stores the result in this instance.
     *
     * @param {Vector3} a - The first vector.
     * @param {Vector3} b - The second vector.
     * @return {Vector3} A reference to this vector.
     */
    multiplyVectors(a, b) {
      this.x = a.x * b.x;
      this.y = a.y * b.y;
      this.z = a.z * b.z;
      return this;
    }
    /**
     * Applies the given Euler rotation to this vector.
     *
     * @param {Euler} euler - The Euler angles.
     * @return {Vector3} A reference to this vector.
     */
    applyEuler(euler) {
      return this.applyQuaternion(_quaternion$4.setFromEuler(euler));
    }
    /**
     * Applies a rotation specified by an axis and an angle to this vector.
     *
     * @param {Vector3} axis - A normalized vector representing the rotation axis.
     * @param {number} angle - The angle in radians.
     * @return {Vector3} A reference to this vector.
     */
    applyAxisAngle(axis, angle) {
      return this.applyQuaternion(_quaternion$4.setFromAxisAngle(axis, angle));
    }
    /**
     * Multiplies this vector with the given 3x3 matrix.
     *
     * @param {Matrix3} m - The 3x3 matrix.
     * @return {Vector3} A reference to this vector.
     */
    applyMatrix3(m) {
      const x = this.x, y = this.y, z = this.z;
      const e = m.elements;
      this.x = e[0] * x + e[3] * y + e[6] * z;
      this.y = e[1] * x + e[4] * y + e[7] * z;
      this.z = e[2] * x + e[5] * y + e[8] * z;
      return this;
    }
    /**
     * Multiplies this vector by the given normal matrix and normalizes
     * the result.
     *
     * @param {Matrix3} m - The normal matrix.
     * @return {Vector3} A reference to this vector.
     */
    applyNormalMatrix(m) {
      return this.applyMatrix3(m).normalize();
    }
    /**
     * Multiplies this vector (with an implicit 1 in the 4th dimension) by m, and
     * divides by perspective.
     *
     * @param {Matrix4} m - The matrix to apply.
     * @return {Vector3} A reference to this vector.
     */
    applyMatrix4(m) {
      const x = this.x, y = this.y, z = this.z;
      const e = m.elements;
      const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
      this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
      this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
      this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;
      return this;
    }
    /**
     * Applies the given Quaternion to this vector.
     *
     * @param {Quaternion} q - The Quaternion.
     * @return {Vector3} A reference to this vector.
     */
    applyQuaternion(q) {
      const vx = this.x, vy = this.y, vz = this.z;
      const qx = q.x, qy = q.y, qz = q.z, qw = q.w;
      const tx = 2 * (qy * vz - qz * vy);
      const ty = 2 * (qz * vx - qx * vz);
      const tz = 2 * (qx * vy - qy * vx);
      this.x = vx + qw * tx + qy * tz - qz * ty;
      this.y = vy + qw * ty + qz * tx - qx * tz;
      this.z = vz + qw * tz + qx * ty - qy * tx;
      return this;
    }
    /**
     * Projects this vector from world space into the camera's normalized
     * device coordinate (NDC) space.
     *
     * @param {Camera} camera - The camera.
     * @return {Vector3} A reference to this vector.
     */
    project(camera) {
      return this.applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
    }
    /**
     * Unprojects this vector from the camera's normalized device coordinate (NDC)
     * space into world space.
     *
     * @param {Camera} camera - The camera.
     * @return {Vector3} A reference to this vector.
     */
    unproject(camera) {
      return this.applyMatrix4(camera.projectionMatrixInverse).applyMatrix4(camera.matrixWorld);
    }
    /**
     * Transforms the direction of this vector by a matrix (the upper left 3 x 3
     * subset of the given 4x4 matrix and then normalizes the result.
     *
     * @param {Matrix4} m - The matrix.
     * @return {Vector3} A reference to this vector.
     */
    transformDirection(m) {
      const x = this.x, y = this.y, z = this.z;
      const e = m.elements;
      this.x = e[0] * x + e[4] * y + e[8] * z;
      this.y = e[1] * x + e[5] * y + e[9] * z;
      this.z = e[2] * x + e[6] * y + e[10] * z;
      return this.normalize();
    }
    /**
     * Divides this instance by the given vector.
     *
     * @param {Vector3} v - The vector to divide.
     * @return {Vector3} A reference to this vector.
     */
    divide(v) {
      this.x /= v.x;
      this.y /= v.y;
      this.z /= v.z;
      return this;
    }
    /**
     * Divides this vector by the given scalar.
     *
     * @param {number} scalar - The scalar to divide.
     * @return {Vector3} A reference to this vector.
     */
    divideScalar(scalar) {
      return this.multiplyScalar(1 / scalar);
    }
    /**
     * If this vector's x, y or z value is greater than the given vector's x, y or z
     * value, replace that value with the corresponding min value.
     *
     * @param {Vector3} v - The vector.
     * @return {Vector3} A reference to this vector.
     */
    min(v) {
      this.x = Math.min(this.x, v.x);
      this.y = Math.min(this.y, v.y);
      this.z = Math.min(this.z, v.z);
      return this;
    }
    /**
     * If this vector's x, y or z value is less than the given vector's x, y or z
     * value, replace that value with the corresponding max value.
     *
     * @param {Vector3} v - The vector.
     * @return {Vector3} A reference to this vector.
     */
    max(v) {
      this.x = Math.max(this.x, v.x);
      this.y = Math.max(this.y, v.y);
      this.z = Math.max(this.z, v.z);
      return this;
    }
    /**
     * If this vector's x, y or z value is greater than the max vector's x, y or z
     * value, it is replaced by the corresponding value.
     * If this vector's x, y or z value is less than the min vector's x, y or z value,
     * it is replaced by the corresponding value.
     *
     * @param {Vector3} min - The minimum x, y and z values.
     * @param {Vector3} max - The maximum x, y and z values in the desired range.
     * @return {Vector3} A reference to this vector.
     */
    clamp(min, max) {
      this.x = clamp(this.x, min.x, max.x);
      this.y = clamp(this.y, min.y, max.y);
      this.z = clamp(this.z, min.z, max.z);
      return this;
    }
    /**
     * If this vector's x, y or z values are greater than the max value, they are
     * replaced by the max value.
     * If this vector's x, y or z values are less than the min value, they are
     * replaced by the min value.
     *
     * @param {number} minVal - The minimum value the components will be clamped to.
     * @param {number} maxVal - The maximum value the components will be clamped to.
     * @return {Vector3} A reference to this vector.
     */
    clampScalar(minVal, maxVal) {
      this.x = clamp(this.x, minVal, maxVal);
      this.y = clamp(this.y, minVal, maxVal);
      this.z = clamp(this.z, minVal, maxVal);
      return this;
    }
    /**
     * If this vector's length is greater than the max value, it is replaced by
     * the max value.
     * If this vector's length is less than the min value, it is replaced by the
     * min value.
     *
     * @param {number} min - The minimum value the vector length will be clamped to.
     * @param {number} max - The maximum value the vector length will be clamped to.
     * @return {Vector3} A reference to this vector.
     */
    clampLength(min, max) {
      const length = this.length();
      return this.divideScalar(length || 1).multiplyScalar(clamp(length, min, max));
    }
    /**
     * The components of this vector are rounded down to the nearest integer value.
     *
     * @return {Vector3} A reference to this vector.
     */
    floor() {
      this.x = Math.floor(this.x);
      this.y = Math.floor(this.y);
      this.z = Math.floor(this.z);
      return this;
    }
    /**
     * The components of this vector are rounded up to the nearest integer value.
     *
     * @return {Vector3} A reference to this vector.
     */
    ceil() {
      this.x = Math.ceil(this.x);
      this.y = Math.ceil(this.y);
      this.z = Math.ceil(this.z);
      return this;
    }
    /**
     * The components of this vector are rounded to the nearest integer value
     *
     * @return {Vector3} A reference to this vector.
     */
    round() {
      this.x = Math.round(this.x);
      this.y = Math.round(this.y);
      this.z = Math.round(this.z);
      return this;
    }
    /**
     * The components of this vector are rounded towards zero (up if negative,
     * down if positive) to an integer value.
     *
     * @return {Vector3} A reference to this vector.
     */
    roundToZero() {
      this.x = Math.trunc(this.x);
      this.y = Math.trunc(this.y);
      this.z = Math.trunc(this.z);
      return this;
    }
    /**
     * Inverts this vector - i.e. sets x = -x, y = -y and z = -z.
     *
     * @return {Vector3} A reference to this vector.
     */
    negate() {
      this.x = -this.x;
      this.y = -this.y;
      this.z = -this.z;
      return this;
    }
    /**
     * Calculates the dot product of the given vector with this instance.
     *
     * @param {Vector3} v - The vector to compute the dot product with.
     * @return {number} The result of the dot product.
     */
    dot(v) {
      return this.x * v.x + this.y * v.y + this.z * v.z;
    }
    /**
     * Computes the square of the Euclidean length (straight-line length) from
     * (0, 0, 0) to (x, y, z). If you are comparing the lengths of vectors, you should
     * compare the length squared instead as it is slightly more efficient to calculate.
     *
     * @return {number} The square length of this vector.
     */
    lengthSq() {
      return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    /**
     * Computes the  Euclidean length (straight-line length) from (0, 0, 0) to (x, y, z).
     *
     * @return {number} The length of this vector.
     */
    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    /**
     * Computes the Manhattan length of this vector.
     *
     * @return {number} The length of this vector.
     */
    manhattanLength() {
      return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
    }
    /**
     * Converts this vector to a unit vector - that is, sets it equal to a vector
     * with the same direction as this one, but with a vector length of `1`.
     *
     * @return {Vector3} A reference to this vector.
     */
    normalize() {
      return this.divideScalar(this.length() || 1);
    }
    /**
     * Sets this vector to a vector with the same direction as this one, but
     * with the specified length.
     *
     * @param {number} length - The new length of this vector.
     * @return {Vector3} A reference to this vector.
     */
    setLength(length) {
      return this.normalize().multiplyScalar(length);
    }
    /**
     * Linearly interpolates between the given vector and this instance, where
     * alpha is the percent distance along the line - alpha = 0 will be this
     * vector, and alpha = 1 will be the given one.
     *
     * @param {Vector3} v - The vector to interpolate towards.
     * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
     * @return {Vector3} A reference to this vector.
     */
    lerp(v, alpha) {
      this.x += (v.x - this.x) * alpha;
      this.y += (v.y - this.y) * alpha;
      this.z += (v.z - this.z) * alpha;
      return this;
    }
    /**
     * Linearly interpolates between the given vectors, where alpha is the percent
     * distance along the line - alpha = 0 will be first vector, and alpha = 1 will
     * be the second one. The result is stored in this instance.
     *
     * @param {Vector3} v1 - The first vector.
     * @param {Vector3} v2 - The second vector.
     * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
     * @return {Vector3} A reference to this vector.
     */
    lerpVectors(v1, v2, alpha) {
      this.x = v1.x + (v2.x - v1.x) * alpha;
      this.y = v1.y + (v2.y - v1.y) * alpha;
      this.z = v1.z + (v2.z - v1.z) * alpha;
      return this;
    }
    /**
     * Calculates the cross product of the given vector with this instance.
     *
     * @param {Vector3} v - The vector to compute the cross product with.
     * @return {Vector3} The result of the cross product.
     */
    cross(v) {
      return this.crossVectors(this, v);
    }
    /**
     * Calculates the cross product of the given vectors and stores the result
     * in this instance.
     *
     * @param {Vector3} a - The first vector.
     * @param {Vector3} b - The second vector.
     * @return {Vector3} A reference to this vector.
     */
    crossVectors(a, b) {
      const ax = a.x, ay = a.y, az = a.z;
      const bx = b.x, by = b.y, bz = b.z;
      this.x = ay * bz - az * by;
      this.y = az * bx - ax * bz;
      this.z = ax * by - ay * bx;
      return this;
    }
    /**
     * Projects this vector onto the given one.
     *
     * @param {Vector3} v - The vector to project to.
     * @return {Vector3} A reference to this vector.
     */
    projectOnVector(v) {
      const denominator = v.lengthSq();
      if (denominator === 0) return this.set(0, 0, 0);
      const scalar = v.dot(this) / denominator;
      return this.copy(v).multiplyScalar(scalar);
    }
    /**
     * Projects this vector onto a plane by subtracting this
     * vector projected onto the plane's normal from this vector.
     *
     * @param {Vector3} planeNormal - The plane normal.
     * @return {Vector3} A reference to this vector.
     */
    projectOnPlane(planeNormal) {
      _vector$c.copy(this).projectOnVector(planeNormal);
      return this.sub(_vector$c);
    }
    /**
     * Reflects this vector off a plane orthogonal to the given normal vector.
     *
     * @param {Vector3} normal - The (normalized) normal vector.
     * @return {Vector3} A reference to this vector.
     */
    reflect(normal) {
      return this.sub(_vector$c.copy(normal).multiplyScalar(2 * this.dot(normal)));
    }
    /**
     * Returns the angle between the given vector and this instance in radians.
     *
     * @param {Vector3} v - The vector to compute the angle with.
     * @return {number} The angle in radians.
     */
    angleTo(v) {
      const denominator = Math.sqrt(this.lengthSq() * v.lengthSq());
      if (denominator === 0) return Math.PI / 2;
      const theta = this.dot(v) / denominator;
      return Math.acos(clamp(theta, -1, 1));
    }
    /**
     * Computes the distance from the given vector to this instance.
     *
     * @param {Vector3} v - The vector to compute the distance to.
     * @return {number} The distance.
     */
    distanceTo(v) {
      return Math.sqrt(this.distanceToSquared(v));
    }
    /**
     * Computes the squared distance from the given vector to this instance.
     * If you are just comparing the distance with another distance, you should compare
     * the distance squared instead as it is slightly more efficient to calculate.
     *
     * @param {Vector3} v - The vector to compute the squared distance to.
     * @return {number} The squared distance.
     */
    distanceToSquared(v) {
      const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
      return dx * dx + dy * dy + dz * dz;
    }
    /**
     * Computes the Manhattan distance from the given vector to this instance.
     *
     * @param {Vector3} v - The vector to compute the Manhattan distance to.
     * @return {number} The Manhattan distance.
     */
    manhattanDistanceTo(v) {
      return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
    }
    /**
     * Sets the vector components from the given spherical coordinates.
     *
     * @param {Spherical} s - The spherical coordinates.
     * @return {Vector3} A reference to this vector.
     */
    setFromSpherical(s) {
      return this.setFromSphericalCoords(s.radius, s.phi, s.theta);
    }
    /**
     * Sets the vector components from the given spherical coordinates.
     *
     * @param {number} radius - The radius.
     * @param {number} phi - The phi angle in radians.
     * @param {number} theta - The theta angle in radians.
     * @return {Vector3} A reference to this vector.
     */
    setFromSphericalCoords(radius, phi, theta) {
      const sinPhiRadius = Math.sin(phi) * radius;
      this.x = sinPhiRadius * Math.sin(theta);
      this.y = Math.cos(phi) * radius;
      this.z = sinPhiRadius * Math.cos(theta);
      return this;
    }
    /**
     * Sets the vector components from the given cylindrical coordinates.
     *
     * @param {Cylindrical} c - The cylindrical coordinates.
     * @return {Vector3} A reference to this vector.
     */
    setFromCylindrical(c) {
      return this.setFromCylindricalCoords(c.radius, c.theta, c.y);
    }
    /**
     * Sets the vector components from the given cylindrical coordinates.
     *
     * @param {number} radius - The radius.
     * @param {number} theta - The theta angle in radians.
     * @param {number} y - The y value.
     * @return {Vector3} A reference to this vector.
     */
    setFromCylindricalCoords(radius, theta, y) {
      this.x = radius * Math.sin(theta);
      this.y = y;
      this.z = radius * Math.cos(theta);
      return this;
    }
    /**
     * Sets the vector components to the position elements of the
     * given transformation matrix.
     *
     * @param {Matrix4} m - The 4x4 matrix.
     * @return {Vector3} A reference to this vector.
     */
    setFromMatrixPosition(m) {
      const e = m.elements;
      this.x = e[12];
      this.y = e[13];
      this.z = e[14];
      return this;
    }
    /**
     * Sets the vector components to the scale elements of the
     * given transformation matrix.
     *
     * @param {Matrix4} m - The 4x4 matrix.
     * @return {Vector3} A reference to this vector.
     */
    setFromMatrixScale(m) {
      const sx = this.setFromMatrixColumn(m, 0).length();
      const sy = this.setFromMatrixColumn(m, 1).length();
      const sz = this.setFromMatrixColumn(m, 2).length();
      this.x = sx;
      this.y = sy;
      this.z = sz;
      return this;
    }
    /**
     * Sets the vector components from the specified matrix column.
     *
     * @param {Matrix4} m - The 4x4 matrix.
     * @param {number} index - The column index.
     * @return {Vector3} A reference to this vector.
     */
    setFromMatrixColumn(m, index) {
      return this.fromArray(m.elements, index * 4);
    }
    /**
     * Sets the vector components from the specified matrix column.
     *
     * @param {Matrix3} m - The 3x3 matrix.
     * @param {number} index - The column index.
     * @return {Vector3} A reference to this vector.
     */
    setFromMatrix3Column(m, index) {
      return this.fromArray(m.elements, index * 3);
    }
    /**
     * Sets the vector components from the given Euler angles.
     *
     * @param {Euler} e - The Euler angles to set.
     * @return {Vector3} A reference to this vector.
     */
    setFromEuler(e) {
      this.x = e._x;
      this.y = e._y;
      this.z = e._z;
      return this;
    }
    /**
     * Sets the vector components from the RGB components of the
     * given color.
     *
     * @param {Color} c - The color to set.
     * @return {Vector3} A reference to this vector.
     */
    setFromColor(c) {
      this.x = c.r;
      this.y = c.g;
      this.z = c.b;
      return this;
    }
    /**
     * Returns `true` if this vector is equal with the given one.
     *
     * @param {Vector3} v - The vector to test for equality.
     * @return {boolean} Whether this vector is equal with the given one.
     */
    equals(v) {
      return v.x === this.x && v.y === this.y && v.z === this.z;
    }
    /**
     * Sets this vector's x value to be `array[ offset ]`, y value to be `array[ offset + 1 ]`
     * and z value to be `array[ offset + 2 ]`.
     *
     * @param {Array<number>} array - An array holding the vector component values.
     * @param {number} [offset=0] - The offset into the array.
     * @return {Vector3} A reference to this vector.
     */
    fromArray(array, offset = 0) {
      this.x = array[offset];
      this.y = array[offset + 1];
      this.z = array[offset + 2];
      return this;
    }
    /**
     * Writes the components of this vector to the given array. If no array is provided,
     * the method returns a new instance.
     *
     * @param {Array<number>} [array=[]] - The target array holding the vector components.
     * @param {number} [offset=0] - Index of the first element in the array.
     * @return {Array<number>} The vector components.
     */
    toArray(array = [], offset = 0) {
      array[offset] = this.x;
      array[offset + 1] = this.y;
      array[offset + 2] = this.z;
      return array;
    }
    /**
     * Sets the components of this vector from the given buffer attribute.
     *
     * @param {BufferAttribute} attribute - The buffer attribute holding vector data.
     * @param {number} index - The index into the attribute.
     * @return {Vector3} A reference to this vector.
     */
    fromBufferAttribute(attribute, index) {
      this.x = attribute.getX(index);
      this.y = attribute.getY(index);
      this.z = attribute.getZ(index);
      return this;
    }
    /**
     * Sets each component of this vector to a pseudo-random value between `0` and
     * `1`, excluding `1`.
     *
     * @return {Vector3} A reference to this vector.
     */
    random() {
      this.x = Math.random();
      this.y = Math.random();
      this.z = Math.random();
      return this;
    }
    /**
     * Sets this vector to a uniformly random point on a unit sphere.
     *
     * @return {Vector3} A reference to this vector.
     */
    randomDirection() {
      const theta = Math.random() * Math.PI * 2;
      const u = Math.random() * 2 - 1;
      const c = Math.sqrt(1 - u * u);
      this.x = c * Math.cos(theta);
      this.y = u;
      this.z = c * Math.sin(theta);
      return this;
    }
    *[Symbol.iterator]() {
      yield this.x;
      yield this.y;
      yield this.z;
    }
  }
  const _vector$c = /* @__PURE__ */ new Vector3();
  const _quaternion$4 = /* @__PURE__ */ new Quaternion();
  class Matrix3 {
    /**
     * Constructs a new 3x3 matrix. The arguments are supposed to be
     * in row-major order. If no arguments are provided, the constructor
     * initializes the matrix as an identity matrix.
     *
     * @param {number} [n11] - 1-1 matrix element.
     * @param {number} [n12] - 1-2 matrix element.
     * @param {number} [n13] - 1-3 matrix element.
     * @param {number} [n21] - 2-1 matrix element.
     * @param {number} [n22] - 2-2 matrix element.
     * @param {number} [n23] - 2-3 matrix element.
     * @param {number} [n31] - 3-1 matrix element.
     * @param {number} [n32] - 3-2 matrix element.
     * @param {number} [n33] - 3-3 matrix element.
     */
    constructor(n11, n12, n13, n21, n22, n23, n31, n32, n33) {
      Matrix3.prototype.isMatrix3 = true;
      this.elements = [
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1
      ];
      if (n11 !== void 0) {
        this.set(n11, n12, n13, n21, n22, n23, n31, n32, n33);
      }
    }
    /**
     * Sets the elements of the matrix.The arguments are supposed to be
     * in row-major order.
     *
     * @param {number} [n11] - 1-1 matrix element.
     * @param {number} [n12] - 1-2 matrix element.
     * @param {number} [n13] - 1-3 matrix element.
     * @param {number} [n21] - 2-1 matrix element.
     * @param {number} [n22] - 2-2 matrix element.
     * @param {number} [n23] - 2-3 matrix element.
     * @param {number} [n31] - 3-1 matrix element.
     * @param {number} [n32] - 3-2 matrix element.
     * @param {number} [n33] - 3-3 matrix element.
     * @return {Matrix3} A reference to this matrix.
     */
    set(n11, n12, n13, n21, n22, n23, n31, n32, n33) {
      const te = this.elements;
      te[0] = n11;
      te[1] = n21;
      te[2] = n31;
      te[3] = n12;
      te[4] = n22;
      te[5] = n32;
      te[6] = n13;
      te[7] = n23;
      te[8] = n33;
      return this;
    }
    /**
     * Sets this matrix to the 3x3 identity matrix.
     *
     * @return {Matrix3} A reference to this matrix.
     */
    identity() {
      this.set(
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1
      );
      return this;
    }
    /**
     * Copies the values of the given matrix to this instance.
     *
     * @param {Matrix3} m - The matrix to copy.
     * @return {Matrix3} A reference to this matrix.
     */
    copy(m) {
      const te = this.elements;
      const me = m.elements;
      te[0] = me[0];
      te[1] = me[1];
      te[2] = me[2];
      te[3] = me[3];
      te[4] = me[4];
      te[5] = me[5];
      te[6] = me[6];
      te[7] = me[7];
      te[8] = me[8];
      return this;
    }
    /**
     * Extracts the basis of this matrix into the three axis vectors provided.
     *
     * @param {Vector3} xAxis - The basis's x axis.
     * @param {Vector3} yAxis - The basis's y axis.
     * @param {Vector3} zAxis - The basis's z axis.
     * @return {Matrix3} A reference to this matrix.
     */
    extractBasis(xAxis, yAxis, zAxis) {
      xAxis.setFromMatrix3Column(this, 0);
      yAxis.setFromMatrix3Column(this, 1);
      zAxis.setFromMatrix3Column(this, 2);
      return this;
    }
    /**
     * Set this matrix to the upper 3x3 matrix of the given 4x4 matrix.
     *
     * @param {Matrix4} m - The 4x4 matrix.
     * @return {Matrix3} A reference to this matrix.
     */
    setFromMatrix4(m) {
      const me = m.elements;
      this.set(
        me[0],
        me[4],
        me[8],
        me[1],
        me[5],
        me[9],
        me[2],
        me[6],
        me[10]
      );
      return this;
    }
    /**
     * Post-multiplies this matrix by the given 3x3 matrix.
     *
     * @param {Matrix3} m - The matrix to multiply with.
     * @return {Matrix3} A reference to this matrix.
     */
    multiply(m) {
      return this.multiplyMatrices(this, m);
    }
    /**
     * Pre-multiplies this matrix by the given 3x3 matrix.
     *
     * @param {Matrix3} m - The matrix to multiply with.
     * @return {Matrix3} A reference to this matrix.
     */
    premultiply(m) {
      return this.multiplyMatrices(m, this);
    }
    /**
     * Multiples the given 3x3 matrices and stores the result
     * in this matrix.
     *
     * @param {Matrix3} a - The first matrix.
     * @param {Matrix3} b - The second matrix.
     * @return {Matrix3} A reference to this matrix.
     */
    multiplyMatrices(a, b) {
      const ae = a.elements;
      const be = b.elements;
      const te = this.elements;
      const a11 = ae[0], a12 = ae[3], a13 = ae[6];
      const a21 = ae[1], a22 = ae[4], a23 = ae[7];
      const a31 = ae[2], a32 = ae[5], a33 = ae[8];
      const b11 = be[0], b12 = be[3], b13 = be[6];
      const b21 = be[1], b22 = be[4], b23 = be[7];
      const b31 = be[2], b32 = be[5], b33 = be[8];
      te[0] = a11 * b11 + a12 * b21 + a13 * b31;
      te[3] = a11 * b12 + a12 * b22 + a13 * b32;
      te[6] = a11 * b13 + a12 * b23 + a13 * b33;
      te[1] = a21 * b11 + a22 * b21 + a23 * b31;
      te[4] = a21 * b12 + a22 * b22 + a23 * b32;
      te[7] = a21 * b13 + a22 * b23 + a23 * b33;
      te[2] = a31 * b11 + a32 * b21 + a33 * b31;
      te[5] = a31 * b12 + a32 * b22 + a33 * b32;
      te[8] = a31 * b13 + a32 * b23 + a33 * b33;
      return this;
    }
    /**
     * Multiplies every component of the matrix by the given scalar.
     *
     * @param {number} s - The scalar.
     * @return {Matrix3} A reference to this matrix.
     */
    multiplyScalar(s) {
      const te = this.elements;
      te[0] *= s;
      te[3] *= s;
      te[6] *= s;
      te[1] *= s;
      te[4] *= s;
      te[7] *= s;
      te[2] *= s;
      te[5] *= s;
      te[8] *= s;
      return this;
    }
    /**
     * Computes and returns the determinant of this matrix.
     *
     * @return {number} The determinant.
     */
    determinant() {
      const te = this.elements;
      const a = te[0], b = te[1], c = te[2], d = te[3], e = te[4], f = te[5], g = te[6], h = te[7], i = te[8];
      return a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;
    }
    /**
     * Inverts this matrix, using the [analytic method](https://en.wikipedia.org/wiki/Invertible_matrix#Analytic_solution).
     * You can not invert with a determinant of zero. If you attempt this, the method produces
     * a zero matrix instead.
     *
     * @return {Matrix3} A reference to this matrix.
     */
    invert() {
      const te = this.elements, n11 = te[0], n21 = te[1], n31 = te[2], n12 = te[3], n22 = te[4], n32 = te[5], n13 = te[6], n23 = te[7], n33 = te[8], t11 = n33 * n22 - n32 * n23, t12 = n32 * n13 - n33 * n12, t13 = n23 * n12 - n22 * n13, det = n11 * t11 + n21 * t12 + n31 * t13;
      if (det === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
      const detInv = 1 / det;
      te[0] = t11 * detInv;
      te[1] = (n31 * n23 - n33 * n21) * detInv;
      te[2] = (n32 * n21 - n31 * n22) * detInv;
      te[3] = t12 * detInv;
      te[4] = (n33 * n11 - n31 * n13) * detInv;
      te[5] = (n31 * n12 - n32 * n11) * detInv;
      te[6] = t13 * detInv;
      te[7] = (n21 * n13 - n23 * n11) * detInv;
      te[8] = (n22 * n11 - n21 * n12) * detInv;
      return this;
    }
    /**
     * Transposes this matrix in place.
     *
     * @return {Matrix3} A reference to this matrix.
     */
    transpose() {
      let tmp2;
      const m = this.elements;
      tmp2 = m[1];
      m[1] = m[3];
      m[3] = tmp2;
      tmp2 = m[2];
      m[2] = m[6];
      m[6] = tmp2;
      tmp2 = m[5];
      m[5] = m[7];
      m[7] = tmp2;
      return this;
    }
    /**
     * Computes the normal matrix which is the inverse transpose of the upper
     * left 3x3 portion of the given 4x4 matrix.
     *
     * @param {Matrix4} matrix4 - The 4x4 matrix.
     * @return {Matrix3} A reference to this matrix.
     */
    getNormalMatrix(matrix4) {
      return this.setFromMatrix4(matrix4).invert().transpose();
    }
    /**
     * Transposes this matrix into the supplied array, and returns itself unchanged.
     *
     * @param {Array<number>} r - An array to store the transposed matrix elements.
     * @return {Matrix3} A reference to this matrix.
     */
    transposeIntoArray(r) {
      const m = this.elements;
      r[0] = m[0];
      r[1] = m[3];
      r[2] = m[6];
      r[3] = m[1];
      r[4] = m[4];
      r[5] = m[7];
      r[6] = m[2];
      r[7] = m[5];
      r[8] = m[8];
      return this;
    }
    /**
     * Sets the UV transform matrix from offset, repeat, rotation, and center.
     *
     * @param {number} tx - Offset x.
     * @param {number} ty - Offset y.
     * @param {number} sx - Repeat x.
     * @param {number} sy - Repeat y.
     * @param {number} rotation - Rotation, in radians. Positive values rotate counterclockwise.
     * @param {number} cx - Center x of rotation.
     * @param {number} cy - Center y of rotation
     * @return {Matrix3} A reference to this matrix.
     */
    setUvTransform(tx, ty, sx, sy, rotation, cx, cy) {
      const c = Math.cos(rotation);
      const s = Math.sin(rotation);
      this.set(
        sx * c,
        sx * s,
        -sx * (c * cx + s * cy) + cx + tx,
        -sy * s,
        sy * c,
        -sy * (-s * cx + c * cy) + cy + ty,
        0,
        0,
        1
      );
      return this;
    }
    /**
     * Scales this matrix with the given scalar values.
     *
     * @param {number} sx - The amount to scale in the X axis.
     * @param {number} sy - The amount to scale in the Y axis.
     * @return {Matrix3} A reference to this matrix.
     */
    scale(sx, sy) {
      this.premultiply(_m3.makeScale(sx, sy));
      return this;
    }
    /**
     * Rotates this matrix by the given angle.
     *
     * @param {number} theta - The rotation in radians.
     * @return {Matrix3} A reference to this matrix.
     */
    rotate(theta) {
      this.premultiply(_m3.makeRotation(-theta));
      return this;
    }
    /**
     * Translates this matrix by the given scalar values.
     *
     * @param {number} tx - The amount to translate in the X axis.
     * @param {number} ty - The amount to translate in the Y axis.
     * @return {Matrix3} A reference to this matrix.
     */
    translate(tx, ty) {
      this.premultiply(_m3.makeTranslation(tx, ty));
      return this;
    }
    // for 2D Transforms
    /**
     * Sets this matrix as a 2D translation transform.
     *
     * @param {number|Vector2} x - The amount to translate in the X axis or alternatively a translation vector.
     * @param {number} y - The amount to translate in the Y axis.
     * @return {Matrix3} A reference to this matrix.
     */
    makeTranslation(x, y) {
      if (x.isVector2) {
        this.set(
          1,
          0,
          x.x,
          0,
          1,
          x.y,
          0,
          0,
          1
        );
      } else {
        this.set(
          1,
          0,
          x,
          0,
          1,
          y,
          0,
          0,
          1
        );
      }
      return this;
    }
    /**
     * Sets this matrix as a 2D rotational transformation.
     *
     * @param {number} theta - The rotation in radians.
     * @return {Matrix3} A reference to this matrix.
     */
    makeRotation(theta) {
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      this.set(
        c,
        -s,
        0,
        s,
        c,
        0,
        0,
        0,
        1
      );
      return this;
    }
    /**
     * Sets this matrix as a 2D scale transform.
     *
     * @param {number} x - The amount to scale in the X axis.
     * @param {number} y - The amount to scale in the Y axis.
     * @return {Matrix3} A reference to this matrix.
     */
    makeScale(x, y) {
      this.set(
        x,
        0,
        0,
        0,
        y,
        0,
        0,
        0,
        1
      );
      return this;
    }
    /**
     * Returns `true` if this matrix is equal with the given one.
     *
     * @param {Matrix3} matrix - The matrix to test for equality.
     * @return {boolean} Whether this matrix is equal with the given one.
     */
    equals(matrix) {
      const te = this.elements;
      const me = matrix.elements;
      for (let i = 0; i < 9; i++) {
        if (te[i] !== me[i]) return false;
      }
      return true;
    }
    /**
     * Sets the elements of the matrix from the given array.
     *
     * @param {Array<number>} array - The matrix elements in column-major order.
     * @param {number} [offset=0] - Index of the first element in the array.
     * @return {Matrix3} A reference to this matrix.
     */
    fromArray(array, offset = 0) {
      for (let i = 0; i < 9; i++) {
        this.elements[i] = array[i + offset];
      }
      return this;
    }
    /**
     * Writes the elements of this matrix to the given array. If no array is provided,
     * the method returns a new instance.
     *
     * @param {Array<number>} [array=[]] - The target array holding the matrix elements in column-major order.
     * @param {number} [offset=0] - Index of the first element in the array.
     * @return {Array<number>} The matrix elements in column-major order.
     */
    toArray(array = [], offset = 0) {
      const te = this.elements;
      array[offset] = te[0];
      array[offset + 1] = te[1];
      array[offset + 2] = te[2];
      array[offset + 3] = te[3];
      array[offset + 4] = te[4];
      array[offset + 5] = te[5];
      array[offset + 6] = te[6];
      array[offset + 7] = te[7];
      array[offset + 8] = te[8];
      return array;
    }
    /**
     * Returns a matrix with copied values from this instance.
     *
     * @return {Matrix3} A clone of this instance.
     */
    clone() {
      return new this.constructor().fromArray(this.elements);
    }
  }
  const _m3 = /* @__PURE__ */ new Matrix3();
  function SRGBToLinear(c) {
    return c < 0.04045 ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);
  }
  let _canvas;
  class ImageUtils {
    /**
     * Returns a data URI containing a representation of the given image.
     *
     * @param {(HTMLImageElement|HTMLCanvasElement)} image - The image object.
     * @param {string} [type='image/png'] - Indicates the image format.
     * @return {string} The data URI.
     */
    static getDataURL(image, type = "image/png") {
      if (/^data:/i.test(image.src)) {
        return image.src;
      }
      if (typeof HTMLCanvasElement === "undefined") {
        return image.src;
      }
      let canvas;
      if (image instanceof HTMLCanvasElement) {
        canvas = image;
      } else {
        if (_canvas === void 0) _canvas = createElementNS("canvas");
        _canvas.width = image.width;
        _canvas.height = image.height;
        const context = _canvas.getContext("2d");
        if (image instanceof ImageData) {
          context.putImageData(image, 0, 0);
        } else {
          context.drawImage(image, 0, 0, image.width, image.height);
        }
        canvas = _canvas;
      }
      return canvas.toDataURL(type);
    }
    /**
     * Converts the given sRGB image data to linear color space.
     *
     * @param {(HTMLImageElement|HTMLCanvasElement|ImageBitmap|Object)} image - The image object.
     * @return {HTMLCanvasElement|Object} The converted image.
     */
    static sRGBToLinear(image) {
      if (typeof HTMLImageElement !== "undefined" && image instanceof HTMLImageElement || typeof HTMLCanvasElement !== "undefined" && image instanceof HTMLCanvasElement || typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap) {
        const canvas = createElementNS("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, image.width, image.height);
        const imageData = context.getImageData(0, 0, image.width, image.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i++) {
          data[i] = SRGBToLinear(data[i] / 255) * 255;
        }
        context.putImageData(imageData, 0, 0);
        return canvas;
      } else if (image.data) {
        const data = image.data.slice(0);
        for (let i = 0; i < data.length; i++) {
          if (data instanceof Uint8Array || data instanceof Uint8ClampedArray) {
            data[i] = Math.floor(SRGBToLinear(data[i] / 255) * 255);
          } else {
            data[i] = SRGBToLinear(data[i]);
          }
        }
        return {
          data,
          width: image.width,
          height: image.height
        };
      } else {
        warn("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.");
        return image;
      }
    }
  }
  let _sourceId = 0;
  class Source {
    /**
     * Constructs a new video texture.
     *
     * @param {any} [data=null] - The data definition of a texture.
     */
    constructor(data = null) {
      this.isSource = true;
      Object.defineProperty(this, "id", { value: _sourceId++ });
      this.uuid = generateUUID();
      this.data = data;
      this.dataReady = true;
      this.version = 0;
    }
    /**
     * Returns the dimensions of the source into the given target vector.
     *
     * @param {(Vector2|Vector3)} target - The target object the result is written into.
     * @return {(Vector2|Vector3)} The dimensions of the source.
     */
    getSize(target) {
      const data = this.data;
      if (typeof HTMLVideoElement !== "undefined" && data instanceof HTMLVideoElement) {
        target.set(data.videoWidth, data.videoHeight, 0);
      } else if (typeof VideoFrame !== "undefined" && data instanceof VideoFrame) {
        target.set(data.displayHeight, data.displayWidth, 0);
      } else if (data !== null) {
        target.set(data.width, data.height, data.depth || 0);
      } else {
        target.set(0, 0, 0);
      }
      return target;
    }
    /**
     * When the property is set to `true`, the engine allocates the memory
     * for the texture (if necessary) and triggers the actual texture upload
     * to the GPU next time the source is used.
     *
     * @type {boolean}
     * @default false
     * @param {boolean} value
     */
    set needsUpdate(value) {
      if (value === true) this.version++;
    }
    /**
     * Serializes the source into JSON.
     *
     * @param {?(Object|string)} meta - An optional value holding meta information about the serialization.
     * @return {Object} A JSON object representing the serialized source.
     * @see {@link ObjectLoader#parse}
     */
    toJSON(meta) {
      const isRootObject = meta === void 0 || typeof meta === "string";
      if (!isRootObject && meta.images[this.uuid] !== void 0) {
        return meta.images[this.uuid];
      }
      const output = {
        uuid: this.uuid,
        url: ""
      };
      const data = this.data;
      if (data !== null) {
        let url;
        if (Array.isArray(data)) {
          url = [];
          for (let i = 0, l = data.length; i < l; i++) {
            if (data[i].isDataTexture) {
              url.push(serializeImage(data[i].image));
            } else {
              url.push(serializeImage(data[i]));
            }
          }
        } else {
          url = serializeImage(data);
        }
        output.url = url;
      }
      if (!isRootObject) {
        meta.images[this.uuid] = output;
      }
      return output;
    }
  }
  function serializeImage(image) {
    if (typeof HTMLImageElement !== "undefined" && image instanceof HTMLImageElement || typeof HTMLCanvasElement !== "undefined" && image instanceof HTMLCanvasElement || typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap) {
      return ImageUtils.getDataURL(image);
    } else {
      if (image.data) {
        return {
          data: Array.from(image.data),
          width: image.width,
          height: image.height,
          type: image.data.constructor.name
        };
      } else {
        warn("Texture: Unable to serialize Texture.");
        return {};
      }
    }
  }
  let _textureId = 0;
  const _tempVec3 = /* @__PURE__ */ new Vector3();
  class Texture extends EventDispatcher {
    /**
     * Constructs a new texture.
     *
     * @param {?Object} [image=Texture.DEFAULT_IMAGE] - The image holding the texture data.
     * @param {number} [mapping=Texture.DEFAULT_MAPPING] - The texture mapping.
     * @param {number} [wrapS=ClampToEdgeWrapping] - The wrapS value.
     * @param {number} [wrapT=ClampToEdgeWrapping] - The wrapT value.
     * @param {number} [magFilter=LinearFilter] - The mag filter value.
     * @param {number} [minFilter=LinearMipmapLinearFilter] - The min filter value.
     * @param {number} [format=RGBAFormat] - The texture format.
     * @param {number} [type=UnsignedByteType] - The texture type.
     * @param {number} [anisotropy=Texture.DEFAULT_ANISOTROPY] - The anisotropy value.
     * @param {string} [colorSpace=NoColorSpace] - The color space.
     */
    constructor(image = Texture.DEFAULT_IMAGE, mapping = Texture.DEFAULT_MAPPING, wrapS = ClampToEdgeWrapping, wrapT = ClampToEdgeWrapping, magFilter = LinearFilter, minFilter = LinearMipmapLinearFilter, format = RGBAFormat, type = UnsignedByteType, anisotropy = Texture.DEFAULT_ANISOTROPY, colorSpace = NoColorSpace) {
      super();
      this.isTexture = true;
      Object.defineProperty(this, "id", { value: _textureId++ });
      this.uuid = generateUUID();
      this.name = "";
      this.source = new Source(image);
      this.mipmaps = [];
      this.mapping = mapping;
      this.channel = 0;
      this.wrapS = wrapS;
      this.wrapT = wrapT;
      this.magFilter = magFilter;
      this.minFilter = minFilter;
      this.anisotropy = anisotropy;
      this.format = format;
      this.internalFormat = null;
      this.type = type;
      this.offset = new Vector2(0, 0);
      this.repeat = new Vector2(1, 1);
      this.center = new Vector2(0, 0);
      this.rotation = 0;
      this.matrixAutoUpdate = true;
      this.matrix = new Matrix3();
      this.generateMipmaps = true;
      this.premultiplyAlpha = false;
      this.flipY = true;
      this.unpackAlignment = 4;
      this.colorSpace = colorSpace;
      this.userData = {};
      this.updateRanges = [];
      this.version = 0;
      this.onUpdate = null;
      this.renderTarget = null;
      this.isRenderTargetTexture = false;
      this.isArrayTexture = image && image.depth && image.depth > 1 ? true : false;
      this.pmremVersion = 0;
    }
    /**
     * The width of the texture in pixels.
     */
    get width() {
      return this.source.getSize(_tempVec3).x;
    }
    /**
     * The height of the texture in pixels.
     */
    get height() {
      return this.source.getSize(_tempVec3).y;
    }
    /**
     * The depth of the texture in pixels.
     */
    get depth() {
      return this.source.getSize(_tempVec3).z;
    }
    /**
     * The image object holding the texture data.
     *
     * @type {?Object}
     */
    get image() {
      return this.source.data;
    }
    set image(value = null) {
      this.source.data = value;
    }
    /**
     * Updates the texture transformation matrix from the from the properties {@link Texture#offset},
     * {@link Texture#repeat}, {@link Texture#rotation}, and {@link Texture#center}.
     */
    updateMatrix() {
      this.matrix.setUvTransform(this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y);
    }
    /**
     * Adds a range of data in the data texture to be updated on the GPU.
     *
     * @param {number} start - Position at which to start update.
     * @param {number} count - The number of components to update.
     */
    addUpdateRange(start, count) {
      this.updateRanges.push({ start, count });
    }
    /**
     * Clears the update ranges.
     */
    clearUpdateRanges() {
      this.updateRanges.length = 0;
    }
    /**
     * Returns a new texture with copied values from this instance.
     *
     * @return {Texture} A clone of this instance.
     */
    clone() {
      return new this.constructor().copy(this);
    }
    /**
     * Copies the values of the given texture to this instance.
     *
     * @param {Texture} source - The texture to copy.
     * @return {Texture} A reference to this instance.
     */
    copy(source) {
      this.name = source.name;
      this.source = source.source;
      this.mipmaps = source.mipmaps.slice(0);
      this.mapping = source.mapping;
      this.channel = source.channel;
      this.wrapS = source.wrapS;
      this.wrapT = source.wrapT;
      this.magFilter = source.magFilter;
      this.minFilter = source.minFilter;
      this.anisotropy = source.anisotropy;
      this.format = source.format;
      this.internalFormat = source.internalFormat;
      this.type = source.type;
      this.offset.copy(source.offset);
      this.repeat.copy(source.repeat);
      this.center.copy(source.center);
      this.rotation = source.rotation;
      this.matrixAutoUpdate = source.matrixAutoUpdate;
      this.matrix.copy(source.matrix);
      this.generateMipmaps = source.generateMipmaps;
      this.premultiplyAlpha = source.premultiplyAlpha;
      this.flipY = source.flipY;
      this.unpackAlignment = source.unpackAlignment;
      this.colorSpace = source.colorSpace;
      this.renderTarget = source.renderTarget;
      this.isRenderTargetTexture = source.isRenderTargetTexture;
      this.isArrayTexture = source.isArrayTexture;
      this.userData = JSON.parse(JSON.stringify(source.userData));
      this.needsUpdate = true;
      return this;
    }
    /**
     * Sets this texture's properties based on `values`.
     * @param {Object} values - A container with texture parameters.
     */
    setValues(values) {
      for (const key in values) {
        const newValue = values[key];
        if (newValue === void 0) {
          warn(`Texture.setValues(): parameter '${key}' has value of undefined.`);
          continue;
        }
        const currentValue = this[key];
        if (currentValue === void 0) {
          warn(`Texture.setValues(): property '${key}' does not exist.`);
          continue;
        }
        if (currentValue && newValue && (currentValue.isVector2 && newValue.isVector2)) {
          currentValue.copy(newValue);
        } else if (currentValue && newValue && (currentValue.isVector3 && newValue.isVector3)) {
          currentValue.copy(newValue);
        } else if (currentValue && newValue && (currentValue.isMatrix3 && newValue.isMatrix3)) {
          currentValue.copy(newValue);
        } else {
          this[key] = newValue;
        }
      }
    }
    /**
     * Serializes the texture into JSON.
     *
     * @param {?(Object|string)} meta - An optional value holding meta information about the serialization.
     * @return {Object} A JSON object representing the serialized texture.
     * @see {@link ObjectLoader#parse}
     */
    toJSON(meta) {
      const isRootObject = meta === void 0 || typeof meta === "string";
      if (!isRootObject && meta.textures[this.uuid] !== void 0) {
        return meta.textures[this.uuid];
      }
      const output = {
        metadata: {
          version: 4.7,
          type: "Texture",
          generator: "Texture.toJSON"
        },
        uuid: this.uuid,
        name: this.name,
        image: this.source.toJSON(meta).uuid,
        mapping: this.mapping,
        channel: this.channel,
        repeat: [this.repeat.x, this.repeat.y],
        offset: [this.offset.x, this.offset.y],
        center: [this.center.x, this.center.y],
        rotation: this.rotation,
        wrap: [this.wrapS, this.wrapT],
        format: this.format,
        internalFormat: this.internalFormat,
        type: this.type,
        colorSpace: this.colorSpace,
        minFilter: this.minFilter,
        magFilter: this.magFilter,
        anisotropy: this.anisotropy,
        flipY: this.flipY,
        generateMipmaps: this.generateMipmaps,
        premultiplyAlpha: this.premultiplyAlpha,
        unpackAlignment: this.unpackAlignment
      };
      if (Object.keys(this.userData).length > 0) output.userData = this.userData;
      if (!isRootObject) {
        meta.textures[this.uuid] = output;
      }
      return output;
    }
    /**
     * Frees the GPU-related resources allocated by this instance. Call this
     * method whenever this instance is no longer used in your app.
     *
     * @fires Texture#dispose
     */
    dispose() {
      this.dispatchEvent({ type: "dispose" });
    }
    /**
     * Transforms the given uv vector with the textures uv transformation matrix.
     *
     * @param {Vector2} uv - The uv vector.
     * @return {Vector2} The transformed uv vector.
     */
    transformUv(uv) {
      if (this.mapping !== UVMapping) return uv;
      uv.applyMatrix3(this.matrix);
      if (uv.x < 0 || uv.x > 1) {
        switch (this.wrapS) {
          case RepeatWrapping:
            uv.x = uv.x - Math.floor(uv.x);
            break;
          case ClampToEdgeWrapping:
            uv.x = uv.x < 0 ? 0 : 1;
            break;
          case MirroredRepeatWrapping:
            if (Math.abs(Math.floor(uv.x) % 2) === 1) {
              uv.x = Math.ceil(uv.x) - uv.x;
            } else {
              uv.x = uv.x - Math.floor(uv.x);
            }
            break;
        }
      }
      if (uv.y < 0 || uv.y > 1) {
        switch (this.wrapT) {
          case RepeatWrapping:
            uv.y = uv.y - Math.floor(uv.y);
            break;
          case ClampToEdgeWrapping:
            uv.y = uv.y < 0 ? 0 : 1;
            break;
          case MirroredRepeatWrapping:
            if (Math.abs(Math.floor(uv.y) % 2) === 1) {
              uv.y = Math.ceil(uv.y) - uv.y;
            } else {
              uv.y = uv.y - Math.floor(uv.y);
            }
            break;
        }
      }
      if (this.flipY) {
        uv.y = 1 - uv.y;
      }
      return uv;
    }
    /**
     * Setting this property to `true` indicates the engine the texture
     * must be updated in the next render. This triggers a texture upload
     * to the GPU and ensures correct texture parameter configuration.
     *
     * @type {boolean}
     * @default false
     * @param {boolean} value
     */
    set needsUpdate(value) {
      if (value === true) {
        this.version++;
        this.source.needsUpdate = true;
      }
    }
    /**
     * Setting this property to `true` indicates the engine the PMREM
     * must be regenerated.
     *
     * @type {boolean}
     * @default false
     * @param {boolean} value
     */
    set needsPMREMUpdate(value) {
      if (value === true) {
        this.pmremVersion++;
      }
    }
  }
  Texture.DEFAULT_IMAGE = null;
  Texture.DEFAULT_MAPPING = UVMapping;
  Texture.DEFAULT_ANISOTROPY = 1;
  class Vector4 {
    /**
     * Constructs a new 4D vector.
     *
     * @param {number} [x=0] - The x value of this vector.
     * @param {number} [y=0] - The y value of this vector.
     * @param {number} [z=0] - The z value of this vector.
     * @param {number} [w=1] - The w value of this vector.
     */
    constructor(x = 0, y = 0, z = 0, w = 1) {
      Vector4.prototype.isVector4 = true;
      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
    }
    /**
     * Alias for {@link Vector4#z}.
     *
     * @type {number}
     */
    get width() {
      return this.z;
    }
    set width(value) {
      this.z = value;
    }
    /**
     * Alias for {@link Vector4#w}.
     *
     * @type {number}
     */
    get height() {
      return this.w;
    }
    set height(value) {
      this.w = value;
    }
    /**
     * Sets the vector components.
     *
     * @param {number} x - The value of the x component.
     * @param {number} y - The value of the y component.
     * @param {number} z - The value of the z component.
     * @param {number} w - The value of the w component.
     * @return {Vector4} A reference to this vector.
     */
    set(x, y, z, w) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
      return this;
    }
    /**
     * Sets the vector components to the same value.
     *
     * @param {number} scalar - The value to set for all vector components.
     * @return {Vector4} A reference to this vector.
     */
    setScalar(scalar) {
      this.x = scalar;
      this.y = scalar;
      this.z = scalar;
      this.w = scalar;
      return this;
    }
    /**
     * Sets the vector's x component to the given value
     *
     * @param {number} x - The value to set.
     * @return {Vector4} A reference to this vector.
     */
    setX(x) {
      this.x = x;
      return this;
    }
    /**
     * Sets the vector's y component to the given value
     *
     * @param {number} y - The value to set.
     * @return {Vector4} A reference to this vector.
     */
    setY(y) {
      this.y = y;
      return this;
    }
    /**
     * Sets the vector's z component to the given value
     *
     * @param {number} z - The value to set.
     * @return {Vector4} A reference to this vector.
     */
    setZ(z) {
      this.z = z;
      return this;
    }
    /**
     * Sets the vector's w component to the given value
     *
     * @param {number} w - The value to set.
     * @return {Vector4} A reference to this vector.
     */
    setW(w) {
      this.w = w;
      return this;
    }
    /**
     * Allows to set a vector component with an index.
     *
     * @param {number} index - The component index. `0` equals to x, `1` equals to y,
     * `2` equals to z, `3` equals to w.
     * @param {number} value - The value to set.
     * @return {Vector4} A reference to this vector.
     */
    setComponent(index, value) {
      switch (index) {
        case 0:
          this.x = value;
          break;
        case 1:
          this.y = value;
          break;
        case 2:
          this.z = value;
          break;
        case 3:
          this.w = value;
          break;
        default:
          throw new Error("index is out of range: " + index);
      }
      return this;
    }
    /**
     * Returns the value of the vector component which matches the given index.
     *
     * @param {number} index - The component index. `0` equals to x, `1` equals to y,
     * `2` equals to z, `3` equals to w.
     * @return {number} A vector component value.
     */
    getComponent(index) {
      switch (index) {
        case 0:
          return this.x;
        case 1:
          return this.y;
        case 2:
          return this.z;
        case 3:
          return this.w;
        default:
          throw new Error("index is out of range: " + index);
      }
    }
    /**
     * Returns a new vector with copied values from this instance.
     *
     * @return {Vector4} A clone of this instance.
     */
    clone() {
      return new this.constructor(this.x, this.y, this.z, this.w);
    }
    /**
     * Copies the values of the given vector to this instance.
     *
     * @param {Vector3|Vector4} v - The vector to copy.
     * @return {Vector4} A reference to this vector.
     */
    copy(v) {
      this.x = v.x;
      this.y = v.y;
      this.z = v.z;
      this.w = v.w !== void 0 ? v.w : 1;
      return this;
    }
    /**
     * Adds the given vector to this instance.
     *
     * @param {Vector4} v - The vector to add.
     * @return {Vector4} A reference to this vector.
     */
    add(v) {
      this.x += v.x;
      this.y += v.y;
      this.z += v.z;
      this.w += v.w;
      return this;
    }
    /**
     * Adds the given scalar value to all components of this instance.
     *
     * @param {number} s - The scalar to add.
     * @return {Vector4} A reference to this vector.
     */
    addScalar(s) {
      this.x += s;
      this.y += s;
      this.z += s;
      this.w += s;
      return this;
    }
    /**
     * Adds the given vectors and stores the result in this instance.
     *
     * @param {Vector4} a - The first vector.
     * @param {Vector4} b - The second vector.
     * @return {Vector4} A reference to this vector.
     */
    addVectors(a, b) {
      this.x = a.x + b.x;
      this.y = a.y + b.y;
      this.z = a.z + b.z;
      this.w = a.w + b.w;
      return this;
    }
    /**
     * Adds the given vector scaled by the given factor to this instance.
     *
     * @param {Vector4} v - The vector.
     * @param {number} s - The factor that scales `v`.
     * @return {Vector4} A reference to this vector.
     */
    addScaledVector(v, s) {
      this.x += v.x * s;
      this.y += v.y * s;
      this.z += v.z * s;
      this.w += v.w * s;
      return this;
    }
    /**
     * Subtracts the given vector from this instance.
     *
     * @param {Vector4} v - The vector to subtract.
     * @return {Vector4} A reference to this vector.
     */
    sub(v) {
      this.x -= v.x;
      this.y -= v.y;
      this.z -= v.z;
      this.w -= v.w;
      return this;
    }
    /**
     * Subtracts the given scalar value from all components of this instance.
     *
     * @param {number} s - The scalar to subtract.
     * @return {Vector4} A reference to this vector.
     */
    subScalar(s) {
      this.x -= s;
      this.y -= s;
      this.z -= s;
      this.w -= s;
      return this;
    }
    /**
     * Subtracts the given vectors and stores the result in this instance.
     *
     * @param {Vector4} a - The first vector.
     * @param {Vector4} b - The second vector.
     * @return {Vector4} A reference to this vector.
     */
    subVectors(a, b) {
      this.x = a.x - b.x;
      this.y = a.y - b.y;
      this.z = a.z - b.z;
      this.w = a.w - b.w;
      return this;
    }
    /**
     * Multiplies the given vector with this instance.
     *
     * @param {Vector4} v - The vector to multiply.
     * @return {Vector4} A reference to this vector.
     */
    multiply(v) {
      this.x *= v.x;
      this.y *= v.y;
      this.z *= v.z;
      this.w *= v.w;
      return this;
    }
    /**
     * Multiplies the given scalar value with all components of this instance.
     *
     * @param {number} scalar - The scalar to multiply.
     * @return {Vector4} A reference to this vector.
     */
    multiplyScalar(scalar) {
      this.x *= scalar;
      this.y *= scalar;
      this.z *= scalar;
      this.w *= scalar;
      return this;
    }
    /**
     * Multiplies this vector with the given 4x4 matrix.
     *
     * @param {Matrix4} m - The 4x4 matrix.
     * @return {Vector4} A reference to this vector.
     */
    applyMatrix4(m) {
      const x = this.x, y = this.y, z = this.z, w = this.w;
      const e = m.elements;
      this.x = e[0] * x + e[4] * y + e[8] * z + e[12] * w;
      this.y = e[1] * x + e[5] * y + e[9] * z + e[13] * w;
      this.z = e[2] * x + e[6] * y + e[10] * z + e[14] * w;
      this.w = e[3] * x + e[7] * y + e[11] * z + e[15] * w;
      return this;
    }
    /**
     * Divides this instance by the given vector.
     *
     * @param {Vector4} v - The vector to divide.
     * @return {Vector4} A reference to this vector.
     */
    divide(v) {
      this.x /= v.x;
      this.y /= v.y;
      this.z /= v.z;
      this.w /= v.w;
      return this;
    }
    /**
     * Divides this vector by the given scalar.
     *
     * @param {number} scalar - The scalar to divide.
     * @return {Vector4} A reference to this vector.
     */
    divideScalar(scalar) {
      return this.multiplyScalar(1 / scalar);
    }
    /**
     * Sets the x, y and z components of this
     * vector to the quaternion's axis and w to the angle.
     *
     * @param {Quaternion} q - The Quaternion to set.
     * @return {Vector4} A reference to this vector.
     */
    setAxisAngleFromQuaternion(q) {
      this.w = 2 * Math.acos(q.w);
      const s = Math.sqrt(1 - q.w * q.w);
      if (s < 1e-4) {
        this.x = 1;
        this.y = 0;
        this.z = 0;
      } else {
        this.x = q.x / s;
        this.y = q.y / s;
        this.z = q.z / s;
      }
      return this;
    }
    /**
     * Sets the x, y and z components of this
     * vector to the axis of rotation and w to the angle.
     *
     * @param {Matrix4} m - A 4x4 matrix of which the upper left 3x3 matrix is a pure rotation matrix.
     * @return {Vector4} A reference to this vector.
     */
    setAxisAngleFromRotationMatrix(m) {
      let angle, x, y, z;
      const epsilon = 0.01, epsilon2 = 0.1, te = m.elements, m11 = te[0], m12 = te[4], m13 = te[8], m21 = te[1], m22 = te[5], m23 = te[9], m31 = te[2], m32 = te[6], m33 = te[10];
      if (Math.abs(m12 - m21) < epsilon && Math.abs(m13 - m31) < epsilon && Math.abs(m23 - m32) < epsilon) {
        if (Math.abs(m12 + m21) < epsilon2 && Math.abs(m13 + m31) < epsilon2 && Math.abs(m23 + m32) < epsilon2 && Math.abs(m11 + m22 + m33 - 3) < epsilon2) {
          this.set(1, 0, 0, 0);
          return this;
        }
        angle = Math.PI;
        const xx = (m11 + 1) / 2;
        const yy = (m22 + 1) / 2;
        const zz = (m33 + 1) / 2;
        const xy = (m12 + m21) / 4;
        const xz = (m13 + m31) / 4;
        const yz = (m23 + m32) / 4;
        if (xx > yy && xx > zz) {
          if (xx < epsilon) {
            x = 0;
            y = 0.707106781;
            z = 0.707106781;
          } else {
            x = Math.sqrt(xx);
            y = xy / x;
            z = xz / x;
          }
        } else if (yy > zz) {
          if (yy < epsilon) {
            x = 0.707106781;
            y = 0;
            z = 0.707106781;
          } else {
            y = Math.sqrt(yy);
            x = xy / y;
            z = yz / y;
          }
        } else {
          if (zz < epsilon) {
            x = 0.707106781;
            y = 0.707106781;
            z = 0;
          } else {
            z = Math.sqrt(zz);
            x = xz / z;
            y = yz / z;
          }
        }
        this.set(x, y, z, angle);
        return this;
      }
      let s = Math.sqrt((m32 - m23) * (m32 - m23) + (m13 - m31) * (m13 - m31) + (m21 - m12) * (m21 - m12));
      if (Math.abs(s) < 1e-3) s = 1;
      this.x = (m32 - m23) / s;
      this.y = (m13 - m31) / s;
      this.z = (m21 - m12) / s;
      this.w = Math.acos((m11 + m22 + m33 - 1) / 2);
      return this;
    }
    /**
     * Sets the vector components to the position elements of the
     * given transformation matrix.
     *
     * @param {Matrix4} m - The 4x4 matrix.
     * @return {Vector4} A reference to this vector.
     */
    setFromMatrixPosition(m) {
      const e = m.elements;
      this.x = e[12];
      this.y = e[13];
      this.z = e[14];
      this.w = e[15];
      return this;
    }
    /**
     * If this vector's x, y, z or w value is greater than the given vector's x, y, z or w
     * value, replace that value with the corresponding min value.
     *
     * @param {Vector4} v - The vector.
     * @return {Vector4} A reference to this vector.
     */
    min(v) {
      this.x = Math.min(this.x, v.x);
      this.y = Math.min(this.y, v.y);
      this.z = Math.min(this.z, v.z);
      this.w = Math.min(this.w, v.w);
      return this;
    }
    /**
     * If this vector's x, y, z or w value is less than the given vector's x, y, z or w
     * value, replace that value with the corresponding max value.
     *
     * @param {Vector4} v - The vector.
     * @return {Vector4} A reference to this vector.
     */
    max(v) {
      this.x = Math.max(this.x, v.x);
      this.y = Math.max(this.y, v.y);
      this.z = Math.max(this.z, v.z);
      this.w = Math.max(this.w, v.w);
      return this;
    }
    /**
     * If this vector's x, y, z or w value is greater than the max vector's x, y, z or w
     * value, it is replaced by the corresponding value.
     * If this vector's x, y, z or w value is less than the min vector's x, y, z or w value,
     * it is replaced by the corresponding value.
     *
     * @param {Vector4} min - The minimum x, y and z values.
     * @param {Vector4} max - The maximum x, y and z values in the desired range.
     * @return {Vector4} A reference to this vector.
     */
    clamp(min, max) {
      this.x = clamp(this.x, min.x, max.x);
      this.y = clamp(this.y, min.y, max.y);
      this.z = clamp(this.z, min.z, max.z);
      this.w = clamp(this.w, min.w, max.w);
      return this;
    }
    /**
     * If this vector's x, y, z or w values are greater than the max value, they are
     * replaced by the max value.
     * If this vector's x, y, z or w values are less than the min value, they are
     * replaced by the min value.
     *
     * @param {number} minVal - The minimum value the components will be clamped to.
     * @param {number} maxVal - The maximum value the components will be clamped to.
     * @return {Vector4} A reference to this vector.
     */
    clampScalar(minVal, maxVal) {
      this.x = clamp(this.x, minVal, maxVal);
      this.y = clamp(this.y, minVal, maxVal);
      this.z = clamp(this.z, minVal, maxVal);
      this.w = clamp(this.w, minVal, maxVal);
      return this;
    }
    /**
     * If this vector's length is greater than the max value, it is replaced by
     * the max value.
     * If this vector's length is less than the min value, it is replaced by the
     * min value.
     *
     * @param {number} min - The minimum value the vector length will be clamped to.
     * @param {number} max - The maximum value the vector length will be clamped to.
     * @return {Vector4} A reference to this vector.
     */
    clampLength(min, max) {
      const length = this.length();
      return this.divideScalar(length || 1).multiplyScalar(clamp(length, min, max));
    }
    /**
     * The components of this vector are rounded down to the nearest integer value.
     *
     * @return {Vector4} A reference to this vector.
     */
    floor() {
      this.x = Math.floor(this.x);
      this.y = Math.floor(this.y);
      this.z = Math.floor(this.z);
      this.w = Math.floor(this.w);
      return this;
    }
    /**
     * The components of this vector are rounded up to the nearest integer value.
     *
     * @return {Vector4} A reference to this vector.
     */
    ceil() {
      this.x = Math.ceil(this.x);
      this.y = Math.ceil(this.y);
      this.z = Math.ceil(this.z);
      this.w = Math.ceil(this.w);
      return this;
    }
    /**
     * The components of this vector are rounded to the nearest integer value
     *
     * @return {Vector4} A reference to this vector.
     */
    round() {
      this.x = Math.round(this.x);
      this.y = Math.round(this.y);
      this.z = Math.round(this.z);
      this.w = Math.round(this.w);
      return this;
    }
    /**
     * The components of this vector are rounded towards zero (up if negative,
     * down if positive) to an integer value.
     *
     * @return {Vector4} A reference to this vector.
     */
    roundToZero() {
      this.x = Math.trunc(this.x);
      this.y = Math.trunc(this.y);
      this.z = Math.trunc(this.z);
      this.w = Math.trunc(this.w);
      return this;
    }
    /**
     * Inverts this vector - i.e. sets x = -x, y = -y, z = -z, w = -w.
     *
     * @return {Vector4} A reference to this vector.
     */
    negate() {
      this.x = -this.x;
      this.y = -this.y;
      this.z = -this.z;
      this.w = -this.w;
      return this;
    }
    /**
     * Calculates the dot product of the given vector with this instance.
     *
     * @param {Vector4} v - The vector to compute the dot product with.
     * @return {number} The result of the dot product.
     */
    dot(v) {
      return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
    }
    /**
     * Computes the square of the Euclidean length (straight-line length) from
     * (0, 0, 0, 0) to (x, y, z, w). If you are comparing the lengths of vectors, you should
     * compare the length squared instead as it is slightly more efficient to calculate.
     *
     * @return {number} The square length of this vector.
     */
    lengthSq() {
      return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    }
    /**
     * Computes the  Euclidean length (straight-line length) from (0, 0, 0, 0) to (x, y, z, w).
     *
     * @return {number} The length of this vector.
     */
    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }
    /**
     * Computes the Manhattan length of this vector.
     *
     * @return {number} The length of this vector.
     */
    manhattanLength() {
      return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
    }
    /**
     * Converts this vector to a unit vector - that is, sets it equal to a vector
     * with the same direction as this one, but with a vector length of `1`.
     *
     * @return {Vector4} A reference to this vector.
     */
    normalize() {
      return this.divideScalar(this.length() || 1);
    }
    /**
     * Sets this vector to a vector with the same direction as this one, but
     * with the specified length.
     *
     * @param {number} length - The new length of this vector.
     * @return {Vector4} A reference to this vector.
     */
    setLength(length) {
      return this.normalize().multiplyScalar(length);
    }
    /**
     * Linearly interpolates between the given vector and this instance, where
     * alpha is the percent distance along the line - alpha = 0 will be this
     * vector, and alpha = 1 will be the given one.
     *
     * @param {Vector4} v - The vector to interpolate towards.
     * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
     * @return {Vector4} A reference to this vector.
     */
    lerp(v, alpha) {
      this.x += (v.x - this.x) * alpha;
      this.y += (v.y - this.y) * alpha;
      this.z += (v.z - this.z) * alpha;
      this.w += (v.w - this.w) * alpha;
      return this;
    }
    /**
     * Linearly interpolates between the given vectors, where alpha is the percent
     * distance along the line - alpha = 0 will be first vector, and alpha = 1 will
     * be the second one. The result is stored in this instance.
     *
     * @param {Vector4} v1 - The first vector.
     * @param {Vector4} v2 - The second vector.
     * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
     * @return {Vector4} A reference to this vector.
     */
    lerpVectors(v1, v2, alpha) {
      this.x = v1.x + (v2.x - v1.x) * alpha;
      this.y = v1.y + (v2.y - v1.y) * alpha;
      this.z = v1.z + (v2.z - v1.z) * alpha;
      this.w = v1.w + (v2.w - v1.w) * alpha;
      return this;
    }
    /**
     * Returns `true` if this vector is equal with the given one.
     *
     * @param {Vector4} v - The vector to test for equality.
     * @return {boolean} Whether this vector is equal with the given one.
     */
    equals(v) {
      return v.x === this.x && v.y === this.y && v.z === this.z && v.w === this.w;
    }
    /**
     * Sets this vector's x value to be `array[ offset ]`, y value to be `array[ offset + 1 ]`,
     * z value to be `array[ offset + 2 ]`, w value to be `array[ offset + 3 ]`.
     *
     * @param {Array<number>} array - An array holding the vector component values.
     * @param {number} [offset=0] - The offset into the array.
     * @return {Vector4} A reference to this vector.
     */
    fromArray(array, offset = 0) {
      this.x = array[offset];
      this.y = array[offset + 1];
      this.z = array[offset + 2];
      this.w = array[offset + 3];
      return this;
    }
    /**
     * Writes the components of this vector to the given array. If no array is provided,
     * the method returns a new instance.
     *
     * @param {Array<number>} [array=[]] - The target array holding the vector components.
     * @param {number} [offset=0] - Index of the first element in the array.
     * @return {Array<number>} The vector components.
     */
    toArray(array = [], offset = 0) {
      array[offset] = this.x;
      array[offset + 1] = this.y;
      array[offset + 2] = this.z;
      array[offset + 3] = this.w;
      return array;
    }
    /**
     * Sets the components of this vector from the given buffer attribute.
     *
     * @param {BufferAttribute} attribute - The buffer attribute holding vector data.
     * @param {number} index - The index into the attribute.
     * @return {Vector4} A reference to this vector.
     */
    fromBufferAttribute(attribute, index) {
      this.x = attribute.getX(index);
      this.y = attribute.getY(index);
      this.z = attribute.getZ(index);
      this.w = attribute.getW(index);
      return this;
    }
    /**
     * Sets each component of this vector to a pseudo-random value between `0` and
     * `1`, excluding `1`.
     *
     * @return {Vector4} A reference to this vector.
     */
    random() {
      this.x = Math.random();
      this.y = Math.random();
      this.z = Math.random();
      this.w = Math.random();
      return this;
    }
    *[Symbol.iterator]() {
      yield this.x;
      yield this.y;
      yield this.z;
      yield this.w;
    }
  }
  class Box3 {
    /**
     * Constructs a new bounding box.
     *
     * @param {Vector3} [min=(Infinity,Infinity,Infinity)] - A vector representing the lower boundary of the box.
     * @param {Vector3} [max=(-Infinity,-Infinity,-Infinity)] - A vector representing the upper boundary of the box.
     */
    constructor(min = new Vector3(Infinity, Infinity, Infinity), max = new Vector3(-Infinity, -Infinity, -Infinity)) {
      this.isBox3 = true;
      this.min = min;
      this.max = max;
    }
    /**
     * Sets the lower and upper boundaries of this box.
     * Please note that this method only copies the values from the given objects.
     *
     * @param {Vector3} min - The lower boundary of the box.
     * @param {Vector3} max - The upper boundary of the box.
     * @return {Box3} A reference to this bounding box.
     */
    set(min, max) {
      this.min.copy(min);
      this.max.copy(max);
      return this;
    }
    /**
     * Sets the upper and lower bounds of this box so it encloses the position data
     * in the given array.
     *
     * @param {Array<number>} array - An array holding 3D position data.
     * @return {Box3} A reference to this bounding box.
     */
    setFromArray(array) {
      this.makeEmpty();
      for (let i = 0, il = array.length; i < il; i += 3) {
        this.expandByPoint(_vector$b.fromArray(array, i));
      }
      return this;
    }
    /**
     * Sets the upper and lower bounds of this box so it encloses the position data
     * in the given buffer attribute.
     *
     * @param {BufferAttribute} attribute - A buffer attribute holding 3D position data.
     * @return {Box3} A reference to this bounding box.
     */
    setFromBufferAttribute(attribute) {
      this.makeEmpty();
      for (let i = 0, il = attribute.count; i < il; i++) {
        this.expandByPoint(_vector$b.fromBufferAttribute(attribute, i));
      }
      return this;
    }
    /**
     * Sets the upper and lower bounds of this box so it encloses the position data
     * in the given array.
     *
     * @param {Array<Vector3>} points - An array holding 3D position data as instances of {@link Vector3}.
     * @return {Box3} A reference to this bounding box.
     */
    setFromPoints(points) {
      this.makeEmpty();
      for (let i = 0, il = points.length; i < il; i++) {
        this.expandByPoint(points[i]);
      }
      return this;
    }
    /**
     * Centers this box on the given center vector and sets this box's width, height and
     * depth to the given size values.
     *
     * @param {Vector3} center - The center of the box.
     * @param {Vector3} size - The x, y and z dimensions of the box.
     * @return {Box3} A reference to this bounding box.
     */
    setFromCenterAndSize(center, size) {
      const halfSize = _vector$b.copy(size).multiplyScalar(0.5);
      this.min.copy(center).sub(halfSize);
      this.max.copy(center).add(halfSize);
      return this;
    }
    /**
     * Computes the world-axis-aligned bounding box for the given 3D object
     * (including its children), accounting for the object's, and children's,
     * world transforms. The function may result in a larger box than strictly necessary.
     *
     * @param {Object3D} object - The 3D object to compute the bounding box for.
     * @param {boolean} [precise=false] - If set to `true`, the method computes the smallest
     * world-axis-aligned bounding box at the expense of more computation.
     * @return {Box3} A reference to this bounding box.
     */
    setFromObject(object, precise = false) {
      this.makeEmpty();
      return this.expandByObject(object, precise);
    }
    /**
     * Returns a new box with copied values from this instance.
     *
     * @return {Box3} A clone of this instance.
     */
    clone() {
      return new this.constructor().copy(this);
    }
    /**
     * Copies the values of the given box to this instance.
     *
     * @param {Box3} box - The box to copy.
     * @return {Box3} A reference to this bounding box.
     */
    copy(box) {
      this.min.copy(box.min);
      this.max.copy(box.max);
      return this;
    }
    /**
     * Makes this box empty which means in encloses a zero space in 3D.
     *
     * @return {Box3} A reference to this bounding box.
     */
    makeEmpty() {
      this.min.x = this.min.y = this.min.z = Infinity;
      this.max.x = this.max.y = this.max.z = -Infinity;
      return this;
    }
    /**
     * Returns true if this box includes zero points within its bounds.
     * Note that a box with equal lower and upper bounds still includes one
     * point, the one both bounds share.
     *
     * @return {boolean} Whether this box is empty or not.
     */
    isEmpty() {
      return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
    }
    /**
     * Returns the center point of this box.
     *
     * @param {Vector3} target - The target vector that is used to store the method's result.
     * @return {Vector3} The center point.
     */
    getCenter(target) {
      return this.isEmpty() ? target.set(0, 0, 0) : target.addVectors(this.min, this.max).multiplyScalar(0.5);
    }
    /**
     * Returns the dimensions of this box.
     *
     * @param {Vector3} target - The target vector that is used to store the method's result.
     * @return {Vector3} The size.
     */
    getSize(target) {
      return this.isEmpty() ? target.set(0, 0, 0) : target.subVectors(this.max, this.min);
    }
    /**
     * Expands the boundaries of this box to include the given point.
     *
     * @param {Vector3} point - The point that should be included by the bounding box.
     * @return {Box3} A reference to this bounding box.
     */
    expandByPoint(point) {
      this.min.min(point);
      this.max.max(point);
      return this;
    }
    /**
     * Expands this box equilaterally by the given vector. The width of this
     * box will be expanded by the x component of the vector in both
     * directions. The height of this box will be expanded by the y component of
     * the vector in both directions. The depth of this box will be
     * expanded by the z component of the vector in both directions.
     *
     * @param {Vector3} vector - The vector that should expand the bounding box.
     * @return {Box3} A reference to this bounding box.
     */
    expandByVector(vector) {
      this.min.sub(vector);
      this.max.add(vector);
      return this;
    }
    /**
     * Expands each dimension of the box by the given scalar. If negative, the
     * dimensions of the box will be contracted.
     *
     * @param {number} scalar - The scalar value that should expand the bounding box.
     * @return {Box3} A reference to this bounding box.
     */
    expandByScalar(scalar) {
      this.min.addScalar(-scalar);
      this.max.addScalar(scalar);
      return this;
    }
    /**
     * Expands the boundaries of this box to include the given 3D object and
     * its children, accounting for the object's, and children's, world
     * transforms. The function may result in a larger box than strictly
     * necessary (unless the precise parameter is set to true).
     *
     * @param {Object3D} object - The 3D object that should expand the bounding box.
     * @param {boolean} precise - If set to `true`, the method expands the bounding box
     * as little as necessary at the expense of more computation.
     * @return {Box3} A reference to this bounding box.
     */
    expandByObject(object, precise = false) {
      object.updateWorldMatrix(false, false);
      const geometry = object.geometry;
      if (geometry !== void 0) {
        const positionAttribute = geometry.getAttribute("position");
        if (precise === true && positionAttribute !== void 0 && object.isInstancedMesh !== true) {
          for (let i = 0, l = positionAttribute.count; i < l; i++) {
            if (object.isMesh === true) {
              object.getVertexPosition(i, _vector$b);
            } else {
              _vector$b.fromBufferAttribute(positionAttribute, i);
            }
            _vector$b.applyMatrix4(object.matrixWorld);
            this.expandByPoint(_vector$b);
          }
        } else {
          if (object.boundingBox !== void 0) {
            if (object.boundingBox === null) {
              object.computeBoundingBox();
            }
            _box$4.copy(object.boundingBox);
          } else {
            if (geometry.boundingBox === null) {
              geometry.computeBoundingBox();
            }
            _box$4.copy(geometry.boundingBox);
          }
          _box$4.applyMatrix4(object.matrixWorld);
          this.union(_box$4);
        }
      }
      const children = object.children;
      for (let i = 0, l = children.length; i < l; i++) {
        this.expandByObject(children[i], precise);
      }
      return this;
    }
    /**
     * Returns `true` if the given point lies within or on the boundaries of this box.
     *
     * @param {Vector3} point - The point to test.
     * @return {boolean} Whether the bounding box contains the given point or not.
     */
    containsPoint(point) {
      return point.x >= this.min.x && point.x <= this.max.x && point.y >= this.min.y && point.y <= this.max.y && point.z >= this.min.z && point.z <= this.max.z;
    }
    /**
     * Returns `true` if this bounding box includes the entirety of the given bounding box.
     * If this box and the given one are identical, this function also returns `true`.
     *
     * @param {Box3} box - The bounding box to test.
     * @return {boolean} Whether the bounding box contains the given bounding box or not.
     */
    containsBox(box) {
      return this.min.x <= box.min.x && box.max.x <= this.max.x && this.min.y <= box.min.y && box.max.y <= this.max.y && this.min.z <= box.min.z && box.max.z <= this.max.z;
    }
    /**
     * Returns a point as a proportion of this box's width, height and depth.
     *
     * @param {Vector3} point - A point in 3D space.
     * @param {Vector3} target - The target vector that is used to store the method's result.
     * @return {Vector3} A point as a proportion of this box's width, height and depth.
     */
    getParameter(point, target) {
      return target.set(
        (point.x - this.min.x) / (this.max.x - this.min.x),
        (point.y - this.min.y) / (this.max.y - this.min.y),
        (point.z - this.min.z) / (this.max.z - this.min.z)
      );
    }
    /**
     * Returns `true` if the given bounding box intersects with this bounding box.
     *
     * @param {Box3} box - The bounding box to test.
     * @return {boolean} Whether the given bounding box intersects with this bounding box.
     */
    intersectsBox(box) {
      return box.max.x >= this.min.x && box.min.x <= this.max.x && box.max.y >= this.min.y && box.min.y <= this.max.y && box.max.z >= this.min.z && box.min.z <= this.max.z;
    }
    /**
     * Returns `true` if the given bounding sphere intersects with this bounding box.
     *
     * @param {Sphere} sphere - The bounding sphere to test.
     * @return {boolean} Whether the given bounding sphere intersects with this bounding box.
     */
    intersectsSphere(sphere) {
      this.clampPoint(sphere.center, _vector$b);
      return _vector$b.distanceToSquared(sphere.center) <= sphere.radius * sphere.radius;
    }
    /**
     * Returns `true` if the given plane intersects with this bounding box.
     *
     * @param {Plane} plane - The plane to test.
     * @return {boolean} Whether the given plane intersects with this bounding box.
     */
    intersectsPlane(plane) {
      let min, max;
      if (plane.normal.x > 0) {
        min = plane.normal.x * this.min.x;
        max = plane.normal.x * this.max.x;
      } else {
        min = plane.normal.x * this.max.x;
        max = plane.normal.x * this.min.x;
      }
      if (plane.normal.y > 0) {
        min += plane.normal.y * this.min.y;
        max += plane.normal.y * this.max.y;
      } else {
        min += plane.normal.y * this.max.y;
        max += plane.normal.y * this.min.y;
      }
      if (plane.normal.z > 0) {
        min += plane.normal.z * this.min.z;
        max += plane.normal.z * this.max.z;
      } else {
        min += plane.normal.z * this.max.z;
        max += plane.normal.z * this.min.z;
      }
      return min <= -plane.constant && max >= -plane.constant;
    }
    /**
     * Returns `true` if the given triangle intersects with this bounding box.
     *
     * @param {Triangle} triangle - The triangle to test.
     * @return {boolean} Whether the given triangle intersects with this bounding box.
     */
    intersectsTriangle(triangle) {
      if (this.isEmpty()) {
        return false;
      }
      this.getCenter(_center$1);
      _extents.subVectors(this.max, _center$1);
      _v0$2.subVectors(triangle.a, _center$1);
      _v1$7.subVectors(triangle.b, _center$1);
      _v2$4.subVectors(triangle.c, _center$1);
      _f0.subVectors(_v1$7, _v0$2);
      _f1.subVectors(_v2$4, _v1$7);
      _f2.subVectors(_v0$2, _v2$4);
      let axes = [
        0,
        -_f0.z,
        _f0.y,
        0,
        -_f1.z,
        _f1.y,
        0,
        -_f2.z,
        _f2.y,
        _f0.z,
        0,
        -_f0.x,
        _f1.z,
        0,
        -_f1.x,
        _f2.z,
        0,
        -_f2.x,
        -_f0.y,
        _f0.x,
        0,
        -_f1.y,
        _f1.x,
        0,
        -_f2.y,
        _f2.x,
        0
      ];
      if (!satForAxes(axes, _v0$2, _v1$7, _v2$4, _extents)) {
        return false;
      }
      axes = [1, 0, 0, 0, 1, 0, 0, 0, 1];
      if (!satForAxes(axes, _v0$2, _v1$7, _v2$4, _extents)) {
        return false;
      }
      _triangleNormal.crossVectors(_f0, _f1);
      axes = [_triangleNormal.x, _triangleNormal.y, _triangleNormal.z];
      return satForAxes(axes, _v0$2, _v1$7, _v2$4, _extents);
    }
    /**
     * Clamps the given point within the bounds of this box.
     *
     * @param {Vector3} point - The point to clamp.
     * @param {Vector3} target - The target vector that is used to store the method's result.
     * @return {Vector3} The clamped point.
     */
    clampPoint(point, target) {
      return target.copy(point).clamp(this.min, this.max);
    }
    /**
     * Returns the euclidean distance from any edge of this box to the specified point. If
     * the given point lies inside of this box, the distance will be `0`.
     *
     * @param {Vector3} point - The point to compute the distance to.
     * @return {number} The euclidean distance.
     */
    distanceToPoint(point) {
      return this.clampPoint(point, _vector$b).distanceTo(point);
    }
    /**
     * Returns a bounding sphere that encloses this bounding box.
     *
     * @param {Sphere} target - The target sphere that is used to store the method's result.
     * @return {Sphere} The bounding sphere that encloses this bounding box.
     */
    getBoundingSphere(target) {
      if (this.isEmpty()) {
        target.makeEmpty();
      } else {
        this.getCenter(target.center);
        target.radius = this.getSize(_vector$b).length() * 0.5;
      }
      return target;
    }
    /**
     * Computes the intersection of this bounding box and the given one, setting the upper
     * bound of this box to the lesser of the two boxes' upper bounds and the
     * lower bound of this box to the greater of the two boxes' lower bounds. If
     * there's no overlap, makes this box empty.
     *
     * @param {Box3} box - The bounding box to intersect with.
     * @return {Box3} A reference to this bounding box.
     */
    intersect(box) {
      this.min.max(box.min);
      this.max.min(box.max);
      if (this.isEmpty()) this.makeEmpty();
      return this;
    }
    /**
     * Computes the union of this box and another and the given one, setting the upper
     * bound of this box to the greater of the two boxes' upper bounds and the
     * lower bound of this box to the lesser of the two boxes' lower bounds.
     *
     * @param {Box3} box - The bounding box that will be unioned with this instance.
     * @return {Box3} A reference to this bounding box.
     */
    union(box) {
      this.min.min(box.min);
      this.max.max(box.max);
      return this;
    }
    /**
     * Transforms this bounding box by the given 4x4 transformation matrix.
     *
     * @param {Matrix4} matrix - The transformation matrix.
     * @return {Box3} A reference to this bounding box.
     */
    applyMatrix4(matrix) {
      if (this.isEmpty()) return this;
      _points[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(matrix);
      _points[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(matrix);
      _points[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(matrix);
      _points[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(matrix);
      _points[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(matrix);
      _points[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(matrix);
      _points[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(matrix);
      _points[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(matrix);
      this.setFromPoints(_points);
      return this;
    }
    /**
     * Adds the given offset to both the upper and lower bounds of this bounding box,
     * effectively moving it in 3D space.
     *
     * @param {Vector3} offset - The offset that should be used to translate the bounding box.
     * @return {Box3} A reference to this bounding box.
     */
    translate(offset) {
      this.min.add(offset);
      this.max.add(offset);
      return this;
    }
    /**
     * Returns `true` if this bounding box is equal with the given one.
     *
     * @param {Box3} box - The box to test for equality.
     * @return {boolean} Whether this bounding box is equal with the given one.
     */
    equals(box) {
      return box.min.equals(this.min) && box.max.equals(this.max);
    }
    /**
     * Returns a serialized structure of the bounding box.
     *
     * @return {Object} Serialized structure with fields representing the object state.
     */
    toJSON() {
      return {
        min: this.min.toArray(),
        max: this.max.toArray()
      };
    }
    /**
     * Returns a serialized structure of the bounding box.
     *
     * @param {Object} json - The serialized json to set the box from.
     * @return {Box3} A reference to this bounding box.
     */
    fromJSON(json) {
      this.min.fromArray(json.min);
      this.max.fromArray(json.max);
      return this;
    }
  }
  const _points = [
    /* @__PURE__ */ new Vector3(),
    /* @__PURE__ */ new Vector3(),
    /* @__PURE__ */ new Vector3(),
    /* @__PURE__ */ new Vector3(),
    /* @__PURE__ */ new Vector3(),
    /* @__PURE__ */ new Vector3(),
    /* @__PURE__ */ new Vector3(),
    /* @__PURE__ */ new Vector3()
  ];
  const _vector$b = /* @__PURE__ */ new Vector3();
  const _box$4 = /* @__PURE__ */ new Box3();
  const _v0$2 = /* @__PURE__ */ new Vector3();
  const _v1$7 = /* @__PURE__ */ new Vector3();
  const _v2$4 = /* @__PURE__ */ new Vector3();
  const _f0 = /* @__PURE__ */ new Vector3();
  const _f1 = /* @__PURE__ */ new Vector3();
  const _f2 = /* @__PURE__ */ new Vector3();
  const _center$1 = /* @__PURE__ */ new Vector3();
  const _extents = /* @__PURE__ */ new Vector3();
  const _triangleNormal = /* @__PURE__ */ new Vector3();
  const _testAxis = /* @__PURE__ */ new Vector3();
  function satForAxes(axes, v0, v1, v2, extents) {
    for (let i = 0, j = axes.length - 3; i <= j; i += 3) {
      _testAxis.fromArray(axes, i);
      const r = extents.x * Math.abs(_testAxis.x) + extents.y * Math.abs(_testAxis.y) + extents.z * Math.abs(_testAxis.z);
      const p0 = v0.dot(_testAxis);
      const p1 = v1.dot(_testAxis);
      const p2 = v2.dot(_testAxis);
      if (Math.max(-Math.max(p0, p1, p2), Math.min(p0, p1, p2)) > r) {
        return false;
      }
    }
    return true;
  }
  const _box$3 = /* @__PURE__ */ new Box3();
  const _v1$6 = /* @__PURE__ */ new Vector3();
  const _v2$3 = /* @__PURE__ */ new Vector3();
  class Sphere {
    /**
     * Constructs a new sphere.
     *
     * @param {Vector3} [center=(0,0,0)] - The center of the sphere
     * @param {number} [radius=-1] - The radius of the sphere.
     */
    constructor(center = new Vector3(), radius = -1) {
      this.isSphere = true;
      this.center = center;
      this.radius = radius;
    }
    /**
     * Sets the sphere's components by copying the given values.
     *
     * @param {Vector3} center - The center.
     * @param {number} radius - The radius.
     * @return {Sphere} A reference to this sphere.
     */
    set(center, radius) {
      this.center.copy(center);
      this.radius = radius;
      return this;
    }
    /**
     * Computes the minimum bounding sphere for list of points.
     * If the optional center point is given, it is used as the sphere's
     * center. Otherwise, the center of the axis-aligned bounding box
     * encompassing the points is calculated.
     *
     * @param {Array<Vector3>} points - A list of points in 3D space.
     * @param {Vector3} [optionalCenter] - The center of the sphere.
     * @return {Sphere} A reference to this sphere.
     */
    setFromPoints(points, optionalCenter) {
      const center = this.center;
      if (optionalCenter !== void 0) {
        center.copy(optionalCenter);
      } else {
        _box$3.setFromPoints(points).getCenter(center);
      }
      let maxRadiusSq = 0;
      for (let i = 0, il = points.length; i < il; i++) {
        maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(points[i]));
      }
      this.radius = Math.sqrt(maxRadiusSq);
      return this;
    }
    /**
     * Copies the values of the given sphere to this instance.
     *
     * @param {Sphere} sphere - The sphere to copy.
     * @return {Sphere} A reference to this sphere.
     */
    copy(sphere) {
      this.center.copy(sphere.center);
      this.radius = sphere.radius;
      return this;
    }
    /**
     * Returns `true` if the sphere is empty (the radius set to a negative number).
     *
     * Spheres with a radius of `0` contain only their center point and are not
     * considered to be empty.
     *
     * @return {boolean} Whether this sphere is empty or not.
     */
    isEmpty() {
      return this.radius < 0;
    }
    /**
     * Makes this sphere empty which means in encloses a zero space in 3D.
     *
     * @return {Sphere} A reference to this sphere.
     */
    makeEmpty() {
      this.center.set(0, 0, 0);
      this.radius = -1;
      return this;
    }
    /**
     * Returns `true` if this sphere contains the given point inclusive of
     * the surface of the sphere.
     *
     * @param {Vector3} point - The point to check.
     * @return {boolean} Whether this sphere contains the given point or not.
     */
    containsPoint(point) {
      return point.distanceToSquared(this.center) <= this.radius * this.radius;
    }
    /**
     * Returns the closest distance from the boundary of the sphere to the
     * given point. If the sphere contains the point, the distance will
     * be negative.
     *
     * @param {Vector3} point - The point to compute the distance to.
     * @return {number} The distance to the point.
     */
    distanceToPoint(point) {
      return point.distanceTo(this.center) - this.radius;
    }
    /**
     * Returns `true` if this sphere intersects with the given one.
     *
     * @param {Sphere} sphere - The sphere to test.
     * @return {boolean} Whether this sphere intersects with the given one or not.
     */
    intersectsSphere(sphere) {
      const radiusSum = this.radius + sphere.radius;
      return sphere.center.distanceToSquared(this.center) <= radiusSum * radiusSum;
    }
    /**
     * Returns `true` if this sphere intersects with the given box.
     *
     * @param {Box3} box - The box to test.
     * @return {boolean} Whether this sphere intersects with the given box or not.
     */
    intersectsBox(box) {
      return box.intersectsSphere(this);
    }
    /**
     * Returns `true` if this sphere intersects with the given plane.
     *
     * @param {Plane} plane - The plane to test.
     * @return {boolean} Whether this sphere intersects with the given plane or not.
     */
    intersectsPlane(plane) {
      return Math.abs(plane.distanceToPoint(this.center)) <= this.radius;
    }
    /**
     * Clamps a point within the sphere. If the point is outside the sphere, it
     * will clamp it to the closest point on the edge of the sphere. Points
     * already inside the sphere will not be affected.
     *
     * @param {Vector3} point - The plane to clamp.
     * @param {Vector3} target - The target vector that is used to store the method's result.
     * @return {Vector3} The clamped point.
     */
    clampPoint(point, target) {
      const deltaLengthSq = this.center.distanceToSquared(point);
      target.copy(point);
      if (deltaLengthSq > this.radius * this.radius) {
        target.sub(this.center).normalize();
        target.multiplyScalar(this.radius).add(this.center);
      }
      return target;
    }
    /**
     * Returns a bounding box that encloses this sphere.
     *
     * @param {Box3} target - The target box that is used to store the method's result.
     * @return {Box3} The bounding box that encloses this sphere.
     */
    getBoundingBox(target) {
      if (this.isEmpty()) {
        target.makeEmpty();
        return target;
      }
      target.set(this.center, this.center);
      target.expandByScalar(this.radius);
      return target;
    }
    /**
     * Transforms this sphere with the given 4x4 transformation matrix.
     *
     * @param {Matrix4} matrix - The transformation matrix.
     * @return {Sphere} A reference to this sphere.
     */
    applyMatrix4(matrix) {
      this.center.applyMatrix4(matrix);
      this.radius = this.radius * matrix.getMaxScaleOnAxis();
      return this;
    }
    /**
     * Translates the sphere's center by the given offset.
     *
     * @param {Vector3} offset - The offset.
     * @return {Sphere} A reference to this sphere.
     */
    translate(offset) {
      this.center.add(offset);
      return this;
    }
    /**
     * Expands the boundaries of this sphere to include the given point.
     *
     * @param {Vector3} point - The point to include.
     * @return {Sphere} A reference to this sphere.
     */
    expandByPoint(point) {
      if (this.isEmpty()) {
        this.center.copy(point);
        this.radius = 0;
        return this;
      }
      _v1$6.subVectors(point, this.center);
      const lengthSq = _v1$6.lengthSq();
      if (lengthSq > this.radius * this.radius) {
        const length = Math.sqrt(lengthSq);
        const delta = (length - this.radius) * 0.5;
        this.center.addScaledVector(_v1$6, delta / length);
        this.radius += delta;
      }
      return this;
    }
    /**
     * Expands this sphere to enclose both the original sphere and the given sphere.
     *
     * @param {Sphere} sphere - The sphere to include.
     * @return {Sphere} A reference to this sphere.
     */
    union(sphere) {
      if (sphere.isEmpty()) {
        return this;
      }
      if (this.isEmpty()) {
        this.copy(sphere);
        return this;
      }
      if (this.center.equals(sphere.center) === true) {
        this.radius = Math.max(this.radius, sphere.radius);
      } else {
        _v2$3.subVectors(sphere.center, this.center).setLength(sphere.radius);
        this.expandByPoint(_v1$6.copy(sphere.center).add(_v2$3));
        this.expandByPoint(_v1$6.copy(sphere.center).sub(_v2$3));
      }
      return this;
    }
    /**
     * Returns `true` if this sphere is equal with the given one.
     *
     * @param {Sphere} sphere - The sphere to test for equality.
     * @return {boolean} Whether this bounding sphere is equal with the given one.
     */
    equals(sphere) {
      return sphere.center.equals(this.center) && sphere.radius === this.radius;
    }
    /**
     * Returns a new sphere with copied values from this instance.
     *
     * @return {Sphere} A clone of this instance.
     */
    clone() {
      return new this.constructor().copy(this);
    }
    /**
     * Returns a serialized structure of the bounding sphere.
     *
     * @return {Object} Serialized structure with fields representing the object state.
     */
    toJSON() {
      return {
        radius: this.radius,
        center: this.center.toArray()
      };
    }
    /**
     * Returns a serialized structure of the bounding sphere.
     *
     * @param {Object} json - The serialized json to set the sphere from.
     * @return {Sphere} A reference to this bounding sphere.
     */
    fromJSON(json) {
      this.radius = json.radius;
      this.center.fromArray(json.center);
      return this;
    }
  }
  class Matrix4 {
    /**
     * Constructs a new 4x4 matrix. The arguments are supposed to be
     * in row-major order. If no arguments are provided, the constructor
     * initializes the matrix as an identity matrix.
     *
     * @param {number} [n11] - 1-1 matrix element.
     * @param {number} [n12] - 1-2 matrix element.
     * @param {number} [n13] - 1-3 matrix element.
     * @param {number} [n14] - 1-4 matrix element.
     * @param {number} [n21] - 2-1 matrix element.
     * @param {number} [n22] - 2-2 matrix element.
     * @param {number} [n23] - 2-3 matrix element.
     * @param {number} [n24] - 2-4 matrix element.
     * @param {number} [n31] - 3-1 matrix element.
     * @param {number} [n32] - 3-2 matrix element.
     * @param {number} [n33] - 3-3 matrix element.
     * @param {number} [n34] - 3-4 matrix element.
     * @param {number} [n41] - 4-1 matrix element.
     * @param {number} [n42] - 4-2 matrix element.
     * @param {number} [n43] - 4-3 matrix element.
     * @param {number} [n44] - 4-4 matrix element.
     */
    constructor(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
      Matrix4.prototype.isMatrix4 = true;
      this.elements = [
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
      ];
      if (n11 !== void 0) {
        this.set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44);
      }
    }
    /**
     * Sets the elements of the matrix.The arguments are supposed to be
     * in row-major order.
     *
     * @param {number} [n11] - 1-1 matrix element.
     * @param {number} [n12] - 1-2 matrix element.
     * @param {number} [n13] - 1-3 matrix element.
     * @param {number} [n14] - 1-4 matrix element.
     * @param {number} [n21] - 2-1 matrix element.
     * @param {number} [n22] - 2-2 matrix element.
     * @param {number} [n23] - 2-3 matrix element.
     * @param {number} [n24] - 2-4 matrix element.
     * @param {number} [n31] - 3-1 matrix element.
     * @param {number} [n32] - 3-2 matrix element.
     * @param {number} [n33] - 3-3 matrix element.
     * @param {number} [n34] - 3-4 matrix element.
     * @param {number} [n41] - 4-1 matrix element.
     * @param {number} [n42] - 4-2 matrix element.
     * @param {number} [n43] - 4-3 matrix element.
     * @param {number} [n44] - 4-4 matrix element.
     * @return {Matrix4} A reference to this matrix.
     */
    set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
      const te = this.elements;
      te[0] = n11;
      te[4] = n12;
      te[8] = n13;
      te[12] = n14;
      te[1] = n21;
      te[5] = n22;
      te[9] = n23;
      te[13] = n24;
      te[2] = n31;
      te[6] = n32;
      te[10] = n33;
      te[14] = n34;
      te[3] = n41;
      te[7] = n42;
      te[11] = n43;
      te[15] = n44;
      return this;
    }
    /**
     * Sets this matrix to the 4x4 identity matrix.
     *
     * @return {Matrix4} A reference to this matrix.
     */
    identity() {
      this.set(
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
      );
      return this;
    }
    /**
     * Returns a matrix with copied values from this instance.
     *
     * @return {Matrix4} A clone of this instance.
     */
    clone() {
      return new Matrix4().fromArray(this.elements);
    }
    /**
     * Copies the values of the given matrix to this instance.
     *
     * @param {Matrix4} m - The matrix to copy.
     * @return {Matrix4} A reference to this matrix.
     */
    copy(m) {
      const te = this.elements;
      const me = m.elements;
      te[0] = me[0];
      te[1] = me[1];
      te[2] = me[2];
      te[3] = me[3];
      te[4] = me[4];
      te[5] = me[5];
      te[6] = me[6];
      te[7] = me[7];
      te[8] = me[8];
      te[9] = me[9];
      te[10] = me[10];
      te[11] = me[11];
      te[12] = me[12];
      te[13] = me[13];
      te[14] = me[14];
      te[15] = me[15];
      return this;
    }
    /**
     * Copies the translation component of the given matrix
     * into this matrix's translation component.
     *
     * @param {Matrix4} m - The matrix to copy the translation component.
     * @return {Matrix4} A reference to this matrix.
     */
    copyPosition(m) {
      const te = this.elements, me = m.elements;
      te[12] = me[12];
      te[13] = me[13];
      te[14] = me[14];
      return this;
    }
    /**
     * Set the upper 3x3 elements of this matrix to the values of given 3x3 matrix.
     *
     * @param {Matrix3} m - The 3x3 matrix.
     * @return {Matrix4} A reference to this matrix.
     */
    setFromMatrix3(m) {
      const me = m.elements;
      this.set(
        me[0],
        me[3],
        me[6],
        0,
        me[1],
        me[4],
        me[7],
        0,
        me[2],
        me[5],
        me[8],
        0,
        0,
        0,
        0,
        1
      );
      return this;
    }
    /**
     * Extracts the basis of this matrix into the three axis vectors provided.
     *
     * @param {Vector3} xAxis - The basis's x axis.
     * @param {Vector3} yAxis - The basis's y axis.
     * @param {Vector3} zAxis - The basis's z axis.
     * @return {Matrix4} A reference to this matrix.
     */
    extractBasis(xAxis, yAxis, zAxis) {
      if (this.determinant() === 0) {
        xAxis.set(1, 0, 0);
        yAxis.set(0, 1, 0);
        zAxis.set(0, 0, 1);
        return this;
      }
      xAxis.setFromMatrixColumn(this, 0);
      yAxis.setFromMatrixColumn(this, 1);
      zAxis.setFromMatrixColumn(this, 2);
      return this;
    }
    /**
     * Sets the given basis vectors to this matrix.
     *
     * @param {Vector3} xAxis - The basis's x axis.
     * @param {Vector3} yAxis - The basis's y axis.
     * @param {Vector3} zAxis - The basis's z axis.
     * @return {Matrix4} A reference to this matrix.
     */
    makeBasis(xAxis, yAxis, zAxis) {
      this.set(
        xAxis.x,
        yAxis.x,
        zAxis.x,
        0,
        xAxis.y,
        yAxis.y,
        zAxis.y,
        0,
        xAxis.z,
        yAxis.z,
        zAxis.z,
        0,
        0,
        0,
        0,
        1
      );
      return this;
    }
    /**
     * Extracts the rotation component of the given matrix
     * into this matrix's rotation component.
     *
     * Note: This method does not support reflection matrices.
     *
     * @param {Matrix4} m - The matrix.
     * @return {Matrix4} A reference to this matrix.
     */
    extractRotation(m) {
      if (m.determinant() === 0) {
        return this.identity();
      }
      const te = this.elements;
      const me = m.elements;
      const scaleX = 1 / _v1$5.setFromMatrixColumn(m, 0).length();
      const scaleY = 1 / _v1$5.setFromMatrixColumn(m, 1).length();
      const scaleZ = 1 / _v1$5.setFromMatrixColumn(m, 2).length();
      te[0] = me[0] * scaleX;
      te[1] = me[1] * scaleX;
      te[2] = me[2] * scaleX;
      te[3] = 0;
      te[4] = me[4] * scaleY;
      te[5] = me[5] * scaleY;
      te[6] = me[6] * scaleY;
      te[7] = 0;
      te[8] = me[8] * scaleZ;
      te[9] = me[9] * scaleZ;
      te[10] = me[10] * scaleZ;
      te[11] = 0;
      te[12] = 0;
      te[13] = 0;
      te[14] = 0;
      te[15] = 1;
      return this;
    }
    /**
     * Sets the rotation component (the upper left 3x3 matrix) of this matrix to
     * the rotation specified by the given Euler angles. The rest of
     * the matrix is set to the identity. Depending on the {@link Euler#order},
     * there are six possible outcomes. See [this page](https://en.wikipedia.org/wiki/Euler_angles#Rotation_matrix)
     * for a complete list.
     *
     * @param {Euler} euler - The Euler angles.
     * @return {Matrix4} A reference to this matrix.
     */
    makeRotationFromEuler(euler) {
      const te = this.elements;
      const x = euler.x, y = euler.y, z = euler.z;
      const a = Math.cos(x), b = Math.sin(x);
      const c = Math.cos(y), d = Math.sin(y);
      const e = Math.cos(z), f = Math.sin(z);
      if (euler.order === "XYZ") {
        const ae = a * e, af = a * f, be = b * e, bf = b * f;
        te[0] = c * e;
        te[4] = -c * f;
        te[8] = d;
        te[1] = af + be * d;
        te[5] = ae - bf * d;
        te[9] = -b * c;
        te[2] = bf - ae * d;
        te[6] = be + af * d;
        te[10] = a * c;
      } else if (euler.order === "YXZ") {
        const ce = c * e, cf = c * f, de = d * e, df = d * f;
        te[0] = ce + df * b;
        te[4] = de * b - cf;
        te[8] = a * d;
        te[1] = a * f;
        te[5] = a * e;
        te[9] = -b;
        te[2] = cf * b - de;
        te[6] = df + ce * b;
        te[10] = a * c;
      } else if (euler.order === "ZXY") {
        const ce = c * e, cf = c * f, de = d * e, df = d * f;
        te[0] = ce - df * b;
        te[4] = -a * f;
        te[8] = de + cf * b;
        te[1] = cf + de * b;
        te[5] = a * e;
        te[9] = df - ce * b;
        te[2] = -a * d;
        te[6] = b;
        te[10] = a * c;
      } else if (euler.order === "ZYX") {
        const ae = a * e, af = a * f, be = b * e, bf = b * f;
        te[0] = c * e;
        te[4] = be * d - af;
        te[8] = ae * d + bf;
        te[1] = c * f;
        te[5] = bf * d + ae;
        te[9] = af * d - be;
        te[2] = -d;
        te[6] = b * c;
        te[10] = a * c;
      } else if (euler.order === "YZX") {
        const ac = a * c, ad = a * d, bc = b * c, bd = b * d;
        te[0] = c * e;
        te[4] = bd - ac * f;
        te[8] = bc * f + ad;
        te[1] = f;
        te[5] = a * e;
        te[9] = -b * e;
        te[2] = -d * e;
        te[6] = ad * f + bc;
        te[10] = ac - bd * f;
      } else if (euler.order === "XZY") {
        const ac = a * c, ad = a * d, bc = b * c, bd = b * d;
        te[0] = c * e;
        te[4] = -f;
        te[8] = d * e;
        te[1] = ac * f + bd;
        te[5] = a * e;
        te[9] = ad * f - bc;
        te[2] = bc * f - ad;
        te[6] = b * e;
        te[10] = bd * f + ac;
      }
      te[3] = 0;
      te[7] = 0;
      te[11] = 0;
      te[12] = 0;
      te[13] = 0;
      te[14] = 0;
      te[15] = 1;
      return this;
    }
    /**
     * Sets the rotation component of this matrix to the rotation specified by
     * the given Quaternion as outlined [here](https://en.wikipedia.org/wiki/Rotation_matrix#Quaternion)
     * The rest of the matrix is set to the identity.
     *
     * @param {Quaternion} q - The Quaternion.
     * @return {Matrix4} A reference to this matrix.
     */
    makeRotationFromQuaternion(q) {
      return this.compose(_zero, q, _one);
    }
    /**
     * Sets the rotation component of the transformation matrix, looking from `eye` towards
     * `target`, and oriented by the up-direction.
     *
     * @param {Vector3} eye - The eye vector.
     * @param {Vector3} target - The target vector.
     * @param {Vector3} up - The up vector.
     * @return {Matrix4} A reference to this matrix.
     */
    lookAt(eye, target, up) {
      const te = this.elements;
      _z.subVectors(eye, target);
      if (_z.lengthSq() === 0) {
        _z.z = 1;
      }
      _z.normalize();
      _x.crossVectors(up, _z);
      if (_x.lengthSq() === 0) {
        if (Math.abs(up.z) === 1) {
          _z.x += 1e-4;
        } else {
          _z.z += 1e-4;
        }
        _z.normalize();
        _x.crossVectors(up, _z);
      }
      _x.normalize();
      _y.crossVectors(_z, _x);
      te[0] = _x.x;
      te[4] = _y.x;
      te[8] = _z.x;
      te[1] = _x.y;
      te[5] = _y.y;
      te[9] = _z.y;
      te[2] = _x.z;
      te[6] = _y.z;
      te[10] = _z.z;
      return this;
    }
    /**
     * Post-multiplies this matrix by the given 4x4 matrix.
     *
     * @param {Matrix4} m - The matrix to multiply with.
     * @return {Matrix4} A reference to this matrix.
     */
    multiply(m) {
      return this.multiplyMatrices(this, m);
    }
    /**
     * Pre-multiplies this matrix by the given 4x4 matrix.
     *
     * @param {Matrix4} m - The matrix to multiply with.
     * @return {Matrix4} A reference to this matrix.
     */
    premultiply(m) {
      return this.multiplyMatrices(m, this);
    }
    /**
     * Multiples the given 4x4 matrices and stores the result
     * in this matrix.
     *
     * @param {Matrix4} a - The first matrix.
     * @param {Matrix4} b - The second matrix.
     * @return {Matrix4} A reference to this matrix.
     */
    multiplyMatrices(a, b) {
      const ae = a.elements;
      const be = b.elements;
      const te = this.elements;
      const a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
      const a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
      const a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
      const a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];
      const b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
      const b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
      const b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
      const b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];
      te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
      te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
      te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
      te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
      te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
      te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
      te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
      te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
      te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
      te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
      te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
      te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
      te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
      te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
      te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
      te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
      return this;
    }
    /**
     * Multiplies every component of the matrix by the given scalar.
     *
     * @param {number} s - The scalar.
     * @return {Matrix4} A reference to this matrix.
     */
    multiplyScalar(s) {
      const te = this.elements;
      te[0] *= s;
      te[4] *= s;
      te[8] *= s;
      te[12] *= s;
      te[1] *= s;
      te[5] *= s;
      te[9] *= s;
      te[13] *= s;
      te[2] *= s;
      te[6] *= s;
      te[10] *= s;
      te[14] *= s;
      te[3] *= s;
      te[7] *= s;
      te[11] *= s;
      te[15] *= s;
      return this;
    }
    /**
     * Computes and returns the determinant of this matrix.
     *
     * Based on the method outlined [here](http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.html).
     *
     * @return {number} The determinant.
     */
    determinant() {
      const te = this.elements;
      const n11 = te[0], n12 = te[4], n13 = te[8], n14 = te[12];
      const n21 = te[1], n22 = te[5], n23 = te[9], n24 = te[13];
      const n31 = te[2], n32 = te[6], n33 = te[10], n34 = te[14];
      const n41 = te[3], n42 = te[7], n43 = te[11], n44 = te[15];
      const t11 = n23 * n34 - n24 * n33;
      const t12 = n22 * n34 - n24 * n32;
      const t13 = n22 * n33 - n23 * n32;
      const t21 = n21 * n34 - n24 * n31;
      const t22 = n21 * n33 - n23 * n31;
      const t23 = n21 * n32 - n22 * n31;
      return n11 * (n42 * t11 - n43 * t12 + n44 * t13) - n12 * (n41 * t11 - n43 * t21 + n44 * t22) + n13 * (n41 * t12 - n42 * t21 + n44 * t23) - n14 * (n41 * t13 - n42 * t22 + n43 * t23);
    }
    /**
     * Transposes this matrix in place.
     *
     * @return {Matrix4} A reference to this matrix.
     */
    transpose() {
      const te = this.elements;
      let tmp2;
      tmp2 = te[1];
      te[1] = te[4];
      te[4] = tmp2;
      tmp2 = te[2];
      te[2] = te[8];
      te[8] = tmp2;
      tmp2 = te[6];
      te[6] = te[9];
      te[9] = tmp2;
      tmp2 = te[3];
      te[3] = te[12];
      te[12] = tmp2;
      tmp2 = te[7];
      te[7] = te[13];
      te[13] = tmp2;
      tmp2 = te[11];
      te[11] = te[14];
      te[14] = tmp2;
      return this;
    }
    /**
     * Sets the position component for this matrix from the given vector,
     * without affecting the rest of the matrix.
     *
     * @param {number|Vector3} x - The x component of the vector or alternatively the vector object.
     * @param {number} y - The y component of the vector.
     * @param {number} z - The z component of the vector.
     * @return {Matrix4} A reference to this matrix.
     */
    setPosition(x, y, z) {
      const te = this.elements;
      if (x.isVector3) {
        te[12] = x.x;
        te[13] = x.y;
        te[14] = x.z;
      } else {
        te[12] = x;
        te[13] = y;
        te[14] = z;
      }
      return this;
    }
    /**
     * Inverts this matrix, using the [analytic method](https://en.wikipedia.org/wiki/Invertible_matrix#Analytic_solution).
     * You can not invert with a determinant of zero. If you attempt this, the method produces
     * a zero matrix instead.
     *
     * @return {Matrix4} A reference to this matrix.
     */
    invert() {
      const te = this.elements, n11 = te[0], n21 = te[1], n31 = te[2], n41 = te[3], n12 = te[4], n22 = te[5], n32 = te[6], n42 = te[7], n13 = te[8], n23 = te[9], n33 = te[10], n43 = te[11], n14 = te[12], n24 = te[13], n34 = te[14], n44 = te[15], t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44, t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44, t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44, t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
      const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;
      if (det === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      const detInv = 1 / det;
      te[0] = t11 * detInv;
      te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
      te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
      te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;
      te[4] = t12 * detInv;
      te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
      te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
      te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;
      te[8] = t13 * detInv;
      te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
      te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
      te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;
      te[12] = t14 * detInv;
      te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
      te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
      te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;
      return this;
    }
    /**
     * Multiplies the columns of this matrix by the given vector.
     *
     * @param {Vector3} v - The scale vector.
     * @return {Matrix4} A reference to this matrix.
     */
    scale(v) {
      const te = this.elements;
      const x = v.x, y = v.y, z = v.z;
      te[0] *= x;
      te[4] *= y;
      te[8] *= z;
      te[1] *= x;
      te[5] *= y;
      te[9] *= z;
      te[2] *= x;
      te[6] *= y;
      te[10] *= z;
      te[3] *= x;
      te[7] *= y;
      te[11] *= z;
      return this;
    }
    /**
     * Gets the maximum scale value of the three axes.
     *
     * @return {number} The maximum scale.
     */
    getMaxScaleOnAxis() {
      const te = this.elements;
      const scaleXSq = te[0] * te[0] + te[1] * te[1] + te[2] * te[2];
      const scaleYSq = te[4] * te[4] + te[5] * te[5] + te[6] * te[6];
      const scaleZSq = te[8] * te[8] + te[9] * te[9] + te[10] * te[10];
      return Math.sqrt(Math.max(scaleXSq, scaleYSq, scaleZSq));
    }
    /**
     * Sets this matrix as a translation transform from the given vector.
     *
     * @param {number|Vector3} x - The amount to translate in the X axis or alternatively a translation vector.
     * @param {number} y - The amount to translate in the Y axis.
     * @param {number} z - The amount to translate in the z axis.
     * @return {Matrix4} A reference to this matrix.
     */
    makeTranslation(x, y, z) {
      if (x.isVector3) {
        this.set(
          1,
          0,
          0,
          x.x,
          0,
          1,
          0,
          x.y,
          0,
          0,
          1,
          x.z,
          0,
          0,
          0,
          1
        );
      } else {
        this.set(
          1,
          0,
          0,
          x,
          0,
          1,
          0,
          y,
          0,
          0,
          1,
          z,
          0,
          0,
          0,
          1
        );
      }
      return this;
    }
    /**
     * Sets this matrix as a rotational transformation around the X axis by
     * the given angle.
     *
     * @param {number} theta - The rotation in radians.
     * @return {Matrix4} A reference to this matrix.
     */
    makeRotationX(theta) {
      const c = Math.cos(theta), s = Math.sin(theta);
      this.set(
        1,
        0,
        0,
        0,
        0,
        c,
        -s,
        0,
        0,
        s,
        c,
        0,
        0,
        0,
        0,
        1
      );
      return this;
    }
    /**
     * Sets this matrix as a rotational transformation around the Y axis by
     * the given angle.
     *
     * @param {number} theta - The rotation in radians.
     * @return {Matrix4} A reference to this matrix.
     */
    makeRotationY(theta) {
      const c = Math.cos(theta), s = Math.sin(theta);
      this.set(
        c,
        0,
        s,
        0,
        0,
        1,
        0,
        0,
        -s,
        0,
        c,
        0,
        0,
        0,
        0,
        1
      );
      return this;
    }
    /**
     * Sets this matrix as a rotational transformation around the Z axis by
     * the given angle.
     *
     * @param {number} theta - The rotation in radians.
     * @return {Matrix4} A reference to this matrix.
     */
    makeRotationZ(theta) {
      const c = Math.cos(theta), s = Math.sin(theta);
      this.set(
        c,
        -s,
        0,
        0,
        s,
        c,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
      );
      return this;
    }
    /**
     * Sets this matrix as a rotational transformation around the given axis by
     * the given angle.
     *
     * This is a somewhat controversial but mathematically sound alternative to
     * rotating via Quaternions. See the discussion [here](https://www.gamedev.net/articles/programming/math-and-physics/do-we-really-need-quaternions-r1199).
     *
     * @param {Vector3} axis - The normalized rotation axis.
     * @param {number} angle - The rotation in radians.
     * @return {Matrix4} A reference to this matrix.
     */
    makeRotationAxis(axis, angle) {
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      const t = 1 - c;
      const x = axis.x, y = axis.y, z = axis.z;
      const tx = t * x, ty = t * y;
      this.set(
        tx * x + c,
        tx * y - s * z,
        tx * z + s * y,
        0,
        tx * y + s * z,
        ty * y + c,
        ty * z - s * x,
        0,
        tx * z - s * y,
        ty * z + s * x,
        t * z * z + c,
        0,
        0,
        0,
        0,
        1
      );
      return this;
    }
    /**
     * Sets this matrix as a scale transformation.
     *
     * @param {number} x - The amount to scale in the X axis.
     * @param {number} y - The amount to scale in the Y axis.
     * @param {number} z - The amount to scale in the Z axis.
     * @return {Matrix4} A reference to this matrix.
     */
    makeScale(x, y, z) {
      this.set(
        x,
        0,
        0,
        0,
        0,
        y,
        0,
        0,
        0,
        0,
        z,
        0,
        0,
        0,
        0,
        1
      );
      return this;
    }
    /**
     * Sets this matrix as a shear transformation.
     *
     * @param {number} xy - The amount to shear X by Y.
     * @param {number} xz - The amount to shear X by Z.
     * @param {number} yx - The amount to shear Y by X.
     * @param {number} yz - The amount to shear Y by Z.
     * @param {number} zx - The amount to shear Z by X.
     * @param {number} zy - The amount to shear Z by Y.
     * @return {Matrix4} A reference to this matrix.
     */
    makeShear(xy, xz, yx, yz, zx, zy) {
      this.set(
        1,
        yx,
        zx,
        0,
        xy,
        1,
        zy,
        0,
        xz,
        yz,
        1,
        0,
        0,
        0,
        0,
        1
      );
      return this;
    }
    /**
     * Sets this matrix to the transformation composed of the given position,
     * rotation (Quaternion) and scale.
     *
     * @param {Vector3} position - The position vector.
     * @param {Quaternion} quaternion - The rotation as a Quaternion.
     * @param {Vector3} scale - The scale vector.
     * @return {Matrix4} A reference to this matrix.
     */
    compose(position, quaternion, scale) {
      const te = this.elements;
      const x = quaternion._x, y = quaternion._y, z = quaternion._z, w = quaternion._w;
      const x2 = x + x, y2 = y + y, z2 = z + z;
      const xx = x * x2, xy = x * y2, xz = x * z2;
      const yy = y * y2, yz = y * z2, zz = z * z2;
      const wx = w * x2, wy = w * y2, wz = w * z2;
      const sx = scale.x, sy = scale.y, sz = scale.z;
      te[0] = (1 - (yy + zz)) * sx;
      te[1] = (xy + wz) * sx;
      te[2] = (xz - wy) * sx;
      te[3] = 0;
      te[4] = (xy - wz) * sy;
      te[5] = (1 - (xx + zz)) * sy;
      te[6] = (yz + wx) * sy;
      te[7] = 0;
      te[8] = (xz + wy) * sz;
      te[9] = (yz - wx) * sz;
      te[10] = (1 - (xx + yy)) * sz;
      te[11] = 0;
      te[12] = position.x;
      te[13] = position.y;
      te[14] = position.z;
      te[15] = 1;
      return this;
    }
    /**
     * Decomposes this matrix into its position, rotation and scale components
     * and provides the result in the given objects.
     *
     * Note: Not all matrices are decomposable in this way. For example, if an
     * object has a non-uniformly scaled parent, then the object's world matrix
     * may not be decomposable, and this method may not be appropriate.
     *
     * @param {Vector3} position - The position vector.
     * @param {Quaternion} quaternion - The rotation as a Quaternion.
     * @param {Vector3} scale - The scale vector.
     * @return {Matrix4} A reference to this matrix.
     */
    decompose(position, quaternion, scale) {
      const te = this.elements;
      position.x = te[12];
      position.y = te[13];
      position.z = te[14];
      if (this.determinant() === 0) {
        scale.set(1, 1, 1);
        quaternion.identity();
        return this;
      }
      let sx = _v1$5.set(te[0], te[1], te[2]).length();
      const sy = _v1$5.set(te[4], te[5], te[6]).length();
      const sz = _v1$5.set(te[8], te[9], te[10]).length();
      const det = this.determinant();
      if (det < 0) sx = -sx;
      _m1$2.copy(this);
      const invSX = 1 / sx;
      const invSY = 1 / sy;
      const invSZ = 1 / sz;
      _m1$2.elements[0] *= invSX;
      _m1$2.elements[1] *= invSX;
      _m1$2.elements[2] *= invSX;
      _m1$2.elements[4] *= invSY;
      _m1$2.elements[5] *= invSY;
      _m1$2.elements[6] *= invSY;
      _m1$2.elements[8] *= invSZ;
      _m1$2.elements[9] *= invSZ;
      _m1$2.elements[10] *= invSZ;
      quaternion.setFromRotationMatrix(_m1$2);
      scale.x = sx;
      scale.y = sy;
      scale.z = sz;
      return this;
    }
    /**
    		 * Creates a perspective projection matrix. This is used internally by
    		 * {@link PerspectiveCamera#updateProjectionMatrix}.
    
    		 * @param {number} left - Left boundary of the viewing frustum at the near plane.
    		 * @param {number} right - Right boundary of the viewing frustum at the near plane.
    		 * @param {number} top - Top boundary of the viewing frustum at the near plane.
    		 * @param {number} bottom - Bottom boundary of the viewing frustum at the near plane.
    		 * @param {number} near - The distance from the camera to the near plane.
    		 * @param {number} far - The distance from the camera to the far plane.
    		 * @param {(WebGLCoordinateSystem|WebGPUCoordinateSystem)} [coordinateSystem=WebGLCoordinateSystem] - The coordinate system.
    		 * @param {boolean} [reversedDepth=false] - Whether to use a reversed depth.
    		 * @return {Matrix4} A reference to this matrix.
    		 */
    makePerspective(left, right, top, bottom, near, far, coordinateSystem = WebGLCoordinateSystem, reversedDepth = false) {
      const te = this.elements;
      const x = 2 * near / (right - left);
      const y = 2 * near / (top - bottom);
      const a = (right + left) / (right - left);
      const b = (top + bottom) / (top - bottom);
      let c, d;
      if (reversedDepth) {
        c = near / (far - near);
        d = far * near / (far - near);
      } else {
        if (coordinateSystem === WebGLCoordinateSystem) {
          c = -(far + near) / (far - near);
          d = -2 * far * near / (far - near);
        } else if (coordinateSystem === WebGPUCoordinateSystem) {
          c = -far / (far - near);
          d = -far * near / (far - near);
        } else {
          throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + coordinateSystem);
        }
      }
      te[0] = x;
      te[4] = 0;
      te[8] = a;
      te[12] = 0;
      te[1] = 0;
      te[5] = y;
      te[9] = b;
      te[13] = 0;
      te[2] = 0;
      te[6] = 0;
      te[10] = c;
      te[14] = d;
      te[3] = 0;
      te[7] = 0;
      te[11] = -1;
      te[15] = 0;
      return this;
    }
    /**
    		 * Creates a orthographic projection matrix. This is used internally by
    		 * {@link OrthographicCamera#updateProjectionMatrix}.
    
    		 * @param {number} left - Left boundary of the viewing frustum at the near plane.
    		 * @param {number} right - Right boundary of the viewing frustum at the near plane.
    		 * @param {number} top - Top boundary of the viewing frustum at the near plane.
    		 * @param {number} bottom - Bottom boundary of the viewing frustum at the near plane.
    		 * @param {number} near - The distance from the camera to the near plane.
    		 * @param {number} far - The distance from the camera to the far plane.
    		 * @param {(WebGLCoordinateSystem|WebGPUCoordinateSystem)} [coordinateSystem=WebGLCoordinateSystem] - The coordinate system.
    		 * @param {boolean} [reversedDepth=false] - Whether to use a reversed depth.
    		 * @return {Matrix4} A reference to this matrix.
    		 */
    makeOrthographic(left, right, top, bottom, near, far, coordinateSystem = WebGLCoordinateSystem, reversedDepth = false) {
      const te = this.elements;
      const x = 2 / (right - left);
      const y = 2 / (top - bottom);
      const a = -(right + left) / (right - left);
      const b = -(top + bottom) / (top - bottom);
      let c, d;
      if (reversedDepth) {
        c = 1 / (far - near);
        d = far / (far - near);
      } else {
        if (coordinateSystem === WebGLCoordinateSystem) {
          c = -2 / (far - near);
          d = -(far + near) / (far - near);
        } else if (coordinateSystem === WebGPUCoordinateSystem) {
          c = -1 / (far - near);
          d = -near / (far - near);
        } else {
          throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + coordinateSystem);
        }
      }
      te[0] = x;
      te[4] = 0;
      te[8] = 0;
      te[12] = a;
      te[1] = 0;
      te[5] = y;
      te[9] = 0;
      te[13] = b;
      te[2] = 0;
      te[6] = 0;
      te[10] = c;
      te[14] = d;
      te[3] = 0;
      te[7] = 0;
      te[11] = 0;
      te[15] = 1;
      return this;
    }
    /**
     * Returns `true` if this matrix is equal with the given one.
     *
     * @param {Matrix4} matrix - The matrix to test for equality.
     * @return {boolean} Whether this matrix is equal with the given one.
     */
    equals(matrix) {
      const te = this.elements;
      const me = matrix.elements;
      for (let i = 0; i < 16; i++) {
        if (te[i] !== me[i]) return false;
      }
      return true;
    }
    /**
     * Sets the elements of the matrix from the given array.
     *
     * @param {Array<number>} array - The matrix elements in column-major order.
     * @param {number} [offset=0] - Index of the first element in the array.
     * @return {Matrix4} A reference to this matrix.
     */
    fromArray(array, offset = 0) {
      for (let i = 0; i < 16; i++) {
        this.elements[i] = array[i + offset];
      }
      return this;
    }
    /**
     * Writes the elements of this matrix to the given array. If no array is provided,
     * the method returns a new instance.
     *
     * @param {Array<number>} [array=[]] - The target array holding the matrix elements in column-major order.
     * @param {number} [offset=0] - Index of the first element in the array.
     * @return {Array<number>} The matrix elements in column-major order.
     */
    toArray(array = [], offset = 0) {
      const te = this.elements;
      array[offset] = te[0];
      array[offset + 1] = te[1];
      array[offset + 2] = te[2];
      array[offset + 3] = te[3];
      array[offset + 4] = te[4];
      array[offset + 5] = te[5];
      array[offset + 6] = te[6];
      array[offset + 7] = te[7];
      array[offset + 8] = te[8];
      array[offset + 9] = te[9];
      array[offset + 10] = te[10];
      array[offset + 11] = te[11];
      array[offset + 12] = te[12];
      array[offset + 13] = te[13];
      array[offset + 14] = te[14];
      array[offset + 15] = te[15];
      return array;
    }
  }
  const _v1$5 = /* @__PURE__ */ new Vector3();
  const _m1$2 = /* @__PURE__ */ new Matrix4();
  const _zero = /* @__PURE__ */ new Vector3(0, 0, 0);
  const _one = /* @__PURE__ */ new Vector3(1, 1, 1);
  const _x = /* @__PURE__ */ new Vector3();
  const _y = /* @__PURE__ */ new Vector3();
  const _z = /* @__PURE__ */ new Vector3();
  const _matrix$2 = /* @__PURE__ */ new Matrix4();
  const _quaternion$3 = /* @__PURE__ */ new Quaternion();
  class Euler {
    /**
     * Constructs a new euler instance.
     *
     * @param {number} [x=0] - The angle of the x axis in radians.
     * @param {number} [y=0] - The angle of the y axis in radians.
     * @param {number} [z=0] - The angle of the z axis in radians.
     * @param {string} [order=Euler.DEFAULT_ORDER] - A string representing the order that the rotations are applied.
     */
    constructor(x = 0, y = 0, z = 0, order = Euler.DEFAULT_ORDER) {
      this.isEuler = true;
      this._x = x;
      this._y = y;
      this._z = z;
      this._order = order;
    }
    /**
     * The angle of the x axis in radians.
     *
     * @type {number}
     * @default 0
     */
    get x() {
      return this._x;
    }
    set x(value) {
      this._x = value;
      this._onChangeCallback();
    }
    /**
     * The angle of the y axis in radians.
     *
     * @type {number}
     * @default 0
     */
    get y() {
      return this._y;
    }
    set y(value) {
      this._y = value;
      this._onChangeCallback();
    }
    /**
     * The angle of the z axis in radians.
     *
     * @type {number}
     * @default 0
     */
    get z() {
      return this._z;
    }
    set z(value) {
      this._z = value;
      this._onChangeCallback();
    }
    /**
     * A string representing the order that the rotations are applied.
     *
     * @type {string}
     * @default 'XYZ'
     */
    get order() {
      return this._order;
    }
    set order(value) {
      this._order = value;
      this._onChangeCallback();
    }
    /**
     * Sets the Euler components.
     *
     * @param {number} x - The angle of the x axis in radians.
     * @param {number} y - The angle of the y axis in radians.
     * @param {number} z - The angle of the z axis in radians.
     * @param {string} [order] - A string representing the order that the rotations are applied.
     * @return {Euler} A reference to this Euler instance.
     */
    set(x, y, z, order = this._order) {
      this._x = x;
      this._y = y;
      this._z = z;
      this._order = order;
      this._onChangeCallback();
      return this;
    }
    /**
     * Returns a new Euler instance with copied values from this instance.
     *
     * @return {Euler} A clone of this instance.
     */
    clone() {
      return new this.constructor(this._x, this._y, this._z, this._order);
    }
    /**
     * Copies the values of the given Euler instance to this instance.
     *
     * @param {Euler} euler - The Euler instance to copy.
     * @return {Euler} A reference to this Euler instance.
     */
    copy(euler) {
      this._x = euler._x;
      this._y = euler._y;
      this._z = euler._z;
      this._order = euler._order;
      this._onChangeCallback();
      return this;
    }
    /**
     * Sets the angles of this Euler instance from a pure rotation matrix.
     *
     * @param {Matrix4} m - A 4x4 matrix of which the upper 3x3 of matrix is a pure rotation matrix (i.e. unscaled).
     * @param {string} [order] - A string representing the order that the rotations are applied.
     * @param {boolean} [update=true] - Whether the internal `onChange` callback should be executed or not.
     * @return {Euler} A reference to this Euler instance.
     */
    setFromRotationMatrix(m, order = this._order, update = true) {
      const te = m.elements;
      const m11 = te[0], m12 = te[4], m13 = te[8];
      const m21 = te[1], m22 = te[5], m23 = te[9];
      const m31 = te[2], m32 = te[6], m33 = te[10];
      switch (order) {
        case "XYZ":
          this._y = Math.asin(clamp(m13, -1, 1));
          if (Math.abs(m13) < 0.9999999) {
            this._x = Math.atan2(-m23, m33);
            this._z = Math.atan2(-m12, m11);
          } else {
            this._x = Math.atan2(m32, m22);
            this._z = 0;
          }
          break;
        case "YXZ":
          this._x = Math.asin(-clamp(m23, -1, 1));
          if (Math.abs(m23) < 0.9999999) {
            this._y = Math.atan2(m13, m33);
            this._z = Math.atan2(m21, m22);
          } else {
            this._y = Math.atan2(-m31, m11);
            this._z = 0;
          }
          break;
        case "ZXY":
          this._x = Math.asin(clamp(m32, -1, 1));
          if (Math.abs(m32) < 0.9999999) {
            this._y = Math.atan2(-m31, m33);
            this._z = Math.atan2(-m12, m22);
          } else {
            this._y = 0;
            this._z = Math.atan2(m21, m11);
          }
          break;
        case "ZYX":
          this._y = Math.asin(-clamp(m31, -1, 1));
          if (Math.abs(m31) < 0.9999999) {
            this._x = Math.atan2(m32, m33);
            this._z = Math.atan2(m21, m11);
          } else {
            this._x = 0;
            this._z = Math.atan2(-m12, m22);
          }
          break;
        case "YZX":
          this._z = Math.asin(clamp(m21, -1, 1));
          if (Math.abs(m21) < 0.9999999) {
            this._x = Math.atan2(-m23, m22);
            this._y = Math.atan2(-m31, m11);
          } else {
            this._x = 0;
            this._y = Math.atan2(m13, m33);
          }
          break;
        case "XZY":
          this._z = Math.asin(-clamp(m12, -1, 1));
          if (Math.abs(m12) < 0.9999999) {
            this._x = Math.atan2(m32, m22);
            this._y = Math.atan2(m13, m11);
          } else {
            this._x = Math.atan2(-m23, m33);
            this._y = 0;
          }
          break;
        default:
          warn("Euler: .setFromRotationMatrix() encountered an unknown order: " + order);
      }
      this._order = order;
      if (update === true) this._onChangeCallback();
      return this;
    }
    /**
     * Sets the angles of this Euler instance from a normalized quaternion.
     *
     * @param {Quaternion} q - A normalized Quaternion.
     * @param {string} [order] - A string representing the order that the rotations are applied.
     * @param {boolean} [update=true] - Whether the internal `onChange` callback should be executed or not.
     * @return {Euler} A reference to this Euler instance.
     */
    setFromQuaternion(q, order, update) {
      _matrix$2.makeRotationFromQuaternion(q);
      return this.setFromRotationMatrix(_matrix$2, order, update);
    }
    /**
     * Sets the angles of this Euler instance from the given vector.
     *
     * @param {Vector3} v - The vector.
     * @param {string} [order] - A string representing the order that the rotations are applied.
     * @return {Euler} A reference to this Euler instance.
     */
    setFromVector3(v, order = this._order) {
      return this.set(v.x, v.y, v.z, order);
    }
    /**
     * Resets the euler angle with a new order by creating a quaternion from this
     * euler angle and then setting this euler angle with the quaternion and the
     * new order.
     *
     * Warning: This discards revolution information.
     *
     * @param {string} [newOrder] - A string representing the new order that the rotations are applied.
     * @return {Euler} A reference to this Euler instance.
     */
    reorder(newOrder) {
      _quaternion$3.setFromEuler(this);
      return this.setFromQuaternion(_quaternion$3, newOrder);
    }
    /**
     * Returns `true` if this Euler instance is equal with the given one.
     *
     * @param {Euler} euler - The Euler instance to test for equality.
     * @return {boolean} Whether this Euler instance is equal with the given one.
     */
    equals(euler) {
      return euler._x === this._x && euler._y === this._y && euler._z === this._z && euler._order === this._order;
    }
    /**
     * Sets this Euler instance's components to values from the given array. The first three
     * entries of the array are assign to the x,y and z components. An optional fourth entry
     * defines the Euler order.
     *
     * @param {Array<number,number,number,?string>} array - An array holding the Euler component values.
     * @return {Euler} A reference to this Euler instance.
     */
    fromArray(array) {
      this._x = array[0];
      this._y = array[1];
      this._z = array[2];
      if (array[3] !== void 0) this._order = array[3];
      this._onChangeCallback();
      return this;
    }
    /**
     * Writes the components of this Euler instance to the given array. If no array is provided,
     * the method returns a new instance.
     *
     * @param {Array<number,number,number,string>} [array=[]] - The target array holding the Euler components.
     * @param {number} [offset=0] - Index of the first element in the array.
     * @return {Array<number,number,number,string>} The Euler components.
     */
    toArray(array = [], offset = 0) {
      array[offset] = this._x;
      array[offset + 1] = this._y;
      array[offset + 2] = this._z;
      array[offset + 3] = this._order;
      return array;
    }
    _onChange(callback) {
      this._onChangeCallback = callback;
      return this;
    }
    _onChangeCallback() {
    }
    *[Symbol.iterator]() {
      yield this._x;
      yield this._y;
      yield this._z;
      yield this._order;
    }
  }
  Euler.DEFAULT_ORDER = "XYZ";
  class Layers {
    /**
     * Constructs a new layers instance, with membership
     * initially set to layer `0`.
     */
    constructor() {
      this.mask = 1 | 0;
    }
    /**
     * Sets membership to the given layer, and remove membership all other layers.
     *
     * @param {number} layer - The layer to set.
     */
    set(layer) {
      this.mask = (1 << layer | 0) >>> 0;
    }
    /**
     * Adds membership of the given layer.
     *
     * @param {number} layer - The layer to enable.
     */
    enable(layer) {
      this.mask |= 1 << layer | 0;
    }
    /**
     * Adds membership to all layers.
     */
    enableAll() {
      this.mask = 4294967295 | 0;
    }
    /**
     * Toggles the membership of the given layer.
     *
     * @param {number} layer - The layer to toggle.
     */
    toggle(layer) {
      this.mask ^= 1 << layer | 0;
    }
    /**
     * Removes membership of the given layer.
     *
     * @param {number} layer - The layer to enable.
     */
    disable(layer) {
      this.mask &= ~(1 << layer | 0);
    }
    /**
     * Removes the membership from all layers.
     */
    disableAll() {
      this.mask = 0;
    }
    /**
     * Returns `true` if this and the given layers object have at least one
     * layer in common.
     *
     * @param {Layers} layers - The layers to test.
     * @return {boolean } Whether this and the given layers object have at least one layer in common or not.
     */
    test(layers) {
      return (this.mask & layers.mask) !== 0;
    }
    /**
     * Returns `true` if the given layer is enabled.
     *
     * @param {number} layer - The layer to test.
     * @return {boolean } Whether the given layer is enabled or not.
     */
    isEnabled(layer) {
      return (this.mask & (1 << layer | 0)) !== 0;
    }
  }
  let _object3DId = 0;
  const _v1$4 = /* @__PURE__ */ new Vector3();
  const _q1 = /* @__PURE__ */ new Quaternion();
  const _m1$1 = /* @__PURE__ */ new Matrix4();
  const _target = /* @__PURE__ */ new Vector3();
  const _position$3 = /* @__PURE__ */ new Vector3();
  const _scale$2 = /* @__PURE__ */ new Vector3();
  const _quaternion$2 = /* @__PURE__ */ new Quaternion();
  const _xAxis = /* @__PURE__ */ new Vector3(1, 0, 0);
  const _yAxis = /* @__PURE__ */ new Vector3(0, 1, 0);
  const _zAxis = /* @__PURE__ */ new Vector3(0, 0, 1);
  const _addedEvent = { type: "added" };
  const _removedEvent = { type: "removed" };
  const _childaddedEvent = { type: "childadded", child: null };
  const _childremovedEvent = { type: "childremoved", child: null };
  class Object3D extends EventDispatcher {
    /**
     * Constructs a new 3D object.
     */
    constructor() {
      super();
      this.isObject3D = true;
      Object.defineProperty(this, "id", { value: _object3DId++ });
      this.uuid = generateUUID();
      this.name = "";
      this.type = "Object3D";
      this.parent = null;
      this.children = [];
      this.up = Object3D.DEFAULT_UP.clone();
      const position = new Vector3();
      const rotation = new Euler();
      const quaternion = new Quaternion();
      const scale = new Vector3(1, 1, 1);
      function onRotationChange() {
        quaternion.setFromEuler(rotation, false);
      }
      function onQuaternionChange() {
        rotation.setFromQuaternion(quaternion, void 0, false);
      }
      rotation._onChange(onRotationChange);
      quaternion._onChange(onQuaternionChange);
      Object.defineProperties(this, {
        /**
         * Represents the object's local position.
         *
         * @name Object3D#position
         * @type {Vector3}
         * @default (0,0,0)
         */
        position: {
          configurable: true,
          enumerable: true,
          value: position
        },
        /**
         * Represents the object's local rotation as Euler angles, in radians.
         *
         * @name Object3D#rotation
         * @type {Euler}
         * @default (0,0,0)
         */
        rotation: {
          configurable: true,
          enumerable: true,
          value: rotation
        },
        /**
         * Represents the object's local rotation as Quaternions.
         *
         * @name Object3D#quaternion
         * @type {Quaternion}
         */
        quaternion: {
          configurable: true,
          enumerable: true,
          value: quaternion
        },
        /**
         * Represents the object's local scale.
         *
         * @name Object3D#scale
         * @type {Vector3}
         * @default (1,1,1)
         */
        scale: {
          configurable: true,
          enumerable: true,
          value: scale
        },
        /**
         * Represents the object's model-view matrix.
         *
         * @name Object3D#modelViewMatrix
         * @type {Matrix4}
         */
        modelViewMatrix: {
          value: new Matrix4()
        },
        /**
         * Represents the object's normal matrix.
         *
         * @name Object3D#normalMatrix
         * @type {Matrix3}
         */
        normalMatrix: {
          value: new Matrix3()
        }
      });
      this.matrix = new Matrix4();
      this.matrixWorld = new Matrix4();
      this.matrixAutoUpdate = Object3D.DEFAULT_MATRIX_AUTO_UPDATE;
      this.matrixWorldAutoUpdate = Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE;
      this.matrixWorldNeedsUpdate = false;
      this.layers = new Layers();
      this.visible = true;
      this.castShadow = false;
      this.receiveShadow = false;
      this.frustumCulled = true;
      this.renderOrder = 0;
      this.animations = [];
      this.customDepthMaterial = void 0;
      this.customDistanceMaterial = void 0;
      this.userData = {};
    }
    /**
     * A callback that is executed immediately before a 3D object is rendered to a shadow map.
     *
     * @param {Renderer|WebGLRenderer} renderer - The renderer.
     * @param {Object3D} object - The 3D object.
     * @param {Camera} camera - The camera that is used to render the scene.
     * @param {Camera} shadowCamera - The shadow camera.
     * @param {BufferGeometry} geometry - The 3D object's geometry.
     * @param {Material} depthMaterial - The depth material.
     * @param {Object} group - The geometry group data.
     */
    onBeforeShadow() {
    }
    /**
     * A callback that is executed immediately after a 3D object is rendered to a shadow map.
     *
     * @param {Renderer|WebGLRenderer} renderer - The renderer.
     * @param {Object3D} object - The 3D object.
     * @param {Camera} camera - The camera that is used to render the scene.
     * @param {Camera} shadowCamera - The shadow camera.
     * @param {BufferGeometry} geometry - The 3D object's geometry.
     * @param {Material} depthMaterial - The depth material.
     * @param {Object} group - The geometry group data.
     */
    onAfterShadow() {
    }
    /**
     * A callback that is executed immediately before a 3D object is rendered.
     *
     * @param {Renderer|WebGLRenderer} renderer - The renderer.
     * @param {Object3D} object - The 3D object.
     * @param {Camera} camera - The camera that is used to render the scene.
     * @param {BufferGeometry} geometry - The 3D object's geometry.
     * @param {Material} material - The 3D object's material.
     * @param {Object} group - The geometry group data.
     */
    onBeforeRender() {
    }
    /**
     * A callback that is executed immediately after a 3D object is rendered.
     *
     * @param {Renderer|WebGLRenderer} renderer - The renderer.
     * @param {Object3D} object - The 3D object.
     * @param {Camera} camera - The camera that is used to render the scene.
     * @param {BufferGeometry} geometry - The 3D object's geometry.
     * @param {Material} material - The 3D object's material.
     * @param {Object} group - The geometry group data.
     */
    onAfterRender() {
    }
    /**
     * Applies the given transformation matrix to the object and updates the object's position,
     * rotation and scale.
     *
     * @param {Matrix4} matrix - The transformation matrix.
     */
    applyMatrix4(matrix) {
      if (this.matrixAutoUpdate) this.updateMatrix();
      this.matrix.premultiply(matrix);
      this.matrix.decompose(this.position, this.quaternion, this.scale);
    }
    /**
     * Applies a rotation represented by given the quaternion to the 3D object.
     *
     * @param {Quaternion} q - The quaternion.
     * @return {Object3D} A reference to this instance.
     */
    applyQuaternion(q) {
      this.quaternion.premultiply(q);
      return this;
    }
    /**
     * Sets the given rotation represented as an axis/angle couple to the 3D object.
     *
     * @param {Vector3} axis - The (normalized) axis vector.
     * @param {number} angle - The angle in radians.
     */
    setRotationFromAxisAngle(axis, angle) {
      this.quaternion.setFromAxisAngle(axis, angle);
    }
    /**
     * Sets the given rotation represented as Euler angles to the 3D object.
     *
     * @param {Euler} euler - The Euler angles.
     */
    setRotationFromEuler(euler) {
      this.quaternion.setFromEuler(euler, true);
    }
    /**
     * Sets the given rotation represented as rotation matrix to the 3D object.
     *
     * @param {Matrix4} m - Although a 4x4 matrix is expected, the upper 3x3 portion must be
     * a pure rotation matrix (i.e, unscaled).
     */
    setRotationFromMatrix(m) {
      this.quaternion.setFromRotationMatrix(m);
    }
    /**
     * Sets the given rotation represented as a Quaternion to the 3D object.
     *
     * @param {Quaternion} q - The Quaternion
     */
    setRotationFromQuaternion(q) {
      this.quaternion.copy(q);
    }
    /**
     * Rotates the 3D object along an axis in local space.
     *
     * @param {Vector3} axis - The (normalized) axis vector.
     * @param {number} angle - The angle in radians.
     * @return {Object3D} A reference to this instance.
     */
    rotateOnAxis(axis, angle) {
      _q1.setFromAxisAngle(axis, angle);
      this.quaternion.multiply(_q1);
      return this;
    }
    /**
     * Rotates the 3D object along an axis in world space.
     *
     * @param {Vector3} axis - The (normalized) axis vector.
     * @param {number} angle - The angle in radians.
     * @return {Object3D} A reference to this instance.
     */
    rotateOnWorldAxis(axis, angle) {
      _q1.setFromAxisAngle(axis, angle);
      this.quaternion.premultiply(_q1);
      return this;
    }
    /**
     * Rotates the 3D object around its X axis in local space.
     *
     * @param {number} angle - The angle in radians.
     * @return {Object3D} A reference to this instance.
     */
    rotateX(angle) {
      return this.rotateOnAxis(_xAxis, angle);
    }
    /**
     * Rotates the 3D object around its Y axis in local space.
     *
     * @param {number} angle - The angle in radians.
     * @return {Object3D} A reference to this instance.
     */
    rotateY(angle) {
      return this.rotateOnAxis(_yAxis, angle);
    }
    /**
     * Rotates the 3D object around its Z axis in local space.
     *
     * @param {number} angle - The angle in radians.
     * @return {Object3D} A reference to this instance.
     */
    rotateZ(angle) {
      return this.rotateOnAxis(_zAxis, angle);
    }
    /**
     * Translate the 3D object by a distance along the given axis in local space.
     *
     * @param {Vector3} axis - The (normalized) axis vector.
     * @param {number} distance - The distance in world units.
     * @return {Object3D} A reference to this instance.
     */
    translateOnAxis(axis, distance) {
      _v1$4.copy(axis).applyQuaternion(this.quaternion);
      this.position.add(_v1$4.multiplyScalar(distance));
      return this;
    }
    /**
     * Translate the 3D object by a distance along its X-axis in local space.
     *
     * @param {number} distance - The distance in world units.
     * @return {Object3D} A reference to this instance.
     */
    translateX(distance) {
      return this.translateOnAxis(_xAxis, distance);
    }
    /**
     * Translate the 3D object by a distance along its Y-axis in local space.
     *
     * @param {number} distance - The distance in world units.
     * @return {Object3D} A reference to this instance.
     */
    translateY(distance) {
      return this.translateOnAxis(_yAxis, distance);
    }
    /**
     * Translate the 3D object by a distance along its Z-axis in local space.
     *
     * @param {number} distance - The distance in world units.
     * @return {Object3D} A reference to this instance.
     */
    translateZ(distance) {
      return this.translateOnAxis(_zAxis, distance);
    }
    /**
     * Converts the given vector from this 3D object's local space to world space.
     *
     * @param {Vector3} vector - The vector to convert.
     * @return {Vector3} The converted vector.
     */
    localToWorld(vector) {
      this.updateWorldMatrix(true, false);
      return vector.applyMatrix4(this.matrixWorld);
    }
    /**
     * Converts the given vector from this 3D object's word space to local space.
     *
     * @param {Vector3} vector - The vector to convert.
     * @return {Vector3} The converted vector.
     */
    worldToLocal(vector) {
      this.updateWorldMatrix(true, false);
      return vector.applyMatrix4(_m1$1.copy(this.matrixWorld).invert());
    }
    /**
     * Rotates the object to face a point in world space.
     *
     * This method does not support objects having non-uniformly-scaled parent(s).
     *
     * @param {number|Vector3} x - The x coordinate in world space. Alternatively, a vector representing a position in world space
     * @param {number} [y] - The y coordinate in world space.
     * @param {number} [z] - The z coordinate in world space.
     */
    lookAt(x, y, z) {
      if (x.isVector3) {
        _target.copy(x);
      } else {
        _target.set(x, y, z);
      }
      const parent = this.parent;
      this.updateWorldMatrix(true, false);
      _position$3.setFromMatrixPosition(this.matrixWorld);
      if (this.isCamera || this.isLight) {
        _m1$1.lookAt(_position$3, _target, this.up);
      } else {
        _m1$1.lookAt(_target, _position$3, this.up);
      }
      this.quaternion.setFromRotationMatrix(_m1$1);
      if (parent) {
        _m1$1.extractRotation(parent.matrixWorld);
        _q1.setFromRotationMatrix(_m1$1);
        this.quaternion.premultiply(_q1.invert());
      }
    }
    /**
     * Adds the given 3D object as a child to this 3D object. An arbitrary number of
     * objects may be added. Any current parent on an object passed in here will be
     * removed, since an object can have at most one parent.
     *
     * @fires Object3D#added
     * @fires Object3D#childadded
     * @param {Object3D} object - The 3D object to add.
     * @return {Object3D} A reference to this instance.
     */
    add(object) {
      if (arguments.length > 1) {
        for (let i = 0; i < arguments.length; i++) {
          this.add(arguments[i]);
        }
        return this;
      }
      if (object === this) {
        error("Object3D.add: object can't be added as a child of itself.", object);
        return this;
      }
      if (object && object.isObject3D) {
        object.removeFromParent();
        object.parent = this;
        this.children.push(object);
        object.dispatchEvent(_addedEvent);
        _childaddedEvent.child = object;
        this.dispatchEvent(_childaddedEvent);
        _childaddedEvent.child = null;
      } else {
        error("Object3D.add: object not an instance of THREE.Object3D.", object);
      }
      return this;
    }
    /**
     * Removes the given 3D object as child from this 3D object.
     * An arbitrary number of objects may be removed.
     *
     * @fires Object3D#removed
     * @fires Object3D#childremoved
     * @param {Object3D} object - The 3D object to remove.
     * @return {Object3D} A reference to this instance.
     */
    remove(object) {
      if (arguments.length > 1) {
        for (let i = 0; i < arguments.length; i++) {
          this.remove(arguments[i]);
        }
        return this;
      }
      const index = this.children.indexOf(object);
      if (index !== -1) {
        object.parent = null;
        this.children.splice(index, 1);
        object.dispatchEvent(_removedEvent);
        _childremovedEvent.child = object;
        this.dispatchEvent(_childremovedEvent);
        _childremovedEvent.child = null;
      }
      return this;
    }
    /**
     * Removes this 3D object from its current parent.
     *
     * @fires Object3D#removed
     * @fires Object3D#childremoved
     * @return {Object3D} A reference to this instance.
     */
    removeFromParent() {
      const parent = this.parent;
      if (parent !== null) {
        parent.remove(this);
      }
      return this;
    }
    /**
     * Removes all child objects.
     *
     * @fires Object3D#removed
     * @fires Object3D#childremoved
     * @return {Object3D} A reference to this instance.
     */
    clear() {
      return this.remove(...this.children);
    }
    /**
     * Adds the given 3D object as a child of this 3D object, while maintaining the object's world
     * transform. This method does not support scene graphs having non-uniformly-scaled nodes(s).
     *
     * @fires Object3D#added
     * @fires Object3D#childadded
     * @param {Object3D} object - The 3D object to attach.
     * @return {Object3D} A reference to this instance.
     */
    attach(object) {
      this.updateWorldMatrix(true, false);
      _m1$1.copy(this.matrixWorld).invert();
      if (object.parent !== null) {
        object.parent.updateWorldMatrix(true, false);
        _m1$1.multiply(object.parent.matrixWorld);
      }
      object.applyMatrix4(_m1$1);
      object.removeFromParent();
      object.parent = this;
      this.children.push(object);
      object.updateWorldMatrix(false, true);
      object.dispatchEvent(_addedEvent);
      _childaddedEvent.child = object;
      this.dispatchEvent(_childaddedEvent);
      _childaddedEvent.child = null;
      return this;
    }
    /**
     * Searches through the 3D object and its children, starting with the 3D object
     * itself, and returns the first with a matching ID.
     *
     * @param {number} id - The id.
     * @return {Object3D|undefined} The found 3D object. Returns `undefined` if no 3D object has been found.
     */
    getObjectById(id) {
      return this.getObjectByProperty("id", id);
    }
    /**
     * Searches through the 3D object and its children, starting with the 3D object
     * itself, and returns the first with a matching name.
     *
     * @param {string} name - The name.
     * @return {Object3D|undefined} The found 3D object. Returns `undefined` if no 3D object has been found.
     */
    getObjectByName(name) {
      return this.getObjectByProperty("name", name);
    }
    /**
     * Searches through the 3D object and its children, starting with the 3D object
     * itself, and returns the first with a matching property value.
     *
     * @param {string} name - The name of the property.
     * @param {any} value - The value.
     * @return {Object3D|undefined} The found 3D object. Returns `undefined` if no 3D object has been found.
     */
    getObjectByProperty(name, value) {
      if (this[name] === value) return this;
      for (let i = 0, l = this.children.length; i < l; i++) {
        const child = this.children[i];
        const object = child.getObjectByProperty(name, value);
        if (object !== void 0) {
          return object;
        }
      }
      return void 0;
    }
    /**
     * Searches through the 3D object and its children, starting with the 3D object
     * itself, and returns all 3D objects with a matching property value.
     *
     * @param {string} name - The name of the property.
     * @param {any} value - The value.
     * @param {Array<Object3D>} result - The method stores the result in this array.
     * @return {Array<Object3D>} The found 3D objects.
     */
    getObjectsByProperty(name, value, result = []) {
      if (this[name] === value) result.push(this);
      const children = this.children;
      for (let i = 0, l = children.length; i < l; i++) {
        children[i].getObjectsByProperty(name, value, result);
      }
      return result;
    }
    /**
     * Returns a vector representing the position of the 3D object in world space.
     *
     * @param {Vector3} target - The target vector the result is stored to.
     * @return {Vector3} The 3D object's position in world space.
     */
    getWorldPosition(target) {
      this.updateWorldMatrix(true, false);
      return target.setFromMatrixPosition(this.matrixWorld);
    }
    /**
     * Returns a Quaternion representing the position of the 3D object in world space.
     *
     * @param {Quaternion} target - The target Quaternion the result is stored to.
     * @return {Quaternion} The 3D object's rotation in world space.
     */
    getWorldQuaternion(target) {
      this.updateWorldMatrix(true, false);
      this.matrixWorld.decompose(_position$3, target, _scale$2);
      return target;
    }
    /**
     * Returns a vector representing the scale of the 3D object in world space.
     *
     * @param {Vector3} target - The target vector the result is stored to.
     * @return {Vector3} The 3D object's scale in world space.
     */
    getWorldScale(target) {
      this.updateWorldMatrix(true, false);
      this.matrixWorld.decompose(_position$3, _quaternion$2, target);
      return target;
    }
    /**
     * Returns a vector representing the ("look") direction of the 3D object in world space.
     *
     * @param {Vector3} target - The target vector the result is stored to.
     * @return {Vector3} The 3D object's direction in world space.
     */
    getWorldDirection(target) {
      this.updateWorldMatrix(true, false);
      const e = this.matrixWorld.elements;
      return target.set(e[8], e[9], e[10]).normalize();
    }
    /**
     * Abstract method to get intersections between a casted ray and this
     * 3D object. Renderable 3D objects such as {@link Mesh}, {@link Line} or {@link Points}
     * implement this method in order to use raycasting.
     *
     * @abstract
     * @param {Raycaster} raycaster - The raycaster.
     * @param {Array<Object>} intersects - An array holding the result of the method.
     */
    raycast() {
    }
    /**
     * Executes the callback on this 3D object and all descendants.
     *
     * Note: Modifying the scene graph inside the callback is discouraged.
     *
     * @param {Function} callback - A callback function that allows to process the current 3D object.
     */
    traverse(callback) {
      callback(this);
      const children = this.children;
      for (let i = 0, l = children.length; i < l; i++) {
        children[i].traverse(callback);
      }
    }
    /**
     * Like {@link Object3D#traverse}, but the callback will only be executed for visible 3D objects.
     * Descendants of invisible 3D objects are not traversed.
     *
     * Note: Modifying the scene graph inside the callback is discouraged.
     *
     * @param {Function} callback - A callback function that allows to process the current 3D object.
     */
    traverseVisible(callback) {
      if (this.visible === false) return;
      callback(this);
      const children = this.children;
      for (let i = 0, l = children.length; i < l; i++) {
        children[i].traverseVisible(callback);
      }
    }
    /**
     * Like {@link Object3D#traverse}, but the callback will only be executed for all ancestors.
     *
     * Note: Modifying the scene graph inside the callback is discouraged.
     *
     * @param {Function} callback - A callback function that allows to process the current 3D object.
     */
    traverseAncestors(callback) {
      const parent = this.parent;
      if (parent !== null) {
        callback(parent);
        parent.traverseAncestors(callback);
      }
    }
    /**
     * Updates the transformation matrix in local space by computing it from the current
     * position, rotation and scale values.
     */
    updateMatrix() {
      this.matrix.compose(this.position, this.quaternion, this.scale);
      this.matrixWorldNeedsUpdate = true;
    }
    /**
     * Updates the transformation matrix in world space of this 3D objects and its descendants.
     *
     * To ensure correct results, this method also recomputes the 3D object's transformation matrix in
     * local space. The computation of the local and world matrix can be controlled with the
     * {@link Object3D#matrixAutoUpdate} and {@link Object3D#matrixWorldAutoUpdate} flags which are both
     * `true` by default.  Set these flags to `false` if you need more control over the update matrix process.
     *
     * @param {boolean} [force=false] - When set to `true`, a recomputation of world matrices is forced even
     * when {@link Object3D#matrixWorldAutoUpdate} is set to `false`.
     */
    updateMatrixWorld(force) {
      if (this.matrixAutoUpdate) this.updateMatrix();
      if (this.matrixWorldNeedsUpdate || force) {
        if (this.matrixWorldAutoUpdate === true) {
          if (this.parent === null) {
            this.matrixWorld.copy(this.matrix);
          } else {
            this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
          }
        }
        this.matrixWorldNeedsUpdate = false;
        force = true;
      }
      const children = this.children;
      for (let i = 0, l = children.length; i < l; i++) {
        const child = children[i];
        child.updateMatrixWorld(force);
      }
    }
    /**
     * An alternative version of {@link Object3D#updateMatrixWorld} with more control over the
     * update of ancestor and descendant nodes.
     *
     * @param {boolean} [updateParents=false] Whether ancestor nodes should be updated or not.
     * @param {boolean} [updateChildren=false] Whether descendant nodes should be updated or not.
     */
    updateWorldMatrix(updateParents, updateChildren) {
      const parent = this.parent;
      if (updateParents === true && parent !== null) {
        parent.updateWorldMatrix(true, false);
      }
      if (this.matrixAutoUpdate) this.updateMatrix();
      if (this.matrixWorldAutoUpdate === true) {
        if (this.parent === null) {
          this.matrixWorld.copy(this.matrix);
        } else {
          this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
        }
      }
      if (updateChildren === true) {
        const children = this.children;
        for (let i = 0, l = children.length; i < l; i++) {
          const child = children[i];
          child.updateWorldMatrix(false, true);
        }
      }
    }
    /**
     * Serializes the 3D object into JSON.
     *
     * @param {?(Object|string)} meta - An optional value holding meta information about the serialization.
     * @return {Object} A JSON object representing the serialized 3D object.
     * @see {@link ObjectLoader#parse}
     */
    toJSON(meta) {
      const isRootObject = meta === void 0 || typeof meta === "string";
      const output = {};
      if (isRootObject) {
        meta = {
          geometries: {},
          materials: {},
          textures: {},
          images: {},
          shapes: {},
          skeletons: {},
          animations: {},
          nodes: {}
        };
        output.metadata = {
          version: 4.7,
          type: "Object",
          generator: "Object3D.toJSON"
        };
      }
      const object = {};
      object.uuid = this.uuid;
      object.type = this.type;
      if (this.name !== "") object.name = this.name;
      if (this.castShadow === true) object.castShadow = true;
      if (this.receiveShadow === true) object.receiveShadow = true;
      if (this.visible === false) object.visible = false;
      if (this.frustumCulled === false) object.frustumCulled = false;
      if (this.renderOrder !== 0) object.renderOrder = this.renderOrder;
      if (Object.keys(this.userData).length > 0) object.userData = this.userData;
      object.layers = this.layers.mask;
      object.matrix = this.matrix.toArray();
      object.up = this.up.toArray();
      if (this.matrixAutoUpdate === false) object.matrixAutoUpdate = false;
      if (this.isInstancedMesh) {
        object.type = "InstancedMesh";
        object.count = this.count;
        object.instanceMatrix = this.instanceMatrix.toJSON();
        if (this.instanceColor !== null) object.instanceColor = this.instanceColor.toJSON();
      }
      if (this.isBatchedMesh) {
        object.type = "BatchedMesh";
        object.perObjectFrustumCulled = this.perObjectFrustumCulled;
        object.sortObjects = this.sortObjects;
        object.drawRanges = this._drawRanges;
        object.reservedRanges = this._reservedRanges;
        object.geometryInfo = this._geometryInfo.map((info) => ({
          ...info,
          boundingBox: info.boundingBox ? info.boundingBox.toJSON() : void 0,
          boundingSphere: info.boundingSphere ? info.boundingSphere.toJSON() : void 0
        }));
        object.instanceInfo = this._instanceInfo.map((info) => ({ ...info }));
        object.availableInstanceIds = this._availableInstanceIds.slice();
        object.availableGeometryIds = this._availableGeometryIds.slice();
        object.nextIndexStart = this._nextIndexStart;
        object.nextVertexStart = this._nextVertexStart;
        object.geometryCount = this._geometryCount;
        object.maxInstanceCount = this._maxInstanceCount;
        object.maxVertexCount = this._maxVertexCount;
        object.maxIndexCount = this._maxIndexCount;
        object.geometryInitialized = this._geometryInitialized;
        object.matricesTexture = this._matricesTexture.toJSON(meta);
        object.indirectTexture = this._indirectTexture.toJSON(meta);
        if (this._colorsTexture !== null) {
          object.colorsTexture = this._colorsTexture.toJSON(meta);
        }
        if (this.boundingSphere !== null) {
          object.boundingSphere = this.boundingSphere.toJSON();
        }
        if (this.boundingBox !== null) {
          object.boundingBox = this.boundingBox.toJSON();
        }
      }
      function serialize(library, element) {
        if (library[element.uuid] === void 0) {
          library[element.uuid] = element.toJSON(meta);
        }
        return element.uuid;
      }
      if (this.isScene) {
        if (this.background) {
          if (this.background.isColor) {
            object.background = this.background.toJSON();
          } else if (this.background.isTexture) {
            object.background = this.background.toJSON(meta).uuid;
          }
        }
        if (this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== true) {
          object.environment = this.environment.toJSON(meta).uuid;
        }
      } else if (this.isMesh || this.isLine || this.isPoints) {
        object.geometry = serialize(meta.geometries, this.geometry);
        const parameters = this.geometry.parameters;
        if (parameters !== void 0 && parameters.shapes !== void 0) {
          const shapes = parameters.shapes;
          if (Array.isArray(shapes)) {
            for (let i = 0, l = shapes.length; i < l; i++) {
              const shape = shapes[i];
              serialize(meta.shapes, shape);
            }
          } else {
            serialize(meta.shapes, shapes);
          }
        }
      }
      if (this.isSkinnedMesh) {
        object.bindMode = this.bindMode;
        object.bindMatrix = this.bindMatrix.toArray();
        if (this.skeleton !== void 0) {
          serialize(meta.skeletons, this.skeleton);
          object.skeleton = this.skeleton.uuid;
        }
      }
      if (this.material !== void 0) {
        if (Array.isArray(this.material)) {
          const uuids = [];
          for (let i = 0, l = this.material.length; i < l; i++) {
            uuids.push(serialize(meta.materials, this.material[i]));
          }
          object.material = uuids;
        } else {
          object.material = serialize(meta.materials, this.material);
        }
      }
      if (this.children.length > 0) {
        object.children = [];
        for (let i = 0; i < this.children.length; i++) {
          object.children.push(this.children[i].toJSON(meta).object);
        }
      }
      if (this.animations.length > 0) {
        object.animations = [];
        for (let i = 0; i < this.animations.length; i++) {
          const animation = this.animations[i];
          object.animations.push(serialize(meta.animations, animation));
        }
      }
      if (isRootObject) {
        const geometries = extractFromCache(meta.geometries);
        const materials = extractFromCache(meta.materials);
        const textures = extractFromCache(meta.textures);
        const images = extractFromCache(meta.images);
        const shapes = extractFromCache(meta.shapes);
        const skeletons = extractFromCache(meta.skeletons);
        const animations = extractFromCache(meta.animations);
        const nodes = extractFromCache(meta.nodes);
        if (geometries.length > 0) output.geometries = geometries;
        if (materials.length > 0) output.materials = materials;
        if (textures.length > 0) output.textures = textures;
        if (images.length > 0) output.images = images;
        if (shapes.length > 0) output.shapes = shapes;
        if (skeletons.length > 0) output.skeletons = skeletons;
        if (animations.length > 0) output.animations = animations;
        if (nodes.length > 0) output.nodes = nodes;
      }
      output.object = object;
      return output;
      function extractFromCache(cache) {
        const values = [];
        for (const key in cache) {
          const data = cache[key];
          delete data.metadata;
          values.push(data);
        }
        return values;
      }
    }
    /**
     * Returns a new 3D object with copied values from this instance.
     *
     * @param {boolean} [recursive=true] - When set to `true`, descendants of the 3D object are also cloned.
     * @return {Object3D} A clone of this instance.
     */
    clone(recursive) {
      return new this.constructor().copy(this, recursive);
    }
    /**
     * Copies the values of the given 3D object to this instance.
     *
     * @param {Object3D} source - The 3D object to copy.
     * @param {boolean} [recursive=true] - When set to `true`, descendants of the 3D object are cloned.
     * @return {Object3D} A reference to this instance.
     */
    copy(source, recursive = true) {
      this.name = source.name;
      this.up.copy(source.up);
      this.position.copy(source.position);
      this.rotation.order = source.rotation.order;
      this.quaternion.copy(source.quaternion);
      this.scale.copy(source.scale);
      this.matrix.copy(source.matrix);
      this.matrixWorld.copy(source.matrixWorld);
      this.matrixAutoUpdate = source.matrixAutoUpdate;
      this.matrixWorldAutoUpdate = source.matrixWorldAutoUpdate;
      this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;
      this.layers.mask = source.layers.mask;
      this.visible = source.visible;
      this.castShadow = source.castShadow;
      this.receiveShadow = source.receiveShadow;
      this.frustumCulled = source.frustumCulled;
      this.renderOrder = source.renderOrder;
      this.animations = source.animations.slice();
      this.userData = JSON.parse(JSON.stringify(source.userData));
      if (recursive === true) {
        for (let i = 0; i < source.children.length; i++) {
          const child = source.children[i];
          this.add(child.clone());
        }
      }
      return this;
    }
  }
  Object3D.DEFAULT_UP = /* @__PURE__ */ new Vector3(0, 1, 0);
  Object3D.DEFAULT_MATRIX_AUTO_UPDATE = true;
  Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = true;
  const _v0$1 = /* @__PURE__ */ new Vector3();
  const _v1$3 = /* @__PURE__ */ new Vector3();
  const _v2$2 = /* @__PURE__ */ new Vector3();
  const _v3$2 = /* @__PURE__ */ new Vector3();
  const _vab = /* @__PURE__ */ new Vector3();
  const _vac = /* @__PURE__ */ new Vector3();
  const _vbc = /* @__PURE__ */ new Vector3();
  const _vap = /* @__PURE__ */ new Vector3();
  const _vbp = /* @__PURE__ */ new Vector3();
  const _vcp = /* @__PURE__ */ new Vector3();
  const _v40 = /* @__PURE__ */ new Vector4();
  const _v41 = /* @__PURE__ */ new Vector4();
  const _v42 = /* @__PURE__ */ new Vector4();
  class Triangle {
    /**
     * Constructs a new triangle.
     *
     * @param {Vector3} [a=(0,0,0)] - The first corner of the triangle.
     * @param {Vector3} [b=(0,0,0)] - The second corner of the triangle.
     * @param {Vector3} [c=(0,0,0)] - The third corner of the triangle.
     */
    constructor(a = new Vector3(), b = new Vector3(), c = new Vector3()) {
      this.a = a;
      this.b = b;
      this.c = c;
    }
    /**
     * Computes the normal vector of a triangle.
     *
     * @param {Vector3} a - The first corner of the triangle.
     * @param {Vector3} b - The second corner of the triangle.
     * @param {Vector3} c - The third corner of the triangle.
     * @param {Vector3} target - The target vector that is used to store the method's result.
     * @return {Vector3} The triangle's normal.
     */
    static getNormal(a, b, c, target) {
      target.subVectors(c, b);
      _v0$1.subVectors(a, b);
      target.cross(_v0$1);
      const targetLengthSq = target.lengthSq();
      if (targetLengthSq > 0) {
        return target.multiplyScalar(1 / Math.sqrt(targetLengthSq));
      }
      return target.set(0, 0, 0);
    }
    /**
     * Computes a barycentric coordinates from the given vector.
     * Returns `null` if the triangle is degenerate.
     *
     * @param {Vector3} point - A point in 3D space.
     * @param {Vector3} a - The first corner of the triangle.
     * @param {Vector3} b - The second corner of the triangle.
     * @param {Vector3} c - The third corner of the triangle.
     * @param {Vector3} target - The target vector that is used to store the method's result.
     * @return {?Vector3} The barycentric coordinates for the given point
     */
    static getBarycoord(point, a, b, c, target) {
      _v0$1.subVectors(c, a);
      _v1$3.subVectors(b, a);
      _v2$2.subVectors(point, a);
      const dot00 = _v0$1.dot(_v0$1);
      const dot01 = _v0$1.dot(_v1$3);
      const dot02 = _v0$1.dot(_v2$2);
      const dot11 = _v1$3.dot(_v1$3);
      const dot12 = _v1$3.dot(_v2$2);
      const denom = dot00 * dot11 - dot01 * dot01;
      if (denom === 0) {
        target.set(0, 0, 0);
        return null;
      }
      const invDenom = 1 / denom;
      const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
      const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
      return target.set(1 - u - v, v, u);
    }
    /**
     * Returns `true` if the given point, when projected onto the plane of the
     * triangle, lies within the triangle.
     *
     * @param {Vector3} point - The point in 3D space to test.
     * @param {Vector3} a - The first corner of the triangle.
     * @param {Vector3} b - The second corner of the triangle.
     * @param {Vector3} c - The third corner of the triangle.
     * @return {boolean} Whether the given point, when projected onto the plane of the
     * triangle, lies within the triangle or not.
     */
    static containsPoint(point, a, b, c) {
      if (this.getBarycoord(point, a, b, c, _v3$2) === null) {
        return false;
      }
      return _v3$2.x >= 0 && _v3$2.y >= 0 && _v3$2.x + _v3$2.y <= 1;
    }
    /**
     * Computes the value barycentrically interpolated for the given point on the
     * triangle. Returns `null` if the triangle is degenerate.
     *
     * @param {Vector3} point - Position of interpolated point.
     * @param {Vector3} p1 - The first corner of the triangle.
     * @param {Vector3} p2 - The second corner of the triangle.
     * @param {Vector3} p3 - The third corner of the triangle.
     * @param {Vector3} v1 - Value to interpolate of first vertex.
     * @param {Vector3} v2 - Value to interpolate of second vertex.
     * @param {Vector3} v3 - Value to interpolate of third vertex.
     * @param {Vector3} target - The target vector that is used to store the method's result.
     * @return {?Vector3} The interpolated value.
     */
    static getInterpolation(point, p1, p2, p3, v1, v2, v3, target) {
      if (this.getBarycoord(point, p1, p2, p3, _v3$2) === null) {
        target.x = 0;
        target.y = 0;
        if ("z" in target) target.z = 0;
        if ("w" in target) target.w = 0;
        return null;
      }
      target.setScalar(0);
      target.addScaledVector(v1, _v3$2.x);
      target.addScaledVector(v2, _v3$2.y);
      target.addScaledVector(v3, _v3$2.z);
      return target;
    }
    /**
     * Computes the value barycentrically interpolated for the given attribute and indices.
     *
     * @param {BufferAttribute} attr - The attribute to interpolate.
     * @param {number} i1 - Index of first vertex.
     * @param {number} i2 - Index of second vertex.
     * @param {number} i3 - Index of third vertex.
     * @param {Vector3} barycoord - The barycoordinate value to use to interpolate.
     * @param {Vector3} target - The target vector that is used to store the method's result.
     * @return {Vector3} The interpolated attribute value.
     */
    static getInterpolatedAttribute(attr, i1, i2, i3, barycoord, target) {
      _v40.setScalar(0);
      _v41.setScalar(0);
      _v42.setScalar(0);
      _v40.fromBufferAttribute(attr, i1);
      _v41.fromBufferAttribute(attr, i2);
      _v42.fromBufferAttribute(attr, i3);
      target.setScalar(0);
      target.addScaledVector(_v40, barycoord.x);
      target.addScaledVector(_v41, barycoord.y);
      target.addScaledVector(_v42, barycoord.z);
      return target;
    }
    /**
     * Returns `true` if the triangle is oriented towards the given direction.
     *
     * @param {Vector3} a - The first corner of the triangle.
     * @param {Vector3} b - The second corner of the triangle.
     * @param {Vector3} c - The third corner of the triangle.
     * @param {Vector3} direction - The (normalized) direction vector.
     * @return {boolean} Whether the triangle is oriented towards the given direction or not.
     */
    static isFrontFacing(a, b, c, direction) {
      _v0$1.subVectors(c, b);
      _v1$3.subVectors(a, b);
      return _v0$1.cross(_v1$3).dot(direction) < 0 ? true : false;
    }
    /**
     * Sets the triangle's vertices by copying the given values.
     *
     * @param {Vector3} a - The first corner of the triangle.
     * @param {Vector3} b - The second corner of the triangle.
     * @param {Vector3} c - The third corner of the triangle.
     * @return {Triangle} A reference to this triangle.
     */
    set(a, b, c) {
      this.a.copy(a);
      this.b.copy(b);
      this.c.copy(c);
      return this;
    }
    /**
     * Sets the triangle's vertices by copying the given array values.
     *
     * @param {Array<Vector3>} points - An array with 3D points.
     * @param {number} i0 - The array index representing the first corner of the triangle.
     * @param {number} i1 - The array index representing the second corner of the triangle.
     * @param {number} i2 - The array index representing the third corner of the triangle.
     * @return {Triangle} A reference to this triangle.
     */
    setFromPointsAndIndices(points, i0, i1, i2) {
      this.a.copy(points[i0]);
      this.b.copy(points[i1]);
      this.c.copy(points[i2]);
      return this;
    }
    /**
     * Sets the triangle's vertices by copying the given attribute values.
     *
     * @param {BufferAttribute} attribute - A buffer attribute with 3D points data.
     * @param {number} i0 - The attribute index representing the first corner of the triangle.
     * @param {number} i1 - The attribute index representing the second corner of the triangle.
     * @param {number} i2 - The attribute index representing the third corner of the triangle.
     * @return {Triangle} A reference to this triangle.
     */
    setFromAttributeAndIndices(attribute, i0, i1, i2) {
      this.a.fromBufferAttribute(attribute, i0);
      this.b.fromBufferAttribute(attribute, i1);
      this.c.fromBufferAttribute(attribute, i2);
      return this;
    }
    /**
     * Returns a new triangle with copied values from this instance.
     *
     * @return {Triangle} A clone of this instance.
     */
    clone() {
      return new this.constructor().copy(this);
    }
    /**
     * Copies the values of the given triangle to this instance.
     *
     * @param {Triangle} triangle - The triangle to copy.
     * @return {Triangle} A reference to this triangle.
     */
    copy(triangle) {
      this.a.copy(triangle.a);
      this.b.copy(triangle.b);
      this.c.copy(triangle.c);
      return this;
    }
    /**
     * Computes the area of the triangle.
     *
     * @return {number} The triangle's area.
     */
    getArea() {
      _v0$1.subVectors(this.c, this.b);
      _v1$3.subVectors(this.a, this.b);
      return _v0$1.cross(_v1$3).length() * 0.5;
    }
    /**
     * Computes the midpoint of the triangle.
     *
     * @param {Vector3} target - The target vector that is used to store the method's result.
     * @return {Vector3} The triangle's midpoint.
     */
    getMidpoint(target) {
      return target.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
    }
    /**
     * Computes the normal of the triangle.
     *
     * @param {Vector3} target - The target vector that is used to store the method's result.
     * @return {Vector3} The triangle's normal.
     */
    getNormal(target) {
      return Triangle.getNormal(this.a, this.b, this.c, target);
    }
    /**
     * Computes a plane the triangle lies within.
     *
     * @param {Plane} target - The target vector that is used to store the method's result.
     * @return {Plane} The plane the triangle lies within.
     */
    getPlane(target) {
      return target.setFromCoplanarPoints(this.a, this.b, this.c);
    }
    /**
     * Computes a barycentric coordinates from the given vector.
     * Returns `null` if the triangle is degenerate.
     *
     * @param {Vector3} point - A point in 3D space.
     * @param {Vector3} target - The target vector that is used to store the method's result.
     * @return {?Vector3} The barycentric coordinates for the given point
     */
    getBarycoord(point, target) {
      return Triangle.getBarycoord(point, this.a, this.b, this.c, target);
    }
    /**
     * Computes the value barycentrically interpolated for the given point on the
     * triangle. Returns `null` if the triangle is degenerate.
     *
     * @param {Vector3} point - Position of interpolated point.
     * @param {Vector3} v1 - Value to interpolate of first vertex.
     * @param {Vector3} v2 - Value to interpolate of second vertex.
     * @param {Vector3} v3 - Value to interpolate of third vertex.
     * @param {Vector3} target - The target vector that is used to store the method's result.
     * @return {?Vector3} The interpolated value.
     */
    getInterpolation(point, v1, v2, v3, target) {
      return Triangle.getInterpolation(point, this.a, this.b, this.c, v1, v2, v3, target);
    }
    /**
     * Returns `true` if the given point, when projected onto the plane of the
     * triangle, lies within the triangle.
     *
     * @param {Vector3} point - The point in 3D space to test.
     * @return {boolean} Whether the given point, when projected onto the plane of the
     * triangle, lies within the triangle or not.
     */
    containsPoint(point) {
      return Triangle.containsPoint(point, this.a, this.b, this.c);
    }
    /**
     * Returns `true` if the triangle is oriented towards the given direction.
     *
     * @param {Vector3} direction - The (normalized) direction vector.
     * @return {boolean} Whether the triangle is oriented towards the given direction or not.
     */
    isFrontFacing(direction) {
      return Triangle.isFrontFacing(this.a, this.b, this.c, direction);
    }
    /**
     * Returns `true` if this triangle intersects with the given box.
     *
     * @param {Box3} box - The box to intersect.
     * @return {boolean} Whether this triangle intersects with the given box or not.
     */
    intersectsBox(box) {
      return box.intersectsTriangle(this);
    }
    /**
     * Returns the closest point on the triangle to the given point.
     *
     * @param {Vector3} p - The point to compute the closest point for.
     * @param {Vector3} target - The target vector that is used to store the method's result.
     * @return {Vector3} The closest point on the triangle.
     */
    closestPointToPoint(p, target) {
      const a = this.a, b = this.b, c = this.c;
      let v, w;
      _vab.subVectors(b, a);
      _vac.subVectors(c, a);
      _vap.subVectors(p, a);
      const d1 = _vab.dot(_vap);
      const d2 = _vac.dot(_vap);
      if (d1 <= 0 && d2 <= 0) {
        return target.copy(a);
      }
      _vbp.subVectors(p, b);
      const d3 = _vab.dot(_vbp);
      const d4 = _vac.dot(_vbp);
      if (d3 >= 0 && d4 <= d3) {
        return target.copy(b);
      }
      const vc = d1 * d4 - d3 * d2;
      if (vc <= 0 && d1 >= 0 && d3 <= 0) {
        v = d1 / (d1 - d3);
        return target.copy(a).addScaledVector(_vab, v);
      }
      _vcp.subVectors(p, c);
      const d5 = _vab.dot(_vcp);
      const d6 = _vac.dot(_vcp);
      if (d6 >= 0 && d5 <= d6) {
        return target.copy(c);
      }
      const vb = d5 * d2 - d1 * d6;
      if (vb <= 0 && d2 >= 0 && d6 <= 0) {
        w = d2 / (d2 - d6);
        return target.copy(a).addScaledVector(_vac, w);
      }
      const va = d3 * d6 - d5 * d4;
      if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
        _vbc.subVectors(c, b);
        w = (d4 - d3) / (d4 - d3 + (d5 - d6));
        return target.copy(b).addScaledVector(_vbc, w);
      }
      const denom = 1 / (va + vb + vc);
      v = vb * denom;
      w = vc * denom;
      return target.copy(a).addScaledVector(_vab, v).addScaledVector(_vac, w);
    }
    /**
     * Returns `true` if this triangle is equal with the given one.
     *
     * @param {Triangle} triangle - The triangle to test for equality.
     * @return {boolean} Whether this triangle is equal with the given one.
     */
    equals(triangle) {
      return triangle.a.equals(this.a) && triangle.b.equals(this.b) && triangle.c.equals(this.c);
    }
  }
  const _vector$9 = /* @__PURE__ */ new Vector3();
  const _vector2$1 = /* @__PURE__ */ new Vector2();
  let _id$2 = 0;
  class BufferAttribute {
    /**
     * Constructs a new buffer attribute.
     *
     * @param {TypedArray} array - The array holding the attribute data.
     * @param {number} itemSize - The item size.
     * @param {boolean} [normalized=false] - Whether the data are normalized or not.
     */
    constructor(array, itemSize, normalized = false) {
      if (Array.isArray(array)) {
        throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
      }
      this.isBufferAttribute = true;
      Object.defineProperty(this, "id", { value: _id$2++ });
      this.name = "";
      this.array = array;
      this.itemSize = itemSize;
      this.count = array !== void 0 ? array.length / itemSize : 0;
      this.normalized = normalized;
      this.usage = StaticDrawUsage;
      this.updateRanges = [];
      this.gpuType = FloatType;
      this.version = 0;
    }
    /**
     * A callback function that is executed after the renderer has transferred the attribute
     * array data to the GPU.
     */
    onUploadCallback() {
    }
    /**
     * Flag to indicate that this attribute has changed and should be re-sent to
     * the GPU. Set this to `true` when you modify the value of the array.
     *
     * @type {number}
     * @default false
     * @param {boolean} value
     */
    set needsUpdate(value) {
      if (value === true) this.version++;
    }
    /**
     * Sets the usage of this buffer attribute.
     *
     * @param {(StaticDrawUsage|DynamicDrawUsage|StreamDrawUsage|StaticReadUsage|DynamicReadUsage|StreamReadUsage|StaticCopyUsage|DynamicCopyUsage|StreamCopyUsage)} value - The usage to set.
     * @return {BufferAttribute} A reference to this buffer attribute.
     */
    setUsage(value) {
      this.usage = value;
      return this;
    }
    /**
     * Adds a range of data in the data array to be updated on the GPU.
     *
     * @param {number} start - Position at which to start update.
     * @param {number} count - The number of components to update.
     */
    addUpdateRange(start, count) {
      this.updateRanges.push({ start, count });
    }
    /**
     * Clears the update ranges.
     */
    clearUpdateRanges() {
      this.updateRanges.length = 0;
    }
    /**
     * Copies the values of the given buffer attribute to this instance.
     *
     * @param {BufferAttribute} source - The buffer attribute to copy.
     * @return {BufferAttribute} A reference to this instance.
     */
    copy(source) {
      this.name = source.name;
      this.array = new source.array.constructor(source.array);
      this.itemSize = source.itemSize;
      this.count = source.count;
      this.normalized = source.normalized;
      this.usage = source.usage;
      this.gpuType = source.gpuType;
      return this;
    }
    /**
     * Copies a vector from the given buffer attribute to this one. The start
     * and destination position in the attribute buffers are represented by the
     * given indices.
     *
     * @param {number} index1 - The destination index into this buffer attribute.
     * @param {BufferAttribute} attribute - The buffer attribute to copy from.
     * @param {number} index2 - The source index into the given buffer attribute.
     * @return {BufferAttribute} A reference to this instance.
     */
    copyAt(index1, attribute, index2) {
      index1 *= this.itemSize;
      index2 *= attribute.itemSize;
      for (let i = 0, l = this.itemSize; i < l; i++) {
        this.array[index1 + i] = attribute.array[index2 + i];
      }
      return this;
    }
    /**
     * Copies the given array data into this buffer attribute.
     *
     * @param {(TypedArray|Array)} array - The array to copy.
     * @return {BufferAttribute} A reference to this instance.
     */
    copyArray(array) {
      this.array.set(array);
      return this;
    }
    /**
     * Applies the given 3x3 matrix to the given attribute. Works with
     * item size `2` and `3`.
     *
     * @param {Matrix3} m - The matrix to apply.
     * @return {BufferAttribute} A reference to this instance.
     */
    applyMatrix3(m) {
      if (this.itemSize === 2) {
        for (let i = 0, l = this.count; i < l; i++) {
          _vector2$1.fromBufferAttribute(this, i);
          _vector2$1.applyMatrix3(m);
          this.setXY(i, _vector2$1.x, _vector2$1.y);
        }
      } else if (this.itemSize === 3) {
        for (let i = 0, l = this.count; i < l; i++) {
          _vector$9.fromBufferAttribute(this, i);
          _vector$9.applyMatrix3(m);
          this.setXYZ(i, _vector$9.x, _vector$9.y, _vector$9.z);
        }
      }
      return this;
    }
    /**
     * Applies the given 4x4 matrix to the given attribute. Only works with
     * item size `3`.
     *
     * @param {Matrix4} m - The matrix to apply.
     * @return {BufferAttribute} A reference to this instance.
     */
    applyMatrix4(m) {
      for (let i = 0, l = this.count; i < l; i++) {
        _vector$9.fromBufferAttribute(this, i);
        _vector$9.applyMatrix4(m);
        this.setXYZ(i, _vector$9.x, _vector$9.y, _vector$9.z);
      }
      return this;
    }
    /**
     * Applies the given 3x3 normal matrix to the given attribute. Only works with
     * item size `3`.
     *
     * @param {Matrix3} m - The normal matrix to apply.
     * @return {BufferAttribute} A reference to this instance.
     */
    applyNormalMatrix(m) {
      for (let i = 0, l = this.count; i < l; i++) {
        _vector$9.fromBufferAttribute(this, i);
        _vector$9.applyNormalMatrix(m);
        this.setXYZ(i, _vector$9.x, _vector$9.y, _vector$9.z);
      }
      return this;
    }
    /**
     * Applies the given 4x4 matrix to the given attribute. Only works with
     * item size `3` and with direction vectors.
     *
     * @param {Matrix4} m - The matrix to apply.
     * @return {BufferAttribute} A reference to this instance.
     */
    transformDirection(m) {
      for (let i = 0, l = this.count; i < l; i++) {
        _vector$9.fromBufferAttribute(this, i);
        _vector$9.transformDirection(m);
        this.setXYZ(i, _vector$9.x, _vector$9.y, _vector$9.z);
      }
      return this;
    }
    /**
     * Sets the given array data in the buffer attribute.
     *
     * @param {(TypedArray|Array)} value - The array data to set.
     * @param {number} [offset=0] - The offset in this buffer attribute's array.
     * @return {BufferAttribute} A reference to this instance.
     */
    set(value, offset = 0) {
      this.array.set(value, offset);
      return this;
    }
    /**
     * Returns the given component of the vector at the given index.
     *
     * @param {number} index - The index into the buffer attribute.
     * @param {number} component - The component index.
     * @return {number} The returned value.
     */
    getComponent(index, component) {
      let value = this.array[index * this.itemSize + component];
      if (this.normalized) value = denormalize(value, this.array);
      return value;
    }
    /**
     * Sets the given value to the given component of the vector at the given index.
     *
     * @param {number} index - The index into the buffer attribute.
     * @param {number} component - The component index.
     * @param {number} value - The value to set.
     * @return {BufferAttribute} A reference to this instance.
     */
    setComponent(index, component, value) {
      if (this.normalized) value = normalize(value, this.array);
      this.array[index * this.itemSize + component] = value;
      return this;
    }
    /**
     * Returns the x component of the vector at the given index.
     *
     * @param {number} index - The index into the buffer attribute.
     * @return {number} The x component.
     */
    getX(index) {
      let x = this.array[index * this.itemSize];
      if (this.normalized) x = denormalize(x, this.array);
      return x;
    }
    /**
     * Sets the x component of the vector at the given index.
     *
     * @param {number} index - The index into the buffer attribute.
     * @param {number} x - The value to set.
     * @return {BufferAttribute} A reference to this instance.
     */
    setX(index, x) {
      if (this.normalized) x = normalize(x, this.array);
      this.array[index * this.itemSize] = x;
      return this;
    }
    /**
     * Returns the y component of the vector at the given index.
     *
     * @param {number} index - The index into the buffer attribute.
     * @return {number} The y component.
     */
    getY(index) {
      let y = this.array[index * this.itemSize + 1];
      if (this.normalized) y = denormalize(y, this.array);
      return y;
    }
    /**
     * Sets the y component of the vector at the given index.
     *
     * @param {number} index - The index into the buffer attribute.
     * @param {number} y - The value to set.
     * @return {BufferAttribute} A reference to this instance.
     */
    setY(index, y) {
      if (this.normalized) y = normalize(y, this.array);
      this.array[index * this.itemSize + 1] = y;
      return this;
    }
    /**
     * Returns the z component of the vector at the given index.
     *
     * @param {number} index - The index into the buffer attribute.
     * @return {number} The z component.
     */
    getZ(index) {
      let z = this.array[index * this.itemSize + 2];
      if (this.normalized) z = denormalize(z, this.array);
      return z;
    }
    /**
     * Sets the z component of the vector at the given index.
     *
     * @param {number} index - The index into the buffer attribute.
     * @param {number} z - The value to set.
     * @return {BufferAttribute} A reference to this instance.
     */
    setZ(index, z) {
      if (this.normalized) z = normalize(z, this.array);
      this.array[index * this.itemSize + 2] = z;
      return this;
    }
    /**
     * Returns the w component of the vector at the given index.
     *
     * @param {number} index - The index into the buffer attribute.
     * @return {number} The w component.
     */
    getW(index) {
      let w = this.array[index * this.itemSize + 3];
      if (this.normalized) w = denormalize(w, this.array);
      return w;
    }
    /**
     * Sets the w component of the vector at the given index.
     *
     * @param {number} index - The index into the buffer attribute.
     * @param {number} w - The value to set.
     * @return {BufferAttribute} A reference to this instance.
     */
    setW(index, w) {
      if (this.normalized) w = normalize(w, this.array);
      this.array[index * this.itemSize + 3] = w;
      return this;
    }
    /**
     * Sets the x and y component of the vector at the given index.
     *
     * @param {number} index - The index into the buffer attribute.
     * @param {number} x - The value for the x component to set.
     * @param {number} y - The value for the y component to set.
     * @return {BufferAttribute} A reference to this instance.
     */
    setXY(index, x, y) {
      index *= this.itemSize;
      if (this.normalized) {
        x = normalize(x, this.array);
        y = normalize(y, this.array);
      }
      this.array[index + 0] = x;
      this.array[index + 1] = y;
      return this;
    }
    /**
     * Sets the x, y and z component of the vector at the given index.
     *
     * @param {number} index - The index into the buffer attribute.
     * @param {number} x - The value for the x component to set.
     * @param {number} y - The value for the y component to set.
     * @param {number} z - The value for the z component to set.
     * @return {BufferAttribute} A reference to this instance.
     */
    setXYZ(index, x, y, z) {
      index *= this.itemSize;
      if (this.normalized) {
        x = normalize(x, this.array);
        y = normalize(y, this.array);
        z = normalize(z, this.array);
      }
      this.array[index + 0] = x;
      this.array[index + 1] = y;
      this.array[index + 2] = z;
      return this;
    }
    /**
     * Sets the x, y, z and w component of the vector at the given index.
     *
     * @param {number} index - The index into the buffer attribute.
     * @param {number} x - The value for the x component to set.
     * @param {number} y - The value for the y component to set.
     * @param {number} z - The value for the z component to set.
     * @param {number} w - The value for the w component to set.
     * @return {BufferAttribute} A reference to this instance.
     */
    setXYZW(index, x, y, z, w) {
      index *= this.itemSize;
      if (this.normalized) {
        x = normalize(x, this.array);
        y = normalize(y, this.array);
        z = normalize(z, this.array);
        w = normalize(w, this.array);
      }
      this.array[index + 0] = x;
      this.array[index + 1] = y;
      this.array[index + 2] = z;
      this.array[index + 3] = w;
      return this;
    }
    /**
     * Sets the given callback function that is executed after the Renderer has transferred
     * the attribute array data to the GPU. Can be used to perform clean-up operations after
     * the upload when attribute data are not needed anymore on the CPU side.
     *
     * @param {Function} callback - The `onUpload()` callback.
     * @return {BufferAttribute} A reference to this instance.
     */
    onUpload(callback) {
      this.onUploadCallback = callback;
      return this;
    }
    /**
     * Returns a new buffer attribute with copied values from this instance.
     *
     * @return {BufferAttribute} A clone of this instance.
     */
    clone() {
      return new this.constructor(this.array, this.itemSize).copy(this);
    }
    /**
     * Serializes the buffer attribute into JSON.
     *
     * @return {Object} A JSON object representing the serialized buffer attribute.
     */
    toJSON() {
      const data = {
        itemSize: this.itemSize,
        type: this.array.constructor.name,
        array: Array.from(this.array),
        normalized: this.normalized
      };
      if (this.name !== "") data.name = this.name;
      if (this.usage !== StaticDrawUsage) data.usage = this.usage;
      return data;
    }
  }
  class Uint16BufferAttribute extends BufferAttribute {
    /**
     * Constructs a new buffer attribute.
     *
     * @param {(Array<number>|Uint16Array)} array - The array holding the attribute data.
     * @param {number} itemSize - The item size.
     * @param {boolean} [normalized=false] - Whether the data are normalized or not.
     */
    constructor(array, itemSize, normalized) {
      super(new Uint16Array(array), itemSize, normalized);
    }
  }
  class Uint32BufferAttribute extends BufferAttribute {
    /**
     * Constructs a new buffer attribute.
     *
     * @param {(Array<number>|Uint32Array)} array - The array holding the attribute data.
     * @param {number} itemSize - The item size.
     * @param {boolean} [normalized=false] - Whether the data are normalized or not.
     */
    constructor(array, itemSize, normalized) {
      super(new Uint32Array(array), itemSize, normalized);
    }
  }
  class Float32BufferAttribute extends BufferAttribute {
    /**
     * Constructs a new buffer attribute.
     *
     * @param {(Array<number>|Float32Array)} array - The array holding the attribute data.
     * @param {number} itemSize - The item size.
     * @param {boolean} [normalized=false] - Whether the data are normalized or not.
     */
    constructor(array, itemSize, normalized) {
      super(new Float32Array(array), itemSize, normalized);
    }
  }
  let _id$1 = 0;
  const _m1 = /* @__PURE__ */ new Matrix4();
  const _obj = /* @__PURE__ */ new Object3D();
  const _offset = /* @__PURE__ */ new Vector3();
  const _box$2 = /* @__PURE__ */ new Box3();
  const _boxMorphTargets = /* @__PURE__ */ new Box3();
  const _vector$8 = /* @__PURE__ */ new Vector3();
  class BufferGeometry extends EventDispatcher {
    /**
     * Constructs a new geometry.
     */
    constructor() {
      super();
      this.isBufferGeometry = true;
      Object.defineProperty(this, "id", { value: _id$1++ });
      this.uuid = generateUUID();
      this.name = "";
      this.type = "BufferGeometry";
      this.index = null;
      this.indirect = null;
      this.indirectOffset = 0;
      this.attributes = {};
      this.morphAttributes = {};
      this.morphTargetsRelative = false;
      this.groups = [];
      this.boundingBox = null;
      this.boundingSphere = null;
      this.drawRange = { start: 0, count: Infinity };
      this.userData = {};
    }
    /**
     * Returns the index of this geometry.
     *
     * @return {?BufferAttribute} The index. Returns `null` if no index is defined.
     */
    getIndex() {
      return this.index;
    }
    /**
     * Sets the given index to this geometry.
     *
     * @param {Array<number>|BufferAttribute} index - The index to set.
     * @return {BufferGeometry} A reference to this instance.
     */
    setIndex(index) {
      if (Array.isArray(index)) {
        this.index = new (arrayNeedsUint32(index) ? Uint32BufferAttribute : Uint16BufferAttribute)(index, 1);
      } else {
        this.index = index;
      }
      return this;
    }
    /**
     * Sets the given indirect attribute to this geometry.
     *
     * @param {BufferAttribute} indirect - The attribute holding indirect draw calls.
     * @param {number|Array<number>} [indirectOffset=0] - The offset, in bytes, into the indirect drawing buffer where the value data begins. If an array is provided, multiple indirect draw calls will be made for each offset.
     * @return {BufferGeometry} A reference to this instance.
     */
    setIndirect(indirect, indirectOffset = 0) {
      this.indirect = indirect;
      this.indirectOffset = indirectOffset;
      return this;
    }
    /**
     * Returns the indirect attribute of this geometry.
     *
     * @return {?BufferAttribute} The indirect attribute. Returns `null` if no indirect attribute is defined.
     */
    getIndirect() {
      return this.indirect;
    }
    /**
     * Returns the buffer attribute for the given name.
     *
     * @param {string} name - The attribute name.
     * @return {BufferAttribute|InterleavedBufferAttribute|undefined} The buffer attribute.
     * Returns `undefined` if not attribute has been found.
     */
    getAttribute(name) {
      return this.attributes[name];
    }
    /**
     * Sets the given attribute for the given name.
     *
     * @param {string} name - The attribute name.
     * @param {BufferAttribute|InterleavedBufferAttribute} attribute - The attribute to set.
     * @return {BufferGeometry} A reference to this instance.
     */
    setAttribute(name, attribute) {
      this.attributes[name] = attribute;
      return this;
    }
    /**
     * Deletes the attribute for the given name.
     *
     * @param {string} name - The attribute name to delete.
     * @return {BufferGeometry} A reference to this instance.
     */
    deleteAttribute(name) {
      delete this.attributes[name];
      return this;
    }
    /**
     * Returns `true` if this geometry has an attribute for the given name.
     *
     * @param {string} name - The attribute name.
     * @return {boolean} Whether this geometry has an attribute for the given name or not.
     */
    hasAttribute(name) {
      return this.attributes[name] !== void 0;
    }
    /**
     * Adds a group to this geometry.
     *
     * @param {number} start - The first element in this draw call. That is the first
     * vertex for non-indexed geometry, otherwise the first triangle index.
     * @param {number} count - Specifies how many vertices (or indices) are part of this group.
     * @param {number} [materialIndex=0] - The material array index to use.
     */
    addGroup(start, count, materialIndex = 0) {
      this.groups.push({
        start,
        count,
        materialIndex
      });
    }
    /**
     * Clears all groups.
     */
    clearGroups() {
      this.groups = [];
    }
    /**
     * Sets the draw range for this geometry.
     *
     * @param {number} start - The first vertex for non-indexed geometry, otherwise the first triangle index.
     * @param {number} count - For non-indexed BufferGeometry, `count` is the number of vertices to render.
     * For indexed BufferGeometry, `count` is the number of indices to render.
     */
    setDrawRange(start, count) {
      this.drawRange.start = start;
      this.drawRange.count = count;
    }
    /**
     * Applies the given 4x4 transformation matrix to the geometry.
     *
     * @param {Matrix4} matrix - The matrix to apply.
     * @return {BufferGeometry} A reference to this instance.
     */
    applyMatrix4(matrix) {
      const position = this.attributes.position;
      if (position !== void 0) {
        position.applyMatrix4(matrix);
        position.needsUpdate = true;
      }
      const normal = this.attributes.normal;
      if (normal !== void 0) {
        const normalMatrix = new Matrix3().getNormalMatrix(matrix);
        normal.applyNormalMatrix(normalMatrix);
        normal.needsUpdate = true;
      }
      const tangent = this.attributes.tangent;
      if (tangent !== void 0) {
        tangent.transformDirection(matrix);
        tangent.needsUpdate = true;
      }
      if (this.boundingBox !== null) {
        this.computeBoundingBox();
      }
      if (this.boundingSphere !== null) {
        this.computeBoundingSphere();
      }
      return this;
    }
    /**
     * Applies the rotation represented by the Quaternion to the geometry.
     *
     * @param {Quaternion} q - The Quaternion to apply.
     * @return {BufferGeometry} A reference to this instance.
     */
    applyQuaternion(q) {
      _m1.makeRotationFromQuaternion(q);
      this.applyMatrix4(_m1);
      return this;
    }
    /**
     * Rotates the geometry about the X axis. This is typically done as a one time
     * operation, and not during a loop. Use {@link Object3D#rotation} for typical
     * real-time mesh rotation.
     *
     * @param {number} angle - The angle in radians.
     * @return {BufferGeometry} A reference to this instance.
     */
    rotateX(angle) {
      _m1.makeRotationX(angle);
      this.applyMatrix4(_m1);
      return this;
    }
    /**
     * Rotates the geometry about the Y axis. This is typically done as a one time
     * operation, and not during a loop. Use {@link Object3D#rotation} for typical
     * real-time mesh rotation.
     *
     * @param {number} angle - The angle in radians.
     * @return {BufferGeometry} A reference to this instance.
     */
    rotateY(angle) {
      _m1.makeRotationY(angle);
      this.applyMatrix4(_m1);
      return this;
    }
    /**
     * Rotates the geometry about the Z axis. This is typically done as a one time
     * operation, and not during a loop. Use {@link Object3D#rotation} for typical
     * real-time mesh rotation.
     *
     * @param {number} angle - The angle in radians.
     * @return {BufferGeometry} A reference to this instance.
     */
    rotateZ(angle) {
      _m1.makeRotationZ(angle);
      this.applyMatrix4(_m1);
      return this;
    }
    /**
     * Translates the geometry. This is typically done as a one time
     * operation, and not during a loop. Use {@link Object3D#position} for typical
     * real-time mesh rotation.
     *
     * @param {number} x - The x offset.
     * @param {number} y - The y offset.
     * @param {number} z - The z offset.
     * @return {BufferGeometry} A reference to this instance.
     */
    translate(x, y, z) {
      _m1.makeTranslation(x, y, z);
      this.applyMatrix4(_m1);
      return this;
    }
    /**
     * Scales the geometry. This is typically done as a one time
     * operation, and not during a loop. Use {@link Object3D#scale} for typical
     * real-time mesh rotation.
     *
     * @param {number} x - The x scale.
     * @param {number} y - The y scale.
     * @param {number} z - The z scale.
     * @return {BufferGeometry} A reference to this instance.
     */
    scale(x, y, z) {
      _m1.makeScale(x, y, z);
      this.applyMatrix4(_m1);
      return this;
    }
    /**
     * Rotates the geometry to face a point in 3D space. This is typically done as a one time
     * operation, and not during a loop. Use {@link Object3D#lookAt} for typical
     * real-time mesh rotation.
     *
     * @param {Vector3} vector - The target point.
     * @return {BufferGeometry} A reference to this instance.
     */
    lookAt(vector) {
      _obj.lookAt(vector);
      _obj.updateMatrix();
      this.applyMatrix4(_obj.matrix);
      return this;
    }
    /**
     * Center the geometry based on its bounding box.
     *
     * @return {BufferGeometry} A reference to this instance.
     */
    center() {
      this.computeBoundingBox();
      this.boundingBox.getCenter(_offset).negate();
      this.translate(_offset.x, _offset.y, _offset.z);
      return this;
    }
    /**
     * Defines a geometry by creating a `position` attribute based on the given array of points. The array
     * can hold 2D or 3D vectors. When using two-dimensional data, the `z` coordinate for all vertices is
     * set to `0`.
     *
     * If the method is used with an existing `position` attribute, the vertex data are overwritten with the
     * data from the array. The length of the array must match the vertex count.
     *
     * @param {Array<Vector2>|Array<Vector3>} points - The points.
     * @return {BufferGeometry} A reference to this instance.
     */
    setFromPoints(points) {
      const positionAttribute = this.getAttribute("position");
      if (positionAttribute === void 0) {
        const position = [];
        for (let i = 0, l = points.length; i < l; i++) {
          const point = points[i];
          position.push(point.x, point.y, point.z || 0);
        }
        this.setAttribute("position", new Float32BufferAttribute(position, 3));
      } else {
        const l = Math.min(points.length, positionAttribute.count);
        for (let i = 0; i < l; i++) {
          const point = points[i];
          positionAttribute.setXYZ(i, point.x, point.y, point.z || 0);
        }
        if (points.length > positionAttribute.count) {
          warn("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.");
        }
        positionAttribute.needsUpdate = true;
      }
      return this;
    }
    /**
     * Computes the bounding box of the geometry, and updates the `boundingBox` member.
     * The bounding box is not computed by the engine; it must be computed by your app.
     * You may need to recompute the bounding box if the geometry vertices are modified.
     */
    computeBoundingBox() {
      if (this.boundingBox === null) {
        this.boundingBox = new Box3();
      }
      const position = this.attributes.position;
      const morphAttributesPosition = this.morphAttributes.position;
      if (position && position.isGLBufferAttribute) {
        error("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this);
        this.boundingBox.set(
          new Vector3(-Infinity, -Infinity, -Infinity),
          new Vector3(Infinity, Infinity, Infinity)
        );
        return;
      }
      if (position !== void 0) {
        this.boundingBox.setFromBufferAttribute(position);
        if (morphAttributesPosition) {
          for (let i = 0, il = morphAttributesPosition.length; i < il; i++) {
            const morphAttribute = morphAttributesPosition[i];
            _box$2.setFromBufferAttribute(morphAttribute);
            if (this.morphTargetsRelative) {
              _vector$8.addVectors(this.boundingBox.min, _box$2.min);
              this.boundingBox.expandByPoint(_vector$8);
              _vector$8.addVectors(this.boundingBox.max, _box$2.max);
              this.boundingBox.expandByPoint(_vector$8);
            } else {
              this.boundingBox.expandByPoint(_box$2.min);
              this.boundingBox.expandByPoint(_box$2.max);
            }
          }
        }
      } else {
        this.boundingBox.makeEmpty();
      }
      if (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) {
        error('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
      }
    }
    /**
     * Computes the bounding sphere of the geometry, and updates the `boundingSphere` member.
     * The engine automatically computes the bounding sphere when it is needed, e.g., for ray casting or view frustum culling.
     * You may need to recompute the bounding sphere if the geometry vertices are modified.
     */
    computeBoundingSphere() {
      if (this.boundingSphere === null) {
        this.boundingSphere = new Sphere();
      }
      const position = this.attributes.position;
      const morphAttributesPosition = this.morphAttributes.position;
      if (position && position.isGLBufferAttribute) {
        error("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this);
        this.boundingSphere.set(new Vector3(), Infinity);
        return;
      }
      if (position) {
        const center = this.boundingSphere.center;
        _box$2.setFromBufferAttribute(position);
        if (morphAttributesPosition) {
          for (let i = 0, il = morphAttributesPosition.length; i < il; i++) {
            const morphAttribute = morphAttributesPosition[i];
            _boxMorphTargets.setFromBufferAttribute(morphAttribute);
            if (this.morphTargetsRelative) {
              _vector$8.addVectors(_box$2.min, _boxMorphTargets.min);
              _box$2.expandByPoint(_vector$8);
              _vector$8.addVectors(_box$2.max, _boxMorphTargets.max);
              _box$2.expandByPoint(_vector$8);
            } else {
              _box$2.expandByPoint(_boxMorphTargets.min);
              _box$2.expandByPoint(_boxMorphTargets.max);
            }
          }
        }
        _box$2.getCenter(center);
        let maxRadiusSq = 0;
        for (let i = 0, il = position.count; i < il; i++) {
          _vector$8.fromBufferAttribute(position, i);
          maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(_vector$8));
        }
        if (morphAttributesPosition) {
          for (let i = 0, il = morphAttributesPosition.length; i < il; i++) {
            const morphAttribute = morphAttributesPosition[i];
            const morphTargetsRelative = this.morphTargetsRelative;
            for (let j = 0, jl = morphAttribute.count; j < jl; j++) {
              _vector$8.fromBufferAttribute(morphAttribute, j);
              if (morphTargetsRelative) {
                _offset.fromBufferAttribute(position, j);
                _vector$8.add(_offset);
              }
              maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(_vector$8));
            }
          }
        }
        this.boundingSphere.radius = Math.sqrt(maxRadiusSq);
        if (isNaN(this.boundingSphere.radius)) {
          error('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this);
        }
      }
    }
    /**
     * Calculates and adds a tangent attribute to this geometry.
     *
     * The computation is only supported for indexed geometries and if position, normal, and uv attributes
     * are defined. When using a tangent space normal map, prefer the MikkTSpace algorithm provided by
     * {@link BufferGeometryUtils#computeMikkTSpaceTangents} instead.
     */
    computeTangents() {
      const index = this.index;
      const attributes = this.attributes;
      if (index === null || attributes.position === void 0 || attributes.normal === void 0 || attributes.uv === void 0) {
        error("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");
        return;
      }
      const positionAttribute = attributes.position;
      const normalAttribute = attributes.normal;
      const uvAttribute = attributes.uv;
      if (this.hasAttribute("tangent") === false) {
        this.setAttribute("tangent", new BufferAttribute(new Float32Array(4 * positionAttribute.count), 4));
      }
      const tangentAttribute = this.getAttribute("tangent");
      const tan1 = [], tan2 = [];
      for (let i = 0; i < positionAttribute.count; i++) {
        tan1[i] = new Vector3();
        tan2[i] = new Vector3();
      }
      const vA = new Vector3(), vB = new Vector3(), vC = new Vector3(), uvA = new Vector2(), uvB = new Vector2(), uvC = new Vector2(), sdir = new Vector3(), tdir = new Vector3();
      function handleTriangle(a, b, c) {
        vA.fromBufferAttribute(positionAttribute, a);
        vB.fromBufferAttribute(positionAttribute, b);
        vC.fromBufferAttribute(positionAttribute, c);
        uvA.fromBufferAttribute(uvAttribute, a);
        uvB.fromBufferAttribute(uvAttribute, b);
        uvC.fromBufferAttribute(uvAttribute, c);
        vB.sub(vA);
        vC.sub(vA);
        uvB.sub(uvA);
        uvC.sub(uvA);
        const r = 1 / (uvB.x * uvC.y - uvC.x * uvB.y);
        if (!isFinite(r)) return;
        sdir.copy(vB).multiplyScalar(uvC.y).addScaledVector(vC, -uvB.y).multiplyScalar(r);
        tdir.copy(vC).multiplyScalar(uvB.x).addScaledVector(vB, -uvC.x).multiplyScalar(r);
        tan1[a].add(sdir);
        tan1[b].add(sdir);
        tan1[c].add(sdir);
        tan2[a].add(tdir);
        tan2[b].add(tdir);
        tan2[c].add(tdir);
      }
      let groups = this.groups;
      if (groups.length === 0) {
        groups = [{
          start: 0,
          count: index.count
        }];
      }
      for (let i = 0, il = groups.length; i < il; ++i) {
        const group = groups[i];
        const start = group.start;
        const count = group.count;
        for (let j = start, jl = start + count; j < jl; j += 3) {
          handleTriangle(
            index.getX(j + 0),
            index.getX(j + 1),
            index.getX(j + 2)
          );
        }
      }
      const tmp2 = new Vector3(), tmp22 = new Vector3();
      const n = new Vector3(), n2 = new Vector3();
      function handleVertex(v) {
        n.fromBufferAttribute(normalAttribute, v);
        n2.copy(n);
        const t = tan1[v];
        tmp2.copy(t);
        tmp2.sub(n.multiplyScalar(n.dot(t))).normalize();
        tmp22.crossVectors(n2, t);
        const test = tmp22.dot(tan2[v]);
        const w = test < 0 ? -1 : 1;
        tangentAttribute.setXYZW(v, tmp2.x, tmp2.y, tmp2.z, w);
      }
      for (let i = 0, il = groups.length; i < il; ++i) {
        const group = groups[i];
        const start = group.start;
        const count = group.count;
        for (let j = start, jl = start + count; j < jl; j += 3) {
          handleVertex(index.getX(j + 0));
          handleVertex(index.getX(j + 1));
          handleVertex(index.getX(j + 2));
        }
      }
    }
    /**
     * Computes vertex normals for the given vertex data. For indexed geometries, the method sets
     * each vertex normal to be the average of the face normals of the faces that share that vertex.
     * For non-indexed geometries, vertices are not shared, and the method sets each vertex normal
     * to be the same as the face normal.
     */
    computeVertexNormals() {
      const index = this.index;
      const positionAttribute = this.getAttribute("position");
      if (positionAttribute !== void 0) {
        let normalAttribute = this.getAttribute("normal");
        if (normalAttribute === void 0) {
          normalAttribute = new BufferAttribute(new Float32Array(positionAttribute.count * 3), 3);
          this.setAttribute("normal", normalAttribute);
        } else {
          for (let i = 0, il = normalAttribute.count; i < il; i++) {
            normalAttribute.setXYZ(i, 0, 0, 0);
          }
        }
        const pA = new Vector3(), pB = new Vector3(), pC = new Vector3();
        const nA = new Vector3(), nB = new Vector3(), nC = new Vector3();
        const cb = new Vector3(), ab = new Vector3();
        if (index) {
          for (let i = 0, il = index.count; i < il; i += 3) {
            const vA = index.getX(i + 0);
            const vB = index.getX(i + 1);
            const vC = index.getX(i + 2);
            pA.fromBufferAttribute(positionAttribute, vA);
            pB.fromBufferAttribute(positionAttribute, vB);
            pC.fromBufferAttribute(positionAttribute, vC);
            cb.subVectors(pC, pB);
            ab.subVectors(pA, pB);
            cb.cross(ab);
            nA.fromBufferAttribute(normalAttribute, vA);
            nB.fromBufferAttribute(normalAttribute, vB);
            nC.fromBufferAttribute(normalAttribute, vC);
            nA.add(cb);
            nB.add(cb);
            nC.add(cb);
            normalAttribute.setXYZ(vA, nA.x, nA.y, nA.z);
            normalAttribute.setXYZ(vB, nB.x, nB.y, nB.z);
            normalAttribute.setXYZ(vC, nC.x, nC.y, nC.z);
          }
        } else {
          for (let i = 0, il = positionAttribute.count; i < il; i += 3) {
            pA.fromBufferAttribute(positionAttribute, i + 0);
            pB.fromBufferAttribute(positionAttribute, i + 1);
            pC.fromBufferAttribute(positionAttribute, i + 2);
            cb.subVectors(pC, pB);
            ab.subVectors(pA, pB);
            cb.cross(ab);
            normalAttribute.setXYZ(i + 0, cb.x, cb.y, cb.z);
            normalAttribute.setXYZ(i + 1, cb.x, cb.y, cb.z);
            normalAttribute.setXYZ(i + 2, cb.x, cb.y, cb.z);
          }
        }
        this.normalizeNormals();
        normalAttribute.needsUpdate = true;
      }
    }
    /**
     * Ensures every normal vector in a geometry will have a magnitude of `1`. This will
     * correct lighting on the geometry surfaces.
     */
    normalizeNormals() {
      const normals = this.attributes.normal;
      for (let i = 0, il = normals.count; i < il; i++) {
        _vector$8.fromBufferAttribute(normals, i);
        _vector$8.normalize();
        normals.setXYZ(i, _vector$8.x, _vector$8.y, _vector$8.z);
      }
    }
    /**
     * Return a new non-index version of this indexed geometry. If the geometry
     * is already non-indexed, the method is a NOOP.
     *
     * @return {BufferGeometry} The non-indexed version of this indexed geometry.
     */
    toNonIndexed() {
      function convertBufferAttribute(attribute, indices2) {
        const array = attribute.array;
        const itemSize = attribute.itemSize;
        const normalized = attribute.normalized;
        const array2 = new array.constructor(indices2.length * itemSize);
        let index = 0, index2 = 0;
        for (let i = 0, l = indices2.length; i < l; i++) {
          if (attribute.isInterleavedBufferAttribute) {
            index = indices2[i] * attribute.data.stride + attribute.offset;
          } else {
            index = indices2[i] * itemSize;
          }
          for (let j = 0; j < itemSize; j++) {
            array2[index2++] = array[index++];
          }
        }
        return new BufferAttribute(array2, itemSize, normalized);
      }
      if (this.index === null) {
        warn("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.");
        return this;
      }
      const geometry2 = new BufferGeometry();
      const indices = this.index.array;
      const attributes = this.attributes;
      for (const name in attributes) {
        const attribute = attributes[name];
        const newAttribute = convertBufferAttribute(attribute, indices);
        geometry2.setAttribute(name, newAttribute);
      }
      const morphAttributes = this.morphAttributes;
      for (const name in morphAttributes) {
        const morphArray = [];
        const morphAttribute = morphAttributes[name];
        for (let i = 0, il = morphAttribute.length; i < il; i++) {
          const attribute = morphAttribute[i];
          const newAttribute = convertBufferAttribute(attribute, indices);
          morphArray.push(newAttribute);
        }
        geometry2.morphAttributes[name] = morphArray;
      }
      geometry2.morphTargetsRelative = this.morphTargetsRelative;
      const groups = this.groups;
      for (let i = 0, l = groups.length; i < l; i++) {
        const group = groups[i];
        geometry2.addGroup(group.start, group.count, group.materialIndex);
      }
      return geometry2;
    }
    /**
     * Serializes the geometry into JSON.
     *
     * @return {Object} A JSON object representing the serialized geometry.
     */
    toJSON() {
      const data = {
        metadata: {
          version: 4.7,
          type: "BufferGeometry",
          generator: "BufferGeometry.toJSON"
        }
      };
      data.uuid = this.uuid;
      data.type = this.type;
      if (this.name !== "") data.name = this.name;
      if (Object.keys(this.userData).length > 0) data.userData = this.userData;
      if (this.parameters !== void 0) {
        const parameters = this.parameters;
        for (const key in parameters) {
          if (parameters[key] !== void 0) data[key] = parameters[key];
        }
        return data;
      }
      data.data = { attributes: {} };
      const index = this.index;
      if (index !== null) {
        data.data.index = {
          type: index.array.constructor.name,
          array: Array.prototype.slice.call(index.array)
        };
      }
      const attributes = this.attributes;
      for (const key in attributes) {
        const attribute = attributes[key];
        data.data.attributes[key] = attribute.toJSON(data.data);
      }
      const morphAttributes = {};
      let hasMorphAttributes = false;
      for (const key in this.morphAttributes) {
        const attributeArray = this.morphAttributes[key];
        const array = [];
        for (let i = 0, il = attributeArray.length; i < il; i++) {
          const attribute = attributeArray[i];
          array.push(attribute.toJSON(data.data));
        }
        if (array.length > 0) {
          morphAttributes[key] = array;
          hasMorphAttributes = true;
        }
      }
      if (hasMorphAttributes) {
        data.data.morphAttributes = morphAttributes;
        data.data.morphTargetsRelative = this.morphTargetsRelative;
      }
      const groups = this.groups;
      if (groups.length > 0) {
        data.data.groups = JSON.parse(JSON.stringify(groups));
      }
      const boundingSphere = this.boundingSphere;
      if (boundingSphere !== null) {
        data.data.boundingSphere = boundingSphere.toJSON();
      }
      return data;
    }
    /**
     * Returns a new geometry with copied values from this instance.
     *
     * @return {BufferGeometry} A clone of this instance.
     */
    clone() {
      return new this.constructor().copy(this);
    }
    /**
     * Copies the values of the given geometry to this instance.
     *
     * @param {BufferGeometry} source - The geometry to copy.
     * @return {BufferGeometry} A reference to this instance.
     */
    copy(source) {
      this.index = null;
      this.attributes = {};
      this.morphAttributes = {};
      this.groups = [];
      this.boundingBox = null;
      this.boundingSphere = null;
      const data = {};
      this.name = source.name;
      const index = source.index;
      if (index !== null) {
        this.setIndex(index.clone());
      }
      const attributes = source.attributes;
      for (const name in attributes) {
        const attribute = attributes[name];
        this.setAttribute(name, attribute.clone(data));
      }
      const morphAttributes = source.morphAttributes;
      for (const name in morphAttributes) {
        const array = [];
        const morphAttribute = morphAttributes[name];
        for (let i = 0, l = morphAttribute.length; i < l; i++) {
          array.push(morphAttribute[i].clone(data));
        }
        this.morphAttributes[name] = array;
      }
      this.morphTargetsRelative = source.morphTargetsRelative;
      const groups = source.groups;
      for (let i = 0, l = groups.length; i < l; i++) {
        const group = groups[i];
        this.addGroup(group.start, group.count, group.materialIndex);
      }
      const boundingBox = source.boundingBox;
      if (boundingBox !== null) {
        this.boundingBox = boundingBox.clone();
      }
      const boundingSphere = source.boundingSphere;
      if (boundingSphere !== null) {
        this.boundingSphere = boundingSphere.clone();
      }
      this.drawRange.start = source.drawRange.start;
      this.drawRange.count = source.drawRange.count;
      this.userData = source.userData;
      return this;
    }
    /**
     * Frees the GPU-related resources allocated by this instance. Call this
     * method whenever this instance is no longer used in your app.
     *
     * @fires BufferGeometry#dispose
     */
    dispose() {
      this.dispatchEvent({ type: "dispose" });
    }
  }
  class Curve {
    /**
     * Constructs a new curve.
     */
    constructor() {
      this.type = "Curve";
      this.arcLengthDivisions = 200;
      this.needsUpdate = false;
      this.cacheArcLengths = null;
    }
    /**
     * This method returns a vector in 2D or 3D space (depending on the curve definition)
     * for the given interpolation factor.
     *
     * @abstract
     * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
     * @param {(Vector2|Vector3)} [optionalTarget] - The optional target vector the result is written to.
     * @return {(Vector2|Vector3)} The position on the curve. It can be a 2D or 3D vector depending on the curve definition.
     */
    getPoint() {
      warn("Curve: .getPoint() not implemented.");
    }
    /**
     * This method returns a vector in 2D or 3D space (depending on the curve definition)
     * for the given interpolation factor. Unlike {@link Curve#getPoint}, this method honors the length
     * of the curve which equidistant samples.
     *
     * @param {number} u - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
     * @param {(Vector2|Vector3)} [optionalTarget] - The optional target vector the result is written to.
     * @return {(Vector2|Vector3)} The position on the curve. It can be a 2D or 3D vector depending on the curve definition.
     */
    getPointAt(u, optionalTarget) {
      const t = this.getUtoTmapping(u);
      return this.getPoint(t, optionalTarget);
    }
    /**
     * This method samples the curve via {@link Curve#getPoint} and returns an array of points representing
     * the curve shape.
     *
     * @param {number} [divisions=5] - The number of divisions.
     * @return {Array<(Vector2|Vector3)>} An array holding the sampled curve values. The number of points is `divisions + 1`.
     */
    getPoints(divisions = 5) {
      const points = [];
      for (let d = 0; d <= divisions; d++) {
        points.push(this.getPoint(d / divisions));
      }
      return points;
    }
    // Get sequence of points using getPointAt( u )
    /**
     * This method samples the curve via {@link Curve#getPointAt} and returns an array of points representing
     * the curve shape. Unlike {@link Curve#getPoints}, this method returns equi-spaced points across the entire
     * curve.
     *
     * @param {number} [divisions=5] - The number of divisions.
     * @return {Array<(Vector2|Vector3)>} An array holding the sampled curve values. The number of points is `divisions + 1`.
     */
    getSpacedPoints(divisions = 5) {
      const points = [];
      for (let d = 0; d <= divisions; d++) {
        points.push(this.getPointAt(d / divisions));
      }
      return points;
    }
    /**
     * Returns the total arc length of the curve.
     *
     * @return {number} The length of the curve.
     */
    getLength() {
      const lengths = this.getLengths();
      return lengths[lengths.length - 1];
    }
    /**
     * Returns an array of cumulative segment lengths of the curve.
     *
     * @param {number} [divisions=this.arcLengthDivisions] - The number of divisions.
     * @return {Array<number>} An array holding the cumulative segment lengths.
     */
    getLengths(divisions = this.arcLengthDivisions) {
      if (this.cacheArcLengths && this.cacheArcLengths.length === divisions + 1 && !this.needsUpdate) {
        return this.cacheArcLengths;
      }
      this.needsUpdate = false;
      const cache = [];
      let current, last = this.getPoint(0);
      let sum = 0;
      cache.push(0);
      for (let p = 1; p <= divisions; p++) {
        current = this.getPoint(p / divisions);
        sum += current.distanceTo(last);
        cache.push(sum);
        last = current;
      }
      this.cacheArcLengths = cache;
      return cache;
    }
    /**
     * Update the cumulative segment distance cache. The method must be called
     * every time curve parameters are changed. If an updated curve is part of a
     * composed curve like {@link CurvePath}, this method must be called on the
     * composed curve, too.
     */
    updateArcLengths() {
      this.needsUpdate = true;
      this.getLengths();
    }
    /**
     * Given an interpolation factor in the range `[0,1]`, this method returns an updated
     * interpolation factor in the same range that can be ued to sample equidistant points
     * from a curve.
     *
     * @param {number} u - The interpolation factor.
     * @param {?number} distance - An optional distance on the curve.
     * @return {number} The updated interpolation factor.
     */
    getUtoTmapping(u, distance = null) {
      const arcLengths = this.getLengths();
      let i = 0;
      const il = arcLengths.length;
      let targetArcLength;
      if (distance) {
        targetArcLength = distance;
      } else {
        targetArcLength = u * arcLengths[il - 1];
      }
      let low = 0, high = il - 1, comparison;
      while (low <= high) {
        i = Math.floor(low + (high - low) / 2);
        comparison = arcLengths[i] - targetArcLength;
        if (comparison < 0) {
          low = i + 1;
        } else if (comparison > 0) {
          high = i - 1;
        } else {
          high = i;
          break;
        }
      }
      i = high;
      if (arcLengths[i] === targetArcLength) {
        return i / (il - 1);
      }
      const lengthBefore = arcLengths[i];
      const lengthAfter = arcLengths[i + 1];
      const segmentLength = lengthAfter - lengthBefore;
      const segmentFraction = (targetArcLength - lengthBefore) / segmentLength;
      const t = (i + segmentFraction) / (il - 1);
      return t;
    }
    /**
     * Returns a unit vector tangent for the given interpolation factor.
     * If the derived curve does not implement its tangent derivation,
     * two points a small delta apart will be used to find its gradient
     * which seems to give a reasonable approximation.
     *
     * @param {number} t - The interpolation factor.
     * @param {(Vector2|Vector3)} [optionalTarget] - The optional target vector the result is written to.
     * @return {(Vector2|Vector3)} The tangent vector.
     */
    getTangent(t, optionalTarget) {
      const delta = 1e-4;
      let t1 = t - delta;
      let t2 = t + delta;
      if (t1 < 0) t1 = 0;
      if (t2 > 1) t2 = 1;
      const pt1 = this.getPoint(t1);
      const pt2 = this.getPoint(t2);
      const tangent = optionalTarget || (pt1.isVector2 ? new Vector2() : new Vector3());
      tangent.copy(pt2).sub(pt1).normalize();
      return tangent;
    }
    /**
     * Same as {@link Curve#getTangent} but with equidistant samples.
     *
     * @param {number} u - The interpolation factor.
     * @param {(Vector2|Vector3)} [optionalTarget] - The optional target vector the result is written to.
     * @return {(Vector2|Vector3)} The tangent vector.
     * @see {@link Curve#getPointAt}
     */
    getTangentAt(u, optionalTarget) {
      const t = this.getUtoTmapping(u);
      return this.getTangent(t, optionalTarget);
    }
    /**
     * Generates the Frenet Frames. Requires a curve definition in 3D space. Used
     * in geometries like {@link TubeGeometry} or {@link ExtrudeGeometry}.
     *
     * @param {number} segments - The number of segments.
     * @param {boolean} [closed=false] - Whether the curve is closed or not.
     * @return {{tangents: Array<Vector3>, normals: Array<Vector3>, binormals: Array<Vector3>}} The Frenet Frames.
     */
    computeFrenetFrames(segments, closed = false) {
      const normal = new Vector3();
      const tangents = [];
      const normals = [];
      const binormals = [];
      const vec = new Vector3();
      const mat = new Matrix4();
      for (let i = 0; i <= segments; i++) {
        const u = i / segments;
        tangents[i] = this.getTangentAt(u, new Vector3());
      }
      normals[0] = new Vector3();
      binormals[0] = new Vector3();
      let min = Number.MAX_VALUE;
      const tx = Math.abs(tangents[0].x);
      const ty = Math.abs(tangents[0].y);
      const tz = Math.abs(tangents[0].z);
      if (tx <= min) {
        min = tx;
        normal.set(1, 0, 0);
      }
      if (ty <= min) {
        min = ty;
        normal.set(0, 1, 0);
      }
      if (tz <= min) {
        normal.set(0, 0, 1);
      }
      vec.crossVectors(tangents[0], normal).normalize();
      normals[0].crossVectors(tangents[0], vec);
      binormals[0].crossVectors(tangents[0], normals[0]);
      for (let i = 1; i <= segments; i++) {
        normals[i] = normals[i - 1].clone();
        binormals[i] = binormals[i - 1].clone();
        vec.crossVectors(tangents[i - 1], tangents[i]);
        if (vec.length() > Number.EPSILON) {
          vec.normalize();
          const theta = Math.acos(clamp(tangents[i - 1].dot(tangents[i]), -1, 1));
          normals[i].applyMatrix4(mat.makeRotationAxis(vec, theta));
        }
        binormals[i].crossVectors(tangents[i], normals[i]);
      }
      if (closed === true) {
        let theta = Math.acos(clamp(normals[0].dot(normals[segments]), -1, 1));
        theta /= segments;
        if (tangents[0].dot(vec.crossVectors(normals[0], normals[segments])) > 0) {
          theta = -theta;
        }
        for (let i = 1; i <= segments; i++) {
          normals[i].applyMatrix4(mat.makeRotationAxis(tangents[i], theta * i));
          binormals[i].crossVectors(tangents[i], normals[i]);
        }
      }
      return {
        tangents,
        normals,
        binormals
      };
    }
    /**
     * Returns a new curve with copied values from this instance.
     *
     * @return {Curve} A clone of this instance.
     */
    clone() {
      return new this.constructor().copy(this);
    }
    /**
     * Copies the values of the given curve to this instance.
     *
     * @param {Curve} source - The curve to copy.
     * @return {Curve} A reference to this curve.
     */
    copy(source) {
      this.arcLengthDivisions = source.arcLengthDivisions;
      return this;
    }
    /**
     * Serializes the curve into JSON.
     *
     * @return {Object} A JSON object representing the serialized curve.
     * @see {@link ObjectLoader#parse}
     */
    toJSON() {
      const data = {
        metadata: {
          version: 4.7,
          type: "Curve",
          generator: "Curve.toJSON"
        }
      };
      data.arcLengthDivisions = this.arcLengthDivisions;
      data.type = this.type;
      return data;
    }
    /**
     * Deserializes the curve from the given JSON.
     *
     * @param {Object} json - The JSON holding the serialized curve.
     * @return {Curve} A reference to this curve.
     */
    fromJSON(json) {
      this.arcLengthDivisions = json.arcLengthDivisions;
      return this;
    }
  }
  class EllipseCurve extends Curve {
    /**
     * Constructs a new ellipse curve.
     *
     * @param {number} [aX=0] - The X center of the ellipse.
     * @param {number} [aY=0] - The Y center of the ellipse.
     * @param {number} [xRadius=1] - The radius of the ellipse in the x direction.
     * @param {number} [yRadius=1] - The radius of the ellipse in the y direction.
     * @param {number} [aStartAngle=0] - The start angle of the curve in radians starting from the positive X axis.
     * @param {number} [aEndAngle=Math.PI*2] - The end angle of the curve in radians starting from the positive X axis.
     * @param {boolean} [aClockwise=false] - Whether the ellipse is drawn clockwise or not.
     * @param {number} [aRotation=0] - The rotation angle of the ellipse in radians, counterclockwise from the positive X axis.
     */
    constructor(aX = 0, aY = 0, xRadius = 1, yRadius = 1, aStartAngle = 0, aEndAngle = Math.PI * 2, aClockwise = false, aRotation = 0) {
      super();
      this.isEllipseCurve = true;
      this.type = "EllipseCurve";
      this.aX = aX;
      this.aY = aY;
      this.xRadius = xRadius;
      this.yRadius = yRadius;
      this.aStartAngle = aStartAngle;
      this.aEndAngle = aEndAngle;
      this.aClockwise = aClockwise;
      this.aRotation = aRotation;
    }
    /**
     * Returns a point on the curve.
     *
     * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
     * @param {Vector2} [optionalTarget] - The optional target vector the result is written to.
     * @return {Vector2} The position on the curve.
     */
    getPoint(t, optionalTarget = new Vector2()) {
      const point = optionalTarget;
      const twoPi = Math.PI * 2;
      let deltaAngle = this.aEndAngle - this.aStartAngle;
      const samePoints = Math.abs(deltaAngle) < Number.EPSILON;
      while (deltaAngle < 0) deltaAngle += twoPi;
      while (deltaAngle > twoPi) deltaAngle -= twoPi;
      if (deltaAngle < Number.EPSILON) {
        if (samePoints) {
          deltaAngle = 0;
        } else {
          deltaAngle = twoPi;
        }
      }
      if (this.aClockwise === true && !samePoints) {
        if (deltaAngle === twoPi) {
          deltaAngle = -twoPi;
        } else {
          deltaAngle = deltaAngle - twoPi;
        }
      }
      const angle = this.aStartAngle + t * deltaAngle;
      let x = this.aX + this.xRadius * Math.cos(angle);
      let y = this.aY + this.yRadius * Math.sin(angle);
      if (this.aRotation !== 0) {
        const cos = Math.cos(this.aRotation);
        const sin = Math.sin(this.aRotation);
        const tx = x - this.aX;
        const ty = y - this.aY;
        x = tx * cos - ty * sin + this.aX;
        y = tx * sin + ty * cos + this.aY;
      }
      return point.set(x, y);
    }
    copy(source) {
      super.copy(source);
      this.aX = source.aX;
      this.aY = source.aY;
      this.xRadius = source.xRadius;
      this.yRadius = source.yRadius;
      this.aStartAngle = source.aStartAngle;
      this.aEndAngle = source.aEndAngle;
      this.aClockwise = source.aClockwise;
      this.aRotation = source.aRotation;
      return this;
    }
    toJSON() {
      const data = super.toJSON();
      data.aX = this.aX;
      data.aY = this.aY;
      data.xRadius = this.xRadius;
      data.yRadius = this.yRadius;
      data.aStartAngle = this.aStartAngle;
      data.aEndAngle = this.aEndAngle;
      data.aClockwise = this.aClockwise;
      data.aRotation = this.aRotation;
      return data;
    }
    fromJSON(json) {
      super.fromJSON(json);
      this.aX = json.aX;
      this.aY = json.aY;
      this.xRadius = json.xRadius;
      this.yRadius = json.yRadius;
      this.aStartAngle = json.aStartAngle;
      this.aEndAngle = json.aEndAngle;
      this.aClockwise = json.aClockwise;
      this.aRotation = json.aRotation;
      return this;
    }
  }
  class ArcCurve extends EllipseCurve {
    /**
     * Constructs a new arc curve.
     *
     * @param {number} [aX=0] - The X center of the ellipse.
     * @param {number} [aY=0] - The Y center of the ellipse.
     * @param {number} [aRadius=1] - The radius of the ellipse in the x direction.
     * @param {number} [aStartAngle=0] - The start angle of the curve in radians starting from the positive X axis.
     * @param {number} [aEndAngle=Math.PI*2] - The end angle of the curve in radians starting from the positive X axis.
     * @param {boolean} [aClockwise=false] - Whether the ellipse is drawn clockwise or not.
     */
    constructor(aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise) {
      super(aX, aY, aRadius, aRadius, aStartAngle, aEndAngle, aClockwise);
      this.isArcCurve = true;
      this.type = "ArcCurve";
    }
  }
  function CubicPoly() {
    let c0 = 0, c1 = 0, c2 = 0, c3 = 0;
    function init(x0, x1, t0, t1) {
      c0 = x0;
      c1 = t0;
      c2 = -3 * x0 + 3 * x1 - 2 * t0 - t1;
      c3 = 2 * x0 - 2 * x1 + t0 + t1;
    }
    return {
      initCatmullRom: function(x0, x1, x2, x3, tension) {
        init(x1, x2, tension * (x2 - x0), tension * (x3 - x1));
      },
      initNonuniformCatmullRom: function(x0, x1, x2, x3, dt0, dt1, dt2) {
        let t1 = (x1 - x0) / dt0 - (x2 - x0) / (dt0 + dt1) + (x2 - x1) / dt1;
        let t2 = (x2 - x1) / dt1 - (x3 - x1) / (dt1 + dt2) + (x3 - x2) / dt2;
        t1 *= dt1;
        t2 *= dt1;
        init(x1, x2, t1, t2);
      },
      calc: function(t) {
        const t2 = t * t;
        const t3 = t2 * t;
        return c0 + c1 * t + c2 * t2 + c3 * t3;
      }
    };
  }
  const tmp = /* @__PURE__ */ new Vector3();
  const px = /* @__PURE__ */ new CubicPoly();
  const py = /* @__PURE__ */ new CubicPoly();
  const pz = /* @__PURE__ */ new CubicPoly();
  class CatmullRomCurve3 extends Curve {
    /**
     * Constructs a new Catmull-Rom curve.
     *
     * @param {Array<Vector3>} [points] - An array of 3D points defining the curve.
     * @param {boolean} [closed=false] - Whether the curve is closed or not.
     * @param {('centripetal'|'chordal'|'catmullrom')} [curveType='centripetal'] - The curve type.
     * @param {number} [tension=0.5] - Tension of the curve.
     */
    constructor(points = [], closed = false, curveType = "centripetal", tension = 0.5) {
      super();
      this.isCatmullRomCurve3 = true;
      this.type = "CatmullRomCurve3";
      this.points = points;
      this.closed = closed;
      this.curveType = curveType;
      this.tension = tension;
    }
    /**
     * Returns a point on the curve.
     *
     * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
     * @param {Vector3} [optionalTarget] - The optional target vector the result is written to.
     * @return {Vector3} The position on the curve.
     */
    getPoint(t, optionalTarget = new Vector3()) {
      const point = optionalTarget;
      const points = this.points;
      const l = points.length;
      const p = (l - (this.closed ? 0 : 1)) * t;
      let intPoint = Math.floor(p);
      let weight = p - intPoint;
      if (this.closed) {
        intPoint += intPoint > 0 ? 0 : (Math.floor(Math.abs(intPoint) / l) + 1) * l;
      } else if (weight === 0 && intPoint === l - 1) {
        intPoint = l - 2;
        weight = 1;
      }
      let p0, p3;
      if (this.closed || intPoint > 0) {
        p0 = points[(intPoint - 1) % l];
      } else {
        tmp.subVectors(points[0], points[1]).add(points[0]);
        p0 = tmp;
      }
      const p1 = points[intPoint % l];
      const p2 = points[(intPoint + 1) % l];
      if (this.closed || intPoint + 2 < l) {
        p3 = points[(intPoint + 2) % l];
      } else {
        tmp.subVectors(points[l - 1], points[l - 2]).add(points[l - 1]);
        p3 = tmp;
      }
      if (this.curveType === "centripetal" || this.curveType === "chordal") {
        const pow = this.curveType === "chordal" ? 0.5 : 0.25;
        let dt0 = Math.pow(p0.distanceToSquared(p1), pow);
        let dt1 = Math.pow(p1.distanceToSquared(p2), pow);
        let dt2 = Math.pow(p2.distanceToSquared(p3), pow);
        if (dt1 < 1e-4) dt1 = 1;
        if (dt0 < 1e-4) dt0 = dt1;
        if (dt2 < 1e-4) dt2 = dt1;
        px.initNonuniformCatmullRom(p0.x, p1.x, p2.x, p3.x, dt0, dt1, dt2);
        py.initNonuniformCatmullRom(p0.y, p1.y, p2.y, p3.y, dt0, dt1, dt2);
        pz.initNonuniformCatmullRom(p0.z, p1.z, p2.z, p3.z, dt0, dt1, dt2);
      } else if (this.curveType === "catmullrom") {
        px.initCatmullRom(p0.x, p1.x, p2.x, p3.x, this.tension);
        py.initCatmullRom(p0.y, p1.y, p2.y, p3.y, this.tension);
        pz.initCatmullRom(p0.z, p1.z, p2.z, p3.z, this.tension);
      }
      point.set(
        px.calc(weight),
        py.calc(weight),
        pz.calc(weight)
      );
      return point;
    }
    copy(source) {
      super.copy(source);
      this.points = [];
      for (let i = 0, l = source.points.length; i < l; i++) {
        const point = source.points[i];
        this.points.push(point.clone());
      }
      this.closed = source.closed;
      this.curveType = source.curveType;
      this.tension = source.tension;
      return this;
    }
    toJSON() {
      const data = super.toJSON();
      data.points = [];
      for (let i = 0, l = this.points.length; i < l; i++) {
        const point = this.points[i];
        data.points.push(point.toArray());
      }
      data.closed = this.closed;
      data.curveType = this.curveType;
      data.tension = this.tension;
      return data;
    }
    fromJSON(json) {
      super.fromJSON(json);
      this.points = [];
      for (let i = 0, l = json.points.length; i < l; i++) {
        const point = json.points[i];
        this.points.push(new Vector3().fromArray(point));
      }
      this.closed = json.closed;
      this.curveType = json.curveType;
      this.tension = json.tension;
      return this;
    }
  }
  function CatmullRom(t, p0, p1, p2, p3) {
    const v0 = (p2 - p0) * 0.5;
    const v1 = (p3 - p1) * 0.5;
    const t2 = t * t;
    const t3 = t * t2;
    return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
  }
  function QuadraticBezierP0(t, p) {
    const k = 1 - t;
    return k * k * p;
  }
  function QuadraticBezierP1(t, p) {
    return 2 * (1 - t) * t * p;
  }
  function QuadraticBezierP2(t, p) {
    return t * t * p;
  }
  function QuadraticBezier(t, p0, p1, p2) {
    return QuadraticBezierP0(t, p0) + QuadraticBezierP1(t, p1) + QuadraticBezierP2(t, p2);
  }
  function CubicBezierP0(t, p) {
    const k = 1 - t;
    return k * k * k * p;
  }
  function CubicBezierP1(t, p) {
    const k = 1 - t;
    return 3 * k * k * t * p;
  }
  function CubicBezierP2(t, p) {
    return 3 * (1 - t) * t * t * p;
  }
  function CubicBezierP3(t, p) {
    return t * t * t * p;
  }
  function CubicBezier(t, p0, p1, p2, p3) {
    return CubicBezierP0(t, p0) + CubicBezierP1(t, p1) + CubicBezierP2(t, p2) + CubicBezierP3(t, p3);
  }
  class CubicBezierCurve extends Curve {
    /**
     * Constructs a new Cubic Bezier curve.
     *
     * @param {Vector2} [v0] - The start point.
     * @param {Vector2} [v1] - The first control point.
     * @param {Vector2} [v2] - The second control point.
     * @param {Vector2} [v3] - The end point.
     */
    constructor(v0 = new Vector2(), v1 = new Vector2(), v2 = new Vector2(), v3 = new Vector2()) {
      super();
      this.isCubicBezierCurve = true;
      this.type = "CubicBezierCurve";
      this.v0 = v0;
      this.v1 = v1;
      this.v2 = v2;
      this.v3 = v3;
    }
    /**
     * Returns a point on the curve.
     *
     * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
     * @param {Vector2} [optionalTarget] - The optional target vector the result is written to.
     * @return {Vector2} The position on the curve.
     */
    getPoint(t, optionalTarget = new Vector2()) {
      const point = optionalTarget;
      const v0 = this.v0, v1 = this.v1, v2 = this.v2, v3 = this.v3;
      point.set(
        CubicBezier(t, v0.x, v1.x, v2.x, v3.x),
        CubicBezier(t, v0.y, v1.y, v2.y, v3.y)
      );
      return point;
    }
    copy(source) {
      super.copy(source);
      this.v0.copy(source.v0);
      this.v1.copy(source.v1);
      this.v2.copy(source.v2);
      this.v3.copy(source.v3);
      return this;
    }
    toJSON() {
      const data = super.toJSON();
      data.v0 = this.v0.toArray();
      data.v1 = this.v1.toArray();
      data.v2 = this.v2.toArray();
      data.v3 = this.v3.toArray();
      return data;
    }
    fromJSON(json) {
      super.fromJSON(json);
      this.v0.fromArray(json.v0);
      this.v1.fromArray(json.v1);
      this.v2.fromArray(json.v2);
      this.v3.fromArray(json.v3);
      return this;
    }
  }
  class CubicBezierCurve3 extends Curve {
    /**
     * Constructs a new Cubic Bezier curve.
     *
     * @param {Vector3} [v0] - The start point.
     * @param {Vector3} [v1] - The first control point.
     * @param {Vector3} [v2] - The second control point.
     * @param {Vector3} [v3] - The end point.
     */
    constructor(v0 = new Vector3(), v1 = new Vector3(), v2 = new Vector3(), v3 = new Vector3()) {
      super();
      this.isCubicBezierCurve3 = true;
      this.type = "CubicBezierCurve3";
      this.v0 = v0;
      this.v1 = v1;
      this.v2 = v2;
      this.v3 = v3;
    }
    /**
     * Returns a point on the curve.
     *
     * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
     * @param {Vector3} [optionalTarget] - The optional target vector the result is written to.
     * @return {Vector3} The position on the curve.
     */
    getPoint(t, optionalTarget = new Vector3()) {
      const point = optionalTarget;
      const v0 = this.v0, v1 = this.v1, v2 = this.v2, v3 = this.v3;
      point.set(
        CubicBezier(t, v0.x, v1.x, v2.x, v3.x),
        CubicBezier(t, v0.y, v1.y, v2.y, v3.y),
        CubicBezier(t, v0.z, v1.z, v2.z, v3.z)
      );
      return point;
    }
    copy(source) {
      super.copy(source);
      this.v0.copy(source.v0);
      this.v1.copy(source.v1);
      this.v2.copy(source.v2);
      this.v3.copy(source.v3);
      return this;
    }
    toJSON() {
      const data = super.toJSON();
      data.v0 = this.v0.toArray();
      data.v1 = this.v1.toArray();
      data.v2 = this.v2.toArray();
      data.v3 = this.v3.toArray();
      return data;
    }
    fromJSON(json) {
      super.fromJSON(json);
      this.v0.fromArray(json.v0);
      this.v1.fromArray(json.v1);
      this.v2.fromArray(json.v2);
      this.v3.fromArray(json.v3);
      return this;
    }
  }
  class LineCurve extends Curve {
    /**
     * Constructs a new line curve.
     *
     * @param {Vector2} [v1] - The start point.
     * @param {Vector2} [v2] - The end point.
     */
    constructor(v1 = new Vector2(), v2 = new Vector2()) {
      super();
      this.isLineCurve = true;
      this.type = "LineCurve";
      this.v1 = v1;
      this.v2 = v2;
    }
    /**
     * Returns a point on the line.
     *
     * @param {number} t - A interpolation factor representing a position on the line. Must be in the range `[0,1]`.
     * @param {Vector2} [optionalTarget] - The optional target vector the result is written to.
     * @return {Vector2} The position on the line.
     */
    getPoint(t, optionalTarget = new Vector2()) {
      const point = optionalTarget;
      if (t === 1) {
        point.copy(this.v2);
      } else {
        point.copy(this.v2).sub(this.v1);
        point.multiplyScalar(t).add(this.v1);
      }
      return point;
    }
    // Line curve is linear, so we can overwrite default getPointAt
    getPointAt(u, optionalTarget) {
      return this.getPoint(u, optionalTarget);
    }
    getTangent(t, optionalTarget = new Vector2()) {
      return optionalTarget.subVectors(this.v2, this.v1).normalize();
    }
    getTangentAt(u, optionalTarget) {
      return this.getTangent(u, optionalTarget);
    }
    copy(source) {
      super.copy(source);
      this.v1.copy(source.v1);
      this.v2.copy(source.v2);
      return this;
    }
    toJSON() {
      const data = super.toJSON();
      data.v1 = this.v1.toArray();
      data.v2 = this.v2.toArray();
      return data;
    }
    fromJSON(json) {
      super.fromJSON(json);
      this.v1.fromArray(json.v1);
      this.v2.fromArray(json.v2);
      return this;
    }
  }
  class LineCurve3 extends Curve {
    /**
     * Constructs a new line curve.
     *
     * @param {Vector3} [v1] - The start point.
     * @param {Vector3} [v2] - The end point.
     */
    constructor(v1 = new Vector3(), v2 = new Vector3()) {
      super();
      this.isLineCurve3 = true;
      this.type = "LineCurve3";
      this.v1 = v1;
      this.v2 = v2;
    }
    /**
     * Returns a point on the line.
     *
     * @param {number} t - A interpolation factor representing a position on the line. Must be in the range `[0,1]`.
     * @param {Vector3} [optionalTarget] - The optional target vector the result is written to.
     * @return {Vector3} The position on the line.
     */
    getPoint(t, optionalTarget = new Vector3()) {
      const point = optionalTarget;
      if (t === 1) {
        point.copy(this.v2);
      } else {
        point.copy(this.v2).sub(this.v1);
        point.multiplyScalar(t).add(this.v1);
      }
      return point;
    }
    // Line curve is linear, so we can overwrite default getPointAt
    getPointAt(u, optionalTarget) {
      return this.getPoint(u, optionalTarget);
    }
    getTangent(t, optionalTarget = new Vector3()) {
      return optionalTarget.subVectors(this.v2, this.v1).normalize();
    }
    getTangentAt(u, optionalTarget) {
      return this.getTangent(u, optionalTarget);
    }
    copy(source) {
      super.copy(source);
      this.v1.copy(source.v1);
      this.v2.copy(source.v2);
      return this;
    }
    toJSON() {
      const data = super.toJSON();
      data.v1 = this.v1.toArray();
      data.v2 = this.v2.toArray();
      return data;
    }
    fromJSON(json) {
      super.fromJSON(json);
      this.v1.fromArray(json.v1);
      this.v2.fromArray(json.v2);
      return this;
    }
  }
  class QuadraticBezierCurve extends Curve {
    /**
     * Constructs a new Quadratic Bezier curve.
     *
     * @param {Vector2} [v0] - The start point.
     * @param {Vector2} [v1] - The control point.
     * @param {Vector2} [v2] - The end point.
     */
    constructor(v0 = new Vector2(), v1 = new Vector2(), v2 = new Vector2()) {
      super();
      this.isQuadraticBezierCurve = true;
      this.type = "QuadraticBezierCurve";
      this.v0 = v0;
      this.v1 = v1;
      this.v2 = v2;
    }
    /**
     * Returns a point on the curve.
     *
     * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
     * @param {Vector2} [optionalTarget] - The optional target vector the result is written to.
     * @return {Vector2} The position on the curve.
     */
    getPoint(t, optionalTarget = new Vector2()) {
      const point = optionalTarget;
      const v0 = this.v0, v1 = this.v1, v2 = this.v2;
      point.set(
        QuadraticBezier(t, v0.x, v1.x, v2.x),
        QuadraticBezier(t, v0.y, v1.y, v2.y)
      );
      return point;
    }
    copy(source) {
      super.copy(source);
      this.v0.copy(source.v0);
      this.v1.copy(source.v1);
      this.v2.copy(source.v2);
      return this;
    }
    toJSON() {
      const data = super.toJSON();
      data.v0 = this.v0.toArray();
      data.v1 = this.v1.toArray();
      data.v2 = this.v2.toArray();
      return data;
    }
    fromJSON(json) {
      super.fromJSON(json);
      this.v0.fromArray(json.v0);
      this.v1.fromArray(json.v1);
      this.v2.fromArray(json.v2);
      return this;
    }
  }
  class QuadraticBezierCurve3 extends Curve {
    /**
     * Constructs a new Quadratic Bezier curve.
     *
     * @param {Vector3} [v0] - The start point.
     * @param {Vector3} [v1] - The control point.
     * @param {Vector3} [v2] - The end point.
     */
    constructor(v0 = new Vector3(), v1 = new Vector3(), v2 = new Vector3()) {
      super();
      this.isQuadraticBezierCurve3 = true;
      this.type = "QuadraticBezierCurve3";
      this.v0 = v0;
      this.v1 = v1;
      this.v2 = v2;
    }
    /**
     * Returns a point on the curve.
     *
     * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
     * @param {Vector3} [optionalTarget] - The optional target vector the result is written to.
     * @return {Vector3} The position on the curve.
     */
    getPoint(t, optionalTarget = new Vector3()) {
      const point = optionalTarget;
      const v0 = this.v0, v1 = this.v1, v2 = this.v2;
      point.set(
        QuadraticBezier(t, v0.x, v1.x, v2.x),
        QuadraticBezier(t, v0.y, v1.y, v2.y),
        QuadraticBezier(t, v0.z, v1.z, v2.z)
      );
      return point;
    }
    copy(source) {
      super.copy(source);
      this.v0.copy(source.v0);
      this.v1.copy(source.v1);
      this.v2.copy(source.v2);
      return this;
    }
    toJSON() {
      const data = super.toJSON();
      data.v0 = this.v0.toArray();
      data.v1 = this.v1.toArray();
      data.v2 = this.v2.toArray();
      return data;
    }
    fromJSON(json) {
      super.fromJSON(json);
      this.v0.fromArray(json.v0);
      this.v1.fromArray(json.v1);
      this.v2.fromArray(json.v2);
      return this;
    }
  }
  class SplineCurve extends Curve {
    /**
     * Constructs a new 2D spline curve.
     *
     * @param {Array<Vector2>} [points] -  An array of 2D points defining the curve.
     */
    constructor(points = []) {
      super();
      this.isSplineCurve = true;
      this.type = "SplineCurve";
      this.points = points;
    }
    /**
     * Returns a point on the curve.
     *
     * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
     * @param {Vector2} [optionalTarget] - The optional target vector the result is written to.
     * @return {Vector2} The position on the curve.
     */
    getPoint(t, optionalTarget = new Vector2()) {
      const point = optionalTarget;
      const points = this.points;
      const p = (points.length - 1) * t;
      const intPoint = Math.floor(p);
      const weight = p - intPoint;
      const p0 = points[intPoint === 0 ? intPoint : intPoint - 1];
      const p1 = points[intPoint];
      const p2 = points[intPoint > points.length - 2 ? points.length - 1 : intPoint + 1];
      const p3 = points[intPoint > points.length - 3 ? points.length - 1 : intPoint + 2];
      point.set(
        CatmullRom(weight, p0.x, p1.x, p2.x, p3.x),
        CatmullRom(weight, p0.y, p1.y, p2.y, p3.y)
      );
      return point;
    }
    copy(source) {
      super.copy(source);
      this.points = [];
      for (let i = 0, l = source.points.length; i < l; i++) {
        const point = source.points[i];
        this.points.push(point.clone());
      }
      return this;
    }
    toJSON() {
      const data = super.toJSON();
      data.points = [];
      for (let i = 0, l = this.points.length; i < l; i++) {
        const point = this.points[i];
        data.points.push(point.toArray());
      }
      return data;
    }
    fromJSON(json) {
      super.fromJSON(json);
      this.points = [];
      for (let i = 0, l = json.points.length; i < l; i++) {
        const point = json.points[i];
        this.points.push(new Vector2().fromArray(point));
      }
      return this;
    }
  }
  var Curves = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    ArcCurve,
    CatmullRomCurve3,
    CubicBezierCurve,
    CubicBezierCurve3,
    EllipseCurve,
    LineCurve,
    LineCurve3,
    QuadraticBezierCurve,
    QuadraticBezierCurve3,
    SplineCurve
  });
  class CurvePath extends Curve {
    /**
     * Constructs a new curve path.
     */
    constructor() {
      super();
      this.type = "CurvePath";
      this.curves = [];
      this.autoClose = false;
    }
    /**
     * Adds a curve to this curve path.
     *
     * @param {Curve} curve - The curve to add.
     */
    add(curve) {
      this.curves.push(curve);
    }
    /**
     * Adds a line curve to close the path.
     *
     * @return {CurvePath} A reference to this curve path.
     */
    closePath() {
      const startPoint = this.curves[0].getPoint(0);
      const endPoint = this.curves[this.curves.length - 1].getPoint(1);
      if (!startPoint.equals(endPoint)) {
        const lineType = startPoint.isVector2 === true ? "LineCurve" : "LineCurve3";
        this.curves.push(new Curves[lineType](endPoint, startPoint));
      }
      return this;
    }
    /**
     * This method returns a vector in 2D or 3D space (depending on the curve definitions)
     * for the given interpolation factor.
     *
     * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
     * @param {(Vector2|Vector3)} [optionalTarget] - The optional target vector the result is written to.
     * @return {?(Vector2|Vector3)} The position on the curve. It can be a 2D or 3D vector depending on the curve definition.
     */
    getPoint(t, optionalTarget) {
      const d = t * this.getLength();
      const curveLengths = this.getCurveLengths();
      let i = 0;
      while (i < curveLengths.length) {
        if (curveLengths[i] >= d) {
          const diff = curveLengths[i] - d;
          const curve = this.curves[i];
          const segmentLength = curve.getLength();
          const u = segmentLength === 0 ? 0 : 1 - diff / segmentLength;
          return curve.getPointAt(u, optionalTarget);
        }
        i++;
      }
      return null;
    }
    getLength() {
      const lens = this.getCurveLengths();
      return lens[lens.length - 1];
    }
    updateArcLengths() {
      this.needsUpdate = true;
      this.cacheLengths = null;
      this.getCurveLengths();
    }
    /**
     * Returns list of cumulative curve lengths of the defined curves.
     *
     * @return {Array<number>} The curve lengths.
     */
    getCurveLengths() {
      if (this.cacheLengths && this.cacheLengths.length === this.curves.length) {
        return this.cacheLengths;
      }
      const lengths = [];
      let sums = 0;
      for (let i = 0, l = this.curves.length; i < l; i++) {
        sums += this.curves[i].getLength();
        lengths.push(sums);
      }
      this.cacheLengths = lengths;
      return lengths;
    }
    getSpacedPoints(divisions = 40) {
      const points = [];
      for (let i = 0; i <= divisions; i++) {
        points.push(this.getPoint(i / divisions));
      }
      if (this.autoClose) {
        points.push(points[0]);
      }
      return points;
    }
    getPoints(divisions = 12) {
      const points = [];
      let last;
      for (let i = 0, curves = this.curves; i < curves.length; i++) {
        const curve = curves[i];
        const resolution = curve.isEllipseCurve ? divisions * 2 : curve.isLineCurve || curve.isLineCurve3 ? 1 : curve.isSplineCurve ? divisions * curve.points.length : divisions;
        const pts = curve.getPoints(resolution);
        for (let j = 0; j < pts.length; j++) {
          const point = pts[j];
          if (last && last.equals(point)) continue;
          points.push(point);
          last = point;
        }
      }
      if (this.autoClose && points.length > 1 && !points[points.length - 1].equals(points[0])) {
        points.push(points[0]);
      }
      return points;
    }
    copy(source) {
      super.copy(source);
      this.curves = [];
      for (let i = 0, l = source.curves.length; i < l; i++) {
        const curve = source.curves[i];
        this.curves.push(curve.clone());
      }
      this.autoClose = source.autoClose;
      return this;
    }
    toJSON() {
      const data = super.toJSON();
      data.autoClose = this.autoClose;
      data.curves = [];
      for (let i = 0, l = this.curves.length; i < l; i++) {
        const curve = this.curves[i];
        data.curves.push(curve.toJSON());
      }
      return data;
    }
    fromJSON(json) {
      super.fromJSON(json);
      this.autoClose = json.autoClose;
      this.curves = [];
      for (let i = 0, l = json.curves.length; i < l; i++) {
        const curve = json.curves[i];
        this.curves.push(new Curves[curve.type]().fromJSON(curve));
      }
      return this;
    }
  }
  class Path extends CurvePath {
    /**
     * Constructs a new path.
     *
     * @param {Array<Vector2>} [points] - An array of 2D points defining the path.
     */
    constructor(points) {
      super();
      this.type = "Path";
      this.currentPoint = new Vector2();
      if (points) {
        this.setFromPoints(points);
      }
    }
    /**
     * Creates a path from the given list of points. The points are added
     * to the path as instances of {@link LineCurve}.
     *
     * @param {Array<Vector2>} points - An array of 2D points.
     * @return {Path} A reference to this path.
     */
    setFromPoints(points) {
      this.moveTo(points[0].x, points[0].y);
      for (let i = 1, l = points.length; i < l; i++) {
        this.lineTo(points[i].x, points[i].y);
      }
      return this;
    }
    /**
     * Moves {@link Path#currentPoint} to the given point.
     *
     * @param {number} x - The x coordinate.
     * @param {number} y - The y coordinate.
     * @return {Path} A reference to this path.
     */
    moveTo(x, y) {
      this.currentPoint.set(x, y);
      return this;
    }
    /**
     * Adds an instance of {@link LineCurve} to the path by connecting
     * the current point with the given one.
     *
     * @param {number} x - The x coordinate of the end point.
     * @param {number} y - The y coordinate of the end point.
     * @return {Path} A reference to this path.
     */
    lineTo(x, y) {
      const curve = new LineCurve(this.currentPoint.clone(), new Vector2(x, y));
      this.curves.push(curve);
      this.currentPoint.set(x, y);
      return this;
    }
    /**
     * Adds an instance of {@link QuadraticBezierCurve} to the path by connecting
     * the current point with the given one.
     *
     * @param {number} aCPx - The x coordinate of the control point.
     * @param {number} aCPy - The y coordinate of the control point.
     * @param {number} aX - The x coordinate of the end point.
     * @param {number} aY - The y coordinate of the end point.
     * @return {Path} A reference to this path.
     */
    quadraticCurveTo(aCPx, aCPy, aX, aY) {
      const curve = new QuadraticBezierCurve(
        this.currentPoint.clone(),
        new Vector2(aCPx, aCPy),
        new Vector2(aX, aY)
      );
      this.curves.push(curve);
      this.currentPoint.set(aX, aY);
      return this;
    }
    /**
     * Adds an instance of {@link CubicBezierCurve} to the path by connecting
     * the current point with the given one.
     *
     * @param {number} aCP1x - The x coordinate of the first control point.
     * @param {number} aCP1y - The y coordinate of the first control point.
     * @param {number} aCP2x - The x coordinate of the second control point.
     * @param {number} aCP2y - The y coordinate of the second control point.
     * @param {number} aX - The x coordinate of the end point.
     * @param {number} aY - The y coordinate of the end point.
     * @return {Path} A reference to this path.
     */
    bezierCurveTo(aCP1x, aCP1y, aCP2x, aCP2y, aX, aY) {
      const curve = new CubicBezierCurve(
        this.currentPoint.clone(),
        new Vector2(aCP1x, aCP1y),
        new Vector2(aCP2x, aCP2y),
        new Vector2(aX, aY)
      );
      this.curves.push(curve);
      this.currentPoint.set(aX, aY);
      return this;
    }
    /**
     * Adds an instance of {@link SplineCurve} to the path by connecting
     * the current point with the given list of points.
     *
     * @param {Array<Vector2>} pts - An array of points in 2D space.
     * @return {Path} A reference to this path.
     */
    splineThru(pts) {
      const npts = [this.currentPoint.clone()].concat(pts);
      const curve = new SplineCurve(npts);
      this.curves.push(curve);
      this.currentPoint.copy(pts[pts.length - 1]);
      return this;
    }
    /**
     * Adds an arc as an instance of {@link EllipseCurve} to the path, positioned relative
     * to the current point.
     *
     * @param {number} [aX=0] - The x coordinate of the center of the arc offsetted from the previous curve.
     * @param {number} [aY=0] - The y coordinate of the center of the arc offsetted from the previous curve.
     * @param {number} [aRadius=1] - The radius of the arc.
     * @param {number} [aStartAngle=0] - The start angle in radians.
     * @param {number} [aEndAngle=Math.PI*2] - The end angle in radians.
     * @param {boolean} [aClockwise=false] - Whether to sweep the arc clockwise or not.
     * @return {Path} A reference to this path.
     */
    arc(aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise) {
      const x0 = this.currentPoint.x;
      const y0 = this.currentPoint.y;
      this.absarc(
        aX + x0,
        aY + y0,
        aRadius,
        aStartAngle,
        aEndAngle,
        aClockwise
      );
      return this;
    }
    /**
     * Adds an absolutely positioned arc as an instance of {@link EllipseCurve} to the path.
     *
     * @param {number} [aX=0] - The x coordinate of the center of the arc.
     * @param {number} [aY=0] - The y coordinate of the center of the arc.
     * @param {number} [aRadius=1] - The radius of the arc.
     * @param {number} [aStartAngle=0] - The start angle in radians.
     * @param {number} [aEndAngle=Math.PI*2] - The end angle in radians.
     * @param {boolean} [aClockwise=false] - Whether to sweep the arc clockwise or not.
     * @return {Path} A reference to this path.
     */
    absarc(aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise) {
      this.absellipse(aX, aY, aRadius, aRadius, aStartAngle, aEndAngle, aClockwise);
      return this;
    }
    /**
     * Adds an ellipse as an instance of {@link EllipseCurve} to the path, positioned relative
     * to the current point
     *
     * @param {number} [aX=0] - The x coordinate of the center of the ellipse offsetted from the previous curve.
     * @param {number} [aY=0] - The y coordinate of the center of the ellipse offsetted from the previous curve.
     * @param {number} [xRadius=1] - The radius of the ellipse in the x axis.
     * @param {number} [yRadius=1] - The radius of the ellipse in the y axis.
     * @param {number} [aStartAngle=0] - The start angle in radians.
     * @param {number} [aEndAngle=Math.PI*2] - The end angle in radians.
     * @param {boolean} [aClockwise=false] - Whether to sweep the ellipse clockwise or not.
     * @param {number} [aRotation=0] - The rotation angle of the ellipse in radians, counterclockwise from the positive X axis.
     * @return {Path} A reference to this path.
     */
    ellipse(aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation) {
      const x0 = this.currentPoint.x;
      const y0 = this.currentPoint.y;
      this.absellipse(aX + x0, aY + y0, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation);
      return this;
    }
    /**
     * Adds an absolutely positioned ellipse as an instance of {@link EllipseCurve} to the path.
     *
     * @param {number} [aX=0] - The x coordinate of the absolute center of the ellipse.
     * @param {number} [aY=0] - The y coordinate of the absolute center of the ellipse.
     * @param {number} [xRadius=1] - The radius of the ellipse in the x axis.
     * @param {number} [yRadius=1] - The radius of the ellipse in the y axis.
     * @param {number} [aStartAngle=0] - The start angle in radians.
     * @param {number} [aEndAngle=Math.PI*2] - The end angle in radians.
     * @param {boolean} [aClockwise=false] - Whether to sweep the ellipse clockwise or not.
     * @param {number} [aRotation=0] - The rotation angle of the ellipse in radians, counterclockwise from the positive X axis.
     * @return {Path} A reference to this path.
     */
    absellipse(aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation) {
      const curve = new EllipseCurve(aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation);
      if (this.curves.length > 0) {
        const firstPoint = curve.getPoint(0);
        if (!firstPoint.equals(this.currentPoint)) {
          this.lineTo(firstPoint.x, firstPoint.y);
        }
      }
      this.curves.push(curve);
      const lastPoint = curve.getPoint(1);
      this.currentPoint.copy(lastPoint);
      return this;
    }
    copy(source) {
      super.copy(source);
      this.currentPoint.copy(source.currentPoint);
      return this;
    }
    toJSON() {
      const data = super.toJSON();
      data.currentPoint = this.currentPoint.toArray();
      return data;
    }
    fromJSON(json) {
      super.fromJSON(json);
      this.currentPoint.fromArray(json.currentPoint);
      return this;
    }
  }
  class Shape extends Path {
    /**
     * Constructs a new shape.
     *
     * @param {Array<Vector2>} [points] - An array of 2D points defining the shape.
     */
    constructor(points) {
      super(points);
      this.uuid = generateUUID();
      this.type = "Shape";
      this.holes = [];
    }
    /**
     * Returns an array representing each contour of the holes
     * as a list of 2D points.
     *
     * @param {number} divisions - The fineness of the result.
     * @return {Array<Array<Vector2>>} The holes as a series of 2D points.
     */
    getPointsHoles(divisions) {
      const holesPts = [];
      for (let i = 0, l = this.holes.length; i < l; i++) {
        holesPts[i] = this.holes[i].getPoints(divisions);
      }
      return holesPts;
    }
    // get points of shape and holes (keypoints based on segments parameter)
    /**
     * Returns an object that holds contour data for the shape and its holes as
     * arrays of 2D points.
     *
     * @param {number} divisions - The fineness of the result.
     * @return {{shape:Array<Vector2>,holes:Array<Array<Vector2>>}} An object with contour data.
     */
    extractPoints(divisions) {
      return {
        shape: this.getPoints(divisions),
        holes: this.getPointsHoles(divisions)
      };
    }
    copy(source) {
      super.copy(source);
      this.holes = [];
      for (let i = 0, l = source.holes.length; i < l; i++) {
        const hole = source.holes[i];
        this.holes.push(hole.clone());
      }
      return this;
    }
    toJSON() {
      const data = super.toJSON();
      data.uuid = this.uuid;
      data.holes = [];
      for (let i = 0, l = this.holes.length; i < l; i++) {
        const hole = this.holes[i];
        data.holes.push(hole.toJSON());
      }
      return data;
    }
    fromJSON(json) {
      super.fromJSON(json);
      this.uuid = json.uuid;
      this.holes = [];
      for (let i = 0, l = json.holes.length; i < l; i++) {
        const hole = json.holes[i];
        this.holes.push(new Path().fromJSON(hole));
      }
      return this;
    }
  }
  function earcut(data, holeIndices, dim = 2) {
    const hasHoles = holeIndices && holeIndices.length;
    const outerLen = hasHoles ? holeIndices[0] * dim : data.length;
    let outerNode = linkedList(data, 0, outerLen, dim, true);
    const triangles = [];
    if (!outerNode || outerNode.next === outerNode.prev) return triangles;
    let minX, minY, invSize;
    if (hasHoles) outerNode = eliminateHoles(data, holeIndices, outerNode, dim);
    if (data.length > 80 * dim) {
      minX = data[0];
      minY = data[1];
      let maxX = minX;
      let maxY = minY;
      for (let i = dim; i < outerLen; i += dim) {
        const x = data[i];
        const y = data[i + 1];
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
      invSize = Math.max(maxX - minX, maxY - minY);
      invSize = invSize !== 0 ? 32767 / invSize : 0;
    }
    earcutLinked(outerNode, triangles, dim, minX, minY, invSize, 0);
    return triangles;
  }
  function linkedList(data, start, end, dim, clockwise) {
    let last;
    if (clockwise === signedArea(data, start, end, dim) > 0) {
      for (let i = start; i < end; i += dim) last = insertNode(i / dim | 0, data[i], data[i + 1], last);
    } else {
      for (let i = end - dim; i >= start; i -= dim) last = insertNode(i / dim | 0, data[i], data[i + 1], last);
    }
    if (last && equals(last, last.next)) {
      removeNode(last);
      last = last.next;
    }
    return last;
  }
  function filterPoints(start, end) {
    if (!start) return start;
    if (!end) end = start;
    let p = start, again;
    do {
      again = false;
      if (!p.steiner && (equals(p, p.next) || area(p.prev, p, p.next) === 0)) {
        removeNode(p);
        p = end = p.prev;
        if (p === p.next) break;
        again = true;
      } else {
        p = p.next;
      }
    } while (again || p !== end);
    return end;
  }
  function earcutLinked(ear, triangles, dim, minX, minY, invSize, pass) {
    if (!ear) return;
    if (!pass && invSize) indexCurve(ear, minX, minY, invSize);
    let stop = ear;
    while (ear.prev !== ear.next) {
      const prev = ear.prev;
      const next = ear.next;
      if (invSize ? isEarHashed(ear, minX, minY, invSize) : isEar(ear)) {
        triangles.push(prev.i, ear.i, next.i);
        removeNode(ear);
        ear = next.next;
        stop = next.next;
        continue;
      }
      ear = next;
      if (ear === stop) {
        if (!pass) {
          earcutLinked(filterPoints(ear), triangles, dim, minX, minY, invSize, 1);
        } else if (pass === 1) {
          ear = cureLocalIntersections(filterPoints(ear), triangles);
          earcutLinked(ear, triangles, dim, minX, minY, invSize, 2);
        } else if (pass === 2) {
          splitEarcut(ear, triangles, dim, minX, minY, invSize);
        }
        break;
      }
    }
  }
  function isEar(ear) {
    const a = ear.prev, b = ear, c = ear.next;
    if (area(a, b, c) >= 0) return false;
    const ax = a.x, bx = b.x, cx = c.x, ay = a.y, by = b.y, cy = c.y;
    const x0 = Math.min(ax, bx, cx), y0 = Math.min(ay, by, cy), x1 = Math.max(ax, bx, cx), y1 = Math.max(ay, by, cy);
    let p = c.next;
    while (p !== a) {
      if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 && pointInTriangleExceptFirst(ax, ay, bx, by, cx, cy, p.x, p.y) && area(p.prev, p, p.next) >= 0) return false;
      p = p.next;
    }
    return true;
  }
  function isEarHashed(ear, minX, minY, invSize) {
    const a = ear.prev, b = ear, c = ear.next;
    if (area(a, b, c) >= 0) return false;
    const ax = a.x, bx = b.x, cx = c.x, ay = a.y, by = b.y, cy = c.y;
    const x0 = Math.min(ax, bx, cx), y0 = Math.min(ay, by, cy), x1 = Math.max(ax, bx, cx), y1 = Math.max(ay, by, cy);
    const minZ = zOrder(x0, y0, minX, minY, invSize), maxZ = zOrder(x1, y1, minX, minY, invSize);
    let p = ear.prevZ, n = ear.nextZ;
    while (p && p.z >= minZ && n && n.z <= maxZ) {
      if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 && p !== a && p !== c && pointInTriangleExceptFirst(ax, ay, bx, by, cx, cy, p.x, p.y) && area(p.prev, p, p.next) >= 0) return false;
      p = p.prevZ;
      if (n.x >= x0 && n.x <= x1 && n.y >= y0 && n.y <= y1 && n !== a && n !== c && pointInTriangleExceptFirst(ax, ay, bx, by, cx, cy, n.x, n.y) && area(n.prev, n, n.next) >= 0) return false;
      n = n.nextZ;
    }
    while (p && p.z >= minZ) {
      if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 && p !== a && p !== c && pointInTriangleExceptFirst(ax, ay, bx, by, cx, cy, p.x, p.y) && area(p.prev, p, p.next) >= 0) return false;
      p = p.prevZ;
    }
    while (n && n.z <= maxZ) {
      if (n.x >= x0 && n.x <= x1 && n.y >= y0 && n.y <= y1 && n !== a && n !== c && pointInTriangleExceptFirst(ax, ay, bx, by, cx, cy, n.x, n.y) && area(n.prev, n, n.next) >= 0) return false;
      n = n.nextZ;
    }
    return true;
  }
  function cureLocalIntersections(start, triangles) {
    let p = start;
    do {
      const a = p.prev, b = p.next.next;
      if (!equals(a, b) && intersects(a, p, p.next, b) && locallyInside(a, b) && locallyInside(b, a)) {
        triangles.push(a.i, p.i, b.i);
        removeNode(p);
        removeNode(p.next);
        p = start = b;
      }
      p = p.next;
    } while (p !== start);
    return filterPoints(p);
  }
  function splitEarcut(start, triangles, dim, minX, minY, invSize) {
    let a = start;
    do {
      let b = a.next.next;
      while (b !== a.prev) {
        if (a.i !== b.i && isValidDiagonal(a, b)) {
          let c = splitPolygon(a, b);
          a = filterPoints(a, a.next);
          c = filterPoints(c, c.next);
          earcutLinked(a, triangles, dim, minX, minY, invSize, 0);
          earcutLinked(c, triangles, dim, minX, minY, invSize, 0);
          return;
        }
        b = b.next;
      }
      a = a.next;
    } while (a !== start);
  }
  function eliminateHoles(data, holeIndices, outerNode, dim) {
    const queue = [];
    for (let i = 0, len = holeIndices.length; i < len; i++) {
      const start = holeIndices[i] * dim;
      const end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
      const list = linkedList(data, start, end, dim, false);
      if (list === list.next) list.steiner = true;
      queue.push(getLeftmost(list));
    }
    queue.sort(compareXYSlope);
    for (let i = 0; i < queue.length; i++) {
      outerNode = eliminateHole(queue[i], outerNode);
    }
    return outerNode;
  }
  function compareXYSlope(a, b) {
    let result = a.x - b.x;
    if (result === 0) {
      result = a.y - b.y;
      if (result === 0) {
        const aSlope = (a.next.y - a.y) / (a.next.x - a.x);
        const bSlope = (b.next.y - b.y) / (b.next.x - b.x);
        result = aSlope - bSlope;
      }
    }
    return result;
  }
  function eliminateHole(hole, outerNode) {
    const bridge = findHoleBridge(hole, outerNode);
    if (!bridge) {
      return outerNode;
    }
    const bridgeReverse = splitPolygon(bridge, hole);
    filterPoints(bridgeReverse, bridgeReverse.next);
    return filterPoints(bridge, bridge.next);
  }
  function findHoleBridge(hole, outerNode) {
    let p = outerNode;
    const hx = hole.x;
    const hy = hole.y;
    let qx = -Infinity;
    let m;
    if (equals(hole, p)) return p;
    do {
      if (equals(hole, p.next)) return p.next;
      else if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
        const x = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y);
        if (x <= hx && x > qx) {
          qx = x;
          m = p.x < p.next.x ? p : p.next;
          if (x === hx) return m;
        }
      }
      p = p.next;
    } while (p !== outerNode);
    if (!m) return null;
    const stop = m;
    const mx = m.x;
    const my = m.y;
    let tanMin = Infinity;
    p = m;
    do {
      if (hx >= p.x && p.x >= mx && hx !== p.x && pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {
        const tan = Math.abs(hy - p.y) / (hx - p.x);
        if (locallyInside(p, hole) && (tan < tanMin || tan === tanMin && (p.x > m.x || p.x === m.x && sectorContainsSector(m, p)))) {
          m = p;
          tanMin = tan;
        }
      }
      p = p.next;
    } while (p !== stop);
    return m;
  }
  function sectorContainsSector(m, p) {
    return area(m.prev, m, p.prev) < 0 && area(p.next, m, m.next) < 0;
  }
  function indexCurve(start, minX, minY, invSize) {
    let p = start;
    do {
      if (p.z === 0) p.z = zOrder(p.x, p.y, minX, minY, invSize);
      p.prevZ = p.prev;
      p.nextZ = p.next;
      p = p.next;
    } while (p !== start);
    p.prevZ.nextZ = null;
    p.prevZ = null;
    sortLinked(p);
  }
  function sortLinked(list) {
    let numMerges;
    let inSize = 1;
    do {
      let p = list;
      let e;
      list = null;
      let tail = null;
      numMerges = 0;
      while (p) {
        numMerges++;
        let q = p;
        let pSize = 0;
        for (let i = 0; i < inSize; i++) {
          pSize++;
          q = q.nextZ;
          if (!q) break;
        }
        let qSize = inSize;
        while (pSize > 0 || qSize > 0 && q) {
          if (pSize !== 0 && (qSize === 0 || !q || p.z <= q.z)) {
            e = p;
            p = p.nextZ;
            pSize--;
          } else {
            e = q;
            q = q.nextZ;
            qSize--;
          }
          if (tail) tail.nextZ = e;
          else list = e;
          e.prevZ = tail;
          tail = e;
        }
        p = q;
      }
      tail.nextZ = null;
      inSize *= 2;
    } while (numMerges > 1);
    return list;
  }
  function zOrder(x, y, minX, minY, invSize) {
    x = (x - minX) * invSize | 0;
    y = (y - minY) * invSize | 0;
    x = (x | x << 8) & 16711935;
    x = (x | x << 4) & 252645135;
    x = (x | x << 2) & 858993459;
    x = (x | x << 1) & 1431655765;
    y = (y | y << 8) & 16711935;
    y = (y | y << 4) & 252645135;
    y = (y | y << 2) & 858993459;
    y = (y | y << 1) & 1431655765;
    return x | y << 1;
  }
  function getLeftmost(start) {
    let p = start, leftmost = start;
    do {
      if (p.x < leftmost.x || p.x === leftmost.x && p.y < leftmost.y) leftmost = p;
      p = p.next;
    } while (p !== start);
    return leftmost;
  }
  function pointInTriangle(ax, ay, bx, by, cx, cy, px2, py2) {
    return (cx - px2) * (ay - py2) >= (ax - px2) * (cy - py2) && (ax - px2) * (by - py2) >= (bx - px2) * (ay - py2) && (bx - px2) * (cy - py2) >= (cx - px2) * (by - py2);
  }
  function pointInTriangleExceptFirst(ax, ay, bx, by, cx, cy, px2, py2) {
    return !(ax === px2 && ay === py2) && pointInTriangle(ax, ay, bx, by, cx, cy, px2, py2);
  }
  function isValidDiagonal(a, b) {
    return a.next.i !== b.i && a.prev.i !== b.i && !intersectsPolygon(a, b) && // doesn't intersect other edges
    (locallyInside(a, b) && locallyInside(b, a) && middleInside(a, b) && // locally visible
    (area(a.prev, a, b.prev) || area(a, b.prev, b)) || // does not create opposite-facing sectors
    equals(a, b) && area(a.prev, a, a.next) > 0 && area(b.prev, b, b.next) > 0);
  }
  function area(p, q, r) {
    return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  }
  function equals(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
  }
  function intersects(p1, q1, p2, q2) {
    const o1 = sign(area(p1, q1, p2));
    const o2 = sign(area(p1, q1, q2));
    const o3 = sign(area(p2, q2, p1));
    const o4 = sign(area(p2, q2, q1));
    if (o1 !== o2 && o3 !== o4) return true;
    if (o1 === 0 && onSegment(p1, p2, q1)) return true;
    if (o2 === 0 && onSegment(p1, q2, q1)) return true;
    if (o3 === 0 && onSegment(p2, p1, q2)) return true;
    if (o4 === 0 && onSegment(p2, q1, q2)) return true;
    return false;
  }
  function onSegment(p, q, r) {
    return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
  }
  function sign(num) {
    return num > 0 ? 1 : num < 0 ? -1 : 0;
  }
  function intersectsPolygon(a, b) {
    let p = a;
    do {
      if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i && intersects(p, p.next, a, b)) return true;
      p = p.next;
    } while (p !== a);
    return false;
  }
  function locallyInside(a, b) {
    return area(a.prev, a, a.next) < 0 ? area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0 : area(a, b, a.prev) < 0 || area(a, a.next, b) < 0;
  }
  function middleInside(a, b) {
    let p = a;
    let inside = false;
    const px2 = (a.x + b.x) / 2;
    const py2 = (a.y + b.y) / 2;
    do {
      if (p.y > py2 !== p.next.y > py2 && p.next.y !== p.y && px2 < (p.next.x - p.x) * (py2 - p.y) / (p.next.y - p.y) + p.x)
        inside = !inside;
      p = p.next;
    } while (p !== a);
    return inside;
  }
  function splitPolygon(a, b) {
    const a2 = createNode(a.i, a.x, a.y), b2 = createNode(b.i, b.x, b.y), an = a.next, bp = b.prev;
    a.next = b;
    b.prev = a;
    a2.next = an;
    an.prev = a2;
    b2.next = a2;
    a2.prev = b2;
    bp.next = b2;
    b2.prev = bp;
    return b2;
  }
  function insertNode(i, x, y, last) {
    const p = createNode(i, x, y);
    if (!last) {
      p.prev = p;
      p.next = p;
    } else {
      p.next = last.next;
      p.prev = last;
      last.next.prev = p;
      last.next = p;
    }
    return p;
  }
  function removeNode(p) {
    p.next.prev = p.prev;
    p.prev.next = p.next;
    if (p.prevZ) p.prevZ.nextZ = p.nextZ;
    if (p.nextZ) p.nextZ.prevZ = p.prevZ;
  }
  function createNode(i, x, y) {
    return {
      i,
      // vertex index in coordinates array
      x,
      y,
      // vertex coordinates
      prev: null,
      // previous and next vertex nodes in a polygon ring
      next: null,
      z: 0,
      // z-order curve value
      prevZ: null,
      // previous and next nodes in z-order
      nextZ: null,
      steiner: false
      // indicates whether this is a steiner point
    };
  }
  function signedArea(data, start, end, dim) {
    let sum = 0;
    for (let i = start, j = end - dim; i < end; i += dim) {
      sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
      j = i;
    }
    return sum;
  }
  class Earcut {
    /**
     * Triangulates the given shape definition by returning an array of triangles.
     *
     * @param {Array<number>} data - An array with 2D points.
     * @param {Array<number>} holeIndices - An array with indices defining holes.
     * @param {number} [dim=2] - The number of coordinates per vertex in the input array.
     * @return {Array<number>} An array representing the triangulated faces. Each face is defined by three consecutive numbers
     * representing vertex indices.
     */
    static triangulate(data, holeIndices, dim = 2) {
      return earcut(data, holeIndices, dim);
    }
  }
  class ShapeUtils {
    /**
     * Calculate area of a ( 2D ) contour polygon.
     *
     * @param {Array<Vector2>} contour - An array of 2D points.
     * @return {number} The area.
     */
    static area(contour) {
      const n = contour.length;
      let a = 0;
      for (let p = n - 1, q = 0; q < n; p = q++) {
        a += contour[p].x * contour[q].y - contour[q].x * contour[p].y;
      }
      return a * 0.5;
    }
    /**
     * Returns `true` if the given contour uses a clockwise winding order.
     *
     * @param {Array<Vector2>} pts - An array of 2D points defining a polygon.
     * @return {boolean} Whether the given contour uses a clockwise winding order or not.
     */
    static isClockWise(pts) {
      return ShapeUtils.area(pts) < 0;
    }
    /**
     * Triangulates the given shape definition.
     *
     * @param {Array<Vector2>} contour - An array of 2D points defining the contour.
     * @param {Array<Array<Vector2>>} holes - An array that holds arrays of 2D points defining the holes.
     * @return {Array<Array<number>>} An array that holds for each face definition an array with three indices.
     */
    static triangulateShape(contour, holes) {
      const vertices = [];
      const holeIndices = [];
      const faces = [];
      removeDupEndPts(contour);
      addContour(vertices, contour);
      let holeIndex = contour.length;
      holes.forEach(removeDupEndPts);
      for (let i = 0; i < holes.length; i++) {
        holeIndices.push(holeIndex);
        holeIndex += holes[i].length;
        addContour(vertices, holes[i]);
      }
      const triangles = Earcut.triangulate(vertices, holeIndices);
      for (let i = 0; i < triangles.length; i += 3) {
        faces.push(triangles.slice(i, i + 3));
      }
      return faces;
    }
  }
  function removeDupEndPts(points) {
    const l = points.length;
    if (l > 2 && points[l - 1].equals(points[0])) {
      points.pop();
    }
  }
  function addContour(vertices, contour) {
    for (let i = 0; i < contour.length; i++) {
      vertices.push(contour[i].x);
      vertices.push(contour[i].y);
    }
  }
  class ShapeGeometry extends BufferGeometry {
    /**
     * Constructs a new shape geometry.
     *
     * @param {Shape|Array<Shape>} [shapes] - A shape or an array of shapes.
     * @param {number} [curveSegments=12] - Number of segments per shape.
     */
    constructor(shapes = new Shape([new Vector2(0, 0.5), new Vector2(-0.5, -0.5), new Vector2(0.5, -0.5)]), curveSegments = 12) {
      super();
      this.type = "ShapeGeometry";
      this.parameters = {
        shapes,
        curveSegments
      };
      const indices = [];
      const vertices = [];
      const normals = [];
      const uvs = [];
      let groupStart = 0;
      let groupCount = 0;
      if (Array.isArray(shapes) === false) {
        addShape(shapes);
      } else {
        for (let i = 0; i < shapes.length; i++) {
          addShape(shapes[i]);
          this.addGroup(groupStart, groupCount, i);
          groupStart += groupCount;
          groupCount = 0;
        }
      }
      this.setIndex(indices);
      this.setAttribute("position", new Float32BufferAttribute(vertices, 3));
      this.setAttribute("normal", new Float32BufferAttribute(normals, 3));
      this.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
      function addShape(shape) {
        const indexOffset = vertices.length / 3;
        const points = shape.extractPoints(curveSegments);
        let shapeVertices = points.shape;
        const shapeHoles = points.holes;
        if (ShapeUtils.isClockWise(shapeVertices) === false) {
          shapeVertices = shapeVertices.reverse();
        }
        for (let i = 0, l = shapeHoles.length; i < l; i++) {
          const shapeHole = shapeHoles[i];
          if (ShapeUtils.isClockWise(shapeHole) === true) {
            shapeHoles[i] = shapeHole.reverse();
          }
        }
        const faces = ShapeUtils.triangulateShape(shapeVertices, shapeHoles);
        for (let i = 0, l = shapeHoles.length; i < l; i++) {
          const shapeHole = shapeHoles[i];
          shapeVertices = shapeVertices.concat(shapeHole);
        }
        for (let i = 0, l = shapeVertices.length; i < l; i++) {
          const vertex = shapeVertices[i];
          vertices.push(vertex.x, vertex.y, 0);
          normals.push(0, 0, 1);
          uvs.push(vertex.x, vertex.y);
        }
        for (let i = 0, l = faces.length; i < l; i++) {
          const face = faces[i];
          const a = face[0] + indexOffset;
          const b = face[1] + indexOffset;
          const c = face[2] + indexOffset;
          indices.push(a, b, c);
          groupCount += 3;
        }
      }
    }
    copy(source) {
      super.copy(source);
      this.parameters = Object.assign({}, source.parameters);
      return this;
    }
    toJSON() {
      const data = super.toJSON();
      const shapes = this.parameters.shapes;
      return toJSON(shapes, data);
    }
    /**
     * Factory method for creating an instance of this class from the given
     * JSON object.
     *
     * @param {Object} data - A JSON object representing the serialized geometry.
     * @param {Array<Shape>} shapes - An array of shapes.
     * @return {ShapeGeometry} A new instance.
     */
    static fromJSON(data, shapes) {
      const geometryShapes = [];
      for (let j = 0, jl = data.shapes.length; j < jl; j++) {
        const shape = shapes[data.shapes[j]];
        geometryShapes.push(shape);
      }
      return new ShapeGeometry(geometryShapes, data.curveSegments);
    }
  }
  function toJSON(shapes, data) {
    data.shapes = [];
    if (Array.isArray(shapes)) {
      for (let i = 0, l = shapes.length; i < l; i++) {
        const shape = shapes[i];
        data.shapes.push(shape.uuid);
      }
    } else {
      data.shapes.push(shapes.uuid);
    }
    return data;
  }
  const _startP = /* @__PURE__ */ new Vector3();
  const _startEnd = /* @__PURE__ */ new Vector3();
  const _d1 = /* @__PURE__ */ new Vector3();
  const _d2 = /* @__PURE__ */ new Vector3();
  const _r = /* @__PURE__ */ new Vector3();
  const _c1 = /* @__PURE__ */ new Vector3();
  const _c2 = /* @__PURE__ */ new Vector3();
  class Line3 {
    /**
     * Constructs a new line segment.
     *
     * @param {Vector3} [start=(0,0,0)] - Start of the line segment.
     * @param {Vector3} [end=(0,0,0)] - End of the line segment.
     */
    constructor(start = new Vector3(), end = new Vector3()) {
      this.start = start;
      this.end = end;
    }
    /**
     * Sets the start and end values by copying the given vectors.
     *
     * @param {Vector3} start - The start point.
     * @param {Vector3} end - The end point.
     * @return {Line3} A reference to this line segment.
     */
    set(start, end) {
      this.start.copy(start);
      this.end.copy(end);
      return this;
    }
    /**
     * Copies the values of the given line segment to this instance.
     *
     * @param {Line3} line - The line segment to copy.
     * @return {Line3} A reference to this line segment.
     */
    copy(line) {
      this.start.copy(line.start);
      this.end.copy(line.end);
      return this;
    }
    /**
     * Returns the center of the line segment.
     *
     * @param {Vector3} target - The target vector that is used to store the method's result.
     * @return {Vector3} The center point.
     */
    getCenter(target) {
      return target.addVectors(this.start, this.end).multiplyScalar(0.5);
    }
    /**
     * Returns the delta vector of the line segment's start and end point.
     *
     * @param {Vector3} target - The target vector that is used to store the method's result.
     * @return {Vector3} The delta vector.
     */
    delta(target) {
      return target.subVectors(this.end, this.start);
    }
    /**
     * Returns the squared Euclidean distance between the line' start and end point.
     *
     * @return {number} The squared Euclidean distance.
     */
    distanceSq() {
      return this.start.distanceToSquared(this.end);
    }
    /**
     * Returns the Euclidean distance between the line' start and end point.
     *
     * @return {number} The Euclidean distance.
     */
    distance() {
      return this.start.distanceTo(this.end);
    }
    /**
     * Returns a vector at a certain position along the line segment.
     *
     * @param {number} t - A value between `[0,1]` to represent a position along the line segment.
     * @param {Vector3} target - The target vector that is used to store the method's result.
     * @return {Vector3} The delta vector.
     */
    at(t, target) {
      return this.delta(target).multiplyScalar(t).add(this.start);
    }
    /**
     * Returns a point parameter based on the closest point as projected on the line segment.
     *
     * @param {Vector3} point - The point for which to return a point parameter.
     * @param {boolean} clampToLine - Whether to clamp the result to the range `[0,1]` or not.
     * @return {number} The point parameter.
     */
    closestPointToPointParameter(point, clampToLine) {
      _startP.subVectors(point, this.start);
      _startEnd.subVectors(this.end, this.start);
      const startEnd2 = _startEnd.dot(_startEnd);
      const startEnd_startP = _startEnd.dot(_startP);
      let t = startEnd_startP / startEnd2;
      if (clampToLine) {
        t = clamp(t, 0, 1);
      }
      return t;
    }
    /**
     * Returns the closest point on the line for a given point.
     *
     * @param {Vector3} point - The point to compute the closest point on the line for.
     * @param {boolean} clampToLine - Whether to clamp the result to the range `[0,1]` or not.
     * @param {Vector3} target - The target vector that is used to store the method's result.
     * @return {Vector3} The closest point on the line.
     */
    closestPointToPoint(point, clampToLine, target) {
      const t = this.closestPointToPointParameter(point, clampToLine);
      return this.delta(target).multiplyScalar(t).add(this.start);
    }
    /**
     * Returns the closest squared distance between this line segment and the given one.
     *
     * @param {Line3} line - The line segment to compute the closest squared distance to.
     * @param {Vector3} [c1] - The closest point on this line segment.
     * @param {Vector3} [c2] - The closest point on the given line segment.
     * @return {number} The squared distance between this line segment and the given one.
     */
    distanceSqToLine3(line, c1 = _c1, c2 = _c2) {
      const EPSILON = 1e-8 * 1e-8;
      let s, t;
      const p1 = this.start;
      const p2 = line.start;
      const q1 = this.end;
      const q2 = line.end;
      _d1.subVectors(q1, p1);
      _d2.subVectors(q2, p2);
      _r.subVectors(p1, p2);
      const a = _d1.dot(_d1);
      const e = _d2.dot(_d2);
      const f = _d2.dot(_r);
      if (a <= EPSILON && e <= EPSILON) {
        c1.copy(p1);
        c2.copy(p2);
        c1.sub(c2);
        return c1.dot(c1);
      }
      if (a <= EPSILON) {
        s = 0;
        t = f / e;
        t = clamp(t, 0, 1);
      } else {
        const c = _d1.dot(_r);
        if (e <= EPSILON) {
          t = 0;
          s = clamp(-c / a, 0, 1);
        } else {
          const b = _d1.dot(_d2);
          const denom = a * e - b * b;
          if (denom !== 0) {
            s = clamp((b * f - c * e) / denom, 0, 1);
          } else {
            s = 0;
          }
          t = (b * s + f) / e;
          if (t < 0) {
            t = 0;
            s = clamp(-c / a, 0, 1);
          } else if (t > 1) {
            t = 1;
            s = clamp((b - c) / a, 0, 1);
          }
        }
      }
      c1.copy(p1).add(_d1.multiplyScalar(s));
      c2.copy(p2).add(_d2.multiplyScalar(t));
      c1.sub(c2);
      return c1.dot(c1);
    }
    /**
     * Applies a 4x4 transformation matrix to this line segment.
     *
     * @param {Matrix4} matrix - The transformation matrix.
     * @return {Line3} A reference to this line segment.
     */
    applyMatrix4(matrix) {
      this.start.applyMatrix4(matrix);
      this.end.applyMatrix4(matrix);
      return this;
    }
    /**
     * Returns `true` if this line segment is equal with the given one.
     *
     * @param {Line3} line - The line segment to test for equality.
     * @return {boolean} Whether this line segment is equal with the given one.
     */
    equals(line) {
      return line.start.equals(this.start) && line.end.equals(this.end);
    }
    /**
     * Returns a new line segment with copied values from this instance.
     *
     * @return {Line3} A clone of this instance.
     */
    clone() {
      return new this.constructor().copy(this);
    }
  }
  if (typeof __THREE_DEVTOOLS__ !== "undefined") {
    __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", { detail: {
      revision: REVISION
    } }));
  }
  if (typeof window !== "undefined") {
    if (window.__THREE__) {
      warn("WARNING: Multiple instances of Three.js being imported.");
    } else {
      window.__THREE__ = REVISION;
    }
  }
  class Minkowski {
    static minkowskiInternal(pattern, path, isSum, isClosed) {
      const delta = isClosed ? 0 : 1;
      const patLen = pattern.length;
      const pathLen = path.length;
      const tmp2 = [];
      for (const pathPt of path) {
        const path2 = [];
        if (isSum) {
          for (const basePt of pattern)
            path2.push({ x: pathPt.x + basePt.x, y: pathPt.y + basePt.y });
        } else {
          for (const basePt of pattern)
            path2.push({ x: pathPt.x - basePt.x, y: pathPt.y - basePt.y });
        }
        tmp2.push(path2);
      }
      const result = [];
      let g = isClosed ? pathLen - 1 : 0;
      let h = patLen - 1;
      for (let i = delta; i < pathLen; i++) {
        for (let j = 0; j < patLen; j++) {
          const quad = [tmp2[g][h], tmp2[i][h], tmp2[i][j], tmp2[g][j]];
          if (!Clipper.isPositive(quad))
            result.push(Clipper.reversePath(quad));
          else
            result.push(quad);
          h = j;
        }
        g = i;
      }
      return result;
    }
    static sum(pattern, path, isClosed) {
      return Clipper.Union(this.minkowskiInternal(pattern, path, true, isClosed), void 0, FillRule.NonZero);
    }
    static diff(pattern, path, isClosed) {
      return Clipper.Union(this.minkowskiInternal(pattern, path, false, isClosed), void 0, FillRule.NonZero);
    }
  }
  var JoinType;
  (function(JoinType2) {
    JoinType2[JoinType2["Square"] = 0] = "Square";
    JoinType2[JoinType2["Round"] = 1] = "Round";
    JoinType2[JoinType2["Miter"] = 2] = "Miter";
  })(JoinType || (JoinType = {}));
  var EndType;
  (function(EndType2) {
    EndType2[EndType2["Polygon"] = 0] = "Polygon";
    EndType2[EndType2["Joined"] = 1] = "Joined";
    EndType2[EndType2["Butt"] = 2] = "Butt";
    EndType2[EndType2["Square"] = 3] = "Square";
    EndType2[EndType2["Round"] = 4] = "Round";
  })(EndType || (EndType = {}));
  class Group {
    constructor(paths, joinType, endType = EndType.Polygon) {
      this.inPaths = [...paths];
      this.joinType = joinType;
      this.endType = endType;
      this.outPath = [];
      this.outPaths = [];
      this.pathsReversed = false;
    }
  }
  class PointD {
    constructor(xOrPt, yOrScale) {
      if (typeof xOrPt === "number" && typeof yOrScale === "number") {
        this.x = xOrPt;
        this.y = yOrScale;
      } else if (xOrPt instanceof PointD) {
        if (yOrScale !== void 0) {
          this.x = xOrPt.x * yOrScale;
          this.y = xOrPt.y * yOrScale;
        } else {
          this.x = xOrPt.x;
          this.y = xOrPt.y;
        }
      } else {
        this.x = xOrPt.x * (yOrScale || 1);
        this.y = xOrPt.y * (yOrScale || 1);
      }
    }
    toString(precision = 2) {
      return `${this.x.toFixed(precision)},${this.y.toFixed(precision)}`;
    }
    static equals(lhs, rhs) {
      return InternalClipper.isAlmostZero(lhs.x - rhs.x) && InternalClipper.isAlmostZero(lhs.y - rhs.y);
    }
    static notEquals(lhs, rhs) {
      return !InternalClipper.isAlmostZero(lhs.x - rhs.x) || !InternalClipper.isAlmostZero(lhs.y - rhs.y);
    }
    equals(obj) {
      if (obj instanceof PointD) {
        return PointD.equals(this, obj);
      }
      return false;
    }
    negate() {
      this.x = -this.x;
      this.y = -this.y;
    }
  }
  class ClipperOffset {
    constructor(miterLimit = 2, arcTolerance = 0, preserveCollinear = false, reverseSolution = false) {
      this._groupList = [];
      this._normals = [];
      this._solution = [];
      this.MiterLimit = miterLimit;
      this.ArcTolerance = arcTolerance;
      this.MergeGroups = true;
      this.PreserveCollinear = preserveCollinear;
      this.ReverseSolution = reverseSolution;
    }
    clear() {
      this._groupList = [];
    }
    addPath(path, joinType, endType) {
      if (path.length === 0)
        return;
      const pp = [path];
      this.addPaths(pp, joinType, endType);
    }
    addPaths(paths, joinType, endType) {
      if (paths.length === 0)
        return;
      this._groupList.push(new Group(paths, joinType, endType));
    }
    executeInternal(delta) {
      this._solution = [];
      if (this._groupList.length === 0)
        return;
      if (Math.abs(delta) < 0.5) {
        for (const group of this._groupList) {
          for (const path of group.inPaths) {
            this._solution.push(path);
          }
        }
      } else {
        this._delta = delta;
        this._mitLimSqr = this.MiterLimit <= 1 ? 2 : 2 / this.sqr(this.MiterLimit);
        for (const group of this._groupList) {
          this.doGroupOffset(group);
        }
      }
    }
    sqr(value) {
      return value * value;
    }
    execute(delta, solution) {
      solution.length = 0;
      this.executeInternal(delta);
      if (this._groupList.length === 0)
        return;
      const c = new Clipper64();
      c.preserveCollinear = this.PreserveCollinear;
      c.reverseSolution = this.ReverseSolution !== this._groupList[0].pathsReversed;
      c.addSubjectPaths(this._solution);
      if (this._groupList[0].pathsReversed)
        c.execute(ClipType.Union, FillRule.Negative, solution);
      else
        c.execute(ClipType.Union, FillRule.Positive, solution);
    }
    executePolytree(delta, polytree) {
      polytree.clear();
      this.executeInternal(delta);
      if (this._groupList.length === 0)
        return;
      const c = new Clipper64();
      c.preserveCollinear = this.PreserveCollinear;
      c.reverseSolution = this.ReverseSolution !== this._groupList[0].pathsReversed;
      c.addSubjectPaths(this._solution);
      if (this._groupList[0].pathsReversed)
        c.executePolyTree(ClipType.Union, FillRule.Negative, polytree);
      else
        c.executePolyTree(ClipType.Union, FillRule.Positive, polytree);
    }
    static getUnitNormal(pt1, pt2) {
      let dx = pt2.x - pt1.x;
      let dy = pt2.y - pt1.y;
      if (dx === 0 && dy === 0)
        return new PointD(0, 0);
      const f = 1 / Math.sqrt(dx * dx + dy * dy);
      dx *= f;
      dy *= f;
      return new PointD(dy, -dx);
    }
    executeCallback(deltaCallback, solution) {
      this.DeltaCallback = deltaCallback;
      this.execute(1, solution);
    }
    static getBoundsAndLowestPolyIdx(paths) {
      const rec = new Rect64(false);
      let lpX = Number.MIN_SAFE_INTEGER;
      let index = -1;
      for (let i = 0; i < paths.length; i++) {
        for (const pt of paths[i]) {
          if (pt.y >= rec.bottom) {
            if (pt.y > rec.bottom || pt.x < lpX) {
              index = i;
              lpX = pt.x;
              rec.bottom = pt.y;
            }
          } else if (pt.y < rec.top)
            rec.top = pt.y;
          if (pt.x > rec.right)
            rec.right = pt.x;
          else if (pt.x < rec.left)
            rec.left = pt.x;
        }
      }
      return { index, rec };
    }
    static translatePoint(pt, dx, dy) {
      return new PointD(pt.x + dx, pt.y + dy);
    }
    static reflectPoint(pt, pivot) {
      return new PointD(pivot.x + (pivot.x - pt.x), pivot.y + (pivot.y - pt.y));
    }
    static almostZero(value, epsilon = 1e-3) {
      return Math.abs(value) < epsilon;
    }
    static hypotenuse(x, y) {
      return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    }
    static normalizeVector(vec) {
      const h = this.hypotenuse(vec.x, vec.y);
      if (this.almostZero(h))
        return new PointD(0, 0);
      const inverseHypot = 1 / h;
      return new PointD(vec.x * inverseHypot, vec.y * inverseHypot);
    }
    static getAvgUnitVector(vec1, vec2) {
      return this.normalizeVector(new PointD(vec1.x + vec2.x, vec1.y + vec2.y));
    }
    static intersectPoint(pt1a, pt1b, pt2a, pt2b) {
      if (InternalClipper.isAlmostZero(pt1a.x - pt1b.x)) {
        if (InternalClipper.isAlmostZero(pt2a.x - pt2b.x))
          return new PointD(0, 0);
        const m2 = (pt2b.y - pt2a.y) / (pt2b.x - pt2a.x);
        const b2 = pt2a.y - m2 * pt2a.x;
        return new PointD(pt1a.x, m2 * pt1a.x + b2);
      }
      if (InternalClipper.isAlmostZero(pt2a.x - pt2b.x)) {
        const m1 = (pt1b.y - pt1a.y) / (pt1b.x - pt1a.x);
        const b1 = pt1a.y - m1 * pt1a.x;
        return new PointD(pt2a.x, m1 * pt2a.x + b1);
      } else {
        const m1 = (pt1b.y - pt1a.y) / (pt1b.x - pt1a.x);
        const b1 = pt1a.y - m1 * pt1a.x;
        const m2 = (pt2b.y - pt2a.y) / (pt2b.x - pt2a.x);
        const b2 = pt2a.y - m2 * pt2a.x;
        if (InternalClipper.isAlmostZero(m1 - m2))
          return new PointD(0, 0);
        const x = (b2 - b1) / (m1 - m2);
        return new PointD(x, m1 * x + b1);
      }
    }
    getPerpendic(pt, norm) {
      return new Point64(pt.x + norm.x * this._groupDelta, pt.y + norm.y * this._groupDelta);
    }
    getPerpendicD(pt, norm) {
      return new PointD(pt.x + norm.x * this._groupDelta, pt.y + norm.y * this._groupDelta);
    }
    doSquare(group, path, j, k) {
      let vec;
      if (j === k) {
        vec = new PointD(this._normals[j].y, -this._normals[j].x);
      } else {
        vec = ClipperOffset.getAvgUnitVector(new PointD(-this._normals[k].y, this._normals[k].x), new PointD(this._normals[j].y, -this._normals[j].x));
      }
      const absDelta = Math.abs(this._groupDelta);
      let ptQ = new PointD(path[j].x, path[j].y);
      ptQ = ClipperOffset.translatePoint(ptQ, absDelta * vec.x, absDelta * vec.y);
      const pt1 = ClipperOffset.translatePoint(ptQ, this._groupDelta * vec.y, this._groupDelta * -vec.x);
      const pt2 = ClipperOffset.translatePoint(ptQ, this._groupDelta * -vec.y, this._groupDelta * vec.x);
      const pt3 = this.getPerpendicD(path[k], this._normals[k]);
      if (j === k) {
        const pt4 = new PointD(pt3.x + vec.x * this._groupDelta, pt3.y + vec.y * this._groupDelta);
        const pt = ClipperOffset.intersectPoint(pt1, pt2, pt3, pt4);
        group.outPath.push(new Point64(ClipperOffset.reflectPoint(pt, ptQ).x, ClipperOffset.reflectPoint(pt, ptQ).y));
        group.outPath.push(new Point64(pt.x, pt.y));
      } else {
        const pt4 = this.getPerpendicD(path[j], this._normals[k]);
        const pt = ClipperOffset.intersectPoint(pt1, pt2, pt3, pt4);
        group.outPath.push(new Point64(pt.x, pt.y));
        group.outPath.push(new Point64(ClipperOffset.reflectPoint(pt, ptQ).x, ClipperOffset.reflectPoint(pt, ptQ).y));
      }
    }
    doMiter(group, path, j, k, cosA) {
      const q = this._groupDelta / (cosA + 1);
      group.outPath.push(new Point64(path[j].x + (this._normals[k].x + this._normals[j].x) * q, path[j].y + (this._normals[k].y + this._normals[j].y) * q));
    }
    doRound(group, path, j, k, angle) {
      if (typeof this.DeltaCallback !== "undefined") {
        const absDelta = Math.abs(this._groupDelta);
        const arcTol = this.ArcTolerance > 0.01 ? this.ArcTolerance : Math.log10(2 + absDelta) * InternalClipper.defaultArcTolerance;
        const stepsPer360 = Math.PI / Math.acos(1 - arcTol / absDelta);
        this._stepSin = Math.sin(2 * Math.PI / stepsPer360);
        this._stepCos = Math.cos(2 * Math.PI / stepsPer360);
        if (this._groupDelta < 0)
          this._stepSin = -this._stepSin;
        this._stepsPerRad = stepsPer360 / (2 * Math.PI);
      }
      const pt = path[j];
      let offsetVec = new PointD(this._normals[k].x * this._groupDelta, this._normals[k].y * this._groupDelta);
      if (j === k)
        offsetVec.negate();
      group.outPath.push(new Point64(pt.x + offsetVec.x, pt.y + offsetVec.y));
      if (angle > -Math.PI + 0.01) {
        const steps = Math.ceil(this._stepsPerRad * Math.abs(angle));
        for (let i = 1; i < steps; i++) {
          offsetVec = new PointD(offsetVec.x * this._stepCos - this._stepSin * offsetVec.y, offsetVec.x * this._stepSin + offsetVec.y * this._stepCos);
          group.outPath.push(new Point64(pt.x + offsetVec.x, pt.y + offsetVec.y));
        }
      }
      group.outPath.push(this.getPerpendic(pt, this._normals[j]));
    }
    buildNormals(path) {
      const cnt = path.length;
      this._normals = [];
      this._normals.length = cnt;
      for (let i = 0; i < cnt - 1; i++) {
        this._normals.push(ClipperOffset.getUnitNormal(path[i], path[i + 1]));
      }
      this._normals.push(ClipperOffset.getUnitNormal(path[cnt - 1], path[0]));
    }
    crossProduct(vec1, vec2) {
      return vec1.y * vec2.x - vec2.y * vec1.x;
    }
    dotProduct(vec1, vec2) {
      return vec1.x * vec2.x + vec1.y * vec2.y;
    }
    offsetPoint(group, path, j, k) {
      const sinA = this.crossProduct(this._normals[j], this._normals[k]);
      let cosA = this.dotProduct(this._normals[j], this._normals[k]);
      if (sinA > 1)
        cosA = 1;
      else if (sinA < -1)
        cosA = -1;
      if (typeof this.DeltaCallback !== "undefined") {
        this._groupDelta = this.DeltaCallback(path, this._normals, j, k);
        if (group.pathsReversed)
          this._groupDelta = -this._groupDelta;
      }
      if (Math.abs(this._groupDelta) < ClipperOffset.Tolerance) {
        group.outPath.push(path[j]);
        return;
      }
      if (cosA > 0.999) {
        this.doMiter(group, path, j, k, cosA);
      } else if (cosA > -0.99 && sinA * this._groupDelta < 0) {
        group.outPath.push(this.getPerpendic(path[j], this._normals[k]));
        group.outPath.push(path[j]);
        group.outPath.push(this.getPerpendic(path[j], this._normals[j]));
      } else if (this._joinType === JoinType.Miter) {
        if (cosA > this._mitLimSqr - 1) {
          this.doMiter(group, path, j, k, cosA);
        } else {
          this.doSquare(group, path, j, k);
        }
      } else if (cosA > 0.99 || this._joinType === JoinType.Square) {
        this.doSquare(group, path, j, k);
      } else {
        this.doRound(group, path, j, k, Math.atan2(sinA, cosA));
      }
      k = j;
    }
    offsetPolygon(group, path) {
      const area2 = Clipper.area(path);
      if (area2 < 0 !== this._groupDelta < 0) {
        const rect = Clipper.getBounds(path);
        if (Math.abs(this._groupDelta) * 2 > rect.width)
          return;
      }
      group.outPath = [];
      const cnt = path.length;
      const prev = cnt - 1;
      for (let i = 0; i < cnt; i++) {
        this.offsetPoint(group, path, i, prev);
      }
      group.outPaths.push(group.outPath);
    }
    offsetOpenJoined(group, path) {
      this.offsetPolygon(group, path);
      path = Clipper.reversePath(path);
      this.buildNormals(path);
      this.offsetPolygon(group, path);
    }
    offsetOpenPath(group, path) {
      group.outPath = [];
      const highI = path.length - 1;
      if (typeof this.DeltaCallback !== "undefined") {
        this._groupDelta = this.DeltaCallback(path, this._normals, 0, 0);
      }
      if (Math.abs(this._groupDelta) < ClipperOffset.Tolerance) {
        group.outPath.push(path[0]);
      } else {
        switch (this._endType) {
          case EndType.Butt:
            group.outPath.push(new Point64(path[0].x - this._normals[0].x * this._groupDelta, path[0].y - this._normals[0].y * this._groupDelta));
            group.outPath.push(this.getPerpendic(path[0], this._normals[0]));
            break;
          case EndType.Round:
            this.doRound(group, path, 0, 0, Math.PI);
            break;
          default:
            this.doSquare(group, path, 0, 0);
            break;
        }
      }
      for (let i = 1, k = 0; i < highI; i++) {
        this.offsetPoint(group, path, i, k);
      }
      for (let i = highI; i > 0; i--) {
        this._normals[i] = new PointD(-this._normals[i - 1].x, -this._normals[i - 1].y);
      }
      this._normals[0] = this._normals[highI];
      if (typeof this.DeltaCallback !== "undefined") {
        this._groupDelta = this.DeltaCallback(path, this._normals, highI, highI);
      }
      if (Math.abs(this._groupDelta) < ClipperOffset.Tolerance) {
        group.outPath.push(path[highI]);
      } else {
        switch (this._endType) {
          case EndType.Butt:
            group.outPath.push(new Point64(path[highI].x - this._normals[highI].x * this._groupDelta, path[highI].y - this._normals[highI].y * this._groupDelta));
            group.outPath.push(this.getPerpendic(path[highI], this._normals[highI]));
            break;
          case EndType.Round:
            this.doRound(group, path, highI, highI, Math.PI);
            break;
          default:
            this.doSquare(group, path, highI, highI);
            break;
        }
      }
      for (let i = highI, k = 0; i > 0; i--) {
        this.offsetPoint(group, path, i, k);
      }
      group.outPaths.push(group.outPath);
    }
    doGroupOffset(group) {
      if (group.endType == EndType.Polygon) {
        const { index } = ClipperOffset.getBoundsAndLowestPolyIdx(group.inPaths);
        if (index < 0)
          return;
        const area2 = Clipper.area(group.inPaths[index]);
        group.pathsReversed = area2 < 0;
        if (group.pathsReversed) {
          this._groupDelta = -this._delta;
        } else {
          this._groupDelta = this._delta;
        }
      } else {
        group.pathsReversed = false;
        this._groupDelta = Math.abs(this._delta) * 0.5;
      }
      const absDelta = Math.abs(this._groupDelta);
      this._joinType = group.joinType;
      this._endType = group.endType;
      if (!this.DeltaCallback && (group.joinType == JoinType.Round || group.endType == EndType.Round)) {
        const arcTol = this.ArcTolerance > 0.01 ? this.ArcTolerance : Math.log10(2 + absDelta) * InternalClipper.defaultArcTolerance;
        const stepsPer360 = Math.PI / Math.acos(1 - arcTol / absDelta);
        this._stepSin = Math.sin(2 * Math.PI / stepsPer360);
        this._stepCos = Math.cos(2 * Math.PI / stepsPer360);
        if (this._groupDelta < 0) {
          this._stepSin = -this._stepSin;
        }
        this._stepsPerRad = stepsPer360 / (2 * Math.PI);
      }
      const isJoined = group.endType == EndType.Joined || group.endType == EndType.Polygon;
      for (const p of group.inPaths) {
        const path = Clipper.stripDuplicates(p, isJoined);
        const cnt = path.length;
        if (cnt === 0 || cnt < 3 && this._endType == EndType.Polygon) {
          continue;
        }
        if (cnt == 1) {
          group.outPath = [];
          if (group.endType == EndType.Round) {
            const r = absDelta;
            group.outPath = Clipper.ellipse(path[0], r, r);
          } else {
            const d = Math.ceil(this._groupDelta);
            const r = new Rect64(path[0].x - d, path[0].y - d, path[0].x - d, path[0].y - d);
            group.outPath = r.asPath();
          }
          group.outPaths.push(group.outPath);
        } else {
          if (cnt == 2 && group.endType == EndType.Joined) {
            if (group.joinType == JoinType.Round) {
              this._endType = EndType.Round;
            } else {
              this._endType = EndType.Square;
            }
          }
          this.buildNormals(path);
          if (this._endType == EndType.Polygon) {
            this.offsetPolygon(group, path);
          } else if (this._endType == EndType.Joined) {
            this.offsetOpenJoined(group, path);
          } else {
            this.offsetOpenPath(group, path);
          }
        }
      }
      this._solution.push(...group.outPaths);
      group.outPaths = [];
    }
  }
  ClipperOffset.Tolerance = 1e-12;
  class OutPt2 {
    constructor(pt) {
      this.pt = pt;
      this.ownerIdx = 0;
    }
  }
  var Location;
  (function(Location2) {
    Location2[Location2["left"] = 0] = "left";
    Location2[Location2["top"] = 1] = "top";
    Location2[Location2["right"] = 2] = "right";
    Location2[Location2["bottom"] = 3] = "bottom";
    Location2[Location2["inside"] = 4] = "inside";
  })(Location || (Location = {}));
  class RectClip64 {
    constructor(rect) {
      this.currIdx = -1;
      this.rect = rect;
      this.mp = rect.midPoint();
      this.rectPath = rect.asPath();
      this.results = [];
      this.edges = Array(8).fill(void 0).map(() => []);
    }
    add(pt, startingNewPath = false) {
      let currIdx = this.results.length;
      let result;
      if (currIdx === 0 || startingNewPath) {
        result = new OutPt2(pt);
        this.results.push(result);
        result.ownerIdx = currIdx;
        result.prev = result;
        result.next = result;
      } else {
        currIdx--;
        const prevOp = this.results[currIdx];
        if (prevOp.pt === pt)
          return prevOp;
        result = new OutPt2(pt);
        result.ownerIdx = currIdx;
        result.next = prevOp.next;
        prevOp.next.prev = result;
        prevOp.next = result;
        result.prev = prevOp;
        this.results[currIdx] = result;
      }
      return result;
    }
    static path1ContainsPath2(path1, path2) {
      let ioCount = 0;
      for (const pt of path2) {
        const pip = InternalClipper.pointInPolygon(pt, path1);
        switch (pip) {
          case PointInPolygonResult.IsInside:
            ioCount--;
            break;
          case PointInPolygonResult.IsOutside:
            ioCount++;
            break;
        }
        if (Math.abs(ioCount) > 1)
          break;
      }
      return ioCount <= 0;
    }
    static isClockwise(prev, curr, prevPt, currPt, rectMidPoint) {
      if (this.areOpposites(prev, curr))
        return InternalClipper.crossProduct(prevPt, rectMidPoint, currPt) < 0;
      else
        return this.headingClockwise(prev, curr);
    }
    static areOpposites(prev, curr) {
      return Math.abs(prev - curr) === 2;
    }
    static headingClockwise(prev, curr) {
      return (prev + 1) % 4 === curr;
    }
    static getAdjacentLocation(loc, isClockwise) {
      const delta = isClockwise ? 1 : 3;
      return (loc + delta) % 4;
    }
    static unlinkOp(op) {
      if (op.next === op)
        return void 0;
      op.prev.next = op.next;
      op.next.prev = op.prev;
      return op.next;
    }
    static unlinkOpBack(op) {
      if (op.next === op)
        return void 0;
      op.prev.next = op.next;
      op.next.prev = op.prev;
      return op.prev;
    }
    static getEdgesForPt(pt, rec) {
      let result = 0;
      if (pt.x === rec.left)
        result = 1;
      else if (pt.x === rec.right)
        result = 4;
      if (pt.y === rec.top)
        result += 2;
      else if (pt.y === rec.bottom)
        result += 8;
      return result;
    }
    static isHeadingClockwise(pt1, pt2, edgeIdx) {
      switch (edgeIdx) {
        case 0:
          return pt2.y < pt1.y;
        case 1:
          return pt2.x > pt1.x;
        case 2:
          return pt2.y > pt1.y;
        default:
          return pt2.x < pt1.x;
      }
    }
    static hasHorzOverlap(left1, right1, left2, right2) {
      return left1.x < right2.x && right1.x > left2.x;
    }
    static hasVertOverlap(top1, bottom1, top2, bottom2) {
      return top1.y < bottom2.y && bottom1.y > top2.y;
    }
    static addToEdge(edge, op) {
      if (op.edge)
        return;
      op.edge = edge;
      edge.push(op);
    }
    static uncoupleEdge(op) {
      if (!op.edge)
        return;
      for (let i = 0; i < op.edge.length; i++) {
        const op2 = op.edge[i];
        if (op2 === op) {
          op.edge[i] = void 0;
          break;
        }
      }
      op.edge = void 0;
    }
    static setNewOwner(op, newIdx) {
      op.ownerIdx = newIdx;
      let op2 = op.next;
      while (op2 !== op) {
        op2.ownerIdx = newIdx;
        op2 = op2.next;
      }
    }
    addCorner(prev, curr) {
      if (RectClip64.headingClockwise(prev, curr))
        this.add(this.rectPath[prev]);
      else
        this.add(this.rectPath[curr]);
    }
    addCornerByRef(loc, isClockwise) {
      if (isClockwise) {
        this.add(this.rectPath[loc]);
        loc = RectClip64.getAdjacentLocation(loc, true);
      } else {
        loc = RectClip64.getAdjacentLocation(loc, false);
        this.add(this.rectPath[loc]);
      }
    }
    static getLocation(rec, pt) {
      let loc;
      if (pt.x === rec.left && pt.y >= rec.top && pt.y <= rec.bottom) {
        loc = Location.left;
        return { success: false, loc };
      }
      if (pt.x === rec.right && pt.y >= rec.top && pt.y <= rec.bottom) {
        loc = Location.right;
        return { success: false, loc };
      }
      if (pt.y === rec.top && pt.x >= rec.left && pt.x <= rec.right) {
        loc = Location.top;
        return { success: false, loc };
      }
      if (pt.y === rec.bottom && pt.x >= rec.left && pt.x <= rec.right) {
        loc = Location.bottom;
        return { success: false, loc };
      }
      if (pt.x < rec.left)
        loc = Location.left;
      else if (pt.x > rec.right)
        loc = Location.right;
      else if (pt.y < rec.top)
        loc = Location.top;
      else if (pt.y > rec.bottom)
        loc = Location.bottom;
      else
        loc = Location.inside;
      return { success: true, loc };
    }
    static getIntersection(rectPath, p, p2, loc) {
      let ip = new Point64();
      switch (loc) {
        case Location.left:
          if (InternalClipper.segsIntersect(p, p2, rectPath[0], rectPath[3], true)) {
            ip = InternalClipper.getIntersectPt(p, p2, rectPath[0], rectPath[3]).ip;
          } else if (p.y < rectPath[0].y && InternalClipper.segsIntersect(p, p2, rectPath[0], rectPath[1], true)) {
            ip = InternalClipper.getIntersectPt(p, p2, rectPath[0], rectPath[1]).ip;
            loc = Location.top;
          } else if (InternalClipper.segsIntersect(p, p2, rectPath[2], rectPath[3], true)) {
            ip = InternalClipper.getIntersectPt(p, p2, rectPath[2], rectPath[3]).ip;
            loc = Location.bottom;
          } else {
            return { success: false, loc, ip };
          }
          break;
        case Location.right:
          if (InternalClipper.segsIntersect(p, p2, rectPath[1], rectPath[2], true)) {
            ip = InternalClipper.getIntersectPt(p, p2, rectPath[1], rectPath[2]).ip;
          } else if (p.y < rectPath[0].y && InternalClipper.segsIntersect(p, p2, rectPath[0], rectPath[1], true)) {
            ip = InternalClipper.getIntersectPt(p, p2, rectPath[0], rectPath[1]).ip;
            loc = Location.top;
          } else if (InternalClipper.segsIntersect(p, p2, rectPath[2], rectPath[3], true)) {
            ip = InternalClipper.getIntersectPt(p, p2, rectPath[2], rectPath[3]).ip;
            loc = Location.bottom;
          } else {
            return { success: false, loc, ip };
          }
          break;
        case Location.top:
          if (InternalClipper.segsIntersect(p, p2, rectPath[0], rectPath[1], true)) {
            ip = InternalClipper.getIntersectPt(p, p2, rectPath[0], rectPath[1]).ip;
          } else if (p.x < rectPath[0].x && InternalClipper.segsIntersect(p, p2, rectPath[0], rectPath[3], true)) {
            ip = InternalClipper.getIntersectPt(p, p2, rectPath[0], rectPath[3]).ip;
            loc = Location.left;
          } else if (p.x > rectPath[1].x && InternalClipper.segsIntersect(p, p2, rectPath[1], rectPath[2], true)) {
            ip = InternalClipper.getIntersectPt(p, p2, rectPath[1], rectPath[2]).ip;
            loc = Location.right;
          } else {
            return { success: false, loc, ip };
          }
          break;
        case Location.bottom:
          if (InternalClipper.segsIntersect(p, p2, rectPath[2], rectPath[3], true)) {
            ip = InternalClipper.getIntersectPt(p, p2, rectPath[2], rectPath[3]).ip;
          } else if (p.x < rectPath[3].x && InternalClipper.segsIntersect(p, p2, rectPath[0], rectPath[3], true)) {
            ip = InternalClipper.getIntersectPt(p, p2, rectPath[0], rectPath[3]).ip;
            loc = Location.left;
          } else if (p.x > rectPath[2].x && InternalClipper.segsIntersect(p, p2, rectPath[1], rectPath[2], true)) {
            ip = InternalClipper.getIntersectPt(p, p2, rectPath[1], rectPath[2]).ip;
            loc = Location.right;
          } else {
            return { success: false, loc, ip };
          }
          break;
        case Location.inside:
          if (InternalClipper.segsIntersect(p, p2, rectPath[0], rectPath[3], true)) {
            ip = InternalClipper.getIntersectPt(p, p2, rectPath[0], rectPath[3]).ip;
            loc = Location.left;
          } else if (InternalClipper.segsIntersect(p, p2, rectPath[0], rectPath[1], true)) {
            ip = InternalClipper.getIntersectPt(p, p2, rectPath[0], rectPath[1]).ip;
            loc = Location.top;
          } else if (InternalClipper.segsIntersect(p, p2, rectPath[1], rectPath[2], true)) {
            ip = InternalClipper.getIntersectPt(p, p2, rectPath[1], rectPath[2]).ip;
            loc = Location.right;
          } else if (InternalClipper.segsIntersect(p, p2, rectPath[2], rectPath[3], true)) {
            ip = InternalClipper.getIntersectPt(p, p2, rectPath[2], rectPath[3]).ip;
            loc = Location.bottom;
          } else {
            return { success: false, loc, ip };
          }
          break;
      }
      return { success: true, loc, ip };
    }
    getNextLocation(path, context) {
      switch (context.loc) {
        case Location.left:
          while (context.i <= context.highI && path[context.i].x <= this.rect.left)
            context.i++;
          if (context.i > context.highI)
            break;
          if (path[context.i].x >= this.rect.right)
            context.loc = Location.right;
          else if (path[context.i].y <= this.rect.top)
            context.loc = Location.top;
          else if (path[context.i].y >= this.rect.bottom)
            context.loc = Location.bottom;
          else
            context.loc = Location.inside;
          break;
        case Location.top:
          while (context.i <= context.highI && path[context.i].y <= this.rect.top)
            context.i++;
          if (context.i > context.highI)
            break;
          if (path[context.i].y >= this.rect.bottom)
            context.loc = Location.bottom;
          else if (path[context.i].x <= this.rect.left)
            context.loc = Location.left;
          else if (path[context.i].x >= this.rect.right)
            context.loc = Location.right;
          else
            context.loc = Location.inside;
          break;
        case Location.right:
          while (context.i <= context.highI && path[context.i].x >= this.rect.right)
            context.i++;
          if (context.i > context.highI)
            break;
          if (path[context.i].x <= this.rect.left)
            context.loc = Location.left;
          else if (path[context.i].y <= this.rect.top)
            context.loc = Location.top;
          else if (path[context.i].y >= this.rect.bottom)
            context.loc = Location.bottom;
          else
            context.loc = Location.inside;
          break;
        case Location.bottom:
          while (context.i <= context.highI && path[context.i].y >= this.rect.bottom)
            context.i++;
          if (context.i > context.highI)
            break;
          if (path[context.i].y <= this.rect.top)
            context.loc = Location.top;
          else if (path[context.i].x <= this.rect.left)
            context.loc = Location.left;
          else if (path[context.i].x >= this.rect.right)
            context.loc = Location.right;
          else
            context.loc = Location.inside;
          break;
        case Location.inside:
          while (context.i <= context.highI) {
            if (path[context.i].x < this.rect.left)
              context.loc = Location.left;
            else if (path[context.i].x > this.rect.right)
              context.loc = Location.right;
            else if (path[context.i].y > this.rect.bottom)
              context.loc = Location.bottom;
            else if (path[context.i].y < this.rect.top)
              context.loc = Location.top;
            else {
              this.add(path[context.i]);
              context.i++;
              continue;
            }
            break;
          }
          break;
      }
    }
    executeInternal(path) {
      if (path.length < 3 || this.rect.isEmpty())
        return;
      const startLocs = [];
      let firstCross = Location.inside;
      let crossingLoc = firstCross, prev = firstCross;
      let i;
      const highI = path.length - 1;
      let result = RectClip64.getLocation(this.rect, path[highI]);
      let loc = result.loc;
      if (!result.success) {
        i = highI - 1;
        while (i >= 0 && !result.success) {
          i--;
          result = RectClip64.getLocation(this.rect, path[i]);
          prev = result.loc;
        }
        if (i < 0) {
          for (const pt of path) {
            this.add(pt);
          }
          return;
        }
        if (prev == Location.inside)
          loc = Location.inside;
      }
      const startingLoc = loc;
      i = 0;
      while (i <= highI) {
        prev = loc;
        const prevCrossLoc = crossingLoc;
        this.getNextLocation(path, { loc, i, highI });
        if (i > highI)
          break;
        const prevPt = i == 0 ? path[highI] : path[i - 1];
        crossingLoc = loc;
        let result2 = RectClip64.getIntersection(this.rectPath, path[i], prevPt, crossingLoc);
        const ip = result2.ip;
        if (!result2.success) {
          if (prevCrossLoc == Location.inside) {
            const isClockw = RectClip64.isClockwise(prev, loc, prevPt, path[i], this.mp);
            do {
              startLocs.push(prev);
              prev = RectClip64.getAdjacentLocation(prev, isClockw);
            } while (prev != loc);
            crossingLoc = prevCrossLoc;
          } else if (prev != Location.inside && prev != loc) {
            const isClockw = RectClip64.isClockwise(prev, loc, prevPt, path[i], this.mp);
            do {
              this.addCornerByRef(prev, isClockw);
            } while (prev != loc);
          }
          ++i;
          continue;
        }
        if (loc == Location.inside) {
          if (firstCross == Location.inside) {
            firstCross = crossingLoc;
            startLocs.push(prev);
          } else if (prev != crossingLoc) {
            const isClockw = RectClip64.isClockwise(prev, crossingLoc, prevPt, path[i], this.mp);
            do {
              this.addCornerByRef(prev, isClockw);
            } while (prev != crossingLoc);
          }
        } else if (prev != Location.inside) {
          loc = prev;
          result2 = RectClip64.getIntersection(this.rectPath, prevPt, path[i], loc);
          const ip2 = result2.ip;
          if (prevCrossLoc != Location.inside && prevCrossLoc != loc)
            this.addCorner(prevCrossLoc, loc);
          if (firstCross == Location.inside) {
            firstCross = loc;
            startLocs.push(prev);
          }
          loc = crossingLoc;
          this.add(ip2);
          if (ip == ip2) {
            loc = RectClip64.getLocation(this.rect, path[i]).loc;
            this.addCorner(crossingLoc, loc);
            crossingLoc = loc;
            continue;
          }
        } else {
          loc = crossingLoc;
          if (firstCross == Location.inside)
            firstCross = crossingLoc;
        }
        this.add(ip);
      }
      if (firstCross == Location.inside) {
        if (startingLoc != Location.inside) {
          if (this.pathBounds.containsRect(this.rect) && RectClip64.path1ContainsPath2(path, this.rectPath)) {
            for (let j = 0; j < 4; j++) {
              this.add(this.rectPath[j]);
              RectClip64.addToEdge(this.edges[j * 2], this.results[0]);
            }
          }
        }
      } else if (loc != Location.inside && (loc != firstCross || startLocs.length > 2)) {
        if (startLocs.length > 0) {
          prev = loc;
          for (const loc2 of startLocs) {
            if (prev == loc2)
              continue;
            this.addCornerByRef(prev, RectClip64.headingClockwise(prev, loc2));
            prev = loc2;
          }
          loc = prev;
        }
        if (loc != firstCross)
          this.addCornerByRef(loc, RectClip64.headingClockwise(loc, firstCross));
      }
    }
    execute(paths) {
      const result = [];
      if (this.rect.isEmpty())
        return result;
      for (const path of paths) {
        if (path.length < 3)
          continue;
        this.pathBounds = Clipper.getBounds(path);
        if (!this.rect.intersects(this.pathBounds))
          continue;
        else if (this.rect.containsRect(this.pathBounds)) {
          result.push(path);
          continue;
        }
        this.executeInternal(path);
        this.checkEdges();
        for (let i = 0; i < 4; ++i)
          this.tidyEdgePair(i, this.edges[i * 2], this.edges[i * 2 + 1]);
        for (const op of this.results) {
          const tmp2 = this.getPath(op);
          if (tmp2.length > 0)
            result.push(tmp2);
        }
        this.results.length = 0;
        for (let i = 0; i < 8; i++)
          this.edges[i].length = 0;
      }
      return result;
    }
    checkEdges() {
      for (let i = 0; i < this.results.length; i++) {
        let op = this.results[i];
        let op2 = op;
        if (op === void 0)
          continue;
        do {
          if (InternalClipper.crossProduct(op2.prev.pt, op2.pt, op2.next.pt) === 0) {
            if (op2 === op) {
              op2 = RectClip64.unlinkOpBack(op2);
              if (op2 === void 0)
                break;
              op = op2.prev;
            } else {
              op2 = RectClip64.unlinkOpBack(op2);
              if (op2 === void 0)
                break;
            }
          } else {
            op2 = op2.next;
          }
        } while (op2 !== op);
        if (op2 === void 0) {
          this.results[i] = void 0;
          continue;
        }
        this.results[i] = op2;
        let edgeSet1 = RectClip64.getEdgesForPt(op.prev.pt, this.rect);
        op2 = op;
        do {
          const edgeSet2 = RectClip64.getEdgesForPt(op2.pt, this.rect);
          if (edgeSet2 !== 0 && op2.edge === void 0) {
            const combinedSet = edgeSet1 & edgeSet2;
            for (let j = 0; j < 4; ++j) {
              if ((combinedSet & 1 << j) !== 0) {
                if (RectClip64.isHeadingClockwise(op2.prev.pt, op2.pt, j))
                  RectClip64.addToEdge(this.edges[j * 2], op2);
                else
                  RectClip64.addToEdge(this.edges[j * 2 + 1], op2);
              }
            }
          }
          edgeSet1 = edgeSet2;
          op2 = op2.next;
        } while (op2 !== op);
      }
    }
    tidyEdgePair(idx, cw, ccw) {
      if (ccw.length === 0)
        return;
      const isHorz = idx === 1 || idx === 3;
      const cwIsTowardLarger = idx === 1 || idx === 2;
      let i = 0, j = 0;
      let p1, p2, p1a, p2a, op, op2;
      while (i < cw.length) {
        p1 = cw[i];
        if (!p1 || p1.next === p1.prev) {
          cw[i++] = void 0;
          j = 0;
          continue;
        }
        const jLim = ccw.length;
        while (j < jLim && (!ccw[j] || ccw[j].next === ccw[j].prev))
          ++j;
        if (j === jLim) {
          ++i;
          j = 0;
          continue;
        }
        if (cwIsTowardLarger) {
          p1 = cw[i].prev;
          p1a = cw[i];
          p2 = ccw[j];
          p2a = ccw[j].prev;
        } else {
          p1 = cw[i];
          p1a = cw[i].prev;
          p2 = ccw[j].prev;
          p2a = ccw[j];
        }
        if (isHorz && !RectClip64.hasHorzOverlap(p1.pt, p1a.pt, p2.pt, p2a.pt) || !isHorz && !RectClip64.hasVertOverlap(p1.pt, p1a.pt, p2.pt, p2a.pt)) {
          ++j;
          continue;
        }
        const isRejoining = cw[i].ownerIdx !== ccw[j].ownerIdx;
        if (isRejoining) {
          this.results[p2.ownerIdx] = void 0;
          RectClip64.setNewOwner(p2, p1.ownerIdx);
        }
        if (cwIsTowardLarger) {
          p1.next = p2;
          p2.prev = p1;
          p1a.prev = p2a;
          p2a.next = p1a;
        } else {
          p1.prev = p2;
          p2.next = p1;
          p1a.next = p2a;
          p2a.prev = p1a;
        }
        if (!isRejoining) {
          const new_idx = this.results.length;
          this.results.push(p1a);
          RectClip64.setNewOwner(p1a, new_idx);
        }
        if (cwIsTowardLarger) {
          op = p2;
          op2 = p1a;
        } else {
          op = p1;
          op2 = p2a;
        }
        this.results[op.ownerIdx] = op;
        this.results[op2.ownerIdx] = op2;
        let opIsLarger, op2IsLarger;
        if (isHorz) {
          opIsLarger = op.pt.x > op.prev.pt.x;
          op2IsLarger = op2.pt.x > op2.prev.pt.x;
        } else {
          opIsLarger = op.pt.y > op.prev.pt.y;
          op2IsLarger = op2.pt.y > op2.prev.pt.y;
        }
        if (op.next === op.prev || op.pt === op.prev.pt) {
          if (op2IsLarger === cwIsTowardLarger) {
            cw[i] = op2;
            ccw[j++] = void 0;
          } else {
            ccw[j] = op2;
            cw[i++] = void 0;
          }
        } else if (op2.next === op2.prev || op2.pt === op2.prev.pt) {
          if (opIsLarger === cwIsTowardLarger) {
            cw[i] = op;
            ccw[j++] = void 0;
          } else {
            ccw[j] = op;
            cw[i++] = void 0;
          }
        } else if (opIsLarger === op2IsLarger) {
          if (opIsLarger === cwIsTowardLarger) {
            cw[i] = op;
            RectClip64.uncoupleEdge(op2);
            RectClip64.addToEdge(cw, op2);
            ccw[j++] = void 0;
          } else {
            cw[i++] = void 0;
            ccw[j] = op2;
            RectClip64.uncoupleEdge(op);
            RectClip64.addToEdge(ccw, op);
            j = 0;
          }
        } else {
          if (opIsLarger === cwIsTowardLarger)
            cw[i] = op;
          else
            ccw[j] = op;
          if (op2IsLarger === cwIsTowardLarger)
            cw[i] = op2;
          else
            ccw[j] = op2;
        }
      }
    }
    getPath(op) {
      const result = new Path64();
      if (!op || op.prev === op.next)
        return result;
      let op2 = op.next;
      while (op2 && op2 !== op) {
        if (InternalClipper.crossProduct(op2.prev.pt, op2.pt, op2.next.pt) === 0) {
          op = op2.prev;
          op2 = RectClip64.unlinkOp(op2);
        } else {
          op2 = op2.next;
        }
      }
      if (!op2)
        return new Path64();
      result.push(op.pt);
      op2 = op.next;
      while (op2 !== op) {
        result.push(op2.pt);
        op2 = op2.next;
      }
      return result;
    }
  }
  class RectClipLines64 extends RectClip64 {
    constructor(rect) {
      super(rect);
    }
    execute(paths) {
      const result = new Paths64();
      if (this.rect.isEmpty())
        return result;
      for (const path of paths) {
        if (path.length < 2)
          continue;
        this.pathBounds = Clipper.getBounds(path);
        if (!this.rect.intersects(this.pathBounds))
          continue;
        this.executeInternal(path);
        for (const op of this.results) {
          const tmp2 = this.getPath(op);
          if (tmp2.length > 0)
            result.push(tmp2);
        }
        this.results.length = 0;
        for (let i = 0; i < 8; i++) {
          this.edges[i].length = 0;
        }
      }
      return result;
    }
    getPath(op) {
      const result = new Path64();
      if (!op || op === op.next)
        return result;
      op = op.next;
      result.push(op.pt);
      let op2 = op.next;
      while (op2 !== op) {
        result.push(op2.pt);
        op2 = op2.next;
      }
      return result;
    }
    executeInternal(path) {
      this.results = [];
      if (path.length < 2 || this.rect.isEmpty())
        return;
      let prev = Location.inside;
      let i = 1;
      const highI = path.length - 1;
      let result = RectClipLines64.getLocation(this.rect, path[0]);
      let loc = result.loc;
      if (!result.success) {
        while (i <= highI && !result.success) {
          i++;
          result = RectClipLines64.getLocation(this.rect, path[i]);
          prev = result.loc;
        }
        if (i > highI) {
          for (const pt of path)
            this.add(pt);
        }
        if (prev == Location.inside)
          loc = Location.inside;
        i = 1;
      }
      if (loc == Location.inside)
        this.add(path[0]);
      while (i <= highI) {
        prev = loc;
        this.getNextLocation(path, { loc, i, highI });
        if (i > highI)
          break;
        const prevPt = path[i - 1];
        let crossingLoc = loc;
        let result2 = RectClipLines64.getIntersection(this.rectPath, path[i], prevPt, crossingLoc);
        const ip = result2.ip;
        crossingLoc = result2.loc;
        if (!result2.success) {
          i++;
          continue;
        }
        if (loc == Location.inside) {
          this.add(ip, true);
        } else if (prev !== Location.inside) {
          crossingLoc = prev;
          result2 = RectClipLines64.getIntersection(this.rectPath, prevPt, path[i], crossingLoc);
          const ip2 = result2.ip;
          crossingLoc = result2.loc;
          this.add(ip2);
          this.add(ip);
        } else {
          this.add(ip);
        }
      }
    }
  }
  class Clipper {
    static get InvalidRect64() {
      if (!Clipper.invalidRect64)
        Clipper.invalidRect64 = new Rect64(false);
      return this.invalidRect64;
    }
    static Intersect(subject, clip, fillRule) {
      return this.BooleanOp(ClipType.Intersection, subject, clip, fillRule);
    }
    static Union(subject, clip, fillRule = FillRule.EvenOdd) {
      return this.BooleanOp(ClipType.Union, subject, clip, fillRule);
    }
    static Difference(subject, clip, fillRule) {
      return this.BooleanOp(ClipType.Difference, subject, clip, fillRule);
    }
    static Xor(subject, clip, fillRule) {
      return this.BooleanOp(ClipType.Xor, subject, clip, fillRule);
    }
    static BooleanOp(clipType, subject, clip, fillRule = FillRule.EvenOdd) {
      const solution = new Paths64();
      if (!subject)
        return solution;
      const c = new Clipper64();
      c.addPaths(subject, PathType.Subject);
      if (clip)
        c.addPaths(clip, PathType.Clip);
      c.execute(clipType, fillRule, solution);
      return solution;
    }
    //public static BooleanOp(clipType: ClipType, subject: Paths64, clip: Paths64, polytree: PolyTree64, fillRule: FillRule): void {
    //  if (!subject) return;
    //  const c: Clipper64 = new Clipper64();
    //  c.addPaths(subject, PathType.Subject);
    //  if (clip)
    //    c.addPaths(clip, PathType.Clip);
    //  c.execute(clipType, fillRule, polytree);
    //}
    static InflatePaths(paths, delta, joinType, endType, miterLimit = 2) {
      const co = new ClipperOffset(miterLimit);
      co.addPaths(paths, joinType, endType);
      const solution = new Paths64();
      co.execute(delta, solution);
      return solution;
    }
    static RectClipPaths(rect, paths) {
      if (rect.isEmpty() || paths.length === 0)
        return new Paths64();
      const rc = new RectClip64(rect);
      return rc.execute(paths);
    }
    static RectClip(rect, path) {
      if (rect.isEmpty() || path.length === 0)
        return new Paths64();
      const tmp2 = new Paths64();
      tmp2.push(path);
      return this.RectClipPaths(rect, tmp2);
    }
    static RectClipLinesPaths(rect, paths) {
      if (rect.isEmpty() || paths.length === 0)
        return new Paths64();
      const rc = new RectClipLines64(rect);
      return rc.execute(paths);
    }
    static RectClipLines(rect, path) {
      if (rect.isEmpty() || path.length === 0)
        return new Paths64();
      const tmp2 = new Paths64();
      tmp2.push(path);
      return this.RectClipLinesPaths(rect, tmp2);
    }
    static MinkowskiSum(pattern, path, isClosed) {
      return Minkowski.sum(pattern, path, isClosed);
    }
    static MinkowskiDiff(pattern, path, isClosed) {
      return Minkowski.diff(pattern, path, isClosed);
    }
    static area(path) {
      let a = 0;
      const cnt = path.length;
      if (cnt < 3)
        return 0;
      let prevPt = path[cnt - 1];
      for (const pt of path) {
        a += (prevPt.y + pt.y) * (prevPt.x - pt.x);
        prevPt = pt;
      }
      return a * 0.5;
    }
    static areaPaths(paths) {
      let a = 0;
      for (const path of paths)
        a += this.area(path);
      return a;
    }
    static isPositive(poly) {
      return this.area(poly) >= 0;
    }
    static path64ToString(path) {
      let result = "";
      for (const pt of path)
        result += pt.toString();
      return result + "\n";
    }
    static paths64ToString(paths) {
      let result = "";
      for (const path of paths)
        result += this.path64ToString(path);
      return result;
    }
    static offsetPath(path, dx, dy) {
      const result = new Path64();
      for (const pt of path)
        result.push(new Point64(pt.x + dx, pt.y + dy));
      return result;
    }
    static scalePoint64(pt, scale) {
      const result = new Point64(Math.round(pt.x * scale), Math.round(pt.y * scale));
      return result;
    }
    static scalePath(path, scale) {
      if (InternalClipper.isAlmostZero(scale - 1))
        return path;
      const result = [];
      for (const pt of path)
        result.push({ x: pt.x * scale, y: pt.y * scale });
      return result;
    }
    static scalePaths(paths, scale) {
      if (InternalClipper.isAlmostZero(scale - 1))
        return paths;
      const result = [];
      for (const path of paths)
        result.push(this.scalePath(path, scale));
      return result;
    }
    static translatePath(path, dx, dy) {
      const result = [];
      for (const pt of path) {
        result.push({ x: pt.x + dx, y: pt.y + dy });
      }
      return result;
    }
    static translatePaths(paths, dx, dy) {
      const result = [];
      for (const path of paths) {
        result.push(this.translatePath(path, dx, dy));
      }
      return result;
    }
    static reversePath(path) {
      return [...path].reverse();
    }
    static reversePaths(paths) {
      const result = [];
      for (const t of paths) {
        result.push(this.reversePath(t));
      }
      return result;
    }
    static getBounds(path) {
      const result = Clipper.InvalidRect64;
      for (const pt of path) {
        if (pt.x < result.left)
          result.left = pt.x;
        if (pt.x > result.right)
          result.right = pt.x;
        if (pt.y < result.top)
          result.top = pt.y;
        if (pt.y > result.bottom)
          result.bottom = pt.y;
      }
      return result.left === Number.MAX_SAFE_INTEGER ? new Rect64(0, 0, 0, 0) : result;
    }
    static getBoundsPaths(paths) {
      const result = Clipper.InvalidRect64;
      for (const path of paths) {
        for (const pt of path) {
          if (pt.x < result.left)
            result.left = pt.x;
          if (pt.x > result.right)
            result.right = pt.x;
          if (pt.y < result.top)
            result.top = pt.y;
          if (pt.y > result.bottom)
            result.bottom = pt.y;
        }
      }
      return result.left === Number.MAX_SAFE_INTEGER ? new Rect64(0, 0, 0, 0) : result;
    }
    static makePath(arr) {
      const len = arr.length / 2;
      const p = new Path64();
      for (let i = 0; i < len; i++)
        p.push(new Point64(arr[i * 2], arr[i * 2 + 1]));
      return p;
    }
    static stripDuplicates(path, isClosedPath) {
      const cnt = path.length;
      const result = new Path64();
      if (cnt === 0)
        return result;
      let lastPt = path[0];
      result.push(lastPt);
      for (let i = 1; i < cnt; i++)
        if (lastPt !== path[i]) {
          lastPt = path[i];
          result.push(lastPt);
        }
      if (isClosedPath && lastPt === result[0])
        result.pop();
      return result;
    }
    static addPolyNodeToPaths(polyPath, paths) {
      if (polyPath.polygon && polyPath.polygon.length > 0)
        paths.push(polyPath.polygon);
      for (let i = 0; i < polyPath.count; i++)
        this.addPolyNodeToPaths(polyPath.children[i], paths);
    }
    static polyTreeToPaths64(polyTree) {
      const result = new Paths64();
      for (let i = 0; i < polyTree.count; i++) {
        Clipper.addPolyNodeToPaths(polyTree.children[i], result);
      }
      return result;
    }
    static perpendicDistFromLineSqrd(pt, line1, line2) {
      const a = pt.x - line1.x;
      const b = pt.y - line1.y;
      const c = line2.x - line1.x;
      const d = line2.y - line1.y;
      if (c === 0 && d === 0)
        return 0;
      return Clipper.sqr(a * d - c * b) / (c * c + d * d);
    }
    static rdp(path, begin, end, epsSqrd, flags) {
      let idx = 0;
      let max_d = 0;
      while (end > begin && path[begin] === path[end]) {
        flags[end--] = false;
      }
      for (let i = begin + 1; i < end; i++) {
        const d = Clipper.perpendicDistFromLineSqrd(path[i], path[begin], path[end]);
        if (d <= max_d)
          continue;
        max_d = d;
        idx = i;
      }
      if (max_d <= epsSqrd)
        return;
      flags[idx] = true;
      if (idx > begin + 1)
        Clipper.rdp(path, begin, idx, epsSqrd, flags);
      if (idx < end - 1)
        Clipper.rdp(path, idx, end, epsSqrd, flags);
    }
    static ramerDouglasPeucker(path, epsilon) {
      const len = path.length;
      if (len < 5)
        return path;
      const flags = new Array(len).fill(false);
      flags[0] = true;
      flags[len - 1] = true;
      Clipper.rdp(path, 0, len - 1, Clipper.sqr(epsilon), flags);
      const result = [];
      for (let i = 0; i < len; i++) {
        if (flags[i])
          result.push(path[i]);
      }
      return result;
    }
    static ramerDouglasPeuckerPaths(paths, epsilon) {
      const result = [];
      for (const path of paths) {
        result.push(Clipper.ramerDouglasPeucker(path, epsilon));
      }
      return result;
    }
    static getNext(current, high, flags) {
      current++;
      while (current <= high && flags[current])
        current++;
      if (current <= high)
        return current;
      current = 0;
      while (flags[current])
        current++;
      return current;
    }
    static getPrior(current, high, flags) {
      if (current === 0)
        current = high;
      else
        current--;
      while (current > 0 && flags[current])
        current--;
      if (!flags[current])
        return current;
      current = high;
      while (flags[current])
        current--;
      return current;
    }
    static sqr(value) {
      return value * value;
    }
    static simplifyPath(path, epsilon, isClosedPath = false) {
      const len = path.length;
      const high = len - 1;
      const epsSqr = this.sqr(epsilon);
      if (len < 4)
        return path;
      const flags = new Array(len).fill(false);
      const dsq = new Array(len).fill(0);
      let prev = high;
      let curr = 0;
      let start, next, prior2, next2;
      if (isClosedPath) {
        dsq[0] = this.perpendicDistFromLineSqrd(path[0], path[high], path[1]);
        dsq[high] = this.perpendicDistFromLineSqrd(path[high], path[0], path[high - 1]);
      } else {
        dsq[0] = Number.MAX_VALUE;
        dsq[high] = Number.MAX_VALUE;
      }
      for (let i = 1; i < high; i++) {
        dsq[i] = this.perpendicDistFromLineSqrd(path[i], path[i - 1], path[i + 1]);
      }
      for (; ; ) {
        if (dsq[curr] > epsSqr) {
          start = curr;
          do {
            curr = this.getNext(curr, high, flags);
          } while (curr !== start && dsq[curr] > epsSqr);
          if (curr === start)
            break;
        }
        prev = this.getPrior(curr, high, flags);
        next = this.getNext(curr, high, flags);
        if (next === prev)
          break;
        if (dsq[next] < dsq[curr]) {
          flags[next] = true;
          next = this.getNext(next, high, flags);
          next2 = this.getNext(next, high, flags);
          dsq[curr] = this.perpendicDistFromLineSqrd(path[curr], path[prev], path[next]);
          if (next !== high || isClosedPath) {
            dsq[next] = this.perpendicDistFromLineSqrd(path[next], path[curr], path[next2]);
          }
          curr = next;
        } else {
          flags[curr] = true;
          curr = next;
          next = this.getNext(next, high, flags);
          prior2 = this.getPrior(prev, high, flags);
          dsq[curr] = this.perpendicDistFromLineSqrd(path[curr], path[prev], path[next]);
          if (prev !== 0 || isClosedPath) {
            dsq[prev] = this.perpendicDistFromLineSqrd(path[prev], path[prior2], path[curr]);
          }
        }
      }
      const result = [];
      for (let i = 0; i < len; i++) {
        if (!flags[i])
          result.push(path[i]);
      }
      return result;
    }
    static simplifyPaths(paths, epsilon, isClosedPaths = false) {
      const result = [];
      for (const path of paths) {
        result.push(this.simplifyPath(path, epsilon, isClosedPaths));
      }
      return result;
    }
    //private static getNext(current: number, high: number, flags: boolean[]): number {
    //  current++;
    //  while (current <= high && flags[current]) current++;
    //  return current;
    //}
    //private static getPrior(current: number, high: number, flags: boolean[]): number {
    //  if (current === 0) return high;
    //  current--;
    //  while (current > 0 && flags[current]) current--;
    //  return current;
    //}
    static trimCollinear(path, isOpen = false) {
      let len = path.length;
      let i = 0;
      if (!isOpen) {
        while (i < len - 1 && InternalClipper.crossProduct(path[len - 1], path[i], path[i + 1]) === 0)
          i++;
        while (i < len - 1 && InternalClipper.crossProduct(path[len - 2], path[len - 1], path[i]) === 0)
          len--;
      }
      if (len - i < 3) {
        if (!isOpen || len < 2 || path[0] === path[1]) {
          return [];
        }
        return path;
      }
      const result = [];
      let last = path[i];
      result.push(last);
      for (i++; i < len - 1; i++) {
        if (InternalClipper.crossProduct(last, path[i], path[i + 1]) === 0)
          continue;
        last = path[i];
        result.push(last);
      }
      if (isOpen) {
        result.push(path[len - 1]);
      } else if (InternalClipper.crossProduct(last, path[len - 1], result[0]) !== 0) {
        result.push(path[len - 1]);
      } else {
        while (result.length > 2 && InternalClipper.crossProduct(result[result.length - 1], result[result.length - 2], result[0]) === 0) {
          result.pop();
        }
        if (result.length < 3)
          result.splice(0, result.length);
      }
      return result;
    }
    static pointInPolygon(pt, polygon) {
      return InternalClipper.pointInPolygon(pt, polygon);
    }
    static ellipse(center, radiusX, radiusY = 0, steps = 0) {
      if (radiusX <= 0)
        return [];
      if (radiusY <= 0)
        radiusY = radiusX;
      if (steps <= 2)
        steps = Math.ceil(Math.PI * Math.sqrt((radiusX + radiusY) / 2));
      const si = Math.sin(2 * Math.PI / steps);
      const co = Math.cos(2 * Math.PI / steps);
      let dx = co, dy = si;
      const result = [{ x: center.x + radiusX, y: center.y }];
      for (let i = 1; i < steps; ++i) {
        result.push({ x: center.x + radiusX * dx, y: center.y + radiusY * dy });
        const x = dx * co - dy * si;
        dy = dy * co + dx * si;
        dx = x;
      }
      return result;
    }
    static showPolyPathStructure(pp, level) {
      const spaces = " ".repeat(level * 2);
      const caption = pp.isHole ? "Hole " : "Outer ";
      if (pp.count === 0) {
        console.log(spaces + caption);
      } else {
        console.log(spaces + caption + `(${pp.count})`);
        pp.forEach((child) => this.showPolyPathStructure(child, level + 1));
      }
    }
    static showPolyTreeStructure(polytree) {
      console.log("Polytree Root");
      polytree.forEach((child) => this.showPolyPathStructure(child, 1));
    }
  }
  var PointInPolygonResult;
  (function(PointInPolygonResult2) {
    PointInPolygonResult2[PointInPolygonResult2["IsOn"] = 0] = "IsOn";
    PointInPolygonResult2[PointInPolygonResult2["IsInside"] = 1] = "IsInside";
    PointInPolygonResult2[PointInPolygonResult2["IsOutside"] = 2] = "IsOutside";
  })(PointInPolygonResult || (PointInPolygonResult = {}));
  var VertexFlags;
  (function(VertexFlags2) {
    VertexFlags2[VertexFlags2["None"] = 0] = "None";
    VertexFlags2[VertexFlags2["OpenStart"] = 1] = "OpenStart";
    VertexFlags2[VertexFlags2["OpenEnd"] = 2] = "OpenEnd";
    VertexFlags2[VertexFlags2["LocalMax"] = 4] = "LocalMax";
    VertexFlags2[VertexFlags2["LocalMin"] = 8] = "LocalMin";
  })(VertexFlags || (VertexFlags = {}));
  class Vertex {
    constructor(pt, flags, prev) {
      this.pt = pt;
      this.flags = flags;
      this.next = void 0;
      this.prev = prev;
    }
  }
  class LocalMinima {
    constructor(vertex, polytype, isOpen = false) {
      this.vertex = vertex;
      this.polytype = polytype;
      this.isOpen = isOpen;
    }
    static equals(lm1, lm2) {
      return lm1.vertex === lm2.vertex;
    }
    static notEquals(lm1, lm2) {
      return lm1.vertex !== lm2.vertex;
    }
  }
  class IntersectNode {
    constructor(pt, edge1, edge2) {
      this.pt = pt;
      this.edge1 = edge1;
      this.edge2 = edge2;
    }
  }
  class OutPt {
    constructor(pt, outrec) {
      this.pt = pt;
      this.outrec = outrec;
      this.next = this;
      this.prev = this;
      this.horz = void 0;
    }
  }
  var JoinWith;
  (function(JoinWith2) {
    JoinWith2[JoinWith2["None"] = 0] = "None";
    JoinWith2[JoinWith2["Left"] = 1] = "Left";
    JoinWith2[JoinWith2["Right"] = 2] = "Right";
  })(JoinWith || (JoinWith = {}));
  var HorzPosition;
  (function(HorzPosition2) {
    HorzPosition2[HorzPosition2["Bottom"] = 0] = "Bottom";
    HorzPosition2[HorzPosition2["Middle"] = 1] = "Middle";
    HorzPosition2[HorzPosition2["Top"] = 2] = "Top";
  })(HorzPosition || (HorzPosition = {}));
  class OutRec {
    constructor(idx) {
      this.idx = idx;
      this.isOpen = false;
    }
  }
  class HorzSegment {
    constructor(op) {
      this.leftOp = op;
      this.rightOp = void 0;
      this.leftToRight = true;
    }
  }
  class HorzJoin {
    constructor(ltor, rtol) {
      this.op1 = ltor;
      this.op2 = rtol;
    }
  }
  class Active {
    constructor() {
      this.dx = this.windCount = this.windCount2 = 0;
      this.isLeftBound = false;
      this.joinWith = JoinWith.None;
    }
  }
  class ClipperEngine {
    static addLocMin(vert, polytype, isOpen, minimaList) {
      if ((vert.flags & VertexFlags.LocalMin) !== VertexFlags.None)
        return;
      vert.flags |= VertexFlags.LocalMin;
      const lm = new LocalMinima(vert, polytype, isOpen);
      minimaList.push(lm);
    }
    static addPathsToVertexList(paths, polytype, isOpen, minimaList, vertexList) {
      let totalVertCnt = 0;
      for (const path of paths)
        totalVertCnt += path.length;
      for (const path of paths) {
        let v0 = void 0;
        let prev_v = void 0;
        let curr_v = void 0;
        for (const pt of path) {
          if (!v0) {
            v0 = new Vertex(pt, VertexFlags.None, void 0);
            vertexList.push(v0);
            prev_v = v0;
          } else if (prev_v.pt !== pt) {
            curr_v = new Vertex(pt, VertexFlags.None, prev_v);
            vertexList.push(curr_v);
            prev_v.next = curr_v;
            prev_v = curr_v;
          }
        }
        if (!prev_v || !prev_v.prev)
          continue;
        if (!isOpen && prev_v.pt === v0.pt)
          prev_v = prev_v.prev;
        prev_v.next = v0;
        v0.prev = prev_v;
        if (!isOpen && prev_v.next === prev_v)
          continue;
        let going_up = false;
        if (isOpen) {
          curr_v = v0.next;
          let count2 = 0;
          while (curr_v !== v0 && curr_v.pt.y === v0.pt.y) {
            curr_v = curr_v.next;
            if (count2++ > totalVertCnt) {
              console.warn("infinite loop detected");
              break;
            }
          }
          going_up = curr_v.pt.y <= v0.pt.y;
          if (going_up) {
            v0.flags = VertexFlags.OpenStart;
            this.addLocMin(v0, polytype, true, minimaList);
          } else {
            v0.flags = VertexFlags.OpenStart | VertexFlags.LocalMax;
          }
        } else {
          prev_v = v0.prev;
          let count2 = 0;
          while (prev_v !== v0 && prev_v.pt.y === v0.pt.y) {
            prev_v = prev_v.prev;
            if (count2++ > totalVertCnt) {
              console.warn("infinite loop detected");
              break;
            }
          }
          if (prev_v === v0) {
            continue;
          }
          going_up = prev_v.pt.y > v0.pt.y;
        }
        const going_up0 = going_up;
        prev_v = v0;
        curr_v = v0.next;
        let count = 0;
        while (curr_v !== v0) {
          if (curr_v.pt.y > prev_v.pt.y && going_up) {
            prev_v.flags |= VertexFlags.LocalMax;
            going_up = false;
          } else if (curr_v.pt.y < prev_v.pt.y && !going_up) {
            going_up = true;
            this.addLocMin(prev_v, polytype, isOpen, minimaList);
          }
          prev_v = curr_v;
          curr_v = curr_v.next;
          if (count++ > totalVertCnt) {
            console.warn("infinite loop detected");
            break;
          }
        }
        if (isOpen) {
          prev_v.flags |= VertexFlags.OpenEnd;
          if (going_up) {
            prev_v.flags |= VertexFlags.LocalMax;
          } else {
            this.addLocMin(prev_v, polytype, isOpen, minimaList);
          }
        } else if (going_up !== going_up0) {
          if (going_up0) {
            this.addLocMin(prev_v, polytype, false, minimaList);
          } else {
            prev_v.flags |= VertexFlags.LocalMax;
          }
        }
      }
    }
  }
  class SimpleNavigableSet {
    constructor() {
      this.items = [];
      this.items = [];
    }
    clear() {
      this.items.length = 0;
    }
    isEmpty() {
      return this.items.length == 0;
    }
    pollLast() {
      return this.items.pop();
    }
    add(item) {
      if (!this.items.includes(item)) {
        this.items.push(item);
        this.items.sort((a, b) => a - b);
      }
    }
  }
  class ClipperBase {
    constructor() {
      this._cliptype = ClipType.None;
      this._fillrule = FillRule.EvenOdd;
      this._currentLocMin = 0;
      this._currentBotY = 0;
      this._isSortedMinimaList = false;
      this._hasOpenPaths = false;
      this._using_polytree = false;
      this._succeeded = false;
      this.reverseSolution = false;
      this._minimaList = [];
      this._intersectList = [];
      this._vertexList = [];
      this._outrecList = [];
      this._scanlineList = new SimpleNavigableSet();
      this._horzSegList = [];
      this._horzJoinList = [];
      this.preserveCollinear = true;
    }
    static isOdd(val) {
      return (val & 1) !== 0;
    }
    static isHotEdgeActive(ae) {
      return ae.outrec !== void 0;
    }
    static isOpen(ae) {
      return ae.localMin.isOpen;
    }
    static isOpenEndActive(ae) {
      return ae.localMin.isOpen && ClipperBase.isOpenEnd(ae.vertexTop);
    }
    static isOpenEnd(v) {
      return (v.flags & (VertexFlags.OpenStart | VertexFlags.OpenEnd)) !== VertexFlags.None;
    }
    static getPrevHotEdge(ae) {
      let prev = ae.prevInAEL;
      while (prev && (ClipperBase.isOpen(prev) || !ClipperBase.isHotEdgeActive(prev)))
        prev = prev.prevInAEL;
      return prev;
    }
    static isFront(ae) {
      return ae === ae.outrec.frontEdge;
    }
    /*******************************************************************************
    *  Dx:                             0(90deg)                                    *
    *                                  |                                           *
    *               +inf (180deg) <--- o --. -inf (0deg)                          *
    *******************************************************************************/
    static getDx(pt1, pt2) {
      const dy = pt2.y - pt1.y;
      if (dy !== 0)
        return (pt2.x - pt1.x) / dy;
      if (pt2.x > pt1.x)
        return Number.NEGATIVE_INFINITY;
      return Number.POSITIVE_INFINITY;
    }
    static topX(ae, currentY) {
      if (currentY === ae.top.y || ae.top.x === ae.bot.x)
        return ae.top.x;
      if (currentY === ae.bot.y)
        return ae.bot.x;
      return ae.bot.x + Math.round(ae.dx * (currentY - ae.bot.y));
    }
    static isHorizontal(ae) {
      return ae.top.y === ae.bot.y;
    }
    static isHeadingRightHorz(ae) {
      return Number.NEGATIVE_INFINITY === ae.dx;
    }
    static isHeadingLeftHorz(ae) {
      return Number.POSITIVE_INFINITY === ae.dx;
    }
    static swapActives(ae1, ae2) {
    }
    static getPolyType(ae) {
      return ae.localMin.polytype;
    }
    static isSamePolyType(ae1, ae2) {
      return ae1.localMin.polytype === ae2.localMin.polytype;
    }
    static setDx(ae) {
      ae.dx = ClipperBase.getDx(ae.bot, ae.top);
    }
    static nextVertex(ae) {
      if (ae.windDx > 0)
        return ae.vertexTop.next;
      return ae.vertexTop.prev;
    }
    static prevPrevVertex(ae) {
      if (ae.windDx > 0)
        return ae.vertexTop.prev.prev;
      return ae.vertexTop.next.next;
    }
    static isMaxima(vertex) {
      return (vertex.flags & VertexFlags.LocalMax) !== VertexFlags.None;
    }
    static isMaximaActive(ae) {
      return ClipperBase.isMaxima(ae.vertexTop);
    }
    static getMaximaPair(ae) {
      let ae2 = ae.nextInAEL;
      while (ae2) {
        if (ae2.vertexTop === ae.vertexTop)
          return ae2;
        ae2 = ae2.nextInAEL;
      }
      return void 0;
    }
    static getCurrYMaximaVertex_Open(ae) {
      let result = ae.vertexTop;
      if (ae.windDx > 0) {
        while (result.next.pt.y === result.pt.y && (result.flags & (VertexFlags.OpenEnd | VertexFlags.LocalMax)) === VertexFlags.None)
          result = result.next;
      } else {
        while (result.prev.pt.y === result.pt.y && (result.flags & (VertexFlags.OpenEnd | VertexFlags.LocalMax)) === VertexFlags.None)
          result = result.prev;
      }
      if (!ClipperBase.isMaxima(result))
        result = void 0;
      return result;
    }
    static getCurrYMaximaVertex(ae) {
      let result = ae.vertexTop;
      if (ae.windDx > 0) {
        while (result.next.pt.y === result.pt.y)
          result = result.next;
      } else {
        while (result.prev.pt.y === result.pt.y)
          result = result.prev;
      }
      if (!ClipperBase.isMaxima(result))
        result = void 0;
      return result;
    }
    static setSides(outrec, startEdge, endEdge) {
      outrec.frontEdge = startEdge;
      outrec.backEdge = endEdge;
    }
    static swapOutrecs(ae1, ae2) {
      const or1 = ae1.outrec;
      const or2 = ae2.outrec;
      if (or1 === or2) {
        const ae = or1.frontEdge;
        or1.frontEdge = or1.backEdge;
        or1.backEdge = ae;
        return;
      }
      if (or1) {
        if (ae1 === or1.frontEdge)
          or1.frontEdge = ae2;
        else
          or1.backEdge = ae2;
      }
      if (or2) {
        if (ae2 === or2.frontEdge)
          or2.frontEdge = ae1;
        else
          or2.backEdge = ae1;
      }
      ae1.outrec = or2;
      ae2.outrec = or1;
    }
    static setOwner(outrec, newOwner) {
      while (newOwner.owner && !newOwner.owner.pts) {
        newOwner.owner = newOwner.owner.owner;
      }
      let tmp2 = newOwner;
      while (tmp2 && tmp2 !== outrec)
        tmp2 = tmp2.owner;
      if (tmp2)
        newOwner.owner = outrec.owner;
      outrec.owner = newOwner;
    }
    static area(op) {
      let area2 = 0;
      let op2 = op;
      do {
        area2 += (op2.prev.pt.y + op2.pt.y) * (op2.prev.pt.x - op2.pt.x);
        op2 = op2.next;
      } while (op2 !== op);
      return area2 * 0.5;
    }
    static areaTriangle(pt1, pt2, pt3) {
      return (pt3.y + pt1.y) * (pt3.x - pt1.x) + (pt1.y + pt2.y) * (pt1.x - pt2.x) + (pt2.y + pt3.y) * (pt2.x - pt3.x);
    }
    static getRealOutRec(outRec) {
      while (outRec !== void 0 && outRec.pts === void 0) {
        outRec = outRec.owner;
      }
      return outRec;
    }
    static isValidOwner(outRec, testOwner) {
      while (testOwner !== void 0 && testOwner !== outRec)
        testOwner = testOwner.owner;
      return testOwner === void 0;
    }
    static uncoupleOutRec(ae) {
      const outrec = ae.outrec;
      if (outrec === void 0)
        return;
      outrec.frontEdge.outrec = void 0;
      outrec.backEdge.outrec = void 0;
      outrec.frontEdge = void 0;
      outrec.backEdge = void 0;
    }
    static outrecIsAscending(hotEdge) {
      return hotEdge === hotEdge.outrec.frontEdge;
    }
    static swapFrontBackSides(outrec) {
      const ae2 = outrec.frontEdge;
      outrec.frontEdge = outrec.backEdge;
      outrec.backEdge = ae2;
      outrec.pts = outrec.pts.next;
    }
    static edgesAdjacentInAEL(inode) {
      return inode.edge1.nextInAEL === inode.edge2 || inode.edge1.prevInAEL === inode.edge2;
    }
    clearSolutionOnly() {
      while (this._actives)
        this.deleteFromAEL(this._actives);
      this._scanlineList.clear();
      this.disposeIntersectNodes();
      this._outrecList.length = 0;
      this._horzSegList.length = 0;
      this._horzJoinList.length = 0;
    }
    clear() {
      this.clearSolutionOnly();
      this._minimaList.length = 0;
      this._vertexList.length = 0;
      this._currentLocMin = 0;
      this._isSortedMinimaList = false;
      this._hasOpenPaths = false;
    }
    reset() {
      if (!this._isSortedMinimaList) {
        this._minimaList.sort((locMin1, locMin2) => locMin2.vertex.pt.y - locMin1.vertex.pt.y);
        this._isSortedMinimaList = true;
      }
      for (let i = this._minimaList.length - 1; i >= 0; i--) {
        this._scanlineList.add(this._minimaList[i].vertex.pt.y);
      }
      this._currentBotY = 0;
      this._currentLocMin = 0;
      this._actives = void 0;
      this._sel = void 0;
      this._succeeded = true;
    }
    insertScanline(y) {
      this._scanlineList.add(y);
    }
    popScanline() {
      return this._scanlineList.pollLast();
    }
    hasLocMinAtY(y) {
      return this._currentLocMin < this._minimaList.length && this._minimaList[this._currentLocMin].vertex.pt.y == y;
    }
    popLocalMinima() {
      return this._minimaList[this._currentLocMin++];
    }
    addLocMin(vert, polytype, isOpen) {
      if ((vert.flags & VertexFlags.LocalMin) != VertexFlags.None)
        return;
      vert.flags |= VertexFlags.LocalMin;
      const lm = new LocalMinima(vert, polytype, isOpen);
      this._minimaList.push(lm);
    }
    addSubject(path) {
      this.addPath(path, PathType.Subject);
    }
    addOpenSubject(path) {
      this.addPath(path, PathType.Subject, true);
    }
    addClip(path) {
      this.addPath(path, PathType.Clip);
    }
    addPath(path, polytype, isOpen = false) {
      const tmp2 = [path];
      this.addPaths(tmp2, polytype, isOpen);
    }
    addPaths(paths, polytype, isOpen = false) {
      if (isOpen)
        this._hasOpenPaths = true;
      this._isSortedMinimaList = false;
      ClipperEngine.addPathsToVertexList(paths, polytype, isOpen, this._minimaList, this._vertexList);
    }
    addReuseableData(reuseableData) {
      if (reuseableData._minimaList.length === 0)
        return;
      this._isSortedMinimaList = false;
      for (const lm of reuseableData._minimaList) {
        this._minimaList.push(new LocalMinima(lm.vertex, lm.polytype, lm.isOpen));
        if (lm.isOpen)
          this._hasOpenPaths = true;
      }
    }
    isContributingClosed(ae) {
      switch (this._fillrule) {
        case FillRule.Positive:
          if (ae.windCount !== 1)
            return false;
          break;
        case FillRule.Negative:
          if (ae.windCount !== -1)
            return false;
          break;
        case FillRule.NonZero:
          if (Math.abs(ae.windCount) !== 1)
            return false;
          break;
      }
      switch (this._cliptype) {
        case ClipType.Intersection:
          switch (this._fillrule) {
            case FillRule.Positive:
              return ae.windCount2 > 0;
            case FillRule.Negative:
              return ae.windCount2 < 0;
            default:
              return ae.windCount2 !== 0;
          }
        case ClipType.Union:
          switch (this._fillrule) {
            case FillRule.Positive:
              return ae.windCount2 <= 0;
            case FillRule.Negative:
              return ae.windCount2 >= 0;
            default:
              return ae.windCount2 === 0;
          }
        case ClipType.Difference:
          const result = this._fillrule === FillRule.Positive ? ae.windCount2 <= 0 : this._fillrule === FillRule.Negative ? ae.windCount2 >= 0 : ae.windCount2 === 0;
          return ClipperBase.getPolyType(ae) === PathType.Subject ? result : !result;
        case ClipType.Xor:
          return true;
        default:
          return false;
      }
    }
    isContributingOpen(ae) {
      let isInClip, isInSubj;
      switch (this._fillrule) {
        case FillRule.Positive:
          isInSubj = ae.windCount > 0;
          isInClip = ae.windCount2 > 0;
          break;
        case FillRule.Negative:
          isInSubj = ae.windCount < 0;
          isInClip = ae.windCount2 < 0;
          break;
        default:
          isInSubj = ae.windCount !== 0;
          isInClip = ae.windCount2 !== 0;
          break;
      }
      switch (this._cliptype) {
        case ClipType.Intersection:
          return isInClip;
        case ClipType.Union:
          return !isInSubj && !isInClip;
        default:
          return !isInClip;
      }
    }
    setWindCountForClosedPathEdge(ae) {
      let ae2 = ae.prevInAEL;
      const pt = ClipperBase.getPolyType(ae);
      while (ae2 !== void 0 && (ClipperBase.getPolyType(ae2) !== pt || ClipperBase.isOpen(ae2))) {
        ae2 = ae2.prevInAEL;
      }
      if (ae2 === void 0) {
        ae.windCount = ae.windDx;
        ae2 = this._actives;
      } else if (this._fillrule === FillRule.EvenOdd) {
        ae.windCount = ae.windDx;
        ae.windCount2 = ae2.windCount2;
        ae2 = ae2.nextInAEL;
      } else {
        if (ae2.windCount * ae2.windDx < 0) {
          if (Math.abs(ae2.windCount) > 1) {
            if (ae2.windDx * ae.windDx < 0)
              ae.windCount = ae2.windCount;
            else
              ae.windCount = ae2.windCount + ae.windDx;
          } else {
            ae.windCount = ClipperBase.isOpen(ae) ? 1 : ae.windDx;
          }
        } else {
          if (ae2.windDx * ae.windDx < 0)
            ae.windCount = ae2.windCount;
          else
            ae.windCount = ae2.windCount + ae.windDx;
        }
        ae.windCount2 = ae2.windCount2;
        ae2 = ae2.nextInAEL;
      }
      if (this._fillrule === FillRule.EvenOdd) {
        while (ae2 !== ae) {
          if (ClipperBase.getPolyType(ae2) !== pt && !ClipperBase.isOpen(ae2)) {
            ae.windCount2 = ae.windCount2 === 0 ? 1 : 0;
          }
          ae2 = ae2.nextInAEL;
        }
      } else {
        while (ae2 !== ae) {
          if (ClipperBase.getPolyType(ae2) !== pt && !ClipperBase.isOpen(ae2)) {
            ae.windCount2 += ae2.windDx;
          }
          ae2 = ae2.nextInAEL;
        }
      }
    }
    setWindCountForOpenPathEdge(ae) {
      let ae2 = this._actives;
      if (this._fillrule === FillRule.EvenOdd) {
        let cnt1 = 0, cnt2 = 0;
        while (ae2 !== ae) {
          if (ClipperBase.getPolyType(ae2) === PathType.Clip)
            cnt2++;
          else if (!ClipperBase.isOpen(ae2))
            cnt1++;
          ae2 = ae2.nextInAEL;
        }
        ae.windCount = ClipperBase.isOdd(cnt1) ? 1 : 0;
        ae.windCount2 = ClipperBase.isOdd(cnt2) ? 1 : 0;
      } else {
        while (ae2 !== ae) {
          if (ClipperBase.getPolyType(ae2) === PathType.Clip)
            ae.windCount2 += ae2.windDx;
          else if (!ClipperBase.isOpen(ae2))
            ae.windCount += ae2.windDx;
          ae2 = ae2.nextInAEL;
        }
      }
    }
    static isValidAelOrder(resident, newcomer) {
      if (newcomer.curX !== resident.curX)
        return newcomer.curX > resident.curX;
      const d = InternalClipper.crossProduct(resident.top, newcomer.bot, newcomer.top);
      if (d !== 0)
        return d < 0;
      if (!this.isMaximaActive(resident) && resident.top.y > newcomer.top.y) {
        return InternalClipper.crossProduct(newcomer.bot, resident.top, this.nextVertex(resident).pt) <= 0;
      }
      if (!this.isMaximaActive(newcomer) && newcomer.top.y > resident.top.y) {
        return InternalClipper.crossProduct(newcomer.bot, newcomer.top, this.nextVertex(newcomer).pt) >= 0;
      }
      const y = newcomer.bot.y;
      const newcomerIsLeft = newcomer.isLeftBound;
      if (resident.bot.y !== y || resident.localMin.vertex.pt.y !== y)
        return newcomer.isLeftBound;
      if (resident.isLeftBound !== newcomerIsLeft)
        return newcomerIsLeft;
      if (InternalClipper.crossProduct(this.prevPrevVertex(resident).pt, resident.bot, resident.top) === 0)
        return true;
      return InternalClipper.crossProduct(this.prevPrevVertex(resident).pt, newcomer.bot, this.prevPrevVertex(newcomer).pt) > 0 === newcomerIsLeft;
    }
    insertLeftEdge(ae) {
      let ae2;
      if (!this._actives) {
        ae.prevInAEL = void 0;
        ae.nextInAEL = void 0;
        this._actives = ae;
      } else if (!ClipperBase.isValidAelOrder(this._actives, ae)) {
        ae.prevInAEL = void 0;
        ae.nextInAEL = this._actives;
        this._actives.prevInAEL = ae;
        this._actives = ae;
      } else {
        ae2 = this._actives;
        while (ae2.nextInAEL && ClipperBase.isValidAelOrder(ae2.nextInAEL, ae))
          ae2 = ae2.nextInAEL;
        if (ae2.joinWith === JoinWith.Right)
          ae2 = ae2.nextInAEL;
        ae.nextInAEL = ae2.nextInAEL;
        if (ae2.nextInAEL)
          ae2.nextInAEL.prevInAEL = ae;
        ae.prevInAEL = ae2;
        ae2.nextInAEL = ae;
      }
    }
    static insertRightEdge(ae, ae2) {
      ae2.nextInAEL = ae.nextInAEL;
      if (ae.nextInAEL)
        ae.nextInAEL.prevInAEL = ae2;
      ae2.prevInAEL = ae;
      ae.nextInAEL = ae2;
    }
    insertLocalMinimaIntoAEL(botY) {
      let localMinima;
      let leftBound;
      let rightBound;
      while (this.hasLocMinAtY(botY)) {
        localMinima = this.popLocalMinima();
        if ((localMinima.vertex.flags & VertexFlags.OpenStart) !== VertexFlags.None) {
          leftBound = void 0;
        } else {
          leftBound = new Active();
          leftBound.bot = localMinima.vertex.pt;
          leftBound.curX = localMinima.vertex.pt.x;
          leftBound.windDx = -1;
          leftBound.vertexTop = localMinima.vertex.prev;
          leftBound.top = localMinima.vertex.prev.pt;
          leftBound.outrec = void 0;
          leftBound.localMin = localMinima;
          ClipperBase.setDx(leftBound);
        }
        if ((localMinima.vertex.flags & VertexFlags.OpenEnd) !== VertexFlags.None) {
          rightBound = void 0;
        } else {
          rightBound = new Active();
          rightBound.bot = localMinima.vertex.pt;
          rightBound.curX = localMinima.vertex.pt.x;
          rightBound.windDx = 1;
          rightBound.vertexTop = localMinima.vertex.next;
          rightBound.top = localMinima.vertex.next.pt;
          rightBound.outrec = void 0;
          rightBound.localMin = localMinima;
          ClipperBase.setDx(rightBound);
        }
        if (leftBound && rightBound) {
          if (ClipperBase.isHorizontal(leftBound)) {
            if (ClipperBase.isHeadingRightHorz(leftBound)) {
              [rightBound, leftBound] = [leftBound, rightBound];
            }
          } else if (ClipperBase.isHorizontal(rightBound)) {
            if (ClipperBase.isHeadingLeftHorz(rightBound)) {
              [rightBound, leftBound] = [leftBound, rightBound];
            }
          } else if (leftBound.dx < rightBound.dx) {
            [rightBound, leftBound] = [leftBound, rightBound];
          }
        } else if (leftBound === void 0) {
          leftBound = rightBound;
          rightBound = void 0;
        }
        let contributing = false;
        leftBound.isLeftBound = true;
        this.insertLeftEdge(leftBound);
        if (ClipperBase.isOpen(leftBound)) {
          this.setWindCountForOpenPathEdge(leftBound);
          contributing = this.isContributingOpen(leftBound);
        } else {
          this.setWindCountForClosedPathEdge(leftBound);
          contributing = this.isContributingClosed(leftBound);
        }
        if (rightBound) {
          rightBound.windCount = leftBound.windCount;
          rightBound.windCount2 = leftBound.windCount2;
          ClipperBase.insertRightEdge(leftBound, rightBound);
          if (contributing) {
            this.addLocalMinPoly(leftBound, rightBound, leftBound.bot, true);
            if (!ClipperBase.isHorizontal(leftBound)) {
              this.checkJoinLeft(leftBound, leftBound.bot);
            }
          }
          while (rightBound.nextInAEL && ClipperBase.isValidAelOrder(rightBound.nextInAEL, rightBound)) {
            this.intersectEdges(rightBound, rightBound.nextInAEL, rightBound.bot);
            this.swapPositionsInAEL(rightBound, rightBound.nextInAEL);
          }
          if (ClipperBase.isHorizontal(rightBound)) {
            this.pushHorz(rightBound);
          } else {
            this.checkJoinRight(rightBound, rightBound.bot);
            this.insertScanline(rightBound.top.y);
          }
        } else if (contributing) {
          this.startOpenPath(leftBound, leftBound.bot);
        }
        if (ClipperBase.isHorizontal(leftBound)) {
          this.pushHorz(leftBound);
        } else {
          this.insertScanline(leftBound.top.y);
        }
      }
    }
    pushHorz(ae) {
      ae.nextInSEL = this._sel;
      this._sel = ae;
    }
    popHorz() {
      const ae = this._sel;
      if (this._sel === void 0)
        return void 0;
      this._sel = this._sel.nextInSEL;
      return ae;
    }
    addLocalMinPoly(ae1, ae2, pt, isNew = false) {
      const outrec = this.newOutRec();
      ae1.outrec = outrec;
      ae2.outrec = outrec;
      if (ClipperBase.isOpen(ae1)) {
        outrec.owner = void 0;
        outrec.isOpen = true;
        if (ae1.windDx > 0)
          ClipperBase.setSides(outrec, ae1, ae2);
        else
          ClipperBase.setSides(outrec, ae2, ae1);
      } else {
        outrec.isOpen = false;
        const prevHotEdge = ClipperBase.getPrevHotEdge(ae1);
        if (prevHotEdge) {
          if (this._using_polytree)
            ClipperBase.setOwner(outrec, prevHotEdge.outrec);
          outrec.owner = prevHotEdge.outrec;
          if (ClipperBase.outrecIsAscending(prevHotEdge) === isNew)
            ClipperBase.setSides(outrec, ae2, ae1);
          else
            ClipperBase.setSides(outrec, ae1, ae2);
        } else {
          outrec.owner = void 0;
          if (isNew)
            ClipperBase.setSides(outrec, ae1, ae2);
          else
            ClipperBase.setSides(outrec, ae2, ae1);
        }
      }
      const op = new OutPt(pt, outrec);
      outrec.pts = op;
      return op;
    }
    addLocalMaxPoly(ae1, ae2, pt) {
      if (ClipperBase.isJoined(ae1))
        this.split(ae1, pt);
      if (ClipperBase.isJoined(ae2))
        this.split(ae2, pt);
      if (ClipperBase.isFront(ae1) === ClipperBase.isFront(ae2)) {
        if (ClipperBase.isOpenEndActive(ae1))
          ClipperBase.swapFrontBackSides(ae1.outrec);
        else if (ClipperBase.isOpenEndActive(ae2))
          ClipperBase.swapFrontBackSides(ae2.outrec);
        else {
          this._succeeded = false;
          return void 0;
        }
      }
      const result = ClipperBase.addOutPt(ae1, pt);
      if (ae1.outrec === ae2.outrec) {
        const outrec = ae1.outrec;
        outrec.pts = result;
        if (this._using_polytree) {
          const e = ClipperBase.getPrevHotEdge(ae1);
          if (e === void 0)
            outrec.owner = void 0;
          else
            ClipperBase.setOwner(outrec, e.outrec);
        }
        ClipperBase.uncoupleOutRec(ae1);
      } else if (ClipperBase.isOpen(ae1)) {
        if (ae1.windDx < 0)
          ClipperBase.joinOutrecPaths(ae1, ae2);
        else
          ClipperBase.joinOutrecPaths(ae2, ae1);
      } else if (ae1.outrec.idx < ae2.outrec.idx)
        ClipperBase.joinOutrecPaths(ae1, ae2);
      else
        ClipperBase.joinOutrecPaths(ae2, ae1);
      return result;
    }
    static joinOutrecPaths(ae1, ae2) {
      const p1Start = ae1.outrec.pts;
      const p2Start = ae2.outrec.pts;
      const p1End = p1Start.next;
      const p2End = p2Start.next;
      if (ClipperBase.isFront(ae1)) {
        p2End.prev = p1Start;
        p1Start.next = p2End;
        p2Start.next = p1End;
        p1End.prev = p2Start;
        ae1.outrec.pts = p2Start;
        ae1.outrec.frontEdge = ae2.outrec.frontEdge;
        if (ae1.outrec.frontEdge)
          ae1.outrec.frontEdge.outrec = ae1.outrec;
      } else {
        p1End.prev = p2Start;
        p2Start.next = p1End;
        p1Start.next = p2End;
        p2End.prev = p1Start;
        ae1.outrec.backEdge = ae2.outrec.backEdge;
        if (ae1.outrec.backEdge)
          ae1.outrec.backEdge.outrec = ae1.outrec;
      }
      ae2.outrec.frontEdge = void 0;
      ae2.outrec.backEdge = void 0;
      ae2.outrec.pts = void 0;
      ClipperBase.setOwner(ae2.outrec, ae1.outrec);
      if (ClipperBase.isOpenEndActive(ae1)) {
        ae2.outrec.pts = ae1.outrec.pts;
        ae1.outrec.pts = void 0;
      }
      ae1.outrec = void 0;
      ae2.outrec = void 0;
    }
    static addOutPt(ae, pt) {
      const outrec = ae.outrec;
      const toFront = ClipperBase.isFront(ae);
      const opFront = outrec.pts;
      const opBack = opFront.next;
      if (toFront && pt == opFront.pt)
        return opFront;
      else if (!toFront && pt == opBack.pt)
        return opBack;
      const newOp = new OutPt(pt, outrec);
      opBack.prev = newOp;
      newOp.prev = opFront;
      newOp.next = opBack;
      opFront.next = newOp;
      if (toFront)
        outrec.pts = newOp;
      return newOp;
    }
    newOutRec() {
      const result = new OutRec(this._outrecList.length);
      this._outrecList.push(result);
      return result;
    }
    startOpenPath(ae, pt) {
      const outrec = this.newOutRec();
      outrec.isOpen = true;
      if (ae.windDx > 0) {
        outrec.frontEdge = ae;
        outrec.backEdge = void 0;
      } else {
        outrec.frontEdge = void 0;
        outrec.backEdge = ae;
      }
      ae.outrec = outrec;
      const op = new OutPt(pt, outrec);
      outrec.pts = op;
      return op;
    }
    updateEdgeIntoAEL(ae) {
      ae.bot = ae.top;
      ae.vertexTop = ClipperBase.nextVertex(ae);
      ae.top = ae.vertexTop.pt;
      ae.curX = ae.bot.x;
      ClipperBase.setDx(ae);
      if (ClipperBase.isJoined(ae))
        this.split(ae, ae.bot);
      if (ClipperBase.isHorizontal(ae))
        return;
      this.insertScanline(ae.top.y);
      this.checkJoinLeft(ae, ae.bot);
      this.checkJoinRight(ae, ae.bot, true);
    }
    static findEdgeWithMatchingLocMin(e) {
      let result = e.nextInAEL;
      while (result) {
        if (result.localMin === e.localMin)
          return result;
        if (!ClipperBase.isHorizontal(result) && e.bot !== result.bot)
          result = void 0;
        else
          result = result.nextInAEL;
      }
      result = e.prevInAEL;
      while (result) {
        if (result.localMin === e.localMin)
          return result;
        if (!ClipperBase.isHorizontal(result) && e.bot !== result.bot)
          return void 0;
        result = result.prevInAEL;
      }
      return result;
    }
    intersectEdges(ae1, ae2, pt) {
      let resultOp = void 0;
      if (this._hasOpenPaths && (ClipperBase.isOpen(ae1) || ClipperBase.isOpen(ae2))) {
        if (ClipperBase.isOpen(ae1) && ClipperBase.isOpen(ae2))
          return void 0;
        if (ClipperBase.isOpen(ae2))
          ClipperBase.swapActives(ae1, ae2);
        if (ClipperBase.isJoined(ae2))
          this.split(ae2, pt);
        if (this._cliptype === ClipType.Union) {
          if (!ClipperBase.isHotEdgeActive(ae2))
            return void 0;
        } else if (ae2.localMin.polytype === PathType.Subject)
          return void 0;
        switch (this._fillrule) {
          case FillRule.Positive:
            if (ae2.windCount !== 1)
              return void 0;
            break;
          case FillRule.Negative:
            if (ae2.windCount !== -1)
              return void 0;
            break;
          default:
            if (Math.abs(ae2.windCount) !== 1)
              return void 0;
            break;
        }
        if (ClipperBase.isHotEdgeActive(ae1)) {
          resultOp = ClipperBase.addOutPt(ae1, pt);
          if (ClipperBase.isFront(ae1)) {
            ae1.outrec.frontEdge = void 0;
          } else {
            ae1.outrec.backEdge = void 0;
          }
          ae1.outrec = void 0;
        } else if (pt === ae1.localMin.vertex.pt && !ClipperBase.isOpenEnd(ae1.localMin.vertex)) {
          const ae3 = ClipperBase.findEdgeWithMatchingLocMin(ae1);
          if (ae3 && ClipperBase.isHotEdgeActive(ae3)) {
            ae1.outrec = ae3.outrec;
            if (ae1.windDx > 0) {
              ClipperBase.setSides(ae3.outrec, ae1, ae3);
            } else {
              ClipperBase.setSides(ae3.outrec, ae3, ae1);
            }
            return ae3.outrec.pts;
          }
          resultOp = this.startOpenPath(ae1, pt);
        } else {
          resultOp = this.startOpenPath(ae1, pt);
        }
        return resultOp;
      }
      if (ClipperBase.isJoined(ae1))
        this.split(ae1, pt);
      if (ClipperBase.isJoined(ae2))
        this.split(ae2, pt);
      let oldE1WindCount;
      let oldE2WindCount;
      if (ae1.localMin.polytype === ae2.localMin.polytype) {
        if (this._fillrule === FillRule.EvenOdd) {
          oldE1WindCount = ae1.windCount;
          ae1.windCount = ae2.windCount;
          ae2.windCount = oldE1WindCount;
        } else {
          if (ae1.windCount + ae2.windDx === 0)
            ae1.windCount = -ae1.windCount;
          else
            ae1.windCount += ae2.windDx;
          if (ae2.windCount - ae1.windDx === 0)
            ae2.windCount = -ae2.windCount;
          else
            ae2.windCount -= ae1.windDx;
        }
      } else {
        if (this._fillrule !== FillRule.EvenOdd)
          ae1.windCount2 += ae2.windDx;
        else
          ae1.windCount2 = ae1.windCount2 === 0 ? 1 : 0;
        if (this._fillrule !== FillRule.EvenOdd)
          ae2.windCount2 -= ae1.windDx;
        else
          ae2.windCount2 = ae2.windCount2 === 0 ? 1 : 0;
      }
      switch (this._fillrule) {
        case FillRule.Positive:
          oldE1WindCount = ae1.windCount;
          oldE2WindCount = ae2.windCount;
          break;
        case FillRule.Negative:
          oldE1WindCount = -ae1.windCount;
          oldE2WindCount = -ae2.windCount;
          break;
        default:
          oldE1WindCount = Math.abs(ae1.windCount);
          oldE2WindCount = Math.abs(ae2.windCount);
          break;
      }
      const e1WindCountIs0or1 = oldE1WindCount === 0 || oldE1WindCount === 1;
      const e2WindCountIs0or1 = oldE2WindCount === 0 || oldE2WindCount === 1;
      if (!ClipperBase.isHotEdgeActive(ae1) && !e1WindCountIs0or1 || !ClipperBase.isHotEdgeActive(ae2) && !e2WindCountIs0or1)
        return void 0;
      if (ClipperBase.isHotEdgeActive(ae1) && ClipperBase.isHotEdgeActive(ae2)) {
        if (oldE1WindCount !== 0 && oldE1WindCount !== 1 || oldE2WindCount !== 0 && oldE2WindCount !== 1 || ae1.localMin.polytype !== ae2.localMin.polytype && this._cliptype !== ClipType.Xor) {
          resultOp = this.addLocalMaxPoly(ae1, ae2, pt);
        } else if (ClipperBase.isFront(ae1) || ae1.outrec === ae2.outrec) {
          resultOp = this.addLocalMaxPoly(ae1, ae2, pt);
          this.addLocalMinPoly(ae1, ae2, pt);
        } else {
          resultOp = ClipperBase.addOutPt(ae1, pt);
          ClipperBase.addOutPt(ae2, pt);
          ClipperBase.swapOutrecs(ae1, ae2);
        }
      } else if (ClipperBase.isHotEdgeActive(ae1)) {
        resultOp = ClipperBase.addOutPt(ae1, pt);
        ClipperBase.swapOutrecs(ae1, ae2);
      } else if (ClipperBase.isHotEdgeActive(ae2)) {
        resultOp = ClipperBase.addOutPt(ae2, pt);
        ClipperBase.swapOutrecs(ae1, ae2);
      } else {
        let e1Wc2;
        let e2Wc2;
        switch (this._fillrule) {
          case FillRule.Positive:
            e1Wc2 = ae1.windCount2;
            e2Wc2 = ae2.windCount2;
            break;
          case FillRule.Negative:
            e1Wc2 = -ae1.windCount2;
            e2Wc2 = -ae2.windCount2;
            break;
          default:
            e1Wc2 = Math.abs(ae1.windCount2);
            e2Wc2 = Math.abs(ae2.windCount2);
            break;
        }
        if (!ClipperBase.isSamePolyType(ae1, ae2)) {
          resultOp = this.addLocalMinPoly(ae1, ae2, pt);
        } else if (oldE1WindCount === 1 && oldE2WindCount === 1) {
          resultOp = void 0;
          switch (this._cliptype) {
            case ClipType.Union:
              if (e1Wc2 > 0 && e2Wc2 > 0)
                return void 0;
              resultOp = this.addLocalMinPoly(ae1, ae2, pt);
              break;
            case ClipType.Difference:
              if (ClipperBase.getPolyType(ae1) === PathType.Clip && e1Wc2 > 0 && e2Wc2 > 0 || ClipperBase.getPolyType(ae1) === PathType.Subject && e1Wc2 <= 0 && e2Wc2 <= 0) {
                resultOp = this.addLocalMinPoly(ae1, ae2, pt);
              }
              break;
            case ClipType.Xor:
              resultOp = this.addLocalMinPoly(ae1, ae2, pt);
              break;
            default:
              if (e1Wc2 <= 0 || e2Wc2 <= 0)
                return void 0;
              resultOp = this.addLocalMinPoly(ae1, ae2, pt);
              break;
          }
        }
      }
      return resultOp;
    }
    deleteFromAEL(ae) {
      const prev = ae.prevInAEL;
      const next = ae.nextInAEL;
      if (!prev && !next && ae !== this._actives)
        return;
      if (prev)
        prev.nextInAEL = next;
      else
        this._actives = next;
      if (next)
        next.prevInAEL = prev;
    }
    adjustCurrXAndCopyToSEL(topY) {
      let ae = this._actives;
      this._sel = ae;
      while (ae) {
        ae.prevInSEL = ae.prevInAEL;
        ae.nextInSEL = ae.nextInAEL;
        ae.jump = ae.nextInSEL;
        if (ae.joinWith === JoinWith.Left)
          ae.curX = ae.prevInAEL.curX;
        else
          ae.curX = ClipperBase.topX(ae, topY);
        ae = ae.nextInAEL;
      }
    }
    executeInternal(ct, fillRule) {
      if (ct === ClipType.None)
        return;
      this._fillrule = fillRule;
      this._cliptype = ct;
      this.reset();
      let y = this.popScanline();
      if (y === void 0)
        return;
      while (this._succeeded) {
        this.insertLocalMinimaIntoAEL(y);
        let ae = this.popHorz();
        while (ae) {
          this.doHorizontal(ae);
          ae = this.popHorz();
        }
        if (this._horzSegList.length > 0) {
          this.convertHorzSegsToJoins();
          this._horzSegList.length = 0;
        }
        this._currentBotY = y;
        y = this.popScanline();
        if (y === void 0)
          break;
        this.doIntersections(y);
        this.doTopOfScanbeam(y);
        ae = this.popHorz();
        while (ae) {
          this.doHorizontal(ae);
          ae = this.popHorz();
        }
      }
      if (this._succeeded)
        this.processHorzJoins();
    }
    doIntersections(topY) {
      if (this.buildIntersectList(topY)) {
        this.processIntersectList();
        this.disposeIntersectNodes();
      }
    }
    disposeIntersectNodes() {
      this._intersectList.length = 0;
    }
    addNewIntersectNode(ae1, ae2, topY) {
      const result = InternalClipper.getIntersectPt(ae1.bot, ae1.top, ae2.bot, ae2.top);
      let ip = result.ip;
      if (!result.success) {
        ip = new Point64(ae1.curX, topY);
      }
      if (ip.y > this._currentBotY || ip.y < topY) {
        const absDx1 = Math.abs(ae1.dx);
        const absDx2 = Math.abs(ae2.dx);
        if (absDx1 > 100 && absDx2 > 100) {
          if (absDx1 > absDx2) {
            ip = InternalClipper.getClosestPtOnSegment(ip, ae1.bot, ae1.top);
          } else {
            ip = InternalClipper.getClosestPtOnSegment(ip, ae2.bot, ae2.top);
          }
        } else if (absDx1 > 100) {
          ip = InternalClipper.getClosestPtOnSegment(ip, ae1.bot, ae1.top);
        } else if (absDx2 > 100) {
          ip = InternalClipper.getClosestPtOnSegment(ip, ae2.bot, ae2.top);
        } else {
          if (ip.y < topY) {
            ip.y = topY;
          } else {
            ip.y = this._currentBotY;
          }
          if (absDx1 < absDx2) {
            ip.x = ClipperBase.topX(ae1, ip.y);
          } else {
            ip.x = ClipperBase.topX(ae2, ip.y);
          }
        }
      }
      const node = new IntersectNode(ip, ae1, ae2);
      this._intersectList.push(node);
    }
    static extractFromSEL(ae) {
      const res = ae.nextInSEL;
      if (res) {
        res.prevInSEL = ae.prevInSEL;
      }
      ae.prevInSEL.nextInSEL = res;
      return res;
    }
    static insert1Before2InSEL(ae1, ae2) {
      ae1.prevInSEL = ae2.prevInSEL;
      if (ae1.prevInSEL) {
        ae1.prevInSEL.nextInSEL = ae1;
      }
      ae1.nextInSEL = ae2;
      ae2.prevInSEL = ae1;
    }
    buildIntersectList(topY) {
      if (!this._actives || !this._actives.nextInAEL)
        return false;
      this.adjustCurrXAndCopyToSEL(topY);
      let left = this._sel, right, lEnd, rEnd, currBase, prevBase, tmp2;
      while (left.jump) {
        prevBase = void 0;
        while (left && left.jump) {
          currBase = left;
          right = left.jump;
          lEnd = right;
          rEnd = right.jump;
          left.jump = rEnd;
          while (left !== lEnd && right !== rEnd) {
            if (right.curX < left.curX) {
              tmp2 = right.prevInSEL;
              for (; ; ) {
                this.addNewIntersectNode(tmp2, right, topY);
                if (tmp2 === left)
                  break;
                tmp2 = tmp2.prevInSEL;
              }
              tmp2 = right;
              right = ClipperBase.extractFromSEL(tmp2);
              lEnd = right;
              ClipperBase.insert1Before2InSEL(tmp2, left);
              if (left === currBase) {
                currBase = tmp2;
                currBase.jump = rEnd;
                if (prevBase === void 0)
                  this._sel = currBase;
                else
                  prevBase.jump = currBase;
              }
            } else {
              left = left.nextInSEL;
            }
          }
          prevBase = currBase;
          left = rEnd;
        }
        left = this._sel;
      }
      return this._intersectList.length > 0;
    }
    processIntersectList() {
      this._intersectList.sort((a, b) => {
        if (a.pt.y === b.pt.y) {
          if (a.pt.x === b.pt.x)
            return 0;
          return a.pt.x < b.pt.x ? -1 : 1;
        }
        return a.pt.y > b.pt.y ? -1 : 1;
      });
      for (let i = 0; i < this._intersectList.length; ++i) {
        if (!ClipperBase.edgesAdjacentInAEL(this._intersectList[i])) {
          let j = i + 1;
          while (!ClipperBase.edgesAdjacentInAEL(this._intersectList[j]))
            j++;
          [this._intersectList[j], this._intersectList[i]] = [this._intersectList[i], this._intersectList[j]];
        }
        const node = this._intersectList[i];
        this.intersectEdges(node.edge1, node.edge2, node.pt);
        this.swapPositionsInAEL(node.edge1, node.edge2);
        node.edge1.curX = node.pt.x;
        node.edge2.curX = node.pt.x;
        this.checkJoinLeft(node.edge2, node.pt, true);
        this.checkJoinRight(node.edge1, node.pt, true);
      }
    }
    swapPositionsInAEL(ae1, ae2) {
      const next = ae2.nextInAEL;
      if (next)
        next.prevInAEL = ae1;
      const prev = ae1.prevInAEL;
      if (prev)
        prev.nextInAEL = ae2;
      ae2.prevInAEL = prev;
      ae2.nextInAEL = ae1;
      ae1.prevInAEL = ae2;
      ae1.nextInAEL = next;
      if (!ae2.prevInAEL)
        this._actives = ae2;
    }
    static resetHorzDirection(horz, vertexMax) {
      let leftX, rightX;
      if (horz.bot.x === horz.top.x) {
        leftX = horz.curX;
        rightX = horz.curX;
        let ae = horz.nextInAEL;
        while (ae && ae.vertexTop !== vertexMax)
          ae = ae.nextInAEL;
        return { isLeftToRight: ae !== void 0, leftX, rightX };
      }
      if (horz.curX < horz.top.x) {
        leftX = horz.curX;
        rightX = horz.top.x;
        return { isLeftToRight: true, leftX, rightX };
      }
      leftX = horz.top.x;
      rightX = horz.curX;
      return { isLeftToRight: false, leftX, rightX };
    }
    static horzIsSpike(horz) {
      const nextPt = ClipperBase.nextVertex(horz).pt;
      return horz.bot.x < horz.top.x !== horz.top.x < nextPt.x;
    }
    static trimHorz(horzEdge, preserveCollinear) {
      let wasTrimmed = false;
      let pt = ClipperBase.nextVertex(horzEdge).pt;
      while (pt.y === horzEdge.top.y) {
        if (preserveCollinear && pt.x < horzEdge.top.x !== horzEdge.bot.x < horzEdge.top.x) {
          break;
        }
        horzEdge.vertexTop = ClipperBase.nextVertex(horzEdge);
        horzEdge.top = pt;
        wasTrimmed = true;
        if (ClipperBase.isMaximaActive(horzEdge))
          break;
        pt = ClipperBase.nextVertex(horzEdge).pt;
      }
      if (wasTrimmed)
        ClipperBase.setDx(horzEdge);
    }
    addToHorzSegList(op) {
      if (op.outrec.isOpen)
        return;
      this._horzSegList.push(new HorzSegment(op));
    }
    getLastOp(hotEdge) {
      const outrec = hotEdge.outrec;
      return hotEdge === outrec.frontEdge ? outrec.pts : outrec.pts.next;
    }
    /*******************************************************************************
    * Notes: Horizontal edges (HEs) at scanline intersections (i.e. at the top or    *
    * bottom of a scanbeam) are processed as if layered.The order in which HEs     *
    * are processed doesn't matter. HEs intersect with the bottom vertices of      *
    * other HEs[#] and with non-horizontal edges [*]. Once these intersections     *
    * are completed, intermediate HEs are 'promoted' to the next edge in their     *
    * bounds, and they in turn may be intersected[%] by other HEs.                 *
    *                                                                              *
    * eg: 3 horizontals at a scanline:    /   |                     /           /  *
    *              |                     /    |     (HE3)o ========%========== o   *
    *              o ======= o(HE2)     /     |         /         /                *
    *          o ============#=========*======*========#=========o (HE1)           *
    *         /              |        /       |       /                            *
    *******************************************************************************/
    doHorizontal(horz) {
      let pt;
      const horzIsOpen = ClipperBase.isOpen(horz);
      const Y = horz.bot.y;
      const vertex_max = horzIsOpen ? ClipperBase.getCurrYMaximaVertex_Open(horz) : ClipperBase.getCurrYMaximaVertex(horz);
      if (vertex_max && !horzIsOpen && vertex_max !== horz.vertexTop)
        ClipperBase.trimHorz(horz, this.preserveCollinear);
      let { isLeftToRight, leftX, rightX } = ClipperBase.resetHorzDirection(horz, vertex_max);
      if (ClipperBase.isHotEdgeActive(horz)) {
        const op = ClipperBase.addOutPt(horz, new Point64(horz.curX, Y));
        this.addToHorzSegList(op);
      }
      for (; ; ) {
        let ae = isLeftToRight ? horz.nextInAEL : horz.prevInAEL;
        while (ae) {
          if (ae.vertexTop === vertex_max) {
            if (ClipperBase.isHotEdgeActive(horz) && ClipperBase.isJoined(ae))
              this.split(ae, ae.top);
            if (ClipperBase.isHotEdgeActive(horz)) {
              while (horz.vertexTop !== vertex_max) {
                ClipperBase.addOutPt(horz, horz.top);
                this.updateEdgeIntoAEL(horz);
              }
              if (isLeftToRight)
                this.addLocalMaxPoly(horz, ae, horz.top);
              else
                this.addLocalMaxPoly(ae, horz, horz.top);
            }
            this.deleteFromAEL(ae);
            this.deleteFromAEL(horz);
            return;
          }
          if (vertex_max !== horz.vertexTop || ClipperBase.isOpenEndActive(horz)) {
            if (isLeftToRight && ae.curX > rightX || !isLeftToRight && ae.curX < leftX)
              break;
            if (ae.curX === horz.top.x && !ClipperBase.isHorizontal(ae)) {
              pt = ClipperBase.nextVertex(horz).pt;
              if (ClipperBase.isOpen(ae) && !ClipperBase.isSamePolyType(ae, horz) && !ClipperBase.isHotEdgeActive(ae)) {
                if (isLeftToRight && ClipperBase.topX(ae, pt.y) > pt.x || !isLeftToRight && ClipperBase.topX(ae, pt.y) < pt.x)
                  break;
              } else if (isLeftToRight && ClipperBase.topX(ae, pt.y) >= pt.x || !isLeftToRight && ClipperBase.topX(ae, pt.y) <= pt.x)
                break;
            }
          }
          pt = new Point64(ae.curX, Y);
          if (isLeftToRight) {
            this.intersectEdges(horz, ae, pt);
            this.swapPositionsInAEL(horz, ae);
            horz.curX = ae.curX;
            ae = horz.nextInAEL;
          } else {
            this.intersectEdges(ae, horz, pt);
            this.swapPositionsInAEL(ae, horz);
            horz.curX = ae.curX;
            ae = horz.prevInAEL;
          }
          if (ClipperBase.isHotEdgeActive(horz))
            this.addToHorzSegList(this.getLastOp(horz));
        }
        if (horzIsOpen && ClipperBase.isOpenEndActive(horz)) {
          if (ClipperBase.isHotEdgeActive(horz)) {
            ClipperBase.addOutPt(horz, horz.top);
            if (ClipperBase.isFront(horz))
              horz.outrec.frontEdge = void 0;
            else
              horz.outrec.backEdge = void 0;
            horz.outrec = void 0;
          }
          this.deleteFromAEL(horz);
          return;
        } else if (ClipperBase.nextVertex(horz).pt.y !== horz.top.y)
          break;
        if (ClipperBase.isHotEdgeActive(horz)) {
          ClipperBase.addOutPt(horz, horz.top);
        }
        this.updateEdgeIntoAEL(horz);
        if (this.preserveCollinear && !horzIsOpen && ClipperBase.horzIsSpike(horz)) {
          ClipperBase.trimHorz(horz, true);
        }
        const result = ClipperBase.resetHorzDirection(horz, vertex_max);
        isLeftToRight = result.isLeftToRight;
        leftX = result.leftX;
        rightX = result.rightX;
      }
      if (ClipperBase.isHotEdgeActive(horz)) {
        const op = ClipperBase.addOutPt(horz, horz.top);
        this.addToHorzSegList(op);
      }
      this.updateEdgeIntoAEL(horz);
    }
    doTopOfScanbeam(y) {
      this._sel = void 0;
      let ae = this._actives;
      while (ae) {
        if (ae.top.y === y) {
          ae.curX = ae.top.x;
          if (ClipperBase.isMaximaActive(ae)) {
            ae = this.doMaxima(ae);
            continue;
          }
          if (ClipperBase.isHotEdgeActive(ae))
            ClipperBase.addOutPt(ae, ae.top);
          this.updateEdgeIntoAEL(ae);
          if (ClipperBase.isHorizontal(ae))
            this.pushHorz(ae);
        } else {
          ae.curX = ClipperBase.topX(ae, y);
        }
        ae = ae.nextInAEL;
      }
    }
    doMaxima(ae) {
      const prevE = ae.prevInAEL;
      let nextE = ae.nextInAEL;
      if (ClipperBase.isOpenEndActive(ae)) {
        if (ClipperBase.isHotEdgeActive(ae))
          ClipperBase.addOutPt(ae, ae.top);
        if (!ClipperBase.isHorizontal(ae)) {
          if (ClipperBase.isHotEdgeActive(ae)) {
            if (ClipperBase.isFront(ae))
              ae.outrec.frontEdge = void 0;
            else
              ae.outrec.backEdge = void 0;
            ae.outrec = void 0;
          }
          this.deleteFromAEL(ae);
        }
        return nextE;
      }
      const maxPair = ClipperBase.getMaximaPair(ae);
      if (!maxPair)
        return nextE;
      if (ClipperBase.isJoined(ae))
        this.split(ae, ae.top);
      if (ClipperBase.isJoined(maxPair))
        this.split(maxPair, maxPair.top);
      while (nextE !== maxPair) {
        this.intersectEdges(ae, nextE, ae.top);
        this.swapPositionsInAEL(ae, nextE);
        nextE = ae.nextInAEL;
      }
      if (ClipperBase.isOpen(ae)) {
        if (ClipperBase.isHotEdgeActive(ae))
          this.addLocalMaxPoly(ae, maxPair, ae.top);
        this.deleteFromAEL(maxPair);
        this.deleteFromAEL(ae);
        return prevE ? prevE.nextInAEL : this._actives;
      }
      if (ClipperBase.isHotEdgeActive(ae))
        this.addLocalMaxPoly(ae, maxPair, ae.top);
      this.deleteFromAEL(ae);
      this.deleteFromAEL(maxPair);
      return prevE ? prevE.nextInAEL : this._actives;
    }
    static isJoined(e) {
      return e.joinWith !== JoinWith.None;
    }
    split(e, currPt) {
      if (e.joinWith === JoinWith.Right) {
        e.joinWith = JoinWith.None;
        e.nextInAEL.joinWith = JoinWith.None;
        this.addLocalMinPoly(e, e.nextInAEL, currPt, true);
      } else {
        e.joinWith = JoinWith.None;
        e.prevInAEL.joinWith = JoinWith.None;
        this.addLocalMinPoly(e.prevInAEL, e, currPt, true);
      }
    }
    checkJoinLeft(e, pt, checkCurrX = false) {
      const prev = e.prevInAEL;
      if (!prev || ClipperBase.isOpen(e) || ClipperBase.isOpen(prev) || !ClipperBase.isHotEdgeActive(e) || !ClipperBase.isHotEdgeActive(prev))
        return;
      if ((pt.y < e.top.y + 2 || pt.y < prev.top.y + 2) && // avoid trivial joins
      (e.bot.y > pt.y || prev.bot.y > pt.y))
        return;
      if (checkCurrX) {
        if (Clipper.perpendicDistFromLineSqrd(pt, prev.bot, prev.top) > 0.25)
          return;
      } else if (e.curX !== prev.curX)
        return;
      if (InternalClipper.crossProduct(e.top, pt, prev.top) !== 0)
        return;
      if (e.outrec.idx === prev.outrec.idx)
        this.addLocalMaxPoly(prev, e, pt);
      else if (e.outrec.idx < prev.outrec.idx)
        ClipperBase.joinOutrecPaths(e, prev);
      else
        ClipperBase.joinOutrecPaths(prev, e);
      prev.joinWith = JoinWith.Right;
      e.joinWith = JoinWith.Left;
    }
    checkJoinRight(e, pt, checkCurrX = false) {
      const next = e.nextInAEL;
      if (ClipperBase.isOpen(e) || !ClipperBase.isHotEdgeActive(e) || ClipperBase.isJoined(e) || !next || ClipperBase.isOpen(next) || !ClipperBase.isHotEdgeActive(next))
        return;
      if ((pt.y < e.top.y + 2 || pt.y < next.top.y + 2) && // avoid trivial joins
      (e.bot.y > pt.y || next.bot.y > pt.y))
        return;
      if (checkCurrX) {
        if (Clipper.perpendicDistFromLineSqrd(pt, next.bot, next.top) > 0.25)
          return;
      } else if (e.curX !== next.curX)
        return;
      if (InternalClipper.crossProduct(e.top, pt, next.top) !== 0)
        return;
      if (e.outrec.idx === next.outrec.idx)
        this.addLocalMaxPoly(e, next, pt);
      else if (e.outrec.idx < next.outrec.idx)
        ClipperBase.joinOutrecPaths(e, next);
      else
        ClipperBase.joinOutrecPaths(next, e);
      e.joinWith = JoinWith.Right;
      next.joinWith = JoinWith.Left;
    }
    static fixOutRecPts(outrec) {
      let op = outrec.pts;
      do {
        op.outrec = outrec;
        op = op.next;
      } while (op !== outrec.pts);
    }
    static setHorzSegHeadingForward(hs, opP, opN) {
      if (opP.pt.x === opN.pt.x)
        return false;
      if (opP.pt.x < opN.pt.x) {
        hs.leftOp = opP;
        hs.rightOp = opN;
        hs.leftToRight = true;
      } else {
        hs.leftOp = opN;
        hs.rightOp = opP;
        hs.leftToRight = false;
      }
      return true;
    }
    static updateHorzSegment(hs) {
      const op = hs.leftOp;
      const outrec = this.getRealOutRec(op.outrec);
      const outrecHasEdges = outrec.frontEdge !== void 0;
      const curr_y = op.pt.y;
      let opP = op, opN = op;
      if (outrecHasEdges) {
        const opA = outrec.pts, opZ = opA.next;
        while (opP !== opZ && opP.prev.pt.y === curr_y)
          opP = opP.prev;
        while (opN !== opA && opN.next.pt.y === curr_y)
          opN = opN.next;
      } else {
        while (opP.prev !== opN && opP.prev.pt.y === curr_y)
          opP = opP.prev;
        while (opN.next !== opP && opN.next.pt.y === curr_y)
          opN = opN.next;
      }
      const result = this.setHorzSegHeadingForward(hs, opP, opN) && hs.leftOp.horz === void 0;
      if (result)
        hs.leftOp.horz = hs;
      else
        hs.rightOp = void 0;
      return result;
    }
    static duplicateOp(op, insert_after) {
      const result = new OutPt(op.pt, op.outrec);
      if (insert_after) {
        result.next = op.next;
        result.next.prev = result;
        result.prev = op;
        op.next = result;
      } else {
        result.prev = op.prev;
        result.prev.next = result;
        result.next = op;
        op.prev = result;
      }
      return result;
    }
    convertHorzSegsToJoins() {
      let k = 0;
      for (const hs of this._horzSegList) {
        if (ClipperBase.updateHorzSegment(hs))
          k++;
      }
      if (k < 2)
        return;
      this._horzSegList.sort((hs1, hs2) => {
        if (!hs1 || !hs2)
          return 0;
        if (!hs1.rightOp) {
          return !hs2.rightOp ? 0 : 1;
        } else if (!hs2.rightOp)
          return -1;
        else
          return hs1.leftOp.pt.x - hs2.leftOp.pt.x;
      });
      for (let i = 0; i < k - 1; i++) {
        const hs1 = this._horzSegList[i];
        for (let j = i + 1; j < k; j++) {
          const hs2 = this._horzSegList[j];
          if (hs2.leftOp.pt.x >= hs1.rightOp.pt.x || hs2.leftToRight === hs1.leftToRight || hs2.rightOp.pt.x <= hs1.leftOp.pt.x)
            continue;
          const curr_y = hs1.leftOp.pt.y;
          if (hs1.leftToRight) {
            while (hs1.leftOp.next.pt.y === curr_y && hs1.leftOp.next.pt.x <= hs2.leftOp.pt.x) {
              hs1.leftOp = hs1.leftOp.next;
            }
            while (hs2.leftOp.prev.pt.y === curr_y && hs2.leftOp.prev.pt.x <= hs1.leftOp.pt.x) {
              hs2.leftOp = hs2.leftOp.prev;
            }
            const join = new HorzJoin(ClipperBase.duplicateOp(hs1.leftOp, true), ClipperBase.duplicateOp(hs2.leftOp, false));
            this._horzJoinList.push(join);
          } else {
            while (hs1.leftOp.prev.pt.y === curr_y && hs1.leftOp.prev.pt.x <= hs2.leftOp.pt.x) {
              hs1.leftOp = hs1.leftOp.prev;
            }
            while (hs2.leftOp.next.pt.y === curr_y && hs2.leftOp.next.pt.x <= hs1.leftOp.pt.x) {
              hs2.leftOp = hs2.leftOp.next;
            }
            const join = new HorzJoin(ClipperBase.duplicateOp(hs2.leftOp, true), ClipperBase.duplicateOp(hs1.leftOp, false));
            this._horzJoinList.push(join);
          }
        }
      }
    }
    static getCleanPath(op) {
      const result = new Path64();
      let op2 = op;
      while (op2.next !== op && (op2.pt.x === op2.next.pt.x && op2.pt.x === op2.prev.pt.x || op2.pt.y === op2.next.pt.y && op2.pt.y === op2.prev.pt.y)) {
        op2 = op2.next;
      }
      result.push(op2.pt);
      let prevOp = op2;
      op2 = op2.next;
      while (op2 !== op) {
        if ((op2.pt.x !== op2.next.pt.x || op2.pt.x !== prevOp.pt.x) && (op2.pt.y !== op2.next.pt.y || op2.pt.y !== prevOp.pt.y)) {
          result.push(op2.pt);
          prevOp = op2;
        }
        op2 = op2.next;
      }
      return result;
    }
    static pointInOpPolygon(pt, op) {
      if (op === op.next || op.prev === op.next)
        return PointInPolygonResult.IsOutside;
      let op2 = op;
      do {
        if (op.pt.y !== pt.y)
          break;
        op = op.next;
      } while (op !== op2);
      if (op.pt.y === pt.y)
        return PointInPolygonResult.IsOutside;
      let isAbove = op.pt.y < pt.y;
      const startingAbove = isAbove;
      let val = 0;
      op2 = op.next;
      while (op2 !== op) {
        if (isAbove)
          while (op2 !== op && op2.pt.y < pt.y)
            op2 = op2.next;
        else
          while (op2 !== op && op2.pt.y > pt.y)
            op2 = op2.next;
        if (op2 === op)
          break;
        if (op2.pt.y === pt.y) {
          if (op2.pt.x === pt.x || op2.pt.y === op2.prev.pt.y && pt.x < op2.prev.pt.x !== pt.x < op2.pt.x)
            return PointInPolygonResult.IsOn;
          op2 = op2.next;
          if (op2 === op)
            break;
          continue;
        }
        if (op2.pt.x <= pt.x || op2.prev.pt.x <= pt.x) {
          if (op2.prev.pt.x < pt.x && op2.pt.x < pt.x)
            val = 1 - val;
          else {
            const d = InternalClipper.crossProduct(op2.prev.pt, op2.pt, pt);
            if (d === 0)
              return PointInPolygonResult.IsOn;
            if (d < 0 === isAbove)
              val = 1 - val;
          }
        }
        isAbove = !isAbove;
        op2 = op2.next;
      }
      if (isAbove !== startingAbove) {
        const d = InternalClipper.crossProduct(op2.prev.pt, op2.pt, pt);
        if (d === 0)
          return PointInPolygonResult.IsOn;
        if (d < 0 === isAbove)
          val = 1 - val;
      }
      if (val === 0)
        return PointInPolygonResult.IsOutside;
      else
        return PointInPolygonResult.IsInside;
    }
    static path1InsidePath2(op1, op2) {
      let result;
      let outside_cnt = 0;
      let op = op1;
      do {
        result = this.pointInOpPolygon(op.pt, op2);
        if (result === PointInPolygonResult.IsOutside)
          ++outside_cnt;
        else if (result === PointInPolygonResult.IsInside)
          --outside_cnt;
        op = op.next;
      } while (op !== op1 && Math.abs(outside_cnt) < 2);
      if (Math.abs(outside_cnt) > 1)
        return outside_cnt < 0;
      const mp = ClipperBase.getBoundsPath(this.getCleanPath(op1)).midPoint();
      const path2 = this.getCleanPath(op2);
      return InternalClipper.pointInPolygon(mp, path2) !== PointInPolygonResult.IsOutside;
    }
    moveSplits(fromOr, toOr) {
      if (!fromOr.splits)
        return;
      toOr.splits = toOr.splits || [];
      for (const i of fromOr.splits) {
        toOr.splits.push(i);
      }
      fromOr.splits = void 0;
    }
    processHorzJoins() {
      for (const j of this._horzJoinList) {
        const or1 = ClipperBase.getRealOutRec(j.op1.outrec);
        let or2 = ClipperBase.getRealOutRec(j.op2.outrec);
        const op1b = j.op1.next;
        const op2b = j.op2.prev;
        j.op1.next = j.op2;
        j.op2.prev = j.op1;
        op1b.prev = op2b;
        op2b.next = op1b;
        if (or1 === or2) {
          or2 = this.newOutRec();
          or2.pts = op1b;
          ClipperBase.fixOutRecPts(or2);
          if (or1.pts.outrec === or2) {
            or1.pts = j.op1;
            or1.pts.outrec = or1;
          }
          if (this._using_polytree) {
            if (ClipperBase.path1InsidePath2(or1.pts, or2.pts)) {
              const tmp2 = or1.pts;
              or1.pts = or2.pts;
              or2.pts = tmp2;
              ClipperBase.fixOutRecPts(or1);
              ClipperBase.fixOutRecPts(or2);
              or2.owner = or1.owner;
            } else if (ClipperBase.path1InsidePath2(or2.pts, or1.pts)) {
              or2.owner = or1;
            } else {
              or2.owner = or1.owner;
            }
            or1.splits = or1.splits || [];
            or1.splits.push(or2.idx);
          } else {
            or2.owner = or1;
          }
        } else {
          or2.pts = void 0;
          if (this._using_polytree) {
            ClipperBase.setOwner(or2, or1);
            this.moveSplits(or2, or1);
          } else {
            or2.owner = or1;
          }
        }
      }
    }
    static ptsReallyClose(pt1, pt2) {
      return Math.abs(pt1.x - pt2.x) < 2 && Math.abs(pt1.y - pt2.y) < 2;
    }
    static isVerySmallTriangle(op) {
      return op.next.next === op.prev && (this.ptsReallyClose(op.prev.pt, op.next.pt) || this.ptsReallyClose(op.pt, op.next.pt) || this.ptsReallyClose(op.pt, op.prev.pt));
    }
    static isValidClosedPath(op) {
      return op !== void 0 && op.next !== op && (op.next !== op.prev || !this.isVerySmallTriangle(op));
    }
    static disposeOutPt(op) {
      const result = op.next === op ? void 0 : op.next;
      op.prev.next = op.next;
      op.next.prev = op.prev;
      return result;
    }
    cleanCollinear(outrec) {
      outrec = ClipperBase.getRealOutRec(outrec);
      if (outrec === void 0 || outrec.isOpen)
        return;
      if (!ClipperBase.isValidClosedPath(outrec.pts)) {
        outrec.pts = void 0;
        return;
      }
      let startOp = outrec.pts;
      let op2 = startOp;
      for (; ; ) {
        if (InternalClipper.crossProduct(op2.prev.pt, op2.pt, op2.next.pt) === 0 && (op2.pt === op2.prev.pt || op2.pt === op2.next.pt || !this.preserveCollinear || InternalClipper.dotProduct(op2.prev.pt, op2.pt, op2.next.pt) < 0)) {
          if (op2 === outrec.pts) {
            outrec.pts = op2.prev;
          }
          op2 = ClipperBase.disposeOutPt(op2);
          if (!ClipperBase.isValidClosedPath(op2)) {
            outrec.pts = void 0;
            return;
          }
          startOp = op2;
          continue;
        }
        op2 = op2.next;
        if (op2 === startOp)
          break;
      }
      this.fixSelfIntersects(outrec);
    }
    doSplitOp(outrec, splitOp) {
      const prevOp = splitOp.prev;
      const nextNextOp = splitOp.next.next;
      outrec.pts = prevOp;
      const ip = InternalClipper.getIntersectPoint(prevOp.pt, splitOp.pt, splitOp.next.pt, nextNextOp.pt).ip;
      const area1 = ClipperBase.area(prevOp);
      const absArea1 = Math.abs(area1);
      if (absArea1 < 2) {
        outrec.pts = void 0;
        return;
      }
      const area2 = ClipperBase.areaTriangle(ip, splitOp.pt, splitOp.next.pt);
      const absArea2 = Math.abs(area2);
      if (ip === prevOp.pt || ip === nextNextOp.pt) {
        nextNextOp.prev = prevOp;
        prevOp.next = nextNextOp;
      } else {
        const newOp2 = new OutPt(ip, outrec);
        newOp2.prev = prevOp;
        newOp2.next = nextNextOp;
        nextNextOp.prev = newOp2;
        prevOp.next = newOp2;
      }
      if (absArea2 > 1 && (absArea2 > absArea1 || area2 > 0 === area1 > 0)) {
        const newOutRec = this.newOutRec();
        newOutRec.owner = outrec.owner;
        splitOp.outrec = newOutRec;
        splitOp.next.outrec = newOutRec;
        const newOp = new OutPt(ip, newOutRec);
        newOp.prev = splitOp.next;
        newOp.next = splitOp;
        newOutRec.pts = newOp;
        splitOp.prev = newOp;
        splitOp.next.next = newOp;
        if (this._using_polytree) {
          if (ClipperBase.path1InsidePath2(prevOp, newOp)) {
            newOutRec.splits = newOutRec.splits || [];
            newOutRec.splits.push(outrec.idx);
          } else {
            outrec.splits = outrec.splits || [];
            outrec.splits.push(newOutRec.idx);
          }
        }
      }
    }
    fixSelfIntersects(outrec) {
      let op2 = outrec.pts;
      for (; ; ) {
        if (op2.prev === op2.next.next)
          break;
        if (InternalClipper.segsIntersect(op2.prev.pt, op2.pt, op2.next.pt, op2.next.next.pt)) {
          this.doSplitOp(outrec, op2);
          if (!outrec.pts)
            return;
          op2 = outrec.pts;
          continue;
        } else {
          op2 = op2.next;
        }
        if (op2 === outrec.pts)
          break;
      }
    }
    static buildPath(op, reverse, isOpen, path) {
      if (op === void 0 || op.next === op || !isOpen && op.next === op.prev)
        return false;
      path.length = 0;
      let lastPt;
      let op2;
      if (reverse) {
        lastPt = op.pt;
        op2 = op.prev;
      } else {
        op = op.next;
        lastPt = op.pt;
        op2 = op.next;
      }
      path.push(lastPt);
      while (op2 !== op) {
        if (op2.pt !== lastPt) {
          lastPt = op2.pt;
          path.push(lastPt);
        }
        if (reverse) {
          op2 = op2.prev;
        } else {
          op2 = op2.next;
        }
      }
      if (path.length === 3 && this.isVerySmallTriangle(op2))
        return false;
      else
        return true;
    }
    buildPaths(solutionClosed, solutionOpen) {
      solutionClosed.length = 0;
      solutionOpen.length = 0;
      let i = 0;
      while (i < this._outrecList.length) {
        const outrec = this._outrecList[i++];
        if (!outrec.pts)
          continue;
        const path = new Path64();
        if (outrec.isOpen) {
          if (ClipperBase.buildPath(outrec.pts, this.reverseSolution, true, path)) {
            solutionOpen.push(path);
          }
        } else {
          this.cleanCollinear(outrec);
          if (ClipperBase.buildPath(outrec.pts, this.reverseSolution, false, path)) {
            solutionClosed.push(path);
          }
        }
      }
      return true;
    }
    static getBoundsPath(path) {
      if (path.length === 0)
        return new Rect64();
      const result = Clipper.InvalidRect64;
      for (const pt of path) {
        if (pt.x < result.left)
          result.left = pt.x;
        if (pt.x > result.right)
          result.right = pt.x;
        if (pt.y < result.top)
          result.top = pt.y;
        if (pt.y > result.bottom)
          result.bottom = pt.y;
      }
      return result;
    }
    checkBounds(outrec) {
      if (outrec.pts === void 0)
        return false;
      if (!outrec.bounds.isEmpty())
        return true;
      this.cleanCollinear(outrec);
      if (outrec.pts === void 0 || !ClipperBase.buildPath(outrec.pts, this.reverseSolution, false, outrec.path))
        return false;
      outrec.bounds = ClipperBase.getBoundsPath(outrec.path);
      return true;
    }
    checkSplitOwner(outrec, splits) {
      for (const i of splits) {
        const split = ClipperBase.getRealOutRec(this._outrecList[i]);
        if (split === void 0 || split === outrec || split.recursiveSplit === outrec)
          continue;
        split.recursiveSplit = outrec;
        if (split.splits !== void 0 && this.checkSplitOwner(outrec, split.splits))
          return true;
        if (ClipperBase.isValidOwner(outrec, split) && this.checkBounds(split) && split.bounds.containsRect(outrec.bounds) && ClipperBase.path1InsidePath2(outrec.pts, split.pts)) {
          outrec.owner = split;
          return true;
        }
      }
      return false;
    }
    recursiveCheckOwners(outrec, polypath) {
      if (outrec.polypath !== void 0 || outrec.bounds.isEmpty())
        return;
      while (outrec.owner !== void 0) {
        if (outrec.owner.splits !== void 0 && this.checkSplitOwner(outrec, outrec.owner.splits))
          break;
        else if (outrec.owner.pts !== void 0 && this.checkBounds(outrec.owner) && ClipperBase.path1InsidePath2(outrec.pts, outrec.owner.pts))
          break;
        outrec.owner = outrec.owner.owner;
      }
      if (outrec.owner !== void 0) {
        if (outrec.owner.polypath === void 0)
          this.recursiveCheckOwners(outrec.owner, polypath);
        outrec.polypath = outrec.owner.polypath.addChild(outrec.path);
      } else {
        outrec.polypath = polypath.addChild(outrec.path);
      }
    }
    buildTree(polytree, solutionOpen) {
      polytree.clear();
      solutionOpen.length = 0;
      let i = 0;
      while (i < this._outrecList.length) {
        const outrec = this._outrecList[i++];
        if (outrec.pts === void 0)
          continue;
        if (outrec.isOpen) {
          const open_path = new Path64();
          if (ClipperBase.buildPath(outrec.pts, this.reverseSolution, true, open_path))
            solutionOpen.push(open_path);
          continue;
        }
        if (this.checkBounds(outrec))
          this.recursiveCheckOwners(outrec, polytree);
      }
    }
    getBounds() {
      const bounds = Clipper.InvalidRect64;
      for (const t of this._vertexList) {
        let v = t;
        do {
          if (v.pt.x < bounds.left)
            bounds.left = v.pt.x;
          if (v.pt.x > bounds.right)
            bounds.right = v.pt.x;
          if (v.pt.y < bounds.top)
            bounds.top = v.pt.y;
          if (v.pt.y > bounds.bottom)
            bounds.bottom = v.pt.y;
          v = v.next;
        } while (v !== t);
      }
      return bounds.isEmpty() ? new Rect64(0, 0, 0, 0) : bounds;
    }
  }
  class Clipper64 extends ClipperBase {
    addPath(path, polytype, isOpen = false) {
      super.addPath(path, polytype, isOpen);
    }
    addReusableData(reusableData) {
      super.addReuseableData(reusableData);
    }
    addPaths(paths, polytype, isOpen = false) {
      super.addPaths(paths, polytype, isOpen);
    }
    addSubjectPaths(paths) {
      this.addPaths(paths, PathType.Subject);
    }
    addOpenSubjectPaths(paths) {
      this.addPaths(paths, PathType.Subject, true);
    }
    addClipPaths(paths) {
      this.addPaths(paths, PathType.Clip);
    }
    execute(clipType, fillRule, solutionClosed, solutionOpen = new Paths64()) {
      solutionClosed.length = 0;
      solutionOpen.length = 0;
      try {
        this.executeInternal(clipType, fillRule);
        this.buildPaths(solutionClosed, solutionOpen);
      } catch (error2) {
        this._succeeded = false;
      }
      this.clearSolutionOnly();
      return this._succeeded;
    }
    executePolyTree(clipType, fillRule, polytree, openPaths = new Paths64()) {
      polytree.clear();
      openPaths.length = 0;
      this._using_polytree = true;
      try {
        this.executeInternal(clipType, fillRule);
        this.buildTree(polytree, openPaths);
      } catch (error2) {
        this._succeeded = false;
      }
      this.clearSolutionOnly();
      return this._succeeded;
    }
  }
  var ClipType;
  (function(ClipType2) {
    ClipType2[ClipType2["None"] = 0] = "None";
    ClipType2[ClipType2["Intersection"] = 1] = "Intersection";
    ClipType2[ClipType2["Union"] = 2] = "Union";
    ClipType2[ClipType2["Difference"] = 3] = "Difference";
    ClipType2[ClipType2["Xor"] = 4] = "Xor";
  })(ClipType || (ClipType = {}));
  var PathType;
  (function(PathType2) {
    PathType2[PathType2["Subject"] = 0] = "Subject";
    PathType2[PathType2["Clip"] = 1] = "Clip";
  })(PathType || (PathType = {}));
  var FillRule;
  (function(FillRule2) {
    FillRule2[FillRule2["EvenOdd"] = 0] = "EvenOdd";
    FillRule2[FillRule2["NonZero"] = 1] = "NonZero";
    FillRule2[FillRule2["Positive"] = 2] = "Positive";
    FillRule2[FillRule2["Negative"] = 3] = "Negative";
  })(FillRule || (FillRule = {}));
  var PipResult;
  (function(PipResult2) {
    PipResult2[PipResult2["Inside"] = 0] = "Inside";
    PipResult2[PipResult2["Outside"] = 1] = "Outside";
    PipResult2[PipResult2["OnEdge"] = 2] = "OnEdge";
  })(PipResult || (PipResult = {}));
  class Path64 extends Array {
  }
  class Paths64 extends Array {
  }
  class Rect64 {
    constructor(lOrIsValidOrRec, t, r, b) {
      if (typeof lOrIsValidOrRec === "boolean") {
        if (lOrIsValidOrRec) {
          this.left = 0;
          this.top = 0;
          this.right = 0;
          this.bottom = 0;
        } else {
          this.left = Number.MAX_SAFE_INTEGER;
          this.top = Number.MAX_SAFE_INTEGER;
          this.right = Number.MIN_SAFE_INTEGER;
          this.bottom = Number.MIN_SAFE_INTEGER;
        }
      } else if (typeof lOrIsValidOrRec === "number") {
        this.left = lOrIsValidOrRec;
        this.top = t;
        this.right = r;
        this.bottom = b;
      } else {
        this.left = lOrIsValidOrRec.left;
        this.top = lOrIsValidOrRec.top;
        this.right = lOrIsValidOrRec.right;
        this.bottom = lOrIsValidOrRec.bottom;
      }
    }
    get width() {
      return this.right - this.left;
    }
    set width(value) {
      this.right = this.left + value;
    }
    get height() {
      return this.bottom - this.top;
    }
    set height(value) {
      this.bottom = this.top + value;
    }
    isEmpty() {
      return this.bottom <= this.top || this.right <= this.left;
    }
    midPoint() {
      return new Point64((this.left + this.right) / 2, (this.top + this.bottom) / 2);
    }
    contains(pt) {
      return pt.x > this.left && pt.x < this.right && pt.y > this.top && pt.y < this.bottom;
    }
    containsRect(rec) {
      return rec.left >= this.left && rec.right <= this.right && rec.top >= this.top && rec.bottom <= this.bottom;
    }
    intersects(rec) {
      return Math.max(this.left, rec.left) <= Math.min(this.right, rec.right) && Math.max(this.top, rec.top) <= Math.min(this.bottom, rec.bottom);
    }
    asPath() {
      const result = new Path64();
      result.push(new Point64(this.left, this.top));
      result.push(new Point64(this.right, this.top));
      result.push(new Point64(this.right, this.bottom));
      result.push(new Point64(this.left, this.bottom));
      return result;
    }
  }
  class Point64 {
    constructor(xOrPt, yOrScale) {
      if (typeof xOrPt === "number" && typeof yOrScale === "number") {
        this.x = Math.round(xOrPt);
        this.y = Math.round(yOrScale);
      } else {
        const pt = xOrPt;
        if (yOrScale !== void 0) {
          this.x = Math.round(pt.x * yOrScale);
          this.y = Math.round(pt.y * yOrScale);
        } else {
          this.x = pt.x;
          this.y = pt.y;
        }
      }
    }
    static equals(lhs, rhs) {
      return lhs.x === rhs.x && lhs.y === rhs.y;
    }
    static notEquals(lhs, rhs) {
      return lhs.x !== rhs.x || lhs.y !== rhs.y;
    }
    static add(lhs, rhs) {
      return new Point64(lhs.x + rhs.x, lhs.y + rhs.y);
    }
    static subtract(lhs, rhs) {
      return new Point64(lhs.x - rhs.x, lhs.y - rhs.y);
    }
    toString() {
      return `${this.x},${this.y} `;
    }
    equals(obj) {
      if (obj instanceof Point64) {
        return Point64.equals(this, obj);
      }
      return false;
    }
  }
  class InternalClipper {
    static checkPrecision(precision) {
      if (precision < -8 || precision > 8)
        throw new Error(this.precision_range_error);
    }
    static isAlmostZero(value) {
      return Math.abs(value) <= this.floatingPointTolerance;
    }
    static crossProduct(pt1, pt2, pt3) {
      return (pt2.x - pt1.x) * (pt3.y - pt2.y) - (pt2.y - pt1.y) * (pt3.x - pt2.x);
    }
    static dotProduct(pt1, pt2, pt3) {
      return (pt2.x - pt1.x) * (pt3.x - pt2.x) + (pt2.y - pt1.y) * (pt3.y - pt2.y);
    }
    static checkCastInt64(val) {
      if (val >= this.max_coord || val <= this.min_coord)
        return this.Invalid64;
      return Math.round(val);
    }
    static getIntersectPt(ln1a, ln1b, ln2a, ln2b) {
      const dy1 = ln1b.y - ln1a.y;
      const dx1 = ln1b.x - ln1a.x;
      const dy2 = ln2b.y - ln2a.y;
      const dx2 = ln2b.x - ln2a.x;
      const det = dy1 * dx2 - dy2 * dx1;
      let ip;
      if (det === 0) {
        ip = new Point64(0, 0);
        return { ip, success: false };
      }
      const t = ((ln1a.x - ln2a.x) * dy2 - (ln1a.y - ln2a.y) * dx2) / det;
      if (t <= 0)
        ip = ln1a;
      else if (t >= 1)
        ip = ln1b;
      else
        ip = new Point64(ln1a.x + t * dx1, ln1a.y + t * dy1);
      return { ip, success: true };
    }
    static getIntersectPoint(ln1a, ln1b, ln2a, ln2b) {
      const dy1 = ln1b.y - ln1a.y;
      const dx1 = ln1b.x - ln1a.x;
      const dy2 = ln2b.y - ln2a.y;
      const dx2 = ln2b.x - ln2a.x;
      const det = dy1 * dx2 - dy2 * dx1;
      let ip;
      if (det === 0) {
        ip = new Point64(0, 0);
        return { ip, success: false };
      }
      const t = ((ln1a.x - ln2a.x) * dy2 - (ln1a.y - ln2a.y) * dx2) / det;
      if (t <= 0)
        ip = ln1a;
      else if (t >= 1)
        ip = ln2a;
      else
        ip = new Point64(ln1a.x + t * dx1, ln1a.y + t * dy1);
      return { ip, success: true };
    }
    static segsIntersect(seg1a, seg1b, seg2a, seg2b, inclusive = false) {
      if (inclusive) {
        const res1 = InternalClipper.crossProduct(seg1a, seg2a, seg2b);
        const res2 = InternalClipper.crossProduct(seg1b, seg2a, seg2b);
        if (res1 * res2 > 0)
          return false;
        const res3 = InternalClipper.crossProduct(seg2a, seg1a, seg1b);
        const res4 = InternalClipper.crossProduct(seg2b, seg1a, seg1b);
        if (res3 * res4 > 0)
          return false;
        return res1 !== 0 || res2 !== 0 || res3 !== 0 || res4 !== 0;
      } else {
        return InternalClipper.crossProduct(seg1a, seg2a, seg2b) * InternalClipper.crossProduct(seg1b, seg2a, seg2b) < 0 && InternalClipper.crossProduct(seg2a, seg1a, seg1b) * InternalClipper.crossProduct(seg2b, seg1a, seg1b) < 0;
      }
    }
    static getClosestPtOnSegment(offPt, seg1, seg2) {
      if (seg1.x === seg2.x && seg1.y === seg2.y)
        return seg1;
      const dx = seg2.x - seg1.x;
      const dy = seg2.y - seg1.y;
      let q = ((offPt.x - seg1.x) * dx + (offPt.y - seg1.y) * dy) / (dx * dx + dy * dy);
      if (q < 0)
        q = 0;
      else if (q > 1)
        q = 1;
      return new Point64(seg1.x + Math.round(q * dx), seg1.y + Math.round(q * dy));
    }
    static pointInPolygon(pt, polygon) {
      const len = polygon.length;
      let start = 0;
      if (len < 3)
        return PointInPolygonResult.IsOutside;
      while (start < len && polygon[start].y === pt.y)
        start++;
      if (start === len)
        return PointInPolygonResult.IsOutside;
      let d = 0;
      let isAbove = polygon[start].y < pt.y;
      const startingAbove = isAbove;
      let val = 0;
      let i = start + 1;
      let end = len;
      for (; ; ) {
        if (i === end) {
          if (end === 0 || start === 0)
            break;
          end = start;
          i = 0;
        }
        if (isAbove) {
          while (i < end && polygon[i].y < pt.y)
            i++;
          if (i === end)
            continue;
        } else {
          while (i < end && polygon[i].y > pt.y)
            i++;
          if (i === end)
            continue;
        }
        const curr = polygon[i];
        const prev = i > 0 ? polygon[i - 1] : polygon[len - 1];
        if (curr.y === pt.y) {
          if (curr.x === pt.x || curr.y === prev.y && pt.x < prev.x !== pt.x < curr.x)
            return PointInPolygonResult.IsOn;
          i++;
          if (i === start)
            break;
          continue;
        }
        if (pt.x < curr.x && pt.x < prev.x) ;
        else if (pt.x > prev.x && pt.x > curr.x) {
          val = 1 - val;
        } else {
          d = InternalClipper.crossProduct(prev, curr, pt);
          if (d === 0)
            return PointInPolygonResult.IsOn;
          if (d < 0 === isAbove)
            val = 1 - val;
        }
        isAbove = !isAbove;
        i++;
      }
      if (isAbove !== startingAbove) {
        if (i === len)
          i = 0;
        else
          d = InternalClipper.crossProduct(polygon[i - 1], polygon[i], pt);
        if (d === 0)
          return PointInPolygonResult.IsOn;
        if (d < 0 === isAbove)
          val = 1 - val;
      }
      if (val === 0)
        return PointInPolygonResult.IsOutside;
      return PointInPolygonResult.IsInside;
    }
  }
  InternalClipper.MaxInt64 = 9223372036854776e3;
  InternalClipper.MaxCoord = InternalClipper.MaxInt64 / 4;
  InternalClipper.max_coord = InternalClipper.MaxCoord;
  InternalClipper.min_coord = -InternalClipper.MaxCoord;
  InternalClipper.Invalid64 = InternalClipper.MaxInt64;
  InternalClipper.defaultArcTolerance = 0.25;
  InternalClipper.floatingPointTolerance = 1e-12;
  InternalClipper.defaultMinimumEdgeLength = 0.1;
  InternalClipper.precision_range_error = "Error: Precision is out of range.";
  const DIRECTION_EPSILON = 1e-3;
  const DIST_EPSILON = 100;
  function sameDirection(p0, p1, p2) {
    const dx1 = p1.x - p0.x;
    const dy1 = p1.y - p0.y;
    const dx2 = p2.x - p1.x;
    const dy2 = p2.y - p1.y;
    const s1 = dx1 / dy1;
    const s2 = dx2 / dy2;
    return Math.abs(s1 - s2) < DIRECTION_EPSILON;
  }
  function areClose(p0, p1) {
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    return Math.sqrt(dx * dx + dy * dy) < DIST_EPSILON;
  }
  function areEqual(p0, p1) {
    return p0.x === p1.x && p0.y === p1.y;
  }
  function compressPoints(points) {
    for (let k = 0; k < points.length; k++) {
      const v = points[k];
      while (true) {
        const k1 = k + 1;
        if (points.length > k1 && (areEqual(v, points[k1]) || areClose(v, points[k1]))) {
          points.splice(k1, 1);
        } else {
          break;
        }
      }
      while (true) {
        const k1 = k + 1;
        const k2 = k + 2;
        if (points.length > k2 && sameDirection(v, points[k1], points[k2])) {
          points.splice(k + 1, 1);
        } else {
          break;
        }
      }
    }
  }
  function xzToXzCopy(v, target) {
    target.x = v.x;
    target.y = v.z;
  }
  function epsEquals(a, b) {
    return Math.abs(a - b) <= 500;
  }
  function vectorEpsEquals(v0, v1) {
    return epsEquals(v0.x, v1.x) && epsEquals(v0.y, v1.y) && epsEquals(v0.z, v1.z);
  }
  function triangleIsInsidePaths(tri, paths) {
    const indices = ["a", "b", "c"];
    const edges = [new Line3(), new Line3(), new Line3()];
    const line = new Line3();
    const ray = new Line3();
    ray.start.set(0, 0, 0).addScaledVector(tri.a, 1 / 3).addScaledVector(tri.b, 1 / 3).addScaledVector(tri.c, 1 / 3);
    xzToXzCopy(ray.start, ray.start);
    ray.end.copy(ray.start);
    ray.end.y += 1e10;
    for (let i = 0; i < 3; i++) {
      const i1 = (i + 1) % 3;
      const p0 = tri[indices[i]];
      const p1 = tri[indices[i1]];
      const edge = edges[i];
      xzToXzCopy(p0, edge.start);
      xzToXzCopy(p1, edge.end);
    }
    let crossCount = 0;
    for (let p = 0, pl = paths.length; p < pl; p++) {
      const points = paths[p];
      for (let i = 0, l = points.length; i < l; i++) {
        const i1 = (i + 1) % l;
        line.start.copy(points[i]);
        line.start.z = 0;
        line.end.copy(points[i1]);
        line.end.z = 0;
        if (lineCrossesLine(ray, line)) {
          crossCount++;
        }
        for (let e = 0; e < 3; e++) {
          const edge = edges[e];
          if (lineCrossesLine(edge, line) || vectorEpsEquals(edge.start, line.start) || vectorEpsEquals(edge.end, line.end) || vectorEpsEquals(edge.end, line.start) || vectorEpsEquals(edge.start, line.end)) {
            return false;
          }
        }
      }
    }
    return crossCount % 2 === 1;
  }
  function lineCrossesLine(l1, l2) {
    function ccw(A2, B2, C2) {
      return (C2.y - A2.y) * (B2.x - A2.x) > (B2.y - A2.y) * (C2.x - A2.x);
    }
    const A = l1.start;
    const B = l1.end;
    const C = l2.start;
    const D = l2.end;
    return ccw(A, C, D) !== ccw(B, C, D) && ccw(A, B, C) !== ccw(A, B, D);
  }
  function getTriCount(geometry) {
    const { index } = geometry;
    const posAttr = geometry.attributes.position;
    return index ? index.count / 3 : posAttr.count / 3;
  }
  const _tri$1 = new Triangle();
  function getSizeSortedTriList(geometry) {
    const index = geometry.index;
    const posAttr = geometry.attributes.position;
    const triCount = getTriCount(geometry);
    return new Array(triCount).fill().map((v, i) => {
      let i0 = i * 3 + 0;
      let i1 = i * 3 + 1;
      let i2 = i * 3 + 2;
      if (index) {
        i0 = index.getX(i0);
        i1 = index.getX(i1);
        i2 = index.getX(i2);
      }
      _tri$1.a.fromBufferAttribute(posAttr, i0);
      _tri$1.b.fromBufferAttribute(posAttr, i1);
      _tri$1.c.fromBufferAttribute(posAttr, i2);
      _tri$1.a.y = 0;
      _tri$1.b.y = 0;
      _tri$1.c.y = 0;
      return {
        area: _tri$1.getArea(),
        index: i
      };
    }).sort((a, b) => {
      return b.area - a.area;
    }).map((o) => {
      return o.index;
    });
  }
  const AREA_EPSILON = 1e-8;
  const UP_VECTOR = /* @__PURE__ */ new Vector3(0, 1, 0);
  const _tri = /* @__PURE__ */ new Triangle();
  const _normal = /* @__PURE__ */ new Vector3();
  const _center = /* @__PURE__ */ new Vector3();
  const _vec = /* @__PURE__ */ new Vector3();
  function convertPathToGeometry(path, scale) {
    const vector2s = path.map((points) => {
      return points.flatMap((v) => new Vector2(v.x / scale, v.y / scale));
    });
    const holesShapes = vector2s.filter((p) => ShapeUtils.isClockWise(p)).map((p) => new Shape(p));
    const solidShapes = vector2s.filter((p) => !ShapeUtils.isClockWise(p)).map((p) => {
      const shape = new Shape(p);
      shape.holes = holesShapes;
      return shape;
    });
    const result = new ShapeGeometry(solidShapes).rotateX(Math.PI / 2);
    result.index.array.reverse();
    return result;
  }
  function convertPathToLineSegments(path, scale) {
    const arr = [];
    path.forEach((points) => {
      for (let i = 0, l = points.length; i < l; i++) {
        const i1 = (i + 1) % points.length;
        const p0 = points[i];
        const p1 = points[i1];
        arr.push(
          new Vector3(p0.x / scale, 0, p0.y / scale),
          new Vector3(p1.x / scale, 0, p1.y / scale)
        );
      }
    });
    const result = new BufferGeometry();
    result.setFromPoints(arr);
    return result;
  }
  const OUTPUT_MESH = 0;
  const OUTPUT_LINE_SEGMENTS = 1;
  const OUTPUT_BOTH = 2;
  class SilhouetteGenerator {
    constructor() {
      this.iterationTime = 30;
      this.intScalar = 1e9;
      this.doubleSided = false;
      this.sortTriangles = false;
      this.output = OUTPUT_MESH;
    }
    generateAsync(geometry, options = {}) {
      return new Promise((resolve, reject) => {
        const { signal } = options;
        const task = this.generate(geometry, options);
        run();
        function run() {
          if (signal && signal.aborted) {
            reject(new Error("SilhouetteGenerator: Process aborted via AbortSignal."));
            return;
          }
          const result = task.next();
          if (result.done) {
            resolve(result.value);
          } else {
            requestAnimationFrame(run);
          }
        }
      });
    }
    *generate(geometry, options = {}) {
      const { iterationTime, intScalar, doubleSided, output, sortTriangles } = this;
      const { onProgress } = options;
      const power = Math.log10(intScalar);
      const extendMultiplier = Math.pow(10, -(power - 2));
      const index = geometry.index;
      const posAttr = geometry.attributes.position;
      const triCount = getTriCount(geometry);
      let overallPath = null;
      const triList = sortTriangles ? getSizeSortedTriList(geometry) : new Array(triCount).fill().map((v, i) => i);
      const handle = {
        getGeometry() {
          if (output === OUTPUT_MESH) {
            return convertPathToGeometry(overallPath, intScalar);
          } else if (output === OUTPUT_LINE_SEGMENTS) {
            return convertPathToLineSegments(overallPath, intScalar);
          } else {
            return [
              convertPathToGeometry(overallPath, intScalar),
              convertPathToLineSegments(overallPath, intScalar)
            ];
          }
        }
      };
      let time = performance.now();
      for (let ti = 0; ti < triCount; ti++) {
        const i = triList[ti] * 3;
        let i0 = i + 0;
        let i1 = i + 1;
        let i2 = i + 2;
        if (index) {
          i0 = index.getX(i0);
          i1 = index.getX(i1);
          i2 = index.getX(i2);
        }
        const { a, b, c } = _tri;
        a.fromBufferAttribute(posAttr, i0);
        b.fromBufferAttribute(posAttr, i1);
        c.fromBufferAttribute(posAttr, i2);
        if (!doubleSided) {
          _tri.getNormal(_normal);
          if (_normal.dot(UP_VECTOR) < 0) {
            continue;
          }
        }
        a.y = 0;
        b.y = 0;
        c.y = 0;
        if (_tri.getArea() < AREA_EPSILON) {
          continue;
        }
        _center.copy(a).add(b).add(c).multiplyScalar(1 / 3);
        _vec.subVectors(a, _center).normalize();
        a.addScaledVector(_vec, extendMultiplier);
        _vec.subVectors(b, _center).normalize();
        b.addScaledVector(_vec, extendMultiplier);
        _vec.subVectors(c, _center).normalize();
        c.addScaledVector(_vec, extendMultiplier);
        const path = new Path64();
        path.push(Clipper.makePath([
          a.x * intScalar,
          a.z * intScalar,
          b.x * intScalar,
          b.z * intScalar,
          c.x * intScalar,
          c.z * intScalar
        ]));
        a.multiplyScalar(intScalar);
        b.multiplyScalar(intScalar);
        c.multiplyScalar(intScalar);
        if (overallPath && triangleIsInsidePaths(_tri, overallPath)) {
          continue;
        }
        if (overallPath === null) {
          overallPath = path;
        } else {
          overallPath = Clipper.Union(overallPath, path, FillRule.NonZero);
          overallPath.forEach((path2) => compressPoints(path2));
        }
        const delta = performance.now() - time;
        if (delta > iterationTime) {
          if (onProgress) {
            const progress = ti / triCount;
            onProgress(progress, handle);
          }
          yield;
          time = performance.now();
        }
      }
      return handle.getGeometry();
    }
  }
  onmessage = function({ data }) {
    let prevTime = performance.now();
    function onProgressCallback(progress) {
      const currTime = performance.now();
      if (currTime - prevTime >= 10 || progress === 1) {
        postMessage({
          error: null,
          progress
        });
        prevTime = currTime;
      }
    }
    try {
      const { index, position, options } = data;
      const geometry = new BufferGeometry();
      geometry.setIndex(new BufferAttribute(index, 1, false));
      geometry.setAttribute("position", new BufferAttribute(position, 3, false));
      const generator = new SilhouetteGenerator();
      generator.doubleSided = options.doubleSided ?? generator.doubleSided;
      generator.output = options.output ?? generator.output;
      generator.intScalar = options.intScalar ?? generator.intScalar;
      generator.sortTriangles = options.sortTriangles ?? generator.sortTriangles;
      const task = generator.generate(geometry, {
        onProgress: onProgressCallback
      });
      let result = task.next();
      while (!result.done) {
        result = task.next();
      }
      let buffers, output;
      if (generator.output === OUTPUT_BOTH) {
        buffers = [];
        output = [];
        result.value.forEach((g) => {
          var _a;
          console.log(g);
          const posArr = g.attributes.position.array;
          const indexArr = ((_a = g.index) == null ? void 0 : _a.array) || null;
          output.push({
            position: posArr,
            index: indexArr
          });
          buffers.push(
            posArr.buffer,
            indexArr == null ? void 0 : indexArr.buffer
          );
        });
      } else {
        const posArr = result.value.attributes.position.array;
        const indexArr = result.value.index.array;
        output = {
          position: posArr,
          index: indexArr
        };
        buffers = [posArr.buffer, indexArr.buffer];
      }
      postMessage({
        result: output,
        error: null,
        progress: 1
      }, buffers.filter((b) => !!b));
    } catch (error2) {
      postMessage({
        error: error2,
        progress: 1
      });
    }
  };
})();
//# sourceMappingURL=silhouetteAsync.worker-Sr2D9vbb.js.map
