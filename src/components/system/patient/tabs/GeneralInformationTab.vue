<script setup lang="ts">
import { ref } from 'vue'

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

const uploadAvatar = () => {
  // Lógica de upload, ou abre um input file
  console.log('Trocar avatar ainda não implementado')
}
</script>

<template>
  <div>
    <v-row>
      <v-col cols="12" md="4" class="pr-md-6">
        <h5 class="text-subtitle-1 font-weight-medium">Informações Pessoais</h5>
        <p class="text-body-2 text-medium-emphasis">
          Atualize os dados cadastrais do paciente. Use um e-mail válido para envio de notificações.
        </p>
      </v-col>

      <v-col cols="12" md="8">
        <v-form>
          <!-- Avatar e botão -->
          <v-row>
            <v-col cols="12" md="6">
              <div class="d-flex align-center ga-4">
                <v-avatar size="120" class="border">
                  <v-img :src="patient.avatar || 'https://via.placeholder.com/120'" alt="Avatar" />
                </v-avatar>
                <div>
                  <v-btn variant="outlined" class="mb-2" @click="uploadAvatar">
                    Trocar Foto
                  </v-btn>
                  <div class="text-caption text-medium-emphasis">
                    JPG, GIF ou PNG. Máx. 1MB.
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>

          <v-row class="mt-6">
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="patient.name"
                label="Nome"
                variant="solo-filled"
                density="comfortable"
                required
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="patient.email"
                label="Email"
                variant="solo-filled"
                density="comfortable"
                required
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="patient.phone"
                label="Telefone"
                variant="solo-filled"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="patient.cpf"
                label="CPF"
                variant="solo-filled"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="patient.birthDate"
                label="Data de Nascimento"
                type="date"
                variant="solo-filled"
                density="comfortable"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-col>

      <v-col cols="12" class="d-flex justify-end">
        <v-btn type="submit" color="primary" class="mt-4">Salvar</v-btn>
      </v-col>
    </v-row>

    <v-divider class="my-10" />

    <v-row>
      <v-col cols="12" md="4" class="pr-md-6">
        <h5 class="text-subtitle-1 font-weight-medium">Endereço</h5>
        <p class="text-body-2 text-medium-emphasis">
          Insira as informações residenciais do paciente.
        </p>
      </v-col>

      <v-col cols="12" md="8">
        <v-form>
          <v-row>
            <v-col cols="12" sm="3">
              <v-text-field v-model="patient.address.zip" label="CEP" variant="solo-filled" density="comfortable" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="8" sm="6">
              <v-text-field v-model="patient.address.street" label="Rua" variant="solo-filled" density="comfortable" />
            </v-col>
            <v-col cols="12" md="4" sm="3">
              <v-text-field v-model="patient.address.number" label="Número" variant="solo-filled" density="comfortable" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="patient.address.neighborhood" label="Bairro" variant="solo-filled" density="comfortable" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="patient.address.complement" label="Complemento" variant="solo-filled" density="comfortable" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="patient.address.city" label="Cidade" variant="solo-filled" density="comfortable" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="patient.address.state" label="Estado" variant="solo-filled" density="comfortable" />
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>

    <v-divider class="my-10" />

    <v-row>
      <v-col cols="12" md="4" class="pr-md-6">
        <h5 class="text-subtitle-1 font-weight-medium">Outras Informações</h5>
        <p class="text-body-2 text-medium-emphasis">
          Informações adicionais sobre o paciente e vínculo com a clínica.
        </p>
      </v-col>

      <v-col cols="12" md="8">
        <v-form>
          <v-row>
            <v-col cols="12" sm="6">
              <v-select
                v-model="patient.isMinor"
                :items="['Sim', 'Não']"
                label="Menor de idade, ou depende de alguém?"
                variant="solo-filled"
                density="comfortable"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="patient.responsibleName"
                label="Nome do Responsável"
                variant="solo-filled"
                density="comfortable"
                :disabled="patient.isMinor === 'Não'"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="patient.responsiblePhone"
                label="Telefone do Responsável"
                variant="solo-filled"
                density="comfortable"
                :disabled="patient.isMinor === 'Não'"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="patient.insurance"
                :items="['Unimed', 'Amil', 'Bradesco', 'SulAmérica', 'Particular']"
                label="Convênio"
                variant="solo-filled"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="patient.insuranceCard"
                label="Número da carteirinha"
                variant="solo-filled"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="patient.referralSource"
                :items="['Google', 'Instagram', 'Facebook', 'Indicação', 'Outro']"
                label="Como conheceu a clínica?"
                variant="solo-filled"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" sm="6" v-if="patient.referralSource === 'Indicação'">
              <v-text-field
                v-model="patient.indicatedBy"
                label="Nome de quem indicou"
                variant="solo-filled"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="patient.observations"
                label="Observações"
                variant="solo-filled"
                density="comfortable"
                rows="3"
                auto-grow
              />
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
  </div>
</template>