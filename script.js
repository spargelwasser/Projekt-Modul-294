let API_URL = "https://graphql.anilist.co";

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

let allGenres = new Set();

function reload() {
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
    })
    .then(response => response.json())
    .then(data => {
        let animeList = data.data.Page.media;

        allGenres.clear();
        animeList.forEach(anime => {
            anime.genres.forEach(genre => allGenres.add(genre));
        });

        generateGenreCheckboxes();
        displayAnimeList(animeList);
    })
    .catch(error => {
        console.error("Error fetching anime data:", error);
    });
}

function generateGenreCheckboxes() {
    let genreContainer = document.querySelector("#genreFilter");

    allGenres.forEach(genre => {
        let label = document.createElement("label");
        label.classList = "checkbox-label";

        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = genre;
        checkbox.addEventListener("change", filterAnime);

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(" " + genre));

        genreContainer.appendChild(label);
    });
}

function filterAnime() {
    let selectedGenres = Array.from(document.querySelectorAll("#genreFilter input:checked"))
                             .map(checkbox => checkbox.value);

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
    })
    .then(response => response.json())
    .then(data => {
        let animeList = data.data.Page.media;

        // Filter by selected genres
        if (selectedGenres.length > 0) {
            animeList = animeList.filter(anime =>
                anime.genres.some(genre => selectedGenres.includes(genre))
            );
        }

        displayAnimeList(animeList);
    })
    .catch(error => {
        console.error("Error fetching anime data:", error);
    });
}

function displayAnimeList(animes) {
    let container = document.querySelector("#animeList");
    container.innerHTML = ""; // clear

    animes.slice(0,10).forEach(anime => {
        let card = document.createElement("div");
        card.classList = "card"

        let img = document.createElement("img");
        img.src = anime.coverImage.extraLarge;
        img.classList = "card-img-top";
        img.alt = anime.title.romaji;

        let cardBody = document.createElement("div");
        cardBody.classList = "card-body";

        let animeTitle = document.createElement("h5");
        animeTitle.classList = "card-title";
        animeTitle.innerHTML = anime.title.romaji;

        let animeGenre = document.createElement("p")
        animeGenre.classList = "card-text";
        animeGenre.innerHTML = "Genres: " + anime.genres.join(", ");

        let animeText = document.createElement("p");
        animeText.classList = "card-text";
        animeText.innerHTML = anime.description;

        cardBody.append(animeTitle);
        cardBody.append(animeGenre);
        cardBody.append(animeText);
        card.append(img);
        card.append(cardBody);
        container.append(card);
    });
}             