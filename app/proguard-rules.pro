# ===========================
# ProGuard Rules - InfinitePacMan
# ===========================

# Mantener MainActivity y clases de la app
-keep class ar.com.solucionespsg.InfinitePacMan.** { *; }

# ===========================
# ANDROID / ANDROIDX
# ===========================
-keep class androidx.** { *; }
-keep interface androidx.** { *; }
-dontwarn androidx.**

# Activity
-keep public class * extends android.app.Activity
-keep public class * extends android.webkit.WebViewClient

# WebView con JavaScript habilitado
-keepclassmembers class * extends android.webkit.WebViewClient {
    public void *(android.webkit.WebView, java.lang.String, android.graphics.Bitmap);
    public boolean *(android.webkit.WebView, java.lang.String);
}
-keepclassmembers class * extends android.webkit.WebChromeClient {
    public void *(android.webkit.WebView, java.lang.String);
}

# Interfaces JavaScript (si se agregan en el futuro)
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ===========================
# GOOGLE MOBILE ADS (AdMob)
# ===========================
-keep class com.google.android.gms.ads.** { *; }
-keep class com.google.ads.** { *; }
-dontwarn com.google.android.gms.ads.**
-dontwarn com.google.ads.**

# Mediation adapters
-keep class com.google.android.gms.ads.mediation.** { *; }
-keep class com.google.android.gms.common.** { *; }
-dontwarn com.google.android.gms.**

# ===========================
# KOTLIN
# ===========================
-keep class kotlin.** { *; }
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**
-keepclassmembers class **$WhenMappings {
    <fields>;
}
-keepclassmembers class kotlin.Lazy {
    <methods>;
}

# Coroutines
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}
-dontwarn kotlinx.coroutines.**

# ===========================
# GENERALES
# ===========================
# Mantener anotaciones en tiempo de ejecucion
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keepattributes Signature
-keepattributes Exceptions

# Evitar ofuscacion de clases serializables
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Evitar warnings de librerias externas
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**
-dontwarn javax.annotation.**
