# ENGSE207 Software Architecture  
## README — Final Lab Set 2: Microservices + Database-per-Service + Cloud (Railway)

> เอกสารฉบับนี้ใช้เป็น `README.md` สำหรับ repository ของ **Final Lab Set 2**

---

## ข้อมูลรายวิชาและสมาชิก

**รายวิชา:** ENGSE207 Software Architecture  
**ชื่องาน:** Final Lab — ชุดที่ 2: Microservices + Database-per-Service + Cloud (Railway)

**สมาชิกในกลุ่ม**
- ชื่อ-สกุล / รหัสนักศึกษา: นายไตรภพ  ก๋องใจ / 67543210017-9
- ชื่อ-สกุล / รหัสนักศึกษา: นายนัฐพงศ์  รอดอินทร์ / 67543210020-3

**Repository:** `https://github.com/NattapongRodin/FinalLab-set2`

---

## ภาพรวมของระบบ

Final Lab ชุดที่ 2 เป็นการพัฒนาระบบ Task Board แบบ Microservices โดยเน้นหัวข้อสำคัญดังนี้

- การทำงานแบบแยก service
- 3 services บน Cloud: auth, task, user
- Database-per-Service (3 DB แยก)
- มี Register API ใน Auth Service
- Deploy บน Railway (HTTPS อัตโนมัติ)
- Frontend เป็น static file (Railway หรือ local)

งานชุดนี้ **ไม่มี Register** และใช้เฉพาะ **Seed Users** ที่กำหนดไว้ในฐานข้อมูล

---

## วัตถุประสงค์ของงาน

งานนี้มีจุดมุ่งหมายเพื่อฝึกให้นักศึกษาสามารถ

- ออกแบบ Database-per-Service Pattern ได้
- ขยายระบบเดิมโดยเพิ่ม Register API และ User Service ได้
- Deploy 3 services และ 3 databases บน Railway ได้
- เลือกและอธิบาย Gateway Strategy สำหรับ Cloud Services ได้	
- ทดสอบระบบแบบ end-to-end บน Cloud ได้

---

## Architecture Overview

> ให้วางภาพ architecture diagram ของกลุ่มไว้ในส่วนนี้  
> เช่น `docs/architecture-set1.png` หรือแทรกรูปจากโฟลเดอร์ `screenshots/`

```text
Browser / Postman
        │
        ▼
┌──────────────────────────────────────────────────────────────────────┐
│   Docker Compose (Local Test)                                        │
│                                                                      │
│  ┌────────────────┐  ┌──────────────────┐  ┌────────────────────┐    │
│  │ 🔑 Auth Svc    │  │ 📋 Task Svc      │  │ 👤 User Svc        │    │
│  │   :3001        │  │   :3002          │  │   :3003            │    │
│  │                │  │                  │  │                    │    │
│  │ • POST register│  │ • CRUD Tasks     │  │ • GET /me          │    │
│  │ • POST login   │  │ • JWT Guard      │  │ • PUT /me          │    │
│  │ • GET  me      │  │ • log → auth-db  │  │ • GET / (admin)    │    │
│  │ • GET  logs*   │  │                  │  │ • auto-create      │    │
│  └───────┬────────┘  └────────┬─────────┘  └─────────┬──────────┘    │
│          │                   │                       │              │
│          ▼                   ▼                       ▼              │
│  ┌───────────────┐  ┌────────────────────┐  ┌──────────────────────┐ │
│  │  🗄️ auth-db   │  │  🗄️ task-db        │  │  🗄️ user-db          │ │
│  │  :5433        │  │  :5434             │  │  :5435               │ │
│  │  users table  │  │  tasks table       │  │  user_profiles table │ │
│  │  logs table   │  │  logs table        │  │  logs table          │ │
│  └───────────────┘  └────────────────────┘  └──────────────────────┘ │
│                                                                      │
│  JWT_SECRET ใช้ร่วมกันทุก service (ตั้งค่าใน docker-compose)           │
└──────────────────────────────────────────────────────────────────────┘

* GET /api/auth/logs — admin only (ดู logs ของ auth-service)
)
```
```text
Browser / Postman
        │
        │ HTTPS (Railway จัดการให้อัตโนมัติ)
        ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     Railway Project                                  │
│                                                                      │
│  Auth Service                Task Service         User Service       │
│  https://auth-xxx.railway.app   https://task-xxx…  https://user-xxx…  │
│       │                            │                    │            │
│       ▼                            ▼                    ▼            │
│   auth-db (PostgreSQL)        task-db (PostgreSQL)  user-db (PostgreSQL) │
│   [Railway Plugin]            [Railway Plugin]      [Railway Plugin] │
│                                                                      │
│  Frontend เรียกแต่ละ service โดยตรงผ่าน config.js                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Services ที่ใช้ในระบบ
- **frontend** — หน้าเว็บ Task Board และ Log Dashboard
- **auth-service** — Login, Verify, Me
- **task-service** — CRUD Tasks
- **log-service** — รับและแสดง logs

---

## โครงสร้าง Repository

```text
final-lab-set2-[student1]-[student2]/
├── README.md
├── TEAM_SPLIT.md
├── INDIVIDUAL_REPORT_[studentid].md   (ทุกคน)
├── docker-compose.yml                 (ใช้ทดสอบ local เท่านั้น)
├── .env.example
│
├── auth-service/
│   ├── Dockerfile
│   ├── package.json
│   ├── init.sql                       ← schema + seed users สำหรับ auth-db
│   └── src/
│       ├── index.js
│       ├── db/db.js
│       ├── middleware/jwtUtils.js
│       └── routes/auth.js             ← เพิ่ม /register
│
├── task-service/
│   ├── Dockerfile
│   ├── package.json
│   ├── init.sql                       ← schema สำหรับ task-db
│   └── src/
│       ├── index.js
│       ├── db/db.js
│       ├── middleware/authMiddleware.js
│       ├── middleware/jwtUtils.js
│       └── routes/tasks.js
│
├── user-service/                      ← service ใหม่
│   ├── Dockerfile
│   ├── package.json
│   ├── init.sql                       ← schema สำหรับ user-db
│   └── src/
│       ├── index.js
│       ├── db/db.js
│       ├── middleware/authMiddleware.js
│       ├── middleware/jwtUtils.js
│       └── routes/users.js
│
├── frontend/
│   ├── index.html                     ← ปรับให้มี Register + ใช้ config.js
│   ├── profile.html                   ← หน้าดู/แก้ไข profile
│   └── config.js                      ← Service URLs
│
└── screenshots/
```

---

### รันระบบ

```bash
docker compose down -v
docker compose up --build
```

### เปิดใช้งานผ่าน Browser
- Frontend: `https://frontend-production-295d.up.railway.app/`
- Log Dashboard: `https://frontend-production-295d.up.railway.app/logs.html`

---

## Seed Users สำหรับทดสอบ

| Username | Email | Password | Role |
|---|---|---|---|
| alice | alice@lab.local | alice123 | member |
| bob | bob@lab.local | bob456 | member |
| admin | admin@lab.local | adminpass | admin |

---

## 9. API Summary

### Auth Service
- `POST /api/auth/login`
- `GET /api/auth/verify`
- `GET /api/auth/me`
- `GET /api/auth/health`

### Task Service
- `GET /api/tasks/health`
- `GET /api/tasks/`
- `POST /api/tasks/`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

### Log Service
- `POST /api/logs/internal`
- `GET /api/logs/`
- `GET /api/logs/stats`
- `GET /api/logs/health`

---

## 10. การทดสอบระบบ

### ตัวอย่างลำดับการทดสอบ
1. รัน `docker compose up --build`
2. เปิด `https://localhost`
3. Login ด้วย seed users
4. สร้าง task ใหม่
5. ดูรายการ task
6. แก้ไข task
7. ลบ task
8. ทดสอบกรณีไม่มี JWT → ต้องได้ `401`
9. ทดสอบ Log Dashboard
10. ทดสอบ rate limiting ของ login

### ตัวอย่าง curl
```bash
BASE="https://localhost"

TOKEN=$(curl -sk -X POST $BASE/api/auth/login   -H "Content-Type: application/json"   -d '{"email":"alice@lab.local","password":"alice123"}' |   python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

curl -sk $BASE/api/tasks/ -H "Authorization: Bearer $TOKEN"
```

---

## 11. Screenshots ที่แนบในงาน

โฟลเดอร์ `screenshots/` ของกลุ่มนี้ประกอบด้วยภาพดังต่อไปนี้

- ``
- `02_https_browser.png`
- `03_login_success.png`
- `04_login_fail.png`
- `05_create_task.png`
- `06_get_tasks.png`
- `07_update_task.png`
- `08_delete_task.png`
- `09_no_jwt_401.png`
- `10_logs_api.png`
- `11_rate_limit.png`
- `12_frontend_screenshot.png`

---

## 12. การแบ่งงานของทีม

รายละเอียดการแบ่งงานของสมาชิกอยู่ในไฟล์:

- `TEAM_SPLIT.md`

และรายงานรายบุคคลของสมาชิกแต่ละคนอยู่ในไฟล์:

- `INDIVIDUAL_REPORT_TEM.md`
- `INDIVIDUAL_REPORT_MATEE.md`

---

## 13. ปัญหาที่พบและแนวทางแก้ไข

> ให้กลุ่มสรุปปัญหาที่พบจริงระหว่างทำงาน เช่น

- ปัญหา seed users login ไม่ได้เพราะยังไม่ได้ generate bcrypt hash
- ปัญหา nginx route ไม่ตรง path ของ service
- ปัญหา JWT verification ระหว่าง services
- ปัญหา log dashboard ถูกจำกัดสิทธิ์ admin only
- ปัญหา Docker volume เก็บข้อมูลเดิมทำให้ seed ใหม่ไม่ทำงาน

---

## 14. ข้อจำกัดของระบบ

- ใช้ self-signed certificate สำหรับการพัฒนา ไม่เหมาะสำหรับ production จริง
- ใช้ shared database เพียง 1 ก้อน
- ยังไม่มีระบบ register
- logging เป็นแบบ lightweight ไม่ใช่ centralized observability platform เต็มรูปแบบ
- เหมาะสำหรับการเรียนรู้ architecture ระดับพื้นฐานและการต่อยอดไป Set 2

---

> เอกสารฉบับนี้เป็น README สำหรับงาน Final Lab Set 2 ของกลุ่ม และจัดทำเพื่อประกอบการส่งงานในรายวิชา ENGSE207 Software Architecture