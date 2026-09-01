import type { CyclePeriod, CycleSettings, CyclePrediction, CyclePhase } from '../types';
import { addDays, diffInDays, getTodayString } from './dateUtils';

export function calculateAverageCycleLength(periods: CyclePeriod[], defaultLength: number = 28): number {
  if (!periods || periods.length < 2) return defaultLength;

  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const diffs: number[] = [];

  for (let i = 1; i < sorted.length; i++) {
    const diff = diffInDays(sorted[i].startDate, sorted[i - 1].startDate);
    if (diff >= 20 && diff <= 45) {
      diffs.push(diff);
    }
  }

  if (diffs.length === 0) return defaultLength;
  const sum = diffs.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / diffs.length);
}

export function calculateAveragePeriodLength(periods: CyclePeriod[], defaultLength: number = 5): number {
  if (!periods || periods.length === 0) return defaultLength;

  const validLengths = periods
    .map(p => {
      if (p.length) return p.length;
      if (p.endDate) return diffInDays(p.endDate, p.startDate) + 1;
      return null;
    })
    .filter((len): len is number => len !== null && len >= 2 && len <= 10);

  if (validLengths.length === 0) return defaultLength;
  const sum = validLengths.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / validLengths.length);
}

export function getLatestPeriod(periods: CyclePeriod[]): CyclePeriod | null {
  if (!periods || periods.length === 0) return null;
  return [...periods].sort((a, b) => b.startDate.localeCompare(a.startDate))[0];
}

export function getCyclePrediction(
  periods: CyclePeriod[],
  settings: CycleSettings,
  targetDate: string = getTodayString()
): CyclePrediction {
  const avgCycle = calculateAverageCycleLength(periods, settings.averageCycleLength);
  const avgPeriod = calculateAveragePeriodLength(periods, settings.averagePeriodLength);
  const luteal = settings.lutealPhaseLength || 14;

  const latestPeriod = getLatestPeriod(periods);

  if (!latestPeriod) {
    const nextStart = addDays(targetDate, 14);
    const nextEnd = addDays(nextStart, avgPeriod - 1);
    const ovulDate = addDays(nextStart, -luteal);
    const fertStart = addDays(ovulDate, -5);
    const fertEnd = addDays(ovulDate, 1);

    return {
      currentDayOfCycle: 1,
      currentPhase: 'follicular',
      phaseName: 'Фолликулярная фаза',
      phaseDescription: 'Время для новых идей, энергии и активности. Уровень эстрогена растет.',
      daysUntilNextPeriod: 14,
      nextPeriodStartDate: nextStart,
      nextPeriodEndDate: nextEnd,
      ovulationDate: ovulDate,
      fertileWindowStart: fertStart,
      fertileWindowEnd: fertEnd,
      pregnancyChance: 'low'
    };
  }

  const daysSinceStart = diffInDays(targetDate, latestPeriod.startDate);
  const cycleDay = (daysSinceStart % avgCycle) + 1;

  let cyclesPassed = Math.floor(daysSinceStart / avgCycle);
  if (daysSinceStart < 0) cyclesPassed = -1;
  const currentCycleStartDate = addDays(latestPeriod.startDate, cyclesPassed * avgCycle);
  const nextPeriodStart = addDays(currentCycleStartDate, avgCycle);
  const nextPeriodEnd = addDays(nextPeriodStart, avgPeriod - 1);

  const ovulationDate = addDays(nextPeriodStart, -luteal);
  const fertileStart = addDays(ovulationDate, -5);
  const fertileEnd = addDays(ovulationDate, 1);

  const daysUntilNext = diffInDays(nextPeriodStart, targetDate);

  let phase: CyclePhase = 'follicular';
  let phaseName = 'Фолликулярная фаза';
  let phaseDescription = 'Энергия нарастает, прекрасное время для спорта, учебы и проектов.';
  let pregnancyChance: 'low' | 'medium' | 'high' = 'low';

  const isPeriodDay = daysSinceStart >= 0 && daysSinceStart < avgPeriod && (!latestPeriod.endDate || targetDate <= latestPeriod.endDate);

  if (isPeriodDay || (daysSinceStart >= 0 && (daysSinceStart % avgCycle) < avgPeriod)) {
    phase = 'menstruation';
    phaseName = 'Менструальная фаза';
    phaseDescription = 'Время замедлиться, окружить себя заботой, пить теплую воду и отдыхать.';
    pregnancyChance = 'low';
  } else if (targetDate >= fertileStart && targetDate <= fertileEnd) {
    if (targetDate === ovulationDate) {
      phase = 'ovulation';
      phaseName = 'День овуляции';
      phaseDescription = 'Пик фертильности и женской привлекательности. Высокий уровень энергии.';
      pregnancyChance = 'high';
    } else {
      phase = 'ovulation';
      phaseName = 'Окно фертильности';
      phaseDescription = 'Высокая вероятность зачатия. Пик выносливости и хорошего настроения.';
      pregnancyChance = 'high';
    }
  } else if (targetDate > fertileEnd && targetDate < nextPeriodStart) {
    phase = 'luteal';
    phaseName = 'Лютеиновая фаза';
    phaseDescription = 'Организм готовится к новому циклу. Полезны спокойные прогулки, магний и уют.';
    pregnancyChance = 'low';
  }

  return {
    currentDayOfCycle: Math.max(1, cycleDay),
    currentPhase: phase,
    phaseName,
    phaseDescription,
    daysUntilNextPeriod: Math.max(0, daysUntilNext),
    nextPeriodStartDate: nextPeriodStart,
    nextPeriodEndDate: nextPeriodEnd,
    ovulationDate,
    fertileWindowStart: fertileStart,
    fertileWindowEnd: fertileEnd,
    pregnancyChance
  };
}

export function getDateStatus(
  dateStr: string,
  periods: CyclePeriod[],
  settings: CycleSettings
): {
  isPeriod: boolean;
  isPredictedPeriod: boolean;
  isOvulation: boolean;
  isFertile: boolean;
} {
  const avgCycle = calculateAverageCycleLength(periods, settings.averageCycleLength);
  const avgPeriod = calculateAveragePeriodLength(periods, settings.averagePeriodLength);
  const luteal = settings.lutealPhaseLength || 14;

  for (const period of periods) {
    const end = period.endDate || addDays(period.startDate, avgPeriod - 1);
    if (dateStr >= period.startDate && dateStr <= end) {
      return { isPeriod: true, isPredictedPeriod: false, isOvulation: false, isFertile: false };
    }
  }

  const latest = getLatestPeriod(periods);
  if (!latest) {
    return { isPeriod: false, isPredictedPeriod: false, isOvulation: false, isFertile: false };
  }

  for (let i = 1; i <= 4; i++) {
    const predStart = addDays(latest.startDate, avgCycle * i);
    const predEnd = addDays(predStart, avgPeriod - 1);
    const predOvul = addDays(predStart, -luteal);
    const predFertStart = addDays(predOvul, -5);
    const predFertEnd = addDays(predOvul, 1);

    if (dateStr >= predStart && dateStr <= predEnd) {
      return { isPeriod: false, isPredictedPeriod: true, isOvulation: false, isFertile: false };
    }
    if (dateStr === predOvul) {
      return { isPeriod: false, isPredictedPeriod: false, isOvulation: true, isFertile: true };
    }
    if (dateStr >= predFertStart && dateStr <= predFertEnd) {
      return { isPeriod: false, isPredictedPeriod: false, isOvulation: false, isFertile: true };
    }
  }

  return { isPeriod: false, isPredictedPeriod: false, isOvulation: false, isFertile: false };
}
