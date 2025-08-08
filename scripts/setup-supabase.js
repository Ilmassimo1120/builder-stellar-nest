#!/usr/bin/env node

/**
 * ChargeSource Supabase Setup Script
 * 
 * This script helps set up Supabase for the ChargeSource platform.
 * It includes database initialization, RLS policies, and sample data.
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

async function main() {
  console.log('🚀 Setting up ChargeSource with Supabase...\n')

  // Check environment variables
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing required environment variables:')
    console.error('   - SUPABASE_URL (or VITE_SUPABASE_URL)')
    console.error('   - SUPABASE_SERVICE_ROLE_KEY')
    console.error('\nPlease set these in your .env file or environment.\n')
    process.exit(1)
  }

  // Create Supabase client with service role key
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // Test connection
    console.log('🔗 Testing Supabase connection...')
    const { data, error } = await supabase.from('users').select('count').limit(1)
    if (error && !error.message.includes('relation "users" does not exist')) {
      throw error
    }
    console.log('✅ Connected to Supabase successfully\n')

    // Check if tables exist
    console.log('📋 Checking database schema...')
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')

    const tableNames = tables?.map(t => t.table_name) || []
    const requiredTables = ['users', 'projects', 'quotes', 'products', 'global_settings']
    const missingTables = requiredTables.filter(table => !tableNames.includes(table))

    if (missingTables.length > 0) {
      console.log(`⚠️  Missing tables: ${missingTables.join(', ')}`)
      console.log('   Run the migrations first: supabase db push')
    } else {
      console.log('✅ All required tables exist\n')
    }

    // Initialize sample data
    await initializeSampleData(supabase)

    // Setup storage buckets
    await setupStorageBuckets(supabase)

    console.log('\n🎉 Supabase setup completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Update your .env file with Supabase credentials')
    console.log('2. Start your development server: npm run dev')
    console.log('3. Access the ChargeSource portal and migrate your data')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

async function initializeSampleData(supabase) {
  console.log('📦 Initializing sample data...')

  try {
    // Check if products already exist
    const { data: existingProducts, error: productsError } = await supabase
      .from('products')
      .select('id')
      .limit(1)

    if (productsError && !productsError.message.includes('relation "products" does not exist')) {
      throw productsError
    }

    if (!existingProducts || existingProducts.length === 0) {
      // Insert sample products
      const sampleProducts = [
        {
          sku: 'CHG-AC-7KW-001',
          name: '7kW AC Charging Station',
          description: 'Single-phase AC charging station suitable for residential and light commercial use',
          category: 'chargers',
          subcategory: 'ac-chargers',
          brand: 'ChargePoint',
          model: 'Home Flex',
          specifications: {
            powerRating: '7kW',
            inputVoltage: '240V',
            outputVoltage: '240V',
            connectorType: 'Type 2',
            dimensions: '330 x 193 x 107 mm',
            weight: '4.2kg',
            protection: 'IP54'
          },
          pricing: {
            cost: 1200,
            listPrice: 1800,
            recommendedRetail: 2400
          },
          inventory: {
            inStock: 25,
            reserved: 5,
            available: 20,
            leadTime: '3-5 business days'
          },
          supplier: {
            id: 'sup-chargepoint',
            name: 'ChargePoint',
            partNumber: 'CPH25-L2-P-NA',
            minimumOrderQuantity: 1
          },
          images: [],
          documents: [],
          is_active: true
        },
        {
          sku: 'CHG-DC-50KW-001',
          name: '50kW DC Fast Charging Station',
          description: 'Commercial DC fast charging station with dual connector support',
          category: 'chargers',
          subcategory: 'dc-chargers',
          brand: 'ABB',
          model: 'Terra 54',
          specifications: {
            powerRating: '50kW',
            inputVoltage: '400V AC 3-phase',
            outputVoltage: '150-920V DC',
            connectorTypes: ['CCS2', 'CHAdeMO'],
            dimensions: '700 x 500 x 1700 mm',
            weight: '380kg',
            protection: 'IP54'
          },
          pricing: {
            cost: 35000,
            listPrice: 50000,
            recommendedRetail: 65000
          },
          inventory: {
            inStock: 8,
            reserved: 2,
            available: 6,
            leadTime: '2-3 weeks'
          },
          supplier: {
            id: 'sup-abb',
            name: 'ABB',
            partNumber: 'TERRA54CJ',
            minimumOrderQuantity: 1
          },
          images: [],
          documents: [],
          is_active: true
        }
      ]

      const { error: insertError } = await supabase
        .from('products')
        .insert(sampleProducts)

      if (insertError) {
        console.log('⚠️  Could not insert sample products:', insertError.message)
      } else {
        console.log('✅ Sample products added')
      }
    } else {
      console.log('✅ Products already exist, skipping sample data')
    }

    // Initialize global settings
    const { data: existingSettings } = await supabase
      .from('global_settings')
      .select('id')
      .limit(1)

    if (!existingSettings || existingSettings.length === 0) {
      const globalSettings = [
        {
          key: 'gst_rate',
          value: 10,
          category: 'business',
          description: 'GST rate percentage'
        },
        {
          key: 'default_markup',
          value: 35,
          category: 'business',
          description: 'Default markup percentage'
        },
        {
          key: 'volume_discounts',
          value: [
            {
              minimumQuantity: 5,
              discountPercentage: 5,
              applicableCategories: ['chargers']
            },
            {
              minimumQuantity: 10,
              discountPercentage: 10,
              applicableCategories: ['chargers']
            }
          ],
          category: 'pricing',
          description: 'Volume discount rules'
        }
      ]

      const { error: settingsError } = await supabase
        .from('global_settings')
        .insert(globalSettings)

      if (settingsError) {
        console.log('⚠️  Could not insert global settings:', settingsError.message)
      } else {
        console.log('✅ Global settings initialized')
      }
    } else {
      console.log('✅ Global settings already exist')
    }

  } catch (error) {
    console.log('⚠️  Sample data initialization failed:', error.message)
  }
}

async function setupStorageBuckets(supabase) {
  console.log('📁 Setting up storage buckets...')

  try {
    const buckets = [
      {
        name: 'product-images',
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
      },
      {
        name: 'documents',
        public: false,
        allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        fileSizeLimit: 52428800 // 50MB
      },
      {
        name: 'quote-attachments',
        public: false,
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        fileSizeLimit: 20971520 // 20MB
      }
    ]

    for (const bucket of buckets) {
      const { data: existingBucket } = await supabase.storage.getBucket(bucket.name)
      
      if (!existingBucket) {
        const { error } = await supabase.storage.createBucket(bucket.name, {
          public: bucket.public,
          allowedMimeTypes: bucket.allowedMimeTypes,
          fileSizeLimit: bucket.fileSizeLimit
        })

        if (error) {
          console.log(`⚠️  Could not create bucket ${bucket.name}:`, error.message)
        } else {
          console.log(`✅ Created storage bucket: ${bucket.name}`)
        }
      } else {
        console.log(`✅ Storage bucket already exists: ${bucket.name}`)
      }
    }

  } catch (error) {
    console.log('⚠️  Storage setup failed:', error.message)
  }
}

// Run the script
main().catch(console.error)
