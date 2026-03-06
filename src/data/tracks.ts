export interface Track {
  file: string; // filename inside public/audio/
  name: string; // displayed in "Now Playing"
}

export const TRACKS: Track[] = [
  { file: 'Tripp St. - Waddle.mp3', name: 'Waddle by Tripp St.' },
  { file: 'Of the Trees & DELTAnine - Feather of Truth.mp3', name: 'Feather of Truth by Of the Trees & DELTAnine' },
  { file: 'GRiZ - Koh Samui.mp3', name: 'Koh Samui by GRiZ' },
  { file: 'Esseks - This Will All Be Over Soon.mp3', name: 'This Will All Be Over Soon by Esseks' },
  { file: 'DMVU - How Far From What.mp3', name: 'How Far From What by DMVU' },
  { file: '5AM - Sprout.mp3', name: 'Sprout by 5AM Trio, ZONE Drums, Keith Wadsworth' },
  { file: 'parkbreezy - Vanilla Bean.mp3', name: 'Vanilla Bean by parkbreezy' },
  { file: 'Supertask - Divide.mp3', name: 'Divide by Supertask' },
  { file: 'Jon Kennedy - Bats In The Belfry.mp3', name: 'Bats In The Belfry by Jon Kennedy' },
];
