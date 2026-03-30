/**
 * Vega Charts Demo Container
 * Main container for all Vega chart demonstrations
 */

import { Component, signal, inject, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarChartComponent } from './bar-chart.component';
import { LineChartComponent } from './line-chart.component';
import { PieChartComponent } from './pie-chart.component';
import { ScatterChartComponent } from './scatter-chart.component';
import { AreaChartComponent } from './area-chart.component';
import { HeatmapChartComponent } from './heatmap-chart.component';

interface ChartTab {
  id: string;
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-vega-charts-demo',
  standalone: true,
  imports: [
    CommonModule,
    BarChartComponent,
    LineChartComponent,
    PieChartComponent,
    ScatterChartComponent,
    AreaChartComponent,
    HeatmapChartComponent
  ],
  template: `
    <div class="vega-demo-container">
      <!-- Header -->
      <header class="vega-header">
        <div class="header-content">
          <div class="logo-section">
            <div class="logo-icon">📊</div>
            <div class="logo-text">
              <h1 class="demo-title">Vega Charts Gallery</h1>
              <p class="demo-subtitle">Interactive data visualizations powered by Vega-Lite</p>
            </div>
          </div>
          <div class="header-info">
            <div class="info-badge">
              <span class="info-icon">🎨</span>
              <span>{{ chartTabs.length }} Chart Types</span>
            </div>
          </div>
        </div>

        <!-- Chart Type Tabs -->
        <nav class="chart-tabs">
          @for (tab of chartTabs; track tab.id) {
            <button
              class="chart-tab"
              [class.active]="activeChart() === tab.id"
              (click)="setActiveChart(tab.id)"
            >
              <span class="tab-icon">{{ tab.icon }}</span>
              <span class="tab-label">{{ tab.label }}</span>
            </button>
          }
        </nav>
      </header>

      <!-- Chart Content -->
      <main class="chart-content">
        @if (activeChart() === 'bar') {
          <app-bar-chart />
        } @else if (activeChart() === 'line') {
          <app-line-chart />
        } @else if (activeChart() === 'pie') {
          <app-pie-chart />
        } @else if (activeChart() === 'scatter') {
          <app-scatter-chart />
        } @else if (activeChart() === 'area') {
          <app-area-chart />
        } @else if (activeChart() === 'heatmap') {
          <app-heatmap-chart />
        }
      </main>

      <!-- Footer Info -->
      <footer class="vega-footer">
        <div class="footer-info">
          <span class="info-item">
            <span class="info-label">Library:</span>
            <span class="info-value">Vega-Lite 6.x</span>
          </span>
          <span class="info-item">
            <span class="info-label">Renderer:</span>
            <span class="info-value">SVG</span>
          </span>
          <span class="info-item">
            <span class="info-label">Features:</span>
            <span class="info-value">Interactive, Responsive, Declarative</span>
          </span>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .vega-demo-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
    }

    .vega-header {
      border-bottom: 1px solid rgba(148, 163, 184, 0.2);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 32px;
      gap: 24px;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .logo-icon {
      font-size: 3rem;
      line-height: 1;
    }

    .demo-title {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.5px;
    }

    .demo-subtitle {
      margin: 4px 0 0;
      font-size: 0.9rem;
      color: #94a3b8;
    }

    .header-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .info-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 20px;
      color: #a78bfa;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .info-icon {
      font-size: 1rem;
    }

    .chart-tabs {
      display: flex;
      padding: 0 32px;
      gap: 4px;
      border-top: 1px solid rgba(148, 163, 184, 0.2);
      overflow-x: auto;
    }

    .chart-tab {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 14px 20px;
      background: transparent;
      border: none;
      border-radius: 8px 8px 0 0;
      color: #94a3b8;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .chart-tab:hover {
      background: rgba(139, 92, 246, 0.1);
      color: #a78bfa;
    }

    .chart-tab.active {
      background: rgba(139, 92, 246, 0.2);
      color: #a78bfa;
    }

    .tab-icon {
      font-size: 1.1rem;
    }

    .chart-content {
      flex: 1;
      padding: 32px;
      overflow-y: auto;
    }

    .vega-footer {
      padding: 16px 32px;
      background: rgba(139, 92, 246, 0.1);
      border-top: 1px solid rgba(139, 92, 246, 0.2);
    }

    .footer-info {
      display: flex;
      gap: 32px;
      flex-wrap: wrap;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
    }

    .info-label {
      color: rgba(255, 255, 255, 0.5);
    }

    .info-value {
      color: rgba(255, 255, 255, 0.8);
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: flex-start;
        padding: 20px;
      }

      .chart-tabs {
        padding: 0 20px;
      }

      .chart-tab {
        padding: 12px 16px;
      }

      .chart-content {
        padding: 20px;
      }

      .vega-footer {
        padding: 16px 20px;
      }

      .footer-info {
        flex-direction: column;
        gap: 12px;
      }
    }
  `]
})
export class VegaChartsDemoComponent implements OnInit {
  @Input() defaultChart: string = 'bar';
  
  activeChart = signal<string>('bar');

  chartTabs: ChartTab[] = [
    { id: 'bar', label: 'Bar Chart', icon: '📊', description: 'Categorical comparison' },
    { id: 'line', label: 'Line Chart', icon: '📈', description: 'Time series trends' },
    { id: 'pie', label: 'Pie Chart', icon: '🥧', description: 'Part-to-whole relationships' },
    { id: 'scatter', label: 'Scatter Plot', icon: '⋱', description: 'Correlation analysis' },
    { id: 'area', label: 'Area Chart', icon: '📉', description: 'Cumulative trends' },
    { id: 'heatmap', label: 'Heatmap', icon: '🔥', description: 'Matrix visualization' }
  ];

  ngOnInit(): void {
    this.activeChart.set(this.defaultChart);
  }

  setActiveChart(chartId: string): void {
    this.activeChart.set(chartId);
  }
}
