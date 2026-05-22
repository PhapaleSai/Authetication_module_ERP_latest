# 🔄 Authentication Integration Plan (/callback)

This plan outlines the steps to build the invisible "receptionist" page that will catch users after they log in via the Authentication module and teleport them into our SIS dashboard.

## ⚠️ User Review Required
Please review this plan. This is the exact piece of code the Authentication team is waiting for! Once you approve, I will write the code instantly.

## 🎯 Proposed Changes

### [NEW] `src/app/callback/page.tsx`
We will create a brand new Next.js page at `/callback`. This page will be completely invisible and perform the following automated sequence in a fraction of a second:

1. **Read URL Parameters:** It will extract `user_id`, `name`, and `role` from the URL sent by the Authentication Module (e.g., `?user_id=11&role=student`).
2. **Save to Memory:** It will instantly save these exact values into the browser's `sessionStorage` (`sis_user_id` and `sis_role`), exactly simulating our current login screen.
3. **Smart Redirection:** 
   - If the `role` is `student`, it will automatically redirect the user to `/dashboard/student`.
   - If the `role` is `admin`, `teacher`, `principal`, etc., it will redirect to `/dashboard/admin`.
4. **Loading UI:** While this 0.1 second process happens, we will display a sleek spinner saying "Authenticating with PVG ERP..." so the user knows they are securely logging in.

## ✅ Verification Plan

### Automated Tests
1. I will write the component to handle missing data gracefully (e.g., redirecting back to the main login if the Auth module sends a bad link).

### Manual Verification
1. You can manually test this by typing `http://localhost:3000/callback?user_id=11&role=student` in your browser. It should instantly log you in and jump to the student dashboard!
2. Once verified, you can give your Ngrok URL to the Authentication team and do a live integration test.
