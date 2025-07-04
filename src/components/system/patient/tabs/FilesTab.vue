<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

const anexos = ref([
  {
    id: 1,
    nome: 'exame-laboratorial.pdf',
    usuario: {
      nome: 'João da Silva',
      email: 'joao@email.com',
      avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    dataCadastro: '2025-05-15T13:30:00Z',
    url: 'https://example.com/exame-laboratorial.pdf'
  }
])

function getFileIcon(nome: string): string {
  const ext = nome.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'pdf': return 'mdi-file-pdf-box'
    case 'png':
    case 'jpg':
    case 'jpeg': return 'mdi-file-image'
    case 'doc':
    case 'docx': return 'mdi-file-word-box'
    case 'xls':
    case 'xlsx': return 'mdi-file-excel-box'
    case 'csv': return 'mdi-file-delimited'
    default: return 'mdi-file-document-outline'
  }
}

function formatarData(dataIso: string): string {
  const date = new Date(dataIso)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// Modal
const showModal = ref(false)
const isEditando = ref(false)
const anexoEditando = ref<any | null>(null)

const form = reactive({
  nome: '',
  arquivo: null as File | null
})

function resetForm() {
  form.nome = ''
  form.arquivo = null
  anexoEditando.value = null
  isEditando.value = false

  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
}

function openModal() {
  resetForm()
  showModal.value = true
}

function editarAnexo(item: any) {
  form.nome = item.nome
  form.arquivo = null
  anexoEditando.value = item
  isEditando.value = true
  showModal.value = true
}

function salvarAnexo() {
  if (isEditando.value && anexoEditando.value) {
    anexoEditando.value.nome = form.nome
    // Aqui você pode lidar com o upload se form.arquivo estiver presente
  } else {
    anexos.value.push({
      id: Date.now(),
      nome: form.nome,
      usuario: {
        nome: 'Usuário Atual',
        email: 'usuario@email.com',
        avatarUrl: 'https://randomuser.me/api/portraits/lego/1.jpg'
      },
      dataCadastro: new Date().toISOString(),
      url: '#' // Substituir com link real após upload
    })
  }
  showModal.value = false
  resetForm()
}

function abrirAnexo(item: any) {
  window.open(item.url, '_blank')
}

function deletarAnexo(item: any) {
  anexos.value = anexos.value.filter(a => a.id !== item.id)
}

const previewUrl = ref<string | null>(null)
const previewFileType = ref<string | null>(null)

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const selectedFile = input.files?.[0] ?? null

  if (selectedFile) {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }
    previewUrl.value = URL.createObjectURL(selectedFile)

    if (selectedFile.type === 'application/pdf') {
      previewFileType.value = 'pdf'
    } else if (selectedFile.type.startsWith('image/')) {
      previewFileType.value = 'image'
    } else {
      previewFileType.value = 'unknown'
    }
  } else {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }
    previewUrl.value = null
    previewFileType.value = null
  }
}

// Se quiser limpar a URL quando modal fechar
watch(showModal, (val) => {
  if (!val) {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }
    previewUrl.value = null
    previewFileType.value = null
  }
})
</script>

<template>
  <v-card flat>
    <div class="d-flex justify-end">
      <v-btn class="mb-4" color="primary" @click="openModal">
        <v-icon start>mdi-plus</v-icon>
        Novo Anexo
      </v-btn>
    </div>
    <v-data-table
      :headers="[
        { title: 'Arquivo', key: 'nome' },
        { title: 'Usuário', key: 'usuario' },
        { title: 'Data', key: 'dataCadastro' },
        { title: 'Ações', key: 'acoes', sortable: false, align: 'end' }
      ]"
      :items="anexos"
      item-value="id"
      class="elevation-1"
    >
      <!-- Nome do Arquivo com ícone -->
      <template #item.nome="{ item }">
        <v-icon class="me-2" size="20">
          {{ getFileIcon(item.nome) }}
        </v-icon>
        {{ item.nome }}
      </template>
  
      <!-- Usuário -->
      <template #item.usuario="{ item }">
        <div class="d-flex align-center">
          <v-avatar size="40" class="mr-2">
            <v-img :src="item.usuario.avatarUrl" />
          </v-avatar>
          <div>
            <div class="font-weight-medium">{{ item.usuario.nome }}</div>
            <div class="text-caption text-grey">{{ item.usuario.email }}</div>
          </div>
        </div>
      </template>
  
      <!-- Data -->
      <template #item.dataCadastro="{ item }">
        {{ formatarData(item.dataCadastro) }}
      </template>
  
      <!-- Ações -->
      <template #item.acoes="{ item }">
        <v-btn
          icon
          size="small"
          @click="editarAnexo(item)"
          title="Editar"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
  
        <v-btn
          icon
          size="small"
          @click="abrirAnexo(item)"
          title="Abrir em nova guia"
        >
          <v-icon>mdi-open-in-new</v-icon>
        </v-btn>
  
        <v-btn
          icon
          size="small"
          color="error"
          @click="deletarAnexo(item)"
          title="Deletar"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-card>

  <v-dialog v-model="showModal" max-width="900">
    <v-card>
      <v-card-title>
        <span class="text-h6">{{ isEditando ? 'Editar Anexo' : 'Novo Anexo' }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <!-- Formulário à esquerda -->
            <v-col cols="12" md="6">
              <div style="flex: 1;">
                <v-form>
                  <v-text-field
                    v-model="form.nome"
                    label="Nome do Arquivo"
                    required
                    variant="solo-filled"
                    density="comfortable"
                  />
                  <v-file-input
                    v-model="form.arquivo"
                    label="Upload de Arquivo"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg"
                    :show-size="true"
                    :multiple="false"
                    truncate-length="25"
                    variant="solo-filled"
                    density="comfortable"
                    @change="onFileChange"
                  />
                </v-form>
              </div>
            </v-col>

            <!-- Preview do arquivo à direita -->
            <v-col cols="12" md="6">
              <div style="flex: 1; border: 1px solid #ccc; border-radius: 4px; padding: 8px; height: 100%; justify-items: center; max-height: 300px; overflow: auto;">
                <template v-if="previewUrl">
                  <template v-if="previewFileType === 'pdf'">
                    <embed
                      :src="previewUrl + '#toolbar=0&navpanes=0&scrollbar=0'"
                      type="application/pdf"
                      width="100%"
                      height="280"
                      style="border: 1px solid #ccc; border-radius: 8px;"
                    />
                  </template>

                  <template v-else-if="previewFileType === 'image'">
                    <img
                      :src="previewUrl"
                      alt="Pré-visualização da imagem"
                      style="max-width: 100%; max-height: 280px; border-radius: 8px; object-fit: contain;"
                    />
                  </template>
                  <template v-else>
                    <div class="d-flex flex-column align-center justify-center" style="height: 280px;">
                      <v-icon size="48">mdi-file-document-outline</v-icon>
                      <p style="text-align: center; margin-top: 16px;">
                        Preview não disponível para este tipo de arquivo.
                      </p>
                    </div>
                  </template>
                </template>
                <template v-else>
                  <p style="text-align: center; color: #888;">Nenhum arquivo selecionado para preview.</p>
                </template>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="showModal = false">Cancelar</v-btn>
        <v-btn color="primary" @click="salvarAnexo">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
