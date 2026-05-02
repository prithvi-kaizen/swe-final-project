import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/UI/Card';
import clsx from 'clsx';

export const RefereeBias = () => {
  const { data } = useData();
  const refereeAppearances = data['referee_appearances'] || [];
  const bookings = data['bookings'] || [];
  const teams = data['teams'] || [];

  const { matrix, maxRate, confeds } = useMemo(() => {
    if (!refereeAppearances.length || !bookings.length) return { matrix: {}, maxRate: 0, confeds: [] };

    // confederation_code = 'UEFA', 'CONMEBOL', etc. — short keys we display
    // referee_appearances: match_id -> confederation_code
    const matchRefConfed = {};
    refereeAppearances.forEach(r => {
      if (r.match_id && r.confederation_code) {
        matchRefConfed[r.match_id] = r.confederation_code;
      }
    });

    // team confederation codes from teams dataset
    const teamConfedMap = {};
    teams.forEach(t => {
      if (t.team_id && t.confederation_code) {
        teamConfedMap[t.team_id] = t.confederation_code;
      }
    });

    const confedNames = ['UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC', 'OFC'];

    // Init aggregate structure
    const aggregate = {};
    confedNames.forEach(rc => {
      aggregate[rc] = {};
      confedNames.forEach(tc => {
        aggregate[rc][tc] = { cards: 0, matchesHit: new Set() };
      });
    });

    // Count matches overseen — bookings tell us match_id + team_id
    // For each booking, look up match ref confed and the team confed
    bookings.forEach(b => {
      const rc = matchRefConfed[b.match_id];
      const tc = teamConfedMap[b.team_id];
      if (!rc || !tc || !aggregate[rc] || !aggregate[rc][tc]) return;

      aggregate[rc][tc].matchesHit.add(b.match_id);
      aggregate[rc][tc].cards += 1;
    });

    let globalMax = 0.1;
    const finalMatrix = {};
    confedNames.forEach(rc => {
      finalMatrix[rc] = {};
      confedNames.forEach(tc => {
        const stats = aggregate[rc][tc];
        const mCount = stats.matchesHit.size;
        const rate = mCount > 0 ? stats.cards / mCount : 0;
        if (rate > globalMax && Number.isFinite(rate)) globalMax = rate;
        finalMatrix[rc][tc] = { rate: parseFloat(rate.toFixed(2)), mCount };
      });
    });

    return { matrix: finalMatrix, maxRate: globalMax, confeds: confedNames };
  }, [refereeAppearances, bookings, teams]);

  const getBackgroundColor = (rate) => {
    if (!rate || rate === 0) return 'rgba(0,0,0,0.03)';
    const clamped = Math.min(rate / (maxRate * 0.8), 1);
    return `rgba(45, 90, 39, ${clamped * 0.85})`;
  };

  const getTextColor = (rate) => {
    if (!rate || rate === 0) return 'text-black/20';
    const clamped = Math.min(rate / (maxRate * 0.8), 1);
    return clamped > 0.5 ? 'text-white' : 'text-inkPrimary';
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="mb-2">
        <h1 className="text-3xl font-bold mb-1">Referee Consistency Audit</h1>
        <p className="text-inkMuted text-sm">
          Yellow/Red cards issued per match — Referee confederation (rows) vs. Team confederation (columns).
        </p>
      </div>

      <Card index={0} className="w-full overflow-visible p-6">
        {/* Column Headers */}
        <div className="flex gap-1 mb-1 pl-[120px]">
          {confeds.map(c => (
            <div
              key={c}
              className="flex-1 text-center text-[10px] font-bold text-inkSecondary uppercase tracking-widest truncate px-0.5"
            >
              {c}
            </div>
          ))}
        </div>

        {/* Y-axis label + Heatmap Grid */}
        <div className="flex gap-3 items-stretch">
          {/* Rotated Y-axis label */}
          <div className="flex items-center justify-center" style={{ width: 18 }}>
            <span
              className="text-[10px] font-bold text-inkMuted uppercase tracking-widest whitespace-nowrap"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              Referee Confed
            </span>
          </div>

          {/* Grid rows */}
          <div className="flex flex-col gap-1 flex-1">
            {confeds.map(refConfed => (
              <div key={refConfed} className="flex gap-1 items-stretch">
                {/* Row label */}
                <div className="w-[100px] shrink-0 flex items-center justify-end pr-3">
                  <span className="text-[10px] font-bold text-inkSecondary uppercase tracking-widest truncate">
                    {refConfed}
                  </span>
                </div>

                {/* Heatmap cells */}
                {confeds.map(teamConfed => {
                  const d = matrix[refConfed]?.[teamConfed] || { rate: 0, mCount: 0 };
                  return (
                    <div
                      key={`${refConfed}-${teamConfed}`}
                      className="flex-1 h-12 rounded-lg flex items-center justify-center font-mono font-bold text-xs relative group transition-transform hover:scale-[1.08] cursor-default"
                      style={{ backgroundColor: getBackgroundColor(d.rate) }}
                    >
                      <span className={clsx('z-10 select-none', getTextColor(d.rate))}>
                        {d.mCount > 0 ? d.rate : '-'}
                      </span>

                      {/* Hover Tooltip */}
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-inkPrimary text-white text-[10px] whitespace-nowrap px-3 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        <p className="font-sans font-bold mb-1 border-b border-white/20 pb-1">
                          {refConfed} refs → {teamConfed} teams
                        </p>
                        <p>Matches: <span className="font-bold">{d.mCount}</span></p>
                        <p>Cards/match: <span className="font-bold">{d.mCount > 0 ? d.rate : 'n/a'}</span></p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend + Disclaimer */}
        <div className="mt-6 pt-4 border-t border-borderLight flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-inkMuted font-bold uppercase tracking-widest">Low</span>
            <div
              className="w-36 h-3 rounded-full"
              style={{ background: 'linear-gradient(to right, rgba(45,90,39,0.05), rgba(45,90,39,0.85))' }}
            />
            <span className="text-[10px] text-inkMuted font-bold uppercase tracking-widest">High</span>
            <span className="text-[10px] font-mono text-inkMuted ml-1">(cards / match)</span>
          </div>
          <p className="text-[10px] text-inkMuted max-w-xs text-right leading-tight italic">
            Statistical pattern only — not a definitive claim of bias. Blank cells indicate no matches recorded.
          </p>
        </div>
      </Card>
    </div>
  );
};
