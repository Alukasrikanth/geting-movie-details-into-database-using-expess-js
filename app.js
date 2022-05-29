const express = require("express");

const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dataBasePath = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());

let dataBase = null;
const initializerDbAndServer = async () => {
  try {
    dataBase = await open({
      filename: dataBasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server Running at http://localhost:30000/`);
    });
  } catch (error) {
    console.log(`DB Error:${error.message}`);
    process.exit(1);
  }
};

initializerDbAndServer();

const getMoviesConvertDBToObject = (object) => {
  return {
    movieId: object.movie_id,
    movieName: object.movie_name,
    leadActor: object.lead_actor,
    directorId: object.director_id,
  };
};

const getDirectorConvertDBToObject = (object) => {
  return {
    directorName: object.director_name,
    directorId: object.director_id,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT movie_name FROM movie;`;

  const moviesArray = await dataBase.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({
      movieName: eachMovie.movie_name,
    }))
  );
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT * FROM movie WHERE movie_id =${movieId};`;
  const getMovie = await dataBase.get(getMovieQuery);
  response.send(getMoviesConvertDBToObject(getMovie));
});

//API CREATE MOVIE

app.post("/movies/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const createMovieQuery = `
    INSERT INTO movie (director_id,movie_name,lead_actor)
    VALUES 
    (${directorId},"${movieName}","${leadActor}");`;
  await dataBase.run(createMovieQuery);
  response.send("Movie Successfully Added");
});

//API UPDATE MOVIE DETAILS

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const updatedMovieDetails = request.body;
  const { directorId, movieName, leadActor } = updatedMovieDetails;

  const updateMovieQuery = `
    UPDATE movie SET 
    director_id=${directorId},
    movie_name="${movieName}",
    lead_actor="${leadActor}"
    WHERE 
    movie_id = ${movieId};`;

  await dataBase.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API DELETE MOVIE FROM DATABASE

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie WHERE 
    movie_id =${movieId};`;
  await dataBase.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API 6 GET  DIRECTED MOVIES
app.get("/directors/", async (request, response) => {
  const directorQuery = `
     SELECT *
     FROM director;`;

  const directorArray = await dataBase.all(directorQuery);
  response.send(
    directorArray.map((eachDirector) =>
      getDirectorConvertDBToObject(eachDirector)
    )
  );
});

//API 7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorDirectedMoviesQuery = `
      SELECT movie_name
      FROM movie 
      WHERE director_id =${directorId};`;

  const movieDirectorArray = await dataBase.all(getDirectorDirectedMoviesQuery);
  response.send(
    movieDirectorArray.map((eachMovie) => ({
      movieName: eachMovie.movie_name,
    }))
  );
});

module.exports = app;
