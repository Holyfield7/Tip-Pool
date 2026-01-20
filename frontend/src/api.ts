import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export interface User {
    id: number;
    name: string;
    email: string;
    wallet_balance?: number;
}

export const api = {
    // Users
    createUser: async (name: string, email: string) => {
        const response = await axios.post(`${API_URL}/users`, { name, email });
        return response.data;
    },

    // Wallets
    getBalance: async (userId: number) => {
        const response = await axios.get(`${API_URL}/wallets/${userId}`);
        return response.data;
    },

    creditWallet: async (userId: number, amount: number) => {
        const response = await axios.post(`${API_URL}/wallets/credit`, { user_id: userId, amount });
        return response.data;
    },

    // Tips
    sendTip: async (fromUserId: number, toUserId: number, amount: number) => {
        const response = await axios.post(`${API_URL}/tips`, {
            from_user_id: fromUserId,
            to_user_id: toUserId,
            amount
        });
        return response.data;
    }
};
