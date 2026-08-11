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

  function connectSpotify() {
  loginWithSpotify();
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
// =================================
// PART-3 : SPOTIFY TOKEN
// =================================

async function handleSpotifyCallback() {

  const params = new URLSearchParams(
    window.location.search
  );

  const code = params.get("code");
  const returnedState = params.get("state");
  const savedState =
    localStorage.getItem("spotify_auth_state");

  // No Spotify callback
  if (!code) {
    return;
  }

  // Check state
  if (!returnedState || returnedState !== savedState) {

    console.error("Spotify state mismatch.");

    const status =
      document.getElementById("loginStatus");

    if (status) {
      status.innerText =
        "Spotify login verification failed.";
    }

    return;
  }

  const codeVerifier =
    localStorage.getItem(
      "spotify_code_verifier"
    );

  if (!codeVerifier) {

    console.error(
      "PKCE code verifier not found."
    );

    return;
  }

  try {

    const response = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded"
        },

        body: new URLSearchParams({

          client_id:
            SPOTIFY_CLIENT_ID,

          grant_type:
            "authorization_code",

          code:
            code,

          redirect_uri:
            REDIRECT_URI,

          code_verifier:
            codeVerifier

        })
      }
    );

    const data =
      await response.json();

    if (!response.ok) {

      console.error(
        "Spotify token error:",
        data
      );

      const status =
        document.getElementById(
          "loginStatus"
        );

      if (status) {
        status.innerText =
          "Spotify login failed. Please try again.";
      }

      return;
    }

    // Save token
    localStorage.setItem(
      "spotify_access_token",
      data.access_token
    );

    // Save refresh token if provided
    if (data.refresh_token) {

      localStorage.setItem(
        "spotify_refresh_token",
        data.refresh_token
      );
    }

    // Save expiry time
    if (data.expires_in) {

      const expiresAt =
        Date.now() +
        data.expires_in * 1000;

      localStorage.setItem(
        "spotify_expires_at",
        expiresAt.toString()
      );
    }

    // Clean temporary PKCE data
    localStorage.removeItem(
      "spotify_code_verifier"
    );

    localStorage.removeItem(
      "spotify_auth_state"
    );

    // Remove ?code=... from URL
    window.history.replaceState(
      {},
      document.title,
      REDIRECT_URI
    );

    const status =
      document.getElementById(
        "loginStatus"
      );

    if (status) {

      status.innerText =
        "✅ Spotify connected successfully!";
    }

    console.log(
      "Spotify login successful."
    );

  } catch (error) {

    console.error(
      "Spotify connection error:",
      error
    );
  }
}


// Run callback check
handleSpotifyCallback();
// =================================
// PART-4 : SPOTIFY MUSIC SEARCH
// =================================

async function searchSpotify(query) {

  const token =
    localStorage.getItem("spotify_access_token");

  if (!token) {
    showSearchMessage(
      "पहले Connect Spotify पर क्लिक करके login करो।"
    );
    return;
  }

  if (!query || query.trim() === "") {
    showSearchMessage(
      "Song या artist का नाम लिखो।"
    );
    return;
  }

  showSearchMessage("🔎 Searching Spotify...");

  try {

    const url =
      "https://api.spotify.com/v1/search?" +
      new URLSearchParams({
        q: query.trim(),
        type: "track,artist,album,playlist",
        limit: "20"
      });

    const response =
      await fetch(url, {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      });

    const data =
      await response.json();

    if (!response.ok) {

      console.error(
        "Spotify search error:",
        data
      );

      showSearchMessage(
        "Spotify search में problem हुई।"
      );

      return;
    }

    displaySpotifyResults(data);

  } catch (error) {

    console.error(
      "Search error:",
      error
    );

    showSearchMessage(
      "Internet या Spotify connection check करो।"
    );
  }
}


// Connect existing search box
function searchMusic() {

  const input =
    document.getElementById(
      "searchInput"
    );

  if (!input) return;

  searchSpotify(input.value);
}


// Display Spotify results
function displaySpotifyResults(data) {

  const results =
    document.getElementById(
      "searchResults"
    );

  if (!results) return;

  results.innerHTML = "";

  const tracks =
    data.tracks?.items || [];

  const artists =
    data.artists?.items || [];

  const albums =
    data.albums?.items || [];

  const playlists =
    data.playlists?.items || [];


  // Tracks
  tracks.forEach(track => {

    const image =
      track.album?.images?.[0]?.url || "";

    const card =
      document.createElement("div");

    card.className =
      "result-card";

    card.innerHTML = `

      ${
        image
          ? `<img
               src="${image}"
               alt="Album cover"
               style="
                 width:100%;
                 border-radius:12px;
                 margin-bottom:12px;
               "
             >`
          : ""
      }

      <h3>🎵 ${escapeHTML(track.name)}</h3>

      <p>
        ${escapeHTML(
          track.artists
            .map(a => a.name)
            .join(", ")
        )}
      </p>

      <button
        onclick="openSpotify('${track.external_urls.spotify}')"
      >
        ▶ Open in Spotify
      </button>

    `;

    results.appendChild(card);
  });


  // Artists
  artists.forEach(artist => {

    const card =
      document.createElement("div");

    card.className =
      "result-card";

    card.innerHTML = `

      <h3>🎤 ${escapeHTML(artist.name)}</h3>

      <p>Artist</p>

      <button
        onclick="openSpotify('${artist.external_urls.spotify}')"
      >
        Open Artist
      </button>

    `;

    results.appendChild(card);
  });


  // Albums
  albums.forEach(album => {

    const card =
      document.createElement("div");

    card.className =
      "result-card";

    card.innerHTML = `

      <h3>💿 ${escapeHTML(album.name)}</h3>

      <p>
        ${escapeHTML(
          album.artists
            .map(a => a.name)
            .join(", ")
        )}
      </p>

      <button
        onclick="openSpotify('${album.external_urls.spotify}')"
      >
        Open Album
      </button>

    `;

    results.appendChild(card);
  });


  // Playlists
  playlists.forEach(playlist => {

    if (!playlist) return;

    const card =
      document.createElement("div");

    card.className =
      "result-card";

    card.innerHTML = `

      <h3>📋 ${escapeHTML(playlist.name)}</h3>

      <p>
        ${escapeHTML(
          playlist.owner?.display_name ||
          "Spotify Playlist"
        )}
      </p>

      <button
        onclick="openSpotify('${playlist.external_urls.spotify}')"
      >
        Open Playlist
      </button>

    `;

    results.appendChild(card);
  });


  if (
    tracks.length === 0 &&
    artists.length === 0 &&
    albums.length === 0 &&
    playlists.length === 0
  ) {

    showSearchMessage(
      "कोई result नहीं मिला।"
    );
  }
}


// Open Spotify page
function openSpotify(url) {

  if (!url) return;

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );
}


// Search message
function showSearchMessage(text) {

  const results =
    document.getElementById(
      "searchResults"
    );

  if (!results) return;

  results.innerHTML = `
    <div class="music-box">
      <p>${escapeHTML(text)}</p>
    </div>
  `;
}
// =================================
// PART-5 : FINAL SPOTIFY FUNCTIONS
// =================================

// Get saved Spotify access token
function getSpotifyToken() {
  return localStorage.getItem(
    "spotify_access_token"
  );
}


// Check whether token exists
function isSpotifyConnected() {

  const token = getSpotifyToken();

  const expiresAt =
    Number(
      localStorage.getItem(
        "spotify_expires_at"
      )
    );

  if (!token) {
    return false;
  }

  if (expiresAt && Date.now() >= expiresAt) {
    return false;
  }

  return true;
}


// Update login button
function updateSpotifyStatus() {

  const button =
    document.getElementById(
      "spotifyLoginBtn"
    );

  const status =
    document.getElementById(
      "loginStatus"
    );

  if (!button) return;

  if (isSpotifyConnected()) {

    button.innerText =
      "✓ Spotify Connected";

    button.style.background =
      "#16883d";

    if (status) {
      status.innerText =
        "Your Spotify account is connected.";
    }

  } else {

    button.innerText =
      "🎵 Connect Spotify";

    button.style.background =
      "#1db954";

    if (status) {
      status.innerText =
        "Connect your Spotify account.";
    }
  }
}


// Logout
function logoutSpotify() {

  localStorage.removeItem(
    "spotify_access_token"
  );

  localStorage.removeItem(
    "spotify_refresh_token"
  );

  localStorage.removeItem(
    "spotify_expires_at"
  );

  localStorage.removeItem(
    "spotify_code_verifier"
  );

  localStorage.removeItem(
    "spotify_auth_state"
  );

  updateSpotifyStatus();

  alert(
    "Spotify disconnected."
  );
}


// Create logout button
function createLogoutButton() {

  if (!isSpotifyConnected()) {
    return;
  }

  if (
    document.getElementById(
      "spotifyLogoutBtn"
    )
  ) {
    return;
  }

  const button =
    document.createElement("button");

  button.id =
    "spotifyLogoutBtn";

  button.innerText =
    "Logout Spotify";

  button.style.marginLeft =
    "10px";

  button.style.padding =
    "10px 18px";

  button.style.border =
    "none";

  button.style.borderRadius =
    "25px";

  button.style.cursor =
    "pointer";

  button.style.background =
    "#333";

  button.style.color =
    "#fff";

  button.onclick =
    logoutSpotify;

  const loginButton =
    document.getElementById(
      "spotifyLoginBtn"
    );

  if (loginButton) {

    loginButton.parentNode.appendChild(
      button
    );
  }
}


// Check Spotify when page loads
document.addEventListener(
  "DOMContentLoaded",
  function () {

    updateSpotifyStatus();

    createLogoutButton();

  }
);


// Improve login button
const spotifyButton =
  document.getElementById(
    "spotifyLoginBtn"
  );

if (spotifyButton) {

  spotifyButton.onclick =
    loginWithSpotify;
}


// Search on Enter
const musicSearchInput =
  document.getElementById(
    "searchInput"
  );

if (musicSearchInput) {

  musicSearchInput.addEventListener(
    "keydown",
    function (event) {

      if (event.key === "Enter") {
        searchMusic();
      }

    }
  );
}


// Final console message
console.log(
  "🎵 My Music website loaded successfully."
);
