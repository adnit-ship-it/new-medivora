<template>
  <UiSectionWrapper v-if="shouldShowHero" class="relative text-black pt-32 pb-52">
    <!-- Background Image -->
    <div
      class="absolute inset-0 bg-cover bg-no-repeat w-full h-full"
      :style="backgroundStyle"
    />

    <!-- Hand Vial Image - Bottom Right -->
    <div class="absolute bottom-0 right-0 z-20 flex items-end justify-end" :style="foregroundHeightStyle">
      <img
        v-motion
        :initial="{ opacity: 0, y: 100 }"
        :visible-once="{
        opacity: 1,
        y: 0,
        transition: {
          duration: 500,
          type: 'ease-in',
          stiffness: 250,
          damping: 25,
          mass: 1,
        },
      }"
        :src="heroMedia?.foreground?.src || '/assets/images/brand/hero-img.png'"
        :alt="heroMedia?.foreground?.alt || 'Hand holding vial'"
        class="h-full w-auto object-contain"
      />
    </div>

    <!-- Content - Single Column -->
    <UiSectionContainer class="relative z-30 h-full">
      <div class="space-y-2 md:space-y-4 lg:space-y-10 flex flex-col h-full">
        <div :style="logoWidthStyle">
          <img
            v-motion
            :initial="{ opacity: 0, y: 100 }"
            :visible-once="{
            opacity: 1,
            y: 0,
            transition: {
              duration: 500,
              type: 'ease-in',
              stiffness: 250,
              damping: 25,
              mass: 1,
            },
          }" 
            :src="logoUrl || heroMedia?.logo?.src || '/assets/images/brand/logo.svg'"
            :style="logoHeightStyle"
            class="w-full object-cover" 
            :alt="heroMedia?.logo?.alt || `${organizationName || 'Brand'} Logo`" 
          />
        </div>
        
        <h1 v-motion :initial="{ opacity: 0, y: 100 }" :visible-once="{
          opacity: 1,
          y: 0,
          transition: {
            duration: 500,
            type: 'ease-in',
            stiffness: 250,
            damping: 25,
            mass: 1,
            delay: 50,
          },
        }" class="text-2xl md:text-3xl lg:text-[48px] font-bold text-accentColor1 font-defaultSerif">
          {{ hero?.heading || 'Lose weight with GLP-1 medications.' }}
        </h1>

        <h2 v-motion :initial="{ opacity: 0, y: 100 }" :visible-once="{
          opacity: 1,
          y: 0,
          transition: {
            duration: 500,
            type: 'ease-in',
            stiffness: 250,
            damping: 25,
            mass: 1,
            delay: 100,
          },
        }" class="text-lg md:text-xl lg:text-[34px] text-accentColor1">
          {{ hero?.subheading || 'Start your journey with us today!' }}
        </h2>
        
        <!-- Bullet Points -->
        <ul class="space-y-3">
          <li 
            v-for="(bullet, index) in bulletPoints" 
            :key="`bullet-${index}`"
            v-motion 
            :initial="{ opacity: 0, y: 100 }" 
            :visible-once="{
              opacity: 1,
              y: 0,
              transition: {
                duration: 500,
                type: 'ease-in',
                stiffness: 250,
                damping: 25,
                mass: 1,
                delay: 150 + (index * 50),
              },
            }" 
            class="flex items-center h-[10px] md:h-[26px]"
          >
            <img
              :src="getIconPath(bullet.iconType, iconRegistry)"
              :alt="`${bullet.text} icon`"
              :style="getSvgColorStyle(bullet.iconColor)"
              class="w-[10px] h-[10px] md:w-[26px] md:h-[26px] mr-1 md:mr-3" />
            <span class="text-[14px] md:text-[20px] lg:text-[24px] font-medium">{{ bullet.text }}</span>
          </li>
        </ul>

        <!-- CTA Button -->
        <div v-motion :initial="{ opacity: 0, y: 100 }" :visible-once="{
          opacity: 1,
          y: 0,
          transition: {
            duration: 500,
            type: 'ease-in',
            stiffness: 250,
            damping: 25,
            mass: 1,
            delay: 200,
          },
        }" class="flex flex-col justify-end h-[50px] mt-7 lg:mt-5">
          <NuxtLink to="/consultation">
            <UiButton :width="buttonWidth" :height="buttonHeight" :font-size="buttonFontSize" ghost>
              {{ hero?.ctaButton || 'Take the Assessment' }}
            </UiButton>
          </NuxtLink>
        </div>
      </div>
    </UiSectionContainer>
  </UiSectionWrapper>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useSiteTextStore } from "~/stores/siteText";
import { useBrandLogos } from "~/utils/branding";
import { getIconPath, getSvgColorStyle } from "~/utils/svgColors";

const siteTextStore = useSiteTextStore();
const { logoUrl, organizationName } = useBrandLogos();

// Destructure site text sections once for this component
const hero = computed(() => siteTextStore.getHomeText()?.hero);
const heroMedia = computed(() => hero.value?.media);
const shouldShowHero = computed(() => (hero.value?.show ?? true));
const iconRegistry = computed(() => siteTextStore.getIconRegistry());
const bulletPoints = computed(() => hero.value?.bulletPoints || []);

const backgroundStyle = computed(() => {
  const background = heroMedia.value?.background?.src;
  return background
    ? {
        backgroundImage: `url(${background})`,
        backgroundPosition: "bottom right"
      }
    : {
        backgroundImage: "url('/assets/images/brand/hero-bg.png')",
        backgroundPosition: "bottom right"
      };
});

// Dynamic heights
const foregroundHeightStyle = computed(() => {
  const heights = heroMedia.value?.foreground?.heights;
  if (!heights) {
    return { height: isMobile.value ? '222px' : isTablet.value ? '480px' : '600px' };
  }
  return {
    height: isMobile.value ? heights.mobile : isTablet.value ? heights.tablet : heights.desktop
  };
});

const logoHeightStyle = computed(() => {
  const heights = heroMedia.value?.logo?.heights;
  if (!heights) {
    return { height: isMobile.value ? '24px' : isTablet.value ? '28px' : '32px' };
  }
  return {
    height: isMobile.value ? heights.mobile : isTablet.value ? heights.tablet : heights.desktop
  };
});

const logoWidthStyle = computed(() => {
  return { width: isMobile.value ? '150px' : '365px' };
});

// Mobile/Tablet detection
const isMobile = ref(false);
const isTablet = ref(false);

// Check mobile on mount and resize
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
  isTablet.value = window.innerWidth > 768 && window.innerWidth <= 1024;
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});

// Derived button sizes
const buttonWidth = computed(() => (isMobile.value ? "144px" : "320px"));
const buttonHeight = computed(() => (isMobile.value ? "20px" : "48px"));
const buttonFontSize = computed(() => (isMobile.value ? "12" : "24"));
</script>

<style scoped>
/* Custom styles if needed */
</style>
