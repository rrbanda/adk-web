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

import {Injectable, InjectionToken} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {AgentAdapter} from './adapter.interface';

export const ADAPTER_REGISTRY =
    new InjectionToken<AdapterRegistry>('AdapterRegistry');

/**
 * Central registry for all framework adapters.
 *
 * Components and services use this to discover available frameworks,
 * switch between them, and route agent operations to the correct adapter.
 */
@Injectable({providedIn: 'root'})
export class AdapterRegistry {
  private adapters = new Map<string, AgentAdapter>();
  private activeAdapterId$ = new BehaviorSubject<string>('adk');

  /**
   * Register a framework adapter.
   * Typically called during application bootstrap.
   */
  register(adapter: AgentAdapter): void {
    this.adapters.set(adapter.frameworkId, adapter);
  }

  /** Unregister a framework adapter by its ID. */
  unregister(frameworkId: string): void {
    this.adapters.delete(frameworkId);
    if (this.activeAdapterId$.value === frameworkId) {
      const firstKey = this.adapters.keys().next().value;
      this.activeAdapterId$.next(firstKey ?? '');
    }
  }

  /** Get a specific adapter by framework ID. */
  getAdapter(frameworkId: string): AgentAdapter|undefined {
    return this.adapters.get(frameworkId);
  }

  /** Get the currently active adapter. */
  getActiveAdapter(): AgentAdapter|undefined {
    return this.adapters.get(this.activeAdapterId$.value);
  }

  /** Set the active framework by ID. */
  setActiveAdapter(frameworkId: string): void {
    if (!this.adapters.has(frameworkId)) {
      console.warn(`Adapter '${frameworkId}' not registered`);
      return;
    }
    this.activeAdapterId$.next(frameworkId);
  }

  /** Observable of the active framework ID. */
  getActiveAdapterId(): Observable<string> {
    return this.activeAdapterId$.asObservable();
  }

  /** List all registered adapters. */
  listAdapters(): AgentAdapter[] {
    return Array.from(this.adapters.values());
  }

  /** Check if a specific adapter is registered. */
  hasAdapter(frameworkId: string): boolean {
    return this.adapters.has(frameworkId);
  }
}
