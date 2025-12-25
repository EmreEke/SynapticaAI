import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Router } from '@angular/router';
import { CandidateService } from '../../services/candidate.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    ChartModule, 
    TableModule, 
    ButtonModule, 
    TagModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  stats = {
    totalJobs: 0,
    activeCandidates: 0,
    invited: 0,
    interviews: 0,
    hired: 0
  };

  barData: any;
  barOptions: any;
  pieData: any;
  pieOptions: any;
  lineData: any;
  lineOptions: any;

  recentActivities: any[] = [];

  constructor(private candidateService: CandidateService, private router: Router) {}

  ngOnInit() {
    this.initChartOptions();
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.candidateService.getDashboardStats().subscribe({
      next: (response: any) => {
        console.log("[INFO] Dashboard verisi:", response);

        this.stats = response.stats;
        this.updatePieChart(response.charts.pie);
        this.updateBarChart(response.charts.bar);
        this.updateLineChart(response.charts.line || this.generateMonthlyTrend());
        this.recentActivities = response.recent_activities;
      },
      error: (err) => console.error("[HATA] Dashboard yuklenemedi:", err)
    });
  }

  updatePieChart(chartData: any) {
    const statusMap: { [key: string]: string } = {
      'Analyzed': 'Analiz Edildi',
      'Invited': 'Davet Edildi',
      'Interview': 'Mülakatta',
      'Hired': 'İşe Alındı',
      'Rejected': 'Reddedildi'
    };

    const translatedLabels = chartData.labels.map((label: string) => statusMap[label] || label);

    this.pieData = {
      labels: translatedLabels,
      datasets: [
        {
          data: chartData.data,
          backgroundColor: ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#a855f7"],
          hoverBackgroundColor: ["#2563eb", "#d97706", "#059669", "#dc2626", "#9333ea"],
          borderWidth: 0
        }
      ]
    };
  }

  updateBarChart(chartData: any) {
    this.barData = {
      labels: chartData.labels,
      datasets: [
        {
          label: 'Başvuru Sayısı',
          data: chartData.data,
          backgroundColor: '#8b5cf6',
          hoverBackgroundColor: '#7c3aed',
          borderRadius: 16,
          barThickness: 50,
          borderSkipped: false,
          maxBarThickness: 60
        }
      ]
    };
  }

  initChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--color-text-primary') || '#4b5563';
    const textColorSecondary = documentStyle.getPropertyValue('--color-text-secondary') || '#9ca3af';
    const surfaceBorder = documentStyle.getPropertyValue('--color-border') || '#f3f4f6';

    this.barOptions = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                cornerRadius: 8,
                displayColors: false
            }
        },
        scales: {
            x: {
                ticks: { 
                    color: textColorSecondary, 
                    font: { weight: 500, size: 12 },
                    maxRotation: 45,
                    minRotation: 0
                },
                grid: { display: false, drawBorder: false }
            },
            y: {
                ticks: { 
                    color: textColorSecondary,
                    font: { size: 12 },
                    stepSize: 1
                },
                grid: { 
                    color: surfaceBorder, 
                    drawBorder: false,
                    lineWidth: 1
                },
                beginAtZero: true
            }
        }
    };

    this.pieOptions = {
        plugins: {
            legend: {
                position: 'right',
                labels: { usePointStyle: true, color: textColor }
            }
        }
    };

    this.lineOptions = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: textColor,
                    usePointStyle: true,
                    padding: 15
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                cornerRadius: 8
            }
        },
        scales: {
            x: {
                ticks: { 
                    color: textColorSecondary, 
                    font: { weight: 500, size: 12 }
                },
                grid: { 
                    display: false, 
                    drawBorder: false 
                }
            },
            y: {
                ticks: { 
                    color: textColorSecondary,
                    font: { size: 12 },
                    stepSize: 1
                },
                grid: { 
                    color: surfaceBorder, 
                    drawBorder: false,
                    lineWidth: 1
                },
                beginAtZero: true
            }
        },
        elements: {
            point: {
                radius: 5,
                hoverRadius: 7,
                borderWidth: 2
            },
            line: {
                tension: 0.4,
                borderWidth: 3
            }
        }
    };
  }

  generateMonthlyTrend() {
    const months = [];
    const data = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push(date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' }));
      data.push(Math.floor(Math.random() * 20) + 5);
    }
    
    return { labels: months, data: data };
  }

  updateLineChart(chartData: any) {
    this.lineData = {
      labels: chartData.labels,
      datasets: [
        {
          label: 'Başvuru Sayısı',
          data: chartData.data,
          fill: true,
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderColor: '#8b5cf6',
          pointBackgroundColor: '#8b5cf6',
          pointBorderColor: '#ffffff',
          pointHoverBackgroundColor: '#7c3aed',
          pointHoverBorderColor: '#ffffff',
          tension: 0.4
        }
      ]
    };
  }

  getStatusSeverity(status: string): "success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined {
    switch (status) {
      case 'Analyzed': return 'info';
      case 'Interview': return 'warning';
      case 'Rejected': return 'danger';
      case 'Hired': return 'success';
      case 'Invited': return 'info';
      default: return 'secondary';
    }
  }

  goToCandidates() {
    this.router.navigate(['/candidates']);
  }
}
