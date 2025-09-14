import { generateKeyPairSync } from "crypto";

// Generate an EC keypair using P-256 curve
const { publicKey, privateKey } = generateKeyPairSync("ec", {
  namedCurve: "P-256",
});

// Export as JWK
console.log("Public JWK:", publicKey.export({ format: "jwk" }));
console.log("Private JWK:", privateKey.export({ format: "jwk" }));

/**
 * 
 * Public JWK: {
  kty: 'EC',
  x: 'dMaUs2RTZe0WB1g1zGXKFByJ-Px9StHH5l5XGNeKsyI',
  y: 'QQYtIVT30shDfFEWmnayVUrf0f_39UA7EKk3ua-oTjg',
  crv: 'P-256'
}
Private JWK: {
  kty: 'EC',
  x: 'dMaUs2RTZe0WB1g1zGXKFByJ-Px9StHH5l5XGNeKsyI',
  y: 'QQYtIVT30shDfFEWmnayVUrf0f_39UA7EKk3ua-oTjg',
  crv: 'P-256',
  d: '5O23vIXuuv2l1cPTxUulXreVxLKp5MKffpPPvGEtwIw'
}
 */