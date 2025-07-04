<script setup lang="ts">
import { reactive, ref } from 'vue'
import logo from '@/assets/logo.jpg'

interface Profissional {
  id: number
  nome: string
  email: string
  avatar: string
  cro?: string
}

interface Receita {
  id: number
  profissional: Profissional
  dataCriacao: string
  pdfUrl: string
}

interface ModeloReceita {
  id: number
  titulo: string
  texto: string
}

const profissionais = ref<Profissional[]>([
  {
    id: 1,
    nome: 'Dr. João Silva',
    email: 'joao@clinica.com',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: 2,
    nome: 'Dra. Ana Lima',
    email: 'ana@clinica.com',
    avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
  },
])

const receitas = ref<Receita[]>([
  {
    id: 1,
    profissional: profissionais.value[0],
    dataCriacao: '2025-05-16T14:23:00',
    pdfUrl: '/receitas/1.pdf',
  },
])

const modalAberto = ref(false)
const profissionalSelecionado = ref<Profissional | null>(null)
const corpoReceita = ref('')

function formatarData(data: string): string {
  return new Date(data).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function editarReceita(receita: Receita) {
  profissionalSelecionado.value = receita.profissional
  corpoReceita.value = 'Texto original da receita (exemplo)' // você pode adaptar isso
  modalAberto.value = true
}

function abrirPdf(receita: Receita) {
  window.open(receita.pdfUrl, '_blank')
}

function deletarReceita(receita: Receita) {
  if (confirm(`Deseja realmente deletar a receita de ${receita.profissional.nome}?`)) {
    receitas.value = receitas.value.filter(r => r.id !== receita.id)
  }
}

function openModal() {
  profissionalSelecionado.value = null
  corpoReceita.value = ''
  modalAberto.value = true
}

function salvarReceita() {
  const profissional = profissionais.value.find(p => p.id === profissionalSelecionado.value?.id)
  if (!profissional) return

  receitas.value.push({
    id: Date.now(),
    profissional,
    dataCriacao: new Date().toISOString(),
    pdfUrl: '/receitas/nova.pdf', // simulado
  })

  modalAberto.value = false
}

const modelosDeReceita = reactive<ModeloReceita[]>([
  {
    id: 1,
    titulo: 'Pós-operatório de extração dentária',
    texto: `- Dipirona sódica 500mg: 1 comprimido a cada 6h por 3 dias\n- Amoxicilina 500mg: 1 cápsula a cada 8h por 7 dias\n- Enxaguar com clorexidina 0,12% 2x ao dia por 7 dias\n\nRecomenda-se repouso relativo por 48 horas e evitar esforço físico.`
  },
  {
    id: 2,
    titulo: 'Controle de dor em tratamento de canal',
    texto: `- Ibuprofeno 600mg: 1 comprimido a cada 8h por 3 dias\n- Paracetamol 750mg: 1 comprimido a cada 6h se houver dor\n\nEvitar alimentos duros ou quentes. Retorno agendado em 7 dias.`
  },
  {
    id: 3,
    titulo: 'Inflamação gengival (Gengivite)',
    texto: `- Nimesulida 100mg: 1 comprimido a cada 12h por 5 dias\n- Bochechos com clorexidina 0,12% 3x ao dia por 10 dias\n\nRecomenda-se escovação suave com escova macia e uso de fio dental.`
  }
])

const modeloSelecionado = ref(null)
function aplicarModelo(modelo: ModeloReceita | null) {
  if (modelo?.texto) {
    corpoReceita.value = modelo.texto
  }
}

const modalSalvarModelo = ref(false)
const nomeNovoModelo = ref('')

function salvarNovoModelo() {
  const novoModelo = {
    id: Date.now(),
    titulo: nomeNovoModelo.value,
    texto: corpoReceita.value
  }
  modelosDeReceita.push(novoModelo)
  nomeNovoModelo.value = ''
  modalSalvarModelo.value = false
}
</script>

<template>
  <v-card flat>
    <div class="d-flex justify-end">
      <v-btn class="mb-4" color="primary" @click="openModal">
        <v-icon start>mdi-plus</v-icon>
        Nova Receita
      </v-btn>
    </div>

    <v-data-table
      :headers="[
        { title: 'Profissional', key: 'profissional' },
        { title: 'Criado em', key: 'data' },
        { title: 'Ações', key: 'acoes', sortable: false, align: 'end' },
      ]"
      :items="receitas"
      class="elevation-1"
      :items-per-page="5"
    >
      <template #item.profissional="{ item }">
        <div class="d-flex align-center">
          <v-avatar size="40" class="mr-2">
            <v-img :src="item.profissional.avatar" />
          </v-avatar>
          <div>
            <div class="font-weight-medium">{{ item.profissional.nome }}</div>
            <div class="text-caption text-grey">{{ item.profissional.email }}</div>
          </div>
        </div>
      </template>

      <template #item.data="{ item }">
        {{ formatarData(item.dataCriacao) }}
      </template>

      <template #item.acoes="{ item }">
        <div class="d-flex justify-end">
          <v-btn icon size="small" @click="editarReceita(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon size="small" @click="abrirPdf(item)">
            <v-icon>mdi-file-pdf-box</v-icon>
          </v-btn>
          <v-btn icon size="small" color="red" @click="deletarReceita(item)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </div>
      </template>
    </v-data-table>
  </v-card>

  <!-- Modal -->
  <v-dialog v-model="modalAberto" max-width="900px">
    <v-card>
      <v-card-title class="text-h6">Nova Receita</v-card-title>
      <v-card-text>
        <v-row>
          <!-- Formulário -->
          <v-col cols="12" md="6">
            <v-select
              v-model="profissionalSelecionado"
              :items="profissionais"
              item-title="nome"
              return-object
              label="Profissional de Saúde"
              variant="solo-filled"
              density="comfortable"
            />
            <v-select
              v-model="modeloSelecionado"
              :items="modelosDeReceita"
              item-title="titulo"
              item-value="id"
              label="Modelo de Receita"
              return-object
              variant="solo-filled"
              density="comfortable"
              @update:modelValue="aplicarModelo"
            />
            <v-textarea
              v-model="corpoReceita"
              label="Conteúdo da Receita"
              rows="8"
              auto-grow
              variant="solo-filled"
              density="comfortable"
            />
            <!-- Botão para abrir modal -->
            <div class="text-right mt-1">
              <v-btn
                size="x-small"
                variant="text"
                class="text-caption"
                prepend-icon="mdi-content-save-outline"
                @click="modalSalvarModelo = true"
              >
                Salvar como modelo
              </v-btn>
            </div>

            <!-- Modal interno para salvar modelo -->
            <v-dialog v-model="modalSalvarModelo" max-width="400px">
              <v-card>
                <v-card-title class="text-h6">Salvar como Modelo</v-card-title>
                <v-card-text>
                  <v-text-field
                    v-model="nomeNovoModelo"
                    label="Nome do modelo"
                    autofocus
                    variant="solo-filled"
                    density="comfortable"
                  />
                </v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn text @click="modalSalvarModelo = false">Cancelar</v-btn>
                  <v-btn color="primary" @click="salvarNovoModelo" :disabled="!nomeNovoModelo || !corpoReceita">
                    Salvar
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-col>

          <!-- Pré-visualização da Receita -->
          <v-col cols="12" md="6">
            <v-card
              class="pa-4 d-flex flex-column"
              style="border: 1px solid #ccc; min-height: 100%; height: 500px;"
            >
              <!-- Header -->
              <div class="text-center mb-4">
                <v-img
                  :src="logo"
                  height="40"
                  contain
                  class="mx-auto mb-2"
                />
                <h3 class="text-h6 font-weight-bold">Receita</h3>
                <v-divider class="my-2" />
              </div>

              <!-- Corpo da Receita (flex-grow) -->
              <div
                class="text-caption mb-4"
                style="white-space: pre-line; flex-grow: 1;"
              >
                {{ corpoReceita || 'Escreva o conteúdo da receita aqui...' }}
              </div>

              <!-- Assinatura -->
              <div class="text-caption text-center mt-4">
                _______________________________________<br />
                {{ profissionalSelecionado?.nome || 'Nome do Profissional' }}<br />
                CRO: {{ profissionalSelecionado?.cro || '000000' }}
              </div>

              <!-- Rodapé -->
              <div class="text-caption text-center mt-4">
                <v-divider class="my-2" />
                Clínica Saúde Total • Rua Exemplo, 123 – São Paulo – SP<br />
                (11) 99999-9999 • atendimento@clinicasaudetotal.com
              </div>
            </v-card>
          </v-col>

        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="modalAberto = false">Cancelar</v-btn>
        <v-btn color="primary" @click="salvarReceita">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>
