const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://swg.xerinexpress.com/api/v1"

export class ApiError extends Error {
  status: number
  errors: any
  constructor(message: string, status: number, errors?: any) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

async function request<T = any>(endpoint: string, options: Record<string, any> = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const token = options.token ?? getToken()

  const config: Record<string, any> = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  if (options.body && typeof options.body === "object") {
    config.body = JSON.stringify(options.body)
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, config)
  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new ApiError(
      data.message || "Something went wrong",
      response.status,
      data.errors
    )
  }

  return data
}

export const api = {
  auth: {
    register: (body: Record<string, any>) => request("/auth/register", { method: "POST", body }),
    login: (body: Record<string, any>) => request("/auth/login", { method: "POST", body }),
    me: (token?: string) => request("/auth/me", { method: "GET", token }),
    forgotPassword: (body: Record<string, any>) => request("/auth/forgot-password", { method: "POST", body }),
    verifyOtp: (body: Record<string, any>) => request("/auth/verify-otp", { method: "POST", body }),
    resetPassword: (body: Record<string, any>) => request("/auth/reset-password", { method: "POST", body }),
  },
  shipments: {
    list: (params?: string) => request(`/shipments${params ? `?${params}` : ""}`),
    stats: () => request("/shipments/stats"),
    get: (id: string) => request(`/shipments/${id}`),
    track: (trackingNumber: string) => request(`/shipments/track/${trackingNumber}`),
    create: (body: Record<string, any>) => request("/shipments", { method: "POST", body }),
    updateStatus: (id: string, body: Record<string, any>) => request(`/shipments/${id}/status`, { method: "PUT", body }),
    assign: (id: string, body: Record<string, any>) => request(`/shipments/${id}/assign`, { method: "PUT", body }),
    cancel: (id: string) => request(`/shipments/${id}/cancel`, { method: "PUT" }),
  },
  orders: {
    list: (params?: string) => request(`/orders${params ? `?${params}` : ""}`),
    stats: () => request("/orders/stats"),
    get: (id: string) => request(`/orders/${id}`),
  },
  quotes: {
    calculate: (body: Record<string, any>) => request("/quotes/calculate", { method: "POST", body }),
    multiple: (body: Record<string, any>) => request("/quotes/multiple", { method: "POST", body }),
    save: (body: Record<string, any>) => request("/quotes/save", { method: "POST", body }),
    list: () => request("/quotes"),
    get: (id: string) => request(`/quotes/${id}`),
    createRequest: (body: Record<string, any>) => request("/quotes/requests", { method: "POST", body }),
    listRequests: () => request("/quotes/requests"),
    respondToRequest: (id: string, body: Record<string, any>) => request(`/quotes/requests/${id}/respond`, { method: "PUT", body }),
    customerRespond: (id: string, body: Record<string, any>) => request(`/quotes/requests/${id}/customer-respond`, { method: "PUT", body }),
  },
  pricing: {
    listRules: () => request("/pricing/rules"),
    createRule: (body: Record<string, any>) => request("/pricing/rules", { method: "POST", body }),
    updateRule: (id: string, body: Record<string, any>) => request(`/pricing/rules/${id}`, { method: "PUT", body }),
    deleteRule: (id: string) => request(`/pricing/rules/${id}`, { method: "DELETE" }),
    toggleRule: (id: string) => request(`/pricing/rules/${id}/toggle`, { method: "PATCH" }),
    listSurcharges: () => request("/pricing/surcharges"),
    createSurcharge: (body: Record<string, any>) => request("/pricing/surcharges", { method: "POST", body }),
    deleteSurcharge: (id: string) => request(`/pricing/surcharges/${id}`, { method: "DELETE" }),
  },
  drivers: {
    list: () => request("/drivers"),
    create: (body: Record<string, any>) => request("/drivers", { method: "POST", body }),
    updateStatus: (id: string, body: Record<string, any>) => request(`/drivers/${id}/status`, { method: "PATCH", body }),
  },
  carriers: {
    list: () => request("/carriers"),
    create: (body: Record<string, any>) => request("/carriers", { method: "POST", body }),
    get: (id: string) => request(`/carriers/${id}`),
  },
  vehicles: {
    list: () => request("/vehicles"),
    create: (body: Record<string, any>) => request("/vehicles", { method: "POST", body }),
    updateStatus: (id: string, body: Record<string, any>) => request(`/vehicles/${id}/status`, { method: "PATCH", body }),
  },
  manifests: {
    list: (params?: string) => request(`/manifests${params ? `?${params}` : ""}`),
    get: (id: string) => request(`/manifests/${id}`),
    create: (body: Record<string, any>) => request("/manifests", { method: "POST", body }),
    createSGR: (body: Record<string, any>) => request("/manifests/sgr", { method: "POST", body }),
    scanParcel: (id: string, body: Record<string, any>) => request(`/manifests/${id}/scan`, { method: "POST", body }),
    completeLoading: (id: string) => request(`/manifests/${id}/complete-loading`, { method: "POST" }),
    signHandover: (id: string, body: Record<string, any>) => request(`/manifests/${id}/handover`, { method: "POST", body }),
    getByQR: (qrCode: string) => request(`/manifests/qr/${qrCode}`),
    updateStatus: (id: string, body: Record<string, any>) => request(`/manifests/${id}/status`, { method: "PATCH", body }),
  },
  waybills: {
    get: (shipmentId: string) => request(`/waybills/${shipmentId}`),
  },
  payments: {
    list: () => request("/payments"),
    create: (body: Record<string, any>) => request("/payments", { method: "POST", body }),
    get: (id: string) => request(`/payments/${id}`),
  },
  geography: {
    listCountries: () => request("/geography/countries"),
    listCities: (countryId?: string) => request(`/geography/cities${countryId ? `?countryId=${countryId}` : ""}`),
    listRoutes: () => request("/geography/routes"),
    createCountry: (body: Record<string, any>) => request("/geography/countries", { method: "POST", body }),
    createCity: (body: Record<string, any>) => request("/geography/cities", { method: "POST", body }),
    createRoute: (body: Record<string, any>) => request("/geography/routes", { method: "POST", body }),
  },
  tracking: {
    trackShipment: (trackingNumber: string) => request(`/tracking/shipments/${trackingNumber}`),
    updateDriverLocation: (body: Record<string, any>) => request("/tracking/driver/location", { method: "POST", body }),
    getDriverLocation: (driverId: string) => request(`/tracking/driver/${driverId}`),
    addEvent: (shipmentId: string, body: Record<string, any>) => request(`/tracking/shipments/${shipmentId}/events`, { method: "POST", body }),
  },
  notifications: {
    list: () => request("/notifications"),
    markRead: (id: string) => request(`/notifications/${id}/read`, { method: "PATCH" }),
    markAllRead: () => request("/notifications/read-all", { method: "PATCH" }),
  },
  customs: {
    get: (shipmentId: string) => request(`/customs/${shipmentId}`),
    create: (body: Record<string, any>) => request("/customs", { method: "POST", body }),
    updateStatus: (id: string, body: Record<string, any>) => request(`/customs/${id}/status`, { method: "PUT", body }),
  },
  documents: {
    list: (shipmentId?: string) => request(`/documents${shipmentId ? `?shipmentId=${shipmentId}` : ""}`),
    upload: (body: Record<string, any>) => request("/documents", { method: "POST", body }),
    verify: (id: string, body: Record<string, any>) => request(`/documents/${id}/verify`, { method: "PUT", body }),
    delete: (id: string) => request(`/documents/${id}`, { method: "DELETE" }),
  },
  customers: {
    list: (params?: string) => request(`/customers${params ? `?${params}` : ""}`),
    create: (body: Record<string, any>) => request("/customers", { method: "POST", body }),
    get: (id: string) => request(`/customers/${id}`),
    update: (id: string, body: Record<string, any>) => request(`/customers/${id}`, { method: "PUT", body }),
    stats: (id: string) => request(`/customers/${id}/stats`),
  },
  parcelCategories: {
    list: (params?: string) => request(`/parcel-categories${params ? `?${params}` : ""}`),
    get: (id: string) => request(`/parcel-categories/${id}`),
    create: (body: Record<string, any>) => request("/parcel-categories", { method: "POST", body }),
    update: (id: string, body: Record<string, any>) => request(`/parcel-categories/${id}`, { method: "PUT", body }),
    delete: (id: string) => request(`/parcel-categories/${id}`, { method: "DELETE" }),
    toggle: (id: string) => request(`/parcel-categories/${id}/toggle`, { method: "PATCH" }),
  },
  parcelWeights: {
    list: (params?: string) => request(`/parcel-weights${params ? `?${params}` : ""}`),
    create: (body: Record<string, any>) => request("/parcel-weights", { method: "POST", body }),
    update: (id: string, body: Record<string, any>) => request(`/parcel-weights/${id}`, { method: "PUT", body }),
    delete: (id: string) => request(`/parcel-weights/${id}`, { method: "DELETE" }),
    toggle: (id: string) => request(`/parcel-weights/${id}/toggle`, { method: "PATCH" }),
  },
  parcelFares: {
    list: () => request("/parcel-fares/fares"),
    create: (body: Record<string, any>) => request("/parcel-fares/fares", { method: "POST", body }),
    update: (id: string, body: Record<string, any>) => request(`/parcel-fares/fares/${id}`, { method: "PUT", body }),
    delete: (id: string) => request(`/parcel-fares/fares/${id}`, { method: "DELETE" }),
    listFareWeights: () => request("/parcel-fares/fare-weights"),
    createFareWeight: (body: Record<string, any>) => request("/parcel-fares/fare-weights", { method: "POST", body }),
    updateFareWeight: (id: string, body: Record<string, any>) => request(`/parcel-fares/fare-weights/${id}`, { method: "PUT", body }),
    deleteFareWeight: (id: string) => request(`/parcel-fares/fare-weights/${id}`, { method: "DELETE" }),
    estimate: (params: string) => request(`/parcel-fares/estimate?${params}`),
  },
  paymentGateways: {
    list: () => request("/payment-gateways"),
    get: (id: string) => request(`/payment-gateways/${id}`),
    create: (body: Record<string, any>) => request("/payment-gateways", { method: "POST", body }),
    update: (id: string, body: Record<string, any>) => request(`/payment-gateways/${id}`, { method: "PUT", body }),
    delete: (id: string) => request(`/payment-gateways/${id}`, { method: "DELETE" }),
    toggle: (id: string) => request(`/payment-gateways/${id}/toggle`, { method: "PATCH" }),
    active: () => request("/payment-gateways/active"),
    initiate: (body: Record<string, any>) => request("/payment-gateways/initiate", { method: "POST", body }),
  },
  surgePricing: {
    list: (params?: string) => request(`/surge-pricing${params ? `?${params}` : ""}`),
    create: (body: Record<string, any>) => request("/surge-pricing", { method: "POST", body }),
    update: (id: string, body: Record<string, any>) => request(`/surge-pricing/${id}`, { method: "PUT", body }),
    delete: (id: string) => request(`/surge-pricing/${id}`, { method: "DELETE" }),
    toggle: (id: string) => request(`/surge-pricing/${id}/toggle`, { method: "PATCH" }),
  },
  zones: {
    list: (params?: string) => request(`/zones${params ? `?${params}` : ""}`),
    get: (id: string) => request(`/zones/${id}`),
    create: (body: Record<string, any>) => request("/zones", { method: "POST", body }),
    update: (id: string, body: Record<string, any>) => request(`/zones/${id}`, { method: "PUT", body }),
    delete: (id: string) => request(`/zones/${id}`, { method: "DELETE" }),
    toggle: (id: string) => request(`/zones/${id}/toggle`, { method: "PATCH" }),
  },
  users: {
    list: (params?: string) => request(`/users${params ? `?${params}` : ""}`),
    get: (id: string) => request(`/users/${id}`),
    create: (body: Record<string, any>) => request("/users", { method: "POST", body }),
    update: (id: string, body: Record<string, any>) => request(`/users/${id}`, { method: "PUT", body }),
    delete: (id: string) => request(`/users/${id}`, { method: "DELETE" }),
    toggle: (id: string) => request(`/users/${id}/toggle`, { method: "PATCH" }),
    changeRole: (id: string, role: string) => request(`/users/${id}/role`, { method: "PATCH", body: { role } }),
    changePassword: (id: string, body: Record<string, any>) => request(`/users/${id}/password`, { method: "PUT", body }),
    stats: () => request("/users/stats"),
  },
  settings: {
    getMapConfig: () => request("/settings/map"),
    updateMapConfig: (body: Record<string, any>) => request("/settings/map", { method: "PUT", body }),
    getPublicMapConfig: () => request("/settings/public-map"),
  },
}
