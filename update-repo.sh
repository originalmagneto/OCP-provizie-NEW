#!/bin/bash

# Colors for better visibility
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# GitHub Personal Access Token
# You'll need to set this as an environment variable
# export GITHUB_TOKEN=your_token_here
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  GitHub token not found. Please set GITHUB_TOKEN environment variable${NC}"
    echo -e "Create a token at https://github.com/settings/tokens"
    echo -e "Then run: export GITHUB_TOKEN=your_token_here"
    exit 1
fi

echo -e "${BLUE}🔄 Starting update and deployment process...${NC}"

# Check for changes
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

# Create GitHub Release
echo -e "\n${BLUE}Creating GitHub Release...${NC}"
RELEASE_DATA="{\"tag_name\": \"v$NEW_VERSION\",\"name\": \"v$NEW_VERSION\",\"body\": \"$CHANGELOG\",\"draft\": false,\"prerelease\": false}"

curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -d "$RELEASE_DATA" \
  "https://api.github.com/repos/originalmagneto/OCP-provizie-NEW/releases"

# Build the project
echo -e "\n${BLUE}Building project...${NC}"
npm run build

# Deploy to Netlify
echo -e "\n${BLUE}Deploying to Netlify...${NC}"
npx netlify deploy --prod

echo -e "\n${GREEN}✅ Successfully updated repository to version $NEW_VERSION and deployed to Netlify${NC}"
