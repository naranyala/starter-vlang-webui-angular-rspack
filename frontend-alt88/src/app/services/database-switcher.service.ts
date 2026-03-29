/**
 * Database Switcher Service
 * Allows switching between SQLite and DuckDB modes
 */

import { Injectable, signal, computed } from '@angular/core';

export type DatabaseType = 'sqlite' | 'duckdb';

export interface DatabaseInfo {
  type: DatabaseType;
  label: string;
  icon: string;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class DatabaseSwitcherService {
  private readonly databases: DatabaseInfo[] = [
    {
      type: 'sqlite',
      label: 'SQLite',
      icon: '🗄️',
      description: 'Lightweight file-based database'
    },
    {
      type: 'duckdb',
      label: 'DuckDB',
      icon: '🦆',
      description: 'Analytics database with demo data'
    }
  ];

  private readonly currentDb = signal<DatabaseType>('duckdb');
  
  readonly currentDatabase = computed(() => 
    this.databases.find(db => db.type === this.currentDb())!
  );
  
  readonly availableDatabases = this.databases;
  
  readonly isSqlite = computed(() => this.currentDb() === 'sqlite');
  readonly isDuckdb = computed(() => this.currentDb() === 'duckdb');

  switchTo(type: DatabaseType): void {
    this.currentDb.set(type);
    // Store preference in localStorage
    localStorage.setItem('preferredDatabase', type);
  }

  toggle(): void {
    const next = this.currentDb() === 'sqlite' ? 'duckdb' : 'sqlite';
    this.switchTo(next);
  }

  loadPreference(): void {
    const saved = localStorage.getItem('preferredDatabase') as DatabaseType | null;
    if (saved && (saved === 'sqlite' || saved === 'duckdb')) {
      this.currentDb.set(saved);
    }
  }
}
