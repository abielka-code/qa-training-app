(function () {
  const cfg = window.QA_CONFIG || {};
  const known = window.KNOWN_BUGS || [];

  const elEmail = document.getElementById("email");
  const elPassword = document.getElementById("password");
  const btnLogin = document.getElementById("btnLogin");
  const elLoginState = document.getElementById("loginState");

  const elTitle = document.getElementById("taskTitle");
  const btnAdd = document.getElementById("btnAdd");
  const elSearch = document.getElementById("search");
  const btnSync = document.getElementById("btnSync");

  const elTasks = document.getElementById("tasks");
  const elToast = document.getElementById("toast");
  const elKnown = document.getElementById("knownBugs");

  let isLoggedIn = false;

  // Storage (може бути вимкнено дефектом)
  const STORAGE_KEY = "qa_tasks_demo_v1";

  /** @type {{id:number,title:string,done:boolean,source:string}[]} */
  let tasks = [];

  function showToast(message) {
    elToast.textContent = message;
    elToast.classList.remove("hidden");

    // ДЕФЕКТ: toast не зникає автоматично
    if (cfg.BUG_TOAST_DOES_NOT_AUTOHIDE) return;

    setTimeout(() => elToast.classList.add("hidden"), 1800);
  }

  function load() {
    if (cfg.BUG_NO_PERSISTENCE) {
      // ДЕФЕКТ: не завантажуємо з localStorage
      tasks = [];
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      tasks = raw ? JSON.parse(raw) : [];
    } catch {
      tasks = [];
    }
  }

  function save() {
    if (cfg.BUG_NO_PERSISTENCE) {
      // ДЕФЕКТ: не зберігаємо
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function renderKnownBugs() {
    if (!elKnown) return;
    elKnown.innerHTML = "";
    known.forEach(b => {
      const enabled = Boolean(cfg[b.enabledBy]);
      const div = document.createElement("div");
      div.className = "bug";
      div.innerHTML = `<strong>${b.id}</strong> — ${b.title}<br><span class="muted small">Стан: ${enabled ? "увімкнено" : "вимкнено"} (керується ${b.enabledBy})</span>`;
      elKnown.appendChild(div);
    });
  }

  function render() {
    const q = (elSearch.value || "").trim().toLowerCase();
    elTasks.innerHTML = "";

    const filtered = tasks.filter(t => t.title.toLowerCase().includes(q));

    filtered.forEach((t, idx) => {
      const li = document.createElement("li");
      li.className = "task" + (t.done ? " done" : "");
      li.dataset.id = String(t.id);

      const left = document.createElement("div");
      left.className = "left";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = t.done;
      cb.addEventListener("change", () => {
        t.done = cb.checked;
        save();
        render();
      });

      const title = document.createElement("div");
      title.className = "title";
      title.textContent = t.title;

      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = `source: ${t.source}`;

      left.appendChild(cb);
      left.appendChild(title);

      const right = document.createElement("div");
      right.className = "row";

      const btnDel = document.createElement("button");
      btnDel.textContent = "Delete";
      btnDel.addEventListener("click", () => {
        // ДЕФЕКТ: перший елемент (в поточному відфільтрованому списку) не видаляється
        if (cfg.BUG_CANNOT_DELETE_FIRST_ITEM && idx === 0) {
          showToast("Error: cannot delete item #0 (demo bug)");
          return;
        }
        tasks = tasks.filter(x => x.id !== t.id);
        save();
        render();
        showToast("Deleted");
      });

      right.appendChild(btnDel);

      li.appendChild(left);
      li.appendChild(meta);
      li.appendChild(right);

      elTasks.appendChild(li);
    });
  }

  function addTask() {
    if (!isLoggedIn) {
      showToast("Please login first.");
      return;
    }

    const title = (elTitle.value || "").trim();

    // ДЕФЕКТ: дозволяємо порожній title
    if (!cfg.BUG_ALLOW_EMPTY_TITLE) {
      if (title.length === 0) {
        showToast("Title is required.");
        return;
      }
      if (title.length > 60) {
        showToast("Title is too long (max 60).");
        return;
      }
    }

    const newTask = {
      id: Date.now(),
      title: title.length ? title : "(empty)", // щоб було видно дефект
      done: false,
      source: "local"
    };

    tasks.unshift(newTask);
    elTitle.value = "";
    save();
    render();
    showToast("Added");
  }

  async function syncFromApi() {
    if (!isLoggedIn) {
      showToast("Please login first.");
      return;
    }

    try {
      const res = await fetch("https://jsonplaceholder.typicode.com/todos?_limit=5");
      if (!res.ok) {
        showToast(`API error: ${res.status}`);
        return;
      }
      const data = await res.json();

      const incoming = data.map(x => ({
        id: Number(x.id) + 1000000, // щоб не пересікалося з локальними
        title: String(x.title),
        done: Boolean(x.completed),
        source: "api"
      }));

      if (cfg.BUG_SYNC_DUPLICATES) {
        // ДЕФЕКТ: додаємо дублікати кожного разу
        tasks = incoming.concat(tasks);
      } else {
        // Нормальна поведінка: уникаємо дублікатів за id
        const existing = new Set(tasks.map(t => t.id));
        const unique = incoming.filter(t => !existing.has(t.id));
        tasks = unique.concat(tasks);
      }

      save();
      render();
      showToast("Synced 5 tasks");
    } catch (e) {
      showToast("Network error (API)");
    }
  }

  function login() {
    const email = (elEmail.value || "").trim();
    const pwd = (elPassword.value || "").trim();

    if (email.length === 0) {
      showToast("Email is required.");
      return;
    }

    if (cfg.BUG_LOGIN_ACCEPTS_ANY_PASSWORD) {
      // ДЕФЕКТ: будь-який пароль
      isLoggedIn = true;
      elLoginState.textContent = `Logged in as ${email}`;
      showToast("Login success (demo)");
      return;
    }

    // “Нормальна” демо-перевірка: пароль мінімум 6 символів
    if (pwd.length < 6) {
      showToast("Invalid credentials.");
      return;
    }

    isLoggedIn = true;
    elLoginState.textContent = `Logged in as ${email}`;
    showToast("Login success");
  }

  // Events
  btnLogin.addEventListener("click", login);
  btnAdd.addEventListener("click", addTask);
  btnSync.addEventListener("click", syncFromApi);
  elSearch.addEventListener("input", render);

  // Init
  load();
  render();
  renderKnownBugs();
})();
