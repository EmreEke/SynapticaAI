import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { FileUploadModule, FileUpload } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';

import { Candidate } from '../../models/candidate.model';
import { CandidateService } from '../../services/candidate.service';

@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [
    CommonModule, FormsModule, 
    FileUploadModule, ToastModule, TagModule, ProgressBarModule, ButtonModule,
    SidebarModule, DropdownModule, InputTextModule, CheckboxModule, InputTextareaModule,
    TooltipModule, DialogModule, TableModule
  ],
  providers: [MessageService],
  templateUrl: './candidates.component.html',
  styleUrl: './candidates.component.css'
})
export class CandidatesComponent implements OnInit {

  @ViewChild('fileUploadRef') fileUploadRef: FileUpload | undefined;
  
  candidates: Candidate[] = [];
  allCandidates: Candidate[] = [];
  jobAds: any[] = [];
  
  selectedJob: any = null;
  selectedCandidate: any = null;
  
  analysisResult: any = null;
  sidebarVisible: boolean = false;

  uploadDialogVisible: boolean = false;
  uploadCandidateName: string = '';
  selectedFile: File | null = null;
  isUploading: boolean = false;
  
  aiCommentary: any = null;   
  loadingAI: boolean = false; 
  
  displayEmailDialog: boolean = false;
  emailToSend: string = '';
  
  sortOptions: any[] = [
    { label: 'Önerilen (Skor)', value: 'score' },
    { label: 'İsim (A-Z)', value: 'name' },
    { label: 'Tarih (Yeni -> Eski)', value: 'date' }
  ];
  selectedSort: string = 'score';

  searchText: string = '';
  filterByNotes: boolean = false;

  currentPage: number = 1;
  itemsPerPage: number = 10;
  itemsPerPageOptions: number[] = [10, 25, 50];
  totalItems: number = 0;

  candidateNotes: string = '';
  notesDialogVisible: boolean = false;

  cvViewerVisible: boolean = false;
  cvViewerUrl: SafeResourceUrl | string = '';
  cvZoomLevel: number = 100;

  constructor(
    private messageService: MessageService, 
    private candidateService: CandidateService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadJobAds();
  }

  loadJobAds() {
    this.candidateService.getJobAds(true).subscribe({
      next: (data) => {
        this.jobAds = data;
        this.selectedJob = null; 
      },
      error: (err) => console.error("[HATA] İlanlar yuklenemedi:", err)
    });
  }

  onJobSelect() {
    if (this.selectedJob) {
        this.loadCandidates();
        this.messageService.add({
            severity: 'info', 
            summary: 'İlan Seçildi', 
            detail: `${this.selectedJob.title} adayları listeleniyor.`
        });
    } else {
        this.candidates = [];
    }
  }

  loadCandidates() {
    if (!this.selectedJob) return;

    const searchQuery = this.searchText.trim();
    const notesQuery = this.filterByNotes ? 'has_notes' : '';
    
    this.candidateService.getCandidates(
      this.selectedJob.id,
      searchQuery,
      notesQuery,
      (this.currentPage - 1) * this.itemsPerPage,
      this.itemsPerPage
    ).subscribe({
      next: (response: any) => {
        if (response && response.items && Array.isArray(response.items)) {
          this.allCandidates = response.items;
          this.totalItems = response.total_count || 0;
        } else if (Array.isArray(response)) {
          this.allCandidates = response;
          this.totalItems = response.length;
        } else {
          console.warn("[UYARI] Beklenmeyen response formati:", response);
          this.allCandidates = [];
          this.totalItems = 0;
        }
        this.candidates = [...this.allCandidates];
        this.sortCandidates();
      },
      error: (err) => {
        console.error("[HATA] Adaylar yuklenemedi:", err);
        this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Adaylar yüklenemedi.' });
      }
    });
  }

  sortCandidates() {
    if (!Array.isArray(this.candidates)) {
      return;
    }
    
    if (this.selectedSort === 'name') {
      this.candidates.sort((a: any, b: any) => 
        (a.filename || a.name || '').localeCompare(b.filename || b.name || '')
      );
    } else if (this.selectedSort === 'score') {
      this.candidates.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    } else if (this.selectedSort === 'date') {
      this.candidates.sort((a, b) => {
        const dateA = new Date(a.uploadDate || a.created_at || 0).getTime();
        const dateB = new Date(b.uploadDate || b.created_at || 0).getTime();
        return dateB - dateA;
      });
    }
  }

  onSortChange() { 
    this.currentPage = 1;
    this.loadCandidates();
  }

  onSearchChange() {
    this.currentPage = 1;
    this.loadCandidates();
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
    this.loadCandidates();
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    
    if (this.totalPages <= maxPages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, this.currentPage - 2);
      let end = Math.min(this.totalPages, start + maxPages - 1);
      
      if (end - start < maxPages - 1) {
        start = Math.max(1, end - maxPages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadCandidates();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadCandidates();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadCandidates();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  viewCandidateDetails(candidate: Candidate) {
    this.selectedCandidate = candidate;
    this.analysisResult = null;
    this.sidebarVisible = true;
    
    this.aiCommentary = null;
    this.loadingAI = false;
    
    this.candidateNotes = (candidate as any).notes || '';

    this.candidateService.getCVDetails(candidate.id).subscribe({
        next: (data) => {
            console.log("[INFO] Analiz detaylari:", data);
            this.analysisResult = data; 
            
            if (this.selectedCandidate) {
                this.selectedCandidate.matchScore = data.analysis.total_score;
                this.candidateNotes = (this.selectedCandidate as any).notes || '';
            }
        },
        error: (err) => {
            console.error("[HATA] Analiz detaylari yuklenemedi:", err);
            this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Analiz detayları yüklenemedi.' });
        }
    });
  }

  openNotesDialog() {
    if (!this.selectedCandidate) return;
    this.candidateNotes = (this.selectedCandidate as any).notes || '';
    this.notesDialogVisible = true;
  }

  saveNotes() {
    if (!this.selectedCandidate) return;

    this.candidateService.updateCandidateNotes(this.selectedCandidate.id, this.candidateNotes).subscribe({
      next: () => {
        (this.selectedCandidate as any).notes = this.candidateNotes;
        const index = this.allCandidates.findIndex(c => c.id === this.selectedCandidate.id);
        if (index !== -1) {
          (this.allCandidates[index] as any).notes = this.candidateNotes;
        }
        this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Notlar kaydedildi.' });
        this.notesDialogVisible = false;
        this.loadCandidates();
      },
      error: (err) => {
        console.error("[HATA] Not kaydetme hatasi:", err);
        this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Notlar kaydedilemedi.' });
      }
    });
  }

  viewCV() {
    if (!this.selectedCandidate) return;
    
    this.candidateService.downloadCV(this.selectedCandidate.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        this.cvViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.cvViewerVisible = true;
        this.cvZoomLevel = 100;
      },
      error: (err) => {
        console.error("[HATA] CV indirme hatasi:", err);
        this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'CV görüntülenemedi.' });
      }
    });
  }

  getSafeUrl(): SafeResourceUrl {
    if (!this.cvViewerUrl) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }
    if (typeof this.cvViewerUrl === 'string') {
      return this.sanitizer.bypassSecurityTrustResourceUrl(this.cvViewerUrl);
    }
    return this.cvViewerUrl as SafeResourceUrl;
  }

  downloadCV() {
    if (!this.selectedCandidate) return;
    
    this.candidateService.downloadCV(this.selectedCandidate.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = this.selectedCandidate.filename || 'cv.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'CV indirildi.' });
      },
      error: (err) => {
        console.error("[HATA] CV indirme hatasi:", err);
        this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'CV indirilemedi.' });
      }
    });
  }

  printCV() {
    if (!this.cvViewerUrl) return;
    const url = typeof this.cvViewerUrl === 'string' ? this.cvViewerUrl : (this.cvViewerUrl as any).changingThisBreaksApplicationSecurity;
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }

  zoomIn() {
    if (this.cvZoomLevel < 200) {
      this.cvZoomLevel += 10;
    }
  }

  zoomOut() {
    if (this.cvZoomLevel > 50) {
      this.cvZoomLevel -= 10;
    }
  }

  resetZoom() {
    this.cvZoomLevel = 100;
  }

  exportAIToPDF() {
    if (!this.analysisResult || !this.aiCommentary) {
      this.messageService.add({ severity: 'warn', summary: 'Uyarı', detail: 'Önce AI analizini çalıştırın.' });
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Popup engellendi. Lütfen popup engelleyiciyi kapatın.' });
      return;
    }

    const candidateName = this.analysisResult.cv.filename || 'Aday';
    const jobTitle = this.analysisResult.job.title || 'Pozisyon';
    const totalScore = this.analysisResult.analysis.total_score || 0;
    const level = this.aiCommentary.level_estimation || 'Belirtilmemiş';
    const recommendation = this.aiCommentary.recommendation || '';
    const summary = this.aiCommentary.summary || '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>AI Analiz Raporu - ${candidateName}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            color: #1e293b;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #667eea;
          }
          .header h1 {
            color: #667eea;
            margin: 0 0 10px 0;
            font-size: 28px;
          }
          .info-card {
            background: #f8fafc;
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
          }
          .score-badge {
            display: inline-block;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 15px 30px;
            border-radius: 12px;
            font-size: 24px;
            font-weight: bold;
            margin: 20px 0;
          }
          .section {
            margin: 30px 0;
          }
          .section h2 {
            color: #667eea;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
          }
          .strengths, .weaknesses {
            margin: 15px 0;
          }
          .strengths li {
            color: #059669;
            margin: 8px 0;
          }
          .weaknesses li {
            color: #dc2626;
            margin: 8px 0;
          }
          ul {
            list-style: none;
            padding-left: 0;
          }
          li:before {
            content: "• ";
            font-weight: bold;
            margin-right: 8px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🤖 AI Analiz Raporu</h1>
          <p style="color: #64748b; font-size: 16px;">${candidateName} - ${jobTitle}</p>
        </div>

        <div class="info-card">
          <div style="text-align: center;">
            <div class="score-badge">Toplam Skor: %${totalScore.toFixed(0)}</div>
            <p style="margin: 10px 0 0 0; color: #64748b;"><strong>Tahmini Seviye:</strong> ${level}</p>
          </div>
        </div>

        <div class="section">
          <h2>📋 Özet</h2>
          <p style="font-style: italic; color: #475569;">${summary}</p>
        </div>

        <div class="section">
          <h2>💡 AI Önerisi</h2>
          <p style="color: #475569; font-weight: 600;">${recommendation}</p>
        </div>

        <div class="section">
          <h2>⚡ Güçlü Yanlar</h2>
          <ul class="strengths">
            ${this.aiCommentary.strengths.map((s: string) => `<li>${s}</li>`).join('')}
          </ul>
        </div>

        <div class="section">
          <h2>📈 Gelişim Alanları</h2>
          <ul class="weaknesses">
            ${this.aiCommentary.weaknesses.map((w: string) => `<li>${w}</li>`).join('')}
          </ul>
        </div>

        <div class="footer">
          <p>Bu rapor SynapticaAI sistemi tarafından otomatik olarak oluşturulmuştur.</p>
          <p>Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);

    this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'PDF yazdırma penceresi açıldı.' });
  }

  analyzeWithAI() {
    if (!this.selectedCandidate) return;

    this.loadingAI = true;

    this.candidateService.getAICommentary(this.selectedCandidate.id).subscribe({
      next: (data: any) => {
        this.aiCommentary = data;
        this.loadingAI = false;
      },
      error: (err: any) => {
        console.error("[HATA] AI analiz hatasi:", err);
        this.loadingAI = false;
        this.messageService.add({severity:'error', summary:'Hata', detail:'Yapay zeka analizi yapılamadı.'});
      }
    });
  }

  onUpload(event: { files: any[] }) {
    if (!this.selectedJob) {
        this.messageService.add({ severity: 'warn', summary: 'Dikkat', detail: 'Lütfen önce yukarıdan bir ilan seçiniz.' });
        if(this.fileUploadRef) this.fileUploadRef.clear();
        return;
    }

    for(let file of event.files) {
      let tempName = file.name.replace(/\.[^/.]+$/, "");
      tempName = tempName.replace(/_/g, ' ').replace(/-/g, ' ');

      this.candidateService.uploadCV(file, this.selectedJob.id, tempName).subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
              this.messageService.add({ 
                severity: 'success', 
                summary: 'Başarılı', 
                detail: `${file.name} başarıyla analiz edildi.` 
              });
              this.loadCandidates(); 
              if (this.fileUploadRef) this.fileUploadRef.clear();
          } else {
              this.messageService.add({ 
                  severity: 'error', 
                  summary: 'Analiz Hatası', 
                  detail: response.message 
              });
          }
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Sunucu Hatası', detail: 'Yükleme başarısız.' });
        }
      });
    }
  }

  deleteCandidate(event: Event, candidate: Candidate) {
    event.stopPropagation();

    if (confirm(`"${candidate.filename || candidate.name}" adlı adayı silmek istediğinize emin misiniz?`)) {
        this.candidateService.deleteCandidate(candidate.id).subscribe({
            next: () => {
                this.candidates = this.candidates.filter(c => c.id !== candidate.id);
                this.allCandidates = this.allCandidates.filter(c => c.id !== candidate.id);

                this.messageService.add({
                    severity: 'success',
                    summary: 'Başarılı',
                    detail: 'Aday sistemden silindi.'
                });

                if (this.selectedCandidate && this.selectedCandidate.id === candidate.id) {
                    this.sidebarVisible = false;
                    this.selectedCandidate = null;
                }
            },
            error: (err) => {
                console.error("[HATA] Silme islemi basarisiz:", err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Hata',
                    detail: 'Aday silinemedi. Lütfen tekrar deneyin.'
                });
            }
        });
    }
  }

  getStatusSeverity(status: string): any {
     switch (status) {
      case 'Analyzed': return 'info';
      case 'Interview': return 'success';
      case 'Rejected': return 'danger';
      case 'Hired': return 'success';
      case 'Invited': return 'warning';
      default: return 'secondary';
    }
  }

  updateStatus(status: string, email: string = '') {
    if (!this.selectedCandidate) return;

    this.candidateService.updateCandidateStatus(this.selectedCandidate.id, status, email).subscribe({
        next: (response: any) => {
            this.selectedCandidate.status = status as any;
            const index = this.candidates.findIndex(c => c.id === this.selectedCandidate.id);
            if (index !== -1) this.candidates[index].status = status as any;
            
            if (status === 'Invited' && response.email_sent !== undefined) {
                if (response.email_sent) {
                    this.messageService.add({ 
                        severity: 'success', 
                        summary: 'Başarılı', 
                        detail: response.email_message || 'Statü güncellendi ve mülakat daveti e-postası gönderildi.' 
                    });
                } else {
                    this.messageService.add({ 
                        severity: 'warn', 
                        summary: 'Uyarı', 
                        detail: response.email_message || 'Statü güncellendi ancak e-posta gönderilemedi. SMTP ayarlarını kontrol edin.' 
                    });
                }
            } else {
                this.messageService.add({ severity: 'success', summary: 'Güncellendi', detail: `Yeni Statü: ${status}` });
            }
        },
        error: (err) => {
            console.error("[HATA] Status guncelleme hatasi:", err);
            this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Statü güncellenemedi.' });
        }
    });
  }

  openInviteDialog() {
    if (!this.selectedCandidate) return;
     this.emailToSend = this.selectedCandidate.email !== 'Belirtilmemiş' ? this.selectedCandidate.email : '';
     this.displayEmailDialog = true;
  }

  confirmInvite() {
     if (!this.emailToSend) {
         this.messageService.add({severity:'warn', summary:'Uyarı', detail:'Lütfen mail adresi girin.'});
         return;
     }
     this.updateStatus('Invited', this.emailToSend);
     this.displayEmailDialog = false; 
  }

  showUploadDialog() {
    if (!this.selectedJob) {
        this.messageService.add({severity:'warn', summary:'Uyarı', detail:'Lütfen önce bir pozisyon seçiniz.'});
        return;
    }
    this.uploadCandidateName = '';
    this.selectedFile = null;
    this.uploadDialogVisible = true;
  }

  onFileSelect(event: any) {
    if (event.files && event.files.length > 0) {
        this.selectedFile = event.files[0];

        if (!this.uploadCandidateName) {
            let name = this.selectedFile?.name.replace('.pdf', '').replace('.docx', '') || '';
            name = name.replace(/_/g, ' ').replace(/-/g, ' '); 
            this.uploadCandidateName = name;
        }
    }
  }

  uploadManualCV() {
    if (!this.selectedFile || !this.uploadCandidateName || !this.selectedJob) {
        this.messageService.add({severity:'warn', summary:'Eksik Bilgi', detail:'Lütfen isim giriniz ve dosya seçiniz.'});
        return;
    }

    this.isUploading = true;

    this.candidateService.uploadCV(this.selectedFile, this.selectedJob.id, this.uploadCandidateName).subscribe({
        next: (response) => {
            this.messageService.add({severity:'success', summary:'Başarılı', detail:'Aday eklendi ve analiz edildi.'});
            this.uploadDialogVisible = false;
            this.isUploading = false;
            this.loadCandidates();
        },
        error: (err) => {
            console.error("[HATA] Yukleme hatasi:", err);
            this.messageService.add({severity:'error', summary:'Hata', detail:'Yükleme sırasında hata oluştu.'});
            this.isUploading = false;
        }
    });
  }
}
