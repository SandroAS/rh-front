<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import GeneralInformationTab from './tabs/GeneralInformationTab.vue'
import AnamnesisTab from './tabs/AnamnesisTab.vue'
import OdontogramaTab from './tabs/OdontogramaTab.vue'
import RecipesTab from './tabs/RecipesTab.vue'
import AttestsTab from './tabs/AttestsTab.vue'
import FilesTab from './tabs/FilesTab.vue'

const route = useRoute()
const router = useRouter()
const patientId = route.params.id as string

const activeTab = ref((route.query.tab as string) || 'geral')

watch(activeTab, (newTab) => {
  router.replace({ query: { ...route.query, tab: newTab } })
})

const patient = ref({
  id: 1,
  name: 'João da Silva',
  email: 'joao@email.com',
  phone: '(11) 99999-0000',
  birthDate: '1990-05-01',
  cpf: '123.456.789-00',
  avatar: 'https://img.freepik.com/vetores-premium/icone-de-adesao-prateada-icone-de-perfil-de-avatar-padrao-icone-de-associacao-imagem-de-usuario-de-midia-social-ilustracao-vetorial_561158-4195.jpg?w=740',
  createdAt: '2024-01-10',
  address: {
    street: '',
    number: '',
    zip: '',
    neighborhood: '',
    complement: '',
    city: '',
    state: ''
  },
  isMinor: 'Não',
  responsibleName: '',
  responsiblePhone: '',
  insurance: '',
  insuranceCard: '',
  referralSource: '',
  indicatedBy: '',
  observations: ''
})

const patientAge = computed(() => {
  return dayjs().diff(patient.value.birthDate, 'year')
})

onMounted(() => {
  // Buscar paciente com ID da rota: `patientId`
  console.log(`Buscando paciente com ID: ${patientId}`)
})
</script>

<template>
  <v-container fluid>
    <v-card class="pa-4">
      <v-row align="center">
        <v-col cols="auto">
          <v-avatar size="80">
            <v-img :src="patient.avatar" />
          </v-avatar>
        </v-col>
        <v-col>
          <div class="text-h6">
            {{ patient.name }}
            <span class="text-subtitle-1 font-weight-medium">
              - {{ patientAge }} anos
            </span>
          </div>
          <div class="text-body-2 text-grey-darken-1">{{ patient.email }}</div>
        </v-col>
        <v-col class="text-right" cols="auto">
          
        </v-col>
      </v-row>

      <v-tabs v-model="activeTab" class="mt-4">
        <v-tab value="geral">Informações Gerais</v-tab>
        <v-tab value="anamnese">Anamnese</v-tab>
        <v-tab value="odontograma">Odontograma</v-tab>
        <v-tab value="receita">Receita</v-tab>
        <v-tab value="atestado">Atestado</v-tab>
        <v-tab value="anexos">Anexos</v-tab>
      </v-tabs>

      <v-divider class="my-2" />

      <v-window v-model="activeTab">
        <v-window-item value="geral">
          <GeneralInformationTab />
        </v-window-item>

        <v-window-item value="anamnese">
          <AnamnesisTab />
        </v-window-item>

        <v-window-item value="odontograma">
          <OdontogramaTab />
        </v-window-item>

        <v-window-item value="receita">
          <RecipesTab />
        </v-window-item>

        <v-window-item value="atestado">
          <AttestsTab />
        </v-window-item>

        <v-window-item value="anexos">
          <FilesTab />
        </v-window-item>
      </v-window>
    </v-card>
  </v-container>
</template>
