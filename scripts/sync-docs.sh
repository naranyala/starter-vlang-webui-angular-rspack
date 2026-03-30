#!/bin/bash
# Sync documentation from root docs/ folder to frontend assets
# Run this whenever docs are updated

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DOCS="${SCRIPT_DIR}/../docs"
FRONTEND_DOCS="${SCRIPT_DIR}/../frontend/src/assets/docs"

echo "Syncing documentation..."
echo "  Source: ${ROOT_DOCS}"
echo "  Target: ${FRONTEND_DOCS}"

# Create target directory if it doesn't exist
mkdir -p "${FRONTEND_DOCS}"

# Copy markdown files
cp -v "${ROOT_DOCS}"/*.md "${FRONTEND_DOCS}/" 2>/dev/null || true

# Copy subdirectories if they exist
for dir in architecture demos setup; do
    if [ -d "${ROOT_DOCS}/${dir}" ]; then
        mkdir -p "${FRONTEND_DOCS}/${dir}"
        cp -v "${ROOT_DOCS}/${dir}"/*.md "${FRONTEND_DOCS}/${dir}/" 2>/dev/null || true
    fi
done

echo "Documentation sync complete!"
echo ""
echo "Files in ${FRONTEND_DOCS}:"
ls -1 "${FRONTEND_DOCS}"/*.md 2>/dev/null || echo "  No markdown files found"
