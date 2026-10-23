import { NavLink } from "react-router-dom";
const links = [["/dashboard", "Overview", "⌂"], ["/employees", "Employees", "♙"], ["/pending-employees", "Pending employees", "◷"], ["/missing-payroll", "Missing from payroll", "!"], ["/upload", "Upload payroll", "↑"], ["/reports", "Reports", "▤"]];
function Sidebar() {
  return <aside className="sidebar"><a className="brand" href="/dashboard" aria-label="NOHE Payroll home"><span className="brand-mark">N</span><span><strong>NOHE</strong><small>PAYROLL</small></span></a><div className="nav-label">WORKSPACE</div><nav className="side-nav" aria-label="Main navigation">{links.map(([to, label, icon]) => <NavLink key={to} to={to} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}><span className="nav-icon" aria-hidden="true">{icon}</span><span>{label}</span></NavLink>)}</nav><div className="sidebar-footer"><span className="secure-dot" /> Secure payroll workspace</div></aside>;
}
export default Sidebar;
