import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  uploadCV(file: File, jobId: number, candidateName: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_id', jobId.toString());
    formData.append('candidate_name', candidateName);

    return this.http.post(`${this.apiUrl}/analyze-cv`, formData);
  }

  getCandidates(jobId?: number, searchQuery: string = '', notesQuery: string = '', skip: number = 0, limit: number = 10): Observable<any> {
    let params = new HttpParams();
    
    if (jobId) {
        params = params.set('job_id', jobId.toString());
    }
    if (searchQuery) {
        params = params.set('search_query', searchQuery);
    }
    if (notesQuery) {
        params = params.set('notes_query', notesQuery);
    }
    params = params.set('skip', skip.toString());
    params = params.set('limit', limit.toString());

    return this.http.get<any>(`${this.apiUrl}/cvs`, { params });
  }

  deleteCandidate(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cvs/${id}`);
  }

  getJobAds(activeOnly: boolean = false): Observable<any[]> {
    let params = new HttpParams();
    
    if (activeOnly) {
      params = params.set('active_only', 'true');
    }
    
    return this.http.get<any[]>(`${this.apiUrl}/job-ads`, { params });
  }

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard-stats`);
  }

  updateCandidateStatus(id: number, status: string, email?: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/cvs/${id}/status`, { status: status, email: email });
  }

  getCVDetails(cvId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/cv-details/${cvId}`);
  }

  getAICommentary(cvId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/ai-commentary/${cvId}`, {});
  }

  updateCandidateNotes(id: number, notes: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/cvs/${id}/notes`, { notes: notes });
  }

  downloadCV(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/cvs/${id}/download`, { responseType: 'blob' });
  }
}
