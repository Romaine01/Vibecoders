# Branding and PWA assets

The product remains **ONE — Community Services & Development Platform**. The user-supplied marks are stored under `public/brand/` and are intentionally used in distinct roles:

| Asset | Role | Where it appears |
| --- | --- | --- |
| `system-logo.png` | Primary ONE system mark | Header, app shell, authentication screens, verification screen, browser icon, Apple touch icon, PWA manifest |
| `devcon-bukidnon.png` | Community technology partner mark | Public landing footer |
| `developer-community.png` | Developer community mark | Public landing footer |

Do not recolor, crop, stretch, or substitute these files. Preserve their transparent backgrounds, render them with `object-fit: contain`, and keep the system mark as the only installable PWA icon unless dedicated square icon exports are supplied.

The manifest lives at `public/manifest.webmanifest`. It contains the system mark, standalone display metadata, a portrait preference, and resident shortcuts for reporting and activity.
