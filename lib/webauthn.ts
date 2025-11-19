
import { encodeBase64, decodeBase64, importKey, exportKey, encrypt, decrypt } from './crypto';
import { BiometricData } from '../types';

/**
 * This library handles the WebAuthn PRF (Pseudo-Random Function) extension.
 * It allows us to securely "wrap" the encryption key using the device's authenticator
 * (TouchID/FaceID) without the key ever leaving the device or being stored in plaintext.
 */

const IS_SUPPORTED = typeof PublicKeyCredential !== 'undefined' && typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function';

export const isBiometricSupported = async (): Promise<boolean> => {
    if (!IS_SUPPORTED) return false;
    try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        return available;
    } catch {
        return false;
    }
};

// --- Helpers for WebAuthn Encoding ---
const strToBin = (str: string) => Uint8Array.from(str, c => c.charCodeAt(0));
const binToStr = (bin: ArrayBuffer) => String.fromCharCode(...new Uint8Array(bin));

/**
 * Registers a new WebAuthn credential with the PRF extension enabled.
 * It then immediately asserts (logins) to get the PRF key, wraps the master key,
 * and returns the data structure to be stored in localStorage.
 */
export const registerBiometric = async (masterKey: CryptoKey, userId: string): Promise<BiometricData> => {
    if (!IS_SUPPORTED) throw new Error("WebAuthn not supported");

    // 1. Create Credential (Registration)
    const challenge = window.crypto.getRandomValues(new Uint8Array(32));
    const id = strToBin(userId); // User ID handle

    const creationOptions: any = {
        publicKey: {
            challenge,
            rp: { name: "Diary App", id: window.location.hostname },
            user: {
                id,
                name: "diary-user", // display name
                displayName: "Diary Owner"
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }], // ES256 and RS256
            authenticatorSelection: {
                authenticatorAttachment: 'platform', // FaceID/TouchID
                userVerification: 'required',
                requireResidentKey: false
            },
            timeout: 60000,
            extensions: {
                prf: {} // Enable PRF
            }
        }
    };

    const credential = await navigator.credentials.create(creationOptions) as any;
    if (!credential) throw new Error("Failed to create credential");

    const credentialId = encodeBase64(credential.rawId);

    // 2. Generate a random salt for PRF
    const saltBuffer = window.crypto.getRandomValues(new Uint8Array(32));
    const saltBase64 = encodeBase64(saltBuffer);

    // 3. Assert (Login) immediately to get the PRF secret
    // We need this to wrap the key. Registration usually doesn't return the PRF secret directly.
    const assertionOptions: any = {
        publicKey: {
            challenge: window.crypto.getRandomValues(new Uint8Array(32)),
            rpId: window.location.hostname,
            allowCredentials: [{
                type: 'public-key',
                id: credential.rawId
            }],
            userVerification: 'required',
            extensions: {
                prf: {
                    eval: {
                        first: saltBuffer
                    }
                }
            }
        }
    };

    const assertion = await navigator.credentials.get(assertionOptions) as any;
    const prfResults = assertion?.getClientExtensionResults()?.prf;

    if (!prfResults || !prfResults.results || !prfResults.results.first) {
        throw new Error("Authenticator does not support PRF extension.");
    }

    const prfKeyMaterial = new Uint8Array(prfResults.results.first);
    
    // 4. Derive a Wrapping Key from the PRF output
    const wrappingKey = await window.crypto.subtle.importKey(
        'raw',
        prfKeyMaterial,
        'AES-GCM',
        false,
        ['encrypt', 'decrypt']
    );

    // 5. Export Master Key to string
    const masterKeyString = await exportKey(masterKey); // Base64 string

    // 6. Wrap (Encrypt) the Master Key using the Wrapping Key
    // We use our existing `encrypt` helper but passing the wrappingKey
    // Note: `encrypt` expects a string plaintext and returns base64
    const { iv, data: encryptedKey } = await encrypt(wrappingKey, masterKeyString);

    return {
        credentialId,
        salt: saltBase64,
        encryptedKey,
        iv
    };
};

/**
 * Unlocks the Master Key using the stored Biometric Data.
 */
export const unlockBiometric = async (data: BiometricData): Promise<CryptoKey> => {
    const saltBuffer = decodeBase64(data.salt);
    const credentialIdBuffer = decodeBase64(data.credentialId);

    const assertionOptions: any = {
        publicKey: {
            challenge: window.crypto.getRandomValues(new Uint8Array(32)),
            rpId: window.location.hostname,
            allowCredentials: [{
                type: 'public-key',
                id: credentialIdBuffer
            }],
            userVerification: 'required',
            extensions: {
                prf: {
                    eval: {
                        first: saltBuffer
                    }
                }
            }
        }
    };

    // 1. Authenticate
    const assertion = await navigator.credentials.get(assertionOptions) as any;
    if (!assertion) throw new Error("Authentication failed");

    const prfResults = assertion?.getClientExtensionResults()?.prf;
    if (!prfResults || !prfResults.results || !prfResults.results.first) {
        throw new Error("Could not retrieve PRF key from authenticator.");
    }

    // 2. Re-derive Wrapping Key
    const prfKeyMaterial = new Uint8Array(prfResults.results.first);
    const wrappingKey = await window.crypto.subtle.importKey(
        'raw',
        prfKeyMaterial,
        'AES-GCM',
        false,
        ['encrypt', 'decrypt']
    );

    // 3. Unwrap Master Key
    const masterKeyString = await decrypt(wrappingKey, data.encryptedKey, data.iv);
    
    // 4. Import Master Key
    return importKey(masterKeyString);
};
