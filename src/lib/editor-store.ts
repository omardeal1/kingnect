import { create } from "zustand"

// ─── Types matching Prisma models ────────────────────────────────────────────────

export interface SiteData {
  id: string
  clientId: string
  slug: string
  businessName: string
  tagline: string | null
  description: string | null
  logoUrl: string | null
  faviconUrl: string | null
  backgroundType: string
  backgroundColor: string
  backgroundGradient: string | null
  backgroundImageUrl: string | null
  cardColor: string
  textColor: string
  accentColor: string
  themeMode: string
  isActive: boolean
  isPublished: boolean
  showKingBrand: boolean
  buttonStyle: string
  menuTemplate: string
  siteTemplate: string
  metaTitle: string | null
  metaDescription: string | null
  socialLinks: SocialLinkData[]
  contactButtons: ContactButtonData[]
  locations: LocationData[]
  slides: SlideData[]
  menuCategories: MenuCategoryData[]
  galleryImages: GalleryImageData[]
  services: ServiceData[]
  testimonials: TestimonialData[]
  customLinks: CustomLinkData[]
  branches: BranchData[]
  reservationConfig: ReservationConfigData | null
  loyaltyConfig: LoyaltyConfigData | null
  registrationFields: RegistrationFieldConfigData[]
  employees: EmployeeData[]
  menuFeaturedSlides: MenuFeaturedSlideData[]
  modifierGroups: ModifierGroupData[]
}

export interface SocialLinkData {
  id: string
  type: string
  label: string | null
  url: string
  enabled: boolean
  sortOrder: number
}

export interface ContactButtonData {
  id: string
  type: string
  label: string | null
  value: string
  enabled: boolean
  sortOrder: number
}

export interface LocationData {
  id: string
  name: string
  address: string | null
  mapsUrl: string | null
  hours: string | null
  enabled: boolean
  sortOrder: number
}

export interface SlideData {
  id: string
  imageUrl: string | null
  title: string | null
  subtitle: string | null
  buttonLabel: string | null
  buttonUrl: string | null
  enabled: boolean
  sortOrder: number
}

export interface MenuCategoryData {
  id: string
  miniSiteId?: string
  name: string
  enabled: boolean
  sortOrder: number
  menuItems: MenuItemData[]
}

export interface MenuItemData {
  id: string
  miniSiteId?: string
  categoryId: string
  name: string
  description: string | null
  price: number | null
  imageUrl: string | null
  isOrderable: boolean
  enabled: boolean
  sortOrder: number
  badge: string | null
  specialInstructionsEnabled: boolean
}

export interface GalleryImageData {
  id: string
  imageUrl: string
  caption: string | null
  enabled: boolean
  sortOrder: number
}

export interface ServiceData {
  id: string
  name: string
  description: string | null
  price: string | null
  imageUrl: string | null
  buttonLabel: string | null
  buttonUrl: string | null
  enabled: boolean
  sortOrder: number
}

export interface TestimonialData {
  id: string
  name: string
  photoUrl: string | null
  rating: number
  content: string
  enabled: boolean
  sortOrder: number
}

export interface CustomLinkData {
  id: string
  label: string
  url: string
  enabled: boolean
  sortOrder: number
}

export interface MenuFeaturedSlideData {
  id: string
  imageUrl: string
  title: string | null
  enabled: boolean
  sortOrder: number
}

export interface ModifierOptionData {
  id: string
  groupId: string
  name: string
  extraCost: number
  hasExtraCost: boolean
  isActive: boolean
  sortOrder: number
}

export interface ModifierGroupData {
  id: string
  siteId: string
  productId: string | null
  name: string
  selectionType: string
  isRequired: boolean
  isActive: boolean
  sortOrder: number
  isTemplate: boolean
  options: ModifierOptionData[]
}

export interface BranchData {
  id: string
  siteId: string
  slug: string
  name: string
  description: string | null
  logoUrl: string | null
  coverUrl: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  website: string | null
  state: string | null
  city: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  mapsUrl: string | null
  isActive: boolean
  isPublished: boolean
  showQairossBrand: boolean
  hours: string
  socialLinks: string
  themeOverrides: string
  buttonStyle: string
  modifiersEnabled: boolean
  metaTitle: string | null
  metaDescription: string | null
  createdAt: string
  updatedAt: string
}

export interface ReservationConfigData {
  id: string
  siteId: string
  isEnabled: boolean
  reservationType: string
  customTypeLabel: string | null
  slotDurationMinutes: number
  maxCapacityPerSlot: number
  minAdvanceHours: number
  maxAdvanceDays: number
  autoApprove: boolean
  confirmationMessage: string
  googleCalendarConnected: boolean
  googleCalendarId: string | null
  availableDays: number[]
  timeSlots: { start: string; end: string }[]
}

export interface LoyaltyConfigData {
  id: string
  siteId: string
  isEnabled: boolean
  accumulationType: string // visits | amount | both
  targetValue: number
  rewardType: string // discount | free_product | custom
  rewardValue: number
  rewardLabel: string
  welcomeGiftEnabled: boolean
  welcomeGiftDescription: string | null
}

export interface RegistrationFieldConfigData {
  id: string
  siteId: string
  fieldName: string
  isEnabled: boolean
  label: string | null
  message: string | null
  sortOrder: number
}

export interface EmployeeData {
  id: string
  userId: string | null
  roleId: string
  email: string
  name: string
  phone: string | null
  isActive: boolean
  invitedAt: string
  invitedBy: string | null
  accessExpiresAt: string | null
  lastLoginAt: string | null
  role?: { id: string; name: string; description: string | null }
}

// ─── Editor Tab Type ─────────────────────────────────────────────────────────────

export type EditorTab =
  | "template"
  | "info"
  | "appearance"
  | "social"
  | "contact"
  | "buttons"
  | "location"
  | "slides"
  | "menu"
  | "gallery"
  | "services"
  | "testimonials"
  | "links"
  | "seo"
  | "modifiers"
  | "branches"
  | "reservations"
  | "loyalty"
  | "registration"
  | "employees"

// ─── Editor Store ────────────────────────────────────────────────────────────────

interface EditorState {
  site: SiteData | null
  isLoading: boolean
  isSaving: boolean
  activeTab: EditorTab
  hasUnsavedChanges: boolean
  showMobilePreview: boolean

  setSite: (site: SiteData) => void
  setActiveTab: (tab: EditorTab) => void
  setHasUnsavedChanges: (v: boolean) => void
  setShowMobilePreview: (v: boolean) => void
  setIsLoading: (v: boolean) => void
  setIsSaving: (v: boolean) => void

  // Site field updates
  updateSite: (fields: Partial<SiteData>) => void

  // Social links
  addSocialLink: (link: SocialLinkData) => void
  updateSocialLink: (id: string, fields: Partial<SocialLinkData>) => void
  removeSocialLink: (id: string) => void
  reorderSocialLinks: (ids: string[]) => void

  // Contact buttons
  addContactButton: (btn: ContactButtonData) => void
  updateContactButton: (id: string, fields: Partial<ContactButtonData>) => void
  removeContactButton: (id: string) => void
  reorderContactButtons: (ids: string[]) => void

  // Locations
  addLocation: (loc: LocationData) => void
  updateLocation: (id: string, fields: Partial<LocationData>) => void
  removeLocation: (id: string) => void

  // Slides
  addSlide: (slide: SlideData) => void
  updateSlide: (id: string, fields: Partial<SlideData>) => void
  removeSlide: (id: string) => void

  // Menu categories
  addMenuCategory: (cat: MenuCategoryData) => void
  updateMenuCategory: (id: string, fields: Partial<MenuCategoryData>) => void
  removeMenuCategory: (id: string) => void
  addMenuItem: (catId: string, item: MenuItemData) => void
  updateMenuItem: (id: string, fields: Partial<MenuItemData>) => void
  removeMenuItem: (id: string) => void

  // Gallery images
  addGalleryImage: (img: GalleryImageData) => void
  updateGalleryImage: (id: string, fields: Partial<GalleryImageData>) => void
  removeGalleryImage: (id: string) => void

  // Services
  addService: (svc: ServiceData) => void
  updateService: (id: string, fields: Partial<ServiceData>) => void
  removeService: (id: string) => void

  // Testimonials
  addTestimonial: (t: TestimonialData) => void
  updateTestimonial: (id: string, fields: Partial<TestimonialData>) => void
  removeTestimonial: (id: string) => void

  // Custom links
  addCustomLink: (link: CustomLinkData) => void
  updateCustomLink: (id: string, fields: Partial<CustomLinkData>) => void
  removeCustomLink: (id: string) => void

  // Branches
  addBranch: (branch: BranchData) => void
  updateBranch: (id: string, fields: Partial<BranchData>) => void
  removeBranch: (id: string) => void

  // Reservation config
  setReservationConfig: (config: ReservationConfigData | null) => void
  updateReservationConfig: (fields: Partial<ReservationConfigData>) => void

  // Loyalty config
  setLoyaltyConfig: (config: LoyaltyConfigData | null) => void
  updateLoyaltyConfig: (fields: Partial<LoyaltyConfigData>) => void

  // Employees
  addEmployee: (employee: EmployeeData) => void
  updateEmployee: (id: string, fields: Partial<EmployeeData>) => void
  removeEmployee: (id: string) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  site: null,
  isLoading: true,
  isSaving: false,
  activeTab: "info",
  hasUnsavedChanges: false,
  showMobilePreview: false,

  setSite: (site) => set({ site, isLoading: false }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setHasUnsavedChanges: (v) => set({ hasUnsavedChanges: v }),
  setShowMobilePreview: (v) => set({ showMobilePreview: v }),
  setIsLoading: (v) => set({ isLoading: v }),
  setIsSaving: (v) => set({ isSaving: v }),

  updateSite: (fields) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site ? { ...state.site, ...fields } : null,
    })),

  addSocialLink: (link) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? { ...state.site, socialLinks: [...state.site.socialLinks, link] }
        : null,
    })),
  updateSocialLink: (id, fields) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            socialLinks: state.site.socialLinks.map((l) =>
              l.id === id ? { ...l, ...fields } : l
            ),
          }
        : null,
    })),
  removeSocialLink: (id) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            socialLinks: state.site.socialLinks.filter((l) => l.id !== id),
          }
        : null,
    })),
  reorderSocialLinks: (ids) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            socialLinks: ids
              .map((id, i) => {
                const link = state.site!.socialLinks.find((l) => l.id === id)
                return link ? { ...link, sortOrder: i } : null
              })
              .filter(Boolean) as SocialLinkData[],
          }
        : null,
    })),

  addContactButton: (btn) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            contactButtons: [...state.site.contactButtons, btn],
          }
        : null,
    })),
  updateContactButton: (id, fields) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            contactButtons: state.site.contactButtons.map((b) =>
              b.id === id ? { ...b, ...fields } : b
            ),
          }
        : null,
    })),
  removeContactButton: (id) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            contactButtons: state.site.contactButtons.filter(
              (b) => b.id !== id
            ),
          }
        : null,
    })),
  reorderContactButtons: (ids) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            contactButtons: ids
              .map((id, i) => {
                const btn = state.site!.contactButtons.find((b) => b.id === id)
                return btn ? { ...btn, sortOrder: i } : null
              })
              .filter(Boolean) as ContactButtonData[],
          }
        : null,
    })),

  addLocation: (loc) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? { ...state.site, locations: [...state.site.locations, loc] }
        : null,
    })),
  updateLocation: (id, fields) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            locations: state.site.locations.map((l) =>
              l.id === id ? { ...l, ...fields } : l
            ),
          }
        : null,
    })),
  removeLocation: (id) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            locations: state.site.locations.filter((l) => l.id !== id),
          }
        : null,
    })),

  addSlide: (slide) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? { ...state.site, slides: [...state.site.slides, slide] }
        : null,
    })),
  updateSlide: (id, fields) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            slides: state.site.slides.map((s) =>
              s.id === id ? { ...s, ...fields } : s
            ),
          }
        : null,
    })),
  removeSlide: (id) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? { ...state.site, slides: state.site.slides.filter((s) => s.id !== id) }
        : null,
    })),

  addMenuCategory: (cat) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            menuCategories: [...state.site.menuCategories, cat],
          }
        : null,
    })),
  updateMenuCategory: (id, fields) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            menuCategories: state.site.menuCategories.map((c) =>
              c.id === id ? { ...c, ...fields } : c
            ),
          }
        : null,
    })),
  removeMenuCategory: (id) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            menuCategories: state.site.menuCategories.filter(
              (c) => c.id !== id
            ),
          }
        : null,
    })),
  addMenuItem: (catId, item) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            menuCategories: state.site.menuCategories.map((c) =>
              c.id === catId
                ? { ...c, menuItems: [...c.menuItems, item] }
                : c
            ),
          }
        : null,
    })),
  updateMenuItem: (id, fields) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            menuCategories: state.site.menuCategories.map((c) => ({
              ...c,
              menuItems: c.menuItems.map((i) =>
                i.id === id ? { ...i, ...fields } : i
              ),
            })),
          }
        : null,
    })),
  removeMenuItem: (id) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            menuCategories: state.site.menuCategories.map((c) => ({
              ...c,
              menuItems: c.menuItems.filter((i) => i.id !== id),
            })),
          }
        : null,
    })),

  addGalleryImage: (img) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            galleryImages: [...state.site.galleryImages, img],
          }
        : null,
    })),
  updateGalleryImage: (id, fields) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            galleryImages: state.site.galleryImages.map((i) =>
              i.id === id ? { ...i, ...fields } : i
            ),
          }
        : null,
    })),
  removeGalleryImage: (id) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            galleryImages: state.site.galleryImages.filter(
              (i) => i.id !== id
            ),
          }
        : null,
    })),

  addService: (svc) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? { ...state.site, services: [...state.site.services, svc] }
        : null,
    })),
  updateService: (id, fields) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            services: state.site.services.map((s) =>
              s.id === id ? { ...s, ...fields } : s
            ),
          }
        : null,
    })),
  removeService: (id) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            services: state.site.services.filter((s) => s.id !== id),
          }
        : null,
    })),

  addTestimonial: (t) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            testimonials: [...state.site.testimonials, t],
          }
        : null,
    })),
  updateTestimonial: (id, fields) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            testimonials: state.site.testimonials.map((t) =>
              t.id === id ? { ...t, ...fields } : t
            ),
          }
        : null,
    })),
  removeTestimonial: (id) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            testimonials: state.site.testimonials.filter(
              (t) => t.id !== id
            ),
          }
        : null,
    })),

  addCustomLink: (link) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            customLinks: [...state.site.customLinks, link],
          }
        : null,
    })),
  updateCustomLink: (id, fields) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            customLinks: state.site.customLinks.map((l) =>
              l.id === id ? { ...l, ...fields } : l
            ),
          }
        : null,
    })),
  removeCustomLink: (id) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            customLinks: state.site.customLinks.filter((l) => l.id !== id),
          }
        : null,
    })),

  addBranch: (branch) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? { ...state.site, branches: [...state.site.branches, branch] }
        : null,
    })),
  updateBranch: (id, fields) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            branches: state.site.branches.map((b) =>
              b.id === id ? { ...b, ...fields } : b
            ),
          }
        : null,
    })),
  removeBranch: (id) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            branches: state.site.branches.filter((b) => b.id !== id),
          }
        : null,
    })),

  setReservationConfig: (config) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site ? { ...state.site, reservationConfig: config } : null,
    })),
  updateReservationConfig: (fields) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            reservationConfig: state.site.reservationConfig
              ? { ...state.site.reservationConfig, ...fields }
              : null,
          }
        : null,
    })),

  setLoyaltyConfig: (config) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site ? { ...state.site, loyaltyConfig: config } : null,
    })),
  updateLoyaltyConfig: (fields) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            loyaltyConfig: state.site.loyaltyConfig
              ? { ...state.site.loyaltyConfig, ...fields }
              : null,
          }
        : null,
    })),

  addEmployee: (employee) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? { ...state.site, employees: [...state.site.employees, employee] }
        : null,
    })),
  updateEmployee: (id, fields) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            employees: state.site.employees.map((e) =>
              e.id === id ? { ...e, ...fields } : e
            ),
          }
        : null,
    })),
  removeEmployee: (id) =>
    set((state) => ({
      hasUnsavedChanges: true,
      site: state.site
        ? {
            ...state.site,
            employees: state.site.employees.filter((e) => e.id !== id),
          }
        : null,
    })),
}))
