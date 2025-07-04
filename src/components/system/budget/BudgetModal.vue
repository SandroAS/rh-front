<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import TeethFaces from '@/components/system/patient/odontograma/TeethFaces.vue'

type Face = 'esquerda' | 'direita' | 'superior' | 'inferior' | 'frontal'

interface SelectedTooth {
  tooth: string | null
  face: Face | null
}

interface Annotation {
  tooth: number
  face: Face
  color: string
  category: string
  note: string
  createdAt: Date
}

interface Form {
  patient: any
  professional: any
  service: any
  tooth: any
  paymentMethod: string | null
  installments: string | null
  services: Array<any>
}

defineProps({
  modelValue: Boolean,
})

const emit = defineEmits(['update:modelValue'])

const close = () => emit('update:modelValue', false)

const form = reactive<Form>({
  patient: null,
  professional: null,
  service: null,
  tooth: null,
  paymentMethod: null,
  installments: null,
  services: []
})

const availablePatients = ref([
  { id: 1, name: 'Maria Souza' },
  { id: 2, name: 'Carlos Oliveira' },
])

const availableProfessionals = ref([
  { id: 1, name: 'João Silva' },
  { id: 2, name: 'Ana Beatriz' },
])

const availableServices = ref([
  { id: 1, name: 'Limpeza', price: 100 },
  { id: 2, name: 'Extração', price: 300 },
  { id: 3, name: 'Canal', price: 500 },
])

const teethsTop = ['18','17','16','15','14','13','12','11','21','22','23','24','25','26','27','28']
const teethsBottom = ['48','47','46','45','44','43','42','41','31','32','33','34','35','36','37','38']

const selectedFaces = reactive<Record<string, Record<string, boolean>>>({})

const selectedTooth = reactive<SelectedTooth>({
  tooth: null,
  face: null,
})

const paymentMethods = ['Dinheiro', 'Cartão de Débito', 'Cartão de Crédito', 'Pix']

const installmentOptions = Array.from({ length: 12 }, (_, i) => `${i + 1}x`)

const addService = () => {
  if (!form.service) return

  const selectedService = availableServices.value.find(s => s.id === form.service)
  if (!selectedService) return

  form.services.push({
    ...selectedService,
    tooth: form.tooth, // pode ser null
  })

  form.service = null
  form.tooth = null
}

const removeService = (index: any) => {
  form.services.splice(index, 1)
}

const totalSemDesconto = computed(() =>
  form.services.reduce((sum, item) => sum + item.price, 0)
)

const totalComDesconto = computed(() => {
  const total = totalSemDesconto.value
  const tipo = discountType.value
  const valor = parseFloat(discountValue.value || '0') / 100

  if (tipo === 'FIXO') {
    return Math.max(total - valor, 0)
  }

  if (tipo === 'PORCENTAGEM') {
    return Math.max(total - total * (valor / 100), 0)
  }

  return total
})

watch(() => form.paymentMethod, (val) => {
  if (val !== 'Cartão de Crédito') {
    form.installments = null
  }
})

const save = () => {
  // lógica de envio
  console.log('Orçamento salvo', form)
  close()
}

const annotations = ref<Annotation[]>([
  {
    tooth: 11,
    face: 'frontal',
    category: 'Cárie',
    note: 'Presença de cárie visível',
    color: 'red',
    createdAt: new Date()
  },
  {
    tooth: 12,
    face: 'frontal',
    category: 'Cárie',
    note: 'Presença de cárie visível',
    color: 'red',
    createdAt: new Date()
  }
])

function getToothStyle(tooth: string) {
  const isSelected = selectedTooth.tooth === tooth && !selectedTooth.face
  if (isSelected) return { backgroundColor: '#BBDEFB' }

  const hasAnnotation = annotations.value.some(a => a.tooth === Number(tooth) && !a.face)
  if (hasAnnotation) {
    const firstAnnotation = annotations.value.find(a => a.tooth === Number(tooth) && !a.face)
    return { backgroundColor: firstAnnotation?.color || 'transparent' }
  }

  return { backgroundColor: 'white' }
}

function toggleFace(tooth: string, face: Face) {
  selectedTooth.tooth = tooth
  selectedTooth.face = face
  selectedFaces[tooth] = { [face]: true }
}

const toothImages = import.meta.glob('@/assets/images/teeths/*.png', { eager: true, import: 'default' })

function getToothImage(tooth: string): string {
  return toothImages[`/src/assets/images/teeths/${tooth}.png`] as string
}

function selectTooth(tooth: string) {
  selectedTooth.tooth = tooth
  selectedTooth.face = null
}

function getTechnicalToothFaceName(code: string, face: Face): string {
  if (!code || !face) return ''

  const tooth = parseInt(code)

  const leftSide = new Set([18, 17, 16, 15, 14, 13, 12, 11, 48, 47, 46, 45, 44, 43, 42, 41])
  const rightSide = new Set([21, 22, 23, 24, 25, 26, 27, 28, 31, 32, 33, 34, 35, 36, 37, 38])
  const topSide = new Set([18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28])
  const bottomSide = new Set([48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38])
  const oclusal = new Set([18, 17, 16, 15, 14, 24, 25, 26, 27, 28, 48, 47, 46, 45, 44, 34, 35, 36, 37, 38])
  const incisal = new Set([13, 12, 11, 21, 22, 23, 43, 42, 41, 31, 32, 33])

  const faceMap: Record<Face, () => string> = {
    esquerda: () => leftSide.has(tooth) ? 'distal' : rightSide.has(tooth) ? 'mesial' : '',
    direita: () => leftSide.has(tooth) ? 'mesial' : rightSide.has(tooth) ? 'distal' : '',
    superior: () => topSide.has(tooth) ? 'palatal' : bottomSide.has(tooth) ? 'lingual' : '',
    inferior: () => 'vestibular',
    frontal: () => oclusal.has(tooth) ? 'oclusal' : incisal.has(tooth) ? 'incisal' : ''
  }

  return faceMap[face]?.() ?? ''
}

const partialCashPayment = ref(false)
const partialCashAmount = ref('')

const discountType = ref<'Tem desconto?' | 'FIXO' | 'PORCENTAGEM'>('Tem desconto?')
const discountValue = ref('')

const displayAmount = computed({
  get: () => {
    const number = parseInt(partialCashAmount.value || '0')
    const value = number / 100
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  },
  set: (val: string) => {
    // ignorado, pois só alteramos via teclado
  },
})

const displayDiscount = computed({
  get: () => {
    const number = parseInt(discountValue.value || '0')
    const value = number / 100
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  },
  set: (val: string) => {
    // ignorado, pois só alteramos via teclado
  },
})

function handleCurrencyKeydown(e: KeyboardEvent) {
  const key = e.key

  // Remover último caractere (backspace)
  if (key === 'Backspace') {
    partialCashAmount.value = partialCashAmount.value.slice(0, -1)
    return
  }

  // Aceitar apenas números
  if (!/^\d$/.test(key)) return

  partialCashAmount.value += key
}

function handleCurrencyKeydownDiscount(e: KeyboardEvent) {
  const key = e.key

  // Remover último caractere (backspace)
  if (key === 'Backspace') {
    discountValue.value = discountValue.value.slice(0, -1)
    return
  }

  // Aceitar apenas números
  if (!/^\d$/.test(key)) return

  discountValue.value += key
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="1155"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title>
        <span class="text-h6">Criar Orçamento</span>
      </v-card-title>

      <v-card-text>
        <v-row dense>
          <v-col cols="12" sm="6">
            <v-select
              label="Paciente"
              :items="availablePatients"
              item-title="name"
              item-value="id"
              v-model="form.patient"
              return-object
              variant="solo-filled"
              density="comfortable"
            />
          </v-col>

          <v-col cols="12" sm="6">
            <v-select
              label="Profissional"
              :items="availableProfessionals"
              item-title="name"
              item-value="id"
              v-model="form.professional"
              return-object
              variant="solo-filled"
              density="comfortable"
            />
          </v-col>

          <v-col cols="12">
            <div class="d-flex flex-wrap flex-md-nowrap justify-space-between">
              <div class="odontograma-wrapper">
                <div class="d-flex flex-column ga-6 mx-4">
                  <!-- LINHA SUPERIOR -->
                  <div class="d-flex ga-2">
                    <div
                      v-for="tooth in teethsTop"
                      :key="tooth"
                      class="d-flex flex-column align-center"
                    >
                      <img
                        class="tooth-image elevation-5 rounded-lg my-2"
                        :style="getToothStyle(tooth)"
                        :src="getToothImage(tooth)"
                        :alt="`Dente ${tooth}`"
                        @click="selectTooth(tooth)"
                      />
                      <TeethFaces
                        :selectedFaces="selectedFaces[tooth] || {}"
                        :tooth="tooth"
                        :selectedTooth="selectedTooth"
                        :annotations="annotations"
                        @face-clicked="(face: any) => toggleFace(tooth, face)"
                      />
                      <span class="text-caption mt-1">{{ tooth }}</span>
                    </div>
                  </div>
            
                  <!-- LINHA INFERIOR -->
                  <div class="d-flex ga-2">
                    <div
                      v-for="tooth in teethsBottom"
                      :key="tooth"
                      class="d-flex flex-column align-center"
                    >
                      <span class="text-caption mb-1">{{ tooth }}</span>
                      <TeethFaces
                        :selectedFaces="selectedFaces[tooth] || {}"
                        :tooth="tooth"
                        :selectedTooth="selectedTooth"
                        :annotations="annotations"
                        @face-clicked="(face: any) => toggleFace(tooth, face)"
                      />
                      <img
                        class="tooth-image elevation-5 rounded-lg my-2"
                        :style="getToothStyle(tooth)"
                        :src="getToothImage(tooth)"
                        :alt="`Dente ${tooth}`"
                        @click="selectTooth(tooth)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <v-card class="ml-md-4 mt-4 mt-md-0 pa-4 mr-md-2 d-flex flex-column justify-space-between w-100 w-md-auto annotation-form">
                <div>
                  <h3 class="text-h6 mb-4">
                    Serviço em:
                    <template v-if="selectedTooth.tooth">
                      {{ selectedTooth.tooth }}
                      <span v-if="selectedTooth.face">
                        ({{ getTechnicalToothFaceName(selectedTooth.tooth, selectedTooth.face) }})
                      </span>
                    </template>
                  </h3>
                  <div>
                    <v-select
                      label="Serviço"
                      :items="availableServices"
                      item-title="name"
                      item-value="id"
                      v-model="form.service"
                      variant="solo-filled"
                      density="comfortable"
                    />
                  </div>
                </div>
                <div>
                  <v-btn color="primary" @click="addService" block>
                    <v-icon start>mdi-plus</v-icon> Adicionar Serviço
                  </v-btn>
                </div>
              </v-card>
            </div>
          </v-col>

          <v-col cols="12">
            <v-data-table
              :headers="[
                { title: 'Serviço', value: 'name' },
                { title: 'Dente', value: 'tooth' },
                { title: 'Valor', value: 'price' },
                { title: 'Ação', value: 'actions', sortable: false, align: 'end' },
              ]"
              :items="form.services"
              density="compact"
              class="my-3 pa-2 rounded elevation-1"
              hide-default-footer
            >
              <!-- Coluna: Nome -->
              <template #item.name="{ item }">
                {{ item.name }}
              </template>

              <!-- Coluna: Dente -->
              <template #item.tooth="{ item }">
                {{ item.tooth?.number ? `${item.tooth.number}${item.tooth.face ? ' - ' + item.tooth.face : ''}` : 'Todos' }}
              </template>

              <!-- Coluna: Preço -->
              <template #item.price="{ item }">
                {{ item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
              </template>

              <!-- Coluna: Ações -->
              <template #item.actions="{ index }">
                <v-btn icon size="small" color="red" @click="removeService(index)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-col>
        </v-row>

        <v-row dense>
          <v-col cols="12" sm="6">
            <v-select
              label="Forma de Pagamento"
              :items="paymentMethods"
              v-model="form.paymentMethod"
              variant="solo-filled"
              density="comfortable"
            />
          </v-col>
          <v-col cols="12" sm="6" v-if="form.paymentMethod === 'Cartão de Crédito'">
            <v-select
              label="Parcelas"
              :items="installmentOptions"
              v-model="form.installments"
              variant="solo-filled"
              density="comfortable"
            />
          </v-col>
        </v-row>
        <!-- Se não for dinheiro -->
        <v-row dense v-if="form.paymentMethod !== 'Dinheiro'">
          <!-- Checkbox: pagou parte em dinheiro -->
          <v-col cols="12" sm="6">
            <v-checkbox
              v-model="partialCashPayment"
              label="Pagou uma parte em dinheiro?"
              class="mb-2"
            />
          </v-col>
          <!-- Valor pago em dinheiro -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-if="partialCashPayment"
              v-model="displayAmount"
              label="Valor pago em dinheiro"
              class="mb-4"
              variant="solo-filled"
              density="comfortable"
              @keydown.prevent="handleCurrencyKeydown"
            />
          </v-col>
        </v-row>
        <v-row dense>
          <v-col cols="12" sm="6">
            <!-- Tipo de desconto -->
            <v-select
              v-model="discountType"
              :items="['Tem desconto?', 'FIXO', 'PORCENTAGEM']"
              label="Tipo de desconto"
              class="mb-4"
              variant="solo-filled"
              density="comfortable"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <!-- Valor do desconto -->
            <v-text-field
              v-if="discountType === 'FIXO'"
              v-model="displayDiscount"
              label="Desconto (valor fixo)"
              class="mb-4"
              variant="solo-filled"
              density="comfortable"
              @keydown.prevent="handleCurrencyKeydownDiscount"
            />
  
            <v-text-field
              v-else-if="discountType === 'PORCENTAGEM'"
              v-model="discountValue"
              label="Desconto (%)"
              suffix="%"
              type="number"
              class="mb-4"
              variant="solo-filled"
              density="comfortable"
            />
          </v-col>
        </v-row>
        <v-row justify="end" class="mt-4">
          <v-col cols="12" md="4" class="text-right">
            <div class="d-flex justify-end">
              <div class="text-caption text-grey-darken-1 mr-2">Total sem desconto:</div>
              <div class="text-body-2 mb-1">
                {{ totalSemDesconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
              </div>
            </div>

            <div class="d-flex justify-end">
              <div class="text-caption text-grey-darken-1 mr-2">Desconto aplicado:</div>
              <div class="text-body-2 mb-2">
                <span v-if="discountType === 'FIXO'">
                  {{ (parseFloat(discountValue || '0')/100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                </span>
                <span v-else-if="discountType === 'PORCENTAGEM'">
                  {{ discountValue || 0 }}%
                </span>
                <span v-else>
                  Nenhum
                </span>
              </div>
            </div>

            <div class="font-weight-bold text-h6">
              Total com desconto:
              {{ totalComDesconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
            </div>
          </v-col>
        </v-row>

      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="close">Cancelar</v-btn>
        <v-btn color="primary" @click="save">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
@media (max-width: 1447px) {
  .odontograma-wrapper {
    overflow-x: auto;
  }
}
@media (max-width: 959px) {
  .annotation-form {
    max-width: 100% !important;
    min-width: 100% !important;
  }
}
@media (min-width: 1450px) {
  .annotation-form {
    max-width: 100% !important;
  }
}

.odontograma-wrapper {
  max-width: 100%;
}
.annotation-form {
  max-width: 285px;
  min-width: 285px;
}

.odontograma {
  min-width: 900px;
}

.tooth-image {
  cursor: pointer;
  transition: transform 0.2s;
}

.tooth-image:hover {
  transform: scale(1.05);
}
</style>