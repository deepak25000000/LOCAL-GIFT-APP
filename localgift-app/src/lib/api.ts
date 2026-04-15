const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const WS_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace('http', 'ws');

// Helper to get auth token
async function getAuthHeaders(): Promise<HeadersInit> {
    if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };
    try {
        const { auth } = await import('@/lib/firebase');
        const token = await auth.currentUser?.getIdToken();
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        };
    } catch {
        return { 'Content-Type': 'application/json' };
    }
}

export const api = {
    // ─── Items ─────────────────────────────
    async getItems(params?: { minLat?: number, maxLat?: number, minLng?: number, maxLng?: number, category?: string, search?: string }) {
        let url = `${API_BASE_URL}/api/items`;
        if (params) {
            const q = new URLSearchParams();
            if (params.minLat !== undefined) q.append('minLat', params.minLat.toString());
            if (params.maxLat !== undefined) q.append('maxLat', params.maxLat.toString());
            if (params.minLng !== undefined) q.append('minLng', params.minLng.toString());
            if (params.maxLng !== undefined) q.append('maxLng', params.maxLng.toString());
            if (params.category) q.append('category', params.category);
            if (params.search) q.append('search', params.search);
            const str = q.toString();
            if (str) url += `?${str}`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch items');
        return res.json();
    },

    async getItem(id: string) {
        const res = await fetch(`${API_BASE_URL}/api/items/${id}`);
        if (!res.ok) throw new Error('Failed to fetch item');
        return res.json();
    },

    async createItem(formData: FormData) {
        const headers: HeadersInit = {};
        try {
            const { auth } = await import('@/lib/firebase');
            const token = await auth.currentUser?.getIdToken();
            if (token) headers['Authorization'] = `Bearer ${token}`;
        } catch { }

        const res = await fetch(`${API_BASE_URL}/api/items`, {
            method: 'POST',
            headers,
            body: formData,
        });
        if (!res.ok) throw new Error('Failed to create item');
        return res.json();
    },

    async deleteItem(id: string) {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/api/items/${id}`, {
            method: 'DELETE',
            headers,
        });
        if (!res.ok) throw new Error('Failed to delete item');
        return res.json();
    },

    // ─── User Items ────────────────────────
    async getUserItems(userId: string) {
        const res = await fetch(`${API_BASE_URL}/api/users/${userId}/items`);
        if (!res.ok) throw new Error('Failed to fetch user items');
        return res.json();
    },

    async getSavedItems(userId: string) {
        const res = await fetch(`${API_BASE_URL}/api/users/${userId}/saved`);
        if (!res.ok) throw new Error('Failed to fetch saved items');
        return res.json();
    },

    async saveItem(userId: string, itemId: number) {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/api/users/${userId}/saved/${itemId}`, {
            method: 'POST',
            headers,
        });
        if (!res.ok) throw new Error('Failed to save item');
        return res.json();
    },

    async unsaveItem(userId: string, itemId: number) {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/api/users/${userId}/saved/${itemId}`, {
            method: 'DELETE',
            headers,
        });
        if (!res.ok) throw new Error('Failed to unsave item');
        return res.json();
    },

    // ─── User Profile ──────────────────────
    async getUserProfile(userId: string) {
        const res = await fetch(`${API_BASE_URL}/api/users/${userId}/profile`);
        if (!res.ok) throw new Error('Failed to fetch profile');
        return res.json();
    },

    async updateUserProfile(userId: string, data: { name?: string; avatar?: string; location_lat?: number; location_lng?: number }) {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/api/users/${userId}/profile`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update profile');
        return res.json();
    },

    // ─── Requests ──────────────────────────
    async createRequest(data: { itemId: number; scheduledTime: string; message?: string }) {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/api/requests`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to create request');
        }
        return res.json();
    },

    async getIncomingRequests() {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/api/requests/incoming`, { headers });
        if (!res.ok) throw new Error('Failed to fetch incoming requests');
        return res.json();
    },

    async getOutgoingRequests() {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/api/requests/outgoing`, { headers });
        if (!res.ok) throw new Error('Failed to fetch outgoing requests');
        return res.json();
    },

    async acceptRequest(requestId: number) {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/api/requests/${requestId}/accept`, {
            method: 'PUT',
            headers,
        });
        if (!res.ok) throw new Error('Failed to accept request');
        return res.json();
    },

    async declineRequest(requestId: number) {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/api/requests/${requestId}/decline`, {
            method: 'PUT',
            headers,
        });
        if (!res.ok) throw new Error('Failed to decline request');
        return res.json();
    },

    // ─── Chat ──────────────────────────────
    async getConversations(userId: string) {
        const res = await fetch(`${API_BASE_URL}/api/conversations/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch conversations');
        return res.json();
    },

    async getMessages(conversationId: string) {
        const res = await fetch(`${API_BASE_URL}/api/messages/${conversationId}`);
        if (!res.ok) throw new Error('Failed to fetch messages');
        return res.json();
    },

    async createConversation(data: any) {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/api/conversations`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create conversation');
        return res.json();
    },

    // ─── Admin ─────────────────────────────
    async getAdminStats() {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/api/admin/stats`, { headers });
        if (!res.ok) throw new Error('Failed to fetch admin stats');
        return res.json();
    },

    async getAdminUsers() {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/api/admin/users`, { headers });
        if (!res.ok) throw new Error('Failed to fetch admin users');
        return res.json();
    },

    async getAdminItems() {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/api/admin/items`, { headers });
        if (!res.ok) throw new Error('Failed to fetch admin items');
        return res.json();
    },

    async getAdminRequests() {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/api/admin/requests`, { headers });
        if (!res.ok) throw new Error('Failed to fetch admin requests');
        return res.json();
    },

    async updateUserRole(userId: string, role: string) {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ role }),
        });
        if (!res.ok) throw new Error('Failed to update user role');
        return res.json();
    },

    async deleteAdminItem(id: string) {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/api/admin/items/${id}`, {
            method: 'DELETE',
            headers,
        });
        if (!res.ok) throw new Error('Failed to delete item');
        return res.json();
    },

    // ─── Helpers ───────────────────────────
    getWebSocketUrl() {
        return WS_URL;
    },

    getImageUrl(path: string) {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${API_BASE_URL}${path}`;
    },

    // ─── Admin Analytics ───────────────────
    async getAdminAnalyticsOverview() {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/api/admin/analytics/overview`, { headers });
        if (!res.ok) throw new Error('Failed to fetch analytics overview');
        return res.json();
    },

    async getAdminAnalyticsCategories() {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/api/admin/analytics/categories`, { headers });
        if (!res.ok) throw new Error('Failed');
        return res.json();
    },

    async getAdminAnalyticsRequestTrends() {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/api/admin/analytics/request-trends`, { headers });
        if (!res.ok) throw new Error('Failed');
        return res.json();
    },

    async getAdminAnalyticsUserGrowth() {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/api/admin/analytics/user-growth`, { headers });
        if (!res.ok) throw new Error('Failed');
        return res.json();
    },

    async getAdminAnalyticsTopItems() {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/api/admin/analytics/top-items`, { headers });
        if (!res.ok) throw new Error('Failed');
        return res.json();
    },

    async getAdminAnalyticsItemTrends() {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/api/admin/analytics/item-trends`, { headers });
        if (!res.ok) throw new Error('Failed');
        return res.json();
    },

    async toggleItemVisibility(id: string, status: string) {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/api/admin/items/${id}/visibility`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error('Failed');
        return res.json();
    },

    async getAdminRequestsFull() {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/api/admin/requests-full`, { headers });
        if (!res.ok) throw new Error('Failed');
        return res.json();
    },

    // ─── Maps Proxy ──────────────────────
    async reverseGeocode(lat: number, lng: number) {
        const res = await fetch(`${API_BASE_URL}/api/maps/reverse-geocode?lat=${lat}&lng=${lng}`);
        if (!res.ok) throw new Error('Failed');
        return res.json();
    },

    async getDistance(originLat: number, originLng: number, destLat: number, destLng: number) {
        const res = await fetch(`${API_BASE_URL}/api/maps/distance?originLat=${originLat}&originLng=${originLng}&destLat=${destLat}&destLng=${destLng}`);
        if (!res.ok) throw new Error('Failed');
        return res.json();
    },

    async getShopsGeoJSON() {
        const res = await fetch(`${API_BASE_URL}/api/maps/shops`);
        if (!res.ok) throw new Error('Failed');
        return res.json();
    },
};
