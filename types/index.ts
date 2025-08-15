import { 
  User, 
  Business, 
  Service, 
  Staff, 
  Booking, 
  OperatingHours,
  StaffAvailability,
  BlackoutDate,
  BookingNotification,
  Subscription,
  Payment,
  UserRole,
  BookingType,
  BookingStatus,
  NotificationType,
  NotificationStatus,
  SubscriptionTier,
  SubscriptionStatus,
  PaymentStatus
} from '@prisma/client'

// Export Prisma types
export type {
  User,
  Business,
  Service,
  Staff,
  Booking,
  OperatingHours,
  StaffAvailability,
  BlackoutDate,
  BookingNotification,
  Subscription,
  Payment,
  UserRole,
  BookingType,
  BookingStatus,
  NotificationType,
  NotificationStatus,
  SubscriptionTier,
  SubscriptionStatus,
  PaymentStatus,
}

// Extended types with relations
export type UserWithRelations = User & {
  business?: Business | null
  bookings?: Booking[]
}

export type BusinessWithRelations = Business & {
  owner: User
  services: Service[]
  staff: Staff[]
  bookings: Booking[]
  operatingHours: OperatingHours[]
  blackoutDates: BlackoutDate[]
  subscription?: Subscription | null
}

export type BookingWithRelations = Booking & {
  customer?: User | null
  business: Business
  service: Service
  staff?: Staff | null
  notifications: BookingNotification[]
}

export type StaffWithRelations = Staff & {
  business: Business
  bookings: Booking[]
  availability: StaffAvailability[]
}

export type ServiceWithRelations = Service & {
  business: Business
  bookings: Booking[]
}

// API Response types
export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Form types
export type CreateBusinessData = {
  name: string
  description?: string
  phone?: string
  email?: string
  address?: string
  subdomain?: string
  primaryColor?: string
  secondaryColor?: string
  welcomeMessage?: string
}

export type CreateServiceData = {
  name: string
  description?: string
  duration: number
  price?: number
  businessId: string
}

export type CreateStaffData = {
  name: string
  email?: string
  phone?: string
  businessId: string
}

export type CreateBookingData = {
  type: BookingType
  bookingDate: Date
  bookingTime?: string
  serviceId: string
  staffId?: string
  businessId: string
  customerId?: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  notes?: string
}

export type UpdateBookingData = Partial<CreateBookingData> & {
  id: string
  status?: BookingStatus
  cancellationReason?: string
  cancellationFee?: number
}

// Dashboard types
export type BookingStats = {
  total: number
  confirmed: number
  completed: number
  cancelled: number
  noShow: number
  todayBookings: number
  weeklyBookings: number
  monthlyRevenue: number
}

export type BusinessAnalytics = {
  bookingStats: BookingStats
  popularServices: Array<{
    service: Service
    bookingCount: number
  }>
  peakHours: Array<{
    hour: number
    bookingCount: number
  }>
  customerRetention: {
    newCustomers: number
    returningCustomers: number
    retentionRate: number
  }
}

// Calendar types
export type TimeSlot = {
  time: string
  available: boolean
  staffId?: string
  staffName?: string
  bookingId?: string
}

export type DaySchedule = {
  date: Date
  isOpen: boolean
  timeSlots: TimeSlot[]
  blackoutReason?: string
}

// Notification types
export type NotificationTemplate = {
  type: NotificationType
  title: string
  message: string
  variables: string[]
}

export type NotificationPreferences = {
  email: boolean
  line: boolean
  sms: boolean
  booking_confirmation: boolean
  reminder_30min: boolean
  queue_ready: boolean
  cancellation: boolean
  rescheduled: boolean
}

// Theme types
export type ThemeConfig = {
  primaryColor: string
  secondaryColor: string
  fontFamily?: string
  logoUrl?: string
  coverImageUrl?: string
}

// Search and filter types
export type BookingFilters = {
  status?: BookingStatus[]
  dateFrom?: Date
  dateTo?: Date
  serviceId?: string
  staffId?: string
  customerId?: string
}

export type PaginationParams = {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Auth types
export type LoginCredentials = {
  email: string
  password: string
}

export type RegisterData = {
  email: string
  name: string
  phone?: string
  role: UserRole
}

export type AuthUser = {
  id: string
  email: string
  name: string
  role: UserRole
  businessId?: string
}

// Error types
export type ValidationError = {
  field: string
  message: string
}

export type ApiError = {
  message: string
  code?: string
  statusCode?: number
  validationErrors?: ValidationError[]
}
