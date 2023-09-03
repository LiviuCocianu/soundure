# Soundure

Soundure is a music player app for offline music playback. General features, such as playlist creation/management, a music player interface and track management are all present, but I've also added a quality-of-life feature that I personally felt the need of while listening to music on existing apps: dynamic volume.

Dynamic volume automatically adjusts the volume of the currently playing track, depending on surrounding noise. I was inspired to implement this feature one day while I was listening to music in a noisy train

<br/>

<img src="https://github.com/LiviuCocianu/soundure/assets/98024494/83f7bef1-ccb7-4356-8a95-23519d013b62" />

## Acknowledgements
Even though this app was developed with React Native, I've only tested it on Android

## Features
* Playlist creation
* Track upload from devide and external
* Track and playlist editing
* Different kinds of playlist shuffling
* Dynamic volume adjusting
* Daily inspirational quotes in the home screen ([used API](https://api-ninjas.com/api/quotes))

## Building
1. Clone the project with `git clone https://github.com/LiviuCocianu/soundure.git`
2. Open a terminal of your choice and navigate to the cloned directory
3. Install the required packages with `npm i`

You will need an Expo account before proceeding to the next steps, you can [make one](https://expo.dev/signup) for free

4. Install the Expo Application Services (EAS) client with `npm install -g eas-cli`
5. Log into the Expo account you just made with `eas login`
6. Build the APK file with `eas build --platform android --profile production`. You will be put in a waiting queue, since Expo gives priority to paying users, then the app will be built on their servers. A link to the build progress and download section will be generated for you in the terminal! **As of the date this README was written at, Expo gives 30 Android builds/month to non-paying users**

## Download prebuilt APK
If you don't want to follow the lengthy steps above to build your own APK, or if they don't work anymore, you can try this demo I've compiled

([Download from Google Drive](https://drive.google.com/drive/folders/1AJvdtAOeotfFaPB6cekCwQ-jja-erjzP?usp=sharing))

([Download from MediaFire](https://www.mediafire.com/file/8d1qddfomheetuu/soundure-release.rar/file))
