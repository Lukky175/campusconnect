import { Routes, Route } from "react-router-dom";

import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";

import HomePage from "./pages/public/homepage/Homepage";
import EventsPage from "./pages/public/eventspage/Eventspage";
import EventDetailsPage from "./pages/public/eventspage/EventPage";
import NotFoundPage from "./pages/public/NotFoundPage";
import ClubsPage from "./pages/public/ClubsPage";
import BlogsPage from "./pages/public/BlogsPage";
import BlogDetailPage from "./pages/public/BlogDetailPage";
import AboutUsPage from "./pages/public/AboutUsPage";
import ContactUsPage from "./pages/public/ContactUsPage";
import FaqPage from "./pages/public/FaqPage";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardPage from "./pages/dashboard/DashboardPage";
import DashboardEventsPage from "./pages/dashboard/DashboardEventsPage";
import ProfilePage from "./pages/dashboard/ProfilePage";

import ProtectedRoute from "./routes/ProtectedRoute";

import DashboardRegistrationsPage from "./pages/dashboard/DashboardRegistrationsPage";
import DashboardSettingsPage from "./pages/dashboard/DashboardSettingsPage";

import UsersPage from "./pages/dashboard/admin/UsersPage";
import RolePermissionsPage from "./pages/dashboard/admin/RolePermissionsPage";
import ManageEventsPage from "./pages/dashboard/admin/ManageEventsPage";
import BlogManagementPage from "./pages/dashboard/admin/BlogManagementPage";
import WebsiteSettingsPage from "./pages/dashboard/admin/WebsiteSettingsPage";
import AdminRoute from "./routes/AdminRoute";

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Routes>

            {/* Public pages */}

            <Route
              path="/"
              element={<HomePage />}
            />

            <Route
              path="/events"
              element={<EventsPage />}
            />

            <Route
              path="/events/:eventId"
              element={<EventDetailsPage />}
            />

            <Route
              path="/clubs"
              element={<ClubsPage />}
            />

            <Route
              path="/blog"
              element={<BlogsPage />}
            />

            <Route path="/blog/:slug" element={<BlogDetailPage />} />

            <Route
              path="/about"
              element={<AboutUsPage />}
            />

            <Route
              path="/contact"
              element={<ContactUsPage />}
            />

            <Route path="/faq" element={<FaqPage />} />

            {/* Authentication */}

            <Route
              path="/login"
              element={<LoginPage />}
            />

            <Route
              path="/register"
              element={<RegisterPage />}
            />

            {/* Protected application */}

            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route
                  path="/dashboard"
                  element={<DashboardPage />}
                />

                <Route
                  path="/dashboard/events"
                  element={<DashboardEventsPage />}
                />

                <Route
                  path="/dashboard/clubs"
                  element={<ClubsPage dashboard />}
                />

                <Route
                  path="/dashboard/events/:eventId"
                  element={<EventDetailsPage />}
                />

                <Route
                  path="/dashboard/registrations"
                  element={<DashboardRegistrationsPage />}
                />

                <Route
                  path="/dashboard/profile"
                  element={<ProfilePage />}
                />

                <Route
                  path="/dashboard/settings"
                  element={<DashboardSettingsPage />}
                />

                <Route
                  path="/dashboard/admin/users"
                  element={<UsersPage />}
                />

                <Route
                  path="/dashboard/admin/roles"
                  element={<RolePermissionsPage />}
                />

                <Route
                  path="/dashboard/admin/events"
                  element={<ManageEventsPage />}
                />

                <Route element={<AdminRoute />}>
                  <Route
                    path="/dashboard/admin/blogs"
                    element={<BlogManagementPage />}
                  />
                  <Route
                    path="/dashboard/admin/website-settings"
                    element={<WebsiteSettingsPage />}
                  />
                </Route>
              </Route>
            </Route>

            {/* 404 */}

            <Route
              path="*"
              element={<NotFoundPage />}
            />

          </Routes>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
