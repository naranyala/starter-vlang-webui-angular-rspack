import { Component, signal, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getLogger } from '../../viewmodels/logger.viewmodel';
import { HttpService } from '../../core/http.service';

export interface User {
  id?: number;
  name: string;
  email: string;
  age: number;
  created_at?: string;
}

export interface UserStats {
  total_users: number;
  today_count: number;
  unique_domains: number;
}

@Component({
  selector: 'app-sqlite-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sqlite-wrapper">
      <div class="sqlite-container">
        <!-- Header -->
        <div class="sqlite-header">
          <div class="sqlite-logo">
            <span class="logo-icon">🗄️</span>
          </div>
          <h1 class="sqlite-title">SQLite CRUD Demo</h1>
          <p class="sqlite-subtitle">Complete CRUD operations with Vlang backend</p>
        </div>

        <!-- Stats -->
        <div class="stats-bar">
          <div class="stat-item">
            <span class="stat-icon">📊</span>
            <span class="stat-value">{{ stats().total_users }}</span>
            <span class="stat-label">Total Users</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">📝</span>
            <span class="stat-value">{{ stats().today_count }}</span>
            <span class="stat-label">Added Today</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">📧</span>
            <span class="stat-value">{{ stats().unique_domains }}</span>
            <span class="stat-label">Email Domains</span>
          </div>
        </div>

        <!-- Tabs -->
        <div class="sqlite-tabs">
          <button
            type="button"
            class="sqlite-tab"
            [class.active]="activeTab() === 'list'"
            (click)="setActiveTab('list')">
            <span class="tab-icon">📋</span>
            <span class="tab-label">User List</span>
          </button>
          <button
            type="button"
            class="sqlite-tab"
            [class.active]="activeTab() === 'create'"
            (click)="setActiveTab('create')">
            <span class="tab-icon">➕</span>
            <span class="tab-label">Add User</span>
          </button>
        </div>

        <!-- User List Tab -->
        @if (activeTab() === 'list') {
          <div class="tab-content">
            <!-- Search and Filter -->
            <div class="toolbar">
              <div class="search-box">
                <span class="search-icon">🔍</span>
                <input
                  type="text"
                  class="search-input"
                  placeholder="Search users..."
                  [(ngModel)]="searchQuery" />
              </div>
              <button class="btn-refresh" (click)="loadUsers()" title="Refresh">
                🔄
              </button>
            </div>

            <!-- Users Table -->
            <div class="table-container">
              <table class="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Age</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (user of filteredUsers(); track user.id) {
                    <tr [class.editing]="editingUser()?.id === user.id">
                      <td class="id-cell">{{ user.id }}</td>
                      <td>
                        @if (editingUser()?.id === user.id) {
                          <input type="text" class="edit-input" [(ngModel)]="editForm.name" />
                        } @else {
                          <span class="cell-value">{{ user.name }}</span>
                        }
                      </td>
                      <td>
                        @if (editingUser()?.id === user.id) {
                          <input type="email" class="edit-input" [(ngModel)]="editForm.email" />
                        } @else {
                          <span class="cell-value">{{ user.email }}</span>
                        }
                      </td>
                      <td>
                        @if (editingUser()?.id === user.id) {
                          <input type="number" class="edit-input" [(ngModel)]="editForm.age" />
                        } @else {
                          <span class="cell-value">{{ user.age }}</span>
                        }
                      </td>
                      <td>
                        <span class="date-cell">{{ user.created_at | date:'MMM d, y' }}</span>
                      </td>
                      <td class="actions-cell">
                        @if (editingUser()?.id === user.id) {
                          <button class="btn-action btn-save" (click)="saveEdit(user)" title="Save">
                            💾
                          </button>
                          <button class="btn-action btn-cancel" (click)="cancelEdit()" title="Cancel">
                            ❌
                          </button>
                        } @else {
                          <button class="btn-action btn-edit" (click)="startEdit(user)" title="Edit">
                            ✏️
                          </button>
                          <button class="btn-action btn-delete" (click)="deleteUser(user)" title="Delete">
                            🗑️
                          </button>
                        }
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="6" class="empty-table">
                        <span class="empty-icon">📭</span>
                        <p>No users found. Add some users to get started!</p>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- Create User Tab -->
        @if (activeTab() === 'create') {
          <div class="tab-content">
            <form class="create-form" (ngSubmit)="createUser()">
              <div class="form-group">
                <label class="form-label" for="new-name">
                  <span class="label-icon">👤</span>
                  Name
                </label>
                <input
                  type="text"
                  id="new-name"
                  class="form-input"
                  placeholder="Enter full name"
                  [(ngModel)]="newUser.name"
                  required />
              </div>

              <div class="form-group">
                <label class="form-label" for="new-email">
                  <span class="label-icon">📧</span>
                  Email
                </label>
                <input
                  type="email"
                  id="new-email"
                  class="form-input"
                  placeholder="email@example.com"
                  [(ngModel)]="newUser.email"
                  required />
              </div>

              <div class="form-group">
                <label class="form-label" for="new-age">
                  <span class="label-icon">🎂</span>
                  Age
                </label>
                <input
                  type="number"
                  id="new-age"
                  class="form-input"
                  placeholder="Enter age"
                  [(ngModel)]="newUser.age"
                  min="1"
                  max="150"
                  required />
              </div>

              @if (formError()) {
                <div class="form-error">
                  <span class="error-icon">⚠️</span>
                  {{ formError() }}
                </div>
              }

              @if (formSuccess()) {
                <div class="form-success">
                  <span class="success-icon">✅</span>
                  {{ formSuccess() }}
                </div>
              }

              <div class="form-actions">
                <button type="submit" class="btn-primary" [disabled]="loading()">
                  @if (loading()) {
                    <span class="spinner"></span>
                    <span>Creating...</span>
                  } @else {
                    <span>➕</span>
                    <span>Create User</span>
                  }
                </button>
                <button type="button" class="btn-secondary" (click)="resetForm()">
                  🔄 Reset
                </button>
              </div>
            </form>
          </div>
        }

        <!-- Connection Status -->
        <div class="connection-status" [class.connected]="connected()" [class.disconnected]="!connected()">
          <span class="status-dot"></span>
          <span class="status-text">{{ connected() ? 'Connected to SQLite' : 'Disconnected' }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sqlite-wrapper {
      min-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      padding: 20px;
      box-sizing: border-box;
    }

    .sqlite-container {
      width: 100%;
      max-width: 900px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
    }

    .sqlite-header {
      text-align: center;
      margin-bottom: 25px;
    }

    .sqlite-logo {
      width: 70px;
      height: 70px;
      margin: 0 auto 12px;
      background: linear-gradient(135deg, #00b09b 0%, #96c93d 100%);
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 30px rgba(0, 176, 155, 0.4);
    }

    .logo-icon {
      font-size: 32px;
    }

    .sqlite-title {
      font-size: 26px;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0 0 6px 0;
    }

    .sqlite-subtitle {
      font-size: 14px;
      color: #666;
      margin: 0;
    }

    .stats-bar {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 25px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
      border-radius: 12px;
    }

    .stat-icon {
      font-size: 20px;
      margin-bottom: 6px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #00b09b;
    }

    .stat-label {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }

    .sqlite-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      background: #f0f0f5;
      padding: 5px;
      border-radius: 12px;
    }

    .sqlite-tab {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 20px;
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      color: #666;
      transition: all 0.3s ease;
    }

    .sqlite-tab.active {
      background: linear-gradient(135deg, #00b09b 0%, #96c93d 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(0, 176, 155, 0.4);
    }

    .sqlite-tab:hover:not(.active) {
      background: #e0e0e8;
    }

    .tab-icon {
      font-size: 16px;
    }

    .tab-content {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .toolbar {
      display: flex;
      gap: 10px;
      margin-bottom: 16px;
    }

    .search-box {
      flex: 1;
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 14px;
      opacity: 0.5;
    }

    .search-input {
      width: 100%;
      padding: 10px 12px 10px 36px;
      border: 2px solid #e0e0e8;
      border-radius: 10px;
      font-size: 14px;
      transition: all 0.2s;
      box-sizing: border-box;
    }

    .search-input:focus {
      outline: none;
      border-color: #00b09b;
      box-shadow: 0 0 0 4px rgba(0, 176, 155, 0.1);
    }

    .btn-refresh {
      padding: 10px 16px;
      background: #f0f0f5;
      border: none;
      border-radius: 10px;
      font-size: 18px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-refresh:hover {
      background: #e0e0e8;
      transform: rotate(90deg);
    }

    .table-container {
      overflow-x: auto;
      border-radius: 12px;
      border: 1px solid #e0e0e8;
    }

    .users-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .users-table thead {
      background: linear-gradient(135deg, #00b09b 0%, #96c93d 100%);
      color: white;
    }

    .users-table th {
      padding: 14px 12px;
      text-align: left;
      font-weight: 600;
    }

    .users-table tbody tr {
      border-bottom: 1px solid #e0e0e8;
      transition: background 0.2s;
    }

    .users-table tbody tr:hover {
      background: #f5f7fa;
    }

    .users-table tbody tr.editing {
      background: #fff9e6;
    }

    .users-table td {
      padding: 12px;
      vertical-align: middle;
    }

    .id-cell {
      font-weight: 600;
      color: #00b09b;
      width: 60px;
    }

    .cell-value {
      color: #333;
    }

    .date-cell {
      color: #666;
      font-size: 13px;
    }

    .edit-input {
      width: 100%;
      padding: 8px 10px;
      border: 2px solid #00b09b;
      border-radius: 6px;
      font-size: 14px;
      box-sizing: border-box;
    }

    .actions-cell {
      display: flex;
      gap: 6px;
    }

    .btn-action {
      padding: 6px 10px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-action:hover {
      transform: scale(1.1);
    }

    .btn-edit {
      background: #e3f2fd;
    }

    .btn-delete {
      background: #ffebee;
    }

    .btn-save {
      background: #e8f5e9;
    }

    .btn-cancel {
      background: #fff3e0;
    }

    .empty-table {
      text-align: center;
      padding: 40px 20px !important;
      color: #999;
    }

    .empty-icon {
      font-size: 48px;
      display: block;
      margin-bottom: 12px;
    }

    .create-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 500px;
      margin: 0 auto;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .label-icon {
      font-size: 14px;
    }

    .form-input {
      padding: 14px 16px;
      border: 2px solid #e0e0e8;
      border-radius: 12px;
      font-size: 15px;
      transition: all 0.3s;
      box-sizing: border-box;
    }

    .form-input:focus {
      outline: none;
      border-color: #00b09b;
      box-shadow: 0 0 0 4px rgba(0, 176, 155, 0.1);
    }

    .form-error {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 10px;
      color: #dc2626;
      font-size: 14px;
    }

    .form-success {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 10px;
      color: #16a34a;
      font-size: 14px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 10px;
    }

    .btn-primary {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 24px;
      background: linear-gradient(135deg, #00b09b 0%, #96c93d 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(0, 176, 155, 0.4);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 176, 155, 0.5);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      padding: 14px 24px;
      background: #f0f0f5;
      color: #666;
      border: none;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-secondary:hover {
      background: #e0e0e8;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .connection-status {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 20px;
      padding: 12px;
      background: #f0f0f5;
      border-radius: 10px;
      font-size: 13px;
    }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
      animation: pulse 2s infinite;
    }

    .connection-status.disconnected .status-dot {
      background: #ef4444;
      box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
      animation: none;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .status-text {
      color: #666;
      font-weight: 500;
    }

    @media (max-width: 600px) {
      .stats-bar {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .users-table {
        font-size: 13px;
      }

      .users-table th,
      .users-table td {
        padding: 8px 6px;
      }
    }
  `],
})
export class SqliteCrudComponent implements OnInit {
  private readonly logger = getLogger('sqlite-crud.component');
  private readonly http = inject(HttpService);

  // State
  users = signal<User[]>([]);
  stats = signal<UserStats>({ total_users: 0, today_count: 0, unique_domains: 0 });
  activeTab = signal<'list' | 'create'>('list');
  loading = signal(false);
  connected = signal(true);
  searchQuery = signal('');

  // Edit state
  editingUser = signal<User | null>(null);
  editForm = signal<User>({ name: '', email: '', age: 0 });

  // Create state
  newUser = signal<User>({ name: '', email: '', age: 0 });
  formError = signal<string | null>(null);
  formSuccess = signal<string | null>(null);

  // Computed
  filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.users();
    return this.users().filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  ngOnInit(): void {
    this.loadUsers();
    this.loadStats();
  }

  setActiveTab(tab: 'list' | 'create'): void {
    this.activeTab.set(tab);
    this.formError.set(null);
    this.formSuccess.set(null);
  }

  async loadUsers(): Promise<void> {
    this.loading.set(true);
    this.logger.info('Loading users...');

    try {
      const result = await this.http.get<any>('getUsers');
      
      if (result.isOk && result.value?.success) {
        this.users.set(result.value.data || []);
        this.connected.set(true);
        this.logger.info('Users loaded', { count: this.users().length });
      } else {
        throw new Error(result.error?.message || 'Failed to load users');
      }
    } catch (error) {
      this.logger.error('Failed to load users', { error });
      this.connected.set(false);
      this.users.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async loadStats(): Promise<void> {
    try {
      const result = await this.http.get<any>('getUserStats');
      
      if (result.isOk && result.value?.success) {
        this.stats.set(result.value.data || { total_users: 0, today_count: 0, unique_domains: 0 });
      }
    } catch (error) {
      this.logger.error('Failed to load stats', { error });
    }
  }

  async createUser(): Promise<void> {
    this.formError.set(null);
    this.formSuccess.set(null);

    const user = this.newUser();

    // Validation
    if (!user.name.trim()) {
      this.formError.set('Name is required');
      return;
    }
    if (!user.email.trim() || !user.email.includes('@')) {
      this.formError.set('Valid email is required');
      return;
    }
    if (!user.age || user.age < 1 || user.age > 150) {
      this.formError.set('Age must be between 1 and 150');
      return;
    }

    this.loading.set(true);

    try {
      const result = await this.http.post<any>('createUser', {
        name: user.name,
        email: user.email,
        age: user.age
      });

      if (result.isOk && result.value?.success) {
        await this.loadUsers();
        await this.loadStats();
        this.formSuccess.set('User created successfully!');
        this.resetForm();
        this.logger.info('User created', { user: result.value.data });
      } else {
        throw new Error(result.error?.message || 'Failed to create user');
      }
    } catch (error) {
      this.formError.set(error instanceof Error ? error.message : 'Failed to create user');
      this.logger.error('Create failed', { error });
    } finally {
      this.loading.set(false);
    }
  }

  startEdit(user: User): void {
    this.editingUser.set(user);
    this.editForm.set({ ...user });
    this.logger.info('Editing user', { id: user.id });
  }

  async saveEdit(user: User): Promise<void> {
    const editData = this.editForm();

    // Validation
    if (!editData.name.trim()) {
      this.formError.set('Name is required');
      return;
    }

    this.loading.set(true);

    try {
      const result = await this.http.put<any>('updateUser', {
        id: user.id,
        name: editData.name,
        email: editData.email,
        age: editData.age
      });

      if (result.isOk && result.value?.success) {
        await this.loadUsers();
        this.editingUser.set(null);
        this.logger.info('User updated', { id: user.id });
      } else {
        throw new Error(result.error?.message || 'Failed to update user');
      }
    } catch (error) {
      this.formError.set(error instanceof Error ? error.message : 'Failed to update user');
      this.logger.error('Update failed', { error });
    } finally {
      this.loading.set(false);
    }
  }

  cancelEdit(): void {
    this.editingUser.set(null);
    this.formError.set(null);
  }

  async deleteUser(user: User): Promise<void> {
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) {
      return;
    }

    this.loading.set(true);

    try {
      const result = await this.http.post<any>('deleteUser', {
        id: user.id?.toString() || ''
      });

      if (result.isOk && result.value?.success) {
        await this.loadUsers();
        await this.loadStats();
        this.logger.info('User deleted', { id: user.id });
      } else {
        throw new Error(result.error?.message || 'Failed to delete user');
      }
    } catch (error) {
      this.logger.error('Delete failed', { error });
    } finally {
      this.loading.set(false);
    }
  }

  resetForm(): void {
    this.newUser.set({ name: '', email: '', age: 0 });
    this.formError.set(null);
    this.formSuccess.set(null);
  }
}
