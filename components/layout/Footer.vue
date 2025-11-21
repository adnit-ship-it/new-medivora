<template>
  <footer class="bg-accentColor1 flex justify-center pb-4" :style="footerHeightStyle">
    <div class="max-w-[1328px] w-full flex items-end justify-between md:justify-center px-4 md:px-8 md:gap-8">
      <div class="flex items-center">
        <NuxtLink to="/">
          <div class="pb-1" :style="logoHeightStyle">
            <img 
              :src="altLogoUrl || '/assets/images/brand/logo-alt.svg'" 
              :alt="`${organizationName || 'Brand'} Logo`" 
              class="h-full w-full" 
            />
          </div>
        </NuxtLink>
      </div>
      <div class="md:block h-[1px] mb-1.5 w-full mx-2 md:mx-5 flex-1 bg-white"></div>

      <!-- Navigation buttons on the right -->
      <div class="flex items-center gap-x-2 md:gap-x-6">
        <NuxtLink to="/about"
          class="text-white text-[14px] md:text-[18px] lg:text-[20px] hover:text-gray-200 transition-colors duration-200">
          {{ navigation?.about || 'About' }}
        </NuxtLink>
        <NuxtLink to="/contact"
          class="text-white text-[14px] md:text-[18px] lg:text-[20px] hover:text-gray-200 transition-colors duration-200">
          {{ navigation?.contactUs || 'Contact Us' }}
        </NuxtLink>
        <NuxtLink to="/products"
          class="text-white text-[14px] md:text-[18px] lg:text-[20px] font-medium hover:text-gray-200 transition-colors duration-200">
          {{ navigation?.products || 'Products' }}
        </NuxtLink>
      </div>
    </div>
    <!-- Logo on the left -->
  </footer>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useSiteTextStore } from "~/stores/siteText";
import { useBrandLogos } from "~/utils/branding";

const siteTextStore = useSiteTextStore();
const { altLogoUrl, organizationName } = useBrandLogos();

// Destructure site text sections
const navigation = computed(() => siteTextStore.getCommonText()?.navigation);
const layout = computed(() => siteTextStore.getCommonText()?.layout);

// Mobile/Desktop detection
const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});

// Dynamic heights
const footerHeightStyle = computed(() => {
  const heights = layout.value?.footer?.height;
  if (!heights) {
    return { height: isMobile.value ? '64px' : '72px' };
  }
  return {
    height: isMobile.value ? heights.mobile : heights.desktop
  };
});

const logoHeightStyle = computed(() => {
  const heights = layout.value?.footer?.logo?.height;
  if (!heights) {
    return { height: isMobile.value ? '20px' : '32px' };
  }
  return {
    height: isMobile.value ? heights.mobile : heights.desktop
  };
});
</script>

<style scoped>
/* Custom styles if needed */
</style>
