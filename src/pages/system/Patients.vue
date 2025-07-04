<script setup lang="ts">
import { ref } from 'vue'
import { format } from 'date-fns'

type Patient = {
  id: number
  name: string
  email: string
  phone: string
  cpf: string
  birthDate: string
  createdAt: string
}

const dialog = ref(false)
const isEdit = ref(false)
const editedPatient = ref<Patient | null>(null)

const patients = ref<Patient[]>([
  {
    id: 1,
    name: 'João da Silva',
    email: 'joao@email.com',
    phone: '(11) 99999-0000',
    cpf: '123.456.789-00',
    birthDate: '1990-05-01',
    createdAt: new Date().toISOString()
  }
])

const openDialog = (patient: Patient | null = null) => {
  isEdit.value = !!patient
  editedPatient.value = patient
    ? { ...patient }
    : {
        id: Date.now(),
        name: '',
        email: '',
        phone: '',
        cpf: '',
        birthDate: '',
        createdAt: new Date().toISOString()
      }
  dialog.value = true
}

const savePatient = () => {
  const patient = editedPatient.value!
  const index = patients.value.findIndex(p => p.id === patient.id)

  if (isEdit.value && index !== -1) {
    patients.value[index] = { ...patient }
  } else {
    patients.value.push({ ...patient })
  }

  dialog.value = false
}

const deletePatient = (id: number) => {
  patients.value = patients.value.filter(p => p.id !== id)
}
</script>

<template>
  <v-container fluid>
    <div class="d-flex justify-end mb-4">
      <v-btn color="primary" @click="openDialog()">
        <v-icon start>mdi-plus</v-icon>
        Adicionar Paciente
      </v-btn>
    </div>

    <v-card>
      <v-data-table
        :headers="[
          { title: 'Paciente', value: 'patient', sortable: false },
          { title: 'Telefone', value: 'phone' },
          { title: 'Data de Cadastro', value: 'createdAt' },
          { title: 'Ações', value: 'actions', sortable: false, align: 'end' }
        ]"
        :items="patients"
        item-value="id"
        class="elevation-1"
      >
        <template #item.patient="{ item }">
          <div class="d-flex align-center gap-3">
            <v-avatar color="primary" size="36" class="mr-2">
              {{ item.name.charAt(0).toUpperCase() }}
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.email }}</div>
            </div>
          </div>
        </template>

        <template #item.createdAt="{ item }">
          {{ format(new Date(item.createdAt), 'dd/MM/yyyy') }}
        </template>

        <template #item.actions="{ item }">
          <v-btn icon="mdi-pencil" size="small" @click="openDialog(item)" />
          <v-btn icon="mdi-folder-account" size="small" color="indigo" @click="$router.push({ name: 'patientRecord', params: { id: item.id } })" />
          <v-btn icon="mdi-delete" size="small" color="red" @click="deletePatient(item.id)" />
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title class="text-h6">
          {{ isEdit ? 'Editar Paciente' : 'Novo Paciente' }}
        </v-card-title>
        <v-card-text v-if="editedPatient">
          <v-text-field
            v-model="editedPatient.name"
            label="Nome"
            required
            variant="solo-filled"
            density="comfortable"
          />
          <v-text-field
            v-model="editedPatient.email"
            label="Email"
            type="email"
            variant="solo-filled"
            density="comfortable"
          />
          <v-text-field
            v-model="editedPatient.phone"
            label="Telefone"
            variant="solo-filled"
            density="comfortable"
          />
          <v-text-field
            v-model="editedPatient.cpf"
            label="CPF"
            variant="solo-filled"
            density="comfortable"
          />
          <v-text-field
            v-model="editedPatient.birthDate"
            label="Data de Nascimento"
            type="date"
            variant="solo-filled"
            density="comfortable"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="savePatient">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
