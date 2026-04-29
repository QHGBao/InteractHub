import axiosInstance from './axiosInstance';

export const getFriends     = () => axiosInstance.get('/friend/list');
export const getRequests    = () => axiosInstance.get('/friend/requests');
export const getSuggestions = () => axiosInstance.get('/friend/suggestions');

export const sendRequest  = (addresseeId) => 
    axiosInstance.post('/friend/request', { addresseeId });

export const acceptFriend = (friendshipId) => 
    axiosInstance.put(`/friend/accept/${friendshipId}`);

export const rejectFriend = (friendshipId) => 
    axiosInstance.delete(`/friend/reject/${friendshipId}`);

export const unfriend     = (friendId) => 
    axiosInstance.delete(`/friend/unfriend/${friendId}`);