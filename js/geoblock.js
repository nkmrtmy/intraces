// ------------------------------------------------------------------
// 前端地区检测（尽力而为方案）
// 注意：这不是真正安全的屏蔽方式。纯静态网站没有服务器，
// 无法在网络层真正拒绝某个国家的访问。这段脚本只是：
// 1) 请求一个免费的IP归属地查询接口
// 2) 如果查到是日本(JP)，就用一层遮罩盖住内容
// 任何人只要禁用JS、使用VPN、或直接看源码，都能绕过这一层。
// 如果以后想要更可靠的方案，需要一个域名 + Cloudflare 的国家级
// 屏蔽规则（这个可以随时升级，不影响现在的内容和数据结构）。
// ------------------------------------------------------------------

(function () {
  const BLOCKED_COUNTRIES = ["JP"];

  function showBlockScreen() {
    document.getElementById("geoBlock").style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  fetch("https://ipapi.co/json/", { signal: controller.signal })
    .then((res) => res.json())
    .then((data) => {
      clearTimeout(timeout);
      if (data && BLOCKED_COUNTRIES.includes(data.country_code)) {
        showBlockScreen();
      }
    })
    .catch(() => {
      // 接口失败/超时时，默认不屏蔽（避免误伤所有访客）
      clearTimeout(timeout);
    });
})();
