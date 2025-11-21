<template>
  <UiSectionWrapper v-if="shouldShowBeforeAfter" class="py-20 flex-col">
    <UiSectionContainer class="pb-6">
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
      }" class="font-defaultSerif text-[20px] md:text-[28px] lg:text-[32px] font-semibold text-black md:text-left">
        {{ beforeAfter?.title || 'Before & After Medivora' }}
      </h2>
    </UiSectionContainer>

    <UiCardCarousel :items="carouselImages">
      <template #default="{ item }">
        <div class="w-full h-full">
          <img :src="item.src" :alt="item.alt" class="h-full w-full object-cover" />
        </div>
      </template>
    </UiCardCarousel>
  </UiSectionWrapper>
</template>

<script setup>
import { computed } from "vue";
import { useSiteTextStore } from "~/stores/siteText";

const siteTextStore = useSiteTextStore();

const beforeAfter = computed(() => siteTextStore.getHomeText()?.beforeAfter);
const shouldShowBeforeAfter = computed(() => (beforeAfter.value?.show ?? true));
const carouselImages = computed(() =>
  (beforeAfter.value?.images || []).map((image, index) => ({
    src: image.src,
    alt: image.alt || `Before & After ${index + 1}`,
  }))
);
</script>

<style scoped>
/* Custom styles if needed */
</style>
