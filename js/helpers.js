import {
  defaulIcon,
  goToIcon,
  homeIcon,
  jobIcon,
  parkIcon,
} from "./constant.js";

// ! Tarih formatlayan fonksiyon
const formateDate = (date) => {
  // Fonksiyona  parametre olarak verilen parametreyi formatla
  const formatedDate = new Date(date).toLocaleDateString("tr", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Formatlanan date 'i return et
  return formatedDate;
};

// ! Status değerine göre karşılık veren fonksiyon
const setStatus = (status) => {
  switch (status) {
    case "goto":
      return "Ziyaret";

    case "park":
      return "Park";

    case "home":
      return "Ev";

    case "job":
      return "İş";

    default:
      return "Tanımsız Durum";
  }
};

// ! Note'un status'üne göre renderlanacak icon'a karar verecek fonksiyon
const getNoteIcon = (status) => {
  switch (status) {
    case "goto":
      return goToIcon;
    case "park":
      return parkIcon;
    case "home":
      return homeIcon;
    case "job":
      return jobIcon;
    default:
      return defaulIcon;
  }
};

export { formateDate, setStatus, getNoteIcon };
