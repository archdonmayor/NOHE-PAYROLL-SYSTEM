import { useLocation, useNavigate } from "react-router-dom";
const pageNames = { "/dashboard": "Overview", "/employees": "Employees", "/pending-employees": "Pending employees", "/missing-payroll": "Missing from payroll", "/upload": "Upload payroll", "/reports": "Reports" };
function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const title = pageNames[location.pathname] || "Workspace";
  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };
  return <header className="topbar"><div className="topbar-title"><span className="breadcrumb">NOHE PAYROLL</span><span className="breadcrumb-divider">/</span><strong>{title}</strong></div><div className="topbar-right"><span className="status-pill"><span className="secure-dot" /> System ready</span><div className="user-avatar" aria-label="Payroll administrator">PA</div><span className="user-label">Administrator</span><button className="sign-out-button" type="button" onClick={handleSignOut} aria-label="Sign out" title="Sign out"><span aria-hidden="true">↪</span><span className="sign-out-label">Sign out</span></button></div></header>;
}
export default Header;
