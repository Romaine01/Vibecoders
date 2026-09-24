import { z } from "zod";
import { concernCategories } from "@/lib/types";

export const concernSchema = z.object({
  category: z.enum(concernCategories),
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(20).max(3000),
  locationText: z.string().trim().min(3).max(240),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  urgency: z.enum(["normal", "urgent"]),
});

export const documentSchema = z.object({
  documentType: z.string().trim().min(2).max(100),
  purpose: z.string().trim().min(5).max(500),
});

export const registrationSchema = z.object({
  firstName: z.string().trim().min(2).max(80),
  middleName: z.string().trim().max(80).optional().default(""),
  lastName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  mobileNumber: z.string().trim().min(7).max(32),
  address: z.string().trim().min(5).max(240),
  password: z.string().min(8).max(128),
  confirmPassword: z.string().min(8).max(128),
  acceptedPolicies: z.literal(true),
}).superRefine((value, context) => {
  if (value.password !== value.confirmPassword) {
    context.addIssue({ code: "custom", path: ["confirmPassword"], message: "Passwords do not match." });
  }
});

export const adminActionSchema = z.object({
  action: z.enum(["receive", "assign", "start", "resolve", "reject"]),
  note: z.string().trim().max(2000).optional().default(""),
  assignedTo: z.string().trim().max(120).optional(),
  actionTaken: z.string().trim().max(2000).optional(),
  resolutionNotes: z.string().trim().max(2000).optional(),
});
