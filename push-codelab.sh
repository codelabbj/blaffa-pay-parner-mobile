#!/bin/zsh
# Push with the codelabbj SSH key (id_rsa_work / Host github-work)
set -euo pipefail
cd "$(dirname "$0")"
export GIT_SSH_COMMAND='ssh -F ~/.ssh/config -o IdentitiesOnly=yes -o IdentityAgent=none -i ~/.ssh/id_rsa_work'
echo "Auth check (expect Hi codelabbj!)..."
ssh -F ~/.ssh/config -o IdentitiesOnly=yes -o IdentityAgent=none -i ~/.ssh/id_rsa_work -T git@github.com || true
git push -u origin HEAD
git status -sb
