# 🎮 Pixel Quest – Path to Victory

A 2D browser-based action platformer built using **HTML5 Canvas, JavaScript, and CSS**.
Fight enemies, navigate obstacles, and defeat the boss to achieve victory.

🔗 **Live Demo:** https://2dsmile.netlify.app/

---

## 📌 Overview

**Pixel Quest – Path to Victory** is a lightweight 2D game designed with a retro pixel-art style.
The game features multiple screens (start, settings, gameplay, victory, etc.), responsive controls, and a modular JavaScript architecture.

---

## 🚀 Features

* 🎮 Smooth 2D gameplay using HTML5 Canvas
* 👤 Character selection (Boy / Girl)
* ❤️ Health & Lives system
* ⚔️ Combat mechanics (attack enemies)
* 🧠 Boss enemy (Link Mage)
* 📱 Mobile touch controls
* ⏸ Pause / Resume / Restart system
* 🏆 Victory and Game Over screens
* ⚙️ Settings (Sound, Fullscreen toggle)

---

## 🧱 Tech Stack

| Technology               | Purpose                          |
| ------------------------ | -------------------------------- |
| **HTML5**                | Structure and UI screens         |
| **CSS3**                 | Styling, animations, pixel theme |
| **JavaScript (Vanilla)** | Game logic and mechanics         |
| **HTML5 Canvas API**     | Rendering game world             |
| **Netlify**              | Hosting and deployment           |

---

## 📂 Project Structure

```
2dGame/
│
├── index.html        # Main entry point (UI screens + canvas)
├── style.css         # All styling (UI + animations)
├── main.js           # Entry script (initializes game)
│
├── assets/           # Game assets (images, sprites)
│   ├── pmob.gif
│   └── boss.webp
│
└── js/               # Modular game logic
    ├── utils.js      # Helper functions
    ├── sprites.js    # Sprite handling
    ├── controls.js   # Input handling (keyboard + mobile)
    ├── physics.js    # Gravity, collision logic
    ├── player.js     # Player behavior
    ├── enemy.js      # Enemy + boss logic
    ├── ui.js         # UI updates (HUD, screens)
    └── game.js       # Core game loop
```

---

## 🎮 Controls

### 💻 Desktop Controls

| Action     | Key             |
| ---------- | --------------- |
| Move Left  | ← Arrow / A     |
| Move Right | → Arrow / D     |
| Jump       | ↑ Arrow / Space |
| Attack     | J / Click       |
| Pause      | ⏸ Button        |

---

### 📱 Mobile Controls

* ◀ Move Left
* ▶ Move Right
* ▲ Jump
* ⚔ Attack

---

## 🧠 Game Mechanics

* Player can move, jump, and attack enemies
* Health decreases on damage
* Lives system determines retries
* Score increases by defeating enemies
* Boss fight triggers at final stage
* Victory screen appears after defeating boss

---

## ⚙️ Setup & Run Locally

1. Clone the repository:

```
git clone https://github.com/your-username/your-repo-name.git
```

2. Open the folder:

```
cd your-repo-name
```

3. Run using Live Server or simply open:

```
index.html
```

---

## 🌐 Deployment

The game is deployed using **Netlify**.

To deploy:

1. Drag & drop project folder into Netlify
2. OR connect GitHub repo
3. Ensure correct file structure at root

---

## 🐛 Known Issues

* Performance may vary on low-end mobile devices
* Touch controls may need tuning on very small screens

---

## 🔮 Future Improvements

* 🔊 Sound effects & background music
* 🎯 Multiple levels
* 💾 Save/Load progress
* 🧩 More enemy types
* 🎨 Improved animations

---

## 👨‍💻 Author

**Ricky**

---

## ⭐ Support

If you like this project:

* ⭐ Star the repo
* 🍴 Fork it
* 🛠 Contribute

---

## 📜 License

This project is open-source and free to use for learning purposes.
