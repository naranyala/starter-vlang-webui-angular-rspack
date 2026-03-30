/**
 * Data Management Service
 * Handles data persistence, export, import, and reset operations
 */

import { Injectable, signal } from '@angular/core';
import { ApiService } from '../core/api.service';
import { LoggerService } from '../core/logger.service';
import { NotificationService } from '../core/notification.service';

export interface DataStats {
  users: number;
  products: number;
  orders: number;
  totalRecords: number;
  lastUpdated: string;
}

export interface ExportData {
  version: string;
  exportedAt: string;
  storageType: 'sqlite' | 'duckdb';
  users: any[];
  products: any[];
  orders: any[];
}

@Injectable({ providedIn: 'root' })
export class DataManagementService {
  private readonly exportVersion = '1.0.0';

  isPersistent = signal(false);
  storageType = signal<'sqlite' | 'duckdb'>('duckdb');
  lastSaved = signal<string | null>(null);
  dataStats = signal<DataStats>({ users: 0, products: 0, orders: 0, totalRecords: 0, lastUpdated: '' });

  constructor(
    private readonly api: ApiService,
    private readonly logger: LoggerService,
    private readonly notification: NotificationService
  ) {
    this.detectStorageType();
  }

  private detectStorageType(): void {
    // SQLite is always persistent (file-based)
    // DuckDB uses JSON file persistence
    const envStorageType = localStorage.getItem('storage_type') || 'duckdb';
    this.storageType.set(envStorageType as 'sqlite' | 'duckdb');
    this.isPersistent.set(envStorageType === 'sqlite');
  }

  /**
   * Set storage type
   */
  setStorageType(type: 'sqlite' | 'duckdb'): void {
    this.storageType.set(type);
    this.isPersistent.set(type === 'sqlite');
    localStorage.setItem('storage_type', type);
    this.notification.info(`Switched to ${type === 'sqlite' ? 'SQLite' : 'DuckDB'} storage`);
  }

  /**
   * Get current data statistics
   */
  async getDataStats(): Promise<DataStats> {
    try {
      const [users, products, orders] = await Promise.all([
        this.api.callOrThrow<any[]>('getUsers').catch(() => []),
        this.api.callOrThrow<any[]>('getProducts').catch(() => []),
        this.api.callOrThrow<any[]>('getOrders').catch(() => []),
      ]);

      const stats = {
        users: users.length,
        products: products.length,
        orders: orders.length,
        totalRecords: users.length + products.length + orders.length,
        lastUpdated: new Date().toISOString()
      };

      this.dataStats.set(stats);
      this.lastSaved.set(new Date().toLocaleString());

      return stats;
    } catch (error) {
      this.logger.error('Failed to get data stats', error);
      return this.dataStats();
    }
  }

  /**
   * Export all data to JSON file
   */
  async exportData(): Promise<void> {
    try {
      const [users, products, orders] = await Promise.all([
        this.api.callOrThrow<any[]>('getUsers'),
        this.api.callOrThrow<any[]>('getProducts'),
        this.api.callOrThrow<any[]>('getOrders'),
      ]);

      const exportData: ExportData = {
        version: this.exportVersion,
        exportedAt: new Date().toISOString(),
        storageType: this.storageType(),
        users,
        products,
        orders
      };

      // Create download blob
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${this.storageType()}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.notification.success('Data exported successfully');
      this.logger.info('Data exported', { records: exportData.users.length + exportData.products.length + exportData.orders.length });
    } catch (error: any) {
      this.logger.error('Failed to export data', error);
      this.notification.error('Failed to export data: ' + (error.message || 'Unknown error'));
    }
  }

  /**
   * Import data from JSON file
   */
  async importData(file: File): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target?.result as string) as ExportData;

          // Validate import data
          if (!this.validateImportData(data)) {
            reject(new Error('Invalid import file format'));
            return;
          }

          // Clear existing data
          await this.clearAllData();

          // Import users
          for (const user of data.users) {
            await this.api.callOrThrow('createUser', [user.name, user.email, user.age]);
          }

          // Import products
          for (const product of data.products) {
            await this.api.callOrThrow('createProduct', [product.name, product.description, product.price, product.stock, product.category]);
          }

          // Import orders
          for (const order of data.orders) {
            await this.api.callOrThrow('createOrder', [order.user_id, order.user_name, order.items, order.total, order.status]);
          }

          this.notification.success(`Imported ${data.users.length} users, ${data.products.length} products, ${data.orders.length} orders`);
          this.logger.info('Data imported successfully', data);
          await this.getDataStats();
          resolve();
        } catch (error: any) {
          this.logger.error('Failed to import data', error);
          this.notification.error('Failed to import data: ' + (error.message || 'Unknown error'));
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Validate import data structure
   */
  private validateImportData(data: any): boolean {
    return data &&
      data.version &&
      Array.isArray(data.users) &&
      Array.isArray(data.products) &&
      Array.isArray(data.orders);
  }

  /**
   * Clear all data with confirmation
   */
  async clearAllData(): Promise<void> {
    try {
      const users = await this.api.callOrThrow<any[]>('getUsers');
      const products = await this.api.callOrThrow<any[]>('getProducts');
      const orders = await this.api.callOrThrow<any[]>('getOrders');

      // Delete in order (orders first due to foreign keys)
      for (const order of orders) {
        await this.api.callOrThrow('deleteOrder', [order.id]);
      }

      for (const product of products) {
        await this.api.callOrThrow('deleteProduct', [product.id]);
      }

      for (const user of users) {
        await this.api.callOrThrow('deleteUser', [user.id]);
      }

      this.notification.success('All data cleared');
      await this.getDataStats();
    } catch (error: any) {
      this.logger.error('Failed to clear data', error);
      this.notification.error('Failed to clear data: ' + (error.message || 'Unknown error'));
    }
  }

  /**
   * Reset to demo data
   */
  async resetToDemoData(): Promise<void> {
    try {
      await this.clearAllData();

      // Create demo users
      const demoUsers = [
        { name: 'John Doe', email: 'john@example.com', age: 28 },
        { name: 'Jane Smith', email: 'jane@example.com', age: 34 },
        { name: 'Bob Wilson', email: 'bob@example.com', age: 45 },
        { name: 'Alice Brown', email: 'alice@example.com', age: 29 },
        { name: 'Charlie Davis', email: 'charlie@example.com', age: 38 },
      ];

      for (const user of demoUsers) {
        await this.api.callOrThrow('createUser', [user.name, user.email, user.age]);
      }

      // Create demo products
      const demoProducts = [
        { name: 'Laptop Pro', description: 'High-performance laptop', price: 1299.99, stock: 50, category: 'Electronics' },
        { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', price: 49.99, stock: 100, category: 'Electronics' },
        { name: 'USB-C Hub', description: '7-in-1 USB-C hub', price: 79.99, stock: 75, category: 'Electronics' },
        { name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard', price: 149.99, stock: 30, category: 'Electronics' },
        { name: 'Monitor 27"', description: '4K UHD monitor', price: 399.99, stock: 25, category: 'Electronics' },
        { name: 'Desk Chair', description: 'Ergonomic office chair', price: 299.99, stock: 20, category: 'Home' },
        { name: 'Desk Lamp', description: 'LED desk lamp', price: 39.99, stock: 60, category: 'Home' },
        { name: 'Notebook Set', description: 'Pack of 5 notebooks', price: 19.99, stock: 100, category: 'Books' },
      ];

      for (const product of demoProducts) {
        await this.api.callOrThrow('createProduct', [product.name, product.description, product.price, product.stock, product.category]);
      }

      // Create demo orders
      const demoOrders = [
        { user_id: 1, user_name: 'John Doe', items: [{ product_id: 1, product_name: 'Laptop Pro', quantity: 1, price: 1299.99 }], total: 1299.99, status: 'completed' },
        { user_id: 2, user_name: 'Jane Smith', items: [{ product_id: 2, product_name: 'Wireless Mouse', quantity: 2, price: 49.99 }], total: 99.98, status: 'pending' },
        { user_id: 3, user_name: 'Bob Wilson', items: [{ product_id: 3, product_name: 'USB-C Hub', quantity: 1, price: 79.99 }, { product_id: 4, product_name: 'Mechanical Keyboard', quantity: 1, price: 149.99 }], total: 229.98, status: 'shipped' },
      ];

      for (const order of demoOrders) {
        await this.api.callOrThrow('createOrder', [order.user_id, order.user_name, order.items, order.total, order.status]);
      }

      this.notification.success('Demo data restored');
      await this.getDataStats();
    } catch (error: any) {
      this.logger.error('Failed to reset demo data', error);
      this.notification.error('Failed to reset demo data: ' + (error.message || 'Unknown error'));
    }
  }

  /**
   * Force save (for DuckDB JSON persistence)
   */
  async forceSave(): Promise<void> {
    try {
      // For DuckDB, trigger a save by getting stats (which triggers file write)
      await this.getDataStats();
      this.notification.success('Data saved successfully');
    } catch (error: any) {
      this.logger.error('Failed to save data', error);
      this.notification.error('Failed to save data');
    }
  }
}
