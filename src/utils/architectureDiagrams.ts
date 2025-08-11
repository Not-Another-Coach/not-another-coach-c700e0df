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
      A[Client App (React + Vite + Tailwind)] -->|Auth, Queries| B[Supabase Auth & JS SDK]
      A -->|Realtime, Storage| C[Supabase Services]
      B --> D[(Postgres DB)]
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
      C --> I[(Storage: onboarding-public)]
      C --> K[(Storage: client-photos (private))]
      A -->|Signed URLs| K
      A -->|HTTP Calls| J[Public REST RPC]
      J --> D
      A --> L[Admin Diagnostics]
      L -->|Reads grouped logs| A
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
  }
];
