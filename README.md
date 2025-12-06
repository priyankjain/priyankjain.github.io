# Split-Flap Display Portfolio

A dynamic, interactive portfolio website featuring a retro split-flap/slot machine display animation effect.

## 🎯 Features

- **Split-Flap Animation**: Authentic mechanical display effect with character cycling and 3D flip animations
- **Colorful Branding**: Custom colors for key terms (Google, Twitter, Purdue University, etc.)
- **Emoji Integration**: Visual icons including wave (👋), laptop (💻), Statue of Liberty (🗽), rocket (🚀), graduation cap (🎓)
- **Custom Logos**: Twitter bird and Purdue University logos embedded in the display
- **Sequential Reveal**: Row-by-row, tile-by-tile animation for smooth transitions
- **Responsive Design**: Clean, centered layout with proper spacing

## 🛠️ Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **CSS3** - Animations and styling
- **Google Fonts** - Courier Prime typography

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📝 Content Structure

The website displays five sequential screens:

1. **Greeting** - "Hi, Stranger! 👋"
2. **Introduction** - "I'm Priyank Jain, Welcome! ✨"
3. **Current Role** - Software Engineer 💻 at Google in New York City 🗽
4. **Previous Experience** - Twitter (with bird logo) until Musk 🚀 acquired it
5. **Education** - Masters in Computer Science 🎓 from Purdue University

## 🎨 Customization

### Updating Content

Edit the `SCREENS` array in `src/App.jsx`:

```javascript
const SCREENS = [
    ["YOUR TEXT HERE"],
    // Add more screens...
];
```

### Special Characters

- `^` - Wave emoji (👋)
- `+` - Sparkles (✨)
- `%` - Laptop (💻)
- `$` - Statue of Liberty (🗽)
- `@` - Rocket (🚀)
- `&` - Graduation cap (🎓)
- `~` - Twitter logo
- `#` - Purdue logo

### Changing Colors

Modify the `getStyle()` function in `src/App.jsx` to customize text colors based on screen index, line index, and character position.

### Animation Speed

Adjust timing in `src/App.jsx`:
- Character cycling: `setInterval(..., 30)` (line ~52)
- Tile reveal speed: `setTimeout(..., 60)` (line ~128)
- Screen transition delay: `setTimeout(..., 2000)` (line ~120)

### Font

Change the font in `src/styles.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=YOUR+FONT&display=swap');

:root {
    font-family: 'Your Font', monospace;
}
```

## 📁 Project Structure

```
priyankwebsite/
├── src/
│   ├── App.jsx          # Main component with animation logic
│   ├── main.jsx         # React entry point
│   └── styles.css       # Styling and animations
├── public/
│   └── purdue.png       # Purdue logo asset
├── index.html           # HTML template
└── package.json         # Dependencies
```

## 🎭 Animation Details

The split-flap effect is achieved through:

1. **Sequential Animation**: Tiles animate row-by-row, left-to-right
2. **Targeted Flipping**: Only tiles with changing content animate
3. **Color Transitions**: Colors persist during shuffle to prevent premature flashing
4. **3D Rotation**: CSS `rotateX` with perspective for authentic flip effect
5. **Blur Effect**: Subtle blur at flip midpoint for motion realism

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

**Priyank Jain**
- Software Engineer at Google
- New York City
- Masters in Computer Science, Purdue University

---

Built with ❤️ using React and CSS animations
