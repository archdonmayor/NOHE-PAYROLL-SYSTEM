import { useEffect, useState } from "react";
import axios from "axios";

function PendingEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");

  const [approving, setApproving] = useState(false);

  const loadEmployees = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/pending-employees",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setEmployees(response.data.employees);
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "Failed to load pending employees"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const openApprovalForm = (employee) => {
    setSelectedEmployee(employee);

    setEmail(employee.email || "");
    setDepartment(employee.department || "");
    setDesignation(employee.designation || "");
  };

  const closeApprovalForm = () => {
    setSelectedEmployee(null);

    setEmail("");
    setDepartment("");
    setDesignation("");
  };

  const approveEmployee = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("Please enter the employee email");
      return;
    }

    if (!department.trim()) {
      alert("Please enter the department");
      return;
    }

    if (!designation.trim()) {
      alert("Please enter the designation");
      return;
    }

    try {
      setApproving(true);

      const token = localStorage.getItem("token");

      await axios.post(
        `http://localhost:5000/api/pending-employees/${selectedEmployee.id}/approve`,
        {
          email: email.trim(),
          department: department.trim(),
          designation: designation.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Employee approved successfully");

      closeApprovalForm();

      await loadEmployees();

    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "Failed to approve employee"
      );
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <h1>Pending Employees</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="page">

      <h1>Pending Employees</h1>

      <p>
        Employees found in payroll but not yet registered in the
        employee database.
      </p>

      <button
        onClick={loadEmployees}
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
            <th>ID</th>
            <th>IPPIS</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Designation</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {employees.length === 0 ? (

            <tr>
              <td
                colSpan="8"
                style={{
                  textAlign: "center",
                  padding: "20px"
                }}
              >
                No pending employees
              </td>
            </tr>

          ) : (

            employees.map((employee) => (

              <tr key={employee.id}>

                <td>
                  {employee.id}
                </td>

                <td>
                  {employee.ippis_number}
                </td>

                <td>
                  {employee.full_name}
                </td>

                <td>
                  {employee.email || "-"}
                </td>

                <td>
                  {employee.department || "-"}
                </td>

                <td>
                  {employee.designation || "-"}
                </td>

                <td>
                  {employee.status}
                </td>

                <td>

                  {employee.status === "PENDING" ? (

                    <button
                      onClick={() =>
                        openApprovalForm(employee)
                      }
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer"
                      }}
                    >
                      Approve
                    </button>

                  ) : (

                    <span>
                      Approved
                    </span>

                  )}

                </td>

              </tr>

            ))

          )}

        </tbody>
      </table>


      {/* APPROVAL FORM */}

      {selectedEmployee && (

        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >

          <div
            style={{
              background: "white",
              padding: "30px",
              width: "450px",
              maxWidth: "90%",
              borderRadius: "8px"
            }}
          >

            <h2>
              Approve Employee
            </h2>

            <p>
              <strong>IPPIS:</strong>{" "}
              {selectedEmployee.ippis_number}
            </p>

            <p>
              <strong>Name:</strong>{" "}
              {selectedEmployee.full_name}
            </p>


            <form onSubmit={approveEmployee}>

              <div style={{ marginBottom: "15px" }}>

                <label>
                  Email
                </label>

                <br />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="employee@example.com"
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "5px",
                    boxSizing: "border-box"
                  }}
                />

              </div>


              <div style={{ marginBottom: "15px" }}>

                <label>
                  Department
                </label>

                <br />

                <input
                  type="text"
                  value={department}
                  onChange={(e) =>
                    setDepartment(e.target.value)
                  }
                  placeholder="e.g. Nursing"
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "5px",
                    boxSizing: "border-box"
                  }}
                />

              </div>


              <div style={{ marginBottom: "20px" }}>

                <label>
                  Designation
                </label>

                <br />

                <input
                  type="text"
                  value={designation}
                  onChange={(e) =>
                    setDesignation(e.target.value)
                  }
                  placeholder="e.g. Chief Nursing Officer"
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "5px",
                    boxSizing: "border-box"
                  }}
                />

              </div>


              <div>

                <button
                  type="submit"
                  disabled={approving}
                  style={{
                    padding: "10px 15px",
                    marginRight: "10px",
                    cursor: approving
                      ? "not-allowed"
                      : "pointer"
                  }}
                >
                  {approving
                    ? "Approving..."
                    : "Approve Employee"}
                </button>


                <button
                  type="button"
                  onClick={closeApprovalForm}
                  disabled={approving}
                  style={{
                    padding: "10px 15px",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default PendingEmployees;