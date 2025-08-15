"use client"

import { useSession } from "next-auth/react"
import { UserRole } from "@prisma/client"

export function useAuth() {
  const { data: session, status } = useSession()

  const isLoading = status === "loading"
  const isAuthenticated = status === "authenticated"
  const user = session?.user

  const hasRole = (role: UserRole | UserRole[]) => {
    if (!user) return false
    if (Array.isArray(role)) {
      return role.includes(user.role)
    }
    return user.role === role
  }

  const isCustomer = () => hasRole(UserRole.CUSTOMER)
  const isBusinessOwner = () => hasRole(UserRole.BUSINESS_OWNER)
  const isAdmin = () => hasRole(UserRole.ADMIN)

  const canAccessBusiness = () => {
    return hasRole([UserRole.BUSINESS_OWNER, UserRole.ADMIN])
  }

  const canAccessAdmin = () => {
    return hasRole(UserRole.ADMIN)
  }

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    hasRole,
    isCustomer,
    isBusinessOwner,
    isAdmin,
    canAccessBusiness,
    canAccessAdmin,
  }
}
