import type { Express } from "express";
import { eq, desc, sql, and, ilike, or } from "drizzle-orm";
import { db } from "../db";
import { 
  communityPosts, 
  communityComments, 
  communityPostLikes, 
  communityCommentLikes,
  users,
  insertCommunityPostSchema,
  insertCommunityCommentSchema,
  type CommunityPost,
  type User
} from "@shared/schema";
import { requireAuth } from "../middleware/auth";
import rateLimit from "express-rate-limit";

// Rate limiting for community actions
const communityRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs
  message: "Too many community requests from this IP, please try again later.",
});

const postRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 posts per hour
  message: "You can only create 10 posts per hour. Please try again later.",
});

interface CommunityPostWithUser extends CommunityPost {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
  } | null;
  isLiked?: boolean;
}

export function registerCommunityRoutes(app: Express) {
  
  // Get community posts with filters and pagination
  app.get('/api/community/posts', communityRateLimit, requireAuth, async (req, res) => {
    try {
      const { 
        category = 'all',
        sort = 'recent',
        search = '',
        page = '1',
        limit = '20'
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      // Build the base query
      let whereConditions = [
        eq(communityPosts.isActive, true),
        eq(communityPosts.isModerated, true)
      ];

      // Apply category filter
      if (category !== 'all') {
        whereConditions.push(eq(communityPosts.category, category as any));
      }

      // Apply search filter
      if (search) {
        whereConditions.push(
          or(
            ilike(communityPosts.title, `%${search}%`),
            ilike(communityPosts.content, `%${search}%`),
            ilike(communityPosts.plantSpecies, `%${search}%`)
          )
        );
      }

      let query = db
        .select({
          id: communityPosts.id,
          userId: communityPosts.userId,
          title: communityPosts.title,
          content: communityPosts.content,
          category: communityPosts.category,
          tags: communityPosts.tags,
          imageUrl: communityPosts.imageUrl,
          location: communityPosts.location,
          telegramId: communityPosts.telegramId,
          emailContact: communityPosts.emailContact,
          isBarterPost: communityPosts.isBarterPost,
          barterType: communityPosts.barterType,
          plantSpecies: communityPosts.plantSpecies,
          isActive: communityPosts.isActive,
          isPinned: communityPosts.isPinned,
          isModerated: communityPosts.isModerated,
          viewCount: communityPosts.viewCount,
          likeCount: communityPosts.likeCount,
          commentCount: communityPosts.commentCount,
          createdAt: communityPosts.createdAt,
          updatedAt: communityPosts.updatedAt,
          user: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            profileImageUrl: users.profileImageUrl,
          }
        })
        .from(communityPosts)
        .leftJoin(users, eq(communityPosts.userId, users.id))
        .where(and(...whereConditions));

      // Apply sorting
      switch (sort) {
        case 'popular':
          query = query.orderBy(desc(communityPosts.likeCount), desc(communityPosts.createdAt));
          break;
        case 'discussed':
          query = query.orderBy(desc(communityPosts.commentCount), desc(communityPosts.createdAt));
          break;
        default: // recent
          query = query.orderBy(desc(communityPosts.createdAt));
      }

      // Apply pagination
      const posts = await query.limit(limitNum).offset(offset);

      // Check if current user has liked each post
      const userId = req.user?.id;
      if (userId && posts.length > 0) {
        const postIds = posts.map(p => p.id);
        const userLikes = await db
          .select({ postId: communityPostLikes.postId })
          .from(communityPostLikes)
          .where(and(
            eq(communityPostLikes.userId, userId),
            sql`${communityPostLikes.postId} = ANY(${postIds})`
          ));

        const likedPostIds = new Set(userLikes.map(l => l.postId));
        
        const postsWithLikes: CommunityPostWithUser[] = posts.map(post => ({
          ...post,
          isLiked: likedPostIds.has(post.id)
        }));

        res.json(postsWithLikes);
      } else {
        res.json(posts);
      }
    } catch (error) {
      console.error("Error fetching community posts:", error);
      res.status(500).json({ message: "Failed to fetch community posts" });
    }
  });

  // Create a new community post
  app.post('/api/community/posts', postRateLimit, requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const validatedData = insertCommunityPostSchema.parse(req.body);

      const [newPost] = await db
        .insert(communityPosts)
        .values({
          ...validatedData,
          userId,
        })
        .returning();

      res.status(201).json(newPost);
    } catch (error) {
      console.error("Error creating community post:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create post" });
      }
    }
  });

  // Get single community post with comments
  app.get('/api/community/posts/:id', communityRateLimit, requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Increment view count
      await db
        .update(communityPosts)
        .set({ 
          viewCount: sql`${communityPosts.viewCount} + 1`
        })
        .where(eq(communityPosts.id, id));

      // Get post with user info
      const [post] = await db
        .select({
          id: communityPosts.id,
          userId: communityPosts.userId,
          title: communityPosts.title,
          content: communityPosts.content,
          category: communityPosts.category,
          tags: communityPosts.tags,
          imageUrl: communityPosts.imageUrl,
          location: communityPosts.location,
          telegramId: communityPosts.telegramId,
          emailContact: communityPosts.emailContact,
          isBarterPost: communityPosts.isBarterPost,
          barterType: communityPosts.barterType,
          plantSpecies: communityPosts.plantSpecies,
          isActive: communityPosts.isActive,
          isPinned: communityPosts.isPinned,
          isModerated: communityPosts.isModerated,
          viewCount: communityPosts.viewCount,
          likeCount: communityPosts.likeCount,
          commentCount: communityPosts.commentCount,
          createdAt: communityPosts.createdAt,
          updatedAt: communityPosts.updatedAt,
          user: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            profileImageUrl: users.profileImageUrl,
          }
        })
        .from(communityPosts)
        .leftJoin(users, eq(communityPosts.userId, users.id))
        .where(and(
          eq(communityPosts.id, id),
          eq(communityPosts.isActive, true)
        ));

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Get comments for this post
      const comments = await db
        .select({
          id: communityComments.id,
          postId: communityComments.postId,
          userId: communityComments.userId,
          content: communityComments.content,
          parentId: communityComments.parentId,
          likeCount: communityComments.likeCount,
          isActive: communityComments.isActive,
          isModerated: communityComments.isModerated,
          createdAt: communityComments.createdAt,
          updatedAt: communityComments.updatedAt,
          user: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            profileImageUrl: users.profileImageUrl,
          }
        })
        .from(communityComments)
        .leftJoin(users, eq(communityComments.userId, users.id))
        .where(and(
          eq(communityComments.postId, id),
          eq(communityComments.isActive, true)
        ))
        .orderBy(desc(communityComments.createdAt));

      res.json({ post, comments });
    } catch (error) {
      console.error("Error fetching community post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  // Like/unlike a community post
  app.post('/api/community/posts/:id/like', communityRateLimit, requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user already liked this post
      const [existingLike] = await db
        .select()
        .from(communityPostLikes)
        .where(and(
          eq(communityPostLikes.postId, id),
          eq(communityPostLikes.userId, userId)
        ));

      if (existingLike) {
        // Unlike - remove like and decrement count
        await db
          .delete(communityPostLikes)
          .where(and(
            eq(communityPostLikes.postId, id),
            eq(communityPostLikes.userId, userId)
          ));

        await db
          .update(communityPosts)
          .set({ 
            likeCount: sql`GREATEST(${communityPosts.likeCount} - 1, 0)`
          })
          .where(eq(communityPosts.id, id));

        res.json({ liked: false });
      } else {
        // Like - add like and increment count
        await db
          .insert(communityPostLikes)
          .values({
            postId: id,
            userId,
          });

        await db
          .update(communityPosts)
          .set({ 
            likeCount: sql`${communityPosts.likeCount} + 1`
          })
          .where(eq(communityPosts.id, id));

        res.json({ liked: true });
      }
    } catch (error) {
      console.error("Error toggling post like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  // Add comment to a post
  app.post('/api/community/posts/:id/comments', communityRateLimit, requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const validatedData = insertCommunityCommentSchema.parse(req.body);

      const [newComment] = await db
        .insert(communityComments)
        .values({
          ...validatedData,
          postId: id,
          userId,
        })
        .returning();

      // Increment comment count on post
      await db
        .update(communityPosts)
        .set({ 
          commentCount: sql`${communityPosts.commentCount} + 1`
        })
        .where(eq(communityPosts.id, id));

      res.status(201).json(newComment);
    } catch (error) {
      console.error("Error creating comment:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create comment" });
      }
    }
  });

  // Like/unlike a comment
  app.post('/api/community/comments/:id/like', communityRateLimit, requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user already liked this comment
      const [existingLike] = await db
        .select()
        .from(communityCommentLikes)
        .where(and(
          eq(communityCommentLikes.commentId, id),
          eq(communityCommentLikes.userId, userId)
        ));

      if (existingLike) {
        // Unlike
        await db
          .delete(communityCommentLikes)
          .where(and(
            eq(communityCommentLikes.commentId, id),
            eq(communityCommentLikes.userId, userId)
          ));

        await db
          .update(communityComments)
          .set({ 
            likeCount: sql`GREATEST(${communityComments.likeCount} - 1, 0)`
          })
          .where(eq(communityComments.id, id));

        res.json({ liked: false });
      } else {
        // Like
        await db
          .insert(communityCommentLikes)
          .values({
            commentId: id,
            userId,
          });

        await db
          .update(communityComments)
          .set({ 
            likeCount: sql`${communityComments.likeCount} + 1`
          })
          .where(eq(communityComments.id, id));

        res.json({ liked: true });
      }
    } catch (error) {
      console.error("Error toggling comment like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  // Get user's own posts
  app.get('/api/community/my-posts', communityRateLimit, requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const posts = await db
        .select()
        .from(communityPosts)
        .where(and(
          eq(communityPosts.userId, userId),
          eq(communityPosts.isActive, true)
        ))
        .orderBy(desc(communityPosts.createdAt));

      res.json(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({ message: "Failed to fetch your posts" });
    }
  });

  // Delete user's own post
  app.delete('/api/community/posts/:id', communityRateLimit, requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user owns this post
      const [post] = await db
        .select()
        .from(communityPosts)
        .where(and(
          eq(communityPosts.id, id),
          eq(communityPosts.userId, userId)
        ));

      if (!post) {
        return res.status(404).json({ message: "Post not found or you don't have permission" });
      }

      // Soft delete
      await db
        .update(communityPosts)
        .set({ isActive: false })
        .where(eq(communityPosts.id, id));

      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });
}