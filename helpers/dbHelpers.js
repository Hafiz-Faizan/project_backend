// helpers/dbHelpers.js
const TrafficData = require('../models/trafficData');

const storeTrafficData = async ({ userId, keyword, website, country, rank = null, hits = 0 }) => {
    try {
        const trafficData = new TrafficData({ userId, keyword, website, country, rank, hits });
        await trafficData.save();
        console.log('Successfully stored traffic data');
    } catch (error) {
        console.error('Error storing traffic data:', error);
    }
};

const updateTrafficDataHits = async (userId, hits) => {
    try {
        const trafficData = await TrafficData.findOne({ userId });
        if (trafficData) {
            trafficData.hits += hits;
            const currentDate = new Date().toISOString().split('T')[0];
            trafficData.hitsByDate.set(currentDate, (trafficData.hitsByDate.get(currentDate) || 0) + hits);
            await trafficData.save();
            console.log('Successfully updated traffic hits');
        } else {
            console.log('Traffic data not found for user');
        }
    } catch (error) {
        console.error('Error updating traffic hits:', error);
    }
};

const updateTrafficDataRank = async (userId, rank) => {
    try {
        const trafficData = await TrafficData.findOne({ userId });
        if (trafficData) {
            trafficData.rank = rank;
            await trafficData.save();
            console.log('Successfully updated traffic rank');
        } else {
            console.log('Traffic data not found for user');
        }
    } catch (error) {
        console.error('Error updating traffic rank:', error);
    }
};

module.exports = {
    storeTrafficData,
    updateTrafficDataHits,
    updateTrafficDataRank
};
