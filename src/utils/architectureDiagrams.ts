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
      D <-.- E
      D <-.- F
      D <-.- G
      E --> D
      F --> D
      G --> D
      H --> D
      C --> I[(Storage: avatars, docs)]
      A -->|HTTP Calls| J[Public REST RPC]
      J --> D
    `,
  },
  {
    id: "core-data-model-selected",
    title: "Core Data Model (Selected Entities)",
    type: "er",
    description:
      "Key tables related to trainers, clients, conversations, discovery calls, and feedback.",
    mermaid: `erDiagram
      users ||--o{ profiles : has
      users ||--o{ roles : has
      profiles ||--o{ trainers : can_be
      profiles ||--o{ clients : can_be
      trainers ||--o{ discovery_calls : conducts
      clients ||--o{ discovery_calls : books
      trainers ||--o{ conversations : participates
      clients ||--o{ conversations : participates
      conversations ||--o{ messages : contains
      discovery_calls ||--o{ feedback : receives
      clients ||--o{ waitlist : in

      users {
        uuid id PK
        text email
        timestamptz created_at
      }
      profiles {
        uuid id PK
        uuid user_id FK
        text display_name
        text avatar_url
        timestamptz updated_at
      }
      roles {
        uuid user_id FK
        text role  // admin | trainer | client
      }
      trainers {
        uuid id PK
        uuid user_id FK
        text bio
      }
      clients {
        uuid id PK
        uuid user_id FK
        text goals
      }
      conversations {
        uuid id PK
        uuid trainer_id FK
        uuid client_id FK
        timestamptz created_at
      }
      messages {
        uuid id PK
        uuid conversation_id FK
        uuid sender_id FK
        text content
        timestamptz sent_at
      }
      discovery_calls {
        uuid id PK
        uuid trainer_id FK
        uuid client_id FK
        timestamptz scheduled_at
        text status  // pending | confirmed | done | canceled
      }
      feedback {
        uuid id PK
        uuid discovery_call_id FK
        int rating
        text notes
      }
      waitlist {
        uuid id PK
        uuid client_id FK
        text priority
        timestamptz created_at
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
];
