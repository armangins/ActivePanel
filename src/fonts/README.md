# תיקיית פונטים

שים את קבצי הפונטים שלך כאן.

## מבנה מומלץ:

```
src/fonts/
  ├── YourFont-Regular.woff2
  ├── YourFont-Bold.woff2
  ├── YourFont-Medium.woff2
  └── ...
```

## פורמטים נתמכים:

- `.woff2` (מומלץ - הכי קטן ומהיר)
- `.woff`
- `.ttf`
- `.otf`

## איך להוסיף פונט:

1. **העתק את קבצי הפונט לתיקייה זו** (`src/fonts/`)
2. **הוסף את הפונט ל-`src/index.css`** - פתח את הקובץ ומצא את החלק `/* Custom Fonts */` והוסף שם את ה-@font-face declarations
3. **עדכן את `tailwind.config.js`** - הוסף את שם הפונט ל-fontFamily

## דוגמה:

אם יש לך קבצים:
- `YourFont-Regular.woff2`
- `YourFont-Bold.woff2`

הוסף ל-`src/index.css`:
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
```

ואז ב-`tailwind.config.js`:
```js
fontFamily: {
  sans: ['YourFontName', 'sans-serif'],
}
```

## הערות:

- אחרי שתשים את הקבצים כאן, אני אוכל לעדכן את הקוד עבורך
- הקפד על שמות קבצים עקביים (למשל: FontName-Regular.woff2, FontName-Bold.woff2)
- אם יש לך משקלים נוספים (Light, Medium, SemiBold וכו'), הוסף אותם גם
