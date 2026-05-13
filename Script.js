const startButton = document.getElementById("startButton");
const startScreen = document.getElementById("start-screen");

const introMusic = document.getElementById("introMusic");
const worldSound = document.getElementById("worldSound");
const secretSound = document.getElementById("secretSound");

startButton.addEventListener("click", () => {

  introMusic.volume = 0.4;
  introMusic.play();

  startScreen.style.opacity = "0";

  setTimeout(() => {
    startScreen.style.display = "none";
  }, 1000);

});

/* ===================================== */
/* WORLD TRANSITIONS */
/* ===================================== */

const world1 = document.querySelector(".trigger-world1");
const world2 = document.querySelector(".trigger-world2");

let world1Played = false;
let world2Played = false;

const observer = new IntersectionObserver((entries) => {

  entries.forEach(entry => {

    if (entry.isIntersecting) {

      if (
        entry.target.classList.contains("trigger-world1")
        && !world1Played
      ) {

        worldSound.play();
        world1Played = true;

      }

      if (
        entry.target.classList.contains("trigger-world2")
        && !world2Played
      ) {

        worldSound.play();
        secretSound.play();

        world2Played = true;

      }

    }

  });

}, {
  threshold: 0.6
});

observer.observe(world1);
observer.observe(world2);