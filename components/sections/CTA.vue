<template>
  <UiSectionWrapper v-if="shouldShowCTA" class="py-20 relative bg-accentColor2 text-bodyColor">
    <UiSectionContainer class="flex md:flex-row-reverse pb-8 md:pb-0">
      <div class="absolute md:relative bottom-0 right-0 z-20 pb-4 md:pb-0 pr-2 md:pr-0 md:h-full" :style="productHeightStyle">
        <img :src="cta?.media?.product?.src || '/assets/images/products.png'" :alt="cta?.media?.product?.alt || 'cta image'"
          class="h-full w-full object-contain scale-100 md:scale-125" />
      </div>

      <div class="relative z-30 w-full h-full">
        <div class="flex flex-col h-full">
          <h2 v-motion :initial="{ opacity: 0, y: 32 }" :visible-once="{
            opacity: 1,
            y: 0,
            transition: {
              duration: 400,
              type: 'ease-in',
              stiffness: 250,
              damping: 25,
              mass: 1,
              delay: 100,
            },
          }" class="font-semibold text-[20px] md:text-[28px] lg:text-[32px] font-defaultSerif">
            {{ cta?.title || 'Real Results' }}
          </h2>
          <p v-motion :initial="{ opacity: 0, y: 32 }" :visible-once="{
            opacity: 1,
            y: 0,
            transition: {
              duration: 400,
              type: 'ease-in',
              stiffness: 250,
              damping: 25,
              mass: 1,
              delay: 150,
            },
          }" class="pt-5 text-[16px] md:text-[20px] lg:text-[28px] font-regular">
            {{ cta?.subtitle || 'See why Medivora is the #1 choice for GLP-1 Medications' }}
          </p>

          <div class="flex flex-col lg:flex-row gap-2 lg:gap-7 pt-4 lg:pt-5">
            <UiButton v-motion :initial="{ opacity: 0, y: 32 }" :visible-once="{
              opacity: 1,
              y: 0,
              transition: {
                duration: 400,
                type: 'ease-in',
                stiffness: 250,
                damping: 25,
                mass: 1,
                delay: 200,
              },
            }" ghost decorative :width="isMobile ? '145px' : '320px'" :height="isMobile ? '24px' : '44px'"
              :font-size="isMobile ? '12' : '24'">{{ cta?.stats?.patients || '1000+ Patients' }}</UiButton>
            <UiButton v-motion :initial="{ opacity: 0, y: 32 }" :visible-once="{
              opacity: 1,
              y: 0,
              transition: {
                duration: 400,
                type: 'ease-in',
                stiffness: 250,
                damping: 25,
                mass: 1,
                delay: 250,
              },
            }" ghost decorative :width="isMobile ? '200px' : '320px'" :height="isMobile ? '24px' : '44px'"
              :font-size="isMobile ? '14' : '24'">{{ cta?.stats?.worldwideCare || 'Worldwide Care' }}</UiButton>
          </div>

          <div class="pt-7 lg:pt-[50px] flex flex-col lg:flex-row gap-2 lg:gap-10 font-medium">
            <div 
              v-for="(feature, index) in firstRowFeatures" 
              :key="`feature-${index}`"
              v-motion 
              :initial="{ opacity: 0, y: 32 }" 
              :visible-once="{
                opacity: 1,
                y: 0,
                transition: {
                  duration: 400,
                  type: 'ease-in',
                  stiffness: 250,
                  damping: 25,
                  mass: 1,
                  delay: 300,
                },
              }" 
              class="flex gap-1 items-center text-[12px] md:text-[20px] lg:text-[24px] font-medium"
            >
              <img 
                :src="getIconPath(feature.iconType, iconRegistry)" 
                :alt="`${feature.text} icon`"
                :style="getSvgColorStyle(feature.iconColor)"
                class="w-[18px] h-[18px] md:w-[24px] md:h-[24px] lg:w-[28px] lg:h-[28px]" />
              <p>{{ feature.text }}</p>
            </div>
          </div>
          <div class="mt-2 lg:mt-9 flex flex-col lg:flex-row gap-2 lg:gap-10">
            <div 
              v-for="(feature, index) in secondRowFeatures" 
              :key="`feature-${index + firstRowFeatures.length}`"
              v-motion 
              :initial="{ opacity: 0, y: 32 }" 
              :visible-once="{
                opacity: 1,
                y: 0,
                transition: {
                  duration: 400,
                  type: 'ease-in',
                  stiffness: 250,
                  damping: 25,
                  mass: 1,
                  delay: 300,
                },
              }" 
              class="flex gap-1 items-center text-[12px] md:text-[20px] lg:text-[24px]"
            >
              <img 
                :src="getIconPath(feature.iconType, iconRegistry)" 
                :alt="`${feature.text} icon`"
                :style="getSvgColorStyle(feature.iconColor)"
                class="w-[18px] h-[18px] md:w-[24px] md:h-[24px] lg:w-[28px] lg:h-[28px]" />
              <p>{{ feature.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </UiSectionContainer>
  </UiSectionWrapper>


</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useSiteTextStore } from "~/stores/siteText";
import { getIconPath, getSvgColorStyle } from "~/utils/svgColors";

const siteTextStore = useSiteTextStore();

// Destructure site text sections
const cta = computed(() => siteTextStore.getHomeText()?.cta);
const shouldShowCTA = computed(() => (cta.value?.show ?? true));
const iconRegistry = computed(() => siteTextStore.getIconRegistry());
const features = computed(() => cta.value?.features || []);

// Split features into two rows
const firstRowFeatures = computed(() => {
  const midpoint = Math.ceil(features.value.length / 2);
  return features.value.slice(0, midpoint);
});

const secondRowFeatures = computed(() => {
  const midpoint = Math.ceil(features.value.length / 2);
  return features.value.slice(midpoint);
});

// Product image height
const productHeightStyle = computed(() => {
  const heights = cta.value?.media?.product?.heights;
  if (!heights) {
    return { height: isMobile.value ? '222px' : 'auto' };
  }
  return {
    height: isMobile.value ? heights.mobile : heights.desktop
  };
});

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
</script>

<style scoped>
/* Component styles can be added here */
</style>
