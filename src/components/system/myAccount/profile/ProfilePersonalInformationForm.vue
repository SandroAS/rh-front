<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted } from 'vue';
import profile_img_default from '@/assets/profile_img_default.png'
import { useUserStore } from '@/stores/auth.store';
import type { ProfilePersonalInformation } from '@/types/profile/profile-personal-information.type';
import { Form, Field } from '@/plugins/vee-validate';
import { useSnackbarStore } from '@/stores/snackbar.store';
import { useJobPositionStore } from '@/stores/job-position.store';

const userStore = useUserStore();
const snackbarStore = useSnackbarStore();
const jobPositionStore = useJobPositionStore();

const fileInput = ref<HTMLInputElement | null>(null);
const selectedImage = ref<File | null>(null);
const previewImageUrl = ref<string | null>(null);

watch(selectedImage, (newFile) => {
  if (newFile) {
    previewImageUrl.value = URL.createObjectURL(newFile);
  } else {
    previewImageUrl.value = userStore?.user?.profile_img_url || null;
  }
}, { immediate: true });

watch(() => userStore?.user?.profile_img_url, (newUrl) => {
  if (!selectedImage.value) {
    previewImageUrl.value = newUrl || null;
  }
}, { immediate: true });

const finalProfileImgSrc = computed(() => {
  return previewImageUrl.value || profile_img_default;
});

function openFileInput() {
  fileInput.value?.click();
}

function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedImage.value = target.files[0];
  } else {
    selectedImage.value = null;
  }
}

const currentJobPosition = ref(userStore?.user?.jobPosition?.uuid || userStore?.user?.job_position_uuid || null);

const personalInformationDefault = reactive<ProfilePersonalInformation>({
  name: userStore?.user?.name || '',
  email: userStore?.user?.email || '',
  cellphone: userStore?.user?.cellphone,
  cpf: userStore?.user?.cpf,
  gender: userStore?.user?.gender ? (userStore?.user?.gender === 'MALE' ? 'Masculino' : 'Feminino') : null,
  profile_img_url: userStore?.user?.profile_img_url,
  job_position_uuid: userStore?.user?.jobPosition?.uuid || userStore?.user?.job_position_uuid || undefined,
})

const genderTypes = [
  { text: 'Masculino', value: 'MALE' },
  { text: 'Feminino', value: 'FEMALE' }
];

async function getAllJobPositions() {
  await jobPositionStore.getAllJobPositions();
}

function setJobPositionFromItem(item: any): string {
  const uuidValue = item?.value ?? (typeof item === 'string' ? item : '');
  currentJobPosition.value = uuidValue;
  return uuidValue;
}

function jobPositionOnBlur(field: any) {
  field.onBlur();
}

onMounted(async () => {
  await getAllJobPositions();
});

async function onSubmit(formValues: Record<string, any>) {
  const formData = new FormData();
  const gender = formValues.gender ? (formValues.gender === 'Masculino' || formValues.gender === 'MALE' ? 'MALE' : 'FEMALE') : null;
  formValues = { ...formValues, gender }
  const personalInformation: ProfilePersonalInformation = formValues as ProfilePersonalInformation;

  for (const key in formValues) {
    if (Object.prototype.hasOwnProperty.call(formValues, key)) {
      const value = formValues[key];
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    }
  }

  if (selectedImage.value) {
    formData.append('profile_image', selectedImage.value);
  }

  try {
    await userStore.updateUserPersonalInformation(formData, personalInformation);
    snackbarStore.show('Usuário atualizado com sucesso!', 'success')
    selectedImage.value = null;
  } catch (err) {
    snackbarStore.show('Falha ao tentar atualizar usuário: '+err, 'error')
  }
}
</script>

<template>
  <Form @submit="onSubmit" :initial-values="personalInformationDefault">
    <v-row>
      <v-col cols="12" md="4" class="pr-md-6">
        <h5 class="text-subtitle-1 font-weight-medium">Informações Pessoais</h5>
        <p class="text-body-2 text-medium-emphasis">
          Use um e-mail válido para receber notificações.
        </p>
      </v-col>
    
      <v-col cols="12" md="8">
        <v-row>
          <v-col cols="12" md="6">
            <div class="d-flex align-center ga-4">
              <v-avatar size="120" class="border">
                <v-img :src="finalProfileImgSrc" alt="Avatar" />
              </v-avatar>
              <div>
                <v-btn variant="outlined" class="mb-2" @click="openFileInput">
                  Trocar Avatar
                </v-btn>
                <input
                  type="file"
                  ref="fileInput"
                  accept="image/jpeg, image/png, image/gif"
                  @change="onFileSelected"
                  style="display: none;"
                />
                <div class="text-caption text-medium-emphasis">
                  JPG, GIF ou PNG. Máx. 1MB.
                </div>
              </div>
            </div>
          </v-col>
        </v-row>

        <v-row class="mt-6">
          <v-col cols="12" sm="6">
            <Field
              name="name"
              rules="required|min:3|alpha_spaces"
              v-slot="{ field, errorMessage }"
            >
              <v-text-field
                v-bind="field"
                label="Nome Completo"
                prepend-inner-icon="mdi-account"
                persistent-placeholder
                variant="solo-filled"
                density="compact"
                :error="!!errorMessage"
                :error-messages="errorMessage"
              />
            </Field>
          </v-col>
          <v-col cols="12" sm="6">
            <Field
              name="email"
              rules="required|email"
              v-slot="{ field, errorMessage }"
            >
              <v-text-field
                v-bind="field"
                label="E-mail"
                prepend-inner-icon="mdi-email"
                persistent-placeholder
                variant="solo-filled"
                density="compact"
                :error="!!errorMessage"
                :error-messages="errorMessage"
              />
            </Field>
          </v-col>
          <v-col cols="12" sm="6">
            <Field
              name="cellphone"
              rules="required|min:15|max:16"
              v-slot="{ field, errorMessage }"
            >
              <v-text-field
                v-bind="field"
                label="Telefone"
                v-mask="['(##) #####-####', '(##) ####-####']"
                prepend-inner-icon="mdi-phone"
                :persistent-placeholder="!!userStore?.user?.cellphone"
                variant="solo-filled"
                density="compact"
                :error="!!errorMessage"
                :error-messages="errorMessage"
              />
            </Field>
          </v-col>
          <v-col cols="12" sm="6">
            <Field
              name="cpf"
              rules="required|cpf"
              v-slot="{ field, errorMessage }"
            >
              <v-text-field
                v-bind="field"
                label="CPF"
                v-mask="'###.###.###-##'"
                prepend-inner-icon="mdi-card-account-details"
                :persistent-placeholder="!!userStore?.user?.cpf"
                variant="solo-filled"
                density="compact"
                :error="!!errorMessage"
                :error-messages="errorMessage"
              />
            </Field>
          </v-col>
          <v-col cols="12" sm="6">
            <Field
              name="gender"
              v-slot="{ field, errorMessage }"
            >
              <v-select
                v-bind="field"
                :items="genderTypes"
                item-title="text"
                item-value="value"
                label="Gênero"
                prepend-inner-icon="mdi-gender-male-female"
                :persistent-placeholder="!!userStore?.user?.gender"
                density="compact"
                variant="solo-filled"
                :error="!!errorMessage"
                :error-messages="errorMessage"
              />
            </Field>
          </v-col>
          <v-col cols="12" sm="6">
            <Field
              name="job_position_uuid"
              label="Cargo"
              v-slot="{ field, errorMessage }"
            >
              <v-autocomplete
                :model-value="currentJobPosition"
                @update:model-value="(item: any) => {
                  const uuidValue = setJobPositionFromItem(item);
                  field.onChange(uuidValue);
                }"
                @blur="jobPositionOnBlur(field)"
                label="Cargo"
                :items="jobPositionStore.jobPositionsOptions"
                item-title="title"
                item-value="value"
                variant="solo-filled"
                density="compact"
                clearable
                :error="!!errorMessage"
                :error-messages="errorMessage"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item 
                    v-bind="props"
                    :title="item.raw.title"
                    :disabled="item.raw.disabled"
                    density="compact"
                  />
                </template>
              </v-autocomplete>
            </Field>
          </v-col>
        </v-row>
      </v-col>
      
      <v-col cols="12" class="d-flex justify-end">
        <v-btn class="mt-4" color="primary" type="submit">Salvar</v-btn>
      </v-col>
    </v-row>
  </Form>
</template>
