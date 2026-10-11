export interface LifeArea {
  id: string;
  name: string;
  icon: string;
  accentColor: string;
  accentColorDark: string;
  lightBackground: string;
}

export const LIFE_AREAS: LifeArea[] = [
  {
    id: 'health',
    name: 'Health',
    icon: 'heart',
    accentColor: '#84CC16',
    accentColorDark: '#A3E635',
    lightBackground: '#F7FCEB',
  },
];

export const DEFAULT_AREA = LIFE_AREAS[0];
