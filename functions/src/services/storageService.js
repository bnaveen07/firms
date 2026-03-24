const { getStorage } = require('../config/firebase-admin');
const path = require('path');
const logger = require('../utils/logger');

const uploadFile = async (buffer, filename, contentType, folder = 'uploads') => {
  try {
    const storage = getStorage();
    const destination = `${folder}/${Date.now()}-${filename}`;
    const file = storage.file(destination);

    await file.save(buffer, { contentType, public: true });
    const [url] = await file.getSignedUrl({ action: 'read', expires: '01-01-2100' });
    return url;
  } catch (error) {
    logger.error(`File upload error: ${error.message}`);
    throw error;
  }
};

const deleteFile = async (fileUrl) => {
  try {
    const storage = getStorage();
    const fileName = fileUrl.split('/').slice(-1)[0].split('?')[0];
    await storage.file(fileName).delete();
  } catch (error) {
    logger.error(`File delete error: ${error.message}`);
  }
};

module.exports = { uploadFile, deleteFile };
