# Introduction to TurboDev (beta)

TurboDev is a custom extension for TurboWarp or other Scratch mods that is meant to be the successor to TurboWarp's built-in terminal. You can control your projects with custom commands, view your project's insights, and control custom settings that you assign for other developers to build on your game.

## Who is it for?

TurboDev is built for the average power-user who wants something better than TurboWarp's built-in 'console'.

> Fun Fact: TurboDev was initially built because of the developer's frustration with TurboWarp's console UI.

## Key features

- **Interactive CLI**: Register custom commands with argument parsing, history navigation, and tab completion.
- **Performance monitor**: Real-time graphs for FPS, Clone Count, and Thread usage.
- **Async queries**: Pause your project script to ask the user for input (Text, Number, Boolean, or Confirmation) directly in the console.
- **Settings engine**: Create persistent toggles, sliders, and text inputs that users can adjust to modify your game's behavior.
- **Rich logging**: "Build-your-own-logs" architecture with inline styling.

## How do I use it?

TurboDev boasts an easy-to-use registration mechanism to set up your game's custom commands and settings, and has a "build-your-own-logs" architecture for logging.

### Logging syntax

- `@c #hex:text@c` -- Colors the text inside it.
- `@h #hex:text@h` -- Highlight the text inside it.
- `@b:text@b` -- Apply boldness to the text inside it.
- `@i:text@i` -- Apply italics to the text inside it.

## Installing TurboDev

First, download the latest TurboDev build over at the Releases page. The installation process for TurboDev is quite simple:

1. Open [TurboWarp](https://turbowarp.org/editor)
2. Click the 'Add extension' button (the puzzle piece and the plus icon)
3. Search for 'Custom Extension' and click on its result
4. Click 'Files' and 'No files selected'
5. When your file explorer of choice opens, find the downloaded file and double-click it

You're done!
