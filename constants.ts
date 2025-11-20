import { ContainerType, CargoItem } from './types';

export const CONTAINERS: ContainerType[] = [
  {
    id: '20gp',
    name: "20' Standard (20GP)",
    length: 5898,
    width: 2352,
    height: 2393,
    maxVolume: 33.2,
    maxWeight: 28200
  },
  {
    id: '40gp',
    name: "40' Standard (40GP)",
    length: 12032,
    width: 2352,
    height: 2393,
    maxVolume: 67.7,
    maxWeight: 26600
  },
  {
    id: '40hq',
    name: "40' High Cube (40HQ)",
    length: 12032,
    width: 2352,
    height: 2698,
    maxVolume: 76.3,
    maxWeight: 28600
  }
];

export const DEFAULT_ITEMS: CargoItem[] = [
  {
    id: '1',
    name: 'Heavy Machinery Parts',
    length: 800,
    width: 600,
    height: 500,
    color: '#3b82f6', // Blue
    quantity: 12,
    weight: 150, // Heavy
    allowRotation: false
  },
  {
    id: '2',
    name: 'Standard Electronics',
    length: 400,
    width: 300,
    height: 300,
    color: '#eab308', // Yellow
    quantity: 120,
    weight: 12, // Medium
    allowRotation: true
  },
  {
    id: '3',
    name: 'Light Accessories',
    length: 300,
    width: 200,
    height: 200,
    color: '#f43f5e', // Pink/Red
    quantity: 200,
    weight: 2, // Light
    allowRotation: true
  },
  {
    id: '4',
    name: 'Long Pallet',
    length: 1200,
    width: 800,
    height: 1000,
    color: '#8b5cf6', // Violet
    quantity: 6,
    weight: 400, // Very Heavy
    allowRotation: false
  }
];

// A nice set of distinct "Industrial/Cardboard" colors
export const COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#84cc16', // Lime
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#d946ef', // Fuchsia
  '#f43f5e', // Rose
  '#94a3b8', // Slate
  '#a16207', // Brown
];