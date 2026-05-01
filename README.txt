======== cách chạy đồ án =========
kết nối server sql
bật 2 terminal
1. terminal cd vào folder InteractHub 
- chạy file program.cs bằng lệnh dotnet run
- bấm vào link / swagger để xem giao diện swagger
=> Backend chạy tại Swagger
2. terminal cd vào folder InteractHub-Frontend
- chạy lệnh
npm install (chạy lần đầu thôi, mấy lần sau k cần)
npm run dev
- Sau khi chạy thành công: truy cập:
http://localhost:5173 để mở giao diện web
=> Frontend hiển thị giao diện

===chạy lại migration===
dotnet ef database drop
dotnet ef database update

=== quy trình chuẩn sau khi pull về, nếu database có sửa đổi như thêm bảng, thêm cột===
git pull
sửa các file bị conflict
dotnet ef migrations add AddSharedPostToPost (Thêm cột sharePost)
dotnet ef database update (để cập nhật sql)
dotnet run
npm run dev