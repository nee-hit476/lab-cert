import GithubProvider from "next-auth/providers/github";
import { JWT } from "next-auth/jwt";
import * as jose from 'jose'
import { JwkPrivateFields, JwkPublicFields, JwtPayload, userProps } from "@/types/auth";
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/utils/prismaClient";


class JwtAuthHandler {
    private static LAB_CERT_SECRET_KEY: JwkPrivateFields = JwtAuthHandler.parseEnv<JwkPrivateFields>("LAB_CERT_SECRET_KEY", {
    kty: "EC",
    x: "dMaUs2RTZe0WB1g1zGXKFByJ-Px9StHH5l5XGNeKsyI",
    y: "QQYtIVT30shDfFEWmnayVUrf0f_39UA7EKk3ua-oTjg",
    crv: "P-256",
    d: "5O23vIXuuv2l1cPTxUulXreVxLKp5MKffpPPvGEtwIw",
  });

    public static LAB_CERT_PUBLIC_KEY: JwkPublicFields = {kty: 'EC', x: 'dMaUs2RTZe0WB1g1zGXKFByJ-Px9StHH5l5XGNeKsyI',y: 'QQYtIVT30shDfFEWmnayVUrf0f_39UA7EKk3ua-oTjg',crv: 'P-256'}

    /**
     * @method - handles jwt generation
     * @param {JwtPayload} payload - user payload to generate token
     * @param {string} expiresAt - expiration for jwt token 
     */
    public static async handleJwtGeneration(payload: JwtPayload, expiresAt: string) {
        const cryptoKey = await jose.importJWK(JwtAuthHandler.LAB_CERT_SECRET_KEY, "ES256");
        const token = await new jose.SignJWT(payload).setProtectedHeader({alg: "ES256"}).setIssuedAt().setIssuer(process.env.JWT_ISSUER || "devrel labs").setAudience(process.env.JWT_AUDIENCE || "audience").setExpirationTime(expiresAt).sign(cryptoKey)

        const verified = await jose.jwtVerify(token, JwtAuthHandler.LAB_CERT_PUBLIC_KEY);

        console.log("verified: ", verified)

        return token;
   }

   /**
    * @method - to validate the jwt keys
    * @param {string} key - jwt key
    * @param {T} fallback - default key given if the something went wrong  
    * */
   private static parseEnv<T>(key: string, fallback: T): T {
    try {
            return JSON.parse(process.env[key] ?? "") as T;
    } catch {
            return fallback;
        }
    }

    /**
     * @method - public method to verifyjwttoken
     * @param {string} userKey - user auth token
     */
    public static async verifyUserJwt(userKey: string) {
        try {
            const { payload } = await jose.jwtVerify(userKey, JwtAuthHandler.LAB_CERT_PUBLIC_KEY);
            return payload;
        }catch(err) {
            console.error("jwt verify error: ", JSON.stringify(err));
            return null;
        }
    }
}   

export class AuthHandler {

    /**
     * @method - authOptions for NextAuth
     */
    public static AuthOptions(): NextAuthOptions {
        return {
            adapter: PrismaAdapter(prisma),
            providers: [
                GithubProvider({
                    clientId: process.env.GITHUB_ID || "",
                    clientSecret: process.env.GITHUB_SECRET || ""
                })
            ],
            session: {
                strategy: "jwt",
                maxAge: 7 * 24 * 60 * 60       
            },
            jwt: {
                /**
                 * @method encode - signs JWT using jose + EC private key
                 */
                async encode({ token }: {token?:JWT}): Promise<string> {
                    if (!token) return "";

                    const payload: JwtPayload = {
                        sub: token.sub,
                        email: token.email,
                        name: token.name
                    }
                    return await JwtAuthHandler.handleJwtGeneration(payload, "7d");
                }, 

                /**
                 * @method decode - verify jwt using public key
                 */
                async decode({ token }: {token?:string}): Promise<JWT | null> {
                    if (!token) return null;
                    return (await JwtAuthHandler.verifyUserJwt(token) as JWT)
                }
            },
            callbacks: {
                /**
                 * @method jwt = add the extra clamins when yo
                 */
                async jwt({token, user} : {token: JWT, user: userProps}) {
                    if (user) {
                        token.id = user.id;
                        token.name = user.name;
                        token.email = user.email;
                    }

                    return token;
                }
            }

        }
    }
}

export default AuthHandler.AuthOptions;
export const JwtGen = JwtAuthHandler.handleJwtGeneration;