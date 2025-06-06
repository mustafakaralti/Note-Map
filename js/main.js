// ! Kullanıcıdan konum bilgisi isteyen ve eğer konum paylaşırsa kullanıcı konumuna göre haritayı başlat eğer izin vermezse varsayılan konuma göre haritayı başlat

import { personIcon } from "./constant.js";
import { formateDate, getNoteIcon, setStatus } from "./helpers.js";
import uiElement from "./ui.js";

// * Global Değişkenelr
let clickedCoords;
let notes = JSON.parse(localStorage.getItem("notes")) || [];
let layer;
let map;

window.navigator.geolocation.getCurrentPosition(
  (e) => {
    loadMap([e.coords.latitude, e.coords.longitude]);
  },
  (e) => {
    loadMap([39.924771, 32.837034]);
  }
);

// ! Leaflet haritasının kurulumunu yapan fonksiyon
function loadMap(currentPosition) {
  // Haritanın kapsam kurulumu
  map = L.map("map", { zoomControl: false }).setView(currentPosition, 10);

  // Haritayı arayüze ekleme
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  // Harita'daki zoom control aracını konumla
  L.control.zoom({ position: "bottomright" }).addTo(map);

  // Kullanıcının başlangıç konumuna bir marker ekle
  L.marker(currentPosition, { icon: personIcon }).addTo(map);

  // Harita üzerine marker'ların ekleneceği bir layer ekle
  layer = L.layerGroup().addTo(map);

  // Harita üzerindeki tıklanma olaylarını izle
  map.on("click", onMapClick);

  // Notları render et
  renderNotes(notes);

  // Notlar için birer marker render et
  renderMarker(notes);
}

// ! Harita üzeirndeki tıklanma olaylarını izleyecek fonksiyon

function onMapClick(e) {
  // Tıklanılan noktanın kordinatlarına eriş
  clickedCoords = [e.latlng.lat, e.latlng.lng];

  // Aside kısmını ekleme moduna geçir
  uiElement.aside.classList.add("add");

  // aside içerisindeki title'ın içeriğini güncelle
  uiElement.asideTitle.textContent = "Yeni Not";
}

// ! Cancel Btn'e tıklanınca aside kısmını ekleme modundan çıkar
uiElement.cancelBtn.addEventListener("click", (e) => {
  // Aside kısmını ekleme modundan çıkarmak için add classını kaldır
  uiElement.aside.classList.remove("add");
  // Sayfa yenilemesini engelle
  e.preventDefault();
  // aside içerisindeki title'ın içeriğini eski haline getir
  uiElement.asideTitle.textContent = "Notlar";
});

// ! Formun gönderilmesini izle
uiElement.form.addEventListener("submit", (e) => {
  // Sayfa yenilemesini engelle
  e.preventDefault();

  // Input ve select kısmındaki değerlere eriş
  const title = e.target[0].value;
  const date = e.target[1].value;
  const status = e.target[2].value;

  // Eğer form doldurulmadıysa kullanıcıya uyarı ver
  if (!title || !date || !status) {
    alert("Lütfen formu eksiksiz şekilde doldurunuz!");

    return;
  }

  // Bir note objesi oluştur
  const noteObject = {
    id: new Date().getTime(),
    title,
    date,
    status,
    coords: clickedCoords,
  };

  // Elde edilen note elemanını notes dizisine kayıt et
  notes.push(noteObject);

  // localeStorage'ı güncelle
  localStorage.setItem("notes", JSON.stringify(notes));

  // Form'u resetle
  uiElement.form.reset();

  // aside içerisindeki title'ın içeriğini eski haline getir
  uiElement.asideTitle.textContent = "Notlar";

  // Aside kısmını eski haline getir
  uiElement.aside.classList.remove("add");

  // Notları render et
  renderNotes(notes);

  // Marker'ları render et
  renderMarker(notes);
});

// ! Note elemanı renderlayan fonksiyon
function renderNotes(notes) {
  // notes dizisindeki her elemanı dönerek bir html oluştur
  const notesHtml = notes
    .map(
      (note) => `        <li>
          <div>
            <h3>${note.title}</h3>
            <p>${formateDate(note.date)}</p>
            <p class="status">${setStatus(note.status)}</p>
          </div>
          <div class="icons">
            <i data-id='${
              note.id
            }' id="fly-btn"><i class="bi bi-airplane-fill"></i></i>
            <i data-id='${
              note.id
            }' id="delete-btn"><i class="bi bi-trash"></i></i>
          </div>
        </li>`
    )
    .join("");

  // Oluşturulan note elemanlarını aside kısmına aktar
  uiElement.noteList.innerHTML = notesHtml;

  // * delete-btn'lere eriş
  document.querySelectorAll("#delete-btn").forEach((icon) => {
    // Note'a ait id değerine eriş
    const id = +icon.dataset.id;

    // sil butonuna bir olay izleyicisi ekle
    icon.addEventListener("click", () => {
      deleteNote(id);
    });
  });

  // * edit-btn'lere eriş
  document.querySelectorAll("#fly-btn").forEach((btn) => {
    // Fly btn lerin id'sine eriş
    const noteId = +btn.dataset.id;
    // Fly btn'e bir olay izleyicisi ekle
    btn.addEventListener("click", () => {
      flyToNote(noteId);
    });
  });
}

// ! Mevcut notlar için marker renderlayan fonksiyon
function renderMarker(notes) {
  // Harita üzerindek marker'ları resetle
  layer.clearLayers();
  // notes dizisindeki her eleman için bir marker render et
  notes.map((note) => {
    // Renderlanacak icon'a karar ver
    const noteIcon = getNoteIcon(note.status);

    // Marker'ı render et
    L.marker(note.coords, { icon: noteIcon }).addTo(layer);
  });
}

// ! Note silecek fonksiyon
function deleteNote(id) {
  // Kullanıcıdan bir onay al
  const response = confirm("Not silme işlemini onaylıyor musunuz ?");

  // Eğer onay verdiyse  note sil
  if (response) {
    // Id'si bilinen notu notes dizisinden kaldır
    notes = notes.filter((note) => note.id != id);

    // localeStorage'ı güncelle
    localStorage.setItem("notes", JSON.stringify(notes));
    // note'ları render et
    renderNotes(notes);
    // marker'ları render et
    renderMarker(notes);
  }
}

// ! Note'a ucuş yapacak fonksiyon
function flyToNote(id) {
  // Id'si bilinen elemanın bilgilerine eriş
  const foundedNote = notes.find((note) => note.id == id);

  // Bulunan note'a uç
  map.flyTo(foundedNote.coords, 15);
}

// ! Hide modunu aktif edecek fonksiyon

uiElement.asideArrow.addEventListener("click", () => {
  uiElement.aside.classList.toggle("hide");
});
