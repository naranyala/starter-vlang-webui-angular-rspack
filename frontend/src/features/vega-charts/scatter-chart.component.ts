/**
 * Scatter Chart Component - Correlation analysis
 */

import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import embed from 'vega-embed';

@Component({
  selector: 'app-scatter-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <div class="chart-header">
        <h2 class="chart-title"><span class="title-icon">⋱</span> Price vs Sales</h2>
        <p class="chart-description">Analyze correlation between product price and sales volume</p>
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
export class ScatterChartComponent implements AfterViewInit {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  private data = Array.from({ length: 50 }, (_, i) => ({
    price: Math.round((20 + Math.random() * 180) * 10) / 10,
    sales: Math.round(100 + Math.random() * 400),
    category: ['Electronics', 'Clothing', 'Home', 'Sports'][Math.floor(Math.random() * 4)]
  }));

  ngAfterViewInit(): void { this.renderChart(); }

  private async renderChart(): Promise<void> {
    const spec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { values: this.data },
      width: 'container',
      height: 350,
      mark: 'point',
      encoding: {
        x: { field: 'price', type: 'quantitative', axis: { labelColor: '#94a3b8', tickColor: '#475569', domainColor: '#475569' } },
        y: { field: 'sales', type: 'quantitative', axis: { labelColor: '#94a3b8', tickColor: '#475569', domainColor: '#475569' } },
        color: { field: 'category', type: 'nominal' },
        tooltip: [{ field: 'price' }, { field: 'sales' }, { field: 'category' }]
      }
    };
    await embed(this.chartContainer.nativeElement, spec as any, { actions: false });
  }
}
