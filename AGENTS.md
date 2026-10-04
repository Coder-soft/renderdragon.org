# AGENTS.md

## Repository layout

This checkout is the `Coder-soft/renderdragon.org` fork. The canonical upstream
for this project is **`creatorcluster/renderdragon.org`** (base branch `main`),
which itself forks `Yxmura/renderdragon`.

## Pull requests

Open every pull request against upstream **`creatorcluster/renderdragon.org` `main`**,
not against the `Coder-soft` fork. Push the branch to `origin` (the fork) and open a
cross-repository PR:

```sh
git push -u origin <branch>
gh pr create --repo creatorcluster/renderdragon.org --base main --head Coder-soft:<branch>
```

GitHub's native linked-branch feature (`gh issue develop`) does not work in the fork,
so reference the relevant fork issue by URL in the PR body instead.
