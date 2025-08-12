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
      "Overview of the client app, Supabase services, and edge functions orchestration.",
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
      end
      E -.-> D
      F -.-> D
      G -.-> D
      H -.-> D
      C --> I[("Storage: onboarding-public")]
      C --> K[("Storage: client-photos (private)")]
      A -->|Signed URLs| K
      A -->|HTTP Calls| J["Public REST RPC"]
      J --> D
      A --> L["Admin Diagnostics"]
      L -->|Reads grouped logs| A
      
      subgraph Onboarding System
        M[TemplateBuilder]
        N[ActivityAssignment]
        O[PublishingWorkflow]
        P[SLA Monitoring]
      end
      M --> D
      N --> D
      O --> D
      P --> E
      A --> M
    `,
  },
  {
    id: "core-data-model-selected",
    title: "Core Data Model (Selected Entities)",
    type: "er",
    description:
      "Key tables related to trainers, clients, conversations, discovery calls, and feedback.",
    mermaid: `erDiagram
      USERS ||--o{ PROFILES : has
      USERS ||--o{ ROLES : has
      PROFILES ||--o{ TRAINERS : can_be
      PROFILES ||--o{ CLIENTS : can_be
      TRAINERS ||--o{ DISCOVERY_CALLS : conducts
      CLIENTS ||--o{ DISCOVERY_CALLS : books
      TRAINERS ||--o{ CONVERSATIONS : participates
      CLIENTS ||--o{ CONVERSATIONS : participates
      CONVERSATIONS ||--o{ MESSAGES : contains
      DISCOVERY_CALLS ||--o{ FEEDBACK : receives
      CLIENTS ||--o{ WAITLIST : in
      TRAINERS ||--o{ ONBOARDING_TEMPLATES : creates
      ONBOARDING_TEMPLATES ||--o{ ONBOARDING_GETTING_STARTED : contains
      ONBOARDING_TEMPLATES ||--o{ ONBOARDING_COMMITMENTS : defines
      ONBOARDING_TEMPLATES ||--o{ ACTIVITY_ASSIGNMENTS : has
      CLIENTS ||--o{ ONBOARDING_PROGRESS : tracks
      TRAINERS ||--o{ ONBOARDING_PROGRESS : manages

      USERS {
        string id PK
        string email
        datetime created_at
      }
      PROFILES {
        string id PK
        string user_id FK
        string display_name
        string avatar_url
        datetime updated_at
      }
      ROLES {
        string user_id FK
        string role
      }
      TRAINERS {
        string id PK
        string user_id FK
        string bio
      }
      CLIENTS {
        string id PK
        string user_id FK
        string goals
      }
      CONVERSATIONS {
        string id PK
        string trainer_id FK
        string client_id FK
        datetime created_at
      }
      MESSAGES {
        string id PK
        string conversation_id FK
        string sender_id FK
        string content
        datetime sent_at
      }
      DISCOVERY_CALLS {
        string id PK
        string trainer_id FK
        string client_id FK
        datetime scheduled_at
        string status
      }
      FEEDBACK {
        string id PK
        string discovery_call_id FK
        int rating
        string notes
      }
      WAITLIST {
        string id PK
        string client_id FK
        string priority
        datetime created_at
      }
      ONBOARDING_TEMPLATES {
        string id PK
        string trainer_id FK
        string template_name
        boolean published
        datetime created_at
      }
      ONBOARDING_GETTING_STARTED {
        string id PK
        string template_id FK
        string task_name
        text description
        int sla_hours
      }
      ONBOARDING_COMMITMENTS {
        string id PK
        string template_id FK
        string commitment_title
        text commitment_description
        boolean requires_signature
      }
      ACTIVITY_ASSIGNMENTS {
        string id PK
        string template_id FK
        string activity_id FK
        int assignment_order
        boolean is_required
      }
      ONBOARDING_PROGRESS {
        string id PK
        string client_id FK
        string trainer_id FK
        string getting_started_id FK
        string status
        datetime completed_at
      }
    `,
  },
  {
    id: "sla-and-due-alerts",
    title: "SLA and Due Alerts Flow",
    type: "sequence",
    description:
      "Edge function checks onboarding SLA status and creates due alerts.",
    mermaid: `sequenceDiagram
      autonumber
      participant CRON as Scheduler/Cron
      participant SLA as process-onboarding-sla (Edge Fn)
      participant DB as Postgres
      participant APP as Client App

      CRON->>SLA: Trigger periodic run
      SLA->>DB: Query onboarding steps nearing/over SLA
      DB-->>SLA: Results set
      alt Violations exist
        SLA->>DB: Insert alerts/notifications rows
        SLA-->>APP: Emit realtime events (RLS-protected)
        APP->>APP: useActivityAlerts hook displays toaster/badges
      else No violations
        SLA-->>CRON: No action
      end
    `,
  },
  {
    id: "messaging-engagement-progression",
    title: "Messaging and Engagement Progression",
    type: "sequence",
    description:
      "Client-trainer conversation lifecycle with engagement stage updates.",
    mermaid: `sequenceDiagram
      autonumber
      participant C as Client
      participant T as Trainer
      participant APP as Client App
      participant DB as Postgres

      C->>APP: Send message
      APP->>DB: Insert messages row
      DB-->>APP: Realtime broadcast
      APP->>T: UI updates (useConversations)
      APP->>APP: useEngagementStage computes stage
      APP->>DB: Update engagement stage on conversation
      T->>APP: Replies
      APP->>DB: Insert reply message
      DB-->>APP: Realtime broadcast to C
    `,
  },
  {
    id: "discovery-call-emails",
    title: "Discovery Call Emails",
    type: "sequence",
    description:
      "Reminder pipeline across booking, confirmation, and notifications.",
    mermaid: `sequenceDiagram
      autonumber
      participant C as Client
      participant T as Trainer
      participant APP as Client App
      participant DB as Postgres
      participant REM as process-discovery-call-reminders
      participant EMAIL as send-discovery-call-email

      C->>APP: Book discovery call
      APP->>DB: Insert discovery_calls row (status=pending)
      DB-->>REM: Picked up by scheduled edge function
      REM->>DB: Find upcoming calls
      REM->>EMAIL: Trigger email send (templates)
      EMAIL->>C: Confirmation/Reminder
      EMAIL->>T: Trainer notification
      APP->>DB: Status transitions (confirmed/done)
      APP->>DB: Feedback created after call
    `,
  },
  {
    id: "diagnostics-pipeline",
    title: "Diagnostics Pipeline and Sampling",
    type: "sequence",
    description:
      "Client-side diagnostics with redaction, burst override sampling, grouping, and admin UI.",
    mermaid: `sequenceDiagram
      autonumber
      participant APP as Client App
      participant DIAG as DiagnosticsProvider
      participant ADMIN as Admin Diagnostics

      APP->>DIAG: add(event)
      Note right of DIAG: Redact email/phone/JWT
      Note right of DIAG: Sample or burst override (60s window)
      Note right of DIAG: Group & dedupe (60s)
      ADMIN->>DIAG: Reads grouped logs
    `,
  },
  {
    id: "private-storage-signed-urls",
    title: "Private Storage and Signed URLs",
    type: "sequence",
    description:
      "Image upload flow using private bucket client-photos with signed URL rendering.",
    mermaid: `sequenceDiagram
      autonumber
      participant USER as User
      participant APP as Client App
      participant STORAGE as Storage: client-photos (private)

      USER->>APP: Select image
      APP->>STORAGE: upload(file)
      STORAGE-->>APP: 200 OK
      APP->>STORAGE: createSignedUrl(path, 7d)
      STORAGE-->>APP: signedUrl
      APP->>APP: Render via signed URL
    `,
  },
  {
    id: "onboarding-template-builder",
    title: "Onboarding Template Builder Architecture",
    type: "flowchart",
    description:
      "Complete onboarding template management system with advanced features, SLA tracking, and publishing workflow.",
    mermaid: `graph TD
      A[TemplateBuilder Component] --> B[useTemplateBuilder Hook]
      A --> C[useAdvancedOnboarding Hook]
      A --> D[useOnboardingSections Hook]
      
      B --> E[("onboarding_templates")]
      B --> F[("template_package_links")]
      
      C --> G[ActivityAssignmentPanel]
      C --> H[PublishingWorkflow]
      C --> I[AttachmentManager]
      C --> J[VisibilityMatrix]
      
      G --> K[("onboarding_activity_assignments")]
      H --> L[("onboarding_template_audit_log")]
      I --> M[("Storage: onboarding-public")]
      J --> N[("Visibility columns across tables")]
      
      D --> O[("getting_started_tasks")]
      D --> P[("ongoing_support_settings")]
      D --> Q[("commitment_expectations")]
      D --> R[("trainer_notes")]
      
      S[SLA Monitoring] --> T[calculate_business_due_date Function]
      S --> U[set_onboarding_due_dates Function]
      T --> E
      U --> E
      
      V[Publishing Flow] --> W[lock_template_on_publish Function]
      W --> E
      W --> L
      
      X[Edge Function: process-onboarding-sla] --> S
      X --> Y[Activity Alerts System]
    `,
  },
  {
    id: "onboarding-publishing-workflow",
    title: "Template Publishing and SLA Workflow",
    type: "sequence",
    description:
      "Template publishing lifecycle with audit logging, SLA calculation, and due date management.",
    mermaid: `sequenceDiagram
      autonumber
      participant T as Trainer
      participant TB as TemplateBuilder
      participant PW as PublishingWorkflow
      participant DB as Database
      participant SLA as SLA Functions
      participant EDGE as Edge Function

      T->>TB: Create/Edit Template
      TB->>DB: Save draft template
      T->>PW: Publish Template
      PW->>DB: lock_template_on_publish()
      DB->>DB: Set published=true, locked=true
      DB->>DB: Insert audit log entry
      
      alt Template has SLA settings
        PW->>SLA: calculate_business_due_date()
        SLA-->>PW: Return due date
        PW->>DB: Update template with due dates
      end
      
      T->>TB: Assign to Package
      TB->>DB: Insert template_package_links
      
      Note over EDGE: Scheduled monitoring
      EDGE->>DB: Check SLA violations
      alt SLA breach detected
        EDGE->>DB: Create activity alerts
        EDGE-->>TB: Realtime notification
      end
      
      T->>PW: Unpublish (if needed)
      PW->>DB: Set published=false, locked=false
      PW->>DB: Insert audit log with reason
    `,
  }
];
