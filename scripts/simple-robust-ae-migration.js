#!/usr/bin/env node

/**
 * Simple Robust-AE Migration Script
 * Uses Supabase's built-in operations to migrate data
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuration
const ROBUST_AE_CONFIG = {
  url: 'https://uolnhghdqgoqzqlzkein.supabase.co',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvbG5oZ2hkcWdvcXpxbHprZWluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ3NzQ1MCwiZXhwIjoyMDY1MDUzNDUwfQ.Pcu-nUOqw35nTmb5rPmQMROdrLLyMupMQtN34i1kFhw'
};

const B0ASE_CONFIG = {
  url: 'https://api.b0ase.com',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsYXB1dHp4ZXFneXBwaHpkeHByIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjIwNzAwMywiZXhwIjoyMDYxNzgzMDAzfQ.q7BSh0OmgNZKQYqDFYYy1CVRojdJmktijYPK88kwEgQ'
};

const robustAeClient = createClient(ROBUST_AE_CONFIG.url, ROBUST_AE_CONFIG.serviceKey);
const b0aseClient = createClient(B0ASE_CONFIG.url, B0ASE_CONFIG.serviceKey);

// Tables with data that we found
const TABLES_WITH_DATA = [
  { name: 'clients', expectedRows: 2 },
  { name: 'project_features', expectedRows: 19 },
  { name: 'project_timelines', expectedRows: 11 },
  { name: 'robust_ae_content', expectedRows: 1 },
  { name: 'robust_ae_feedback', expectedRows: 8 }
];

class SimpleMigrator {
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
    const logFile = `simple-robust-ae-migration-log-${timestamp}.txt`;
    const errorFile = `simple-robust-ae-migration-errors-${timestamp}.txt`;
    
    fs.writeFileSync(logFile, this.logs.join('\n'));
    fs.writeFileSync(errorFile, this.errors.join('\n'));
    
    this.log(`Logs saved to ${logFile}`);
    this.log(`Errors saved to ${errorFile}`);
  }

  async getTableData(tableName) {
    try {
      const { data, error } = await robustAeClient
        .from(tableName)
        .select('*');
      
      if (error) {
        this.error(`Failed to get data from ${tableName}`, error);
        return null;
      }
      
      return data;
    } catch (err) {
      this.error(`Error getting data from ${tableName}`, err);
      return null;
    }
  }

  async saveDataToFile(tableName, data) {
    try {
      const filename = `robust_ae_${tableName}_data.json`;
      fs.writeFileSync(filename, JSON.stringify(data, null, 2));
      this.log(`✅ Saved ${data.length} rows from ${tableName} to ${filename}`);
      return filename;
    } catch (err) {
      this.error(`Failed to save data for ${tableName}`, err);
      return null;
    }
  }

  async migrateTable(tableInfo) {
    this.log(`\n📋 Migrating table: ${tableInfo.name}`);
    
    try {
      // Get data from robust-ae
      const data = await this.getTableData(tableInfo.name);
      if (data === null) {
        return false;
      }
      
      this.log(`  Found ${data.length} rows in ${tableInfo.name}`);
      
      if (data.length === 0) {
        this.log(`  ⚠️  Table ${tableInfo.name} is empty, skipping`);
        return true;
      }
      
      // Save data to file for manual import
      const filename = await this.saveDataToFile(tableInfo.name, data);
      if (!filename) {
        return false;
      }
      
      // Show sample data structure
      if (data.length > 0) {
        const sampleRow = data[0];
        this.log(`  📊 Sample data structure:`);
        Object.keys(sampleRow).forEach(key => {
          const value = sampleRow[key];
          const type = typeof value;
          const preview = value !== null ? String(value).substring(0, 50) : 'null';
          this.log(`    - ${key}: ${type} (${preview}${String(value).length > 50 ? '...' : ''})`);
        });
      }
      
      return true;
      
    } catch (err) {
      this.error(`Error migrating table ${tableInfo.name}`, err);
      return false;
    }
  }

  async migrateAllTables() {
    this.log('🚀 Starting simple robust-ae data extraction...\n');
    
    let successCount = 0;
    let totalCount = TABLES_WITH_DATA.length;
    
    for (const tableInfo of TABLES_WITH_DATA) {
      const success = await this.migrateTable(tableInfo);
      if (success) {
        successCount++;
      }
    }
    
    this.log('\n📊 Migration Summary:');
    this.log(`- Total tables attempted: ${totalCount}`);
    this.log(`- Successfully extracted: ${successCount}`);
    this.log(`- Failed extractions: ${totalCount - successCount}`);
    this.log(`- Errors encountered: ${this.errors.length}`);
    
    this.log('\n📁 Data Files Created:');
    TABLES_WITH_DATA.forEach(table => {
      this.log(`  - robust_ae_${table.name}_data.json`);
    });
    
    this.log('\n📋 Next Steps:');
    this.log('1. Review the JSON files to understand the data structure');
    this.log('2. Create corresponding tables in b0ase.com database');
    this.log('3. Import the data using the JSON files');
    this.log('4. Update your robust-ae application to use b0ase.com database');
    
    if (this.errors.length > 0) {
      this.log('⚠️  Extraction completed with errors. Check error log for details.');
    } else {
      this.log('✅ Data extraction completed successfully!');
    }
  }
}

// Run the migration
const migrator = new SimpleMigrator();
migrator.migrateAllTables().catch(console.error).finally(() => {
  migrator.saveLogs();
}); 