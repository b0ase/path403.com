#!/usr/bin/env node

/**
 * Migrate Robust-AE Tables Script
 * Directly migrates the 17 known tables from robust-ae to b0ase.com
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

// Known tables from the screenshot
const KNOWN_TABLES = [
  'attribute_options',
  'character_attributes',
  'clients',
  'generated_assets',
  'npgx_characters',
  'profiles',
  'project_features',
  'project_timelines',
  'projects',
  'robust_ae_content',
  'robust_ae_feedback',
  'teams',
  'test_table',
  'user_earnings',
  'user_npgx_characters',
  'user_profiles',
  'user_project_memberships'
];

class TableMigrator {
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
    const logFile = `robust-ae-tables-migration-log-${timestamp}.txt`;
    const errorFile = `robust-ae-tables-migration-errors-${timestamp}.txt`;
    
    fs.writeFileSync(logFile, this.logs.join('\n'));
    fs.writeFileSync(errorFile, this.errors.join('\n'));
    
    this.log(`Logs saved to ${logFile}`);
    this.log(`Errors saved to ${errorFile}`);
  }

  async checkTableExists(tableName) {
    try {
      const { data, error } = await robustAeClient
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
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

  async createTableInB0ase(tableName, sampleData) {
    try {
      // Generate CREATE TABLE SQL based on sample data
      if (!sampleData || sampleData.length === 0) {
        this.log(`Table ${tableName} is empty, creating basic structure`);
        const createSQL = `CREATE TABLE IF NOT EXISTS robust_ae_${tableName} (
          id SERIAL PRIMARY KEY,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`;
        
        const { error } = await b0aseClient.rpc('exec_sql', { sql: createSQL });
        if (error) {
          this.error(`Failed to create table robust_ae_${tableName}`, error);
          return false;
        }
        return true;
      }
      
      // Analyze the first row to determine column types
      const firstRow = sampleData[0];
      const columns = Object.keys(firstRow);
      
      let createSQL = `CREATE TABLE IF NOT EXISTS robust_ae_${tableName} (\n`;
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
      
      const { error } = await b0aseClient.rpc('exec_sql', { sql: createSQL });
      if (error) {
        this.error(`Failed to create table robust_ae_${tableName}`, error);
        return false;
      }
      
      return true;
    } catch (err) {
      this.error(`Error creating table ${tableName}`, err);
      return false;
    }
  }

  async insertDataToB0ase(tableName, data) {
    if (!data || data.length === 0) {
      this.log(`No data to insert for ${tableName}`);
      return true;
    }
    
    try {
      // Insert data in batches
      const batchSize = 100;
      let successCount = 0;
      
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        
        const { error } = await b0aseClient
          .from(`robust_ae_${tableName}`)
          .insert(batch);
        
        if (error) {
          this.error(`Failed to insert batch ${Math.floor(i/batchSize) + 1} for ${tableName}`, error);
        } else {
          successCount += batch.length;
          this.log(`  Progress: ${successCount}/${data.length} rows inserted for ${tableName}`);
        }
      }
      
      return successCount === data.length;
    } catch (err) {
      this.error(`Error inserting data for ${tableName}`, err);
      return false;
    }
  }

  async migrateTable(tableName) {
    this.log(`\n📋 Migrating table: ${tableName}`);
    
    try {
      // Check if table exists
      const exists = await this.checkTableExists(tableName);
      if (!exists) {
        this.log(`⚠️  Table ${tableName} does not exist, skipping`);
        return false;
      }
      
      // Get table data
      const data = await this.getTableData(tableName);
      if (data === null) {
        return false;
      }
      
      this.log(`  Found ${data.length} rows in ${tableName}`);
      
      // Create table in b0ase
      const tableCreated = await this.createTableInB0ase(tableName, data);
      if (!tableCreated) {
        return false;
      }
      
      this.log(`  ✅ Created table robust_ae_${tableName} in b0ase`);
      
      // Insert data
      const dataInserted = await this.insertDataToB0ase(tableName, data);
      if (dataInserted) {
        this.log(`  ✅ Successfully migrated ${data.length} rows from ${tableName}`);
        return true;
      } else {
        this.log(`  ⚠️  Partial migration for ${tableName}`);
        return false;
      }
      
    } catch (err) {
      this.error(`Error migrating table ${tableName}`, err);
      return false;
    }
  }

  async migrateAllTables() {
    this.log('🚀 Starting robust-ae tables migration...\n');
    
    let successCount = 0;
    let totalCount = KNOWN_TABLES.length;
    
    for (const tableName of KNOWN_TABLES) {
      const success = await this.migrateTable(tableName);
      if (success) {
        successCount++;
      }
    }
    
    this.log('\n📊 Migration Summary:');
    this.log(`- Total tables attempted: ${totalCount}`);
    this.log(`- Successfully migrated: ${successCount}`);
    this.log(`- Failed migrations: ${totalCount - successCount}`);
    this.log(`- Errors encountered: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      this.log('⚠️  Migration completed with errors. Check error log for details.');
    } else {
      this.log('✅ Migration completed successfully!');
    }
  }
}

// Run the migration
const migrator = new TableMigrator();
migrator.migrateAllTables().catch(console.error).finally(() => {
  migrator.saveLogs();
}); 