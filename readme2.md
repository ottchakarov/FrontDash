# FrontDash Database Design Guide

This document captures the proposed relational database design for the FrontDash web application so you can prepare the deliverables required for the database design assignment (typed table definitions, E-R diagram, and presentation assets).

## Scope & Goals
- Support every persona featured in FrontDash (customers, restaurant owners, staff, admins, and delivery drivers).
- Persist menu authoring, order management, onboarding workflows, and withdrawal requests that are currently implemented with in-memory session stores.
- Provide a schema that maps cleanly onto a SQL relational database (PostgreSQL recommended) and is ready to visualize in a professional E-R diagramming tool.

## Technology & Conventions
- **Database engine:** PostgreSQL 15+ (any modern relational engine works; adjust types if needed).
- **Primary keys:** UUID (`uuid_generate_v4()`) for user-facing entities, `bigserial` for internal tables where human-readable IDs are not required.
- **Timestamps:** Store in UTC (`timestamptz`). Capture both `created_at` and `updated_at` when practical.
- **Booleans & enums:** Use PostgreSQL `boolean` and `enum` types for status fields (definitions included below). Alternatively maintain lookup tables if your engine lacks enums.
- **Money values:** Use `numeric(10,2)` to avoid floating point rounding.
- **Soft deletes:** Prefer `status` or `archived_at` flags over physical deletes for compliance-sensitive data (orders, payments).

## Entity & Table Definitions

### Identity & Access

#### roles
| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| role_id | smallserial | PK | |
| role_key | text | UNIQUE NOT NULL | `owner`, `staff`, `admin`, `customer`, `driver` |
| display_name | text | NOT NULL | Human-friendly label |
| description | text |  | Optional copy for admin UI |

#### users
| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| user_id | uuid | PK DEFAULT uuid_generate_v4() | |
| role_id | smallint | NOT NULL REFERENCES roles(role_id) | Role-based routing (owner vs staff) |
| email | citext | UNIQUE NOT NULL | Case-insensitive login |
| password_hash | text | NOT NULL | Store bcrypt/argon hash |
| first_name | text | NOT NULL | |
| last_name | text | NOT NULL | |
| phone | text |  | Digits only or E.164 |
| status | user_status | NOT NULL DEFAULT 'active' | Enum defined in [Reference enums](#reference-enums) |
| last_login_at | timestamptz |  | Auditing |
| created_at | timestamptz | NOT NULL DEFAULT now() | |
| updated_at | timestamptz | NOT NULL DEFAULT now() | Trigger to keep fresh |

#### user_profiles
| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| user_id | uuid | PK REFERENCES users(user_id) ON DELETE CASCADE | 1–1 extension row |
| preferred_name | text |  | Optional display name |
| marketing_opt_in | boolean | NOT NULL DEFAULT false | |
| avatar_url | text |  | Stored object storage path |

### Restaurant Onboarding & Operations

#### restaurant_applications
| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| application_id | uuid | PK DEFAULT uuid_generate_v4() | |
| restaurant_name | text | NOT NULL | From owner registration form |
| contact_name | text | NOT NULL | |
| contact_email | text | NOT NULL | |
| contact_phone | text | NOT NULL | Digits only |
| operating_hours_summary | text | NOT NULL | Free-form summary |
| menu_highlights | text | NOT NULL | Captured from registration |
| status | application_status | NOT NULL DEFAULT 'pending' | Enum |
| submitted_at | timestamptz | NOT NULL DEFAULT now() | |
| reviewed_at | timestamptz |  | Populated after review |
| reviewed_by | uuid | REFERENCES users(user_id) | Admin reviewer |
| review_notes | text |  | Feedback for applicant |
| converted_restaurant_id | uuid | REFERENCES restaurants(restaurant_id) | Filled when approved |

#### restaurants
| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| restaurant_id | uuid | PK DEFAULT uuid_generate_v4() | |
| owner_id | uuid | NOT NULL REFERENCES users(user_id) | Primary account holder |
| name | text | NOT NULL | |
| slug | text | UNIQUE NOT NULL | Used for friendly URLs |
| cuisine | text | NOT NULL | |
| phone | text | NOT NULL | 10-digit US in UI today |
| email | text | NOT NULL | |
| contact_name | text | NOT NULL | Mirrors Account Settings |
| status | restaurant_status | NOT NULL DEFAULT 'pending' | Pending → approved/denied |
| description | text |  | Marketing copy |
| logo_url | text |  | File path uploaded by owner |
| onboarding_completed_at | timestamptz |  | |
| created_at | timestamptz | NOT NULL DEFAULT now() | |
| updated_at | timestamptz | NOT NULL DEFAULT now() | |

#### restaurant_addresses
| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| restaurant_address_id | bigserial | PK | |
| restaurant_id | uuid | NOT NULL REFERENCES restaurants(restaurant_id) ON DELETE CASCADE | |
| building | text | NOT NULL | e.g., `1846` |
| street | text | NOT NULL | |
| city | text | NOT NULL | |
| state | char(2) | NOT NULL | Uppercase |
| postal_code | text | NOT NULL | Zip or Zip+4 |
| latitude | numeric(9,6) |  | For delivery radius |
| longitude | numeric(9,6) |  | |
| is_primary | boolean | NOT NULL DEFAULT true | Allow multiple addresses if needed |

#### restaurant_hours
| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| restaurant_hour_id | bigserial | PK | |
| restaurant_id | uuid | NOT NULL REFERENCES restaurants(restaurant_id) ON DELETE CASCADE | |
| weekday | smallint | NOT NULL | 0=Sunday … 6=Saturday |
| opens_at | time |  | Nullable when closed |
| closes_at | time |  | |
| is_closed | boolean | NOT NULL DEFAULT false | Mirrors toggle in UI |
| created_at | timestamptz | NOT NULL DEFAULT now() | |
| updated_at | timestamptz | NOT NULL DEFAULT now() | |
| UNIQUE (restaurant_id, weekday) | | | Prevent duplicates |

#### restaurant_photos
| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| restaurant_photo_id | uuid | PK DEFAULT uuid_generate_v4() | |
| restaurant_id | uuid | NOT NULL REFERENCES restaurants(restaurant_id) ON DELETE CASCADE | |
| file_url | text | NOT NULL | Stored in S3/Bucket |
| alt_text | text |  | Accessibility copy |
| is_primary | boolean | NOT NULL DEFAULT false | One primary image |
| uploaded_by | uuid | REFERENCES users(user_id) | Owner or staff |
| uploaded_at | timestamptz | NOT NULL DEFAULT now() | |

#### restaurant_staff
| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| restaurant_staff_id | bigserial | PK | |
| restaurant_id | uuid | NOT NULL REFERENCES restaurants(restaurant_id) ON DELETE CASCADE | |
| user_id | uuid | NOT NULL REFERENCES users(user_id) | Staff assigned to outlet |
| staff_role | text | NOT NULL | e.g., `Account specialist` |
| invited_at | timestamptz | NOT NULL DEFAULT now() | |
| accepted_at | timestamptz |  | Null until invite accepted |
| is_active | boolean | NOT NULL DEFAULT true | Toggle for roster |
| UNIQUE (restaurant_id, user_id) | | | |

### Menu Management

#### menu_sections
| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| menu_section_id | uuid | PK DEFAULT uuid_generate_v4() | |
| restaurant_id | uuid | NOT NULL REFERENCES restaurants(restaurant_id) ON DELETE CASCADE | |
| title | text | NOT NULL | Starters, Desserts, etc. |
| description | text |  | Optional |
| display_order | integer | NOT NULL DEFAULT 0 | For sorted lists |
| is_active | boolean | NOT NULL DEFAULT true | Hide without deleting |
| created_at | timestamptz | NOT NULL DEFAULT now() | |

#### menu_items
| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| menu_item_id | uuid | PK DEFAULT uuid_generate_v4() | |
| menu_section_id | uuid | NOT NULL REFERENCES menu_sections(menu_section_id) ON DELETE CASCADE | |
| restaurant_id | uuid | NOT NULL REFERENCES restaurants(restaurant_id) | Redundant for filtering |
| name | text | NOT NULL | |
| description | text | NOT NULL | Required in UI |
| allergens | text |  | Comma-separated quick win |
| price | numeric(10,2) | NOT NULL | |
| is_available | boolean | NOT NULL DEFAULT true | AVAILABLE/UNAVAILABLE pill |
| image_url | text |  | Uploaded asset |
| created_at | timestamptz | NOT NULL DEFAULT now() | |
| updated_at | timestamptz | NOT NULL DEFAULT now() | |

#### allergens
| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| allergen_code | text | PK | e.g., `nuts`, `dairy` |
| display_name | text | NOT NULL | |

#### menu_item_allergens
| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| menu_item_id | uuid | REFERENCES menu_items(menu_item_id) ON DELETE CASCADE | PK part |
| allergen_code | text | REFERENCES allergens(allergen_code) ON DELETE RESTRICT | PK part |
| PRIMARY KEY (menu_item_id, allergen_code) | | | Structured tagging alternative to free text |

### Customer Accounts & Addresses

#### customer_profiles
| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| customer_id | uuid | PK REFERENCES users(user_id) ON DELETE CASCADE | Role must be `customer` |
| phone | text |  | Override if different from auth record |
| default_contact_name | text |  | Prefill checkout |
| created_at | timestamptz | NOT NULL DEFAULT now() | |

#### customer_addresses
| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| customer_address_id | uuid | PK DEFAULT uuid_generate_v4() | |
| customer_id | uuid | NOT NULL REFERENCES customer_profiles(customer_id) ON DELETE CASCADE | |
| label | text |  | “Home”, “Work” |
| building | text | NOT NULL | |
| street | text | NOT NULL | |
| city | text | NOT NULL | |
| state | char(2) | NOT NULL | |
| postal_code | text | NOT NULL | |
| is_default_billing | boolean | NOT NULL DEFAULT false | |
| is_default_delivery | boolean | NOT NULL DEFAULT false | |
| created_at | timestamptz | NOT NULL DEFAULT now() | |

### Ordering & Fulfilment

#### orders
| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| order_id | uuid | PK DEFAULT uuid_generate_v4() | Can still expose FD-#### token |
| restaurant_id | uuid | NOT NULL REFERENCES restaurants(restaurant_id) | |
| customer_id | uuid | REFERENCES users(user_id) | Nullable for guest checkout |
| placed_by_role | text | NOT NULL DEFAULT 'customer' | Track how order originated |
| status | order_status | NOT NULL DEFAULT 'new' | Enum matches UI |
| special_instructions | text |  | Delivery notes |
| subtotal | numeric(10,2) | NOT NULL | |
| tax | numeric(10,2) | NOT NULL | |
| service_fee | numeric(10,2) | NOT NULL | |
| delivery_fee | numeric(10,2) | NOT NULL | |
| tip_amount | numeric(10,2) | NOT NULL DEFAULT 0 | |
| total | numeric(10,2) | NOT NULL | |
| payment_id | uuid | REFERENCES order_payments(payment_id) | Nullable until charged |
| billing_address_id | uuid | REFERENCES order_addresses(order_address_id) | |
| delivery_address_id | uuid | REFERENCES order_addresses(order_address_id) | |
| created_at | timestamptz | NOT NULL DEFAULT now() | |
| updated_at | timestamptz | NOT NULL DEFAULT now() | |

#### order_addresses
| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| order_address_id | uuid | PK DEFAULT uuid_generate_v4() | |
| order_id | uuid | NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE | |
| address_type | order_address_type | NOT NULL | Enum: `billing`, `delivery` |
| name | text | NOT NULL | Contact name |
| phone | text | NOT NULL | 10-digit digits only |
| building | text | NOT NULL | |
| street | text | NOT NULL | |
| city | text | NOT NULL | |
| state | char(2) | NOT NULL | |
| postal_code | text | NOT NULL | |
| instructions | text |  | Delivery notes |

#### order_items
| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| order_item_id | bigserial | PK | |
| order_id | uuid | NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE | |
| menu_item_id | uuid | REFERENCES menu_items(menu_item_id) | Null if item deleted later |
| item_name | text | NOT NULL | Snapshot of menu item |
| item_description | text |  | Snapshot |
| allergens | text |  | Snapshot |
| unit_price | numeric(10,2) | NOT NULL | |
| quantity | integer | NOT NULL CHECK (quantity > 0) | |
| line_total | numeric(10,2) | NOT NULL | `unit_price * quantity` |

#### order_status_history
| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| status_event_id | bigserial | PK | |
| order_id | uuid | NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE | |
| status | order_status | NOT NULL | |
| recorded_at | timestamptz | NOT NULL DEFAULT now() | |
| recorded_by | uuid | REFERENCES users(user_id) | Staff who advanced ticket |

#### order_payments
| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| payment_id | uuid | PK DEFAULT uuid_generate_v4() | |
| order_id | uuid | UNIQUE NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE | One payment per order (extend if partial) |
| provider | text | NOT NULL | e.g., Stripe |
| method | text | NOT NULL | `card`, `apple_pay`, etc. |
| card_brand | text |  | Optional |
| card_last4 | char(4) |  | Shown in UI |
| status | payment_status | NOT NULL DEFAULT 'authorized' | Enum |
| amount | numeric(10,2) | NOT NULL | |
| authorized_at | timestamptz | NOT NULL DEFAULT now() | |
| captured_at | timestamptz |  | Filled when captured |

#### driver_assignments
| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| driver_assignment_id | bigserial | PK | |
| order_id | uuid | NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE | |
| driver_id | uuid | NOT NULL REFERENCES users(user_id) | Role must be `driver` |
| assigned_at | timestamptz | NOT NULL DEFAULT now() | |
| pickup_confirmed_at | timestamptz |  | |
| delivery_confirmed_at | timestamptz |  | |
| UNIQUE (order_id, driver_id) | | | Prevent duplicates |

### Administration & Compliance

#### withdraw_requests
| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| withdraw_request_id | uuid | PK DEFAULT uuid_generate_v4() | |
| restaurant_id | uuid | NOT NULL REFERENCES restaurants(restaurant_id) | |
| requested_by | uuid | NOT NULL REFERENCES users(user_id) | Owner initiating |
| status | withdraw_status | NOT NULL DEFAULT 'pending' | Enum matches UI |
| requested_at | timestamptz | NOT NULL DEFAULT now() | |
| decision_at | timestamptz |  | Approval/denial timestamp |
| decision_by | uuid | REFERENCES users(user_id) | Admin reviewer |
| denial_reason | text |  | Presented to owner |
| cancelled_at | timestamptz |  | When owner cancels |

#### admin_announcements
| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| announcement_id | bigserial | PK | |
| message | text | NOT NULL | Banner text shown in dashboards |
| audience | text | NOT NULL | `owner`, `staff`, `all` |
| created_by | uuid | REFERENCES users(user_id) | Admin author |
| created_at | timestamptz | NOT NULL DEFAULT now() | |
| expires_at | timestamptz |  | Optional auto-hide |

#### audit_logs
| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| audit_id | bigserial | PK | |
| actor_id | uuid | REFERENCES users(user_id) | Null for system |
| entity_type | text | NOT NULL | `order`, `restaurant`, etc. |
| entity_id | uuid | NOT NULL | UUID of entity touched |
| action | text | NOT NULL | `create`, `update`, `status_change`, ... |
| previous_data | jsonb |  | Before snapshot |
| new_data | jsonb |  | After snapshot |
| created_at | timestamptz | NOT NULL DEFAULT now() | Compliance trail |

## Reference Enums
Define these PostgreSQL enums (or substitute lookup tables if your engine prefers that pattern):

```sql
CREATE TYPE user_status AS ENUM ('active', 'invited', 'suspended', 'archived');
CREATE TYPE application_status AS ENUM ('pending', 'in_review', 'approved', 'declined');
CREATE TYPE restaurant_status AS ENUM ('pending', 'approved', 'denied', 'suspended', 'withdrawn');
CREATE TYPE order_status AS ENUM ('new', 'in_progress', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('authorized', 'captured', 'failed', 'refunded');
CREATE TYPE withdraw_status AS ENUM ('pending', 'approved', 'denied', 'cancelled');
CREATE TYPE order_address_type AS ENUM ('billing', 'delivery');
```

## Relationship Summary
| Parent Table | Child Table | Cardinality | Description |
| --- | --- | --- | --- |
| roles | users | 1 → many | Role determines dashboard landing route. |
| users (owner role) | restaurants | 1 → many | One owner can manage multiple restaurants. |
| restaurants | restaurant_hours | 1 → many | Seven rows per restaurant for weekly schedule. |
| restaurants | menu_sections | 1 → many | Sections group a restaurant’s menu items. |
| menu_sections | menu_items | 1 → many | Items inherit availability and ordering. |
| restaurants | orders | 1 → many | Orders are scoped to a single restaurant. |
| orders | order_items | 1 → many | Line items capture item snapshot at purchase time. |
| orders | order_status_history | 1 → many | Tracks staff progress through NEW → COMPLETED. |
| restaurants | withdraw_requests | 1 → many | Owners may submit several requests over time. |
| orders | driver_assignments | 1 → many | Supports reassignment if initial driver fails pickup. |

> **Tip:** When you build the ER diagram, annotate each relationship with the matching FK so the instructor can trace the mapping quickly.

## ER Diagram Instructions
1. Use a professional tool such as draw.io (diagrams.net), Lucidchart, or dbdiagram.io. Avoid hand-drawn or photographed diagrams.
2. Reproduce every entity above, show primary keys (underline) and foreign keys (annotate with `FK`).
3. Draw crow's-foot connectors that match the cardinalities listed in the Relationship Summary.
4. Highlight enum-driven status flows (orders, restaurants, withdrawals) with color or notes so the reviewer can see lifecycle states.
5. Export the final diagram as `docs/frontdash-er.png` (PNG or PDF accepted) and embed/link it in your slide deck for the in-class presentation.

## Deliverable Checklist (per assignment brief)
- Typed table/entity definitions (this document can serve as the backbone—adapt if your instructor needs a different format).
- Digital ER diagram (`docs/frontdash-er.png`) created with a drawing tool, no handwriting.
- Slide(s) summarizing key relationships and lifecycle flows for class presentation (make sure every teammate has a speaking part).
- Zip file for Canvas submission containing the ER diagram export, this schema write-up (PDF or DOCX version if required), and any supplemental notes.
- Be ready to discuss how feedback could impact tables such as `orders`, `menu_items`, or `withdraw_requests` (e.g., consider indexes, new FKs, or additional enums).

## Optional Next Steps
- Prototype the schema in a local PostgreSQL instance using the sample `CREATE TYPE` statements and table definitions.
- Seed data that mirrors the current front-end fixtures (restaurants, menu sections, sample orders) to validate that all UI flows have matching rows.
- Prepare a backup slide covering future enhancements (e.g., loyalty rewards, multi-location owners) to demonstrate forward-thinking design during the presentation.

