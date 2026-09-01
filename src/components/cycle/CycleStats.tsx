import React from 'react';
import type { CyclePrediction, CyclePeriod, CycleSettings, DayLog } from '../../types';
import { calculateAverageCycleLength, calculateAveragePeriodLength, getLatestPeriod } from '../../utils/cycleCalculations';
import { formatRussianDate, diffInDays } from '../../utils/dateUtils';
import { Sparkles, Utensils, Dumbbell, Moon, Heart, Flame } from 'lucide-react';

interface CycleStatsProps {
  prediction: CyclePrediction;
  periods: CyclePeriod[];
  settings: CycleSettings;
  dayLogs?: Record<string, DayLog>;
}

export const CycleStats: React.FC<CycleStatsProps> = ({ prediction, periods, settings, dayLogs = {} }) => {
  const avgCycle = calculateAverageCycleLength(periods, settings.averageCycleLength);
  const avgPeriod = calculateAveragePeriodLength(periods, settings.averagePeriodLength);
  const latest = getLatestPeriod(periods);

  // Calculate intimacy stats for current cycle
  let cycleIntimacyCount = 0;
  let fertileIntimacyCount = 0;
  let protectedCount = 0;
  let orgasmCount = 0;

  if (latest) {
    Object.entries(dayLogs).forEach(([dateStr, log]) => {
      if (dateStr >= latest.startDate) {
        const hasSex = log.intimacy?.hadSex || (log.sexActivity && log.sexActivity !== 'none');
        if (hasSex) {
          cycleIntimacyCount += (log.intimacy?.timesCount || 1);
          if (dateStr >= prediction.fertileWindowStart && dateStr <= prediction.fertileWindowEnd) {
            fertileIntimacyCount += (log.intimacy?.timesCount || 1);
          }
          if (log.intimacy?.type !== 'unprotected' && log.sexActivity !== 'unprotected') {
            protectedCount += (log.intimacy?.timesCount || 1);
          }
          if (log.intimacy?.orgasm === 'yes' || log.intimacy?.orgasm === 'multiple') {
            orgasmCount++;
          }
        }
      }
    });
  }

  const getPhaseTips = () => {
    switch (prediction.currentPhase) {
      case 'menstruation':
        return [
          {
            icon: Utensils,
            title: 'Питание',
            text: 'Продукты с железом (шпинат, чечевица, темный шоколад), теплые супы, имбирный чай.',
            color: 'text-rose-600 bg-rose-50'
          },
          {
            icon: Dumbbell,
            title: 'Активность',
            text: 'Мягкая растяжка, дыхательные практики, неспешные прогулки. Избегайте силовых нагрузок.',
            color: 'text-pink-600 bg-pink-50'
          },
          {
            icon: Moon,
            title: 'Отдых и сон',
            text: 'Ложитесь спать пораньше, теплая ванна для ног или грелка на поясницу.',
            color: 'text-purple-600 bg-purple-50'
          }
        ];
      case 'follicular':
        return [
          {
            icon: Flame,
            title: 'Энергия',
            text: 'Уровень эстрогена растет. Пик креативности, отличное время для планирования и встреч.',
            color: 'text-amber-600 bg-amber-50'
          },
          {
            icon: Dumbbell,
            title: 'Тренировки',
            text: 'Кардио, бег, танцы, высокоинтенсивные тренировки даются легко и в удовольствие.',
            color: 'text-emerald-600 bg-emerald-50'
          },
          {
            icon: Utensils,
            title: 'Питание',
            text: 'Ферментированные продукты (йогурты, кимчи), много свежей зелени, нежирный белок.',
            color: 'text-teal-600 bg-teal-50'
          }
        ];
      case 'ovulation':
        return [
          {
            icon: Heart,
            title: 'Фертильность и шарм',
            text: 'Пик выработки гормонов счастья. Сияющая кожа, максимальная уверенность в себе.',
            color: 'text-pink-600 bg-pink-50'
          },
          {
            icon: Dumbbell,
            title: 'Спорт',
            text: 'Силовые тренировки, рекорды и выносливость на максимуме!',
            color: 'text-purple-600 bg-purple-50'
          },
          {
            icon: Utensils,
            title: 'Антиоксиданты',
            text: 'Ягоды (черника, малина), авокадо, орехи и семена кунжута/льна.',
            color: 'text-amber-600 bg-amber-50'
          }
        ];
      case 'luteal':
        return [
          {
            icon: Moon,
            title: 'Уют и забота',
            text: 'Прогестерон повышает потребность в покое. Уменьшите стресс и рабочую нагрузку.',
            color: 'text-indigo-600 bg-indigo-50'
          },
          {
            icon: Utensils,
            title: 'Магний и вода',
            text: 'Бананы, тыквенные семечки, темный шоколад. Снизьте соль и кофеин для уменьшения отеков.',
            color: 'text-rose-600 bg-rose-50'
          },
          {
            icon: Dumbbell,
            title: 'Активность',
            text: 'Пилатес, йога, прогулки на свежем воздухе для гармонизации эмоций.',
            color: 'text-sky-600 bg-sky-50'
          }
        ];
    }
  };

  const tips = getPhaseTips();
  const sortedPeriods = [...periods].sort((a, b) => b.startDate.localeCompare(a.startDate));

  return (
    <div className="space-y-4">
      {/* Intimacy stats in current cycle */}
      <div className="p-5 rounded-3xl glass-card shadow-sm border border-pink-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">💖</span>
            <h3 className="text-sm font-bold text-slate-800">Интимная активность в цикле</h3>
          </div>
          <span className="text-xs font-extrabold text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full">
            {cycleIntimacyCount} {cycleIntimacyCount === 1 ? 'контакт' : cycleIntimacyCount < 5 ? 'контакта' : 'контактов'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-rose-50/60 border border-rose-100">
            <span className="text-lg font-black text-rose-600">{fertileIntimacyCount}</span>
            <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">В окно фертильности</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-purple-50/60 border border-purple-100">
            <span className="text-lg font-black text-purple-600">{protectedCount}</span>
            <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">Защищенных</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-amber-50/60 border border-amber-100">
            <span className="text-lg font-black text-amber-600">{orgasmCount}</span>
            <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">С оргазмом</span>
          </div>
        </div>
      </div>

      {/* Phase Recommendations */}
      <div className="p-5 rounded-3xl glass-card shadow-sm">
        <div className="flex items-center gap-2 mb-3.5">
          <Sparkles className="w-4 h-4 text-rose-500" />
          <h3 className="text-sm font-bold text-slate-800">
            Гид по фазе: {prediction.phaseName}
          </h3>
        </div>

        <p className="text-xs text-slate-600 mb-4 leading-relaxed bg-rose-50/50 p-3 rounded-2xl border border-rose-100/60">
          {prediction.phaseDescription}
        </p>

        <div className="space-y-2.5">
          {tips.map((tip, idx) => {
            const Icon = tip.icon;
            return (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-white/70 border border-slate-100">
                <div className={`p-2 rounded-xl shrink-0 ${tip.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{tip.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{tip.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cycle Statistics Summary */}
      <div className="p-5 rounded-3xl glass-card shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-3">Статистика циклов</h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100/60 text-center">
            <span className="text-2xl font-extrabold text-rose-600">{avgCycle}</span>
            <span className="text-xs font-medium text-slate-500 block mt-0.5">Средний цикл (дней)</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-100/60 text-center">
            <span className="text-2xl font-extrabold text-pink-600">{avgPeriod}</span>
            <span className="text-xs font-medium text-slate-500 block mt-0.5">Длительность (дней)</span>
          </div>
        </div>

        {/* History Table */}
        {sortedPeriods.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 mb-2">История записей</h4>
            <div className="space-y-2 max-h-44 overflow-y-auto no-scrollbar">
              {sortedPeriods.slice(0, 5).map((p, i) => {
                const len = p.length || (p.endDate ? diffInDays(p.endDate, p.startDate) + 1 : avgPeriod);
                return (
                  <div
                    key={p.id || i}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs text-slate-700"
                  >
                    <span className="font-semibold">{formatRussianDate(p.startDate, true)}</span>
                    <span className="text-slate-400 font-medium">{len} дн. длительность</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
