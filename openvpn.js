const axios = require('axios');

const API_URL = 'infinitywaveinc.api.openvpn.com/';
const API_KEY = 'iupdNSjo6XRzwNjzFhaJU55gzf1Z70b8.infinitywaveinc';
const SECRET_KEY = 'qzCtr3hfeEfNnc8qRinyIg94OsrgpLIOE5mwYQlS7t4WvgModivDSHQeQ9PxUefi';

const getVpnCredentials = async () => {
    try {
        // Authenticate with the API
        const authResponse = await axios.post(`${API_URL}/auth/login`, {
            apiKey: API_KEY,
            secretKey: SECRET_KEY,
        });

        const token = authResponse.data.token;

        // Create a VPN session
        const sessionResponse = await axios.post(`${API_URL}/sessions`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const vpnCredentials = sessionResponse.data;

        return vpnCredentials;
    } catch (error) {
        console.error('Error creating VPN session:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
};

module.exports = { getVpnCredentials };
