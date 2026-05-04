import { create } from "zustand"

export interface DashboardData {
  businessName: string
  planName: string
  planPrice: number
  planSlug: string
  siteSlug: string
  siteId: string
  isBlocked: boolean
  periodStart: string | null
  periodEnd: string | null
}

interface DashboardStore {
  data: DashboardData
  setData: (data: DashboardData) => void
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  data: {
    businessName: "",
    planName: "Trial",
    planPrice: 0,
    planSlug: "trial",
    siteSlug: "",
    siteId: "",
    isBlocked: false,
    periodStart: null,
    periodEnd: null,
  },
  setData: (data) => set({ data }),
}))
