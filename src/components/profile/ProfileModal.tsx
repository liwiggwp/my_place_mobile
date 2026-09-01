import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../../types';
import { X, Check, Droplets, Scale } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MyPlaceLogo } from '../common/MyPlaceLogo';
import { AVATAR_ICONS } from '../common/UserAvatar';

interface ProfileModalProps {
  isOpen: boolean;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile, updateWaterGoal?: number) => void;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  profile,
  onSaveProfile,
  onClose
}) => {
  const [name, setName] = useState(profile?.name || 'Мой профиль');
  const [avatarEmoji, setAvatarEmoji] = useState(profile?.avatarEmoji || 'user');
  const [age, setAge] = useState<string>(profile?.age ? String(profile.age) : '25');
  const [height, setHeight] = useState<string>(profile?.height ? String(profile.height) : '168');
  const [weight, setWeight] = useState<string>(profile?.weight ? String(profile.weight) : '56');
  const [autoSyncWater, setAutoSyncWater] = useState(true);

  useEffect(() => {
    if (profile) {
      setName(profile.name || 'Мой профиль');
      setAvatarEmoji(profile.avatarEmoji || 'user');
      setAge(profile.age ? String(profile.age) : '25');
      setHeight(profile.height ? String(profile.height) : '168');
      setWeight(profile.weight ? String(profile.weight) : '56');
    }
  }, [profile, isOpen]);

  if (!isOpen) return null;

  // BMI Calculation
  const heightM = (parseFloat(height) || 168) / 100;
  const weightKg = parseFloat(weight) || 56;
  const bmi = heightM > 0 ? (weightKg / (heightM * heightM)).toFixed(1) : '21.0';
  const bmiNum = parseFloat(bmi);

  let bmiCategory = { label: 'Нормальный вес', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  if (bmiNum < 18.5) {
    bmiCategory = { label: 'Дефицит массы', color: 'bg-amber-100 text-amber-800 border-amber-200' };
  } else if (bmiNum >= 25 && bmiNum < 30) {
    bmiCategory = { label: 'Небольшой избыток', color: 'bg-slate-100 text-slate-800 border-slate-200' };
  } else if (bmiNum >= 30) {
    bmiCategory = { label: 'Повышенный ИМТ', color: 'bg-rose-100 text-rose-800 border-rose-200' };
  }

  // Recommended Water Intake (35ml per kg)
  const recommendedWater = Math.round((weightKg * 35) / 50) * 50;

  const handleSave = () => {
    const updated: UserProfile = {
      ...profile,
      name: name.trim() || 'Мой профиль',
      avatarEmoji,
      age: parseInt(age, 10) || undefined,
      height: parseFloat(height) || undefined,
      weight: weightKg || undefined,
      updatedAt: new Date().toISOString()
    };

    onSaveProfile(updated, autoSyncWater ? recommendedWater : undefined);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center p-1 shadow-2xs">
              <MyPlaceLogo className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Личный кабинет</h3>
              <p className="text-xs text-[#203A5F] font-semibold">Ваш персональный профиль MyPlace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 text-slate-400 active:scale-90 cursor-pointer hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-1 py-3 space-y-4">
          {/* Avatar & Name */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#595959] uppercase tracking-wider">
              Ваше имя / Никнейм
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Как к вам обращаться?"
                className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#203A5F] focus:bg-white transition-colors"
              />
            </div>

            {/* Avatar Selector with Lucide vector icons */}
            <div className="pt-1">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                Выберите иконку профиля:
              </label>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1">
                {AVATAR_ICONS.map(item => {
                  const isSelected = avatarEmoji === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAvatarEmoji(item.id)}
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90 cursor-pointer shrink-0 ${
                        isSelected
                          ? 'bg-[#203A5F] text-white shadow-sm ring-2 ring-[#203A5F]/30'
                          : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                      title={item.label}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Body Parameters (Age, Height, Weight, BMI) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-[#203A5F]" />
                <span>Параметры тела</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${bmiCategory.color}`}>
                ИМТ {bmi} • {bmiCategory.label}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-[#595959] mb-1">Возраст</label>
                <input
                  type="number"
                  min="10"
                  max="99"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 text-center focus:outline-none focus:border-[#203A5F] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#595959] mb-1">Рост (см)</label>
                <input
                  type="number"
                  min="120"
                  max="220"
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 text-center focus:outline-none focus:border-[#203A5F] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#595959] mb-1">Вес (кг)</label>
                <input
                  type="number"
                  min="30"
                  max="180"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 text-center focus:outline-none focus:border-[#203A5F] transition-colors"
                />
              </div>
            </div>

            {/* Smart Water Prompt */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-[#203A5F] font-semibold">
                <Droplets className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span>Норма воды по весу: <b>{recommendedWater} мл</b></span>
              </div>
              <button
                type="button"
                onClick={() => setAutoSyncWater(!autoSyncWater)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                  autoSyncWater ? 'bg-[#203A5F] text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {autoSyncWater ? '✓ Применять' : 'Вручную'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3.5 rounded-2xl bg-[#203A5F] hover:bg-[#1a2f4d] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-slate-300 active:scale-95 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Сохранить профиль</span>
          </button>
        </div>
      </div>
    </div>
  );
};
