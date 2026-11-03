package com.penguinhockey.game;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * A copy of the game's save (localStorage "penguinHockey.v1" and the language) in files/save.json.
 * Only this file is in Android Auto Backup (res/xml/*_rules.xml), so a reinstall or a new phone gets the save back:
 * at start, if the page's localStorage has no save, the copy is written into it before the game loads.
 */
final class SaveStore {
    private static final int MAX = 4 * 1024 * 1024;
    private final File file;

    SaveStore(File filesDir) {
        file = new File(filesDir, "save.json");
    }

    synchronized void write(String save, String lang) {
        if (save == null || save.isEmpty() || save.length() > MAX) return;
        try {
            if (!(new JSONObject(save).has("v"))) return;   // only a real game save
            byte[] b = new JSONObject().put("save", save).put("lang", lang == null ? "" : lang)
                    .put("t", System.currentTimeMillis()).toString().getBytes(StandardCharsets.UTF_8);
            File tmp = new File(file.getPath() + ".tmp");
            try (FileOutputStream o = new FileOutputStream(tmp)) {
                o.write(b);
                o.getFD().sync();
            }
            if (!tmp.renameTo(file)) tmp.delete();
        } catch (JSONException | IOException ignored) {
        }
    }

    /** Script run at document start (before the game) or null when there is no saved copy. */
    synchronized String restoreScript() {
        if (!file.isFile() || file.length() > MAX * 2L) return null;
        try (FileInputStream in = new FileInputStream(file)) {
            byte[] b = new byte[(int) file.length()];
            int n = 0;
            while (n < b.length) {
                int r = in.read(b, n, b.length - n);
                if (r < 0) break;
                n += r;
            }
            JSONObject d = new JSONObject(new String(b, 0, n, StandardCharsets.UTF_8));
            String save = d.optString("save", ""), lang = d.optString("lang", "");
            if (save.isEmpty()) return null;
            return "(function(){try{var S=" + JSONObject.quote(save) + ",L=" + JSONObject.quote(lang) + ";"
                    + "if(!localStorage.getItem('penguinHockey.v1'))localStorage.setItem('penguinHockey.v1',S);"
                    + "if(L&&!localStorage.getItem('penguinHockey.lang'))localStorage.setItem('penguinHockey.lang',L);"
                    + "}catch(e){}})();";
        } catch (IOException | JSONException e) {
            return null;
        }
    }
}
