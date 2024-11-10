#!/bin/bash

# Colors for better visibility
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Checking for changes...${NC}"
CHANGES=$(git status --porcelain)

if [ -z "$CHANGES" ]; then
    echo "No changes detected."
    exit 0
fi

# Show changed files
echo -e "${GREEN}Changed files:${NC}"
git status -s

# Generate changelog from changes
CHANGED_FILES=$(git diff --name-only)
CHANGELOG=""

for file in $CHANGED_FILES; do
    if [ -f "$file" ]; then
        DIFF=$(git diff --unified=0 "$file" | grep '^[+-]' | grep -v '^[+-]\{3\}' | grep -v '^[-+]$' || true)
        if [ ! -z "$DIFF" ]; then
            CHANGELOG+="📁 $file:\n"
            while IFS= read -r line; do
                if [[ $line == +* && $line != +++ ]]; then
                    CHANGELOG+="  ✨ ${line:1}\n"
                fi
            done <<< "$DIFF"
        fi
    fi
done

# Show generated changelog
echo -e "\n${GREEN}Generated Changelog:${NC}"
echo -e "$CHANGELOG"

# Ask for version bump type
echo -e "\n${BLUE}Select version bump type:${NC}"
echo "1) Major (x.0.0)"
echo "2) Minor (0.x.0)"
echo "3) Patch (0.0.x)"
read -p "Enter choice (1-3): " VERSION_CHOICE

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"

case $VERSION_CHOICE in
    1)
        NEW_VERSION="$((MAJOR + 1)).0.0"
        VERSION_TYPE="major"
        ;;
    2)
        NEW_VERSION="$MAJOR.$((MINOR + 1)).0"
        VERSION_TYPE="minor"
        ;;
    3)
        NEW_VERSION="$MAJOR.$MINOR.$((PATCH + 1))"
        VERSION_TYPE="patch"
        ;;
    *)
        echo "Invalid choice. Using patch version."
        NEW_VERSION="$MAJOR.$MINOR.$((PATCH + 1))"
        VERSION_TYPE="patch"
        ;;
esac

# Update version in package.json
npm version $VERSION_TYPE --no-git-tag-version

# Create commit message
COMMIT_MESSAGE="v$NEW_VERSION\n\n$CHANGELOG"

# Stage changes
echo -e "\n${BLUE}Staging changes...${NC}"
git add .

# Commit changes
echo -e "\n${BLUE}Committing changes...${NC}"
echo -e "$COMMIT_MESSAGE" | git commit -F -

# Create git tag
echo -e "\n${BLUE}Creating tag v$NEW_VERSION...${NC}"
git tag -a "v$NEW_VERSION" -m "Version $NEW_VERSION"

# Push changes
echo -e "\n${BLUE}Pushing changes to GitHub...${NC}"
git push origin main
git push origin "v$NEW_VERSION"

echo -e "\n${GREEN}✅ Successfully updated repository to version $NEW_VERSION${NC}"
