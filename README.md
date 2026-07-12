# DVD架网站

## 每次要新增一部作品时怎么做

1. 把这部作品的两张图放进对应文件夹:
   - **碟片图**(圆形CD/DVD/Blu-ray照片，会显示在拨选界面上) → `images/spines/`，建议用 `.png`（如果碟片背景是透明的）
   - **背景大图**(点开/拨到这个作品时，全屏模糊显示的那张图，比如封面海报或剧照) → `images/covers/`
   - 文件名建议用英文/数字，比如 `movie-name-2024.png` / `movie-name-2024.jpg`

2. 打开 `data/dvds.json`，复制下面这一小段，粘贴进数组里（在最前面或最后面都可以），改成你的内容:

```json
{
  "id": "movie-name-2024",
  "title": "剧名",
  "role": "中村伦也饰演的角色名",
  "year": 2024,
  "disc": "images/spines/movie-name-2024.png",
  "cover": "images/covers/movie-name-2024.jpg",
  "interviews": [
    {
      "title": "采访标题",
      "date": "2024-05-01",
      "source": "杂志或网站名",
      "url": "https://example.com/interview",
      "excerpt": "采访摘录文字，会被搜索功能用到"
    }
  ]
}
```

> 注意：每一段之间要用英文逗号 `,` 隔开，最后一段后面不加逗号。如果不确定，可以把整个文件内容发给 Claude 帮你检查格式。

3. 保存文件，按下面「更新到网站」的步骤推送到 GitHub 即可。

## 更新到网站（推送到 GitHub）

在终端里，进入项目文件夹后依次执行:

```bash
git add .
git commit -m "新增作品：电影名"
git push
```

大概1分钟后，GitHub Pages 会自动更新，网站上就能看到新内容了。

## 关于日本IP屏蔽

`js/geoblock.js` 里做了一个前端检测，如果访客的IP归属地是日本，会盖一层提示遮罩。
但这**不是真正安全的屏蔽**——只要禁用JS、用VPN或直接看网页源代码都能绕过。
如果以后想要更可靠的屏蔽，需要买一个域名并接入 Cloudflare，用它的国家级访问规则来做（不影响现在的内容结构，随时可以升级）。
