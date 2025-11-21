<template>
  <div class="flex flex-col bg-accentColor2 min-h-[98vh] items-center relative w-full px-12 py-24 md:py-32">
    <!-- Loading State -->
    <div v-if="isQuizLoading" class="flex flex-col items-center justify-center h-64">
      <svg class="animate-spin h-8 w-8 text-bodyColor" xmlns="http://www.w3.org/2000/svg" fill="none"
        viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
        </path>
      </svg>
      <p class="mt-4 text-bodyColor">Loading Consultation...</p>
    </div>

    <!-- Quiz Not Found Error -->
    <div v-else-if="quizError" class="w-full max-w-[1248px] mx-auto">
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <h3 class="text-lg font-medium text-red-800">Configuration Error</h3>
        <p class="mt-2 text-sm text-red-700">{{ quizError }}</p>
      </div>
    </div>

    <!-- Main Form Content -->
    <div v-else-if="quizConfig" class="max-w-[1248px] w-full mx-auto">
      <!-- Restart Button -->
      <div class="flex justify-end w-full max-w-[1248px] mx-auto relative">
        <button @click="clearFormAndRestart" :disabled="isLoading"
          class="text-bodyColor absolute top-2 md:top-4 right-2 md:right-4 text-xs md:text-sm font-bold underline disabled:opacity-50 disabled:cursor-not-allowed"
          title="Start over">
          <ClientOnly>
            <img :src="resetIconSrc" alt="Restart" class="w-4 h-4" />
            <template #fallback>
              <div class="w-4 h-4 bg-gray-300 rounded"></div>
            </template>
          </ClientOnly>
        </button>
      </div>

      <!-- Submission Error Display -->
      <div v-if="submissionError" class="w-full max-w-[1248px] mx-auto mb-6">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Form Error</h3>
              <div class="mt-2 text-sm text-red-700">
                {{ submissionError }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Tracker -->
      <IntakeFormProgressTracker :steps="progressSteps" :currentStep="currentProgressMarker" />

      <!-- 1. The Header Component -->
      <IntakeFormHeader v-if="currentStepData" :step-data="currentStepData" />

      <!-- 2. The Question Renderer Component -->
      <IntakeFormQuestionRenderer v-if="currentStepData" :step-data="currentStepData" :form-answers="formAnswers"
        :is-loading="isLoading" class="mt-8" />

      <!-- 3. The Navigation Component -->
      <IntakeFormNavigation class="mt-8" :is-last-step="isLastQuestion" :is-next-disabled="!isStepComplete"
        :is-back-disabled="currentQuestionIndex === 0" :is-loading="isLoading" @next="nextStep" @back="prevStep" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { usePatientForm } from "~/composables/intake-form/usePatientForm";
import type { QuizConfig } from "~/types/intake-form/form";
import { glp1WeightLossQuiz, getQuizById } from "~/data/intake-form/quizConfigs";
import { products as staticProductCatalog } from "~/data/intake-form/products";
import { useCRMStore } from "~/stores/crmStore";
import { getQuizByOrgAndProduct } from "~/lib/supabase/quizzes";
import { intakeFormConfig } from "~/config/intakeForm";

const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const crmStore = useCRMStore();

// --- State for the quiz ---
const quizConfig = ref<QuizConfig | null>(null);
const isQuizLoading = ref(true);
const quizError = ref<string | null>(null);

const defaultQuizId = intakeFormConfig.defaultQuizId || glp1WeightLossQuiz.id;

const findCrmProductByBundleId = (bundleId: string) => {
  return (
    crmStore.getProductBundles?.find((bundle: any) => {
      const candidateIds = [
        bundle.productBundleIds?.monthly,
        bundle.productBundleIds?.threeMonthly,
        bundle.productBundleIds?.sixMonthly,
        bundle.id,
      ].filter(Boolean);
      return candidateIds.includes(bundleId);
    }) || null
  );
};

const findStaticProductByBundleId = (bundleId: string) => {
  return (
    staticProductCatalog.find((product) => {
      const candidateIds = [
        product.productBundleIds?.monthly,
        product.productBundleIds?.threeMonthly,
        product.productBundleIds?.sixMonthly,
        product.id,
      ].filter(Boolean);
      return candidateIds.includes(bundleId);
    }) || null
  );
};

const canUseSupabase =
  !!runtimeConfig.public.supabaseUrl && !!runtimeConfig.public.supabaseAnonKey;

const loadQuizConfigurationForProduct = async () => {
  isQuizLoading.value = true;
  quizError.value = null;

  try {
    if (
      typeof crmStore.isLoading !== "undefined" &&
      !crmStore.isLoading &&
      (!crmStore.getProductBundles || crmStore.getProductBundles.length === 0)
    ) {
      try {
        await crmStore.fetchCRMData();
      } catch (storeError) {
        console.warn("CRM data fetch failed, proceeding with static data.", storeError);
      }
    }

    const bundleIdFromRoute = route.query.productId as string | undefined;
    let resolvedQuizId: string | undefined;

    if (bundleIdFromRoute) {
      const crmProduct = findCrmProductByBundleId(bundleIdFromRoute);
      if (crmProduct?.quizId) {
        resolvedQuizId = crmProduct.quizId;
      }

      if (!resolvedQuizId) {
        const staticProduct = findStaticProductByBundleId(bundleIdFromRoute);
        if (staticProduct?.quizId) {
          resolvedQuizId = staticProduct.quizId;
        }
      }
    }

    if (!resolvedQuizId) {
      const defaultCrmProduct: any = crmStore.defaultProductBundle;
      if (defaultCrmProduct?.quizId) {
        resolvedQuizId = defaultCrmProduct.quizId;
      }
    }

    if (!resolvedQuizId) {
      resolvedQuizId = defaultQuizId;
    }

    let resolvedQuizConfig = resolvedQuizId
      ? getQuizById(resolvedQuizId)
      : null;

    if (
      !resolvedQuizConfig &&
      process.client &&
      canUseSupabase &&
      bundleIdFromRoute &&
      crmStore.sanitizedData?.organizationId
    ) {
      try {
        resolvedQuizConfig = await getQuizByOrgAndProduct(
          crmStore.sanitizedData.organizationId,
          bundleIdFromRoute,
        );
      } catch (supabaseError) {
        console.warn("Failed to fetch quiz from Supabase:", supabaseError);
      }
    }

    if (!resolvedQuizConfig) {
      quizError.value =
        "Unable to load the intake form for the selected product. Showing the default form instead.";
      resolvedQuizConfig = glp1WeightLossQuiz;
    }

    quizConfig.value = resolvedQuizConfig;
  } catch (error) {
    console.error("An unexpected error occurred while loading the form.", error);
    quizError.value =
      "An unexpected error occurred while loading the form.";
    quizConfig.value = glp1WeightLossQuiz;
  } finally {
    isQuizLoading.value = false;
  }
};

watch(
  () => [route.query.productId, crmStore.getProductBundles?.length],
  () => {
    loadQuizConfigurationForProduct();
  },
  { immediate: true },
);

// --- Initialize the form logic once quizConfig is available ---
// Use a computed property to pass the quiz config to the composable
const quizConfigForComposable = computed(() => quizConfig.value);

const {
  currentQuestionIndex,
  formAnswers,
  currentStepData,
  isLastQuestion,
  isStepComplete,
  isLoading,
  submissionError,
  nextStep,
  prevStep,
  clearFormAndRestart,
  currentProgressMarker,
} = usePatientForm(quizConfigForComposable);

// Get progress steps from the quiz config when available
const progressSteps = computed(() => {
  return quizConfig.value?.progressSteps || [];
});

// Computed property for reset icon to prevent hydration mismatch
const resetIconSrc = computed(() => "/assets/images/intake-form/icons/reset.svg");
</script>

<style scoped>
/* Consultation page styles */
</style>
