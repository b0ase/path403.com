# Project Image Generation Script

This script generates professional images for the service project showcases using the Stability AI API. The images are saved to the appropriate directories in `/public/images/services/` and used in the respective service pages.

## Prerequisites

- Node.js installed
- Stability AI API key
- Required NPM packages: `axios`, `fs`, and `path`

## Setup

1. Install the required packages:
   ```
   npm install axios
   ```

2. Set up your Stability AI API key:
   - Create a `.env.local` file in the root of your project
   - Add your API key: `STABILITY_AI_API=your-api-key-here`
   - Make sure `.env.local` is in your `.gitignore` file to keep your API key private

## Usage

To generate the images for all service projects:

```
# First, set the environment variable
export STABILITY_AI_API=your-api-key-here

# Then run the script
node scripts/generate-service-images.js
```

## Image Configuration

The script is configured to generate 9 images across three service categories:

### Web Development
- E-commerce Platform
- Corporate Web Portal
- Progressive Web App

### Software Development
- Crypto Trading Platform
- Smart Contract Audit Tool
- AI-Powered Analytics Dashboard

### Content Copywriting
- Tech Industry Whitepaper
- E-commerce Product Descriptions
- Finance Blog Series

## Image Storage

Generated images are saved to:
- `/public/images/services/web-development/`
- `/public/images/services/software-development/`
- `/public/images/services/content-copywriting/`

## Implementation

The images are displayed in the service pages using the `ProjectImage` component, which handles fallback behavior if an image is not yet generated.

## Notes

- Images are only generated once; the script checks if an image already exists before making an API call
- The Stability AI API has usage limits; check your account for details
- Image prompts can be adjusted in the script to generate different visual styles 