import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import ProjectsPage from "./pages/ProjectsPage.jsx";
import ProjectWorkspacePage from "./pages/ProjectWorkspacePage.jsx";
import ProjectLayout from "./pages/ProjectLayout.jsx";
import ProjectDashboardPage from "./pages/ProjectDashboardPage.jsx";
import ProjectSettingsPage from "./pages/ProjectSettingsPage.jsx";
import ProjectMemoryPage from "./pages/ProjectMemoryPage.jsx";
import ProjectSearchPage from "./pages/ProjectSearchPage.jsx";
import ProjectTasksPage from "./pages/ProjectTasksPage.jsx";
import ProjectDocumentPage from "./pages/ProjectDocumentPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./styles.css";

const client = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<App />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                element={
                  <RequireAuth>
                    <ProjectsPage />
                  </RequireAuth>
                }
                path="/projects"
              />

              <Route
                element={
                  <RequireAuth>
                    <ProjectLayout />
                  </RequireAuth>
                }
                path="/projects/:projectId"
              >
                <Route index element={<ProjectDashboardPage />} />
                <Route path="documents" element={<ProjectWorkspacePage />} />
                <Route
                  path="documents/:documentId"
                  element={<ProjectDocumentPage />}
                />
                <Route path="search" element={<ProjectSearchPage />} />
                <Route path="tasks" element={<ProjectTasksPage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="memories" element={<ProjectMemoryPage />} />
                <Route path="settings" element={<ProjectSettingsPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
