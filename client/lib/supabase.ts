import { createClient } from '@supabase/supabase-js';

// These would normally come from environment variables
// For demo purposes, using placeholder values that will be configured via MCP integration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database interfaces that match our Supabase schema
export interface Project {
  id?: string;
  created_at?: string;
  updated_at?: string;
  status: 'Planning' | 'Assessment' | 'Approved' | 'Installation' | 'Completed' | 'On Hold';
  progress: number;
  name: string;
  client_name: string;
  site_address: string;
  site_type?: string;
  project_objective?: string;
  estimated_budget_min?: number;
  estimated_budget_max?: number;
  estimated_timeline?: string;
  created_by?: string;
  notes?: string;
}

export interface ClientRequirements {
  id?: string;
  project_id?: string;
  created_at?: string;
  contact_person_name: string;
  contact_title?: string;
  contact_email: string;
  contact_phone?: string;
  organization_type: string;
  project_objective: string;
  number_of_vehicles: string;
  vehicle_types: string[];
  daily_usage_pattern?: string;
  budget_range?: string;
  project_timeline?: string;
  sustainability_goals: string[];
  accessibility_requirements: boolean;
  special_requirements?: string;
  preferred_charger_brands: string[];
  payment_model?: string;
}

export interface SiteAssessment {
  id?: string;
  project_id?: string;
  created_at?: string;
  project_name: string;
  client_name: string;
  site_address: string;
  site_type: string;
  existing_power_supply?: string;
  available_amperes?: number;
  estimated_load?: string;
  parking_spaces?: number;
  access_requirements?: string;
  additional_notes?: string;
  photos?: any;
}

export interface ChargerConfiguration {
  id?: string;
  project_id?: string;
  created_at?: string;
  charging_type: string;
  power_rating: string;
  mounting_type: string;
  number_of_chargers: number;
  connector_types: string[];
  weather_protection: boolean;
  network_connectivity: string;
  estimated_cost_min?: number;
  estimated_cost_max?: number;
  installation_time?: string;
}

export interface GridCapacityAssessment {
  id?: string;
  project_id?: string;
  created_at?: string;
  current_supply?: number;
  required_capacity?: number;
  upgrade_needed: boolean;
  upgrade_type?: string;
  estimated_upgrade_cost?: string;
  utility_contact?: string;
  load_management_notes?: string;
}

export interface ComplianceChecklist {
  id?: string;
  project_id?: string;
  created_at?: string;
  electrical_standards: string[];
  safety_requirements: string[];
  local_permits: string[];
  environmental_considerations: string[];
  accessibility_compliance: boolean;
  overall_compliance_score: number;
}

// Project service functions
export const projectService = {
  // Create a complete project with all related data
  async createProject(data: {
    project: Omit<Project, 'id' | 'created_at' | 'updated_at'>;
    clientRequirements: Omit<ClientRequirements, 'id' | 'project_id' | 'created_at'>;
    siteAssessment: Omit<SiteAssessment, 'id' | 'project_id' | 'created_at'>;
    chargerConfiguration: Omit<ChargerConfiguration, 'id' | 'project_id' | 'created_at'>;
    gridCapacityAssessment: Omit<GridCapacityAssessment, 'id' | 'project_id' | 'created_at'>;
    complianceChecklist: Omit<ComplianceChecklist, 'id' | 'project_id' | 'created_at'>;
  }) {
    try {
      // Create the main project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert(data.project)
        .select()
        .single();

      if (projectError) throw projectError;
      if (!project) throw new Error('Failed to create project');

      const projectId = project.id;

      // Create all related records
      const [
        clientReqResult,
        siteAssessmentResult,
        chargerConfigResult,
        gridCapacityResult,
        complianceResult
      ] = await Promise.all([
        supabase.from('client_requirements').insert({ ...data.clientRequirements, project_id: projectId }),
        supabase.from('site_assessments').insert({ ...data.siteAssessment, project_id: projectId }),
        supabase.from('charger_configurations').insert({ ...data.chargerConfiguration, project_id: projectId }),
        supabase.from('grid_capacity_assessments').insert({ ...data.gridCapacityAssessment, project_id: projectId }),
        supabase.from('compliance_checklists').insert({ ...data.complianceChecklist, project_id: projectId })
      ]);

      // Check for errors in any of the related inserts
      const errors = [
        clientReqResult.error,
        siteAssessmentResult.error,
        chargerConfigResult.error,
        gridCapacityResult.error,
        complianceResult.error
      ].filter(Boolean);

      if (errors.length > 0) {
        console.error('Errors creating related records:', errors);
        // Optionally delete the project if related records failed
        await supabase.from('projects').delete().eq('id', projectId);
        throw new Error('Failed to create project: ' + errors.map(e => e?.message).join(', '));
      }

      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Get all projects
  async getAllProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get a single project with all related data
  async getProjectById(id: string) {
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (projectError) throw projectError;
    if (!project) throw new Error('Project not found');

    // Get all related data
    const [
      clientReqResult,
      siteAssessmentResult,
      chargerConfigResult,
      gridCapacityResult,
      complianceResult
    ] = await Promise.all([
      supabase.from('client_requirements').select('*').eq('project_id', id).single(),
      supabase.from('site_assessments').select('*').eq('project_id', id).single(),
      supabase.from('charger_configurations').select('*').eq('project_id', id).single(),
      supabase.from('grid_capacity_assessments').select('*').eq('project_id', id).single(),
      supabase.from('compliance_checklists').select('*').eq('project_id', id).single()
    ]);

    return {
      project,
      clientRequirements: clientReqResult.data,
      siteAssessment: siteAssessmentResult.data,
      chargerConfiguration: chargerConfigResult.data,
      gridCapacityAssessment: gridCapacityResult.data,
      complianceChecklist: complianceResult.data
    };
  },

  // Update project status
  async updateProjectStatus(id: string, status: Project['status'], progress?: number) {
    const updateData: Partial<Project> = { status };
    if (progress !== undefined) {
      updateData.progress = progress;
    }

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete project and all related data (cascading delete is handled by database)
  async deleteProject(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Check if Supabase is properly configured
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('projects').select('count').limit(1);
    if (error) throw error;
    return true;
  } catch (error) {
    console.warn('Supabase connection not configured. Please set up your environment variables.');
    return false;
  }
};
