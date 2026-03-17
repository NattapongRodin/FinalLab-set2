# INDIVIDUAL REPORT: NATTHAPHONG

## ข้อมูลผู้จัดทำ
- **ชื่อ-นามสกุล:** นัฐพงศ์ รอดอินทร์
- **รหัสนักศึกษา:** 67543210020-3
- **กลุ่ม:** s1-1

---

## ขอบเขตงานที่รับผิดชอบ
รับผิดชอบการพัฒนาส่วนหน้าบ้าน (Frontend) และตรรกะหลังบ้าน (Backend Logic) รวมถึงการออกแบบฐานข้อมูลทั้งหมดของระบบ Microservices ใน Set 2:
* **Frontend Development:** พัฒนา UI ให้รองรับระบบสมาชิกและการจัดการงาน
* **Backend Development:** เขียน Logic ส่วนของ Task Service และ User Service
* **Database Design:** ออกแบบและบริหารจัดการโครงสร้างตารางข้อมูล (Schema) ในทุก Service

---

## สิ่งที่ได้ดำเนินการด้วยตนเอง
1. **Frontend Enhancement:** ปรับปรุงหน้า Dashboard ให้สามารถแสดงข้อมูลแยกตาม User ID และพัฒนาฟอร์ม Register/Login ให้เชื่อมต่อกับ Gateway ได้อย่างถูกต้อง
2. **Service Logic Implementation:** พัฒนา Task Service สำหรับการทำ CRUD ข้อมูลงาน และ User Service สำหรับการจัดการข้อมูลโปรไฟล์ผู้ใช้งาน
3. **Database Schema Setup:** ออกแบบตารางใน `auth-db`, `task-db` และ `user-db` พร้อมเขียนไฟล์ `init.sql` เพื่อกำหนดค่าเริ่มต้น (Default Users & Tasks)
4. **API Gateway Configuration:** ตั้งค่า Nginx ให้ทำหน้าที่เป็น Reverse Proxy เพื่อรวมศูนย์ API ทุกตัวมาไว้ที่พอร์ต 8080 และแก้ไขปัญหาการเรียก URL ข้าม Service

---

## สิ่งที่ได้เรียนรู้จากงานนี้
* **Microservices Architecture:** เข้าใจการแยกฐานข้อมูลออกจากกัน (Database per Service) เพื่อลดการยึดติดกันของข้อมูล (Decoupling)
* **API Gateway Role:** ได้เรียนรู้ความสำคัญของ Nginx ในการจัดการเส้นทาง (Routing) และการแก้ปัญหาเรื่องพอร์ตที่ทับซ้อนกัน
* **State Management:** ฝึกการจัดการสถานะการเข้าสู่ระบบผ่าน JWT และการส่งค่า Token ไปพร้อมกับ Request ในทุกๆ Service

---

## ปัญหาที่พบและวิธีการแก้ไข



---