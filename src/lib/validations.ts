import { z } from 'zod';

// Student validation schema
export const studentSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  father_name: z.string()
    .trim()
    .min(1, "Father's name is required")
    .max(100, "Father's name must be less than 100 characters"),
  class_id: z.string()
    .uuid("Invalid class ID")
    .optional()
    .nullable(),
  admission_date: z.string()
    .min(1, "Admission date is required"),
  contact: z.string()
    .regex(/^[\d\s+()-]*$/, "Invalid phone number format")
    .max(20, "Phone number too long")
    .optional()
    .or(z.literal('')),
  photo_url: z.string()
    .url("Invalid URL")
    .optional()
    .or(z.literal('')),
  age: z.number()
    .int("Age must be a whole number")
    .min(5, "Age must be at least 5")
    .max(100, "Age must be less than 100")
    .optional()
    .nullable(),
  grade: z.string()
    .max(50, "Grade must be less than 50 characters")
    .optional()
    .or(z.literal('')),
  status: z.enum(['active', 'inactive', 'graduated'], {
    errorMap: () => ({ message: "Status must be active, inactive, or graduated" })
  })
});

// Teacher validation schema
export const teacherSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  qualification: z.string()
    .trim()
    .min(1, "Qualification is required")
    .max(200, "Qualification must be less than 200 characters"),
  subject: z.string()
    .trim()
    .min(1, "Subject is required")
    .max(100, "Subject must be less than 100 characters"),
  contact: z.string()
    .trim()
    .regex(/^[\d\s+()-]*$/, "Invalid phone number format")
    .max(20, "Phone number too long"),
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  specialization: z.string()
    .max(100, "Specialization must be less than 100 characters")
    .optional()
    .or(z.literal(''))
});

// Class validation schema
export const classSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Class name is required")
    .max(100, "Class name must be less than 100 characters"),
  section: z.string()
    .max(50, "Section must be less than 50 characters")
    .optional()
    .or(z.literal('')),
  teacher_id: z.string()
    .uuid("Invalid teacher ID")
    .optional()
    .nullable(),
  year: z.string()
    .max(10, "Year must be less than 10 characters")
    .optional()
    .or(z.literal('')),
  schedule: z.string()
    .max(100, "Schedule must be less than 100 characters")
    .optional()
    .or(z.literal('')),
  duration: z.string()
    .max(50, "Duration must be less than 50 characters")
    .optional()
    .or(z.literal('')),
  room: z.string()
    .max(50, "Room must be less than 50 characters")
    .optional()
    .or(z.literal('')),
  level: z.string()
    .max(50, "Level must be less than 50 characters")
    .optional()
    .or(z.literal('')),
  students_count: z.number()
    .int("Student count must be a whole number")
    .min(0, "Student count cannot be negative")
    .optional()
});

// Course validation schema
export const courseSchema = z.object({
  title: z.string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z.string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .or(z.literal('')),
  level: z.string()
    .max(50, "Level must be less than 50 characters")
    .optional()
    .or(z.literal('')),
  duration: z.string()
    .max(50, "Duration must be less than 50 characters")
    .optional()
    .or(z.literal('')),
  modules: z.number()
    .int("Modules must be a whole number")
    .min(0, "Modules cannot be negative")
    .optional(),
  progress: z.number()
    .int("Progress must be a whole number")
    .min(0, "Progress cannot be negative")
    .max(100, "Progress cannot exceed 100")
    .optional(),
  students_count: z.number()
    .int("Student count must be a whole number")
    .min(0, "Student count cannot be negative")
    .optional()
});

export type StudentFormData = z.infer<typeof studentSchema>;
export type TeacherFormData = z.infer<typeof teacherSchema>;
export type ClassFormData = z.infer<typeof classSchema>;
export type CourseFormData = z.infer<typeof courseSchema>;
