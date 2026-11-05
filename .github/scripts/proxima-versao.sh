#!/usr/bin/env bash
# Calcula a próxima versão SemVer incrementando SOMENTE o PATCH.
#
# MAJOR.MINOR vêm do package.json (ex.: "2.0.0" -> base 2.0).
# O PATCH é o maior já publicado como tag git "vMAJOR.MINOR.*" + 1.
# Se ainda não existir nenhuma tag para essa base, a primeira versão é MAJOR.MINOR.0.
#
#   tags: v2.0.0, v2.0.1  ->  próxima: 2.0.2
#
# Imprime apenas a versão (sem o "v") na saída padrão.
set -euo pipefail

base=$(node -p "require('./package.json').version.split('.').slice(0,2).join('.')")

ultimo_patch=$(git tag --list "v${base}.*" \
  | sed -nE "s/^v${base//./\\.}\.([0-9]+)$/\1/p" \
  | sort -n | tail -1)

if [ -z "$ultimo_patch" ]; then
  echo "${base}.0"
else
  echo "${base}.$((ultimo_patch + 1))"
fi
