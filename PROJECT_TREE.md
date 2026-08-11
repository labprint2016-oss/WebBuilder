# Web-Builder — Project Tree

ไฟล์นี้สรุปโครงสร้างโปรเจกต์เพื่อใช้อ้างอิงขณะพัฒนา  
อัปเดตล่าสุด: **2026-07-29**

## หมายเหตุ

- **ไม่รวม** `node_modules/`, `dist/`, `.git/`, `.DS_Store`
- โฟลเดอร์ `Server/uploads/` มีไฟล์อัปโหลดจริงหลายไฟล์ — ใน tree ด้านล่างย่อเป็น `(ไฟล์อัปโหลด …)`
- โปรเจกต์แยกแพ็กเกจ: รัน client ที่ `client/`, server ที่ `Server/` (ไม่มี `package.json` ที่ราก)

---

```
Web-Builder/
├── docker-compose.yml          # mongo, backend, vite, nginx
│
├── client/                     # React 19 + Vite 7
│   ├── Content/                # โมดูลคอนเทนต์ตาม id (ชื่อไฟล์แบบวันที่)
│   ├── Functions/              # axios → /api (pages, theme, hero, menuBar, forms, media)
│   ├── Main/
│   ├── Navbar/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/         # Task* / DropArea / Tag (ทดลองหรือส่วนเสริม)
│   │   ├── SVG/                # โฟลเดอร์ว่าง (มีไว้เก็บ asset)
│   │   ├── Builder/
│   │   │   ├── Layouts/
│   │   │   │   ├── Elements/
│   │   │   │   │   ├── Button.jsx
│   │   │   │   │   ├── ButtonGroup.jsx
│   │   │   │   │   ├── Gallery.jsx
│   │   │   │   │   ├── Heading.jsx
│   │   │   │   │   ├── Icon.jsx
│   │   │   │   │   ├── Image.jsx
│   │   │   │   │   ├── List.jsx
│   │   │   │   │   ├── Text.jsx
│   │   │   │   │   └── Youtube.jsx
│   │   │   │   ├── Conlumn.jsx
│   │   │   │   ├── Container.jsx
│   │   │   │   ├── Element.jsx
│   │   │   │   ├── MiniSpan.jsx
│   │   │   │   └── Span.jsx
│   │   │   ├── Offcanvas/
│   │   │   │   ├── column.jsx
│   │   │   │   ├── container.jsx
│   │   │   │   ├── header.jsx
│   │   │   │   ├── menuBar.jsx
│   │   │   │   ├── miniSpan.jsx
│   │   │   │   ├── span.jsx
│   │   │   │   └── topBar.jsx
│   │   │   ├── Services/
│   │   │   │   └── ServiceLayout.jsx
│   │   │   ├── content.jsx
│   │   │   ├── contentTest.jsx
│   │   │   ├── header.jsx
│   │   │   ├── heroData.jsx
│   │   │   ├── heroDesign.jsx
│   │   │   ├── heroSlider.jsx
│   │   │   ├── IconAwsome.jsx
│   │   │   ├── IconList.jsx
│   │   │   ├── Icons.jsx
│   │   │   ├── imageModal.jsx
│   │   │   ├── keepHeroDesign.jsx
│   │   │   ├── main.jsx              # entry หลักของ Builder UI
│   │   │   ├── menu.jsx
│   │   │   ├── navbar.jsx
│   │   │   ├── Service.jsx
│   │   │   ├── ServiceIcon.jsx
│   │   │   ├── ServicePage.jsx
│   │   │   ├── ServiceSelectPage.jsx
│   │   │   └── forms.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── builder.jsx
│   │   ├── IconLucide.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── test.jsx
│   ├── Dockerfile
│   ├── eslint.config.js
│   ├── function.jsx
│   ├── index.html
│   ├── navbar.txt
│   ├── nginx.conf
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── README.md
│   ├── tailwind.config.mjs
│   └── vite.config.js              # proxy /api → backend (Docker: backend:5000)
│
└── Server/                         # Express 5 + Mongoose
    ├── Config/
    │   └── connect.js
    ├── Controllers/
    │   ├── forms.js
    │   ├── hero.js
    │   ├── menuBar.js
    │   ├── pages.js
    │   └── theme.js
    ├── MiddleWare/
    │   ├── manageImg.js
    │   └── manageImgForBuilder.js
    ├── Models/
    │   ├── forms.js
    │   ├── hero.js
    │   ├── menuBar.js
    │   ├── pages.js
    │   └── theme.js
    ├── Routes/                     # auto-mount ภายใต้ /api ใน server.js
    │   ├── forms.js
    │   ├── hero.js
    │   ├── menuBar.js
    │   ├── page.js
    │   ├── media.js
    │   └── theme.js
    ├── uploadForBuilder/
    ├── uploads/                    # (ไฟล์อัปโหลด — ไม่แสดงรายชื่อ)
    ├── Dockerfile
    ├── element.js
    ├── package.json
    ├── package-lock.json
    └── server.js                   # พอร์ต 5000, MONGO_URL, static /uploads
```

## Flow สั้นๆ

| ชั้น | บทบาท |
|-----|--------|
| `client/src/App.jsx` | `/*` → `Builder/main.jsx`, `/test` → `test.jsx` |
| `client/Functions/*.jsx` | เรียก REST ผ่าน `baseURL: "/api"` |
| `Server/server.js` | โหลดทุกไฟล์ใน `Routes/` → prefix `/api` |
| `docker-compose.yml` | Mongo + backend + Vite + Nginx |

---

หากโครงสร้างเปลี่ยนมาก ให้รันสคริปต์สร้าง tree ใหม่หรือแก้ไฟล์นี้ให้ตรงกับ workspace
