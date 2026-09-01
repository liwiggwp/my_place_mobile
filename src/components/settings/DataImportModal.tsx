import React, { useState, useRef } from 'react';
import type { CyclePeriod, DualColorTheme } from '../../types';
import { addDays } from '../../utils/dateUtils';
import { X, Upload, Check, AlertCircle, Download } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DataImportModalProps {
  isOpen: boolean;
  theme?: DualColorTheme;
  onImportPeriods: (periods: CyclePeriod[]) => void;
  onClose: () => void;
}

export const DataImportModal: React.FC<DataImportModalProps> = ({
  isOpen,
  theme = { primary: '#203A5F', secondary: '#595959' },
  onImportPeriods,
  onClose
}) => {
  const [tab, setTab] = useState<'text' | 'file'>('text');
  const [textInput, setTextInput] = useState('');
  const [previewPeriods, setPreviewPeriods] = useState<CyclePeriod[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const monthMap: Record<string, string> = {
    'янв': '01', 'января': '01', 'январь': '01',
    'фев': '02', 'февраля': '02', 'февраль': '02',
    'мар': '03', 'марта': '03', 'март': '03',
    'апр': '04', 'апреля': '04', 'апрель': '04',
    'май': '05', 'мая': '05',
    'июн': '06', 'июня': '06', 'июнь': '06',
    'июл': '07', 'июля': '07', 'июль': '07',
    'авг': '08', 'августа': '08', 'август': '08',
    'сен': '09', 'сентября': '09', 'сентябрь': '09',
    'окт': '10', 'октября': '10', 'октябрь': '10',
    'ноя': '11', 'ноября': '11', 'ноябрь': '11',
    'дек': '12', 'декабря': '12', 'декабрь': '12'
  };

  const parseAnyDateToIso = (raw: string): string | null => {
    const clean = raw.trim().toLowerCase();
    if (!clean) return null;

    // 1. Matches: "14 янв 2026" or "14 января 2026" or "14 янв" (Period Calendar P.C. format)
    const textMonthMatch = clean.match(/^(\d{1,2})\s+([а-яё]+)(?:\s+(\d{4}|\d{2}))?/i);
    if (textMonthMatch) {
      const [, d, mWord, yRaw] = textMonthMatch;
      const monthPrefix = mWord.slice(0, 3);
      const mNum = monthMap[monthPrefix] || monthMap[mWord];
      if (mNum) {
        let year = new Date().getFullYear();
        if (yRaw) {
          year = yRaw.length === 2 ? Number('20' + yRaw) : Number(yRaw);
        }
        return `${year}-${mNum}-${d.padStart(2, '0')}`;
      }
    }

    // 2. Matches YYYY-MM-DD or YYYY/MM/DD
    const isoMatch = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (isoMatch) {
      const [, y, m, d] = isoMatch;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    // 3. Matches DD.MM.YYYY or DD/MM/YYYY
    const ruMatch = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
    if (ruMatch) {
      const [, d, m, y] = ruMatch;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    // 4. Matches DD.MM (assumes current year)
    const shortMatch = clean.match(/^(\d{1,2})[-/.](\d{1,2})$/);
    if (shortMatch) {
      const [, d, m] = shortMatch;
      const y = new Date().getFullYear();
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    return null;
  };

  const handleParseText = () => {
    setErrorMsg('');
    const lines = textInput.split(/[\n;]+/);
    const validDates: string[] = [];

    lines.forEach(line => {
      const subItems = line.split(',');
      subItems.forEach(item => {
        const parsed = parseAnyDateToIso(item);
        if (parsed && !validDates.includes(parsed)) {
          validDates.push(parsed);
        }
      });
    });

    if (validDates.length === 0) {
      setErrorMsg('Не удалось распознать даты. Введите даты в любом виде (например: 14 янв 2026 или 14.01.2026).');
      return;
    }

    validDates.sort();

    const created: CyclePeriod[] = validDates.map((d, i) => ({
      id: 'import-' + Date.now() + '-' + i,
      startDate: d,
      endDate: addDays(d, 4),
      length: 5
    }));

    setPreviewPeriods(created);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (!content) return;

      try {
        if (file.name.endsWith('.json')) {
          const json = JSON.parse(content);
          if (Array.isArray(json)) {
            const periods = json.map((item, idx) => ({
              id: 'json-' + Date.now() + '-' + idx,
              startDate: item.startDate || item.start || item.date,
              endDate: item.endDate || item.end,
              length: item.length || 5
            })).filter(p => p.startDate);
            setPreviewPeriods(periods);
            return;
          }
        }

        const lines = content.split('\n');
        const extractedDates: string[] = [];

        lines.forEach(line => {
          const parsed = parseAnyDateToIso(line);
          if (parsed && !extractedDates.includes(parsed)) {
            extractedDates.push(parsed);
          } else {
            const matches = line.match(/(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})|(\d{1,2}[-/.]\d{1,2}[-/.]\d{4})/g);
            if (matches) {
              matches.forEach(m => {
                const iso = parseAnyDateToIso(m);
                if (iso && !extractedDates.includes(iso)) {
                  extractedDates.push(iso);
                }
              });
            }
          }
        });

        if (extractedDates.length > 0) {
          extractedDates.sort();
          const periods: CyclePeriod[] = extractedDates.map((d, idx) => ({
            id: 'csv-' + Date.now() + '-' + idx,
            startDate: d,
            endDate: addDays(d, 4),
            length: 5
          }));
          setPreviewPeriods(periods);
        } else {
          setErrorMsg('Файл прочитан, но даты не распознаны. Попробуйте скопировать даты из приложения и вставить текстом.');
        }
      } catch (err) {
        setErrorMsg('Ошибка чтения файла. Попробуйте скопировать даты из приложения и вставить текстом.');
      }
    };
    reader.readAsText(file);
  };

  const handleApply = () => {
    if (previewPeriods.length === 0) return;
    onImportPeriods(previewPeriods);
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
      colors: [theme.primary, theme.secondary, '#38bdf8']
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
            >
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">Импорт данных цикла</h3>
              <p className="text-xs font-semibold" style={{ color: theme.primary }}>
                Перенос прошлых записей
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 text-slate-400 active:scale-90 cursor-pointer hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <div
          style={{ backgroundColor: `${theme.primary}0D`, borderColor: `${theme.primary}25` }}
          className="my-2.5 p-3 rounded-2xl border text-[11px] text-slate-700 leading-snug shrink-0"
        >
          <p className="font-bold mb-0.5" style={{ color: theme.primary }}>Как перенести даты:</p>
          <p>Посмотрите даты начала месячных за прошлые месяцы в другом приложении и вставьте их в поле ниже.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-100 rounded-2xl mb-3 shrink-0">
          <button
            onClick={() => {
              setTab('text');
              setPreviewPeriods([]);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              tab === 'text' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
            }`}
          >
            Вставить даты текстом
          </button>
          <button
            onClick={() => {
              setTab('file');
              setPreviewPeriods([]);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              tab === 'file' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
            }`}
          >
            Загрузить файл бэкапа
          </button>
        </div>

        {/* Body with padding to prevent any focus outline clipping */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 px-1 py-1">
          {tab === 'text' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Даты начала месячных (в любом формате):
              </label>
              
              <div
                style={{
                  borderColor: isTextareaFocused ? theme.primary : '#e2e8f0',
                  boxShadow: isTextareaFocused ? `0 0 0 3px ${theme.primary}20` : 'none'
                }}
                className="rounded-2xl transition-all duration-150 border bg-slate-50 p-0.5"
              >
                <textarea
                  rows={5}
                  value={textInput}
                  onFocus={() => setIsTextareaFocused(true)}
                  onBlur={() => setIsTextareaFocused(false)}
                  onChange={e => setTextInput(e.target.value)}
                  placeholder={`14 янв 2026\n11 фев 2026\n10 мар 2026\n07 апр 2026\n\nили просто: 14.01.2026, 11.02.2026...`}
                  className="w-full p-3 rounded-[14px] bg-transparent text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none resize-none block border-0"
                />
              </div>

              <button
                onClick={handleParseText}
                style={{ backgroundColor: theme.primary }}
                className="w-full mt-1 py-2.5 rounded-xl text-white font-bold text-xs active:scale-95 transition-all cursor-pointer shadow-xs hover:opacity-90"
              >
                Распознать даты
              </button>
            </div>
          )}

          {tab === 'file' && (
            <div className="space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{ borderColor: `${theme.primary}40`, backgroundColor: `${theme.primary}08` }}
                className="p-6 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-colors hover:bg-slate-100"
              >
                <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: theme.primary }} />
                <p className="text-xs font-bold text-slate-800">Нажмите, чтобы выбрать файл</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Поддерживаются файлы (.csv, .txt, .json)</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv,.json,.txt"
                  className="hidden"
                />
              </div>
            </div>
          )}

          {errorMsg ? (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          ) : null}

          {/* Preview */}
          {previewPeriods.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-600" /> Распознано циклов: {previewPeriods.length}
                </span>
              </div>
              <div className="max-h-32 overflow-y-auto no-scrollbar space-y-1">
                {previewPeriods.map((p, idx) => (
                  <div key={idx} className="text-[11px] font-medium text-slate-700 bg-white/80 p-1.5 rounded-lg">
                    • Начало цикла: <span className="font-bold">{p.startDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex gap-2 shrink-0">
          <button
            onClick={handleApply}
            disabled={previewPeriods.length === 0}
            style={
              previewPeriods.length > 0
                ? { background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)` }
                : undefined
            }
            className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              previewPeriods.length > 0
                ? 'text-white shadow-md shadow-slate-300 active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Перенести</span>
          </button>
        </div>
      </div>
    </div>
  );
};
