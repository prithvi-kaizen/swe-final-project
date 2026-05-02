import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/UI/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import clsx from 'clsx';

const ERAS = [
  { label: 'All Time', filter: () => true },
  { label: 'Pre-1970', filter: (y) => y < 1970 },
  { label: '1970-1990', filter: (y) => y >= 1970 && y <= 1990 },
  { label: '1990-2010', filter: (y) => y > 1990 && y <= 2010 },
  { label: '2010-Present', filter: (y) => y > 2010 },
];

export const MinuteHeatmap = () => {
  const { data } = useData();
  const goals = data['goals'] || [];
  const tournaments = data['tournaments'] || [];
  const [activeEra, setActiveEra] = useState('All Time');

  // Pre-map tournaments to years for faster lookup if goals don't have year directly
  const tournamentYears = useMemo(() => {
    const map = {};
    tournaments.forEach(t => map[t.tournament_id] = t.year);
    return map;
  }, [tournaments]);

  const chartData = useMemo(() => {
    const activeFilter = ERAS.find(e => e.label === activeEra).filter;
    const filteredGoals = goals.filter(g => {
      const year = tournamentYears[g.tournament_id];
      return year ? activeFilter(year) : true;
    });

    const counts = Array.from({ length: 120 }, (_, i) => ({ minute: i + 1, count: 0 }));

    filteredGoals.forEach(g => {
      let min = parseInt(g.minute_regulation) || parseInt(g.minute_label);
      if (isNaN(min)) min = parseInt(g.minute_stoppage) + 45; // naive fallback
      if (min >= 1 && min <= 120) {
        counts[min - 1].count += 1;
      }
    });

    return counts;
  }, [goals, activeEra, tournamentYears]);

  const isStoppage = (min) => {
    return (min >= 44 && min <= 46) || (min >= 89 && min <= 95) || (min >= 104 && min <= 110);
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-1">Minute-by-Minute Goal Heatmap</h1>
          <p className="text-inkMuted text-sm">Aggregated goals across the 90+ minutes of regulation and extra time.</p>
        </div>
        <div className="flex bg-cardSecondary p-1 rounded-full border border-borderLight">
          {ERAS.map(era => (
            <button
              key={era.label}
              onClick={() => setActiveEra(era.label)}
              className={clsx(
                "px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ease-spring",
                activeEra === era.label ? "bg-accentPrimary text-white shadow-sm" : "text-inkSecondary hover:text-inkPrimary"
              )}
            >
              {era.label}
            </button>
          ))}
        </div>
      </div>

      <Card index={0} className="w-full h-[500px] flex flex-col p-6">
        <div className="flex-1 min-h-0 w-full relative -left-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="minute"
                tick={{ fontFamily: 'Space Mono', fontSize: 10, fill: '#888880' }}
                axisLine={false}
                tickLine={false}
                interval={14}
              />
              <YAxis
                tick={{ fontFamily: 'Space Mono', fontSize: 10, fill: '#888880' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: '#FAFAF7' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-bg border border-borderLight p-3 rounded-lg shadow-xl">
                        <p className="text-xs text-inkMuted font-bold uppercase">Minute {payload[0].payload.minute}</p>
                        <p className="font-mono text-xl font-bold text-accentPrimary">{payload[0].value} Goals</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="count"
                radius={[4, 4, 0, 0]}
                animationEasing="ease-out"
                animationDuration={800}
                className="transition-transform origin-bottom hover:scale-y-110 duration-300"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={isStoppage(entry.minute) ? '#2D5A27' : '#C8E6C0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center mt-6 pt-4 border-t border-borderLight">
          <p className="font-sans font-bold text-inkSecondary">Goals spike in stoppage time — a pattern consistent across all eras.</p>
        </div>
      </Card>
    </div>
  );
};
