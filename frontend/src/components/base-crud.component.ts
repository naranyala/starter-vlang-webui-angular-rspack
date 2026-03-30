/**
 * Base CRUD Component
 * Abstract base class for all CRUD operation components
 * Provides common functionality for list, create, edit, delete operations
 */

import { Directive, signal, computed, inject, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../core/api.service';
import { LoggerService } from '../core/logger.service';
import { NotificationService } from '../core/notification.service';

/**
 * Column definition for data tables
 */
export interface ColumnDef {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'currency' | 'status' | 'actions';
  width?: string;
  visible?: boolean;
}

/**
 * Form field definition
 */
export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'textarea' | 'select' | 'date';
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  placeholder?: string;
  hint?: string;
}

/**
 * CRUD Configuration
 */
export interface CrudConfig<T> {
  entityName: string;
  entityNamePlural: string;
  icon: string;
  columns: ColumnDef[];
  formFields: FormField[];
  defaultFormData: Partial<T>;
  apiEndpoints: {
    list: string;
    get: string;
    create: string;
    update: string;
    delete: string;
    stats?: string;
  };
}

/**
 * Base CRUD Component Class
 * Generic type T represents the entity type
 */
@Directive()
export abstract class BaseCrudComponent<T extends { id: number }> {
  protected readonly api = inject(ApiService);
  protected readonly logger = inject(LoggerService);
  protected readonly notification = inject(NotificationService);

  // Abstract configuration - must be implemented by child class
  abstract config: CrudConfig<T>;

  // State signals
  readonly items = signal<T[]>([]);
  readonly filteredItems = signal<T[]>([]);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly searchQuery = signal('');
  readonly selectedItems = signal<T[]>([]);

  // Modal state
  readonly showModal = signal(false);
  readonly editingItem = signal<T | null>(null);
  readonly formData = signal<Partial<T>>({});
  readonly formErrors = signal<Record<string, string>>({});

  // Events
  @Output() statsChange = new EventEmitter<{ type: string; count: number }>();

  // Computed
  readonly hasItems = computed(() => this.items().length > 0);
  readonly hasSelection = computed(() => this.selectedItems().length > 0);
  readonly selectedItemIds = computed(() => this.selectedItems().map(item => item.id));

  /**
   * Initialize component
   */
  ngOnInit(): void {
    this.loadItems();
  }

  /**
   * Load all items from API
   */
  async loadItems(): Promise<void> {
    this.isLoading.set(true);
    try {
      const endpoint = this.config.apiEndpoints.list;
      const data = await this.api.callOrThrow<T[]>(endpoint);
      this.items.set(data);
      this.applyFilters();
      this.logger.info(`Loaded ${data.length} ${this.config.entityNamePlural.toLowerCase()}`);
    } catch (error: any) {
      this.logger.error(`Failed to load ${this.config.entityNamePlural.toLowerCase()}`, error);
      this.notification.error(`Failed to load ${this.config.entityNamePlural.toLowerCase()}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Apply search filters to items
   */
  applyFilters(): void {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      this.filteredItems.set([...this.items()]);
      return;
    }

    const filtered = this.items().filter(item =>
      Object.values(item as any).some(value =>
        value !== null && value !== undefined &&
        String(value).toLowerCase().includes(query)
      )
    );
    this.filteredItems.set(filtered);
  }

  /**
   * Handle search input
   */
  onSearchChange(): void {
    this.applyFilters();
  }

  /**
   * Show create modal
   */
  showCreateModal(): void {
    this.editingItem.set(null);
    this.formData.set({ ...this.config.defaultFormData });
    this.formErrors.set({});
    this.showModal.set(true);
  }

  /**
   * Show edit modal with item data
   */
  editItem(item: T): void {
    this.editingItem.set(item);
    this.formData.set({ ...item });
    this.formErrors.set({});
    this.showModal.set(true);
  }

  /**
   * Close modal
   */
  closeModal(): void {
    this.showModal.set(false);
    this.editingItem.set(null);
    this.formData.set({ ...this.config.defaultFormData });
    this.formErrors.set({});
  }

  /**
   * Validate form data
   */
  validateForm(): boolean {
    const errors: Record<string, string> = {};
    const data = this.formData();

    for (const field of this.config.formFields) {
      const value = data[field.key as keyof T];

      // Required validation
      if (field.required && (value === undefined || value === null || value === '')) {
        errors[field.key] = `${field.label} is required`;
        continue;
      }

      // Skip further validation if empty and not required
      if (value === undefined || value === null || value === '') {
        continue;
      }

      // String length validation
      if (typeof value === 'string') {
        if (field.minLength && value.length < field.minLength) {
          errors[field.key] = `${field.label} must be at least ${field.minLength} characters`;
        }
        if (field.maxLength && value.length > field.maxLength) {
          errors[field.key] = `${field.label} must be less than ${field.maxLength} characters`;
        }
        // Email validation
        if (field.type === 'email' && !value.includes('@')) {
          errors[field.key] = 'Invalid email format';
        }
      }

      // Number range validation
      if (typeof value === 'number') {
        if (field.min !== undefined && value < field.min) {
          errors[field.key] = `${field.label} must be at least ${field.min}`;
        }
        if (field.max !== undefined && value > field.max) {
          errors[field.key] = `${field.label} must be at most ${field.max}`;
        }
      }
    }

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  /**
   * Save item (create or update)
   */
  async saveItem(): Promise<void> {
    if (!this.validateForm()) {
      return;
    }

    this.isSaving.set(true);
    try {
      const data = this.formData();
      const isEdit = !!this.editingItem();

      if (isEdit) {
        // Update existing item
        const endpoint = this.config.apiEndpoints.update;
        const id = this.editingItem()!.id;
        const args = this.buildUpdateArgs(id, data);
        await this.api.callOrThrow(endpoint, args);
        this.notification.success(`${this.config.entityName} updated successfully`);
      } else {
        // Create new item
        const endpoint = this.config.apiEndpoints.create;
        const args = this.buildCreateArgs(data);
        await this.api.callOrThrow(endpoint, args);
        this.notification.success(`${this.config.entityName} created successfully`);
      }

      this.closeModal();
      await this.loadItems();
      this.statsChange.emit({ type: `total${this.config.entityNamePlural}`, count: this.items().length });
    } catch (error: any) {
      this.logger.error(`Failed to save ${this.config.entityName.toLowerCase()}`, error);
      this.notification.error(error.message || `Failed to save ${this.config.entityName.toLowerCase()}`);
      this.formErrors.set({ submit: error.message || 'Failed to save' });
    } finally {
      this.isSaving.set(false);
    }
  }

  /**
   * Build arguments for create API call
   * Override in child class if needed
   */
  protected buildCreateArgs(data: Partial<T>): any[] {
    return this.config.formFields.map(field => data[field.key as keyof T]);
  }

  /**
   * Build arguments for update API call
   * Override in child class if needed
   */
  protected buildUpdateArgs(id: number, data: Partial<T>): any[] {
    return [id, ...this.config.formFields.map(field => data[field.key as keyof T])];
  }

  /**
   * Delete item
   */
  async deleteItem(item: T): Promise<void> {
    const confirmed = confirm(`Are you sure you want to delete this ${this.config.entityName.toLowerCase()}?`);
    if (!confirmed) {
      return;
    }

    this.isLoading.set(true);
    try {
      const endpoint = this.config.apiEndpoints.delete;
      await this.api.callOrThrow(endpoint, [item.id]);
      this.notification.success(`${this.config.entityName} deleted successfully`);
      await this.loadItems();
      this.statsChange.emit({ type: `total${this.config.entityNamePlural}`, count: this.items().length - 1 });
    } catch (error: any) {
      this.logger.error(`Failed to delete ${this.config.entityName.toLowerCase()}`, error);
      this.notification.error(error.message || `Failed to delete ${this.config.entityName.toLowerCase()}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Toggle item selection
   */
  toggleSelection(item: T): void {
    const current = this.selectedItems();
    const index = current.findIndex(i => i.id === item.id);

    if (index >= 0) {
      this.selectedItems.set(current.filter(i => i.id !== item.id));
    } else {
      this.selectedItems.set([...current, item]);
    }
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    this.selectedItems.set([]);
  }

  /**
   * Format date for display
   */
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Format currency for display
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  /**
   * Get status badge variant
   */
  getStatusVariant(status: string): 'success' | 'warning' | 'info' | 'danger' | 'neutral' {
    const statusLower = status.toLowerCase();
    if (['active', 'completed', 'delivered', 'shipped'].includes(statusLower)) {
      return 'success';
    }
    if (['pending', 'processing'].includes(statusLower)) {
      return 'warning';
    }
    if (['cancelled', 'error', 'inactive'].includes(statusLower)) {
      return 'danger';
    }
    return 'neutral';
  }
}
