import { useEffect, useState } from "react";
import axios from "axios";
function Dashboard() {
  const [stats, setStats] = useState({ totalEmployees: 0, pendingEmployees: 0, approvedEmployees: 0, processedPayslips: 0, failedRecords: 0 });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/dashboard/stats", { headers: { Authorization: `Bearer ${token}` } });
        setStats(response.data);
      } catch (error) { console.error("Dashboard Error:", error); }
      finally { setLoading(false); }
    };
    loadStats();
  }, []);
  const cards = [["Total employees", stats.totalEmployees, "♙"], ["Awaiting approval", stats.pendingEmployees, "◷"], ["Approved employees", stats.approvedEmployees, "✓"], ["Payslips processed", stats.processedPayslips, "▤"], ["Failed records", stats.failedRecords, "! "]];
  return <section className="page"><div className="dashboard-welcome"><div className="eyebrow">PAYROLL OPERATIONS</div><h1>Good day, Administrator</h1><p>Your payroll workspace at a glance. Review employee records and processing activity.</p></div>{loading ? <div className="data-panel empty-state">Loading your dashboard…</div> : <div className="metric-grid">{cards.map(([label, value, mark]) => <article className="metric-card" key={label}><span className="metric-mark">{mark}</span><div className="metric-label">{label}</div><div className="metric-value">{value}</div></article>)}</div>}<h2 className="section-title">Keep payroll moving</h2><div className="data-panel" style={{padding:"20px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}><div><strong style={{color:"#23483c",fontSize:13}}>Ready to process this period?</strong><p style={{fontSize:12,margin:"5px 0 0"}}>Upload the combined payroll PDF to begin processing.</p></div><a href="/upload" style={{textDecoration:"none"}}><button>Upload payroll PDF →</button></a></div></section>;
}
export default Dashboard;
