import React, { useState, useEffect } from 'react';
import type { DayLog, FlowLevel, MoodType, SymptomType, SexActivity, IntimacyLog, IntimacyType, OrgasmStatus, LibidoLevel } from '../../types';
import { formatFullRussianDate } from '../../utils/dateUtils';
import {
  X,
  Check,
  Smile,
  Activity,
  FileText,
  Flame,
  Heart,
  Calendar,
  Shield,
  Zap,
  Sparkles,
  Droplets,
  Star,
  Circle
} from 'lucide-react';

interface SymptomModalProps {
  isOpen: boolean;
  dateStr: string;
  initialLog?: DayLog;
  isPeriodStart: boolean;
  onTogglePeriodStart: (dateStr: string) => void;
  onSaveLog: (log: DayLog) => void;
  onClose: () => void;
}

export const SymptomModal: React.FC<SymptomModalProps> = ({
  isOpen,
  dateStr,
  initialLog,
  isPeriodStart,
  onTogglePeriodStart,
  onSaveLog,
  onClose
}) => {
  const [flow, setFlow] = useState<FlowLevel>(initialLog?.flow || 'none');
  const [moods, setMoods] = useState<MoodType[]>(initialLog?.moods || []);
  const [symptoms, setSymptoms] = useState<SymptomType[]>(initialLog?.symptoms || []);
  const [notes, setNotes] = useState<string>(initialLog?.notes || '');

  // Intimacy State
  const [hadSex, setHadSex] = useState<boolean>(
    initialLog?.intimacy?.hadSex ?? (initialLog?.sexActivity && initialLog?.sexActivity !== 'none' ? true : false)
  );
  const [intimacyType, setIntimacyType] = useState<IntimacyType>(
    initialLog?.intimacy?.type || (initialLog?.sexActivity === 'unprotected' ? 'unprotected' : 'protected')
  );
  const [orgasm, setOrgasm] = useState<OrgasmStatus>(initialLog?.intimacy?.orgasm || 'yes');
  const [libido, setLibido] = useState<LibidoLevel>(initialLog?.intimacy?.libido || 'moderate');
  const [timesCount, setTimesCount] = useState<number>(initialLog?.intimacy?.timesCount || 1);
  const [intimacyNotes, setIntimacyNotes] = useState<string>(initialLog?.intimacy?.notes || '');

  useEffect(() => {
    if (initialLog) {
      setFlow(initialLog.flow || 'none');
      setMoods(initialLog.moods || []);
      setSymptoms(initialLog.symptoms || []);
      setNotes(initialLog.notes || '');

      const isSex = initialLog.intimacy?.hadSex ?? (initialLog.sexActivity && initialLog.sexActivity !== 'none' ? true : false);
      setHadSex(isSex);
      setIntimacyType(initialLog.intimacy?.type || (initialLog.sexActivity === 'unprotected' ? 'unprotected' : 'protected'));
      setOrgasm(initialLog.intimacy?.orgasm || 'yes');
      setLibido(initialLog.intimacy?.libido || 'moderate');
      setTimesCount(initialLog.intimacy?.timesCount || 1);
      setIntimacyNotes(initialLog.intimacy?.notes || '');
    } else {
      setFlow('none');
      setMoods([]);
      setSymptoms([]);
      setNotes('');
      setHadSex(false);
      setIntimacyType('protected');
      setOrgasm('yes');
      setLibido('moderate');
      setTimesCount(1);
      setIntimacyNotes('');
    }
  }, [initialLog, dateStr, isOpen]);

  if (!isOpen) return null;

  const flowOptions: { id: FlowLevel; label: string; level: number }[] = [
    { id: 'none', label: 'Нет', level: 0 },
    { id: 'spotting', label: 'Мажущие', level: 1 },
    { id: 'light', label: 'Легкие', level: 2 },
    { id: 'medium', label: 'Средние', level: 3 },
    { id: 'heavy', label: 'Обильные', level: 4 }
  ];

  const moodOptions: { id: MoodType; label: string }[] = [
    { id: 'happy', label: 'Счастье' },
    { id: 'calm', label: 'Спокойствие' },
    { id: 'energized', label: 'Энергия' },
    { id: 'romantic', label: 'Нежность' },
    { id: 'sensitive', label: 'Ранимость' },
    { id: 'irritated', label: 'Раздражение' },
    { id: 'sad', label: 'Грусть' },
    { id: 'tired', label: 'Усталость' },
    { id: 'anxious', label: 'Тревожность' }
  ];

  const symptomOptions: { id: SymptomType; label: string }[] = [
    { id: 'cramps', label: 'Спазмы / Боль' },
    { id: 'headache', label: 'Головная боль' },
    { id: 'bloating', label: 'Вздутие' },
    { id: 'backache', label: 'Боль в спине' },
    { id: 'tender_breasts', label: 'Чувствит. груди' },
    { id: 'acne', label: 'Высыпания' },
    { id: 'insomnia', label: 'Бессонница' },
    { id: 'cravings', label: 'Тяга к еде' },
    { id: 'nausea', label: 'Тошнота' },
    { id: 'fatigue', label: 'Слабость' }
  ];

  const intimacyTypes: { id: IntimacyType; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'protected', label: 'Защищенный', icon: <Shield className="w-4 h-4 text-emerald-600" />, desc: 'Презерватив / КОК' },
    { id: 'unprotected', label: 'Незащищенный', icon: <Zap className="w-4 h-4 text-rose-500" />, desc: 'Без защиты' },
    { id: 'oral_other', label: 'Оральный / Ласки', icon: <Heart className="w-4 h-4 text-pink-500" />, desc: 'Непроникающий' },
    { id: 'solo', label: 'Соло / Мастурбация', icon: <Sparkles className="w-4 h-4 text-indigo-500" />, desc: 'Наедине' }
  ];

  const orgasmOptions: { id: OrgasmStatus; label: string; icon: React.ReactNode }[] = [
    { id: 'yes', label: 'Был оргазм', icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'multiple', label: 'Несколько', icon: <Star className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'no', label: 'Без оргазма', icon: <Circle className="w-3.5 h-3.5 text-slate-400" /> }
  ];

  const libidoOptions: { id: LibidoLevel; label: string; level: number }[] = [
    { id: 'calm', label: 'Низкое', level: 1 },
    { id: 'moderate', label: 'Умеренное', level: 2 },
    { id: 'high', label: 'Высокое', level: 3 },
    { id: 'very_high', label: 'Максимальное', level: 4 }
  ];

  const toggleMood = (m: MoodType) => {
    setMoods(prev => (prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]));
  };

  const toggleSymptom = (s: SymptomType) => {
    setSymptoms(prev => (prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]));
  };

  const handleSave = () => {
    const intimacyData: IntimacyLog | undefined = hadSex
      ? {
          hadSex: true,
          type: intimacyType,
          timesCount,
          orgasm,
          libido,
          notes: intimacyNotes.trim()
        }
      : undefined;

    const legacySexActivity: SexActivity = hadSex
      ? intimacyType === 'protected' ? 'protected' : 'unprotected'
      : libido === 'high' || libido === 'very_high' ? 'high_drive' : 'none';

    onSaveLog({
      date: dateStr,
      flow,
      moods,
      symptoms,
      sexActivity: legacySexActivity,
      intimacy: intimacyData,
      notes: notes.trim()
    });
    onClose();
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in p-0 sm:p-4 cursor-pointer"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-rose-100 max-h-[92vh] flex flex-col overflow-hidden cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Запись на день</h3>
            <p className="text-xs text-rose-500 font-semibold">{formatFullRussianDate(dateStr)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 text-slate-400 active:scale-90 transition-transform cursor-pointer hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-1 py-3.5 space-y-4">
          {/* Period Toggle Button */}
          <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Первый день месячных</p>
                <p className="text-[11px] text-slate-500">Отметить начало нового цикла</p>
              </div>
            </div>
            <button
              onClick={() => onTogglePeriodStart(dateStr)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                isPeriodStart
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50'
              }`}
            >
              {isPeriodStart ? '✓ Начало цикла' : '+ Отметить'}
            </button>
          </div>

          {/* INTIMACY SECTION */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-pink-50/80 to-rose-50/50 border border-pink-200/80 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Интимная жизнь</h4>
                  <p className="text-[10px] text-slate-500">Отметка контакта и сексуального желания</p>
                </div>
              </div>

              {/* Sex Toggle Button */}
              <button
                type="button"
                onClick={() => setHadSex(!hadSex)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${
                  hadSex
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm shadow-pink-200'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {hadSex ? '✓ Был контакт' : '+ Был контакт'}
              </button>
            </div>

            {/* Expanded Intimacy Details */}
            {hadSex ? (
              <div className="space-y-3 pt-2 border-t border-pink-100">
                {/* Intimacy Type */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                    Тип контакта
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {intimacyTypes.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setIntimacyType(t.id)}
                        className={`p-2 rounded-xl text-left border transition-all active:scale-95 flex items-center gap-2 cursor-pointer ${
                          intimacyType === t.id
                            ? 'bg-white border-2 border-pink-400 text-pink-950 font-bold shadow-xs'
                            : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-lg bg-pink-50 flex items-center justify-center shrink-0">
                          {t.icon}
                        </div>
                        <div>
                          <p className="text-xs leading-none">{t.label}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">{t.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Times count */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Сколько раз за день:
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setTimesCount(num)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          timesCount === num
                            ? 'bg-pink-500 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {num === 4 ? '4+' : `${num} раз`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orgasm */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Оргазм
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {orgasmOptions.map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setOrgasm(opt.id)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          orgasm === opt.id
                            ? 'bg-white border-2 border-pink-400 text-pink-900 font-bold shadow-xs'
                            : 'bg-white/60 border border-slate-200 text-slate-600 hover:bg-white'
                        }`}
                      >
                        {opt.icon}
                        <span className="truncate text-[11px]">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Libido / Sexual Drive */}
            <div className="pt-2 border-t border-pink-100">
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                <Flame className="w-3 h-3 text-rose-500" />
                <span>Сексуальное желание / Либидо</span>
              </label>
              <div className="grid grid-cols-4 gap-1">
                {libidoOptions.map(l => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLibido(l.id)}
                    className={`py-1.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      libido === l.id
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Flow */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-rose-500" />
              <span>Выделения</span>
            </h4>
            <div className="grid grid-cols-5 gap-1.5">
              {flowOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFlow(opt.id)}
                  className={`py-2 px-1 rounded-xl text-center flex flex-col items-center gap-1 transition-all active:scale-95 cursor-pointer ${
                    flow === opt.id
                      ? 'bg-rose-500 text-white font-bold shadow-sm'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-black">
                    {opt.level === 0 ? '—' : '●'.repeat(opt.level)}
                  </span>
                  <span className="text-[10px] leading-tight truncate">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Moods */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5 text-amber-500" />
              <span>Настроение</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {moodOptions.map(m => {
                const isSelected = moods.includes(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => toggleMood(m.id)}
                    className={`py-1.5 px-3 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-100 border-2 border-amber-400 text-amber-900 font-bold shadow-xs'
                        : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-rose-500" />
              <span>Симптомы и тело</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {symptomOptions.map(s => {
                const isSelected = symptoms.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSymptom(s.id)}
                    className={`py-1.5 px-3 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'bg-rose-100 border-2 border-rose-400 text-rose-900 font-bold shadow-xs'
                        : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Личные заметки</span>
            </h4>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Как прошел день, самочувствие, мысли..."
              rows={2}
              className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-rose-400 focus:bg-white transition-colors resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex gap-2 shrink-0">
          <button
            onClick={handleSave}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-300/40 active:scale-95 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Сохранить запись</span>
          </button>
        </div>
      </div>
    </div>
  );
};
