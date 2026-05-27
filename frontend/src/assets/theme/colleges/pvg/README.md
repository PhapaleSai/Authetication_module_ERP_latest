# PVG COET&M — College Configuration

This folder contains everything specific to PVG's College of Engineering, Technology and Management, Pune.
The generic ERP theme files (`erp-theme.css`, `erp-theme.js`) have no PVG-specific code.

## Folder Contents

```
colleges/pvg/
├── config.css           ← PVG brand tokens (colours, font)
├── assets/
│   ├── icon-180.jpg     ← 180×180 square logo (symlink → assets/logos/)
│   └── logo-wordmark.jpg← 520×103 horizontal wordmark (symlink → assets/logos/)
└── README.md
```

## How to Add a New College

1. Create `colleges/<college-slug>/`
2. Copy `colleges/pvg/config.css` → override only the tokens that differ
3. Add the college logo as `colleges/<college-slug>/assets/icon-180.jpg`
4. In every module page, swap the config link:

```html
<!-- was: <link rel="stylesheet" href="colleges/pvg/config.css" /> -->
<link rel="stylesheet" href="colleges/abc-college/config.css" />
```

That's it — `erp-theme.css` and `erp-theme.js` are untouched.

## PVG Brand Reference

| Token | Value | Notes |
|-------|-------|-------|
| `--erp-primary` | `#003A6A` | Deep navy blue — sidebar, headings, buttons |
| `--erp-primary-dark` | `#002650` | Hover / active states |
| `--erp-primary-light` | `#004e8f` | Gradient fill, avatar bg |
| `--erp-accent` | `#72acdc` | Active sidebar border, info tint |
| `--erp-dark` | `#2D2D2D` | Body text, secondary button |
| `--erp-font` | `'Poppins'` | Google Fonts |

Source: [pvgcoet.ac.in](https://www.pvgcoet.ac.in/)
