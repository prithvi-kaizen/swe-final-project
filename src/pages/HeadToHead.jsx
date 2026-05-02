import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/UI/Card';

export const HeadToHead = () => {
  const { data } = useData();
  const matches = data['matches'] || [];
  const teams = data['teams'] || [];

  const [t1Id, setT1Id] = useState('');
  const [t2Id, setT2Id] = useState('');

  const validTeams = useMemo(() => {
    // Only return teams that have actually played against each other to populate the dropdown conditionally
    // Or just all teams. Let's list all teams.
    const sorted = [...teams].sort((a,b) => a.team_name.localeCompare(b.team_name));
    return sorted;
  }, [teams]);

  // If one team selected, maybe filter t2 to only teams they've played?
  // Let's allow picking any and just show empty if no matches.

  const { stats, timeline } = useMemo(() => {
    if (!t1Id || !t2Id || !matches.length) return { stats: null, timeline: [] };

    const team1Code = teams.find(t => t.team_id === t1Id)?.team_code || 'T1';
    const team2Code = teams.find(t => t.team_id === t2Id)?.team_code || 'T2';

    const h2hMatches = matches.filter(m =>
      (m.home_team_id === t1Id && m.away_team_id === t2Id) ||
      (m.home_team_id === t2Id && m.away_team_id === t1Id)
    );

    let t1Wins = 0, t2Wins = 0, draws = 0;
    let t1Goals = 0, t2Goals = 0;
    let score = 0;

    const tline = [];

    h2hMatches.forEach(m => {
      const isT1Home = m.home_team_id === t1Id;
      const t1ScoreLocal = isT1Home ? m.home_team_score : m.away_team_score;
      const t2ScoreLocal = isT1Home ? m.away_team_score : m.home_team_score;

      // Penalties check
      const t1Pen = isT1Home ? (m.home_team_score_penalties || 0) : (m.away_team_score_penalties || 0);
      const t2Pen = isT1Home ? (m.away_team_score_penalties || 0) : (m.home_team_score_penalties || 0);

      t1Goals += t1ScoreLocal;
      t2Goals += t2ScoreLocal;

      let result = 'draw';
      if (t1ScoreLocal > t2ScoreLocal) { result = 't1'; t1Wins++; }
      else if (t2ScoreLocal > t1ScoreLocal) { result = 't2'; t2Wins++; }
      else {
        if (t1Pen > t2Pen) { result = 't1'; t1Wins++; }
        else if (t2Pen > t1Pen) { result = 't2'; t2Wins++; }
        else { draws++; }
      }

      // Rivalry weight
      const isKnockout = m.knockout_stage === 1;
      score += isKnockout ? 15 : 5; // Arbitrary score weights

      tline.push({
        id: m.match_id,
        year: m.tournament_id.split('-')[1],
        stage: m.stage_name,
        result,
        label: `${t1ScoreLocal + t1Pen} - ${t2ScoreLocal + t2Pen}`
      });
    });

    tline.sort((a,b) => parseInt(a.year) - parseInt(b.year));

    return {
      stats: { total: h2hMatches.length, t1Wins, t2Wins, draws, t1Goals, t2Goals, score, t1c: team1Code, t2c: team2Code },
      timeline: tline
    };
  }, [matches, teams, t1Id, t2Id]);


  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="flex justify-between items-end mb-4">
         <div>
           <h1 className="text-3xl font-bold mb-1">Head-to-Head Comparator</h1>
           <p className="text-inkMuted text-sm">Analyze every intersection between two nations in World Cup history.</p>
         </div>
         <div className="flex bg-card p-2 rounded-xl border border-borderLight shadow-sm gap-4 items-center">
            <select className="bg-bg border border-borderLight p-2 rounded-md font-bold" value={t1Id} onChange={e => setT1Id(e.target.value)}>
               <option value="">Select Nation 1</option>
               {validTeams.map(t => <option key={t.team_id} value={t.team_id}>{t.team_name}</option>)}
            </select>
            <span className="font-mono text-inkMuted uppercase">VS</span>
            <select className="bg-bg border border-borderLight p-2 rounded-md font-bold" value={t2Id} onChange={e => setT2Id(e.target.value)}>
               <option value="">Select Nation 2</option>
               {validTeams.map(t => <option key={t.team_id} value={t.team_id}>{t.team_name}</option>)}
            </select>
         </div>
      </div>

      {!stats ? (
        <Card index={0} className="w-full h-[300px] flex items-center justify-center bg-cardSecondary border-dashed border-2">
           <p className="font-mono text-inkSecondary uppercase tracking-widest font-bold">Select two nations to compare.</p>
        </Card>
      ) : stats.total === 0 ? (
        <Card index={0} className="w-full h-[300px] flex items-center justify-center bg-card border-dashed border-2 border-red/40">
           <p className="font-mono text-red uppercase tracking-widest font-bold">No World Cup matches recorded between these nations.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-12 gap-[14px]">
          {/* Summary Card */}
          <Card index={0} className="col-span-12 md:col-span-4 bg-accentPrimary text-white shadow-xl flex flex-col justify-between p-6">
             <div className="flex justify-between items-center mb-6">
               <span className="text-3xl font-mono font-bold">{stats.t1c}</span>
               <span className="text-sm font-bold text-accentLight uppercase">Versus</span>
               <span className="text-3xl font-mono font-bold">{stats.t2c}</span>
             </div>

             <div className="mb-8">
               <div className="text-[10px] text-accentLight font-bold uppercase tracking-widest mb-2 border-b border-white/20 pb-1">Win Probability Segment</div>
               <div className="h-3 rounded-full flex overflow-hidden shadow-inner bg-bg/20">
                 {stats.t1Wins > 0 && <div className="h-full bg-white transition-all" style={{ width: `${(stats.t1Wins / stats.total) * 100}%` }} />}
                 {stats.draws > 0 && <div className="h-full bg-white/40 transition-all" style={{ width: `${(stats.draws / stats.total) * 100}%` }} />}
                 {stats.t2Wins > 0 && <div className="h-full bg-inkPrimary transition-all" style={{ width: `${(stats.t2Wins / stats.total) * 100}%` }} />}
               </div>
               <div className="flex justify-between mt-2 text-xs font-bold font-mono">
                 <span>{stats.t1Wins}</span>
                 <span className="text-white/60">{stats.draws}</span>
                 <span>{stats.t2Wins}</span>
               </div>
             </div>

             <div className="flex justify-between items-end border-t border-white/20 pt-4">
               <div>
                 <span className="block text-xs uppercase tracking-widest text-accentLight">Goals</span>
                 <span className="font-mono text-xl">{stats.t1Goals}</span>
               </div>
               <div className="text-right">
                 <span className="block text-xs uppercase tracking-widest text-accentLight">Total Matches</span>
                 <span className="font-mono text-xl text-center block w-full">{stats.total}</span>
               </div>
               <div className="text-right">
                 <span className="block text-xs uppercase tracking-widest text-accentLight">Goals</span>
                 <span className="font-mono text-xl">{stats.t2Goals}</span>
               </div>
             </div>
          </Card>

          {/* Timeline Card */}
          <Card index={1} className="col-span-12 md:col-span-8 flex flex-col p-6">
             <div className="flex justify-between items-start mb-6">
               <h3 className="font-bold text-inkPrimary uppercase tracking-widest text-xs">Clash Timeline</h3>
               <div className="bg-cardSecondary px-3 py-1 rounded-md text-xs font-bold font-mono">Rivalry Score: {stats.score}</div>
             </div>

             <div className="flex-1 flex gap-3 overflow-x-auto no-scrollbar pb-4 items-center pl-2">
               {timeline.map((t, i) => (
                 <div key={t.id} className="group relative shrink-0">
                    {i !== 0 && <div className="absolute top-1/2 -left-[14px] w-[14px] h-[2px] bg-borderLight -translate-y-1/2" />}
                    <div className="bg-bg border border-borderLight w-28 h-28 rounded-2xl flex flex-col justify-center items-center shadow-sm group-hover:bg-accentLight/20 group-hover:-translate-y-1 group-hover:shadow-lg transition-all duration-300">
                      <span className="font-mono text-lg font-bold text-inkPrimary">{t.label}</span>
                      <span className="text-[10px] uppercase font-bold text-inkMuted mt-1 tracking-widest">{t.year}</span>
                      <span className="text-[9px] uppercase font-bold text-inkSecondary mt-2 text-center px-2 truncate w-full truncate">{t.stage}</span>
                    </div>
                 </div>
               ))}
             </div>
          </Card>
        </div>
      )}
    </div>
  );
};
