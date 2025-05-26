// Exercise recommendations based on routine type
export function getExerciseSuggestions(routineType) {
    switch (routineType) {
      case 'Extreme':
        return [
          'High-Intensity Interval Training (HIIT)',
          'Weightlifting (5-6 times per week)',
          'Running (5-10 km daily)',
        ];
      case 'Medium':
        return [
          'Cardio (3-4 times per week)',
          'Strength training (3 times per week)',
          'Cycling or Swimming (3-4 times per week)',
        ];
      case 'Normal':
        return [
          'Walking (30 minutes daily)',
          'Yoga (2-3 times per week)',
          'Stretching (daily)',
        ];
      default:
        return [];
    }
  }
  
  // Food recommendations based on routine type
  export function getFoodSuggestions(routineType) {
    switch (routineType) {
      case 'Extreme':
        return [
          'High-protein meals (chicken, turkey, tofu)',
          'Leafy greens (spinach, kale)',
          'Complex carbs (quinoa, brown rice)',
          'Healthy fats (avocados, nuts)',
        ];
      case 'Medium':
        return [
          'Balanced meals (lean meats, vegetables, whole grains)',
          'Smoothies with fruits and protein powder',
          'Moderate portions of healthy carbs',
        ];
      case 'Normal':
        return [
          'Fresh fruits and vegetables',
          'Whole grains (oats, brown rice)',
          'Lean protein sources (fish, chicken)',
          'Low-calorie snacks (nuts, yogurt)',
        ];
      default:
        return [];
    }
  }
  