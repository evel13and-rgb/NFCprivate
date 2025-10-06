const QUOTES = [
  {
    t: "Siento como si me hubiesen robado algo esencial y no sé qué es.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "Soy del tamaño de lo que veo, no del tamaño de mi estatura.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "Todo me cansa, hasta aquello que no me cansa.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "No soy nada. Nunca seré nada. No puedo querer ser nada. Aparte de eso, tengo en mí todos los sueños del mundo.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "La tristeza es un hábito que se me ha hecho carne.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "Vivir es ser otro. Ni sentir es posible si hoy se siente como ayer se sintió.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "La vida es lo que hacemos de ella. Los viajes son los viajeros. Lo que vemos no es lo que vemos, sino lo que somos.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "Sueño porque no puedo vivir.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "Tengo, en efecto, el alma de una marioneta filosófica.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "Nada me une a nada. Quiero veinte cosas al mismo tiempo y no deseo ninguna.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "Mi alma es como una orquesta oculta; no sé qué instrumentos tocan ni qué música producen.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "Soy como una habitación con muchos espejos que se reflejan en espejos; en cada uno me veo diferente, y la imagen de todos esos reflejos soy yo.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "He llegado a un punto donde ya no me interesa ser comprendido: me basta con ser.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "Todo esfuerzo es un error; toda acción es una derrota.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "No pertenezco a nada. Ni siquiera a la indiferencia a la que pertenezco.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "Mi deseo es huir, pero no sé de qué; mi deseo es buscar, pero no sé qué.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "Sufro de una lucidez que me impide ser contento.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "A veces siento un cansancio tan profundo que no tengo ni siquiera ganas de soñar.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "Hay un cansancio del alma más terrible que el del cuerpo: el cansancio de no querer nada.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "La monotonía del ser es un mar sin olas.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "El tedio es la sensación física del tiempo que pasa lentamente.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "Lo que en mí siente está pensando.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "El insomnio de mi alma tiene los ojos abiertos y ve siempre lo mismo.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "No sé quién soy: no sé qué alma tengo.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "Soy un paisaje de dentro.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "La lucidez me devora como una llama interior.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "La soledad no es estar solo, es estar vacío.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "Hay momentos en que todo me parece un decorado; incluso yo.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "La vida es una posada en la que debo esperar hasta que me llamen del abismo.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "No me duele la vida; me duele la conciencia de vivir.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  }
];

let lastQuoteIndex = null;

function pickRandomQuote() {
  if (QUOTES.length === 0) {
    return null;
  }

  let index = Math.floor(Math.random() * QUOTES.length);
  if (QUOTES.length > 1 && index === lastQuoteIndex) {
    index = (index + 1 + Math.floor(Math.random() * (QUOTES.length - 1))) % QUOTES.length;
  }

  lastQuoteIndex = index;
  return { ...QUOTES[index], idx: index };
}

let currentQuote = null;
let voicesReady = false;

// Selecciona la voz más fluida disponible
function getPreferredVoice() {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find(v => v.lang.startsWith("es") && v.name.includes("Google")) ||
    voices.find(v => v.lang.startsWith("es") && v.name.includes("Microsoft Sabina")) ||
    voices.find(v => v.lang.startsWith("es"))
  );
}

function normalizeSentence(text, isLast) {
  const trimmed = text.trim();
  if (!trimmed) {
    return "";
  }
  if (isLast || /[.!?…]$/.test(trimmed)) {
    return trimmed;
  }
  return `${trimmed}.`;
}

function buildSpeechText(quote) {
  const parts = [quote.t, quote.a, quote.obra].filter(Boolean);
  return parts
    .map((part, index) => normalizeSentence(part, index === parts.length - 1))
    .filter(Boolean)
    .join(" ");
}

function speakQuote(quote) {
  if (!voicesReady) {
    setTimeout(() => speakQuote(quote), 200);
    return;
  }
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  const utter = new window.SpeechSynthesisUtterance(buildSpeechText(quote));
  const preferred = getPreferredVoice();
  if (preferred) {
    utter.voice = preferred;
    utter.lang = preferred.lang;
  } else if (quote.lang) {
    utter.lang = quote.lang.startsWith("es") ? "es-ES" : quote.lang;
  } else {
    utter.lang = "es-ES";
  }
  window.speechSynthesis.speak(utter);
}

function renderQuote() {
  const nextQuote = pickRandomQuote();
  if (!nextQuote) {
    return;
  }

  currentQuote = nextQuote;
  document.getElementById("quote").textContent = "“" + currentQuote.t + "”";
  renderAttribution(currentQuote);
}

function renderAttribution(quote) {
  const container = document.getElementById("author");
  const nameEl = document.getElementById("author-name");
  const workEl = document.getElementById("author-work");
  const separatorEl = document.getElementById("author-separator");

  if (!container || !nameEl || !workEl || !separatorEl) {
    return;
  }

  const hasAuthor = Boolean(quote.a);
  const hasWork = Boolean(quote.obra);

  if (hasAuthor) {
    nameEl.textContent = `— ${quote.a}`;
    nameEl.style.display = "inline";
  } else {
    nameEl.textContent = "";
    nameEl.style.display = "none";
  }

  if (hasWork) {
    workEl.textContent = quote.obra;
    workEl.style.display = "inline";
  } else {
    workEl.textContent = "";
    workEl.style.display = "none";
  }

  separatorEl.style.display = hasAuthor && hasWork ? "inline" : "none";

  if (!hasAuthor && !hasWork) {
    container.setAttribute("aria-hidden", "true");
  } else {
    container.removeAttribute("aria-hidden");
  }
}

function initApp() {
  renderQuote();
  const card = document.getElementById("card");
  if (card) {
    card.addEventListener("click", () => {
      if (currentQuote) {
        speakQuote(currentQuote);
      }
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (currentQuote) {
          speakQuote(currentQuote);
        }
      }
    });
  }
}

// Espera a que las voces estén listas antes de permitir hablar
window.speechSynthesis.onvoiceschanged = () => {
  voicesReady = true;
};

document.addEventListener("DOMContentLoaded", () => {
  if (window.speechSynthesis.getVoices().length > 0) {
    voicesReady = true;
  }
  initApp();
});
