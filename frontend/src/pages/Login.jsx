import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const handleLogin = async (e) => {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (error) { setError(error.response?.data?.message || "We couldn’t sign you in. Check your details and try again."); }
    finally { setBusy(false); }
  };
  return <main className="login-page"><section className="login-aside"><a className="brand" href="/"><span className="brand-mark">N</span><span><strong>NOHE</strong><small>PAYROLL</small></span></a><div className="eyebrow" style={{color:"#a9e4c5"}}>PEOPLE · PAYROLL · CLARITY</div><h2>Payroll operations, made easier.</h2><p>A secure workspace to manage employee records and keep every payroll cycle moving with confidence.</p><div className="login-aside-note">A clearer view of your people and payroll.</div></section><section className="login-form-side"><form className="login-card" onSubmit={handleLogin}><div className="eyebrow">ADMINISTRATOR ACCESS</div><h1>Sign in to NOHE</h1><p>Use your administrator account to continue to your payroll workspace.</p><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="username" placeholder="name@organization.com" value={email} onChange={e=>setEmail(e.target.value)} required/><label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)} required/>{error && <p role="alert" style={{color:"#b34343",margin:"12px 0 0"}}>{error}</p>}<button type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in securely"}</button><div className="login-foot">Protected access for authorized payroll administrators</div></form></section></main>;
}
export default Login;
