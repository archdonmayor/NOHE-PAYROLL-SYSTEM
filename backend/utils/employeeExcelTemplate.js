const XLSX = require("xlsx");

function generateEmployeeTemplate() {

    // Main employee template
    const employeeHeaders = [
        "IPPIS Number",
        "Full Name",
        "Email",
        "Department",
        "Designation"
    ];

    // Example row showing HR the expected format
    const exampleRow = [
        "267229",
        "EKE, Mr. ARINZE CHRISTOPHER",
        "arinze@nohe.gov.ng",
        "ICT",
        "ICT Officer"
    ];

    const employeeData = [
        employeeHeaders,
        exampleRow
    ];

    const employeeSheet = XLSX.utils.aoa_to_sheet(employeeData);

    // Set column widths
    employeeSheet["!cols"] = [
        { wch: 18 },
        { wch: 35 },
        { wch: 35 },
        { wch: 25 },
        { wch: 35 }
    ];


    // Instructions sheet
    const instructionsData = [
        ["NOHE EMPLOYEE UPLOAD TEMPLATE"],
        [""],
        ["Instructions"],
        ["1. Do not change the column names."],
        ["2. Enter one employee per row."],
        ["3. IPPIS Number is required."],
        ["4. Full Name is required."],
        ["5. Email is required."],
        ["6. Department is required."],
        ["7. Designation is required."],
        ["8. Do not leave required fields blank."],
        ["9. Do not enter duplicate IPPIS numbers."],
        ["10. Use a valid employee email address."],
        [""],
        ["IMPORTANT"],
        ["Employees with complete information will be added to the Employees database."],
        ["Employees with missing or invalid information will be sent to Pending Employees for HR review."],
        [""],
        ["Example"],
        ["IPPIS Number", "Full Name", "Email", "Department", "Designation"],
        ["267229", "EKE, Mr. ARINZE CHRISTOPHER", "arinze@nohe.gov.ng", "ICT", "ICT Officer"]
    ];

    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);

    instructionsSheet["!cols"] = [
        { wch: 90 },
        { wch: 35 },
        { wch: 35 },
        { wch: 25 },
        { wch: 35 }
    ];


    // Create workbook
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        employeeSheet,
        "Employees"
    );

    XLSX.utils.book_append_sheet(
        workbook,
        instructionsSheet,
        "Instructions"
    );


    // Generate Excel file in memory
    const buffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx"
    });

    return buffer;
}

module.exports = {
    generateEmployeeTemplate
};