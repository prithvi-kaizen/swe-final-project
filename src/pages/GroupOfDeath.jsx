import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/UI/Card';
import clsx from 'clsx';

export const GroupOfDeath = () => {
  const { data } = useData();

  const topGroups = useMemo(() => {
    const matches = data['matches'] || [];
    const teams = data['teams'] || [];
    const tournaments = data['tournaments'] || [];

    if (!matches.length || !teams.length) return [];

    const FINISH_POINTS = {
      'group stage': 0,
      'first group stage': 0,
      'second group stage': 2,
      'round of 16': 4,
      'quarter-finals': 6,
      'semi-finals': 8,
      'third-place match': 7,
      'final round': 9,
      'final': 9 // Champion is overwritten to 10 below.
    };

    const teamNames = {};
    const teamIdsByName = {};
    teams.forEach(t => {
      teamNames[t.team_id] = t.team_name;
      teamIdsByName[t.team_name] = t.team_id;
    });

    // 1. Map each team per tournament to their highest finish points.
    const teamDepth = {}; // { year: { team_id: points } }
    matches.forEach(m => {
       const year = m.tournament_id.split('-')[1];
       if (!teamDepth[year]) teamDepth[year] = {};

       const stge = m.stage_name.toLowerCase();
       const s = FINISH_POINTS[stge] ?? 0;

       if (teamDepth[year][m.home_team_id] === undefined || s > teamDepth[year][m.home_team_id]) teamDepth[year][m.home_team_id] = s;
       if (teamDepth[year][m.away_team_id] === undefined || s > teamDepth[year][m.away_team_id]) teamDepth[year][m.away_team_id] = s;
    });

    if (Object.keys(teamDepth).length === 0) return []; // Fallback for loading states

    // Overwrite Final with Winner
    matches.filter(m => m.stage_name.toLowerCase() === 'final').forEach(m => {
       const year = m.tournament_id.split('-')[1];
       const homeS = m.home_team_score + (m.home_team_score_penalties || 0);
       const awayS = m.away_team_score + (m.away_team_score_penalties || 0);
       if (m.home_team_win || homeS > awayS) teamDepth[year][m.home_team_id] = 10;
       else if (m.away_team_win || awayS > homeS) teamDepth[year][m.away_team_id] = 10;
    });

    // Some early tournaments, notably 1950, decided the winner in a final round.
    tournaments.forEach(t => {
      const year = String(t.year);
      const winnerId = teamIdsByName[t.winner];
      if (winnerId && teamDepth[year]) {
        teamDepth[year][winnerId] = 10;
      }
    });

    // 2. Identify only first-round groups and their member teams.
    // The dataset also uses group_name for second group stages, so stage_name
    // must be an exact match or later-round teams get merged into fake groups.
    const groups = {}; // { groupKey: { year, name, teams: Set } }
    matches.forEach(m => {
       if (m.stage_name.toLowerCase() === 'group stage') {
         const year = m.tournament_id.split('-')[1];
         // Example group_name: "Group A", "Group 1", "Group B"
         const groupName = m.group_name;
         if (!groupName || groupName === 'not applicable') return;

         const key = `${year}-${groupName}`;
         if (!groups[key]) groups[key] = { key, year, name: groupName, teams: new Set() };

         const g = groups[key];
         g.teams.add(m.home_team_id);
         g.teams.add(m.away_team_id);
       }
    });

    // 3. Calculate Group Score (higher is harder)
    const rankedGroups = Object.values(groups)
      .filter(g => g.teams.size >= 3 && g.teams.size <= 4) // ensure first-round group sizes
      .map(g => {
        let totalScore = 0;
        const members = Array.from(g.teams).map(tId => {
           const sc = teamDepth[g.year]?.[tId] ?? 0;
           totalScore += sc;
           return { id: tId, name: teamNames[tId] || tId, score: sc };
        });

        return {
           key: g.key,
           year: g.year,
           name: g.name,
           totalScore,
           members: members.sort((a,b) => b.score - a.score) // Sort members by best finish
        };
      })
      .sort((a,b) => b.totalScore - a.totalScore)
      .slice(0, 10);

    return rankedGroups;
  }, [data]);


  const [expandedKey, setExpandedKey] = useState(null);

  const STAGE_LABELS = {
    0: 'Group Stage',
    2: '2nd Grp',
    4: 'R16',
    6: 'QF',
    7: '3rd Place',
    8: 'SF',
    9: 'Final',
    10: 'Champions'
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="mb-4">
         <h1 className="text-3xl font-bold mb-1">Group of Death Ranker</h1>
         <p className="text-inkMuted text-sm">Retroactively scores the deadliest World Cup groups based on each team's eventual tournament finish.</p>
      </div>

      <div className="flex flex-col gap-[14px]">
        {topGroups.map((g, i) => {
          const isExpanded = expandedKey === g.key;
          const isTop = i === 0;

          return (
            <Card
              key={g.key}
              index={i}
              className={clsx(
                "group cursor-pointer transition-all duration-300 ease-spring overflow-hidden",
                isTop ? "border-l-8 border-l-accentPrimary" : "",
                isExpanded ? "bg-bg shadow-lg scale-[1.01]" : "bg-card hover:bg-cardSecondary"
              )}
              onClick={() => setExpandedKey(isExpanded ? null : g.key)}
            >
               <div className="flex items-center justify-between z-10 relative">
                 <div className="flex items-center gap-6">
                    <span className={clsx("font-mono text-3xl font-bold opacity-30", isTop ? "text-accentPrimary opacity-100" : "")}>
                       #{i + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-inkPrimary uppercase tracking-widest">{g.name}</h3>
                      <p className="text-xs font-bold text-inkMuted uppercase tracking-widest">{g.year}</p>
                    </div>
                 </div>

                 <div className="text-right">
                    <span className="font-mono text-xl font-bold">{g.totalScore}</span>
                    <span className="block text-[10px] text-inkSecondary uppercase font-bold tracking-widest">Difficulty Score</span>
                 </div>
               </div>

               {/* Expanded Teams List */}
               <div className={clsx(
                 "transition-all duration-500 ease-spring overflow-hidden border-t border-borderLight mt-4",
                 isExpanded ? "max-h-[300px] opacity-100 pt-4" : "max-h-0 opacity-0 border-t-transparent"
               )}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {g.members.map((m, idx) => (
                        <div key={m.id} className="bg-cardSecondary p-3 rounded-lg border border-borderLight">
                           <div className="text-xs font-bold font-mono text-inkMuted mb-2">Team {idx + 1}</div>
                           <div className="font-bold text-sm text-inkPrimary leading-tight mb-2">{m.name}</div>
                           <div className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 bg-accentLight/30 text-accentPrimary rounded-md inline-block">
                             {STAGE_LABELS[m.score] || 'Out'}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
