# 📋 Personalization Guide

This guide lists all the personal information you need to update in your Social Media CLI project before publishing or sharing it.

## 🔧 Required Updates

### 1. **package.json** (Lines 37, 39, 42, 45)
Replace these placeholders:
- `YOUR_NAME` → Your full name
- `YOUR_EMAIL` → Your email address
- `YOUR_GITHUB_USERNAME` → Your GitHub username

```json
"author": "YOUR_NAME <YOUR_EMAIL>",
"homepage": "https://github.com/YOUR_GITHUB_USERNAME/social-media-cli#readme",
"repository": {
  "url": "git+https://github.com/YOUR_GITHUB_USERNAME/social-media-cli.git"
},
"bugs": {
  "url": "https://github.com/YOUR_GITHUB_USERNAME/social-media-cli/issues"
}
```

### 2. **LICENSE** (Line 3)
Replace:
- `YOUR_NAME` → Your full name or organization name

```
Copyright (c) 2025 YOUR_NAME
```

### 3. **SECURITY.md** (Lines 22, 272, 273)
Replace:
- `YOUR_SECURITY_EMAIL@domain.com` → Your security contact email
- `YOUR_GPG_PUBLIC_KEY_ID` → Your GPG key ID (optional)

```markdown
1. **Email**: Send details to YOUR_SECURITY_EMAIL@domain.com

## Contact Information
- **Security Email**: YOUR_SECURITY_EMAIL@domain.com
- **GPG Key**: [Optional: YOUR_GPG_PUBLIC_KEY_ID or link to public key]
```

### 4. **CONTRIBUTING.md** (Line 50)
Replace:
- `YOUR_GITHUB_USERNAME` → Your GitHub username

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/social-media-cli.git
```

## 📝 Example Values

Here's how your updates might look:

### Example for User "john_doe"
```json
// package.json
"author": "John Doe <john.doe@example.com>",
"homepage": "https://github.com/john_doe/social-media-cli#readme",
"repository": {
  "url": "git+https://github.com/john_doe/social-media-cli.git"
},
"bugs": {
  "url": "https://github.com/john_doe/social-media-cli/issues"
}
```

```markdown
<!-- LICENSE -->
Copyright (c) 2025 John Doe

<!-- SECURITY.md -->
1. **Email**: Send details to security@johndoe.dev

<!-- CONTRIBUTING.md -->
git clone https://github.com/john_doe/social-media-cli.git
```

## 🚀 Quick Update Script

You can use this command to update all placeholders at once:

```bash
# Replace YOUR_NAME
sed -i '' 's/YOUR_NAME/John Doe/g' package.json LICENSE

# Replace YOUR_EMAIL  
sed -i '' 's/YOUR_EMAIL/john.doe@example.com/g' package.json

# Replace YOUR_GITHUB_USERNAME
sed -i '' 's/YOUR_GITHUB_USERNAME/john_doe/g' package.json CONTRIBUTING.md

# Replace YOUR_SECURITY_EMAIL@domain.com
sed -i '' 's/YOUR_SECURITY_EMAIL@domain.com/security@johndoe.dev/g' SECURITY.md
```

⚠️ **Important**: Replace the example values above with your actual information!

## ✅ Files Status

### ✅ Already Configured (No Action Needed)
- All source code files (TypeScript/JavaScript)
- Configuration files (tsconfig.json, jest.config.json, etc.)
- Documentation files (README.md, CHANGELOG.md, etc.)
- GitHub workflows and templates

### 🔄 Need Your Information
- [ ] package.json (author, repository URLs)
- [ ] LICENSE (copyright holder)
- [ ] SECURITY.md (contact email, optional GPG key)
- [ ] CONTRIBUTING.md (GitHub username in clone URL)

### 📋 Optional Updates
- [ ] .env.example (already has placeholder text - no changes needed)
- [ ] GPG Key information in SECURITY.md (optional for enhanced security)

## 🔒 Security Notes

- **Never commit actual API tokens** - the .env.example file already has safe placeholder text
- **Use a dedicated security email** if you plan to accept security reports
- **Consider setting up GPG signing** for enhanced security (optional)

## 📞 Next Steps

1. Update the 4 files listed above with your personal information
2. Test that the project builds successfully: `npm run build`
3. Run tests to ensure everything works: `npm test`
4. Create your GitHub repository and push the code
5. Delete this PERSONALIZATION_GUIDE.md file before publishing

---

**Note**: This guide can be deleted after you've completed the personalization updates.
