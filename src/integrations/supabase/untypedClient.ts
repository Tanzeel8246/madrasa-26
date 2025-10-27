// Thin untyped wrapper around the generated Supabase client to avoid TS issues
// when the generated Database types are not yet synced with the actual schema.
// Use this import in places where strict typing causes 'never' errors.

import { supabase as typedClient } from "./client";

// Cast to any to relax table typing (runtime behavior unchanged)
export const supabase = typedClient as any;
