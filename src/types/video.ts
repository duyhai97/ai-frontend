export type VideoStyle =
    | "VIRAL"
    | "REVIEW"
    | "STORY"
    | "EXPERT"
    | "EMOTIONAL"
    | "LIVESTREAM";

export type VideoCategory =
    | "GENERAL"
    | "HOME"
    | "FASHION"
    | "BEAUTY"
    | "BABY"
    | "FOOD"
    | "ELECTRONICS"
    | "SPORT"
    | "BOOK"
    | "PET";

export type VideoJob = {
    jobId: string;
    productName: string;
    affiliateLink?: string;
    status: string;
    imagePaths?: string[];
    script?: string;
    videoPlanJson?: string;
    videoUrl?: string;
    progress?: number;
    currentStep?: string;
    error?: string;
    createdBy?: string;
    createdAt?: string;
};

export type CreateVideoRequest = {
    productName: string;
    affiliateLink?: string;
    style?: VideoStyle;
    category?: VideoCategory;
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

export type VideoQuota = {
    dailyLimit: number;
    usedToday: number;
    extraToday: number;
    totalToday: number;
    remainingToday: number;
};