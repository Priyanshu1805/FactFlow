import express from 'express';
import { LiveChannel } from '../models/LiveChannel';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const channels = await LiveChannel.find().sort({ lastUpdated: -1 });
    res.json({ success: true, channels });
  } catch (error) {
    console.error('Error fetching live channels:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch live channels' });
  }
});

export default router;
