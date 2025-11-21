<template>
  <UiSectionWrapper v-if="shouldShowReviews" class="flex-col py-20">
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
      }" class="pb-[24px] font-defaultSerif text-[20px] md:text-[28px] lg:text-[32px] font-semibold text-black">
        {{ reviewsSection?.title || 'What Our Customers Have To Say' }}
      </h2>
    </UiSectionContainer>


    <div class="w-full flex flex-col gap-5 md:gap-8">
      <NuxtMarquee  v-motion :initial="{ opacity: 0, y: 32 }" :visible-once="{
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
      }"  :speed="reviewsSection?.marquee?.speed || 50" :autoFill="true" class="flex gap-8">
        <div class="flex gap-5 md:gap-8">
          <div v-for="review in topReviews" :key="`top-${review.name}`"
            class="min-w-[320px] md:min-w-[492px] max-w-[320px] md:max-w-[492px] h-[136px] md:h-[188px] border-accentColor1 border rounded-[16px] md:rounded-[28px] bg-backgroundColor p-2 md:p-4 flex flex-col gap-5 md:gap-8">
            <div class="flex items-center justify-between">
              <div class="flex gap-[6px] items-center">
                <img 
                  :src="reviewsMedia.avatar?.src" 
                  :alt="reviewsMedia.avatar?.alt" 
                  :style="getSvgColorStyle(reviewsMedia.avatar?.color)"
                  class="w-[24px] h-[24px] md:w-[32px] md:h-[32px]" />
                <p class="text-accentColor1 text-[16px] md:text-[24px] font-medium">
                  {{ review.name }}
                </p>
              </div>
              <div class="flex gap-1.5 md:gap-3">
                <img 
                  v-for="star in review.stars" 
                  :key="star" 
                  :src="reviewsMedia.star?.src" 
                  :alt="reviewsMedia.star?.alt"
                  :style="getSvgColorStyle(reviewsMedia.star?.color)"
                  class="w-[22px] h-[22px] md:w-[28px] md:h-[28px]" />
              </div>
            </div>
            <p class="text-[16px] md:text-[24px] text-center leading-tight px-2"
              style="white-space: normal !important; word-wrap: break-word !important;">
              "{{ review.review }}"
            </p>
          </div>
        </div>
      </NuxtMarquee>

      <NuxtMarquee  v-motion :initial="{ opacity: 0, y: 32 }" :visible-once="{
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
      }"  :speed="reviewsSection?.marquee?.speed || 50" :direction="'right'" :autoFill="true" class="flex gap-8">
        <div class="flex gap-5 md:gap-8">
          <div v-for="review in bottomReviews" :key="`bottom-${review.name}`"
            class="min-w-[320px] md:min-w-[492px] max-w-[320px] md:max-w-[492px] h-[136px] md:h-[188px] border-accentColor1 border rounded-[16px] md:rounded-[28px] bg-backgroundColor p-2 md:p-4 flex flex-col gap-5 md:gap-8">
            <div class="flex items-center justify-between">
              <div class="flex gap-[6px] items-center">
                <img 
                  :src="reviewsMedia.avatar?.src" 
                  :alt="reviewsMedia.avatar?.alt" 
                  :style="getSvgColorStyle(reviewsMedia.avatar?.color)"
                  class="w-[24px] h-[24px] md:w-[32px] md:h-[32px]" />
                <p class="text-accentColor1 text-[16px] md:text-[24px] font-medium">
                  {{ review.name }}
                </p>
              </div>
              <div class="flex gap-1.5 md:gap-3">
                <img 
                  v-for="star in review.stars" 
                  :key="star" 
                  :src="reviewsMedia.star?.src" 
                  :alt="reviewsMedia.star?.alt"
                  :style="getSvgColorStyle(reviewsMedia.star?.color)"
                  class="w-[22px] h-[22px] md:w-[28px] md:h-[28px]" />
              </div>
            </div>
            <p class="text-[16px] md:text-[24px] text-center leading-tight px-2"
              style="white-space: normal !important; word-wrap: break-word !important;">
              "{{ review.review }}"
            </p>
          </div>
        </div>
      </NuxtMarquee>
    </div>
  </UiSectionWrapper>

</template>

<script setup>
import { computed } from "vue";
import { useSiteTextStore } from "~/stores/siteText";
import { getSvgColorStyle } from "~/utils/svgColors";

const siteTextStore = useSiteTextStore();

const reviewsSection = computed(() => siteTextStore.getHomeText()?.reviews);
const shouldShowReviews = computed(() => {
  const list = reviewsSection.value?.list || [];
  return (reviewsSection.value?.show ?? true) && list.length > 0;
});

const reviewsList = computed(() => reviewsSection.value?.list || []);
const midpoint = computed(() => Math.ceil(reviewsList.value.length / 2));
const topReviews = computed(() => reviewsList.value.slice(0, midpoint.value));
const bottomReviews = computed(() => reviewsList.value.slice(midpoint.value));

const reviewsMedia = computed(() => ({
  avatar: reviewsSection.value?.media?.avatar || {
    src: "/assets/images/user.svg",
    alt: "user icon",
  },
  star: reviewsSection.value?.media?.star || {
    src: "/assets/images/star.svg",
    alt: "star icon",
  },
}));
</script>
