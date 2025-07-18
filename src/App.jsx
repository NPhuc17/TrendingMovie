import { useState, useEffect } from 'react'
import { useDebounce } from 'use-debounce'
import Search from './components/Search'
import Spinner from './components/Spinner'
import MovieCard from './components/MovieCard'
import { updateSearchCount,getTrendingMovies } from './appwrite'


const API_BASE_URL = "https://api.themoviedb.org/3"
const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const API_OPTION = {
  method: 'GET',
  headers: {
    'accept': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  }
}
function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [movieList, setmovieList] = useState([])
  const [isLoading, setisLoading] = useState(false)
  const [useDebounceSearchTerm] = useDebounce(searchTerm, 500)
  const [trendingMovies, setTrendingMovies] = useState([])

  const fetchMovie = async (query = '') => {
    setisLoading(true)
    setErrorMessage('')
    try {
      const endpoint = query ?
        `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` :
        `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`
      const response = await fetch(endpoint, API_OPTION)

      // alert(response)
      if (!response.ok) {
        throw new Error('Failed to fetch movies.');
      }
      const data = await response.json()
      console.log(data)

      if (data.success === false) {
        setErrorMessage('Failed to fetch movies.' || data.error);
        setmovieList([])
        return;
      }
      setmovieList(data.results || [])

      if(query && data.results.length > 0){
        await updateSearchCount(query,data.results[0])
      }

    }
    catch (error) {
      console.error('Fetch movie error:', error);
      setErrorMessage('Failed to fetch movies. Please check your API key and try again.');
    }
    finally {
      setisLoading(false)
    }
  }

  const fetchTrendingMovies = async () => {
    try {
      const result = await getTrendingMovies()
      setTrendingMovies(result)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchMovie(useDebounceSearchTerm)
  }, [useDebounceSearchTerm])

  useEffect(() => {
    fetchTrendingMovies()
  }, [])

  return (
    <main>
      <div className="pattern">
        <div className="wrapper">
          <header>

            <img src="./hero.png" alt="hero-banner"></img>
            <h1>Find Trending <span className='text-gradient'>Movie</span></h1>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </header>

          {trendingMovies.length>0 && (
            <section className='trending'>
              <h2>Trending Movies</h2>
              <ul>
                {trendingMovies.map((movie,index) => (
                  <li key={movie.$id}>
                    <p>{index + 1}</p>
                    <img src={movie.poster_url} alt="" />
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className='all-movies'>
            <h2>All Movies</h2>

            {/* {errorMessage && <p className=' text-red-500'>{errorMessage}</p>} */}

            {isLoading ? (
              <Spinner />
            ) : errorMessage ? (
              <p className=' text-red-500'>{errorMessage}</p>
            ) : (
              <ul>
                {movieList.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </ul>
            )
            }
          </section>
        </div>
      </div>
    </main>
  )
}

export default App
