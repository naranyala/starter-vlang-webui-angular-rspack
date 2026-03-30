/**
 * Area Chart Component - Cumulative trends
 */

import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import embed from 'vega-embed';

@Component({
  selector: 'app-area-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <div class="chart-header">
        <h2 class="chart-title"><span class="title-icon">📉</span> Cumulative Revenue</h2>
        <p class="chart-description">Stacked area showing cumulative revenue by category</p>
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
export class AreaChartComponent implements AfterViewInit {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  private data = [
    { month: 'Jan', electronics: 20000, clothing: 15000, home: 10000 },
    { month: 'Feb', electronics: 24000, clothing: 17000, home: 11000 },
    { month: 'Mar', electronics: 22000, clothing: 16000, home: 10000 },
    { month: 'Apr', electronics: 28000, clothing: 20000, home: 13000 },
    { month: 'May', electronics: 25000, clothing: 18000, home: 12000 },
    { month: 'Jun', electronics: 32000, clothing: 22000, home: 13000 },
    { month: 'Jul', electronics: 35000, clothing: 24000, home: 13000 },
    { month: 'Aug', electronics: 33000, clothing: 23000, home: 13000 },
    { month: 'Sep', electronics: 38000, clothing: 26000, home: 14000 },
    { month: 'Oct', electronics: 40000, clothing: 28000, home: 14000 },
    { month: 'Nov', electronics: 45000, clothing: 30000, home: 16000 },
    { month: 'Dec', electronics: 50000, clothing: 32000, home: 16000 }
  ];

  ngAfterViewInit(): void { this.renderChart(); }

  private async renderChart(): Promise<void> {
    const spec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { values: this.data },
      width: 'container',
      height: 350,
      mark: 'area',
      encoding: {
        x: { field: 'month', type: 'ordinal' as const, axis: { labelColor: '#94a3b8', tickColor: '#475569', domainColor: '#475569' } },
        y: { field: 'electronics', type: 'quantitative' as const, stack: 'zero', axis: { labelColor: '#94a3b8', tickColor: '#475569', domainColor: '#475569' } },
        color: { value: '#8b5cf6' }
      },
      layer: [{
        mark: 'area',
        encoding: { y: { field: 'electronics', type: 'quantitative' as const, stack: 'zero' }, color: { value: '#8b5cf6' } }
      }, {
        mark: 'area',
        encoding: { y: { field: 'clothing', type: 'quantitative' as const, stack: 'zero' }, color: { value: '#a78bfa' } }
      }, {
        mark: 'area',
        encoding: { y: { field: 'home', type: 'quantitative' as const, stack: 'zero' }, color: { value: '#c4b5fd' } }
      }]
    };
    await embed(this.chartContainer.nativeElement, spec as any, { actions: false, renderer: 'svg' });
  }
}
