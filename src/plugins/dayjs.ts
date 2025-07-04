import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import isToday from 'dayjs/plugin/isToday'
import isYesterday from 'dayjs/plugin/isYesterday'
import 'dayjs/locale/pt-br'

dayjs.extend(utc)
dayjs.extend(duration)
dayjs.extend(relativeTime)
dayjs.extend(isToday)
dayjs.extend(isYesterday)
dayjs.locale('pt-br')

export default dayjs
