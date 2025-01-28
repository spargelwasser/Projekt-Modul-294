let API_URL = "https://graphql.anilist.co";
let allGenres = new Set();
let animeData = [];
let favorites = [];
let isFavoritesView = false;
let query = `
            query {
                Page(page: 1, perPage: 20) {
                    media(type: ANIME) {
                        id
                        title {
                            romaji
                        }
                        coverImage {
                            extraLarge
                        }
                        description
                        genres
                    }
                }
            }
        `;

reload();

// fetch from public api
function fetchAnime() {
    return fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
    })
    .then(response => response.json())
    .then(data => {
        animeData = data.data.Page.media || [];
        allGenres.clear();

        animeData.forEach(anime => {
            anime.genres.forEach(genre => allGenres.add(genre));
        });

        return animeData;
    });
}

// function to reload the animelist
function reload() {
    isFavoritesView = false;

    // clear container
    let container = document.querySelector("#container");
    container.innerHTML = "";

    // fetch and display
    fetchAnime().then(animeList => {
        generateGenreCheckboxes();
        displayAnimeList(animeList);
    });
}

// function to generate checkboxes dynamicly
function generateGenreCheckboxes() {
    let container = document.querySelector("#container");

    let genreTitle = document.createElement("h3"); // title
    genreTitle.innerHTML = "Filter by Genre";

    let genreContainer = document.createElement("div"); // container for checkboxes
    genreContainer.classList = "genreFilter";
    genreContainer.id = "genreFilter";

    // generate checkboxes
    allGenres.forEach(genre => {
        let label = document.createElement("label");
        label.classList = "checkbox-label";

        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = genre;
        checkbox.addEventListener("change", filterAnime); // when checked

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(" " + genre));

        genreContainer.appendChild(label);
    });

    // append
    container.append(genreTitle);
    container.append(genreContainer);
}

// function to display animes
function displayAnimeList(animes) {
    let container = document.querySelector("#container");

    let animeList = document.createElement("div"); // container for anime cards
    animeList.classList = "animeList";
    animeList.id = "animeList";

    animes.forEach(anime => {
        let card = createCard(anime);
        animeList.append(card);
    });

    // append list
    container.append(animeList);
}

function createCard(anime){
    let card = document.createElement("div"); // card
    card.classList = "card";

    let img = document.createElement("img"); // image
    img.src = anime.coverImage.extraLarge;
    img.classList = "card-img-top";
    img.alt = anime.title.romaji;

    let cardBody = document.createElement("div");
    cardBody.classList = "card-body";

    let animeTitle = document.createElement("h5"); // title
    animeTitle.classList = "card-title";
    animeTitle.innerHTML = anime.title.romaji;

    let animeGenre = document.createElement("p") // genres
    animeGenre.classList = "card-text";
    animeGenre.innerHTML = "Genres: " + anime.genres.join(", ");

    let button = document.createElement("button"); // favorite add
    button.classList = "btn btn-info";
    button.value = anime.id;

    if (favorites.includes(String(anime.id))) {
        button.innerHTML = "Remove from Favorites";
        button.setAttribute("onclick", "removeFavorite(value)");
    } else {
        button.innerHTML = "Add to Favorites";
        button.setAttribute("onclick", "addFavorite(value)");
    }

    let animeText = document.createElement("p"); // description
    animeText.classList = "card-text";
    animeText.innerHTML = anime.description;

    // create card
    cardBody.append(animeTitle);
    cardBody.append(animeGenre);
    cardBody.append(button);
    cardBody.append(animeText);
    card.append(img);
    card.append(cardBody);

    return card;
}

// filter
function filterAnime() {
    let selectedGenres = Array.from(document.querySelectorAll("#genreFilter input:checked"))
    .map(checkbox => checkbox.value);

    // clear anime container
    let animeList = document.querySelector("#animeList");
    if (animeList) {
        animeList.remove();
    }

    let filteredAnime = [];

    // Filter selected genres and display
    if (isFavoritesView) {

        favorites.forEach(id =>
            filteredAnime = [...filteredAnime,animeData.find(anime => anime.id == id)]
        );
        if (selectedGenres.length > 0) {
            filteredAnime = filteredAnime.filter(anime =>
                anime.genres.some(genre => selectedGenres.includes(genre))
            );
        }
    } else {

        filteredAnime = animeData || [];

        if (selectedGenres.length > 0) {
            filteredAnime = filteredAnime.filter(anime =>
                anime.genres.some(genre => selectedGenres.includes(genre))
            );
        }
    }

    displayAnimeList(filteredAnime);
}

// random anime
function randomAnime(){
    isFavoritesView = false;

    // find random anime
    let randomNumber = Math.floor(Math.random() * animeData.length);
    let randomAnime = animeData[randomNumber];

    // clear folder
    let container = document.querySelector("#container");

    let animeListold = document.querySelector("#animeList");
    if (animeListold) {
        animeListold.remove();
    }

    let animeList = document.createElement("div");
    animeList.classList = "animeList";
    animeList.id = "animeList";

    // create card and append
    let card = createCard(randomAnime);
    animeList.append(card);
    container.append(animeList);
}

function loadFavorites() {
    isFavoritesView = true;

    // clear folder
    let container = document.querySelector("#container");

    let animeListold = document.querySelector("#animeList");
    if (animeListold) {
        animeListold.remove();
    }

    let animeList = document.createElement("div");
    animeList.classList = "animeList";
    animeList.id = "animeList";

    // load list
    favorites.forEach(id => {

        //find by id
        let anime = animeData.find(anime => anime.id == id);

        // create card
        let card = createCard(anime);
        animeList.append(card);
    });

    // append
    container.append(animeList);
}

// add favorites
function addFavorite(id) {

    if (favorites.includes(id)) {
        alert("already in favorites")
    } else {
        favorites = [...favorites, id]
        alert("added to Favorites");
    }

    if (isFavoritesView) {
        loadFavorites();
    } else {
        reload();
    }
}

// remove favorites
function removeFavorite(id) {

    favorites = favorites.filter(favoriteId => favoriteId !== id);
    alert("removed from Favorites");

    if (isFavoritesView) {
        loadFavorites();
    } else {
        reload();
    }
}