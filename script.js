// 旷野 - 上海露营地查找 JS

// 全局变量
let campsites = [];
let activeCard = null;

function loadData() {
  fetch("campsites.json")
    .then((r) => r.json())
    .then((data) => {
      campsites = data;
      renderCampsites(campsites);
    });
}

loadData();

const campList = document.getElementById("campList");
const searchInput = document.getElementById("searchInput");
const campCardTemplate = document.getElementById("campCardTemplate").content;

function getFacilityIcon(name) {
  const map = {
    bathroom: "fa-toilet",
    shower: "fa-shower",
    electricity: "fa-bolt",
    water: "fa-faucet",
    bbq: "fa-fire",
    shade: "fa-umbrella-beach",
    lifeguard: "fa-life-ring",
  };
  return map[name] || "fa-campground";
}

function calcDistance(lat1, lon1, lat2, lon2) {
  function toRad(v) { return (v * Math.PI) / 180; }
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

let userPos = null;
function locateUser() {
  if (!navigator.geolocation) return;
  
  // 先用默认位置渲染一次
  renderCampsites(campsites);
  
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userPos = [pos.coords.latitude, pos.coords.longitude];
      console.log("用户位置获取成功:", userPos);
      // 重新渲染带距离的列表
      renderCampsites(campsites);
      
      // 用户位置已获取完成
    },
    (error) => {
      console.warn("获取位置失败:", error.message);
      // 上海市中心坐标作为默认位置
      userPos = [31.2304, 121.4737];
      renderCampsites(campsites);
    },
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  );
}
locateUser();

function renderCampsites(list) {
  const container = document.getElementById("campList");
  
  // 清空旧内容，但保留标题
  const titleElement = container.querySelector('.results-title');
  container.innerHTML = '';
  container.appendChild(titleElement);
  
  // 更新结果数量
  document.getElementById("resultCount").textContent = list.length;

  // sort by distance if userPos available
  let displayList = [...list];
  if (userPos) {
    displayList.sort((a, b) =>
      calcDistance(userPos[0], userPos[1], a.latlng[0], a.latlng[1]) -
      calcDistance(userPos[0], userPos[1], b.latlng[0], b.latlng[1])
    );
  }

  displayList.forEach((camp) => {
    const card = campCardTemplate.cloneNode(true);
    card.querySelector(".camp-name").textContent = camp.name;
    card.querySelector(".camp-location").textContent = camp.location;

    // address
    card.querySelector(".camp-address").innerHTML = `<i class='fas fa-map-marker-alt'></i>&nbsp;${camp.address}`;

    // source & updated
    card.querySelector(".camp-source").textContent = camp.source || "来源未知";
    card.querySelector(".camp-updated").textContent = camp.updated || "--";

    // contact info
    if (camp.contact) {
      card.querySelector(".camp-contact").innerHTML = `<i class="fas fa-address-book"></i>&nbsp;${camp.contact}`;
    } else {
      card.querySelector(".camp-contact").textContent = "";
    }

    // distance display
    const distSpan = card.querySelector(".camp-distance");
    if (userPos) {
      const dist = calcDistance(userPos[0], userPos[1], camp.latlng[0], camp.latlng[1]);
      distSpan.textContent = `${dist.toFixed(1)} km`;
    } else {
      distSpan.textContent = "";
    }

    // icons row
    const iconLi = card.querySelector(".camp-icons");
    const priorityIcons = [];
    const otherIcons = [];
    camp.facilities.forEach((f) => {
      if (f === "fire") priorityIcons.push("<i class='fas fa-fire yes'></i>");
      else if (f === "overnight") priorityIcons.push("<i class='fas fa-moon yes'></i>");
      else otherIcons.push(`<i class='fas ${getFacilityIcon(f)}'></i>`);
    });
    const iconsArr = [...priorityIcons, ...otherIcons];
    iconLi.innerHTML = iconsArr.join(" ");

    // 卡片点击事件
    card.addEventListener("click", () => {
      // 移除旧高亮
      if (activeCard) activeCard.classList.remove("active");
      
      // 高亮当前卡片
      card.classList.add("active");
      activeCard = card;
      
      // 滚动到视图
      card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    campList.appendChild(card);
  });
}







// 搜索功能
const legendFilters = new Set();
function applyFilters(list) {
  let filtered = list;
  legendFilters.forEach((f) => {
    const [type, value] = f.split(":");
    if (type === "facility") filtered = filtered.filter((c) => c.facilities.includes(value));
  });
  return filtered;
}

function applySearch(list) {
  const keyword = searchInput.value.trim().toLowerCase();
  if (!keyword) return list;
  return list.filter((c) =>
    c.name.toLowerCase().includes(keyword) ||
    c.location.toLowerCase().includes(keyword)
  );
}

searchInput.addEventListener("input", (e) => {
  const result = applySearch(applyFilters(campsites));
  renderCampsites(result);
});

document.querySelectorAll(".legend-item").forEach((el) => {
  el.addEventListener("click", () => {
    const key = `${el.dataset.type}:${el.dataset.value}`;
    if (legendFilters.has(key)) {
      legendFilters.delete(key);
      el.classList.remove("active");
    } else {
      legendFilters.add(key);
      el.classList.add("active");
    }
    const result = applySearch(applyFilters(campsites));
    renderCampsites(result);
  });
});
