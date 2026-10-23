import { useEffect, useState } from "react";
import axios from "axios";

function Employees() {

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [formData, setFormData] = useState({
    ippis_number: "",
    full_name: "",
    email: "",
    department: "",
    designation: ""
  });


  const fetchEmployees = async () => {

    try {

      const token = localStorage.getItem("token");

const response = await axios.get(
  "http://localhost:5000/api/employees",
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

      setEmployees(response.data);

    } catch (error) {

      console.error(error);

      alert("Failed to load employees");

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    fetchEmployees();

  }, []);


  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      if (editingEmployee) {

        const token = localStorage.getItem("token");

await axios.put(
  `http://localhost:5000/api/employees/${editingEmployee.id}`,
  formData,
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

        alert("Employee updated successfully");

      } else {

        const token = localStorage.getItem("token");

await axios.post(
  "http://localhost:5000/api/employees",
  formData,
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

        alert("Employee added successfully");

      }


      resetForm();

      fetchEmployees();

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.message ||
        "Operation failed"
      );

    }

  };


  const handleEdit = (employee) => {

    setEditingEmployee(employee);

    setFormData({
      ippis_number: employee.ippis_number,
      full_name: employee.full_name,
      email: employee.email,
      department: employee.department || "",
      designation: employee.designation || ""
    });

    setShowForm(true);

  };


  const handleDelete = async (employee) => {

    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.full_name}?`
    );

    if (!confirmed) {
      return;
    }


    try {

      const token = localStorage.getItem("token");

await axios.delete(
  `http://localhost:5000/api/employees/${employee.id}`,
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

      alert("Employee deleted successfully");

      fetchEmployees();

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.message ||
        "Failed to delete employee"
      );

    }

  };


  const resetForm = () => {

    setFormData({
      ippis_number: "",
      full_name: "",
      email: "",
      department: "",
      designation: ""
    });

    setEditingEmployee(null);
    setShowForm(false);

  };


  return (

    <div className="page">

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >

        <div>

          <h1>Employees</h1>

          <p>
            Manage employees registered in the
            NOHE Payroll System.
          </p>

        </div>


        <button
          onClick={() => {

            if (showForm) {

              resetForm();

            } else {

              setShowForm(true);

            }

          }}
          style={{
            padding: "10px 18px",
            background: "#1e293b",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >

          {showForm
            ? "Close Form"
            : "Add Employee"}

        </button>

      </div>


      {showForm && (

        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            background: "#f8fafc"
          }}
        >

          <h2>

            {editingEmployee
              ? "Edit Employee"
              : "Add New Employee"}

          </h2>


          <form onSubmit={handleSubmit}>

            <div style={{ marginBottom: "15px" }}>

              <label>
                IPPIS Number
              </label>

              <br />

              <input
                type="text"
                name="ippis_number"
                value={formData.ippis_number}
                onChange={handleChange}
                placeholder="Enter IPPIS number"
                required
                style={inputStyle}
              />

            </div>


            <div style={{ marginBottom: "15px" }}>

              <label>
                Full Name
              </label>

              <br />

              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter employee full name"
                required
                style={inputStyle}
              />

            </div>


            <div style={{ marginBottom: "15px" }}>

              <label>
                Email Address
              </label>

              <br />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter employee email"
                required
                style={inputStyle}
              />

            </div>


            <div style={{ marginBottom: "15px" }}>

              <label>
                Department
              </label>

              <br />

              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Enter department"
                style={inputStyle}
              />

            </div>


            <div style={{ marginBottom: "15px" }}>

              <label>
                Designation
              </label>

              <br />

              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="Enter designation"
                style={inputStyle}
              />

            </div>


            <button
              type="submit"
              style={{
                padding: "10px 20px",
                background: "green",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >

              {editingEmployee
                ? "Update Employee"
                : "Save Employee"}

            </button>


            <button
              type="button"
              onClick={resetForm}
              style={{
                padding: "10px 20px",
                marginLeft: "10px",
                background: "#64748b",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >

              Cancel

            </button>

          </form>

        </div>

      )}


      {loading ? (

        <p>Loading employees...</p>

      ) : employees.length === 0 ? (

        <p>No employees found.</p>

      ) : (

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px"
          }}
        >

          <thead>

            <tr>

              <th style={tableHeaderStyle}>
                ID
              </th>

              <th style={tableHeaderStyle}>
                IPPIS Number
              </th>

              <th style={tableHeaderStyle}>
                Full Name
              </th>

              <th style={tableHeaderStyle}>
                Email
              </th>

              <th style={tableHeaderStyle}>
                Department
              </th>

              <th style={tableHeaderStyle}>
                Designation
              </th>

              <th style={tableHeaderStyle}>
                Status
              </th>

              <th style={tableHeaderStyle}>
                Actions
              </th>

            </tr>

          </thead>


          <tbody>

            {employees.map((employee) => (

              <tr key={employee.id}>

                <td style={tableCellStyle}>
                  {employee.id}
                </td>

                <td style={tableCellStyle}>
                  {employee.ippis_number}
                </td>

                <td style={tableCellStyle}>
                  {employee.full_name}
                </td>

                <td style={tableCellStyle}>
                  {employee.email}
                </td>

                <td style={tableCellStyle}>
                  {employee.department || "-"}
                </td>

                <td style={tableCellStyle}>
                  {employee.designation || "-"}
                </td>

                <td style={tableCellStyle}>

                  {employee.status ? (

                    <span style={{ color: "green" }}>
                      Active
                    </span>

                  ) : (

                    <span style={{ color: "red" }}>
                      Inactive
                    </span>

                  )}

                </td>


                <td style={tableCellStyle}>

                  <button
                    onClick={() => handleEdit(employee)}
                    style={{
                      marginRight: "8px",
                      padding: "6px 10px",
                      cursor: "pointer"
                    }}
                  >
                    Edit
                  </button>


                  <button
                    onClick={() => handleDelete(employee)}
                    style={{
                      padding: "6px 10px",
                      cursor: "pointer"
                    }}
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      )}

    </div>
  );
}


const inputStyle = {
  width: "100%",
  maxWidth: "500px",
  padding: "10px",
  marginTop: "5px",
  border: "1px solid #cbd5e1",
  borderRadius: "5px",
  boxSizing: "border-box"
};


const tableHeaderStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "left",
  background: "#f1f5f9"
};


const tableCellStyle = {
  border: "1px solid #ddd",
  padding: "10px"
};


export default Employees;