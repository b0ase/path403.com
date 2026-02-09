#!/usr/bin/env node

/**
 * Direct NPGX Database Analysis
 * Uses multiple approaches to analyze the NPGX database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuration
const NPGX_CONFIG = {
  url: 'https://fthpedywgwpygrfqliqf.supabase.co',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0aHBlZHl3Z3dweWdyZnFsaXFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDU1MzA4MywiZXhwIjoyMDY2MTI5MDgzfQ.rLuKmSX6mvXbG5i9G9b7zofmnqHyz6P1Ney_Iaohcds'
};

const npgxClient = createClient(NPGX_CONFIG.url, NPGX_CONFIG.serviceKey);

class DirectAnalyzer {
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
    const logFile = `direct-npgx-analysis-log-${timestamp}.txt`;
    const errorFile = `direct-npgx-analysis-errors-${timestamp}.txt`;
    
    fs.writeFileSync(logFile, this.logs.join('\n'));
    fs.writeFileSync(errorFile, this.errors.join('\n'));
    
    this.log(`Logs saved to ${logFile}`);
    this.log(`Errors saved to ${errorFile}`);
  }

  async testConnection() {
    this.log('🔌 Testing NPGX database connection...');
    
    try {
      // Test basic connection
      const { data, error } = await npgxClient
        .from('information_schema.tables')
        .select('table_name')
        .limit(1);
      
      if (error) {
        this.error('Failed to connect to information_schema.tables', error);
        return false;
      }
      
      this.log('✅ Successfully connected to NPGX database');
      return true;
    } catch (err) {
      this.error('Connection test failed', err);
      return false;
    }
  }

  async checkSystemTables() {
    this.log('\n📋 Checking system tables...');
    
    const systemTables = [
      'information_schema.tables',
      'pg_tables',
      'pg_catalog.pg_tables',
      'information_schema.schemata'
    ];
    
    for (const table of systemTables) {
      try {
        const { data, error } = await npgxClient
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          this.log(`  ❌ ${table}: ${error.message}`);
        } else {
          this.log(`  ✅ ${table}: Accessible (${data?.length || 0} rows)`);
        }
      } catch (err) {
        this.log(`  ❌ ${table}: ${err.message}`);
      }
    }
  }

  async checkPublicTables() {
    this.log('\n🏠 Checking public schema tables...');
    
    try {
      // Try to get tables from information_schema
      const { data: tables, error } = await npgxClient
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (error) {
        this.error('Failed to get tables from information_schema', error);
        return [];
      }
      
      if (tables && tables.length > 0) {
        this.log(`Found ${tables.length} tables in public schema:`);
        tables.forEach(table => {
          this.log(`  - ${table.table_name}`);
        });
        return tables;
      } else {
        this.log('No tables found in public schema');
        return [];
      }
    } catch (err) {
      this.error('Error checking public tables', err);
      return [];
    }
  }

  async checkStorageBuckets() {
    this.log('\n📦 Checking storage buckets...');
    
    try {
      const { data: buckets, error } = await npgxClient
        .storage
        .listBuckets();
      
      if (error) {
        this.error('Failed to get storage buckets', error);
        return [];
      }
      
      if (buckets && buckets.length > 0) {
        this.log(`Found ${buckets.length} storage buckets:`);
        for (const bucket of buckets) {
          try {
            const { data: objects, error: objectsError } = await npgxClient
              .storage
              .from(bucket.name)
              .list();
            
            if (objectsError) {
              this.log(`  - ${bucket.name}: ERROR - ${objectsError.message}`);
            } else {
              this.log(`  - ${bucket.name}: ${objects?.length || 0} objects`);
            }
          } catch (err) {
            this.log(`  - ${bucket.name}: ERROR - ${err.message}`);
          }
        }
        return buckets;
      } else {
        this.log('No storage buckets found');
        return [];
      }
    } catch (err) {
      this.error('Error checking storage buckets', err);
      return [];
    }
  }

  async testKnownTables() {
    this.log('\n🔍 Testing known table names...');
    
    // Common table names that might exist
    const commonTables = [
      'users',
      'profiles',
      'projects',
      'characters',
      'npgx_characters',
      'user_characters',
      'user_profiles',
      'clients',
      'teams',
      'content',
      'assets',
      'generated_assets',
      'feedback',
      'timelines',
      'features',
      'earnings',
      'memberships'
    ];
    
    const foundTables = [];
    
    for (const tableName of commonTables) {
      try {
        const { data, error } = await npgxClient
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          // Table doesn't exist or access denied
          this.log(`  ❌ ${tableName}: ${error.message}`);
        } else {
          this.log(`  ✅ ${tableName}: Found (${data?.length || 0} rows)`);
          foundTables.push(tableName);
        }
      } catch (err) {
        this.log(`  ❌ ${tableName}: ${err.message}`);
      }
    }
    
    return foundTables;
  }

  async runAnalysis() {
    this.log('🚀 Starting direct NPGX database analysis...\n');
    
    try {
      // Step 1: Test connection
      const connected = await this.testConnection();
      if (!connected) {
        this.log('❌ Cannot connect to NPGX database');
        return;
      }
      
      // Step 2: Check system tables
      await this.checkSystemTables();
      
      // Step 3: Check public schema tables
      const publicTables = await this.checkPublicTables();
      
      // Step 4: Test known table names
      const knownTables = await this.testKnownTables();
      
      // Step 5: Check storage buckets
      const storageBuckets = await this.checkStorageBuckets();
      
      // Summary
      this.log('\n📊 Analysis Summary:');
      this.log(`- Public schema tables: ${publicTables.length}`);
      this.log(`- Known tables found: ${knownTables.length}`);
      this.log(`- Storage buckets: ${storageBuckets.length}`);
      this.log(`- Errors encountered: ${this.errors.length}`);
      
      if (publicTables.length === 0 && knownTables.length === 0 && storageBuckets.length === 0) {
        this.log('\n❌ NPGX database appears to be empty or uninitialized');
        this.log('This means you can safely delete the NPGX Supabase project to save costs!');
      } else {
        this.log('\n✅ Found data in NPGX database that needs migration');
      }
      
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

// Run the analysis
const analyzer = new DirectAnalyzer();
analyzer.runAnalysis().catch(console.error); 