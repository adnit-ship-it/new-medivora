<template>
  <div class="min-h-screen bg-gray-50 pt-[83px] lg:pt-[68px]">
    <!-- Loading State -->
    <div
      v-if="isValidating"
      class="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50"
    >
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">Validating quiz completion...</p>
      </div>
    </div>

    <!-- Validation Failed State -->
    <div
      v-if="!isValidating && !isFormValid"
      class="min-h-screen bg-gray-50 flex items-center justify-center"
    >
      <div class="text-center max-w-md mx-auto px-4">
        <div class="bg-red-50 border border-red-200 rounded-lg p-6">
          <div class="text-red-600 mb-4">
            <svg
              class="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-red-800 mb-2">
            Quiz Not Completed
          </h3>
          <p class="text-red-700 mb-4">
            Please complete the intake form quiz before proceeding to checkout.
          </p>
          <button
            @click="navigateTo('/consultation')"
            class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Go to Consultation Form
          </button>
        </div>
      </div>
    </div>

    <!-- Step Content -->
    <div
      v-if="!isValidating && isFormValid"
      class="max-w-[1248px] mx-auto py-8"
    >
      <!-- Step 1: Product Selection -->
      <IntakeFormCheckoutProductSelection
        v-if="currentStep === 0"
        :selectedProduct="selectedProduct"
        :selectedPlan="selectedPlan"
        :isSubmitting="isSubmitting"
        :formAnswers="formAnswers"
        :products="products"
        @select-product="handleProductSelected"
        @select-plan="handlePlanSelected"
      />

      <!-- Step 2: Payment -->
      <IntakeFormCheckoutPaymentStep
        v-if="currentStep === 1"
        :selectedProduct="selectedProduct"
        :selectedPlan="selectedPlan"
        :formAnswers="formAnswers"
        :paymentData="paymentData"
        :isStripeLoaded="isStripeLoaded"
        :isSubmitting="isSubmitting"
        @payment-update="handlePaymentUpdate"
        @contact-update="handleContactUpdate"
      />
    </div>

    <!-- Navigation -->
    <IntakeFormCheckoutNavigation
      v-if="!isValidating && isFormValid"
      :isBackDisabled="false"
      :isNextDisabled="!canGoNext"
      :isSubmitting="isSubmitting"
      :nextText="navigationButtonText"
      @next="nextStep"
      @back="previousStep"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import type { Product } from "~/types/intake-form/checkout";
import { useFormPersistence } from "~/composables/intake-form/useFormPersistence";
import { useStripe } from "~/composables/intake-form/useStripe";
import { useCRMStore } from "~/stores/crmStore";
import { products as staticProductCatalog } from "~/data/intake-form/products";
import { intakeFormConfig } from "~/config/intakeForm";

// State
const currentStep = ref(0);
const selectedProduct = ref<Product | null>(null);
const selectedPlan = ref<"monthly" | "semiannually">("monthly");
const isSubmitting = ref(false);
const formAnswers = ref<any>({});
const paymentData = ref<
  { stripeSetupId: string | null; shippingAddress: any | null } | undefined
>(undefined);
const isStripeLoaded = ref(false);
const isFormValid = ref(false);
const isValidating = ref(true);

// CRM Store
const crmStore = useCRMStore();

// Computed
// Transform CRM products to match Product interface
const products = computed(() => {
  const apiProducts = crmStore.getProductBundles;
  const route = useRoute();
  const productId = route.query.productId as string | undefined;

  const normalizeCrmBundle = (bundle: any): Product => {
    const monthlyPrice = bundle.price || 299;
    const semiannualPrice = Math.round(monthlyPrice * 0.8);

    return {
      id: bundle.id,
      name: bundle.name || "Product",
      description: bundle.description || "Product description",
      img: bundle.imageUrl || "/assets/images/products/default.png",
      prices: {
        monthly: monthlyPrice,
        semiannually: semiannualPrice,
        sixMonthly: semiannualPrice,
      },
      productBundleIds: bundle.productBundleIds || {
        monthly: bundle.id,
      },
      quizId: bundle.quizId,
    };
  };

  const normalizeStaticProduct = (product: (typeof staticProductCatalog)[number]): Product => {
    const monthlyPrice = product.prices.monthly || 0;
    const semiannualPrice =
      product.prices.sixMonthly ??
      product.prices.threeMonthly ??
      (monthlyPrice ? Math.round(monthlyPrice * 0.8) : 0);

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      img: product.img,
      prices: {
        monthly: monthlyPrice,
        semiannually: semiannualPrice,
        sixMonthly: semiannualPrice,
      },
      productBundleIds: product.productBundleIds,
      quizId: product.quizId,
    };
  };

  let allProducts: Product[] = [];

  if (apiProducts && apiProducts.length > 0) {
    allProducts = apiProducts.map(normalizeCrmBundle);
  } else {
    allProducts = staticProductCatalog.map(normalizeStaticProduct);
  }

  const findMatchingProduct = (bundleId: string) =>
    allProducts.find((product) =>
      [
        product.productBundleIds?.monthly,
        product.productBundleIds?.threeMonthly,
        product.productBundleIds?.sixMonthly,
        product.id,
      ]
        .filter(Boolean)
        .includes(bundleId),
    );

  if (productId) {
    const filteredProduct = findMatchingProduct(productId);
    return filteredProduct ? [filteredProduct] : allProducts;
  }

  return allProducts;
});
const canGoNext = computed(() => {
  if (currentStep.value === 0) return selectedProduct.value !== null;
  if (currentStep.value === 1) {
    // Check if payment is complete
    const hasPayment =
      paymentData.value?.stripeSetupId && paymentData.value?.shippingAddress;
    return hasPayment;
  }
  return false;
});

const canGoBack = computed(() => true); // Always allow back button, redirect logic is handled in previousStep

// Computed property for navigation button text
const navigationButtonText = computed(() => {
  if (currentStep.value === 0) return "Next";
  if (currentStep.value === 1) return "Submit to Provider";
  return "Next";
});

// Methods
const handleProductSelected = (product: Product) => {
  selectedProduct.value = product;
};

const handlePlanSelected = (plan: "monthly" | "semiannually") => {
  selectedPlan.value = plan;
};

const handlePaymentUpdate = (
  data:
    | { stripeSetupId: string | null; shippingAddress: any | null }
    | null
    | undefined,
) => {
  paymentData.value = data || undefined;
};

const handleContactUpdate = (data: {
  promoCode: string;
}) => {
  // Update form answers with promo code
  formAnswers.value = {
    ...formAnswers.value,
    promoCode: data.promoCode,
  };
};

// Helper function to collect file IDs from form answers for cleanup
const collectFileIds = (formAnswers: any): string[] => {
  const fileIds: string[] = [];
  
  for (const [key, value] of Object.entries(formAnswers)) {
    if (value && typeof value === 'object' && 'fileId' in value) {
      fileIds.push(value.fileId);
    }
  }
  
  return fileIds;
};

// Reset payment state to get fresh SetupIntent for retry
const resetPaymentState = async () => {
  if (paymentData.value) {
    paymentData.value = {
      stripeSetupId: null, // This triggers fresh SetupIntent creation
      shippingAddress: paymentData.value.shippingAddress
    };
  }
  
  // Force refresh the SetupIntent to get a new one
  await refreshSetupIntent();
};

const nextStep = async () => {
  if (currentStep.value === 0 && canGoNext.value) {
    currentStep.value++;
    // Scroll to top when moving to next step
    if (process.client) {
      nextTick(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  } else if (currentStep.value === 1 && canGoNext.value) {
    // Final step - submit to provider
    const { useToast } = await import("vue-toastification");
    const toast = useToast();
    toast.info("Starting form submission process...");
    await handleFinalSubmission();
  }
};

const handleFinalSubmission = async () => {
  if (!paymentData.value) return;

  try {
    isSubmitting.value = true;

    // If Stripe is not yet confirmed, we need to confirm it first
    if (paymentData.value.stripeSetupId === "ready") {
      // Show toast for payment processing
      const { useToast } = await import("vue-toastification");
      const toast = useToast();
      toast.info("Processing payment... Please wait.");

      // Trigger Stripe confirmation and wait for the result
      const confirmEvent = new CustomEvent("stripe-confirm-setup");
      window.dispatchEvent(confirmEvent);

      // Wait for the actual confirmation result instead of using a timeout
      try {
        await new Promise((resolve, reject) => {
          const successHandler = (event: Event) => {
            const customEvent = event as CustomEvent;
            window.removeEventListener(
              "stripe-confirmation-success",
              successHandler,
            );
            window.removeEventListener(
              "stripe-confirmation-error",
              errorHandler,
            );
            resolve(customEvent.detail.setupIntent);
          };

          const errorHandler = (event: Event) => {
            const customEvent = event as CustomEvent;
            window.removeEventListener(
              "stripe-confirmation-success",
              successHandler,
            );
            window.removeEventListener(
              "stripe-confirmation-error",
              errorHandler,
            );
            reject(
              new Error(
                customEvent.detail.error || "Payment confirmation failed",
              ),
            );
          };

          window.addEventListener(
            "stripe-confirmation-success",
            successHandler,
          );
          window.addEventListener("stripe-confirmation-error", errorHandler);

          // Add a reasonable timeout (15 seconds) for user experience
          setTimeout(() => {
            window.removeEventListener(
              "stripe-confirmation-success",
              successHandler,
            );
            window.removeEventListener(
              "stripe-confirmation-error",
              errorHandler,
            );
            reject(
              new Error("Payment confirmation timed out after 15 seconds"),
            );
          }, 15000);
        });

        toast.success("Payment confirmed successfully!");
      } catch (confirmationError: any) {
        // Reset payment state to get fresh SetupIntent for retry
        await resetPaymentState();
        
        throw new Error(
          `Payment confirmation failed: ${confirmationError.message}`,
        );
      }
    }

    // Show toast for form submission
    const { useToast } = await import("vue-toastification");
    const toast = useToast();
    toast.info("Building form payload and submitting to provider...");

    // Import the buildFormPayload utility and form steps
    const { buildFormPayload } = await import(
      "~/utils/intake-form/buildFormPayload"
    );
    const { allStepsMaster } = await import("~/data/intake-form/formSteps");

    // Build the payment info object
    const paymentInfo = {
      paymentDescription: `${selectedProduct.value?.name} - ${selectedPlan.value} plan`,
      paymentAmount: selectedProduct.value?.prices[selectedPlan.value] || 0,
      promoCode: formAnswers.value?.promoCode || "",
    };

    // Build the complete form payload
    const formPayload = await buildFormPayload(
      allStepsMaster,
      formAnswers.value,
      paymentData.value.stripeSetupId!,
      paymentData.value.shippingAddress!,
      paymentInfo,
      useRuntimeConfig(),
    );

    // Show toast for API submission
    toast.info("Submitting form to provider...");

    // Submit the form to the provider via our API endpoint
    const response = await $fetch<{
      success: boolean;
      data: { caseId: string; formResponseId: string };
    }>("/api/submit-form", {
      method: "POST",
      body: formPayload,
    });

    // Show success toast
    toast.success("Form submitted successfully!");

    // Clean up temporary files after successful submission
    try {
      const fileIds = collectFileIds(formAnswers.value);
      if (fileIds.length > 0) {
        await $fetch("/api/cleanup-files", {
          method: "POST",
          body: { fileIds }
        });
      }
    } catch (cleanupError) {
      // Don't fail the entire process if cleanup fails
    }

    // Redirect to welcome page on success with reference IDs
    await navigateTo({
      path: "/welcome",
      query: {
        caseId: response.data?.caseId,
        formResponseId: response.data?.formResponseId,
      },
    });
  } catch (error: any) {
    // Reset payment state to get fresh SetupIntent for retry
    await resetPaymentState();

    // Show error toast
    const { useToast } = await import("vue-toastification");
    const toast = useToast();

    const errorMessage =
      error.message ||
      "An error occurred while submitting the form. Please try again.";
    toast.error(errorMessage);
  } finally {
    isSubmitting.value = false;
  }
};

const previousStep = () => {
  if (currentStep.value === 0) {
    // If on first step, redirect to consultation with productId
    if (process.client) {
      const route = useRoute();
      const productId = route.query.productId as string;
      const consultationUrl = productId ? `/consultation?productId=${productId}` : '/consultation';
      navigateTo(consultationUrl);
    }
  } else if (canGoBack.value) {
    currentStep.value--;
    // Scroll to top when moving to previous step
    if (process.client) {
      nextTick(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }
};

// Initialize with first product as default
onMounted(async () => {
  // Fetch CRM data if not already loaded
  if (crmStore.getProductBundles.length === 0) {
    await crmStore.fetchCRMData();
  }
  
  // Set default product based on productId from URL or first available
  const route = useRoute();
  const productId = route.query.productId as string | undefined;

  const findProductByBundleId = (bundleId: string) =>
    products.value.find((product) =>
      [
        product.productBundleIds?.monthly,
        product.productBundleIds?.threeMonthly,
        product.productBundleIds?.sixMonthly,
        product.id,
      ]
        .filter(Boolean)
        .includes(bundleId),
    );

  if (productId) {
    const product = findProductByBundleId(productId);
    selectedProduct.value = product || products.value[0] || null;
  } else {
    selectedProduct.value = products.value[0] || null;
  }
  
  validateFormCompletion();
  
  // Initialize Stripe
  await initializeStripe();
});

// Form validation function
const validateFormCompletion = async () => {
  if (!process.client) return;

  try {
    isValidating.value = true;

    const route = useRoute();
    const productIdFromRoute = route.query.productId as string | undefined;
    const product =
      selectedProduct.value || products.value[0] || null;

    const targetQuizId =
      product?.quizId || intakeFormConfig.defaultQuizId;

    const consultationProductId =
      productIdFromRoute ||
      product?.productBundleIds?.monthly ||
      product?.id;

    const completionKey = `quiz_${targetQuizId}_completed`;
    const completionDataKey = `quiz_${targetQuizId}_completed_data`;

    const isQuizCompleted = localStorage.getItem(completionKey) === "true";

    if (!isQuizCompleted) {
      const consultationUrl = consultationProductId
        ? `/consultation?productId=${consultationProductId}`
        : "/consultation";
      await navigateTo(consultationUrl);
      return;
    }

    let completedQuizData: any = null;
    const storedData = localStorage.getItem(completionDataKey);

    if (storedData) {
      try {
        completedQuizData = JSON.parse(storedData);
      } catch (parseError) {
        console.warn("Failed to parse completed quiz data:", parseError);
      }
    }

    if (completedQuizData) {
      formAnswers.value = completedQuizData;
    } else {
      const { loadFormData } = useFormPersistence(() => targetQuizId);
      const savedFormData = loadFormData();
      if (savedFormData) {
        formAnswers.value = savedFormData;
      }
    }

    isFormValid.value = true;
  } catch (error) {
    console.error("Form validation error:", error);
    const route = useRoute();
    const productId = route.query.productId as string | undefined;
    const consultationUrl = productId
      ? `/consultation?productId=${productId}`
      : "/consultation";
    await navigateTo(consultationUrl);
  } finally {
    isValidating.value = false;
  }
};

// Watch for Stripe loading state using the composable directly
const { isReady: stripeReady, initializeStripe, refreshSetupIntent } = useStripe();
watch(
  () => stripeReady.value,
  (ready) => {
    isStripeLoaded.value = ready;
  },
  { immediate: true },
);

// Watch for step changes to scroll to top
watch(
  currentStep,
  () => {
    // Scroll to top when step changes (only on client)
    if (process.client) {
      nextTick(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }
);
</script>
