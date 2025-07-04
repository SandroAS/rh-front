<script setup lang="ts">
interface BudgetItem {
  id: number
  amount: number
  professional: {
    name: string
    email: string
    avatar: string | null
  }
  patient: {
    name: string
    email: string
    avatar: string | null
  }
  createdAt: string
  status: string
  services?: Array<{
    name: string
    tooth: string
    face: string
    price: number
    status: string
  }>
  total?: number
  discount?: number
  paid_cash?: number
  payment_method?: string
}

defineProps({
  modelValue: Boolean,
  item: {
    type: Object as () => BudgetItem,
    required: true,
  },
})

defineEmits(['update:modelValue'])

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ORÇADO': return 'blue'
    case 'PAGO PARCIALMENTE': return 'orange'
    case 'PAGO': return 'green'
    case 'CANCELADO': return 'red'
    case 'PENDENTE': return 'grey'
    case 'PRESTADO': return 'indigo'
    default: return 'secondary'
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR')
}

const sendToWhatsApp = () => {
  // Aqui você pode gerar uma mensagem com os dados do orçamento
  console.log('Enviar orçamento via WhatsApp')
}

const scheduleServices = () => {
  console.log('Agendar serviços')
}

const startAppointment = () => {
  console.log('Iniciar atendimento')
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    width="500"
    persistent
    scrollable
    content-class="dialog-right"
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <div>
          <div class="d-flex align-center">
            <div class="text-h6 mr-1">Orçamento</div>
            <!-- Data -->
            <div class="text-caption text-medium-emphasis mt-2">
              - Criado em: <strong>{{ formatDate(item.createdAt) }}</strong>
            </div>
          </div>
        </div>
        <v-btn icon @click="$emit('update:modelValue', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="d-flex flex-column justify-space-between gap-4 pb-0">
        <div>
          <div class="mb-4 d-flex align-end justify-space-between">
            <div class="mr-1">Status:</div>
            <v-divider />
            <div>
              <v-chip :color="getStatusColor(item.status)" class="mt-1 text-uppercase">{{ item.status }}</v-chip>
            </div>
          </div>
          <!-- Paciente e Profissional -->
          <div class="d-flex justify-space-between">
            <div class="text-caption">Paciente</div>
            <div class="text-caption">Profissional da Saúde</div>
          </div>
          <div class="mb-4 d-flex justify-space-between gap-3">
            <!-- Paciente -->
            <div class="d-flex align-center gap-3">
              <v-avatar color="primary" size="36">
                <v-img v-if="item.patient.avatar" :src="item.patient.avatar" />
                <span v-else>{{ getInitials(item.patient.name) }}</span>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.patient.name }}</div>
                <div class="text-caption text-medium-emphasis">{{ item.patient.email }}</div>
              </div>
            </div>
  
            <!-- Profissional -->
            <div class="d-flex align-center gap-3">
              <v-avatar color="primary" size="36">
                <v-img v-if="item.professional.avatar" :src="item.professional.avatar" />
                <span v-else>{{ getInitials(item.professional.name) }}</span>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.professional.name }}</div>
                <div class="text-caption text-medium-emphasis">{{ item.professional.email }}</div>
              </div>
            </div>
          </div>
  
          <!-- Serviços orçados -->
          <div class="mb-4">
            <div class="text-subtitle-1 font-weight-medium mb-2">Serviços orçados</div>
            <v-list density="compact" class="px-1">
              <v-list-item v-for="(service, index) in item.services" :key="index" class="elevation-1 rounded mb-1">
                <div class="d-flex justify-space-between">
                  <div>
                    {{ service.name }}
                    <span class="text-caption"> | Dente: {{ service.tooth }} | Face: {{ service.face }}</span>
                  </div>
                  <div class="text-end">
                    <div class="text-caption">{{ formatCurrency(service.price) }}</div>
                    <v-chip size="x-small" :color="getStatusColor(service.status)">
                      {{ service.status }}
                    </v-chip>
                  </div>
                </div>
              </v-list-item>
            </v-list>
          </div>
        </div>

        <div class="d-flex justify-space-between">
          <div class="text-left w-100 d-flex flex-column">
            <div v-if="item.paid_cash ?? 0 > 0">
              <div class="text-caption">Pago em dinheiro:</div>
              <div class="text-body-2">{{ formatCurrency(item.paid_cash ?? 0) }}</div>
            </div>
  
            <div v-if="item.payment_method" class="mt-2">
              <div class="text-caption">Forma de pagamento:</div>
              <div class="text-body-2">{{ item.payment_method }}</div>
            </div>
          </div>
          
          <v-divider vertical class="mx-2" />

          <!-- Totais -->
          <div class="text-right w-100 d-flex flex-column justify-space-between">
            <div>
              <div class="d-flex align-end justify-space-between mb-1">
                <div class="text-caption" style="line-height: 1;">Subtotal:</div>
                <v-divider style="width: 100%" class="mx-1"/>
                <div class="text-subtitle-2" style="line-height: 1;">{{ formatCurrency(item.total ?? 0) }}</div>
              </div>
    
              <div v-if="item.discount ?? 0 > 0" class="d-flex align-end justify-space-between">
                <div class="text-caption" style="line-height: 1;">Desconto:</div>
                <v-divider style="width: 100%" class="mx-1"/>
                <div class="text-subtitle-2 text-error d-flex" style="line-height: 1;">
                  <div>-</div><div>{{ formatCurrency(item.discount ?? 0) }}</div>
                </div>
              </div>
            </div>

            <div class="d-flex align-end justify-space-between mb-1">
              <div class="text-caption mt-2" style="line-height: 1;">Total:</div>
              <v-divider style="width: 100%" class="mx-1"/>
              <div class="text-subtitle-1 font-weight-bold" style="line-height: 1;">
                {{ formatCurrency((item.total ?? 0) - (item.discount ?? 0)) }}
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
      <div class="px-6 pb-6">
        <!-- Ações -->
        <v-divider class="mb-4 mt-0" />
        <div class="d-flex flex-column gap-2">
          <v-btn color="success" block @click="sendToWhatsApp">
            <v-icon start>mdi-whatsapp</v-icon> Enviar orçamento via WhatsApp
          </v-btn>
          <v-btn color="blue" block @click="scheduleServices">
            <v-icon start>mdi-calendar-clock</v-icon> Agendar serviços
          </v-btn>
          <v-btn color="blue-darken-3" block @click="startAppointment">
            <v-icon start>mdi-account-heart</v-icon> Iniciar atendimento
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<style>
.dialog-right {
  position: fixed !important;
  top: 0;
  right: 0;
  height: 100vh;
  max-height: 100vh;
  border-radius: 0;
  overflow-y: auto;
}
</style>
