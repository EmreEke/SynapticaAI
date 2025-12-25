import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SliderModule } from 'primeng/slider';
import { InputNumberModule } from 'primeng/inputnumber'; 
import { MessageService } from 'primeng/api'; 
import { ToastModule } from 'primeng/toast'; 
import { TooltipModule } from 'primeng/tooltip';
import { InputSwitchModule } from 'primeng/inputswitch';

import { Job } from '../../models/job.model';
import { JobService } from '../../services/job.service'; 

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [
    CommonModule, TableModule, ButtonModule, TagModule, 
    DialogModule, InputTextModule, InputTextareaModule,
    FormsModule, SliderModule, ToastModule,
    TooltipModule, InputSwitchModule, InputNumberModule
  ],
  providers: [MessageService], 
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.css'
})
export class JobsComponent implements OnInit {
  
  jobs: Job[] = []; 
  jobDialog: boolean = false;
  
  job: any = { id: 0, title: '', description: '', status: 'Draft', isActive: true, postedDate: new Date(), criteria: [] };

  constructor(private jobService: JobService, private messageService: MessageService) {}

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.jobService.getJobs().subscribe({
      next: (data) => {
        this.jobs = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description, 
          isActive: item.is_active, 
          status: item.is_active ? 'Active' : 'Passive', 
          postedDate: new Date(item.created_at || new Date()),
          criteria: item.required_skills 
            ? Object.entries(item.required_skills).map(([k, v]) => ({ name: k, weight: Number(v) })) 
            : []
        }));
      },
      error: (err) => console.error('[HATA] İlanlar yuklenemedi:', err)
    });
  }

  editJob(job: Job) {
    this.job = { 
      ...job, 
      description: job.description || (job as any).department,
      criteria: job.criteria.map(c => ({ ...c })) 
    };
    this.jobDialog = true;
  }

  hideDialog() {
    this.jobDialog = false;
  }

  saveJob() {
    if (this.job.title.trim()) {
      
      if (this.job.id && this.job.id > 0) {
        this.jobService.updateJob(this.job.id, this.job).subscribe({
          next: () => {
            this.messageService.add({severity:'success', summary: 'Güncellendi', detail: 'İlan başarıyla güncellendi.'});
            this.loadJobs();
            this.jobDialog = false;
            this.resetJobForm(); 
          },
          error: (err) => {
            console.error('[HATA] Guncelleme hatasi:', err);
            this.messageService.add({severity:'error', summary: 'Hata', detail: 'Güncelleme başarısız.'});
          }
        });
      } 
      else {
        this.jobService.createJob(this.job).subscribe({
          next: () => {
            this.messageService.add({severity:'success', summary: 'Başarılı', detail: 'İlan oluşturuldu.'});
            this.loadJobs();
            this.jobDialog = false;
            this.resetJobForm(); 
          },
          error: (err) => {
            console.error('[HATA] Kayit hatasi:', err);
            this.messageService.add({severity:'error', summary: 'Hata', detail: 'Kaydedilemedi.'});
          }
        });
      }
    }
  }

  toggleStatus(job: Job) {
    job.isActive = !job.isActive;
    job.status = job.isActive ? 'Active' : 'Passive'; 

    this.jobService.updateJob(job.id, job).subscribe({
      next: () => {
          this.messageService.add({
              severity: job.isActive ? 'success' : 'warn', 
              summary: 'Durum Değişti', 
              detail: `İlan ${job.status} durumuna alındı.`
          });
      },
      error: () => {
          job.isActive = !job.isActive;
          job.status = job.isActive ? 'Active' : 'Passive';
          this.messageService.add({severity:'error', summary: 'Hata', detail: 'Durum değiştirilemedi.'});
      }
    });
  }
  
  resetJobForm() {
    this.job = { id: 0, title: '', description: '', status: 'Draft', isActive: true, postedDate: new Date(), criteria: [] };
  }
  
  openNew() {
    this.job = { 
        id: 0, title: '', description: '', status: 'Draft', isActive: true, postedDate: new Date(),
        criteria: [{ name: '', weight: 5 }] 
    };
    this.jobDialog = true;
  }

  addCriterion() {
    this.job.criteria.push({ name: '', weight: 5 }); 
  }

  removeCriterion(index: number) {
    this.job.criteria.splice(index, 1);
  }

  getSeverity(status: string): "success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined {
    return status === 'Active' ? 'success' : 'danger'; 
  }
}
