export type PurchaseOrder = {
    id: string;
    username: string;
    packageCode: string;
    extraVideos: number;
    amount: number;
    transferContent: string;
    status: string;
    createdAt: string;
};

export type PurchasePage = {
    content: PurchaseOrder[];
    number: number;
    size: number;
    totalPages: number;
    totalElements: number;
    first: boolean;
    last: boolean;
};

export type PurchaseQrResponse = {
    orderId: string;
    packageCode: string;
    extraVideos: number;
    amount: number;
    transferContent: string;
    qrUrl: string;
};