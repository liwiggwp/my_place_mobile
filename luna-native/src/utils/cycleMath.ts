import type { CyclePeriod, CycleSettings, CyclePrediction, CyclePhase } from '../types';

export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(dateStr: string, days: number): string {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function diffDays(date1: string, date2: string): number {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  return Math.round((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
}

export function getCyclePrediction(
  periods: CyclePeriod[],
  settings: CycleSettings,
  targetDate: string = getTodayString()
): CyclePrediction {
  const avgCycle = settings.averageCycleLength || 28;
  const avgPeriod = settings.averagePeriodLength || 5;
  const luteal = settings.lutealPhaseLength || 14;

  const sorted = [...periods].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const latest = sorted[0];

  if (!latest) {
    const nextStart = addDays(targetDate, 14);
    return {
      currentDayOfCycle: 1,
      currentPhase: 'follicular',
      phaseName: 'Фолликулярная фаза',
      phaseDescription: 'Энергия растет, прекрасное время для спорта и новых планов.',
      daysUntilNextPeriod: 14,
      nextPeriodStartDate: nextStart,
      nextPeriodEndDate: addDays(nextStart, avgPeriod - 1),
      ovulationDate: addDays(nextStart, -luteal),
      fertileWindowStart: addDays(nextStart, -luteal - 5),
      fertileWindowEnd: addDays(nextStart, -luteal + 1),
      pregnancyChance: 'low'
    };
  }

  const daysSince = diffDays(targetDate, latest.startDate);
  const cycleDay = (daysSince % avgCycle) + 1;

  let cyclesPassed = Math.floor(daysSince / avgCycle);
  if (daysSince < 0) cyclesPassed = -1;
  const currentCycleStart = addDays(latest.startDate, cyclesPassed * avgCycle);
  const nextStart = addDays(currentCycleStart, avgCycle);
  const nextEnd = addDays(nextStart, avgPeriod - 1);

  const ovulationDate = addDays(nextStart, -luteal);
  const fertileStart = addDays(ovulationDate, -5);
  const fertileEnd = addDays(ovulationDate, 1);
  const daysUntilNext = diffDays(nextStart, targetDate);

  let phase: CyclePhase = 'follicular';
  let phaseName = 'Фолликулярная фаза';
  let phaseDescription = 'Энергия и выносливость нарастают. Прекрасный период для активности.';
  let pregnancyChance: 'low' | 'high' = 'low';

  const isPeriod = daysSince >= 0 && daysSince < avgPeriod && (!latest.endDate || targetDate <= latest.endDate);

  if (isPeriod || (daysSince >= 0 && (daysSince % avgCycle) < avgPeriod)) {
    phase = 'menstruation';
    phaseName = 'Менструация';
    phaseDescription = 'Время замедлиться, пить теплую воду и отдыхать.';
    pregnancyChance = 'low';
  } else if (targetDate >= fertileStart && targetDate <= fertileEnd) {
    phase = 'ovulation';
    phaseName = targetDate === ovulationDate ? 'День овуляции' : 'Окно фертильности';
    phaseDescription = 'Пик сил, привлекательности и энергии. Высокая вероятность зачатия.';
    pregnancyChance = 'high';
  } else if (targetDate > fertileEnd && targetDate < nextStart) {
    phase = 'luteal';
    phaseName = 'Лютеиновая фаза';
    phaseDescription = 'Организм готовится к новому циклу. Полезны йога, магний и покой.';
    pregnancyChance = 'low';
  }

  return {
    currentDayOfCycle: Math.max(1, cycleDay),
    currentPhase: phase,
    phaseName,
    phaseDescription,
    daysUntilNextPeriod: Math.max(0, daysUntilNext),
    nextPeriodStartDate: nextStart,
    nextPeriodEndDate: nextEnd,
    ovulationDate,
    fertileWindowStart: fertileStart,
    fertileWindowEnd: fertileEnd,
    pregnancyChance
  };
}
