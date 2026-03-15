<script setup lang="ts">
import { ref, computed } from 'vue';
import { Field } from '@/plugins/vee-validate';
import {
  getCardBrand,
  formatCardNumberDisplay,
  formatExpiryDisplay,
  type CardBrand,
} from '@/utils/cardBrand.util';

const cardNumberDisplay = ref('');
const cardHolderDisplay = ref('');
const expiryDisplay = ref('');
const cvvDisplay = ref('');
const cvvFocused = ref(false);

const cardBrand = computed<CardBrand>(() => getCardBrand(cardNumberDisplay.value));
const cardNumberFormatted = computed(() => formatCardNumberDisplay(cardNumberDisplay.value));
const expiryFormatted = computed(() => formatExpiryDisplay(expiryDisplay.value));

const brandLabel = computed(() => {
  const labels: Record<NonNullable<CardBrand>, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'Amex',
    elo: 'Elo',
    hipercard: 'Hipercard',
  };
  return cardBrand.value ? labels[cardBrand.value] : '';
});

const isAmex = computed(() => cardBrand.value === 'amex');
const cvvLength = computed(() => (isAmex.value ? 4 : 3));
</script>

<template>
  <div class="credit-card-form">
    <!-- Cartão visual (preview) -->
    <div class="card-preview-wrapper">
      <div class="card-scene">
        <div class="card-inner" :class="{ flipped: cvvFocused }">
          <!-- Frente do cartão -->
          <div class="card-face card-front">
            <div class="card-front-inner">
              <div class="card-chip" />
              <div class="card-brand-badge">
                <span v-if="brandLabel" class="brand-text">{{ brandLabel }}</span>
                <span v-else class="brand-placeholder">••••</span>
              </div>
              <div class="card-number">
                {{ cardNumberFormatted || '•••• •••• •••• ••••' }}
              </div>
              <div class="card-bottom-row">
                <div class="card-holder-block">
                  <span class="card-label">Nome no cartão</span>
                  <span class="card-holder">{{ cardHolderDisplay || 'NOME COMO NO CARTÃO' }}</span>
                </div>
                <div class="card-expiry-block">
                  <span class="card-label">Validade</span>
                  <span class="card-expiry">{{ expiryFormatted || 'MM/AA' }}</span>
                </div>
              </div>
            </div>
          </div>
          <!-- Verso do cartão -->
          <div class="card-face card-back">
            <div class="card-back-inner">
              <div class="card-magnetic-strip" />
              <div class="card-cvv-row">
                <span class="card-cvv-label">CVV</span>
                <span class="card-cvv-value">{{ cvvDisplay ? '•'.repeat(cvvDisplay.length) : '•••' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Campos do formulário -->
    <v-row dense class="mt-4">
      <v-col cols="12">
        <Field
          name="card_number"
          rules="required"
          v-slot="{ field, errorMessage }"
        >
          <v-text-field
            :model-value="field.value"
            @update:model-value="(v: string) => { const digits = (v ?? '').replace(/\D/g, ''); field.onChange(digits); cardNumberDisplay = digits; }"
            @blur="field.onBlur"
            label="Número do cartão"
            placeholder="0000 0000 0000 0000"
            variant="solo-filled"
            density="comfortable"
            :error="!!errorMessage"
            :error-messages="errorMessage"
            hide-details="auto"
            :maxlength="isAmex ? 17 : 19"
          />
        </Field>
      </v-col>
      <v-col cols="12">
        <Field
          name="card_holder"
          rules="required|alpha_spaces|min:3"
          v-slot="{ field, errorMessage }"
        >
          <v-text-field
            :model-value="field.value"
            @update:model-value="(v: string) => { field.onChange(v); cardHolderDisplay = (v ?? '').toUpperCase(); }"
            @blur="field.onBlur"
            label="Nome impresso no cartão"
            placeholder="NOME COMO NO CARTÃO"
            variant="solo-filled"
            density="comfortable"
            :error="!!errorMessage"
            :error-messages="errorMessage"
            hide-details="auto"
          />
        </Field>
      </v-col>
      <v-col cols="6">
        <Field
          name="card_expiry"
          rules="required|length:5"
          v-slot="{ field, errorMessage }"
        >
          <v-text-field
            :model-value="field.value"
            @update:model-value="(v: string) => { field.onChange(v); expiryDisplay = v ?? ''; }"
            @blur="field.onBlur"
            label="Validade"
            placeholder="MM/AA"
            v-mask="'##/##'"
            variant="solo-filled"
            density="comfortable"
            :error="!!errorMessage"
            :error-messages="errorMessage"
            hide-details="auto"
            maxlength="5"
          />
        </Field>
      </v-col>
      <v-col cols="6">
        <Field
          name="card_cvv"
          :rules="`required|length:${cvvLength}|numeric`"
          v-slot="{ field, errorMessage }"
        >
          <v-text-field
            :model-value="field.value"
            @update:model-value="(v: string) => { field.onChange(v); cvvDisplay = v ?? ''; }"
            @focus="cvvFocused = true"
            @blur="(e: FocusEvent) => { field.onBlur(e); cvvFocused = false; }"
            label="CVV"
            :placeholder="isAmex ? '4 dígitos' : '3 dígitos'"
            variant="solo-filled"
            density="comfortable"
            :error="!!errorMessage"
            :error-messages="errorMessage"
            hide-details="auto"
            :maxlength="cvvLength"
            type="password"
            autocomplete="off"
          />
        </Field>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.credit-card-form {
  margin-bottom: 1.5rem;
}

.card-preview-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.card-scene {
  width: 100%;
  max-width: 360px;
  aspect-ratio: 1.586;
  perspective: 1200px;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.65s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.card-inner.flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 14px;
  backface-visibility: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-front {
  background: linear-gradient(135deg, #1a1f36 0%, #252d4a 50%, #2d3658 100%);
  transform: rotateY(0deg);
}

.card-back {
  background: linear-gradient(135deg, #252d4a 0%, #1a1f36 100%);
  transform: rotateY(180deg);
}

.card-front-inner,
.card-back-inner {
  padding: 1.25rem 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  color: rgba(255, 255, 255, 0.95);
  font-family: 'JetBrains Mono', 'SF Mono', 'Consolas', monospace;
}

.card-chip {
  width: 42px;
  height: 32px;
  border-radius: 6px;
  background: linear-gradient(135deg, #c9b896 0%, #e8dcc8 50%, #b5a574 100%);
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.4), 0 1px 1px rgba(0, 0, 0, 0.2);
  margin-bottom: 1.25rem;
}

.card-brand-badge {
  position: absolute;
  top: 1.25rem;
  right: 1.5rem;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  opacity: 0.9;
}

.brand-placeholder {
  opacity: 0.5;
}

.card-number {
  font-size: 1.1rem;
  letter-spacing: 0.2em;
  margin-bottom: 1.25rem;
  word-spacing: 0.2em;
  min-height: 1.4em;
}

.card-bottom-row {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
}

.card-holder-block,
.card-expiry-block {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.card-holder-block {
  flex: 1;
  min-width: 0;
}

.card-expiry-block {
  flex-shrink: 0;
}

.card-label {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.7;
}

.card-holder {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
}

.card-expiry {
  font-size: 0.85rem;
  letter-spacing: 0.1em;
}

/* Verso */
.card-magnetic-strip {
  height: 42px;
  background: rgba(0, 0, 0, 0.7);
  margin: 1.25rem -1.5rem 1rem;
}

.card-cvv-row {
  background: rgba(255, 255, 255, 0.12);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  align-self: flex-start;
}

.card-cvv-label {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.8;
  display: block;
  margin-bottom: 0.2rem;
}

.card-cvv-value {
  font-size: 1rem;
  letter-spacing: 0.15em;
}
</style>
