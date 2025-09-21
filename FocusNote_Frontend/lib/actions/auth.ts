"use server";

import { cookies } from "next/headers";

const API_BASE_URL = process.env.API_URL || "http://localhost:4000";

export async function verifyEmail(email: string) {
  try {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: "Please enter a valid email address" };
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/request-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      return { success: true, message: "OTP sent to your email address" };
    } else {
      return { success: false, message: data.message || "Failed to send OTP" };
    }
  } catch (error) {
    console.error("Email verification error:", error);
    return { success: false, message: "An error occurred. Please try again." };
  }
}

export async function registerUser(userData: {
  user_first_name: string;
  user_last_name: string;
  email: string;
  age: string;
}) {
  try {
    // Basic validation
    const { user_first_name, user_last_name, email, age } = userData;
    
    if (!user_first_name.trim() || !user_last_name.trim() || !email.trim() || !age.trim()) {
      return { success: false, message: "All fields are required" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: "Please enter a valid email address" };
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      return { success: false, message: "Age must be between 13 and 120" };
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      return { success: true, message: data.message };
    } else {
      return { success: false, message: data.message || "Registration failed" };
    }
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: "An error occurred. Please try again." };
  }
}

export async function verifyOTP(email: string, otp: string) {
  try {
    // Basic OTP validation
    if (!otp || otp.length !== 6) {
      return { success: false, message: "Please enter a valid 6-digit OTP" };
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code: otp }),
      credentials: "include",
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      // Set the token in cookies if provided
      if (data.token) {
        const cookieStore = await cookies();
        cookieStore.set("token", data.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60, // 1 hour
        });
      }
      
      return { success: true, message: "Login successful! Welcome to FocusNote." };
    } else {
      return { success: false, message: data.message || "Invalid OTP" };
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    return { success: false, message: "An error occurred. Please try again." };
  }
}

export async function authenticateUser(token?: string) {
  try {
    // If token provided, send it in Cookie header; otherwise rely on cookie store
    const headers: Record<string, string> = {};
    if (token) headers.Cookie = `token=${token}`;

    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers,
      cache: 'no-store',
      credentials: 'include',
    });

    const result = await res.json();
    return result;
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

export async function logout() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    
    if (token) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": `token=${token}`,
        },
        credentials: "include",
      });
    }
    
    // Clear the token cookie
    cookieStore.delete("token");
    
    return { success: true, message: "Logged out successfully" };
  } catch (error) {
    console.error("Logout error:", error);
    // Still clear the cookie even if the API call fails
    const cookieStore = await cookies();
    cookieStore.delete("token");
    return { success: true, message: "Logged out successfully" };
  }
}