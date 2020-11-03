const fs = require('fs');

const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    console.log(filePath);
    if (err) {
      throw err;
    }
    console.log(`File successfully deleted.`);
  });
};

exports.delete = deleteFile;
