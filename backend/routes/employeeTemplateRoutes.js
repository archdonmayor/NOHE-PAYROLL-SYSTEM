const express = require("express");

const {
    generateEmployeeTemplate
} = require("../utils/employeeExcelTemplate");

const router = express.Router();


router.get("/template", async (req, res) => {

    try {

        const templateBuffer =
            generateEmployeeTemplate();

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            'attachment; filename="NOHE_Employee_Template.xlsx"'
        );

        return res.send(templateBuffer);

    } catch (error) {

        console.error(
            "TEMPLATE DOWNLOAD ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to generate employee template."
        });

    }

});


module.exports = router;