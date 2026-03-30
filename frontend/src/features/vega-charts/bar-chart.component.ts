/**
 * Bar Chart Component
 * Demonstrates categorical data comparison with Vega-Lite
 */

import { Component, signal, inject, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import embed from 'vega-embed';

interface BarData {
  category: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <div class="chart-header">
        <h2 class="chart-title">
          <span class="title-icon">📊</span>
          Sales by Category
        </h2>
        <p class="chart-description">Compare sales performance across different product categories</p>
      </div>

      <div class="chart-wrapper">
        <div #chartContainer class="chart-canvas"></div>
      </div>

      <div class="chart-stats">
        @for (stat of stats(); track stat.label) {
          <div class="stat-card">
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      padding: 24px;
    }

    .chart-header {
      margin-bottom: 24px;
    }

    .chart-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 8px;
      font-size: 1.5rem;
      font-weight: 600;
      color: #fff;
    }

    .title-icon {
      font-size: 1.75rem;
    }

    .chart-description {
      margin: 0;
      font-size: 0.9rem;
      color: #94a3b8;
    }

    .chart-wrapper {
      background: rgba(15, 23, 42, 0.5);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
    }

    .chart-canvas {
      width: 100%;
      min-height: 400px;
    }

    .chart-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
    }

    .stat-card {
      display: flex;
      flex-direction: column;
      padding: 16px;
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.2);
      border-radius: 10px;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #a78bfa;
    }

    .stat-label {
      font-size: 0.85rem;
      color: #94a3b8;
      margin-top: 4px;
    }
  `]
})
export class BarChartComponent implements AfterViewInit {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  stats = signal<Array<{ label: string; value: string }>>([]);

  private data: BarData[] = [
    { category: 'Electronics', value: 45000, color: '#8b5cf6' },
    { category: 'Clothing', value: 32000, color: '#a78bfa' },
    { category: 'Home', value: 28000, color: '#c4b5fd' },
    { category: 'Sports', value: 22000, color: '#ddd6fe' },
    { category: 'Books', value: 18000, color: '#ede9fe' },
    { category: 'Food', value: 35000, color: '#7c3aed' }
  ];

  ngAfterViewInit(): void {
    this.renderChart();
    this.calculateStats();
  }

  private calculateStats(): void {
    const total = this.data.reduce((sum, d) => sum + d.value, 0);
    const max = Math.max(...this.data.map(d => d.value));
    const avg = total / this.data.length;
    const min = Math.min(...this.data.map(d => d.value));

    this.stats.set([
      { label: 'Total Sales', value: this.formatCurrency(total) },
      { label: 'Highest', value: this.formatCurrency(max) },
      { label: 'Average', value: this.formatCurrency(avg) },
      { label: 'Lowest', value: this.formatCurrency(min) }
    ]);
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  private async renderChart(): Promise<void> {
    const spec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      description: 'Bar chart showing sales by category',
      data: { values: this.data },
      width: 'container',
      height: 350,
      mark: {
        type: 'bar' as const,
        cornerRadius: 8,
        cursor: 'pointer'
      },
      encoding: {
        x: {
          field: 'category',
          type: 'ordinal' as const,
          axis: {
            labelColor: '#94a3b8',
            tickColor: '#475569',
            domainColor: '#475569'
          }
        },
        y: {
          field: 'value',
          type: 'quantitative' as const,
          axis: {
            labelColor: '#94a3b8',
            tickColor: '#475569',
            domainColor: '#475569',
            format: '$'
          }
        },
        color: {
          field: 'color',
          type: 'nominal' as const,
          scale: null
        },
        tooltip: [
          { field: 'category', type: 'nominal' as const },
          { field: 'value', type: 'quantitative' as const, format: '$,' }
        ]
      },
      config: {
        view: { stroke: null },
        axis: { grid: false }
      }
    };

    await embed(this.chartContainer.nativeElement, spec as any, {
      actions: false,
      renderer: 'svg'
    });
  }
}
