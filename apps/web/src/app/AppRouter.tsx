import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from '../shell/AppShell';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { DocumentEditor } from '../features/document/DocumentEditor';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell /> }>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/doc/:id" element={<DocumentEditor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
