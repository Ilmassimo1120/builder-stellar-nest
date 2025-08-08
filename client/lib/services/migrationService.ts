import { supabase } from '../supabase'
import { supabaseQuoteService } from './supabaseQuoteService'
import { supabaseProductService } from './supabaseProductService'
import { useToast } from '@/hooks/use-toast'

class MigrationService {
  private toast = useToast()

  async migrateLocalStorageToSupabase(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Starting migration from localStorage to Supabase...')

      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return { success: false, message: 'User must be authenticated to migrate data' }
      }

      let migratedItems = 0

      // Migrate projects
      const projects = this.getLocalStorageData('chargeSourceProjects')
      if (projects && projects.length > 0) {
        console.log(`Migrating ${projects.length} projects...`)
        for (const project of projects) {
          await this.migrateProject(project, user.id)
          migratedItems++
        }
      }

      // Migrate project drafts
      const drafts = this.getLocalStorageData('chargeSourceProjectDrafts')
      if (drafts && drafts.length > 0) {
        console.log(`Migrating ${drafts.length} project drafts...`)
        for (const draft of drafts) {
          await this.migrateProjectDraft(draft, user.id)
          migratedItems++
        }
      }

      // Migrate quotes
      const quotes = this.getLocalStorageData('chargeSourceQuotes')
      if (quotes && quotes.length > 0) {
        console.log(`Migrating ${quotes.length} quotes...`)
        for (const quote of quotes) {
          await this.migrateQuote(quote, user.id)
          migratedItems++
        }
      }

      // Migrate products (if user is admin)
      const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userProfile?.role === 'admin' || userProfile?.role === 'global_admin') {
        const products = this.getLocalStorageData('chargeSourceProducts')
        if (products && products.length > 0) {
          console.log(`Migrating ${products.length} products...`)
          for (const product of products) {
            await this.migrateProduct(product)
            migratedItems++
          }
        }
      }

      // Migrate global settings (if user is global admin)
      if (userProfile?.role === 'global_admin') {
        const globalConfig = this.getLocalStorageData('chargeSourceGlobalConfig')
        if (globalConfig) {
          console.log('Migrating global settings...')
          await this.migrateGlobalSettings(globalConfig, user.id)
          migratedItems++
        }
      }

      // Migrate partner config
      const partnerConfig = this.getLocalStorageData(`chargeSourcePartnerConfig_${user.id}`)
      if (partnerConfig) {
        console.log('Migrating partner configuration...')
        await this.migratePartnerConfig(partnerConfig, user.id)
        migratedItems++
      }

      // Clear localStorage after successful migration
      if (migratedItems > 0) {
        this.clearMigratedData(userProfile?.role)
      }

      console.log(`Migration completed successfully. Migrated ${migratedItems} items.`)
      return { 
        success: true, 
        message: `Migration completed successfully! Migrated ${migratedItems} items to Supabase.` 
      }

    } catch (error) {
      console.error('Migration failed:', error)
      return { 
        success: false, 
        message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }
    }
  }

  private getLocalStorageData(key: string): any {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error)
      return null
    }
  }

  private async migrateProject(project: any, userId: string) {
    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          id: project.id,
          name: project.name || 'Untitled Project',
          description: project.description || '',
          status: this.mapProjectStatus(project.status),
          user_id: userId,
          client_info: project.clientRequirements || {},
          site_assessment: project.siteAssessment || null,
          charger_selection: project.chargerSelection || null,
          estimated_budget: project.estimatedBudget || null,
          progress: project.progress || 0,
          created_at: project.createdAt || new Date().toISOString(),
          updated_at: project.updatedAt || new Date().toISOString()
        })

      if (error) throw error
    } catch (error) {
      console.error('Error migrating project:', error)
    }
  }

  private async migrateProjectDraft(draft: any, userId: string) {
    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          id: draft.id,
          name: draft.draftName || 'Draft Project',
          description: 'Migrated from project draft',
          status: 'draft',
          user_id: userId,
          client_info: draft.clientRequirements || {},
          site_assessment: draft.siteAssessment || null,
          charger_selection: draft.chargerSelection || null,
          progress: draft.progress || 0,
          created_at: draft.createdAt || new Date().toISOString(),
          updated_at: draft.updatedAt || new Date().toISOString()
        })

      if (error) throw error
    } catch (error) {
      console.error('Error migrating project draft:', error)
    }
  }

  private async migrateQuote(quote: any, userId: string) {
    try {
      const { error } = await supabase
        .from('quotes')
        .insert({
          id: quote.id,
          quote_number: quote.quoteNumber,
          title: quote.title || 'Untitled Quote',
          description: quote.description || '',
          status: this.mapQuoteStatus(quote.status),
          user_id: userId,
          project_id: quote.projectId || null,
          client_info: quote.clientInfo || {},
          line_items: quote.lineItems || [],
          totals: quote.totals || { subtotal: 0, discount: 0, gst: 0, total: 0 },
          settings: quote.settings || {},
          valid_until: quote.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          template_id: quote.templateId || null,
          created_at: quote.createdAt || new Date().toISOString(),
          updated_at: quote.updatedAt || new Date().toISOString(),
          sent_at: quote.sentAt || null
        })

      if (error) throw error
    } catch (error) {
      console.error('Error migrating quote:', error)
    }
  }

  private async migrateProduct(product: any) {
    try {
      const { error } = await supabase
        .from('products')
        .insert({
          id: product.id,
          sku: product.sku,
          name: product.name,
          description: product.description,
          category: product.category,
          subcategory: product.subcategory || null,
          brand: product.brand,
          model: product.model,
          specifications: product.specifications || {},
          pricing: product.pricing || {},
          inventory: product.inventory || {},
          supplier: product.supplier || {},
          images: product.images || [],
          documents: product.documents || [],
          is_active: product.isActive !== false,
          created_at: product.createdAt || new Date().toISOString(),
          updated_at: product.updatedAt || new Date().toISOString()
        })

      if (error) throw error
    } catch (error) {
      console.error('Error migrating product:', error)
    }
  }

  private async migrateGlobalSettings(config: any, userId: string) {
    try {
      // Convert config object to individual settings
      const settings = [
        { key: 'system_config', value: config.system, category: 'system' },
        { key: 'business_config', value: config.business, category: 'business' },
        { key: 'notifications_config', value: config.notifications, category: 'notifications' },
        { key: 'integrations_config', value: config.integrations, category: 'integrations' },
        { key: 'security_config', value: config.security, category: 'security' },
        { key: 'features_config', value: config.features, category: 'features' }
      ]

      for (const setting of settings) {
        const { error } = await supabase
          .from('global_settings')
          .upsert({
            key: setting.key,
            value: setting.value,
            category: setting.category,
            updated_by: userId
          })

        if (error) throw error
      }
    } catch (error) {
      console.error('Error migrating global settings:', error)
    }
  }

  private async migratePartnerConfig(config: any, userId: string) {
    try {
      const { error } = await supabase
        .from('partner_configs')
        .upsert({
          user_id: userId,
          config: config
        })

      if (error) throw error
    } catch (error) {
      console.error('Error migrating partner config:', error)
    }
  }

  private mapProjectStatus(status: string): 'draft' | 'in_progress' | 'completed' | 'cancelled' {
    switch (status?.toLowerCase()) {
      case 'in progress':
      case 'in_progress':
        return 'in_progress'
      case 'completed':
        return 'completed'
      case 'cancelled':
      case 'canceled':
        return 'cancelled'
      default:
        return 'draft'
    }
  }

  private mapQuoteStatus(status: string): 'draft' | 'pending_review' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' {
    switch (status?.toLowerCase()) {
      case 'pending_review':
      case 'pending review':
        return 'pending_review'
      case 'sent':
        return 'sent'
      case 'viewed':
        return 'viewed'
      case 'accepted':
        return 'accepted'
      case 'rejected':
        return 'rejected'
      case 'expired':
        return 'expired'
      default:
        return 'draft'
    }
  }

  private clearMigratedData(userRole?: string) {
    try {
      // Clear migrated localStorage data
      const keysToRemove = [
        'chargeSourceProjects',
        'chargeSourceProjectDrafts',
        'chargeSourceQuotes'
      ]

      if (userRole === 'admin' || userRole === 'global_admin') {
        keysToRemove.push('chargeSourceProducts')
      }

      if (userRole === 'global_admin') {
        keysToRemove.push('chargeSourceGlobalConfig')
      }

      // Remove partner-specific configs
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        keysToRemove.push(`chargeSourcePartnerConfig_${user.id}`)
      }

      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
      })

      console.log('Cleared migrated localStorage data')
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }

  async checkMigrationNeeded(): Promise<boolean> {
    // Check if there's any data in localStorage that needs migration
    const localDataKeys = [
      'chargeSourceProjects',
      'chargeSourceProjectDrafts', 
      'chargeSourceQuotes',
      'chargeSourceProducts',
      'chargeSourceGlobalConfig'
    ]

    return localDataKeys.some(key => {
      const data = this.getLocalStorageData(key)
      return data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)
    })
  }

  async getSupabaseStatus(): Promise<{
    connected: boolean
    userCount: number
    projectCount: number
    quoteCount: number
    productCount: number
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { connected: false, userCount: 0, projectCount: 0, quoteCount: 0, productCount: 0 }
      }

      const [
        { count: userCount },
        { count: projectCount },
        { count: quoteCount },
        { count: productCount }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('quotes').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true })
      ])

      return {
        connected: true,
        userCount: userCount || 0,
        projectCount: projectCount || 0,
        quoteCount: quoteCount || 0,
        productCount: productCount || 0
      }
    } catch (error) {
      console.error('Error checking Supabase status:', error)
      return { connected: false, userCount: 0, projectCount: 0, quoteCount: 0, productCount: 0 }
    }
  }
}

export const migrationService = new MigrationService()
export default migrationService
