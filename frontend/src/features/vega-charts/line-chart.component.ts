/**
 * Line Chart Component - Time series trends
 */

import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import embed from 'vega-embed';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <div class="chart-header">
        <h2 class="chart-title"><span class="title-icon">📈</span> Revenue Trends</h2>
        <p class="chart-description">Monthly revenue performance over the past year</p>
      </div>
      <div class="chart-wrapper"><div #chartContainer class="chart-canvas"></div></div>
    </div>
  `,
  styles: [`
    .chart-container { background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(148, 163, 184, 0.1); border-radius: 12px; padding: 24px; }
    .chart-header { margin-bottom: 24px; }
    .chart-title { display: flex; align-items: center; gap: 12px; margin: 0 0 8px; font-size: 1.5rem; font-weight: 600; color: #fff; }
    .title-icon { font-size: 1.75rem; }
    .chart-description { margin: 0; font-size: 0.9rem; color: #94a3b8; }
    .chart-wrapper { background: rgba(15, 23, 42, 0.5); border-radius: 8px; padding: 20px; }
    .chart-canvas { width: 100%; min-height: 400px; }
  `]
})
export class LineChartComponent implements AfterViewInit {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  private data = [
    { month: 'Jan', revenue: 45000, orders: 1200 },
    { month: 'Feb', revenue: 52000, orders: 1400 },
    { month: 'Mar', revenue: 48000, orders: 1300 },
    { month: 'Apr', revenue: 61000, orders: 1600 },
    { month: 'May', revenue: 55000, orders: 1500 },
    { month: 'Jun', revenue: 67000, orders: 1800 },
    { month: 'Jul', revenue: 72000, orders: 1900 },
    { month: 'Aug', revenue: 69000, orders: 1850 },
    { month: 'Sep', revenue: 78000, orders: 2100 },
    { month: 'Oct', revenue: 82000, orders: 2200 },
    { month: 'Nov', revenue: 91000, orders: 2500 },
    { month: 'Dec', revenue: 98000, orders: 2800 }
  ];

  ngAfterViewInit(): void { this.renderChart(); }

  private async renderChart(): Promise<void> {
    const spec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { values: this.data },
      width: 'container',
      height: 350,
      layer: [{
        mark: { type: 'line' as const, strokeWidth: 3, point: true, cursor: 'pointer' },
        encoding: {
          x: { field: 'month', type: 'ordinal' as const, axis: { labelColor: '#94a3b8', tickColor: '#475569', domainColor: '#475569' } },
          y: { field: 'revenue', type: 'quantitative' as const, axis: { labelColor: '#94a3b8', tickColor: '#475569', domainColor: '#475569', format: '$' } },
          color: { value: '#8b5cf6' },
          tooltip: [{ field: 'month' }, { field: 'revenue', format: '$,' }]
        }
      }, {
        mark: { type: 'area' as const, opacity: 0.2 },
        encoding: {
          x: { field: 'month', type: 'ordinal' as const },
          y: { field: 'revenue', type: 'quantitative' as const },
          color: { value: '#8b5cf6' }
        }
      }]
    };
    await embed(this.chartContainer.nativeElement, spec as any, { actions: false, renderer: 'svg' });
  }
}
