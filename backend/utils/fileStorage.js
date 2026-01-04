const { uploadToAzure, downloadFromAzure, deleteFromAzure } = require('./azureStorage');


exports.saveFile = async (fileBuffer, originalFilename, mimeType) => {
  try {
    const { blobName, blobUrl } = await uploadToAzure(fileBuffer, originalFilename, mimeType);
    return { blobName, blobUrl, success: true };
  } catch (error) {
    console.error('File save error:', error);
    throw new Error(`Failed to save file: ${error.message}`);
  }
};

exports.getFile = async (blobName) => {
  try {
    const fileBuffer = await downloadFromAzure(blobName);
    return fileBuffer;
  } catch (error) {
    console.error('File retrieval error:', error);
    throw new Error(`Failed to retrieve file: ${error.message}`);
  }
};


exports.deleteFile = async (blobName) => {
  try {
    await deleteFromAzure(blobName);
    return { success: true };
  } catch (error) {
    console.error('File deletion error:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};