import { BrowserRouter, Routes, Route } from "react-router-dom";
import { paths } from "./paths";

import AppShell from "../layouts/AppShell";

import DashboardPage from "../pages/DashboardPage";
import DocumentsPage from "../pages/DocumentsPage";
import SpreadsheetPage from "../pages/SpreadsheetPage";
import PresentationPage from "../pages/PresentationPage";
import PDFPage from "../pages/PDFPage";
import ProfilePage from "../pages/ProfilePage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path={paths.dashboard} element={<DashboardPage />} />
          <Route path={paths.documents} element={<DocumentsPage />} />
          <Route path={paths.spreadsheets} element={<SpreadsheetPage />} />
          <Route path={paths.presentations} element={<PresentationPage />} />
          <Route path={paths.pdf} element={<PDFPage />} />
          <Route path={paths.profile} element={<ProfilePage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}