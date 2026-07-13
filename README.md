# 使用说明

## 本地预览

```bash
cd 项目文件夹
python3 -m http.server 8000
```

浏览器打开 `http://localhost:8000`

## 编辑内容

同样先起本地服务器，用 Chrome 打开 `http://localhost:8000/uploader.html`，选择项目文件夹后，按界面上的四个模式操作：新增 / 修改 / 删除碟片 / 删除采访。均按编号（uid）操作。

## 同步到线上

```bash
git add .
git commit -m "update"
git push
```
