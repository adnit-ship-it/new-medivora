<template>
  <UiSectionWrapper v-if="shouldShowTrustedBy" class="flex-col overflow-hidden py-20">
    <UiSectionContainer>
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
      }"
        class="pb-[24px] font-defaultSerif text-[20px] md:text-[28px] lg:text-[32px] font-semibold text-black text-left">
        {{ trustedBy?.title || 'Trusted By' }}
      </h2>
    </UiSectionContainer>
    <div class="relative overflow-hidden border-t h-[90px] md:h-[130px] border-b border-[#D9D9D9]">
      <NuxtMarquee :speed="trustedBy?.marquee?.speed || 50" :autoFill="true" class="flex items-center justify-center h-full gap-8">
        <div class="flex items-center gap-8 lg:gap-16 h-full px-4">
          <template v-for="(logo, index) in marqueeLogos" :key="`${logo.src}-${index}`">
            <img
              :src="logo.src"
              :alt="logo.alt"
              class="h-8 lg:h-10 w-auto object-contain"
            />
          </template>
        </div>
      </NuxtMarquee>
    </div>
  </UiSectionWrapper>
</template>

<script setup>
import { computed } from "vue";
import { useSiteTextStore } from "~/stores/siteText";

defineProps({
  center: {
    type: Boolean,
    default: false,
  },
});

const siteTextStore = useSiteTextStore();

const trustedBy = computed(() => siteTextStore.getHomeText()?.trustedBy);
const shouldShowTrustedBy = computed(() => (trustedBy.value?.show ?? true));
const marqueeLogos = computed(() => {
  const logos = trustedBy.value?.logos || [];
  return [...logos, ...logos]; // duplicate for smoother marquee loop
});
</script>
