/**
 * Library for storing and editing data
 */

// dependencies
const fs = require('fs');
const { join } = require('path');
const helpers = require('../helpers');

// Container for the module (to be expoted)
const lib = {};
// Base directory of the data folder
lib.baseDir = join(__dirname, '/../.data/');

// Write data to a file
lib.create = async (dir, file, data) => {
  return new Promise((resolve, reject) => {
    // Open the file for writing
    fs.open(join(`${lib.baseDir}${dir}/${file}.json`), 'wx', (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        // Convert data to string
        const stringData = JSON.stringify(data);
        // Write to file and close it
        fs.writeFile(fileDescriptor, stringData, (error) => {
          if (!error) {
            fs.close(fileDescriptor, (error) => {
              if (!error) {
                resolve(true);
              } else {
                reject('Error closing new file');
              }
            })
          } else {
            reject('Error writing to new file');
          }
        })
      } else {
        console.log(err);
        reject('Could not create new file, it may already exits', err);
      }
    });
  });
};

// Read data from a file
lib.read = (dir, fileName) => {
  return new Promise((resolve, reject) => {
    fs.readFile(`${lib.baseDir}${dir}/${fileName}.json`, 'utf-8', (err, data) => {
      if (!err && data) {
        const parsedData = helpers.parseJsonToObject(data);
        resolve(parsedData);
      } else {
        resolve(false);
        // reject(err);
      }
    });
  });
};

// Update data inside a file
lib.update = (dir, fileName, data) => {
  return new Promise((resolve, reject) => {
    // Open the file for writing
    fs.open(`${lib.baseDir}${dir}/${fileName}.json`, 'r+', (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        // Convert the file to string
        const stringData = JSON.stringify(data);
        // Truncate the file
        fs.ftruncate(fileDescriptor, (err) => {
          if (!err) {
            // Write to the file and close it
            fs.writeFile(fileDescriptor, stringData, (err) => {
              if (!err) {
                fs.close(fileDescriptor, (err) => {
                  if (!err) {
                    resolve(true);
                  } else {
                    reject('Error closing the existing file');
                  }
                });
              } else {
                reject('Error writing to existing file');
              }
            });
          } else {
            reject('Error trucating file');
          }
        });
      } else {
        reject('Cound not open the file for updating, it may not exist yet');
      }
    });
  });
};

// Delete a file
lib.delete = (dir, fileName) => {
  return new Promise((resolve, reject) => {
    // Unlink the file
    fs.unlink(`${lib.baseDir}${dir}/${fileName}.json`, (err) => {
      if (!err) {
        resolve(true);
      } else {
        reject('Error deleting file');
      }
    });
  });
};

// List all the items in a directory
lib.list = (dir, onlyFileNames = false) => {
  return new Promise((resolve, reject) => {
    fs.readdir(`${lib.baseDir}${dir}/`, async (err, data) => {
      if (!err && data && data.length > 0) {
        const trimmedFileNames = [];
        data.forEach((fileName) => {
          trimmedFileNames.push(fileName.replace('.json', ''));
        });
        // Get file content
        if (!onlyFileNames) {
          const _content = [];
          for (let i = 0; i < trimmedFileNames.length; i++) {
            const data  = await lib.read(dir, trimmedFileNames[i]);
            if (data) {
              _content.push(data);
            }
          }
        resolve(_content);
        } else {
          resolve(trimmedFileNames);
        }
      } else {
        resolve(false);
        // reject(err);
      }
    });
  });
};

module.exports = lib;
