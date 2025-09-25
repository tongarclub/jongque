import { NextAuthOptions } from "next-auth"
// import { PrismaAdapter } from "@auth/prisma-adapter" // Disabled for now
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"

// Custom LINE Login Provider
const LineProvider = {
  id: "line",
  name: "LINE",
  type: "oauth" as const,
  authorization: {
    url: "https://access.line.me/oauth2/v2.1/authorize",
    params: {
      scope: "profile openid email",
      response_type: "code",
    },
  },
  token: "https://api.line.me/oauth2/v2.1/token",
  userinfo: "https://api.line.me/v2/profile",
  client: {
    token_endpoint_auth_method: "client_secret_post",
  },
  clientId: process.env.LINE_CLIENT_ID,
  clientSecret: process.env.LINE_CLIENT_SECRET,
  profile(profile: any) {
    return {
      id: profile.userId,
      name: profile.displayName,
      email: profile.email || null,
      image: profile.pictureUrl,
    }
  },
}

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma), // Temporarily disabled due to type conflicts
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
    error: "/error",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "email public_profile",
        },
      },
    }),
    LineProvider as any,
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
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            password: true,
            role: true,
            isVerified: true,
            business: {
              select: {
                id: true
              }
            }
          },
        })

        if (!user) {
          return null
        }

        // Check if user has a password (for credentials auth)
        if (!user.password) {
          console.log("User has no password set:", user.email)
          return null
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          console.log("Invalid password for user:", user.email)
          return null
        }

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
          select: {
            id: true,
            role: true,
            isVerified: true,
            business: {
              select: {
                id: true
              }
            }
          },
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
      if (account?.provider === "google" || account?.provider === "facebook" || account?.provider === "line") {
        try {
          // Check if user exists by email or by provider account
          let existingUser = null
          
          if (user.email) {
            existingUser = await prisma.user.findUnique({
              where: { email: user.email },
              select: {
                id: true,
                email: true,
                name: true,
                image: true,
                role: true,
                isVerified: true,
              },
            })
          }

          if (!existingUser) {
            // For LINE users without email, check by provider account
            const existingAccount = await prisma.account.findUnique({
              where: {
                provider_providerAccountId: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                },
              },
              select: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                    image: true,
                    role: true,
                    isVerified: true,
                  }
                }
              },
            })
            
            if (existingAccount) {
              existingUser = existingAccount.user
            }
          }

          if (!existingUser) {
            // Create new user for OAuth
            const userData: any = {
              name: user.name!,
              image: user.image,
              role: UserRole.CUSTOMER,
              isVerified: true, // OAuth users are pre-verified
            }
            
            // Only add email if it exists (LINE might not provide email)
            if (user.email) {
              userData.email = user.email
            }
            
            await prisma.user.create({
              data: userData,
            })
          } else if (user.email && !existingUser.email && account?.provider === "line") {
            // Update existing user with email if LINE provides it
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { email: user.email },
            })
          }
          
          return true
        } catch (error) {
          console.error("Error during OAuth sign in:", error)
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
