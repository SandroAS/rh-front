<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { Form, Field } from '@/plugins/vee-validate';
import type AccountUserPayload from '@/types/account/account-user-payload.type';
import type AccountUser from '@/types/account/account-user.type';
import { useAccountUserStore } from '@/stores/account-user.store';
import { useSnackbarStore } from '@/stores/snackbar.store';
import { useJobPositionStore } from '@/stores/job-position.store';
import { useSectorStore } from '@/stores/sector.store';
import { useCareerPlanStore } from '@/stores/career-plan.store';
import { RoleType } from '@/types/user/user-role.type';
import { checkPasswordStrength, passwordScore } from '@/utils/checkPasswordStrength.util';

const accountUserStore = useAccountUserStore();
const snackbarStore = useSnackbarStore();
const jobPositionStore = useJobPositionStore();
const sectorStore = useSectorStore();
const careerPlanStore = useCareerPlanStore();

const props = defineProps<{
  modelValue: boolean,
  selectedAccountUser?: AccountUser | null
}>();

const emit = defineEmits(['update:modelValue'])

const close = () => {
  emit('update:modelValue', false);
}

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const passwordField = ref('');

const currentJobPosition = ref(props.selectedAccountUser?.jobPosition?.uuid || '');
const currentJobLevel = ref(props.selectedAccountUser?.jobPositionCurrentLevel?.uuid ?? '');
const currentSectors = ref<string[]>(props.selectedAccountUser?.sectors?.map(s => s.uuid) ?? []);
const currentCareerPlan = ref(props.selectedAccountUser?.careerPlan?.uuid ?? '');

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
  job_position_uuid: props.selectedAccountUser?.jobPosition?.uuid || undefined,
  job_position_current_level_uuid: props.selectedAccountUser?.jobPositionCurrentLevel?.uuid ?? undefined,
  sector_uuids: props.selectedAccountUser?.sectors?.map(s => s.uuid) ?? [],
  career_plan_uuid: props.selectedAccountUser?.career_plan_uuid ?? props.selectedAccountUser?.careerPlan?.uuid ?? undefined
})

function modalValueChanged(value: boolean) {
  emit('update:modelValue', value);
  if (!value) {
    currentJobPosition.value = '';
    userAccount.job_position_uuid = undefined;
    currentJobLevel.value = '';
    userAccount.job_position_current_level_uuid = undefined;
    currentSectors.value = [];
    userAccount.sector_uuids = [];
    currentCareerPlan.value = '';
    userAccount.career_plan_uuid = undefined;
  }
}

async function getAllJobPositions() {
  await jobPositionStore.getAllJobPositions();
}

async function getAllSectors() {
  if (!sectorStore.sectors || sectorStore.sectors.length === 0) {
    await sectorStore.getAllSectors();
  }
}

async function getAllCareerPlans() {
  if (!careerPlanStore.careerPlans || careerPlanStore.careerPlans.length === 0) {
    await careerPlanStore.getAllCareerPlans();
  }
}

watch(() => props.selectedAccountUser, (val) => {
  const careerPlanUuid = val?.career_plan_uuid ?? val?.careerPlan?.uuid ?? undefined;
  Object.assign(userAccount, {
    name: val?.name || '',
    email: val?.email || '',
    cellphone: val?.cellphone || '',
    cpf: val?.cpf || '',
    password: '',
    confirmPassword: '',
    role: val?.role?.name || RoleType.MEMBER,
    job_position_uuid: val?.jobPosition?.uuid || undefined,
    job_position_current_level_uuid: val?.jobPositionCurrentLevel?.uuid ?? undefined,
    sector_uuids: val?.sectors?.map(s => s.uuid) ?? [],
    career_plan_uuid: careerPlanUuid
  });
  currentJobPosition.value = val?.jobPosition?.uuid || '';
  currentJobLevel.value = val?.jobPositionCurrentLevel?.uuid ?? '';
  currentSectors.value = val?.sectors?.map(s => s.uuid) ?? [];
  currentCareerPlan.value = val?.careerPlan?.uuid ?? '';
  passwordField.value = '';
}, { immediate: true });

watch(() => props.modelValue, async (isOpen) => {
  if (isOpen) {
    await getAllJobPositions();
    await getAllSectors();
    await getAllCareerPlans();
  }
});

watch(currentJobPosition, (jobUuid) => {
  if (!jobUuid || !isJobLevelFieldEnabled.value) {
    currentJobLevel.value = '';
    userAccount.job_position_current_level_uuid = undefined;
  }
});

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

const selectedJobPositionOption = computed(() => {
  if (!currentJobPosition.value) return null;
  return jobPositionStore.jobPositionsOptions.find(opt => opt.value === currentJobPosition.value) as { value: string; title: string; levelsGroup?: { jobPositionsLevels: { uuid?: string; name: string }[] } } | undefined;
});

const jobLevelOptions = computed(() => {
  const levels = selectedJobPositionOption.value?.levelsGroup?.jobPositionsLevels ?? [];
  const options = levels.filter(l => l.uuid).map(l => ({ value: l.uuid!, title: l.name }));
  const currentLevel = props.selectedAccountUser?.jobPositionCurrentLevel;
  if (currentLevel?.uuid && !options.some(o => o.value === currentLevel.uuid)) {
    options.unshift({ value: currentLevel.uuid, title: currentLevel.name });
  }
  return options;
});

const isJobLevelFieldEnabled = computed(() => {
  const opt = selectedJobPositionOption.value;
  const hasLevelsInJob = Boolean(opt?.levelsGroup?.jobPositionsLevels?.length);
  const hasCurrentLevelFromUser = Boolean(props.selectedAccountUser?.jobPositionCurrentLevel?.uuid);
  return Boolean(currentJobPosition.value && (hasLevelsInJob || hasCurrentLevelFromUser));
});

function setSectorsFromItems(items: any): string[] {
  const uuids = Array.isArray(items)
    ? items.map((item: any) => item?.value ?? (typeof item === 'string' ? item : '')).filter(Boolean)
    : [];
  currentSectors.value = uuids;
  return uuids;
}

function sectorsOnBlur(field: any) {
  field.onBlur();
}

function onJobLevelChange(value: string, field: { onChange: (v: string | undefined) => void }) {
  currentJobLevel.value = value;
  field.onChange(value || undefined);
}

function onCareerPlanChange(v: string | undefined, field: { onChange: (v: string | undefined) => void }) {
  currentCareerPlan.value = v ?? '';
  field.onChange(v || undefined);
}

async function onSubmit(formValues: Record<string, any>) {
  const accountUser: AccountUserPayload = formValues as AccountUserPayload;
  const careerPlanUuid = currentCareerPlan.value || accountUser.career_plan_uuid;
  const careerPlanOption = careerPlanUuid ? careerPlanStore.careerPlansOptions.find(opt => opt.value === careerPlanUuid) : undefined;
  const jobPositionUuid = currentJobPosition.value || accountUser.job_position_uuid;
  const jobPositionOption = jobPositionUuid ? jobPositionStore.jobPositionsOptions.find(opt => opt.value === jobPositionUuid) : undefined;
  const sectorUuids = currentSectors.value?.length ? currentSectors.value : (accountUser.sector_uuids ?? (accountUser.sector_uuid ? [accountUser.sector_uuid] : []));
  const sectors = sectorUuids.map(uuid => {
    const opt = sectorStore.sectorsOptions.find(o => o.value === uuid);
    return { uuid, name: opt?.title ?? '' };
  });
  const saveOptions = {
    ...(careerPlanUuid && { careerPlan: { uuid: careerPlanUuid, name: careerPlanOption?.title ?? '' } }),
    ...(jobPositionUuid && { jobPosition: { uuid: jobPositionUuid, title: jobPositionOption?.title ?? '' } }),
    ...(sectors.length > 0 && { sectors }),
  };

  try {
    await accountUserStore.saveAccountUser(accountUser, props.selectedAccountUser?.uuid, Object.keys(saveOptions).length > 0 ? saveOptions : undefined);
    snackbarStore.show('Registro realizado com sucesso! Bem-vindo(a)!', 'success');
    close();
  } catch (err: any) {
    console.error('Erro no registro:', err);
    snackbarStore.show(accountUserStore.error || 'Falha ao salvar usuário.', 'error');
  }
};
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="modalValueChanged" max-width="800px" transition="dialog-transition">
    <Form @submit="onSubmit" :initial-values="userAccount">
      <v-card>
        <v-card-title class="text-h6 py-4">
          {{ !!selectedAccountUser ? 'Editar usuário' : 'Novo usuário' }}
        </v-card-title>
        <v-card-text class="pt-0">
          <v-container fluid class="pa-0">
            <v-row>
              <v-col cols="12" md="6">
                <Field name="name" label="Nome" rules="required|min:3|alpha_spaces" v-slot="{ field, errorMessage }">
                  <v-text-field
                    v-bind="field"
                    label="Nome"
                    prepend-inner-icon="mdi-account"
                    variant="solo-filled"
                    density="compact"
                    hide-details="auto"
                    :persistent-placeholder="!!props.selectedAccountUser?.name"
                    :error="!!errorMessage"
                    :error-messages="errorMessage"
                  />
                </Field>
              </v-col>
              <v-col cols="12" md="6">
                <Field name="email" label="E-mail" rules="required|email" v-slot="{ field, errorMessage }">
                  <v-text-field
                    v-bind="field"
                    label="E-mail"
                    prepend-inner-icon="mdi-email"
                    variant="solo-filled"
                    density="compact"
                    hide-details="auto"
                    :persistent-placeholder="!!props.selectedAccountUser?.email"
                    :error="!!errorMessage"
                    :error-messages="errorMessage"
                  />
                </Field>
              </v-col>
              <v-col cols="12" md="6">
                <Field name="cellphone" label="Telefone" rules="required|min:15|max:16" v-slot="{ field, errorMessage }">
                  <v-text-field
                    v-bind="field"
                    label="Telefone"
                    v-mask="['(##) #####-####', '(##) ####-####']"
                    prepend-inner-icon="mdi-phone"
                    variant="solo-filled"
                    density="compact"
                    hide-details="auto"
                    :persistent-placeholder="!!props.selectedAccountUser?.cellphone"
                    :error="!!errorMessage"
                    :error-messages="errorMessage"
                  />
                </Field>
              </v-col>
              <v-col cols="12" md="6">
                <Field name="cpf" rules="required|cpf" v-slot="{ field, errorMessage }">
                  <v-text-field
                    v-bind="field"
                    label="CPF"
                    v-mask="'###.###.###-##'"
                    prepend-inner-icon="mdi-card-account-details"
                    variant="solo-filled"
                    density="compact"
                    hide-details="auto"
                    :persistent-placeholder="!!props.selectedAccountUser?.cpf"
                    :error="!!errorMessage"
                    :error-messages="errorMessage"
                  />
                </Field>
              </v-col>
              <v-col cols="12" md="6">
                <Field name="password" label="Senha" :rules="!props.selectedAccountUser?.name ? 'required|min:6' : ''" v-slot="{ field, errorMessage }">
                  <v-text-field
                    v-bind="field"
                    v-model="passwordField"
                    label="Senha"
                    :type="showPassword ? 'text' : 'password'"
                    prepend-inner-icon="mdi-lock"
                    variant="solo-filled"
                    density="compact"
                    hide-details="auto"
                    :error="!!errorMessage"
                    :error-messages="errorMessage"
                    :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="showPassword = !showPassword"
                  />
                </Field>
              </v-col>
              <v-col cols="12" md="6">
                <Field name="confirmPassword" label="Confirmar senha" :rules="!props.selectedAccountUser?.name ? 'required|confirmed:@password' : ''" v-slot="{ field, errorMessage }">
                  <v-text-field
                    v-bind="field"
                    label="Confirmar senha"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    prepend-inner-icon="mdi-lock"
                    variant="solo-filled"
                    density="compact"
                    hide-details="auto"
                    :error="!!errorMessage"
                    :error-messages="errorMessage"
                    :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="showConfirmPassword = !showConfirmPassword"
                  />
                </Field>
              </v-col>
              <v-col v-if="!props.selectedAccountUser?.name || passwordField.length > 0" cols="12">
                <v-progress-linear
                  :model-value="passwordIndicator.value"
                  :color="passwordIndicator.color"
                  height="6"
                  rounded
                  class="mb-1"
                />
                <div class="text-caption" :class="`text-${passwordIndicator.color}`">
                  Nível de segurança da senha: <strong class="text-capitalize">{{ passwordIndicator.text }}</strong>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <Field name="role" rules="required" v-slot="{ field, errorMessage }">
                  <v-select
                    v-bind="field"
                    label="Permissão"
                    :items="userTypes"
                    item-value="value"
                    item-title="title"
                    item-props="disabled"
                    :return-object="false"
                    variant="solo-filled"
                    density="compact"
                    hide-details="auto"
                    persistent-placeholder
                    :error="!!errorMessage"
                    :error-messages="errorMessage"
                    :disabled="props.selectedAccountUser?.role?.name === RoleType.ADMIN"
                  >
                    <template v-slot:item="{ item, props: itemProps }">
                      <v-list-item v-bind="itemProps" :title="item.title" :subtitle="item.raw.subtitle" :disabled="item.raw.disabled" />
                    </template>
                  </v-select>
                </Field>
              </v-col>
              <v-col cols="12" md="6">
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
                    hide-details="auto"
                    clearable
                    :error="!!errorMessage"
                    :error-messages="errorMessage"
                  >
                    <template v-slot:item="{ props, item }">
                      <v-list-item v-bind="props" :title="item.raw.title" :disabled="item.raw.disabled" density="compact" />
                    </template>
                  </v-autocomplete>
                </Field>
              </v-col>
              <v-col cols="12" md="6">
                <Field name="job_position_current_level_uuid" label="Nível do cargo" v-slot="{ field, errorMessage }">
                  <v-select
                    v-bind="field"
                    :model-value="currentJobLevel"
                    @update:model-value="(v: string) => onJobLevelChange(v, field)"
                    label="Nível do cargo (Opcional)"
                    :items="jobLevelOptions"
                    item-title="title"
                    item-value="value"
                    variant="solo-filled"
                    density="compact"
                    hide-details="auto"
                    clearable
                    :disabled="!isJobLevelFieldEnabled"
                    :error="!!errorMessage"
                    :error-messages="errorMessage"
                  />
                </Field>
              </v-col>
              <v-col cols="12" md="6">
                <Field name="career_plan_uuid" label="Plano de carreira" v-slot="{ field }">
                  <v-select
                    :model-value="currentCareerPlan"
                    @update:model-value="(v: string) => onCareerPlanChange(v, field)"
                    label="Plano de carreira (Opcional)"
                    :items="careerPlanStore.careerPlansOptions"
                    item-value="value"
                    item-title="title"
                    variant="solo-filled"
                    density="compact"
                    hide-details
                    clearable
                    persistent-placeholder
                  />
                </Field>
              </v-col>
              <v-col cols="12">
                <Field name="sector_uuids" label="Setores" v-slot="{ field, errorMessage }">
                  <v-autocomplete
                    :model-value="currentSectors"
                    @update:model-value="(items: any) => {
                      const uuids = setSectorsFromItems(items);
                      field.onChange(uuids);
                    }"
                    @blur="sectorsOnBlur(field)"
                    label="Setores (Opcional)"
                    :items="sectorStore.sectorsOptions"
                    item-title="title"
                    item-value="value"
                    variant="solo-filled"
                    density="compact"
                    hide-details="auto"
                    clearable
                    multiple
                    chips
                    closable-chips
                    :error="!!errorMessage"
                    :error-messages="errorMessage"
                  >
                    <template v-slot:item="{ props, item }">
                      <v-list-item v-bind="props" :title="item.raw.title" :disabled="item.raw.disabled" density="compact" />
                    </template>
                  </v-autocomplete>
                </Field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-4 py-3">
          <v-spacer />
          <v-btn variant="text" @click="close">Cancelar</v-btn>
          <v-btn color="primary" variant="elevated" type="submit">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </Form>
  </v-dialog>
</template>
