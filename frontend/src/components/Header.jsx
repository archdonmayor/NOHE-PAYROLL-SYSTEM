import { useLocation } from "react-router-dom";
const pageNames = { "/dashboard": "Overview", "/employees": "Employees", "/pending-employees": "Pending employees", "/missing-payroll": "Missing from payroll", "/upload": "Upload payroll", "/reports": "Reports" };
function Header() {
  const title = pageNames[useLocation().pathname] || "Workspace";
  return <header className="topbar"><div className="topbar-title"><span className="breadcrumb">NOHE PAYROLL</span><span className="breadcrumb-divider">/</span><strong>{title}</strong></div><div className="topbar-right"><span className="status-pill"><span className="secure-dot" /> System ready</span><div className="user-avatar" aria-label="Payroll administrator">PA</div><span className="user-label">Administrator</span></div></header>;
}
export default Header;
