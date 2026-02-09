/**
 * API Request Validation Schemas
 *
 * Zod schemas for validating API requests
 */

import { z } from 'zod';

// Authentication schemas
export const authSchemas = {
  login: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),

  signup: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(1, 'Name is required').optional(),
  }),

  googleAuth: z.object({
    code: z.string().min(1, 'Authorization code is required'),
    redirectUri: z.string().url('Invalid redirect URI'),
  }),
};

// Client schemas
export const clientSchemas = {
  login: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    projectSlug: z.string().min(1, 'Project slug is required'),
  }),

  request: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    company: z.string().optional(),
    message: z.string().min(10, 'Message must be at least 10 characters'),
    projectType: z.string().optional(),
  }),
};

// Project schemas
export const projectSchemas = {
  create: z.object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().optional(),
    type: z.enum(['web', 'mobile', 'api', 'ai', 'other']).optional(),
    budget: z.number().positive().optional(),
  }),

  update: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    status: z.enum(['active', 'paused', 'completed', 'cancelled']).optional(),
  }),
};

// Video generation schemas
export const videoSchemas = {
  generate: z.object({
    prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(500, 'Prompt too long'),
    duration: z.enum(['3', '6']).transform(Number).optional(),
    aspectRatio: z.enum(['1:1', '16:9', '9:16', '4:3', '3:4']).optional(),
    provider: z.enum(['grok', 'google']).optional(),
  }),

  export: z.object({
    videoId: z.string().uuid('Invalid video ID'),
    format: z.enum(['mp4', 'webm', 'gif']).optional(),
    quality: z.enum(['low', 'medium', 'high']).optional(),
  }),
};

// Image generation schemas
export const imageSchemas = {
  generate: z.object({
    prompt: z.string().min(5, 'Prompt must be at least 5 characters').max(500, 'Prompt too long'),
    width: z.number().int().positive().max(2048).optional(),
    height: z.number().int().positive().max(2048).optional(),
    model: z.string().optional(),
  }),

  upscale: z.object({
    imageId: z.string().min(1, 'Image ID is required'),
    scale: z.enum(['2', '4']).transform(Number).optional(),
  }),
};

// Chat/Boardroom schemas
export const chatSchemas = {
  sendMessage: z.object({
    roomId: z.string().uuid('Invalid room ID'),
    message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
    replyTo: z.string().uuid().optional(),
  }),

  createRoom: z.object({
    name: z.string().min(1, 'Room name is required'),
    description: z.string().optional(),
    isPrivate: z.boolean().optional(),
    tokenGated: z.boolean().optional(),
  }),
};

// Admin schemas
export const adminSchemas = {
  approveClientRequest: z.object({
    requestId: z.string().uuid('Invalid request ID'),
    message: z.string().optional(),
  }),

  createUser: z.object({
    email: z.string().email('Invalid email address'),
    role: z.enum(['user', 'builder', 'client', 'admin', 'super_admin']),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
};

// Automation schemas
export const automationSchemas = {
  cronAction: z.object({
    action: z.enum(['health', 'projects', 'status']),
    project: z.string().optional(),
  }),

  n8nWebhook: z.object({
    workflowId: z.string().min(1, 'Workflow ID is required'),
    data: z.record(z.any()),
  }),
};

// Generic schemas
export const genericSchemas = {
  pagination: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().max(100)).optional(),
  }),

  uuid: z.string().uuid('Invalid ID format'),

  email: z.string().email('Invalid email address'),
};
