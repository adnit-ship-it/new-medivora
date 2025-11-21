import { defineStore } from 'pinia'
import { ref } from 'vue'

interface MediaAsset {
  src: string
  alt: string
  color?: string
  heights?: {
    mobile?: string
    tablet?: string
    desktop?: string
  }
}

interface ToggleableSection {
  show?: boolean
}

interface BulletPoint {
  text: string
  iconType: string
  iconColor: string
}

interface HomeHeroSection extends ToggleableSection {
  heading: string
  subheading: string
  bulletPoints: BulletPoint[]
  ctaButton: string
  media: {
    background: MediaAsset
    foreground: MediaAsset
    logo: MediaAsset
  }
}

interface HomeTrustedBySection extends ToggleableSection {
  title: string
  marquee: {
    speed: number
  }
  logos: MediaAsset[]
}

interface HomeDiscoverSection extends ToggleableSection {
  title: string
  subtitle: string
  shippingInfo: string
  providerText: string
  buyNowButton: string
  fallbackProducts: Array<{
    id: string
    productName: string
    price: string
    isBestSeller: boolean
    image: MediaAsset
  }>
}

interface HomeReviewsSection extends ToggleableSection {
  title: string
  marquee: {
    speed: number
  }
  media: {
    avatar: MediaAsset
    star: MediaAsset
  }
  list: Array<{
    name: string
    stars: number
    review: string
  }>
}

interface HomeStatisticsSection extends ToggleableSection {
  title: string
  cards: Array<{
    value: string
    description: string
  }>
  media: {
    graph: MediaAsset
  }
}

interface HomeJourneySection extends ToggleableSection {
  title: string
  steps: Array<{
    title: string
    subtext: string[]
    icon: MediaAsset & {
      type?: string
    }
  }>
  ctaButton: string
  media: {
    progressLine: MediaAsset
  }
}

interface CTAFeature {
  text: string
  iconType: string
  iconColor: string
}

interface HomeCTASection extends ToggleableSection {
  title: string
  subtitle: string
  stats: {
    patients: string
    worldwideCare: string
  }
  features: CTAFeature[]
  media: {
    product: MediaAsset
  }
}

interface HomeBeforeAfterSection extends ToggleableSection {
  title: string
  images: MediaAsset[]
}

interface HomeIntakeFormSection extends ToggleableSection {
  title: string
  highlight: string
  fields: Array<{
    label: string
    placeholder: string
  }>
}

interface HomeFAQSection extends ToggleableSection {
  title: string
  questions: Array<{
    question: string
    answer: string
  }>
}

interface AboutBannerSection extends ToggleableSection {
  title: string
  subtitle: string
  description: string
  media: {
    image: MediaAsset
  }
}

interface AboutPrioritySection extends ToggleableSection {
  title: string
  features: {
    noHiddenFees: string
    expeditedDelivery: string
    doctorLedPlans: string
    moneyBackGuarantee: string
  }
  support: {
    title: string
    description: string
  }
  providers: {
    title: string
    description: string
    certification: string
  }
  media: {
    featureIcon: MediaAsset
    certificationIcon: MediaAsset
  }
}

interface ProductsPageSection extends ToggleableSection {
  title: string
  subtitle: string
  categoryButton: string
}

interface ProductsSectionSection extends ToggleableSection {
  title: string
}

interface ContactSection extends ToggleableSection {
  title: string
  form: {
    labels: {
      name: string
      age: string
      email: string
      message: string
    }
    placeholders: {
      name: string
      age: string
      email: string
      message: string
    }
    submitButton: string
    successMessage: string
    errorMessage: string
  }
}

interface LayoutHeights {
  navbar: {
    height: {
      mobile: string
      desktop: string
    }
    logo: {
      height: {
        mobile: string
        tablet: string
        desktop: string
      }
    }
  }
  footer: {
    height: {
      mobile: string
      desktop: string
    }
    logo: {
      height: {
        mobile: string
        desktop: string
      }
    }
  }
}

interface CommonContent {
  pageTitle: string
  buttons: {
    next: string
    submitToProvider: string
    back: string
    getStarted: string
  }
  navigation: {
    home: string
    about: string
    products: string
    contact: string
    contactUs: string
    product: string
  }
  accessibility: {
    toggleMenu: string
    brandLogo: string
    menu: string
  }
  media: {
    hamburgerMenu: MediaAsset
  }
  status: {
    loading: string
  }
  layout?: LayoutHeights
}

export interface SiteTextData {
  iconRegistry?: Record<string, string>
  home: {
    hero: HomeHeroSection
    trustedBy: HomeTrustedBySection
    discover: HomeDiscoverSection
    reviews: HomeReviewsSection
    statistics: HomeStatisticsSection
    journey: HomeJourneySection
    cta: HomeCTASection
    beforeAfter: HomeBeforeAfterSection
    intakeForm: HomeIntakeFormSection
    faq: HomeFAQSection
  }
  about: {
    banner: AboutBannerSection
    priority: AboutPrioritySection
  }
  products: {
    page: ProductsPageSection
    section: ProductsSectionSection
  }
  contact: ContactSection
  common: CommonContent
}

export const useSiteTextStore = defineStore('siteText', () => {
  const siteText = ref<SiteTextData | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadSiteText = async () => {
    if (siteText.value) {
      return // Already loaded
    }

    isLoading.value = true
    error.value = null

    try {
      // Import the JSON file directly for better SSR compatibility
      const data = await import('~/data/websiteText.json')
      siteText.value = data.default
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load site text'
    } finally {
      isLoading.value = false
    }
  }

  const loadSiteTextFromAPI = async (apiSiteText: any) => {
    isLoading.value = true
    error.value = null

    try {
      siteText.value = apiSiteText
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load site text from API'
      console.error('Error loading site text from API:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Helper methods to get specific text sections
  const getHomeText = () => siteText.value?.home || null
  const getAboutText = () => siteText.value?.about || null
  const getProductsText = () => siteText.value?.products || null
  const getContactText = () => siteText.value?.contact || null
  const getCommonText = () => siteText.value?.common || null
  const getIconRegistry = () => siteText.value?.iconRegistry || {}
  const getPageTitle = () => siteText.value?.common?.pageTitle || "Medivora"


  // Method to set site text directly (for SSR)
  const setSiteText = (data: SiteTextData) => {
    siteText.value = data
  }

  return {
    siteText,
    isLoading,
    error,
    loadSiteText,
    loadSiteTextFromAPI,
    setSiteText,
    getHomeText,
    getAboutText,
    getProductsText,
    getContactText,
    getCommonText,
    getIconRegistry,
    getPageTitle
  }
})