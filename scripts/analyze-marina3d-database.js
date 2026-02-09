#!/usr/bin/env node

/**
 * Marina3D Database Analysis Tool
 * Analyzes the Marina3D database structure to prepare for migration
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuration
const MARINA3D_CONFIG = {
  url: 'https://lokglgrszeupwnjjnner.supabase.co',
  serviceKey: process.env.MARINA3D_SUPABASE_SERVICE_KEY || 'YOUR_MARINA3D_SERVICE_KEY_HERE'
};

const marina3dClient = createClient(MARINA3D_CONFIG.url, MARINA3D_CONFIG.serviceKey);

class DatabaseAnalyzer {
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
    const logFile = `marina3d-analysis-log-${timestamp}.txt`;
    const errorFile = `marina3d-analysis-errors-${timestamp}.txt`;
    
    fs.writeFileSync(logFile, this.logs.join('\n'));
    fs.writeFileSync(errorFile, this.errors.join('\n'));
    
    this.log(`Logs saved to ${logFile}`);
    this.log(`Errors saved to ${errorFile}`);
  }

  async analyzeDatabase() {
    this.log('🔍 Analyzing Marina3D database structure...');
    
    try {
      // Test connection
      this.log('Testing database connection...');
      const { data: testData, error: testError } = await marina3dClient
        .from('pg_tables')
        .select('tablename')
        .limit(1);
      
      if (testError) {
        this.error('Failed to connect to Marina3D database', testError);
        return { tables: [], buckets: [], bucketDetails: [] };
      }

      this.log('✅ Successfully connected to Marina3D database');
      
      // Get all tables in public schema
      const { data: tables, error: tablesError } = await marina3dClient
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');
      
      if (tablesError) {
        this.error('Failed to get tables', tablesError);
        return { tables: [], buckets: [], bucketDetails: [] };
      }

      this.log(`Found ${tables.length} tables in Marina3D database`);
      
      // Check for storage buckets
      const { data: buckets, error: bucketsError } = await marina3dClient
        .storage
        .listBuckets();
      
      if (bucketsError) {
        this.error('Failed to get storage buckets', bucketsError);
        return { tables: tables || [], buckets: [], bucketDetails: [] };
      }

      this.log(`Found ${buckets.length} storage buckets in Marina3D database`);
      
      // Analyze each bucket
      const bucketDetails = [];
      for (const bucket of buckets) {
        try {
          const { data: objects, error: objectsError } = await marina3dClient
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
      this.error('Failed to analyze Marina3D database', error);
      return { tables: [], buckets: [], bucketDetails: [] };
    }
  }

  async analyzeTables(tables) {
    this.log('\n📊 Analyzing table structures...');
    
    const tableDetails = [];
    
    for (const table of tables) {
      try {
        const tableName = table.tablename;
        this.log(`Analyzing table: ${tableName}`);
        
        // Get table structure
        const { data: columns, error: columnsError } = await marina3dClient
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable, column_default')
          .eq('table_schema', 'public')
          .eq('table_name', tableName);
        
        if (columnsError) {
          this.error(`Failed to get columns for ${tableName}`, columnsError);
          tableDetails.push({ name: tableName, columns: 0, rows: 0, error: columnsError.message });
          continue;
        }
        
        // Get row count
        const { count, error: countError } = await marina3dClient
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          this.error(`Failed to get row count for ${tableName}`, countError);
          tableDetails.push({ name: tableName, columns: columns.length, rows: 'unknown', error: countError.message });
        } else {
          tableDetails.push({ name: tableName, columns: columns.length, rows: count });
          this.log(`  - ${tableName}: ${columns.length} columns, ${count} rows`);
        }
        
      } catch (err) {
        this.error(`Error analyzing table ${table.tablename}`, err);
        tableDetails.push({ name: table.tablename, columns: 0, rows: 0, error: err.message });
      }
    }
    
    return tableDetails;
  }

  async runAnalysis() {
    this.log('🚀 Starting Marina3D database analysis...\n');
    
    try {
      // Step 1: Analyze database structure
      const analysis = await this.analyzeDatabase();
      
      if (analysis.tables.length === 0 && analysis.buckets.length === 0) {
        this.log('❌ No tables or storage buckets found in Marina3D database');
        return;
      }
      
      // Step 2: Analyze table details
      const tableDetails = await this.analyzeTables(analysis.tables);
      
      // Summary
      this.log('\n📊 Analysis Summary:');
      this.log(`- Tables found: ${analysis.tables.length}`);
      this.log(`- Storage buckets found: ${analysis.buckets.length}`);
      this.log(`- Total storage objects: ${analysis.bucketDetails.reduce((sum, bucket) => sum + (bucket.objectCount === 'unknown' ? 0 : bucket.objectCount), 0)}`);
      
      if (tableDetails.length > 0) {
        this.log('\n📋 Table Details:');
        tableDetails.forEach(table => {
          if (table.error) {
            this.log(`  - ${table.name}: ERROR - ${table.error}`);
          } else {
            this.log(`  - ${table.name}: ${table.columns} columns, ${table.rows} rows`);
          }
        });
      }
      
      if (analysis.bucketDetails.length > 0) {
        this.log('\n📦 Storage Bucket Details:');
        analysis.bucketDetails.forEach(bucket => {
          if (bucket.error) {
            this.log(`  - ${bucket.name}: ERROR - ${bucket.error}`);
          } else {
            this.log(`  - ${bucket.name}: ${bucket.objectCount} objects`);
          }
        });
      }
      
      this.log(`\n- Errors encountered: ${this.errors.length}`);
      
      if (this.errors.length > 0) {
        this.log('⚠️  Analysis completed with errors. Check error log for details.');
      } else {
        this.log('✅ Analysis completed successfully!');
      }
      
    } catch (error) {
      this.error('Analysis failed', error);
    } finally {
      await this.saveLogs();
    }
  }
}

// Check if service key is provided
if (!process.env.MARINA3D_SUPABASE_SERVICE_KEY) {
  console.log('⚠️  MARINA3D_SUPABASE_SERVICE_KEY environment variable not set.');
  console.log('Please set it with: export MARINA3D_SUPABASE_SERVICE_KEY="your_service_key_here"');
  console.log('Or update the script with your service key.');
  process.exit(1);
}

// Run the analysis
const analyzer = new DatabaseAnalyzer();
analyzer.runAnalysis().catch(console.error); 