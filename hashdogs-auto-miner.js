#!/usr/bin/env node
/**
 * Hash Dogs - Full Auto Miner (Node.js)
 * Multi-threaded CPU miner with auto-mint & challenge follow
 * 
 * Setup:
 *   npm install ethers
 *   export PRIVATE_KEY=0xYOUR_PRIVATE_KEY
 *   node hashdogs-auto-miner.js
 */

const { isMainThread, Worker, parentPort } = require('worker_threads');
const crypto = require('crypto');
const os = require('os');

// ========================================================================
// KECCAK MINER (Unrolled keccak-f[1600] — ported from keccak-miner.js)
// ========================================================================
const RC = new Int32Array([1, 0, 32898, 0, 32906, -2147483648, -2147450880, -2147483648, 32907, 0, -2147483647, 0, -2147450751, -2147483648, 32777, -2147483648, 138, 0, 136, 0, -2147450871, 0, -2147483638, 0, -2147450741, 0, 139, -2147483648, 32905, -2147483648, 32771, -2147483648, 32770, -2147483648, 128, -2147483648, 32778, 0, -2147483638, -2147483648, -2147450751, -2147483648, 32896, -2147483648, -2147483647, 0, -2147450872, -2147483648]);

function bswap(x) {
  return ((x << 24) | ((x & 0xff00) << 8) | ((x >>> 8) & 0xff00) | (x >>> 24));
}

function baseState(challenge, address, prefix) {
  const blk = new Uint8Array(136);
  blk.set(challenge, 0); blk.set(address, 32); blk.set(prefix, 52);
  blk[84] = 0x01; blk[135] |= 0x80;
  const S = new Int32Array(50);
  const dv = new DataView(blk.buffer);
  for (let i = 0; i < 17; i++) { S[2 * i] = dv.getUint32(8 * i, true); S[2 * i + 1] = dv.getUint32(8 * i + 4, true); }
  return S;
}

function keccakF(S) {
  let a0 = S[0], a1 = S[1], a2 = S[2], a3 = S[3], a4 = S[4], a5 = S[5], a6 = S[6], a7 = S[7], a8 = S[8], a9 = S[9], a10 = S[10], a11 = S[11], a12 = S[12], a13 = S[13], a14 = S[14], a15 = S[15], a16 = S[16], a17 = S[17], a18 = S[18], a19 = S[19], a20 = S[20], a21 = S[21], a22 = S[22], a23 = S[23], a24 = S[24], a25 = S[25], a26 = S[26], a27 = S[27], a28 = S[28], a29 = S[29], a30 = S[30], a31 = S[31], a32 = S[32], a33 = S[33], a34 = S[34], a35 = S[35], a36 = S[36], a37 = S[37], a38 = S[38], a39 = S[39], a40 = S[40], a41 = S[41], a42 = S[42], a43 = S[43], a44 = S[44], a45 = S[45], a46 = S[46], a47 = S[47], a48 = S[48], a49 = S[49];
  for (let r = 0; r < 48; r += 2) {
      const c0 = a0 ^ a10 ^ a20 ^ a30 ^ a40;
      const c1 = a1 ^ a11 ^ a21 ^ a31 ^ a41;
      const c2 = a2 ^ a12 ^ a22 ^ a32 ^ a42;
      const c3 = a3 ^ a13 ^ a23 ^ a33 ^ a43;
      const c4 = a4 ^ a14 ^ a24 ^ a34 ^ a44;
      const c5 = a5 ^ a15 ^ a25 ^ a35 ^ a45;
      const c6 = a6 ^ a16 ^ a26 ^ a36 ^ a46;
      const c7 = a7 ^ a17 ^ a27 ^ a37 ^ a47;
      const c8 = a8 ^ a18 ^ a28 ^ a38 ^ a48;
      const c9 = a9 ^ a19 ^ a29 ^ a39 ^ a49;
      const d0 = c8 ^ ((c2 << 1) | (c3 >>> 31));
      const d1 = c9 ^ ((c3 << 1) | (c2 >>> 31));
      const d2 = c0 ^ ((c4 << 1) | (c5 >>> 31));
      const d3 = c1 ^ ((c5 << 1) | (c4 >>> 31));
      const d4 = c2 ^ ((c6 << 1) | (c7 >>> 31));
      const d5 = c3 ^ ((c7 << 1) | (c6 >>> 31));
      const d6 = c4 ^ ((c8 << 1) | (c9 >>> 31));
      const d7 = c5 ^ ((c9 << 1) | (c8 >>> 31));
      const d8 = c6 ^ ((c0 << 1) | (c1 >>> 31));
      const d9 = c7 ^ ((c1 << 1) | (c0 >>> 31));
      const t0 = (a0 ^ d0);
      const t1 = (a1 ^ d1);
      const b0 = t0;
      const b1 = t1;
      const t32 = (a10 ^ d0);
      const t33 = (a11 ^ d1);
      const b32 = ((t33 << 4) | (t32 >>> 28));
      const b33 = ((t32 << 4) | (t33 >>> 28));
      const t14 = (a20 ^ d0);
      const t15 = (a21 ^ d1);
      const b14 = ((t14 << 3) | (t15 >>> 29));
      const b15 = ((t15 << 3) | (t14 >>> 29));
      const t46 = (a30 ^ d0);
      const t47 = (a31 ^ d1);
      const b46 = ((t47 << 9) | (t46 >>> 23));
      const b47 = ((t46 << 9) | (t47 >>> 23));
      const t28 = (a40 ^ d0);
      const t29 = (a41 ^ d1);
      const b28 = ((t28 << 18) | (t29 >>> 14));
      const b29 = ((t29 << 18) | (t28 >>> 14));
      const t20 = (a2 ^ d2);
      const t21 = (a3 ^ d3);
      const b20 = ((t20 << 1) | (t21 >>> 31));
      const b21 = ((t21 << 1) | (t20 >>> 31));
      const t2 = (a12 ^ d2);
      const t3 = (a13 ^ d3);
      const b2 = ((t3 << 12) | (t2 >>> 20));
      const b3 = ((t2 << 12) | (t3 >>> 20));
      const t34 = (a22 ^ d2);
      const t35 = (a23 ^ d3);
      const b34 = ((t34 << 10) | (t35 >>> 22));
      const b35 = ((t35 << 10) | (t34 >>> 22));
      const t16 = (a32 ^ d2);
      const t17 = (a33 ^ d3);
      const b16 = ((t17 << 13) | (t16 >>> 19));
      const b17 = ((t16 << 13) | (t17 >>> 19));
      const t48 = (a42 ^ d2);
      const t49 = (a43 ^ d3);
      const b48 = ((t48 << 2) | (t49 >>> 30));
      const b49 = ((t49 << 2) | (t48 >>> 30));
      const t40 = (a4 ^ d4);
      const t41 = (a5 ^ d5);
      const b40 = ((t41 << 30) | (t40 >>> 2));
      const b41 = ((t40 << 30) | (t41 >>> 2));
      const t22 = (a14 ^ d4);
      const t23 = (a15 ^ d5);
      const b22 = ((t22 << 6) | (t23 >>> 26));
      const b23 = ((t23 << 6) | (t22 >>> 26));
      const t4 = (a24 ^ d4);
      const t5 = (a25 ^ d5);
      const b4 = ((t5 << 11) | (t4 >>> 21));
      const b5 = ((t4 << 11) | (t5 >>> 21));
      const t36 = (a34 ^ d4);
      const t37 = (a35 ^ d5);
      const b36 = ((t36 << 15) | (t37 >>> 17));
      const b37 = ((t37 << 15) | (t36 >>> 17));
      const t18 = (a44 ^ d4);
      const t19 = (a45 ^ d5);
      const b18 = ((t19 << 29) | (t18 >>> 3));
      const b19 = ((t18 << 29) | (t19 >>> 3));
      const t10 = (a6 ^ d6);
      const t11 = (a7 ^ d7);
      const b10 = ((t10 << 28) | (t11 >>> 4));
      const b11 = ((t11 << 28) | (t10 >>> 4));
      const t42 = (a16 ^ d6);
      const t43 = (a17 ^ d7);
      const b42 = ((t43 << 23) | (t42 >>> 9));
      const b43 = ((t42 << 23) | (t43 >>> 9));
      const t24 = (a26 ^ d6);
      const t25 = (a27 ^ d7);
      const b24 = ((t24 << 25) | (t25 >>> 7));
      const b25 = ((t25 << 25) | (t24 >>> 7));
      const t6 = (a36 ^ d6);
      const t7 = (a37 ^ d7);
      const b6 = ((t6 << 21) | (t7 >>> 11));
      const b7 = ((t7 << 21) | (t6 >>> 11));
      const t38 = (a46 ^ d6);
      const t39 = (a47 ^ d7);
      const b38 = ((t39 << 24) | (t38 >>> 8));
      const b39 = ((t38 << 24) | (t39 >>> 8));
      const t30 = (a8 ^ d8);
      const t31 = (a9 ^ d9);
      const b30 = ((t30 << 27) | (t31 >>> 5));
      const b31 = ((t31 << 27) | (t30 >>> 5));
      const t12 = (a18 ^ d8);
      const t13 = (a19 ^ d9);
      const b12 = ((t12 << 20) | (t13 >>> 12));
      const b13 = ((t13 << 20) | (t12 >>> 12));
      const t44 = (a28 ^ d8);
      const t45 = (a29 ^ d9);
      const b44 = ((t45 << 7) | (t44 >>> 25));
      const b45 = ((t44 << 7) | (t45 >>> 25));
      const t26 = (a38 ^ d8);
      const t27 = (a39 ^ d9);
      const b26 = ((t26 << 8) | (t27 >>> 24));
      const b27 = ((t27 << 8) | (t26 >>> 24));
      const t8 = (a48 ^ d8);
      const t9 = (a49 ^ d9);
      const b8 = ((t8 << 14) | (t9 >>> 18));
      const b9 = ((t9 << 14) | (t8 >>> 18));
      a0 = b0 ^ (~b2 & b4);
      a1 = b1 ^ (~b3 & b5);
      a2 = b2 ^ (~b4 & b6);
      a3 = b3 ^ (~b5 & b7);
      a4 = b4 ^ (~b6 & b8);
      a5 = b5 ^ (~b7 & b9);
      a6 = b6 ^ (~b8 & b0);
      a7 = b7 ^ (~b9 & b1);
      a8 = b8 ^ (~b0 & b2);
      a9 = b9 ^ (~b1 & b3);
      a10 = b10 ^ (~b12 & b14);
      a11 = b11 ^ (~b13 & b15);
      a12 = b12 ^ (~b14 & b16);
      a13 = b13 ^ (~b15 & b17);
      a14 = b14 ^ (~b16 & b18);
      a15 = b15 ^ (~b17 & b19);
      a16 = b16 ^ (~b18 & b10);
      a17 = b17 ^ (~b19 & b11);
      a18 = b18 ^ (~b10 & b12);
      a19 = b19 ^ (~b11 & b13);
      a20 = b20 ^ (~b22 & b24);
      a21 = b21 ^ (~b23 & b25);
      a22 = b22 ^ (~b24 & b26);
      a23 = b23 ^ (~b25 & b27);
      a24 = b24 ^ (~b26 & b28);
      a25 = b25 ^ (~b27 & b29);
      a26 = b26 ^ (~b28 & b20);
      a27 = b27 ^ (~b29 & b21);
      a28 = b28 ^ (~b20 & b22);
      a29 = b29 ^ (~b21 & b23);
      a30 = b30 ^ (~b32 & b34);
      a31 = b31 ^ (~b33 & b35);
      a32 = b32 ^ (~b34 & b36);
      a33 = b33 ^ (~b35 & b37);
      a34 = b34 ^ (~b36 & b38);
      a35 = b35 ^ (~b37 & b39);
      a36 = b36 ^ (~b38 & b30);
      a37 = b37 ^ (~b39 & b31);
      a38 = b38 ^ (~b30 & b32);
      a39 = b39 ^ (~b31 & b33);
      a40 = b40 ^ (~b42 & b44);
      a41 = b41 ^ (~b43 & b45);
      a42 = b42 ^ (~b44 & b46);
      a43 = b43 ^ (~b45 & b47);
      a44 = b44 ^ (~b46 & b48);
      a45 = b45 ^ (~b47 & b49);
      a46 = b46 ^ (~b48 & b40);
      a47 = b47 ^ (~b49 & b41);
      a48 = b48 ^ (~b40 & b42);
      a49 = b49 ^ (~b41 & b43);
      a0 ^= RC[r]; a1 ^= RC[r + 1];
  }
  const o = new Int32Array(50);
  o[0] = a0; o[1] = a1; o[2] = a2; o[3] = a3; o[4] = a4; o[5] = a5; o[6] = a6; o[7] = a7; o[8] = a8; o[9] = a9; o[10] = a10; o[11] = a11; o[12] = a12; o[13] = a13; o[14] = a14; o[15] = a15; o[16] = a16; o[17] = a17; o[18] = a18; o[19] = a19; o[20] = a20; o[21] = a21; o[22] = a22; o[23] = a23; o[24] = a24; o[25] = a25; o[26] = a26; o[27] = a27; o[28] = a28; o[29] = a29; o[30] = a30; o[31] = a31; o[32] = a32; o[33] = a33; o[34] = a34; o[35] = a35; o[36] = a36; o[37] = a37; o[38] = a38; o[39] = a39; o[40] = a40; o[41] = a41; o[42] = a42; o[43] = a43; o[44] = a44; o[45] = a45; o[46] = a46; o[47] = a47; o[48] = a48; o[49] = a49;
  return o;
}

function mineRange(S, start, count, T) {
  let w;
  for (let k = 0; k < count; k++) {
    const c = (start + k) >>> 0;
    let a0 = S[0], a1 = S[1], a2 = S[2], a3 = S[3], a4 = S[4], a5 = S[5], a6 = S[6], a7 = S[7], a8 = S[8], a9 = S[9], a10 = S[10], a11 = S[11], a12 = S[12], a13 = S[13], a14 = S[14], a15 = S[15], a16 = S[16], a17 = S[17], a18 = S[18], a19 = S[19], a20 = S[20], a21 = S[21], a22 = S[22], a23 = S[23], a24 = S[24], a25 = S[25], a26 = S[26], a27 = S[27], a28 = S[28], a29 = S[29], a30 = S[30], a31 = S[31], a32 = S[32], a33 = S[33], a34 = S[34], a35 = S[35], a36 = S[36], a37 = S[37], a38 = S[38], a39 = S[39], a40 = S[40], a41 = S[41], a42 = S[42], a43 = S[43], a44 = S[44], a45 = S[45], a46 = S[46], a47 = S[47], a48 = S[48], a49 = S[49];
    a20 = bswap(c);
    for (let r = 0; r < 48; r += 2) {
      const c0 = a0 ^ a10 ^ a20 ^ a30 ^ a40;
      const c1 = a1 ^ a11 ^ a21 ^ a31 ^ a41;
      const c2 = a2 ^ a12 ^ a22 ^ a32 ^ a42;
      const c3 = a3 ^ a13 ^ a23 ^ a33 ^ a43;
      const c4 = a4 ^ a14 ^ a24 ^ a34 ^ a44;
      const c5 = a5 ^ a15 ^ a25 ^ a35 ^ a45;
      const c6 = a6 ^ a16 ^ a26 ^ a36 ^ a46;
      const c7 = a7 ^ a17 ^ a27 ^ a37 ^ a47;
      const c8 = a8 ^ a18 ^ a28 ^ a38 ^ a48;
      const c9 = a9 ^ a19 ^ a29 ^ a39 ^ a49;
      const d0 = c8 ^ ((c2 << 1) | (c3 >>> 31));
      const d1 = c9 ^ ((c3 << 1) | (c2 >>> 31));
      const d2 = c0 ^ ((c4 << 1) | (c5 >>> 31));
      const d3 = c1 ^ ((c5 << 1) | (c4 >>> 31));
      const d4 = c2 ^ ((c6 << 1) | (c7 >>> 31));
      const d5 = c3 ^ ((c7 << 1) | (c6 >>> 31));
      const d6 = c4 ^ ((c8 << 1) | (c9 >>> 31));
      const d7 = c5 ^ ((c9 << 1) | (c8 >>> 31));
      const d8 = c6 ^ ((c0 << 1) | (c1 >>> 31));
      const d9 = c7 ^ ((c1 << 1) | (c0 >>> 31));
      const t0 = (a0 ^ d0);
      const t1 = (a1 ^ d1);
      const b0 = t0;
      const b1 = t1;
      const t32 = (a10 ^ d0);
      const t33 = (a11 ^ d1);
      const b32 = ((t33 << 4) | (t32 >>> 28));
      const b33 = ((t32 << 4) | (t33 >>> 28));
      const t14 = (a20 ^ d0);
      const t15 = (a21 ^ d1);
      const b14 = ((t14 << 3) | (t15 >>> 29));
      const b15 = ((t15 << 3) | (t14 >>> 29));
      const t46 = (a30 ^ d0);
      const t47 = (a31 ^ d1);
      const b46 = ((t47 << 9) | (t46 >>> 23));
      const b47 = ((t46 << 9) | (t47 >>> 23));
      const t28 = (a40 ^ d0);
      const t29 = (a41 ^ d1);
      const b28 = ((t28 << 18) | (t29 >>> 14));
      const b29 = ((t29 << 18) | (t28 >>> 14));
      const t20 = (a2 ^ d2);
      const t21 = (a3 ^ d3);
      const b20 = ((t20 << 1) | (t21 >>> 31));
      const b21 = ((t21 << 1) | (t20 >>> 31));
      const t2 = (a12 ^ d2);
      const t3 = (a13 ^ d3);
      const b2 = ((t3 << 12) | (t2 >>> 20));
      const b3 = ((t2 << 12) | (t3 >>> 20));
      const t34 = (a22 ^ d2);
      const t35 = (a23 ^ d3);
      const b34 = ((t34 << 10) | (t35 >>> 22));
      const b35 = ((t35 << 10) | (t34 >>> 22));
      const t16 = (a32 ^ d2);
      const t17 = (a33 ^ d3);
      const b16 = ((t17 << 13) | (t16 >>> 19));
      const b17 = ((t16 << 13) | (t17 >>> 19));
      const t48 = (a42 ^ d2);
      const t49 = (a43 ^ d3);
      const b48 = ((t48 << 2) | (t49 >>> 30));
      const b49 = ((t49 << 2) | (t48 >>> 30));
      const t40 = (a4 ^ d4);
      const t41 = (a5 ^ d5);
      const b40 = ((t41 << 30) | (t40 >>> 2));
      const b41 = ((t40 << 30) | (t41 >>> 2));
      const t22 = (a14 ^ d4);
      const t23 = (a15 ^ d5);
      const b22 = ((t22 << 6) | (t23 >>> 26));
      const b23 = ((t23 << 6) | (t22 >>> 26));
      const t4 = (a24 ^ d4);
      const t5 = (a25 ^ d5);
      const b4 = ((t5 << 11) | (t4 >>> 21));
      const b5 = ((t4 << 11) | (t5 >>> 21));
      const t36 = (a34 ^ d4);
      const t37 = (a35 ^ d5);
      const b36 = ((t36 << 15) | (t37 >>> 17));
      const b37 = ((t37 << 15) | (t36 >>> 17));
      const t18 = (a44 ^ d4);
      const t19 = (a45 ^ d5);
      const b18 = ((t19 << 29) | (t18 >>> 3));
      const b19 = ((t18 << 29) | (t19 >>> 3));
      const t10 = (a6 ^ d6);
      const t11 = (a7 ^ d7);
      const b10 = ((t10 << 28) | (t11 >>> 4));
      const b11 = ((t11 << 28) | (t10 >>> 4));
      const t42 = (a16 ^ d6);
      const t43 = (a17 ^ d7);
      const b42 = ((t43 << 23) | (t42 >>> 9));
      const b43 = ((t42 << 23) | (t43 >>> 9));
      const t24 = (a26 ^ d6);
      const t25 = (a27 ^ d7);
      const b24 = ((t24 << 25) | (t25 >>> 7));
      const b25 = ((t25 << 25) | (t24 >>> 7));
      const t6 = (a36 ^ d6);
      const t7 = (a37 ^ d7);
      const b6 = ((t6 << 21) | (t7 >>> 11));
      const b7 = ((t7 << 21) | (t6 >>> 11));
      const t38 = (a46 ^ d6);
      const t39 = (a47 ^ d7);
      const b38 = ((t39 << 24) | (t38 >>> 8));
      const b39 = ((t38 << 24) | (t39 >>> 8));
      const t30 = (a8 ^ d8);
      const t31 = (a9 ^ d9);
      const b30 = ((t30 << 27) | (t31 >>> 5));
      const b31 = ((t31 << 27) | (t30 >>> 5));
      const t12 = (a18 ^ d8);
      const t13 = (a19 ^ d9);
      const b12 = ((t12 << 20) | (t13 >>> 12));
      const b13 = ((t13 << 20) | (t12 >>> 12));
      const t44 = (a28 ^ d8);
      const t45 = (a29 ^ d9);
      const b44 = ((t45 << 7) | (t44 >>> 25));
      const b45 = ((t44 << 7) | (t45 >>> 25));
      const t26 = (a38 ^ d8);
      const t27 = (a39 ^ d9);
      const b26 = ((t26 << 8) | (t27 >>> 24));
      const b27 = ((t27 << 8) | (t26 >>> 24));
      const t8 = (a48 ^ d8);
      const t9 = (a49 ^ d9);
      const b8 = ((t8 << 14) | (t9 >>> 18));
      const b9 = ((t9 << 14) | (t8 >>> 18));
      a0 = b0 ^ (~b2 & b4);
      a1 = b1 ^ (~b3 & b5);
      a2 = b2 ^ (~b4 & b6);
      a3 = b3 ^ (~b5 & b7);
      a4 = b4 ^ (~b6 & b8);
      a5 = b5 ^ (~b7 & b9);
      a6 = b6 ^ (~b8 & b0);
      a7 = b7 ^ (~b9 & b1);
      a8 = b8 ^ (~b0 & b2);
      a9 = b9 ^ (~b1 & b3);
      a10 = b10 ^ (~b12 & b14);
      a11 = b11 ^ (~b13 & b15);
      a12 = b12 ^ (~b14 & b16);
      a13 = b13 ^ (~b15 & b17);
      a14 = b14 ^ (~b16 & b18);
      a15 = b15 ^ (~b17 & b19);
      a16 = b16 ^ (~b18 & b10);
      a17 = b17 ^ (~b19 & b11);
      a18 = b18 ^ (~b10 & b12);
      a19 = b19 ^ (~b11 & b13);
      a20 = b20 ^ (~b22 & b24);
      a21 = b21 ^ (~b23 & b25);
      a22 = b22 ^ (~b24 & b26);
      a23 = b23 ^ (~b25 & b27);
      a24 = b24 ^ (~b26 & b28);
      a25 = b25 ^ (~b27 & b29);
      a26 = b26 ^ (~b28 & b20);
      a27 = b27 ^ (~b29 & b21);
      a28 = b28 ^ (~b20 & b22);
      a29 = b29 ^ (~b21 & b23);
      a30 = b30 ^ (~b32 & b34);
      a31 = b31 ^ (~b33 & b35);
      a32 = b32 ^ (~b34 & b36);
      a33 = b33 ^ (~b35 & b37);
      a34 = b34 ^ (~b36 & b38);
      a35 = b35 ^ (~b37 & b39);
      a36 = b36 ^ (~b38 & b30);
      a37 = b37 ^ (~b39 & b31);
      a38 = b38 ^ (~b30 & b32);
      a39 = b39 ^ (~b31 & b33);
      a40 = b40 ^ (~b42 & b44);
      a41 = b41 ^ (~b43 & b45);
      a42 = b42 ^ (~b44 & b46);
      a43 = b43 ^ (~b45 & b47);
      a44 = b44 ^ (~b46 & b48);
      a45 = b45 ^ (~b47 & b49);
      a46 = b46 ^ (~b48 & b40);
      a47 = b47 ^ (~b49 & b41);
      a48 = b48 ^ (~b40 & b42);
      a49 = b49 ^ (~b41 & b43);
      a0 ^= RC[r]; a1 ^= RC[r + 1];
    }
      w = bswap(a0) >>> 0; if (w < T[0]) return c; if (w > T[0]) continue;
      w = bswap(a1) >>> 0; if (w < T[1]) return c; if (w > T[1]) continue;
      w = bswap(a2) >>> 0; if (w < T[2]) return c; if (w > T[2]) continue;
      w = bswap(a3) >>> 0; if (w < T[3]) return c; if (w > T[3]) continue;
      w = bswap(a4) >>> 0; if (w < T[4]) return c; if (w > T[4]) continue;
      w = bswap(a5) >>> 0; if (w < T[5]) return c; if (w > T[5]) continue;
      w = bswap(a6) >>> 0; if (w < T[6]) return c; if (w > T[6]) continue;
      w = bswap(a7) >>> 0; if (w < T[7]) return c; if (w > T[7]) continue;
  }
  return -1;
}

function digestFor(S, counter) {
  const A = Int32Array.from(S); A[20] = bswap(counter >>> 0);
  const o = keccakF(A);
  const out = new Uint8Array(32); const dv = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) dv.setUint32(4 * i, o[i] >>> 0, true);
  return out;
}

// ========================================================================
// WORKER THREAD
// ========================================================================
if (!isMainThread) {
  let currentJobId = null;
  let stopFlag = false;

  parentPort.on('message', (msg) => {
    if (msg.type === 'stop') {
      stopFlag = true;
    } else if (msg.type === 'job') {
      stopFlag = false;
      currentJobId = msg.jobId;
      runJob(msg);
    }
  });

  function runJob(job) {
    const challenge = new Uint8Array(job.challenge);
    const address = new Uint8Array(job.address);
    const target = job.target;
    const jobId = job.jobId;
    const batch = 1 << 22; // 4M per chunk
    let totalHashes = 0;
    let lastReport = 0;

    function search() {
      if (stopFlag || currentJobId !== jobId) {
        parentPort.postMessage({ type: 'stopped', jobId });
        return;
      }

      const prefix = crypto.randomBytes(28);
      const S = baseState(challenge, address, prefix);

      for (let start = 0; start < 0x100000000; start += batch) {
        if (stopFlag || currentJobId !== jobId) break;

        const count = Math.min(batch, 0x100000000 - start);
        const result = mineRange(S, start, count, target);
        totalHashes += count;

        if (result !== -1) {
          const nonceBuf = Buffer.alloc(32);
          nonceBuf.set(prefix, 0);
          nonceBuf.writeUInt32BE(result >>> 0, 28);
          parentPort.postMessage({
            type: 'found',
            jobId,
            nonce: '0x' + nonceBuf.toString('hex'),
            counter: result >>> 0,
            prefix: Array.from(prefix),
            hashes: totalHashes
          });
          return;
        }

        if (totalHashes - lastReport >= 50_000_000) {
          parentPort.postMessage({ type: 'progress', jobId, hashes: totalHashes });
          lastReport = totalHashes;
        }
      }

      if (!stopFlag && currentJobId === jobId) {
        setImmediate(search);
      } else {
        parentPort.postMessage({ type: 'stopped', jobId });
      }
    }

    search();
  }
  return;
}

// ========================================================================
// MAIN THREAD
// ========================================================================
let ethers;
try {
  ethers = require('ethers');
} catch (e) {
  console.error('[-] ethers package missing. Run: npm install ethers');
  process.exit(1);
}

const CONFIG = {
  rpc: process.env.RPC_URL || 'https://rpc.mainnet.chain.robinhood.com',
  contract: process.env.CONTRACT || '0xAd7d250f0E24fcE2cc4d5b335Cd0A4fcc20f79Bd',
  chainId: Number(process.env.CHAIN_ID || 4663),
  workers: Number(process.env.WORKERS || os.cpus().length),
  pollInterval: Number(process.env.POLL_INTERVAL || 5000),
};

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
  console.error('[-] Set PRIVATE_KEY env var');
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(CONFIG.rpc, CONFIG.chainId, { staticNetwork: true });
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const ABI = [
  'function miningState() view returns (tuple(bytes32 challenge, uint256 currentTarget, uint256 storedTarget, uint256 price, uint256 epoch, uint256 totalMinted, uint256 maxSupply, bool mintOpen, uint256 lastMintTime, uint256 targetInterval, uint256 basePrice, uint256 maxPerWallet, uint256 timestamp))',
  'function mint(uint256 nonce, bytes32 expectedChallenge) payable returns (uint256)',
  'event Mined(address indexed miner, uint256 indexed tokenId, bytes32 digest, uint256 nonce, uint256 epoch, uint256 price, bytes32 newChallenge, uint256 newTarget)'
];

const contract = new ethers.Contract(CONFIG.contract, ABI, wallet);
const iface = new ethers.Interface(ABI);

let workers = [];
let currentJobId = 0;
let currentState = null;
let isSubmitting = false;
let stats = { hashes: 0, startTime: 0 };

function log(...args) {
  console.log(`[${new Date().toISOString().replace('T',' ').slice(0,19)}]`, ...args);
}

function targetWords(t) {
  const arr = new Array(8);
  for (let i = 0; i < 8; i++) {
    arr[i] = Number((t >> BigInt(224 - 32 * i)) & 0xffffffffn);
  }
  return arr;
}

function spawnWorkers() {
  log(`[INFO] Spawning ${CONFIG.workers} workers...`);
  for (let i = 0; i < CONFIG.workers; i++) {
    const w = new Worker(__filename);
    w.on('message', (msg) => handleMessage(msg, i));
    w.on('error', (err) => log(`[WORKER ${i} ERROR]`, err.message));
    w.on('exit', (code) => { if (code !== 0) log(`[WORKER ${i}] exited ${code}`); });
    workers.push(w);
  }
}

async function handleMessage(msg, idx) {
  if (msg.type === 'found') {
    if (msg.jobId !== currentJobId || isSubmitting) return;
    log(`[WORKER ${idx}] SOLUTION FOUND after ${msg.hashes.toLocaleString()} hashes`);
    await submitMint(msg.nonce);
  } else if (msg.type === 'progress') {
    if (msg.jobId === currentJobId) {
      stats.hashes += msg.hashes;
    }
  }
}

async function submitMint(nonceHex) {
  isSubmitting = true;
  try {
    const state = await contract.miningState();
    if (state.challenge !== currentState.challenge) {
      log('[MINT] Challenge changed, solution stale');
      isSubmitting = false;
      startRound(state);
      return;
    }

    const value = state.price;
    const balance = await provider.getBalance(wallet.address);
    if (balance < value) {
      log('[MINT] INSUFFICIENT BALANCE');
      isSubmitting = false;
      return;
    }

    log(`[MINT] Submitting... Price: ${ethers.formatEther(value)} ETH`);
    let estGas;
    try {
      estGas = await contract.mint.estimateGas(nonceHex, state.challenge, { value });
    } catch (e) {
      log('[MINT] Gas estimation failed:', e.shortMessage || e.message);
      isSubmitting = false;
      return;
    }

    const tx = await contract.mint(nonceHex, state.challenge, {
      value,
      gasLimit: (estGas * 15n) / 10n
    });
    log(`[MINT] TX sent: ${tx.hash}`);

    const receipt = await tx.wait();
    let tokenId = null;
    for (const logEntry of receipt.logs) {
      try {
        const parsed = iface.parseLog(logEntry);
        if (parsed?.name === 'Mined') {
          tokenId = parsed.args.tokenId.toString();
          break;
        }
      } catch (e) {}
    }

    log(`[MINT] SUCCESS! Minted Hash Dog #${tokenId}`);
    const newState = await contract.miningState();
    startRound(newState);
  } catch (err) {
    const msg = err.shortMessage || err.message;
    log('[MINT] FAILED:', msg);
    if (msg.includes('StaleChallenge')) {
      log('[MINT] Stale challenge, restarting...');
      const newState = await contract.miningState();
      startRound(newState);
    }
  } finally {
    isSubmitting = false;
  }
}

function startRound(state) {
  currentJobId++;
  currentState = state;
  stats = { hashes: 0, startTime: Date.now() };

  if (!state.mintOpen || state.totalMinted >= state.maxSupply) {
    log('[INFO] Mint closed or sold out.');
    workers.forEach(w => w.postMessage({ type: 'stop' }));
    return;
  }

  const target = targetWords(state.currentTarget);
  const challenge = Array.from(ethers.getBytes(state.challenge));
  const address = Array.from(ethers.getBytes(wallet.address));

  log(`[ROUND ${currentJobId}] Challenge: ${state.challenge.slice(0, 18)}... Target: ${state.currentTarget.toString(16).slice(0, 16)}... Price: ${ethers.formatEther(state.price)} ETH`);

  workers.forEach(w => w.postMessage({
    type: 'job',
    jobId: currentJobId,
    challenge,
    address,
    target
  }));
}

async function main() {
  log('==============================================');
  log(' Hash Dogs Full Auto Miner');
  log(` Wallet: ${wallet.address}`);
  log(` Workers: ${CONFIG.workers}`);
  log(` RPC: ${CONFIG.rpc}`);
  log('==============================================');

  log('[TEST] Running keccak self-test...');
  const testChallenge = crypto.randomBytes(32);
  const testAddress = crypto.randomBytes(20);
  const testPrefix = crypto.randomBytes(28);
  const testCounter = 12345;
  const testState = baseState(testChallenge, testAddress, testPrefix);
  const ourHash = digestFor(testState, testCounter);
  const input = Buffer.concat([testChallenge, testAddress, testPrefix, Buffer.alloc(4)]);
  input.writeUInt32BE(testCounter, 28);
  const ethersHash = ethers.getBytes(ethers.keccak256(input));
  if (Buffer.from(ourHash).toString('hex') !== Buffer.from(ethersHash).toString('hex')) {
    log('[TEST] FAILED! Hash mismatch.');
    process.exit(1);
  }
  log('[TEST] PASSED');

  spawnWorkers();

  const state = await contract.miningState();
  startRound(state);

  setInterval(async () => {
    try {
      const state = await contract.miningState();
      if (state.challenge !== currentState.challenge) {
        log('[INFO] New challenge detected on-chain');
        startRound(state);
      } else {
        currentState = state;
      }
    } catch (e) {
      log('[POLL ERROR]', e.message);
    }
  }, CONFIG.pollInterval);

  setInterval(() => {
    if (!stats.startTime || currentJobId === 0) return;
    const elapsed = (Date.now() - stats.startTime) / 1000;
    const hps = stats.hashes / elapsed;
    const hpsStr = hps > 1e6 ? (hps/1e6).toFixed(2) + ' MH/s' : hps > 1e3 ? (hps/1e3).toFixed(2) + ' KH/s' : hps.toFixed(0) + ' H/s';
    log(`[STATS] Hashrate: ${hpsStr} | Total: ${stats.hashes.toLocaleString()} | Round: ${currentJobId}`);
  }, 10000);
}

main().catch(err => {
  log('[FATAL]', err);
  process.exit(1);
});

process.on('SIGINT', () => {
  log('Shutting down...');
  workers.forEach(w => w.postMessage({ type: 'stop' }));
  setTimeout(() => process.exit(0), 800);
});
