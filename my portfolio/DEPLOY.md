# Portfolio ko online kaise chalayein (Deploy)

Is folder ko jaisa hai waisa kisi bhi static host par daal sakte ho. Koi build step,
npm, ya server nahi chahiye. Sab kuch already relative paths use karta hai.

---

## Option A — GitHub Pages (Recommended, free, permanent)

Aapka GitHub: https://github.com/Sanyam095

### Step 1 — Naya repo banaayein
1. https://github.com/new par jayein
2. Repository name: `portfolio` (ya jo bhi pasand ho)
3. **Public** select karein
4. "Add a README file" par **tick na** karein (optional, par khalii repo aasan hai)
5. **Create repository** dabayein

### Step 2 — Files upload karein
Repo banne ke baad "uploading an existing file" wala link dikhega. Usme ye saari
files + `assets` folder drag-and-drop karein:

```
index.html
admin.html
style.css
admin.css
script.js
admin.js
data.js
assets/
  └── sanyam.jpg
```

Ya terminal se (repo folder me ho kar):

```bash
git init
git add .
git commit -m "Portfolio site"
git branch -M main
git remote add origin https://github.com/Sanyam095/portfolio.git
git push -u origin main
```

### Step 3 — Pages on karein
1. Repo me **Settings** tab → left sidebar me **Pages**
2. Build and deployment → Source: **Deploy from a branch**
3. Branch: **main**, folder: **/(root)** → **Save**
4. 1-2 minute baad upar ek link dikhega:
   `https://sanyam095.github.io/portfolio/`

Ye link kisi bhi device se, kisi bhi network se khulega. ✅

---

## Option B — Netlify Drop (sabse jaldi, 30 second)

1. https://app.netlify.com/drop kholein
2. Poora `my portfolio` folder browser me drag-and-drop karein
3. Turant ek random URL mil jayega (jaise `abc-123.netlify.app`)
4. Site settings → **Change site name** se apna pasandida naam rakh sakte ho

---

## Content badalne ka sahi tareeqa (important)

Admin panel (`admin.html`) me **Save Changes** sirf **usi browser** me save hota hai
(localStorage). Iska matlab:

- ✅ Site dekhne ke liye: koi bhi device, koi bhi network — basement
- ❌ Admin me edit karke Save karne se **live site change nahi hoti**

Live site me badlaav dikhane ke liye:

1. `admin.html` kholein → apni edits karein
2. **Export data.js** dabayein → `data.js` download ho jayega
3. Download ki hui `data.js` ko folder ki purani `data.js` ki jagah replace karein
4. GitHub par naya `data.js` upload/push karein (ya Netlify par drag karein)
5. 1 minute me live site update ho jayegi

> Tip: agar aap GitHub par hi admin khol kar edit kar rahe ho, to bhi export karke
> file replace karna hi padega — browser localStorage sirf aapke browser me rehta hai.

---

## Custom domain (optional)

GitHub Pages me **Settings → Pages → Custom domain** se apna domain (jaise
`sanyam.dev`) laga sakte ho. Netlify me bhi yahi option hota hai. Dono free SSL dete hain.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Site 404 dikha rahi hai | Check karein `index.html` root me hai, branch `main` aur folder `/root` select hai |
| Photo nahi dikhi | `assets/sanyam.jpg` bhi upload hua hai ya nahi — check karein |
| CSS/JS nahi chal raha | Browser console (F12) kholein; file names case-sensitive hote hain Linux par |
| Admin edits dikhi nahi | Upar wala "Export data.js" wala step follow karein |
| Purani content dikha raha hai | Browser cache clear karein (Ctrl+Shift+R) |
