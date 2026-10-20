import { useState } from "react";
import axios from "axios";

function UploadPayroll() {

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {

    if (!file) {
      alert("Please select a PDF file");
      return;
    }

    try {

      setUploading(true);

      const token =
        localStorage.getItem("token");

      const formData = new FormData();

      formData.append(
        "payroll",
        file
      );

      const response =
        await axios.post(
          "http://localhost:5000/api/payroll/upload",
          formData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "multipart/form-data"
            }
          }
        );

      alert(
        response.data.message
      );

      console.log(
        response.data
      );

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.message ||
        "Upload failed"
      );

    } finally {

      setUploading(false);

    }

  };

  return (
    <div
      style={{
        padding: "20px"
      }}
    >
      <h1>
        Upload Payroll PDF
      </h1>

      <p>
        Upload the combined payroll PDF.
      </p>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) =>
          setFile(
            e.target.files[0]
          )
        }
      />

      <br />
      <br />

      <button
        onClick={handleUpload}
        disabled={uploading}
      >
        {uploading
          ? "Uploading..."
          : "Upload PDF"}
      </button>

    </div>
  );
}

export default UploadPayroll;