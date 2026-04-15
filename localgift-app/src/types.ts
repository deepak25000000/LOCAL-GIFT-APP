export interface User {
    name: string;
    avatar?: string;
}

export interface Item {
    id: number;
    title: string;
    description: string;
    category: string;
    condition: string;
    ownerId: string;
    ownerName: string;
    ownerAvatar?: string;
    latitude: number;
    longitude: number;
    status: string;
    createdAt: string;
    images?: string[];
}
