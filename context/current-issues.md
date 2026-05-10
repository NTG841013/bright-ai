Sometimes when we try to log in, the app just keeps rendering and never redirects us automatically to the editor page, unless you click the back button on the browser then it redirects you correctly:

○ Compiling / ...
GET / 307 in 10.1s (next.js: 6.0s, proxy.ts: 3.4s, application-code: 683ms)
GET /editor 200 in 1533ms (next.js: 1290ms, proxy.ts: 20ms, application-code: 223ms)
[browser] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (https://thorough-ewe-46.clerk.accounts.dev/npm/@clerk/clerk-js@6/dist/clerk.browser.js:12:3216)                             
POST /editor 200 in 151ms (next.js: 23ms, proxy.ts: 48ms, application-code: 80ms)
└─ ƒ invalidateCacheAction() in 6ms node_modules/@clerk/nextjs/dist/esm/app-router/server-actions.js
GET /sign-in?redirect_url=http%3A%2F%2Flocalhost%3A3000%2F 200 in 1765ms (next.js: 1712ms, proxy.ts: 15ms, application-code: 38ms)
GET /sign-in?redirect_url=http%3A%2F%2Flocalhost%3A3000%2F 200 in 117ms (next.js: 70ms, proxy.ts: 9ms, application-code: 38ms)
GET /sign-in/SignIn_clerk_catchall_check_1778426056501 200 in 124ms (next.js: 17ms, proxy.ts: 8ms, application-code: 99ms)
POST /sign-in/factor-one?redirect_url=http%3A%2F%2Flocalhost%3A3000%2F 200 in 136ms (next.js: 31ms, proxy.ts: 20ms, application-code: 85ms)
└─ ƒ invalidateCacheAction() in 8ms node_modules/@clerk/nextjs/dist/esm/app-router/server-actions.js
GET /sign-in/factor-one/SignIn_clerk_catchall_check_1778426117757 200 in 162ms (next.js: 15ms, proxy.ts: 27ms, application-code: 120ms)
GET / 200 in 88ms (next.js: 15ms, proxy.ts: 23ms, application-code: 51ms)
GET /editor 200 in 126ms (next.js: 16ms, proxy.ts: 29ms, application-code: 80ms)
GET /editor 200 in 56ms (next.js: 7ms, proxy.ts: 13ms, application-code: 35ms)

