emailjs.init("c77Zt71qTwoQxpS3p");

const form = document.getElementById("contact-form");
const body = document.body;

form.addEventListener("submit", function (e) {
  e.preventDefault();

  emailjs
    .sendForm("service_74wnr7k", "template_wyg903j", this)
    .then(() => {
      const div = document.createElement("div");
      div.setAttribute(
        "style",
        "background: #28a745; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-top: 10px;"
      );
      div.innerHTML =
        "c'est cool mon brave , je suis dans mon caleche j'arrive !";

      form.parentNode.insertBefore(div, form);

      setTimeout(() => {
        div.remove();
      }, 3000);

      this.reset();
    })
    .catch((err) => {
      console.error("Erreur:", err);
      const div = document.createElement("div");
      div.className = "rounded-1 bg-danger text-white p-3 mt-3 text-center";
      div.innerHTML = "Une erreur est survenue. Réessaie plus tard.";

      form.parentNode.insertBefore(div, form);

      setTimeout(() => {
        div.remove();
      }, 3000);
    });
});
