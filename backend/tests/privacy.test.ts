import request from "supertest"
import mongoose from "mongoose"
import { app } from "../server"
import { User } from "../models/User"
import { History } from "../models/History"
import { Comment } from "../models/Comment"
import { NewsArticle } from "../models/NewsArticle"

describe("Privacy Settings API Integration Tests", () => {
  let testUser: any
  let testArticle: any
  let dbUrl = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/factflow_test"

  beforeAll(async () => {
    // Connect to database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(dbUrl)
    }

    // Clean up
    await User.deleteMany({ email: "privacytest@factflow.app" })
    await NewsArticle.deleteMany({ title: "Privacy Test Article" })
    await Comment.deleteMany({ text: { $regex: "Privacy Test Comment" } })

    // Create a test user
    testUser = await User.create({
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
    })

    // Create a mock news article
    testArticle = await NewsArticle.create({
      title: "Privacy Test Article",
      excerpt: "Testing advanced privacy settings logic.",
      content: "This is a full test content for checking how privacy controls are wired.",
      category: "Technology",
      image: "https://example.com/test.jpg"
    })
  })

  afterAll(async () => {
    // Clean up
    await User.deleteMany({ email: "privacytest@factflow.app" })
    await NewsArticle.deleteMany({ title: "Privacy Test Article" })
    await Comment.deleteMany({ text: { $regex: "Privacy Test Comment" } })
    await History.deleteMany({ user: testUser._id })
    await mongoose.connection.close()
  })

  describe("Incognito News Mode", () => {
    it("should log read history when incognitoMode is disabled", async () => {
      // Ensure incognitoMode is disabled
      testUser.settings.privacy.incognitoMode = false
      await testUser.save()

      // Clean history for the user
      await History.deleteMany({ user: testUser._id })

      const res = await request(app)
        .post("/api/users/history")
        .send({
          firebaseUid: testUser.firebaseUid,
          itemId: testArticle._id.toString(),
          itemType: "post",
          category: testArticle.category,
          engagement: "viewed"
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.historyItem).not.toBeNull()

      // Double-check in database
      const dbHistory = await History.findOne({ user: testUser._id, itemId: testArticle._id })
      expect(dbHistory).not.toBeNull()
    })

    it("should skip logging read history when incognitoMode is enabled", async () => {
      // Enable incognitoMode
      testUser.settings.privacy.incognitoMode = true
      await testUser.save()

      // Clean history for the user
      await History.deleteMany({ user: testUser._id })

      const res = await request(app)
        .post("/api/users/history")
        .send({
          firebaseUid: testUser.firebaseUid,
          itemId: testArticle._id.toString(),
          itemType: "post",
          category: testArticle.category,
          engagement: "viewed"
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.historyItem).toBeNull()
      expect(res.body.message).toContain("Incognito mode active")

      // Verify nothing in database
      const dbHistory = await History.findOne({ user: testUser._id, itemId: testArticle._id })
      expect(dbHistory).toBeNull()
    })
  })

  describe("Anonymous Fact Checking", () => {
    let testComment: any

    beforeEach(async () => {
      // Create a new comment to test fact checks on
      testComment = await Comment.create({
        articleId: testArticle._id,
        text: "Privacy Test Comment containing verified claim.",
        authorName: testUser.name,
        authorId: testUser._id
      })
    })

    afterEach(async () => {
      if (testComment) {
        await Comment.deleteOne({ _id: testComment._id })
      }
    })

    it("should show username as requester when anonymousFactCheck is disabled", async () => {
      // Disable anonymousFactCheck
      testUser.settings.privacy.anonymousFactCheck = false
      await testUser.save()

      const res = await request(app)
        .post(`/api/comments/${testComment._id}/factcheck`)
        .send({
          userId: testUser._id.toString(),
          firebaseUid: testUser.firebaseUid
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.factCheck.requestedBy).toBe(`@${testUser.username}`)
    })

    it("should display requester as Anonymous when anonymousFactCheck is enabled", async () => {
      // Enable anonymousFactCheck
      testUser.settings.privacy.anonymousFactCheck = true
      await testUser.save()

      const res = await request(app)
        .post(`/api/comments/${testComment._id}/factcheck`)
        .send({
          userId: testUser._id.toString(),
          firebaseUid: testUser.firebaseUid
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.factCheck.requestedBy).toBe("Anonymous")
    })
  })

  describe("Data Management Controls", () => {
    beforeEach(async () => {
      // Seed some history logs
      await History.create({
        user: testUser._id,
        itemId: testArticle._id,
        itemType: "post",
        category: "Technology",
        timestamp: new Date()
      })
    })

    it("should clear reading history on DELETE /api/users/history", async () => {
      // Check history exists
      let count = await History.countDocuments({ user: testUser._id })
      expect(count).toBeGreaterThan(0)

      const res = await request(app)
        .delete("/api/users/history")
        .send({ firebaseUid: testUser.firebaseUid })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)

      // Check history is empty
      count = await History.countDocuments({ user: testUser._id })
      expect(count).toBe(0)
    })

    it("should export all user data on GET /api/users/export-data", async () => {
      const res = await request(app)
        .get(`/api/users/export-data?firebaseUid=${testUser.firebaseUid}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.profile.email).toBe(testUser.email)
      expect(res.body.data.historyCount).toBeGreaterThan(0)
      expect(res.body.data.history[0].itemId).toBe(testArticle._id.toString())
    })
  })
})
