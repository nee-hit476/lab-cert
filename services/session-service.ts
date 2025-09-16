import prisma from "@/lib/prismaClient";

export class SessionService {

    // /**
    //  * @method createUserSession - manages create, and update of user Session.
    //  * @param {string} accountId - user accountId.
    //  * @param {string} userAgent - by which kind of utility the user is using to generate a request.
    //  * @param {string} ipAddress - from which user ip user is sending the request.  
    //  */
    // public static async createUserSession(
    //     accountId: string,
    //     userAgent: string,
    //     ipAddress: string
    // ) {
    //     return await prisma.session.create({
    //         data: {
    //             sessionToken: randomUUID(),
    //             accountId: accountId,
    //             userAgent: userAgent,
    //             ipAddress: ipAddress
    //         },select: {
    //             sessionToken: true,
    //             createdAt: true
    //         }
    //     });
    // }

    /**
     * @method upsertSession - to perform update and create session if it exists or not.
     * @param {string} sessionToken - sessionToken to find or create the session for the user. 
     * @param {string} userId - user account id.
     * @param {string} userAgent - by which util user is sending request.
     * @param {string} ipAddress - by which ip the request is coming.
     */
    public static async upsertSession(
        sessionToken: string,
        userId: string,
        userAgent: string,
        ipAddress: string
    ) {
        return await prisma.session.upsert({
            where: {
                sessionToken
            },
            update: {
                lastActivityAt: new Date(),
                userAgent,
                ipAddress
            },
            create: {
                sessionToken: sessionToken,
                accountId: userId,
                userAgent: userAgent ?? "NA",
                ipAddress: ipAddress ?? "0.0.0.0"
            }
        })
    }

    /**
     * @method findSessionByToken - public method to find session details by sessionToken.
     * @param {string} sessionToken - sessionToken to find session details.
     */
    public static async findSessionByToken(sessionToken: string) {
        return await prisma.session.findUnique({
            where: {
                sessionToken
            }, include: {
                /** adds the accounts relational fields in the query output */
                account: true
            }
        })
    }

    /**
     * @method updateUserActivity - public method to update user session.
     * @param {string} sessionToken - session token to update user session.
     */
    public static async updateUserActivity(sessionToken: string) {
        return await prisma.session.update({
            where: {
                sessionToken
            },
            data: {
                /** update user last activity */
                lastActivityAt: new Date()
            }
        })
    }

    /**
     * @method deleteUserSession - public method to delete user session.
     * @param {string} sessionToken - session token to find and delete the user session.
     */
    public static async deleteUsersSession(sessionToken: string) {
        return await prisma.session.delete({
            where: {
                sessionToken
            }
        })
    }

}