# Upstream Extension Points Audit

> **Upstream:** [google/adk-web](https://github.com/google/adk-web) (Angular 21)
> **Last audited:** 2026-06-28
> **Purpose:** Map every injection token, swappable component, feature flag, i18n token, and configuration point in the upstream codebase. This document is the reference for building the enterprise `agent-chat` layer on top without modifying upstream code.

---

## 1. Service Injection Tokens

These are the primary extension seam. Each token has an abstract interface in `src/app/core/services/interfaces/` and a concrete implementation wired in `src/main.ts`. The enterprise layer replaces implementations by providing its own classes for these tokens.

### Core Agent Communication

| Token | Interface | Default Implementation | File | Enterprise Use |
|-------|-----------|----------------------|------|----------------|
| `AGENT_SERVICE` | `AgentService` (abstract class) | `AgentService` | `interfaces/agent.ts` | Multi-framework adapter dispatch; wraps `runSse()`, `listApps()`, builder endpoints |
| `SESSION_SERVICE` | `SessionService` (abstract class) | `SessionService` | `interfaces/session.ts` | Add auth headers, tenant-scoped session CRUD, pagination via `ListParams`/`ListResponse` |
| `EVENT_SERVICE` | `EventService` (abstract class) | `EventService` | `interfaces/event.ts` | Audit logging on trace/event access; framework-specific trace formats |
| `ARTIFACT_SERVICE` | `ArtifactService` (abstract class) | `ArtifactService` | `interfaces/artifact.ts` | Scoped storage backends, access control on artifact retrieval |

### Eval and Testing

| Token | Interface | Default Implementation | File | Enterprise Use |
|-------|-----------|----------------------|------|----------------|
| `EVAL_SERVICE` | `EvalService` (abstract class) | `EvalService` | `interfaces/eval.ts` | Enterprise eval pipelines, custom metric providers |

### Live Streaming (Audio/Video)

| Token | Interface | Default Implementation | File | Enterprise Use |
|-------|-----------|----------------------|------|----------------|
| `WEBSOCKET_SERVICE` | `WebSocketService` (abstract class) | `WebSocketService` | `interfaces/websocket.ts` | Custom WS auth, connection management |
| `STREAM_CHAT_SERVICE` | `StreamChatService` (abstract class) | `StreamChatService` | `interfaces/stream-chat.ts` | Framework-specific live streaming protocols |
| `AUDIO_RECORDING_SERVICE` | (abstract class) | `AudioRecordingService` | `interfaces/audio-recording.ts` | Custom audio pipelines |
| `AUDIO_PLAYING_SERVICE` | (abstract class) | `AudioPlayingService` | `interfaces/audio-playing.ts` | Custom audio output |
| `VIDEO_SERVICE` | (abstract class) | `VideoService` | `interfaces/video.ts` | Custom video pipelines |
| `AUDIO_WORKLET_MODULE_PATH` | `string` value | `'./assets/audio-processor.js'` | `interfaces/audio-recording.ts` | Custom audio worklet path |

### UI State and Utilities

| Token | Interface | Default Implementation | File | Enterprise Use |
|-------|-----------|----------------------|------|----------------|
| `UI_STATE_SERVICE` | `UiStateService` (abstract class) | `UiStateService` | `interfaces/ui-state.ts` | Lazy loading, session loading states |
| `TRACE_SERVICE` | `TraceService` (abstract class) | `TraceService` | `interfaces/trace.ts` | Trace selection state |
| `FEATURE_FLAG_SERVICE` | `FeatureFlagService` (abstract class) | `FeatureFlagService` | `interfaces/feature-flag.ts` | Enterprise feature gates (see section 3) |
| `FEEDBACK_SERVICE` | `FeedbackService` (abstract class) | `FeedbackService` (stub) | `interfaces/feedback.ts` | Enterprise feedback collection (stub is no-op in OSS) |
| `GRAPH_SERVICE` | (abstract class) | `GraphService` | `interfaces/graph.ts` | Custom graph rendering |
| `DOWNLOAD_SERVICE` | (abstract class) | `DownloadService` | `interfaces/download.ts` | Download with audit trail |
| `LOCAL_FILE_SERVICE` | (abstract class) | `LocalFileServiceImpl` | `interfaces/localfile.ts` | File upload policies |
| `SAFE_VALUES_SERVICE` | (abstract class) | `SafeValuesServiceImpl` | `interfaces/safevalues.ts` | Security policies |
| `STRING_TO_COLOR_SERVICE` | (abstract class) | `StringToColorServiceImpl` | `interfaces/string-to-color.ts` | Branding-consistent colors |
| `THEME_SERVICE` | `ThemeServiceInterface` | `ThemeService` | `interfaces/theme.ts` | Corporate branding themes, extended palette |
| `AGENT_BUILDER_SERVICE` | `AgentBuilderService` (abstract class) | `AgentBuilderService` | `interfaces/agent-builder.ts` | Enterprise agent builder extensions |
| `LOCATION_SERVICE` | Angular `Location` | `Location` | `location.service.ts` | Custom routing behavior |

**Total: 22 injection tokens** — all swappable without touching upstream.

---

## 2. Swappable Component Tokens

These allow replacing entire UI components via DI.

| Token | Type | Default | Condition | File | Enterprise Use |
|-------|------|---------|-----------|------|----------------|
| `LOGO_COMPONENT` | `Type<Component>` | `CustomLogoComponent` | Only if `config.logo` is set | `injection_tokens.ts` | White-label branding |
| `MARKDOWN_COMPONENT` | `Type<Component>` | `MarkdownComponent` | Always | `components/markdown/markdown.component.interface.ts` | Custom rendering policies, sanitization |
| `EVAL_TAB_COMPONENT` | `Type<Component>` | `EvalTabComponent` | Always | `components/eval-tab/eval-tab.component.ts` | Enterprise eval UI |

---

## 3. Feature Flags

The `FeatureFlagService` interface has 27 boolean flags. Enterprise can override any of them.

### Defaults in OSS (from `feature-flag.service.ts`)

| Flag | Default | Query Param Gated | Enterprise Relevance |
|------|---------|-------------------|---------------------|
| `isImportSessionEnabled` | `true` | No | Session management |
| `isEditFunctionArgsEnabled` | `false` | `edit_function_args=true` | Dev tooling |
| `isSessionUrlEnabled` | `true` | No | Deep linking |
| `isA2ACardEnabled` | `false` | `a2a_card=true` | A2A protocol support |
| `isApplicationSelectorEnabled` | `true` | No | Multi-app selection |
| `isAlwaysOnSidePanelEnabled` | `false` | No | Layout control |
| `isTraceEnabled` | `true` | No | Debugging |
| `isArtifactsTabEnabled` | `true` | No | Artifact management |
| `isEvalEnabled` | `true` | No | Evaluation |
| `isEvalV2Enabled` | `false` | `eval_v2=true` | Eval v2 features |
| `isTestsEnabled` | `false` | `tests=true` | Testing tab |
| `isTokenStreamingEnabled` | `true` | No | SSE streaming |
| `isMessageFileUploadEnabled` | `true` | No | File attachments |
| `isManualStateUpdateEnabled` | `true` | No | State editing |
| `isBidiStreamingEnabled` | `true` | No | Audio/video |
| `isExportSessionEnabled` | `true` | No | Session export |
| `isEventFilteringEnabled` | `false` | No | Event tab filtering |
| `isDeleteSessionEnabled` | `true` | No | Session deletion |
| `isLoadingAnimationsEnabled` | `true` | No | UX polish |
| `isSessionsTabReorderingEnabled` | `false` | No | Session tab UX |
| `isSessionFilteringEnabled` | `false` | No | Session search |
| `isSessionReloadOnNewMessageEnabled` | `false` | No | Message refresh |
| `isUserIdOnToolbarEnabled` | `true` | No | User context |
| `isDeveloperUiDisclaimerEnabled` | `true` | No | Dev disclaimer |
| `isFeedbackServiceEnabled` | `false` | No | Feedback (stub in OSS) |
| `isInfinityMessageScrollingEnabled` | `false` | No | Virtual scroll |
| `isMoreOptionsButtonHidden` | `false` | No | UI options |
| `isNewSessionButtonEnabled` | `true` | No | Session creation |

---

## 4. i18n Message Injection Tokens

Every major component has an injectable messages object for localization or copy customization.

| Token | Component | File |
|-------|-----------|------|
| `ChatMessagesInjectionToken` | `ChatComponent` | `components/chat/chat.component.i18n.ts` |
| `ChatPanelMessagesInjectionToken` | `ChatPanelComponent` | `components/chat-panel/chat-panel.component.i18n.ts` |
| `SidePanelMessagesInjectionToken` | `SidePanelComponent` | `components/side-panel/side-panel.component.i18n.ts` |
| `EventTabMessagesInjectionToken` | `EventTabComponent` | `components/event-tab/event-tab.component.i18n.ts` |
| `EvalTabMessagesInjectionToken` | `EvalTabComponent` | `components/eval-tab/eval-tab.component.i18n.ts` |
| `TraceTabMessagesInjectionToken` | `TraceTabComponent` | `components/trace-tab/trace-tab.component.i18n.ts` |
| `SessionTabMessagesInjectionToken` | `SessionTabComponent` | `components/session-tab/session-tab.component.i18n.ts` |
| `StateTabMessagesInjectionToken` | `StateTabComponent` | `components/state-tab/state-tab.component.i18n.ts` |
| `MessageFeedbackMessagesInjectionToken` | `MessageFeedbackComponent` | `components/message-feedback/message-feedback.component.i18n.ts` |
| `EditJsonDialogMessagesInjectionToken` | `EditJsonDialogComponent` | `components/edit-json-dialog/edit-json-dialog.component.i18n.ts` |

These use `providedIn: 'root'` with sensible English defaults. Enterprise can override any by providing its own value for the token.

---

## 5. Runtime Configuration

### `runtime-config.json` (loaded before bootstrap)

```typescript
interface RuntimeConfig {
  backendUrl: string;       // ADK API server URL (empty = same-origin)
  logo?: LogoConfig;        // Optional custom logo
}

interface LogoConfig {
  text: string;             // Display text
  imageUrl: string;         // Logo image URL
}
```

- Loaded via `fetch()` in `main.ts` before Angular bootstraps
- Stored on `window.runtimeConfig`
- Accessed via `URLUtil.getApiServerBaseUrl()` and `RuntimeConfigUtil.getRuntimeConfig()`

### Extension opportunity

The enterprise layer can extend `RuntimeConfig` with additional fields (auth config, branding, adapter settings) and load them from the same JSON file or environment variables.

---

## 6. A2UI Integration

| Token | Default | Purpose |
|-------|---------|---------|
| `Catalog` (@a2ui/angular) | `DEFAULT_CATALOG` | A2UI component catalog |
| `Theme` (@a2ui/angular) | `A2UI_THEME` (from `core/constants/a2ui-theme.ts`) | A2UI rendering theme |

---

## 7. Theming Infrastructure

### CSS Variable Layer (`src/styles.scss`)

The app uses Angular Material 21 theming with CSS custom properties:

- Light/dark theme classes on `<html>`: `.light-theme` / `.dark-theme`
- Custom `--mat-sys-*` CSS variables for Material component overrides
- `ThemeService` toggles theme, persists to `localStorage('adk-theme-preference')`
- Prism syntax highlight CSS is swapped per theme

### Enterprise override strategy

- Provide a custom `ThemeService` via `THEME_SERVICE` token
- Override `--mat-sys-*` CSS variables in enterprise stylesheet
- Add brand colors as additional CSS custom properties

---

## 8. Routing

```typescript
// app-routing.module.ts
{ path: '', component: AppComponent }
```

Single route. All state is query-parameter driven:

| Query Param | Purpose |
|-------------|---------|
| `app` | Selected agent/app |
| `session` | Session ID |
| `userId` | User ID |
| `mode=builder` | Agent builder view |
| `evalCase`, `evalResult` | Eval mode |
| `file` | File-based chat |
| `q` | Pre-filled input |
| `hideSidePanel` | Layout control |
| Feature flag params | `edit_function_args`, `eval_v2`, `tests`, `a2a_card` |

### Enterprise extension

The enterprise shell can add its own routes (admin, settings, org management) alongside the upstream single-route chat.

---

## 9. What Upstream Does NOT Provide

These are the gaps the enterprise `agent-chat` layer must fill:

| Gap | Notes |
|-----|-------|
| **HTTP Interceptors** | No `HttpInterceptor` implementations exist. Clean slot for auth, logging, retry |
| **Authentication** | No auth layer — all API calls are unauthenticated |
| **Multi-framework abstraction** | Tightly coupled to ADK API server endpoints |
| **Multi-route navigation** | Single route, query-param driven |
| **Persistent state management** | Angular signals + RxJS only, no NgRx/store |
| **Error handling middleware** | Each service handles errors independently |
| **Deployment packaging** | No Dockerfile, no Helm chart, no env-var config injection |
| **RBAC / Multi-tenancy** | No concept of orgs, teams, or roles |
| **Audit logging** | No centralized logging |
| **Feedback backend** | `FeedbackService` is a no-op stub |

---

## 10. Testing Infrastructure

| Aspect | Details |
|--------|---------|
| Framework | Jasmine + Karma |
| Mock layer | `src/app/core/services/testing/mock-*.service.ts` for every service |
| Compatibility | `initTestBed()` from `src/app/testing/utils.ts` required before `TestBed.configureTestingModule()` |
| CI | `.github/workflows/angular-tests.yml` — ChromeHeadless |
| Coverage | `karma-coverage` → `./coverage/adk-web` |

### Enterprise testing strategy

- Reuse upstream's mock services for unit testing enterprise components
- Enterprise tests follow the same `initTestBed()` pattern
- Add integration tests for adapter layer
