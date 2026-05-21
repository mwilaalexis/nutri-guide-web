import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/landing";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Ingredients from "./pages/Ingredients";
import Plans from "./pages/Plans";
import Gallery from "./pages/Gallery";
import NotificationsLayout from "./layout/NotificationsLayout";
import NotificationInbox from "./pages/NotificationInbox";
import NotificationSend from "./pages/NotificationSend";
import Admin from "./pages/Admin";
import Permissions from "./pages/Permissions";
import Logs from "./pages/Logs";
import Performance from "./pages/Performance";
import Tracking from "./pages/Tracking";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Foods from "./pages/Food";
import PlanDetails from "./pages/PlanDetail";
import ProfilePage from "./pages/ProfilePage";
import Settings from "./pages/Settings";
import FoodDetailPage from "./pages/food/FoodDetailPage";
import FoodCreatePage from "./pages/food/FoodCreatePage";
import FoodEditPage from "./pages/food/FoodEditPage";
import FoodDeletePage from "./pages/food/FoodDeletePage";
import UserCreatePage from "./pages/users/UserCreatePage";
import UserEditPage from "./pages/users/UserEditPage";
import UserDeletePage from "./pages/users/UserDeletePage";
import IngredientCreatePage from "./pages/ingredients/IngredientCreatePage";
import IngredientEditPage from "./pages/ingredients/IngredientEditPage";
import IngredientDeletePage from "./pages/ingredients/IngredientDeletePage";
import PlanSwapMealPage from "./pages/plans/PlanSwapMealPage";
import PlanRegenerateMealPage from "./pages/plans/PlanRegenerateMealPage";
import DashboardLayout from "./layout/DashboardLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RequireRole from "./components/auth/RequireRole";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="foods/:foodId" element={<FoodDetailPage />} />
          <Route path="plans" element={<Plans />} />
          <Route path="plans/:planId" element={<PlanDetails />} />
          <Route path="plans/:planId/swap/:mealId" element={<PlanSwapMealPage />} />
          <Route path="plans/:planId/regenerate/:mealId" element={<PlanRegenerateMealPage />} />
          <Route path="notifications" element={<NotificationsLayout />}>
            <Route index element={<Navigate to="inbox" replace />} />
            <Route path="inbox" element={<NotificationInbox />} />
            <Route path="send" element={<NotificationSend />} />
          </Route>
          <Route path="settings" element={<Settings />} />

          <Route
            path="users"
            element={
              <RequireRole roles={["admin"]}>
                <Users />
              </RequireRole>
            }
          />
          <Route
            path="users/new"
            element={
              <RequireRole roles={["admin"]}>
                <UserCreatePage />
              </RequireRole>
            }
          />
          <Route
            path="users/:userId/edit"
            element={
              <RequireRole roles={["admin"]}>
                <UserEditPage />
              </RequireRole>
            }
          />
          <Route
            path="users/:userId/delete"
            element={
              <RequireRole roles={["admin"]}>
                <UserDeletePage />
              </RequireRole>
            }
          />
          <Route
            path="ingredients"
            element={
              <RequireRole roles={["admin"]}>
                <Ingredients />
              </RequireRole>
            }
          />
          <Route
            path="ingredients/new"
            element={
              <RequireRole roles={["admin"]}>
                <IngredientCreatePage />
              </RequireRole>
            }
          />
          <Route
            path="ingredients/:ingredientId/edit"
            element={
              <RequireRole roles={["admin"]}>
                <IngredientEditPage />
              </RequireRole>
            }
          />
          <Route
            path="ingredients/:ingredientId/delete"
            element={
              <RequireRole roles={["admin"]}>
                <IngredientDeletePage />
              </RequireRole>
            }
          />
          <Route
            path="admin"
            element={
              <RequireRole roles={["admin"]}>
                <Admin />
              </RequireRole>
            }
          />
          <Route
            path="food"
            element={
              <RequireRole roles={["admin"]}>
                <Foods />
              </RequireRole>
            }
          />
          <Route
            path="food/new"
            element={
              <RequireRole roles={["admin"]}>
                <FoodCreatePage />
              </RequireRole>
            }
          />
          <Route
            path="food/:foodId/edit"
            element={
              <RequireRole roles={["admin"]}>
                <FoodEditPage />
              </RequireRole>
            }
          />
          <Route
            path="food/:foodId/delete"
            element={
              <RequireRole roles={["admin"]}>
                <FoodDeletePage />
              </RequireRole>
            }
          />
          <Route
            path="permissions"
            element={
              <RequireRole roles={["admin"]}>
                <Permissions />
              </RequireRole>
            }
          />

          <Route
            path="logs"
            element={
              <RequireRole roles={["admin", "moderator"]}>
                <Logs />
              </RequireRole>
            }
          />
          <Route
            path="performance"
            element={
              <RequireRole roles={["admin", "moderator"]}>
                <Performance />
              </RequireRole>
            }
          />
          <Route path="tracking" element={<Tracking />} />
        </Route>
      </Route>
    </Routes>
  );
}
