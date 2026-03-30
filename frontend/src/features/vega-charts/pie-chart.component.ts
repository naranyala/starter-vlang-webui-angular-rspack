/**
 * Pie Chart Component - Part-to-whole relationships
 */

import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import embed from 'vega-embed';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <div class="chart-header">
        <h2 class="chart-title"><span class="title-icon">🥧</span> Market Share</h2>
        <p class="chart-description">Distribution of market share by segment</p>
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
export class PieChartComponent implements AfterViewInit {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  private data = [
    { segment: 'Electronics', share: 35, color: '#8b5cf6' },
    { segment: 'Clothing', share: 25, color: '#a78bfa' },
    { segment: 'Home', share: 20, color: '#c4b5fd' },
    { segment: 'Sports', share: 12, color: '#ddd6fe' },
    { segment: 'Other', share: 8, color: '#ede9fe' }
  ];

  ngAfterViewInit(): void { this.renderChart(); }

  private async renderChart(): Promise<void> {
    const spec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { values: this.data },
      width: 'container',
      height: 350,
      mark: { type: 'arc' as const, innerRadius: 60, outerRadius: 140, strokeWidth: 2, cursor: 'pointer' },
      encoding: {
        theta: { field: 'share', type: 'quantitative' as const, scale: { domain: [0, 100] } },
        color: { field: 'color', type: 'nominal' as const, scale: null, legend: null },
        tooltip: [{ field: 'segment' }, { field: 'share', format: '.1f', suffix: '%' }]
      }
    };
    await embed(this.chartContainer.nativeElement, spec as any, { actions: false, renderer: 'svg' });
  }
}
