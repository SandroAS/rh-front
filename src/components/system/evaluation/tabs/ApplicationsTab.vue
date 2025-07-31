<script setup lang="ts">
// Aqui você importaria e usaria um EvaluationApplicationStore
// e montaria a tabela/componentes para gerenciar as aplicações de avaliação
// Exemplo:
// import { ref } from 'vue';
// import { useEvaluationApplicationStore } from '@/stores/evaluation-application.store';
// import type EvaluationApplication from '@/types/evaluation/evaluation-application.type';

// const evaluationApplicationStore = useEvaluationApplicationStore();
// const applications = ref([]); // Suas aplicações

// onMounted(() => {
//   evaluationApplicationStore.getEvaluationApplications();
// });
</script>

<template>
  <div>
    <h3>Aplicações de Avaliação</h3>
    <p>Aqui você listará as aplicações de avaliação criadas a partir dos modelos.</p>
    <v-btn color="primary">
      <v-icon start>mdi-plus</v-icon> Criar Nova Aplicação
    </v-btn>
    </div>
</template>