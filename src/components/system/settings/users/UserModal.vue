<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { Form, Field } from '@/plugins/vee-validate';
import type AccountUserPayload from '@/types/account/account-user-payload.type';
import type AccountUser from '@/types/account/account-user.type';
import { useAccountUserStore } from '@/stores/account-user.store';
import { useSnackbarStore } from '@/stores/snackbar.store';
import { useJobPositionStore } from '@/stores/job-position.store';
import { RoleType } from '@/types/user/user-role.type';
import { checkPasswordStrength, passwordScore } from '@/utils/checkPasswordStrength.util';

const accountUserStore = useAccountUserStore();
const snackbarStore = useSnackbarStore();
const jobPositionStore = useJobPositionStore();

const props = defineProps<{
  modelValue: boolean,
  selectedAccountUser?: AccountUser | null
}>();

const emit = defineEmits(['update:modelValue'])

const close = () => {
  emit('update:modelValue', false);
}

function modalValueChanged(value: boolean) {
  emit('update:modelValue', value);
  if (!value) {
    currentJobPosition.value = '';
    userAccount.job_position_uuid = undefined;
  }
}

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const passwordField = ref('');

const currentJobPosition = ref(props.selectedAccountUser?.jobPosition?.uuid || '');

const userTypes = [
  {
    value: RoleType.MANAGER,
    title: 'Gerente',
    subtitle: 'Gerencia times e pode ter acesso limitado a dados de outros times.',
    disabled: false
  },
  {
    value: RoleType.LEADER,
    title: 'Líder',
    subtitle: 'Gerencia o próprio time e pode criar tarefas e relatórios.',
    disabled: false
  },
  {
    value: RoleType.MEMBER,
    title: 'Membro',
    subtitle: 'Acesso básico, focado em tarefas e atividades do próprio time.',
    disabled: false
  },
];

let userAccount = reactive<AccountUserPayload>({
  name: props.selectedAccountUser?.name || '',
  email: props.selectedAccountUser?.email || '',
  cellphone: props.selectedAccountUser?.cellphone || '',
  cpf: props.selectedAccountUser?.cpf || '',
  password: props.selectedAccountUser?.password || '',
  confirmPassword: '',
  role: props.selectedAccountUser?.role?.name || RoleType.MEMBER,
  job_position_uuid: props.selectedAccountUser?.jobPosition?.uuid || undefined
})

watch(() => props.selectedAccountUser, (val) => {
  Object.assign(userAccount, {
    name: val?.name || '',
    email: val?.email || '',
    cellphone: val?.cellphone || '',
    cpf: val?.cpf || '',
    password: '', 
    confirmPassword: '',
    role: val?.role?.name || RoleType.MEMBER,
    job_position_uuid: val?.jobPosition?.uuid || undefined
  });
  passwordField.value = '';
}, { immediate: true });

watch(() => props.modelValue, async (isOpen) => {
  if (isOpen) {
    await getAllJobPositions();
  }
});

async function getAllJobPositions() {
  await jobPositionStore.getAllJobPositions();
}

const passwordStrengthScore = computed(() => {
  return checkPasswordStrength(passwordField.value);
});

const passwordIndicator = computed(() => {
  const score = passwordStrengthScore.value;
  return passwordScore(score);
});

function setJobPositionFromItem(item: any): string {
  const uuidValue = item?.value ?? (typeof item === 'string' ? item : '');
  currentJobPosition.value = uuidValue;
  return uuidValue;
}

function jobPositionOnBlur(field: any) {
  field.onBlur();
}

async function onSubmit(formValues: Record<string, any>) {
  const accountUser: AccountUserPayload = formValues as AccountUserPayload;

  try {
    await accountUserStore.saveAccountUser(accountUser, props.selectedAccountUser?.uuid);
    snackbarStore.show('Registro realizado com sucesso! Bem-vindo(a)!', 'success');
    close();
  } catch (err: any) {
    console.error('Erro no registro:', err);
    snackbarStore.show(accountUserStore.error || 'Falha ao salvar usuário.', 'error');
  }
};
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="modalValueChanged" max-width="500px">
    <Form @submit="onSubmit" :initial-values="userAccount">
      <v-card>
        <v-card-title>
          {{ !!selectedAccountUser ? 'Editar usuário' : 'Novo usuário' }}
        </v-card-title>
        <v-card-text>
          <Field name="name" label="Nome" rules="required|min:3|alpha_spaces" v-slot="{ field, errorMessage }">
            <v-text-field
              v-bind="field"
              label="Nome"
              prepend-inner-icon="mdi-account"
              variant="solo-filled"
              density="compact"
              :persistent-placeholder="!!props.selectedAccountUser?.name"
              :error="!!errorMessage"
              :error-messages="errorMessage" class="mb-3"
            />
          </Field>

          <Field name="email" label="E-mail" rules="required|email" v-slot="{ field, errorMessage }">
            <v-text-field
              v-bind="field"
              label="E-mail"
              prepend-inner-icon="mdi-email"
              variant="solo-filled"
              density="compact"
              :persistent-placeholder="!!props.selectedAccountUser?.email"
              :error="!!errorMessage"
              :error-messages="errorMessage" class="mb-3"
            />
          </Field>

          <Field name="cellphone" label="Telefone" rules="required|min:15|max:16" v-slot="{ field, errorMessage }">
            <v-text-field
              v-bind="field"
              label="Telefone"
              v-mask="['(##) #####-####', '(##) ####-####']"
              prepend-inner-icon="mdi-phone"
              variant="solo-filled"
              density="compact"
              :persistent-placeholder="!!props.selectedAccountUser?.cellphone"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              class="mb-3"
            />
          </Field>

          <Field name="cpf" rules="required|cpf" v-slot="{ field, errorMessage }">
            <v-text-field
              v-bind="field"
              label="CPF"
              v-mask="'###.###.###-##'"
              prepend-inner-icon="mdi-card-account-details"
              variant="solo-filled"
              density="compact"
              :persistent-placeholder="!!props.selectedAccountUser?.cpf"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              class="mb-3"
            />
          </Field>

          <Field name="password" label="Senha" :rules="!props.selectedAccountUser?.name ? 'required|min:6' : ''" v-slot="{ field, errorMessage }">
            <v-text-field
              v-bind="field"
              v-model="passwordField"
              label="Senha"
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock"
              variant="solo-filled"
              density="compact" :error="!!errorMessage"
              :error-messages="errorMessage"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              class="mb-1"
            />
          </Field>
          <v-progress-linear
            v-if="!props.selectedAccountUser?.name || passwordField.length > 0"
            :model-value="passwordIndicator.value"
            :color="passwordIndicator.color"
            height="6"
            rounded
            class="mb-2"
          />
          <div class="text-caption mb-3" :class="`text-${passwordIndicator.color}`">
            Nível de segurança da senha: 
            <strong class="text-capitalize">{{ passwordIndicator.text }}</strong>
          </div>

          <Field name="confirmPassword" label="Confirmar senha" :rules="!props.selectedAccountUser?.name ? 'required|confirmed:@password' : ''"
            v-slot="{ field, errorMessage }">
            <v-text-field
              v-bind="field"
              label="Confirmar senha"
              :type="showConfirmPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock"
              variant="solo-filled"
              density="compact"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showConfirmPassword = !showConfirmPassword"
              class="mb-3"
            />
          </Field>
          <Field name="role" rules="required" v-slot="{ field, errorMessage }">
            <v-select
              v-bind="field"
              label="Tipo"
              :items="userTypes"
              item-value="value"
              item-title="title"
              item-props="disabled"
              :return-object="false"
              variant="solo-filled"
              density="compact"
              persistent-placeholder
              :error="!!errorMessage"
              :error-messages="errorMessage"
              class="mb-3"
            >
              <template v-slot:item="{ item, props: itemProps }">
                <v-list-item v-bind="itemProps" :title="item.title" :subtitle="item.raw.subtitle" :disabled="item.raw.disabled" />
              </template>
            </v-select>
          </Field>

          <Field name="job_position_uuid" label="Cargo" v-slot="{ field, errorMessage }">
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
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="close">Cancelar</v-btn>
          <v-btn color="primary" type="submit">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </Form>
  </v-dialog>
</template>
