// =================================
// PART-1 : MUSIC FUNCTIONS
// =================================

const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const message = document.getElementById("message");

// Search music
function searchMusic() {
  const query = searchInput.value.trim();

  if (!query) {
    if (message) {
      message.innerText = "Please enter a song, artist or playlist name.";
    }
    return;
  }

  if (searchResults) {
    searchResults.innerHTML = `
      <div class="result-card">
        <h3>🔎 ${escapeHTML(query)}</h3>
        <p>Spotify search will be connected in the next step.</p>
        <button onclick="connectSpotify()">
          🎵 Connect Spotify
        </button>
      </div>
    `;
  }
}

// Enter key search
if (searchInput) {
  searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      searchMusic();
    }
  });
}

// Playlist selection
function showPlaylist(name) {
  const playlistMessage =
    document.getElementById("playlistMessage");

  if (playlistMessage) {
    playlistMessage.innerText =
      "🎵 Selected playlist: " + name;
  }
}

// Spotify connection placeholder
function connectSpotify() {
  const status =
    document.getElementById("loginStatus");

  if (status) {
    status.innerText =
      "Spotify connection will be added in the next step.";
  }
}

// Basic HTML protection
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
// =================================
// PART-2 : SPOTIFY PKCE LOGIN
// =================================

const SPOTIFY_CLIENT_ID =
  "25990c288ad444a7bd64b9c4563e5d65";

const REDIRECT_URI =
  "https://shawsachi0000-creator.github.io/spotify-music-web-/";

const SPOTIFY_SCOPES =
  "user-read-private user-read-email";


// Generate random PKCE verifier
function generateCodeVerifier(length = 64) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

  let result = "";

  const values = new Uint32Array(length);
  crypto.getRandomValues(values);

  for (let i = 0; i < length; i++) {
    result += chars[values[i] % chars.length];
  }

  return result;
}


// Create SHA-256 challenge
async function generateCodeChallenge(verifier) {

  const data =
    new TextEncoder().encode(verifier);

  const digest =
    await crypto.subtle.digest("SHA-256", data);

  const base64 =
    btoa(
      String.fromCharCode(...new Uint8Array(digest))
    );

  return base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}


// Start Spotify login
async function loginWithSpotify() {

  try {

    const codeVerifier =
      generateCodeVerifier();

    const codeChallenge =
      await generateCodeChallenge(codeVerifier);

    localStorage.setItem(
      "spotify_code_verifier",
      codeVerifier
    );

    const state =
      crypto.randomUUID();

    localStorage.setItem(
      "spotify_auth_state",
      state
    );

    const authUrl =
      new URL(
        "https://accounts.spotify.com/authorize"
      );

    authUrl.search =
      new URLSearchParams({

        response_type: "code",

        client_id:
          SPOTIFY_CLIENT_ID,

        scope:
          SPOTIFY_SCOPES,

        redirect_uri:
          REDIRECT_URI,

        state:
          state,

        code_challenge_method:
          "S256",

        code_challenge:
          codeChallenge

      }).toString();

    window.location.href =
      authUrl.toString();

  } catch (error) {

    console.error(error);

    const status =
      document.getElementById("loginStatus");

    if (status) {
      status.innerText =
        "Spotify login start नहीं हो पाया।";
    }
  }
}
