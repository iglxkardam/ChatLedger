
// Simple E2E crypto helpers (baby-step v1)
// Library: tweetnacl (X25519 + XSalsa20-Poly1305)
import nacl from "tweetnacl";

// ---- Base64 helpers (browser-safe) ----
export function b64encode(bytes) {
  if (typeof window !== "undefined" && window.btoa) {
    let bin = "";
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return window.btoa(bin);
  } else {
    return Buffer.from(bytes).toString("base64");
  }
}
export function b64decode(str) {
  if (typeof window !== "undefined" && window.atob) {
    const bin = window.atob(str);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } else {
    return new Uint8Array(Buffer.from(str, "base64"));
  }
}

// ---- Local key storage (very simple for v1) ----
const LS_MY_KEY = "cl_msg_keypair_v1";
export function getOrCreateMyKeypair() {
  if (typeof window === "undefined") throw new Error("No window");
  let raw = localStorage.getItem(LS_MY_KEY);
  if (raw) {
    const o = JSON.parse(raw);
    return {
      publicKey: b64decode(o.publicKey_b64),
      secretKey: b64decode(o.secretKey_b64),
    };
  }
  const kp = nacl.box.keyPair();
  localStorage.setItem(
    LS_MY_KEY,
    JSON.stringify({
      publicKey_b64: b64encode(kp.publicKey),
      secretKey_b64: b64encode(kp.secretKey),
    })
  );
  return kp;
}
export function getMyPublicKeyB64() {
  const kp = getOrCreateMyKeypair();
  return b64encode(kp.publicKey);
}

// Friend messaging key storage (paste once per friend)
export function getFriendMessagingKeyB64(addr) {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cl_friend_pk_" + addr?.toLowerCase()) || null;
}
export function setFriendMessagingKeyB64(addr, pubB64) {
  if (typeof window === "undefined") return;
  localStorage.setItem("cl_friend_pk_" + addr?.toLowerCase(), pubB64);
}

// ---- Key agreement (ECDH) ----
export function deriveSharedKey(theirPubKey_b64) {
  const my = getOrCreateMyKeypair();
  const theirPub = b64decode(theirPubKey_b64);
  // nacl.box.before returns a shared key (Uint8Array length 32)
  return nacl.box.before(theirPub, my.secretKey);
}

// ---- Text encryption / decryption ----
export function encryptTextFor(theirPubKey_b64, plaintext) {
  const shared = deriveSharedKey(theirPubKey_b64);
  const nonce = nacl.randomBytes(24);
  const msg = new TextEncoder().encode(plaintext);
  const ct = nacl.secretbox(msg, nonce, shared);
  return {
    v: 1,
    alg: "x25519-xsalsa20poly1305",
    senderPub_b64: getMyPublicKeyB64(),
    nonce_b64: b64encode(nonce),
    ct_b64: b64encode(ct),
  };
}

export function decryptTextPayload(payload, myKeypair) {
  const { senderPub_b64, nonce_b64, ct_b64 } = payload;
  const senderPub = b64decode(senderPub_b64);
  const my = myKeypair || getOrCreateMyKeypair();
  const shared = nacl.box.before(senderPub, my.secretKey);
  const nonce = b64decode(nonce_b64);
  const ct = b64decode(ct_b64);
  const pt = nacl.secretbox.open(ct, nonce, shared);
  if (!pt) throw new Error("Bad ciphertext or wrong keys");
  return new TextDecoder().decode(pt);
}

// ---- File encryption / decryption ----
export async function encryptFileFor(theirPubKey_b64, file) {
  const shared = deriveSharedKey(theirPubKey_b64);
  const nonce = nacl.randomBytes(24);
  const buf = new Uint8Array(await file.arrayBuffer());
  const ct = nacl.secretbox(buf, nonce, shared);
  const meta = {
    v: 1,
    alg: "x25519-xsalsa20poly1305",
    senderPub_b64: getMyPublicKeyB64(),
    nonce_b64: b64encode(nonce),
    origName: file.name,
    origType: file.type || "application/octet-stream",
    origSize: file.size,
    encrypted: true,
  };
  const cipherFile = new File([ct], file.name + ".enc", {
    type: "application/octet-stream",
  });
  return { cipherFile, meta };
}

export async function decryptFileBlob(payloadMeta, cipherArrayBuffer) {
  const { senderPub_b64, nonce_b64 } = payloadMeta;
  const senderPub = b64decode(senderPub_b64);
  const my = getOrCreateMyKeypair();
  const shared = nacl.box.before(senderPub, my.secretKey);
  const nonce = b64decode(nonce_b64);
  const ct = new Uint8Array(cipherArrayBuffer);
  const pt = nacl.secretbox.open(ct, nonce, shared);
  if (!pt) throw new Error("Bad ciphertext");
  return new Blob([pt], { type: payloadMeta.origType || "application/octet-stream" });
}
