import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Job } from '../models/job.model';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = 'http://localhost:8000/api/job-ads'; 

  constructor(private http: HttpClient) { }

  getJobs(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createJob(job: Job): Observable<any> {
    const payload = {
      title: job.title,
      description: job.description, 
      required_skills: this.formatCriteria(job.criteria),
      is_active: job.isActive
    };

    return this.http.post<any>(this.apiUrl, payload);
  }

  updateJob(id: number, job: Job): Observable<any> {
    const payload = {
      title: job.title,
      description: job.description,
      required_skills: this.formatCriteria(job.criteria),
      is_active: job.isActive
    };

    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  private formatCriteria(criteria: any[]): any {
    const skills: any = {};
    if (criteria) {
      criteria.forEach(c => {
        if (c.name) {
            skills[c.name] = c.weight;
        }
      });
    }
    return skills;
  }
}
