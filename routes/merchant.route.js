const express = require('express');
const router = express.Router();
const protect = require('../middlewares/protect');
const {
    loginMerchant,
    getMerchantDashboard,
    // updateMerchantProfile,
    getLoyaltySettings,
    updateLoyaltySettings,
    getRewardSettings,
    updateRewardSettings,
    getIdentityAndDesignSettings,
    updateIdentityAndDesignSettings
} = require('../controllers/merchant.controller');


// Auth
router.post('/login', loginMerchant);

// Profile
router.get('/dashboard', protect, getMerchantDashboard);
// router.put('/profile', protect, updateMerchantProfile); 

// Loyalty Settings
router.get('/LoyaltySettings', protect, getLoyaltySettings);
router.put('/LoyaltySettings', protect, updateLoyaltySettings);

// Reward Settings
router.get('/rewardSettings', protect, getRewardSettings);
router.put('/rewardSettings', protect, updateRewardSettings);

// Identity and Design Settings
router.get('/identityAndDesign', protect, getIdentityAndDesignSettings);
router.put('/identityAndDesign', protect, updateIdentityAndDesignSettings);

// notification
router.put('/notifications', protect, updateNotificationsSettings);
module.exports = router;
