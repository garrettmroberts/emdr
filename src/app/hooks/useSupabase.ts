"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function useSupabase() {
  const { user, userRole } = useAuth(); // Get userRole from AuthContext
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Save a session record with role context
  const saveSession = async (sessionData: {
    therapist_id?: string;
    client_id?: string;
    duration?: number;
    notes?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      // Enhanced with role information
      const enhancedData = {
        ...sessionData,
        created_by: user?.id,
        created_at: new Date().toISOString(),
        creator_role: userRole, // Add the user's role
      };

      const { data, error } = await supabase
        .from("emdr_sessions")
        .insert([enhancedData])
        .select();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error("Error saving session:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get sessions with role context filtering
  const getSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from("emdr_sessions").select("*");

      // Filter based on role
      if (user?.id) {
        if (userRole === "therapist") {
          // Therapists see sessions where they're the therapist
          query = query.eq("therapist_id", user.id);
        } else {
          // Clients see sessions where they're the client
          query = query.eq("client_id", user.id);
        }
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error("Error fetching sessions:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get users by role (for therapists to find clients)
  const getUsersByRole = async (role: string) => {
    if (userRole !== "therapist") {
      // Only therapists can search for clients
      setError(new Error("Only therapists can search for users by role"));
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .eq("role", role);

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error("Error fetching users by role:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    supabase,
    loading,
    error,
    saveSession,
    getSessions,
    getUsersByRole,
  };
}
