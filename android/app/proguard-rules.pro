# Play Billing ships its own consumer rules. Only Credential Manager (below) needs a keep rule.

# Credential Manager finds its Play services provider by reflection
-if class androidx.credentials.CredentialManager
-keep class androidx.credentials.playservices.** {
  *;
}
