/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import Papa from 'papaparse';

const DataContext = createContext(null);

const BASE_URL = 'https://raw.githubusercontent.com/jfjelstul/worldcup/master/data-csv/';
const DATASETS = [
  'tournaments.csv',
  'matches.csv',
  'squads.csv',
  'goals.csv',
  'bookings.csv',
  'teams.csv',
  'referees.csv',
  'penalty_kicks.csv',
  'players.csv',
  'referee_appearances.csv'
];

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({});
  const [loadingConfig, setLoadingConfig] = useState({
    isLoading: true,
    progress: 0,
    currentFile: '',
    error: null
  });

  useEffect(() => {
    let mounted = true;
    const fetchAllData = async () => {
      const results = {};
      let completed = 0;

      try {
        for (const file of DATASETS) {
          if (!mounted) break;
          setLoadingConfig(prev => ({ ...prev, currentFile: file }));

          await new Promise((resolve, reject) => {
            Papa.parse(BASE_URL + file, {
              download: true,
              header: true,
              dynamicTyping: true,
              skipEmptyLines: true,
              complete: (res) => {
                const key = file.replace('.csv', '');
                results[key] = res.data;
                completed++;
                setLoadingConfig(prev => ({
                  ...prev,
                  progress: Math.floor((completed / DATASETS.length) * 100)
                }));
                resolve();
              },
              error: (err) => {
                console.error(`Failed loading ${file}`, err);
                reject(err);
              }
            });
          });
        }

        if (mounted) {
          setData(results);
          setLoadingConfig(prev => ({ ...prev, isLoading: false }));
        }
      } catch {
        if (mounted) {
          setLoadingConfig(prev => ({ ...prev, error: "Failed to load World Cup data.", isLoading: false }));
        }
      }
    };

    fetchAllData();
    return () => { mounted = false; };
  }, []);

  return (
    <DataContext.Provider value={{ data, ...loadingConfig }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within a DataProvider");
  return context;
};
