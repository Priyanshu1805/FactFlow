"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const server_1 = require("../server");
const User_1 = require("../models/User");
const History_1 = require("../models/History");
const Comment_1 = require("../models/Comment");
const NewsArticle_1 = require("../models/NewsArticle");
describe("Privacy Settings API Integration Tests", () => {
    let testUser;
    let testArticle;
    let dbUrl = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/factflow_test";
    beforeAll(async () => {
        // Connect to database if not already connected
        if (mongoose_1.default.connection.readyState === 0) {
            await mongoose_1.default.connect(dbUrl);
        }
        // Clean up
        await User_1.User.deleteMany({ email: "privacytest@factflow.app" });
        await NewsArticle_1.NewsArticle.deleteMany({ title: "Privacy Test Article" });
        await Comment_1.Comment.deleteMany({ text: { $regex: "Privacy Test Comment" } });
        // Create a test user
        testUser = await User_1.User.create({
            firebaseUid: "firebase_test_privacy_123",
            username: "privacytester",
            name: "Privacy Tester",
            email: "privacytest@factflow.app",
            role: "viewer",
            settings: {
                privacy: {
                    profileVisibility: "public",
                    incognitoMode: false,
                    anonymousFactCheck: false,
                    hideLiveStatus: false,
                    blurGraphicImagery: false,
                    commentVisibility: "public",
                    allowAITraining: true
                }
            }
        });
        // Create a mock news article
        testArticle = await NewsArticle_1.NewsArticle.create({
            title: "Privacy Test Article",
            excerpt: "Testing advanced privacy settings logic.",
            content: "This is a full test content for checking how privacy controls are wired.",
            category: "Technology",
            image: "https://example.com/test.jpg"
        });
    });
    afterAll(async () => {
        // Clean up
        await User_1.User.deleteMany({ email: "privacytest@factflow.app" });
        await NewsArticle_1.NewsArticle.deleteMany({ title: "Privacy Test Article" });
        await Comment_1.Comment.deleteMany({ text: { $regex: "Privacy Test Comment" } });
        await History_1.History.deleteMany({ user: testUser._id });
        await mongoose_1.default.connection.close();
    });
    describe("Incognito News Mode", () => {
        it("should log read history when incognitoMode is disabled", async () => {
            // Ensure incognitoMode is disabled
            testUser.settings.privacy.incognitoMode = false;
            await testUser.save();
            // Clean history for the user
            await History_1.History.deleteMany({ user: testUser._id });
            const res = await (0, supertest_1.default)(server_1.app)
                .post("/api/users/history")
                .send({
                firebaseUid: testUser.firebaseUid,
                itemId: testArticle._id.toString(),
                itemType: "post",
                category: testArticle.category,
                engagement: "viewed"
            });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.historyItem).not.toBeNull();
            // Double-check in database
            const dbHistory = await History_1.History.findOne({ user: testUser._id, itemId: testArticle._id });
            expect(dbHistory).not.toBeNull();
        });
        it("should skip logging read history when incognitoMode is enabled", async () => {
            // Enable incognitoMode
            testUser.settings.privacy.incognitoMode = true;
            await testUser.save();
            // Clean history for the user
            await History_1.History.deleteMany({ user: testUser._id });
            const res = await (0, supertest_1.default)(server_1.app)
                .post("/api/users/history")
                .send({
                firebaseUid: testUser.firebaseUid,
                itemId: testArticle._id.toString(),
                itemType: "post",
                category: testArticle.category,
                engagement: "viewed"
            });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.historyItem).toBeNull();
            expect(res.body.message).toContain("Incognito mode active");
            // Verify nothing in database
            const dbHistory = await History_1.History.findOne({ user: testUser._id, itemId: testArticle._id });
            expect(dbHistory).toBeNull();
        });
    });
    describe("Anonymous Fact Checking", () => {
        let testComment;
        beforeEach(async () => {
            // Create a new comment to test fact checks on
            testComment = await Comment_1.Comment.create({
                articleId: testArticle._id,
                text: "Privacy Test Comment containing verified claim.",
                authorName: testUser.name,
                authorId: testUser._id
            });
        });
        afterEach(async () => {
            if (testComment) {
                await Comment_1.Comment.deleteOne({ _id: testComment._id });
            }
        });
        it("should show username as requester when anonymousFactCheck is disabled", async () => {
            // Disable anonymousFactCheck
            testUser.settings.privacy.anonymousFactCheck = false;
            await testUser.save();
            const res = await (0, supertest_1.default)(server_1.app)
                .post(`/api/comments/${testComment._id}/factcheck`)
                .send({
                userId: testUser._id.toString(),
                firebaseUid: testUser.firebaseUid
            });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.factCheck.requestedBy).toBe(`@${testUser.username}`);
        });
        it("should display requester as Anonymous when anonymousFactCheck is enabled", async () => {
            // Enable anonymousFactCheck
            testUser.settings.privacy.anonymousFactCheck = true;
            await testUser.save();
            const res = await (0, supertest_1.default)(server_1.app)
                .post(`/api/comments/${testComment._id}/factcheck`)
                .send({
                userId: testUser._id.toString(),
                firebaseUid: testUser.firebaseUid
            });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.factCheck.requestedBy).toBe("Anonymous");
        });
    });
    describe("Data Management Controls", () => {
        beforeEach(async () => {
            // Seed some history logs
            await History_1.History.create({
                user: testUser._id,
                itemId: testArticle._id,
                itemType: "post",
                category: "Technology",
                timestamp: new Date()
            });
        });
        it("should clear reading history on DELETE /api/users/history", async () => {
            // Check history exists
            let count = await History_1.History.countDocuments({ user: testUser._id });
            expect(count).toBeGreaterThan(0);
            const res = await (0, supertest_1.default)(server_1.app)
                .delete("/api/users/history")
                .send({ firebaseUid: testUser.firebaseUid });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            // Check history is empty
            count = await History_1.History.countDocuments({ user: testUser._id });
            expect(count).toBe(0);
        });
        it("should export all user data on GET /api/users/export-data", async () => {
            const res = await (0, supertest_1.default)(server_1.app)
                .get(`/api/users/export-data?firebaseUid=${testUser.firebaseUid}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.profile.email).toBe(testUser.email);
            expect(res.body.data.historyCount).toBeGreaterThan(0);
            expect(res.body.data.history[0].itemId).toBe(testArticle._id.toString());
        });
    });
});
//# sourceMappingURL=privacy.test.js.map