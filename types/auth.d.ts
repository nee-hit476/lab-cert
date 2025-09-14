/**
 * JSON Web Key (JWK) fields for Elliptic Curve (EC) cryptography.
 * 
 * - `d` is only present in private keys.
 * - Commonly used with ES256, ES384, ES512 algorithms.
 */
export interface JwkFields {
  /** Key Type (e.g., "EC") */
  kty: string;

  /** X coordinate for the elliptic curve point */
  x: string;

  /** Y coordinate for the elliptic curve point */
  y: string;

  /** Curve identifier (e.g., "P-256") */
  crv: string;

  /**
   * Private exponent (only present in private keys).
   * Must be omitted in public JWK representations.
   */
  d?: string;
}

/**
 * JWK Private Key — includes all fields from {@link JwkFields}.
 */
export type JwkPrivateFields = JwkFields;

/**
 * JWK Public Key — excludes the `d` field.
 */
export type JwkPublicFields = Pick<JwkFields, "kty" | "x" | "y" | "crv">;

/**
 * JWT Payload claims.
 * 
 * Includes standard registered claims (RFC 7519),
 * while allowing custom claims as needed.
 */
export interface JwtPayload extends Record<string, unknown> {
  /** Issuer */
  iss?: string;

  /** Subject */
  sub?: string;

  /** Audience */
  aud?: string | string[];

  /** Expiration time (seconds since epoch) */
  exp?: number;

  /** Not before time (seconds since epoch) */
  nbf?: number;

  /** Issued at (seconds since epoch) */
  iat?: number;

  /** JWT ID */
  jti?: string;
}


export interface userProps {
    id: string;
    name: string;
    email: string;
}