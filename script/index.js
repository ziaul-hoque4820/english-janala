/* ENGLISH JANALA  */

// ---- DOM references ----
const $ = (id) => document.getElementById(id);
const levelContainer  = $("level-container");
const wordContainer   = $("word-container");
const spinnerSection  = $("spinner");
const modal           = $("word_modal");
const detailsContainer = $("details-container");
const searchInput     = $("input-search");
const searchBtn       = $("btn-search");
const modalClose      = $("modal-close");
const navbar          = $("navbar");
const hamburger       = $("hamburger");
const mobileMenu      = $("mobile-menu");
const toast           = $("toast");

// ---- API base ----
const API = "https://openapi.programming-hero.com/api";

// ---- State ----
let activeLesson = null;

/* UTILITY FUNCTIONS */

// Show / hide spinner
const showSpinner = (show) => {
  spinnerSection.classList.toggle("hidden", !show);
  wordContainer.classList.toggle("hidden", show);
};

// Toast notification
let toastTimer;
const showToast = (msg) => {
  toast.textContent = msg;
  toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add("hidden"), 2500);
};

// Remove active class from all lesson buttons
const clearActiveLesson = () => {
  document.querySelectorAll(".lesson-btn")
    .forEach(btn => btn.classList.remove("active"));
};

// Text to speech
const pronounceWord = (word) => {
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};

/* DATA FETCHING */

// Generic fetch helper
const fetchData = async (url) => {
  const res  = await fetch(url);
  const json = await res.json();
  return json.data;
};

// Load all lessons
const loadLessons = async () => {
  try {
    const lessons = await fetchData(`${API}/levels/all`);
    renderLessons(lessons);
  } catch {
    showToast("⚠️ Lessons লোড হয়নি। আবার চেষ্টা করুন।");
  }
};

// Load words for a lesson
const loadLevelWord = async (id) => {
  showSpinner(true);
  try {
    const words = await fetchData(`${API}/level/${id}`);
    clearActiveLesson();
    const activeBtn = $(`lesson-btn-${id}`);
    if (activeBtn) activeBtn.classList.add("active");
    activeLesson = id;
    renderWords(words);
  } catch {
    showToast("⚠️ শব্দ লোড হয়নি। আবার চেষ্টা করুন।");
    showSpinner(false);
  }
};

// Load single word details
const loadWordDetail = async (id) => {
  try {
    const word = await fetchData(`${API}/word/${id}`);
    renderWordModal(word);
  } catch {
    showToast("⚠️ বিস্তারিত লোড হয়নি।");
  }
};

/* RENDER FUNCTIONS */

// Render lesson buttons
const renderLessons = (lessons) => {
  levelContainer.innerHTML = "";
  lessons.forEach(({ level_no }) => {
    const btn = document.createElement("button");
    btn.id        = `lesson-btn-${level_no}`;
    btn.className = "lesson-btn";
    btn.innerHTML = `<i class="fa-solid fa-book-open"></i> Lesson ${level_no}`;
    btn.onclick   = () => loadLevelWord(level_no);
    levelContainer.appendChild(btn);
  });
};

// Render word cards
const renderWords = (words) => {
  wordContainer.innerHTML = "";

  if (!words.length) {
    wordContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">😔</div>
        <p class="font-bangla empty-sub">এই Lesson এ এখনো কোন Vocabulary যুক্ত করা হয়নি।</p>
        <h2 class="font-bangla empty-title">নেক্সট Lesson এ যান</h2>
      </div>`;
    showSpinner(false);
    return;
  }

  words.forEach((word, i) => {
    const card = document.createElement("div");
    card.className = "word-card";
    card.style.animationDelay = `${i * 0.05}s`;

    const wordText  = word.word        || "N/A";
    const meaning   = word.meaning     || "অর্থ পাওয়া যায়নি";
    const phonetic  = word.pronunciation || "—";

    card.innerHTML = `
      <div class="word-card-header">
        <h2 class="word-title">${wordText}</h2>
        <span class="word-badge">vocab</span>
      </div>
      <div class="word-meaning font-bangla">${meaning}</div>
      <div class="word-pronunciation">
        <i class="fa-solid fa-microphone-lines"></i>
        <span>/${phonetic}/</span>
      </div>
      <div class="word-actions">
        <button class="btn-action" onclick="loadWordDetail(${word.id})" title="বিস্তারিত দেখুন">
          <i class="fa-solid fa-circle-info"></i> Details
        </button>
        <button class="btn-action btn-primary-action" onclick="handleSpeak(this, '${wordText}')" title="উচ্চারণ শুনুন">
          <i class="fa-solid fa-volume-high"></i> Speak
        </button>
      </div>`;
    wordContainer.appendChild(card);
  });

  showSpinner(false);
};

// Render word detail modal
const renderWordModal = (word) => {
  const synonymChips = (word.synonyms || [])
    .map(s => `<span class="chip" onclick="pronounceWord('${s}')">${s}</span>`)
    .join("") || '<span class="chip">—</span>';

  detailsContainer.innerHTML = `
    <div class="modal-word-header">
      <div class="modal-word-icon"><i class="fa-solid fa-spell-check"></i></div>
      <div>
        <div class="modal-word-title">${word.word || "—"}</div>
        <div class="modal-word-phonetic">
          <i class="fa-solid fa-microphone-lines"></i>
          /${word.pronunciation || "—"}/
        </div>
      </div>
    </div>

    <div class="modal-section">
      <div class="modal-label">Meaning (অর্থ)</div>
      <div class="modal-value font-bangla">${word.meaning || "পাওয়া যায়নি"}</div>
    </div>

    <div class="modal-section">
      <div class="modal-label">Example Sentence</div>
      <div class="modal-value">${word.sentence || "No example available."}</div>
    </div>

    <div class="modal-section">
      <div class="modal-label">Synonyms</div>
      <div class="synonym-chips">${synonymChips}</div>
    </div>

    <button class="modal-speak-btn" onclick="pronounceWord('${word.word}')">
      <i class="fa-solid fa-volume-high"></i> Pronounce "${word.word}"
    </button>`;

  modal.classList.remove("hidden");
};

/* SEARCH */
const handleSearch = async () => {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) { showToast("🔍 কিছু টাইপ করুন!"); return; }

  clearActiveLesson();
  showSpinner(true);

  try {
    const allWords   = await fetchData(`${API}/words/all`);
    const filtered   = allWords.filter(w =>
      w.word.toLowerCase().includes(query)
    );
    renderWords(filtered);
    if (!filtered.length) showToast(`"${query}" — কোনো শব্দ পাওয়া যায়নি`);
  } catch {
    showToast("⚠️ Search করতে সমস্যা হয়েছে।");
    showSpinner(false);
  }
};

/* SPEAK WITH ANIMATION */
const handleSpeak = (btn, word) => {
  pronounceWord(word);
  btn.classList.add("speaking");
  setTimeout(() => btn.classList.remove("speaking"), 1200);
};

/* EVENT LISTENERS */

// Search
searchBtn.addEventListener("click", handleSearch);
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});

// Close modal on overlay click
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});
modalClose.addEventListener("click", () => modal.classList.add("hidden"));

// Escape key closes modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") modal.classList.add("hidden");
});

// Sticky navbar shadow on scroll
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 10);
});

// Mobile menu toggle
hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("open");
  mobileMenu.classList.toggle("open");
});

/* INIT */
loadLessons();