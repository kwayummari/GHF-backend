const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../models');

// Get all model files
const modelFiles = fs.readdirSync(modelsDir)
  .filter(file => file.endsWith('.js') && file !== 'index.js')
  .map(file => path.join(modelsDir, file));

// Update each model file
modelFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Remove any dbConfig.js imports and replace with correct Sequelize initialization
    const newContent = content
      .replace(/const sequelize = require\('.*dbConfig.*'\);/, '')
      .replace(/const { DataTypes } = require\('sequelize'\);/, `
const { DataTypes, Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.development);`);

    fs.writeFileSync(file, newContent);
    console.log(`Updated ${path.basename(file)}`);
  } catch (error) {
    console.error(`Error updating ${path.basename(file)}:`, error);
  }
});
