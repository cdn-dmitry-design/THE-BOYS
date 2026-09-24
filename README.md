# THE BOYS — попапы для Тильды

Кастомные попапы (заявка, подарочная карта, FAQ перед визитом) для сайта на Tilda.

## Можно ли держать код на GitHub и дать одну строку на Тильду?

**Да.** На Тильду в HTML-блок вставляется одна строка, которая тянет скрипты с CDN (jsDelivr поверх GitHub):

```html
<script>
(function () {
  if (window.__tbPopBoot) return;
  window.__tbPopBoot = 1;
  function add(src) {
    var s = document.createElement('script');
    s.src = src;
    s.async = false;
    (document.head || document.documentElement).appendChild(s);
    return s;
  }
  var primary = add('https://cdn.jsdelivr.net/gh/cdn-dmitry-design/THE-BOYS@main/cdn/popups.js?v=11');
  primary.onerror = function () {
    add('https://raw.githack.com/cdn-dmitry-design/THE-BOYS/main/cdn/popups.js?v=11');
  };
})();
</script>
```

В Zero Block класс **без точки**: `order` (несколько через запятую ок).

Актуальный код также в `docs/tilda-embed.html`. **Не** используйте голый `<script src="...">` — Тильда его часто не выполняет.

Полные HTML-файлы для вставки целиком в Тильду лежат в корне проекта и в `tilda-backup/` — на случай, если CDN не нужен.

## Будут ли работать формы?

**Да**, если на странице Тильды остаются **нативные блоки форм** (BF / Zero Block с формой), на которые попапы уже завязаны:

| Попап | Триггер | Блок формы (`rec`) | Mount (опционально) |
|--------|---------|--------------------|---------------------|
| Заявка | `data-tb-pop="order"` или `#order` / `#zayavka` | `4168108201` | `#tbOrderMount` + `data-form-rec` |
| Подарочная карта | `data-tb-pop="gift"` или `#gift` / `#card` / `#podarok` | `4169596401` | `#tbGiftMount` + `data-form-rec` |
| Перед визитом | `data-tb-pop="visit"` | — (без формы) | `#tbVisitMount` |

Попап только рисует UI и **переписывает поля / жмёт Submit у скрытой формы Тильды**. Письма, CRM, вебхуки и капча Тильды работают как раньше. Без блока формы на странице отправка не уйдёт.

Если id блока другой — добавьте mount:

```html
<div id="tbOrderMount" data-form-rec="ВАШ_REC_ID" hidden></div>
```

## Структура

```
cdn/                 ← файлы для CDN (одна строка на Тильду)
  popups.js          ← лоадер всех попапов
  order.css / order.js
  gift.css / gift.js
  visit.css / visit.js
tilda-backup/        ← полные HTML как бэкап для вставки в Тильду
Попап *.html         ← исходники в корне (тоже бэкап)
docs/tilda-embed.html
```

## Что оставить на странице Тильды

1. Скрытые/обычные блоки форм с нужными полями (имя, почта, телефон / номинал, чекбоксы).
2. Кнопки/ссылки с CSS-классом `story-1` / `visit` / `order` / `gift`.
3. Блок T123 с **inline-загрузчиком** из `docs/tilda-embed.html` (не голый `<script src>`).

Публиковать страницу после смены скрипта обязательно.
