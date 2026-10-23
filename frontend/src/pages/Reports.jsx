import { useEffect, useState } from "react";
import axios from "axios";

function Reports() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const response =
        await axios.get(
          "http://localhost:5000/api/payroll/reports",
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      setRecords(
        response.data.records
      );

    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "Failed to load reports"
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <h1>Payroll Reports</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="page">

      <h1>Payroll Processing Reports</h1>

      <button
        onClick={fetchRecords}
        style={{
          marginBottom: "20px",
          padding: "10px 15px",
          cursor: "pointer"
        }}
      >
        Refresh Report
      </button>

      <table
        border="1"
        cellPadding="10"
        cellSpacing="0"
        style={{
          width: "100%",
          borderCollapse: "collapse"
        }}
      >

        <thead>
          <tr>
            <th>Page</th>
            <th>IPPIS</th>
            <th>Employee</th>
            <th>Email</th>
            <th>Filename</th>
            <th>Status</th>
            <th>Message</th>
            <th>Processed At</th>
          </tr>
        </thead>

        <tbody>

          {records.length === 0 ? (

            <tr>
              <td
                colSpan="8"
                style={{
                  textAlign: "center"
                }}
              >
                No processing records found.
              </td>
            </tr>

          ) : (

            records.map((record) => (

              <tr key={record.id}>

                <td>
                  {record.source_page}
                </td>

                <td>
                  {record.ippis_number || "-"}
                </td>

                <td>
                  {record.employee_name || "-"}
                </td>

                <td>
                  {record.employee_email || "-"}
                </td>

                <td>
                  {record.payslip_filename || "-"}
                </td>

                <td>
                  {record.status}
                </td>

                <td>
                  {record.message || "-"}
                </td>

                <td>
                  {record.processed_at
                    ? new Date(
                        record.processed_at
                      ).toLocaleString()
                    : "-"}
                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>
  );
}

export default Reports;