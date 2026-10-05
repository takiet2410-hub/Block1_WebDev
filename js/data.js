/* Sửa file này để thay nội dung — UI tự cập nhật.
   Avatar: mặc định là nhân vật 3D (js/avatar3d.js) dựng theo color + id; image: "" giữ nguyên 3D,
   trỏ tới PNG nền trong suốt (tỉ lệ 4:5.2) nếu muốn thay bằng ảnh.
   photo: ảnh thật, hiện ở "PLAYER CARD" trong trang hồ sơ (để "" nếu không có).
   lv của skill: 1..5 (NOVICE → EXPERT). */

const TEAM = {
  name: "NULL POINTER",
  slogan: "4 developers. 0 exceptions.",
  intro: "Nhóm sinh viên 4 người, mỗi người một class, cùng build sản phẩm web từ ý tưởng đến lúc chạy thật.",
  values: [
    { key: "BUILD", text: "Làm ra sản phẩm chạy được" },
    { key: "LEARN", text: "Mỗi dự án học một thứ mới" },
    { key: "SHIP", text: "Đúng hạn, không bỏ dở" },
  ],
  mission: "Building digital experiences together.",
  quests: [
    { when: "Q1 · 2025", title: "PARTY FORMED", text: "4 người, 4 class, lập nhóm cho môn Web." },
    { when: "Q2 · 2025", title: "FIRST RAID", text: "Ship dự án chung đầu tiên đúng deadline." },
    { when: "Q4 · 2025", title: "LEVEL UP", text: "Mỗi người lên level kỹ năng chính, chia vai rõ ràng." },
    { when: "NOW", title: "NEW GAME+", text: "Portfolio này — và đang tìm quest tiếp theo." },
  ],
  email: "nullpointer@example.com",
};

const CHARACTERS = [
  {
    id: 1,
    codename: "ALEX",
    name: "Đào Duy Anh",
    role: "Front-end Developer",
    short: "FRONT-END",
    className: "Interface Ranger",
    color: "#22D3EE",
    image: "",
    photo: "img/duyanh.png",
    photoCaption: "Westminster, London",
    tagline: "Giao diện mượt, chạy tốt trên mọi màn hình.",
    bio: "Phụ trách giao diện và hiệu năng phía client.",
    focus: "UI ENG",
    github: "https://github.com/",
    email: "duyanh@example.com",
    stats: { CODE: 86, UI: 94, LOGIC: 72, TEAM: 90 },
    tree: [
      [{ name: "JavaScript", lv: 5, details: ["DOM & Events", "Async / Fetch"] }],
      [
        { name: "HTML / CSS", lv: 5, details: ["Grid & Flexbox", "Animation"] },
        { name: "React", lv: 4, details: ["Hooks", "Router"] },
      ],
      [
        { name: "Accessibility", lv: 3, details: ["ARIA", "Keyboard nav"] },
        { name: "Performance", lv: 3, details: ["Lighthouse", "Lazy load"] },
        { name: "GSAP", lv: 3, details: ["Timeline", "ScrollTrigger"] },
      ],
    ],
    projects: [
      { title: "Neon Store", rank: "S", short: "E-commerce SPA.", desc: "Shop một trang, lọc sản phẩm tức thì, Lighthouse 95+.", stack: ["HTML", "CSS", "JavaScript", "GSAP"], link: "#", image: "" },
      { title: "Weather HUD", rank: "A", short: "Dashboard thời tiết.", desc: "Dự báo 7 ngày bằng biểu đồ, có dark mode.", stack: ["React", "Chart.js"], link: "#", image: "" },
      { title: "Portfolio v1", rank: "B", short: "Portfolio đầu tay.", desc: "Trang tĩnh đầu tiên, nơi mọi thứ bắt đầu.", stack: ["HTML", "CSS"], link: "#", image: "" },
    ],
  },
  {
    id: 2,
    codename: "NOVA",
    name: "Nguyễn Tiến Phát",
    role: "Back-end Developer",
    short: "BACK-END",
    className: "System Architect",
    color: "#A855F7",
    image: "",
    tagline: "API gọn, database chắc, server không ngủ quên.",
    bio: "Giữ cho mọi thứ phía sau màn hình chạy ổn định.",
    focus: "API / DB",
    github: "https://github.com/",
    email: "tienphat@example.com",
    stats: { CODE: 93, UI: 48, LOGIC: 95, TEAM: 82 },
    tree: [
      [{ name: "Node.js", lv: 5, details: ["Event loop", "Streams"] }],
      [
        { name: "Express", lv: 4, details: ["Middleware", "Routing"] },
        { name: "Databases", lv: 4, details: ["PostgreSQL", "MongoDB"] },
      ],
      [
        { name: "REST API", lv: 5, details: ["Pagination", "OpenAPI"] },
        { name: "Auth", lv: 3, details: ["JWT", "OAuth 2.0"] },
        { name: "Docker", lv: 3, details: ["Compose", "Multi-stage"] },
      ],
    ],
    projects: [
      { title: "Quest API", rank: "S", short: "REST API quản lý task.", desc: "Xác thực JWT, phân quyền, có test tự động.", stack: ["Node.js", "Express", "PostgreSQL"], link: "#", image: "" },
      { title: "Chat Relay", rank: "A", short: "Server chat realtime.", desc: "WebSocket nhiều phòng, lưu lịch sử tin nhắn.", stack: ["Socket.IO", "Redis"], link: "#", image: "" },
    ],
  },
  {
    id: 3,
    codename: "IRIS",
    name: "Trần Đức Quý",
    role: "UI/UX Designer",
    short: "UI/UX",
    className: "Pixel Alchemist",
    color: "#F472B6",
    image: "",
    tagline: "Hiểu người dùng trước, vẽ pixel sau.",
    bio: "Lo design system, prototype và trải nghiệm người dùng.",
    focus: "PRODUCT",
    github: "https://github.com/",
    email: "ducquy@example.com",
    stats: { CODE: 58, UI: 97, LOGIC: 74, TEAM: 92 },
    tree: [
      [{ name: "Figma", lv: 5, details: ["Auto layout", "Components"] }],
      [
        { name: "Design System", lv: 4, details: ["Tokens", "Variants"] },
        { name: "User Research", lv: 4, details: ["Interview", "Usability test"] },
      ],
      [
        { name: "Prototyping", lv: 4, details: ["Smart animate", "User flow"] },
        { name: "Typography", lv: 3, details: ["Type scale", "Pairing"] },
        { name: "Motion", lv: 3, details: ["Easing", "Micro-interaction"] },
      ],
    ],
    projects: [
      { title: "Bloom App", rank: "S", short: "Redesign app chăm cây.", desc: "Thiết kế lại onboarding sau 12 buổi phỏng vấn người dùng.", stack: ["Figma", "Maze"], link: "#", image: "" },
      { title: "HUD Kit", rank: "A", short: "UI kit phong cách game.", desc: "60+ component, dùng cho chính portfolio này.", stack: ["Figma", "Tokens Studio"], link: "#", image: "" },
      { title: "Café Brand", rank: "B", short: "Nhận diện quán cà phê.", desc: "Logo, bảng màu và menu cho một quán địa phương.", stack: ["Illustrator", "Figma"], link: "#", image: "" },
    ],
  },
  {
    id: 4,
    codename: "ECHO",
    name: "Trần Anh Kiệt",
    role: "Data / AI Engineer",
    short: "DATA / AI",
    className: "Data Oracle",
    color: "#FB923C",
    image: "",
    tagline: "Biến dữ liệu lộn xộn thành insight rõ ràng.",
    bio: "Phụ trách pipeline dữ liệu, mô hình ML và trực quan hoá.",
    focus: "ML / BI",
    github: "https://github.com/",
    email: "anhkiet@example.com",
    stats: { CODE: 88, UI: 55, LOGIC: 96, TEAM: 80 },
    tree: [
      [{ name: "Python", lv: 5, details: ["NumPy", "Jupyter"] }],
      [
        { name: "Pandas", lv: 5, details: ["Cleaning", "Time series"] },
        { name: "Machine Learning", lv: 4, details: ["scikit-learn", "Evaluation"] },
      ],
      [
        { name: "SQL", lv: 4, details: ["Window functions", "CTE"] },
        { name: "Visualization", lv: 4, details: ["Matplotlib", "Power BI"] },
        { name: "Deep Learning", lv: 2, details: ["PyTorch", "CNN"] },
      ],
    ],
    projects: [
      { title: "Churn Radar", rank: "S", short: "Dự đoán khách rời bỏ.", desc: "Mô hình boosting kèm dashboard giải thích bằng SHAP.", stack: ["Python", "scikit-learn", "Streamlit"], link: "#", image: "" },
      { title: "Traffic Lens", rank: "A", short: "Phân tích giao thông.", desc: "2 triệu bản ghi, tìm giờ cao điểm, vẽ bản đồ nhiệt.", stack: ["Pandas", "SQL", "Power BI"], link: "#", image: "" },
    ],
  },
];