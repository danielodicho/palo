const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Create drafts directory if it doesn't exist
const draftsDir = path.join(__dirname, '..', 'data', 'drafts');
if (!fs.existsSync(draftsDir)) {
  fs.mkdirSync(draftsDir, { recursive: true });
}

// File to store drafts
const draftsFile = path.join(draftsDir, 'drafts.json');

// Initialize drafts file if it doesn't exist
if (!fs.existsSync(draftsFile)) {
  fs.writeFileSync(draftsFile, JSON.stringify([], null, 2));
}

// Helper function to read drafts
const readDrafts = () => {
  try {
    const data = fs.readFileSync(draftsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading drafts file:', error);
    return [];
  }
};

// Helper function to write drafts
const writeDrafts = (drafts) => {
  try {
    fs.writeFileSync(draftsFile, JSON.stringify(drafts, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing to drafts file:', error);
    return false;
  }
};

// Get all drafts
router.get('/', (req, res) => {
  try {
    const drafts = readDrafts();
    res.json({ success: true, drafts });
  } catch (error) {
    console.error('Error fetching drafts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch drafts' });
  }
});

// Get a specific draft
router.get('/:id', (req, res) => {
  try {
    const drafts = readDrafts();
    const draft = drafts.find(d => d.id === req.params.id);
    
    if (!draft) {
      return res.status(404).json({ success: false, error: 'Draft not found' });
    }
    
    res.json({ success: true, draft });
  } catch (error) {
    console.error('Error fetching draft:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch draft' });
  }
});

// Save a new draft
router.post('/', (req, res) => {
  try {
    const { content, platforms } = req.body;
    
    if (!content) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }
    
    const drafts = readDrafts();
    const newDraft = {
      id: Date.now().toString(),
      content,
      platforms: platforms || ['linkedin'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    drafts.push(newDraft);
    
    if (writeDrafts(drafts)) {
      res.json({ success: true, draft: newDraft });
    } else {
      res.status(500).json({ success: false, error: 'Failed to save draft' });
    }
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({ success: false, error: 'Failed to save draft' });
  }
});

// Update a draft
router.put('/:id', (req, res) => {
  try {
    const { content, platforms } = req.body;
    const drafts = readDrafts();
    const index = drafts.findIndex(d => d.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Draft not found' });
    }
    
    drafts[index] = {
      ...drafts[index],
      content: content || drafts[index].content,
      platforms: platforms || drafts[index].platforms,
      updatedAt: new Date().toISOString()
    };
    
    if (writeDrafts(drafts)) {
      res.json({ success: true, draft: drafts[index] });
    } else {
      res.status(500).json({ success: false, error: 'Failed to update draft' });
    }
  } catch (error) {
    console.error('Error updating draft:', error);
    res.status(500).json({ success: false, error: 'Failed to update draft' });
  }
});

// Delete a draft
router.delete('/:id', (req, res) => {
  try {
    const drafts = readDrafts();
    const filteredDrafts = drafts.filter(d => d.id !== req.params.id);
    
    if (drafts.length === filteredDrafts.length) {
      return res.status(404).json({ success: false, error: 'Draft not found' });
    }
    
    if (writeDrafts(filteredDrafts)) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, error: 'Failed to delete draft' });
    }
  } catch (error) {
    console.error('Error deleting draft:', error);
    res.status(500).json({ success: false, error: 'Failed to delete draft' });
  }
});

module.exports = router;
