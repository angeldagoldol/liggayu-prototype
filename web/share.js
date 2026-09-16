"use strict";

// Link generation only: no Google API keys, Gmail permissions or automatic sending.
globalThis.ScoreDeskSharing = Object.freeze({
  publicWebsiteUrl(value) {
    if (typeof value !== "string" || !value) return null;
    try {
      const url = new URL(value);
      const host = url.hostname.toLowerCase();
      // Do not create emails with localhost or private-network addresses.
      const privateHost = host === "localhost" || host.endsWith(".localhost")
        || host.endsWith(".local") || !host.includes(".") || host.includes(":")
        || /^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host)
        || /^172\.(1[6-9]|2\d|3[01])\./.test(host);
      if (url.protocol !== "https:" || privateHost || url.username || url.password) return null;
      return `${url.origin}/`;
    } catch {
      return null;
    }
  },

  gmailUrl(value) {
    const website = this.publicWebsiteUrl(value);
    if (!website) return null;
    const compose = new URL("https://mail.google.com/mail/");
    compose.searchParams.set("view", "cm");
    compose.searchParams.set("fs", "1");
    compose.searchParams.set("su", "ScoreDesk - Student Score Management System");
    compose.searchParams.set("body", [
      "Hello,",
      "",
      "Here is the ScoreDesk Student Score Management System:",
      website,
      "",
      "It demonstrates Java arrays, three-score averages, highest/lowest scorers and a printable report.",
      "This is a public classroom demo. Use fictional student information only.",
      "Records are shared and temporary; the link is not a saved copy of a report.",
      "",
      "Thank you!"
    ].join("\n"));
    return compose.href;
  }
});
