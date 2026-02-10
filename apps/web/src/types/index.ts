export interface User {
    id: string;
    name: string;
    email: string;
}

export interface Comment {
    id: string;
    content: string;
    createdAt: string;
    userId: string;
    user: User;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    position: number;
    columnId: string;
    updatedAt : string;
    assignment?: string; // Optional if not yet implemented
    comments: Comment[];
    _count?: {
        comments: number;
    };

}

export interface Column {
    id: string;
    name: string;
    position: number;
    boardId: string;
    _count?: {
        tasks: number;
    };
    tasks?: Task[]; // Populated when fetching board details
}

export interface Board {
    id: string;
    name: string;
    createdAt: string;
    columns: Column[];
}

export interface AuthResponse {
    token: string;
    user: User;
}
