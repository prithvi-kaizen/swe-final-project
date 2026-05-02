import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/UI/Card';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis } from 'recharts';

const DEPTH_MAP = {
  'group stage': 1, // multiple names for group stage
  'first group stage': 1,
  'second group stage': 2,
  'round of 16': 2,
  'quarter-finals': 3,
  'semi-finals': 4,
  'final': 5,
  'winner': 6 // Actually we need to deduce winner from matches
};

const CONFED_COLORS = {
  'UEFA':     '#3B82F6', // Vivid blue
  'CONMEBOL': '#F59E0B', // Amber gold
  'CONCACAF': '#EF4444', // Vivid red
  'CAF':      '#22C55E', // Vivid green
  'AFC':      '#A855F7', // Purple
  'OFC':      '#64748B', // Slate
};

export const SquadAgePerformance = () => {
  const { data } = useData();

  const squads = data['squads'] || [];
  const teams = data['teams'] || [];
  const matches = data['matches'] || [];
  const players = data['players'] || [];
  const tournamentsList = data['tournaments'] || [];

  const chartData = useMemo(() => {
    if (!squads.length || !teams.length || !matches.length || !players.length || !tournamentsList.length) return [];

    const validTournaments = new Set();
    tournamentsList.forEach(t => {
      if (t.tournament_name && t.tournament_name.includes("Men's")) {
        validTournaments.add(t.tournament_id);
      }
    });

    const confederations = {};
    // Use confederation_code (short form: 'UEFA', 'CAF', etc.) so it matches CONFED_COLORS keys
    teams.forEach(t => confederations[t.team_id] = t.confederation_code);

    const playerBirthYears = {};
    players.forEach(p => {
      if (p.birth_date) {
        playerBirthYears[p.player_id] = parseInt(p.birth_date.split('-')[0]);
      }
    });

    // Deducing stage reached per team per tournament
    const stageReached = {}; // { [tournament_id]: { [team_id]: depthNumber } }
    matches.forEach(m => {
      if (!validTournaments.has(m.tournament_id)) return;
      const year = m.tournament_id?.split('-')[1];
      if (!stageReached[year]) stageReached[year] = {};

      const stg = m.stage_name.toLowerCase();
      let depth = DEPTH_MAP[stg] || 1;

      // If final, figure out winner
      if (stg === 'final') {
        const homeScore = m.home_team_score + (m.home_team_score_penalties || 0);
        const awayScore = m.away_team_score + (m.away_team_score_penalties || 0);
        if (homeScore > awayScore) {
          stageReached[year][m.home_team_id] = Math.max(stageReached[year][m.home_team_id] || 0, 6);
          stageReached[year][m.away_team_id] = Math.max(stageReached[year][m.away_team_id] || 0, 5);
        } else if (awayScore > homeScore) {
          stageReached[year][m.away_team_id] = Math.max(stageReached[year][m.away_team_id] || 0, 6);
          stageReached[year][m.home_team_id] = Math.max(stageReached[year][m.home_team_id] || 0, 5);
        }
      } else {
        stageReached[year][m.home_team_id] = Math.max(stageReached[year][m.home_team_id] || 0, depth);
        stageReached[year][m.away_team_id] = Math.max(stageReached[year][m.away_team_id] || 0, depth);
      }
    });

    // Compute avg age
    const ages = {}; // { [year-teamId]: { sum, count, confed, name, year } }
    squads.forEach(s => {
       if (!validTournaments.has(s.tournament_id)) return;
       const year = s.tournament_id?.split('-')[1];
       if (!year) return;
       const key = `${year}-${s.team_id}`;

       if (!ages[key]) {
         ages[key] = {
           sum: 0, count: 0,
           team: s.team_name,
           year: year,
           teamId: s.team_id,
           confed: confederations[s.team_id] || 'Unknown'
         };
       }

       // Calculate age roughly
       const bYear = playerBirthYears[s.player_id];
       if (bYear && !isNaN(bYear)) {
         ages[key].sum += (parseInt(year) - bYear);
         ages[key].count += 1;
       }
    });

    const parsed = Object.values(ages).filter(a => a.count > 0).map(a => {
      return {
        ...a,
        age: parseFloat((a.sum / a.count).toFixed(2)),
        depth: stageReached[a.year]?.[a.teamId] || 1
      };
    });

    return parsed;
  }, [squads, teams, matches, players, tournamentsList]);

  const CUSTOM_TICKS = ['', 'Group', 'R16', 'QF', 'SF', '2nd', 'Winner'];

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="flex justify-between items-end mb-4">
         <div>
           <h1 className="text-3xl font-bold mb-1">Squad Age vs. Performance Depth</h1>
           <p className="text-inkMuted text-sm">Do older, experienced squads go deeper into the tournament?</p>
         </div>
         <div className="flex gap-4 items-center">
            {Object.keys(CONFED_COLORS).map(c => (
              <div key={c} className="flex items-center gap-1.5 text-[10px] font-bold text-inkSecondary uppercase">
                 <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CONFED_COLORS[c] }} />
                 {c}
              </div>
            ))}
         </div>
      </div>

      <Card index={0} className="w-full h-[550px] p-6 pt-10 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--borderLayer)" />
            <XAxis
              type="number"
              dataKey="age"
              name="Average Age"
              domain={['dataMin - 1', 'dataMax + 1']}
              tick={{ fontFamily: 'Space Mono', fontSize: 10, fill: '#888880' }}
              axisLine={false}
              tickLine={false}
              label={{ value: 'Average Squad Age (Years)', position: 'insideBottom', offset: -15, fontSize: 12, fontWeight: 'bold' }}
            />
            <YAxis
              type="number"
              dataKey="depth"
              name="Stage Reached"
              domain={[1, 6]}
              ticks={[1,2,3,4,5,6]}
              tickFormatter={(v) => CUSTOM_TICKS[v] || v}
              tick={{ fontFamily: 'Space Grotesk', fontSize: 10, fill: '#888880', fontWeight: 'bold' }}
              axisLine={false}
              tickLine={false}
            />
            <ZAxis type="number" range={[40, 40]} /> {/* static dot size */}
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-bg border border-borderLight p-3 rounded-lg shadow-xl min-w-[200px]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-inkPrimary">{d.team}</span>
                        <span className="font-mono bg-cardSecondary px-2 py-0.5 rounded text-xs">{d.year}</span>
                      </div>
                      <div className="text-xs text-inkSecondary mb-1 font-mono uppercase tracking-widest">{d.confed}</div>
                      <div className="flex justify-between text-sm mt-3">
                        <span className="text-inkMuted">Avg Age:</span>
                        <span className="font-mono font-bold">{d.age}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-inkMuted">Stage:</span>
                        <span className="font-bold">{CUSTOM_TICKS[d.depth]}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter name="Squads" data={chartData} animationDuration={1000} animationEasing="ease-out">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CONFED_COLORS[entry.confed] || '#94A3B8'} fillOpacity={0.85} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
