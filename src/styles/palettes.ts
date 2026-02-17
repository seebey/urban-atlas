// src/styles/palettes.ts

export interface Palette {
  accent: string;
  accentLight: string;
  accentDark: string;
  background: string;
  foreground: string;
  gray: string;
  grayLight: string;
}

export const palettes: Record<string, Palette> = {
  barcelona: {
    accent: '#D4726A',
    accentLight: '#E8A9A3',
    accentDark: '#A85850',
    background: '#FAFAFA',
    foreground: '#1A1A1A',
    gray: '#666666',
    grayLight: '#E5E5E5',
  },
  manhattan: {
    accent: '#E8B84A',
    accentLight: '#F2D48A',
    accentDark: '#B8923A',
    background: '#FAFAFA',
    foreground: '#1A1A1A',
    gray: '#666666',
    grayLight: '#E5E5E5',
  },
  medieval: {
    accent: '#8B7355',
    accentLight: '#B9A88C',
    accentDark: '#6B5843',
    background: '#FAF8F5',
    foreground: '#2A2520',
    gray: '#666666',
    grayLight: '#E5E5E5',
  },
  'garden-city': {
    accent: '#7D9969',
    accentLight: '#A8C194',
    accentDark: '#5E7A4F',
    background: '#FAFAFA',
    foreground: '#1A1A1A',
    gray: '#666666',
    grayLight: '#E5E5E5',
  },
  superblock: {
    accent: '#4A90D9',
    accentLight: '#8AB8EA',
    accentDark: '#3670AD',
    background: '#FAFAFA',
    foreground: '#1A1A1A',
    gray: '#666666',
    grayLight: '#E5E5E5',
  },
  'sea-ranch': {
    accent: '#6B7B6E',
    accentLight: '#98A89A',
    accentDark: '#4F5C51',
    background: '#FAFAF8',
    foreground: '#1A1A1A',
    gray: '#666666',
    grayLight: '#E5E5E5',
  },
};

export function getPalette(name: string): Palette {
  return palettes[name] || palettes.barcelona;
}
