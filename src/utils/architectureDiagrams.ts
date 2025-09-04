export type DiagramType = "flowchart" | "er" | "sequence";

export interface ArchitectureDiagram {
  id: string;
  title: string;
  type: DiagramType;
  description: string;
  mermaid: string;
}

export const architectureDiagrams: ArchitectureDiagram[] = [
  {
    id: "high-level-architecture",
    title: "High-level System Architecture",
    type: "flowchart",
    description:
      "Overview of the client app, Supabase services, edge functions, and advanced template features.",
    mermaid: `graph TD
      A["Client App (React + Vite + Tailwind)"] -->|Auth, Queries| B["Supabase Auth & JS SDK"]
      A -->|Realtime, Storage| C["Supabase Services"]
      B --> D[("Postgres DB")]
      C --> D
      subgraph Edge Functions
        E[process-onboarding-sla]
        F[process-discovery-call-reminders]
        G[process-waitlist-exclusivity]
        H[send-discovery-call-email]
        I[security-headers]
        J[performance-optimizer]
        K[instagram-oauth]
        L[instagram-media]
        M[instagram-refresh-token]
      end
      E -.-> D
      F -.-> D
      G -.-> D
      H -.-> D
      I -.-> A
      J -.-> A
      K -.-> D
      L -.-> D
      M -.-> D
      C --> K[("Storage: onboarding-public")]
      C --> L[("Storage: client-photos (private)")]
      A -->|Signed URLs| L
      A -->|HTTP Calls| M["Public REST RPC"]
      M --> D
      A --> N["Admin Diagnostics"]
      N -->|Reads grouped logs| A
      
      subgraph Advanced Template System
        O[TemplateBuilder]
        P[ConditionalLogic]
        Q[AnalyticsDashboard]
        R[BulkOperations]
        S[VersionControl]
        T[AccessibilityAudit]
      end
      O --> D
      P --> D
      Q --> D
      R --> D
      S --> D
      T --> D
      A --> O
      
      subgraph Compliance & Security
        U[DSAR Processing]
        V[Retention Tracking]
        W[Accessibility Schema]
      end
      U --> D
      V --> D
      W --> D
      
      subgraph Instagram Integration
        X[Instagram OAuth]
        Y[Media Sync]
        Z[Handle Revelation]
      end
      X --> D
      Y --> D
      Z --> D
      A --> X
      
      subgraph Goal Management
        AA[Goal Setting]
        BB[Client Goals]
        CC[Critical Tasks]
      end
      AA --> D
      BB --> D
      CC --> D
      A --> AA
    `,
  },
  {
    id: "advanced-template-features",
    title: "Advanced Template Features Architecture",
    type: "flowchart",
    description:
      "Phase 5 advanced template system with conditional logic, analytics, bulk operations, and versioning.",
    mermaid: `graph TD
      A[TemplateBuilder] --> B[ConditionalLogicBuilder]
      A --> C[TemplateAnalyticsDashboard]
      A --> D[BulkOperationsPanel]
      A --> E[TemplateVersionControl]
      
      B --> F[evaluate_conditional_step Function]
      F --> G[("onboarding_conditional_evaluations")]
      F --> H[("client_onboarding_progress")]
      
      C --> I[("onboarding_template_analytics")]
      C --> J[update_template_analytics Function]
      J --> K[track_template_usage Trigger]
      
      D --> L[("onboarding_bulk_operations")]
      D --> M[process_bulk_operation Function]
      M --> N[Bulk Assignment/Update Logic]
      
      E --> O[("onboarding_template_versions")]
      E --> P[create_template_version Function]
      P --> Q[Version Snapshots]
      
      subgraph Conditional Rules
        R[Package Type Rules]
        S[Previous Answer Rules]
        T[Step Dependency Rules]
      end
      B --> R
      B --> S
      B --> T
      
      subgraph Analytics Metrics
        U[Usage Tracking]
        V[Completion Rates]
        W[Assignment Metrics]
        X[Performance KPIs]
      end
      C --> U
      C --> V
      C --> W
      C --> X
      
      subgraph Bulk Operations
        Y[Template Assignment]
        Z[Step Completion]
        AA[Bulk Updates]
      end
      D --> Y
      D --> Z
      D --> AA
      
      subgraph Version Management
        BB[Snapshot Creation]
        CC[Rollback Capability]
        DD[Change Tracking]
      end
      E --> BB
      E --> CC
      E --> DD
    `,
  },
  {
    id: "accessibility-compliance-schema",
    title: "Accessibility & Compliance Schema",
    type: "flowchart",
    description:
      "Phase 4 accessibility enforcement and compliance tracking with DSAR and retention policies.",
    mermaid: `graph TD
      A[Template Publishing] --> B[check_accessibility_compliance Function]
      B --> C[("accessibility_audit_log")]
      B --> D[validate_accessibility_before_publish Trigger]
      
      D --> E{Accessibility Check}
      E -->|Pass| F[Allow Publish]
      E -->|Fail| G[Block Publish]
      
      subgraph Accessibility Requirements
        H[Alt Text Verification]
        I[Color Contrast Check]
        J[Keyboard Navigation]
        K[Screen Reader Compatibility]
        L[ARIA Labels Complete]
        M[Semantic Markup Valid]
      end
      B --> H
      B --> I
      B --> J
      B --> K
      B --> L
      B --> M
      
      subgraph DSAR Processing
        N[("data_subject_access_requests")]
        O[process_dsar_request Function]
        P[Data Compilation]
        Q[Deletion Processing]
      end
      N --> O
      O --> P
      O --> Q
      
      subgraph Data Retention
        R[("data_retention_tracking")]
        S[set_data_retention_period Function]
        T[Auto-Purge System]
        U[Legal Basis Tracking]
      end
      R --> S
      S --> T
      S --> U
      
      V[User Data Events] --> S
      W[GDPR Requests] --> O
    `,
  },
  {
    id: "core-data-model-extended",
    title: "Extended Data Model with Template Features",
    type: "er",
    description:
      "Comprehensive data model including advanced template features, analytics, and compliance.",
    mermaid: `erDiagram
      USERS ||--o{ PROFILES : has
      USERS ||--o{ ROLES : has
      PROFILES ||--o{ TRAINERS : can_be
      PROFILES ||--o{ CLIENTS : can_be
      TRAINERS ||--o{ ONBOARDING_TEMPLATES : creates
      TRAINERS ||--o{ INSTAGRAM_CONNECTIONS : manages
      TRAINERS ||--o{ GOALS : creates
      CLIENTS ||--o{ GOAL_CLIENT_LINKS : assigned
      GOALS ||--o{ CRITICAL_TASKS : generates
      INSTAGRAM_CONNECTIONS ||--o{ HANDLE_REVELATIONS : enables
      ONBOARDING_TEMPLATES ||--o{ TEMPLATE_ANALYTICS : generates
      ONBOARDING_TEMPLATES ||--o{ TEMPLATE_VERSIONS : tracks
      ONBOARDING_TEMPLATES ||--o{ CONDITIONAL_EVALUATIONS : evaluates
      ONBOARDING_TEMPLATES ||--o{ BULK_OPERATIONS : processes
      ONBOARDING_TEMPLATES ||--o{ ACCESSIBILITY_AUDITS : enforces
      CLIENTS ||--o{ ONBOARDING_PROGRESS : tracks
      PROFILES ||--o{ DSAR_REQUESTS : submits
      PROFILES ||--o{ RETENTION_TRACKING : monitors

      ONBOARDING_TEMPLATES {
        uuid id PK
        uuid trainer_id FK
        string name
        text description
        jsonb conditional_logic
        text[] package_type_restrictions
        integer version_number
        uuid parent_template_id FK
        boolean is_version
        jsonb accessibility_metadata
        boolean accessibility_required
        boolean accessibility_approved
        timestamp accessibility_approved_at
        string status
        timestamp created_at
        timestamp updated_at
      }
      
      TEMPLATE_ANALYTICS {
        uuid id PK
        uuid template_id FK
        uuid trainer_id FK
        string metric_type
        integer metric_value
        jsonb metric_data
        date date_recorded
        timestamp created_at
        timestamp updated_at
      }
      
      TEMPLATE_VERSIONS {
        uuid id PK
        uuid template_id FK
        integer version_number
        jsonb template_data
        text changelog
        uuid created_by FK
        boolean is_current
        timestamp created_at
      }
      
      CONDITIONAL_EVALUATIONS {
        uuid id PK
        uuid client_id FK
        uuid template_id FK
        string step_id
        boolean condition_result
        jsonb evaluation_data
        timestamp evaluated_at
      }
      
      BULK_OPERATIONS {
        uuid id PK
        string operation_type
        uuid template_id FK
        uuid trainer_id FK
        uuid[] target_clients
        jsonb operation_data
        string status
        integer progress_count
        integer total_count
        text[] error_log
        timestamp started_at
        timestamp completed_at
        timestamp created_at
        timestamp updated_at
      }
      
      ACCESSIBILITY_AUDITS {
        uuid id PK
        uuid template_id FK
        string template_type
        string audit_type
        jsonb axe_results
        integer violations_count
        numeric compliance_score
        string wcag_level
        uuid audited_by FK
        boolean passed
        text notes
        timestamp audited_at
        timestamp created_at
      }
      
      DSAR_REQUESTS {
        uuid id PK
        uuid user_id FK
        string request_type
        string status
        timestamp requested_at
        timestamp completed_at
        uuid processed_by FK
        jsonb request_details
        jsonb response_data
        string verification_token
        timestamp verification_expires_at
        timestamp verified_at
        string legal_basis
        string priority
        text notes
        timestamp created_at
        timestamp updated_at
      }
      
      RETENTION_TRACKING {
        uuid id PK
        uuid user_id FK
        string data_category
        string table_name
        uuid record_id
        integer retention_period_months
        timestamp expires_at
        timestamp purged_at
        string purge_reason
        string legal_basis
        jsonb metadata
        timestamp created_at
        timestamp updated_at
      }
      
      INSTAGRAM_CONNECTIONS {
        uuid id PK
        uuid trainer_id FK
        text instagram_user_id
        text username
        text access_token
        text refresh_token
        boolean reveal_handle_post_discovery
        boolean is_active
        timestamp connected_at
        timestamp last_sync_at
        timestamp created_at
        timestamp updated_at
      }
      
      HANDLE_REVELATIONS {
        uuid id PK
        uuid trainer_id FK
        uuid client_id FK
        uuid connection_id FK
        uuid discovery_call_id FK
        timestamp revealed_at
        timestamp created_at
      }
      
      GOALS {
        uuid id PK
        uuid trainer_id FK
        text title
        text description
        text category
        boolean is_active
        timestamp created_at
        timestamp updated_at
      }
      
      GOAL_CLIENT_LINKS {
        uuid id PK
        uuid goal_id FK
        uuid client_id FK
        timestamp assigned_at
        timestamp created_at
      }
      
      CRITICAL_TASKS {
        uuid id PK
        uuid trainer_id FK
        uuid goal_id FK
        text title
        text description
        text status
        date due_date
        timestamp completed_at
        timestamp created_at
        timestamp updated_at
      }
    `,
  },
  {
    id: "template-publishing-workflow",
    title: "Advanced Template Publishing Workflow",
    type: "sequence",
    description:
      "Complete template publishing pipeline with accessibility checks, versioning, and compliance tracking.",
    mermaid: `sequenceDiagram
      autonumber
      participant T as Trainer
      participant TB as TemplateBuilder
      participant AC as AccessibilityChecker
      participant VC as VersionControl
      participant DB as Database
      participant AUDIT as AuditLogger

      T->>TB: Create/Edit Template
      TB->>DB: Save draft with conditional logic
      T->>TB: Add conditional rules
      TB->>DB: Update conditional_logic field
      
      T->>TB: Request publish
      TB->>AC: check_accessibility_compliance()
      AC->>DB: Query accessibility_metadata
      
      alt Accessibility passes
        AC-->>TB: Compliance approved
        TB->>VC: create_template_version()
        VC->>DB: Insert template version snapshot
        VC->>DB: Update version_number
        TB->>DB: Set published=true, locked=true
        TB->>AUDIT: Log accessibility approval
      else Accessibility fails
        AC-->>TB: Compliance blocked
        TB-->>T: Show accessibility violations
        T->>TB: Fix accessibility issues
        TB->>AC: Re-check compliance
      end
      
      T->>TB: Assign to clients (bulk)
      TB->>DB: Create bulk_operation record
      DB->>DB: process_bulk_operation()
      DB->>DB: Update template analytics
      
      T->>TB: View analytics
      TB->>DB: Query template_analytics
      TB-->>T: Show usage metrics and completion rates
    `,
  },
  {
    id: "conditional-logic-evaluation",
    title: "Conditional Logic Evaluation Flow",
    type: "sequence",
    description:
      "Dynamic step visibility based on client data, package types, and previous responses.",
    mermaid: `sequenceDiagram
      autonumber
      participant C as Client
      participant UI as OnboardingUI
      participant EVAL as ConditionalEvaluator
      participant DB as Database

      C->>UI: Start onboarding step
      UI->>EVAL: evaluate_conditional_step()
      EVAL->>DB: Get template conditional_logic
      EVAL->>DB: Get client progress data
      
      alt Package type condition
        EVAL->>EVAL: Check client.package_type
      else Previous answer condition
        EVAL->>EVAL: Check client response data
      else Step dependency condition
        EVAL->>DB: Check if dependency step completed
      end
      
      EVAL->>DB: Store evaluation result
      EVAL-->>UI: Return visibility decision
      
      alt Step visible
        UI-->>C: Show onboarding step
      else Step hidden
        UI-->>C: Skip to next step
      end
    `,
  },
  {
    id: "bulk-operations-processing",
    title: "Bulk Operations Processing",
    type: "sequence",
    description:
      "Scalable bulk processing for template assignments and step updates across multiple clients.",
    mermaid: `sequenceDiagram
      autonumber
      participant T as Trainer
      participant BULK as BulkOperationsPanel
      participant PROC as ProcessorFunction
      participant DB as Database
      participant NOTIFY as NotificationSystem

      T->>BULK: Select clients and operation
      BULK->>DB: Create bulk_operation record
      BULK->>PROC: process_bulk_operation()
      
      PROC->>DB: Update status to 'processing'
      
      loop For each target client
        PROC->>DB: Perform operation
        alt Success
          PROC->>DB: Increment progress_count
        else Error
          PROC->>DB: Add to error_log
        end
        PROC->>BULK: Update progress UI
      end
      
      PROC->>DB: Set final status
      PROC->>NOTIFY: Send completion notification
      NOTIFY-->>T: Operation complete
    `,
  },
  {
    id: "analytics-and-metrics",
    title: "Template Analytics and Metrics Collection",
    type: "sequence",
    description:
      "Comprehensive analytics tracking for template usage, completion rates, and performance KPIs.",
    mermaid: `sequenceDiagram
      autonumber
      participant SYSTEM as System Events
      participant TRACKER as AnalyticsTracker
      participant DB as Database
      participant DASH as AnalyticsDashboard

      SYSTEM->>TRACKER: Template assigned to client
      TRACKER->>DB: update_template_analytics('assignment')
      
      SYSTEM->>TRACKER: Step completed by client
      TRACKER->>DB: update_template_analytics('step_completion')
      
      SYSTEM->>TRACKER: Template accessed/viewed
      TRACKER->>DB: update_template_analytics('usage')
      
      DASH->>DB: Fetch analytics data
      DB-->>DASH: Return aggregated metrics
      DASH->>DASH: Calculate completion rates
      DASH->>DASH: Generate trend charts
      DASH-->>TRAINER: Display insights
    `,
  },
  {
    id: "dsar-and-retention-compliance",
    title: "DSAR and Data Retention Compliance",
    type: "sequence",
    description:
      "GDPR compliance with data subject access requests and automated retention tracking.",
    mermaid: `sequenceDiagram
      autonumber
      participant USER as Data Subject
      participant PORTAL as User Portal
      participant DSAR as DSAR Processor
      participant DB as Database
      participant ADMIN as Admin

      USER->>PORTAL: Request data access/deletion
      PORTAL->>DB: Create DSAR request
      PORTAL->>ADMIN: Notify admin team
      
      ADMIN->>DSAR: process_dsar_request()
      
      alt Access request
        DSAR->>DB: Compile all user data
        DSAR->>DB: Generate data export
      else Deletion request
        DSAR->>DB: Mark for deletion
        DSAR->>DB: Schedule data purge
      else Rectification request
        DSAR->>DB: Flag for manual review
      end
      
      DSAR->>DB: Update request status
      DSAR->>USER: Deliver response
      
      Note over DB: Automated retention tracking
      DB->>DB: set_data_retention_period()
      DB->>DB: Monitor expiry dates
      DB->>DB: Auto-purge expired data
    `,
  },
  {
    id: "instagram-integration-workflow",
    title: "Instagram Integration Workflow",
    type: "sequence",
    description:
      "Complete Instagram OAuth flow with media sync and handle revelation system.",
    mermaid: `sequenceDiagram
      autonumber
      participant T as Trainer
      participant UI as Instagram UI
      participant OAUTH as instagram-oauth
      participant INSTA as Instagram API
      participant DB as Database
      participant CLIENT as Client

      T->>UI: Connect Instagram
      UI->>OAUTH: Request auth URL
      OAUTH->>INSTA: Generate OAuth URL
      OAUTH-->>UI: Return auth URL
      UI-->>T: Redirect to Instagram
      
      T->>INSTA: Authorize application
      INSTA->>OAUTH: Return auth code
      OAUTH->>INSTA: Exchange for tokens
      INSTA-->>OAUTH: Access & refresh tokens
      OAUTH->>DB: Store encrypted tokens
      
      T->>UI: Configure revelation settings
      UI->>DB: Update revelation preferences
      
      Note over DB: After discovery call completion
      DB->>DB: Check revelation settings
      DB->>DB: Create handle revelation record
      
      CLIENT->>UI: View trainer profile
      UI->>DB: Check revelation access
      DB-->>UI: Return Instagram handle
      UI-->>CLIENT: Display Instagram content
    `,
  },
  {
    id: "goal-management-workflow", 
    title: "Goal Management and Critical Tasks",
    type: "sequence",
    description:
      "Goal assignment workflow with critical task creation and progress tracking.",
    mermaid: `sequenceDiagram
      autonumber
      participant C as Client
      participant SURVEY as Client Survey
      participant T as Trainer
      participant GOALS as Goal System
      participant DB as Database
      participant TASKS as Critical Tasks

      C->>SURVEY: Complete initial survey
      SURVEY->>DB: Store client goals
      
      T->>GOALS: Review client goals
      GOALS->>DB: Fetch client preferences
      T->>GOALS: Create/assign specific goals
      GOALS->>DB: Link goals to client
      
      T->>TASKS: Create critical tasks
      TASKS->>DB: Link tasks to goals
      TASKS->>DB: Set due dates and priorities
      
      C->>TASKS: Complete task
      TASKS->>DB: Update completion status
      TASKS->>GOALS: Update goal progress
      
      T->>GOALS: Review progress
      GOALS->>DB: Generate progress analytics
      GOALS-->>T: Display goal metrics
    `,
  },
  {
    id: "trainer-breadcrumb-progress",
    title: "Trainer Breadcrumb Progress System",
    type: "flowchart",
    description:
      "Client journey tracking with breadcrumb navigation and progress indicators for trainer profile setup.",
    mermaid: `graph TD
      A[Client Journey Start] --> B[ClientJourneyBreadcrumb Component]
      B --> C[ProgressBreadcrumb Component]
      C --> D[Journey Step Calculation]
      
      D --> E{Current Step Detection}
      E -->|Survey| F[Survey Completion Status]
      E -->|Matching| G[Trainer Matching Status]
      E -->|Selection| H[Coach Selection Status]
      E -->|Onboarding| I[Onboarding Progress Status]
      
      F --> J[StepCompletionIcon]
      G --> J
      H --> J
      I --> J
      
      J --> K[Visual Progress Indicator]
      K --> L[Breadcrumb Navigation]
      
      subgraph Progress Tracking
        M[("client_survey_responses")]
        N[("trainer_matches")]
        O[("coach_selection_requests")]
        P[("client_onboarding_progress")]
      end
      
      F --> M
      G --> N
      H --> O
      I --> P
      
      subgraph UI Components
        Q[Progress Dots]
        R[Step Labels]
        S[Completion Badges]
        T[Navigation Links]
      end
      
      K --> Q
      L --> R
      J --> S
      L --> T
      
      subgraph Trainer Profile Setup Progress
        U[BasicInfoSection]
        V[ExpertiseSection]
        W[VerificationSection]
        X[PackageWaysOfWorkingSection]
      end
      
      U --> Y[Profile Completion %]
      V --> Y
      W --> Y
      X --> Y
      
      Y --> Z[TrainerOnboardingTracker]
      Z --> AA[Progress Visualization]
    `,
  },
  {
    id: "verification-checks-system",
    title: "Enhanced Trainer Verification System",
    type: "flowchart", 
    description:
      "Comprehensive verification workflow with granular checks, document management, and automated notifications.",
    mermaid: `graph TD
      A[Trainer Verification Request] --> B[Document Upload]
      B --> C[("trainer_verification_checks")]
      C --> D[Individual Check Types]
      
      D --> E[ID Verification]
      D --> F[Qualification Verification]
      D --> G[Insurance Verification]
      D --> H[Background Check]
      D --> I[Professional References]
      
      subgraph Admin Review Process
        J[EnhancedVerificationManagement]
        K[VerificationAnalytics]
        L[Audit Log]
      end
      
      E --> J
      F --> J
      G --> J
      H --> J
      I --> J
      
      J --> M{Admin Decision}
      M -->|Approve| N[Update Check Status: approved]
      M -->|Reject| O[Update Check Status: rejected]
      M -->|Request More Info| P[Update Check Status: pending]
      
      N --> Q[verify_trainer_status Trigger]
      O --> Q
      P --> Q
      
      Q --> R{All Checks Complete?}
      R -->|Yes & All Approved| S[Set trainer.verification_status = 'verified']
      R -->|Any Rejected| T[Set trainer.verification_status = 'rejected']
      R -->|Pending| U[Set trainer.verification_status = 'under_review']
      
      S --> V[send-verification-emails Function]
      T --> V
      U --> V
      
      V --> W[Email Notifications]
      W --> X[Trainer Status Email]
      W --> Y[Admin Notification Email]
      
      subgraph Document Management
        Z[Supabase Storage]
        AA[File Upload Validation]
        BB[Document Expiry Tracking]
      end
      
      B --> Z
      B --> AA
      Z --> BB
      
      BB --> CC[process-verification-expiry Function]
      CC --> DD[Expiry Reminder Emails]
      CC --> EE[Auto-update Expired Status]
      
      subgraph Status Indicators
        FF[VerificationStatusIndicator]
        GG[VerificationBadge]
        HH[VerificationBadgeIntegration]
      end
      
      S --> FF
      T --> FF
      U --> FF
      
      FF --> GG
      GG --> HH
      
      subgraph Analytics & Reporting
        II[Verification Completion Rates]
        JJ[Processing Time Metrics]
        KK[Rejection Reason Analysis]
        LL[Document Type Statistics]
      end
      
      K --> II
      K --> JJ
      K --> KK
      K --> LL
      
      subgraph Compliance Features
        MM[Audit Trail Logging]
        NN[GDPR Data Handling]
        OO[Document Retention Policies]
      end
      
      L --> MM
      Z --> NN
      BB --> OO
    `,
  }
];
