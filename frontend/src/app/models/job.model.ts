export interface Criterion {
    name: string;
    weight: number;
}

export interface Job {
    id: number;
    title: string;
    description: string;
    status: string;
    isActive: boolean;
    postedDate: Date;
    criteria: Criterion[]; 
}
