# Setup local trên Windows (x64 / ARM64)

Website tĩnh HTML/CSS/JavaScript; không cần Node, npm, database hay quyền Administrator.
Yêu cầu Windows có PowerShell 5.1+ và internet trong lần setup đầu.

## Máy mới hoặc đường dẫn mới

1. Clone repo, hoặc tải ZIP trên GitHub và giải nén.
2. Mở thư mục repo, nhấp đúp **start-local.cmd**.
3. Lần đầu script tải Caddy 2.11.7 từ GitHub chính thức, kiểm tra SHA512 rồi lưu vào `.local/caddy/` trong repo. Các lần sau dùng lại bản đã tải.
4. Trình duyệt mở `http://localhost:8080`. Nếu cổng bận, script chọn cổng trống trong khoảng 8080-8100 và in URL thực tế ở terminal.
5. Giữ terminal mở; nhấn **Ctrl+C** để dừng.

Không có đường dẫn tuyệt đối trong cấu hình. Script luôn lấy thư mục của chính nó làm thư mục chạy, kể cả khi được gọi từ thư mục khác hoặc đường dẫn có dấu cách.
Khi đổi máy/kiến trúc CPU, chỉ mang source và các file setup; để script tải lại Caddy.
`.local/` chứa binary, dữ liệu runtime và file tải tạm, được Git bỏ qua.

Nếu dùng Git, mở PowerShell tại thư mục bạn muốn lưu dự án:

```powershell
git clone https://github.com/takiet2410-hub/Block1_WebDev.git
cd Block1_WebDev
.\start-local.cmd
```

Nhớ đưa các file `Caddyfile`, `start-local.ps1`, `start-local.cmd`, `.gitignore` và tài liệu này lên repo hoặc mang theo cùng source trước khi chuyển máy.

## Tùy chọn

```powershell
# Chỉ tải Caddy và kiểm tra cấu hình
.\start-local.cmd -SetupOnly

# Chỉ định cổng (báo lỗi nếu cổng này đang bận)
.\start-local.cmd -Port 9000

# Chạy mà không tự mở trình duyệt
.\start-local.cmd -NoBrowser
```

Launcher dùng ExecutionPolicy Bypass cho riêng tiến trình PowerShell này, không đổi policy hệ thống.
Máy có policy tổ chức chặn script cần được quản trị viên cho phép.

## Sửa code, cập nhật và cấu hình

- Nội dung thành viên: `js/data.js`.
- Giao diện: `css/style.css`.
- Logic: `js/app.js`.

Lưu rồi refresh trình duyệt; Ctrl+F5 nếu còn cache. Không cần restart khi sửa source.
Sau khi sửa Caddyfile, Ctrl+C rồi chạy lại launcher. Admin API được tắt.

```powershell
git pull --ff-only
```

Nếu Git báo thay đổi local, commit hoặc stash thay đổi trước khi pull.
Nếu download thất bại, kiểm tra internet/proxy và chạy launcher lại.
Nếu chuyển từ máy x64 sang ARM64, xóa `.local/caddy/caddy.exe` cũ rồi chạy lại.

Caddy chỉ lắng nghe trên 127.0.0.1, dùng HTTP local và không cần chứng chỉ.
Các thư mục Git/runtime và file setup bị chặn truy cập HTTP.
Google Fonts và Three.js vẫn tải từ CDN: cần internet để tải font/3D;
avatar có SVG fallback khi CDN/WebGL không khả dụng.

Tài liệu Caddy: https://caddyserver.com/docs/quick-starts/static-files
