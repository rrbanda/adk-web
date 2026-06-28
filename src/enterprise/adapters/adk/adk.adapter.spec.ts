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

import {TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {initTestBed} from '../../../app/testing/utils';
import {AGENT_SERVICE} from '../../../app/core/services/interfaces/agent';
import {SESSION_SERVICE} from '../../../app/core/services/interfaces/session';
import {MockAgentService} from '../../../app/core/services/testing/mock-agent.service';
import {MockSessionService} from '../../../app/core/services/testing/mock-session.service';
import {AdkAdapter} from './adk.adapter';
import {UnifiedRunRequest} from '../adapter.interface';

describe('AdkAdapter', () => {
  let adapter: AdkAdapter;
  let mockAgentService: MockAgentService;
  let mockSessionService: MockSessionService;

  beforeEach(() => {
    initTestBed();
    TestBed.configureTestingModule({
      providers: [
        AdkAdapter,
        {provide: AGENT_SERVICE, useClass: MockAgentService},
        {provide: SESSION_SERVICE, useClass: MockSessionService},
      ],
    });
    adapter = TestBed.inject(AdkAdapter);
    mockAgentService = TestBed.inject(AGENT_SERVICE) as MockAgentService;
    mockSessionService = TestBed.inject(SESSION_SERVICE) as MockSessionService;
  });

  it('should have correct framework metadata', () => {
    expect(adapter.frameworkId).toBe('adk');
    expect(adapter.displayName).toBe('Google ADK');
  });

  it('should declare full capabilities', () => {
    const caps = adapter.getCapabilities();
    expect(caps.streaming).toBe(true);
    expect(caps.tracing).toBe(true);
    expect(caps.eval).toBe(true);
    expect(caps.liveAudio).toBe(true);
    expect(caps.artifacts).toBe(true);
    expect(caps.agentBuilder).toBe(true);
  });

  it('should list agents by delegating to AgentService.listApps', (done) => {
    spyOn(mockAgentService, 'listApps').and.returnValue(of(['app1', 'app2']));

    adapter.listAgents().subscribe(agents => {
      expect(agents.length).toBe(2);
      expect(agents[0].id).toBe('app1');
      expect(agents[0].name).toBe('app1');
      expect(agents[0].frameworkId).toBe('adk');
      expect(agents[1].id).toBe('app2');
      done();
    });
  });

  it('should translate UnifiedRunRequest to AgentRunRequest for runAgent', (done) => {
    const mockResponse = {
      content: {role: 'model', parts: [{text: 'Hello'}]},
      id: 'evt-1',
      turnComplete: true,
    };
    spyOn(mockAgentService, 'runSse').and.returnValue(of(mockResponse));

    const request: UnifiedRunRequest = {
      agentId: 'test-app',
      sessionId: 'session-1',
      userId: 'user-1',
      message: {
        role: 'user',
        parts: [{text: 'Hi'}],
      },
      streaming: true,
    };

    adapter.runAgent(request).subscribe(event => {
      expect(event.frameworkId).toBe('adk');
      expect(event.event.content.role).toBe('model');
      expect(event.turnComplete).toBe(true);
      done();
    });
  });
});
