# Specification

## Summary
**Goal:** Build a responsive informational website for “वैष्णवी ई-मित्र & CSC केन्द्र” showcasing the provided Hindi business details and services, with an inquiry form that stores submissions on-canister.

**Planned changes:**
- Create a responsive homepage using the provided Hindi copy, including business name, tagline, location (कोटा (माम), करौली), operator name (Rahul Chavariya), and contact/WhatsApp number (+91-7426049215) with clickable tel: and wa.me links.
- Add a clear navigation structure to sections: Home/Intro, Services, Why Choose Us, Contact/Address, and Form.
- Display all service categories from the provided content in a scannable layout (grouped sections/cards).
- Implement an inquiry form supporting “Contact” and “Service request” via an Inquiry Type field, with Name, Phone, optional Email, Message/Details, and optional service/category selection; include client-side validation, success state, and reset.
- Implement Motoko backend methods to create timestamped submissions (persisted in stable storage) and to list submissions for internal review (not publicly displayed in the UI by default).
- Apply a cohesive warm-neutral theme (avoiding blue/purple as primary colors) using Tailwind and existing UI components (no edits to immutable frontend component files).
- Add a footer with business details and a short disclaimer about service availability.
- Add and render generated static hero and logo images from `frontend/public/assets/generated` directly in the frontend.

**User-visible outcome:** Visitors can view business info and services, navigate through site sections, and submit inquiries/service requests via a validated form; contact and WhatsApp links are easily accessible, and the site includes a consistent theme, hero image, logo, and footer.
