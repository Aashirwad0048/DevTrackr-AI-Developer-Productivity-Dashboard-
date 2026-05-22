# System Working of DevTrackr

## Overall Working Flow

```
User → Login/Register
      ↓
Connect GitHub Account
      ↓
Backend fetches GitHub repository data
      ↓
Analytics Engine processes commits, PRs & issues
      ↓
AI analyzes repository activity
      ↓
Dashboard displays charts, summaries & recommendations
```

---

## 1. User Authentication Module

### Working

- User signs up or logs in.
- Password is encrypted using bcrypt.
- Backend generates JWT token.
- Token is sent to frontend for authenticated access.

### Flow

```
User Credentials
      ↓
Express Backend
      ↓
MongoDB Verification
      ↓
JWT Generated
      ↓
Access Granted
```

---

## 2. GitHub Integration Module

### Working

- User connects GitHub account using token/OAuth.
- Backend stores GitHub access token securely.
- System fetches repositories, commits, pull requests, issues, contributors using GitHub API.

### API Fetch Flow

```
GitHub Token
      ↓
GitHub API Request
      ↓
Repository Data Retrieved
      ↓
Stored in MongoDB
```

---

## 3. Analytics Engine

### Purpose

Processes raw GitHub data into useful metrics.

### What It Calculates

- Commit Analytics: daily commits, weekly productivity, commit frequency
- Pull Request Analytics: open/closed PRs, merge ratio
- Issue Analytics: open issues, resolved issues, bug trends
- Contributor Analytics: active/inactive contributors, contribution percentage

### Example Logic

```js
if(daysSinceLastCommit > 14){
   status = "Inactive"
}
```

---

## 4. AI Analysis Module

### Working

The processed repository data is sent to OpenAI/LLM API. AI analyzes commit patterns, sprint progress, unresolved issues, contributor activity.

### AI Processing Flow

```
GitHub Analytics Data
        ↓
AI Prompt Builder
        ↓
OpenAI API
        ↓
AI Generated Insights
        ↓
Stored in Database
```

---

## 5. AI Generated Features

- Sprint Summary
- Bottleneck Detection
- Task Prioritization

Example sprint summary:

> "This sprint focused on authentication development, dashboard bug fixes, and improving API performance."

---

## 6. Dashboard Visualization Module

- Frontend fetches analytics from backend APIs.
- Charts rendered using Recharts or Chart.js.

Components: Commit Chart, PR Analytics, Issue Tracker, AI Insights Panel, Contributor Table.

---

## 7. Database Working

MongoDB stores:
- User data (name, email, encrypted password, GitHub token)
- Repository data (repo details, commits, PRs, issues)
- AI analytics (summaries, recommendations, contributor analysis)

---

## 8. Backend API Communication

```
Frontend Dashboard
       ↓
Axios API Call
       ↓
Express Backend
       ↓
MongoDB / GitHub API
       ↓
Response Returned
```

---

## 9. Complete Internal System Architecture

```
Frontend (React + Tailwind)
        ↓
REST APIs (Express.js)
        ↓
Authentication Middleware
        ↓
Analytics Engine
        ↓
GitHub API + OpenAI API
        ↓
MongoDB Database
```

---

## 10. Real-Time User Scenario

1. User logs in
2. Connects GitHub repository
3. System fetches commits and PRs
4. Analytics engine processes data
5. AI generates sprint summary
6. Dashboard shows commit chart, inactive contributors, issue trends, AI recommendations

---

## Security Measures

- JWT authentication
- bcrypt password hashing
- Protected API routes
- Environment variables for API keys
- Secure GitHub token storage

---

## Final Output to User

- Productivity analytics
- Sprint summaries
- Contributor insights
- Bottleneck detection
- Task recommendations
- Visual dashboards
- Team performance tracking
