import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Demo Login",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (credentials?.email === "admin@quantgrid.com" && credentials?.password === "admin123") {
                    return {
                        id: "demo-user-1",
                        name: "QuantGrid Admin",
                        email: "admin@quantgrid.com",
                        image: "https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff"
                    };
                }
                return null;
            }
        })
    ],
    pages: {
        signIn: '/auth/signin',
        // error: '/auth/error', // Error code passed in query string as ?error=
        // verifyRequest: '/auth/verify-request', // (used for check email message)
        // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
    },
    callbacks: {
        async session({ session, token }) {
            // Send properties to the client, like an access_token from a provider.
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
