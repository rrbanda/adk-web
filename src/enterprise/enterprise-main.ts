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

/**
 * Enterprise bootstrap configuration.
 *
 * This file demonstrates how the enterprise layer overrides upstream
 * injection tokens to add multi-framework support, authentication,
 * and other enterprise features.
 *
 * Usage: Import `enterpriseProviders` into the application bootstrap
 * alongside the upstream providers.
 *
 * NOTE: This file does NOT replace `src/main.ts` (upstream bootstrap).
 * Instead, it provides additional/override providers that are merged
 * into the upstream bootstrap configuration.
 */

import {Provider} from '@angular/core';

import {AdkAdapter} from './adapters/adk/adk.adapter';
import {ADAPTER_REGISTRY, AdapterRegistry} from './adapters/registry';

/**
 * Enterprise providers to merge with upstream bootstrap.
 *
 * Add new framework adapters, enterprise services, and overrides here.
 * Each provider either:
 * - Replaces an upstream service (same injection token, new implementation)
 * - Adds a new enterprise-only service (new injection token)
 */
export function getEnterpriseProviders(): Provider[] {
  return [
    // Adapter registry
    {provide: ADAPTER_REGISTRY, useClass: AdapterRegistry},

    // Framework adapters
    AdkAdapter,

    // --- Future enterprise providers ---
    // { provide: AGENT_SERVICE, useClass: EnterpriseAgentService },
    // { provide: SESSION_SERVICE, useClass: EnterpriseSessionService },
    // { provide: FEATURE_FLAG_SERVICE, useClass: EnterpriseFeatureFlagService },
    // { provide: THEME_SERVICE, useClass: EnterpriseBrandingService },
    // { provide: FEEDBACK_SERVICE, useClass: EnterpriseFeedbackService },
    // provideHttpClient(withInterceptors([authInterceptor])),
  ];
}
