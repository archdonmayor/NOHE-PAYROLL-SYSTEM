import { useEffect, useState } from "react";
import axios from "axios";

function MissingPayroll() {

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMissingEmployees = async () => {

    try {

      setLoading(true);

      const token =
        localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/missing-payroll",
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      setEmployees(
        response.data.employees
      );

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.message ||
        "Failed to load missing payroll employees"
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadMissingEmployees();

  }, []);


  if (loading) {

    return (
      <div className="page">

        <h1>
          Missing From Payroll
        </h1>

        <p>
          Loading...
        </p>

      </div>
    );

  }


  return (

    <div className="page">

      <h1>
        Missing From Payroll
      </h1>

      <p>
        Employees registered in the employee
        database but not found in a payroll upload.
      </p>

      <button
        onClick={loadMissingEmployees}
        style={{
          padding: "10px 15px",
          marginBottom: "20px",
          cursor: "pointer"
        }}
      >
        Refresh
      </button>


      <table
        border="1"
        cellPadding="10"
        cellSpacing="0"
        width="100%"
        style={{
          borderCollapse: "collapse"
        }}
      >

        <thead>

          <tr>

            <th>
              ID
            </th>

            <th>
              IPPIS
            </th>

            <th>
              Employee Name
            </th>

            <th>
              Payroll Period
            </th>

            <th>
              Status
            </th>

            <th>
              Reason
            </th>

            <th>
              Created
            </th>

          </tr>

        </thead>


        <tbody>

          {employees.length === 0 ? (

            <tr>

              <td
                colSpan="7"
                style={{
                  textAlign: "center",
                  padding: "20px"
                }}
              >
                No employees are currently
                marked as missing from payroll.
              </td>

            </tr>

          ) : (

            employees.map(
              (employee) => (

                <tr key={employee.id}>

                  <td>
                    {employee.id}
                  </td>

                  <td>
                    {employee.ippis_number}
                  </td>

                  <td>
                    {employee.employee_name}
                  </td>

                  <td>
                    {employee.payroll_period || "-"}
                  </td>

                  <td>
                    {employee.status}
                  </td>

                  <td>
                    {employee.reason || "-"}
                  </td>

                  <td>
                    {employee.created_at
                      ? new Date(
                          employee.created_at
                        ).toLocaleString()
                      : "-"
                    }
                  </td>

                </tr>

              )
            )

          )}

        </tbody>

      </table>

    </div>

  );

}

export default MissingPayroll;