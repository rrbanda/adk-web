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

import {Inject, Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {AgentRunRequest} from '../../../app/core/models/AgentRunRequest';
import {Event, LlmResponse} from '../../../app/core/models/types';
import {AGENT_SERVICE, AgentService} from '../../../app/core/services/interfaces/agent';
import {SESSION_SERVICE, SessionService} from '../../../app/core/services/interfaces/session';
import {
  AdapterCapabilities,
  AgentAdapter,
  AgentInfo,
  SessionInfo,
  UnifiedEvent,
  UnifiedRunRequest,
} from '../adapter.interface';

/**
 * ADK adapter — pass-through to upstream google/adk-web services.
 *
 * This is the default adapter that delegates directly to the upstream
 * AgentService and SessionService. It proves the adapter pattern works
 * and serves as the reference implementation for other adapters.
 */
@Injectable()
export class AdkAdapter implements AgentAdapter {
  readonly frameworkId = 'adk';
  readonly displayName = 'Google ADK';

  constructor(
      @Inject(AGENT_SERVICE) private agentService: AgentService,
      @Inject(SESSION_SERVICE) private sessionService: SessionService,
  ) {}

  listAgents(): Observable<AgentInfo[]> {
    return this.agentService.listApps().pipe(
        map((apps: string[]) => apps.map(app => ({
               id: app,
               name: app,
               frameworkId: this.frameworkId,
             }))),
    );
  }

  runAgent(request: UnifiedRunRequest): Observable<UnifiedEvent> {
    const adkRequest: AgentRunRequest = {
      appName: request.agentId,
      userId: request.userId,
      sessionId: request.sessionId,
      newMessage: {
        role: request.message.role,
        parts: request.message.parts.map(p => ({text: p.text})),
      },
      streaming: request.streaming,
    };

    return this.agentService.runSse(adkRequest).pipe(
        map((response: LlmResponse) => {
          const event = response as Event;
          return {
            event,
            frameworkId: this.frameworkId,
            partial: !(event.turnComplete),
            turnComplete: event.turnComplete,
          };
        }),
    );
  }

  createSession(agentId: string, userId: string): Observable<SessionInfo> {
    return this.sessionService.createSession(userId, agentId).pipe(
        map(session => ({
               id: session.id ?? '',
               agentId,
               userId,
               createdAt: Date.now(),
             })),
    );
  }

  getSessionHistory(sessionId: string): Observable<UnifiedEvent[]> {
    return of([]);
  }

  getCapabilities(): AdapterCapabilities {
    return {
      streaming: true,
      tracing: true,
      eval: true,
      liveAudio: true,
      liveVideo: true,
      artifacts: true,
      agentBuilder: true,
    };
  }
}
