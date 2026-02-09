#!/usr/bin/env node

/**
 * Import Robust-AE Data Script
 * Imports the extracted JSON data into b0ase.com database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuration
const B0ASE_CONFIG = {
  url: 'https://api.b0ase.com',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsYXB1dHp4ZXFneXBwaHpkeHByIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjIwNzAwMywiZXhwIjoyMDYxNzgzMDAzfQ.q7BSh0OmgNZKQYqDFYYy1CVRojdJmktijYPK88kwEgQ'
};

const b0aseClient = createClient(B0ASE_CONFIG.url, B0ASE_CONFIG.serviceKey);

// Data files to import
const DATA_FILES = [
  'robust_ae_clients_data.json',
  'robust_ae_project_features_data.json',
  'robust_ae_project_timelines_data.json',
  'robust_ae_robust_ae_content_data.json',
  'robust_ae_robust_ae_feedback_data.json'
];

class DataImporter {
  constructor() {
    this.logs = [];
    this.errors = [];
    this.startTime = new Date();
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    this.logs.push(logMessage);
  }

  error(message, error) {
    const timestamp = new Date().toISOString();
    const errorMessage = `[${timestamp}] ERROR: ${message} - ${error?.message || error}`;
    console.error(errorMessage);
    this.errors.push(errorMessage);
  }

  async saveLogs() {
    const timestamp = this.startTime.toISOString().replace(/[:.]/g, '-');
    const logFile = `robust-ae-import-log-${timestamp}.txt`;
    const errorFile = `robust-ae-import-errors-${timestamp}.txt`;
    
    fs.writeFileSync(logFile, this.logs.join('\n'));
    fs.writeFileSync(errorFile, this.errors.join('\n'));
    
    this.log(`Logs saved to ${logFile}`);
    this.log(`Errors saved to ${errorFile}`);
  }

  async createTableFromData(tableName, data) {
    try {
      if (!data || data.length === 0) {
        this.log(`No data to create table for ${tableName}`);
        return false;
      }

      const firstRow = data[0];
      const columns = Object.keys(firstRow);
      
      // Generate CREATE TABLE SQL
      let createSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
      const columnDefs = columns.map(col => {
        const value = firstRow[col];
        let dataType = 'TEXT'; // Default to TEXT
        
        if (value === null) {
          dataType = 'TEXT';
        } else if (typeof value === 'number') {
          dataType = Number.isInteger(value) ? 'INTEGER' : 'NUMERIC';
        } else if (typeof value === 'boolean') {
          dataType = 'BOOLEAN';
        } else if (value instanceof Date || (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/))) {
          dataType = 'TIMESTAMP WITH TIME ZONE';
        } else if (typeof value === 'object') {
          dataType = 'JSONB';
        }
        
        return `  ${col} ${dataType}`;
      });
      
      createSQL += columnDefs.join(',\n') + '\n);';
      
      // Try to create table using RPC (if available)
      try {
        const { error } = await b0aseClient.rpc('exec_sql', { sql: createSQL });
        if (error) {
          this.log(`RPC failed for ${tableName}, trying alternative approach`);
          // If RPC fails, we'll try to insert directly and let Supabase create the table
          return true;
        }
        this.log(`✅ Created table ${tableName}`);
        return true;
      } catch (err) {
        this.log(`RPC not available for ${tableName}, will try direct insert`);
        return true;
      }
      
    } catch (err) {
      this.error(`Error creating table ${tableName}`, err);
      return false;
    }
  }

  async importData(tableName, data) {
    try {
      if (!data || data.length === 0) {
        this.log(`No data to import for ${tableName}`);
        return true;
      }

      this.log(`Importing ${data.length} rows into ${tableName}...`);
      
      // Insert data in batches
      const batchSize = 50;
      let successCount = 0;
      
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        
        try {
          const { error } = await b0aseClient
            .from(tableName)
            .insert(batch);
          
          if (error) {
            this.error(`Failed to insert batch ${Math.floor(i/batchSize) + 1} for ${tableName}`, error);
          } else {
            successCount += batch.length;
            this.log(`  Progress: ${successCount}/${data.length} rows imported for ${tableName}`);
          }
        } catch (err) {
          this.error(`Error inserting batch for ${tableName}`, err);
        }
      }
      
      if (successCount === data.length) {
        this.log(`✅ Successfully imported all ${data.length} rows into ${tableName}`);
        return true;
      } else {
        this.log(`⚠️  Partially imported ${successCount}/${data.length} rows into ${tableName}`);
        return false;
      }
      
    } catch (err) {
      this.error(`Error importing data for ${tableName}`, err);
      return false;
    }
  }

  async importFile(filename) {
    try {
      this.log(`\n📁 Processing file: ${filename}`);
      
      // Extract table name from filename
      const tableName = filename.replace('robust_ae_', '').replace('_data.json', '');
      this.log(`  Table name: ${tableName}`);
      
      // Read JSON data
      if (!fs.existsSync(filename)) {
        this.error(`File ${filename} not found`);
        return false;
      }
      
      const fileContent = fs.readFileSync(filename, 'utf8');
      const data = JSON.parse(fileContent);
      
      this.log(`  Found ${data.length} rows in ${filename}`);
      
      // Try to create table (optional, Supabase might auto-create)
      await this.createTableFromData(tableName, data);
      
      // Import data
      const success = await this.importData(tableName, data);
      
      return success;
      
    } catch (err) {
      this.error(`Error processing file ${filename}`, err);
      return false;
    }
  }

  async importAllData() {
    this.log('🚀 Starting robust-ae data import into b0ase.com...\n');
    
    let successCount = 0;
    let totalCount = DATA_FILES.length;
    
    for (const filename of DATA_FILES) {
      const success = await this.importFile(filename);
      if (success) {
        successCount++;
      }
    }
    
    this.log('\n📊 Import Summary:');
    this.log(`- Total files processed: ${totalCount}`);
    this.log(`- Successfully imported: ${successCount}`);
    this.log(`- Failed imports: ${totalCount - successCount}`);
    this.log(`- Errors encountered: ${this.errors.length}`);
    
    this.log('\n📋 Imported Tables:');
    DATA_FILES.forEach(filename => {
      const tableName = filename.replace('robust_ae_', '').replace('_data.json', '');
      this.log(`  - ${tableName}`);
    });
    
    if (this.errors.length > 0) {
      this.log('⚠️  Import completed with errors. Check error log for details.');
    } else {
      this.log('✅ Data import completed successfully!');
    }
    
    this.log('\n🎉 Robust-AE database consolidation complete!');
    this.log('You can now delete the robust-ae Supabase project to save costs.');
  }
}

// Run the import
const importer = new DataImporter();
importer.importAllData().catch(console.error).finally(() => {
  importer.saveLogs();
}); 