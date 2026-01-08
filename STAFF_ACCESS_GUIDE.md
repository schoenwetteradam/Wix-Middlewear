# Staff Access Guide - GitHub & Vercel

This guide explains how to grant your staff members access to view and work with your webapp hosted on Vercel and the GitHub repository.

---

## Part 1: Granting GitHub Repository Access

### Option A: Add Collaborators (Recommended for Small Teams)

1. **Go to your GitHub repository**
   - Navigate to: `https://github.com/your-username/Wix-Middlewear`
   - Or go to your repository on GitHub

2. **Open Repository Settings**
   - Click on **"Settings"** tab (top right of repository page)
   - You must be the repository owner or have admin access

3. **Add Collaborators**
   - Scroll down to **"Collaborators"** section in the left sidebar
   - Click **"Add people"** button
   - Enter the GitHub username or email of your staff member
   - Select the permission level:
     - **Read**: Can view code and clone repository (for viewing only)
     - **Write**: Can push code, create branches, and open pull requests
     - **Admin**: Full access (use carefully)
   - Click **"Add [username] to this repository"**

4. **Staff Member Accepts Invitation**
   - Staff member will receive an email invitation
   - They need to accept the invitation to get access

### Option B: Create a GitHub Organization (Recommended for Larger Teams)

1. **Create Organization**
   - Go to: https://github.com/organizations/new
   - Create a new organization (e.g., "YourCompanyName")
   - Transfer or create repository under the organization

2. **Add Team Members**
   - Go to organization settings
   - Add team members
   - Assign repository access to teams
   - Set permissions per team

**Benefits:**
- Better access management
- Team-based permissions
- Easier to manage multiple repositories

---

## Part 2: Granting Vercel Access

### Option A: Add Team Members to Vercel Project

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your project

2. **Open Project Settings**
   - Click on **"Settings"** tab
   - Go to **"Team"** section in the left sidebar

3. **Invite Team Members**
   - Click **"Invite"** button
   - Enter email addresses of staff members
   - Select role:
     - **Member**: Can view deployments and logs (for viewing the webapp)
     - **Admin**: Can manage settings and deployments

4. **Staff Member Accepts Invitation**
   - Staff member receives email invitation
   - They need to create a Vercel account (free) if they don't have one
   - They accept the invitation

### Option B: Make Vercel Deployment Public (Not Recommended)

**⚠️ Warning**: This makes your webapp publicly accessible to anyone with the URL. Only use if the webapp is meant to be public.

1. Go to Vercel Dashboard → Your Project → **Settings**
2. Under **"General"**, find **"Access Control"**
3. Configure as needed (Vercel Pro/Enterprise feature)

**Better Alternative**: Use team members (Option A) for controlled access.

---

## Part 3: Sharing the Webapp URL

### For Staff Who Just Need to View the Webapp

1. **Get Your Vercel URL**
   - Go to Vercel Dashboard → Your Project
   - Copy the production URL (e.g., `https://your-app.vercel.app`)
   - Share this URL with staff members

2. **Access Requirements**
   - If the webapp requires authentication (Wix OAuth), staff will need to:
     - Have access to your Wix site
     - Be logged into Wix
     - Have appropriate permissions in your Wix site

### For Staff Who Need to Deploy/Manage

Follow Part 2 (Vercel Access) to grant them team member access.

---

## Part 4: Recommended Access Levels

### For Staff Who Only Need to View the Webapp

- **GitHub**: Read access (optional - only if they need to see code)
- **Vercel**: Member access (to view deployments and access the webapp URL)
- **Wix Site**: Appropriate member/permissions level in your Wix site

### For Developers Who Need to Make Changes

- **GitHub**: Write access (can create branches and pull requests)
- **Vercel**: Member or Admin access (to view deployments)
- **Wix Site**: Admin access (if they need to configure Wix settings)

### For Administrators

- **GitHub**: Admin access
- **Vercel**: Admin access
- **Wix Site**: Admin access

---

## Part 5: Security Best Practices

1. **Use Least Privilege Principle**
   - Only grant the minimum access needed
   - Review access periodically
   - Remove access when staff members leave

2. **Use Strong Authentication**
   - Enable 2FA on GitHub accounts
   - Enable 2FA on Vercel accounts
   - Use strong passwords

3. **Monitor Access**
   - Regularly review who has access
   - Check Vercel deployment logs for unusual activity
   - Review GitHub commit history

4. **Environment Variables**
   - **Never share** environment variables directly
   - Team members with Vercel access can view environment variables
   - Consider using Vercel's environment variable permissions (Pro/Enterprise)

---

## Part 6: Quick Reference

### GitHub Access
- **Repository Settings** → **Collaborators** → **Add people**
- Permission levels: Read / Write / Admin
- Staff receives email invitation to accept

### Vercel Access
- **Project Settings** → **Team** → **Invite**
- Roles: Member (view) / Admin (full access)
- Staff receives email invitation to accept

### Webapp URL
- Found in Vercel Dashboard → Your Project
- Format: `https://your-app.vercel.app`
- Share URL directly (if public) or ensure staff has Vercel team access

---

## Troubleshooting

### Staff Member Can't Access GitHub Repository

- Check if invitation was sent and accepted
- Verify they're logged into the correct GitHub account
- Check repository visibility (private repositories require access)

### Staff Member Can't Access Vercel Deployment

- Ensure they've accepted the Vercel team invitation
- Verify they're logged into the correct Vercel account
- Check if they have the correct role (Member or Admin)

### Staff Member Can Access Vercel but Not the Webapp

- Check if the webapp requires Wix authentication
- Ensure they have access to your Wix site
- Verify Wix site permissions for the staff member

---

## Summary

1. **For viewing the webapp**: Share the Vercel URL and ensure staff has Wix site access
2. **For code access**: Add as GitHub collaborator with appropriate permissions
3. **For deployment management**: Add as Vercel team member with Member/Admin role
4. **Security**: Use least privilege, enable 2FA, review access regularly

Need help? Check the specific platform documentation:
- [GitHub Collaborators](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-user-account/managing-access-to-your-personal-repositories/inviting-collaborators-to-a-personal-repository)
- [Vercel Teams](https://vercel.com/docs/teams/overview)
