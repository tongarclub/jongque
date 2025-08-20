# Page snapshot

```yaml
- heading "สมัครสมาชิก JongQue" [level=2]
- paragraph: ระบบจองคิวออนไลน์
- heading "สมัครสมาชิก" [level=3]
- text: ชื่อ-นามสกุล
- textbox "ชื่อ-นามสกุล"
- text: อีเมล
- textbox "อีเมล"
- text: เบอร์โทรศัพท์
- textbox "เบอร์โทรศัพท์"
- text: รหัสผ่าน
- textbox "รหัสผ่าน"
- text: ประเภทผู้ใช้
- combobox "ประเภทผู้ใช้":
  - option "ลูกค้า (จองคิว)" [selected]
  - option "เจ้าของร้าน"
- button "สมัครสมาชิก"
- text: หรือ
- button "สมัครด้วย Google":
  - img
  - text: สมัครด้วย Google
- button "สมัครด้วย Facebook":
  - img
  - text: สมัครด้วย Facebook
- button "สมัครด้วย LINE":
  - img
  - text: สมัครด้วย LINE
- paragraph:
  - text: มีบัญชีอยู่แล้ว?
  - link "เข้าสู่ระบบ":
    - /url: /auth/signin
- alert
```