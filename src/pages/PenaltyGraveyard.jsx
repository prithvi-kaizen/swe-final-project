import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/UI/Card';

export const PenaltyGraveyard = () => {
  const { data } = useData();
  const penalties = data['penalty_kicks'] || [];
  const matches = data['matches'] || [];

  const { shootouts, cursed, blessed } = useMemo(() => {
    if (!penalties.length || !matches.length) return { shootouts: [], cursed: [], blessed: [] };

    const matchInfo = {};
    matches.forEach(m => matchInfo[m.match_id] = m);

    const sGroups = {};
    penalties.forEach(p => {
      if (!sGroups[p.match_id]) sGroups[p.match_id] = { match: matchInfo[p.match_id], kicks: [] };
      sGroups[p.match_id].kicks.push(p);
    });

    const parsed = Object.keys(sGroups).map(id => {
      const group = sGroups[id];
      const match = group.match;
      const t1 = match.home_team_code;
      const t2 = match.away_team_code;

      let t1Score = 0; let t2Score = 0;
      let t1Id = match.home_team_id; let t2Id = match.away_team_id;

      group.kicks.forEach(k => {
        if (k.converted === 1) {
          if (k.team_id === t1Id) t1Score++;
          if (k.team_id === t2Id) t2Score++;
        }
      });

      const winnerCode = t1Score > t2Score ? t1 : t2;
      const loserCode = t1Score > t2Score ? t2 : t1;

      return {
        id,
        year: match.year || match.tournament_id?.split('-')[1],
        stage: match.stage_name,
        t1, t2,
        t1Score, t2Score,
        winnerCode, loserCode,
        kicks: group.kicks
      };
    });

    // Leaderboards
    const nations = {};
    parsed.forEach(s => {
      if (!nations[s.winnerCode]) nations[s.winnerCode] = { w:0, l:0, code: s.winnerCode };
      if (!nations[s.loserCode]) nations[s.loserCode] = { w:0, l:0, code: s.loserCode };
      nations[s.winnerCode].w += 1;
      nations[s.loserCode].l += 1;
    });

    const nList = Object.values(nations);
    const cursedList = [...nList].filter(n => n.l > 0).sort((a,b) => b.l - a.l || a.w - b.w).slice(0, 10);
    const blessedList = [...nList].filter(n => n.w > 0).sort((a,b) => b.w - a.w || a.l - b.l).slice(0, 10);

    // Sort Shootouts Chronologically
    parsed.sort((a,b) => parseInt(b.year) - parseInt(a.year));
    return { shootouts: parsed, cursed: cursedList, blessed: blessedList };
  }, [penalties, matches]);

  const englandRecord = useMemo(() => {
    return cursed.find(c => c.code === 'ENG') || { w:0, l:0, code: 'ENG' };
  }, [cursed]);

  return (
    <div className="w-full flex gap-10 h-full overflow-hidden">
      {/* Left: Shootout Cards */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20 pr-4">
        <h1 className="text-3xl font-bold mb-1">Shootout Graveyard</h1>
        <p className="text-inkMuted text-sm mb-8">Every World Cup knockout match decided from the spot.</p>

        <div className="flex flex-col gap-[14px]">
          {shootouts.map((s, i) => (
            <Card key={s.id} index={i} className="flex flex-col gap-4 border-b border-borderLight w-full">
              <div className="flex justify-between items-center text-xs font-bold text-inkMuted uppercase tracking-wider">
                 <span>{s.year} • {s.stage}</span>
                 <span className="bg-bg px-3 py-1 rounded-full">{s.kicks.length} Taken</span>
              </div>
              <div className="flex justify-between items-center bg-bg rounded-xl p-4">
                <div className="flex flex-col items-center gap-1">
                  <span className="font-mono font-bold text-xl">{s.t1}</span>
                  <div className="flex gap-1">
                    {s.kicks.filter(k => k.team_id === s.kicks[0].team_id || k.team_id === s.t1).map((k,idx) => (
                      <span key={idx} className={`w-3 h-3 block ${k.converted === 1 ? 'bg-accentPrimary' : 'bg-red'} opacity-80`} />
                    ))}
                  </div>
                </div>

                <div className="font-mono text-3xl font-bold tracking-widest text-inkSecondary">
                  {s.t1Score} - {s.t2Score}
                </div>

                <div className="flex flex-col items-center gap-1">
                  <span className="font-mono font-bold text-xl">{s.t2}</span>
                  <div className="flex gap-1">
                    {s.kicks.filter(k => k.team_id !== s.kicks[0].team_id && k.team_id !== s.t1).map((k,idx) => (
                      <span key={idx} className={`w-3 h-3 block ${k.converted === 1 ? 'bg-accentPrimary' : 'bg-red'} opacity-80`} />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Right: Leaderboards */}
      <div className="w-[300px] shrink-0 flex flex-col gap-[14px] overflow-y-auto no-scrollbar pb-20">

        <Card index={0} className="bg-redLight/40 border-red/20 shadow-sm mb-4">
          <h3 className="text-red font-bold text-xs uppercase tracking-widest mb-4 flex gap-2 items-center">
            <span className="w-2 h-2 rounded-full bg-red block animate-pulse" /> The England Curse
          </h3>
          <div className="flex justify-between items-center">
            <span className="font-mono text-xl font-bold text-inkPrimary">ENG</span>
            <div className="flex flex-col text-right">
              <span className="text-2xl font-mono text-red">{englandRecord.l} Losses</span>
              <span className="text-xs text-inkMuted font-bold border-t border-red/20 pt-1">{englandRecord.w} Wins</span>
            </div>
          </div>
        </Card>

        {/* Cursed */}
        <Card index={1} className="bg-card">
          <h3 className="text-inkPrimary font-bold text-xs uppercase tracking-widest mb-4">Most Cursed Nations</h3>
          <div className="flex flex-col gap-3">
            {cursed.map(c => (
              <div key={c.code} className="flex items-center justify-between">
                <span className="text-sm font-mono font-bold">{c.code}</span>
                <div className="flex gap-1">
                  {Array.from({ length: Math.max(c.w + c.l, 0) }).map((_, i) => (
                    <span key={i} className={`w-2.5 h-2.5 block ${i < c.l ? 'bg-red' : 'bg-accentLight'}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Blessed */}
        <Card index={2} className="bg-card">
          <h3 className="text-inkPrimary font-bold text-xs uppercase tracking-widest mb-4">Penalty Specialists</h3>
          <div className="flex flex-col gap-3">
            {blessed.map(c => (
              <div key={c.code} className="flex items-center justify-between">
                <span className="text-sm font-mono font-bold">{c.code}</span>
                <div className="flex gap-1">
                  {Array.from({ length: Math.max(c.w + c.l, 0) }).map((_, i) => (
                    <span key={i} className={`w-2.5 h-2.5 block ${i < c.w ? 'bg-accentPrimary' : 'bg-redLight'}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
