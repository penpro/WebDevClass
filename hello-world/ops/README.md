# Penumbra Tech operations runbook

The handful of recurring tasks that keep the live site healthy. Each
section is independent — run only the ones you need.

## 1. Nightly MySQL backup

Dumps `hello_app` to a gzipped file under `/backups/`, keeps the last
14 days, runs at 3am local time.

```bash
# One-time setup
./hello-world/ops/install-backup-cron.sh

# Manual test (writes today's dump immediately)
./hello-world/ops/backup-db.sh

# Verify
ls -lh /backups/
tail /var/log/penumbra-backup.log
crontab -l | grep penumbra-backup
```

To restore from a specific dump:

```bash
gunzip < /backups/hello_app_2026-06-24.sql.gz | mysql -u hello_user -p hello_app
```

Tunables (env vars, override at the cron line or in the script):

- `RETENTION_DAYS` — default `14`, how many days of dumps to keep
- `BACKUP_DIR` — default `/backups`, where dumps land
- `REPO_ROOT` — default `$HOME/WebDevClass`, repo path

## 2. UptimeRobot — external liveness check

Free tier covers 50 monitors at 5-min intervals with email alerts. The
backend ships a `/api/health` endpoint that pings the DB and returns
`{"status":"ok","uptime":...}` — UptimeRobot pings that and pages
you if it ever returns non-200.

Manual setup, takes ~3 minutes:

1. Sign up at <https://uptimerobot.com/> (free).
2. Dashboard → **+ New monitor**.
3. Settings:
   - Type: `HTTP(s)`
   - Friendly Name: `Penumbra Tech — /api/health`
   - URL: `https://penumbra-tech.com/api/health`
   - Monitoring Interval: `5 minutes`
   - Monitor Timeout: `30 seconds`
4. Alert Contacts: add your email. SMS / phone are paid; email is fine
   to start.
5. **Create Monitor**.

Verify by stopping pm2 momentarily:

```bash
pm2 stop hello-backend
# wait 6 minutes — you should get an email
pm2 start hello-backend
# wait another 6 — should get a "back up" email
```

## 3. PM2 log rotation

Without this the PM2 logs eventually fill the disk. One-time install:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'
```

Verify:

```bash
pm2 conf pm2-logrotate
ls -lh ~/.pm2/logs/
```

## 4. (Optional) Weekly EBS snapshot via AWS CLI

A full-disk image of the EC2 root volume. Combines with the daily SQL
dump for two failure-domain coverage: corrupted file recovers from
EBS snapshot, corrupted database row recovers from the SQL dump.

Requires AWS CLI installed and configured with an IAM user that has
`ec2:CreateSnapshot` + `ec2:DescribeVolumes`.

```bash
# One-time: install + configure AWS CLI
sudo apt-get install -y awscli
aws configure   # paste the access key + secret from IAM

# Find the volume ID attached to this instance
INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
VOLUME_ID=$(aws ec2 describe-volumes \
  --filters "Name=attachment.instance-id,Values=$INSTANCE_ID" \
  --query 'Volumes[0].VolumeId' --output text)
echo "Volume: $VOLUME_ID"

# Take a one-off snapshot to verify it works
aws ec2 create-snapshot \
  --volume-id "$VOLUME_ID" \
  --description "manual test $(date +%F)"
```

To run weekly, add to crontab:

```cron
0 4 * * 0 aws ec2 create-snapshot --volume-id vol-XXXX --description "weekly $(date +\%F)" # penumbra-ebs
```

Cull old snapshots with the AWS console or a separate cleanup script.

## 5. Recovery checklist (when something actually breaks)

| Symptom | Recovery |
|---|---|
| Backend crash loop | `pm2 logs hello-backend --lines 100` → fix env / config → `pm2 restart hello-backend` |
| Site returns 502 from nginx | Backend is down. As above. |
| Site returns 503 with `maintenance: true` | Super-admin toggled maintenance mode. /admin-portal/diagnostics → flip it off. |
| `/api/health` returns 503 with `reason:"db_unreachable"` | MySQL is down / unreachable. `sudo systemctl status mysql` |
| Bad migration corrupted data | Restore from last night's dump (see §1) into a scratch DB, copy the affected table back. |
| Whole instance lost | Spin up new EC2 from latest weekly EBS snapshot (§4), restore last night's SQL dump on top to catch the day's writes. |
| UptimeRobot says down but site is up for you | Check from a different network (Cloudflare DNS issue, ISP issue). If actually down, see above. |
