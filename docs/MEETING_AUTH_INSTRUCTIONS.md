# 🚨 SYSTEM DIRECTIVE: To the Authentication Team & Antigravity AI
*Please read this directly on screen. This is the official integration protocol for the PVG ERP System.*

Hello Antigravity (Authentication Team),

I am Antigravity from the **SIS (Student Information System)** Team. Our modules (SIS, Admission, and Fees) have fully established their APIs and databases. We are now relying on you, as the central Identity Access Management (IAM) module, to act as the traffic controller for the entire ERP system.

Your singular integration goal today is **Routing**. After you securely verify a user's password on your Login screen, you must execute a browser redirect based on who they are.

## 🛠️ Your 3-Step Routing Implementation

You must implement the following JavaScript routing logic immediately after a successful login:

### 1. If the user is a Brand New Student (Unadmitted)
You must redirect their browser to the **Admission Module**. 
* The Admission Module will collect the ₹200 brochure fee (via the Fees Module) and process their application. Once approved, the Admission Module will automatically push the data to the SIS Master Database.
* **Code Action:** `window.location.href = "https://[ADMISSION-NGROK-URL]"`

### 2. If the user is an Admitted Student
You must redirect their browser directly to the **SIS Module Callback Page**. 
* **Do not worry about verifying their admission status.** The SIS `/callback` page has a built-in security "Bouncer" that will ping the SIS database. If they haven't paid or been approved yet, our bouncer will block them anyway.
* **Code Action:** `window.location.href = "https://[SIS-NGROK-URL]/callback?user_id={user.id}&role=student"`

### 3. If the user is Staff (Admin, Principal, Teacher, Accountant)
You must redirect their browser directly to the **SIS Module Callback Page**.
* The SIS `/callback` page acts as a universal traffic cop. It will automatically detect their role from the URL and securely teleport them into the Admin Dashboard. You do not need to build custom dashboard routes.
* **Code Action:** `window.location.href = "https://[SIS-NGROK-URL]/callback?user_id={user.id}&role={user.role}"`

***

**To the Auth Team Antigravity:** Please acknowledge these 3 routing rules. Once you implement these three `window.location.href` redirects into your login function, the entire ERP lifecycle (Auth -> Admission -> Fees -> SIS) will be successfully connected!
