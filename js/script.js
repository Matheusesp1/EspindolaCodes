// ✏️ PERSONALIZE AQUI
const CONFIG = {
  whatsapp: "5527998814130", // TROCAR: DDI + DDD + número, só dígitos
  formEndpoint: "", // opcional: URL do Formspree. Vazio = envia pelo WhatsApp
};

const waLink = (text) =>
  `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;

// Todo elemento com data-wa vira um link para o WhatsApp com a mensagem escrita nele
document.querySelectorAll("[data-wa]").forEach((a) => {
  a.href = waLink(a.dataset.wa);
  a.target = "_blank";
  a.rel = "noreferrer";
});

// Ano do rodapé
document.getElementById("year").textContent = new Date().getFullYear();

// Menu do celular
const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");
menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  menuBtn.setAttribute("aria-expanded", open);
});
nav.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
  }),
);

// Animação discreta ao entrar na tela
const blocks = document.querySelectorAll(".section .container");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  blocks.forEach((el) => {
    el.classList.add("reveal");
    io.observe(el);
  });
}

// Formulário
const form = document.getElementById("contactForm");
const submitBtn = document.getElementById("submitBtn");
const formOk = document.getElementById("formOk");
const formFail = document.getElementById("formFail");
const hasBackend = Boolean(CONFIG.formEndpoint);

if (hasBackend) submitBtn.textContent = "Enviar mensagem";

function validate(v) {
  const e = {};
  if (v.name.trim().length < 2) e.name = "Informe seu nome.";
  if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = "Informe um e-mail válido.";
  if (!v.service) e.service = "Escolha um serviço.";
  if (v.message.trim().length < 10)
    e.message = "Escreva ao menos 10 caracteres.";
  return e;
}

form.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  formOk.hidden = true;
  formFail.hidden = true;

  const values = Object.fromEntries(new FormData(form));
  const errors = validate(values);
  ["name", "email", "service", "message"].forEach((f) => {
    document.getElementById("err-" + f).textContent = errors[f] || "";
  });
  if (Object.keys(errors).length) return;

  // Sem backend: abre o WhatsApp com a mensagem pronta (nada é "enviado" sem você ver)
  if (!hasBackend) {
    const text = `Olá! Meu nome é ${values.name} (${values.email}).\nServiço: ${values.service}\n${values.message}`;
    window.open(waLink(text), "_blank", "noreferrer");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando…";
  try {
    const res = await fetch(CONFIG.formEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(values),
    });
    if (!res.ok) throw new Error();
    formOk.hidden = false;
    form.reset();
  } catch {
    formFail.hidden = false;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar mensagem";
  }
});
