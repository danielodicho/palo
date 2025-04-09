const express = require('express');
const router = express.Router();
const axios = require('axios');

// Post to social media via Zapier webhook
router.post('/', async (req, res) => {
  try {
    const { content, platforms, postDate, postTime } = req.body;
    
    const response = await axios.post('https://hooks.zapier.com/hooks/catch/22402606/202waxr/', {
      text: content,
      platform: platforms[0],
      scheduled_date: postDate,
      scheduled_time: postTime
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error posting to social media:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
