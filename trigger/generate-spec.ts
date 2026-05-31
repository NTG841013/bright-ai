import { task } from "@trigger.dev/sdk";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { z } from "zod";
import { liveblocks } from "@/lib/liveblocks";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";

export const generateSpec = task({
  id: "generate-spec",
  run: async (payload: any) => {
    const schema = z.object({
      projectId: z.string(),
      roomId: z.string(),
      chatHistory: z.array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })
      ),
      nodes: z.array(z.any()),
      edges: z.array(z.any()),
    });

    const validated = schema.parse(payload);
    console.log("Generate spec task started:", validated.roomId);

    const broadcastStatus = async (text: string, active = true) => {
      if (!liveblocks) {
        console.warn("Liveblocks client missing, skipping broadcastStatus");
        return;
      }
      try {
        await liveblocks!.broadcastEvent(validated.roomId, {
          type: "ai-status",
          text,
          active,
          senderId: "ai-spec-agent",
        });
      } catch (error) {
        console.error("Failed to broadcast AI status:", error);
      }
    };

    try {
      await broadcastStatus("Analyzing canvas and chat history...", true);

      // Initialize OpenRouter provider
      const openrouter = createOpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
        headers: {
          "HTTP-Referer": "https://bright-ai.vercel.app",
          "X-Title": "Bright AI",
        },
      });

      const { text } = await generateText({
        model: openrouter("openai/gpt-4o-mini"),
        system: `You are a principal engineer and technical architect at a top-tier tech company. 
Generate a precise, build-ready technical specification from the provided system 
diagram and conversation history.

The specification must be comprehensive enough that a senior engineer can implement 
the system without ambiguity, yet concise enough to fit within an LLM context window 
for code generation. Avoid filler, marketing language, or vague statements — every 
sentence must carry implementation value.

This specification will be used alongside a separate build context document that 
defines the existing stack, conventions, and environment. Where technology choices 
are flexible, prefer established patterns over introducing new dependencies. Flag 
any recommendation that would require a new dependency as [NEW DEP: reason it is 
necessary]. If the user has explicitly stated a preferred stack in the chat history, 
use it and do not suggest alternatives. If no stack is specified in the chat by the user, include a 
Technology Choices section where you must suggest technologies that fit the architecture.

---

# {System Name} — Technical Specification
**Version:** 1.0  
**Status:** Draft  
**Authors:** [AI-generated from diagram + chat]  
**Last Updated:** {date}

---

## 1. Executive Summary
- One paragraph: what the system does, who uses it, and the core problem it solves.
- Key constraints: budget tier, scale targets, compliance requirements (GDPR, SOC2, HIPAA).
- Out of scope: explicitly state what this system does NOT do.

---

## 2. Requirements

### 2.1 Functional Requirements
List as numbered, testable statements:
- FR-001: The system SHALL...
- FR-002: The system SHALL...
Use RFC 2119 language (SHALL, SHOULD, MAY).

### 2.2 Non-Functional Requirements
- **Performance:** p50/p95/p99 latency targets, throughput (RPS/TPS)
- **Availability:** SLA target (e.g., 99.9%), RPO, RTO
- **Scalability:** expected load today vs. 12-month projection
- **Security:** auth mechanism, encryption at rest/in transit, secrets management
- **Compliance:** relevant regulations or internal policies
- **Observability:** logging, metrics, tracing requirements

---

## 3. System Architecture

### 3.1 Architecture Style
State the pattern (e.g., microservices, event-driven monolith, CQRS+ES) and justify 
it against the requirements above.

### 3.2 Architecture Diagram
Describe the high-level topology derived from the canvas nodes and edges. 
Reference component IDs directly.

### 3.3 Deployment Model
- Cloud provider + regions
- Containerization strategy (Docker, K8s, serverless, etc.)
- Environment matrix: local | dev | staging | prod

---

## 4. Component Specifications
For EACH node in the diagram, produce a sub-section:

### 4.x {Component Name} (Node ID: {id})
- **Type:** Service | Database | Queue | Gateway | External | etc.
- **Responsibility:** Single sentence.
- **Interface:** REST | gRPC | GraphQL | event | SDK — list all exposed endpoints/methods
- **Data owned:** What entities/tables/topics this component owns
- **Dependencies:** Which other components it calls and why
- **Scaling strategy:** Horizontal | vertical | serverless | cache-backed
- **Failure mode:** What happens when this component is unavailable

---

## 5. Data Architecture

### 5.1 Data Models
For each primary entity: field name, type, constraints, indexes. Use a table format.

### 5.2 Database Choices
Justify each storage engine against access patterns (not just "we use Postgres").

### 5.3 Data Flow
Walk through the top 3-5 critical user journeys end-to-end, referencing edge IDs 
from the diagram. Show request/response shapes.

### 5.4 State Management
- Where is mutable state held?
- Consistency model: strong | eventual | causal
- Cache invalidation strategy

---

## 6. API Contracts

For each external-facing or inter-service API, define:
- Method, path, auth scheme
- Request schema (with field types and validation rules)
- Response schema (success + error shapes)
- Rate limits and pagination strategy
- Versioning approach

---

## 7. Infrastructure & DevOps

- **CI/CD pipeline:** branch strategy, test gates, deployment method
- **IaC:** Terraform / Pulumi / CDK — list resources to be provisioned
- **Secrets management:** how credentials are stored and rotated
- **Cost estimate:** rough monthly cost at baseline and at scale target
- **Monitoring stack:** metrics, logs, traces, alerts and on-call runbooks

---

## 8. Security Model

- **Authentication:** mechanism + token lifetime
- **Authorization:** model (RBAC/ABAC/ReBAC), enforcement point
- **Network security:** VPC layout, ingress rules, private vs. public subnets
- **Threat model:** top 5 attack surfaces and mitigations
- **Audit logging:** what actions are logged, retention period

---

## 9. Error Handling & Resilience

- Retry policy per integration (max attempts, backoff strategy)
- Circuit breaker thresholds
- Graceful degradation paths (what features disable under load?)
- Dead-letter queue strategy for async flows
- Chaos engineering test cases (optional but recommended)

---

## 10. Testing Strategy

- **Unit:** coverage target, mocking approach
- **Integration:** contract tests between services
- **E2E:** critical user journeys covered
- **Load:** tool, target RPS, pass/fail criteria
- **Security:** SAST, DAST, dependency scanning tools

---

## 11. Migration & Rollout Plan

- Is this greenfield or replacing an existing system?
- Data migration strategy (if applicable)
- Feature flag / dark launch strategy
- Rollback procedure
- Phase 1 / Phase 2 scope split

---

## 12. Open Questions & Decisions

Use an ADR-lite format:
| ID | Question | Options Considered | Decision | Rationale |
|----|----------|--------------------|----------|-----------|
| Q-001 | ... | A, B, C | A | Because... |

Flag unresolved questions explicitly as [UNRESOLVED].
Flag assumptions explicitly as [ASSUMPTION].
Flag any recommended technology not present in the existing stack as [NEW DEP: reason].

---

## 13. Technology Choices
*(Include only if no stack was specified in the chat history. If a stack was 
specified, remove this section and reflect those choices throughout the spec.)*

- **Language/Runtime:** 
- **Framework:** 
- **Database(s):** 
- **Infrastructure/Cloud:** 
- **Key libraries/tools:** 

Justify each choice against the architecture requirements — do not list 
technologies without a reason.

## 14. Glossary
Define domain-specific terms used in this document.

Guidelines:
- Use clean, well-structured Markdown.
- Write in a professional technical language and be precise.
- Reference specific component IDs or labels from the diagram.
- If the chat history contains specific requirements or constraints, ensure they are reflected in the spec.
- Do not include meta-talk; start directly with the specification content.
- Reference node IDs and edge IDs directly from the diagram.
- Where the diagram or chat is ambiguous, state your assumption explicitly and flag it as [ASSUMPTION].
- Where a decision has major tradeoffs, briefly note the alternative considered.
- All latency/scale numbers must be concrete (e.g., "< 200ms p95") not vague ("fast response times").
- Do NOT include sections that genuinely don't apply — mark them N/A with a one-line reason rather than leaving them blank or padding with generalities.
- Do NOT introduce new dependencies without flagging them as [NEW DEP: reason it is necessary]. The existing stack will be provided separately at build time.`,
        prompt: `Project ID: ${validated.projectId}

Chat History:
${validated.chatHistory.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}

Canvas Elements:
Nodes: ${JSON.stringify(validated.nodes, null, 2)}
Edges: ${JSON.stringify(validated.edges, null, 2)}

Please generate the full technical specification now.`,
      });

      await broadcastStatus("Saving specification...", true);
 
      // Upload to Vercel Blob
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        throw new Error("BLOB_READ_WRITE_TOKEN is required for this task");
      }

      const specId = randomUUID();
      const filename = `specs/${validated.projectId}/${specId}.md`;
      const blob = await put(filename, text, {
        access: "private",
        contentType: "text/markdown",
        addRandomSuffix: false,
      });

      // Save to database
      if (!prisma) {
        throw new Error("DATABASE_URL is required for this task");
      }
      const now = new Date();
      await prisma!.projectSpec.create({
        data: {
          id: specId,
          projectId: validated.projectId,
          name: `Spec ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          filePath: blob.url,
        },
      });

      await broadcastStatus("Specification generated and saved!", false);

      return {
        specId,
        url: blob.url,
      };
    } catch (error) {
      console.error("Generate spec task failed:", error);
      await broadcastStatus("Failed to generate specification.", false);
      throw error;
    }
  },
});
