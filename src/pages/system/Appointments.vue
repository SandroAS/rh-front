<script setup lang="ts">
import AppointmentModal from '@/components/system/appointment/AppointmentModal.vue'
import { ref } from 'vue'

interface Person {
  name: string
  email: string
  avatar: string | null
}

interface Appointment {
  id: number
  patient: Person
  professional: Person
  datetime: string
  duration: number // em minutos
}

// Mock de atendimentos
const appointments: Appointment[] = [
  {
    id: 1,
    patient: { name: 'João da Silva', email: 'joao@email.com', avatar: null },
    professional: { name: 'Dra. Ana Souza', email: 'ana@clinica.com', avatar: null },
    datetime: '2025-05-17T14:00:00',
    duration: 45,
  },
  {
    id: 2,
    patient: { name: 'Maria Oliveira', email: 'maria@email.com', avatar: null },
    professional: { name: 'Dr. Carlos Mendes', email: 'carlos@clinica.com', avatar: null },
    datetime: '2025-05-17T15:30:00',
    duration: 30,
  },
]

const dialog = ref(false)

const openDialog = () => {
  dialog.value = true
}

const editAppointment = (appointment: Appointment) => {
  openDialog()
}

const deleteAppointment = (id: number) => {
  console.log('Deletar', id)
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const formatDateTime = (date: string) => {
  const d = new Date(date)
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <v-container fluid>
    <!-- Botão para adicionar atendimento -->
    <div class="d-flex justify-end mb-4">
      <v-btn color="primary" @click="openDialog()">
        <v-icon start>mdi-plus</v-icon>
        Adicionar Atendimento
      </v-btn>
    </div>

    <!-- Tabela de atendimentos -->
    <v-card>
      <v-data-table
        :headers="[
          { title: 'Paciente', value: 'patient' },
          { title: 'Profissional', value: 'professional' },
          { title: 'Data e hora', value: 'datetime' },
          { title: 'Ações', value: 'actions', sortable: false, align: 'end' }
        ]"
        :items="appointments"
        item-value="id"
        class="elevation-1"
      >
        <template #item.patient="{ item }">
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
        </template>

        <template #item.professional="{ item }">
          <div class="d-flex align-center gap-3">
            <v-avatar color="secondary" size="36">
              <v-img v-if="item.professional.avatar" :src="item.professional.avatar" />
              <span v-else>{{ getInitials(item.professional.name) }}</span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.professional.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.professional.email }}</div>
            </div>
          </div>
        </template>

        <template #item.datetime="{ item }">
          <div>
            <div class="font-weight-medium">{{ formatDateTime(item.datetime) }}</div>
            <div class="text-caption text-medium-emphasis">Duração: {{ item.duration }} min</div>
          </div>
        </template>

        <template #item.actions="{ item }">
          <v-btn icon @click="editAppointment(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon color="red" @click="deleteAppointment(item.id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <AppointmentModal v-model="dialog"/>
  </v-container>
</template>
