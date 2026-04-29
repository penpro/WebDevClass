# Serverless Todo (AWS Lambda + API Gateway + DynamoDB + S3)

Companion project to the main WebDevClass site (which runs on EC2). Same
domain — a small CRUD todo app — implemented entirely on AWS managed
services with no servers to administer.

The point of this project is the architectural contrast:

| | EC2 stack (`hello-world/`) | Serverless stack (`serverless-todo/`) |
|---|---|---|
| Compute | Always-on Express on a t3.micro | Lambda functions invoked on demand |
| Database | MySQL with a connection pool | DynamoDB, no pool, per-request HTTP |
| Frontend host | nginx serving static files | S3 static website hosting |
| Cost when idle | Same monthly bill regardless of traffic | Effectively $0 |
| Cost at sustained 1000 req/s | Same monthly bill (we measured this can do ~1000 req/s, see main README) | Real money — Lambda + DynamoDB charges per request |
| Failure mode at 10k req/s | CPU saturates, latency climbs, throughput plateaus | Concurrency hits the account limit; AWS throttles to 429s |
| Cold starts | Doesn't apply — process is always warm | Visible in CloudWatch (`INIT_DURATION`) |
| Operational toil | nginx, certbot, pm2, swap, deploy scripts | Mostly disappears |

## Architecture

```
   [React SPA on S3 static website]
              |  fetch()
              v
   [API Gateway HTTP API (CORS at the gateway)]
              |
              v
   [Lambda: todos-handler  (Node.js 20, single fn, GET + POST /todos)]
              |
              v
   [DynamoDB: todos  (on-demand, partition key = id)]
              |
              v
   [CloudWatch logs + a billing alarm]
```

## Build walkthrough

This is a console-clicks walkthrough. Once everything works end-to-end,
the same setup can be expressed as Infrastructure-as-Code (SAM, CDK,
Serverless Framework, or Terraform) — but doing it through the console
the first time is what shows you what each piece actually does.

Region: **us-east-1 (US East — N. Virginia)** throughout. They're the
same thing; AWS uses both names interchangeably.

### Step 1 — Create the DynamoDB table

1. AWS Console → **DynamoDB** → Tables → **Create table**
2. Table name: `serverless-todo`
3. Partition key: `id` (String)
4. Sort key: leave blank
5. Table settings: keep "Default settings"
   - Capacity mode = **On-demand** (the modern default)
   - Encryption = **Owned by Amazon DynamoDB** (free)
6. Click **Create table**, wait ~30 seconds for status to flip to "Active"

Verify by clicking the table name → **Explore table items** → "Create
item" → add a test item with `id = "test-1"` and `text = "hello"`.
You should see one row in the table view.

### Step 2 — Create the Lambda function

1. AWS Console → **Lambda** → Functions → **Create function**
2. **Author from scratch**
3. Function name: `todos-handler`
4. Runtime: **Node.js 20.x**
5. Architecture: x86_64 (default)
6. Permissions → "Change default execution role" → **Create a new role
   with basic Lambda permissions**. We'll add DynamoDB permissions to
   this role next.
7. Click **Create function**

After the function is created:

8. **Code** tab → upload the contents of `lambda/index.js` from this repo:
   - Easiest: copy-paste it into the inline editor and click **Deploy**.
   - Or: run `./scripts/package-lambda.sh` from the repo root, then
     "Upload from → .zip file" and pick the produced `lambda.zip`.
9. **Configuration** tab → **Environment variables** → Edit → Add:
   - Key: `TABLE_NAME`
   - Value: `serverless-todo`
   - Save
10. **Configuration** tab → **General configuration** → Edit:
    - Memory: 256 MB (the default 128 is fine but 256 is faster cold-start)
    - Timeout: 10 seconds (the default 3 is too tight if a cold start
      happens to coincide with a slow first DynamoDB call)
    - Save
11. **Configuration** tab → **Permissions** → click the role name (opens
    IAM in a new tab). Click **Add permissions** → **Attach policies**
    → search for `AmazonDynamoDBFullAccess` → check it → **Add
    permissions**.

    For a real production project you'd write a tighter inline policy
    that only allows `PutItem` / `Scan` on this specific table. For a
    class project the broad managed policy is fine and is what AWS
    docs typically suggest.

### Step 3 — Test the Lambda by itself (before API Gateway)

In the Lambda console, **Test** tab → Create a new test event:

- Event name: `test-get`
- Template: `apigateway-aws-proxy` (the closest preset)
- Edit the JSON to set `httpMethod` to `GET` and `path` to `/todos`
- Save and click **Test**

You should see a 200 response with an empty array `[]` in the body.
If you get a 500 or a permission error, check that the IAM role has
DynamoDB access and the env var is spelled exactly `TABLE_NAME`.

### Step 4 — Create the API Gateway HTTP API

1. AWS Console → **API Gateway** → Create API
2. Pick **HTTP API** (not REST API — HTTP API is cheaper, faster, and
   has native CORS handling)
3. **Add integration**:
   - Integration type: Lambda
   - Lambda function: `todos-handler` (start typing, it autocompletes)
   - Version: 2.0 (default)
4. API name: `serverless-todo-api`
5. Click **Next**

**Configure routes:**

6. Method: **GET**, Resource path: `/todos`, Integration: `todos-handler`
7. Click **Add route**, then add another:
   Method: **POST**, Resource path: `/todos`, Integration: `todos-handler`
8. Click **Next**

**Define stages:** keep the default `$default` stage with auto-deploy.
Click **Next**.

**Review and create.** Click **Create**.

After the API exists:

9. Click the API name → **CORS** in the left nav → **Configure**:
   - Access-Control-Allow-Origin: `*` (for testing; tighten to your
     S3 site origin in production)
   - Access-Control-Allow-Methods: `GET, POST, OPTIONS`
   - Access-Control-Allow-Headers: `content-type`
   - Save
10. Note the **Invoke URL** at the top of the API overview page. It looks
    like `https://abc123xyz.execute-api.us-east-1.amazonaws.com`. This
    is the value you'll put in the frontend's `.env.production`.

### Step 5 — Test the API from the command line

```bash
API=https://YOUR-INVOKE-URL.execute-api.us-east-1.amazonaws.com

# List (should be empty initially, or just your test row from step 1)
curl -s $API/todos | jq

# Create
curl -s -X POST $API/todos \
  -H "Content-Type: application/json" \
  -d '{"text":"learn serverless"}' | jq

# List again — your new todo should appear
curl -s $API/todos | jq
```

If you get CORS errors here you can ignore them (curl doesn't enforce
CORS — those are browser-only). If you get 5xx errors, check
**CloudWatch → Log groups → /aws/lambda/todos-handler** for the actual
exception.

### Step 6 — Deploy the React frontend to S3

1. AWS Console → **S3** → Create bucket
2. Bucket name: `serverless-todo-frontend-<your-name>` (must be globally
   unique)
3. Region: us-east-1
4. **Uncheck** "Block all public access" (this is a public website
   bucket — you'll have to acknowledge a warning)
5. Keep the rest as defaults, **Create bucket**

After the bucket exists:

6. Bucket → **Properties** tab → scroll to **Static website hosting** →
   Edit → Enable
   - Hosting type: Host a static website
   - Index document: `index.html`
   - Error document: `index.html` (so client-side routing works)
   - Save
7. Bucket → **Permissions** tab → **Bucket policy** → Edit, paste:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::serverless-todo-frontend-<your-name>/*"
       }
     ]
   }
   ```

   (Replace the bucket name in the `Resource` ARN.)

8. Build and upload the frontend:

   ```bash
   cd serverless-todo/frontend
   cp .env.example .env.production
   # edit .env.production and put your real API URL into VITE_API_URL
   ```

   Then either:

   ```bash
   # If you have the AWS CLI installed and configured (aws configure)
   ../scripts/sync-frontend.sh serverless-todo-frontend-<your-name>
   ```

   or manually:

   ```bash
   npm install
   npm run build
   # then in the S3 console: upload the contents of dist/ to the bucket
   ```

9. The site URL is in **Properties → Static website hosting → Bucket
   website endpoint**. It looks like
   `http://serverless-todo-frontend-<your-name>.s3-website-us-east-1.amazonaws.com`.
   Open it in a browser.

### Step 7 — Monitor with CloudWatch

1. AWS Console → **CloudWatch** → Log groups → `/aws/lambda/todos-handler`
2. Each Lambda invocation produces a log stream. Open one and look for:
   - `START RequestId: ...` — the platform header
   - `[handler] GET /todos` — our own log line
   - `END RequestId: ...`
   - `REPORT RequestId: ... Duration: 12.34 ms ... Init Duration: 234.56 ms`
3. **Init Duration** ONLY appears on cold starts. After the first call,
   subsequent calls within a few minutes will not show it — the
   container was warm.

To see cold starts deliberately:
- Wait 15+ minutes between calls (warm containers eventually retire)
- Or trigger many concurrent calls at once (each new container in the
  scaling-out group has its own cold start)

### Step 8 — Set a billing alarm

1. AWS Console → **CloudWatch** → Alarms → All alarms → **Create alarm**
2. Select metric → **Billing** → Total Estimated Charge → USD →
   **Select metric**
3. Statistic: Maximum, Period: 6 hours
4. Threshold: Static, > $5 (or whatever upper bound makes you sleep at
   night)
5. Notification: SNS topic → New topic → name it
   `serverless-todo-alarm` → email it to yourself → **Create**

You'll get an email when the projected monthly bill exceeds the threshold.

> **Note:** the Billing metric only exists in `us-east-1` regardless of
> where your other resources live. Don't worry if you don't see it in
> other regions; switch to N. Virginia in the console region picker.

## Review questions

Sketches; expand as you build.

### 1. What is a "cold start" and when do they happen? How would you reduce their impact?

A cold start is the time AWS spends provisioning a new execution
environment (container) for your Lambda — downloading your code,
starting Node, requiring modules, running module-level initialization —
before your handler runs for the first time on that container.

Cold starts happen when:
- The first invocation after the function was just deployed
- Scaling out: a request arrives and no warm container is available
- A warm container is reaped (typically after ~5–15 minutes idle)
- Code update — every deploy invalidates all warm containers

In our case the cold start cost is largely the `DynamoDBClient`
constructor (~100ms). On a warm container, the same `DynamoDBClient`
instance is reused.

Mitigations:
- **Keep init lean** — don't import packages you don't need at module
  scope; don't open DB connections that will sit unused
- **Bigger memory tier** — Lambda CPU scales with memory, so 1024 MB
  cold-starts faster than 128 MB even if the function is idle most of
  the time
- **Provisioned concurrency** — pay AWS to keep N containers warm.
  Eliminates cold starts at the cost of paying for them whether or
  not you use them.
- **Lambda SnapStart** — for Java; not available for Node yet
- **Pay for an always-warm tier on your front-line API**, accept cold
  starts on background workers

### 2. How does serverless pricing differ from running a server 24/7? When would serverless be cheaper? When more expensive?

24/7 server (your t3.micro): you pay a fixed hourly rate (~$8/month)
whether you serve 0 req/s or 1000. Cost is decoupled from usage.

Lambda: you pay per invocation + per GB-second of execution time.
DynamoDB: you pay per read/write request unit.
S3: you pay per GB stored + per GET.
API Gateway: you pay per request.
At idle, the bill is approximately $0 (only S3 storage costs anything,
typically pennies for a small frontend).

Serverless is cheaper when:
- Traffic is **bursty / low-baseline / unpredictable** — most class
  projects, side projects, internal tools, demo sites
- Always-free-tier limits cover the actual usage (1M Lambda invocations
  + 25 GB DynamoDB are free monthly)

Server is cheaper when:
- Traffic is **steady and high enough to keep the server warm anyway**.
  Once you're running 24/7 at 30%+ utilization, you're better off on
  EC2/ECS — Lambda's per-invocation overhead becomes more expensive
  than just paying for the underlying capacity.
- The workload is **long-running** (15+ minutes) or **stateful**
- The workload requires **persistent connections** (WebSockets,
  database connection pools to RDS) where Lambda cold-pool churn
  causes problems

### 3. What are the limitations of AWS Lambda?

- **Execution time**: 15 minutes max (used to be 5; raised in 2018)
- **Memory**: 128 MB to 10,240 MB (10 GB)
- **Concurrency**: 1000 concurrent executions per region per account by
  default (can request raise). If you exceed it, requests are throttled
  with a 429 — they don't queue.
- **Deployment package**: 50 MB zipped, 250 MB unzipped, 10 GB if using
  container images
- **/tmp scratch space**: 512 MB by default (configurable up to 10 GB)
- **Payload size**: 6 MB synchronous, 256 KB async
- **No persistent storage** — anything you write to local disk is gone
  after the container retires (and may be reused only if the SAME
  container handles the next request)

### 4. Why must Lambda functions be stateless? What happens if you try to store data in memory between requests?

A "warm" container CAN have module-level state survive between
invocations on that specific container. We rely on this in our code
(the `DynamoDBClient` is created at module scope to avoid rebuilding
it on every request).

But the catch: under load AWS spins up multiple containers, each with
its own copy of module state. So:
- Caching a config value at module scope — fine, every container ends
  up with the same value
- Maintaining a counter at module scope — broken, each container has
  its own counter and your "total" is split across N containers
- Storing per-user session state at module scope — broken, the next
  request from the same user might land on a different container

The rule: module-level state is OK as a **performance cache**, not as a
**correctness state**. Anything that has to be consistent across
requests has to live in DynamoDB / RDS / Redis / etc.

### 5. What happens to your Lambda function when no one is using your app?

Nothing. AWS retires the warm containers after a few minutes idle. The
function code sits in S3 (managed by AWS). You're billed nothing during
idle time except a few pennies for log storage in CloudWatch.

This is the killer feature for hobby projects: a side project nobody
uses costs ~$0/month forever.

### 6. How would you handle database connection pooling in a serverless environment compared to a traditional server?

Traditional server: one process holds one pool of N connections to the
DB, reused across all requests. The pool stays at steady-state size.

Serverless: there's no single process. There can be 1 container or 100
depending on load. If each container opens N connections, your DB sees
100 × N connections instead of N.

Options:
- **Use a serverless-friendly database** — DynamoDB doesn't have
  connections; every request is HTTPS. This is what we use.
- **Use RDS Proxy** — AWS-managed connection pool that sits between
  Lambda and RDS, so Lambdas talk to the proxy and the proxy maintains
  one pool against the DB.
- **Lower the per-Lambda pool size to 1**, accept that each request
  opens a connection. Slow but correct.
- **Reserve concurrency** — cap how many simultaneous Lambdas can run
  at all, so the DB connection count is bounded.

This is one of the strongest reasons to pair Lambda with DynamoDB
specifically rather than RDS — DynamoDB's HTTP-per-request model is
inherently serverless-friendly.

### 7. If your app suddenly gets 10,000 requests per second, what happens with serverless vs. a traditional server?

EC2 t3.micro (we measured): ~1000 req/s ceiling. Above that, latency
climbs, throughput plateaus, but every request still completes
(graceful degradation). At 10k incoming, queue depth grows unboundedly
until something times out. No automatic horizontal scaling — you'd
have to manually add an Auto Scaling Group + load balancer, and even
that takes minutes to spin up new instances.

Lambda + DynamoDB: AWS auto-scales horizontally. New containers spin
up in ~100ms each. At 10k req/s:
- Lambda will hit the default 1000-concurrent-executions limit and
  throttle the rest with 429. To handle 10k actual concurrent
  executions you'd need to request a quota raise (typically takes
  seconds-to-minutes; sometimes auto-approved).
- DynamoDB on-demand auto-scales without limit (technically up to a
  table-level cap, also raisable).
- API Gateway HTTP API can handle 10k+ req/s out of the box — its
  default account quota is 10,000 RPS per region.

The serverless answer: "you're rate-limited at the Lambda concurrency
boundary by default, but the platform itself can absorb the spike with
a config change rather than a redesign."

### 8. What's the trade-off between deploying your entire app as one Lambda function vs. splitting it into multiple functions?

We deploy one Lambda for both routes. Pros:
- Simpler deploy (one zip, one IAM role, one log group)
- Cold starts are shared — a GET keeps the container warm for a
  POST a moment later
- Easier to develop locally (one entrypoint)

Splitting per-route or per-resource (e.g. todos-handler vs
users-handler) gives:
- Independent scaling — a slow `/todos` doesn't block `/users`
- Independent deploy / blast radius — you can ship a fix to one
  without touching the other
- Per-function memory and timeout tuning
- Tighter IAM roles — each function only has the permissions it
  actually needs

Real-world pattern: most teams start with a "fat Lambda per service"
(one per microservice domain) and only split further when a specific
function has different scaling, security, or deploy needs. The "one
Lambda per HTTP route" extreme is a fad that mostly went away —
operationally expensive without proportional benefit.

### 9. When would you NOT want to use serverless architecture?

- **Long-running tasks** — anything over 15 min hits the Lambda timeout.
  You'd want ECS/Fargate or EC2.
- **Latency-critical APIs that can't tolerate cold starts** —
  high-frequency trading, real-time gaming, anything where a 500ms
  outlier on the first request after idle is unacceptable. Provisioned
  concurrency mitigates but adds cost.
- **Predictable always-on workloads** — if you're going to run 24/7 at
  meaningful utilization anyway, EC2 with reserved instances or savings
  plans is dramatically cheaper than the equivalent Lambda spend.
- **Persistent connections** — WebSockets, gRPC streaming, database
  connection pools that need to stay open. (API Gateway has a
  WebSocket API now that helps for the first one, but it's its own
  programming model.)
- **Stateful in-memory workloads** — anything that needs to reuse a big
  data structure across requests, or that warms up an expensive ML
  model on startup. Possible on Lambda but expensive — every container
  has to redo the warm-up.
- **Heavy filesystem or local-disk workloads** — `/tmp` is small and
  ephemeral.
- **Strict regulatory environments** with weird requirements (e.g.
  "code must run on physical hardware in this country") — although
  AWS GovCloud + Lambda covers many of these now.
- **Predictable cost forecasting** — Lambda's pricing scales with
  usage, which means a runaway recursion bug or a viral spike can
  produce a surprise bill. EC2's bill is bounded by what you
  provisioned. Most teams set up billing alarms for exactly this
  reason.
