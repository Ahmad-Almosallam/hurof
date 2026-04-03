Walk through the Hurof deployment checklist step by step.
Confirm each item with the user before proceeding to the next.

## Pre-Deploy Checks
- [ ] `dotnet build` — 0 errors, 0 warnings treated as errors
- [ ] Frontend build — `npm run build` completes with 0 errors
- [ ] All DB migrations are applied (`dotnet ef database update`)
- [ ] SignalR connection string is correct for target environment
- [ ] Arabic font assets are bundled in frontend output
- [ ] No `.env` secrets committed to git

## Smoke Test (do this before declaring done)
- [ ] Host can open dashboard and create a game session
- [ ] Player can join on mobile and see the buzzer
- [ ] TV Display connects and shows the hex grid
- [ ] Host activates a letter — all 3 clients update in real-time
- [ ] Player buzzes in — Host sees who buzzed, Player sees lock confirmation
- [ ] TV Display reflects the state change without flicker

## Deploy
In production env.

Then remind:
- Tag the release in git before deploying to production
- Monitor SignalR connection counts after deploy
- Keep previous build artifact for rollback

Confirm: "Deploy complete. All 3 roles verified in target environment?"