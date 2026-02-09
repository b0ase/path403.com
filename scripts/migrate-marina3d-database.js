#!/usr/bin/env node

/**
 * Marina3D to B0ase Database Consolidation Tool
 * Migrates all tables and storage from Marina3D to b0ase.com
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const MARINA3D_CONFIG = {
  url: 'https://lokglgrszeupwnjjnner.supabase.co',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxva2dsZ3JzemV1cHduampubmVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODExNTAwOSwiZXhwIjoyMDYzNjkxMDA5fQ.xT9vC_VhI5GA9q4E6IBH6J9a_unMqN2SJR-FeULv2cA'
};

const B0ASE_CONFIG = {
  url: 'https://api.b0ase.com',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsYXB1dHp4ZXFneXBwaHpkeHByIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjIwNzAwMywiZXhwIjoyMDYxNzgzMDAzfQ.q7BSh0OmgNZKQYqDFYYy1CVRojdJmktijYPK88kwEgQ'
};

const marina3dClient = createClient(MARINA3D_CONFIG.url, MARINA3D_CONFIG.serviceKey);
const b0aseClient = createClient(B0ASE_CONFIG.url, B0ASE_CONFIG.serviceKey);

// Known tables and buckets from analysis
const KNOWN_TABLES = ['profiles', 'projects'];
const KNOWN_BUCKETS = [
  'imagebase',
  'newimagegens',
  '3dbase',
  'voice-samples',
  'generated-audio',
  'videobase-projects',
  'videobase-assets',
  'videobase-recordings',
  'videobase-exports',
  'videobase-thumbnails',
  'nftbase',
  'storybase',
  'soundbase',
  'nft-assets',
  'nft-metadata',
  'nft-thumbnails'
];

class DatabaseConsolidator {
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
    const logFile = `marina3d-migration-log-${timestamp}.txt`;
    const errorFile = `marina3d-migration-errors-${timestamp}.txt`;
    
    fs.writeFileSync(logFile, this.logs.join('\n'));
    fs.writeFileSync(errorFile, this.errors.join('\n'));
    
    this.log(`Logs saved to ${logFile}`);
    this.log(`Errors saved to ${errorFile}`);
  }

  async getTableData(tableName) {
    try {
      const { data, error } = await marina3dClient
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
      const filename = `marina3d_${tableName}_data.json`;
      fs.writeFileSync(filename, JSON.stringify(data, null, 2));
      this.log(`✅ Saved ${data.length} rows from ${tableName} to ${filename}`);
      return filename;
    } catch (err) {
      this.error(`Failed to save data for ${tableName}`, err);
      return null;
    }
  }

  async migrateTable(tableName) {
    this.log(`\n📋 Migrating table: ${tableName}`);
    
    try {
      // Get data from Marina3D
      const data = await this.getTableData(tableName);
      if (data === null) {
        return false;
      }
      
      this.log(`  Found ${data.length} rows in ${tableName}`);
      
      if (data.length === 0) {
        this.log(`  ⚠️  Table ${tableName} is empty, skipping`);
        return true;
      }
      
      // Save data to file for manual import
      const filename = await this.saveDataToFile(tableName, data);
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
      this.error(`Error migrating table ${tableName}`, err);
      return false;
    }
  }

  async migrateStorageBucket(bucketName) {
    this.log(`\n📦 Migrating storage bucket: ${bucketName}`);
    
    try {
      // List all objects in the bucket
      const { data: objects, error: listError } = await marina3dClient
        .storage
        .from(bucketName)
        .list();
      
      if (listError) {
        this.error(`Failed to list objects in bucket ${bucketName}`, listError);
        return false;
      }

      this.log(`  Found ${objects.length} objects in bucket '${bucketName}'`);
      
      if (objects.length === 0) {
        this.log(`  ⚠️  Bucket '${bucketName}' is empty, skipping`);
        return true;
      }

      // Create bucket in b0ase if it doesn't exist
      const { data: existingBucket, error: checkError } = await b0aseClient
        .storage
        .getBucket(bucketName);
      
      if (checkError && checkError.message.includes('not found')) {
        // Create the bucket
        const { error: createError } = await b0aseClient
          .storage
          .createBucket(bucketName, { public: false });
        
        if (createError) {
          this.error(`Failed to create bucket '${bucketName}'`, createError);
          return false;
        }
        this.log(`  ✅ Created bucket '${bucketName}' in b0ase database`);
      } else if (checkError) {
        this.error(`Failed to check bucket '${bucketName}'`, checkError);
        return false;
      } else {
        this.log(`  ✅ Bucket '${bucketName}' already exists in b0ase database`);
      }

      // Migrate each object
      let successCount = 0;
      for (let i = 0; i < objects.length; i++) {
        const object = objects[i];
        try {
          // Download from Marina3D
          const { data: fileData, error: downloadError } = await marina3dClient
            .storage
            .from(bucketName)
            .download(object.name);
          
          if (downloadError) {
            this.error(`Failed to download ${object.name} from Marina3D`, downloadError);
            continue;
          }
          
          // Upload to b0ase
          const { error: uploadError } = await b0aseClient
            .storage
            .from(bucketName)
            .upload(object.name, fileData, {
              upsert: true,
              contentType: object.metadata?.mimetype || 'application/octet-stream'
            });
          
          if (uploadError) {
            this.error(`Failed to upload ${object.name} to b0ase`, uploadError);
          } else {
            successCount++;
            if ((i + 1) % 10 === 0 || i === objects.length - 1) {
              this.log(`  Progress: ${i + 1}/${objects.length} objects migrated in '${bucketName}'`);
            }
          }
          
        } catch (err) {
          this.error(`Error migrating object ${object.name}`, err);
        }
      }
      
      this.log(`  ✅ Successfully migrated ${successCount}/${objects.length} objects from bucket '${bucketName}'`);
      return successCount === objects.length;
      
    } catch (error) {
      this.error(`Error migrating bucket ${bucketName}`, error);
      return false;
    }
  }

  async consolidate() {
    this.log('🚀 Starting Marina3D to b0ase database consolidation...\n');
    
    try {
      let tableSuccessCount = 0;
      let bucketSuccessCount = 0;
      let totalObjects = 0;
      
      // Step 1: Migrate tables
      this.log('📋 Migrating tables...');
      for (const tableName of KNOWN_TABLES) {
        const success = await this.migrateTable(tableName);
        if (success) {
          tableSuccessCount++;
        }
      }
      
      // Step 2: Migrate storage buckets
      this.log('\n📦 Migrating storage buckets...');
      for (const bucketName of KNOWN_BUCKETS) {
        const success = await this.migrateStorageBucket(bucketName);
        if (success) {
          bucketSuccessCount++;
        }
      }
      
      // Summary
      this.log('\n📊 Migration Summary:');
      this.log(`- Tables found: ${KNOWN_TABLES.length}`);
      this.log(`- Tables successfully migrated: ${tableSuccessCount}`);
      this.log(`- Storage buckets found: ${KNOWN_BUCKETS.length}`);
      this.log(`- Storage buckets successfully migrated: ${bucketSuccessCount}`);
      this.log(`- Errors encountered: ${this.errors.length}`);
      
      this.log('\n📁 Data Files Created:');
      KNOWN_TABLES.forEach(table => {
        this.log(`  - marina3d_${table}_data.json`);
      });
      
      this.log('\n📋 Next Steps:');
      this.log('1. Review the JSON files to understand the data structure');
      this.log('2. Create corresponding tables in b0ase.com database if needed');
      this.log('3. Import the data using the JSON files');
      this.log('4. Update your Marina3D application to use b0ase.com database');
      
      if (this.errors.length > 0) {
        this.log('⚠️  Migration completed with errors. Check error log for details.');
      } else {
        this.log('✅ Migration completed successfully!');
      }
      
    } catch (error) {
      this.error('Migration failed', error);
    } finally {
      await this.saveLogs();
    }
  }
}

// Run the consolidation
const consolidator = new DatabaseConsolidator();
consolidator.consolidate().catch(console.error); 