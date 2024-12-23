("use strict");

gsap.registerPlugin(Observer);

// Отримуємо всі секції та зображення
let sections = document.querySelectorAll("section"),
  images = document.querySelectorAll(".bg"),
  outerWrappers = gsap.utils.toArray(".outer"),
  innerWrappers = gsap.utils.toArray(".inner"),
  currentIndex = -1,
  wrap = gsap.utils.wrap(0, sections.length),
  animating;

gsap.set(outerWrappers, { yPercent: 100 });
gsap.set(innerWrappers, { yPercent: -100 });

function gotoSection(index, direction) {
  index = wrap(index); // Перевіряємо, чи індекс є допустимим
  animating = true;

  let fromTop = direction === -1,
    dFactor = fromTop ? -1 : 1,
    tl = gsap.timeline({
      defaults: { duration: 1.25, ease: "power1.inOut" },
      onComplete: () => (animating = false),
    });

  if (currentIndex >= 0) {
    // Якщо це не перший запуск, приховуємо попередню секцію та зображення
    gsap.set(sections[currentIndex], { zIndex: 0 });
    tl.to(images[currentIndex], { yPercent: -15 * dFactor }).set(
      sections[currentIndex],
      { autoAlpha: 0 }
    );

    // Якщо є відео в попередній секції, ставимо його на паузу
    let prevVideo = sections[currentIndex].querySelector("video");
    if (prevVideo) {
      prevVideo.pause();
    }
  }

  // Показуємо поточну секцію та зображення
  gsap.set(sections[index], { autoAlpha: 1, zIndex: 1 });
  tl.fromTo(
    [outerWrappers[index], innerWrappers[index]],
    {
      yPercent: (i) => (i ? -100 * dFactor : 100 * dFactor),
    },
    {
      yPercent: 0,
    },
    0
  ).fromTo(images[index], { yPercent: 15 * dFactor }, { yPercent: 0 }, 0);

  // Відтворюємо відео в поточній секції
  let currentVideo = sections[index].querySelector("video");
  if (currentVideo) {
    setTimeout(() => {
      currentVideo.currentTime = 0;
      currentVideo.play();
    }, "600");
  }

  let currentAudio = sections[index].querySelector("audio");
  if (currentAudio) {
    setTimeout(() => {
      currentAudio.currentTime = 0;
      currentAudio.muted = true;
      currentAudio.play();
    }, "600");
  }

  // Відображаємо кнопку скролу у поточній секції
  let scrollBtn = sections[index].querySelector(".scroll");
  if (scrollBtn) {
    let delay = parseInt(scrollBtn.getAttribute("data-delay")) || 5000;
    setTimeout(() => {
      scrollBtn.style.display = "block";
    }, delay);
  }

  currentIndex = index;
}

// Створюємо обсервер для керування скролом
Observer.create({
  type: "wheel,touch,pointer",
  wheelSpeed: -1,
  onDown: () => !animating && gotoSection(currentIndex - 1, -1),
  onUp: () => !animating && gotoSection(currentIndex + 1, 1),
  tolerance: 10,
  preventDefault: true,
});

gotoSection(0, 1); // Запуск з першої секції

// Support form pop-up
let openPopupBtn = document.getElementById("openPopup");
let popupForm = document.getElementById("popupForm");
let popupClose = document.getElementById("popupClose");

openPopupBtn.addEventListener("click", function () {
  popupForm.style.display = "flex";
});
popupClose.addEventListener("click", function () {
  popupForm.style.display = "none";
});

// form test
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("supportForm")) {
    document
      .getElementById("supportForm")
      .addEventListener("submit", function (event) {
        event.preventDefault();

        var formData = new FormData(this);
        var queryString = new URLSearchParams(formData).toString();

        fetch("http://localhost:3002/forms", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: queryString,
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Ошибка: ${response.status}`);
            }
            return response.text();
          })
          .then(() => {
            // Показать сообщение об успешной отправке
            document.getElementById("successMessage").style.display = "block";
            document.getElementById("someErrorMessage").style.display = "none";
            document.getElementById("limitErrorMessage").style.display = "none";
            document.getElementById("myForm").style.display = "none";
          })
          .catch((error) => {
            console.error("Ошибка:", error);
            // необхідно в залежності від помилка далі виводити
            // якщо номер вже приймав участь сьогодні
            document.getElementById("limitErrorMessage").style.display =
              "block";
            // інша помилка серверу
            document.getElementById("someErrorMessage").style.display = "block";

            document.getElementById("successMessage").style.display = "none";
            document.getElementById("myForm").style.display = "none";
          });
        return false;
      });
  }
});
