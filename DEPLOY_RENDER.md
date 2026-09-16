# Deploy ScoreDesk on Render and share it through Gmail

This is the updated source package, not a live deployment. The source repository and Render service still need to be created. The four original array-based features are unchanged.

## 1. Put the project in a separate GitHub repository

Create a repository named **scoredesk**. A private repository is recommended; the website can be public while its source repository stays private. Initialize the repository with a README so it has a branch. Give the connected GitHub app access to the new repository when using this chat to upload the code.

For a manual upload, extract the ZIP and open the inner `student-score-system` folder. Upload its **contents**, not the outer folder and not the ZIP. Your repository root should look like this:

```text
Dockerfile
render.yaml
.dockerignore
README.md
src/
web/
tests/
```

Do not overwrite an unrelated project. Do not add real student records, passwords, `.env` files, API keys or login tokens to the repository.

## 2. Create the Render service

Render supports Java through Docker. In the Render dashboard, choose **New → Web Service** and connect the new GitHub repository. A GitHub connection in ChatGPT is separate from giving Render permission to clone the repository; authorize Render's Git provider connection when prompted.

Use these settings:

| Setting | Value |
| --- | --- |
| Service name | `scoredesk` or an available name you choose |
| Branch | Your repository's default branch, normally `main` |
| Root Directory | Leave empty when project files are at the repository root |
| Language / Runtime | **Docker** |
| Dockerfile Path | `./Dockerfile` |
| Docker Build Context | `.` |
| Docker Command | Leave empty; use the Dockerfile's command |
| Instance type / Compute | **Free** |
| Region | Singapore, or your chosen region |
| Health Check Path | `/health` |

Do not choose Static Site: Java must run to store the arrays and calculate the scores. There is no separate Node/npm build and no JavaScript-only replacement backend.

`PORT=10000` and `BIND_ADDRESS=0.0.0.0` are already set in the Dockerfile. The app also reads the platform's `PORT` setting. Render supplies `RENDER_EXTERNAL_URL` / `RENDER_EXTERNAL_HOSTNAME`; the server uses these to allow its public HTTPS origin and generate the share link. No API key or Gmail password is required.

Alternatively, use **New → Blueprint**, select the repository, and review the included `render.yaml`. The Blueprint requests one free Docker web service. Manual Web Service setup and Blueprint setup are alternatives; do not create both.

Click **Deploy Web Service** (or deploy the Blueprint). Wait for **Live**, then open the actual `onrender.com` address shown by Render. No live URL is assigned by this source package.

Official references: [Docker on Render](https://render.com/docs/docker), [First deploy](https://render.com/docs/your-first-deploy), [Blueprint specification](https://render.com/docs/blueprint-spec), [Environment variables](https://render.com/docs/environment-variables), [Health checks](https://render.com/docs/health-checks).

## 3. Verify the live website

Open the deployed website and confirm that **Java connected** appears. Add a fictional student with scores 80, 90 and 100; the average should be 90.00. Check the array view and Print report. The site's `/health` endpoint should return `{"status":"ok"}`. Try a second browser to confirm this demo intentionally shares one report among visitors.

## 4. Share through Gmail

Click **Share via Gmail** on the website. A separate tab is configured to open Gmail's compose page with a subject and the website address. Sign in to Gmail when needed, choose the recipient, review the text, and press Send yourself. **The application does not send mail automatically.**

The email contains only a website link and a description. It does not attach student records or create a permanent report snapshot. **Copy link** is the fallback: paste the address into a Gmail message manually. The sharing controls stay disabled in the ordinary localhost version so you cannot accidentally send a localhost address to someone else.

## Demo limitations

This keeps the original prototype's shared, in-memory storage. There is **no login**. Anyone with the public address can view, add and reset the same records. Use fictional information only. A private GitHub repository does not make the deployed website private. The no-index header and robots.txt discourage indexing; they are not access controls.

Restarting, redeploying or stopping Java clears all records. Render's Free services spin down after 15 idle minutes, and waking can take about a minute. This can also clear the in-memory report. Print or save a PDF through the browser when you need a copy. Do not treat this prototype as a production student-record system.

Free compute still has usage limits. Bandwidth or build-minute overages can be billed when an account has a payment method; review workspace limits before deployment. References: [Free services](https://render.com/docs/free), [Render billing FAQ](https://render.com/docs/faq).

## Custom domain or a 403 error

For an additional custom domain configured in Render, set `PUBLIC_URL` to its HTTPS origin, such as `https://scores.example.edu`, then redeploy. Do not include a path, credentials, query string or fragment. The regular Render origin remains allowed. A 403 error for a different domain is intentional; configure the trusted origin rather than deleting the host/origin checks.

## Test the container on your own computer (optional)

```sh
docker build -t scoredesk .
docker run --rm -p 10000:10000 scoredesk
```

Open `http://localhost:10000`. Local sharing remains disabled, which is expected. Docker was not installed in the preparation environment, so the image itself has not yet been built or deployed there.
