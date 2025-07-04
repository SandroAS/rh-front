<script setup lang="ts">
import { ref } from 'vue'
import { Form, Field } from '@/plugins/vee-validate'
import { useUserStore } from '@/stores/user.store'
import { useSnackbarStore } from '@/stores/snackbar.store';
import type ProfilePassword from '@/types/profile/profile-password.type';

const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const userStore = useUserStore();
const snackbarStore = useSnackbarStore();

async function onSubmit(formValues: Record<string, any>) {
  const password: ProfilePassword = formValues as ProfilePassword;
  try {
    await userStore.savePassword(password);
    snackbarStore.show('Usuário atualizado com sucesso!', 'success')
  } catch (err) {
    snackbarStore.show('Falha ao tentar atualizar usuário: ' + err, 'error')
  }
}
</script>

<template>
  <v-row>
    <v-col cols="12" md="4" class="pr-md-6">
      <h5 class="text-subtitle-1 font-weight-medium">Alterar Senha</h5>
      <p v-if="userStore.user!.password" class="text-body-2 text-medium-emphasis">
        Atualize a senha associada à sua conta.
      </p>
      <p v-else class="text-body-2 text-medium-emphasis">
        Você se cadastrou pela autenticação do Google e ainda não tem uma senha cadastrada, crie uma para também poder
        logar com e-mail e senha.
      </p>
    </v-col>

    <v-col cols="12" md="8">
      <Form @submit="onSubmit">
        <v-row>
          <v-col v-show="userStore.user!.password" cols="12">
            <Field name="current_password" :rules="{ required: !!userStore.user!.password, min: 6 }"
              v-slot="{ field, errorMessage }">
              <v-text-field v-bind="field" label="Senha Atual" :type="showCurrentPassword ? 'text' : 'password'"
                variant="solo-filled" density="compact" :error="!!errorMessage" :error-messages="errorMessage"
                :append-inner-icon="showCurrentPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showCurrentPassword = !showCurrentPassword" />
            </Field>
          </v-col>

          <v-col cols="12">
            <Field name="new_password" rules="required|min:6" v-slot="{ field, errorMessage }">
              <v-text-field v-bind="field" label="Nova Senha" :type="showNewPassword ? 'text' : 'password'"
                variant="solo-filled" density="compact" :error="!!errorMessage" :error-messages="errorMessage"
                :append-inner-icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showNewPassword = !showNewPassword" />
            </Field>
          </v-col>

          <v-col cols="12">
            <Field name="confirmed_new_pass" rules="required|confirmed:@new_password" v-slot="{ field, errorMessage }">
              <v-text-field v-bind="field" label="Confirmação da Nova Senha"
                :type="showConfirmPassword ? 'text' : 'password'" variant="solo-filled" density="compact"
                :error="!!errorMessage" :error-messages="errorMessage"
                :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showConfirmPassword = !showConfirmPassword" />
            </Field>
          </v-col>

          <v-col cols="12" class="d-flex justify-end">
            <v-btn type="submit" color="primary">Salvar</v-btn>
          </v-col>
        </v-row>
      </Form>
    </v-col>
  </v-row>
</template>