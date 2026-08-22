// middleware/activityMonitor.js
const AnalyticsModel = require('../models/analyticsModel');

const activityMonitor = async (req, res, next) => {
    // Skip static files + health checks
    if (
        /\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json)$/i.test(req.originalUrl) ||
        req.originalUrl.includes('/health') ||
        req.originalUrl.includes('/favicon')
    ) {
        return next();
    }

    const detectActivityType = (req) => {
        const method = req.method.toUpperCase();
        const path = req.originalUrl.toLowerCase().split('?')[0];

        // POST actions
        if (method === 'POST') {
            if (path.includes('login')) return 'LOGIN';
            if (path.includes('logout')) return 'LOGOUT';
            if (path.includes('register')) return 'REGISTER';
            return 'CREATE';
        }

        if (method === 'PUT' || method === 'PATCH') return 'UPDATE';
        if (method === 'DELETE') return 'DELETE';

        // GET semantic actions
        if (path.includes('login')) return 'LOGIN_PAGE_VIEW';
        if (path.includes('register')) return 'REGISTER_PAGE_VIEW';
        if (path.includes('dashboard')) return 'DASHBOARD_VIEW';
        if (path.includes('profile')) return 'PROFILE_VIEW';
        if (path.includes('settings')) return 'SETTINGS_VIEW';
        if (path.includes('create') || path.includes('new') || path.includes('add'))
            return 'CREATE_PAGE_VIEW';

        if (path === '/' || path.includes('home'))
            return 'HOME_PAGE_VIEW';

        return 'PAGE_VISIT';
    };

    const activityType = detectActivityType(req);
    const details = `${activityType}: ${req.method} ${req.originalUrl}`;

    // Fire & forget to avoid blocking request
    AnalyticsModel.saveUserActivity(req, activityType, details)
        .catch(err => console.error('Analytics error:'));

    next();
};

module.exports = activityMonitor;