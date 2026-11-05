package com.penguinhockey.game;

import android.app.Activity;
import android.os.CancellationSignal;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.credentials.ClearCredentialStateRequest;
import androidx.credentials.Credential;
import androidx.credentials.CredentialManager;
import androidx.credentials.CredentialManagerCallback;
import androidx.credentials.CustomCredential;
import androidx.credentials.GetCredentialRequest;
import androidx.credentials.GetCredentialResponse;
import androidx.credentials.exceptions.ClearCredentialException;
import androidx.credentials.exceptions.GetCredentialCancellationException;
import androidx.credentials.exceptions.GetCredentialException;
import androidx.credentials.exceptions.NoCredentialException;

import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption;
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * "Sign in with Google" for the cloud save (v35_acct.js). Credential Manager shows Google's own account picker and
 * returns a Google ID token for the game's OAuth web client ID; the game exchanges it with Firebase Auth itself.
 * Nothing is stored here. op 'gsignin' {cid} → {idToken,email,name};  op 'gsignout' clears the picker's remembered choice.
 */
final class GoogleAuth {
    private final Activity act;
    private final CredentialManager cm;

    GoogleAuth(Activity act) {
        this.act = act;
        this.cm = CredentialManager.create(act);
    }

    /** True for a client ID of the form …apps.googleusercontent.com (anything else is refused before Google sees it). */
    static boolean validClientId(String cid) {
        return cid != null && cid.length() < 200 && cid.matches("[0-9A-Za-z._-]+\\.apps\\.googleusercontent\\.com");
    }

    void signIn(JSONObject arg, BillingBridge.Cb cb) {
        String cid = arg == null ? null : arg.optString("cid", null);
        if (!validClientId(cid)) {
            cb.err("Error", "no client id");
            return;
        }
        GetSignInWithGoogleOption opt = new GetSignInWithGoogleOption.Builder(cid).build();
        GetCredentialRequest req = new GetCredentialRequest.Builder().addCredentialOption(opt).build();
        cm.getCredentialAsync(act, req, new CancellationSignal(), ContextCompat.getMainExecutor(act),
                new CredentialManagerCallback<GetCredentialResponse, GetCredentialException>() {
                    @Override
                    public void onResult(GetCredentialResponse r) {
                        Credential c = r.getCredential();
                        if (c instanceof CustomCredential
                                && GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL.equals(c.getType())) {
                            try {
                                GoogleIdTokenCredential g = GoogleIdTokenCredential.createFrom(c.getData());
                                JSONObject o = new JSONObject().put("idToken", g.getIdToken()).put("email", g.getId());
                                if (g.getDisplayName() != null) o.put("name", g.getDisplayName());
                                cb.ok(o);
                            } catch (JSONException | RuntimeException e) {
                                cb.err("Error", "bad credential");
                            }
                        } else {
                            cb.err("Error", "unexpected credential");
                        }
                    }

                    @Override
                    public void onError(@NonNull GetCredentialException e) {
                        if (e instanceof GetCredentialCancellationException) cb.err("Cancel", "cancel");
                        else if (e instanceof NoCredentialException) cb.err("Error", "no google account");
                        else cb.err("Error", String.valueOf(e.getMessage()));
                    }
                });
    }

    void signOut(BillingBridge.Cb cb) {
        cm.clearCredentialStateAsync(new ClearCredentialStateRequest(), new CancellationSignal(), ContextCompat.getMainExecutor(act),
                new CredentialManagerCallback<Void, ClearCredentialException>() {
                    @Override
                    public void onResult(Void v) {
                        cb.ok(null);
                    }

                    @Override
                    public void onError(@NonNull ClearCredentialException e) {
                        cb.ok(null);
                    }
                });
    }
}
