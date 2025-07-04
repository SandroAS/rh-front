<script setup>
import BudgetModal from '@/components/system/budget/BudgetModal.vue'
import BudgetRightPreview from '@/components/system/budget/BudgetRightPreview.vue'
import MoneyExplosion from '@/components/system/budget/MoneyExplosion.vue'
import { ref, watch } from 'vue'

const headers = [
  { title: 'Valor', value: 'amount' },
  { title: 'Profissional', value: 'professional' },
  { title: 'Paciente', value: 'patient' },
  { title: 'Data', value: 'createdAt' },
  { title: 'Status', value: 'status' },
  { title: 'Ações', value: 'actions', sortable: false },
]

const statuses = ['ORÇADO', 'PAGO PARCIALMENTE', 'PAGO', 'CANCELADO']

const budgets = ref([
  {
    id: 1,
    amount: 250.5,
    professional: {
      name: 'João Silva',
      email: 'joao@example.com',
      avatar: null,
    },
    patient: {
      name: 'Maria Souza',
      email: 'maria@example.com',
      avatar: null,
    },
    createdAt: '2025-05-10',
    status: 'ORÇADO',
  },
  // outros itens...
])

const editingStatusId = ref(null)

const getInitials = (name) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR')
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const getStatusColor = (status) => {
  switch (status) {
    case 'ORÇADO':
      return 'blue'
    case 'PAGO PARCIALMENTE':
      return 'orange'
    case 'PAGO':
      return 'green'
    case 'CANCELADO':
      return 'red'
    default:
      return 'grey'
  }
}

const selectedBudget = ref(null)
const showDetails = ref(false)

const viewItem = (item) => {
  selectedBudget.value = item
  showDetails.value = true
}
const editItem = (item) => {
  openDialog()
}
const deleteItem = (item) => {
  console.log('Excluir', item)
}

const dialog = ref(false)

const openDialog = () => {
  dialog.value = true
}

const showExplosion = ref(false)
const previousStatuses = ref({})

// Detectar mudança de status para 'PAGO'
watch(budgets, (newVal) => {
  newVal.forEach(b => {
    const previous = previousStatuses.value[b.id]
    if (previous && previous !== b.status && b.status === 'PAGO') {
      triggerExplosion()
    }
    previousStatuses.value[b.id] = b.status
  })
}, { deep: true, immediate: true })

const triggerExplosion = () => {
  showExplosion.value = true
  setTimeout(() => showExplosion.value = false, 1000)
}

const mockItem = {
  id: 1,
  amount: 0,
  createdAt: '2024-10-01T10:00:00Z',
  status: 'ORÇADO',
  total: 1200,
  discount: 200,
  paid_cash: 300,
  payment_method: 'Cartão de Crédito',
  patient: {
    name: 'João da Silva',
    email: 'joao@exemplo.com',
    avatar: null
  },
  professional: {
    name: 'Dra. Maria Oliveira',
    email: 'maria@clinicadental.com',
    avatar: null
  },
  services: [
    {
      name: 'Limpeza',
      tooth: '12',
      face: 'Vestibular',
      price: 200,
      status: 'PENDENTE'
    },
    {
      name: 'Obturação',
      tooth: '14',
      face: 'Oclusal',
      price: 300,
      status: 'ORÇADO'
    },
    {
      name: 'Canal',
      tooth: '11',
      face: 'Palatina',
      price: 700,
      status: 'PAGO'
    }
  ]
}
</script>


<template>
  <v-container fluid>
    <div class="d-flex justify-end mb-4">
      <v-btn color="primary" @click="openDialog()">
        <v-icon start>mdi-plus</v-icon>
        Adicionar Orçamento
      </v-btn>
    </div>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="budgets"
        item-value="id"
        class="elevation-1"
        density="comfortable"
      >
        <!-- Valor -->
        <template #item.amount="{ item }">
          <span>{{ formatCurrency(item.amount) }}</span>
        </template>
  
        <!-- Profissional -->
        <template #item.professional="{ item }">
          <div class="d-flex align-center gap-3">
            <v-avatar color="primary" size="36" class="mr-2">
              <v-img v-if="item.professional.avatar" :src="item.professional.avatar" />
              <span v-else>{{ getInitials(item.professional.name) }}</span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.professional.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.professional.email }}</div>
            </div>
          </div>
        </template>
  
        <!-- Paciente -->
        <template #item.patient="{ item }">
          <div class="d-flex align-center gap-3">
            <v-avatar color="primary" size="36" class="mr-2">
              <v-img v-if="item.patient.avatar" :src="item.patient.avatar" />
              <span v-else>{{ getInitials(item.patient.name) }}</span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.patient.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.patient.email }}</div>
            </div>
          </div>
        </template>
  
        <!-- Data -->
        <template #item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>
  
        <!-- Status -->
        <template #item.status="{ item }">
          <div v-if="editingStatusId === item.id">
            <v-select
              v-model="item.status"
              :items="statuses"
              hide-details
              class="w-40"
              variant="solo-filled"
              density="compact"
              @update:modelValue="editingStatusId = null"
              @blur="editingStatusId = null"
            />
          </div>
          <div v-else @click="editingStatusId = item.id" class="cursor-pointer">
            <v-chip :color="getStatusColor(item.status)" class="text-uppercase">
              {{ item.status }}
            </v-chip>
          </div>
          <transition name="fade">
            <MoneyExplosion v-if="showExplosion" />
          </transition>
        </template>
  
        <!-- Ações -->
        <template #item.actions="{ item }">
          <v-btn icon="mdi-eye" size="small" @click="viewItem(item)" />
          <v-btn icon="mdi-pencil" size="small" @click="editItem(item)" />
          <v-btn icon="mdi-delete" size="small" color="red" @click="deleteItem(item)" />
        </template>
      </v-data-table>
    </v-card>

    <BudgetModal v-model="dialog"/>

    <BudgetRightPreview
      v-model="showDetails"
      :item="mockItem"
    />
  </v-container>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>