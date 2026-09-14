/* ============================================================
   Tiny QR encoder — byte mode, versions 1-40, ECC L/M/Q/H.
   No dependencies, no network. Returns a boolean matrix.
   ============================================================ */
var QR = (function () {
  var ECC_CW = {
    L: [-1,7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,28,28,28,28,30,30,26,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],
    M: [-1,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28],
    Q: [-1,13,22,18,26,18,24,18,22,20,24,28,26,24,20,30,24,28,28,26,30,28,30,30,30,30,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],
    H: [-1,17,28,22,16,22,28,26,26,24,28,24,28,22,24,24,30,28,28,26,28,30,24,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30]
  };
  var ECC_BLOCKS = {
    L: [-1,1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25],
    M: [-1,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49],
    Q: [-1,1,1,2,2,4,4,6,6,8,8,8,10,12,16,12,17,16,18,21,20,23,23,25,27,29,34,34,35,38,40,43,45,48,51,53,56,59,62,65,68],
    H: [-1,1,1,2,4,4,4,5,6,8,8,11,11,16,16,18,16,19,21,25,25,25,34,30,32,35,37,40,42,45,48,51,54,57,60,63,66,70,74,77,81]
  };
  var ECL_BITS = { L: 1, M: 0, Q: 3, H: 2 };

  function rawDataModules(ver) {
    var result = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
      var numAlign = Math.floor(ver / 7) + 2;
      result -= (25 * numAlign - 10) * numAlign - 55;
      if (ver >= 7) result -= 36;
    }
    return result;
  }
  function dataCodewords(ver, ecl) {
    return Math.floor(rawDataModules(ver) / 8) - ECC_CW[ecl][ver] * ECC_BLOCKS[ecl][ver];
  }
  function alignPositions(ver) {
    if (ver === 1) return [];
    var numAlign = Math.floor(ver / 7) + 2;
    var step = (ver === 32) ? 26 : Math.ceil((ver * 4 + 4) / (numAlign * 2 - 2)) * 2;
    var result = [6];
    for (var pos = ver * 4 + 10; result.length < numAlign; pos -= step) result.splice(1, 0, pos);
    return result;
  }

  /* ---- Galois field arithmetic (GF(256), poly 0x11D) ---- */
  function gfMul(x, y) {
    var z = 0;
    for (var i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11D);
      z ^= ((y >>> i) & 1) * x;
    }
    return z & 0xFF;
  }
  function rsDivisor(degree) {
    var result = [];
    for (var i = 0; i < degree - 1; i++) result.push(0);
    result.push(1);
    var root = 1;
    for (var i = 0; i < degree; i++) {
      for (var j = 0; j < result.length; j++) {
        result[j] = gfMul(result[j], root);
        if (j + 1 < result.length) result[j] ^= result[j + 1];
      }
      root = gfMul(root, 0x02);
    }
    return result;
  }
  function rsRemainder(data, divisor) {
    var result = divisor.map(function () { return 0; });
    data.forEach(function (b) {
      var factor = b ^ result.shift();
      result.push(0);
      divisor.forEach(function (d, i) { result[i] ^= gfMul(d, factor); });
    });
    return result;
  }

  /* ---- UTF-8 bytes ---- */
  function toBytes(str) {
    var out = [];
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) { out.push(0xC0 | (c >> 6), 0x80 | (c & 63)); }
      else if (c >= 0xD800 && c < 0xDC00 && i + 1 < str.length) {
        var c2 = str.charCodeAt(++i);
        var cp = 0x10000 + ((c - 0xD800) << 10) + (c2 - 0xDC00);
        out.push(0xF0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
      } else { out.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63)); }
    }
    return out;
  }

  function encode(text, ecl, minVersion) {
    ecl = ecl || 'M';
    var bytes = toBytes(text);
    var ver = -1;
    for (var v = (minVersion || 1); v <= 40; v++) {
      var cap = dataCodewords(v, ecl) * 8;
      var ccBits = (v <= 9) ? 8 : 16;
      if (4 + ccBits + bytes.length * 8 <= cap) { ver = v; break; }
    }
    if (ver < 0) throw new Error('Data too long for a QR code');

    /* ---- bit stream ---- */
    var bits = [];
    function append(val, len) { for (var i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); }
    append(4, 4);
    append(bytes.length, ver <= 9 ? 8 : 16);
    bytes.forEach(function (b) { append(b, 8); });

    var capacity = dataCodewords(ver, ecl) * 8;
    append(0, Math.min(4, capacity - bits.length));
    append(0, (8 - bits.length % 8) % 8);
    for (var pad = 0xEC; bits.length < capacity; pad ^= 0xEC ^ 0x11) append(pad, 8);

    var dataCw = [];
    for (var i = 0; i < bits.length; i += 8) {
      var b = 0;
      for (var j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
      dataCw.push(b);
    }

    /* ---- error correction + interleave ---- */
    var numBlocks = ECC_BLOCKS[ecl][ver];
    var blockEccLen = ECC_CW[ecl][ver];
    var rawCw = Math.floor(rawDataModules(ver) / 8);
    var numShort = numBlocks - rawCw % numBlocks;
    var shortLen = Math.floor(rawCw / numBlocks) - blockEccLen;

    var blocks = [], divisor = rsDivisor(blockEccLen), k = 0;
    for (var i = 0; i < numBlocks; i++) {
      var len = shortLen + (i < numShort ? 0 : 1);
      var dat = dataCw.slice(k, k + len);
      k += len;
      blocks.push(dat.concat(rsRemainder(dat, divisor)));
    }
    var allCw = [];
    var maxLen = shortLen + 1;
    for (var i = 0; i < maxLen; i++)
      for (var j = 0; j < numBlocks; j++)
        if (i !== shortLen || j >= numShort) allCw.push(blocks[j][i]);
    for (var i = 0; i < blockEccLen; i++)
      for (var j = 0; j < numBlocks; j++)
        allCw.push(blocks[j][blocks[j].length - blockEccLen + i]);

    /* ---- matrix ---- */
    var size = ver * 4 + 17;
    var mod = [], fn = [];
    for (var y = 0; y < size; y++) { mod.push(new Array(size).fill(false)); fn.push(new Array(size).fill(false)); }

    function setFn(x, y, dark) {
      if (x < 0 || y < 0 || x >= size || y >= size) return;
      mod[y][x] = dark; fn[y][x] = true;
    }
    function finder(x, y) {
      for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) {
        var d = Math.max(Math.abs(dx), Math.abs(dy));
        setFn(x + dx, y + dy, d !== 2 && d !== 4);
      }
    }
    /* timing */
    for (var i = 0; i < size; i++) { setFn(6, i, i % 2 === 0); setFn(i, 6, i % 2 === 0); }
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);

    var ap = alignPositions(ver);
    for (var i = 0; i < ap.length; i++) for (var j = 0; j < ap.length; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === ap.length - 1) || (i === ap.length - 1 && j === 0)) continue;
      for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++)
        setFn(ap[j] + dx, ap[i] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }

    function drawFormat(mask) {
      var data = ECL_BITS[ecl] << 3 | mask;
      var rem = data;
      for (var i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      var bitsF = ((data << 10) | rem) ^ 0x5412;
      function g(i) { return ((bitsF >>> i) & 1) !== 0; }
      for (var i = 0; i <= 5; i++) setFn(8, i, g(i));
      setFn(8, 7, g(6)); setFn(8, 8, g(7)); setFn(7, 8, g(8));
      for (var i = 9; i < 15; i++) setFn(14 - i, 8, g(i));
      for (var i = 0; i < 8; i++) setFn(size - 1 - i, 8, g(i));
      for (var i = 8; i < 15; i++) setFn(8, size - 15 + i, g(i));
      setFn(8, size - 8, true);
    }
    if (ver >= 7) {
      var rem = ver;
      for (var i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
      var bitsV = ver << 12 | rem;
      for (var i = 0; i < 18; i++) {
        var bit = ((bitsV >>> i) & 1) !== 0;
        var a = size - 11 + i % 3, b = Math.floor(i / 3);
        setFn(a, b, bit); setFn(b, a, bit);
      }
    }
    drawFormat(0);

    /* ---- place data ---- */
    var idx = 0;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) {
        for (var j = 0; j < 2; j++) {
          var x = right - j;
          var upward = ((right + 1) & 2) === 0;
          var y = upward ? size - 1 - vert : vert;
          if (!fn[y][x] && idx < allCw.length * 8) {
            mod[y][x] = ((allCw[idx >>> 3] >>> (7 - (idx & 7))) & 1) !== 0;
            idx++;
          }
        }
      }
    }

    function applyMask(m) {
      for (var y = 0; y < size; y++) for (var x = 0; x < size; x++) {
        if (fn[y][x]) continue;
        var invert;
        switch (m) {
          case 0: invert = (x + y) % 2 === 0; break;
          case 1: invert = y % 2 === 0; break;
          case 2: invert = x % 3 === 0; break;
          case 3: invert = (x + y) % 3 === 0; break;
          case 4: invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
          case 5: invert = x * y % 2 + x * y % 3 === 0; break;
          case 6: invert = (x * y % 2 + x * y % 3) % 2 === 0; break;
          case 7: invert = ((x + y) % 2 + x * y % 3) % 2 === 0; break;
        }
        if (invert) mod[y][x] = !mod[y][x];
      }
    }
    function penalty() {
      var p = 0;
      for (var y = 0; y < size; y++) {
        var run = 1, hist = [];
        for (var x = 1; x < size; x++) {
          if (mod[y][x] === mod[y][x - 1]) { run++; }
          else { if (run >= 5) p += 3 + (run - 5); hist.push(run); run = 1; }
        }
        if (run >= 5) p += 3 + (run - 5);
      }
      for (var x = 0; x < size; x++) {
        var run = 1;
        for (var y = 1; y < size; y++) {
          if (mod[y][x] === mod[y - 1][x]) run++;
          else { if (run >= 5) p += 3 + (run - 5); run = 1; }
        }
        if (run >= 5) p += 3 + (run - 5);
      }
      for (var y = 0; y < size - 1; y++) for (var x = 0; x < size - 1; x++) {
        var c = mod[y][x];
        if (c === mod[y][x + 1] && c === mod[y + 1][x] && c === mod[y + 1][x + 1]) p += 3;
      }
      var pat = [true, false, true, true, true, false, true];
      function matchAt(get, i, n) {
        for (var k2 = 0; k2 < 7; k2++) if (get(i + k2) !== pat[k2]) return false;
        var before = true, after = true;
        for (var k2 = 1; k2 <= 4; k2++) { if (i - k2 >= 0 && get(i - k2)) before = false; }
        for (var k2 = 0; k2 < 4; k2++) { if (i + 7 + k2 < n && get(i + 7 + k2)) after = false; }
        return before || after;
      }
      for (var y = 0; y < size; y++) for (var x = 0; x + 7 <= size; x++)
        if (matchAt(function (i) { return i >= 0 && i < size ? mod[y][i] : false; }, x, size)) p += 40;
      for (var x = 0; x < size; x++) for (var y = 0; y + 7 <= size; y++)
        if (matchAt(function (i) { return i >= 0 && i < size ? mod[i][x] : false; }, y, size)) p += 40;
      var dark = 0;
      for (var y = 0; y < size; y++) for (var x = 0; x < size; x++) if (mod[y][x]) dark++;
      var total = size * size;
      var kk = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
      p += kk * 10;
      return p;
    }

    var bestMask = 0, minPenalty = Infinity;
    for (var m = 0; m < 8; m++) {
      applyMask(m); drawFormat(m);
      var pen = penalty();
      if (pen < minPenalty) { minPenalty = pen; bestMask = m; }
      applyMask(m);
    }
    applyMask(bestMask); drawFormat(bestMask);

    return { size: size, modules: mod, version: ver, ecl: ecl };
  }

  function toSvg(qr, border, dark, light) {
    border = border == null ? 2 : border;
    var dim = qr.size + border * 2;
    var parts = [];
    for (var y = 0; y < qr.size; y++) for (var x = 0; x < qr.size; x++)
      if (qr.modules[y][x]) parts.push('M' + (x + border) + ',' + (y + border) + 'h1v1h-1z');
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + dim + ' ' + dim + '" shape-rendering="crispEdges">' +
      '<rect width="100%" height="100%" fill="' + (light || '#fff') + '"/>' +
      '<path d="' + parts.join('') + '" fill="' + (dark || '#000') + '"/></svg>';
  }

  return { encode: encode, toSvg: toSvg };
})();
