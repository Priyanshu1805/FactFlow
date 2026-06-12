import { Router, Request, Response } from "express"
import { User } from "../models/User"
import { NewsArticle } from "../models/NewsArticle"
import { Payment } from "../models/Payment"
import { Subscription } from "../models/Subscription"
import { Report } from "../models/Report"

const router = Router()

// GET /api/admin-dashboard/stats
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalNews = await NewsArticle.countDocuments()
    
    // Calculate total revenue from Payments
    // Depending on schema, we sum up 'amount' or 'amountPaid'
    const payments = await Payment.find({})
    const totalRevenue = payments.reduce((acc, p: any) => acc + (p.amount || 0), 0)

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalNews,
        totalRevenue
      }
    })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

import { Ad } from "../models/Ad"

// GET /api/admin-dashboard/revenue
router.get("/revenue", async (req: Request, res: Response) => {
  try {
    // Fetch latest payments
    const latestPayments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    const ads = await Ad.find().lean()
    let totalAdViews = 0
    let totalAdClicks = 0
    let customAdRevenue = 0
    
    ads.forEach((ad: any) => {
      totalAdViews += (ad.views || 0)
      totalAdClicks += (ad.clicks || 0)
      
      const adCpc = Number(ad.cpc) || 0
      const adCpm = Number(ad.cpm) || 0
      customAdRevenue += (ad.clicks * adCpc) + ((ad.views / 1000) * adCpm)
    })

    res.json({ 
      success: true, 
      data: latestPayments,
      adStats: {
        totalViews: totalAdViews,
        totalClicks: totalAdClicks,
        estimatedCustomRevenue: customAdRevenue,
        estimatedAdSenseRevenue: ((totalAdViews * 2.5) / 1000) * 40
      }
    })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/admin-dashboard/moderation
router.get("/moderation", async (req: Request, res: Response) => {
  try {
    const pendingReports = await Report.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    res.json({ success: true, data: pendingReports })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/admin-dashboard/verification-requests
router.get("/verification-requests", async (req: Request, res: Response) => {
  try {
    const pendingRequests = await User.find({ verificationStatus: "pending" })
      .select("_id username name email avatar bio followers createdAt")
      .sort({ updatedAt: -1 })
      .lean()

    res.json({ success: true, data: pendingRequests })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /api/admin-dashboard/moderation/:id
router.put("/moderation/:id", async (req: Request, res: Response) => {
  try {
    const { action } = req.body // "dismiss" or "resolve"
    const status = action === "dismiss" ? "dismissed" : "resolved"
    
    const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true })
    if (!report) return res.status(404).json({ success: false, error: "Report not found" })

    res.json({ success: true, data: report })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
