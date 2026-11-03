import java.util.Properties

plugins { id("com.android.application") }

// Release signing (upload key): put keystore.properties next to settings.gradle.kts (never commit it)
//   storeFile=/absolute/path/upload.jks  storePassword=…  keyAlias=upload  keyPassword=…
val ksFile = rootProject.file("keystore.properties")
val ks = Properties().apply { if (ksFile.exists()) ksFile.inputStream().use { load(it) } }

android {
    namespace = "com.penguinhockey.game"
    compileSdk = 36

    defaultConfig {
        // The Play Store package name. It can never change after the first upload — confirm before uploading.
        applicationId = (project.findProperty("APP_ID") as String?) ?: "com.penguinhockey.game"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0.0"
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

// The game itself: the built single-file HTML from the repo root (python3 apply_v10.py) becomes assets/index.html
val copyGame by tasks.registering(Copy::class) {
    from(rootProject.file("../penguin-hockey-improved.html"))
    into(layout.projectDirectory.dir("src/main/assets"))
    rename { "index.html" }
}
tasks.named("preBuild") { dependsOn(copyGame) }

dependencies {
    implementation("com.android.billingclient:billing:9.1.0")
    implementation("androidx.webkit:webkit:1.18.0")
    implementation("androidx.activity:activity:1.11.0")
    implementation("androidx.core:core:1.17.0")
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.json:json:20250517")   // real org.json for JVM unit tests (android.jar only has stubs)
}
