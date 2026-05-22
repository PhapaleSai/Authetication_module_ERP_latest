# COMPLETE Swagger API Live Test Report

This document contains the exact requests and responses for **EVERY API endpoint defined in the Swagger UI (`http://localhost:8000/docs`)**.

This test was performed using live data by directly executing HTTP requests to the backend server, replicating exactly what the Swagger UI does. **No output is hidden or truncated.**

## 1. Authentication APIs

### 1.1 Register User
**Method:** `POST /api/auth/register`
**Request Body (JSON):**
```json
{
  "username": "sidhu_moosewala_1774682666",
  "full_name": "Sidhu Moosewala",
  "email": "sidhu_moosewala_1774682666@example.com",
  "password": "sidhu123"
}
```
**Response (201):**
```json
{
  "user_id": 63,
  "username": "sidhu_moosewala_1774682666",
  "full_name": "Sidhu Moosewala",
  "email": "sidhu_moosewala_1774682666@example.com",
  "role": "Guest",
  "created_at": "2026-03-28T12:54:26.675072",
  "updated_at": "2026-03-28T12:54:26.675072"
}
```

### 1.2 Login
**Method:** `POST /api/auth/login`
**Request Body (Form Data):**
```json
{
  "username": "soham",
  "password": "soham123"
}
```
**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzb2hhbUBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTc3NDY4NjI2N30.I9try3-BBr30Bf1GjEDYa7UJfe8AeFgT64VX9cmGGqI",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzb2hhbUBleGFtcGxlLmNvbSIsImV4cCI6MTc3NTI4NzQ2NywidHlwZSI6InJlZnJlc2gifQ.gk4VISkla2Y7AQz8ZVGkp0B-0o1oAnE39My0S4pKGGA",
  "token_type": "Bearer",
  "role": "admin",
  "user_id": 61,
  "username": "soham",
  "full_name": "soham eg",
  "permissions": [],
  "created_at": "2026-03-28T07:24:27.658015",
  "updated_at": "2026-03-28T07:24:27.658015"
}
```

### 1.3 Refresh Token
**Method:** `POST /api/auth/refresh`
**Request Body (JSON):**
```json
{
  "refresh_token": "[REFRESH_TOKEN]"
}
```
**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzb2hhbUBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTc3NDY4NjI2N30.I9try3-BBr30Bf1GjEDYa7UJfe8AeFgT64VX9cmGGqI",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzb2hhbUBleGFtcGxlLmNvbSIsImV4cCI6MTc3NTI4NzQ2NywidHlwZSI6InJlZnJlc2gifQ.gk4VISkla2Y7AQz8ZVGkp0B-0o1oAnE39My0S4pKGGA",
  "token_type": "Bearer",
  "role": "admin",
  "user_id": 61,
  "username": "soham",
  "full_name": "soham eg",
  "permissions": [],
  "created_at": "2026-03-28T07:24:27.658015",
  "updated_at": "2026-03-28T07:24:27.700010"
}
```

### 1.4 Logout
**Method:** `POST /api/auth/logout`
**Headers:**
```json
{
  "Authorization": "Bearer [MASKED]"
}
```
**Response (200):**
```json
{
  "message": "User 'soham@example.com' logged out successfully"
}
```

## 2. User Management APIs

### 2.1 Get Current User (Me)
**Method:** `GET /api/users/me`
**Headers:**
```json
{
  "Authorization": "Bearer [MASKED]"
}
```
**Response (200):**
```json
{
  "user_id": 61,
  "username": "soham",
  "full_name": "soham eg",
  "email": "soham@example.com",
  "role": "admin",
  "created_at": "2026-03-28T11:06:54.606244",
  "updated_at": "2026-03-28T07:24:27.658015"
}
```

### 2.2 Get All Users
**Method:** `GET /api/users`
**Headers:**
```json
{
  "Authorization": "Bearer [MASKED]"
}
```
**Response (200):**
```json
[
  {
    "user_id": 60,
    "username": "karan ",
    "full_name": "karan aujla",
    "email": "karanaujla@example.com",
    "role": "Guest",
    "created_at": "2026-03-28T10:34:12.402173",
    "updated_at": "2026-03-28T05:05:51.756529"
  },
  {
    "user_id": 63,
    "username": "sidhu_moosewala_1774682666",
    "full_name": "Sidhu Moosewala",
    "email": "sidhu_moosewala_1774682666@example.com",
    "role": "Guest",
    "created_at": "2026-03-28T12:54:26.675072",
    "updated_at": "2026-03-28T12:54:26.675072"
  },
  {
    "user_id": 3,
    "username": "gagan.sami13",
    "full_name": "Abeer Hegde",
    "email": "gagan.sami13@pvg.ac.in",
    "role": "Accountant",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 4,
    "username": "ayushman.chander45",
    "full_name": "Reva Kala",
    "email": "ayushman.chander45@pvg.ac.in",
    "role": "Student",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 5,
    "username": "viraj.tiwari41",
    "full_name": "Amaira Prasad",
    "email": "viraj.tiwari41@pvg.ac.in",
    "role": "Principal",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 6,
    "username": "rushil.saini38",
    "full_name": "Kamala Kannan",
    "email": "rushil.saini38@pvg.ac.in",
    "role": "Accountant",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 7,
    "username": "saumya.mall27",
    "full_name": "Xiti Banik",
    "email": "saumya.mall27@pvg.ac.in",
    "role": "Principal",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 8,
    "username": "nathaniel.sami23",
    "full_name": "Noah Bhat",
    "email": "nathaniel.sami23@pvg.ac.in",
    "role": "Teacher",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 9,
    "username": "arunima.dugal96",
    "full_name": "Dalbir Chandra",
    "email": "arunima.dugal96@pvg.ac.in",
    "role": "Teacher",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 10,
    "username": "gayathri.chaudry79",
    "full_name": "Abhimanyu Misra",
    "email": "gayathri.chaudry79@pvg.ac.in",
    "role": "Vice Principal",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 11,
    "username": "lajita.chatterjee21",
    "full_name": "Farhan Dhingra",
    "email": "lajita.chatterjee21@pvg.ac.in",
    "role": "Vice Principal",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 12,
    "username": "hemangini.lalla85",
    "full_name": "Qushi Keer",
    "email": "hemangini.lalla85@pvg.ac.in",
    "role": "Admin",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 13,
    "username": "tripti.yadav64",
    "full_name": "Matthew Dara",
    "email": "tripti.yadav64@pvg.ac.in",
    "role": "Student",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 14,
    "username": "kritika.brar14",
    "full_name": "Nachiket Mander",
    "email": "kritika.brar14@pvg.ac.in",
    "role": "Student",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 15,
    "username": "janaki.handa13",
    "full_name": "Avi Sarraf",
    "email": "janaki.handa13@pvg.ac.in",
    "role": "Vice Principal",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 16,
    "username": "chakradev.kari21",
    "full_name": "Rishi Chaudhary",
    "email": "chakradev.kari21@pvg.ac.in",
    "role": "Teacher",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 61,
    "username": "soham",
    "full_name": "soham eg",
    "email": "soham@example.com",
    "role": "admin",
    "created_at": "2026-03-28T11:06:54.606244",
    "updated_at": "2026-03-28T07:24:27.658015"
  },
  {
    "user_id": 17,
    "username": "fariq.kaul37",
    "full_name": "Hemangini D\u2019Alia",
    "email": "fariq.kaul37@pvg.ac.in",
    "role": "Admin",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 18,
    "username": "lajita.mall39",
    "full_name": "Charan Chakraborty",
    "email": "lajita.mall39@pvg.ac.in",
    "role": "Accountant",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 19,
    "username": "janya.gaba74",
    "full_name": "Bhanumati Sampath",
    "email": "janya.gaba74@pvg.ac.in",
    "role": "Accountant",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 20,
    "username": "isha.kadakia87",
    "full_name": "Pavani Tailor",
    "email": "isha.kadakia87@pvg.ac.in",
    "role": "Accountant",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 21,
    "username": "ekbal.garg13",
    "full_name": "Ekapad Sule",
    "email": "ekbal.garg13@pvg.ac.in",
    "role": "Teacher",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 22,
    "username": "nihal.shere81",
    "full_name": "Yashawini Rege",
    "email": "nihal.shere81@pvg.ac.in",
    "role": "Vice Principal",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 23,
    "username": "anamika.kanda35",
    "full_name": "Hiral Contractor",
    "email": "anamika.kanda35@pvg.ac.in",
    "role": "Vice Principal",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 24,
    "username": "daksh.karnik93",
    "full_name": "Kritika Kannan",
    "email": "daksh.karnik93@pvg.ac.in",
    "role": "Teacher",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 25,
    "username": "diya.rattan99",
    "full_name": "Irya Kaur",
    "email": "diya.rattan99@pvg.ac.in",
    "role": "Vice Principal",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 26,
    "username": "dominic.kakar79",
    "full_name": "Adweta Radhakrishnan",
    "email": "dominic.kakar79@pvg.ac.in",
    "role": "Vice Principal",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 27,
    "username": "simon.tata63",
    "full_name": "Maanav Mani",
    "email": "simon.tata63@pvg.ac.in",
    "role": "Admin",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 28,
    "username": "tara.dhar38",
    "full_name": "Bishakha Sathe",
    "email": "tara.dhar38@pvg.ac.in",
    "role": "Student",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 29,
    "username": "liam.koshy67",
    "full_name": "Vasudha Dutt",
    "email": "liam.koshy67@pvg.ac.in",
    "role": "Vice Principal",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 30,
    "username": "priya.rastogi85",
    "full_name": "Caleb Bhasin",
    "email": "priya.rastogi85@pvg.ac.in",
    "role": "Principal",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 31,
    "username": "theodore.devi45",
    "full_name": "Isaac Singhal",
    "email": "theodore.devi45@pvg.ac.in",
    "role": "Vice Principal",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 32,
    "username": "gavin.batta10",
    "full_name": "Darika Dalal",
    "email": "gavin.batta10@pvg.ac.in",
    "role": "Accountant",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 33,
    "username": "michael.dutta30",
    "full_name": "Dalaja Panchal",
    "email": "michael.dutta30@pvg.ac.in",
    "role": "Student",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 34,
    "username": "devansh.rajan99",
    "full_name": "Ekani Desai",
    "email": "devansh.rajan99@pvg.ac.in",
    "role": "Teacher",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 35,
    "username": "upadhriti.wadhwa64",
    "full_name": "Abdul Srinivas",
    "email": "upadhriti.wadhwa64@pvg.ac.in",
    "role": "Student",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 36,
    "username": "advay.contractor53",
    "full_name": "Hemani Sankaran",
    "email": "advay.contractor53@pvg.ac.in",
    "role": "Admin",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 1,
    "username": "aryan.maharaj91",
    "full_name": "David Balan",
    "email": "aryan.maharaj91@pvg.ac.in",
    "role": "admin",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 2,
    "username": "udant.dewan24",
    "full_name": "Krishna Soman",
    "email": "udant.dewan24@pvg.ac.in",
    "role": "Student",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 37,
    "username": "harini.choudhury45",
    "full_name": "Pranav Kade",
    "email": "harini.choudhury45@pvg.ac.in",
    "role": "Admin",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 38,
    "username": "radhika.dugar29",
    "full_name": "Noah Tandon",
    "email": "radhika.dugar29@pvg.ac.in",
    "role": "Accountant",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 39,
    "username": "aarush.lall37",
    "full_name": "Vivaan Kannan",
    "email": "aarush.lall37@pvg.ac.in",
    "role": "Principal",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 40,
    "username": "yashica.cherian53",
    "full_name": "Dipta Thaman",
    "email": "yashica.cherian53@pvg.ac.in",
    "role": "Vice Principal",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 41,
    "username": "yashica.issac23",
    "full_name": "Ekanta Khosla",
    "email": "yashica.issac23@pvg.ac.in",
    "role": "Admin",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 42,
    "username": "kashvi.edwin21",
    "full_name": "Vanya Choudhary",
    "email": "kashvi.edwin21@pvg.ac.in",
    "role": "Student",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 43,
    "username": "ekiya.suresh58",
    "full_name": "Dipta Nagar",
    "email": "ekiya.suresh58@pvg.ac.in",
    "role": "Accountant",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 44,
    "username": "isaac.patil22",
    "full_name": "Tanay Mander",
    "email": "isaac.patil22@pvg.ac.in",
    "role": "Accountant",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 45,
    "username": "wriddhish.bhardwaj55",
    "full_name": "Akshay Palan",
    "email": "wriddhish.bhardwaj55@pvg.ac.in",
    "role": "Vice Principal",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 46,
    "username": "farhan.chada54",
    "full_name": "Indira Chaudhry",
    "email": "farhan.chada54@pvg.ac.in",
    "role": "Accountant",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 47,
    "username": "ekapad.walia87",
    "full_name": "Damini Ramachandran",
    "email": "ekapad.walia87@pvg.ac.in",
    "role": "Student",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 48,
    "username": "kabir.soman43",
    "full_name": "Tejas Ghosh",
    "email": "kabir.soman43@pvg.ac.in",
    "role": "Teacher",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 49,
    "username": "alka.wable15",
    "full_name": "Om Khosla",
    "email": "alka.wable15@pvg.ac.in",
    "role": "HOD",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 50,
    "username": "siddharth.zacharia68",
    "full_name": "Pranav Natarajan",
    "email": "siddharth.zacharia68@pvg.ac.in",
    "role": "Vice Principal",
    "created_at": "2026-03-11T20:21:52.823746",
    "updated_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 51,
    "username": "swaraj",
    "full_name": "Harshil Lad",
    "email": "swaraj@example.com",
    "role": "student",
    "created_at": "2026-03-19T21:45:50.695816",
    "updated_at": "2026-03-19T21:45:50.695816"
  },
  {
    "user_id": 52,
    "username": "piyush",
    "full_name": "Mason Walia",
    "email": "piyush@example.com",
    "role": "vice_principal",
    "created_at": "2026-03-19T21:49:38.399900",
    "updated_at": "2026-03-19T21:49:38.399900"
  },
  {
    "user_id": 53,
    "username": "pratik",
    "full_name": "Chasmum Gara",
    "email": "pratik@example.com",
    "role": "HOD",
    "created_at": "2026-03-20T11:10:41.428849",
    "updated_at": "2026-03-20T11:10:41.428849"
  },
  {
    "user_id": 54,
    "username": "virat",
    "full_name": "Logan Bhagat",
    "email": "virat@example.com",
    "role": "HOD",
    "created_at": "2026-03-20T16:14:24.433003",
    "updated_at": "2026-03-20T20:04:06.183141"
  },
  {
    "user_id": 56,
    "username": "gunesh",
    "full_name": "Christopher Sarraf",
    "email": "gunesh@example.com",
    "role": "guest",
    "created_at": "2026-03-20T20:05:29.937764",
    "updated_at": "2026-03-20T20:05:29.937764"
  },
  {
    "user_id": 57,
    "username": "rohit",
    "full_name": "Agastya Chakrabarti",
    "email": "rohit@example.com",
    "role": "HOD",
    "created_at": "2026-03-24T15:49:10.825790",
    "updated_at": "2026-03-24T15:51:33.694898"
  },
  {
    "user_id": 58,
    "username": "jass_m",
    "full_name": "jass manak",
    "email": "jass@example.com",
    "role": "Guest",
    "created_at": "2026-03-27T21:25:19.901159",
    "updated_at": "2026-03-27T15:56:58.812767"
  },
  {
    "user_id": 55,
    "username": "admin",
    "full_name": "Yamini Ray",
    "email": "admin@admin.com",
    "role": "admin",
    "created_at": "2026-03-20T17:19:01.256578",
    "updated_at": "2026-03-28T05:21:09.509703"
  },
  {
    "user_id": 59,
    "username": "testuser_1774673903",
    "full_name": "Test User",
    "email": "testuser_1774673903@example.com",
    "role": "Guest",
    "created_at": "2026-03-28T10:28:26.001066",
    "updated_at": "2026-03-28T04:58:33.722577"
  },
  {
    "user_id": 62,
    "username": "swagger_test_1774682344",
    "full_name": "swagger_test_1774682344 Name",
    "email": "swagger_test_1774682344@example.com",
    "role": "Guest",
    "created_at": "2026-03-28T12:49:04.104654",
    "updated_at": "2026-03-28T12:49:04.104654"
  }
]
```

### 2.3 Get User by ID
**Method:** `GET /api/users/63`
**Headers:**
```json
{
  "Authorization": "Bearer [MASKED]"
}
```
**Response (200):**
```json
{
  "user_id": 63,
  "username": "sidhu_moosewala_1774682666",
  "full_name": "Sidhu Moosewala",
  "email": "sidhu_moosewala_1774682666@example.com",
  "role": "Guest",
  "created_at": "2026-03-28T12:54:26.675072",
  "updated_at": "2026-03-28T12:54:26.675072"
}
```

## 3. Role & Permission APIs

### 3.1 Get All Roles
**Method:** `GET /api/roles`
**Headers:**
```json
{
  "Authorization": "Bearer [MASKED]"
}
```
**Response (200):**
```json
[
  {
    "role_id": 4,
    "role_name": "Teacher"
  },
  {
    "role_id": 5,
    "role_name": "Student"
  },
  {
    "role_id": 6,
    "role_name": "Admin"
  },
  {
    "role_id": 7,
    "role_name": "Accountant"
  },
  {
    "role_id": 8,
    "role_name": "admin"
  },
  {
    "role_id": 9,
    "role_name": "principal"
  },
  {
    "role_id": 10,
    "role_name": "vice_principal"
  },
  {
    "role_id": 11,
    "role_name": "hod"
  },
  {
    "role_id": 12,
    "role_name": "faculty"
  },
  {
    "role_id": 13,
    "role_name": "student"
  },
  {
    "role_id": 14,
    "role_name": "placement_officer"
  },
  {
    "role_id": 15,
    "role_name": "guest"
  },
  {
    "role_id": 2,
    "role_name": "Vice Principal"
  },
  {
    "role_id": 3,
    "role_name": "HOD"
  },
  {
    "role_id": 19,
    "role_name": "Guest"
  },
  {
    "role_id": 1,
    "role_name": "Principal"
  }
]
```

### 3.2 Assign Role
**Method:** `POST /api/roles/assign`
**Headers:**
```json
{
  "Authorization": "Bearer [MASKED]"
}
```
**Request Body (JSON):**
```json
{
  "user_id": 63,
  "role": "Guest"
}
```
**Response (200):**
```json
{
  "message": "Role assigned successfully"
}
```

### 3.3 Update Permissions
**Method:** `PUT /api/roles/4/permissions`
**Headers:**
```json
{
  "Authorization": "Bearer [MASKED]"
}
```
**Request Body (JSON):**
```json
[
  "read_basic",
  "view_dashboard"
]
```
**Response (200):**
```json
{
  "message": "Permissions updated",
  "permissions": [
    "read_basic",
    "view_dashboard"
  ]
}
```

## 4. Admin Dashboard APIs

### 4.1 Get Stats
**Method:** `GET /api/admin/stats`
**Headers:**
```json
{
  "Authorization": "Bearer [MASKED]"
}
```
**Response (200):**
```json
{
  "total_users": 63,
  "total_roles": 16,
  "active_sessions": 1,
  "total_tokens": 10
}
```

### 4.2 Admin Get All Users
**Method:** `GET /api/admin/users`
**Headers:**
```json
{
  "Authorization": "Bearer [MASKED]"
}
```
**Response (200):**
```json
[
  {
    "user_id": 60,
    "username": "karan ",
    "email": "karanaujla@example.com",
    "role": "Guest",
    "status": true,
    "created_at": "2026-03-28T10:34:12.402173"
  },
  {
    "user_id": 63,
    "username": "sidhu_moosewala_1774682666",
    "email": "sidhu_moosewala_1774682666@example.com",
    "role": "Guest",
    "status": true,
    "created_at": "2026-03-28T12:54:26.675072"
  },
  {
    "user_id": 61,
    "username": "soham",
    "email": "soham@example.com",
    "role": "admin",
    "status": true,
    "created_at": "2026-03-28T11:06:54.606244"
  },
  {
    "user_id": 3,
    "username": "gagan.sami13",
    "email": "gagan.sami13@pvg.ac.in",
    "role": "Accountant",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 4,
    "username": "ayushman.chander45",
    "email": "ayushman.chander45@pvg.ac.in",
    "role": "Student",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 5,
    "username": "viraj.tiwari41",
    "email": "viraj.tiwari41@pvg.ac.in",
    "role": "Principal",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 6,
    "username": "rushil.saini38",
    "email": "rushil.saini38@pvg.ac.in",
    "role": "Accountant",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 7,
    "username": "saumya.mall27",
    "email": "saumya.mall27@pvg.ac.in",
    "role": "Principal",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 8,
    "username": "nathaniel.sami23",
    "email": "nathaniel.sami23@pvg.ac.in",
    "role": "Teacher",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 9,
    "username": "arunima.dugal96",
    "email": "arunima.dugal96@pvg.ac.in",
    "role": "Teacher",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 10,
    "username": "gayathri.chaudry79",
    "email": "gayathri.chaudry79@pvg.ac.in",
    "role": "Vice Principal",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 11,
    "username": "lajita.chatterjee21",
    "email": "lajita.chatterjee21@pvg.ac.in",
    "role": "Vice Principal",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 12,
    "username": "hemangini.lalla85",
    "email": "hemangini.lalla85@pvg.ac.in",
    "role": "Admin",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 13,
    "username": "tripti.yadav64",
    "email": "tripti.yadav64@pvg.ac.in",
    "role": "Student",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 14,
    "username": "kritika.brar14",
    "email": "kritika.brar14@pvg.ac.in",
    "role": "Student",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 15,
    "username": "janaki.handa13",
    "email": "janaki.handa13@pvg.ac.in",
    "role": "Vice Principal",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 16,
    "username": "chakradev.kari21",
    "email": "chakradev.kari21@pvg.ac.in",
    "role": "Teacher",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 17,
    "username": "fariq.kaul37",
    "email": "fariq.kaul37@pvg.ac.in",
    "role": "Admin",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 18,
    "username": "lajita.mall39",
    "email": "lajita.mall39@pvg.ac.in",
    "role": "Accountant",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 19,
    "username": "janya.gaba74",
    "email": "janya.gaba74@pvg.ac.in",
    "role": "Accountant",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 20,
    "username": "isha.kadakia87",
    "email": "isha.kadakia87@pvg.ac.in",
    "role": "Accountant",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 21,
    "username": "ekbal.garg13",
    "email": "ekbal.garg13@pvg.ac.in",
    "role": "Teacher",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 22,
    "username": "nihal.shere81",
    "email": "nihal.shere81@pvg.ac.in",
    "role": "Vice Principal",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 23,
    "username": "anamika.kanda35",
    "email": "anamika.kanda35@pvg.ac.in",
    "role": "Vice Principal",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 24,
    "username": "daksh.karnik93",
    "email": "daksh.karnik93@pvg.ac.in",
    "role": "Teacher",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 25,
    "username": "diya.rattan99",
    "email": "diya.rattan99@pvg.ac.in",
    "role": "Vice Principal",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 26,
    "username": "dominic.kakar79",
    "email": "dominic.kakar79@pvg.ac.in",
    "role": "Vice Principal",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 27,
    "username": "simon.tata63",
    "email": "simon.tata63@pvg.ac.in",
    "role": "Admin",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 28,
    "username": "tara.dhar38",
    "email": "tara.dhar38@pvg.ac.in",
    "role": "Student",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 29,
    "username": "liam.koshy67",
    "email": "liam.koshy67@pvg.ac.in",
    "role": "Vice Principal",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 30,
    "username": "priya.rastogi85",
    "email": "priya.rastogi85@pvg.ac.in",
    "role": "Principal",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 31,
    "username": "theodore.devi45",
    "email": "theodore.devi45@pvg.ac.in",
    "role": "Vice Principal",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 32,
    "username": "gavin.batta10",
    "email": "gavin.batta10@pvg.ac.in",
    "role": "Accountant",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 33,
    "username": "michael.dutta30",
    "email": "michael.dutta30@pvg.ac.in",
    "role": "Student",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 34,
    "username": "devansh.rajan99",
    "email": "devansh.rajan99@pvg.ac.in",
    "role": "Teacher",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 35,
    "username": "upadhriti.wadhwa64",
    "email": "upadhriti.wadhwa64@pvg.ac.in",
    "role": "Student",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 36,
    "username": "advay.contractor53",
    "email": "advay.contractor53@pvg.ac.in",
    "role": "Admin",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 1,
    "username": "aryan.maharaj91",
    "email": "aryan.maharaj91@pvg.ac.in",
    "role": "admin",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 2,
    "username": "udant.dewan24",
    "email": "udant.dewan24@pvg.ac.in",
    "role": "Student",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 37,
    "username": "harini.choudhury45",
    "email": "harini.choudhury45@pvg.ac.in",
    "role": "Admin",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 38,
    "username": "radhika.dugar29",
    "email": "radhika.dugar29@pvg.ac.in",
    "role": "Accountant",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 39,
    "username": "aarush.lall37",
    "email": "aarush.lall37@pvg.ac.in",
    "role": "Principal",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 40,
    "username": "yashica.cherian53",
    "email": "yashica.cherian53@pvg.ac.in",
    "role": "Vice Principal",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 41,
    "username": "yashica.issac23",
    "email": "yashica.issac23@pvg.ac.in",
    "role": "Admin",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 42,
    "username": "kashvi.edwin21",
    "email": "kashvi.edwin21@pvg.ac.in",
    "role": "Student",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 43,
    "username": "ekiya.suresh58",
    "email": "ekiya.suresh58@pvg.ac.in",
    "role": "Accountant",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 44,
    "username": "isaac.patil22",
    "email": "isaac.patil22@pvg.ac.in",
    "role": "Accountant",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 45,
    "username": "wriddhish.bhardwaj55",
    "email": "wriddhish.bhardwaj55@pvg.ac.in",
    "role": "Vice Principal",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 46,
    "username": "farhan.chada54",
    "email": "farhan.chada54@pvg.ac.in",
    "role": "Accountant",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 47,
    "username": "ekapad.walia87",
    "email": "ekapad.walia87@pvg.ac.in",
    "role": "Student",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 48,
    "username": "kabir.soman43",
    "email": "kabir.soman43@pvg.ac.in",
    "role": "Teacher",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 49,
    "username": "alka.wable15",
    "email": "alka.wable15@pvg.ac.in",
    "role": "HOD",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 50,
    "username": "siddharth.zacharia68",
    "email": "siddharth.zacharia68@pvg.ac.in",
    "role": "Vice Principal",
    "status": true,
    "created_at": "2026-03-11T20:21:52.823746"
  },
  {
    "user_id": 51,
    "username": "swaraj",
    "email": "swaraj@example.com",
    "role": "student",
    "status": true,
    "created_at": "2026-03-19T21:45:50.695816"
  },
  {
    "user_id": 52,
    "username": "piyush",
    "email": "piyush@example.com",
    "role": "vice_principal",
    "status": true,
    "created_at": "2026-03-19T21:49:38.399900"
  },
  {
    "user_id": 53,
    "username": "pratik",
    "email": "pratik@example.com",
    "role": "HOD",
    "status": true,
    "created_at": "2026-03-20T11:10:41.428849"
  },
  {
    "user_id": 54,
    "username": "virat",
    "email": "virat@example.com",
    "role": "HOD",
    "status": true,
    "created_at": "2026-03-20T16:14:24.433003"
  },
  {
    "user_id": 56,
    "username": "gunesh",
    "email": "gunesh@example.com",
    "role": "guest",
    "status": true,
    "created_at": "2026-03-20T20:05:29.937764"
  },
  {
    "user_id": 57,
    "username": "rohit",
    "email": "rohit@example.com",
    "role": "HOD",
    "status": true,
    "created_at": "2026-03-24T15:49:10.825790"
  },
  {
    "user_id": 58,
    "username": "jass_m",
    "email": "jass@example.com",
    "role": "Guest",
    "status": true,
    "created_at": "2026-03-27T21:25:19.901159"
  },
  {
    "user_id": 55,
    "username": "admin",
    "email": "admin@admin.com",
    "role": "admin",
    "status": true,
    "created_at": "2026-03-20T17:19:01.256578"
  },
  {
    "user_id": 59,
    "username": "testuser_1774673903",
    "email": "testuser_1774673903@example.com",
    "role": "Guest",
    "status": true,
    "created_at": "2026-03-28T10:28:26.001066"
  },
  {
    "user_id": 62,
    "username": "swagger_test_1774682344",
    "email": "swagger_test_1774682344@example.com",
    "role": "Guest",
    "status": true,
    "created_at": "2026-03-28T12:49:04.104654"
  }
]
```

### 4.3 Admin Get User Details
**Method:** `GET /api/admin/users/63`
**Headers:**
```json
{
  "Authorization": "Bearer [MASKED]"
}
```
**Response (200):**
```json
{
  "user_id": 63,
  "username": "sidhu_moosewala_1774682666",
  "email": "sidhu_moosewala_1774682666@example.com",
  "role": "Guest",
  "status": true,
  "created_at": "2026-03-28T12:54:26.675072"
}
```

### 4.4 Admin Get Roles Summary
**Method:** `GET /api/admin/roles`
**Headers:**
```json
{
  "Authorization": "Bearer [MASKED]"
}
```
**Response (200):**
```json
[
  {
    "role_id": 5,
    "role_name": "Student",
    "description": "Enrolled student",
    "permissions": [],
    "user_count": 11
  },
  {
    "role_id": 6,
    "role_name": "Admin",
    "description": "System administrator",
    "permissions": [],
    "user_count": 13
  },
  {
    "role_id": 7,
    "role_name": "Accountant",
    "description": "Finance department staff",
    "permissions": [],
    "user_count": 13
  },
  {
    "role_id": 8,
    "role_name": "admin",
    "description": "System administrator with full access",
    "permissions": [],
    "user_count": 3
  },
  {
    "role_id": 9,
    "role_name": "principal",
    "description": "Head of the institution",
    "permissions": [],
    "user_count": 0
  },
  {
    "role_id": 10,
    "role_name": "vice_principal",
    "description": "Deputy head of the institution",
    "permissions": [],
    "user_count": 1
  },
  {
    "role_id": 11,
    "role_name": "hod",
    "description": "Head of Department",
    "permissions": [],
    "user_count": 0
  },
  {
    "role_id": 12,
    "role_name": "faculty",
    "description": "Teaching staff",
    "permissions": [],
    "user_count": 0
  },
  {
    "role_id": 13,
    "role_name": "student",
    "description": "Enrolled student",
    "permissions": [],
    "user_count": 1
  },
  {
    "role_id": 14,
    "role_name": "placement_officer",
    "description": "Manages placements and alumni relations",
    "permissions": [],
    "user_count": 0
  },
  {
    "role_id": 15,
    "role_name": "guest",
    "description": "Default role with minimum permissions",
    "permissions": [],
    "user_count": 1
  },
  {
    "role_id": 2,
    "role_name": "Vice Principal",
    "description": "Assistant head of the institution",
    "permissions": [
      "users.view"
    ],
    "user_count": 16
  },
  {
    "role_id": 3,
    "role_name": "HOD",
    "description": "Head of Department",
    "permissions": [
      "users.view",
      "users.edit",
      "roles.edit"
    ],
    "user_count": 10
  },
  {
    "role_id": 19,
    "role_name": "Guest",
    "description": "Default role with minimum permissions",
    "permissions": [],
    "user_count": 5
  },
  {
    "role_id": 1,
    "role_name": "Principal",
    "description": "Head of the institution",
    "permissions": [
      "read_basic",
      "view_dashboard"
    ],
    "user_count": 8
  },
  {
    "role_id": 4,
    "role_name": "Teacher",
    "description": "Faculty member",
    "permissions": [
      "read_basic",
      "view_dashboard"
    ],
    "user_count": 9
  }
]
```

### 4.5 Get Traffic Data
**Method:** `GET /api/admin/traffic`
**Headers:**
```json
{
  "Authorization": "Bearer [MASKED]"
}
```
**Response (200):**
```json
[
  {
    "time": "08:00",
    "value": 5
  },
  {
    "time": "09:00",
    "value": 5
  },
  {
    "time": "10:00",
    "value": 5
  },
  {
    "time": "11:00",
    "value": 5
  },
  {
    "time": "12:00",
    "value": 5
  },
  {
    "time": "13:00",
    "value": 5
  },
  {
    "time": "14:00",
    "value": 5
  },
  {
    "time": "15:00",
    "value": 5
  },
  {
    "time": "16:00",
    "value": 6
  },
  {
    "time": "17:00",
    "value": 5
  },
  {
    "time": "18:00",
    "value": 5
  },
  {
    "time": "19:00",
    "value": 5
  },
  {
    "time": "20:00",
    "value": 5
  },
  {
    "time": "21:00",
    "value": 5
  },
  {
    "time": "22:00",
    "value": 5
  },
  {
    "time": "23:00",
    "value": 5
  },
  {
    "time": "00:00",
    "value": 5
  },
  {
    "time": "01:00",
    "value": 5
  },
  {
    "time": "02:00",
    "value": 5
  },
  {
    "time": "03:00",
    "value": 5
  },
  {
    "time": "04:00",
    "value": 5
  },
  {
    "time": "05:00",
    "value": 8
  },
  {
    "time": "06:00",
    "value": 5
  },
  {
    "time": "07:00",
    "value": 6
  }
]
```

### 4.6 Get Audit Logs
**Method:** `GET /api/admin/audit`
**Headers:**
```json
{
  "Authorization": "Bearer [MASKED]"
}
```
**Response (200):**
```json
[
  {
    "action": "Login",
    "user": "soham@example.com",
    "detail": "Token active",
    "timestamp": "2026-03-28 07:24:27",
    "ip": "127.0.0.1"
  },
  {
    "action": "Login",
    "user": "admin@admin.com",
    "detail": "Token active",
    "timestamp": "2026-03-28 05:21:09",
    "ip": "127.0.0.1"
  },
  {
    "action": "Login",
    "user": "karanaujla@example.com",
    "detail": "Token active",
    "timestamp": "2026-03-28 05:05:51",
    "ip": "127.0.0.1"
  },
  {
    "action": "Login",
    "user": "testuser_1774673903@example.com",
    "detail": "Token active",
    "timestamp": "2026-03-28 04:58:33",
    "ip": "127.0.0.1"
  },
  {
    "action": "Login",
    "user": "jass@example.com",
    "detail": "Token active",
    "timestamp": "2026-03-27 15:56:58",
    "ip": "127.0.0.1"
  },
  {
    "action": "Login",
    "user": "rohit@example.com",
    "detail": "Token active",
    "timestamp": "2026-03-24 15:51:08",
    "ip": "127.0.0.1"
  },
  {
    "action": "Login",
    "user": "rohit@example.com",
    "detail": "Token active",
    "timestamp": "2026-03-24 15:50:21",
    "ip": "127.0.0.1"
  },
  {
    "action": "Login",
    "user": "rohit@example.com",
    "detail": "Token active",
    "timestamp": "2026-03-24 15:49:34",
    "ip": "127.0.0.1"
  },
  {
    "action": "Login",
    "user": "virat@example.com",
    "detail": "Token active",
    "timestamp": "2026-03-20 20:03:30",
    "ip": "127.0.0.1"
  },
  {
    "action": "Login",
    "user": "virat@example.com",
    "detail": "Token active",
    "timestamp": "2026-03-20 20:03:10",
    "ip": "127.0.0.1"
  }
]
```

### 4.7 Export Data
**Method:** `GET /api/admin/export/data?data_type=users`
**Headers:**
```json
{
  "Authorization": "Bearer [MASKED]"
}
```
**Response (200):**
```json
[
  {
    "id": 60,
    "username": "karan ",
    "email": "karanaujla@example.com",
    "role": "Guest",
    "status": "Active",
    "joined": "2026-03-28"
  },
  {
    "id": 63,
    "username": "sidhu_moosewala_1774682666",
    "email": "sidhu_moosewala_1774682666@example.com",
    "role": "Guest",
    "status": "Active",
    "joined": "2026-03-28"
  },
  {
    "id": 61,
    "username": "soham",
    "email": "soham@example.com",
    "role": "admin",
    "status": "Active",
    "joined": "2026-03-28"
  },
  {
    "id": 3,
    "username": "gagan.sami13",
    "email": "gagan.sami13@pvg.ac.in",
    "role": "Accountant",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 4,
    "username": "ayushman.chander45",
    "email": "ayushman.chander45@pvg.ac.in",
    "role": "Student",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 5,
    "username": "viraj.tiwari41",
    "email": "viraj.tiwari41@pvg.ac.in",
    "role": "Principal",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 6,
    "username": "rushil.saini38",
    "email": "rushil.saini38@pvg.ac.in",
    "role": "Accountant",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 7,
    "username": "saumya.mall27",
    "email": "saumya.mall27@pvg.ac.in",
    "role": "Principal",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 8,
    "username": "nathaniel.sami23",
    "email": "nathaniel.sami23@pvg.ac.in",
    "role": "Teacher",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 9,
    "username": "arunima.dugal96",
    "email": "arunima.dugal96@pvg.ac.in",
    "role": "Teacher",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 10,
    "username": "gayathri.chaudry79",
    "email": "gayathri.chaudry79@pvg.ac.in",
    "role": "Vice Principal",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 11,
    "username": "lajita.chatterjee21",
    "email": "lajita.chatterjee21@pvg.ac.in",
    "role": "Vice Principal",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 12,
    "username": "hemangini.lalla85",
    "email": "hemangini.lalla85@pvg.ac.in",
    "role": "Admin",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 13,
    "username": "tripti.yadav64",
    "email": "tripti.yadav64@pvg.ac.in",
    "role": "Student",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 14,
    "username": "kritika.brar14",
    "email": "kritika.brar14@pvg.ac.in",
    "role": "Student",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 15,
    "username": "janaki.handa13",
    "email": "janaki.handa13@pvg.ac.in",
    "role": "Vice Principal",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 16,
    "username": "chakradev.kari21",
    "email": "chakradev.kari21@pvg.ac.in",
    "role": "Teacher",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 17,
    "username": "fariq.kaul37",
    "email": "fariq.kaul37@pvg.ac.in",
    "role": "Admin",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 18,
    "username": "lajita.mall39",
    "email": "lajita.mall39@pvg.ac.in",
    "role": "Accountant",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 19,
    "username": "janya.gaba74",
    "email": "janya.gaba74@pvg.ac.in",
    "role": "Accountant",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 20,
    "username": "isha.kadakia87",
    "email": "isha.kadakia87@pvg.ac.in",
    "role": "Accountant",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 21,
    "username": "ekbal.garg13",
    "email": "ekbal.garg13@pvg.ac.in",
    "role": "Teacher",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 22,
    "username": "nihal.shere81",
    "email": "nihal.shere81@pvg.ac.in",
    "role": "Vice Principal",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 23,
    "username": "anamika.kanda35",
    "email": "anamika.kanda35@pvg.ac.in",
    "role": "Vice Principal",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 24,
    "username": "daksh.karnik93",
    "email": "daksh.karnik93@pvg.ac.in",
    "role": "Teacher",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 25,
    "username": "diya.rattan99",
    "email": "diya.rattan99@pvg.ac.in",
    "role": "Vice Principal",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 26,
    "username": "dominic.kakar79",
    "email": "dominic.kakar79@pvg.ac.in",
    "role": "Vice Principal",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 27,
    "username": "simon.tata63",
    "email": "simon.tata63@pvg.ac.in",
    "role": "Admin",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 28,
    "username": "tara.dhar38",
    "email": "tara.dhar38@pvg.ac.in",
    "role": "Student",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 29,
    "username": "liam.koshy67",
    "email": "liam.koshy67@pvg.ac.in",
    "role": "Vice Principal",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 30,
    "username": "priya.rastogi85",
    "email": "priya.rastogi85@pvg.ac.in",
    "role": "Principal",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 31,
    "username": "theodore.devi45",
    "email": "theodore.devi45@pvg.ac.in",
    "role": "Vice Principal",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 32,
    "username": "gavin.batta10",
    "email": "gavin.batta10@pvg.ac.in",
    "role": "Accountant",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 33,
    "username": "michael.dutta30",
    "email": "michael.dutta30@pvg.ac.in",
    "role": "Student",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 34,
    "username": "devansh.rajan99",
    "email": "devansh.rajan99@pvg.ac.in",
    "role": "Teacher",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 35,
    "username": "upadhriti.wadhwa64",
    "email": "upadhriti.wadhwa64@pvg.ac.in",
    "role": "Student",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 36,
    "username": "advay.contractor53",
    "email": "advay.contractor53@pvg.ac.in",
    "role": "Admin",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 1,
    "username": "aryan.maharaj91",
    "email": "aryan.maharaj91@pvg.ac.in",
    "role": "admin",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 2,
    "username": "udant.dewan24",
    "email": "udant.dewan24@pvg.ac.in",
    "role": "Student",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 37,
    "username": "harini.choudhury45",
    "email": "harini.choudhury45@pvg.ac.in",
    "role": "Admin",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 38,
    "username": "radhika.dugar29",
    "email": "radhika.dugar29@pvg.ac.in",
    "role": "Accountant",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 39,
    "username": "aarush.lall37",
    "email": "aarush.lall37@pvg.ac.in",
    "role": "Principal",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 40,
    "username": "yashica.cherian53",
    "email": "yashica.cherian53@pvg.ac.in",
    "role": "Vice Principal",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 41,
    "username": "yashica.issac23",
    "email": "yashica.issac23@pvg.ac.in",
    "role": "Admin",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 42,
    "username": "kashvi.edwin21",
    "email": "kashvi.edwin21@pvg.ac.in",
    "role": "Student",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 43,
    "username": "ekiya.suresh58",
    "email": "ekiya.suresh58@pvg.ac.in",
    "role": "Accountant",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 44,
    "username": "isaac.patil22",
    "email": "isaac.patil22@pvg.ac.in",
    "role": "Accountant",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 45,
    "username": "wriddhish.bhardwaj55",
    "email": "wriddhish.bhardwaj55@pvg.ac.in",
    "role": "Vice Principal",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 46,
    "username": "farhan.chada54",
    "email": "farhan.chada54@pvg.ac.in",
    "role": "Accountant",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 47,
    "username": "ekapad.walia87",
    "email": "ekapad.walia87@pvg.ac.in",
    "role": "Student",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 48,
    "username": "kabir.soman43",
    "email": "kabir.soman43@pvg.ac.in",
    "role": "Teacher",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 49,
    "username": "alka.wable15",
    "email": "alka.wable15@pvg.ac.in",
    "role": "HOD",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 50,
    "username": "siddharth.zacharia68",
    "email": "siddharth.zacharia68@pvg.ac.in",
    "role": "Vice Principal",
    "status": "Active",
    "joined": "2026-03-11"
  },
  {
    "id": 51,
    "username": "swaraj",
    "email": "swaraj@example.com",
    "role": "student",
    "status": "Active",
    "joined": "2026-03-19"
  },
  {
    "id": 52,
    "username": "piyush",
    "email": "piyush@example.com",
    "role": "vice_principal",
    "status": "Active",
    "joined": "2026-03-19"
  },
  {
    "id": 53,
    "username": "pratik",
    "email": "pratik@example.com",
    "role": "HOD",
    "status": "Active",
    "joined": "2026-03-20"
  },
  {
    "id": 54,
    "username": "virat",
    "email": "virat@example.com",
    "role": "HOD",
    "status": "Active",
    "joined": "2026-03-20"
  },
  {
    "id": 56,
    "username": "gunesh",
    "email": "gunesh@example.com",
    "role": "guest",
    "status": "Active",
    "joined": "2026-03-20"
  },
  {
    "id": 57,
    "username": "rohit",
    "email": "rohit@example.com",
    "role": "HOD",
    "status": "Active",
    "joined": "2026-03-24"
  },
  {
    "id": 58,
    "username": "jass_m",
    "email": "jass@example.com",
    "role": "Guest",
    "status": "Active",
    "joined": "2026-03-27"
  },
  {
    "id": 55,
    "username": "admin",
    "email": "admin@admin.com",
    "role": "admin",
    "status": "Active",
    "joined": "2026-03-20"
  },
  {
    "id": 59,
    "username": "testuser_1774673903",
    "email": "testuser_1774673903@example.com",
    "role": "Guest",
    "status": "Active",
    "joined": "2026-03-28"
  },
  {
    "id": 62,
    "username": "swagger_test_1774682344",
    "email": "swagger_test_1774682344@example.com",
    "role": "Guest",
    "status": "Active",
    "joined": "2026-03-28"
  }
]
```

## 5. Legacy Student APIs

### 5.1 Student Signup
**Method:** `POST /api/signup`
**Request Body (JSON):**
```json
{
  "name": "Sidhu Moosewala Student",
  "student_class": "10th",
  "phone": "9999999999",
  "username": "student_sidhu_moosewala_1774682666",
  "password": "sidhu123"
}
```
**Response (201):**
```json
{
  "id": 13,
  "name": "Sidhu Moosewala Student",
  "student_class": "10th",
  "phone": "9999999999",
  "username": "student_sidhu_moosewala_1774682666"
}
```

### 5.2 Student Login
**Method:** `POST /api/login`
**Request Body (JSON):**
```json
{
  "username": "student_sidhu_moosewala_1774682666",
  "password": "sidhu123"
}
```
**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdHVkZW50X3NpZGh1X21vb3Nld2FsYV8xNzc0NjgyNjY2IiwiZXhwIjoxNzc0Njg2MjY4fQ.atx449Iorm3PKMW1athLi3ni8Ye7Nezm6qhvfNXv4zs"
}
```

### 5.3 Get Current Student (Me)
**Method:** `GET /api/me`
**Headers:**
```json
{
  "Authorization": "Bearer [MASKED]"
}
```
**Response (200):**
```json
{
  "id": 13,
  "name": "Sidhu Moosewala Student",
  "student_class": "10th",
  "phone": "9999999999",
  "username": "student_sidhu_moosewala_1774682666"
}
```

### 5.4 Get All Students
**Method:** `GET /api/students`
**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Piyush Phapale",
    "student_class": "SY MSC CS",
    "phone": "84327372727",
    "username": "piyush123"
  },
  {
    "id": 2,
    "name": "Piyush Phapale",
    "student_class": "SY MSC CS",
    "phone": "84327372727",
    "username": "piyush"
  },
  {
    "id": 4,
    "name": "sumit shinde",
    "student_class": "playgroup",
    "phone": "8432737272",
    "username": "sumit"
  },
  {
    "id": 5,
    "name": "shreyas raut",
    "student_class": "FY MSC",
    "phone": "123456",
    "username": "shreyas"
  },
  {
    "id": 6,
    "name": "rohan bhandare",
    "student_class": "SY MSC CS",
    "phone": "12345678",
    "username": "rohanb"
  },
  {
    "id": 7,
    "name": "yash deshapnde",
    "student_class": "SY MSC CS",
    "phone": "12345678",
    "username": "yashd"
  },
  {
    "id": 8,
    "name": "Admin User",
    "student_class": "Admin",
    "phone": "1234567890",
    "username": "admin@example.com"
  },
  {
    "id": 9,
    "name": "rohit burte",
    "student_class": "SY MSC CS",
    "phone": "87654321",
    "username": "rohit"
  },
  {
    "id": 10,
    "name": "sahil gole",
    "student_class": "SY MSC CS",
    "phone": "12345678",
    "username": "sahil"
  },
  {
    "id": 11,
    "name": "shreya gule",
    "student_class": "SY MSC CS",
    "phone": "12345678",
    "username": "shreya"
  },
  {
    "id": 12,
    "name": "swagger_test_1774682344 Student",
    "student_class": "10th",
    "phone": "9999999999",
    "username": "student_swagger_test_1774682344"
  },
  {
    "id": 13,
    "name": "Sidhu Moosewala Student",
    "student_class": "10th",
    "phone": "9999999999",
    "username": "student_sidhu_moosewala_1774682666"
  }
]
```

