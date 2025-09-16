import { Adapter, AdapterSession, AdapterUser, NewAdapterUser, AdapterAccount } from "next-auth/adapters";
import prisma from "../prismaClient";
// import { ProfileProps } from "@/types/prismaAdapter";
// import { Account } from "@prisma/client";
import { SessionService } from "@/services/session-service";
import { randomUUID } from "crypto";
declare module "next-auth/adapters" {
    interface NewAdapterUser extends AdapterUser {
        id: string;
        name?: string | null;
        image?: string | null;
        certificate?: import("@prisma/client").Certificate | null;
    }
}
export class CustomPrismaAdapter implements Adapter {

    /**
     * @method createUser - handle user creation in DB.
     * @param {ProfileProps} profile - contains the user github related cred.
     * @returns {Promise<Account>}
     */
    public async createUser(user: NewAdapterUser): Promise<AdapterUser> {
        console.log("Creating user from NewAdapterUser:", user);

        const account = await prisma.account.create({
            data: {
                github_username: user.name ?? "",
                github_email: user.email ?? "",
                provider: "github",
                providerAccountId: user.id ?? randomUUID() // fallback if missing
            }
            })


        return {
            id: account.accountId,
            name: account.github_username,
            email: account.github_email,
            emailVerified: null,
            image: null
        };
    }

    /**
     * @method linkAccount - public method to save provider and providerAccountId.
     * @param {AdapterAccount} account 
     */

    public async linkAccount(account: AdapterAccount): Promise<void> {
        console.log("Linking account", account);

        await prisma.account.update({
            where: { accountId: account.userId },
            data: {
            provider: account.provider,
            providerAccountId: account.providerAccountId
            }
        });
    }   



    /**
     * @method getUserByAccount - get user details by provider and providerAccountId.
     * @param { providerAccountId: Pick<AdapterAccount, "provider" | "providerAccountId"> } 
     * @returns {Promise<import("next-auth/adapters").AdapterUser | null>}
     */
    public async getUserByAccount(providerAccountId: Pick<AdapterAccount, "provider" | "providerAccountId">): Promise<import("next-auth/adapters").AdapterUser | null> {
        console.log("provider: ", providerAccountId.provider);
        console.log("providerAccountID: ", providerAccountId.providerAccountId)
        
        const account = await prisma.account.findUnique({
            where: {
                provider_providerAccountId: {
                    provider: providerAccountId.provider,
                    providerAccountId: providerAccountId.providerAccountId
                }
            },
            include: {
                sessions: true
            }
        });

        if (!account) return null;

        return {
            id: account.accountId,
            name: account.github_username,
            email: account.github_email,
            emailVerified: null, // or account.emailVerified if available
            image: null // or account.image if available
        };
    }

    /**
     * @method getUser - get user details based on id.
     * @param id - user id
     * @returns {Promise<import("next-auth/adapters").AdapterUser | null>}
     */
    public async getUser(id: string): Promise<import("next-auth/adapters").AdapterUser | null> {
        const account = await prisma.account.findUnique({ where: { accountId: id } });
        if (!account) return null;
        return {
            id: account.accountId,
            name: account.github_username,
            email: account.github_email,
            emailVerified: null, // or account.emailVerified if you have this field
            image: null // or account.image if you have this field
        };
    }

    /**
     * @method getUserByEmail - get user details based on credentials.
     * @param {string} email - user email.
     * @returns {Promise<import("next-auth/adapters").NewAdapterUser | null>} 
     */
    public async getUserByEmail(email: string):  Promise<import("next-auth/adapters").NewAdapterUser | null> {
        const account = await prisma.account.findUnique({
            where: {
                github_email: email
            },
            include: {
                certificate: true
            }
        });

        if (!account) return null;

        return {
            id: account.accountId,
            name: account.github_username,
            email: account.github_email,
            emailVerified: null, // or account.emailVerified if available
            image: null, // or account.image if available
            certificate: Array.isArray(account.certificate) ? account.certificate[0] : account.certificate ?? null
        };
    }

    /**
     * @method createUserSession - create user activity session.
     * @param {object} session - session data for session creation. 
     * @returns {AdapterSession}
     */
    public async createSession(session: {
        sessionToken: string;
        userId: string;
    }): Promise<AdapterSession> {
        const createdSession = await SessionService.upsertSession(
            session.sessionToken,
            session.userId,
            "NA",
            "0.0.0.0"
        )
        return {
            sessionToken: createdSession.sessionToken,
            userId: createdSession.accountId,
            expires: new Date(Date.now() + 24 * 60 * 60)
        };
    }

    /**
     * @method getSessionAndUser - to get the user from a specific session.
     * @param {string} sessionToken - sessionToken to find the user 
     * @returns {Promise<{session: AdapterSession; user: NewAdapterUser} | null>}
     */
    public async getSessionAndUser(sessionToken: string): Promise<{session: AdapterSession; user: NewAdapterUser} | null> {
        const sessionAndUser = await SessionService.findSessionByToken(sessionToken);

        if (!sessionAndUser) return null;

        const session: AdapterSession = {
            sessionToken: sessionAndUser?.sessionToken ?? "",
            expires: new Date(Date.now() - 24 * 60 * 60),
            userId: sessionAndUser?.accountId ?? ""
        }

        const user: NewAdapterUser = {
            id: sessionAndUser?.accountId ?? "",
            name: sessionAndUser?.account.github_username ?? "",
            email: sessionAndUser?.account.github_email ?? "",
            emailVerified: sessionAndUser?.account.createdAt ?? new Date(),
            image: null
        }

        return {
            session,
            user
        }
    }

    /**
     * @method updateSession - to update the session
     * @param {Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">} session - session object with at least sessionToken
     * @returns {Promise<AdapterSession | null | undefined>}
     */
    public async updateSession(session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">): Promise<AdapterSession | null | undefined> {
        const updatedSession = await SessionService.updateUserActivity(session.sessionToken);

        if (!updatedSession) return null;

        return {
            sessionToken: updatedSession.sessionToken,
            userId: updatedSession.accountId,
            expires: new Date(Date.now() - 24 * 60 * 60)
        }
    }

    /**
     * @method deleteSession - public method to deleteSession of user
     * @param {string} sessionToken - session token string.
     * @returns {Promise<AdapterSession | null | undefined>}
     */
    public async deleteSession(sessionToken: string): Promise<AdapterSession | null | undefined> {
        const deletedSession = await SessionService.deleteUsersSession(sessionToken);

        if (!deletedSession) return null;

        return {
            sessionToken: deletedSession.sessionToken,
            userId: deletedSession.accountId,
            expires: new Date(Date.now() - 24 * 60 * 60)
        }
    }
}   

/**
 * @method createCustomPrismaAdapter - to instanciate the prisma adapter methods
 * @returns {Adapter}
 */
// export default function createCustomPrismaAdapter(): Adapter {
//     return new CustomPrismaAdapter();
// }

export default function createCustomPrismaAdapter(): Adapter {
  const instance = new CustomPrismaAdapter();

  return {
    createUser: instance.createUser.bind(instance),
    getUserByAccount: instance.getUserByAccount.bind(instance),
    getUser: instance.getUser.bind(instance),
    getUserByEmail: instance.getUserByEmail.bind(instance),
    createSession: instance.createSession.bind(instance),
    getSessionAndUser: instance.getSessionAndUser.bind(instance),
    updateSession: instance.updateSession.bind(instance),
    deleteSession: instance.deleteSession.bind(instance),
    linkAccount: instance.linkAccount.bind(instance)
  };
}
