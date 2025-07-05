# Paste Extension

This is a simple browser extension for Chrome and Firefox. It lets you manage a list of text snippets and quickly paste them into editable fields via a context menu.

## Development

The extension now uses Manifest V3 and the background logic runs in a service worker. Ensure your browser supports Manifest V3.

## Building and Testing

No build step is required. To test the extension:

1. Run `npm test` if available (none provided).
2. Load the extension in your browser's extension page.

## Usage

1. Open the extension settings to add, edit, or delete values.
2. Right click on an input or textarea and choose **Paste** then the desired value.
3. When adding a new value choose **Random email** to generate a random email using a specified domain.
4. You can also select **Random number** and provide a **From** and **To** range.
   Pasting that entry will insert a random number within the chosen range.
