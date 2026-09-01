import { useEffect } from 'react';
import { Platform } from 'react-native';
import type { AppData } from '../types';
import { getCyclePrediction } from '../utils/cycleMath';
import { getTodayString } from '../utils/cycleMath';

const APP_GROUP = 'group.com.luna.tracker';

export function useWidgetSync(appData: AppData) {
  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const syncToWidget = async () => {
      try {
        const todayStr = getTodayString();
        const prediction = getCyclePrediction(appData.periods, appData.cycleSettings, todayStr);

        // Water total for today
        const todayWater = appData.waterLogs
          .filter(w => w.date === todayStr)
          .reduce((acc, w) => acc + w.amount, 0);

        // Pills status today
        const activePills = appData.pills.filter(p => p.active);
        let takenCount = 0;
        let totalIntakes = 0;
        let nextPillName = 'Все принято';
        let nextPillTime = '✨';

        activePills.forEach(pill => {
          pill.times.forEach(t => {
            totalIntakes++;
            const isTaken = appData.pillLogs.some(
              l => l.pillId === pill.id && l.date === todayStr && l.scheduledTime === t && l.status === 'taken'
            );
            if (isTaken) {
              takenCount++;
            } else if (nextPillName === 'Все принято') {
              nextPillName = pill.name;
              nextPillTime = t;
            }
          });
        });

        // Try to save to Shared App Group Preferences
        const SharedGroupPreferences = require('react-native-shared-group-preferences').default;
        if (SharedGroupPreferences && SharedGroupPreferences.setItem) {
          await SharedGroupPreferences.setItem('cycleDay', prediction.currentDayOfCycle, APP_GROUP);
          await SharedGroupPreferences.setItem('cyclePhase', prediction.phaseName, APP_GROUP);
          await SharedGroupPreferences.setItem('nextPeriodDays', prediction.daysUntilNextPeriod, APP_GROUP);
          await SharedGroupPreferences.setItem('pregnancyChance', prediction.pregnancyChance === 'high' ? 'Высокая' : 'Низкая', APP_GROUP);
          await SharedGroupPreferences.setItem('waterCurrent', todayWater, APP_GROUP);
          await SharedGroupPreferences.setItem('waterGoal', appData.waterSettings.dailyGoal, APP_GROUP);
          await SharedGroupPreferences.setItem('nextPillName', nextPillName, APP_GROUP);
          await SharedGroupPreferences.setItem('nextPillTime', nextPillTime, APP_GROUP);
          await SharedGroupPreferences.setItem('pillsTaken', takenCount, APP_GROUP);
          await SharedGroupPreferences.setItem('pillsTotal', totalIntakes, APP_GROUP);
        }
      } catch (e) {
        // App group is active during compiled build
        console.log('Widget sync info:', e);
      }
    };

    syncToWidget();
  }, [appData]);
}
