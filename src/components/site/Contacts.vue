<script setup lang="ts">
// Component logic here
</script>

<template>
  <div>
    <v-container fluid class="bg-primary py-16">
      <v-row class="justify-center" no-gutters>
        <v-col cols="12" sm="auto" class="mb-2 mb-sm-0">
          <v-btn color="white" size="x-large" rounded="lg" class="px-8" variant="flat" block>
            Agendar demonstração
          </v-btn>
        </v-col>
        <v-col cols="12" sm="auto">
          <v-btn color="white" size="x-large" rounded="lg" variant="text" class="px-8" block>
            Falar com consultor
            <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
        </v-col>
      </v-row>

    </v-container>

    <v-footer class="bg-secondary py-8">
      <v-container>
        <v-row>
          <v-col cols="12" class="text-center text-white">
            <div class="d-flex justify-center align-center flex-wrap gap-4 mb-4">
              <a href="mailto:atendimento@rh.com.br" class="text-white text-decoration-none">
                <v-icon start small>mdi-email</v-icon> atendimento@rh.com.br
              </a>
              <span class="text-white px-4">|</span>
              <a href="https://wa.me/553198136678" class="text-white text-decoration-none" target="_blank">
                <v-icon start small>mdi-whatsapp</v-icon> (31) 9 9813-6678
              </a>
            </div>
            <p class="text-body-2 text-white text-opacity-75">© 2025 RH. Todos os direitos reservados.</p>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
  </div>
</template>
