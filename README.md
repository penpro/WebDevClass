# \# WebDev Class Hello World Deployment Notes

# 

# \## Overview

# 

# This project was a basic full stack "Hello, World" deployment using:

# 

# \- \*\*React\*\* frontend built with \*\*Vite\*\*

# \- \*\*Node.js + Express\*\* backend

# \- \*\*MySQL\*\* database

# \- \*\*Nginx\*\* as the web server and reverse proxy

# \- \*\*PM2\*\* to keep the backend running

# \- \*\*AWS EC2 Ubuntu\*\* instance as the production server

# \- \*\*Git + GitHub\*\* for version control and deployment workflow

# 

# The final deployed architecture looked like this:

# 

# ```text

# Browser -> Nginx on port 80 -> React frontend

# &#x20;                          -> /api/messages -> Node/Express on port 3000 -> MySQL

# ```

# 

# The end goal was to be able to open the EC2 public IP in a browser and see a React page that displayed data coming from MySQL through the backend API.

# 

# \---

# 

# \## What Was Installed on the Server

# 

# The EC2 instance was an \*\*Ubuntu 24.04 LTS\*\* server.

# 

# The following software was installed and verified:

# 

# \- \*\*Git\*\* for pulling project code from GitHub

# \- \*\*curl\*\* for downloading setup files and testing endpoints

# \- \*\*MySQL Server 8.0\*\* for the production database

# \- \*\*Nginx 1.24\*\* for serving the frontend and proxying API requests

# \- \*\*Node.js 22\*\* from \*\*NodeSource\*\*

# \- \*\*npm 10\*\*

# \- \*\*PM2 6\*\* for managing the backend process

# 

# \### Package installation

# 

# Base packages were installed with:

# 

# ```bash

# sudo apt update \&\& sudo apt upgrade -y

# sudo apt install -y git nginx mysql-server curl

# ```

# 

# Node.js 22 was installed using the NodeSource repository:

# 

# ```bash

# curl -fsSL https://deb.nodesource.com/setup\_22.x -o nodesource\_setup.sh

# sudo -E bash nodesource\_setup.sh

# sudo apt install -y nodejs

# node -v

# npm -v

# ```

# 

# PM2 was then installed globally:

# 

# ```bash

# sudo npm install -g pm2

# pm2 -v

# ```

# 

# \---

# 

# \## AWS Setup That Ended Up Working

# 

# A single \*\*Ubuntu EC2 instance\*\* was used to host the whole application.

# 

# \### Security group rules

# 

# The security group needed the following rules to make the deployment work:

# 

# \#### Inbound rules

# 

# \- \*\*SSH (22)\*\* from my IP

# \- \*\*HTTP (80)\*\* from anywhere

# \- \*\*HTTPS (443)\*\* from anywhere was also opened, although the deployed site was accessed over plain HTTP because HTTPS was not configured with a certificate

# 

# \#### Outbound rules

# 

# This turned out to matter a lot.

# 

# At first, outbound traffic was too restricted. That caused several commands to hang when they tried to reach external package registries.

# 

# The fix was to allow outbound HTTPS traffic:

# 

# \- \*\*HTTPS (443)\*\* outbound

# 

# Once outbound 443 was open, npm and other external connections started working.

# 

# \---

# 

# \## Main Problems Encountered and What Fixed Them

# 

# \## 1. SSH login failed with `Permission denied (publickey)`

# 

# \### Cause

# 

# The EC2 instance required the `.pem` private key and the SSH command had to use the full file path.

# 

# \### Fix

# 

# Use the correct Ubuntu username and pass the full path to the key file:

# 

# ```bash

# ssh -i "C:\\full\\path\\to\\key.pem" ubuntu@PUBLIC\_IP

# ```

# 

# Important detail: for Ubuntu EC2 instances, the default username is usually `ubuntu`.

# 

# \---

# 

# \## 2. Package downloads and npm installs hung with no progress

# 

# \### Cause

# 

# This was not really a Node or npm problem. The EC2 instance could reach some package sources, but outbound HTTPS access was blocked by the security group.

# 

# That caused commands like these to hang:

# 

# \- `npm ping`

# \- `curl -I https://registry.npmjs.org/`

# \- `npm install`

# \- `sudo npm install -g pm2`

# 

# \### Fix

# 

# Open outbound \*\*port 443\*\* in the EC2 security group.

# 

# Once outbound 443 was allowed, npm and other HTTPS-based package downloads worked normally.

# 

# \---

# 

# \## 3. Ubuntu `apt` installed Node 18, but Vite needed a newer version

# 

# \### Cause

# 

# Ubuntu 24.04 ships with Node 18 through the default package repositories, but the Vite-based frontend needed a newer Node version.

# 

# \### Fix

# 

# Use \*\*NodeSource\*\* to install \*\*Node 22\*\* instead of relying on the default Ubuntu package version.

# 

# That resolved compatibility concerns for the frontend build.

# 

# \---

# 

# \## 4. `Ctrl+Z` caused confusion when stopping programs

# 

# \### Cause

# 

# While testing backend processes, `Ctrl+Z` was used instead of `Ctrl+C`.

# 

# `Ctrl+Z` does \*\*not\*\* stop a program cleanly. It suspends it and leaves it hanging in the shell jobs list. That caused problems like port 3000 still being occupied even though it looked like the process had stopped.

# 

# This led to errors like:

# 

# ```text

# Error: listen EADDRINUSE: address already in use :::3000

# ```

# 

# \### Fix

# 

# \- Use \*\*`Ctrl+C`\*\* to stop a foreground program cleanly

# \- Use `jobs -l` and `kill` to clean up suspended jobs when needed

# 

# Example cleanup:

# 

# ```bash

# jobs -l

# kill $(jobs -p)

# ```

# 

# \---

# 

# \## 5. `npm install` failed because `package.json` did not exist yet

# 

# \### Cause

# 

# At one point, only stub folders existed on the server. The backend and frontend application files had not actually been created yet.

# 

# That meant commands like `npm install` failed because there was no `package.json` in the target directory.

# 

# \### Fix

# 

# Create the actual application files before trying to install dependencies.

# 

# The final working structure became:

# 

# ```text

# WebDevClass/

# &#x20; hello-world/

# &#x20;   backend/

# &#x20;     db.js

# &#x20;     server.js

# &#x20;     package.json

# &#x20;   frontend/

# &#x20;     src/

# &#x20;     index.html

# &#x20;     vite.config.js

# &#x20;     package.json

# &#x20;   init.sql

# ```

# 

# \---

# 

# \## 6. Git directories were not showing up correctly after pull

# 

# \### Cause

# 

# Git does not track empty directories. Some folders only had placeholder text files, and the actual project files were not yet committed.

# 

# \### Fix

# 

# Build out the actual project files, then commit and push those real files instead of relying on empty folders or stubs.

# 

# \---

# 

# \## 7. Browser initially showed `refused to connect`

# 

# \### Cause

# 

# This turned out not to be an Nginx or server problem. The issue was that modern browsers often try \*\*HTTPS first automatically\*\*.

# 

# Since the deployment only had HTTP configured and no SSL certificate installed, the browser would try `https://PUBLIC\_IP` and fail.

# 

# \### Fix

# 

# Manually enter the URL with \*\*`http://`\*\*:

# 

# ```text

# http://PUBLIC\_IP

# ```

# 

# This worked immediately once Nginx was correctly serving the app on port 80.

# 

# Important note: opening inbound port 443 alone does \*\*not\*\* make HTTPS work. Nginx still needs TLS certificate configuration for that.

# 

# \---

# 

# \## 8. GitHub push failed because password auth is not supported

# 

# \### Cause

# 

# GitHub no longer supports password-based authentication for Git over HTTPS. On top of that, the account had two-factor authentication enabled.

# 

# \### Fix

# 

# Use \*\*SSH authentication\*\* from the EC2 server to GitHub instead of HTTPS password auth.

# 

# That required:

# 

# 1\. Generating an SSH key on the EC2 server

# 2\. Adding the \*\*public key\*\* to GitHub under \*\*Settings -> SSH and GPG keys\*\*

# 3\. Setting the Git remote URL to the SSH form

# 

# Example remote:

# 

# ```bash

# git remote set-url origin git@github.com:penpro/WebDevClass.git

# ```

# 

# \---

# 

# \## 9. GitHub SSH authentication hung on port 22

# 

# \### Cause

# 

# GitHub SSH defaults to port 22, and that connection was hanging.

# 

# \### Fix

# 

# Configure SSH to use \*\*GitHub over port 443\*\* instead.

# 

# The working `\~/.ssh/config` entry was:

# 

# ```sshconfig

# Host github.com

# &#x20; HostName ssh.github.com

# &#x20; Port 443

# &#x20; User git

# &#x20; IdentityFile \~/.ssh/Classwork

# &#x20; IdentitiesOnly yes

# ```

# 

# That allowed `ssh -T git@github.com` to work over outbound 443.

# 

# \---

# 

# \## Database Setup

# 

# The MySQL database was created on the EC2 server and initialized with an `init.sql` file.

# 

# The database name was:

# 

# ```text

# hello\_app

# ```

# 

# A table named `messages` was created with seeded data.

# 

# Example rows:

# 

# \- Hello from AWS MySQL

# \- This came through Node

# \- This is flowing into React

# 

# That data was used to prove that the full stack data path worked from database to API to browser.

# 

# \---

# 

# \## Backend Setup

# 

# The backend was built with \*\*Node.js\*\*, \*\*Express\*\*, and \*\*mysql2\*\*.

# 

# \### Dependencies

# 

# The backend `package.json` included:

# 

# \- `express`

# \- `mysql2`

# \- `dotenv`

# 

# \### Backend behavior

# 

# The backend exposed this route:

# 

# ```text

# /api/messages

# ```

# 

# That route queried MySQL and returned JSON.

# 

# Example test:

# 

# ```bash

# curl http://127.0.0.1:3000/api/messages

# ```

# 

# Successful output looked like:

# 

# ```json

# \[

# &#x20; {"id":1,"text":"Hello from AWS MySQL"},

# &#x20; {"id":2,"text":"This came through Node"},

# &#x20; {"id":3,"text":"This is flowing into React"}

# ]

# ```

# 

# \### Running the backend

# 

# The backend was started under PM2:

# 

# ```bash

# cd \~/WebDevClass/hello-world/backend

# pm2 start server.js --name hello-backend

# pm2 save

# ```

# 

# Then PM2 startup was configured so the backend can come back after a reboot:

# 

# ```bash

# sudo env PATH=$PATH:/usr/bin /usr/local/lib/node\_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# pm2 save

# ```

# 

# \---

# 

# \## Frontend Setup

# 

# The frontend was built with \*\*React\*\* and \*\*Vite\*\*.

# 

# After dependencies were installed, the frontend was built into a `dist/` directory:

# 

# ```bash

# cd \~/WebDevClass/hello-world/frontend

# npm install

# npm run build

# ```

# 

# The build output was then copied into Nginx's web root:

# 

# ```bash

# sudo mkdir -p /var/www/hello-app

# sudo rm -rf /var/www/hello-app/\*

# sudo cp -r \~/WebDevClass/hello-world/frontend/dist/\* /var/www/hello-app/

# ```

# 

# The React app fetched data from the backend using:

# 

# ```javascript

# fetch('/api/messages')

# ```

# 

# That was important because Nginx handled the `/api` proxy. Hardcoding `localhost:3000` in frontend code would have been wrong for browser access.

# 

# \---

# 

# \## Nginx Setup

# 

# Nginx was used for two jobs:

# 

# 1\. Serve the built frontend from `/var/www/hello-app`

# 2\. Proxy `/api` requests to the backend running on `127.0.0.1:3000`

# 

# The working Nginx site config was:

# 

# ```nginx

# server {

# &#x20;   listen 80;

# &#x20;   server\_name \_;

# 

# &#x20;   root /var/www/hello-app;

# &#x20;   index index.html;

# 

# &#x20;   location /api/ {

# &#x20;       proxy\_pass http://127.0.0.1:3000;

# &#x20;       proxy\_http\_version 1.1;

# &#x20;       proxy\_set\_header Host $host;

# &#x20;       proxy\_set\_header X-Real-IP $remote\_addr;

# &#x20;       proxy\_set\_header X-Forwarded-For $proxy\_add\_x\_forwarded\_for;

# &#x20;       proxy\_set\_header X-Forwarded-Proto $scheme;

# &#x20;   }

# 

# &#x20;   location / {

# &#x20;       try\_files $uri /index.html;

# &#x20;   }

# }

# ```

# 

# After creating the config, the default site was disabled and the new one was enabled:

# 

# ```bash

# sudo rm -f /etc/nginx/sites-enabled/default

# sudo ln -sf /etc/nginx/sites-available/hello-app /etc/nginx/sites-enabled/hello-app

# sudo nginx -t

# sudo systemctl reload nginx

# ```

# 

# \---

# 

# \## Final Verification Steps

# 

# The finished deployment was verified in several ways.

# 

# \### Local checks on the server

# 

# Test the backend API:

# 

# ```bash

# curl http://127.0.0.1:3000/api/messages

# ```

# 

# Test the Nginx frontend:

# 

# ```bash

# curl http://127.0.0.1

# ```

# 

# Both worked.

# 

# \### Browser test

# 

# The final browser URL was:

# 

# ```text

# http://PUBLIC\_IP

# ```

# 

# Important detail: \*\*the URL had to be typed with `http://` explicitly\*\*, because the browser otherwise tried HTTPS and failed.

# 

# Once that was done, the deployed page showed:

# 

# \- `Hello, World!`

# \- a message explaining that data was coming from MySQL through Node

# \- a list of rows from the database

# 

# That confirmed the full stack was working in production.

# 

# \---

# 

# \## Production Change Test

# 

# A production change was tested by inserting a new row directly into the database on the server:

# 

# ```bash

# sudo mysql -e "USE hello\_app; INSERT INTO messages (text) VALUES ('This is my production change test');"

# ```

# 

# Refreshing the deployed page showed the new row immediately.

# 

# Screenshots were taken before and after to document the change.

# 

# \---

# 

# \## Git and Deployment Workflow Going Forward

# 

# Now that the repo is synced and the app is running, the normal workflow is:

# 

# \### For code changes on the local machine

# 

# On the local machine:

# 

# ```bash

# git add .

# git commit -m "Describe the change"

# git push

# ```

# 

# On the EC2 server:

# 

# ```bash

# cd \~/WebDevClass

# git pull

# ```

# 

# \### If the frontend changed

# 

# ```bash

# cd \~/WebDevClass/hello-world/frontend

# npm run build

# sudo rm -rf /var/www/hello-app/\*

# sudo cp -r dist/\* /var/www/hello-app/

# sudo systemctl reload nginx

# ```

# 

# \### If the backend changed

# 

# ```bash

# cd \~/WebDevClass/hello-world/backend

# pm2 restart hello-backend

# ```

# 

# \### If the database content changed

# 

# Run SQL on the EC2 server:

# 

# ```bash

# sudo mysql -e "USE hello\_app; INSERT INTO messages (text) VALUES ('new row');"

# ```

# 

# For cleaner long-term tracking, database changes could also be stored in `.sql` files and committed to Git.

# 

# \---

# 

# \## Key Lessons Learned

# 

# \- Security group \*\*outbound\*\* rules matter, not just inbound rules

# \- If npm, curl, or package downloads hang, check outbound \*\*HTTPS 443\*\* first

# \- Ubuntu's default Node package may be too old for modern frontend tooling

# \- Use \*\*NodeSource\*\* when a newer Node version is required

# \- \*\*Ctrl+C\*\* stops a process, while \*\*Ctrl+Z\*\* suspends it and can create confusing side effects

# \- Git does not track empty directories

# \- Browsers often default to HTTPS, so a raw EC2 deployment without certificates may require manually typing `http://PUBLIC\_IP`

# \- GitHub password authentication for Git is gone, so use \*\*SSH keys\*\* or a token

# \- GitHub SSH over \*\*port 443\*\* is useful when normal SSH hangs

# \- Nginx is a clean way to serve the frontend and hide the backend behind `/api`

# 

# \---

# 

# \## Final Result

# 

# The project successfully deployed a basic full stack web app to AWS.

# 

# The EC2 server now hosts:

# 

# \- a React frontend served by Nginx

# \- a Node/Express backend managed by PM2

# \- a MySQL database storing the displayed messages

# 

# The public deployment is reachable by visiting:

# 

# ```text

# http://PUBLIC\_IP

# ```

# 

# and it displays live data coming from the production database.

# 

