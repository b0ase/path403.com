#!/usr/bin/env node

/**
 * Robust-AE to B0ase Database Consolidation Tool
 * Migrates all tables and storage from robust-ae to b0ase.com
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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
    const logFile = `robust-ae-migration-log-${timestamp}.txt`;
    const errorFile = `robust-ae-migration-errors-${timestamp}.txt`;
    
    fs.writeFileSync(logFile, this.logs.join('\n'));
    fs.writeFileSync(errorFile, this.errors.join('\n'));
    
    this.log(`Logs saved to ${logFile}`);
    this.log(`Errors saved to ${errorFile}`);
  }

  async analyzeRobustAeDatabase() {
    this.log('🔍 Analyzing robust-ae.com database structure...');
    
    try {
      // Get all tables in public schema
      const { data: tables, error: tablesError } = await robustAeClient
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');
      
      if (tablesError) {
        this.error('Failed to get tables', tablesError);
        return { tables: [], buckets: [], bucketDetails: [] };
      }

      this.log(`Found ${tables.length} tables in robust-ae database`);
      
      // Check for storage buckets
      const { data: buckets, error: bucketsError } = await robustAeClient
        .storage
        .listBuckets();
      
      if (bucketsError) {
        this.error('Failed to get storage buckets', bucketsError);
        return { tables: tables || [], buckets: [], bucketDetails: [] };
      }

      this.log(`Found ${buckets.length} storage buckets in robust-ae database`);
      
      // Analyze each bucket
      const bucketDetails = [];
      for (const bucket of buckets) {
        try {
          const { data: objects, error: objectsError } = await robustAeClient
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

      return {
        tables: tables || [],
        buckets: buckets || [],
        bucketDetails
      };
    } catch (error) {
      this.error('Failed to analyze robust-ae database', error);
      return { tables: [], buckets: [], bucketDetails: [] };
    }
  }

  async generateTableMigrationSQL(tables) {
    this.log('📝 Generating SQL migration scripts...');
    
    const sqlScripts = [];
    
    for (const table of tables) {
      try {
        const tableName = table.tablename;
        this.log(`Generating SQL for table: ${tableName}`);
        
        // Get table structure
        const { data: columns, error: columnsError } = await robustAeClient
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable, column_default')
          .eq('table_schema', 'public')
          .eq('table_name', tableName);
        
        if (columnsError) {
          this.error(`Failed to get columns for ${tableName}`, columnsError);
          continue;
        }
        
        // Generate CREATE TABLE SQL
        let createSQL = `CREATE TABLE IF NOT EXISTS robust_ae_${tableName} (\n`;
        const columnDefs = columns.map(col => {
          let def = `  ${col.column_name} ${col.data_type}`;
          if (col.is_nullable === 'NO') def += ' NOT NULL';
          if (col.column_default) def += ` DEFAULT ${col.column_default}`;
          return def;
        });
        createSQL += columnDefs.join(',\n') + '\n);';
        
        sqlScripts.push({
          tableName,
          createSQL,
          columns: columns.length
        });
        
        this.log(`Generated SQL for ${tableName} with ${columns.length} columns`);
        
      } catch (err) {
        this.error(`Error generating SQL for table ${table.tableName}`, err);
      }
    }
    
    return sqlScripts;
  }

  async migrateTables(sqlScripts) {
    this.log('🗄️ Starting table migration...');
    
    for (const script of sqlScripts) {
      try {
        this.log(`Migrating table: ${script.tableName}`);
        
        // Create table in b0ase
        const { error: createError } = await b0aseClient
          .rpc('exec_sql', { sql: script.createSQL });
        
        if (createError) {
          this.error(`Failed to create table robust_ae_${script.tableName}`, createError);
          continue;
        }
        
        this.log(`✅ Created table robust_ae_${script.tableName}`);
        
        // Migrate data
        const { data: rows, error: dataError } = await robustAeClient
          .from(script.tableName)
          .select('*');
        
        if (dataError) {
          this.error(`Failed to get data from ${script.tableName}`, dataError);
          continue;
        }
        
        if (rows && rows.length > 0) {
          // Insert data in batches
          const batchSize = 100;
          for (let i = 0; i < rows.length; i += batchSize) {
            const batch = rows.slice(i, i + batchSize);
            
            const { error: insertError } = await b0aseClient
              .from(`robust_ae_${script.tableName}`)
              .insert(batch);
            
            if (insertError) {
              this.error(`Failed to insert batch ${Math.floor(i/batchSize) + 1} for ${script.tableName}`, insertError);
            } else {
              this.log(`  Progress: ${Math.min(i + batchSize, rows.length)}/${rows.length} rows migrated for ${script.tableName}`);
            }
          }
          
          this.log(`✅ Successfully migrated ${rows.length} rows from ${script.tableName}`);
        } else {
          this.log(`ℹ️  Table ${script.tableName} is empty, skipping data migration`);
        }
        
      } catch (err) {
        this.error(`Error migrating table ${script.tableName}`, err);
      }
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
        const { data: objects, error: listError } = await robustAeClient
          .storage
          .from(bucketDetail.name)
          .list();
        
        if (listError) {
          this.error(`Failed to list objects in bucket '${bucketDetail.name}'`, listError);
          continue;
        }

        // Migrate each object
        for (let i = 0; i < objects.length; i++) {
          const object = objects[i];
          try {
            // Download from robust-ae
            const { data: fileData, error: downloadError } = await robustAeClient
              .storage
              .from(bucketDetail.name)
              .download(object.name);
            
            if (downloadError) {
              this.error(`Failed to download ${object.name} from robust-ae`, downloadError);
              continue;
            }
            
            // Upload to b0ase
            const { error: uploadError } = await b0aseClient
              .storage
              .from(bucketDetail.name)
              .upload(object.name, fileData, {
                upsert: true,
                contentType: object.metadata?.mimetype || 'application/octet-stream'
              });
            
            if (uploadError) {
              this.error(`Failed to upload ${object.name} to b0ase`, uploadError);
            } else {
              if ((i + 1) % 10 === 0 || i === objects.length - 1) {
                this.log(`  Progress: ${i + 1}/${objects.length} objects migrated in '${bucketDetail.name}'`);
              }
            }
            
          } catch (err) {
            this.error(`Error migrating object ${object.name}`, err);
          }
        }
        
        this.log(`✅ Successfully migrated ${objects.length}/${objects.length} objects from bucket '${bucketDetail.name}'`);
        
      } catch (error) {
        this.error(`Error migrating bucket ${bucketDetail.name}`, error);
      }
    }
  }

  async consolidate() {
    this.log('🚀 Starting robust-ae to b0ase database consolidation...');
    
    try {
      // Step 1: Analyze robust-ae database
      const analysis = await this.analyzeRobustAeDatabase();
      
      if (analysis.tables.length === 0 && analysis.buckets.length === 0) {
        this.log('❌ No tables or storage buckets found to migrate');
        return;
      }
      
      // Step 2: Generate SQL migration scripts
      const sqlScripts = await this.generateTableMigrationSQL(analysis.tables);
      
      // Step 3: Migrate tables
      if (sqlScripts.length > 0) {
        await this.migrateTables(sqlScripts);
      }
      
      // Step 4: Migrate storage buckets
      if (analysis.bucketDetails.length > 0) {
        await this.migrateStorageBuckets(analysis.bucketDetails);
      }
      
      // Summary
      this.log('\n📊 Migration Summary:');
      this.log(`- Tables found: ${analysis.tables.length}`);
      this.log(`- Storage buckets found: ${analysis.buckets.length}`);
      this.log(`- Total storage objects: ${analysis.bucketDetails.reduce((sum, bucket) => sum + (bucket.objectCount === 'unknown' ? 0 : bucket.objectCount), 0)}`);
      this.log(`- Errors encountered: ${this.errors.length}`);
      
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