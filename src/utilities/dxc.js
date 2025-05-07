import { createDecipheriv } from "crypto";

/**
 * Decrypts content that was encrypted using AES in CBC mode.
 * The function automatically determines the AES variant (AES-128, AES-192, or AES-256)
 * based on the length of the provided key. It also handles IV length adjustments,
 * ensuring the IV is 16 bytes as required for AES CBC.
 *
 * @param {string} encryptedContentBase64 - The Base64 encoded string of the encrypted content.
 * @param {string} aesKeyBase64 - The Base64 encoded AES encryption key.
 *                                The key length determines the AES algorithm:
 *                                16 bytes for AES-128, 24 bytes for AES-192, or 32 bytes for AES-256.
 * @param {string} ivBase64 - The Base64 encoded Initialization Vector (IV).
 *                            If the IV is not 16 bytes, it will be adjusted
 *                            (padded with zeros or truncated) to 16 bytes.
 * @returns {string} The decrypted content as a UTF-8 string.
 * @throws {Error} Throws an error if the key size is unsupported (not 128, 192, or 256 bits),
 *                 or if any other error occurs during the decryption process.
 *                 The original error from the crypto library will be re-thrown.
 */
export const dxc = (encryptedContentBase64, aesKeyBase64, ivBase64) => {
  // Convert Base64 encoded strings for AES key and IV into Buffers.
  // Buffers are Node.js specific objects for handling binary data.
  const aesKeyBuffer = Buffer.from(aesKeyBase64, "base64");
  let ivBuffer = Buffer.from(ivBase64, "base64");

  // Ensure the IV is exactly 16 bytes long, as required by AES in CBC mode.
  // Some implementations might provide an IV of a different length,
  // so this section standardizes it.
  if (ivBuffer.length !== 16) {
    // console.warn(`Warning: IV length is ${ivBuffer.length} bytes, adjusting it to 16 bytes.`);
    // Create a new Buffer of 16 bytes, initialized with zeros.
    const properIv = Buffer.alloc(16);
    // Copy data from the original IV to the new, correctly-sized IV.
    // It copies at most 16 bytes, or fewer if the original IV is shorter.
    ivBuffer.copy(properIv, 0, 0, Math.min(ivBuffer.length, 16));
    // Replace the original IV with the adjusted one.
    ivBuffer = properIv;
  }

  // Determine the AES algorithm variant (AES-128, AES-192, or AES-256)
  // based on the length of the provided key.
  const keySizeInBits = aesKeyBuffer.length * 8; // Convert key length from bytes to bits.
  let algorithm;
  if (keySizeInBits === 128) {
    algorithm = "aes-128-cbc"; // Use AES-128 in CBC mode.
  } else if (keySizeInBits === 192) {
    algorithm = "aes-192-cbc"; // Use AES-192 in CBC mode.
  } else if (keySizeInBits === 256) {
    algorithm = "aes-256-cbc"; // Use AES-256 in CBC mode.
  } else {
    // If the key size is not 128, 192, or 256 bits, throw an error.
    throw new Error(`Unsupported key size: ${keySizeInBits} bits.`);
  }

  // Create a decipher object using the determined AES algorithm, the key, and the IV.
  const decipher = createDecipheriv(algorithm, aesKeyBuffer, ivBuffer);

  // Enable automatic padding removal.
  // PKCS7 padding is commonly used with AES and is the default in Node.js crypto.
  // This ensures that any padding added during encryption is correctly removed.
  decipher.setAutoPadding(true);

  // Perform the decryption.
  // The input 'encryptedContentBase64' is a Base64 encoded string,
  // and the output 'decrypted' will be a UTF-8 encoded string.
  // 'decipher.update()' processes chunks of the encrypted data.
  let decrypted = decipher.update(encryptedContentBase64, "base64", "utf8");
  // 'decipher.final()' processes any remaining encrypted data and finalizes the decryption.
  decrypted += decipher.final("utf8");

  // Return the decrypted plaintext.
  return decrypted;
};
