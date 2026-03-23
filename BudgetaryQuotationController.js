import db from "../models/index.js";
import path from "path";
import fs from "fs";
import multer from "multer";

const BudgetaryQuotationModel = db.BudgetaryQuotationModel;

/* ============================
   CREATE (BULK)
============================ */
export const CreateBudgetaryQuotationBulk = async (req, res) => {
  try {
    const BulkData = req.body.excelData;
    console.log("CreateBudgetaryQuotationBulk called", BulkData);

    const insertedRecords = await BudgetaryQuotationModel.bulkCreate(BulkData, {
      validate: true,
    });

    res.status(200).json({
      success: true,
      data: insertedRecords,
      message: "All records inserted successfully",
      error: {},
    });
  } catch (error) {
    console.error("Error in CreateBudgetaryQuotationBulk:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        data: [],
        message: "Duplicate key value violates unique constraint",
        error: error,
      });
    }

    res.status(500).json({
      success: false,
      data: [],
      message: "An error occurred",
      error: error,
    });
  }
};

/* ============================
   READ (ALL)
============================ */
export const GetBudgetaryQuotation = (request, response) => {
  BudgetaryQuotationModel.findAll({ raw: true })
    .then((data) => {
      response.json({ data });
    })
    .catch((err) => {
      console.log(err);
      response.json({ data: "No data found for GetBudgetaryQuotation" });
    });
};

/* ============================
   CREATE (SINGLE)
============================ */
export const CreateBudgetaryQuotation = (req, res) => {
  const BudgetaryQuotationModelEx = {
    bqTitle:                      req.body.bqTitle,
    customerName:                 req.body.customerName,
    customerAddress:              req.body.customerAddress,
    leadOwner:                    req.body.leadOwner,
    defenceAndNonDefence:         req.body.defenceAndNonDefence,
    estimateValueInCrWithoutGST:  req.body.estimateValueInCrWithoutGST,
    submittedValueInCrWithoutGST: req.body.submittedValueInCrWithoutGST,
    dateOfLetterSubmission:       req.body.dateOfLetterSubmission,
    referenceNo:                  req.body.referenceNo,
    JSON_competitors:             req.body.JSON_competitors,
    presentStatus:                req.body.presentStatus,
    OperatorId:                   req.body.OperatorId,
    OperatorName:                 req.body.OperatorName,
    OperatorRole:                 req.body.OperatorRole,
    OperatorSBU:                  req.body.OperatorSBU,
  };

  BudgetaryQuotationModel.create(BudgetaryQuotationModelEx)
    .then((data) => {
      console.log("CreateBudgetaryQuotation: success");
      res.send(data);
    })
    .catch((err) => {
      console.log("CreateBudgetaryQuotation: error", err);
      res.status(500).send({
        message: err.message || "Some error occurred while creating Budgetary Quotation.",
      });
    });
};

/* ============================
   UPDATE
============================ */
export const UpdateBudgetaryQuotation = (req, res) => {
  console.log("UpdateBudgetaryQuotation req.body:", req.body);

  const id = req.body.id;

  if (!id) {
    return res.status(400).json({
      success: false,
      data: null,
      message: "Quotation ID is required",
    });
  }

  BudgetaryQuotationModel.update(req.body, { where: { id } })
    .then((num) => {
      if (num[0] === 1) {
        console.log("UpdateBudgetaryQuotation: success");
        return res.status(200).json({
          success: true,
          data: num,
          message: "Budgetary Quotation updated successfully",
        });
      }
      console.log("UpdateBudgetaryQuotation: no record found");
      return res.status(404).json({
        success: false,
        message: `Cannot update Budgetary Quotation with id=${id}. Record not found or request body is empty.`,
      });
    })
    .catch((err) => {
      console.log("UpdateBudgetaryQuotation: error", err);
      return res.status(500).json({
        success: false,
        message: "Error updating BudgetaryQuotation with id=" + id,
        error: err,
      });
    });
};

/* ============================
   DELETE
============================ */
export const DeleteBudgetaryQuotation = (req, res) => {
  const id = req.body["id"];

  if (!id) {
    return res.status(400).json({
      success: false,
      data: null,
      message: "Quotation ID is required",
    });
  }

  BudgetaryQuotationModel.destroy({ where: { id } })
    .then((num) => {
      if (num === 1) {
        console.log("DeleteBudgetaryQuotation: success");
        return res.status(200).json({
          success: true,
          message: "Budgetary Quotation deleted successfully",
        });
      }
      console.log("DeleteBudgetaryQuotation: no record found");
      return res.status(404).json({
        success: false,
        message: `Cannot delete Budgetary Quotation with id=${id}. Record not found.`,
      });
    })
    .catch((err) => {
      console.log("DeleteBudgetaryQuotation: error", err);
      return res.status(500).json({
        success: false,
        message: "Error deleting Budgetary Quotation with id=" + id,
        error: err,
      });
    });
};

/* ============================
   FILE UPLOAD
============================ */

const __dirname = path.resolve();
const UPLOADS_DIR = path.join(__dirname, "uploads");

// Multer storage config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename:    (_req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});
const upload = multer({ storage });

export const UploadFile = (req, res) => {
  console.log("UploadFile: saving to disk");

  upload.single("video")(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.log("UploadFile: Multer error", err);
      return res.status(500).json({ error: err });
    }
    if (err) {
      console.log("UploadFile: unknown error", err);
      return res.status(500).json({ error: err });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        fileName: req.file.filename,
        dateTime: new Date().toString(),
        filePath: UPLOADS_DIR,
      },
    });
  });
};

/* ============================
   FILE DOWNLOAD
   BUG FIX: the original code had the if/else branches swapped —
   it was streaming when the path was NOT a file, and returning an
   error when it WAS a file. Corrected below.
============================ */
export const DownloadFile = (req, res) => {
  try {
    const hardDiskFileName = req.query.hardDiskFileName;
    console.log("DownloadFile query:", req.query);

    if (!hardDiskFileName) {
      return res.status(400).json({
        success: false,
        message: "File name (hardDiskFileName) is required",
      });
    }

    const fullPath = path.join(UPLOADS_DIR, hardDiskFileName);
    console.log("DownloadFile full path:", fullPath);

    // Check existence first
    if (!fs.existsSync(fullPath)) {
      console.error("DownloadFile: file does not exist");
      return res.status(404).json({
        success: false,
        data: null,
        message: "The specified file does not exist",
        error: {},
      });
    }

    const fileStats = fs.statSync(fullPath);

    // ✅ FIXED: stream only when the path IS a regular file (was inverted before)
    if (fileStats.isFile()) {
      const fileStream = fs.createReadStream(fullPath);
      res.writeHead(200, {
        "Content-Type":   "application/pdf",
        "Content-Length": fileStats.size,
      });
      fileStream.pipe(res);
      console.log(`DownloadFile: sent ${hardDiskFileName} successfully`);
    } else {
      // Path exists but is a directory or other non-file entry
      console.error("DownloadFile: path is not a regular file");
      return res.status(400).json({
        success: false,
        message: "The specified path is not a file",
      });
    }
  } catch (error) {
    console.error("DownloadFile: error", error);
    return res.status(500).json({
      success: false,
      data: null,
      message: "Error while downloading the document",
      error: error,
    });
  }
};
