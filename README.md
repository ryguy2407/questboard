# Quest Board 🏰⭐

A family rewards app for adventurers. Built for iPads, works in any browser.

---

## Files

```
questboard/
├── index.html          ← Open this in a browser
├── css/style.css       ← Styles
├── js/
│   ├── app.js          ← Main app logic
│   ├── firebase.js     ← Data persistence (Firebase + localStorage)
│   └── avatar.js       ← Avatar creator system
└── README.md
```

---

## Running the app

### Option A — Open directly (local use, single device)
Just open `index.html` in Safari on the iPad. On first run, choose **"Use local storage instead"**. Data is saved on that device only.

### Option B — Firebase (syncs across all devices) ← Recommended

**Step 1: Create a Firebase project (free, 5 mins)**

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it `questboard` → Continue → Create project
3. In the left sidebar, go to **Build → Realtime Database**
4. Click **Create database** → choose your region → **Start in test mode** → Enable
5. Copy the database URL from the top of the page (looks like `https://questboard-xxxxx-default-rtdb.firebaseio.com`)
6. Go to ⚙️ **Project settings** (gear icon, top left) → **General** tab
7. Scroll down to **Your apps** → if no app exists, click the `</>` Web icon to add one → register it
8. Find **Web API Key** near the top of Project settings → copy it

**Step 2: Host the app (so iPads can open it)**

Easiest free option: **GitHub Pages**

1. Create a free GitHub account at github.com
2. Create a new repository called `questboard`
3. Upload all the files (maintaining the folder structure)
4. Go to Settings → Pages → Source: main branch → Save
5. Your app will be at `https://yourusername.github.io/questboard`

Alternative: just put the folder on a shared drive (Google Drive, iCloud) and open index.html — but this won't sync in real-time.

**Step 3: First run**

1. Open the app URL on any device
2. Enter your Firebase Database URL and API Key when prompted
3. Click **Connect & Start** — done!

The config is saved in the browser, so you only do this once per device.

---

## Features

- **Per-child profiles** with custom mix-and-match avatars
- **Task management** — add quests with emoji + point values
- **Streak tracking** — 7-day visual + automatic daily reset at midnight
- **Reward system** — points-based and streak milestone rewards
- **Claim flow** — kids can't redeem themselves; they alert parents
- **Weekly summary** — parent view with engagement tips
- **History log** — last 14 days of activity per child
- **Confetti** — fires when all daily quests are completed 🎉
- **Avatar creator** — Zelda, sea animals, MJ/performer themes with mix-and-match layers

---

## Customisation tips

- **Add tasks via the Parent tab** → Tasks → + Add task
- **Adjust point values** to match effort (5 for quick tasks, 20-30 for big ones)
- **Streak rewards** are separate from points — great for behaviour patterns you want to sustain
- **Reset a child's day** in Parent → Overview if they've marked something by mistake
- **Point totals don't reset** — kids accumulate stars over time, which feels fairer

---

## Data & privacy

- If using Firebase: data is stored in your own Google Firebase project — Anthropic/Claude has no access
- If using local storage: data stays on the device only
- No accounts, no subscriptions, no ads

---

## Theming ideas

The avatar system has:
- **Zelda themes**: Elf hero, Knight, Wizard, Crown, Sword, Shield, Bow, Triforce
- **Sea animals**: Octopus, Clownfish, Shark, Turtle, Whale, Crab, Dolphin, Seaweed, Shell
- **MJ/performer**: Dancer, Pop Star, Fedora, Glitter, Sparkles, Microphone, Music note, Glove
- **Mix freely**: e.g. an octopus body + crown + sword = underwater warrior!
