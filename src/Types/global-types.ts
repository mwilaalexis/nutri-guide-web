
export interface UserDto {
  role: string;
  email: string;
  fullName: string;
  userId: string;
  profileUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;    
  refreshTokenExpiresAt: string;    
  role: string;
  email: string;
  fullName: string;
  userId: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  role: string;
  createdAt: string;
}



export interface UserProfileSummary {
  age?: number;
  weightKg?: number;
  heightCm?: number;
  biologicalSex?: string;
  activityLevel?: string;
  goal: string;
  dietType: string;
  allergies: string[];
}

export interface ProfileDto {
  userId: string;
  age: number;
  fullName?: string;
  role?: string;
  email?: string;
  profileUrl?: string; 
  biologicalSex?: string;
  weightKg?: number;
  heightCm?: number;
  bmi?: number;
  activityLevel?: string;
  goal?: string;
  allergies: string[];
  createdAt: string;
  updatedAt?: string;
  dietType: string;
}

export interface CreateProfileDto {
  userId: string;
  fullName?: string;
  email?: string;
  biologicalSex?: string;
  weightKg?: number;
  heightCm?: number;
  activityLevel?: string;
  goal?: string;
  allergies?: string;
  createdAt: string;
  updatedAt?: string;
  age: number;
  dietType: string;
  profileImage?: File | null;
}

export interface UpdateProfileDto {
  fullName?: string;
  email?: string;
  biologicalSex?: string;
  weightKg?: number;
  heightCm?: number;
  activityLevel?: string;
  goal?: string;
  allergies?: string; 
  age: number;
  dietType: string;
  profileImage?: File | null; 
}


export interface IngredientDto {
  id: string;
  name: string;
  unit: string;
  imagePath: string;
  calories: number;
  protein: number;
  quantity: number;
  carbs: number;
  fat: number;
  dietType:string;
}


export interface CreateIngredientDto {
  name: string;
  unit: string;
  document:File|null;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  dietType:string;
}

export interface FoodDto {
  id: string;
  name: string;
  calories: number;
  recipe: string;
  protein: number;
  carbs: number;
  fat: number;
  dietType: string;
  imagePath: string;
  ingredients: IngredientDto[];
  tags: string[];
}

export interface FoodIngredientCreateDto {
  ingredientId: string;
  unit: string;
  quantity: number;
}

export interface CreateFoodDto {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  dietType: string;
  description: string;
  Document: File | null;
  tags: string;
  ingredients: FoodIngredientCreateDto[];
}

export interface FoodItemSummary {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  tags: string[];
  imagePath: string;
}



export interface MealIngredientSummaryDto {
  name: string;
  quantity: number;
  unit: string;
}

export interface MealSummaryDto {
  id: string;
  type: string;
  name: string;
  calories: number;
  imagePath: string;
  foodId: string;
  ingredients?: MealIngredientSummaryDto[];
}

export interface DailyMealSummaryDto {
  dayId: string;
  date: string; 
  totalCalories: number;
  breakfast: MealSummaryDto[];
  lunch: MealSummaryDto[];
  dinner: MealSummaryDto[];
  snacks: MealSummaryDto[];
}

export interface PlanSummaryDto {
  planId: string;
  totalDays: number;
  totalCalories: number;
  averageCaloriesPerDay: number;
  dietStyle: string;
  goal: string;
  generatedAt: string;
  status: string;
  days: DailyMealSummaryDto[];
}

export interface PlanRequest {
  startDate: string;
  numberOfDays: number;
  notes: string;
}
