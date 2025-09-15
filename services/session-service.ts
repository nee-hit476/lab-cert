import prisma from "@/lib/prismaClient";
import { randomUUID } from "crypto";

export class SessionService {

    /**
     * @method createUserSession - manages create, and update of user Session.
     * @param {string} accountId - user accountId.
     * @param {string} userAgent - by which kind of utility the user is using to generate a request.
     * @param {string} ipAddress - from which user ip user is sending the request.  
     */
    public static async createUserSession(
        accountId: string,
        userAgent: string,
        ipAddress: string
    ) {
        return await prisma.session.create({
            data: {
                sessionToken: randomUUID(),
                accountId: accountId,
                userAgent: userAgent,
                ipAddress: ipAddress
            },select: {
                sessionToken: true,
                createdAt: true
            }
        });
    }
}