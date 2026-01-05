// Конфіг навчального сайту.
// Викладач може вмикати/вимикати дефекти для контрольованого оцінювання.

window.QA_CONFIG = {
  // Фейковий логін: true = приймає будь-який пароль (дефект безпеки/логіки)
  BUG_LOGIN_ACCEPTS_ANY_PASSWORD: true,

  // Валідація Title: true = дозволяє порожній Title (дефект)
  BUG_ALLOW_EMPTY_TITLE: true,

  // Видалення першого елемента: true = перший елемент НЕ видаляється (дефект)
  BUG_CANNOT_DELETE_FIRST_ITEM: true,

  // Toast (повідомлення): true = повідомлення інколи не зникає (дефект UX)
  BUG_TOAST_DOES_NOT_AUTOHIDE: true,

  // Збереження: true = НЕ зберігає задачі між перезавантаженнями (дефект)
  BUG_NO_PERSISTENCE: true,

  // “Sync API”: true = додає дублікати при повторному Sync (дефект логіки)
  BUG_SYNC_DUPLICATES: true
};

// Еталонний список відомих дефектів (для сторінки About).
window.KNOWN_BUGS = [
  { id: "UI-01", title: "Можна додати задачу з порожнім Title", enabledBy: "BUG_ALLOW_EMPTY_TITLE" },
  { id: "UI-02", title: "Перший елемент у списку не видаляється", enabledBy: "BUG_CANNOT_DELETE_FIRST_ITEM" },
  { id: "UI-03", title: "Повідомлення (toast) інколи не зникає автоматично", enabledBy: "BUG_TOAST_DOES_NOT_AUTOHIDE" },
  { id: "UI-04", title: "Задачі не зберігаються після перезавантаження", enabledBy: "BUG_NO_PERSISTENCE" },
  { id: "UI-05", title: "Sync додає дублікати при повторному натисканні", enabledBy: "BUG_SYNC_DUPLICATES" },
  { id: "SEC-01", title: "Логін приймає будь-який пароль (демо-дефект)", enabledBy: "BUG_LOGIN_ACCEPTS_ANY_PASSWORD" }
];
