import { useEffect, useState } from "react";
import axios from "axios";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function Dashboard() {

  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingEmployees: 0,
    approvedEmployees: 0,
    processedPayslips: 0,
    failedRecords: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadStats = async () => {

      try {

        const token =
          localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:5000/api/dashboard/stats",
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

        console.log(
          "Dashboard Response:",
          response.data
        );

        setStats(response.data);

      } catch (error) {

        console.error(
          "Dashboard Error:",
          error
        );

      } finally {

        setLoading(false);

      }

    };

    loadStats();

  }, []);


  const cardStyle = {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "10px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.1)",
    minWidth: "220px",
    flex: "1",
    textAlign: "center"
  };


  return (

    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8fafc"
      }}
    >

      {/* SIDEBAR */}

      <Sidebar />


      {/* MAIN CONTENT */}

      <div
        style={{
          flex: 1
        }}
      >

        {/* HEADER */}

        <Header />


        {/* DASHBOARD CONTENT */}

        <div
          style={{
            padding: "30px"
          }}
        >

          <h1>
            NOHE Payroll Dashboard
          </h1>


          {loading ? (

            <p>
              Loading dashboard statistics...
            </p>

          ) : (

            <div
              style={{
                display: "flex",
                gap: "25px",
                flexWrap: "wrap",
                marginTop: "30px"
              }}
            >

              {/* TOTAL EMPLOYEES */}

              <div style={cardStyle}>

                <h3>
                  Total Employees
                </h3>

                <h1>
                  {stats.totalEmployees}
                </h1>

              </div>


              {/* PENDING EMPLOYEES */}

              <div style={cardStyle}>

                <h3>
                  Pending Employees
                </h3>

                <h1>
                  {stats.pendingEmployees}
                </h1>

              </div>


              {/* APPROVED EMPLOYEES */}

              <div style={cardStyle}>

                <h3>
                  Approved Employees
                </h3>

                <h1>
                  {stats.approvedEmployees}
                </h1>

              </div>


              {/* PROCESSED PAYSLIPS */}

              <div style={cardStyle}>

                <h3>
                  Processed Payslips
                </h3>

                <h1>
                  {stats.processedPayslips}
                </h1>

              </div>


              {/* FAILED RECORDS */}

              <div style={cardStyle}>

                <h3>
                  Failed Records
                </h3>

                <h1>
                  {stats.failedRecords}
                </h1>

              </div>

            </div>

          )}

        </div>

      </div>

    </div>

  );

}

export default Dashboard;