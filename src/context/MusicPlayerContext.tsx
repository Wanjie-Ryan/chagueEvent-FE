import React, { createContext, useContext } from 'react';

// Mock Music Player Context to prevent breakage
const MusicPlayerContext = createContext<any>(null);
export const MusicPlayerProvider = ({ children }: { children: React.ReactNode }) => (
  <MusicPlayerContext.Provider value={{ isPlaying: false, currentTrack: null, playTrack: () => {}, togglePlay: () => {} }}>
    {children}
  </MusicPlayerContext.Provider>
);
export const useMusicPlayer = () => useContext(MusicPlayerContext) || { isPlaying: false };
