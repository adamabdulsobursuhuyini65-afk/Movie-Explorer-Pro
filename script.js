/*ELEMENTS*/
const movieGrid = document.getElementById("movieGrid");
const trendingGrid = document.getElementById("trendingGrid");
const topRatedGrid = document.getElementById("topRatedGrid");
const searchSuggestions =document.getElementById("searchSuggestions");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const statusMessage = document.getElementById("statusMessage");
const resultCount = document.getElementById("resultCount");
const themeToggle = document.getElementById("themeToggle");
const featuredBanner = document.getElementById("featuredSection");
const featuredTitle = document.getElementById("featuredTitle");
const featuredOverview = document.getElementById("featuredOverview");
const featuredDetailsBtn = document.getElementById("featuredDetailsBtn");
const featuredWatchlistBtn = document.getElementById("featuredWatchlistBtn");
const watchlistGrid = document.getElementById("watchlistGrid");
const watchlistEmpty = document.getElementById("watchlistEmpty");
const movieModal = document.getElementById("movieModal");
const closeModal = document.getElementById("closeModal");
const modalPoster = document.getElementById("modalPoster");
const modalTitle = document.getElementById("modalTitle");
const modalOverview = document.getElementById("modalOverview");
const modalMeta = document.getElementById("modalMeta");
const castList = document.getElementById("castList");
const trailerContainer = document.getElementById("trailerContainer");
const chips = document.querySelectorAll(".chip");
const liveSearchResults = document.getElementById("liveSearchResults");

/*TMDB CONFIG*/
const TMDB_API_KEY ="071a639027ebd9c6724c3eeda14366db";
const TMDB_BASE_URL ="https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE ="https://image.tmdb.org/t/p/w500";
const TMDB_PROFILE_BASE ="https://image.tmdb.org/t/p/w185";

/*GLOBALS*/
let watchlist = [];
let featuredMovieId = null;
let featuredMovies = [];
let featuredIndex = 0;
let trendingDirection = 1;
let searchTimeout;

/*LOCAL STORAGE*/
function saveWatchlist() {
  localStorage.setItem(
    "movieWatchlist",
    JSON.stringify(watchlist)
  );
}

function loadWatchlist() {

  const saved =
  localStorage.getItem(
    "movieWatchlist"
  );

  if (saved) {
    watchlist = JSON.parse(saved);
  }

}

function saveTheme(theme) {

  localStorage.setItem(
    "movieTheme",
    theme
  );

}

function loadTheme() {

  const savedTheme =
  localStorage.getItem(
    "movieTheme"
  );

  if (savedTheme === "light") {

    document.body.setAttribute(
      "data-theme",
      "light"
    );

    themeToggle.innerHTML =
    '<i class="fa-regular fa-sun"></i>';

  }

}

/*THEME TOGGLE*/
themeToggle.addEventListener(
  "click",
  () => {

    const isLight =
    document.body.getAttribute(
      "data-theme"
    ) === "light";

    if (isLight) {

      document.body.removeAttribute(
        "data-theme"
      );

      themeToggle.innerHTML =
      '<i class="fa-regular fa-moon"></i>';

      saveTheme("dark");

    } else {

      document.body.setAttribute(
        "data-theme",
        "light"
      );

      themeToggle.innerHTML =
      '<i class="fa-regular fa-sun"></i>';

      saveTheme("light");

    }

  }
);

/*FEATURED MOVIE*/
function setFeaturedMovie(movie) {

  featuredMovieId = movie.id;

  featuredBanner.style.backgroundImage =
  `url(
    https://image.tmdb.org/t/p/original${movie.backdrop_path}
  )`;

  featuredTitle.textContent =
  movie.title;

  featuredOverview.textContent =
  movie.overview;

}

/*LOAD TRENDING*/
async function loadTrendingMovies() {

  try {

    const response = await fetch(
      `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`
    );

    const data = await response.json();

    if (data.results) {

      renderMovieCards(
        data.results.slice(0, 15),
        trendingGrid
      );

      featuredMovies =
      data.results.slice(0, 5);

      if (featuredMovies.length > 0) {

        setFeaturedMovie(
          featuredMovies[0]
        );

      }

    }

  } catch (error) {

    console.error(
      "Trending Error",
      error
    );

  }

}
/*LOAD TOP RATED */
async function loadTopRatedMovies() {

  try {

    const response =
    await fetch(
      `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}`
    );

    const data =
    await response.json();

    if (data.results) {

      renderMovieCards(
        data.results.slice(0, 12),
        topRatedGrid
      );

    }

  } catch (error) {

    console.error(
      "Top Rated Error",
      error
    );

  }

}

/*FEATURED BUTTONS */
featuredDetailsBtn.addEventListener(
  "click",
  () => {

    if (featuredMovieId) {

      showMovieDetails(
        featuredMovieId
      );

    }

  }
);

featuredWatchlistBtn.addEventListener(
  "click",
  async () => {

    if (!featuredMovieId)
      return;

    try {

      const response =
      await fetch(
        `${TMDB_BASE_URL}/movie/${featuredMovieId}?api_key=${TMDB_API_KEY}`
      );

      const movie =
      await response.json();

      const poster =
      movie.poster_path
      ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
      : "";

      addToWatchlist(
        movie.id,
        movie.title,
        poster
      );

    } catch (error) {

      console.error(error);

    }

  }
);

/*  SEARCH*/
searchBtn.addEventListener(
  "click",
  () => {

    searchMovies();

  }
);

searchInput.addEventListener(
  "input",
  () => {

    clearTimeout(searchTimeout);

    const query =
    searchInput.value.trim();

    if (query.length < 2) {

      liveSearchResults.innerHTML = "";
      
      liveSearchResults.style.display = "none";

      movieGrid.style.display = "grid";

      searchSuggestions.style.display =
      "none";

      return;
    }

    movieGrid.style.display = "none";

    searchTimeout =
    setTimeout(
      () => {

        fetchSuggestions(query);

      },
      400
    );

  }
);

async function fetchSuggestions(
query
){

try{

const response =
await fetch(
`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
);

const data =
await response.json();

if(
!data.results
||
data.results.length===0
){

liveSearchResults.innerHTML=
`
<p>No results found.</p>
`;

return;
}

liveSearchResults.innerHTML=

data.results
.slice(0,10)
.map(movie=>{

const poster=
movie.poster_path
?
`${TMDB_IMAGE_BASE}${movie.poster_path}`
:
'https://via.placeholder.com/80x120';

return`

<div
class="search-movie">

<img
src="${poster}"
alt="${movie.title}">

<div
class="search-movie-info">

<div
class="search-movie-title">

${movie.title}

</div>

<div
class="search-movie-meta">

${movie.release_date
?
movie.release_date.substring(0,4)
:
"Unknown Year"}

</div>

<div
class="search-movie-rating">

⭐ ${movie.vote_average.toFixed(1)}

</div>

</div>

<button
class="search-action"
onclick="showMovieDetails(${movie.id})">

<i class="fa-solid fa-play"></i>

</button>

</div>

`;

})
.join("");

}
catch(error){

console.error(error);

}
}
/* STARTUP*/
loadTheme();
loadWatchlist();
updateWatchlist();

loadTrendingMovies();
loadTopRatedMovies();

/*SEARCH MOVIES*/
async function searchMovies(customQuery = null) {

  const query =
  customQuery || searchInput.value.trim();

  if (!query) {

    statusMessage.textContent =
    "Please enter a movie title.";

    return;
  }

  statusMessage.textContent =
  "Searching movies...";

  movieGrid.innerHTML = "";

  try {

    const response =
    await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
    );

    const data =
    await response.json();

    if (
      data.results &&
      data.results.length > 0
    ) {

      renderMovieCards(
        data.results,
        movieGrid
      );

      resultCount.textContent =
      `${data.results.length} movies found`;

      statusMessage.textContent =
      `Showing results for "${query}"`;

    } else {

      resultCount.textContent = "";

      movieGrid.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-film"></i>
        <p>No movies found.</p>
      </div>
      `;

      statusMessage.textContent =
      "No results found.";

    }

  } catch (error) {

    console.error(error);

    statusMessage.textContent =
    "Network error occurred.";

  }

}

/*RENDER MOVIES*/
function renderMovieCards(
  movies,
  container
) {

  container.innerHTML =
  movies.map(movie => {

    const poster =
    movie.poster_path
    ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
    : "https://via.placeholder.com/300x450?text=No+Image";

    return `

    <div class="movie-card">

      <div class="movie-poster">

        <img
          src="${poster}"
          alt="${movie.title}"
        >

      </div>

      <div class="card-content">

        <h3>
          ${movie.title}
        </h3>

        <p>
          ⭐ ${movie.vote_average.toFixed(1)}
        </p>

        <div class="card-actions">

          <button
            class="add-btn add-watchlist-btn"
            data-id="${movie.id}"
            data-title="${movie.title}"
            data-poster="${poster}">
            + Watchlist
          </button>

          <button
            class="details-btn details-btn-movie"
            data-id="${movie.id}">
            View Details
          </button>

        </div>

      </div>

    </div>

    `;

  }).join("");

}

/*WATCHLIST*/
function addToWatchlist(
  id,
  title,
  poster
) {

  const exists =
  watchlist.some(
    movie =>
    movie.id == id
  );

  if (exists) {

    statusMessage.textContent =
    `"${title}" already exists in watchlist.`;

    return;
  }

  watchlist.push({
    id,
    title,
    poster
  });

  saveWatchlist();

  updateWatchlist();

  statusMessage.textContent =
  `"${title}" added to watchlist.`;

}

function removeFromWatchlist(id) {

  watchlist =
  watchlist.filter(
    movie =>
    movie.id != id
  );

  saveWatchlist();

  updateWatchlist();

}

function updateWatchlist() {

  watchlistEmpty.style.display =
  watchlist.length === 0
  ? "block"
  : "none";

  watchlistGrid.innerHTML =
  watchlist.map(movie => `

  <div class="movie-card">

    <div class="movie-poster">

      <img
        src="${movie.poster}"
        alt="${movie.title}"
      >

    </div>

    <div class="card-content">

      <h3>
        ${movie.title}
      </h3>

      <p>
        Saved Movie
      </p>

      <button
        class="remove-btn remove-watchlist-btn"
        data-id="${movie.id}">
        Remove
      </button>

    </div>

  </div>

  `).join("");

}

/*MOVIE DETAILS*/
async function showMovieDetails(
  movieId
) {

  movieModal.classList.remove(
    "hidden"
  );

  castList.innerHTML =
  "<p>Loading cast...</p>";

  trailerContainer.innerHTML =
  "<p>Loading trailer...</p>";

  try {

    const response =
    await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`
    );

    const movie =
    await response.json();

    modalPoster.src =
    movie.poster_path
    ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
    : "";

    modalTitle.textContent =
    movie.title;

    modalOverview.textContent =
    movie.overview;

    modalMeta.textContent =
    `${movie.release_date || "Unknown"} • ${movie.runtime || "?"} mins • ⭐ ${movie.vote_average}`;

    renderCast(
      movie.credits?.cast || []
    );

    renderTrailer(
      movie.videos?.results || []
    );

  } catch (error) {

    console.error(error);

  }

}

/*CAST*/
function renderCast(cast) {

  if (!cast.length) {

    castList.innerHTML =
    "<p>No cast available.</p>";

    return;
  }

  castList.innerHTML =
  cast
  .slice(0, 12)
  .map(actor => {

    const profile =
    actor.profile_path
    ? `${TMDB_PROFILE_BASE}${actor.profile_path}`
    : "https://via.placeholder.com/185x278?text=No+Image";

    return `

    <div class="cast-card">

      <img
        src="${profile}"
        alt="${actor.name}"
      >

      <div class="cast-info">

        <h4>
          ${actor.name}
        </h4>

        <p>
          ${actor.character || ""}
        </p>

      </div>

    </div>

    `;

  }).join("");

}

/*TRAILER*/
function renderTrailer(
  videos
) {

  const trailer =
  videos.find(video =>
    video.site === "YouTube" &&
    (
      video.type === "Trailer" ||
      video.type === "Teaser"
    )
  );

  if (!trailer) {

    trailerContainer.innerHTML =
    "<p>No trailer available.</p>";

    return;
  }

  trailerContainer.innerHTML = `

  <iframe
    src="https://www.youtube.com/embed/${trailer.key}"
    allowfullscreen>
  </iframe>

  `;

}

/*EVENT DELEGATION*/

document.addEventListener(
  "click",
  e => {

    const addBtn =
    e.target.closest(
      ".add-watchlist-btn"
    );

    const removeBtn =
    e.target.closest(
      ".remove-watchlist-btn"
    );

    const detailsBtn =
    e.target.closest(
      ".details-btn-movie"
    );

    if (addBtn) {

      addToWatchlist(
        addBtn.dataset.id,
        addBtn.dataset.title,
        addBtn.dataset.poster
      );

    }

    if (removeBtn) {

      removeFromWatchlist(
        removeBtn.dataset.id
      );

    }

    if (detailsBtn) {

      showMovieDetails(
        detailsBtn.dataset.id
      );

    }

  }
);

/*CLOSE MODAL*/
closeModal.addEventListener(
  "click",
  () => {

    movieModal.classList.add(
      "hidden"
    );

    trailerContainer.innerHTML =
    "";

  }
);

movieModal.addEventListener(
  "click",
  e => {

    if (
      e.target === movieModal
    ) {

      movieModal.classList.add(
        "hidden"
      );

      trailerContainer.innerHTML =
      "";

    }

  }
);

/*AUTO FEATURED SLIDER*/
setInterval(() => {

  if (
    featuredMovies.length === 0
  ) return;

  featuredIndex++;

  if (
    featuredIndex >=
    featuredMovies.length
  ) {

    featuredIndex = 0;

  }

  setFeaturedMovie(
    featuredMovies[
      featuredIndex
    ]
  );

}, 5000);

/*AUTO TRENDING SCROLL*/
setInterval(() => {

  if (
    trendingGrid.scrollLeft >=
    trendingGrid.scrollWidth -
    trendingGrid.clientWidth
  ) {

    trendingDirection = -1;

  }

  if (
    trendingGrid.scrollLeft <= 0
  ) {

    trendingDirection = 1;

  }

  trendingGrid.scrollBy({

    left:
    300 *
    trendingDirection,

    behavior:
    "smooth"

  });

}, 3000);
