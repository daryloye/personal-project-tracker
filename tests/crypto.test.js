import test from "node:test";
import assert from "node:assert/strict";
import { decryptSecret, encryptSecret } from "../src/server/crypto.js";

test("encryptSecret round-trips without storing plaintext", () => {
  const encrypted = encryptSecret("sk-test", "secret");

  assert.notEqual(encrypted, "sk-test");
  assert.equal(decryptSecret(encrypted, "secret"), "sk-test");
});

test("empty secrets stay empty", () => {
  assert.equal(encryptSecret("", "secret"), "");
  assert.equal(decryptSecret("", "secret"), "");
});

