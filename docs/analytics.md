# Analytics

The site loads Google Tag Manager container **GTM-NGWM555W** once, asynchronously, after initializing `window.dataLayer`. The published container was verified to connect to **G-93BBGVF37L**. The container owns the Google tag and automatic page views; the application does not load another `gtag.js` script or issue another `config`/`page_view` command.

`src/analytics.ts` sends custom events through the Google tag API, queued in the same data layer, with `send_to` set to that GA4 destination. These commands use the existing Google tag; do not add a second GTM custom-event forwarding tag for them. If the destination is changed in GTM, update `analyticsConfig.measurementId` too. Public tag IDs are configuration, not credentials.

## Events

| Event                    | Trigger                                                       | Useful parameters                                                                             |
| ------------------------ | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `library_ready`          | Interactive explorer mounts, once per page                    | `icon_count`, `package_version`                                                               |
| `search`                 | Search pauses for 600 ms                                      | `search_term`, `query_length`, `icon_category`, `result_count`                                |
| `search_clear`           | Clear-search button                                           | `icon_category`                                                                               |
| `filters_reset`          | Reset search and filters                                      | `icon_category`                                                                               |
| `availability_filter`    | npm/all/SVG-source filter changes                             | `availability`                                                                                |
| `sort_change`            | Collection/name sort changes                                  | `sort_order`                                                                                  |
| `share_view`             | View link copied successfully                                 | `icon_category`, `weight`                                                                     |
| `category_filter`        | A different category is selected                              | `icon_category`, `icon_count`                                                                 |
| `icon_preview`           | Icon details open                                             | `icon_name`, `icon_category`, `available_in_package`                                          |
| `icon_preview_close`     | Details close, including Escape/backdrop                      | `icon_name`, `view_duration_ms`                                                               |
| `preview_change`         | Size, color or canvas changes                                 | `control`, `context`, `icon_name`, `icon_size`, `icon_color`, `canvas_color`, `stroke_weight` |
| `grid_density_change`    | Compact/comfortable grid toggle                               | `density`                                                                                     |
| `copy_code`              | Clipboard write succeeds                                      | `code_format`, `icon_name`                                                                    |
| `copy_code_failed`       | Clipboard write fails                                         | `code_format`, `icon_name`, `failure_reason`                                                  |
| `download_svg`           | SVG blob and download action are created                      | `icon_name`, `icon_category`, `icon_size`, `icon_color`, `available_in_package`               |
| `download_svg_failed`    | Download creation fails                                       | `icon_name`                                                                                   |
| `cta_click`              | Navigation/CTA/attribution link is activated                  | `link_type`, `link_text`, `link_url`, `placement`, `new_tab`                                  |
| `faq_open`               | FAQ answer opens                                              | `question`                                                                                    |
| `section_view`           | A section heading becomes at least 50% visible, once per page | `section_id`                                                                                  |
| `navigation_menu_toggle` | Mobile menu opens/closes                                      | `menu_state`                                                                                  |

`link_type` distinguishes npm, GitHub, documentation, contribution, attribution, licence and internal navigation. `code_format` distinguishes React imports, JSX, SVG markup, install commands and React examples. `context` distinguishes grid and detail controls. Continuous size/color changes are debounced by 500 ms. Empty searches and initial control values do not create change events.

The download event records creation of the browser download action, not confirmation that a file was saved to disk. Section visibility uses headings so a tall 104-icon grid can still register an impression. Event listeners and observers are cleaned up on unmount; React Strict Mode does not double-count library readiness or bind duplicate listeners.

## Payload boundaries

Custom events do not contain clipboard/code contents, downloaded SVG contents, error stacks or link query strings. Search terms are capped at 80 characters; queries that resemble email addresses, URLs or phone numbers omit `search_term` while retaining aggregate length/result counts. These safeguards apply to the application's custom payloads; separately managed GTM tags and enhanced measurement remain configured in the Google account.

## Verify and report

1. Open Tag Assistant for `https://muslimicons.vercel.app` and confirm container `GTM-NGWM555W` loads once.
2. For custom-event debugging, visit `https://muslimicons.vercel.app/?analytics_debug=1`. Custom events then carry `debug_mode: true`.
3. In the connected GA4 property's DebugView/Realtime, search, change a category, preview an icon, copy code, download SVG and click npm. Verify event names and parameters. An ad blocker or account-side consent/filter settings can prevent delivery.
4. Register event-scoped custom dimensions for reporting fields such as `icon_name`, `icon_category`, `link_type`, `placement`, `code_format`, `control`, `context` and `section_id`. Numeric parameters can be registered as custom metrics if needed. Standard search reports use `search_term`.
5. For product funnels, compare search → icon preview → copy/download and npm CTA clicks. In GA4, a derived event conditioned on `cta_click` plus `link_type=npm` can be marked as a key event. Account-side reporting dimensions and key events require the owner's Google Analytics access and are not created by this repository.

Automated tests verify bootstrap order, preservation/routing of the data layer, debouncing, search redaction, listener cleanup/deduplication, clipboard success/failure events, downloads and section impressions. They use a local queue and do not send synthetic traffic into production GA4. A successful site deployment or queued event is not proof that the Google account has received it; verify receipt in DebugView/Realtime.
