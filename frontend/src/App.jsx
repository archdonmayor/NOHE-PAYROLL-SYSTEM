import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import UploadPayroll from "./pages/UploadPayroll";
import Reports from "./pages/Reports";
import PendingEmployees from "./pages/PendingEmployees";
import MissingPayroll from "./pages/MissingPayroll";
function AppLayout() {
  return <div className="app-shell"><Sidebar /><div className="app-main"><Header /><main className="app-content"><Outlet /></main></div></div>;
}
function App() {
  return <BrowserRouter><Routes><Route path="/" element={<Login />} /><Route element={<AppLayout />}>
    <Route path="/dashboard" element={<Dashboard />} /><Route path="/employees" element={<Employees />} /><Route path="/upload" element={<UploadPayroll />} /><Route path="/reports" element={<Reports />} /><Route path="/pending-employees" element={<PendingEmployees />} /><Route path="/missing-payroll" element={<MissingPayroll />} /><Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Route></Routes></BrowserRouter>;
}
export default App;
