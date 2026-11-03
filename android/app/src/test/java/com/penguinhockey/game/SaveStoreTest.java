package com.penguinhockey.game;

import static org.junit.Assert.*;

import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

public class SaveStoreTest {
    @Rule public TemporaryFolder tmp = new TemporaryFolder();

    @Test public void noCopyNoScript() throws Exception {
        assertNull(new SaveStore(tmp.newFolder()).restoreScript());
    }

    @Test public void onlyRealSavesAreKept() throws Exception {
        File d = tmp.newFolder();
        SaveStore s = new SaveStore(d);
        s.write("not json", "ko");
        s.write("{\"x\":1}", "ko");
        s.write("", "ko");
        assertNull(s.restoreScript());
        assertFalse(new File(d, "save.json.tmp").exists());
    }

    /** The script is written to build/savestore-script.js; tools/savestore-check.js runs it against a fake localStorage. */
    @Test public void scriptRestoresTheExactSave() throws Exception {
        File d = tmp.newFolder();
        SaveStore s = new SaveStore(d);
        String save = "{\"v\":10,\"name\":\"펭귄 '\\\"</script>\\u2028\",\"pay\":{\"tok\":[\"a\"]}}";
        s.write(save, "ja");
        String js = s.restoreScript();
        assertNotNull(js);
        assertTrue(js.startsWith("(function(){"));
        File out = new File("build/savestore-script.js");
        Files.write(out.toPath(), ("module.exports={save:" + org.json.JSONObject.quote(save) + ",js:" + org.json.JSONObject.quote(js) + "};").getBytes(StandardCharsets.UTF_8));
        // a newer save replaces the copy
        s.write("{\"v\":11}", "en");
        assertTrue(s.restoreScript().contains("v\\\":11"));
    }
}
