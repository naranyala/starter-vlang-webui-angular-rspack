"use strict";(self.webpackChunkangular_rspack_demo=self.webpackChunkangular_rspack_demo||[]).push([["889"],{983(e,t,a){a(216),a(702),a(229),"u">typeof window&&window.WinBox?console.debug("WinBox loaded and available on window.WinBox"):console.warn("WinBox was imported but not found on window object");var s=a(514),r=a(390),i=a(819),o=a(106),l=a(530);let n=class{constructor(){this.minLevel="info",this.maxEntries=100,this.logs=(0,i.vPA)([]),this.stats=(0,i.vPA)({total:0,debug:0,info:0,warn:0,error:0}),this.allLogs=this.logs.asReadonly(),this.logStats=this.stats.asReadonly(),this.errorLogs=(0,l.EW)(()=>this.logs().filter(e=>"error"===e.level)),this.warnLogs=(0,l.EW)(()=>this.logs().filter(e=>"warn"===e.level)),this.recentLogs=(0,l.EW)(()=>this.logs().slice(-20)),this.hasErrors=(0,l.EW)(()=>this.stats().error>0),this.logCount=(0,l.EW)(()=>this.stats().total),this.levelOrder={debug:0,info:1,warn:2,error:3},(0,i.QZP)(()=>{let e=this.logs();e.length>this.maxEntries&&this.logs.set(e.slice(-this.maxEntries))})}shouldLog(e){return this.levelOrder[e]>=this.levelOrder[this.minLevel]}addLog(e,t,a,s){if(!this.shouldLog(e))return;let r={level:e,message:t,data:a,timestamp:Date.now(),source:s};this.logs.update(e=>[...e,r]),this.updateStats(e);let i=new Date(r.timestamp).toLocaleTimeString(),o=`[${i}] [${e.toUpperCase()}] ${t}`;switch(e){case"debug":console.debug(o,a??"");break;case"info":console.info(o,a??"");break;case"warn":console.warn(o,a??"");break;case"error":console.error(o,a??"")}}updateStats(e){this.stats.update(t=>({...t,total:t.total+1,[e]:t[e]+1}))}debug(e,t,a){this.addLog("debug",e,t,a)}info(e,t,a){this.addLog("info",e,t,a)}warn(e,t,a){this.addLog("warn",e,t,a)}error(e,t,a){this.addLog("error",e,t,a)}getLogsByLevel(e){return this.logs().filter(t=>t.level===e)}getLogsSince(e){return this.logs().filter(t=>t.timestamp>=e)}getLogsBySource(e){return this.logs().filter(t=>t.source===e)}searchLogs(e){let t=e.toLowerCase();return this.logs().filter(e=>e.message.toLowerCase().includes(t))}exportLogs(){return JSON.stringify(this.logs(),null,2)}clearLogs(){this.logs.set([]),this.stats.set({total:0,debug:0,info:0,warn:0,error:0})}clearErrors(){this.logs.update(e=>e.filter(e=>"error"!==e.level)),this.stats.update(e=>({...e,total:e.total-e.error,error:0}))}setMinLevel(e){Object.assign(this,{minLevel:e})}};n=((e,t,a,s)=>{for(var r,i=t,o=e.length-1;o>=0;o--)(r=e[o])&&(i=r(i)||i);return i})([(0,r._qm)({providedIn:"root"})],n);let d=class{constructor(){this.defaultTimeout=3e4,this.loading=(0,i.vPA)(!1),this.error=(0,i.vPA)(null),this.lastCallTime=(0,i.vPA)(null),this.callCount=(0,i.vPA)(0),this.isLoading=this.loading.asReadonly(),this.error$=this.error.asReadonly(),this.lastCallTime$=this.lastCallTime.asReadonly(),this.callCount$=this.callCount.asReadonly(),this.hasError=(0,l.EW)(()=>null!==this.error()),this.isReady=(0,l.EW)(()=>!this.loading()&&null===this.error())}async call(e,t=[],a){return this.loading.set(!0),this.error.set(null),this.callCount.update(e=>e+1),new Promise((s,r)=>{let i=a?.timeoutMs??this.defaultTimeout,o=`${e}_response`,l=e=>{clearTimeout(n),window.removeEventListener(o,l),this.loading.set(!1),this.lastCallTime.set(Date.now()),e.detail.success||this.error.set(e.detail.error??"Unknown error"),s(e.detail)},n=setTimeout(()=>{window.removeEventListener(o,l),this.loading.set(!1),this.error.set(`Request timeout after ${i}ms`),r({success:!1,error:`Request timeout after ${i}ms`})},i);try{let a=window[e];if("function"!=typeof a){clearTimeout(n),window.removeEventListener(o,l),this.loading.set(!1),this.error.set(`Backend function not found: ${e}`),r({success:!1,error:`Backend function not found: ${e}`});return}a(...t)}catch(t){clearTimeout(n),window.removeEventListener(o,l),this.loading.set(!1);let e=t instanceof Error?t.message:String(t);this.error.set(e),r({success:!1,error:e})}})}async callOrThrow(e,t=[]){let a=await this.call(e,t);if(!a.success)throw Error(a.error??"Unknown error");return a.data}clearError(){this.error.set(null)}reset(){this.loading.set(!1),this.error.set(null),this.lastCallTime.set(null),this.callCount.set(0)}};d=((e,t,a,s)=>{for(var r,i=t,o=e.length-1;o>=0;o--)(r=e[o])&&(i=r(i)||i);return i})([(0,r._qm)({providedIn:"root"})],d);let c=class{constructor(){this.databases=[{type:"sqlite",label:"SQLite",icon:"\uD83D\uDDC4️",description:"Lightweight file-based database"},{type:"duckdb",label:"DuckDB",icon:"\uD83E\uDD86",description:"Analytics database with demo data"}],this.currentDb=(0,i.vPA)("duckdb"),this.currentDatabase=(0,l.EW)(()=>this.databases.find(e=>e.type===this.currentDb())),this.availableDatabases=this.databases,this.isSqlite=(0,l.EW)(()=>"sqlite"===this.currentDb()),this.isDuckdb=(0,l.EW)(()=>"duckdb"===this.currentDb())}switchTo(e){this.currentDb.set(e),localStorage.setItem("preferredDatabase",e)}toggle(){let e="sqlite"===this.currentDb()?"duckdb":"sqlite";this.switchTo(e)}loadPreference(){let e=localStorage.getItem("preferredDatabase");e&&("sqlite"===e||"duckdb"===e)&&this.currentDb.set(e)}};c=((e,t,a,s)=>{for(var r,i=t,o=e.length-1;o>=0;o--)(r=e[o])&&(i=r(i)||i);return i})([(0,r._qm)({providedIn:"root"})],c);var p=a(582);class u{static create(e){return JSON.stringify(e)}static createUser(e,t,a){return this.create({name:e,email:t,age:a})}static updateUser(e,t,a,s){return this.create({id:e,name:t,email:a,age:s})}static delete(e){return this.create({id:e})}static createProduct(e,t,a,s,r){return this.create({name:e,description:t,price:a,stock:s,category:r})}static updateProduct(e,t,a,s,r,i){return this.create({id:e,name:t,description:a,price:s,stock:r,category:i})}static createOrder(e,t,a,s="pending"){return this.create({user_id:e,user_name:t,total:a,status:s})}static updateOrder(e,t){return this.create({id:e,status:t})}}function b(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}function g(e){return"string"==typeof e&&e.trim().length>0}function h(e,t,a){return"number"==typeof e&&e>=t&&e<=a}var f=Object.defineProperty,x=Object.getOwnPropertyDescriptor,m=(e,t,a,s)=>{for(var r,i=s>1?void 0:s?x(t,a):t,o=e.length-1;o>=0;o--)(r=e[o])&&(i=(s?r(t,a,i):r(i))||i);return s&&i&&f(t,a,i),i};let v=class{constructor(){this.logger=(0,i.WQX)(n),this.api=(0,i.WQX)(d),this.statsChange=new i.bkB,this.isLoading=(0,i.vPA)(!1),this.users=(0,i.vPA)([]),this.filteredUsers=(0,i.vPA)([]),this.searchQuery="",this.showModal=(0,i.vPA)(!1),this.editingUser=(0,i.vPA)(null),this.formData=(0,i.vPA)({name:"",email:"",age:25,status:"active"})}ngOnInit(){this.loadUsers()}async loadUsers(){this.isLoading.set(!0);try{let e=await this.api.callOrThrow("getUsers");this.users.set(e),this.filterUsers(),this.statsChange.emit({type:"totalUsers",count:e.length})}catch(e){this.logger.error("Failed to load users",e)}finally{this.isLoading.set(!1)}}filterUsers(){let e=this.searchQuery.toLowerCase();this.filteredUsers.set(this.users().filter(t=>t.name.toLowerCase().includes(e)||t.email.toLowerCase().includes(e)))}formatDate(e){return new Date(e).toLocaleDateString()}getInitials(e){return e.split(" ").map(e=>e[0]).join("").toUpperCase().slice(0,2)}showCreateModal(){this.editingUser.set(null),this.formData.set({name:"",email:"",age:25,status:"active"}),this.showModal.set(!0)}editUser(e){this.editingUser.set(e),this.formData.set({...e}),this.showModal.set(!0)}closeModal(){this.showModal.set(!1),this.editingUser.set(null)}updateFormData(e,t){this.formData.update(a=>({...a,[e]:t}))}async saveUser(){this.isLoading.set(!0);try{let e=this.formData();if(!g(e.name)){this.logger.error("Validation failed: Name is required"),this.isLoading.set(!1);return}if(!b(e.email||"")){this.logger.error("Validation failed: Invalid email"),this.isLoading.set(!1);return}if(!h(e.age||0,1,150)){this.logger.error("Validation failed: Age must be between 1 and 150"),this.isLoading.set(!1);return}if(this.editingUser()){let t=u.updateUser(this.editingUser().id,e.name||"",e.email||"",e.age||25);await this.api.callOrThrow("updateUser",[t]),this.logger.info("User updated successfully")}else{let t=u.createUser(e.name||"",e.email||"",e.age||25);await this.api.callOrThrow("createUser",[t]),this.logger.info("User created successfully")}await this.loadUsers(),this.closeModal()}catch(e){this.logger.error("Failed to save user",e)}finally{this.isLoading.set(!1)}}async deleteUser(e){if(confirm(`Delete ${e.name}?`)){this.isLoading.set(!0);try{let t=u.delete(e.id);await this.api.callOrThrow("deleteUser",[t]),this.logger.info("User deleted"),await this.loadUsers()}catch(e){this.logger.error("Failed to delete user",e)}finally{this.isLoading.set(!1)}}}};m([(0,r.k7i)()],v.prototype,"statsChange",2),v=m([(0,r.uAl)({selector:"app-duckdb-users",standalone:!0,imports:[o.MD,p.YN],template:`
    <div class="table-card">
      <!-- Card Header -->
      <div class="card-header">
        <div class="header-left">
          <h2 class="card-title">
            <span class="title-icon">\u{1F465}</span>
            Users Management
          </h2>
          <span class="record-count">{{ users().length }} records</span>
        </div>
        <div class="header-actions">
          <div class="search-box">
            <span class="search-icon">\u{1F50D}</span>
            <input
              type="text"
              class="search-input"
              placeholder="Search users..."
              [(ngModel)]="searchQuery"
              (input)="filterUsers()"
            />
          </div>
          <button class="btn btn-primary" (click)="showCreateModal()">
            <span class="btn-icon">+</span> Add User
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Age</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @if (isLoading()) {
              <tr class="loading-row">
                <td colspan="7">
                  <div class="loading-spinner">
                    <span class="spinner">\u23F3</span>
                    <span>Loading users...</span>
                  </div>
                </td>
              </tr>
            } @else if (filteredUsers().length === 0) {
              <tr class="empty-row">
                <td colspan="7">
                  <div class="empty-state">
                    <span class="empty-icon">\u{1F4ED}</span>
                    <p>No users found</p>
                  </div>
                </td>
              </tr>
            } @else {
              @for (user of filteredUsers(); track user.id) {
                <tr class="data-row">
                  <td class="cell-id">{{ user.id }}</td>
                  <td>
                    <div class="user-cell">
                      <div class="avatar">{{ getInitials(user.name) }}</div>
                      <span class="user-name">{{ user.name }}</span>
                    </div>
                  </td>
                  <td class="cell-email">{{ user.email }}</td>
                  <td class="cell-age">{{ user.age }}</td>
                  <td>
                    <span class="status-badge" [class.status-active]="user.status === 'active'" [class.status-inactive]="user.status === 'inactive'">
                      {{ user.status }}
                    </span>
                  </td>
                  <td class="cell-date">{{ formatDate(user.created_at) }}</td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn-icon-edit" (click)="editUser(user)" title="Edit">\u270F\uFE0F</button>
                      <button class="btn-icon-delete" (click)="deleteUser(user)" title="Delete">\u{1F5D1}\uFE0F</button>
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <!-- Create/Edit Modal -->
      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>{{ editingUser() ? 'Edit User' : 'Create New User' }}</h3>
              <button class="modal-close" (click)="closeModal()">\xd7</button>
            </div>
            <form class="modal-form" (ngSubmit)="saveUser()">
              <div class="form-group">
                <label class="form-label">Name</label>
                <input
                  type="text"
                  class="form-input"
                  [ngModel]="formData().name"
                  (ngModelChange)="updateFormData('name', $event)"
                  name="name"
                  required
                  placeholder="Enter full name"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input
                  type="email"
                  class="form-input"
                  [ngModel]="formData().email"
                  (ngModelChange)="updateFormData('email', $event)"
                  name="email"
                  required
                  placeholder="email@example.com"
                />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Age</label>
                  <input
                    type="number"
                    class="form-input"
                    [ngModel]="formData().age"
                    (ngModelChange)="updateFormData('age', $event)"
                    name="age"
                    required
                    min="1"
                    max="150"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Status</label>
                  <select
                    class="form-input"
                    [ngModel]="formData().status"
                    (ngModelChange)="updateFormData('status', $event)"
                    name="status"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="isLoading()">
                  {{ isLoading() ? 'Saving...' : (editingUser() ? 'Update' : 'Create') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,styles:[`
    .table-card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 16px;
      padding: 24px;
      backdrop-filter: blur(10px);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #fff;
    }

    .title-icon {
      font-size: 24px;
    }

    .record-count {
      font-size: 13px;
      color: #64748b;
      background: rgba(148, 163, 184, 0.1);
      padding: 4px 12px;
      border-radius: 20px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .search-box {
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 14px;
      color: #64748b;
    }

    .search-input {
      padding: 10px 16px 10px 40px;
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 10px;
      color: #fff;
      font-size: 14px;
      width: 280px;
      transition: all 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .btn-icon {
      font-size: 16px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      color: #fff;
      box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .table-container {
      overflow-x: auto;
      border-radius: 12px;
      border: 1px solid rgba(148, 163, 184, 0.1);
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .data-table thead {
      background: rgba(15, 23, 42, 0.5);
    }

    .data-table th {
      padding: 14px 16px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .data-table tbody tr {
      border-bottom: 1px solid rgba(148, 163, 184, 0.05);
      transition: all 0.2s;
    }

    .data-table tbody tr:hover {
      background: rgba(59, 130, 246, 0.05);
    }

    .data-table td {
      padding: 14px 16px;
      color: #e2e8f0;
    }

    .cell-id {
      font-family: monospace;
      color: #64748b;
      font-size: 13px;
    }

    .cell-email {
      color: #94a3b8;
    }

    .cell-age {
      text-align: center;
    }

    .cell-date {
      color: #64748b;
      font-size: 13px;
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 13px;
      flex-shrink: 0;
    }

    .user-name {
      font-weight: 500;
      color: #fff;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      text-transform: capitalize;
    }

    .status-active {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }

    .status-inactive {
      background: rgba(148, 163, 184, 0.2);
      color: #94a3b8;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .btn-icon-edit,
    .btn-icon-delete {
      padding: 6px 10px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .btn-icon-edit {
      background: rgba(59, 130, 246, 0.2);
    }

    .btn-icon-edit:hover {
      background: rgba(59, 130, 246, 0.3);
    }

    .btn-icon-delete {
      background: rgba(239, 68, 68, 0.2);
    }

    .btn-icon-delete:hover {
      background: rgba(239, 68, 68, 0.3);
    }

    .loading-row,
    .empty-row {
      text-align: center;
    }

    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 40px;
      color: #64748b;
    }

    .spinner {
      font-size: 32px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 60px 20px;
      color: #64748b;
    }

    .empty-icon {
      font-size: 48px;
      opacity: 0.5;
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(4px);
      padding: 20px;
    }

    .modal-content {
      background: #1e293b;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 16px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .modal-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #fff;
    }

    .modal-close {
      background: transparent;
      border: none;
      color: #64748b;
      font-size: 28px;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .modal-close:hover {
      background: rgba(148, 163, 184, 0.1);
      color: #fff;
    }

    .modal-form {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-label {
      font-size: 13px;
      font-weight: 500;
      color: #94a3b8;
    }

    .form-input {
      padding: 12px 16px;
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 10px;
      color: #fff;
      font-size: 14px;
      transition: all 0.2s;
    }

    .form-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      padding-top: 8px;
    }
  `]})],v);var y=Object.defineProperty,w=Object.getOwnPropertyDescriptor,k=(e,t,a,s)=>{for(var r,i=s>1?void 0:s?w(t,a):t,o=e.length-1;o>=0;o--)(r=e[o])&&(i=(s?r(t,a,i):r(i))||i);return s&&i&&y(t,a,i),i};let D=class{constructor(){this.logger=(0,i.WQX)(n),this.api=(0,i.WQX)(d),this.statsChange=new i.bkB,this.isLoading=(0,i.vPA)(!1),this.products=(0,i.vPA)([]),this.filteredProducts=(0,i.vPA)([]),this.searchQuery="",this.showModal=(0,i.vPA)(!1),this.editingProduct=(0,i.vPA)(null),this.formData=(0,i.vPA)({name:"",description:"",price:0,stock:0,category:"Other"})}ngOnInit(){this.loadProducts()}async loadProducts(){this.isLoading.set(!0);try{let e=await this.api.callOrThrow("getProducts");this.products.set(e),this.filterProducts(),this.statsChange.emit({type:"totalProducts",count:e.length})}catch(e){this.logger.error("Failed to load products",e)}finally{this.isLoading.set(!1)}}filterProducts(){let e=this.searchQuery.toLowerCase();this.filteredProducts.set(this.products().filter(t=>t.name.toLowerCase().includes(e)||t.description.toLowerCase().includes(e)||t.category.toLowerCase().includes(e)))}formatDate(e){return new Date(e).toLocaleDateString()}showCreateModal(){this.editingProduct.set(null),this.formData.set({name:"",description:"",price:0,stock:0,category:"Other"}),this.showModal.set(!0)}editProduct(e){this.editingProduct.set(e),this.formData.set({...e}),this.showModal.set(!0)}closeModal(){this.showModal.set(!1),this.editingProduct.set(null)}updateFormData(e,t){this.formData.update(a=>({...a,[e]:t}))}async saveProduct(){this.isLoading.set(!0);try{this.editingProduct()?(await this.api.callOrThrow("updateProduct",[this.editingProduct().id,this.formData()]),this.logger.info("Product updated successfully")):(await this.api.callOrThrow("createProduct",[this.formData()]),this.logger.info("Product created successfully")),await this.loadProducts(),this.closeModal()}catch(e){this.logger.error("Failed to save product",e)}finally{this.isLoading.set(!1)}}async deleteProduct(e){if(confirm(`Delete ${e.name}?`)){this.isLoading.set(!0);try{await this.api.callOrThrow("deleteProduct",[e.id]),this.logger.info("Product deleted"),await this.loadProducts()}catch(e){this.logger.error("Failed to delete product",e)}finally{this.isLoading.set(!1)}}}};k([(0,r.k7i)()],D.prototype,"statsChange",2),D=k([(0,r.uAl)({selector:"app-duckdb-products",standalone:!0,imports:[o.MD,p.YN],template:`
    <div class="table-card">
      <!-- Card Header -->
      <div class="card-header">
        <div class="header-left">
          <h2 class="card-title">
            <span class="title-icon">\u{1F4E6}</span>
            Products Management
          </h2>
          <span class="record-count">{{ products().length }} records</span>
        </div>
        <div class="header-actions">
          <div class="search-box">
            <span class="search-icon">\u{1F50D}</span>
            <input
              type="text"
              class="search-input"
              placeholder="Search products..."
              [(ngModel)]="searchQuery"
              (input)="filterProducts()"
            />
          </div>
          <button class="btn btn-primary" (click)="showCreateModal()">
            <span class="btn-icon">+</span> Add Product
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @if (isLoading()) {
              <tr class="loading-row">
                <td colspan="7">
                  <div class="loading-spinner">
                    <span class="spinner">\u23F3</span>
                    <span>Loading products...</span>
                  </div>
                </td>
              </tr>
            } @else if (filteredProducts().length === 0) {
              <tr class="empty-row">
                <td colspan="7">
                  <div class="empty-state">
                    <span class="empty-icon">\u{1F4ED}</span>
                    <p>No products found</p>
                  </div>
                </td>
              </tr>
            } @else {
              @for (product of filteredProducts(); track product.id) {
                <tr class="data-row">
                  <td class="cell-id">{{ product.id }}</td>
                  <td>
                    <div class="product-cell">
                      <div class="product-icon">\u{1F4E6}</div>
                      <div class="product-info">
                        <span class="product-name">{{ product.name }}</span>
                        <span class="product-desc">{{ product.description | slice:0:50 }}{{ product.description.length > 50 ? '...' : '' }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="category-badge">{{ product.category }}</span>
                  </td>
                  <td class="cell-price">\${{ product.price | number:'1.2-2' }}</td>
                  <td>
                    <span class="stock-badge" [class.stock-low]="product.stock < 10" [class.stock-ok]="product.stock >= 10">
                      {{ product.stock }}
                    </span>
                  </td>
                  <td class="cell-date">{{ formatDate(product.created_at) }}</td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn-icon-edit" (click)="editProduct(product)" title="Edit">\u270F\uFE0F</button>
                      <button class="btn-icon-delete" (click)="deleteProduct(product)" title="Delete">\u{1F5D1}\uFE0F</button>
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <!-- Create/Edit Modal -->
      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>{{ editingProduct() ? 'Edit Product' : 'Create New Product' }}</h3>
              <button class="modal-close" (click)="closeModal()">\xd7</button>
            </div>
            <form class="modal-form" (ngSubmit)="saveProduct()">
              <div class="form-group">
                <label class="form-label">Product Name</label>
                <input
                  type="text"
                  class="form-input"
                  [ngModel]="formData().name"
                  (ngModelChange)="updateFormData('name', $event)"
                  name="name"
                  required
                  placeholder="Enter product name"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea
                  class="form-input"
                  [ngModel]="formData().description"
                  (ngModelChange)="updateFormData('description', $event)"
                  name="description"
                  rows="3"
                  placeholder="Product description"
                ></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Price</label>
                  <input
                    type="number"
                    class="form-input"
                    [ngModel]="formData().price"
                    (ngModelChange)="updateFormData('price', $event)"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Stock</label>
                  <input
                    type="number"
                    class="form-input"
                    [ngModel]="formData().stock"
                    (ngModelChange)="updateFormData('stock', $event)"
                    name="stock"
                    required
                    min="0"
                  />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Category</label>
                <select
                  class="form-input"
                  [ngModel]="formData().category"
                  (ngModelChange)="updateFormData('category', $event)"
                  name="category"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Books">Books</option>
                  <option value="Home">Home</option>
                  <option value="Sports">Sports</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="isLoading()">
                  {{ isLoading() ? 'Saving...' : (editingProduct() ? 'Update' : 'Create') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,styles:[`
    .table-card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 16px;
      padding: 24px;
      backdrop-filter: blur(10px);
    }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .header-left { display: flex; align-items: center; gap: 16px; }
    .card-title { display: flex; align-items: center; gap: 12px; margin: 0; font-size: 20px; font-weight: 600; color: #fff; }
    .title-icon { font-size: 24px; }
    .record-count { font-size: 13px; color: #64748b; background: rgba(148, 163, 184, 0.1); padding: 4px 12px; border-radius: 20px; }
    .header-actions { display: flex; align-items: center; gap: 12px; }
    .search-box { position: relative; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 14px; color: #64748b; }
    .search-input { padding: 10px 16px 10px 40px; background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 10px; color: #fff; font-size: 14px; width: 280px; transition: all 0.2s; }
    .search-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; border: none; }
    .btn-icon { font-size: 16px; }
    .btn-primary { background: linear-gradient(135deg, #06b6d4, #3b82f6); color: #fff; box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3); }
    .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4); }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .table-container { overflow-x: auto; border-radius: 12px; border: 1px solid rgba(148, 163, 184, 0.1); }
    .data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .data-table thead { background: rgba(15, 23, 42, 0.5); }
    .data-table th { padding: 14px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid rgba(148, 163, 184, 0.1); }
    .data-table tbody tr { border-bottom: 1px solid rgba(148, 163, 184, 0.05); transition: all 0.2s; }
    .data-table tbody tr:hover { background: rgba(59, 130, 246, 0.05); }
    .data-table td { padding: 14px 16px; color: #e2e8f0; }
    .cell-id { font-family: monospace; color: #64748b; font-size: 13px; }
    .cell-price { font-weight: 600; color: #10b981; }
    .cell-date { color: #64748b; font-size: 13px; }
    .cell-quantity { text-align: center; }
    .product-cell { display: flex; align-items: center; gap: 12px; }
    .product-icon { font-size: 20px; }
    .product-info { display: flex; flex-direction: column; }
    .product-name { font-weight: 500; color: #fff; }
    .product-desc { font-size: 12px; color: #64748b; }
    .category-badge { display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; background: rgba(139, 92, 246, 0.2); color: #a78bfa; }
    .stock-badge { display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; text-align: center; min-width: 40px; }
    .stock-ok { background: rgba(16, 185, 129, 0.2); color: #10b981; }
    .stock-low { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
    .action-buttons { display: flex; gap: 8px; }
    .btn-icon-edit, .btn-icon-delete { padding: 6px 10px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
    .btn-icon-edit { background: rgba(59, 130, 246, 0.2); }
    .btn-icon-edit:hover { background: rgba(59, 130, 246, 0.3); }
    .btn-icon-delete { background: rgba(239, 68, 68, 0.2); }
    .btn-icon-delete:hover { background: rgba(239, 68, 68, 0.3); }
    .loading-row, .empty-row { text-align: center; }
    .loading-spinner { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px; color: #64748b; }
    .spinner { font-size: 32px; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 20px; color: #64748b; }
    .empty-icon { font-size: 48px; opacity: 0.5; }
    .empty-state p { margin: 0; font-size: 14px; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(4px); padding: 20px; }
    .modal-content { background: #1e293b; border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 16px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid rgba(148, 163, 184, 0.1); }
    .modal-header h3 { margin: 0; font-size: 18px; font-weight: 600; color: #fff; }
    .modal-close { background: transparent; border: none; color: #64748b; font-size: 28px; cursor: pointer; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; transition: all 0.2s; }
    .modal-close:hover { background: rgba(148, 163, 184, 0.1); color: #fff; }
    .modal-form { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-label { font-size: 13px; font-weight: 500; color: #94a3b8; }
    .form-input { padding: 12px 16px; background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 10px; color: #fff; font-size: 14px; transition: all 0.2s; }
    .form-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .modal-actions { display: flex; gap: 12px; justify-content: flex-end; padding-top: 8px; }
  `]})],D);var C=Object.defineProperty,q=Object.getOwnPropertyDescriptor,P=(e,t,a,s)=>{for(var r,i=s>1?void 0:s?q(t,a):t,o=e.length-1;o>=0;o--)(r=e[o])&&(i=(s?r(t,a,i):r(i))||i);return s&&i&&C(t,a,i),i};let L=class{constructor(){this.logger=(0,i.WQX)(n),this.api=(0,i.WQX)(d),this.statsChange=new i.bkB,this.isLoading=(0,i.vPA)(!1),this.orders=(0,i.vPA)([]),this.filteredOrders=(0,i.vPA)([]),this.searchQuery="",this.showModal=(0,i.vPA)(!1),this.editingOrder=(0,i.vPA)(null),this.formData=(0,i.vPA)({customer_name:"",customer_email:"",product_name:"",quantity:1,total:0,status:"pending"})}ngOnInit(){this.loadOrders()}async loadOrders(){this.isLoading.set(!0);try{let e=await this.api.callOrThrow("getOrders");this.orders.set(e),this.filterOrders(),this.statsChange.emit({type:"totalOrders",count:e.length})}catch(e){this.logger.error("Failed to load orders",e)}finally{this.isLoading.set(!1)}}filterOrders(){let e=this.searchQuery.toLowerCase();this.filteredOrders.set(this.orders().filter(t=>t.customer_name.toLowerCase().includes(e)||t.customer_email.toLowerCase().includes(e)||t.product_name.toLowerCase().includes(e)||t.status.toLowerCase().includes(e)))}formatDate(e){return new Date(e).toLocaleDateString()}showCreateModal(){this.editingOrder.set(null),this.formData.set({customer_name:"",customer_email:"",product_name:"",quantity:1,total:0,status:"pending"}),this.showModal.set(!0)}editOrder(e){this.editingOrder.set(e),this.formData.set({...e}),this.showModal.set(!0)}closeModal(){this.showModal.set(!1),this.editingOrder.set(null)}updateFormData(e,t){this.formData.update(a=>({...a,[e]:t}))}async saveOrder(){this.isLoading.set(!0);try{this.editingOrder()?(await this.api.callOrThrow("updateOrder",[this.editingOrder().id,this.formData()]),this.logger.info("Order updated successfully")):(await this.api.callOrThrow("createOrder",[this.formData()]),this.logger.info("Order created successfully")),await this.loadOrders(),this.closeModal()}catch(e){this.logger.error("Failed to save order",e)}finally{this.isLoading.set(!1)}}async deleteOrder(e){if(confirm(`Delete order #${e.id}?`)){this.isLoading.set(!0);try{await this.api.callOrThrow("deleteOrder",[e.id]),this.logger.info("Order deleted"),await this.loadOrders()}catch(e){this.logger.error("Failed to delete order",e)}finally{this.isLoading.set(!1)}}}};P([(0,r.k7i)()],L.prototype,"statsChange",2),L=P([(0,r.uAl)({selector:"app-duckdb-orders",standalone:!0,imports:[o.MD,p.YN],template:`
    <div class="table-card">
      <!-- Card Header -->
      <div class="card-header">
        <div class="header-left">
          <h2 class="card-title">
            <span class="title-icon">\u{1F6D2}</span>
            Orders Management
          </h2>
          <span class="record-count">{{ orders().length }} records</span>
        </div>
        <div class="header-actions">
          <div class="search-box">
            <span class="search-icon">\u{1F50D}</span>
            <input
              type="text"
              class="search-input"
              placeholder="Search orders..."
              [(ngModel)]="searchQuery"
              (input)="filterOrders()"
            />
          </div>
          <button class="btn btn-primary" (click)="showCreateModal()">
            <span class="btn-icon">+</span> New Order
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @if (isLoading()) {
              <tr class="loading-row">
                <td colspan="8">
                  <div class="loading-spinner">
                    <span class="spinner">\u23F3</span>
                    <span>Loading orders...</span>
                  </div>
                </td>
              </tr>
            } @else if (filteredOrders().length === 0) {
              <tr class="empty-row">
                <td colspan="8">
                  <div class="empty-state">
                    <span class="empty-icon">\u{1F4ED}</span>
                    <p>No orders found</p>
                  </div>
                </td>
              </tr>
            } @else {
              @for (order of filteredOrders(); track order.id) {
                <tr class="data-row">
                  <td class="cell-id">
                    <span class="order-id">#{{ order.id }}</span>
                  </td>
                  <td>
                    <div class="customer-cell">
                      <span class="customer-name">{{ order.customer_name }}</span>
                      <span class="customer-email">{{ order.customer_email }}</span>
                    </div>
                  </td>
                  <td class="cell-product">{{ order.product_name }}</td>
                  <td class="cell-quantity">{{ order.quantity }}</td>
                  <td class="cell-total">\${{ order.total | number:'1.2-2' }}</td>
                  <td>
                    <span class="status-badge" [class]="'status-' + order.status">
                      {{ order.status }}
                    </span>
                  </td>
                  <td class="cell-date">{{ formatDate(order.created_at) }}</td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn-icon-edit" (click)="editOrder(order)" title="Edit">\u270F\uFE0F</button>
                      <button class="btn-icon-delete" (click)="deleteOrder(order)" title="Delete">\u{1F5D1}\uFE0F</button>
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <!-- Create/Edit Modal -->
      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>{{ editingOrder() ? 'Edit Order' : 'Create New Order' }}</h3>
              <button class="modal-close" (click)="closeModal()">\xd7</button>
            </div>
            <form class="modal-form" (ngSubmit)="saveOrder()">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Customer Name</label>
                  <input
                    type="text"
                    class="form-input"
                    [ngModel]="formData().customer_name"
                    (ngModelChange)="updateFormData('customer_name', $event)"
                    name="customer_name"
                    required
                    placeholder="Enter customer name"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Customer Email</label>
                  <input
                    type="email"
                    class="form-input"
                    [ngModel]="formData().customer_email"
                    (ngModelChange)="updateFormData('customer_email', $event)"
                    name="customer_email"
                    required
                    placeholder="customer@example.com"
                  />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Product Name</label>
                  <input
                    type="text"
                    class="form-input"
                    [ngModel]="formData().product_name"
                    (ngModelChange)="updateFormData('product_name', $event)"
                    name="product_name"
                    required
                    placeholder="Enter product name"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Quantity</label>
                  <input
                    type="number"
                    class="form-input"
                    [ngModel]="formData().quantity"
                    (ngModelChange)="updateFormData('quantity', $event)"
                    name="quantity"
                    required
                    min="1"
                  />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Total Price</label>
                  <input
                    type="number"
                    class="form-input"
                    [ngModel]="formData().total"
                    (ngModelChange)="updateFormData('total', $event)"
                    name="total"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Status</label>
                  <select
                    class="form-input"
                    [ngModel]="formData().status"
                    (ngModelChange)="updateFormData('status', $event)"
                    name="status"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="isLoading()">
                  {{ isLoading() ? 'Saving...' : (editingOrder() ? 'Update' : 'Create') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,styles:[`
    .table-card { background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(148, 163, 184, 0.1); border-radius: 16px; padding: 24px; backdrop-filter: blur(10px); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .header-left { display: flex; align-items: center; gap: 16px; }
    .card-title { display: flex; align-items: center; gap: 12px; margin: 0; font-size: 20px; font-weight: 600; color: #fff; }
    .title-icon { font-size: 24px; }
    .record-count { font-size: 13px; color: #64748b; background: rgba(148, 163, 184, 0.1); padding: 4px 12px; border-radius: 20px; }
    .header-actions { display: flex; align-items: center; gap: 12px; }
    .search-box { position: relative; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 14px; color: #64748b; }
    .search-input { padding: 10px 16px 10px 40px; background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 10px; color: #fff; font-size: 14px; width: 280px; transition: all 0.2s; }
    .search-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; border: none; }
    .btn-icon { font-size: 16px; }
    .btn-primary { background: linear-gradient(135deg, #06b6d4, #3b82f6); color: #fff; box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3); }
    .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4); }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .table-container { overflow-x: auto; border-radius: 12px; border: 1px solid rgba(148, 163, 184, 0.1); }
    .data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .data-table thead { background: rgba(15, 23, 42, 0.5); }
    .data-table th { padding: 14px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid rgba(148, 163, 184, 0.1); }
    .data-table tbody tr { border-bottom: 1px solid rgba(148, 163, 184, 0.05); transition: all 0.2s; }
    .data-table tbody tr:hover { background: rgba(59, 130, 246, 0.05); }
    .data-table td { padding: 14px 16px; color: #e2e8f0; }
    .cell-id { font-family: monospace; color: #64748b; font-size: 13px; }
    .cell-total { font-weight: 600; color: #10b981; }
    .cell-date { color: #64748b; font-size: 13px; }
    .cell-quantity, .cell-product { text-align: center; }
    .customer-cell { display: flex; flex-direction: column; gap: 4px; }
    .customer-name { font-weight: 500; color: #fff; }
    .customer-email { font-size: 12px; color: #64748b; }
    .order-id { font-family: monospace; color: #3b82f6; font-weight: 600; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; text-transform: capitalize; }
    .status-pending { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
    .status-processing { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
    .status-shipped { background: rgba(6, 182, 212, 0.2); color: #06b6d4; }
    .status-delivered { background: rgba(16, 185, 129, 0.2); color: #10b981; }
    .status-cancelled { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    .action-buttons { display: flex; gap: 8px; }
    .btn-icon-edit, .btn-icon-delete { padding: 6px 10px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
    .btn-icon-edit { background: rgba(59, 130, 246, 0.2); }
    .btn-icon-edit:hover { background: rgba(59, 130, 246, 0.3); }
    .btn-icon-delete { background: rgba(239, 68, 68, 0.2); }
    .btn-icon-delete:hover { background: rgba(239, 68, 68, 0.3); }
    .loading-row, .empty-row { text-align: center; }
    .loading-spinner { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px; color: #64748b; }
    .spinner { font-size: 32px; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 20px; color: #64748b; }
    .empty-icon { font-size: 48px; opacity: 0.5; }
    .empty-state p { margin: 0; font-size: 14px; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(4px); padding: 20px; }
    .modal-content { background: #1e293b; border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 16px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid rgba(148, 163, 184, 0.1); }
    .modal-header h3 { margin: 0; font-size: 18px; font-weight: 600; color: #fff; }
    .modal-close { background: transparent; border: none; color: #64748b; font-size: 28px; cursor: pointer; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; transition: all 0.2s; }
    .modal-close:hover { background: rgba(148, 163, 184, 0.1); color: #fff; }
    .modal-form { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-label { font-size: 13px; font-weight: 500; color: #94a3b8; }
    .form-input { padding: 12px 16px; background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 10px; color: #fff; font-size: 14px; transition: all 0.2s; }
    .form-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .modal-actions { display: flex; gap: 12px; justify-content: flex-end; padding-top: 8px; }
  `]})],L);let U=class{constructor(){this.logger=(0,i.WQX)(n),this.api=(0,i.WQX)(d),this.queryFields=(0,i.vPA)("*"),this.queryWhere=(0,i.vPA)(""),this.queryOrder=(0,i.vPA)(""),this.queryLimit=(0,i.vPA)(10),this.selectedTable=(0,i.vPA)("users"),this.isExecuting=(0,i.vPA)(!1),this.queryResult=(0,i.vPA)(null),this.queryTime=(0,i.vPA)(0),this.successfulQueries=(0,i.vPA)(0),this.queryTimes=(0,i.vPA)([]),this.generatedSql=(0,i.vPA)(""),this.resultData=(0,i.vPA)([]),this.resultColumns=(0,i.vPA)([]),this.resultCount=(0,i.vPA)(0)}ngOnInit(){this.updateGeneratedSql()}updateGeneratedSql(){let e=`SELECT ${this.queryFields()||"*"}`;e+=` FROM ${this.selectedTable()}`,this.queryWhere()&&(e+=` WHERE ${this.queryWhere()}`),this.queryOrder()&&(e+=` ORDER BY ${this.queryOrder()}`),this.queryLimit()&&(e+=` LIMIT ${this.queryLimit()}`),this.generatedSql.set(e)}resetQuery(){this.queryFields.set("*"),this.queryWhere.set(""),this.queryOrder.set(""),this.queryLimit.set(10),this.selectedTable.set("users"),this.queryResult.set(null),this.updateGeneratedSql()}async executeQuery(){this.isExecuting.set(!0);let e=Date.now();try{this.updateGeneratedSql();let t=this.generatedSql();this.logger.info("Executing query:",t);let a=await this.api.callOrThrow("executeQuery",[t]),s=Date.now()-e;this.queryTime.set(s),this.successfulQueries.update(e=>e+1),this.queryTimes.update(e=>[...e,s]),a&&a.length>0?(this.resultData.set(a),this.resultColumns.set(Object.keys(a[0])),this.resultCount.set(a.length),this.queryResult.set(a)):(this.resultData.set([]),this.resultColumns.set([]),this.resultCount.set(0),this.queryResult.set([])),this.logger.info(`Query executed in ${s}ms, ${a.length} rows returned`)}catch(e){this.logger.error("Query execution failed",e),this.queryResult.set(null)}finally{this.isExecuting.set(!1)}}get avgQueryTime(){let e=this.queryTimes();return 0===e.length?0:e.reduce((e,t)=>e+t,0)/e.length}copySql(){navigator.clipboard.writeText(this.generatedSql()),this.logger.info("SQL copied to clipboard")}};U=((e,t,a,s)=>{for(var r,i=t,o=e.length-1;o>=0;o--)(r=e[o])&&(i=r(i)||i);return i})([(0,r.uAl)({selector:"app-duckdb-analytics",standalone:!0,imports:[o.MD,p.YN],template:`
    <div class="analytics-container">
      <!-- Query Builder Card -->
      <div class="table-card">
        <div class="card-header">
          <h2 class="card-title">
            <span class="title-icon">\u{1F4CA}</span>
            SQL Query Builder
          </h2>
        </div>

        <div class="query-builder">
          <div class="query-row">
            <label class="query-label">SELECT</label>
            <input
              type="text"
              class="query-input"
              [(ngModel)]="queryFields"
              placeholder="* or column names (e.g., id, name, email)"
            />
          </div>
          <div class="query-row">
            <label class="query-label">FROM</label>
            <select class="query-input" [(ngModel)]="selectedTable">
              <option value="users">users</option>
              <option value="products">products</option>
              <option value="orders">orders</option>
            </select>
          </div>
          <div class="query-row">
            <label class="query-label">WHERE</label>
            <input
              type="text"
              class="query-input"
              [(ngModel)]="queryWhere"
              placeholder="Optional: age > 25, status = 'active', etc."
            />
          </div>
          <div class="query-row">
            <label class="query-label">ORDER BY</label>
            <input
              type="text"
              class="query-input"
              [(ngModel)]="queryOrder"
              placeholder="Optional: created_at DESC, name ASC"
            />
          </div>
          <div class="query-row">
            <label class="query-label">LIMIT</label>
            <input
              type="number"
              class="query-input"
              [(ngModel)]="queryLimit"
              min="1"
              max="1000"
              placeholder="10"
            />
          </div>
          <div class="query-actions">
            <button class="btn btn-secondary" (click)="resetQuery()">
              <span class="btn-icon">\u21BA</span> Reset
            </button>
            <button class="btn btn-primary" (click)="executeQuery()" [disabled]="isExecuting()">
              <span class="btn-icon">{{ isExecuting() ? '\u23F3' : '\u25B6' }}</span>
              {{ isExecuting() ? 'Executing...' : 'Execute Query' }}
            </button>
          </div>
        </div>

        <!-- Generated SQL Preview -->
        <div class="sql-preview">
          <div class="preview-header">
            <span class="preview-title">Generated SQL:</span>
            <button class="btn-copy" (click)="copySql()" title="Copy SQL">\u{1F4CB}</button>
          </div>
          <pre class="sql-code">{{ generatedSql() }}</pre>
        </div>
      </div>

      <!-- Query Results Card -->
      @if (queryResult()) {
        <div class="table-card">
          <div class="card-header">
            <h2 class="card-title">
              <span class="title-icon">\u{1F4CB}</span>
              Query Results
            </h2>
            <span class="result-count">{{ resultCount() }} rows</span>
          </div>

          <div class="table-container">
            @if (resultData().length > 0) {
              <table class="data-table">
                <thead>
                  <tr>
                    @for (col of resultColumns(); track col) {
                      <th>{{ col }}</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (row of resultData(); track row; let i = $index) {
                    <tr class="data-row">
                      @for (col of resultColumns(); track col) {
                        <td>{{ row[col] }}</td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            } @else {
              <div class="empty-state">
                <span class="empty-icon">\u{1F4ED}</span>
                <p>No results returned</p>
              </div>
            }
          </div>
        </div>
      }

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card stat-info">
          <div class="stat-icon">\u{1F4C8}</div>
          <div class="stat-content">
            <span class="stat-value">{{ queryTime() }}ms</span>
            <span class="stat-label">Query Time</span>
          </div>
        </div>
        <div class="stat-card stat-success">
          <div class="stat-icon">\u2713</div>
          <div class="stat-content">
            <span class="stat-value">{{ successfulQueries() }}</span>
            <span class="stat-label">Successful Queries</span>
          </div>
        </div>
        <div class="stat-card stat-warning">
          <div class="stat-icon">\u23F1</div>
          <div class="stat-content">
            <span class="stat-value">{{ avgQueryTime | number:'1.0-2' }}ms</span>
            <span class="stat-label">Avg Query Time</span>
          </div>
        </div>
      </div>
    </div>
  `,styles:[`
    .analytics-container { display: flex; flex-direction: column; gap: 24px; }
    .table-card { background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(148, 163, 184, 0.1); border-radius: 16px; padding: 24px; backdrop-filter: blur(10px); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .card-title { display: flex; align-items: center; gap: 12px; margin: 0; font-size: 20px; font-weight: 600; color: #fff; }
    .title-icon { font-size: 24px; }
    .result-count { font-size: 13px; color: #64748b; background: rgba(148, 163, 184, 0.1); padding: 4px 12px; border-radius: 20px; }
    .query-builder { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; padding: 20px; background: rgba(15, 23, 42, 0.3); border-radius: 12px; border: 1px solid rgba(148, 163, 184, 0.1); }
    .query-row { display: flex; flex-direction: column; gap: 8px; }
    .query-label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .query-input { padding: 12px 16px; background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 10px; color: #fff; font-size: 14px; font-family: monospace; transition: all 0.2s; }
    .query-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    .query-actions { grid-column: 1 / -1; display: flex; gap: 12px; justify-content: center; padding-top: 8px; }
    .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; border: none; }
    .btn-icon { font-size: 16px; }
    .btn-primary { background: linear-gradient(135deg, #06b6d4, #3b82f6); color: #fff; box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3); }
    .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4); }
    .btn-secondary { background: rgba(148, 163, 184, 0.1); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.2); }
    .btn-secondary:hover { background: rgba(148, 163, 184, 0.2); color: #fff; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .sql-preview { margin-top: 20px; background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(148, 163, 184, 0.1); border-radius: 12px; overflow: hidden; }
    .preview-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: rgba(15, 23, 42, 0.5); border-bottom: 1px solid rgba(148, 163, 184, 0.1); }
    .preview-title { font-size: 13px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
    .btn-copy { background: transparent; border: none; color: #64748b; cursor: pointer; font-size: 16px; padding: 4px 8px; border-radius: 6px; transition: all 0.2s; }
    .btn-copy:hover { background: rgba(148, 163, 184, 0.1); color: #fff; }
    .sql-code { margin: 0; padding: 16px; font-family: monospace; font-size: 13px; line-height: 1.6; color: #10b981; background: transparent; overflow-x: auto; white-space: pre-wrap; word-break: break-all; }
    .table-container { overflow-x: auto; border-radius: 12px; border: 1px solid rgba(148, 163, 184, 0.1); }
    .data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .data-table thead { background: rgba(15, 23, 42, 0.5); }
    .data-table th { padding: 14px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid rgba(148, 163, 184, 0.1); }
    .data-table tbody tr { border-bottom: 1px solid rgba(148, 163, 184, 0.05); transition: all 0.2s; }
    .data-table tbody tr:hover { background: rgba(59, 130, 246, 0.05); }
    .data-table td { padding: 14px 16px; color: #e2e8f0; }
    .empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 20px; color: #64748b; }
    .empty-icon { font-size: 48px; opacity: 0.5; }
    .empty-state p { margin: 0; font-size: 14px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
    .stat-card { display: flex; align-items: center; gap: 16px; padding: 20px; background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(148, 163, 184, 0.1); border-radius: 12px; transition: all 0.3s; }
    .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3); }
    .stat-icon { font-size: 40px; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.05); border-radius: 12px; }
    .stat-content { display: flex; flex-direction: column; }
    .stat-value { font-size: 28px; font-weight: 700; color: #fff; }
    .stat-label { font-size: 13px; color: #64748b; margin-top: 4px; }
    .stat-info .stat-icon { background: rgba(6, 182, 212, 0.2); }
    .stat-success .stat-icon { background: rgba(16, 185, 129, 0.2); }
    .stat-warning .stat-icon { background: rgba(245, 158, 11, 0.2); }
  `]})],U);let z=class{constructor(){this.logger=(0,i.WQX)(n),this.api=(0,i.WQX)(d),this.activeTab=(0,i.vPA)("list"),this.isLoading=(0,i.vPA)(!1),this.stats=(0,i.vPA)({total_users:0,today_count:0,unique_domains:0}),this.users=(0,i.vPA)([]),this.filteredUsers=(0,i.vPA)([]),this.searchQuery="",this.newUser=(0,i.vPA)({name:"",email:"",age:25})}get newUserForm(){return this.newUser()}updateNewUser(e,t){this.newUser.update(a=>({...a,[e]:t}))}setActiveTab(e){this.activeTab.set(e),"list"===e&&this.loadUsers()}filterUsers(){let e=this.searchQuery.toLowerCase();this.filteredUsers.set(this.users().filter(t=>t.name.toLowerCase().includes(e)||t.email.toLowerCase().includes(e)))}formatDate(e){return new Date(e).toLocaleDateString()}async loadUsers(){this.isLoading.set(!0);try{let[e,t]=await Promise.all([this.api.callOrThrow("getUsers"),this.api.callOrThrow("getUserStats")]);this.users.set(e),this.stats.set(t),this.filterUsers()}catch(e){this.logger.error("Failed to load users",e)}finally{this.isLoading.set(!1)}}async createUser(){let e=this.newUser();if(!g(e.name))return void this.logger.warn("Validation failed: Name is required");if(!b(e.email))return void this.logger.warn("Validation failed: Invalid email");if(!h(e.age,1,150))return void this.logger.warn("Validation failed: Age must be between 1 and 150");this.isLoading.set(!0);try{let t=u.createUser(e.name||"",e.email||"",e.age||25);await this.api.callOrThrow("createUser",[t]),this.logger.info("User created successfully"),this.newUser.set({name:"",email:"",age:25}),this.setActiveTab("list")}catch(e){this.logger.error("Failed to create user",e)}finally{this.isLoading.set(!1)}}async editUser(e){this.newUser.set({...e}),this.setActiveTab("create")}async deleteUser(e){if(confirm(`Delete ${e.name}?`)){this.isLoading.set(!0);try{let t=u.delete(e.id);await this.api.callOrThrow("deleteUser",[t]),this.logger.info("User deleted"),await this.loadUsers()}catch(e){this.logger.error("Failed to delete user",e)}finally{this.isLoading.set(!1)}}}ngOnInit(){this.loadUsers()}};z=((e,t,a,s)=>{for(var r,i=t,o=e.length-1;o>=0;o--)(r=e[o])&&(i=r(i)||i);return i})([(0,r.uAl)({selector:"app-sqlite-crud",standalone:!0,imports:[o.MD,p.YN],template:`
    <div class="sqlite-wrapper">
      <div class="sqlite-container">
        <div class="sqlite-header">
          <div class="sqlite-logo">
            <span class="logo-icon">\u{1F5C4}\uFE0F</span>
          </div>
          <h1 class="sqlite-title">SQLite CRUD Demo</h1>
          <p class="sqlite-subtitle">Complete CRUD operations with Vlang backend</p>
        </div>

        <div class="stats-bar">
          <div class="stat-item">
            <span class="stat-value">{{ stats().total_users }}</span>
            <span class="stat-label">Total Users</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats().today_count }}</span>
            <span class="stat-label">Added Today</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats().unique_domains }}</span>
            <span class="stat-label">Email Domains</span>
          </div>
        </div>

        <div class="sqlite-tabs">
          <button type="button" class="sqlite-tab" [class.active]="activeTab() === 'list'" (click)="setActiveTab('list')">
            <span class="tab-label">\u{1F4CB} User List</span>
          </button>
          <button type="button" class="sqlite-tab" [class.active]="activeTab() === 'create'" (click)="setActiveTab('create')">
            <span class="tab-label">\u2795 Add User</span>
          </button>
        </div>

        @if (activeTab() === 'list') {
          <div class="tab-content">
            <div class="toolbar">
              <input type="text" class="search-input" placeholder="Search users..." [(ngModel)]="searchQuery"
                (input)="filterUsers()" />
              <button class="refresh-button" (click)="loadUsers()">\u{1F504} Refresh</button>
            </div>

            @if (isLoading()) {
              <div class="loading">Loading users...</div>
            } @else if (filteredUsers().length === 0) {
              <div class="empty-state">No users found</div>
            } @else {
              <div class="user-table">
                <div class="table-header">
                  <div class="col">Name</div>
                  <div class="col">Email</div>
                  <div class="col">Age</div>
                  <div class="col">Created</div>
                  <div class="col">Actions</div>
                </div>
                @for (user of filteredUsers(); track user.id) {
                  <div class="table-row">
                    <div class="col">{{ user.name }}</div>
                    <div class="col">{{ user.email }}</div>
                    <div class="col">{{ user.age }}</div>
                    <div class="col">{{ formatDate(user.created_at) }}</div>
                    <div class="col actions">
                      <button class="action-btn edit" (click)="editUser(user)">\u270F\uFE0F</button>
                      <button class="action-btn delete" (click)="deleteUser(user)">\u{1F5D1}\uFE0F</button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }

        @if (activeTab() === 'create') {
          <div class="tab-content">
            <form class="user-form" (ngSubmit)="createUser()">
              <div class="form-group">
                <label class="form-label">Name</label>
                <input type="text" class="form-input" [ngModel]="newUserForm.name" (ngModelChange)="updateNewUser('name', $event)" name="name" required />
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" [ngModel]="newUserForm.email" (ngModelChange)="updateNewUser('email', $event)" name="email" required />
              </div>
              <div class="form-group">
                <label class="form-label">Age</label>
                <input type="number" class="form-input" [ngModel]="newUserForm.age" (ngModelChange)="updateNewUser('age', $event)" name="age" required min="1" max="150" />
              </div>
              <button type="submit" class="submit-button" [disabled]="isLoading()">
                {{ isLoading() ? 'Creating...' : 'Create User' }}
              </button>
            </form>
          </div>
        }
      </div>
    </div>
  `,styles:[`
    .sqlite-wrapper { display: flex; justify-content: center; align-items: center; min-height: 100%; padding: 20px; }
    .sqlite-container { background: rgba(255,255,255,0.95); border-radius: 16px; padding: 40px; width: 100%; max-width: 800px; box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
    .sqlite-header { text-align: center; margin-bottom: 25px; }
    .sqlite-logo { display: inline-flex; width: 70px; height: 70px; border-radius: 50%; background: linear-gradient(135deg, #00b09b, #96c93d); justify-content: center; align-items: center; margin-bottom: 15px; }
    .logo-icon { font-size: 32px; }
    .sqlite-title { font-size: 28px; margin: 0 0 8px; color: #1a1a1a; }
    .sqlite-subtitle { font-size: 14px; color: #666; margin: 0; }
    .stats-bar { display: flex; gap: 20px; justify-content: space-around; margin-bottom: 25px; padding: 20px; background: #f8f9fa; border-radius: 12px; }
    .stat-item { text-align: center; }
    .stat-value { display: block; font-size: 24px; font-weight: bold; color: #00b09b; }
    .stat-label { display: block; font-size: 12px; color: #666; margin-top: 4px; }
    .sqlite-tabs { display: flex; gap: 10px; margin-bottom: 20px; }
    .sqlite-tab { flex: 1; padding: 12px; border: 2px solid #e0e0e0; border-radius: 10px; background: white; cursor: pointer; transition: all 0.2s; }
    .sqlite-tab.active { border-color: #00b09b; background: linear-gradient(135deg, #00b09b15, #96c93d15); }
    .tab-label { font-size: 14px; font-weight: 600; color: #333; }
    .toolbar { display: flex; gap: 10px; margin-bottom: 15px; }
    .search-input { flex: 1; padding: 10px 15px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; }
    .refresh-button { padding: 10px 20px; background: #f0f0f0; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .loading, .empty-state { text-align: center; padding: 40px; color: #666; }
    .user-table { display: flex; flex-direction: column; gap: 8px; }
    .table-header, .table-row { display: grid; grid-template-columns: 2fr 2fr 1fr 1.5fr 1fr; gap: 10px; padding: 12px; }
    .table-header { background: #f8f9fa; border-radius: 8px; font-weight: 600; font-size: 13px; }
    .table-row { background: white; border: 1px solid #e0e0e0; border-radius: 8px; align-items: center; }
    .col { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .actions { display: flex; gap: 8px; }
    .action-btn { padding: 6px 10px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
    .action-btn.edit { background: #e3f2fd; }
    .action-btn.delete { background: #ffebee; }
    .user-form { display: flex; flex-direction: column; gap: 20px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-label { font-weight: 600; color: #333; font-size: 14px; }
    .form-input { padding: 12px 15px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; }
    .form-input:focus { outline: none; border-color: #00b09b; }
    .submit-button { padding: 14px; background: linear-gradient(135deg, #00b09b, #96c93d); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; }
    .submit-button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,176,155,0.4); }
    .submit-button:disabled { opacity: 0.6; cursor: not-allowed; }
  `]})],z);let O=class{constructor(){this.logger=(0,i.WQX)(n),this.api=(0,i.WQX)(d),this.dbSwitcher=(0,i.WQX)(c),this.sidebarCollapsed=(0,i.vPA)(!1),this.activeView=(0,i.vPA)("users"),this.isLoading=(0,i.vPA)(!1),this.stats=(0,i.vPA)({totalUsers:0,totalProducts:0,totalOrders:0,totalRevenue:0,activeUsers:0,pendingOrders:0}),this.navItems=(0,i.vPA)([{id:"users",label:"Users",icon:"\uD83D\uDC65",active:!0},{id:"products",label:"Products",icon:"\uD83D\uDCE6",active:!1},{id:"orders",label:"Orders",icon:"\uD83D\uDED2",active:!1},{id:"analytics",label:"Analytics",icon:"\uD83D\uDCCA",active:!1}]),this.currentPageTitle=(0,i.vPA)("Users")}ngOnInit(){this.dbSwitcher.loadPreference(),this.updateNavForDatabase(),this.loadDashboardStats()}get currentDb(){return this.dbSwitcher.currentDatabase}get isDuckdb(){return this.dbSwitcher.isDuckdb}get isSqlite(){return this.dbSwitcher.isSqlite}switchDatabase(e){this.dbSwitcher.switchTo(e),this.updateNavForDatabase(),this.loadDashboardStats()}updateNavForDatabase(){this.isSqlite()?(this.activeView.set("sqlite"),this.currentPageTitle.set("SQLite CRUD"),this.navItems.set([{id:"sqlite",label:"Users",icon:"\uD83D\uDC65",active:!0}])):(this.activeView.set("users"),this.currentPageTitle.set("Users"),this.navItems.set([{id:"users",label:"Users",icon:"\uD83D\uDC65",active:!0},{id:"products",label:"Products",icon:"\uD83D\uDCE6",active:!1},{id:"orders",label:"Orders",icon:"\uD83D\uDED2",active:!1},{id:"analytics",label:"Analytics",icon:"\uD83D\uDCCA",active:!1}]))}setActiveView(e){this.activeView.set(e),this.currentPageTitle.set({users:"Users",products:"Products",orders:"Orders",analytics:"Analytics",sqlite:"SQLite CRUD"}[e]||e),this.loadDashboardStats()}onNavClick(e){this.setActiveView(e)}toggleSidebar(){this.sidebarCollapsed.update(e=>!e)}async loadDashboardStats(){this.isLoading.set(!0);try{let[e,t,a]=await Promise.all([this.api.callOrThrow("getUsers").catch(()=>[]),this.api.callOrThrow("getProducts").catch(()=>[]),this.api.callOrThrow("getOrders").catch(()=>[])]);this.stats.set({totalUsers:e.length,totalProducts:t.length,totalOrders:a.length,totalRevenue:a.reduce((e,t)=>e+(t.total||0),0),activeUsers:e.filter(e=>!1!==e.active).length,pendingOrders:a.filter(e=>"pending"===e.status).length})}catch(e){this.logger.error("Failed to load dashboard stats",e)}finally{this.isLoading.set(!1)}}onStatsUpdate(e){this.stats.update(t=>({...t,[e.type]:e.count}))}refreshAll(){this.loadDashboardStats()}};O=((e,t,a,s)=>{for(var r,i=t,o=e.length-1;o>=0;o--)(r=e[o])&&(i=r(i)||i);return i})([(0,r.uAl)({selector:"app-dashboard",standalone:!0,imports:[o.MD,v,D,L,U,z],template:`
    <div class="dashboard-container">
      <!-- Sidebar Navigation -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed()">
        <div class="sidebar-header">
          <div class="logo">
            <span class="logo-icon">{{ currentDb().icon }}</span>
            @if (!sidebarCollapsed()) {
              <div class="logo-text-wrapper">
                <span class="logo-text">{{ currentDb().label }}</span>
                <span class="logo-subtext">Admin Panel</span>
              </div>
            }
          </div>
        </div>

        <!-- Database Switcher -->
        <div class="db-switcher" [class.collapsed]="sidebarCollapsed()">
          <button
            class="db-btn"
            [class.active]="isDuckdb()"
            (click)="switchDatabase('duckdb')"
            [attr.title]="sidebarCollapsed() ? 'DuckDB' : ''"
          >
            <span class="db-icon">\u{1F986}</span>
            @if (!sidebarCollapsed()) {
              <span class="db-label">DuckDB</span>
            }
          </button>
          <button
            class="db-btn"
            [class.active]="isSqlite()"
            (click)="switchDatabase('sqlite')"
            [attr.title]="sidebarCollapsed() ? 'SQLite' : ''"
          >
            <span class="db-icon">\u{1F5C4}\uFE0F</span>
            @if (!sidebarCollapsed()) {
              <span class="db-label">SQLite</span>
            }
          </button>
        </div>

        <nav class="sidebar-nav">
          @for (item of navItems(); track item.id) {
            <button
              class="nav-item"
              [class.active]="activeView() === item.id"
              (click)="onNavClick(item.id)"
              [attr.title]="sidebarCollapsed() ? item.label : ''"
            >
              <span class="nav-icon">{{ item.icon }}</span>
              @if (!sidebarCollapsed()) {
                <span class="nav-label">{{ item.label }}</span>
              }
            </button>
          }
        </nav>

        <div class="sidebar-footer">
          <button class="nav-item" (click)="toggleSidebar()" title="Toggle sidebar">
            <span class="nav-icon">{{ sidebarCollapsed() ? '\u2192' : '\u2190' }}</span>
            @if (!sidebarCollapsed()) {
              <span class="nav-label">Collapse</span>
            }
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Top Header -->
        <header class="top-header">
          <div class="header-left">
            <button class="menu-toggle" (click)="toggleSidebar()" title="Toggle menu">
              <span>\u2630</span>
            </button>
            <div class="title-group">
              <h1 class="page-title">{{ currentPageTitle() }}</h1>
              <span class="db-badge" [class.duckdb]="isDuckdb()" [class.sqlite]="isSqlite()">
                {{ currentDb().icon }} {{ currentDb().label }} Mode
              </span>
            </div>
          </div>
          <div class="header-right">
            <div class="header-stats">
              <div class="mini-stat">
                <span class="mini-stat-label">Total Records</span>
                <span class="mini-stat-value">{{ stats().totalUsers + stats().totalProducts + stats().totalOrders }}</span>
              </div>
            </div>
            <button class="btn-refresh" (click)="refreshAll()" title="Refresh all data">
              <span class="refresh-icon" [class.spinning]="isLoading()">\u{1F504}</span>
            </button>
          </div>
        </header>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card stat-primary">
            <div class="stat-icon">\u{1F465}</div>
            <div class="stat-content">
              <span class="stat-value">{{ stats().totalUsers | number }}</span>
              <span class="stat-label">Total Users</span>
            </div>
          </div>
          <div class="stat-card stat-success">
            <div class="stat-icon">\u{1F4E6}</div>
            <div class="stat-content">
              <span class="stat-value">{{ stats().totalProducts | number }}</span>
              <span class="stat-label">Products</span>
            </div>
          </div>
          <div class="stat-card stat-warning">
            <div class="stat-icon">\u{1F6D2}</div>
            <div class="stat-content">
              <span class="stat-value">{{ stats().totalOrders | number }}</span>
              <span class="stat-label">Orders</span>
            </div>
          </div>
          <div class="stat-card stat-info">
            <div class="stat-icon">\u{1F4B0}</div>
            <div class="stat-content">
              <span class="stat-value">{{ stats().totalRevenue | number:'1.2-2' }}</span>
              <span class="stat-label">Revenue</span>
            </div>
          </div>
        </div>

        <!-- Content Area -->
        <div class="content-area">
          <!-- SQLite View -->
          @if (activeView() === 'sqlite') {
            <app-sqlite-crud></app-sqlite-crud>
          }
          
          <!-- DuckDB Views -->
          @if (activeView() === 'users') {
            <app-duckdb-users (statsChange)="onStatsUpdate($any($event))"></app-duckdb-users>
          } @else if (activeView() === 'products') {
            <app-duckdb-products (statsChange)="onStatsUpdate($any($event))"></app-duckdb-products>
          } @else if (activeView() === 'orders') {
            <app-duckdb-orders (statsChange)="onStatsUpdate($any($event))"></app-duckdb-orders>
          } @else if (activeView() === 'analytics') {
            <app-duckdb-analytics></app-duckdb-analytics>
          }
        </div>
      </main>
    </div>
  `,styles:[`
    .dashboard-container {
      display: flex;
      height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      overflow: hidden;
    }
    .sidebar {
      width: 260px;
      background: rgba(15, 23, 42, 0.95);
      border-right: 1px solid rgba(148, 163, 184, 0.1);
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
      backdrop-filter: blur(10px);
    }
    .sidebar.collapsed { width: 70px; }
    .sidebar-header { padding: 20px; border-bottom: 1px solid rgba(148, 163, 184, 0.1); }
    .logo { display: flex; align-items: center; gap: 12px; }
    .logo-icon { font-size: 32px; }
    .logo-text-wrapper { display: flex; flex-direction: column; }
    .logo-text {
      font-size: 18px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .logo-subtext { font-size: 11px; color: #64748b; }
    .db-switcher {
      display: flex; padding: 12px; gap: 8px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }
    .db-switcher.collapsed { justify-content: center; }
    .db-btn {
      flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px;
      padding: 12px 8px; background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1); border-radius: 10px;
      color: #94a3b8; cursor: pointer; transition: all 0.2s;
    }
    .db-btn:hover {
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.3);
    }
    .db-btn.active {
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      border-color: transparent; color: #fff;
      box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4);
    }
    .db-icon { font-size: 20px; }
    .db-label { font-size: 11px; font-weight: 600; }
    .sidebar-nav {
      flex: 1; padding: 16px 12px; display: flex;
      flex-direction: column; gap: 8px; overflow-y: auto;
    }
    .nav-item {
      display: flex; align-items: center; gap: 12px; padding: 12px 16px;
      background: transparent; border: none; border-radius: 10px;
      color: #94a3b8; cursor: pointer; transition: all 0.2s;
      text-align: left; width: 100%;
    }
    .nav-item:hover { background: rgba(59, 130, 246, 0.1); color: #fff; }
    .nav-item.active {
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      color: #fff; box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4);
    }
    .nav-icon { font-size: 20px; width: 24px; text-align: center; }
    .nav-label { font-size: 14px; font-weight: 500; white-space: nowrap; }
    .sidebar-footer { padding: 16px; border-top: 1px solid rgba(148, 163, 184, 0.1); }
    .main-content {
      flex: 1; display: flex; flex-direction: column;
      overflow: hidden; background: #0f172a;
    }
    .top-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 32px; border-bottom: 1px solid rgba(148, 163, 184, 0.1);
      background: rgba(15, 23, 42, 0.5);
    }
    .header-left { display: flex; align-items: center; gap: 20px; }
    .menu-toggle {
      display: none; padding: 8px 12px; background: rgba(148, 163, 184, 0.1);
      border: none; border-radius: 8px; color: #fff; cursor: pointer; font-size: 20px;
    }
    .title-group { display: flex; align-items: center; gap: 16px; }
    .page-title { margin: 0; font-size: 24px; font-weight: 600; color: #fff; }
    .db-badge {
      display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px;
      border-radius: 20px; font-size: 12px; font-weight: 600;
      background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(148, 163, 184, 0.2);
    }
    .db-badge.duckdb {
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2));
      border-color: rgba(6, 182, 212, 0.4); color: #22d3ee;
    }
    .db-badge.sqlite {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(34, 197, 94, 0.2));
      border-color: rgba(16, 185, 129, 0.4); color: #10b981;
    }
    .header-right { display: flex; align-items: center; gap: 20px; }
    .header-stats { display: flex; gap: 16px; }
    .mini-stat { display: flex; flex-direction: column; align-items: flex-end; }
    .mini-stat-label { font-size: 12px; color: #64748b; }
    .mini-stat-value { font-size: 18px; font-weight: 600; color: #06b6d4; }
    .btn-refresh {
      padding: 10px 16px; background: rgba(59, 130, 246, 0.2);
      border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px;
      color: #60a5fa; cursor: pointer; transition: all 0.2s;
    }
    .btn-refresh:hover { background: rgba(59, 130, 246, 0.3); }
    .refresh-icon.spinning { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .stats-grid {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 20px; padding: 24px 32px;
    }
    .stat-card {
      display: flex; align-items: center; gap: 16px; padding: 20px;
      background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px; transition: all 0.3s;
    }
    .stat-card:hover {
      transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    }
    .stat-icon {
      font-size: 40px; width: 60px; height: 60px; display: flex;
      align-items: center; justify-content: center;
      background: rgba(255, 255, 255, 0.05); border-radius: 12px;
    }
    .stat-content { display: flex; flex-direction: column; }
    .stat-value { font-size: 28px; font-weight: 700; color: #fff; }
    .stat-label { font-size: 13px; color: #64748b; margin-top: 4px; }
    .stat-primary .stat-icon { background: rgba(59, 130, 246, 0.2); }
    .stat-success .stat-icon { background: rgba(16, 185, 129, 0.2); }
    .stat-warning .stat-icon { background: rgba(245, 158, 11, 0.2); }
    .stat-info .stat-icon { background: rgba(6, 182, 212, 0.2); }
    .content-area { flex: 1; overflow-y: auto; padding: 0 32px 32px; }
    @media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 768px) {
      .sidebar {
        position: fixed; left: 0; top: 0; height: 100vh;
        z-index: 1000; transform: translateX(-100%);
      }
      .sidebar:not(.collapsed) { transform: translateX(0); }
      .menu-toggle { display: block; }
      .stats-grid { grid-template-columns: 1fr; padding: 16px 20px; }
      .top-header { padding: 16px 20px; }
      .content-area { padding: 0 20px 20px; }
    }
  `]})],O);let F=class{ngOnInit(){console.log("DuckDB Dashboard Application Initialized")}};F=((e,t,a,s)=>{for(var r,i=t,o=e.length-1;o>=0;o--)(r=e[o])&&(i=r(i)||i);return i})([(0,r.uAl)({selector:"app-root",standalone:!0,imports:[O],template:`
    <app-dashboard />
  `,styles:[`
    :host {
      display: block;
      height: 100vh;
      width: 100%;
      overflow: hidden;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    }
  `]})],F);let M=console,S=window,A=new class{constructor(){this.subscribers=new Map}init(e,t){}publish(e,t){for(let a of this.subscribers.get(e)||new Set)a(t)}subscribe(e,t){this.subscribers.has(e)||this.subscribers.set(e,new Set),this.subscribers.get(e).add(t)}};A.init("app",300),S.__FRONTEND_EVENT_BUS__=A,M.info("Starting Angular bootstrap");try{(0,s.B8)(F,{providers:[]}).then(e=>{M.info("Angular bootstrap completed successfully"),window.addEventListener("error",e=>{e.preventDefault();let t=e.error??e.message??"Unknown error";M.error("Global error:",t)}),window.addEventListener("unhandledrejection",e=>{e.preventDefault();let t=e.reason??"Unknown rejection";M.error("Unhandled promise rejection:",t)}),A.publish("app:ready",{timestamp:Date.now()})}).catch(e=>{let t=e instanceof Error?e.message:String(e);M.error("Angular bootstrap failed:",t)})}catch(t){let e=t instanceof Error?t.message:String(t);M.error("Bootstrap threw synchronously:",e)}}},function(e){e.O(0,["227","245","301","34","355","439","454","474","577"],function(){return e(e.s=983)}),e.O()}]);
//# sourceMappingURL=main.0bc6a9ab281c1c44.js.map