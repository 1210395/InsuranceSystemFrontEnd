import { useState, useCallback, useEffect } from 'react';
import { getToken } from '../utils/apiService';
import { API_BASE_URL } from '../config/api';

/**
 * Custom hook for user profile state management
 * Consolidates user info, profile image, and related state
 */
export const useUserProfile = (storageKey, initialRoles = []) => {
  const token = getToken();

  const [userInfo, setUserInfo] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : { fullName: 'User', roles: initialRoles };
    } catch {
      return { fullName: 'User', roles: initialRoles };
    }
  });

  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const getImagePath = useCallback((userData) => {
    if (!userData) return null;
    const imgPath = userData.universityCardImage ||
      (userData.universityCardImages?.length > 0
        ? userData.universityCardImages[userData.universityCardImages.length - 1]
        : null);
    if (!imgPath) return null;
    const fullPath = imgPath.startsWith('http') ? imgPath : `${API_BASE_URL}${imgPath}`;
    return `${fullPath}?t=${Date.now()}`;
  }, []);

  const updateUserInfo = useCallback((data) => {
    setUserInfo(data);
    localStorage.setItem(storageKey, JSON.stringify(data));
    const imgPath = getImagePath(data);
    if (imgPath) setProfileImage(imgPath);
  }, [storageKey, getImagePath]);

  useEffect(() => {
    const imgPath = getImagePath(userInfo);
    if (imgPath) setProfileImage(imgPath);
  }, [userInfo, getImagePath]);

  return {
    token,
    userInfo,
    setUserInfo: updateUserInfo,
    profileImage,
    setProfileImage,
    loading,
    setLoading
  };
};

export default useUserProfile;
