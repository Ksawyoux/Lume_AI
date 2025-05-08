import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertEmotionReferenceImageSchema, EmotionType } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Middleware to check if user is authenticated
const requireAuth = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  next();
};

// Get all emotion reference images for the current user
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const images = await storage.getEmotionReferenceImagesByUserId(userId);
    res.json(images);
  } catch (error) {
    console.error('Failed to fetch reference images:', error);
    res.status(500).json({ message: "Failed to fetch reference images" });
  }
});

// Get emotion reference images for a specific emotion
router.get('/emotion/:emotion', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const emotion = req.params.emotion as EmotionType;
    
    // Validate emotion type
    if (!['stressed', 'worried', 'neutral', 'content', 'happy'].includes(emotion)) {
      return res.status(400).json({ message: "Invalid emotion type" });
    }
    
    const images = await storage.getEmotionReferenceImagesByEmotion(userId, emotion);
    res.json(images);
  } catch (error) {
    console.error('Failed to fetch reference images by emotion:', error);
    res.status(500).json({ message: "Failed to fetch reference images" });
  }
});

// Create a new emotion reference image
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Create a schema with the required userId
    const createSchema = insertEmotionReferenceImageSchema.extend({
      userId: z.number().default(userId)
    });
    
    // Parse and validate the request body
    const validatedData = createSchema.parse({
      ...req.body,
      userId
    });
    
    // Create the reference image
    const newImage = await storage.createEmotionReferenceImage(validatedData);
    res.status(201).json(newImage);
  } catch (error) {
    console.error('Failed to create reference image:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create reference image" });
  }
});

// Delete an emotion reference image
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const imageId = parseInt(req.params.id);
    
    if (isNaN(imageId)) {
      return res.status(400).json({ message: "Invalid image ID" });
    }
    
    // Check if the image exists and belongs to the user
    const image = await storage.getEmotionReferenceImageById(imageId);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }
    
    if (image.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this image" });
    }
    
    // Delete the image
    const deleted = await storage.deleteEmotionReferenceImage(imageId);
    if (deleted) {
      res.status(200).json({ message: "Image deleted successfully" });
    } else {
      res.status(500).json({ message: "Failed to delete image" });
    }
  } catch (error) {
    console.error('Failed to delete reference image:', error);
    res.status(500).json({ message: "Failed to delete reference image" });
  }
});

// Find closest emotion match from an uploaded image
router.post('/analyze', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { imageData } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ message: "Image data is required" });
    }
    
    // Find the most similar emotion
    const result = await storage.findMostSimilarEmotionFromImage(userId, imageData);
    res.json(result);
  } catch (error) {
    console.error('Failed to analyze image:', error);
    res.status(500).json({ message: "Failed to analyze facial expression. Please try again." });
  }
});

export default router;