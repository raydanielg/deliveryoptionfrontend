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
    getModeConfig: (transportMode: string) => request(`/pricing/mode-config/${transportMode}`),
    updateModeConfig: (transportMode: string, body: Record<string, any>) => request(`/pricing/mode-config/${transportMode}`, { method: "PUT", body }),
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
    list: (params?: string) => request(`/payments${params ? `?${params}` : ""}`),
    create: (body: Record<string, any>) => request("/payments", { method: "POST", body }),
    get: (id: string) => request(`/payments/${id}`),
    stats: () => request("/payments/stats"),
  },
  invoices: {
    list: (params?: string) => request(`/invoices${params ? `?${params}` : ""}`),
    get: (id: string) => request(`/invoices/${id}`),
    create: (body: Record<string, any>) => request("/invoices", { method: "POST", body }),
    update: (id: string, body: Record<string, any>) => request(`/invoices/${id}`, { method: "PUT", body }),
    markPaid: (id: string) => request(`/invoices/${id}/mark-paid`, { method: "PATCH" }),
    cancel: (id: string) => request(`/invoices/${id}/cancel`, { method: "PATCH" }),
    stats: () => request("/invoices/stats"),
  },
  refunds: {
    list: (params?: string) => request(`/refunds${params ? `?${params}` : ""}`),
    get: (id: string) => request(`/refunds/${id}`),
    create: (body: Record<string, any>) => request("/refunds", { method: "POST", body }),
    updateStatus: (id: string, body: Record<string, any>) => request(`/refunds/${id}/status`, { method: "PATCH", body }),
    stats: () => request("/refunds/stats"),
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
    delete: (id: string) => request(`/customers/${id}`, { method: "DELETE" }),
    stats: (id: string) => request(`/customers/${id}/stats`),
  },
  corporateAccounts: {
    list: (params?: string) => request(`/corporate-accounts${params ? `?${params}` : ""}`),
    get: (id: string) => request(`/corporate-accounts/${id}`),
    create: (body: Record<string, any>) => request("/corporate-accounts", { method: "POST", body }),
    update: (id: string, body: Record<string, any>) => request(`/corporate-accounts/${id}`, { method: "PUT", body }),
    delete: (id: string) => request(`/corporate-accounts/${id}`, { method: "DELETE" }),
    toggle: (id: string) => request(`/corporate-accounts/${id}/toggle`, { method: "PATCH" }),
    stats: () => request("/corporate-accounts/stats"),
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
    getBusinessSettings: () => request("/settings/business"),
    updateBusinessSettings: (body: Record<string, any>) => request("/settings/business", { method: "PUT", body }),
  },
  stations: {
    list: (params?: string) => request(`/stations${params ? `?${params}` : ""}`),
    get: (id: string) => request(`/stations/${id}`),
    create: (body: Record<string, any>) => request("/stations", { method: "POST", body }),
    update: (id: string, body: Record<string, any>) => request(`/stations/${id}`, { method: "PUT", body }),
    delete: (id: string) => request(`/stations/${id}`, { method: "DELETE" }),
    toggle: (id: string) => request(`/stations/${id}/toggle`, { method: "PATCH" }),
    stats: () => request("/stations/stats"),
    inventory: (id: string, params?: string) => request(`/stations/${id}/inventory${params ? `?${params}` : ""}`),
    receive: (id: string, body: Record<string, any>) => request(`/stations/${id}/receive`, { method: "POST", body }),
    dispatch: (id: string, body: Record<string, any>) => request(`/stations/${id}/dispatch`, { method: "POST", body }),
  },
  notificationService: {
    logs: (params?: string) => request(`/notification-service/logs${params ? `?${params}` : ""}`),
    stats: () => request("/notification-service/stats"),
    bulk: (body: Record<string, any>) => request("/notification-service/bulk", { method: "POST", body }),
  },
  exceptions: {
    list: (params?: string) => request(`/exceptions${params ? `?${params}` : ""}`),
    get: (id: string) => request(`/exceptions/${id}`),
    create: (body: Record<string, any>) => request("/exceptions", { method: "POST", body }),
    createReturn: (body: Record<string, any>) => request("/exceptions/return", { method: "POST", body }),
    update: (id: string, body: Record<string, any>) => request(`/exceptions/${id}`, { method: "PATCH", body }),
    resolve: (id: string, body: Record<string, any>) => request(`/exceptions/${id}/resolve`, { method: "PATCH", body }),
    escalate: (id: string) => request(`/exceptions/${id}/escalate`, { method: "PATCH" }),
    stats: () => request("/exceptions/stats"),
  },
  capacity: {
    overview: () => request("/capacity/overview"),
    alerts: () => request("/capacity/alerts"),
    stations: () => request("/capacity/stations"),
    manifest: (id: string) => request(`/capacity/manifests/${id}`),
  },
  blog: {
    list: (params?: string) => request(`/blog${params ? `?${params}` : ""}`),
    listPublic: (params?: string) => request(`/blog/public${params ? `?${params}` : ""}`),
    get: (id: string) => request(`/blog/${id}`),
    getBySlug: (slug: string) => request(`/blog/public/${slug}`),
    create: (body: Record<string, any>) => request("/blog", { method: "POST", body }),
    update: (id: string, body: Record<string, any>) => request(`/blog/${id}`, { method: "PUT", body }),
    delete: (id: string) => request(`/blog/${id}`, { method: "DELETE" }),
    stats: () => request("/blog/stats"),
    uploadImages: (id: string, formData: FormData) =>
      request(`/blog/${id}/images`, { method: "POST", body: formData, headers: {} }),
    deleteImage: (id: string, imageId: string) =>
      request(`/blog/${id}/images/${imageId}`, { method: "DELETE" }),
    uploadAttachments: (id: string, formData: FormData) =>
      request(`/blog/${id}/attachments`, { method: "POST", body: formData, headers: {} }),
    deleteAttachment: (id: string, attachmentId: string) =>
      request(`/blog/${id}/attachments/${attachmentId}`, { method: "DELETE" }),
    categories: {
      list: () => request("/blog/categories"),
      create: (body: Record<string, any>) => request("/blog/categories", { method: "POST", body }),
      update: (id: string, body: Record<string, any>) => request(`/blog/categories/${id}`, { method: "PUT", body }),
      delete: (id: string) => request(`/blog/categories/${id}`, { method: "DELETE" }),
    },
  },
  sgr: {
    list: (params?: string) => request(`/sgr${params ? `?${params}` : ""}`),
    get: (id: string) => request(`/sgr/${id}`),
    stats: () => request("/sgr/stats"),
    controlTower: () => request("/sgr/control-tower"),
    legs: (id: string) => request(`/sgr/${id}/legs`),
    packages: (id: string) => request(`/sgr/${id}/packages`),
    createBooking: (body: Record<string, any>) => request("/sgr/booking", { method: "POST", body }),
    verifyWeigh: (id: string, body: Record<string, any>) => request(`/sgr/${id}/verify-weigh`, { method: "POST", body }),
    consolidate: (body: Record<string, any>) => request("/sgr/consolidate", { method: "POST", body }),
    loadOnTrain: (body: Record<string, any>) => request("/sgr/load-on-train", { method: "POST", body }),
    arriveAtDestination: (manifestId: string, body: Record<string, any>) => request(`/sgr/manifests/${manifestId}/arrive`, { method: "POST", body }),
    firstMile: (id: string) => request(`/sgr/${id}/first-mile`, { method: "POST" }),
    receiveCargo: (id: string, body: Record<string, any>) => request(`/sgr/${id}/receive-cargo`, { method: "POST", body }),
    startScreening: (id: string, body?: Record<string, any>) => request(`/sgr/${id}/screening/start`, { method: "POST", body }),
    completeScreening: (id: string, body?: Record<string, any>) => request(`/sgr/${id}/screening/complete`, { method: "POST", body }),
    assignTrain: (id: string, body: Record<string, any>) => request(`/sgr/${id}/assign-train`, { method: "POST", body }),
    loadCargo: (id: string, body: Record<string, any>) => request(`/sgr/${id}/load-cargo`, { method: "POST", body }),
    departTrain: (trainCapacityId: string) => request(`/sgr/trains/${trainCapacityId}/depart`, { method: "POST" }),
    arriveTrain: (trainCapacityId: string, body?: Record<string, any>) => request(`/sgr/trains/${trainCapacityId}/arrive`, { method: "POST", body }),
    lastMile: (id: string) => request(`/sgr/${id}/last-mile`, { method: "POST" }),
    collect: (id: string, body?: Record<string, any>) => request(`/sgr/${id}/collect`, { method: "POST", body }),
    raiseException: (id: string, body: Record<string, any>) => request(`/sgr/${id}/exception`, { method: "POST", body }),
    quote: (body: Record<string, any>) => request("/sgr/quote", { method: "POST", body }),
    pricing: (params?: string) => request(`/sgr/pricing${params ? `?${params}` : ""}`),
    addPricing: (body: Record<string, any>) => request("/sgr/pricing", { method: "POST", body }),
  },
  airCargo: {
    list: (params?: string) => request(`/air-cargo${params ? `?${params}` : ""}`),
    get: (id: string) => request(`/air-cargo/${id}`),
    stats: () => request("/air-cargo/stats"),
    createBooking: (body: Record<string, any>) => request("/air-cargo/booking", { method: "POST", body }),
    acceptCargo: (id: string, body: Record<string, any>) => request(`/air-cargo/${id}/accept`, { method: "POST", body }),
    createFlightDispatch: (body: Record<string, any>) => request("/air-cargo/flight-dispatch", { method: "POST", body }),
    arriveAtAirport: (manifestId: string, body: Record<string, any>) => request(`/air-cargo/manifests/${manifestId}/arrive`, { method: "POST", body }),
  },
  warehouse: {
    list: (params?: string) => request(`/warehouse${params ? `?${params}` : ""}`),
    stats: () => request("/warehouse/stats"),
    receive: (stationId: string, body: Record<string, any>) => request(`/warehouse/${stationId}/receive`, { method: "POST", body }),
    verifyWeigh: (body: Record<string, any>) => request("/warehouse/verify-weigh", { method: "POST", body }),
    generateLabel: (id: string) => request(`/warehouse/${id}/generate-label`, { method: "POST" }),
    assignShelfBin: (body: Record<string, any>) => request("/warehouse/assign-shelf-bin", { method: "POST", body }),
    consolidate: (body: Record<string, any>) => request("/warehouse/consolidate", { method: "POST", body }),
    release: (body: Record<string, any>) => request("/warehouse/release", { method: "POST", body }),
  },
  claims: {
    list: (params?: string) => request(`/claims${params ? `?${params}` : ""}`),
    get: (id: string) => request(`/claims/${id}`),
    create: (body: Record<string, any>) => request("/claims", { method: "POST", body }),
    updateStatus: (id: string, body: Record<string, any>) => request(`/claims/${id}/status`, { method: "PATCH", body }),
    assign: (id: string, body: Record<string, any>) => request(`/claims/${id}/assign`, { method: "PATCH", body }),
    stats: () => request("/claims/stats"),
  },
  tickets: {
    // Backend module is mounted at /support/tickets (shared with the mobile apps' existing
    // hardcoded calls) — not /tickets, which doesn't exist and 404s every call.
    list: (params?: string) => request(`/support/tickets${params ? `?${params}` : ""}`),
    get: (id: string) => request(`/support/tickets/${id}`),
    create: (body: Record<string, any>) => request("/support/tickets", { method: "POST", body }),
    updateStatus: (id: string, body: Record<string, any>) => request(`/support/tickets/${id}/status`, { method: "PATCH", body }),
    assign: (id: string, body: Record<string, any>) => request(`/support/tickets/${id}/assign`, { method: "PATCH", body }),
    addReply: (id: string, body: Record<string, any>) => request(`/support/tickets/${id}/replies`, { method: "POST", body }),
    stats: () => request("/support/tickets/stats"),
  },
  ratings: {
    list: (params?: string) => request(`/ratings${params ? `?${params}` : ""}`),
    get: (id: string) => request(`/ratings/${id}`),
    create: (body: Record<string, any>) => request("/ratings", { method: "POST", body }),
    update: (id: string, body: Record<string, any>) => request(`/ratings/${id}`, { method: "PUT", body }),
    delete: (id: string) => request(`/ratings/${id}`, { method: "DELETE" }),
    stats: () => request("/ratings/stats"),
  },
  booking: {
    cargoTypes: () => request("/booking/cargo-types"),
    recommend: (body: Record<string, any>) => request("/booking/recommend", { method: "POST", body }),
    create: (body: Record<string, any>) => request("/booking/create", { method: "POST", body }),
    bulk: (body: Record<string, any>) => request("/booking/bulk", { method: "POST", body }),
  },
  reports: {
    overview: (params?: string) => request(`/reports/overview${params ? `?${params}` : ""}`),
    byMode: (params?: string) => request(`/reports/by-mode${params ? `?${params}` : ""}`),
    revenue: (params?: string) => request(`/reports/revenue${params ? `?${params}` : ""}`),
    topRoutes: (params?: string) => request(`/reports/top-routes${params ? `?${params}` : ""}`),
    exceptions: (params?: string) => request(`/reports/exceptions${params ? `?${params}` : ""}`),
    warehouse: () => request("/reports/warehouse"),
    sgr: (params?: string) => request(`/reports/sgr${params ? `?${params}` : ""}`),
    airCargo: (params?: string) => request(`/reports/air-cargo${params ? `?${params}` : ""}`),
  },
  trainCapacity: {
    list: (params?: string) => request(`/train-capacity${params ? `?${params}` : ""}`),
    get: (id: string) => request(`/train-capacity/${id}`),
    create: (body: Record<string, any>) => request("/train-capacity", { method: "POST", body }),
    update: (id: string, body: Record<string, any>) => request(`/train-capacity/${id}`, { method: "PUT", body }),
    delete: (id: string) => request(`/train-capacity/${id}`, { method: "DELETE" }),
    toggle: (id: string) => request(`/train-capacity/${id}/toggle`, { method: "PATCH" }),
  },
  auditLogs: {
    list: (params?: string) => request(`/audit-logs${params ? `?${params}` : ""}`),
  },
  marketplaceIntegrations: {
    list: () => request("/marketplace-integrations"),
    get: (id: string) => request(`/marketplace-integrations/${id}`),
    create: (body: Record<string, any>) => request("/marketplace-integrations", { method: "POST", body }),
    update: (id: string, body: Record<string, any>) => request(`/marketplace-integrations/${id}`, { method: "PUT", body }),
    delete: (id: string) => request(`/marketplace-integrations/${id}`, { method: "DELETE" }),
    toggle: (id: string) => request(`/marketplace-integrations/${id}/toggle`, { method: "PATCH" }),
    test: (id: string) => request(`/marketplace-integrations/${id}/test`, { method: "POST" }),
  },
  dispatch: {
    overview: () => request("/dispatch/overview"),
    analytics: () => request("/dispatch/analytics"),
    getConfig: () => request("/dispatch/config"),
    updateConfig: (body: Record<string, any>) => request("/dispatch/config", { method: "PUT", body }),
    getEligibleDrivers: (id: string, params?: string) => request(`/dispatch/shipments/${id}/eligible-drivers${params ? `?${params}` : ""}`),
    openToDrivers: (id: string, body?: Record<string, any>) => request(`/dispatch/shipments/${id}/open-to-drivers`, { method: "POST", body }),
    autoAssign: (id: string) => request(`/dispatch/shipments/${id}/auto-assign`, { method: "POST" }),
    cancelOffers: (id: string) => request(`/dispatch/shipments/${id}/cancel-offers`, { method: "POST" }),
    reassign: (id: string, body: Record<string, any>) => request(`/dispatch/shipments/${id}/reassign`, { method: "PUT", body }),
    getAssignmentHistory: (id: string) => request(`/dispatch/shipments/${id}/assignments`),
  },
  trips: {
    overview: () => request("/trips/overview"),
    list: (params?: string) => request(`/trips${params ? `?${params}` : ""}`),
    get: (id: string) => request(`/trips/${id}`),
    complete: (id: string) => request(`/trips/${id}/complete`, { method: "POST" }),
    resolveException: (id: string, body: Record<string, any>) => request(`/trips/${id}/resolve-exception`, { method: "POST", body }),
  },
  transport: {
    listRequests: (params?: string) => request(`/transport/requests${params ? `?${params}` : ""}`),
    getOrCreateRequest: (shipmentId: string, dispatchMode?: string) => request(`/transport/requests/${shipmentId}${dispatchMode ? `?dispatchMode=${dispatchMode}` : ""}`),
    getCapacityMatches: (id: string) => request(`/transport/requests/${id}/capacity-matches`),
    listCapacity: (params?: string) => request(`/transport/capacity${params ? `?${params}` : ""}`),
    publishCapacity: (body: Record<string, any>) => request("/transport/capacity", { method: "POST", body }),
    updateCapacity: (id: string, body: Record<string, any>) => request(`/transport/capacity/${id}`, { method: "PATCH", body }),
    cancelCapacity: (id: string) => request(`/transport/capacity/${id}`, { method: "DELETE" }),
  },
  integrations: {
    dashboard: () => request("/integrations/partners/dashboard"),
    listPartners: () => request("/integrations/partners"),
    getPartner: (id: string) => request(`/integrations/partners/${id}`),
    createPartner: (body: Record<string, any>) => request("/integrations/partners", { method: "POST", body }),
    updatePartner: (id: string, body: Record<string, any>) => request(`/integrations/partners/${id}`, { method: "PUT", body }),
    setPartnerStatus: (id: string, status: string) => request(`/integrations/partners/${id}/status`, { method: "PATCH", body: { status } }),
    deletePartner: (id: string) => request(`/integrations/partners/${id}`, { method: "DELETE" }),
    testWebhook: (id: string) => request(`/integrations/partners/${id}/test-webhook`, { method: "POST" }),
    getLogs: (id: string, params?: string) => request(`/integrations/partners/${id}/logs${params ? `?${params}` : ""}`),
    getWebhookDeliveries: (id: string, params?: string) => request(`/integrations/partners/${id}/webhook-deliveries${params ? `?${params}` : ""}`),
    retryDelivery: (deliveryId: string) => request(`/integrations/webhook-deliveries/${deliveryId}/retry`, { method: "POST" }),
    listApiKeys: (id: string) => request(`/integrations/partners/${id}/api-keys`),
    createApiKey: (id: string, body: Record<string, any>) => request(`/integrations/partners/${id}/api-keys`, { method: "POST", body }),
    revokeApiKey: (keyId: string) => request(`/integrations/api-keys/${keyId}`, { method: "DELETE" }),
  },
  whatsapp: {
    dashboard: () => request("/whatsapp/dashboard"),
    // Connections
    listConnections: () => request("/whatsapp/connections"),
    createConnection: (body: Record<string, any>) => request("/whatsapp/connections", { method: "POST", body }),
    getConnection: (id: string) => request(`/whatsapp/connections/${id}`),
    getQRCode: (id: string) => request(`/whatsapp/connections/${id}/qr`),
    reconnect: (id: string) => request(`/whatsapp/connections/${id}/reconnect`, { method: "POST" }),
    disconnect: (id: string, destroy?: boolean) => request(`/whatsapp/connections/${id}/disconnect`, { method: "POST", body: { destroy } }),
    toggleConnection: (id: string, isActive: boolean) => request(`/whatsapp/connections/${id}/toggle`, { method: "PATCH", body: { isActive } }),
    // Messaging
    sendMessage: (body: Record<string, any>) => request("/whatsapp/send", { method: "POST", body }),
    sendTest: (body: Record<string, any>) => request("/whatsapp/send-test", { method: "POST", body }),
    listMessages: (params?: string) => request(`/whatsapp/messages${params ? `?${params}` : ""}`),
    getShipmentMessages: (id: string) => request(`/whatsapp/messages/shipment/${id}`),
    // OTP
    requestOTP: (body: Record<string, any>) => request("/whatsapp/otp/request", { method: "POST", body }),
    verifyOTP: (body: Record<string, any>) => request("/whatsapp/otp/verify", { method: "POST", body }),
    // Templates
    listTemplates: (params?: string) => request(`/whatsapp/templates${params ? `?${params}` : ""}`),
    createTemplate: (body: Record<string, any>) => request("/whatsapp/templates", { method: "POST", body }),
    updateTemplate: (id: string, body: Record<string, any>) => request(`/whatsapp/templates/${id}`, { method: "PATCH", body }),
    // Campaigns
    listCampaigns: (params?: string) => request(`/whatsapp/campaigns${params ? `?${params}` : ""}`),
    createCampaign: (body: Record<string, any>) => request("/whatsapp/campaigns", { method: "POST", body }),
    startCampaign: (id: string) => request(`/whatsapp/campaigns/${id}/start`, { method: "POST" }),
    pauseCampaign: (id: string) => request(`/whatsapp/campaigns/${id}/pause`, { method: "POST" }),
    resumeCampaign: (id: string) => request(`/whatsapp/campaigns/${id}/resume`, { method: "POST" }),
    cancelCampaign: (id: string) => request(`/whatsapp/campaigns/${id}/cancel`, { method: "POST" }),
    getCampaignAnalytics: (id: string) => request(`/whatsapp/campaigns/${id}/analytics`),
  },
}
