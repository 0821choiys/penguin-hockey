package com.penguinhockey.game;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class GoogleAuthTest {
    @Test
    public void clientIdShape() {
        assertTrue(GoogleAuth.validClientId("1234567890-abc123def.apps.googleusercontent.com"));
        assertFalse(GoogleAuth.validClientId(null));
        assertFalse(GoogleAuth.validClientId(""));
        assertFalse(GoogleAuth.validClientId("evil.example.com"));
        assertFalse(GoogleAuth.validClientId("x.apps.googleusercontent.com.evil.com"));
        assertFalse(GoogleAuth.validClientId("a b.apps.googleusercontent.com"));
    }
}
