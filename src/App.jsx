import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import { Layout } from './components/Layout/Layout';

// Pages
import { Dashboard } from './pages/Dashboard';
import { MinuteHeatmap } from './pages/MinuteHeatmap';
import { ClubDominance } from './pages/ClubDominance';
import { PenaltyGraveyard } from './pages/PenaltyGraveyard';
import { HeadToHead } from './pages/HeadToHead';
import { SquadAgePerformance } from './pages/SquadAgePerformance';
import { RefereeBias } from './pages/RefereeBias';
import { GroupOfDeath } from './pages/GroupOfDeath';
import { WonderWall } from './pages/WonderWall';

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/goals" element={<MinuteHeatmap />} />
            <Route path="/clubs" element={<ClubDominance />} />
            <Route path="/penalties" element={<PenaltyGraveyard />} />
            <Route path="/h2h" element={<HeadToHead />} />
            <Route path="/squads" element={<SquadAgePerformance />} />
            <Route path="/referees" element={<RefereeBias />} />
            <Route path="/groups" element={<GroupOfDeath />} />
            <Route path="/wonders" element={<WonderWall />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;
