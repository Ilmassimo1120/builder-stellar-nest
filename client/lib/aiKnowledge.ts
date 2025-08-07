// AI Knowledge Database for EV Charging Assistant
export interface AIKnowledgeItem {
  keywords: string[];
  response: string;
  suggestions?: string[];
  actions?: Array<{
    label: string;
    action: string;
    icon?: string;
  }>;
  category: "installation" | "standards" | "troubleshooting" | "platform" | "safety" | "pricing";
}

export const aiKnowledgeBase: AIKnowledgeItem[] = [
  {
    keywords: ["circuit breaker", "tripping", "mcb", "overload"],
    category: "troubleshooting",
    response: `🔌 **Circuit Breaker Tripping Solutions**

**Common Causes:**
• Overload condition (exceeding rated current)
• Earth fault or insulation breakdown
• Incorrect breaker sizing
• Loose connections causing arcing

**Diagnostic Steps:**
1. Check actual load vs breaker rating
2. Test insulation resistance (>1MΩ to earth)
3. Inspect all connections for tightness
4. Verify correct breaker type (B, C, or D curve)

**Solutions:**
• Reduce load or upgrade circuit capacity
• Repair insulation faults
• Tighten all connections to specified torque
• Install appropriate breaker for inrush current

**Safety:** Always isolate power before any electrical work.`,
    suggestions: [
      "How to test insulation resistance?",
      "What breaker curve should I use?",
      "Load calculation guidelines",
      "Connection torque specifications"
    ],
    actions: [
      { label: "Load Calculator", action: "load-calculator" },
      { label: "Breaker Selection Guide", action: "breaker-guide" }
    ]
  },
  {
    keywords: ["rcd", "earth leakage", "protection", "safety"],
    category: "safety",
    response: `🛡️ **RCD/Earth Leakage Protection**

**Australian Requirements:**
• Type A RCD minimum for AC charging
• Type B RCD required for DC charging
• 30mA sensitivity for additional protection
• 100mA or 300mA for supply protection

**Installation Guidelines:**
• Install upstream of charging equipment
• Test monthly using test button
• Record all test results
��� Replace if fails to operate

**Common Issues:**
• Nuisance tripping: Check for moisture, damaged cables
• Won't reset: Indicates persistent earth fault
• Test button failure: Replace RCD immediately

**Important:** RCD testing is mandatory before energizing any EV charging installation.`,
    suggestions: [
      "Type A vs Type B RCD differences",
      "RCD testing procedures",
      "Nuisance tripping solutions",
      "When to use 30mA vs 300mA"
    ]
  },
  {
    keywords: ["cable sizing", "current rating", "voltage drop"],
    category: "installation",
    response: `📏 **Cable Sizing for EV Charging**

**Key Calculations:**
• **Current Rating:** Must exceed maximum load current
• **Voltage Drop:** <5% for fixed installations
• **Installation Method:** Derating factors apply
• **Ambient Temperature:** Additional derating required

**Common Cable Sizes:**
• **32A Circuit:** 6mm² minimum (depending on run length)
• **40A Circuit:** 10mm² minimum
• **63A Circuit:** 16mm² minimum

**AS/NZS 3008 Requirements:**
• Use certified automotive cable for flexible sections
• Earth conductor same size as active
• Consider future expansion needs

**Pro Tip:** Always verify calculations with voltage drop calculator and consider load diversity.`,
    suggestions: [
      "Voltage drop calculator",
      "Derating factor tables",
      "Cable selection chart",
      "Installation method comparison"
    ],
    actions: [
      { label: "Cable Calculator", action: "cable-calculator" },
      { label: "AS/NZS 3008 Guide", action: "cable-standards" }
    ]
  },
  {
    keywords: ["load management", "dynamic", "static", "power sharing"],
    category: "installation",
    response: `🧠 **Load Management Systems**

**Types of Load Management:**

**Static Load Management:**
• Fixed power allocation per charging point
• Simple and cost-effective
• Limited flexibility
• Suitable for predictable usage patterns

**Dynamic Load Management:**
• Real-time power adjustment
• Optimizes available capacity
• Responds to grid conditions
• Higher efficiency and utilization

**Implementation Options:**
• Hardware-based controllers
• Cloud-based management systems
• Integrated charger load balancing
• Hybrid solutions

**Benefits:**
• Reduced electrical infrastructure costs
• Optimal energy utilization
• Grid stability support
• Future expansion capability

**Sizing Guide:** Calculate total connected load, available supply capacity, and diversity factor.`,
    suggestions: [
      "Static vs dynamic comparison",
      "Load management sizing",
      "Grid integration options",
      "Cost-benefit analysis"
    ]
  },
  {
    keywords: ["permit", "approval", "council", "authority"],
    category: "standards",
    response: `📋 **Permits and Approvals**

**Required Approvals:**
• **Electrical Work Permit:** For all electrical installations
• **Building Permit:** May be required for structural work
• **Development Approval:** For commercial installations
• **Grid Connection:** For high-power installations

**Application Process:**
1. Submit electrical design to authority
2. Include compliance documentation
3. Pay applicable fees
4. Schedule inspections
5. Obtain completion certificate

**Key Documents:**
• AS/NZS 3000 compliance statement
• Cable calculation sheets
• Equipment certification
• Site layout drawings

**Timeline:** Allow 2-4 weeks for permit processing depending on complexity.`,
    suggestions: [
      "Permit application checklist",
      "Required documentation",
      "Inspection procedures",
      "Authority contact details"
    ]
  },
  {
    keywords: ["pricing", "quote", "margin", "cost"],
    category: "pricing",
    response: `💰 **Pricing and Quoting Guidelines**

**Cost Components:**
• **Equipment:** Charging stations, cables, accessories
• **Materials:** Cables, conduits, switchgear, protection
• **Labor:** Installation, commissioning, testing
• **Compliance:** Permits, inspections, certification
• **Margin:** Profit and overhead allowance

**Pricing Strategy:**
• Material costs: Add 20-40% markup
• Labor rates: $80-120/hour depending on complexity
• Travel time: Include for regional projects
• Warranty: Factor in support costs

**Quote Accuracy:**
• Site visit essential for accurate pricing
• Include contingency (10-15%)
• Specify exclusions clearly
• Provide detailed breakdown

**Platform Tools:** Use the built-in quote builder for professional, accurate quotes.`,
    suggestions: [
      "Material markup guidelines",
      "Labor rate calculator",
      "Quote template library",
      "Pricing best practices"
    ],
    actions: [
      { label: "Create Quote", action: "new-quote" },
      { label: "Pricing Calculator", action: "pricing-calculator" }
    ]
  },
  {
    keywords: ["workplace", "employee", "commercial", "office"],
    category: "installation",
    response: `🏢 **Workplace Charging Installation**

**Planning Considerations:**
• **Employee Survey:** Assess current and future EV ownership
• **Parking Allocation:** Dedicated vs shared spaces
• **Access Control:** Card readers, mobile apps, or open access
• **Load Management:** Essential for multiple charging points

**Design Guidelines:**
• **Power per Space:** 7-22kW typically sufficient
• **Future Expansion:** Plan for 3-5 year growth
• **Location:** Weather protection and accessibility
• **Signage:** Clear marking and usage instructions

**Business Benefits:**
• Employee satisfaction and retention
• Corporate sustainability goals
• Potential government incentives
• Future-proofing facility

**Installation Process:**
1. Site survey and electrical assessment
2. Employee consultation and planning
3. Permit applications and approvals
4. Electrical infrastructure installation
5. Commissioning and staff training`,
    suggestions: [
      "Employee charging policies",
      "Cost recovery options",
      "Government incentives",
      "Maintenance planning"
    ]
  }
];

export function findAIResponse(query: string): AIKnowledgeItem | null {
  const normalizedQuery = query.toLowerCase();
  
  return aiKnowledgeBase.find(item =>
    item.keywords.some(keyword =>
      normalizedQuery.includes(keyword.toLowerCase())
    )
  ) || null;
}

export function getResponsesByCategory(category: string): AIKnowledgeItem[] {
  return aiKnowledgeBase.filter(item => item.category === category);
}
