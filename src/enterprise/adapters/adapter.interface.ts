/**
 * @license
 * Copyright 2026 agent-chat contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Observable} from 'rxjs';
import {Event, LlmResponse} from '../../app/core/models/types';

/**
 * Metadata about an agent available through a framework adapter.
 */
export interface AgentInfo {
  id: string;
  name: string;
  description?: string;
  frameworkId: string;
  metadata?: Record<string, unknown>;
}

/**
 * Unified request to run an agent, framework-agnostic.
 * Adapters translate this into their framework's native request format.
 */
export interface UnifiedRunRequest {
  agentId: string;
  sessionId: string;
  userId: string;
  message: {
    role: string;
    parts: Array<{text?: string; inlineData?: {mimeType: string; data: string}}>;
  };
  streaming?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Unified event emitted by an adapter during agent execution.
 * Wraps the upstream ADK Event model so the UI can render it without
 * knowing which framework produced it.
 */
export interface UnifiedEvent {
  /** The upstream Event object, translated by the adapter. */
  event: Event;
  /** Which framework produced this event. */
  frameworkId: string;
  /** Whether this is a partial/streaming event. */
  partial?: boolean;
  /** Whether this is the final event in the turn. */
  turnComplete?: boolean;
}

/**
 * Session information returned when creating or retrieving a session.
 */
export interface SessionInfo {
  id: string;
  agentId: string;
  userId: string;
  createdAt?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Declares the capabilities a framework adapter supports.
 * The UI uses this to conditionally show/hide features.
 */
export interface AdapterCapabilities {
  streaming: boolean;
  tracing: boolean;
  eval: boolean;
  liveAudio: boolean;
  liveVideo: boolean;
  artifacts: boolean;
  agentBuilder: boolean;
}

/**
 * Contract that every framework adapter must implement.
 *
 * An adapter translates between a specific agent framework's API and the
 * unified ADK Event model that the upstream UI components expect.
 */
export interface AgentAdapter {
  /** Unique identifier for this framework (e.g., 'adk', 'openai', 'langchain'). */
  readonly frameworkId: string;

  /** Human-readable name (e.g., 'Google ADK', 'OpenAI Assistants'). */
  readonly displayName: string;

  /** List agents available in this framework. */
  listAgents(): Observable<AgentInfo[]>;

  /**
   * Run an agent and stream back events.
   * For non-streaming frameworks, emit a single UnifiedEvent and complete.
   * For streaming frameworks, emit partial events followed by a final event.
   */
  runAgent(request: UnifiedRunRequest): Observable<UnifiedEvent>;

  /** Create a new session/thread/conversation. */
  createSession(agentId: string, userId: string): Observable<SessionInfo>;

  /** Retrieve session history as a list of events. */
  getSessionHistory(sessionId: string): Observable<UnifiedEvent[]>;

  /** Declare which capabilities this adapter supports. */
  getCapabilities(): AdapterCapabilities;
}
