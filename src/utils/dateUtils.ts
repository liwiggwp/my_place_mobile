export function getTodayString(): string {
  const d = new Date();
  return formatDateToString(d);
}

export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(dateStr: string, days: number): string {
  const date = parseDateString(dateStr);
  date.setDate(date.getDate() + days);
  return formatDateToString(date);
}

export function diffInDays(dateStr1: string, dateStr2: string): number {
  const d1 = parseDateString(dateStr1);
  const d2 = parseDateString(dateStr2);
  const diffTime = d1.getTime() - d2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function isToday(dateStr: string): boolean {
  return dateStr === getTodayString();
}

export function formatRussianDate(dateStr: string, includeYear: boolean = false): string {
  const d = parseDateString(dateStr);
  const months = [
    'янв', 'фев', 'мар', 'апр', 'май', 'июн',
    'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
  ];
  const day = d.getDate();
  const month = months[d.getMonth()];
  return includeYear ? `${day} ${month} ${d.getFullYear()}` : `${day} ${month}`;
}

export function formatFullRussianDate(dateStr: string): string {
  const d = parseDateString(dateStr);
  const daysOfWeek = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  return `${daysOfWeek[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
}

export function getMonthMatrix(year: number, month: number): { dateStr: string; isCurrentMonth: boolean; dayNum: number }[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Day of week: 0 = Sun, 1 = Mon, ..., 6 = Sat. In Russian Mon is 0.
  let startDayOfWeek = firstDay.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  const totalDays = lastDay.getDate();
  const matrix: { dateStr: string; isCurrentMonth: boolean; dayNum: number }[][] = [];
  let currentWeek: { dateStr: string; isCurrentMonth: boolean; dayNum: number }[] = [];

  // Previous month padding
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dStr = formatDateToString(new Date(prevYear, prevMonth, day));
    currentWeek.push({ dateStr: dStr, isCurrentMonth: false, dayNum: day });
  }

  // Current month days
  for (let day = 1; day <= totalDays; day++) {
    const dStr = formatDateToString(new Date(year, month, day));
    currentWeek.push({ dateStr: dStr, isCurrentMonth: true, dayNum: day });

    if (currentWeek.length === 7) {
      matrix.push(currentWeek);
      currentWeek = [];
    }
  }

  // Next month padding
  if (currentWeek.length > 0) {
    let nextDay = 1;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    while (currentWeek.length < 7) {
      const dStr = formatDateToString(new Date(nextYear, nextMonth, nextDay));
      currentWeek.push({ dateStr: dStr, isCurrentMonth: false, dayNum: nextDay });
      nextDay++;
    }
    matrix.push(currentWeek);
  }

  return matrix;
}

export function getWeekDaysList(centerDateStr: string): { dateStr: string; dayName: string; dayNum: number; isToday: boolean }[] {
  const center = parseDateString(centerDateStr);
  const shortDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const todayStr = getTodayString();
  const result = [];

  for (let offset = -3; offset <= 3; offset++) {
    const d = new Date(center);
    d.setDate(center.getDate() + offset);
    const dStr = formatDateToString(d);
    result.push({
      dateStr: dStr,
      dayName: shortDays[d.getDay()],
      dayNum: d.getDate(),
      isToday: dStr === todayStr
    });
  }

  return result;
}
