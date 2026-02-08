const uploadService = require("./upload.service");

async function uploadImage(req, res) {
  const { file, filename } = req.validated.body;
  const image = await uploadService.uploadImageToCloudinary(file, filename);

  res.status(201).json({
    status: "success",
    data: { image },
  });
}

module.exports = { uploadImage };
