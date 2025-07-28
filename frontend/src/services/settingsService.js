import api from './api';

/**
 * Fetch loyalty settings from backend
 */
export const getLoyaltySettings = async () => {
  try {
    const response = await api.get('/merchant/LoyaltySettings');
    return response.data;
  } catch (error) {
    console.error('Error fetching loyalty settings:', error);
    throw error;
  }
};

/**
 * Update loyalty settings in backend
 */
export const updateLoyaltySettings = async (settings) => {
  try {
    const response = await api.put('/merchant/LoyaltySettings', settings);
    return response.data;
  } catch (error) {
    console.error('Error updating loyalty settings:', error);
    throw error;
  }
};

/**
 * Update notification settings
 */
export const updateNotificationSettings = async (settings) => {
  try {
    const response = await api.put('/notification/settings', settings);
    return response.data;
  } catch (error) {
    console.error('Error updating notification settings:', error);
    throw error;
  }
};

/**
 * Update merchant profile settings
 */
export const updateProfileSettings = async (profileData) => {
  try {
    const response = await api.put('/merchant/profile', {
      merchantName: profileData.name,
      installerEmail: profileData.email,
      installerMobile: profileData.phone,
      merchantDomain: profileData.website
    });
    return response.data;
  } catch (error) {
    console.error('Error updating profile settings:', error);
    throw error;
  }
};

/**
 * Update appearance settings
 */
export const updateAppearanceSettings = async (settings) => {
  try {
    const response = await api.put('/merchant/identityAndDesign', settings);
    console.log("Appearance settings updated:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating appearance settings:', error);
    throw error;
  }
};

/**
 * GET identity and design settings
 * @param {void}
 * @returns {Promise<Object>} - The identity and design settings
 * @throws {Error} - If the request fails
 */

export const getAppearanceSettings = async () => {
  try {
    const response = await api.get('/merchant/identityAndDesign');
    console.log("Appearance settings fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching identity and design settings:', error);
    throw error;
  }
};

/**
 * Update security settings
 */
export const updateSecuritySettings = async (settings) => {
  try {
    const response = await api.put('/merchant/security', settings);
    return response.data;
  } catch (error) {
    console.error('Error updating security settings:', error);
    throw error;
  }
};

/**
 * Get all rewards/coupons for settings management
 */
export const getRewards = async () => {
  try {
    const response = await api.get('/reward');
    return response.data;
  } catch (error) {
    console.error('Error fetching rewards:', error);
    throw error;
  }
};

/**
 * Create a new reward/coupon
 */
export const createReward = async (rewardData) => {
  try {
    const response = await api.post('/reward', rewardData);
    return response.data;
  } catch (error) {
    console.error('Error creating reward:', error);
    throw error;
  }
};

/**
 * Update an existing reward/coupon
 */
export const updateReward = async (rewardId, rewardData) => {
  try {
    const response = await api.put(`/reward/${rewardId}`, rewardData);
    return response.data;
  } catch (error) {
    console.error('Error updating reward:', error);
    throw error;
  }
};

/**
 * Delete a reward/coupon
 */
export const deleteReward = async (rewardId) => {
  try {
    const response = await api.delete(`/reward/${rewardId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting reward:', error);
    throw error;
  }
};

/**
 * Get all coupons for the merchant
 */
export const getCoupons = async (params = {}) => {
  console.log("Fetching coupons with params:", params);
  try {
    console.log("Fetching coupons from:", '/reward/merchant/coupons');
    const response = await api.get('/reward/merchant/coupons', { params });
    console.log("Coupons response:", response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching coupons:', error);
    throw error;
  }
};

/**
 * Get coupons for a specific customer
 */
export const getCustomerCoupons = async (customerId) => {
  try {
    const response = await api.get(`/reward/customer/${customerId}/coupons`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customer coupons:', error);
    throw error;
  }
};

/**
 * Redeem a coupon
 */
export const redeemCoupon = async (couponId, orderId = null) => {
  try {
    const response = await api.post('/reward/redeem', {
      couponId,
      orderId
    });
    return response.data;
  } catch (error) {
    console.error('Error redeeming coupon:', error);
    throw error;
  }
}; 