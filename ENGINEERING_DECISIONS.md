# Engineering Decisions

## 1. How did you design the database schema, and why?

Six collections: `User`, `Doctor`, `DoctorSchedule`, `Patient`, `Appointment`, `RefreshToken`, `AuditLog`.

`User` and `Doctor` are deliberately separate. `User` holds login/auth concerns (email, password hash, role) shared by all three roles. `Doctor` holds domain data (department, specialization) that only doctors have, linked via a `user` reference. This avoids polluting every login record with fields that are meaningless for a Super Admin or Receptionist, and keeps auth logic role-agnostic.

`DoctorSchedule` stores a *recurring weekly template* — working days, sessions (start/end times as strings like `"09:00"`, not `Date` objects), and slot duration — rather than pre-generated slots for every future date. Break windows are never stored explicitly; they're simply the gaps between defined sessions. This means a schedule change takes effect immediately for all future dates without any migration or regeneration step, and there's no possibility of a stored "break" overlapping a stored "session," since only sessions are persisted.

`Appointment` stores `date` as a string (`"YYYY-MM-DD"`) and `slotTime` as a string (`"09:00"`) rather than a combined `Date`. This matches how the frontend and the slot-generation logic already work with dates and times as separate, human-readable values, and avoids timezone-conversion bugs that combined `Date` objects can introduce across a distributed system.

## 2. How did you guarantee no two patients can book the same slot?

A MongoDB unique compound index on `Appointment` across `(doctor, date, slotTime)`, with a partial filter expression restricting uniqueness to non-cancelled statuses (`{ status: { $in: ['scheduled', 'arrived', 'completed'] } }`). This lets a cancelled appointment free its slot for rebooking, while still preventing two *active* bookings from colliding.

This is enforced by MongoDB itself, atomically, at the database level — not by application-level checks. Two simultaneous requests for the same slot both pass the app's own validation (schedule exists, slot is in a valid session, date isn't past), but only one `Appointment.create()` call can actually succeed; MongoDB rejects the second with a duplicate-key error (code `11000`), which the controller catches and returns as a clean `409 Conflict`. This was manually tested by sending the identical booking request twice in immediate succession and confirming the second is rejected.

The alternative considered was a Mongoose/MongoDB transaction with an explicit "check, then insert" step. The unique-index approach is simpler to reason about and equally airtight for this use case, since the invariant we need ("no two active appointments share doctor+date+slot") maps directly onto what a unique index already guarantees, without needing multi-document transaction overhead.

## 3. How does your RBAC system work end-to-end?

Two-layer Express middleware, applied per-route:

- `authenticate` verifies the JWT access token's signature and expiry, and attaches the decoded payload (`{ id, role }`) to `req.user`. Fails with `401` if missing or invalid.
- `authorize(...allowedRoles)` checks `req.user.role` against a route-specific allow-list. Fails with `403` if the role isn't permitted.

Routes compose these explicitly, e.g. `router.post('/', authenticate, authorize('receptionist', 'super_admin'), createAppointment)`. Some routes use `authenticate` alone (e.g. viewing slots), deliberately, since any logged-in role has a legitimate reason to see that data — RBAC restricts by *actual need*, not by defaulting everything to admin-only.

One route (`GET /appointments`) applies an additional, finer-grained rule *inside* the controller rather than the route middleware: a doctor's role is confirmed by `authorize`, but which doctor they are determines what they can see — the controller looks up their linked `Doctor` profile and forces the query filter to their own `doctor` ID, so a doctor can never view another doctor's appointment list even though the route itself allows the `doctor` role through.

The frontend mirrors this with a role-aware navigation list and conditionally rendered action buttons, but this is a UX convenience only — the backend middleware is the actual security boundary, verified independently in every case.

## 4. What security measures did you implement?

- Passwords hashed with bcrypt (cost factor 10) via a Mongoose pre-save hook; never stored or returned in plain text (`select: false` on the schema field, so even an accidental broad query can't leak it).
- JWT access tokens are short-lived (15 min); refresh tokens are longer-lived but persisted server-side so logout can revoke them immediately, not just rely on client-side deletion.
- Login returns an identical, generic "Invalid credentials" message whether the email doesn't exist or the password is wrong — prevents user enumeration via the login endpoint.
- All protected routes require a valid JWT; role-gated routes additionally check the role server-side (see RBAC above) — never trusted from the client.
- Centralized error handler ensures unhandled errors never leak stack traces or internals to the client in a response body.

## 5. What tradeoffs did you make given the time constraint, and why?

The assessment brief explicitly states architecture quality matters more than feature count, so time was allocated: (1) auth + RBAC, fully tested for all three roles, (2) slot generation and concurrency-safe booking — the two pieces of core domain logic most likely to reveal design quality — before (3) the remaining CRUD surface, and (4) frontend. Socket.IO real-time updates were deliberately deferred (see README's Known Limitations) in favor of a fully working, verified REST API and UI, since a complete synchronous system was judged more valuable than a partially-implemented real-time layer layered on an incomplete base.

Within the frontend, plain CSS with a small design-token system (CSS custom properties) was used instead of a component library or Tailwind, keeping the bundle and build simple while still producing a consistent, intentional visual identity across pages.

## 6. What would you do differently with more time?

- Wrap `User` + `Doctor` creation in a MongoDB transaction to close the (currently undocumented-as-fixed, but noted) gap where a partial failure could leave a doctor login without a profile.
- Move appointment search into a proper aggregation pipeline so it filters before pagination rather than after.
- Implement the Socket.IO real-time layer described in the README.
- Add a Super Admin UI for schedule management (currently API-only, verified via Postman).
- Hash refresh tokens at rest, matching the treatment already given to passwords.
