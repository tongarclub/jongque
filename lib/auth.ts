import { NextAuthOptions } from "next-auth"
// import { PrismaAdapter } from "@auth/prisma-adapter" // Disabled for now
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
// import bcrypt from "bcryptjs" // TODO: Add password authentication
import { UserRole } from "@prisma/client"

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma), // Temporarily disabled due to type conflicts
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            business: true,
          },
        })

        if (!user) {
          return null
        }

        // For OAuth users, password might not be set
        if (!credentials.password) {
          return null
        }

        // TODO: Add password field to User model for credentials auth
        // const isPasswordValid = await bcrypt.compare(
        //   credentials.password,
        //   user.password
        // )

        // if (!isPasswordValid) {
        //   return null
        // }

        return {
          id: user.id,
          email: user.email || "",
          name: user.name || "",
          image: user.image || undefined,
          role: user.role,
          businessId: user.business?.id,
          isVerified: user.isVerified,
        } as any
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Get user from database to get latest info
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { business: true },
        })

        if (dbUser) {
          token.role = dbUser.role
          token.businessId = dbUser.business?.id
          token.isVerified = dbUser.isVerified
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as UserRole
        session.user.businessId = token.businessId as string | undefined
        session.user.isVerified = token.isVerified as boolean
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "facebook") {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          })

          if (!existingUser) {
            // Create new user for OAuth
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name!,
                image: user.image,
                role: UserRole.CUSTOMER,
                isVerified: true, // OAuth users are pre-verified
              },
            })
          }
          return true
        } catch (error) {
          console.error("Error during sign in:", error)
          return false
        }
      }
      return true
    },
  },
  events: {
    async createUser({ user }) {
      console.log("New user created:", user.email)
      // TODO: Send welcome email
    },
    async signIn({ user, account, isNewUser }) {
      console.log("User signed in:", user.email, "via", account?.provider)
      if (isNewUser) {
        // TODO: Send welcome email for new users
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
}
