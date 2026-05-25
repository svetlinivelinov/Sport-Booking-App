# apps/mobile

Expo React Native client for Sport Booking App v1.

## Run

- `npm run start --workspace apps/mobile`
- `npm run android --workspace apps/mobile`
- `npm run ios --workspace apps/mobile`
- `npm run web --workspace apps/mobile`

## Scope

Implement the core end-user flows for capstone requirements (5+ screens), consuming REST APIs from `apps/web`.

## Deploy Expo Web Build to Netlify

Use a second Netlify site for the mobile web export.

1. In Netlify, connect this same repository.
2. Set branch to `main`.
3. Use these build settings:
	- Base directory: `apps/mobile`
	- Build command: `npm run export:web`
	- Publish directory: `apps/mobile/dist`
4. Add environment variable:
	- `EXPO_PUBLIC_API_BASE_URL=https://<your-web-netlify-url>`
5. Trigger deploy.

Notes:
- The exported bundle is static and generated to `apps/mobile/dist`.
- A SPA redirect fallback is included in `apps/mobile/public/_redirects`.
- Redeploy the mobile site any time you change `EXPO_PUBLIC_API_BASE_URL`.
