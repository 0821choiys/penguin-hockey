import java.util.Properties

plugins { id("com.android.application") }

// Release signing (upload key): put keystore.properties next to settings.gradle.kts (never commit it)
//   storeFile=/absolute/path/upload.jks  storePassword=…  keyAlias=upload  keyPassword=…
val ksFile = rootProject.file("keystore.properties")
val ks = Properties().apply { if (ksFile.exists()) ksFile.inputStream().use { load(it) } }

android {
    namespace = "com.penguinhockey.game"   // Java package of the code only; the Play Store ID is applicationId below
    compileSdk = 36

    defaultConfig {
        // The Play Store package name. It can never change after the first upload — confirm before uploading.
        applicationId = (project.findProperty("APP_ID") as String?) ?: "com.ysgames.penguingame"
        minSdk = 24
        targetSdk = 36
        versionCode = 2   // every AAB given to the owner gets a higher code (Play rejects a code it has seen)
        versionName = "1.1.0"
    }

    signingConfigs {
        if (ks.getProperty("storeFile") != null) create("upload") {
            storeFile = file(ks.getProperty("storeFile"))
            storePassword = ks.getProperty("storePassword")
            keyAlias = ks.getProperty("keyAlias")
            keyPassword = ks.getProperty("keyPassword")
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            if (ks.getProperty("storeFile") != null) signingConfig = signingConfigs.getByName("upload")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    buildFeatures { buildConfig = true }
    // the game is in Korean, English, Chinese and Japanese: keep only those translations of library strings
    androidResources { localeFilters += listOf("en", "ko", "zh", "ja") }
}

// The game itself: the built single-file HTML from the repo root becomes assets/index.html, with its fonts bundled
// (no Google Fonts requests in the app; see tools/bundle_fonts.py). Run `python3 apply_v10.py` first.
val bundleGame by tasks.registering(Exec::class) {
    val game = rootProject.file("../penguin-hockey-improved.html")
    val assets = layout.projectDirectory.dir("src/main/assets").asFile
    val fontsource = rootProject.file("../br/node_modules/@fontsource")
    inputs.file(game)
    inputs.file(rootProject.file("tools/bundle_fonts.py"))
    outputs.dir(assets)
    commandLine("python3", rootProject.file("tools/bundle_fonts.py").absolutePath,
        game.absolutePath, fontsource.absolutePath, assets.absolutePath)
}
tasks.named("preBuild") { dependsOn(bundleGame) }

dependencies {
    implementation("com.android.billingclient:billing:9.1.0")
    implementation("androidx.webkit:webkit:1.18.0")
    implementation("androidx.activity:activity:1.11.0")
    implementation("androidx.core:core:1.17.0")
    // Sign in with Google (cloud save): Credential Manager + Google ID token
    implementation("androidx.credentials:credentials:1.5.0")
    implementation("androidx.credentials:credentials-play-services-auth:1.5.0")
    implementation("com.google.android.libraries.identity.googleid:googleid:1.1.1")
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.json:json:20250517")   // real org.json for JVM unit tests (android.jar only has stubs)
}
