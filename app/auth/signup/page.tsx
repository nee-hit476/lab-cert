import { AuthHandler } from "@/lib/auth";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getServerSession } from "next-auth";
import { getProviders, signIn } from "next-auth/react";

const SignUp = ({
    providers
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {

    return (
       <>
        {Object.values(providers).map((provider) => (
            <div key={provider.name}>
                <button onClick={() => signIn(provider.id)}>SignIn with { provider.name }</button>
            </div>
        ))}
       </>
    )
}

export async function getServerSideProps(context:GetServerSidePropsContext) {
    const session = await getServerSession(context.req, context.res, AuthHandler.AuthOptions())
    console.log("Session: ", session);

    if (session) {
        return {
            redirect: {
                destination: "/"
            }
        }
    }

    const providers = await getProviders();
    return {
        props: {
            providers: providers ?? []
        }
    }
}

export default SignUp;