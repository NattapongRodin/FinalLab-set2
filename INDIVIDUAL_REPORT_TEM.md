# INDIVIDUAL REPORT: TAIPHOB

## ข้อมูลผู้จัดทำ
* **ชื่อ-นามสกุล:** ไตรภพ ก๋องใจ
* **รหัสนักศึกษา:** 67543210017-9
* **กลุ่ม:** S1-1

---

## ขอบเขตงานที่รับผิดชอบ
รับผิดชอบดูแลภาพรวมของระบบในส่วนของ **Quality Assurance (QA)** และ **DevOps** โดยเน้นไปที่การตรวจสอบความถูกต้องก่อนใช้งานจริงและการนำระบบขึ้นสู่ Cloud Production:
* **System Testing:** ทดสอบระบบการทำงานผ่าน Docker ภายในเครื่อง (Local) ก่อนทำการ Deployment
* **Railway Deployment:** ดำเนินการนำ Dockerized Services ทั้งหมดขึ้นไปรันบนแพลตฟอร์ม Railway
* **Infrastructure Management:** บริหารจัดการตัวแปรสภาพแวดล้อม (Environment Variables) และการเชื่อมต่อระหว่างฐานข้อมูลกับ Backend

---

## สิ่งที่ได้ดำเนินการด้วยตนเอง
1. **Local System Validation:** ตรวจสอบความพร้อมของ Container ทุกตัว (Auth, User, Task, Log) ด้วยคำสั่ง `docker logs` และ `docker ps` เพื่อให้มั่นใจว่าระบบไม่มีข้อผิดพลาดก่อน Deploy
2. **Railway Integration:** ตั้งค่าโปรเจกต์บน Railway และทำการเชื่อมโยง GitHub Repository เพื่อทำ CI/CD 
3. **Environment Configuration:** ตั้งค่าตัวแปรสำคัญ เช่น `DATABASE_URL`, `JWT_SECRET` และพอร์ตต่างๆ ในหน้า Dashboard ของ Railway เพื่อให้แต่ละ Service คุยกันได้
4. **End-to-End Testing:** ทดสอบการไหลของข้อมูลจริง ตั้งแต่การสมัครสมาชิกบนหน้าเว็บ ไปจนถึงการจัดเก็บข้อมูลลงใน Database บน Cloud

---

## สิ่งที่ได้เรียนรู้จากงานนี้
* **Cloud Orchestration:** ได้เรียนรู้วิธีการจัดการ Microservices หลายตัวบนระบบ Cloud จริงๆ ซึ่งมีความซับซ้อนกว่าการรันในเครื่อง
* **Security & Environment:** เข้าใจความสำคัญของ Environment Variables ในการรักษาความลับของระบบ (เช่น รหัสผ่าน DB และ JWT Secret)
* **Docker Workflow:** ได้ฝึกทักษะการแก้ปัญหาผ่าน Docker Logs เพื่อวิเคราะห์สาเหตุที่ทำให้ Service พังหรือเชื่อมต่อกันไม่ได้

---

## ปัญหาที่พบและวิธีการแก้ไข

### **ปัญหาที่ 1: การเชื่อมต่อ Database บน Railway**
* **สาเหตุ:** ตัวแปร `DB_HOST` ที่เคยใช้เป็นชื่อ Service ใน Docker (เช่น `auth-db`) ไม่สามารถใช้บน Cloud ได้โดยตรง
* **การแก้ไข:** เปลี่ยนไปใช้ `DATABASE_URL` ที่ระบบ Railway เจนเนอเรตมาให้แทน ซึ่งรวมเอาทั้ง Host, User, และ Password ไว้ในที่เดียว

### **ปัญหาที่ 2: JWT Invalid Signature**
* **สาเหตุ:** ค่า `JWT_SECRET` ในแต่ละ Service (เช่น Auth และ Task) ตั้งค่าไว้ไม่ตรงกัน ทำให้เมื่อถือ Token จาก Service หนึ่งไปใช้อีก Service หนึ่งแล้วถูกปฏิเสธ
* **การแก้ไข:** กำหนดค่า Secret ให้เป็นค่าเดียวกันทั้งหมดในหน้า Environment Variables ของ Railway


---