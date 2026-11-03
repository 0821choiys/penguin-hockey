package com.penguinhockey.game;

import android.app.Activity;
import android.os.Handler;
import android.os.Looper;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.ConsumeParams;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Google Play Billing for the 💎 Pro Pass (one-time consumable product "pro_pass", bought once per fish-pass season).
 * Implements the game's PHBilling contract: price(sku) → {value,currency,text}; buy(sku) → {token};
 * consume(token) → true; list() → [{sku,token}] (completed purchases not yet consumed).
 * The game grants a token once (save.pay.tok) and then consumes it; unconsumed purchases are restored at every start/resume.
 * Pending payments (cash, carrier) are never granted until Play reports them PURCHASED; then the game is told to restore.
 */
final class BillingBridge implements PurchasesUpdatedListener {
    interface Cb {
        void ok(Object data);

        void err(String name, String msg);
    }

    interface Events {
        void purchaseCompleted();
    }

    private final Activity act;
    private final Events events;
    private final Handler main = new Handler(Looper.getMainLooper());
    private final BillingClient client;
    private final Map<String, ProductDetails> details = new HashMap<>();
    private final List<Object[]> waiting = new ArrayList<>();   // {Cb, Runnable} until the connection is ready
    private boolean ready, connecting;
    private Cb buying;
    private String buyingSku;

    BillingBridge(Activity act, Events events) {
        this.act = act;
        this.events = events;
        client = BillingClient.newBuilder(act)
                .setListener(this)
                .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
                .enableAutoServiceReconnection()
                .build();
        connect();
    }

    private void connect() {
        if (connecting) return;
        connecting = true;
        client.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(@NonNull BillingResult r) {
                main.post(() -> {
                    connecting = false;
                    ready = r.getResponseCode() == BillingClient.BillingResponseCode.OK;
                    List<Object[]> w = new ArrayList<>(waiting);
                    waiting.clear();
                    for (Object[] x : w) {
                        if (ready) ((Runnable) x[1]).run();
                        else ((Cb) x[0]).err("Error", code(r));
                    }
                });
            }

            @Override
            public void onBillingServiceDisconnected() {
                main.post(() -> {
                    ready = false;
                    connecting = false;
                });
            }
        });
    }

    private void whenReady(Cb cb, Runnable r) {
        main.post(() -> {
            if (ready && client.isReady()) r.run();
            else {
                waiting.add(new Object[]{cb, r});
                connect();
            }
        });
    }

    private static String code(BillingResult r) {
        return "BILLING_" + r.getResponseCode() + (r.getDebugMessage().isEmpty() ? "" : " " + r.getDebugMessage());
    }

    private void productDetails(String sku, Cb cb, DetailsCb then) {
        ProductDetails cached = details.get(sku);
        if (cached != null) {
            then.got(cached);
            return;
        }
        QueryProductDetailsParams p = QueryProductDetailsParams.newBuilder()
                .setProductList(Collections.singletonList(QueryProductDetailsParams.Product.newBuilder()
                        .setProductId(sku).setProductType(BillingClient.ProductType.INAPP).build()))
                .build();
        client.queryProductDetailsAsync(p, (r, res) -> main.post(() -> {
            List<ProductDetails> l = res == null ? null : res.getProductDetailsList();
            if (r.getResponseCode() != BillingClient.BillingResponseCode.OK || l == null || l.isEmpty()) {
                cb.err("Error", r.getResponseCode() == BillingClient.BillingResponseCode.OK ? "PRODUCT_NOT_FOUND " + sku : code(r));
                return;
            }
            details.put(sku, l.get(0));
            then.got(l.get(0));
        }));
    }

    private interface DetailsCb {
        void got(ProductDetails d);
    }

    // ---------- PHBilling ----------
    void price(String sku, Cb cb) {
        whenReady(cb, () -> productDetails(sku, cb, d -> {
            ProductDetails.OneTimePurchaseOfferDetails o = d.getOneTimePurchaseOfferDetails();
            if (o == null) {
                cb.err("Error", "NO_PRICE");
                return;
            }
            try {
                cb.ok(new JSONObject()
                        .put("value", o.getPriceAmountMicros() / 1_000_000.0)
                        .put("currency", o.getPriceCurrencyCode())
                        .put("text", o.getFormattedPrice()));
            } catch (JSONException e) {
                cb.err("Error", "JSON");
            }
        }));
    }

    void buy(String sku, Cb cb) {
        whenReady(cb, () -> {
            if (buying != null) {
                cb.err("Error", "BUSY");
                return;
            }
            productDetails(sku, cb, d -> {
                BillingFlowParams f = BillingFlowParams.newBuilder()
                        .setProductDetailsParamsList(Collections.singletonList(
                                BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(d).build()))
                        .build();
                buying = cb;
                buyingSku = sku;
                BillingResult r = client.launchBillingFlow(act, f);
                int c = r.getResponseCode();
                if (c == BillingClient.BillingResponseCode.OK) return;   // the result comes in onPurchasesUpdated
                buying = null;
                if (c == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) resolveOwned(sku, cb);
                else if (c == BillingClient.BillingResponseCode.USER_CANCELED) cb.err("AbortError", "cancelled");
                else cb.err("Error", code(r));
            });
        });
    }

    void consume(String token, Cb cb) {
        whenReady(cb, () -> client.consumeAsync(ConsumeParams.newBuilder().setPurchaseToken(token).build(), (r, t) -> main.post(() -> {
            int c = r.getResponseCode();
            if (c == BillingClient.BillingResponseCode.OK || c == BillingClient.BillingResponseCode.ITEM_NOT_OWNED) cb.ok(true);
            else cb.err("Error", code(r));
        })));
    }

    void list(Cb cb) {
        whenReady(cb, () -> queryOwned(cb, l -> {
            JSONArray a = new JSONArray();
            for (Purchase p : l) {
                for (String sku : p.getProducts()) {
                    try {
                        a.put(new JSONObject().put("sku", sku).put("token", p.getPurchaseToken()));
                    } catch (JSONException ignored) {
                    }
                }
            }
            cb.ok(a);
        }));
    }

    private interface OwnedCb {
        void got(List<Purchase> purchased);
    }

    /** Completed (PURCHASED) one-time purchases still held by Play, i.e. not yet consumed. Pending ones are left out. */
    private void queryOwned(Cb cb, OwnedCb then) {
        client.queryPurchasesAsync(QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build(),
                (r, list) -> main.post(() -> {
                    if (r.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                        cb.err("Error", code(r));
                        return;
                    }
                    List<Purchase> out = new ArrayList<>();
                    if (list != null) for (Purchase p : list)
                        if (p.getPurchaseState() == Purchase.PurchaseState.PURCHASED) out.add(p);
                    then.got(out);
                }));
    }

    private void resolveOwned(String sku, Cb cb) {
        queryOwned(cb, l -> {
            for (Purchase p : l)
                if (p.getProducts().contains(sku)) {
                    okToken(cb, p.getPurchaseToken());
                    return;
                }
            cb.err("Error", "ALREADY_OWNED_NOT_FOUND");
        });
    }

    private static void okToken(Cb cb, String token) {
        try {
            cb.ok(new JSONObject().put("token", token));
        } catch (JSONException e) {
            cb.err("Error", "JSON");
        }
    }

    @Override
    public void onPurchasesUpdated(@NonNull BillingResult r, @Nullable List<Purchase> purchases) {
        main.post(() -> {
            Cb cb = buying;
            String sku = buyingSku;
            buying = null;
            buyingSku = null;
            int c = r.getResponseCode();
            if (c == BillingClient.BillingResponseCode.OK) {
                String token = null;
                boolean pending = false, other = false;
                if (purchases != null) for (Purchase p : purchases) {
                    boolean mine = sku != null && p.getProducts().contains(sku);
                    if (p.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                        if (mine) token = p.getPurchaseToken();
                        else other = true;
                    } else if (p.getPurchaseState() == Purchase.PurchaseState.PENDING && mine) pending = true;
                }
                if (cb == null) {   // a purchase completed outside a buy() call (pending payment approved later)
                    if (token != null || other) events.purchaseCompleted();
                    return;
                }
                if (token != null) okToken(cb, token);
                else if (pending) cb.err("Pending", "PENDING");
                else cb.err("Error", "NO_PURCHASE");
                if (other) events.purchaseCompleted();
            } else if (cb == null) {
                // nothing waiting
            } else if (c == BillingClient.BillingResponseCode.USER_CANCELED) {
                cb.err("AbortError", "cancelled");
            } else if (c == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED && sku != null) {
                resolveOwned(sku, cb);
            } else {
                cb.err("Error", code(r));
            }
        });
    }

    void end() {
        try {
            client.endConnection();
        } catch (RuntimeException ignored) {
        }
    }
}
