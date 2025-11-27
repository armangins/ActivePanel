# מדריך להוספת פונטים מותאמים אישית

## שיטה 1: Google Fonts (מומלץ - הכי קל)

### שלב 1: הוסף את הפונט ל-index.html

```html
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
```

### שלב 2: הגדר את הפונט ב-tailwind.config.js

```js
theme: {
  extend: {
    fontFamily: {
      sans: ['Rubik', 'sans-serif'],
      // או פונט מותאם אישית
      hebrew: ['Rubik', 'Arial Hebrew', 'sans-serif'],
    },
  },
}
```

### שלב 3: השתמש בפונט בקומפוננטות

```jsx
<div className="font-hebrew">
  טקסט בעברית
</div>
```

---

## שיטה 2: פונטים מקומיים (קבצי .woff2, .ttf)

### שלב 1: העתק את קבצי הפונט לתיקיית fonts

**מיקום:** `src/fonts/`

```
src/
  fonts/
    ├── YourFont-Regular.woff2
    ├── YourFont-Bold.woff2
    ├── YourFont-Medium.woff2
    └── ...
```

**הערה:** התיקייה `src/fonts/` כבר נוצרה עבורך!

### שלב 2: הוסף את הפונטים ל-src/index.css

פתח את `src/index.css` ומצא את החלק עם ההערה `/* Custom Fonts */` והוסף:

```css
@font-face {
  font-family: 'YourFontName';
  src: url('./fonts/YourFont-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'YourFontName';
  src: url('./fonts/YourFont-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'YourFontName';
  src: url('./fonts/YourFont-Medium.woff2') format('woff2');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
```

### שלב 3: עדכן את tailwind.config.js

פתח את `tailwind.config.js` ועדכן את `fontFamily`:

```js
theme: {
  extend: {
    fontFamily: {
      sans: ['YourFontName', 'sans-serif'],
      // או פונט מותאם אישית
      custom: ['YourFontName', 'Arial Hebrew', 'sans-serif'],
    },
  },
}
```

### שלב 4: השתמש בפונט

```jsx
// שימוש בפונט ברירת המחדל
<div>טקסט רגיל</div>

// שימוש בפונט מותאם אישית
<div className="font-custom">טקסט מותאם</div>
```

---

## דוגמאות לפונטים עבריים מומלצים:

1. **Rubik** - פונט עברי מודרני וקריא
2. **Heebo** - פונט עברי נקי ומינימליסטי
3. **Assistant** - פונט עברי רחב וקריא
4. **Alef** - פונט עברי קלאסי

---

## שימוש בפונט ספציפי בקומפוננטה:

```jsx
// שימוש בפונט ברירת המחדל
<div className="font-sans">טקסט</div>

// שימוש בפונט מותאם אישית
<div className="font-hebrew">טקסט</div>

// שימוש ישיר ב-CSS
<div style={{ fontFamily: 'Rubik, sans-serif' }}>טקסט</div>
```

