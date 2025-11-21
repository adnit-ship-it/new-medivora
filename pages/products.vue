<template>
  <UiSectionWrapper v-if="shouldShowProductsPage" class="py-24 md:py-32 flex-col">
    <UiSectionContainer class="mb-20">
      <img v-motion :initial="{ opacity: 0, y: 100 }" :visible-once="{
        opacity: 1,
        y: 0,
        transition: {
          duration: 400,
          type: 'ease-in',
          stiffness: 250,
          damping: 25,
          mass: 1,
        },
      }" 
        :src="logoUrl || '/assets/images/brand/logo.svg'" 
        :alt="`${organizationName || 'Brand'} Logo`" 
        class="w-auto h-[32px] md:h-[64px] object-cover" />
      <h1 v-motion :initial="{ opacity: 0, y: 100 }" :visible-once="{
        opacity: 1,
        y: 0,
        transition: {
          duration: 400,
          type: 'ease-in',
          stiffness: 250,
          damping: 25,
          mass: 1,
          delay: 25,
        },
      }" class="text-[32px] md:text-[48px] font-semibold font-defaultSerif mt-2 md:mt-4 lg:mt-8">
        {{ productsPage?.title || 'Explore Our Products' }}
      </h1>
      <p v-motion :initial="{ opacity: 0, y: 100 }" :visible-once="{
        opacity: 1,
        y: 0,
        transition: {
          duration: 400,
          type: 'ease-in',
          stiffness: 250,
          damping: 25,
          mass: 1,
          delay: 50,
        },
      }" class="text-[16px] md:text-[23px] font-extralight mt-2">
        {{ productsPage?.subtitle || 'Personalized GLP-1 Medication' }}
      </p>
      <div class="h-4 md:h-8"></div>
      <div class="flex gap-4 flex-wrap">
        <!-- Always show "All" button -->
        <UiButton 
          @click="selectedCategory = 'all'"
          :ghost="selectedCategory !== 'all'"
          v-motion :initial="{ opacity: 0, y: 100 }" :visible-once="{
            opacity: 1,
            y: 0,
            transition: {
              duration: 400,
              type: 'ease-in',
              stiffness: 250,
              damping: 25,
              mass: 1,
              delay: 75,
            },
          }" 
          :width="buttonWidth" 
          :height="buttonHeight" 
          :font-size="buttonFontSize">
          All
        </UiButton>
        
        <!-- Dynamically render category buttons only for categories that have products -->
        <UiButton 
          v-for="(category, index) in availableCategories"
          :key="category"
          @click="selectedCategory = category"
          :ghost="selectedCategory !== category"
          v-motion :initial="{ opacity: 0, y: 100 }" :visible-once="{
            opacity: 1,
            y: 0,
            transition: {
              duration: 400,
              type: 'ease-in',
              stiffness: 250,
              damping: 25,
              mass: 1,
              delay: 75 + (index * 25),
            },
          }" 
          :width="buttonWidth" 
          :height="buttonHeight" 
          :font-size="buttonFontSize">
          {{ categoryLabels[category] || category }}
        </UiButton>
      </div>
    </UiSectionContainer>
    <SectionsDiscover :filtered-products="filteredProducts" />
  </UiSectionWrapper>

</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useSiteTextStore } from "~/stores/siteText";
import { useBrandLogos } from "~/utils/branding";
import { useCRMStore } from "~/stores/crmStore";
import { getAllAvailableCategories, categoryLabels, products as staticProducts } from "~/data/intake-form/products";

const siteTextStore = useSiteTextStore();
const crmStore = useCRMStore();
const { logoUrl, organizationName } = useBrandLogos();

// Destructure site text sections
const products = computed(() => siteTextStore.getProductsText());
const productsPage = computed(() => products.value?.page);
const shouldShowProductsPage = computed(() => (productsPage.value?.show ?? true));

// Category filter state - defaults to 'all'
const selectedCategory = ref('all');

// Get available categories (only categories that have products)
// Merge categories from both static products and CRM products
const availableCategories = computed(() => {
  const crmProducts = crmStore.getProductBundles;
  return getAllAvailableCategories(crmProducts);
});

// Helper function to get category from a product (supports both static and CRM products)
const getProductCategory = (product) => {
  // Check if it has a direct category field
  if (product.category) {
    return product.category;
  }
  
  // Check nested CRM structure
  if (product.products && Array.isArray(product.products)) {
    for (const prod of product.products) {
      if (prod.categories && Array.isArray(prod.categories)) {
        const category = prod.categories[0];
        if (category?.name) {
          return category.name.toLowerCase().replace(/\s+/g, '-');
        }
        if (category?.id) {
          return category.id;
        }
      }
    }
  }
  
  // Try to match CRM product name to static product
  if (product.name || product.productName) {
    const searchName = (product.name || product.productName).toLowerCase();
    const staticMatch = staticProducts.find((p) => 
      p.name.toLowerCase() === searchName ||
      searchName.includes(p.name.toLowerCase()) ||
      p.name.toLowerCase().includes(searchName)
    );
    if (staticMatch?.category) {
      return staticMatch.category;
    }
  }
  
  return null;
};

// Get all products from both static and CRM sources, transformed to Discover format
const allProducts = computed(() => {
  const crmProducts = crmStore.getProductBundles;
  const discoverProducts = siteTextStore.getHomeText()?.discover?.fallbackProducts || [];
  
  const transformedProducts = [];
  const addedProductIds = new Set();
  
  // Transform CRM products first (they take priority)
  if (crmProducts && crmProducts.length > 0) {
    crmProducts.forEach((bundle, index) => {
      const fallback = discoverProducts[index % discoverProducts.length] || {};
      const monthlyBundleId = bundle.id;
      const derivedQuizId =
        bundle.quizId ||
        bundle.formVersion?.forms?.[0]?.slug ||
        bundle.formVersion?.forms?.[0]?.id;
      
      const staticMatch = staticProducts.find((p) => 
        p.id === bundle.id || 
        bundle.name?.toLowerCase().includes(p.name.toLowerCase()) ||
        p.name.toLowerCase().includes(bundle.name?.toLowerCase())
      );
      
      const modalProduct = {
        id: bundle.id,
        imageUrl: bundle.imageUrl || staticMatch?.img || fallback.image?.src || "",
        productName: bundle.name || `Product ${index + 1}`,
        price: bundle.price ? `$${bundle.price}` : fallback.price || "$0",
        productBundleIds: {
          monthly: monthlyBundleId,
        },
        quizId: derivedQuizId || staticMatch?.quizId,
      };
      
      transformedProducts.push({
        id: bundle.id,
        imageSrc: bundle.imageUrl || staticMatch?.img || fallback.image?.src || "",
        imageAlt: bundle.name || `Product ${index + 1}`,
        productName: bundle.name || `Product ${index + 1}`,
        price: bundle.price ? `$${bundle.price}` : "$0",
        isBestSeller:
          bundle.tag === "BEST_SELLER" ||
          bundle.tag === "bestseller" ||
          index === 1,
        modalProduct,
        _sourceCategory: getProductCategory(bundle),
      });
      
      addedProductIds.add(bundle.id);
    });
  }
  
  // Transform static products (only if not already added via CRM)
  staticProducts.forEach((staticProduct) => {
    // Skip if this product was already added from CRM
    if (addedProductIds.has(staticProduct.id)) {
      return;
    }
    
    const discoverMatch = discoverProducts.find((dp) => dp.id === staticProduct.id);
    
    const modalProduct = {
      id: staticProduct.id,
      imageUrl: staticProduct.img || discoverMatch?.image?.src || "",
      productName: staticProduct.name,
      price: discoverMatch?.price || `$${staticProduct.prices.monthly || 0}`,
      productBundleIds: staticProduct.productBundleIds,
      quizId: staticProduct.quizId,
    };
    
    transformedProducts.push({
      id: staticProduct.id,
      imageSrc: staticProduct.img || discoverMatch?.image?.src || "",
      imageAlt: discoverMatch?.image?.alt || staticProduct.name,
      productName: staticProduct.name,
      price: discoverMatch?.price || `$${staticProduct.prices.monthly || 0}`,
      isBestSeller: discoverMatch?.isBestSeller || staticProduct.popular || false,
      modalProduct,
      _sourceCategory: staticProduct.category,
    });
  });
  
  return transformedProducts;
});

// Filter products based on selected category
const filteredProducts = computed(() => {
  if (selectedCategory.value === 'all') {
    return allProducts.value;
  }
  
  return allProducts.value.filter((product) => {
    const productCategory = product._sourceCategory;
    return productCategory === selectedCategory.value;
  });
});

// Mobile detection
const isMobile = ref(false);

// Check mobile on mount and resize
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
  
  // Fetch CRM data if not already loaded to ensure categories are available
  if (crmStore.getProductBundles.length === 0) {
    crmStore.fetchCRMData().catch((error) => {
      console.warn("Failed to fetch CRM data for categories:", error);
    });
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});

// Derived button sizes
const buttonWidth = computed(() => (isMobile.value ? "144px" : "320px"));
const buttonHeight = computed(() => (isMobile.value ? "20px" : "44px"));
const buttonFontSize = computed(() => (isMobile.value ? "12" : "24"));

definePageMeta({
  layout: "products",
});
// Products page logic
</script>

<style scoped>
/* Products page styles */
</style>
