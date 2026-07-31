# Contributing to cleanr

Thank you for your interest in contributing to `cleanr`! We welcome bug fixes, feature proposals, and documentation improvements.

---

## 🛠️ Development Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/cleanr.git
   cd cleanr
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Run local development build**:
   ```bash
   npm run dev
   ```

---

## 🧪 Testing & Code Quality

Before submitting a pull request, ensure all tests, lint checks, and type checks pass cleanly:

```bash
# Type check TypeScript
npm run typecheck

# Run Oxlint
npm run lint

# Run Vitest suite
npm run test

# Run code formatter
npm run format

# Run full pre-release build
npm run build
```

We enforce pre-commit linting via `husky` and `lint-staged` to automatically format and lint modified files on commit.

---

## 📜 Pull Request Process

1. Fork the repo and create your feature branch (`git checkout -b feature/my-cool-feature`).
2. Adhere to conventional commit message formatting (e.g. `feat: ...`, `fix: ...`, `docs: ...`).
3. Ensure test coverage remains high and no regressions are introduced.
4. Submit a Pull Request targeting the `main` branch with a description of your changes.
