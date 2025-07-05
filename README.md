# Paste Extension

This is a simple browser extension for Chrome and Firefox. It lets you manage a list of text snippets and quickly paste them into editable fields via a context menu.

## Development

The extension uses Manifest V2 so it works in both Chrome and Firefox without extra flags.

## Building and Testing

No build step is required. To test the extension:

1. Run `npm test` if available (none provided).
2. Load the extension in your browser's extension page.

## Usage

1. Open the extension settings to add, edit, or delete values.
2. Right click on an input or textarea and choose **Paste** then the desired value.
3. You can also pick **Random email** to insert a generated email address.
