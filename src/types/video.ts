export type VideoJob = {
    jobId: string;
    productName: string;
    affiliateLink?: string;
    status: string;
    imagePaths?: string[];
    script?: string;
    videoUrl?: string;
    progress?: number;
    currentStep?: string;
    error?: string;
    createdBy?: string;
    createdAt?: string;
};

export type VideoPage = {
    content: VideoJob[];
    number: number;
    size: number;
    totalPages: number;
    totalElements: number;
    first: boolean;
    last: boolean;
};