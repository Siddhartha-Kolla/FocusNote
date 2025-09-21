'use server'

import { Category } from '@/lib/categoryUtils';

// Server action to fetch user categories from backend
export async function fetchCategoriesAction(userId?: string): Promise<Category[]> {
  try {
    const backendUrl = process.env.FOCUSNOTE_BACKEND_URL || 'http://localhost:4000';
    
    const response = await fetch(`${backendUrl}/docs/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers here when needed
        // 'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    const categories = await response.json();
    return categories;

  } catch (error) {
    console.error('Error fetching categories:', error);
    
    // Return default categories if backend is not available
    return [
      { id: '1', name: 'Academic', count: 15 },
      { id: '2', name: 'Business', count: 8 },
      { id: '3', name: 'Legal', count: 5 },
      { id: '4', name: 'Medical', count: 12 },
      { id: '5', name: 'Personal', count: 22 },
      { id: '6', name: 'Research', count: 7 },
      { id: '7', name: 'Financial', count: 11 },
      { id: '8', name: 'Technical', count: 9 },
      { id: '9', name: 'Administrative', count: 6 },
      { id: '10', name: 'Educational', count: 14 }
    ];
  }
}

// Server action to save a new category
export async function saveCategoryAction(categoryName: string, userId?: string): Promise<Category> {
  try {
    const backendUrl = process.env.FOCUSNOTE_BACKEND_URL || 'http://localhost:4000';
    
    const response = await fetch(`${backendUrl}/docs/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers here when needed
      },
      body: JSON.stringify({
        name: categoryName,
        userId
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to save category: ${response.status}`);
    }

    const newCategory = await response.json();
    return newCategory;

  } catch (error) {
    console.error('Error saving category:', error);
    
    // Return a mock category if backend is not available
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: categoryName,
      count: 0
    };
  }
}