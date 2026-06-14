# Android Publishing Guide

This guide covers the standard Android release flow for the mobile app in this repository.

## 1. Prerequisites

- Android Studio and the Android SDK installed
- A JDK compatible with the project toolchain
- The app dependencies installed and the Android project able to build locally
- A Google Play Console account for production distribution

## 2. Prepare a release keystore

Create and store a signing keystore in a secure location outside the repository.

Example:

```bash
keytool -genkeypair -v -keystore release-key.jks -alias release -keyalg RSA -keysize 2048 -validity 10000
```

Keep these values private:

- Keystore file path
- Keystore password
- Key alias
- Key password

## 3. Configure app signing

Update the Android Gradle configuration so the release build uses the keystore.

Typical files:

- `android/gradle.properties`
- `android/app/build.gradle`
- `android/app/src/main/AndroidManifest.xml`

Recommended approach:

1. Store signing secrets in `gradle.properties` or environment variables, not in source control.
2. Add a `release` signing config in `android/app/build.gradle`.
3. Make sure the release build type points to that signing config.
4. Verify the application id and versioning before publishing.

Example signing config shape:

```gradle
android {
    signingConfigs {
        release {
            storeFile file(RELEASE_STORE_FILE)
            storePassword RELEASE_STORE_PASSWORD
            keyAlias RELEASE_KEY_ALIAS
            keyPassword RELEASE_KEY_PASSWORD
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            shrinkResources false
        }
    }
}
```

Use this as the concrete release setup when wiring the app:

`android/gradle.properties`

```properties
RELEASE_STORE_FILE=release-key.jks
RELEASE_STORE_PASSWORD=your-store-password
RELEASE_KEY_ALIAS=release
RELEASE_KEY_PASSWORD=your-key-password
```

`android/app/build.gradle`

```gradle
android {
    defaultConfig {
        versionCode 1
        versionName "1.0.0"
    }

    signingConfigs {
        release {
            storeFile file(RELEASE_STORE_FILE)
            storePassword RELEASE_STORE_PASSWORD
            keyAlias RELEASE_KEY_ALIAS
            keyPassword RELEASE_KEY_PASSWORD
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            shrinkResources false
        }
    }
}
```

If your app uses environment-specific endpoints, keep those in your app config layer or build-time variables rather than hard-coding them into the manifest.

## 4. Set versioning

Before each store release, increment the app version.

- `versionCode` must increase for every Play Store upload
- `versionName` should reflect the human-readable release version

## 5. Build the release artifact

Prefer an Android App Bundle for Google Play distribution.

Common commands:

```bash
cd android
./gradlew clean bundleRelease
```

If you need an APK for internal testing, build the release APK instead:

```bash
cd android
./gradlew clean assembleRelease
```

Artifacts are usually generated under:

- `android/app/build/outputs/bundle/release/`
- `android/app/build/outputs/apk/release/`

## 6. Validate the release build

Before uploading, check the following:

- The app launches on a real device or emulator
- Login and core flows work in release mode
- Environment variables and API endpoints point to production or staging as intended
- No debug logging or test credentials remain enabled
- The app icon, name, and splash screen are correct

## 7. Upload to Google Play

1. Sign in to Google Play Console.
2. Open the app record.
3. Create or update the release track you want to use.
4. Upload the `.aab` file from the release build.
5. Add release notes.
6. Review warnings and complete the rollout.

## 8. Recommended release checklist

- Bump `versionCode` and `versionName`
- Confirm the signing keystore is available
- Run a clean release build locally
- Test the artifact on at least one Android device
- Verify backend endpoints and auth settings
- Upload the bundle to the correct Play track

## 9. Troubleshooting

- If Gradle cannot find the keystore, verify the file path and secret values.
- If Play Console rejects the build, check that `versionCode` is higher than the previous upload.
- If the app crashes only in release mode, review ProGuard or R8 rules and any release-only environment settings.
- If native dependencies fail to compile, run a clean rebuild from `android/`.

## 10. Release notes template

Use a short, clear summary for each production release:

```text
Release 1.0.0

- Improved login flow
- Fixed payment screen stability
- Updated Android release configuration
```
