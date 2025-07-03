const Merchant = require('../models/merchant.model');
const Customer = require('../models/customer.model');
const CustomerLoyaltyActivity = require('../models/customerLoyalityActivitySchema.model');

// Utility to calculate purchase points
const calculatePurchasePoints = (amount, pointsPerCurrencyUnit) => {
    return Math.floor(amount / pointsPerCurrencyUnit);
};

// Reusable function to award points and save log
const awardPoints = async ({ merchant, customerId, points, event, metadata = {} }) => {
    const customer = await Customer.findOne({ _id: customerId, merchant: merchant._id });
    if (!customer) return;

    customer.points += points;
    merchant.customersPoints = (merchant.customersPoints || 0) + points; // Update total points for the merchant
    await customer.save();
    await merchant.save();

    await CustomerLoyaltyActivity.create({
        customerId,
        merchantId,
        event,
        points,
        metadata,
        createdAt: new Date()
    });

    console.log(`\n${points} points awarded to customer ${customerId} for ${event}\n`);
};

// Main engine to process events
const LoyaltyEngine = {
    async processEvent({ event, customerId, merchantId, data = {} }) {
        const merchant = await Merchant.findById(merchantId);
        if (!merchant || !merchant.loyaltySettings) return;

        const loyalty = merchant.loyaltySettings;

        switch (event) {
            case 'purchase':
                if (loyalty.purchasePoints?.enabled) {
                    const amount = data.amount || 0;
                    const points = calculatePurchasePoints(amount, loyalty.pointsPerCurrencyUnit || 1);
                    if (points > 0) {
                        await awardPoints({ customerId, merchantId, points, event: 'purchase', metadata: { amount, orderId: data.orderId } });
                    }
                }

                if (loyalty.purchaseAmountThresholdPoints?.enabled) {
                    const thresholdAmount = loyalty.purchaseAmountThresholdPoints.thresholdAmount;
                    if (data.amount >= thresholdAmount) {
                        await awardPoints({
                            merchant,
                            customerId,
                            merchantId,
                            points: loyalty.purchaseAmountThresholdPoints.points,
                            event: 'purchaseThreshold',
                            metadata: { amount: data.amount, orderId: data.orderId }
                        });
                    }
                }
                break;

            case 'feedback':
                if (loyalty.feedbackShippingPoints?.enabled) {
                    await awardPoints({ customerId, merchantId, points: loyalty.feedbackShippingPoints.points, event: 'feedback', metadata: data });
                }
                break;

            case 'birthday':
                if (loyalty.birthdayPoints?.enabled) {
                    await awardPoints({ customerId, merchantId, points: loyalty.birthdayPoints.points, event: 'birthday', metadata: data });
                }
                break;

            case 'rating':
                if (loyalty.ratingAppPoints?.enabled) {
                    await awardPoints({ customerId, merchantId, points: loyalty.ratingAppPoints.points, event: 'rating', metadata: data });
                }
                break;

            case 'profileCompletion':
                if (loyalty.profileCompletionPoints?.enabled) {
                    await awardPoints({ customerId, merchantId, points: loyalty.profileCompletionPoints.points, event: 'profileCompletion', metadata: data });
                }
                break;

            case 'repeatPurchase':
                if (loyalty.repeatPurchasePoints?.enabled) {
                    await awardPoints({ customerId, merchantId, points: loyalty.repeatPurchasePoints.points, event: 'repeatPurchase', metadata: data });
                }
                break;

            case 'welcome':
                if (loyalty.welcomePoints?.enabled) {
                    await awardPoints({ customerId, merchantId, points: loyalty.welcomePoints.points, event: 'welcome', metadata: data });
                }
                break;

            case 'installApp':
                if (loyalty.installAppPoints?.enabled) {
                    await awardPoints({ customerId, merchantId, points: loyalty.installAppPoints.points, event: 'installApp', metadata: data });
                }
                break;

            case 'shareReferral':
                if (loyalty.shareReferralPoints?.enabled) {
                    await awardPoints({ customerId, merchantId, points: loyalty.shareReferralPoints.points, event: 'shareReferral', metadata: data });
                }
                break;

            default:
                console.log(`\n\nUnknown event: ${event}\n\n`);
        }
    }
};

// Wrapper function to match the interface used in controllers
const loyaltyEngineWrapper = async ({ event, merchant, customer, metadata = {} }) => {
    return await LoyaltyEngine.processEvent({
        event,
        customerId: customer._id,
        merchantId: merchant._id,
        data: metadata
    });
};

module.exports = loyaltyEngineWrapper;