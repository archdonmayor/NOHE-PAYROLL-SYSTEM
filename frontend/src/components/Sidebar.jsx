import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div
      style={{
        width: "250px",
        height: "100vh",
        background: "#1e293b",
        color: "white",
        padding: "20px",
        boxSizing: "border-box"
      }}
    >
      <h2>NOHE Payroll</h2>

      <hr />

      <p>
        <Link
          to="/dashboard"
          style={{ color: "white" }}
        >
          Dashboard
        </Link>
      </p>

      <p>
        <Link
          to="/employees"
          style={{ color: "white" }}
        >
          Employees
        </Link>
      </p>

      <p>
        <Link
          to="/pending-employees"
          style={{ color: "white" }}
        >
          Pending Employees
        </Link>
      </p>

      <p>
  <Link
    to="/missing-payroll"
    style={{ color: "white" }}
  >
    Missing From Payroll
  </Link>
</p>

      <p>
        <Link
          to="/upload"
          style={{ color: "white" }}
        >
          Upload Payroll
        </Link>
      </p>

      <p>
        <Link
          to="/reports"
          style={{ color: "white" }}
        >
          Reports
        </Link>
      </p>
    </div>
  );
}

export default Sidebar;