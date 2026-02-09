#!/usr/bin/env node

/**
 * Database Consolidation Script
 * Migrates vexvoid.com database to b0ase.com
 * 
 * Usage:
 * 1. Set environment variables for both databases
 * 2. Run: node scripts/consolidate-vexvoid-database.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Configuration - Update these with your actual database URLs and keys
const VEXVOID_CONFIG = {
  url: process.env.VEXVOID_SUPABASE_URL || 'https://your-vexvoid-project.supabase.co',
  serviceKey: process.env.VEXVOID_SUPABASE_SERVICE_KEY || 'your-vexvoid-service-key',
  anonKey: process.env.VEXVOID_SUPABASE_ANON_KEY || 'your-vexvoid-anon-key'
};

const B0ASE_CONFIG = {
  url: process.env.B0ASE_SUPABASE_URL || 'https://klaputzxeqgy.supabase.co',
  serviceKey: process.env.B0ASE_SUPABASE_SERVICE_KEY || 'your-b0ase-service-key',
  anonKey: process.env.B0ASE_SUPABASE_ANON_KEY || 'your-b0ase-anon-key'
};

// Initialize clients
const vexvoidClient = createClient(VEXVOID_CONFIG.url, VEXVOID_CONFIG.serviceKey);
const b0aseClient = createClient(B0ASE_CONFIG.url, B0ASE_CONFIG.serviceKey);

class DatabaseConsolidator {
  constructor() {
    this.migrationLog = [];
    this.errors = [];
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    this.migrationLog.push(logEntry);
  }

  error(message, error) {
    const timestamp = new Date().toISOString();
    const errorEntry = `[${timestamp}] ERROR: ${message} - ${error?.message || error}`;
    console.error(errorEntry);
    this.errors.push(errorEntry);
  }

  async saveLogs() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFile = `migration-log-${timestamp}.txt`;
    const errorFile = `migration-errors-${timestamp}.txt`;
    
    await fs.writeFile(logFile, this.migrationLog.join('\n'));
    if (this.errors.length > 0) {
      await fs.writeFile(errorFile, this.errors.join('\n'));
    }
    
    this.log(`Logs saved to ${logFile}`);
    if (this.errors.length > 0) {
      this.log(`Errors saved to ${errorFile}`);
    }
  }

  async analyzeVexvoidDatabase() {
    this.log('🔍 Analyzing vexvoid.com database structure...');
    
    try {
      // Check for tables in public schema
      let tables = [];
      try {
        const { data: tablesData, error: tablesError } = await vexvoidClient
          .from('information_schema.tables')
          .select('table_name, table_type')
          .eq('table_schema', 'public');
        
        if (tablesError) {
          this.error('Failed to get tables', tablesError);
        } else {
          tables = tablesData || [];
          this.log(`Found ${tables.length} tables in vexvoid database`);
        }
      } catch (err) {
        this.log('No tables found in vexvoid database (this is normal for storage-only databases)');
        tables = [];
      }
      
      // Check for storage buckets
      let buckets = [];
      let bucketDetails = [];
      
      try {
        const { data: bucketsData, error: bucketsError } = await vexvoidClient
          .storage
          .listBuckets();
        
        if (bucketsError) {
          this.error('Failed to get storage buckets', bucketsError);
        } else {
          buckets = bucketsData || [];
          this.log(`Found ${buckets.length} storage buckets in vexvoid database`);
          
          // Analyze each bucket
          for (const bucket of buckets) {
            try {
              const { data: objects, error: objectsError } = await vexvoidClient
                .storage
                .from(bucket.name)
                .list();
              
              if (objectsError) {
                this.error(`Failed to list objects in bucket ${bucket.name}`, objectsError);
                bucketDetails.push({ name: bucket.name, objectCount: 'unknown', error: objectsError.message });
              } else {
                bucketDetails.push({ name: bucket.name, objectCount: objects.length });
                this.log(`Bucket '${bucket.name}' contains ${objects.length} objects`);
              }
            } catch (err) {
              this.error(`Error analyzing bucket ${bucket.name}`, err);
            }
          }
        }
      } catch (err) {
        this.error('Failed to analyze storage buckets', err);
      }

      return {
        tables: tables || [],
        buckets: buckets || [],
        bucketDetails
      };
    } catch (error) {
      this.error('Failed to analyze vexvoid database', error);
      return { tables: [], buckets: [], bucketDetails: [] };
    }
  }

  async migrateStorageBuckets(bucketDetails) {
    this.log('📦 Starting storage bucket migration...');
    
    for (const bucketDetail of bucketDetails) {
      if (bucketDetail.error) {
        this.log(`⚠️  Skipping bucket '${bucketDetail.name}' due to previous error`);
        continue;
      }

      try {
        this.log(`Migrating bucket '${bucketDetail.name}' with ${bucketDetail.objectCount} objects...`);
        
        // Create bucket in b0ase if it doesn't exist
        const { data: existingBucket, error: checkError } = await b0aseClient
          .storage
          .getBucket(bucketDetail.name);
        
        if (checkError && checkError.message.includes('not found')) {
          // Create the bucket
          const { error: createError } = await b0aseClient
            .storage
            .createBucket(bucketDetail.name, { public: false });
          
          if (createError) {
            this.error(`Failed to create bucket '${bucketDetail.name}'`, createError);
            continue;
          }
          this.log(`✅ Created bucket '${bucketDetail.name}' in b0ase database`);
        } else if (checkError) {
          this.error(`Failed to check bucket '${bucketDetail.name}'`, checkError);
          continue;
        } else {
          this.log(`✅ Bucket '${bucketDetail.name}' already exists in b0ase database`);
        }

        // List all objects in the bucket
        const { data: objects, error: listError } = await vexvoidClient
          .storage
          .from(bucketDetail.name)
          .list();
        
        if (listError) {
          this.error(`Failed to list objects in bucket '${bucketDetail.name}'`, listError);
          continue;
        }

        // Migrate each object
        let migratedCount = 0;
        for (const object of objects) {
          try {
            // Download from vexvoid
            const { data: fileData, error: downloadError } = await vexvoidClient
              .storage
              .from(bucketDetail.name)
              .download(object.name);
            
            if (downloadError) {
              this.error(`Failed to download ${object.name} from vexvoid`, downloadError);
              continue;
            }

            // Upload to b0ase
            const { error: uploadError } = await b0aseClient
              .storage
              .from(bucketDetail.name)
              .upload(object.name, fileData, {
                upsert: true,
                contentType: object.metadata?.mimetype,
                cacheControl: object.metadata?.cacheControl
              });
            
            if (uploadError) {
              this.error(`Failed to upload ${object.name} to b0ase`, uploadError);
              continue;
            }

            migratedCount++;
            if (migratedCount % 10 === 0) {
              this.log(`  Progress: ${migratedCount}/${objects.length} objects migrated in '${bucketDetail.name}'`);
            }
          } catch (err) {
            this.error(`Error migrating object ${object.name}`, err);
          }
        }

        this.log(`✅ Successfully migrated ${migratedCount}/${objects.length} objects from bucket '${bucketDetail.name}'`);
      } catch (error) {
        this.error(`Failed to migrate bucket '${bucketDetail.name}'`, error);
      }
    }
  }

  async generateMigrationSQL(tables) {
    this.log('📝 Generating migration SQL for tables...');
    
    let sql = `-- Migration from vexvoid.com to b0ase.com\n`;
    sql += `-- Generated on: ${new Date().toISOString()}\n\n`;
    
    for (const table of tables) {
      if (table.table_type === 'BASE TABLE') {
        try {
          // Get table structure
          const { data: columns, error: columnsError } = await vexvoidClient
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable, column_default')
            .eq('table_schema', 'public')
            .eq('table_name', table.table_name);
          
          if (columnsError) {
            this.error(`Failed to get columns for table ${table.table_name}`, columnsError);
            continue;
          }

          // Get sample data
          const { data: sampleData, error: dataError } = await vexvoidClient
            .from(table.table_name)
            .select('*')
            .limit(5);
          
          if (dataError) {
            this.error(`Failed to get sample data for table ${table.table_name}`, dataError);
            continue;
          }

          sql += `-- Table: ${table.table_name}\n`;
          sql += `-- Columns: ${columns.map(c => c.column_name).join(', ')}\n`;
          sql += `-- Sample data count: ${sampleData?.length || 0} rows\n\n`;
          
          // Generate CREATE TABLE statement
          sql += `CREATE TABLE IF NOT EXISTS vexvoid_${table.table_name} (\n`;
          const columnDefs = columns.map(col => {
            let def = `  ${col.column_name} ${col.data_type}`;
            if (col.is_nullable === 'NO') def += ' NOT NULL';
            if (col.column_default) def += ` DEFAULT ${col.column_default}`;
            return def;
          });
          sql += columnDefs.join(',\n');
          sql += '\n);\n\n';
          
          // Generate INSERT statements for sample data
          if (sampleData && sampleData.length > 0) {
            sql += `-- Sample data for ${table.table_name}\n`;
            sql += `-- Note: This is sample data only. Full migration requires data export.\n\n`;
          }
          
          sql += '\n';
        } catch (error) {
          this.error(`Error generating SQL for table ${table.table_name}`, error);
        }
      }
    }
    
    // Save SQL to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sqlFile = `vexvoid-migration-${timestamp}.sql`;
    await fs.writeFile(sqlFile, sql);
    this.log(`✅ Migration SQL saved to ${sqlFile}`);
    
    return sqlFile;
  }

  async runFullMigration() {
    this.log('🚀 Starting full database consolidation...');
    
    try {
      // Step 1: Analyze vexvoid database
      const analysis = await this.analyzeVexvoidDatabase();
      
      // Step 2: Generate migration SQL for tables
      if (analysis.tables.length > 0) {
        await this.generateMigrationSQL(analysis.tables);
      }
      
      // Step 3: Migrate storage buckets
      if (analysis.bucketDetails.length > 0) {
        await this.migrateStorageBuckets(analysis.bucketDetails);
      }
      
      // Step 4: Generate summary
      this.log('\n📊 Migration Summary:');
      this.log(`- Tables found: ${analysis.tables.length}`);
      this.log(`- Storage buckets found: ${analysis.buckets.length}`);
      this.log(`- Total objects to migrate: ${analysis.bucketDetails.reduce((sum, b) => sum + (b.objectCount || 0), 0)}`);
      this.log(`- Errors encountered: ${this.errors.length}`);
      
      if (this.errors.length === 0) {
        this.log('✅ Migration completed successfully!');
      } else {
        this.log('⚠️  Migration completed with errors. Check error log for details.');
      }
      
    } catch (error) {
      this.error('Migration failed', error);
    } finally {
      await this.saveLogs();
    }
  }
}

// Main execution
async function main() {
  console.log('🔧 Vexvoid to B0ase Database Consolidation Tool\n');
  
  // Validate configuration
  if (!VEXVOID_CONFIG.url || VEXVOID_CONFIG.url.includes('your-vexvoid-project')) {
    console.error('❌ Please set VEXVOID_SUPABASE_URL environment variable');
    process.exit(1);
  }
  
  if (!B0ASE_CONFIG.url || B0ASE_CONFIG.url.includes('your-b0ase-project')) {
    console.error('❌ Please set B0ASE_SUPABASE_URL environment variable');
    process.exit(1);
  }
  
  const consolidator = new DatabaseConsolidator();
  await consolidator.runFullMigration();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = DatabaseConsolidator; 