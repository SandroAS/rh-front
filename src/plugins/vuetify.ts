import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { pt, en } from 'vuetify/locale'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

// Labs (Componentes experimentais do Vuetify)
// import { VSnackbarQueue } from 'vuetify/labs/VSnackbarQueue'
// import { VTimePicker } from 'vuetify/labs/VTimePicker'
import { VCalendar } from 'vuetify/labs/VCalendar'

export const vuetify = createVuetify({
  locale: {
    locale: 'pt',
    fallback: 'en',
    messages: { pt, en },
  },
  components: {
    ...components,
    //VSnackbarQueue,
    //VTimePicker,
    VCalendar
  },
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#0090D4',
          secondary: '#2B3342',
          accent: '#E5F4FB',
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi }
  }
})
