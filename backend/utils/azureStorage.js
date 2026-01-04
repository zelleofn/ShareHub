const { BlobServiceClient } = require('@azure/storage-blob');
const path = require('path');

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_CONTAINER_NAME;

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

function generateBlobName(originalFilename) {
  const timestamp = Date.now();
  const ext = path.extname(originalFilename);
  const name = path.basename(originalFilename, ext);
  return `${timestamp}-${name}${ext}`;
}

async function uploadToAzure(fileBuffer, originalFilename, mimeType) {
  try {
    const blobName = generateBlobName(originalFilename);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
      blobHTTPHeaders: { blobContentType: mimeType }
    });
    
    return {
      blobName,
      blobUrl: blockBlobClient.url,
      success: true
    };
  } catch (error) {
    console.error('Azure upload error:', error);
    throw new Error('Failed to upload file to Azure');
  }
}

async function downloadFromAzure(blobName) {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    const chunks = [];
    
    for await (const chunk of downloadBlockBlobResponse.readableStreamBody) {
      chunks.push(chunk);
    }
    
    return Buffer.concat(chunks);
  } catch (error) {
    console.error('Azure download error:', error);
    throw new Error('Failed to download file from Azure');
  }
}

async function deleteFromAzure(blobName) {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.delete();
    return { success: true };
  } catch (error) {
    console.error('Azure delete error:', error);
    throw new Error('Failed to delete file from Azure');
  }
}

module.exports = {
  uploadToAzure,
  downloadFromAzure,
  deleteFromAzure
};