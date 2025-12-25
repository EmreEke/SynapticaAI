export interface Candidate {
    id: number;
    name: string;
    email: string;
    appliedJob: string;
    matchScore: number;
    status: string;
    uploadDate: Date;
    filename?: string;    
    created_at?: string | Date;
    aiAnalysis?: any;
}
