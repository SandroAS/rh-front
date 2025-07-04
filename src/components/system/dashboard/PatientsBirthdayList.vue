<script setup lang="ts">
import { ref, computed } from 'vue'

// Simulação dos pacientes
const pacientes = ref([
  { nome: 'Ana Clara', sobrenome: 'Silva', telefone: '(11) 91234-5678', email: 'ana@exemplo.com', nascimento: '1990-05-15' },
  { nome: 'Carlos Eduardo', sobrenome: 'Santos', telefone: '(11) 99876-5432', email: 'carlos@exemplo.com', nascimento: '1985-05-21' },
  { nome: 'Bruna', sobrenome: 'Ferreira', telefone: '(11) 91111-2222', email: 'bruna@exemplo.com', nascimento: '1993-05-03' },
  { nome: 'João Pedro', sobrenome: 'Lima', telefone: '(11) 92222-3333', email: 'joao@exemplo.com', nascimento: '1987-08-10' },
])

const mesAtual = new Date().getMonth()

const aniversariantes = computed(() =>
  pacientes.value
    .filter(p => new Date(p.nascimento).getMonth() === mesAtual)
    .sort((a, b) => new Date(a.nascimento).getDate() - new Date(b.nascimento).getDate())
)

function getIniciais(nome: string, sobrenome: string) {
  return `${nome[0]}${sobrenome[0]}`.toUpperCase()
}

function formatarData(data: string) {
  const d = new Date(data)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
</script>

<template>
  <v-card elevation="2" class="pa-4">
    <v-card-title class="text-h6 font-weight-bold">Aniversariantes do mês</v-card-title>
    <v-divider class="mb-2"></v-divider>

    <v-list density="comfortable">
      <v-list-item
        v-for="(paciente, index) in aniversariantes"
        :key="index"
      >
        <template #prepend>
          <v-avatar color="primary" size="40">
            <span class="text-white text-subtitle-2">
              {{ getIniciais(paciente.nome, paciente.sobrenome) }}
            </span>
          </v-avatar>
        </template>

        <!-- Conteúdo -->
        <v-list-item-title class="font-weight-medium">
          {{ paciente.nome }} {{ paciente.sobrenome }}
        </v-list-item-title>
        <div class="paciente-detalhes">
          <div>{{ paciente.telefone }}</div>
          <div>{{ paciente.email }}</div>
        </div>

        <template #append>
          <div class="birthday-info">
            <img src="@/assets/birthday_cake.png" alt="Bolo de Aniversário" class="birthday-icon" />
            <div class="text-caption text-right">{{ formatarData(paciente.nascimento) }}</div>
          </div>
        </template>
      </v-list-item>
    </v-list>

    <div v-if="aniversariantes.length === 0" class="text-center text-body-2 mt-4">
      Nenhum paciente faz aniversário este mês.
    </div>
  </v-card>
</template>

<style scoped>
.paciente-detalhes {
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.6);
  line-height: 1.4;
  margin-top: 2px;
  white-space: normal;
  overflow: visible;
}

.birthday-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.birthday-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
}
</style>