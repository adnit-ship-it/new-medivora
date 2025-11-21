import type { Product } from "~/types/intake-form/checkout";

// --- PRODUCT DATA ---
// This is the master list of all available products.
export const products: Product[] = [
  {
    id: "mounjaro-injection",
    name: "Mounjaro Injection",
    category: "weight-loss",
    description:
      "Weekly GLP-1 injection for weight loss and diabetes management",
    img: "/assets/images/products/mounjaro-injection.png",
    thumbnail: "/assets/images/products/mounjaro-injection.png",
    prices: {
      monthly: 399,
      threeMonthly: 349,
      sixMonthly: 349,
    },
    productBundleIds: {
      monthly: "bundle-mounjaro-monthly",
      threeMonthly: "bundle-mounjaro-quarterly",
      sixMonthly: "bundle-mounjaro-semiannual",
    },
    quizId: "glp1-weight-loss",
    popular: true,
    availability: "in_stock",
    type: "injection",
    features: [
      "Weekly subcutaneous injection",
      "GLP-1 receptor agonist",
      "Effective for weight loss",
      "Diabetes management",
      "Prescription required",
    ],
  },
  {
    id: "ozempic-injection",
    name: "Ozempic Injection",
    category: "weight-loss",
    description:
      "Weekly GLP-1 injection for weight loss and blood sugar control",
    img: "/assets/images/products/ozempic-injection.png",
    thumbnail: "/assets/images/products/ozempic-injection.png",
    prices: {
      monthly: 399,
      threeMonthly: 349,
      sixMonthly: 349,
    },
    productBundleIds: {
      monthly: "bundle-ozempic-monthly",
      threeMonthly: "bundle-ozempic-quarterly",
      sixMonthly: "bundle-ozempic-semiannual",
    },
    quizId: "glp1-weight-loss",
    availability: "in_stock",
    type: "injection",
    features: [
      "Weekly subcutaneous injection",
      "GLP-1 receptor agonist",
      "Weight loss support",
      "Blood sugar control",
      "Prescription required",
    ],
  },
  {
    id: "methylcobalamin-injection",
    name: "Methylcobalamin Injection",
    category: "energy",
    description: "Vitamin B12 injection for energy and neurological health",
    img: "/assets/images/products/methylcobalamin-injection.png",
    thumbnail: "/assets/images/products/methylcobalamin-injection.png",
    prices: {
      monthly: 399,
      threeMonthly: 349,
      sixMonthly: 349,
    },
    productBundleIds: {
      monthly: "bundle-methylcobalamin-monthly",
      threeMonthly: "bundle-methylcobalamin-quarterly",
      sixMonthly: "bundle-methylcobalamin-semiannual",
    },
    quizId: "vitamin-b12",
    availability: "in_stock",
    type: "injection",
    features: [
      "Vitamin B12 supplement",
      "Energy boost",
      "Neurological support",
      "Methylated form for better absorption",
      "Prescription required",
    ],
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getPopularProducts(): Product[] {
  return products.filter((product) => product.popular);
}

// --- CATEGORY LABELS ---
// Mapping of category keys to display names
export const categoryLabels: Record<string, string> = {
  "weight-loss": "Weight Loss",
  "energy": "Energy",
  "sexual-health": "Sexual Health",
  "wellness": "Wellness",
  "hair": "Hair",
  "skin": "Skin",
  // Add more categories as needed
};

// --- UTILITY FUNCTION ---
/**
 * Gets all unique categories that have at least one product in the static products array
 * @returns Array of category strings that exist in the products array
 */
export function getAvailableCategories(): string[] {
  const categories = new Set<string>();
  products.forEach((product) => {
    if (product.category) {
      categories.add(product.category);
    }
  });
  return Array.from(categories);
}

/**
 * Gets all unique categories from both static products and CRM products
 * @param crmProducts Optional array of CRM product bundles
 * @returns Array of category strings that exist in either source
 */
export function getAllAvailableCategories(crmProducts?: any[]): string[] {
  const categories = new Set<string>();
  
  // Add categories from static products
  products.forEach((product) => {
    if (product.category) {
      categories.add(product.category);
    }
  });
  
  // Add categories from CRM products if provided
  if (crmProducts && Array.isArray(crmProducts)) {
    crmProducts.forEach((bundle) => {
      // Check if CRM bundle has category field directly
      if (bundle.category) {
        categories.add(bundle.category);
      }
      // Extract categories from nested products array (CRM structure)
      else if (bundle.products && Array.isArray(bundle.products)) {
        bundle.products.forEach((product: any) => {
          if (product.categories && Array.isArray(product.categories)) {
            product.categories.forEach((cat: any) => {
              // Use category name or id, normalize to lowercase with hyphens
              const categoryKey = cat.name 
                ? cat.name.toLowerCase().replace(/\s+/g, '-')
                : cat.id;
              if (categoryKey) {
                categories.add(categoryKey);
              }
            });
          }
        });
      }
      // Try to match CRM product name to static product categories as fallback
      else if (bundle.name) {
        const staticMatch = products.find((p) => 
          p.name.toLowerCase() === bundle.name.toLowerCase() ||
          bundle.name.toLowerCase().includes(p.name.toLowerCase()) ||
          p.name.toLowerCase().includes(bundle.name.toLowerCase())
        );
        if (staticMatch?.category) {
          categories.add(staticMatch.category);
        }
      }
    });
  }
  
  return Array.from(categories);
}
