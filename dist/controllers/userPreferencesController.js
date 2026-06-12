"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPreferences = getPreferences;
exports.updatePreferences = updatePreferences;
const UserPreferences_1 = require("../models/UserPreferences");
const DEFAULTS = {
    lang: "en",
    region: "India",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "12-hour",
    theme: "dark",
    fontSize: "medium",
};
async function getPreferences(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, error: "Not authenticated" });
            return;
        }
        const prefs = await UserPreferences_1.UserPreferences.findOne({ userId }).lean();
        if (!prefs) {
            res.json({ success: true, data: { ...DEFAULTS } });
            return;
        }
        res.json({ success: true, data: prefs });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}
async function updatePreferences(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, error: "Not authenticated" });
            return;
        }
        const prefs = await UserPreferences_1.UserPreferences.findOneAndUpdate({ userId }, { $set: req.body }, { upsert: true, new: true });
        res.json({ success: true, data: prefs });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}
//# sourceMappingURL=userPreferencesController.js.map