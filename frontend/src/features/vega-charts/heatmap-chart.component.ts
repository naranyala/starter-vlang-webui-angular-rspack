/**
 * Heatmap Chart Component - Matrix visualization
 */

import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import embed from 'vega-embed';

@Component({
  selector: 'app-heatmap-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <div class="chart-header">
        <h2 class="chart-title"><span class="title-icon">🔥</span> Sales Heatmap</h2>
        <p class="chart-description">Daily sales intensity by day of week and hour</p>
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
export class HeatmapChartComponent implements AfterViewInit {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  private data = this.generateHeatmapData();

  private generateHeatmapData(): Array<{ day: string; hour: number; value: number }> {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data: Array<{ day: string; hour: number; value: number }> = [];
    
    for (const day of days) {
      for (let hour = 9; hour <= 21; hour++) {
        const isWeekend = day === 'Sat' || day === 'Sun';
        const isPeak = hour >= 12 && hour <= 18;
        const baseValue = isWeekend ? 60 : 40;
        const peakBonus = isPeak ? 30 : 0;
        const randomVar = Math.random() * 20;
        
        data.push({
          day,
          hour,
          value: Math.round(baseValue + peakBonus + randomVar)
        });
      }
    }
    return data;
  }

  ngAfterViewInit(): void { this.renderChart(); }

  private async renderChart(): Promise<void> {
    const spec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { values: this.data },
      width: 'container',
      height: 350,
      mark: 'rect',
      encoding: {
        x: { field: 'hour', type: 'ordinal' as const, axis: { labelColor: '#94a3b8', tickColor: '#475569', domainColor: '#475569', format: (d: any) => `${d}:00` } },
        y: { field: 'day', type: 'ordinal' as const, axis: { labelColor: '#94a3b8', tickColor: '#475569', domainColor: '#475569' } },
        color: {
          field: 'value',
          type: 'quantitative' as const,
          scale: { range: ['#1e1b4b', '#312e81', '#4338ca', '#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'] },
          legend: { labelColor: '#94a3b8', titleColor: '#94a3b8' }
        },
        tooltip: [{ field: 'day' }, { field: 'hour', format: '.0f', suffix: ':00' }, { field: 'value', title: 'Sales' }]
      },
      config: { view: { stroke: '#475569' } }
    };
    await embed(this.chartContainer.nativeElement, spec as any, { actions: false, renderer: 'svg' });
  }
}
