# Classroom work codes

This is an implemented reference save service and student client, not a deployed service. GitHub Pages can host the studio UI under Black Hollow, but cannot execute this backend. Students need a school-approved HTTPS save endpoint to resume from a code on another computer. Browser recovery and `.lightshow` downloads work independently of the server.

## What students do

1. Open the model house or import `.haunt`, `.casa` or `.ginger`. Raw houses use the same Forge compiler without an intermediate download.
2. Save through **Save and get my code** using a teacher-distributed class access key the first time.
3. Keep the four-part, twenty-character secret code or download its text card.
4. On another computer, choose **Resume with my code**. No student account or identity form is used.
5. Use **Save to this code** to update it. A stale revision is rejected instead of overwriting another tab/computer's work.

The work code is a bearer capability: anyone who has it can read, update or delete that saved project. It has 100 bits of random entropy. It must not appear in page URLs, analytics events or public classroom lists. The service stores its SHA-256 digest, not its clear text. The client intentionally does not persist codes or class keys in localStorage or project files. Losing a code requires a downloaded project backup; identity-based recovery does not exist.

## Run for local review

Use Node.js 24 LTS (built-in `node:sqlite`) and build the existing app:

```sh
npm ci --ignore-scripts
npm run build:gingerlight
```

Set `GINGERLIGHT_CLASS_KEY` to a teacher-chosen access key of 12–200 characters, then run:

```sh
npm run serve:gingerlight
```

The server defaults to `http://127.0.0.1:8080/` and serves `/studio`, `/forge` and `/api/gingerlight/*`. It injects the same-origin service endpoint into the bundled student page. Request logging is not enabled by this application. Storage is `.gingerlight-data/saves.sqlite`, excluded from Git. Persist and back up that directory; storage on an ephemeral machine is not durable.

For a real classroom deployment, provide HTTPS via the institution's normal reverse proxy, set `GINGERLIGHT_HOST` and `GINGERLIGHT_PORT` for the hosting environment, and set `GINGERLIGHT_PUBLIC_ORIGIN` to its actual HTTPS origin. Do not use a wildcard origin or expose the SQLite directory as static files. Infrastructure logging, backups, retention, deletion procedures and access belong to the school/operator's deployment policy. The reference service does not certify school privacy or operational compliance.

## Keep the app inside Black Hollow on GitHub Pages

For a separate save-service origin, set the repository Actions variable `GINGERLIGHT_SAVE_SERVICE_URL` to its actual HTTPS API base, ending in `/api/gingerlight`. The Pages build now uses that optional variable. No key or code is baked into the HTML. For a manual build, set the same environment variable before `npm run build:gingerlight`.

Configure the service's comma-separated `GINGERLIGHT_ALLOWED_ORIGINS` with the exact app origin. Example origin form: `https://<account>.github.io` (not the `/black-hollow-2/` path). The service also permits its own configured origin. Offline `file://` pages are not granted cross-origin save access by default. Schools must allow the save-service domain as well as the GitHub Pages origin; GitHub availability does not establish availability of the backend.

Source `student.html` has no save endpoint by default; the configured portable bundle is the hosted classroom entry. The reference Node server also uses that bundle. Builds without an endpoint display an explanatory message and hide code-save controls, leaving downloads and local recovery available.

## API contract

- `GET /api/gingerlight/health`: service version and upload limit; no project listing.
- `POST /api/gingerlight/saves`: sealed project body, `X-Class-Key` header; returns a new code and revision 1.
- `GET /api/gingerlight/saves`: `Authorization: Bearer <code>`; returns the project and revision.
- `PUT /api/gingerlight/saves`: same authorization, `If-Match: <revision>`, sealed project body; increments the revision atomically.
- `DELETE /api/gingerlight/saves`: same authorization and revision; removes the record.

Defaults: 80 MiB per request, 300 stored records, 2 GiB total stored payload, 300 new records per service process/hour. Quotas and origin policy are constructor options. Server validates project, embedded song/MIDI/audio checksums and the house package before storing. Codes are sent only in authorization headers; responses use no-store and no-referrer. A trusted HTTPS reverse proxy should enforce connection/upload concurrency and deployment-wide rate limits. The in-process creation cap resets after restart and is not a distributed abuse-control system.

A request timeout can leave the client unsure whether a create succeeded. The client does not automatically retry a create and make duplicate saves. An uncertain update is resolved by reopening the latest revision; a local download should be kept first if local edits differ.

## Data and privacy boundaries

Database fields are code digest, project payload, byte count, revision and save timestamp. There are no name, email, student ID or account columns, and no student GitHub login is needed. Original `.haunt` source is not stored by this service; the derived house and lighting project are stored.

Student-authored house names, fixture labels, predictions and explanations remain project content. The software cannot reliably recognize a person's name inside arbitrary text. Students/teachers should avoid entering personal details there. A name-free login is not a claim that infrastructure processes no IP addresses or that the content is guaranteed anonymous. The operator must configure host/proxy logs appropriately.

## Verification

`tests/ginger-code-save.test.mjs` exercises the Fetch handler directly without opening network ports: create/load/update, SQLite persistence after restart, stale-write rejection, deletion, class-key/origin checks, size limits, corrupt data and creation caps. It also checks that student `.haunt` import uses teacher Forge identity and baked `.ginger` imports remain unchanged. End-to-end school network access, HTTPS deployment and browser code-save UI acceptance remain deployment checks.
