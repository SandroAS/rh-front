<script setup lang="ts">
import { ref } from 'vue'

const anamneses = ref([
  { id: 1, complaint: 'Dor de dente', createdAt: '2024-01-10' },
  { id: 2, complaint: 'Sangramento gengival', createdAt: '2024-04-15' }
])

const isModalOpen = ref(false)

const openModal = () => {
  isModalOpen.value = true
}
const closeModal = () => {
  isModalOpen.value = false
}

const form = ref({
  complaint: '',
  health: {
    problem: '',
    gumBleeding: false,
    sensitivity: false,
    smoking: false,
    alcohol: false,
    sugar: false,
    pregnant: false
  },
  hygiene: {
    brushingFrequency: '',
    flossingFrequency: '',
    nails: false
  },
  allergies: {
    hasAllergies: false,
    list: ['']
  },
  medication: {
    hasTreatment: '',
    doctorName: '',
    doctorContact: '',
    usesMedication: false,
    list: ['']
  },
  history: {
    currentDisease: '',
    medicalHistory: '',
    familyHistory: '',
    surgeries: '',
    bleeding: '',
    anesthesia: '',
    rheumaticFever: '',
    renal: '',
    hepatic: '',
    cardiac: '',
    respiratory: '',
    joint: '',
    gastric: '',
    diabetes: '',
    bloodPressure: '',
    hiv: '',
    coagulation: ''
  }
})

const addAllergy = () => {
  form.value.allergies.list.push('')
}
const addMedication = () => {
  form.value.medication.list.push('')
}
</script>

<template>
  <div>
    <div class="d-flex justify-end">
      <v-btn class="mb-4" color="primary" @click="openModal">
        <v-icon start>mdi-plus</v-icon>
        Nova Anamnese
      </v-btn>
    </div>

    <v-table density="comfortable">
      <thead>
        <tr>
          <th>Queixa</th>
          <th>Data</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in anamneses" :key="item.id">
          <td>{{ item.complaint }}</td>
          <td>{{ item.createdAt }}</td>
          <td>
            <v-btn icon size="small">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>

    <v-dialog v-model="isModalOpen" max-width="1000">
      <v-card>
        <v-card-title class="text-h6">Nova Anamnese</v-card-title>
        <v-card-text>
          <v-form>
            <v-textarea
              v-model="form.complaint"
              label="Principais queixas"
              variant="solo-filled"
              density="comfortable"
              rows="3"
              auto-grow
            />

            <v-divider class="my-4" />
            <h6 class="text-subtitle-1 font-weight-medium">Saúde</h6>
            <v-checkbox label="Problema de Saúde" v-model="form.health.problem" hide-details />
            <v-checkbox label="Tem sangramento nas gengivas?" v-model="form.health.gumBleeding" hide-details />
            <v-checkbox label="Tem sensibilidade nos dentes?" v-model="form.health.sensitivity" hide-details />
            <v-checkbox label="Tabagismo prévio ou atual?" v-model="form.health.smoking" hide-details />
            <v-checkbox label="Etilismo prévio ou atual?" v-model="form.health.alcohol" hide-details />
            <v-checkbox label="Consome açúcar diariamente?" v-model="form.health.sugar" hide-details />
            <v-checkbox label="Gestante?" v-model="form.health.pregnant" hide-details />

            <v-divider class="my-4" />
            <h6 class="text-subtitle-1 font-weight-medium mb-4">Higiene</h6>
            <v-text-field label="Quantas vezes escova os dentes por dia?" v-model="form.hygiene.brushingFrequency" variant="solo-filled" density="comfortable" />
            <v-text-field label="Frequência do uso de fio dental" v-model="form.hygiene.flossingFrequency" variant="solo-filled" density="comfortable" />
            <v-checkbox label="Rói as unhas?" v-model="form.hygiene.nails" />

            <v-divider class="my-4" />
            <h6 class="text-subtitle-1 font-weight-medium">Alergias</h6>
            <v-checkbox label="Paciente possui alguma alergia?" v-model="form.allergies.hasAllergies" />
            <div v-for="(item, index) in form.allergies.list" :key="index">
              <v-text-field v-model="form.allergies.list[index]" label="Alergia" variant="solo-filled" density="comfortable" />
            </div>
            <v-btn variant="text" @click="addAllergy">+ Adicionar Alergia</v-btn>

            <v-divider class="my-4" />
            <h6 class="text-subtitle-1 font-weight-medium mb-4">Medicamentos</h6>
            <v-text-field label="Tratamento médico" v-model="form.medication.hasTreatment" variant="solo-filled" density="comfortable" />
            <v-text-field label="Nome do médico" v-model="form.medication.doctorName" variant="solo-filled" density="comfortable" />
            <v-text-field label="Contato do médico" v-model="form.medication.doctorContact" variant="solo-filled" density="comfortable" />
            <v-checkbox label="Faz uso de medicamentos?" v-model="form.medication.usesMedication" />
            <div v-for="(item, index) in form.medication.list" :key="index">
              <v-text-field v-model="form.medication.list[index]" label="Medicamento" variant="solo-filled" density="comfortable" />
            </div>
            <v-btn variant="text" @click="addMedication">+ Adicionar Medicamento</v-btn>

            <v-divider class="my-4" />
            <h6 class="text-subtitle-1 font-weight-medium mb-4">Histórico de Saúde</h6>
            <v-textarea v-model="form.history.currentDisease" label="Histórico da doença atual" variant="solo-filled" density="comfortable" auto-grow />
            <v-textarea v-model="form.history.medicalHistory" label="Histórico médico" variant="solo-filled" density="comfortable" auto-grow />
            <v-textarea v-model="form.history.familyHistory" label="Histórico médico familiar" variant="solo-filled" density="comfortable" auto-grow />
            <v-textarea v-model="form.history.surgeries" label="Cirurgias / Internações" variant="solo-filled" density="comfortable" auto-grow />
            <v-textarea v-model="form.history.bleeding" label="Hemorragias" variant="solo-filled" density="comfortable" auto-grow />
            <v-textarea v-model="form.history.anesthesia" label="Anestesia / Problemas" variant="solo-filled" density="comfortable" auto-grow />
            <v-checkbox label="Febre reumática" v-model="form.history.rheumaticFever" hide-details />
            <v-checkbox label="Alteração renal" v-model="form.history.renal" hide-details />
            <v-checkbox label="Alteração hepática" v-model="form.history.hepatic" hide-details />
            <v-checkbox label="Problema cardíaco" v-model="form.history.cardiac" hide-details />
            <v-checkbox label="Problema respiratório" v-model="form.history.respiratory" hide-details />
            <v-checkbox label="Problema articular ou reumatismo" v-model="form.history.joint" hide-details />
            <v-checkbox label="Problema gástrico" v-model="form.history.gastric" hide-details />
            <v-checkbox label="Diabetes" v-model="form.history.diabetes" hide-details />
            <v-checkbox label="Hipertensão / Hipotensão" v-model="form.history.bloodPressure" hide-details />
            <v-checkbox label="Portador do vírus HIV" v-model="form.history.hiv" hide-details />
            <v-checkbox label="Alteração na coagulação sanguínea" v-model="form.history.coagulation" hide-details />
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="isModalOpen = false">Cancelar</v-btn>
          <v-btn color="primary" @click="closeModal">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>