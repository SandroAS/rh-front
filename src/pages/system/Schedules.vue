<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useDate } from 'vuetify'

interface CalendarEvent {
  title: string
  start: Date
  end: Date
  color: string
  allDay: boolean
}

const type = ref<'month' | 'week' | 'day'>('week')
const types = [
  { text: 'MÊS', value: 'month' },
  { text: 'SEMANA', value: 'week' },
  { text: 'DIA', value: 'day' },
]

const intervalSetting = ref<{ min: 60, intervalStart: 5, intervals: 16 } | { min: 30, intervalStart: 11, intervals: 30 } | { min: 15, intervalStart: 23, intervals: 58 }>({ min: 15, intervalStart: 23, intervals: 58 })
const intervalsSettings = [
  { text: '60 min', value: { min: 60, intervalStart: 5, intervals: 16 } },
  { text: '30 min', value: { min: 30, intervalStart: 11, intervals: 30 } },
  { text: '15 min', value: { min: 15, intervalStart: 23, intervals: 58 } },
]

const value = ref<Date[]>([new Date()])
const events = ref<CalendarEvent[]>([])

const colors = ['blue', 'indigo', 'deep-purple', 'cyan', 'green', 'orange', 'grey darken-1']
const titles = ['Atendimento', 'Feriado', 'Reunião', 'Viagem', 'Cirurgia', 'Aniversário', 'Conferência']

const dateAdapter = useDate()

function getEvents({ start, end }: { start: Date; end: Date }) {
  const generatedEvents: CalendarEvent[] = []

  const min = start
  const max = end
  const days = (max.getTime() - min.getTime()) / 86400000
  const eventCount = rnd(days, days + 20)

  for (let i = 0; i < eventCount; i++) {
    const allDay = rnd(0, 3) === 0
    const firstTimestamp = rnd(min.getTime(), max.getTime())
    const first = new Date(firstTimestamp - (firstTimestamp % 900000))
    const secondTimestamp = rnd(2, allDay ? 288 : 8) * 900000
    const second = new Date(first.getTime() + secondTimestamp)

    // generatedEvents.push({
    //   title: titles[rnd(0, titles.length - 1)],
    //   start: first,
    //   end: second,
    //   color: colors[rnd(0, colors.length - 1)],
    //   allDay: !allDay,
    // })
    // console.log('Event:', {
    //   title: titles[rnd(0, titles.length - 1)],
    //   start: first,
    //   end: second,
    //   color: colors[rnd(0, colors.length - 1)],
    //   allDay: !allDay,
    // })
  }

  generatedEvents.push({
    allDay: false,
    color: "orange",
    end: new Date("2025-05-25T09:45:00"),
    start: new Date("2025-05-25T07:00:00"),
    title: "Feriado"
  })

  generatedEvents.push({
    allDay: false,
    color: "red",
    end: new Date("2025-05-25T13:00:00"),
    start: new Date("2025-05-25T12:00:00"),
    title: "Feriado2"
  })

  events.value = generatedEvents
}

function rnd(a: number, b: number): number {
  return Math.floor((b - a + 1) * Math.random()) + a
}

const calendarValue = ref([{ date: new Date().toISOString().substr(0, 10) }])

const appointments = ref([
  {
    id: 1,
    patient: { name: 'João Silva' },
    date: '2025-05-18T09:00:00',
  },
  {
    id: 2,
    patient: { name: 'Maria Oliveira' },
    date: '2025-05-18T14:30:00',
  },
  {
    id: 3,
    patient: { name: 'Carlos Souza' },
    date: '2025-05-21T11:00:00',
  },
])

const upcomingAppointments = computed(() => {
  const now = new Date()
  return appointments.value
    .filter(a => new Date(a.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)
})

const calendarEvents = computed(() =>
  appointments.value.map(a => ({
    name: a.patient.name,
    start: a.date,
    color: 'primary',
  }))
)

function getAppointmentsForDay(dateString: string) {
  return appointments.value.filter(a => {
    const aDate = new Date(a.date).toISOString().substr(0, 10)
    return aDate === dateString
  })
}

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDay({ date }: { date: string }) {
  return new Date(date).getDate().toString()
}

onMounted(() => {
  const start = dateAdapter.startOfDay(dateAdapter.startOfMonth(new Date())) as Date
  const end = dateAdapter.endOfDay(dateAdapter.endOfMonth(new Date())) as Date
  getEvents({ start, end })

  const wrong12Am = document.getElementsByClassName('v-calendar-day__row-label')
  if(wrong12Am[0].textContent === '12 AM') {
    wrong12Am[0].innerHTML = ''
  }
})

interface IntervalFormatArg {
  label: string
  start: unknown
  end: unknown
  events: CalendarEvent[]
}

function labelHoursMinuts(n: IntervalFormatArg): string {
  return n.label
}

function isFirstInterval(event: CalendarEvent, interval: IntervalFormatArg) {
  if (typeof interval.start === 'object' && interval.start != null) {
    const eventStart = new Date(event.start)
    const intervalStart = new Date(interval.start)

    return (
      eventStart.getDay() === intervalStart.getDay() &&
      eventStart.getHours() === intervalStart.getHours() &&
      eventStart.getMinutes() === intervalStart.getMinutes()
    )
  }
  return false
}

function isLastInterval(event: CalendarEvent, interval: IntervalFormatArg) {
  if (typeof interval.start === 'object' && interval.start != null) {
    const intervalStart = new Date(interval.start)
    const nextIntervalStart = new Date(intervalStart.getTime() + intervalSetting.value.min * 60 * 1000)
    const eventEnd = new Date(event.end)

    return eventEnd > intervalStart && eventEnd <= nextIntervalStart
  }
  return false
}

function computeHeight(event: CalendarEvent, interval: IntervalFormatArg) {
  const isLast = isLastInterval(event, interval)

  if (!isLast) return '32px'

  const start = new Date(event.start).getTime()
  const end = new Date(event.end).getTime()
  const durationMinutes = (end - start) / 60000

  const remainder = durationMinutes % 60

  if (remainder === 15) {
    if(intervalSetting.value.min === 30) return '16px'
    if(intervalSetting.value.min === 60) return '8px'
  }
  if (remainder === 30) {
    if(intervalSetting.value.min === 60) return '16px'
  }
  if (remainder === 45) {
    if(intervalSetting.value.min === 30) return '16px'
    if(intervalSetting.value.min === 60) return '24px'
  }

  return '32px'
}

// watchEffect(() => {
//   events.value = appointments.value.map(a => ({
//     title: a.patient.name,
//     start: new Date(a.date),
//     end: new Date(new Date(a.date).getTime() + 60 * 60 * 1000), // 1h default
//     color: 'primary',
//     allDay: false,
//   }))
// })

function openEventDialog(event: CalendarEvent) {
  console.log('openEventDialog')
}

const mouseOver = ref(false)
</script>


<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="3">
        <h3 class="mb-2">Próximos agendamentos</h3>
        <v-list density="compact">
          <v-list-item
            v-for="appointment in upcomingAppointments"
            :key="appointment.id"
          >
            <v-list-item-title class="font-weight-medium">
              {{ appointment.patient.name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ formatDateTime(appointment.date) }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-col>

      <v-col cols="12" md="12">
        <v-row justify="end">
          <v-col cols="12" md="6">
            <h3 class="mb-2">Calendário de agendamentos</h3>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="type"
              :items="types"
              item-title="text"
              item-value="value"
              label="Modo de exibição"
              density="comfortable"
              variant="solo-filled"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="intervalSetting"
              :items="intervalsSettings"
              item-title="text"
              item-value="value"
              label="Intervalos de horas/minutos"
              density="comfortable"
              variant="solo-filled"
              hide-details
            />
          </v-col>
        </v-row>
        <v-calendar
          v-model="value"
          :events="events"
          :view-mode="type"
          :first-day-of-week="0"
          :interval-duration="intervalSetting.min"
          :interval-start="intervalSetting.intervalStart"
          :intervals="intervalSetting.intervals"
          :interval-format="labelHoursMinuts"
          :interval-height="32"
        >
          <template #header="{ title, clickNext, clickPrev, clickToday }">
            <div class="text-h4">
              {{ title.charAt(0).toUpperCase() + title.slice(1) }}
            </div>
          </template>
          <template #intervalEvent="{ event, height, margin, eventClass, interval }">
            <div
              :class="{'custom-event': true, 'hovered': mouseOver, eventClass}"
              :style="{
                height: computeHeight(event, interval),
                margin: '0px',
                backgroundColor: event.color || 'blue',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                padding: '4px',
                overflow: 'hidden',
                borderRadius: '0px',
                fontSize: '12px',
                color: isFirstInterval(event, interval) ? 'white' : 'transparent',
                borderTopLeftRadius: isFirstInterval(event, interval) ? '4px' : '0',
                borderTopRightRadius: isFirstInterval(event, interval) ? '4px' : '0',
                borderBottomLeftRadius: isLastInterval(event, interval) ? '4px' : '0',
                borderBottomRightRadius: isLastInterval(event, interval) ? '4px' : '0',
                cursor: 'pointer',
                transition: 'filter 0.2s ease'
              }"
              :title="event.title"
              @mouseover="mouseOver = true"
              @mouseleave="mouseOver = false"
              @click.prevent="openEventDialog(event)"
            >
              {{ isFirstInterval(event, interval) ? event.title : '\u00A0' }}
            </div>
          </template>
        </v-calendar>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.text-grey {
  color: #aaa;
}
</style>

<style>
.v-calendar__container {
  padding: 4px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.v-calendar__container {
  overflow: auto;
  height: 500px;
}

.v-calendar-day__row-with-label .v-calendar-day__row-hairline:after {
    content: "";
    border-bottom: none;
    position: absolute;
    width: 100%;
    margin-top: -1px;
    z-index: 3;
    pointer-events: none;
}

.v-calendar-day__row-hairline {
  border-bottom: thin solid #e0e0e0;
}

.custom-event {
  display: flex;
  align-items: flex-start;
}

.custom-event.hovered {
  filter: brightness(0.90);
}
</style>
