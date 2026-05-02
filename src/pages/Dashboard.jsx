import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/UI/Card';
import { Badge } from '../components/UI/Badge';
import { PixelFootball, PixelTrophy, PixelGrass } from '../components/PixelArt';

// Small inline stat row used inside cards
const StatRow = ({ label, value }) => (
  <div className="flex justify-between items-baseline py-1.5 border-b border-borderLight last:border-0">
    <span className="text-xs text-inkMuted">{label}</span>
    <span className="font-mono font-bold text-sm text-inkPrimary">{value}</span>
  </div>
);

export const Dashboard = () => {
  const { data } = useData();
  const allMatches     = data['matches']     || [];
  const allTournaments = data['tournaments'] || [];
  const allGoals       = data['goals']       || [];

  // Filter to Men's WC only
  const tournaments = useMemo(
    () => allTournaments.filter(t => t.tournament_name?.includes("Men's")),
    [allTournaments]
  );
  const menTournamentIds = useMemo(() => new Set(tournaments.map(t => t.tournament_id)), [tournaments]);
  const matches = useMemo(() => allMatches.filter(m => menTournamentIds.has(m.tournament_id)), [allMatches, menTournamentIds]);
  const goals   = useMemo(() => allGoals.filter(g => menTournamentIds.has(g.tournament_id)),   [allGoals,   menTournamentIds]);

  // Derived live stats from dataset
  const totalGoals   = goals.length;
  const totalMatches = matches.length;
  const totalEditions = tournaments.length;
  const avgGoalsPerMatch = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(2) : '2.67';

  return (
    <div className="grid grid-cols-12 gap-[14px]">

      {/* ── HERO CARD ── */}
      <Card index={0} featured className="col-span-12 md:col-span-8 bg-accentPrimary text-white flex flex-col justify-between min-h-[260px]">
        <div className="absolute top-[-15%] right-[-6%] opacity-[0.14] pointer-events-none">
          <PixelFootball pixelSize={16} />
        </div>
        <div className="relative z-10">
          <span className="text-[10px] uppercase font-bold tracking-widest text-accentLight mb-3 block">
            FIFA Men's World Cup Archive — 1930 to 2022
          </span>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            {totalEditions} Tournaments.<br />
            {totalGoals.toLocaleString()} Goals.<br />
            One Trophy.
          </h1>
        </div>
        <div className="relative z-10 flex gap-8 mt-6 pt-5 border-t border-white/20">
          <div>
            <div className="font-mono text-2xl font-bold">{totalEditions}</div>
            <div className="text-xs text-white/60 mt-0.5">Editions</div>
          </div>
          <div>
            <div className="font-mono text-2xl font-bold">{totalMatches.toLocaleString()}</div>
            <div className="text-xs text-white/60 mt-0.5">Matches</div>
          </div>
          <div>
            <div className="font-mono text-2xl font-bold">{totalGoals.toLocaleString()}</div>
            <div className="text-xs text-white/60 mt-0.5">Goals</div>
          </div>
          <div>
            <div className="font-mono text-2xl font-bold">{avgGoalsPerMatch}</div>
            <div className="text-xs text-white/60 mt-0.5">Goals/Match</div>
          </div>
        </div>
      </Card>

      {/* ── TOTAL EDITIONS ── */}
      <Card index={1} className="col-span-6 md:col-span-2 flex flex-col justify-between min-h-[130px]">
        <div>
          <h3 className="text-inkSecondary text-xs uppercase font-bold tracking-wider mb-2">Total Editions</h3>
          <div className="text-5xl font-mono font-bold text-inkPrimary">{totalEditions}</div>
          <div className="text-xs text-inkMuted mt-2">1930 to 2022</div>
        </div>
        <div className="mt-3"><Badge color="blue">+1 in 2026</Badge></div>
      </Card>

      {/* ── HOST NATIONS WON ── */}
      <Card index={2} className="col-span-6 md:col-span-2 flex flex-col justify-between min-h-[130px] bg-cardSecondary">
        <div>
          <h3 className="text-inkSecondary text-xs uppercase font-bold tracking-wider mb-2">Hosts Who Won</h3>
          <div className="text-5xl font-mono font-bold text-inkPrimary">6</div>
          <div className="text-xs text-inkMuted mt-2">URU, ITA, ENG, GER, ARG, FRA</div>
        </div>
        <div className="mt-3"><Badge color="green">Home advantage</Badge></div>
      </Card>

      {/* ── ALL-TIME TOP SCORER ── */}
      <Card index={3} className="col-span-12 md:col-span-4 flex flex-col justify-between bg-cardSecondary min-h-[130px]">
        <div>
          <h3 className="text-inkSecondary text-xs uppercase font-bold tracking-wider mb-2">All-time Top Scorer</h3>
          <div className="text-2xl font-mono font-bold text-inkPrimary">Miroslav Klose</div>
          <div className="text-xs text-inkMuted mt-1">16 goals across 4 World Cups (2002 to 2014)</div>
        </div>
        <div className="mt-3 flex gap-2 items-center flex-wrap">
          <Badge color="gold">Germany</Badge>
          <span className="text-xs text-inkMuted font-mono">24 matches played</span>
        </div>
      </Card>

      {/* ── MOST TITLES ── */}
      <Card index={4} className="col-span-12 md:col-span-3 flex flex-col justify-between bg-cardSecondary">
        <div>
          <h3 className="text-inkSecondary text-xs uppercase font-bold tracking-wider mb-2">Most Titles</h3>
          <div className="flex items-baseline gap-2">
            <div className="text-5xl font-mono font-bold text-inkPrimary">5</div>
            <div className="text-xs font-bold text-inkMuted">BRAZIL</div>
          </div>
          <div className="flex gap-1 mt-3 flex-wrap">
            {[1958,1962,1970,1994,2002].map(y => (
              <span key={y} className="text-[10px] font-mono bg-accentLight/30 text-accentPrimary px-1.5 py-0.5 rounded">{y}</span>
            ))}
          </div>
          <div className="mt-3 text-[10px] text-inkMuted">Germany and Italy follow with 4 titles each</div>
        </div>
        <div className="mt-3"><Badge color="gold">Kings of Football</Badge></div>
      </Card>

      {/* ── SINGLE EDITION SCORER ── */}
      <Card index={5} className="col-span-6 md:col-span-2 flex flex-col justify-between bg-cardSecondary">
        <div>
          <h3 className="text-inkSecondary text-xs uppercase font-bold tracking-wider mb-2">Single Edition</h3>
          <div className="text-5xl font-mono font-bold text-inkPrimary">13</div>
          <div className="text-sm font-bold text-inkSecondary mt-1">Just Fontaine</div>
          <div className="text-xs text-inkMuted mt-1">Goals in 1958 (France)</div>
        </div>
        <div className="mt-3"><Badge color="blue">Record since '58</Badge></div>
      </Card>

      {/* ── MOST MATCHES ── */}
      <Card index={6} className="col-span-6 md:col-span-2 flex flex-col justify-between bg-cardSecondary">
        <div>
          <h3 className="text-inkSecondary text-xs uppercase font-bold tracking-wider mb-2">Most Appearances</h3>
          <div className="text-5xl font-mono font-bold text-inkPrimary">26</div>
          <div className="text-sm font-bold text-inkSecondary mt-1">Lionel Messi</div>
          <div className="text-xs text-inkMuted mt-1">2006 to 2022 (ARG)</div>
        </div>
        <div className="mt-3"><Badge color="indigo">The GOAT</Badge></div>
      </Card>

      {/* ── TOP TITLES TABLE ── */}
      <Card index={7} className="col-span-12 md:col-span-5 flex flex-col">
        <h3 className="text-inkSecondary text-xs uppercase font-bold tracking-wider mb-4">Title Leaders</h3>
        <div className="flex-1">
          {[
            { nation: 'Brazil',      titles: 5, years: '58, 62, 70, 94, 02' },
            { nation: 'Germany',     titles: 4, years: '54, 74, 90, 14' },
            { nation: 'Italy',       titles: 4, years: '34, 38, 82, 06' },
            { nation: 'Argentina',   titles: 3, years: '78, 86, 22' },
            { nation: 'France',      titles: 2, years: '98, 18' },
            { nation: 'Uruguay',     titles: 2, years: '30, 50' },
          ].map((r, i) => (
            <div key={r.nation} className="flex items-center gap-3 py-2 border-b border-borderLight last:border-0">
              <span className="font-mono text-xs text-inkMuted w-4">{i + 1}</span>
              <div className="flex-1">
                <span className="font-bold text-sm text-inkPrimary">{r.nation}</span>
                <span className="text-[10px] text-inkMuted ml-2 font-mono">{r.years}</span>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: r.titles }).map((_, j) => (
                  <span key={j} className="text-sm">🏆</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── KEY RECORDS ── */}
      <Card index={8} className="col-span-12 md:col-span-4 flex flex-col">
        <h3 className="text-inkSecondary text-xs uppercase font-bold tracking-wider mb-4">Key Records</h3>
        <div className="flex-1">
          <StatRow label="Highest scoring match"       value="12 goals (AUT 7-5 SUI, 1954)" />
          <StatRow label="Biggest margin of victory"   value="9-0 (HUN vs KOR, 1954)" />
          <StatRow label="Largest WC crowd ever"       value="173,850 — Maracana, 1950" />
          <StatRow label="Youngest WC scorer"          value="Pele — 17y 239d (1958)" />
          <StatRow label="Longest penalty shootout"    value="Switzerland vs Ukraine, 2006" />
          <StatRow label="Most goals in one WC"        value="171 goals — 1998 & 2014" />
          <StatRow label="Fewest goals in one WC"      value="70 goals — 1930 & 1934" />
          <StatRow label="Nations participated"        value="85 countries all-time" />
        </div>
      </Card>

      {/* ── 2026 TEASER ── */}
      <Card index={9} className="col-span-12 md:col-span-3 flex flex-col justify-between bg-accentPrimary text-white">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-accentLight block mb-3">Coming Next</span>
          <div className="text-5xl font-mono font-bold">2026</div>
          <div className="text-sm font-bold mt-2 text-white/80">USA, Canada, Mexico</div>
          <div className="text-xs text-white/50 mt-1">48 Teams — 104 Matches</div>
        </div>
        <div className="mt-6 flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-white/50">Host cities</span>
            <span className="font-mono font-bold">16</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-white/50">Qualified nations</span>
            <span className="font-mono font-bold">48</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-white/50">Est. attendance</span>
            <span className="font-mono font-bold">5.5M+</span>
          </div>
        </div>
      </Card>

      {/* ── FOOTER ── */}
      <div className="col-span-12 mt-2 px-2 opacity-40">
        <PixelGrass width="100%" height="22px" />
      </div>
    </div>
  );
};
