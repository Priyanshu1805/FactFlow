import { Request, Response } from "express"
import { Ad } from "../models/Ad"

import { getCached, setCached } from "../services/cacheService"

// Get active ads (Public API for AdBanner)
export const getActiveAds = async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = "ads:active"
    const cachedData = await getCached(cacheKey)
    if (cachedData) {
      res.status(200).json({ success: true, data: cachedData })
      return
    }

    const ads = await Ad.find({ isActive: true }).select("-clicks -views -createdBy").sort("-createdAt").lean()
    await setCached(cacheKey, ads, 60 * 5) // Cache for 5 minutes
    
    res.status(200).json({ success: true, data: ads })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

import { AdTracking } from "../models/AdTracking"

// Track view or click (Unique Tracking enforced)
export const trackAdInteraction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { action, firebaseUid } = req.body // 'view' or 'click'
    
    // Determine unique identifier for the user (UID or IP Address)
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || "unknown"
    const identifier = firebaseUid || ip
    
    try {
      // Attempt to record this unique interaction
      await AdTracking.create({ adId: id, action, identifier })
      
      // If successful (no duplicate key error), increment the actual ad stats
      if (action === "view") {
        await Ad.findByIdAndUpdate(id, { $inc: { views: 1 } })
      } else if (action === "click") {
        await Ad.findByIdAndUpdate(id, { $inc: { clicks: 1 } })
      }
    } catch (err: any) {
      // E11000 duplicate key error means this user already viewed/clicked it.
      // We gracefully ignore it so stats don't artificially inflate.
      if (err.code !== 11000) throw err;
    }
    
    res.status(200).json({ success: true })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// --- ADMIN ENDPOINTS ---

export const getAdminAds = async (req: Request, res: Response): Promise<void> => {
  try {
    const ads = await Ad.find().sort("-createdAt").populate("createdBy", "name email")
    res.status(200).json({ success: true, data: ads })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const createAd = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, imageUrl, targetUrl, isActive, expiresAt, cpc, cpm } = req.body
    
    // Auth middleware ensures req.user is populated
    const user = (req as any).user
    
    if (!user || user.role !== "admin") {
      res.status(403).json({ success: false, error: "Not authorized" })
      return
    }

    const ad = await Ad.create({
      title,
      imageUrl,
      targetUrl,
      isActive,
      expiresAt,
      cpc: Number(cpc) || 0,
      cpm: Number(cpm) || 0,
      createdBy: user._id
    })

    res.status(201).json({ success: true, data: ad })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const updateAd = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { title, imageUrl, targetUrl, isActive, expiresAt } = req.body
    
    const user = (req as any).user
    if (!user || user.role !== "admin") {
      res.status(403).json({ success: false, error: "Not authorized" })
      return
    }

    const ad = await Ad.findByIdAndUpdate(id, {
      title, imageUrl, targetUrl, isActive, expiresAt
    }, { new: true })

    res.status(200).json({ success: true, data: ad })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const deleteAd = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    
    const user = (req as any).user
    if (!user || user.role !== "admin") {
      res.status(403).json({ success: false, error: "Not authorized" })
      return
    }

    await Ad.findByIdAndDelete(id)
    res.status(200).json({ success: true })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}
