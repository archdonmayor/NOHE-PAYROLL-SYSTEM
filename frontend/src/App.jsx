import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import UploadPayroll from "./pages/UploadPayroll";
import Reports from "./pages/Reports";
import PendingEmployees from "./pages/PendingEmployees";
import MissingPayroll from "./pages/MissingPayroll";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/employees"
          element={<Employees />}
        />

        <Route
          path="/upload"
          element={<UploadPayroll />}
        />

        <Route
          path="/reports"
          element={<Reports />}
        />

        <Route
          path="/pending-employees"
          element={<PendingEmployees />}
        />

        <Route
        path="/missing-payroll"
        element={<MissingPayroll />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;