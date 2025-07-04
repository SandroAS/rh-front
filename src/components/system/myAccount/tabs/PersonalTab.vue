<script setup lang="ts">
import ProfilePersonalInformationForm from '../profile/ProfilePersonalInformationForm.vue';
import ProfileCompanyForm from '../profile/ProfileCompanyForm.vue';
import ProfilePassworldForm from '../profile/ProfilePassworldForm.vue';

</script>

<template>
  <ProfilePersonalInformationForm />

  <v-divider class="my-10" />

  <ProfileCompanyForm />

  <v-divider class="my-10"></v-divider>

  <ProfilePassworldForm />
</template>
