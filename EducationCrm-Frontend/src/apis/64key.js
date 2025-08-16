import { webcrypto } from "crypto";

function generateRandomKey(length = 64) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let result = "";
  const array = new Uint32Array(length);
  webcrypto.getRandomValues(array); // secure random numbers

  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }

  return result;
}

console.log(generateRandomKey()); // Example: Xx-ZB4c7yF3t_U9L...
