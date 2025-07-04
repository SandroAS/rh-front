import { defineStore } from 'pinia'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: number
  text: string
  type: ToastType
  color?: string
  active: boolean
}

let idCounter = 0
export const useSnackbarStore = defineStore('snackbar', {
  state: () => ({
    messages: [] as ToastMessage[],
  }),
  actions: {
    show(text: string, type: ToastType = 'info') {
      const colorMap = {
        success: 'green',
        error: 'red',
        warning: 'orange',
        info: 'blue',
      }

      this.messages.push({
        id: ++idCounter,
        text,
        type,
        color: colorMap[type],
        active: true
      })
    },
    clear() {
      this.messages = []
    },
  },
})
