<script setup lang="ts">
import { ref, computed, watch } from 'vue'

defineProps({
  modelValue: Boolean,
})

const emit = defineEmits(['update:modelValue'])

const close = () => {
  resetForm()
  emit('update:modelValue', false)
}

// Props ou states externos
const editing = ref(false)
const formRef = ref()

// Mock de dados — substitua por dados reais da API
const patients = [
  { id: 1, name: 'João da Silva' },
  { id: 2, name: 'Maria Oliveira' },
]

const professionals = [
  { id: 1, name: 'Dra. Ana Souza' },
  { id: 2, name: 'Dr. Carlos Mendes' },
]

const budgets = [
  { id: 1, name: 'Orçamento 001' },
  { id: 2, name: 'Orçamento 002' },
]

const allBudgetServices = [
  { id: 1, name: 'Limpeza', budgetId: 1, status: 'pendente' },
  { id: 2, name: 'Extração', budgetId: 1, status: 'concluido' },
  { id: 3, name: 'Consulta', budgetId: 2, status: 'pendente' },
]

// Formulário
const form = ref({
  patientId: null,
  professionalId: null,
  services: [],
  datetime: '',
  duration: null,
  notes: '',
  budgetId: null,
  selectedBudgetServices: [],
  budgetMode: 'existing'
})

const loading = ref(false)

const resetForm = () => {
  form.value = {
    patientId: null,
    professionalId: null,
    services: [],
    datetime: '',
    duration: null,
    notes: '',
    budgetId: null,
    selectedBudgetServices: [],
    budgetMode: 'existing'
  }
  editing.value = false
}

const onBudgetSelect = (budgetId: number | null) => {
  form.value.selectedBudgetServices = []
}

const filteredBudgetServices = computed(() => {
  return allBudgetServices.filter(
    s => s.budgetId === form.value.budgetId && s.status === 'pendente'
  )
})

const submitForm = () => {
  if (!formRef.value?.validate()) return

  if (editing.value) {
    console.log('Salvando atendimento editado:', form.value)
  } else {
    console.log('Criando novo atendimento:', form.value)
  }

  close()
}
</script>


<template>
  <v-dialog :model-value="modelValue" max-width="800px" @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-card-title>
        <span class="text-h6">{{ editing ? 'Editar Atendimento' : 'Novo Atendimento' }}</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="formRef" @submit.prevent="submitForm">
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-autocomplete
                v-model="form.patientId"
                label="Paciente"
                :items="patients"
                item-title="name"
                item-value="id"
                :disabled="loading"
                required
                variant="solo-filled"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="form.professionalId"
                :items="professionals"
                item-title="name"
                item-value="id"
                label="Profissional de Saúde"
                :disabled="loading"
                required
                variant="solo-filled"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12">
              <v-radio-group
                v-model="form.budgetMode"
                inline
                label="Origem dos serviços"
              >
                <v-radio
                  label="Selecionar serviço(s) de um orçamento existente"
                  value="existing"
                />
                <v-radio
                  label="Criar orçamento a partir dos serviços selecionados"
                  value="new"
                />
              </v-radio-group>
            </v-col>

            <template v-if="form.budgetMode === 'existing'">
              <v-col cols="12" sm="6">
                <v-autocomplete
                  v-model="form.budgetId"
                  :items="budgets"
                  item-title="name"
                  item-value="id"
                  label="Orçamento (opcional)"
                  variant="solo-filled"
                  density="comfortable"
                  @update:modelValue="onBudgetSelect"
                />
              </v-col>
  
              <v-col cols="12" sm="6">
                <v-select
                  v-model="form.selectedBudgetServices"
                  :items="filteredBudgetServices"
                  item-title="name"
                  item-value="id"
                  label="Serviços do orçamento"
                  multiple
                  :disabled="!form.budgetId"
                  variant="solo-filled"
                  density="comfortable"
                />
              </v-col>
            </template>

            <!-- Componente de serviços que você já possui -->
            <template v-else>
              <v-col cols="12">
                Serviços
                <!-- <ServicosForm v-model="form.services" /> -->
              </v-col>
            </template>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.datetime"
                label="Data e hora"
                type="datetime-local"
                required
                variant="solo-filled"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.duration"
                label="Duração (minutos)"
                type="number"
                min="1"
                required
                variant="solo-filled"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.notes"
                label="Anotações"
                rows="2"
                auto-grow
                variant="solo-filled"
                density="comfortable"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn text @click="close">Cancelar</v-btn>
        <v-btn color="primary" @click="submitForm">{{ editing ? 'Salvar' : 'Criar' }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
