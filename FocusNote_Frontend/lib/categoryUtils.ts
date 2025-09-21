export interface Category {
  id: string;
  name: string;
  count?: number; // Number of documents in this category
}

// Mock categories for demonstration - in production, these would come from your backend
export const DEFAULT_CATEGORIES: Category[] = [
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

export const searchCategories = (query: string, categories: Category[] = DEFAULT_CATEGORIES): Category[] => {
  if (!query.trim()) {
    return categories;
  }

  const searchTerm = query.toLowerCase().trim();
  
  // Filter existing categories that match the search
  const matchingCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm)
  );

  // If the exact search term doesn't exist as a category, add it as a new option
  const exactMatch = categories.find(category => 
    category.name.toLowerCase() === searchTerm
  );

  if (!exactMatch && searchTerm.length > 0) {
    matchingCategories.unshift({
      id: 'new',
      name: query.trim(),
      count: 0
    });
  }

  return matchingCategories;
};

export const formatCategoryForDisplay = (category: Category): string => {
  if (category.id === 'new') {
    return `Create "${category.name}"`;
  }
  return category.count !== undefined ? `${category.name} (${category.count})` : category.name;
};

// This would typically fetch from your backend
export const fetchUserCategories = async (userId?: string): Promise<Category[]> => {
  // TODO: Replace with actual API call to your backend
  // For now, return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(DEFAULT_CATEGORIES);
    }, 100);
  });
};

export const saveCategory = async (categoryName: string, userId?: string): Promise<Category> => {
  // TODO: Replace with actual API call to save new category
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Math.random().toString(36).substr(2, 9),
        name: categoryName,
        count: 0
      });
    }, 200);
  });
};