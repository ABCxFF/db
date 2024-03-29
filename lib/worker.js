const { parentPort } = require('worker_threads');

const sha256 = (function(t) {
	var e = {};
	! function(e) {
		"use strict";
		e.__esModule = true, e.digestLength = 32, e.blockSize = 64;
		var y = new Uint32Array([1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298]);

		function a(t, e, i, r, s) {
			var n, h, a, f, o, u, d, v, p, c, g, l, b;
			while (s >= 64) {
				n = e[0];
				h = e[1];
				a = e[2];
				f = e[3];
				o = e[4];
				u = e[5];
				d = e[6];
				v = e[7];
				for (c = 0; c < 16; c++) {
					g = r + c * 4;
					t[c] = (i[g] & 255) << 24 | (i[g + 1] & 255) << 16 | (i[g + 2] & 255) << 8 | i[g + 3] & 255
				}
				for (c = 16; c < 64; c++) {
					p = t[c - 2];
					l = (p >>> 17 | p << 32 - 17) ^ (p >>> 19 | p << 32 - 19) ^ p >>> 10;
					p = t[c - 15];
					b = (p >>> 7 | p << 32 - 7) ^ (p >>> 18 | p << 32 - 18) ^ p >>> 3;
					t[c] = (l + t[c - 7] | 0) + (b + t[c - 16] | 0)
				}
				for (c = 0; c < 64; c++) {
					l = (((o >>> 6 | o << 32 - 6) ^ (o >>> 11 | o << 32 - 11) ^ (o >>> 25 | o << 32 - 25)) + (o & u ^ ~o & d) | 0) + (v + (y[c] + t[c] | 0) | 0) | 0;
					b = ((n >>> 2 | n << 32 - 2) ^ (n >>> 13 | n << 32 - 13) ^ (n >>> 22 | n << 32 - 22)) + (n & h ^ n & a ^ h & a) | 0;
					v = d;
					d = u;
					u = o;
					o = f + l | 0;
					f = a;
					a = h;
					h = n;
					n = l + b | 0
				}
				e[0] += n;
				e[1] += h;
				e[2] += a;
				e[3] += f;
				e[4] += o;
				e[5] += u;
				e[6] += d;
				e[7] += v;
				r += 64;
				s -= 64
			}
			return r
		}
		var r = function() {
			function t() {
				this.digestLength = e.digestLength;
				this.blockSize = e.blockSize;
				this.state = new Int32Array(8);
				this.temp = new Int32Array(64);
				this.buffer = new Uint8Array(128);
				this.bufferLength = 0;
				this.bytesHashed = 0;
				this.finished = false;
				this.reset()
			}
			t.prototype.reset = function() {
				this.state[0] = 1779033703;
				this.state[1] = 3144134277;
				this.state[2] = 1013904242;
				this.state[3] = 2773480762;
				this.state[4] = 1359893119;
				this.state[5] = 2600822924;
				this.state[6] = 528734635;
				this.state[7] = 1541459225;
				this.bufferLength = 0;
				this.bytesHashed = 0;
				this.finished = false;
				return this
			};
			t.prototype.clean = function() {
				for (var t = 0; t < this.buffer.length; t++) {
					this.buffer[t] = 0
				}
				for (var t = 0; t < this.temp.length; t++) {
					this.temp[t] = 0
				}
				this.reset()
			};
			t.prototype.update = function(t, e) {
				if (e === void 0) {
					e = t.length
				}
				if (this.finished) {
					throw new Error("SHA256: can't update because hash was finished.")
				}
				var i = 0;
				this.bytesHashed += e;
				if (this.bufferLength > 0) {
					while (this.bufferLength < 64 && e > 0) {
						this.buffer[this.bufferLength++] = t[i++];
						e--
					}
					if (this.bufferLength === 64) {
						a(this.temp, this.state, this.buffer, 0, 64);
						this.bufferLength = 0
					}
				}
				if (e >= 64) {
					i = a(this.temp, this.state, t, i, e);
					e %= 64
				}
				while (e > 0) {
					this.buffer[this.bufferLength++] = t[i++];
					e--
				}
				return this
			};
			t.prototype.finish = function(t) {
				if (!this.finished) {
					var e = this.bytesHashed;
					var i = this.bufferLength;
					var r = e / 536870912 | 0;
					var s = e << 3;
					var n = e % 64 < 56 ? 64 : 128;
					this.buffer[i] = 128;
					for (var h = i + 1; h < n - 8; h++) {
						this.buffer[h] = 0
					}
					this.buffer[n - 8] = r >>> 24 & 255;
					this.buffer[n - 7] = r >>> 16 & 255;
					this.buffer[n - 6] = r >>> 8 & 255;
					this.buffer[n - 5] = r >>> 0 & 255;
					this.buffer[n - 4] = s >>> 24 & 255;
					this.buffer[n - 3] = s >>> 16 & 255;
					this.buffer[n - 2] = s >>> 8 & 255;
					this.buffer[n - 1] = s >>> 0 & 255;
					a(this.temp, this.state, this.buffer, 0, n);
					this.finished = true
				}
				for (var h = 0; h < 8; h++) {
					t[h * 4 + 0] = this.state[h] >>> 24 & 255;
					t[h * 4 + 1] = this.state[h] >>> 16 & 255;
					t[h * 4 + 2] = this.state[h] >>> 8 & 255;
					t[h * 4 + 3] = this.state[h] >>> 0 & 255
				}
				return this
			};
			t.prototype.digest = function() {
				var t = new Uint8Array(this.digestLength);
				this.finish(t);
				return t
			};
			t.prototype._saveState = function(t) {
				for (var e = 0; e < this.state.length; e++) {
					t[e] = this.state[e]
				}
			};
			t.prototype._restoreState = function(t, e) {
				for (var i = 0; i < this.state.length; i++) {
					this.state[i] = t[i]
				}
				this.bytesHashed = e;
				this.finished = false;
				this.bufferLength = 0
			};
			return t
		}();
		e.Hash = r;
		var c = function() {
			function t(t) {
				this.inner = new r;
				this.outer = new r;
				this.blockSize = this.inner.blockSize;
				this.digestLength = this.inner.digestLength;
				var e = new Uint8Array(this.blockSize);
				if (t.length > this.blockSize) {
					(new r).update(t).finish(e).clean()
				} else {
					for (var i = 0; i < t.length; i++) {
						e[i] = t[i]
					}
				}
				for (var i = 0; i < e.length; i++) {
					e[i] ^= 54
				}
				this.inner.update(e);
				for (var i = 0; i < e.length; i++) {
					e[i] ^= 54 ^ 92
				}
				this.outer.update(e);
				this.istate = new Uint32Array(8);
				this.ostate = new Uint32Array(8);
				this.inner._saveState(this.istate);
				this.outer._saveState(this.ostate);
				for (var i = 0; i < e.length; i++) {
					e[i] = 0
				}
			}
			t.prototype.reset = function() {
				this.inner._restoreState(this.istate, this.inner.blockSize);
				this.outer._restoreState(this.ostate, this.outer.blockSize);
				return this
			};
			t.prototype.clean = function() {
				for (var t = 0; t < this.istate.length; t++) {
					this.ostate[t] = this.istate[t] = 0
				}
				this.inner.clean();
				this.outer.clean()
			};
			t.prototype.update = function(t) {
				this.inner.update(t);
				return this
			};
			t.prototype.finish = function(t) {
				if (this.outer.finished) {
					this.outer.finish(t)
				} else {
					this.inner.finish(t);
					this.outer.update(t, this.digestLength).finish(t)
				}
				return this
			};
			t.prototype.digest = function() {
				var t = new Uint8Array(this.digestLength);
				this.finish(t);
				return t
			};
			return t
		}();

		function t(t) {
			var e = (new r).update(t);
			var i = e.digest();
			e.clean();
			return i
		}

		function d(t, e) {
			var i = new c(t).update(e);
			var r = i.digest();
			i.clean();
			return r
		}

		function v(t, e, i, r) {
			var s = r[0];
			if (s === 0) {
				throw new Error("hkdf: cannot expand more")
			}
			e.reset();
			if (s > 1) {
				e.update(t)
			}
			if (i) {
				e.update(i)
			}
			e.update(r);
			e.finish(t);
			r[0]++
		}
		e.HMAC = c, e.hash = t, e["default"] = t, e.hmac = d;
		var p = new Uint8Array(e.digestLength);

		function i(t, e, i, r) {
			if (e === void 0) {
				e = p
			}
			if (r === void 0) {
				r = 32
			}
			var s = new Uint8Array([1]);
			var n = d(e, t);
			var h = new c(n);
			var a = new Uint8Array(h.digestLength);
			var f = a.length;
			var o = new Uint8Array(r);
			for (var u = 0; u < r; u++) {
				if (f === a.length) {
					v(a, h, i, s);
					f = 0
				}
				o[u] = a[f++]
			}
			h.clean();
			a.fill(0);
			s.fill(0);
			return o
		}

		function s(t, e, i, r) {
			var s = new c(t);
			var n = s.digestLength;
			var h = new Uint8Array(4);
			var a = new Uint8Array(n);
			var f = new Uint8Array(n);
			var o = new Uint8Array(r);
			for (var u = 0; u * n < r; u++) {
				var d = u + 1;
				h[0] = d >>> 24 & 255;
				h[1] = d >>> 16 & 255;
				h[2] = d >>> 8 & 255;
				h[3] = d >>> 0 & 255;
				s.reset();
				s.update(e);
				s.update(h);
				s.finish(f);
				for (var v = 0; v < n; v++) {
					a[v] = f[v]
				}
				for (var v = 2; v <= i; v++) {
					s.reset();
					s.update(f).finish(f);
					for (var p = 0; p < n; p++) {
						a[p] ^= f[p]
					}
				}
				for (var v = 0; v < n && u * n + v < r; v++) {
					o[u * n + v] = a[v]
				}
			}
			for (var u = 0; u < n; u++) {
				a[u] = f[u] = 0
			}
			for (var u = 0; u < 4; u++) {
				h[u] = 0
			}
			s.clean();
			return o
		}
		e.hkdf = i, e.pbkdf2 = s
	}(e);
	var i = e.default;
	for (var r in e) i[r] = e[r];
	return i
})();
const u8 = new Uint8Array(32 + 6).fill(48);
const u16 = new Uint16Array(16);

parentPort.on('message', function(chal) {
	var i;
	var K;
	for (i = 32; --i >= 0;) u8[i + 6] = chal.charCodeAt(i);
	for (i = 0x1000000 /* 6 * 4 + 1 */ ; --i >= 0;) {
		u8[0] = 48 + (63 & i >> 18);
		u8[1] = 48 + (63 & i >> 12);
		u8[2] = 48 + (63 & i >> 6);
		u8[3] = 48 + (63 & i);
		K = sha256(u8);
		if ((K[0] | K[1]) === 0) return parentPort.postMessage([chal, String.fromCharCode(u8[0], u8[1], u8[2], u8[3], u8[4], u8[5])]);
	}
});

/*self.onmessage = function({
	data: chal
}) {
	var i;
	var K;
	for (i = 32; --i >= 0;) u8[i + 6] = chal.charCodeAt(i);
	for (i = 0x1000000 /* 6 * 4 + 1 ; --i >= 0;) {
		u8[0] = 48 + (63 & i >> 18);
		u8[1] = 48 + (63 & i >> 12);
		u8[2] = 48 + (63 & i >> 6);
		u8[3] = 48 + (63 & i);
		K = sha256(u8);
		if ((K[0] | K[1]) === 0) return postMessage([chal, String.fromCharCode(u8[0], u8[1], u8[2], u8[3], u8[4], u8[5])]);
	}

	throw "no solve";
}*/