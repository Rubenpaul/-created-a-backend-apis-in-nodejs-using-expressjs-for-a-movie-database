const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initializeDBandServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

//ADD GET Movies API
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
        SELECT 
            movie_name as movieName
        FROM 
            movie
        ORDER BY 
            movie_id
    `;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(moviesArray);
});

//ADD POST movie API
app.post("/movies/", async (request, response) => {
  const movieData = request.body;

  const addMovieQuery = `
      INSERT INTO
          movie (director_id, movie_name, lead_actor)
      Values (
          "${movieData.directorId}",
          "${movieData.movieName}",
          "${movieData.leadActor}"
      )
    `;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//ADD GET Movie API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
        SELECT * FROM movie WHERE movie_id = ${movieId}
    `;
  let movie = await db.get(getMovieQuery);
  movie = convertDbObjectToResponseObject(movie);
  response.send(movie);
});

//ADD PUT movie API
app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieData = request.body;

  const updateMovieQuery = `
         UPDATE
              movie
          SET
              director_id = "${movieData.directorId}",
              movie_name = "${movieData.movieName}",
              lead_actor = "${movieData.leadActor}"
          WHERE
              movie_id = ${movieId}
      `;
  const updatedMovieObj = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//ADD DELETE movie API
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieDeleteQuery = `
        DELETE FROM
            movie 
        WHERE 
            movie_id = ${movieId}
    `;
  await db.run(movieDeleteQuery);
  response.send("Movie Removed");
});

//ADD GET directors API
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
        SELECT 
            *
        FROM 
            director
    `;
  const convertDBObjToResponse = (director) => {
    return {
      directorId: director.director_id,
      directorName: director.director_name,
    };
  };
  let directorArray = [];
  const directorObjArray = await db.all(getDirectorsQuery);
  for (let director of directorObjArray) {
    directorArray.push(convertDBObjToResponse(director));
  }
  response.send(directorArray);
});

//ADD GET Movies Of Director API

app.get("/directors/:directorId/movies", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorByMoviesQuery = `
        SELECT 
            movie_name as movieName
        FROM 
            movie 
        WHERE 
            director_id = ${directorId}
    `;
  const movies = await db.all(getDirectorByMoviesQuery);
  response.send(movies);
});

module.exports = app;
