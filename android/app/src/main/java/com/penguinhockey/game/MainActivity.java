package com.penguinhockey.game;

import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.FrameLayout;
import android.widget.TextView;

import androidx.activity.ComponentActivity;
import androidx.activity.OnBackPressedCallback;
import androidx.annotation.NonNull;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import androidx.webkit.JavaScriptReplyProxy;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewClientCompat;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Collections;
import java.util.Set;

/**
 * Penguin Hockey: a full-screen WebView that runs the single-file game from the app's assets.
 *
 * The page is served from https://appassets.androidplatform.net/assets/index.html (WebViewAssetLoader), so it has a
 * stable https origin (localStorage saves survive, no file:// quirks). The game talks to the app only through the
 * "PHAndroid" web-message listener, which is injected for that origin alone (see v28_app.js for the message format).
 */
public class MainActivity extends ComponentActivity {
    static final String ORIGIN = "https://appassets.androidplatform.net";
    static final String START_URL = ORIGIN + "/assets/index.html";
    static final Set<String> ALLOWED = Collections.singleton(ORIGIN);

    private final Handler main = new Handler(Looper.getMainLooper());
    private WebView web;
    private JavaScriptReplyProxy reply;
    private BillingBridge billing;
    private SaveStore saves;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(0xFF071426);
        try {
            web = new WebView(this);
        } catch (RuntimeException e) {   // WebView missing / being updated
            TextView t = new TextView(this);
            t.setText(R.string.no_webview);
            t.setTextColor(Color.WHITE);
            t.setPadding(48, 48, 48, 48);
            root.addView(t);
            setContentView(root);
            return;
        }
        web.setBackgroundColor(0xFF071426);
        root.addView(web, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(root);

        // keep the game out of camera cutouts and (when shown) the system bars
        ViewCompat.setOnApplyWindowInsetsListener(root, (v, insets) -> {
            Insets i = insets.getInsets(WindowInsetsCompat.Type.displayCutout() | WindowInsetsCompat.Type.systemBars());
            v.setPadding(i.left, i.top, i.right, i.bottom);
            return WindowInsetsCompat.CONSUMED;
        });
        hideSystemBars();

        saves = new SaveStore(getFilesDir());
        setupWebView();
        billing = new BillingBridge(this, () -> send(event("purchase")));

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                web.evaluateJavascript("(function(){try{return window.phBack?phBack():'exit'}catch(e){return 'exit'}})()", r -> {
                    if ("\"exit\"".equals(r)) finish();
                });
            }
        });

        web.loadUrl(START_URL);
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void setupWebView() {
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setTextZoom(100);
        s.setUserAgentString(s.getUserAgentString() + " PenguinHockeyApp/" + BuildConfig.VERSION_NAME);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.setVerticalScrollBarEnabled(false);
        web.setHorizontalScrollBarEnabled(false);
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG);

        final WebViewAssetLoader assets = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();
        web.setWebViewClient(new WebViewClientCompat() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                return assets.shouldInterceptRequest(req.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(@NonNull WebView view, @NonNull WebResourceRequest req) {
                Uri u = req.getUrl();
                if ("appassets.androidplatform.net".equals(u.getHost())) return false;
                // any other link (privacy policy, store page …) opens outside the game
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, u));
                } catch (ActivityNotFoundException ignored) {
                }
                return true;
            }

            @Override
            public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                // the page crashed or was killed for memory: start fresh instead of crashing the app (the save is in localStorage)
                ((ViewGroup) view.getParent()).removeView(view);
                view.destroy();
                web = null;
                recreate();
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient());

        if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
            WebViewCompat.addWebMessageListener(web, "PHAndroid", ALLOWED, (view, message, origin, isMainFrame, proxy) -> {
                if (!isMainFrame || message.getData() == null) return;
                reply = proxy;
                onMessage(message.getData());
            });
        }
        // a save kept by the app (Auto Backup / new phone) is put back before the game reads localStorage
        if (WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
            String js = saves.restoreScript();
            if (js != null) WebViewCompat.addDocumentStartJavaScript(web, js, ALLOWED);
        }
    }

    // ---------- messages from the game ----------
    private void onMessage(String raw) {
        final JSONObject m;
        try {
            m = new JSONObject(raw);
        } catch (JSONException e) {
            return;
        }
        final int id = m.optInt("id", 0);
        final String op = m.optString("op");
        BillingBridge.Cb cb = new BillingBridge.Cb() {
            @Override
            public void ok(Object data) {
                if (id == 0) return;
                try {
                    JSONObject o = new JSONObject().put("id", id).put("ok", true);
                    if (data != null) o.put("data", data);
                    send(o);
                } catch (JSONException ignored) {
                }
            }

            @Override
            public void err(String name, String msg) {
                if (id == 0) return;
                try {
                    send(new JSONObject().put("id", id).put("ok", false).put("name", name).put("err", msg));
                } catch (JSONException ignored) {
                }
            }
        };
        switch (op) {
            case "price": billing.price(m.optString("arg"), cb); break;
            case "buy": billing.buy(m.optString("arg"), cb); break;
            case "consume": billing.consume(m.optString("arg"), cb); break;
            case "list": billing.list(cb); break;
            case "vib": vibrate(m.optJSONArray("arg")); break;
            case "save": {
                JSONObject a = m.optJSONObject("arg");
                if (a != null) saves.write(a.optString("save", ""), a.optString("lang", ""));
                break;
            }
            case "exit": finish(); break;
            default: cb.err("Error", "unknown op " + op);
        }
    }

    private static JSONObject event(String name) {
        try {
            return new JSONObject().put("ev", name);
        } catch (JSONException e) {
            return new JSONObject();
        }
    }

    @SuppressLint("RequiresFeature")   // reply only exists when WEB_MESSAGE_LISTENER is supported (checked again below)
    void send(JSONObject o) {
        main.post(() -> {
            if (reply == null || web == null || !WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) return;
            try {
                reply.postMessage(o.toString());
            } catch (RuntimeException ignored) {
            }
        });
    }

    private void vibrate(JSONArray a) {
        if (a == null || a.length() == 0) return;
        long[] t = new long[a.length() + 1];   // navigator.vibrate: on, off, on…  →  Android waveform: delay, on, off…
        long sum = 0;
        for (int i = 0; i < a.length(); i++) {
            t[i + 1] = Math.max(0, Math.min(1000, a.optLong(i)));
            sum += t[i + 1];
        }
        if (sum == 0) return;
        Vibrator v;
        if (Build.VERSION.SDK_INT >= 31) {
            VibratorManager vm = (VibratorManager) getSystemService(VIBRATOR_MANAGER_SERVICE);
            v = vm == null ? null : vm.getDefaultVibrator();
        } else {
            v = (Vibrator) getSystemService(VIBRATOR_SERVICE);
        }
        if (v == null || !v.hasVibrator()) return;
        try {
            if (Build.VERSION.SDK_INT >= 26) v.vibrate(VibrationEffect.createWaveform(t, -1));
            else v.vibrate(t, -1);
        } catch (RuntimeException ignored) {
        }
    }

    private void hideSystemBars() {
        WindowInsetsControllerCompat c = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        c.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        c.hide(WindowInsetsCompat.Type.systemBars());
    }

    // ---------- lifecycle ----------
    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    @Override
    protected void onPause() {
        if (web != null) {
            web.evaluateJavascript("window.phPause&&phPause()", null);   // pause the match, mute, mirror the save
            web.onPause();
        }
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) {
            web.onResume();
            web.evaluateJavascript("window.phResume&&phResume()", null);   // sound back on, restore any finished purchase
        }
    }

    @Override
    protected void onDestroy() {
        if (billing != null) billing.end();
        if (web != null) {
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }
}
