<script setup lang="ts">
  import { computed, onMounted } from 'vue'
  import dayjs from 'dayjs'
  import isToday from 'dayjs/plugin/isToday'
  import isYesterday from 'dayjs/plugin/isYesterday'
  import { useNotificationStore } from '@/stores/notification.store'
  import type Notification from '@/types/notification/notification.type'
  import type NotificationItem from '@/types/notification/notification-item.type'
  import { NotificationCategory } from '@/types/notification/notification.type'
  import { EvaluationType } from '@/types/evaluationApplication/evaluation-application.type'

  dayjs.extend(isToday)
  dayjs.extend(isYesterday)

  const notificationStore = useNotificationStore()

  enum NotificationTemplateKey {
    EVALUATION_APPLICATION_PEER = 'EVALUATION_APPLICATION_' + EvaluationType.PEER,
    EVALUATION_APPLICATION_SELF = 'EVALUATION_APPLICATION_' + EvaluationType.SELF,
    EVALUATION_APPLICATION_LEADER = 'EVALUATION_APPLICATION_' + EvaluationType.LEADER,
    EVALUATION_APPLICATION_SUBORDINATE = 'EVALUATION_APPLICATION_' + EvaluationType.SUBORDINATE,
    EVALUATION_APPLICATION_CLIENT = 'EVALUATION_APPLICATION_' + EvaluationType.CLIENT,
    EVALUATION_APPLICATION_OTHER = 'EVALUATION_APPLICATION_' + EvaluationType.OTHER,
  }

  const TEMPLATE_MESSAGES: Record<string, string> = {
    [NotificationTemplateKey.EVALUATION_APPLICATION_SELF]: 'Você tem uma autoavaliação pendente.',
    [NotificationTemplateKey.EVALUATION_APPLICATION_PEER]: 'Você tem uma avaliação de pares pendente.',
    [NotificationTemplateKey.EVALUATION_APPLICATION_LEADER]: 'Você tem uma avaliação de líder pendente.',
    [NotificationTemplateKey.EVALUATION_APPLICATION_SUBORDINATE]: 'Você tem uma avaliação de liderado pendente.',
    [NotificationTemplateKey.EVALUATION_APPLICATION_CLIENT]: 'Você tem uma avaliação de cliente pendente.',
    'DEFAULT': 'Você recebeu uma atualização no sistema.'
  }

  const CATEGORY_CONFIG = {
    [NotificationCategory.INFO]: { icon: 'mdi-information', color: 'blue' },
    [NotificationCategory.WARNING]: { icon: 'mdi-alert-circle', color: 'orange' },
    [NotificationCategory.URGENT]: { icon: 'mdi-alert-decagram', color: 'red' }
  }

  onMounted(async () => {
    await notificationStore.getNotifications({ 
      page: 1, 
      limit: 20, 
      sort_column: 'created_at', 
      sort_order: 'desc', 
      search_term: '' 
    })
  })

  const notifications = computed(() => (notificationStore.notifications as Notification[]) || [])

  const formatNotification = (notification: Notification) => {
    const config = CATEGORY_CONFIG[notification.category] || CATEGORY_CONFIG[NotificationCategory.INFO]

    let link = null
    if (notification.evaluation_application_uuid) {
      link = `/forms/avaliacao/${notification.evaluation_application_uuid}`
    } else if (notification.redirect_url) {
      link = notification.redirect_url
    }

    return {
      uuid: notification.uuid,
      time: dayjs(notification.created_at).format('HH:mm'),
      description: TEMPLATE_MESSAGES[notification.template_key] || TEMPLATE_MESSAGES['DEFAULT'],
      link,
      viewed: !!notification.viewed_at,
      icon: config.icon,
      color: config.color
    } as NotificationItem
  }

  const groupedNotifications = computed(() => {
    const groups: Record<string, ReturnType<typeof formatNotification>[]> = {}

    notifications.value.forEach(n => {
      if (n.is_hidden) return

      const date = dayjs(n.created_at)
      let label = date.format('DD [de] MMMM')

      if (date.isToday()) label = 'Hoje'
      else if (date.isYesterday()) label = 'Ontem'

      if (!groups[label]) groups[label] = []
      groups[label].push(formatNotification(n))
    })

    return groups
  })

  const unreadCount = computed(() => notifications.value.filter(n => !n.viewed_at && !n.is_hidden).length)

  const markAsRead = async (notification: NotificationItem) => {
    if(!notification.viewed) {
      await notificationStore.markAsRead(notification.uuid)
    };
  }
</script>

<template>
  <v-menu offset-y :close-on-content-click="false" location="bottom end" transition="slide-y-transition">
    <template #activator="{ props }">
      <v-btn icon v-bind="props">
        <v-badge
          :content="unreadCount"
          :model-value="unreadCount > 0"
          color="red-accent-4"
          overlap
        >
          <v-icon>{{ unreadCount > 0 ? 'mdi-bell' : 'mdi-bell-outline' }}</v-icon>
        </v-badge>
      </v-btn>
    </template>

    <v-card width="380" elevation="12" border class="rounded-lg">
      <v-card-title class="d-flex justify-space-between align-center py-4 px-4">
        <div class="d-flex align-center">
          <span class="text-h6 font-weight-bold">Notificações</span>
          <v-chip v-if="unreadCount > 0" size="x-small" color="primary" class="ml-2 font-weight-bold">
            {{ unreadCount }} NOVAS
          </v-chip>
        </div>
        <v-btn 
          v-if="unreadCount > 0" 
          variant="text" 
          density="comfortable" 
          size="small" 
          color="primary"
          class="text-none"
          @click="notificationStore.markAllAsRead()"
        >
          Marcar tudo como lido
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-0" style="max-height: 450px; overflow-y: auto;">
        <div v-if="notifications.length === 0" class="pa-10 text-center">
          <v-icon size="64" class="mb-4" color="grey-lighten-2">mdi-bell-sleep-outline</v-icon>
          <div class="text-body-1 text-medium-emphasis">Tudo em dia!</div>
          <div class="text-caption text-disabled">Você não tem notificações no momento.</div>
        </div>

        <template v-else v-for="(items, group) in groupedNotifications" :key="group">
          <div class="px-4 py-2 bg-grey-lighten-4 text-caption font-weight-bold text-uppercase text-grey-darken-1">
            {{ group }}
          </div>

          <v-list class="pa-0" lines="three">
            <v-list-item
              v-for="item in items"
              :key="item.uuid"
              :active="!item.viewed"
              link
              class="notification-item"
              @click="markAsRead(item)"
            >
              <template #prepend>
                <v-avatar :color="item.viewed ? 'grey-lighten-3' : item.color + '-lighten-5'" size="40">
                  <v-icon :color="item.viewed ? 'grey' : item.color" size="20">
                    {{ item.icon }}
                  </v-icon>
                </v-avatar>
              </template>

              <v-list-item-title 
                :class="['text-body-2', item.viewed ? 'text-medium-emphasis' : 'font-weight-bold']"
              >
                {{ item.description }}
              </v-list-item-title>

              <v-list-item-subtitle class="mt-1 d-flex flex-column">
                <span class="text-caption mb-1">{{ item.time }}</span>
                <router-link 
                  v-if="item.link" 
                  :to="item.link" 
                  class="text-primary text-decoration-none text-caption font-weight-bold d-flex align-center"
                >
                  ACESSAR AVALIAÇÃO <v-icon size="14" class="ml-1">mdi-arrow-right</v-icon>
                </router-link>
              </v-list-item-subtitle>

              <template #append v-if="!item.viewed">
                <div class="unread-dot"></div>
              </template>
            </v-list-item>
          </v-list>
        </template>
      </v-card-text>

      <v-divider />
      <v-btn variant="text" block class="text-none font-weight-bold py-3" height="auto">
        Ver Histórico Completo
      </v-btn>
    </v-card>
  </v-menu>
</template>

<style scoped>
  .notification-item {
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
    transition: background-color 0.2s;
  }

  .unread-dot {
    width: 8px;
    height: 8px;
    background-color: rgb(var(--v-theme-primary));
    border-radius: 50%;
  }

  :deep(.v-list-item--active) {
    background-color: rgba(var(--v-theme-primary), 0.04) !important;
    opacity: 1 !important;
  }

  .text-wrap {
    white-space: normal;
  }
</style>
