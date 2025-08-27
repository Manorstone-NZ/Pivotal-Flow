import { create } from 'zustand';
interface AppState{count:number;inc:()=>void}
export const useAppStore=create<AppState>(set=>({count:0,inc:()=>set(s=>({count:s.count+1}))}));
