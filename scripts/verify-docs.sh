#!/bin/bash
# Verify documentation setup for frontend

echo "==================================="
echo "Documentation Setup Verification"
echo "==================================="
echo ""

# Check root docs folder
echo "1. Root documentation files:"
if [ -d "docs" ]; then
    ls -1 docs/*.md 2>/dev/null | while read file; do
        echo "   ✓ $(basename $file)"
    done
else
    echo "   ✗ docs/ folder not found"
fi
echo ""

# Check frontend assets docs folder
echo "2. Frontend assets documentation:"
if [ -d "frontend/src/assets/docs" ]; then
    ls -1 frontend/src/assets/docs/*.md 2>/dev/null | while read file; do
        echo "   ✓ $(basename $file)"
    done
else
    echo "   ✗ frontend/src/assets/docs/ folder not found"
fi
echo ""

# Check angular.json configuration
echo "3. Angular.json assets configuration:"
if grep -q '"input": "../docs"' frontend/angular.json 2>/dev/null; then
    echo "   ✓ Docs folder configured in angular.json"
else
    echo "   ✗ Docs folder NOT configured in angular.json"
fi
echo ""

# Check dashboard component paths
echo "4. Dashboard component markdown path:"
if grep -q 'assets/docs' frontend/src/views/dashboard/dashboard.component.ts 2>/dev/null; then
    echo "   ✓ Using assets/docs/ path"
else
    echo "   ✗ NOT using assets/docs/ path"
fi
echo ""

# Summary
echo "==================================="
echo "Quick Fix Commands:"
echo "==================================="
echo ""
echo "# Sync docs to frontend:"
echo "./scripts/sync-docs.sh"
echo ""
echo "# Or manually copy:"
echo "cp docs/*.md frontend/src/assets/docs/"
echo ""
echo "# Rebuild frontend:"
echo "cd frontend && bun run build"
echo ""
