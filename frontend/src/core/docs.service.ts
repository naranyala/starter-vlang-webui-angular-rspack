/**
 * Documentation Service
 * 
 * Dynamically loads and manages documentation manifest and menu items
 */

import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoggerService } from './logger.service';

export interface DocItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  description?: string;
  updatedAt?: string;
  group?: string;
}

export interface DocGroup {
  id: string;
  title: string;
  icon: string;
  items: DocItem[];
}

export interface DocsManifest {
  version: string;
  generatedAt: string;
  docsFolder: string;
  groups: DocGroup[];
  allDocs: DocItem[];
}

@Injectable({ providedIn: 'root' })
export class DocsService {
  private readonly http = inject(HttpClient);
  private readonly logger = inject(LoggerService);

  private readonly manifestUrl = 'assets/docs/manifest.json';

  // Signals
  manifest = signal<DocsManifest | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  lastLoaded = signal<Date | null>(null);

  // Computed signals
  groups = computed(() => this.manifest()?.groups || []);
  allDocs = computed(() => this.manifest()?.allDocs || []);
  isLoaded = computed(() => this.manifest() !== null);

  // Flat list of all menu items for quick access
  allMenuItems = computed(() => {
    const items: DocItem[] = [];
    for (const group of this.groups()) {
      items.push(...group.items);
    }
    return items;
  });

  /**
   * Load documentation manifest
   */
  async loadManifest(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const manifest = await this.http.get<DocsManifest>(this.manifestUrl).toPromise();
      
      if (!manifest) {
        throw new Error('Manifest is empty');
      }

      this.manifest.set(manifest);
      this.lastLoaded.set(new Date());
      
      this.logger.info('Docs manifest loaded', {
        version: manifest.version,
        groups: manifest.groups.length,
        docs: manifest.allDocs.length
      });
    } catch (err: any) {
      const message = err.message || 'Failed to load documentation manifest';
      this.error.set(message);
      this.logger.error('Failed to load docs manifest', err);
      
      // Fallback to default menu if manifest fails
      this.loadDefaultMenu();
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Load default menu as fallback
   */
  private loadDefaultMenu(): void {
    const defaultManifest: DocsManifest = {
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      docsFolder: 'assets/docs',
      groups: [
        {
          id: 'core',
          title: 'Core Documentation',
          icon: '📖',
          items: [
            { id: 'INDEX', label: 'Overview', icon: '📖', path: 'INDEX.md' },
            { id: '00-GETTING_STARTED', label: 'Getting Started', icon: '🚀', path: '00-GETTING_STARTED.md' },
            { id: '01-ARCHITECTURE', label: 'Architecture', icon: '🏗️', path: '01-ARCHITECTURE.md' },
            { id: '01-CRUD-DEMOS', label: 'CRUD Demos', icon: '📋', path: '01-CRUD-DEMOS.md' },
            { id: '02-API_REFERENCE', label: 'API Reference', icon: '📚', path: '02-API_REFERENCE.md' },
            { id: '03-SECURITY', label: 'Security', icon: '🔒', path: '03-SECURITY.md' },
            { id: '04-DEVELOPMENT', label: 'Development', icon: '🛠️', path: '04-DEVELOPMENT.md' },
            { id: '05-DEPLOYMENT', label: 'Deployment', icon: '📦', path: '05-DEPLOYMENT.md' }
          ]
        }
      ],
      allDocs: []
    };

    this.manifest.set(defaultManifest);
    this.logger.warn('Using default documentation menu');
  }

  /**
   * Get document by ID
   */
  getDocById(id: string): DocItem | undefined {
    return this.allDocs().find(doc => doc.id === id);
  }

  /**
   * Get document path by ID
   */
  getDocPath(id: string): string {
    const doc = this.getDocById(id);
    return doc ? `assets/docs/${doc.path}` : '';
  }

  /**
   * Search documents
   */
  searchDocs(query: string): DocItem[] {
    if (!query.trim()) {
      return [];
    }

    const searchQuery = query.toLowerCase();
    
    return this.allDocs().filter(doc => 
      doc.label.toLowerCase().includes(searchQuery) ||
      doc.description?.toLowerCase().includes(searchQuery) ||
      doc.id.toLowerCase().includes(searchQuery)
    );
  }

  /**
   * Get recently updated documents
   */
  getRecentDocs(limit: number = 5): DocItem[] {
    return this.allDocs()
      .filter(doc => doc.updatedAt)
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt!).getTime();
        const dateB = new Date(b.updatedAt!).getTime();
        return dateB - dateA;
      })
      .slice(0, limit);
  }

  /**
   * Refresh manifest (e.g., after docs sync)
   */
  async refresh(): Promise<void> {
    this.logger.info('Refreshing docs manifest...');
    await this.loadManifest();
  }

  /**
   * Check if manifest needs refresh (older than 1 hour)
   */
  needsRefresh(): boolean {
    const lastLoaded = this.lastLoaded();
    if (!lastLoaded) {
      return true;
    }

    const oneHour = 60 * 60 * 1000;
    return Date.now() - lastLoaded.getTime() > oneHour;
  }
}
