<template>
  <UiSectionWrapper v-if="shouldShowStatistics" class="bg-accentColor2 py-20">
    <UiSectionContainer class="flex flex-col gap-12">
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
        class="w-full max-w-[1168px] font-defaultSerif text-[20px] md:text-[28px] lg:text-[32px] font-semibold text-black md:text-left">
        {{ statistics?.title || 'Clinically Proven To Help You Lose Weight' }}
      </h2>
      <div class="flex gap-12">
        <div class="flex flex-col w-full gap-8">
          <div
            v-for="(card, index) in statisticsCards"
            :key="card.value"
            v-motion :initial="{ opacity: 0, y: 32 }" :visible-once="{
              opacity: 1,
              y: 0,
              transition: {
                duration: 400,
                type: 'ease-in',
                stiffness: 250,
                damping: 25,
                mass: 1,
                delay: 150 + (50 * index),
              },
            }"
            class="w-full md:w-[420px] h-[108px] bg-backgroundColor border-2 border-accentColor1 rounded-[12px] flex items-center justify-center flex-col shadow-xl"
          >
            <h3 class="text-[28px] md:text-[36px] leading-[32px] md:leading-[38px] font-semibold">{{ card.value }}</h3>
            <p class="text-[20px] text-center leading-[24px]">
              <template v-for="(line, lineIndex) in card.descriptionLines" :key="`${card.value}-line-${lineIndex}`">
                {{ line }}<br v-if="lineIndex !== card.descriptionLines.length - 1">
              </template>
            </p>
          </div>
        </div>
        <img v-motion :initial="{ opacity: 0, y: 32 }" :visible-once="{
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
        }" :src="statistics?.media?.graph?.src || '/assets/images/wl-graph.png'" :alt="statistics?.media?.graph?.alt || 'weight loss graph'" class="hidden lg:block h-[388px] object-contain">
      </div>
    </UiSectionContainer>
  </UiSectionWrapper>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSiteTextStore } from "~/stores/siteText";

const siteTextStore = useSiteTextStore();

const statistics = computed(() => siteTextStore.getHomeText()?.statistics);
const shouldShowStatistics = computed(() => (statistics.value?.show ?? true));
const defaultCards = [
  {
    value: "14.9%",
    descriptionLines: ["Average reduction in body weight"],
  },
  {
    value: "6x",
    descriptionLines: ["More weight loss than diet", "and exercise alone"],
  },
  {
    value: "100%",
    descriptionLines: ["Online Personalized Support"],
  },
];

const statisticsCards = computed(() => {
  const mappedCards = (statistics.value?.cards || []).map((card) => {
    const description = card.description || "";
    const descriptionLines = description ? card.description.split("\n") : [];
    return {
      value: card.value,
      descriptionLines: descriptionLines.length > 0 ? descriptionLines : [description || ""],
    };
  });
  return mappedCards.length > 0 ? mappedCards : defaultCards;
});
</script>