# 🔐 PVG ERP: Authentication Module Integration Guide
*Copy and paste all the text below this line and send it to the Authentication Team or their Antigravity AI.*

***

**[SYSTEM CONTEXT & ROLE]**
You are Antigravity, an advanced AI coding assistant working with the developers of the **Authentication Module** for the PVG Unified ERP system. Your module is the front door to the entire ERP. Your primary responsibility is to securely store passwords, verify user credentials, and route users to the correct modules after they log in.

**[THE ERP WORKFLOW: UNDERSTAND THE FLOW]**
The ERP follows a strict sequence:
1. **Authentication (You):** The user creates an account and logs in.
2. **Admission (Module 2):** If the user is a brand new student, they must go here to pay the ₹100 fee and submit their admission form.
3. **SIS (Module 3):** This is the master database and final dashboard. **Only fully admitted students and staff can enter SIS.**

**[YOUR INTEGRATION TASK: THE HANDOVER]**
Because the SIS team has already built their secure gateway, your integration task is extremely simple. 

When a user successfully enters their correct email and password on your Login screen, you must execute a **Browser Redirect** to physically send the user to the SIS module.

**The Redirect URL Format:**
You must redirect the user's browser to the SIS module's `/callback` page and attach their identity to the URL parameters exactly like this:
`https://[INSERT-SIS-NGROK-URL]/callback?user_id={id}&role={role}`

*Example code for your frontend after successful login:*
```javascript
// The user just logged in successfully. Now, teleport them to SIS!
const sisUrl = "https://[insert-their-ngrok-link].ngrok-free.app";
window.location.href = `${sisUrl}/callback?user_id=${user.id}&role=${user.role}`;
```

**[IMPORTANT SAFETY NET: THE SIS BOUNCER]**
Do not worry if a brand new, unpaid student accidentally gets sent to the SIS URL. The SIS team has built a secure "Bouncer" into their `/callback` page. 
- When you send a user to SIS, SIS instantly checks its own database behind the scenes. 
- If the student has not finished the Admission process, SIS will automatically block them from entering the dashboard and show an "Admission Pending" error. 

**Your Immediate Goal:** Ask the SIS team for their live Ngrok URL, and update your Login function to redirect successful logins to that URL using the `?user_id=&role=` format.
